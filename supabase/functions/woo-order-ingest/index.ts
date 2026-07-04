// Public webhook receiver for WooCommerce order events.
// HMAC-SHA256 (base64) signature check against WOO_WEBHOOK_SECRET.
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-wc-webhook-signature, x-wc-webhook-topic, x-wc-webhook-source, x-wc-webhook-event, x-wc-webhook-resource, x-wc-webhook-id, x-wc-webhook-delivery-id",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

async function hmacBase64(secret: string, body: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(body),
  );
  const bytes = new Uint8Array(sig);
  let bin = "";
  for (let i = 0; i < bytes.byteLength; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i++) out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return out === 0;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  const secret = Deno.env.get("WOO_WEBHOOK_SECRET");
  if (!secret) {
    console.error("WOO_WEBHOOK_SECRET not configured");
    return json({ error: "server_misconfigured" }, 500);
  }

  const raw = await req.text();
  const signature = req.headers.get("x-wc-webhook-signature") ?? "";

  // Woo ping/verification: empty body, no signature header expected.
  if (!raw || raw.length === 0) {
    return json({ ok: true, ping: true });
  }

  if (!signature) return json({ error: "missing_signature" }, 401);
  const expected = await hmacBase64(secret, raw);
  if (!timingSafeEqual(expected, signature)) {
    return json({ error: "invalid_signature" }, 401);
  }

  let order: any;
  try {
    order = JSON.parse(raw);
  } catch {
    return json({ error: "invalid_json" }, 400);
  }

  // Ping payload from Woo (no id/status) → ack.
  if (!order || typeof order !== "object" || !order.id) {
    return json({ ok: true, ping: true });
  }

  const status = String(order.status ?? "");
  if (status !== "processing" && status !== "completed") {
    return json({ ok: true, skipped: true, status });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const lineItems: any[] = Array.isArray(order.line_items) ? order.line_items : [];
  const itens = lineItems.map((li) => ({
    sku: li?.sku ?? null,
    nome: li?.name ?? null,
    qty: li?.quantity ?? null,
    preco: li?.total ?? li?.price ?? null,
  }));

  const meta: any[] = Array.isArray(order.meta_data) ? order.meta_data : [];
  const conjuntosMeta = meta.find((m) => m?.key === "_western_conjuntos");
  const conjuntos =
    conjuntosMeta && conjuntosMeta.value != null
      ? typeof conjuntosMeta.value === "string"
        ? conjuntosMeta.value
        : JSON.stringify(conjuntosMeta.value)
      : null;

  // Try to link to a partner by billing email.
  const billingEmail = String(order?.billing?.email ?? "").trim().toLowerCase();
  let userId: string | null = null;
  if (billingEmail) {
    const { data: prof } = await supabase
      .from("partner_profiles")
      .select("user_id")
      .ilike("empresa", billingEmail) // no email column; try auth.users below
      .maybeSingle();
    // partner_profiles has no email column — look up auth.users via admin API.
    if (!prof) {
      const { data: userLookup } = await supabase.auth.admin.listUsers({
        page: 1,
        perPage: 200,
      });
      const match = userLookup?.users?.find(
        (u) => (u.email ?? "").toLowerCase() === billingEmail,
      );
      if (match) userId = match.id;
    } else {
      userId = prof.user_id as string;
    }
  }

  const needsLinking = !userId;
  const numero = String(order.number ?? order.id);
  const titulo = `Pedido #${numero} · ${lineItems.length} item(ns)`;
  const valorTotal = order.total != null ? Number(order.total) : null;

  const payload = {
    woo_order_id: Number(order.id),
    numero,
    titulo,
    valor_total: valorTotal,
    payment_status: status,
    itens,
    status: "aguardando",
    origem: "loja",
    conjuntos,
    user_id: userId,
    needs_linking: needsLinking,
  };

  const { data: upserted, error: upsertErr } = await supabase
    .from("production_orders")
    .upsert(payload, { onConflict: "woo_order_id" })
    .select("id")
    .single();

  if (upsertErr) {
    console.error("upsert error", upsertErr);
    return json({ error: "upsert_failed", detail: upsertErr.message }, 500);
  }

  // Best-effort event log (table may enforce triggers; ignore failure).
  try {
    await supabase.from("production_order_events").insert({
      order_id: upserted.id,
      status: "aguardando",
      note: `Importado do checkout Woo #${numero}`,
    });
  } catch (e) {
    console.warn("event insert failed", e);
  }

  return json({ ok: true, order_id: upserted.id, needs_linking: needsLinking });
});
