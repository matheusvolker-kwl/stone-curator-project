import { createClient } from "npm:@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface Body {
  source?: string;
  severity?: "error" | "warn" | "info";
  message?: string;
  stack?: string;
  url?: string;
  context?: Record<string, unknown>;
}

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function postWebhook(payload: Record<string, unknown>) {
  const url = Deno.env.get("ALERT_WEBHOOK_URL");
  if (!url) return;
  try {
    const text =
      `:rotating_light: *${payload.severity ?? "error"}* · \`${payload.source}\`\n` +
      `${payload.message}\n` +
      (payload.user_email ? `_user_: ${payload.user_email}\n` : "") +
      (payload.url ? `_url_: ${payload.url}\n` : "") +
      (payload.context ? `\`\`\`${JSON.stringify(payload.context, null, 2).slice(0, 1500)}\`\`\`` : "");
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, ...payload }),
    });
  } catch (err) {
    console.error("alert webhook failed", err);
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);

  let body: Body;
  try {
    body = await req.json() as Body;
  } catch {
    return jsonResponse({ error: "Invalid JSON" }, 400);
  }

  const source = (body.source ?? "").trim().slice(0, 120);
  const message = (body.message ?? "").trim().slice(0, 2000);
  if (!source || !message) return jsonResponse({ error: "Missing source/message" }, 400);

  const severity: "error" | "warn" | "info" =
    body.severity === "warn" || body.severity === "info" ? body.severity : "error";

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!;

  // Tenta extrair usuário do JWT (opcional — guests também podem reportar)
  let userId: string | null = null;
  let userEmail: string | null = null;
  const authHeader = req.headers.get("Authorization") ?? "";
  if (authHeader.startsWith("Bearer ")) {
    try {
      const userClient = createClient(supabaseUrl, anonKey, {
        global: { headers: { Authorization: authHeader } },
        auth: { persistSession: false },
      });
      const { data } = await userClient.auth.getUser();
      userId = data?.user?.id ?? null;
      userEmail = data?.user?.email ?? null;
    } catch {
      // ignore — sem auth é OK
    }
  }

  const userAgent = req.headers.get("user-agent") ?? null;
  const url = (body.url ?? "").slice(0, 1000) || null;
  const stack = (body.stack ?? "").slice(0, 8000) || null;
  const context = body.context && typeof body.context === "object" ? body.context : {};

  const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
  const { error } = await admin.from("client_errors").insert({
    source,
    severity,
    message,
    stack,
    user_id: userId,
    user_email: userEmail,
    url,
    user_agent: userAgent,
    context,
  });

  if (error) {
    console.error("log-client-error insert failed", error);
    return jsonResponse({ error: "Could not record error" }, 500);
  }

  // Webhook é fire-and-forget
  postWebhook({ source, severity, message, user_email: userEmail, url, context }).catch(() => {});

  return jsonResponse({ ok: true });
});
