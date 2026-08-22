// Public webhook receiver for WooCommerce order events.
// HMAC-SHA256 (base64) signature check against WOO_WEBHOOK_SECRET.
//
// O que este arquivo passou a fazer (22/08/2026):
//  · lê shipping_lines -> modo_entrega ('retirada' quando o método é local_pickup),
//    transportadora e shipping_total. Antes o método de entrega NUNCA era lido e o
//    banco caía no default 'frete', por isso "Retirar na Western" virava transportadora.
//  · lê payment_method / payment_method_title -> a tela de pedidos passa a mostrar
//    a forma de pagamento. (payment_status é legado: guarda o status do PEDIDO.)
//  · lê billing/shipping -> cliente_nome, cliente_email, cliente_telefone, endereco_entrega.
//  · separa CRIAR de ATUALIZAR: o status de produção, prazos, rastreio e observações
//    pertencem ao painel e não são mais sobrescritos a cada order.updated.
//  · aceita on-hold (boleto/Pix aguardando) além de processing/completed, e mantém
//    sincronizado o pedido que já existe quando ele muda para cancelled/refunded.
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

/** Status do Woo que geram um pedido de produção novo. */
const STATUS_QUE_CRIAM = new Set(["processing", "completed", "on-hold"]);
/** Status que só atualizam um pedido que já existe (não criam). */
const STATUS_QUE_SO_ATUALIZAM = new Set([
  "cancelled",
  "refunded",
  "failed",
  "pending",
]);

