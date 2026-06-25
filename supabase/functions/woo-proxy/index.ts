// Read-only proxy to WooCommerce via the Lovable connector gateway.
// Keeps consumer key/secret server-side. Allowlists catalog endpoints only.
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/woocommerce";
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
const WOOCOMMERCE_API_KEY = Deno.env.get("WOOCOMMERCE_API_KEY");

// Catalog-only allowlist. No orders, no customers, no mutations.
const ALLOWED_PATHS: RegExp[] = [
  /^products$/,
  /^products\/categories$/,
  /^products\/\d+$/,
  /^products\/\d+\/variations$/,
];

// In-memory cache (per edge-function instance). Fresh TTL + stale fallback.
const CACHE_TTL_MS = 5 * 60_000; // 5 min fresh
const STALE_TTL_MS = 60 * 60_000; // 1 hr stale fallback when upstream errors
const cache = new Map<string, { expires: number; staleUntil: number; status: number; body: string; contentType: string }>();

// Simple in-flight dedupe so concurrent identical requests don't multiply upstream load.
const inflight = new Map<string, Promise<Response>>();

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}


function jsonResponse(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "GET") {
    return jsonResponse(405, { error: "Method not allowed" });
  }

  if (!LOVABLE_API_KEY || !WOOCOMMERCE_API_KEY) {
    return jsonResponse(500, {
      error: "Server not configured: missing LOVABLE_API_KEY or WOOCOMMERCE_API_KEY",
    });
  }

  const url = new URL(req.url);
  const rawPath = url.searchParams.get("path");
  if (!rawPath) {
    return jsonResponse(400, { error: "Missing 'path' query parameter" });
  }

  const path = rawPath.replace(/^\/+/, "");
  if (path.includes("..") || path.includes("?") || path.includes("#")) {
    return jsonResponse(400, { error: "Invalid path" });
  }

  if (!ALLOWED_PATHS.some((re) => re.test(path))) {
    return jsonResponse(403, { error: `Path not allowed: ${path}` });
  }

  // Forward all query params except 'path'.
  const forwarded = new URLSearchParams();
  for (const [k, v] of url.searchParams.entries()) {
    if (k === "path") continue;
    forwarded.append(k, v);
  }
  const qs = forwarded.toString();
  const target = `${GATEWAY_URL}/${path}${qs ? `?${qs}` : ""}`;
  const cacheKey = target;

  const now = Date.now();
  const cached = cache.get(cacheKey);
  if (cached && cached.expires > now) {
    return new Response(cached.body, {
      status: cached.status,
      headers: { ...corsHeaders, "Content-Type": cached.contentType, "X-Cache": "HIT" },
    });
  }

  try {
    const upstream = await fetch(target, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "X-Connection-Api-Key": WOOCOMMERCE_API_KEY,
      },
    });
    const contentType = upstream.headers.get("Content-Type") ?? "application/json";
    const body = await upstream.text();

    if (upstream.ok) {
      cache.set(cacheKey, { expires: now + CACHE_TTL_MS, status: upstream.status, body, contentType });
    }

    return new Response(body, {
      status: upstream.status,
      headers: { ...corsHeaders, "Content-Type": contentType, "X-Cache": "MISS" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return jsonResponse(502, { error: "Upstream fetch failed", detail: message });
  }
});
