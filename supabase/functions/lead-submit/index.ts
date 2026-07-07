// Edge Function: lead-submit
// Public endpoint (verify_jwt = false) protected by Cloudflare Turnstile captcha.
// Validates the captcha server-side, sanitizes the payload, and inserts into `leads`
// using the service role (bypasses RLS).

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const ALLOWED_TYPES = new Set(["b2c_orcamento", "contato", "visita", "newsletter"]);

// ---- Captcha verification (isolated for future swap to reCAPTCHA) ----
async function verifyCaptcha(token: string, ip: string | null): Promise<
  { ok: true } | { ok: false; status: number; error: string }
> {
  const secret = Deno.env.get("TURNSTILE_SECRET");
  if (!secret) {
    return { ok: false, status: 500, error: "captcha_not_configured" };
  }
  const form = new URLSearchParams();
  form.set("secret", secret);
  form.set("response", token);
  if (ip) form.set("remoteip", ip);

  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: form.toString(),
    });
    const data = await res.json().catch(() => ({}));
    if (data?.success === true) return { ok: true };
    console.error("turnstile failed", { errors: data?.["error-codes"] });
    return { ok: false, status: 403, error: "captcha_failed" };
  } catch (e) {
    console.error("turnstile fetch error", e);
    return { ok: false, status: 403, error: "captcha_failed" };
  }
}

function trimStr(v: unknown, max: number): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  if (!t) return null;
  return t.slice(0, max);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return json(405, { ok: false, error: "method_not_allowed" });
  }

  let body: { token?: string; lead?: Record<string, unknown> };
  try {
    body = await req.json();
  } catch {
    return json(400, { ok: false, error: "invalid_json" });
  }

  const token = typeof body?.token === "string" ? body.token : "";
  const lead = (body?.lead ?? {}) as Record<string, unknown>;
  if (!token) return json(400, { ok: false, error: "missing_token" });

  const ip =
    req.headers.get("CF-Connecting-IP") ||
    (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() ||
    null;

  const captcha = await verifyCaptcha(token, ip);
  if (!captcha.ok) return json(captcha.status, { ok: false, error: captcha.error });

  // ---- Validation + sanitization (mirrors RLS) ----
  const type = typeof lead.type === "string" ? lead.type : "";
  if (!ALLOWED_TYPES.has(type)) {
    return json(400, { ok: false, error: "invalid_type" });
  }

  const nome = trimStr(lead.nome, 120);
  const email = trimStr(lead.email, 320);
  const telefone = trimStr(lead.telefone, 40);
  const cidade = trimStr(lead.cidade, 80);
  const uf = trimStr(lead.uf, 2);
  const empresa = trimStr(lead.empresa, 160);
  const mensagem = trimStr(lead.mensagem, 1000);
  const origem = trimStr(lead.origem, 80);
  const items_hash = trimStr(lead.items_hash, 128);
  const payload =
    lead.payload && typeof lead.payload === "object" && !Array.isArray(lead.payload)
      ? (lead.payload as Record<string, unknown>)
      : {};

  const emailOk = !!email && email.length >= 5;
  const telOk = !!telefone && telefone.length >= 6;
  if (!emailOk && !telOk) {
    return json(400, { ok: false, error: "email_or_phone_required" });
  }

  const row: Record<string, unknown> = {
    type,
    nome,
    email,
    telefone,
    cidade,
    uf,
    empresa,
    mensagem,
    origem,
    payload,
    items_hash,
  };

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const { data, error } = await supabase.from("leads").insert(row).select("id").single();
  if (error) {
    console.error("lead insert failed", { message: error.message, code: error.code });
    return json(500, { ok: false, error: error.message });
  }

  // Fire-and-forget: notifica o time interno. Nunca bloqueia a resposta.
  try {
    supabase.functions.invoke("notify-lead", {
      body: {
        tipo: type,
        nome, email, telefone, empresa, cidade,
        mensagem, origem,
      },
    }).catch((e) => console.warn("notify-lead invoke failed", e));
  } catch (e) {
    console.warn("notify-lead dispatch error", e);
  }

  return json(200, { ok: true, id: (data as { id: string }).id });
});
