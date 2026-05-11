// Edge function: yampi-criar-checkout
// Cria Payment Link na Yampi e devolve URL pública.
import { getSkuMapping, resolveSkus, yampiBaseUrl, yampiHeaders } from "../_shared/yampi.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const PEDIDO_MINIMO_BRL = 700; // alinhado com src/config/business.ts

interface Body {
  items: Array<{ sku: string; quantidade: number; preco_unitario: number }>;
  tracking?: Record<string, string>;
}

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json(405, { error: "method_not_allowed" });

  let body: Body;
  try {
    body = await req.json();
  } catch {
    return json(400, { erro: "invalid_json" });
  }

  if (!Array.isArray(body.items) || body.items.length === 0) {
    return json(400, { erro: "items_vazio" });
  }

  const subtotal = body.items.reduce(
    (s, i) => s + Number(i.preco_unitario) * Number(i.quantidade),
    0,
  );
  if (subtotal < PEDIDO_MINIMO_BRL) {
    return json(400, { erro: "abaixo_minimo", subtotal, minimo: PEDIDO_MINIMO_BRL });
  }

  try {
    const map = await getSkuMapping();
    const { missing } = resolveSkus(
      body.items.map((i) => ({ sku: i.sku, quantidade: i.quantidade })),
      map,
    );
    if (missing) return json(500, { erro: "sku_nao_encontrado", sku: missing });

    const skus = body.items.map((i) => ({
      id: map[i.sku],
      quantity: i.quantidade,
    }));

    const ts = new Date().toISOString();
    const payload = {
      name: `Pedido Lovable ${ts}`,
      active: true,
      skus,
    };

    const res = await fetch(`${yampiBaseUrl()}/checkout/payment-link`, {
      method: "POST",
      headers: yampiHeaders(),
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      console.error("yampi payment-link error", res.status, await res.text());
      return json(500, { erro: "yampi_indisponivel" });
    }

    const data = await res.json();
    const link = data?.data ?? data;
    const url: string | undefined =
      link?.link_url ?? link?.url ?? link?.public_url ?? link?.checkout_url ?? link?.link;
    const id = link?.id ?? link?.payment_link_id;

    if (!url) {
      console.error("yampi payment-link missing url", data);
      return json(500, { erro: "yampi_indisponivel" });
    }

    return json(200, { checkout_url: url, payment_link_id: id });
  } catch (e) {
    console.error("yampi-criar-checkout", e);
    return json(500, { erro: "yampi_indisponivel" });
  }
});
