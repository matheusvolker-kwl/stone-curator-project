// checkout-ticket-redeem — server-to-server endpoint called by the Woo
// mu-plugin to exchange an opaque ticket for the billing payload. Protected
// by a shared bearer secret (WESTERN_CHECKOUT_EXCHANGE_KEY) — NEVER exposed
// to the browser. Atomic one-shot consume (public.consume_checkout_ticket).
// Basic per-IP rate limit to blunt brute-force attempts against the ticket
// namespace (32-byte tickets already make guessing infeasible, but bounded
// requests keep noisy callers cheap).
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

// In-memory rate limit: 60 requests / IP / minute. Resets on cold start,
// which is acceptable for a defensive limit around a secret-bearer endpoint.
const RATE_LIMIT_MAX = 60;
const RATE_LIMIT_WINDOW_MS = 60_000;
const rateBuckets = new Map<string, { count: number; windowStart: number }>();

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  try {
    const bearer = Deno.env.get("WESTERN_CHECKOUT_EXCHANGE_KEY");
    if (!bearer) return json({ error: "server_misconfigured" }, 500);

    const provided = req.headers.get("Authorization") ?? "";
    if (!timingSafeEqual(provided, `Bearer ${bearer}`)) {
      return json({ error: "unauthorized" }, 401);
    }

    const ip = clientIp(req);
    if (!allowRequest(ip)) return json({ error: "rate_limited" }, 429);

    let body: { ticket?: unknown } = {};
    try {
      body = await req.json();
    } catch {
      return json({ error: "invalid_body" }, 400);
    }
    const ticket = typeof body.ticket === "string" ? body.ticket.trim() : "";
    if (!ticket || ticket.length < 16 || ticket.length > 128) {
      return json({ error: "invalid_ticket" }, 400);
    }

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false, autoRefreshToken: false } },
    );

    // Atomic consume: returns null when ticket is unknown, expired, or already used.
    const { data: payload, error } = await admin.rpc("consume_checkout_ticket", {
      _ticket: ticket,
      _ip: ip,
    });
    if (error) {
      console.error("[checkout-ticket-redeem] rpc failed", error);
      return json({ error: "redeem_failed" }, 500);
    }
    if (!payload) return json({ error: "ticket_invalid_or_expired" }, 404);

    // Opportunistic cleanup — fire and forget.
    admin.rpc("cleanup_expired_checkout_tickets").then(() => {}).catch(() => {});

    return json({ ok: true, payload });
  } catch (e) {
    console.error("[checkout-ticket-redeem]", e);
    return json({ error: "internal_error" }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  return req.headers.get("cf-connecting-ip") ?? req.headers.get("x-real-ip") ?? "unknown";
}

function allowRequest(ip: string): boolean {
  const now = Date.now();
  const bucket = rateBuckets.get(ip);
  if (!bucket || now - bucket.windowStart > RATE_LIMIT_WINDOW_MS) {
    rateBuckets.set(ip, { count: 1, windowStart: now });
    return true;
  }
  bucket.count += 1;
  return bucket.count <= RATE_LIMIT_MAX;
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