/** Monta o endereço de entrega em uma linha legível. */
function formatEndereco(a: Record<string, unknown> | null | undefined): string | null {
  if (!a) return null;
  const s = (k: string) => String((a as Record<string, string>)[k] ?? "").trim();
  const rua = [s("address_1"), s("number"), s("address_2")].filter(Boolean).join(", ");
  const cidade = [s("city"), s("state")].filter(Boolean).join("/");
  const linha = [rua, s("neighborhood"), cidade, s("postcode")]
    .filter(Boolean)
    .join(" · ");
  return linha || null;
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
  const podeCriar = STATUS_QUE_CRIAM.has(status);
  const podeAtualizar = podeCriar || STATUS_QUE_SO_ATUALIZAM.has(status);
  if (!podeAtualizar) {
    return json({ ok: true, skipped: true, status });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const wooOrderId = Number(order.id);

  // ── Itens ────────────────────────────────────────────────────────────────
  const lineItems: any[] = Array.isArray(order.line_items) ? order.line_items : [];
  const itens = lineItems.map((li) => ({
    sku: li?.sku ?? null,
    nome: li?.name ?? null,
    qty: li?.quantity ?? null,
    preco: li?.total ?? li?.price ?? null,
  }));

  // ── Entrega: a correção central do sintoma "retirada virou transportadora" ─
  const shippingLines: any[] = Array.isArray(order.shipping_lines)
    ? order.shipping_lines
    : [];
  const ship = shippingLines[0] ?? null;
  const shippingMethodId = String(ship?.method_id ?? "").trim();
  const shippingMethodTitle = String(ship?.method_title ?? "").trim();
  // Woo usa "local_pickup" (e variações "local_pickup:3") para retirada.
  const ehRetirada = /local_pickup|retirada|pickup/i.test(
    `${shippingMethodId} ${shippingMethodTitle}`,
  );
  const modoEntrega = ehRetirada ? "retirada" : "frete";
  const shippingTotal =
    ship?.total != null && ship.total !== "" ? Number(ship.total) : null;

  // ── Cliente e endereço ───────────────────────────────────────────────────
  const billing = order?.billing ?? null;
  const shipping = order?.shipping ?? null;
  const billingEmail = String(billing?.email ?? "").trim().toLowerCase();
  const clienteNome =
    [billing?.first_name, billing?.last_name]
      .map((v) => String(v ?? "").trim())
      .filter(Boolean)
      .join(" ") || null;
  const clienteTelefone = String(billing?.phone ?? "").trim() || null;
  // Em retirada o Woo costuma mandar shipping vazio — cai para o billing.
  const enderecoEntrega = ehRetirada
    ? null
    : formatEndereco(shipping) ?? formatEndereco(billing);

  // ── Conjuntos (atribuição vinda do hand-off) ─────────────────────────────
  const meta: any[] = Array.isArray(order.meta_data) ? order.meta_data : [];
  const conjuntosMeta = meta.find((m) => m?.key === "_western_conjuntos");
  const conjuntos =
    conjuntosMeta && conjuntosMeta.value != null
      ? typeof conjuntosMeta.value === "string"
        ? conjuntosMeta.value
        : JSON.stringify(conjuntosMeta.value)
      : null;

  // ── Vínculo com o parceiro ───────────────────────────────────────────────
  // Antes: .ilike("empresa", email) (coluna errada, sempre no-op) + listUsers
  // limitado a 200 usuários. Agora: busca direta e indexada em auth.users.
  let userId: string | null = null;
  if (billingEmail) {
    const { data: found, error: findErr } = await supabase.rpc(
      "find_user_id_by_email",
      { _email: billingEmail },
    );
    if (findErr) console.warn("find_user_id_by_email falhou", findErr.message);
    userId = (found as string | null) ?? null;
  }

  const numero = String(order.number ?? order.id);
  const valorTotal = order.total != null ? Number(order.total) : null;

  // Campos que são verdade do WooCommerce — sempre regravados.
  const camposDoWoo = {
    valor_total: valorTotal,
    itens,
    conjuntos,
    woo_status: status,
    payment_status: status, // legado: mantido para não quebrar leituras antigas
    payment_method: order.payment_method ?? null,
    payment_method_title: order.payment_method_title ?? null,
    modo_entrega: modoEntrega,
    shipping_method_id: shippingMethodId || null,
    shipping_total: shippingTotal,
    transportadora: ehRetirada ? null : shippingMethodTitle || null,
    endereco_entrega: enderecoEntrega,
    cliente_nome: clienteNome,
    cliente_email: billingEmail || null,
    cliente_telefone: clienteTelefone,
    date_paid: order.date_paid_gmt ? `${order.date_paid_gmt}Z` : null,
  };

  // ── Criar x atualizar ────────────────────────────────────────────────────
  const { data: existente } = await supabase
    .from("production_orders")
    .select("id")
    .eq("woo_order_id", wooOrderId)
    .maybeSingle();

  if (existente) {
    // NÃO tocar em: status (produção), prazo, produzir_ate, previsao_entrega,
    // tracking_code, observacoes_* e titulo — isso é do painel, não do Woo.
    const patch: Record<string, unknown> = { ...camposDoWoo };
    // Só assume o vínculo quando encontramos alguém; nunca desvincula à toa.
    if (userId) {
      patch.user_id = userId;
      patch.needs_linking = false;
    }

    const { error: updErr } = await supabase
      .from("production_orders")
      .update(patch)
      .eq("id", existente.id);

    if (updErr) {
      console.error("update error", updErr);
      return json({ error: "update_failed", detail: updErr.message }, 500);
    }
    return json({ ok: true, order_id: existente.id, updated: true });
  }

  // Status que só atualizam não criam pedido novo (evita encher o painel de
  // checkout abandonado — pending vira cancelled pelo cron do Woo).
  if (!podeCriar) {
    return json({ ok: true, skipped: true, status, reason: "nao_existe_ainda" });
  }

  const { data: criado, error: insErr } = await supabase
    .from("production_orders")
    .insert({
      ...camposDoWoo,
      woo_order_id: wooOrderId,
      numero,
      titulo: `Pedido #${numero} · ${lineItems.length} item(ns)`,
      status: "aguardando",
      origem: "loja",
      user_id: userId,
      needs_linking: !userId,
    })
    .select("id")
    .single();

  if (insErr) {
    console.error("insert error", insErr);
    return json({ error: "insert_failed", detail: insErr.message }, 500);
  }

  // Log de evento — best-effort, só na criação.
  try {
    await supabase.from("production_order_events").insert({
      order_id: criado.id,
      status: "aguardando",
      note: `Importado do checkout Woo #${numero}`,
    });
  } catch (e) {
    console.warn("event insert failed", e);
  }

  return json({ ok: true, order_id: criado.id, created: true, needs_linking: !userId });
});
