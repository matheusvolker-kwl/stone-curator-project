// Edge function: yampi-calc-frete
// Cota frete via Yampi (que internamente consulta GoFretes).
import { getSkuMapping, resolveSkus, yampiBaseUrl, yampiHeaders } from "../_shared/yampi.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const DIAS_EXTRAS = 15; // produção Western

interface Body {
  cep_destino: string;
  total: number; // BRL
  items: Array<{ sku: string; quantidade: number }>;
}

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function callYampi(payload: Record<string, unknown>) {
  const url = `${yampiBaseUrl()}/logistics/shipping-costs`;
  console.log("yampi url", url);
  console.log("yampi payload", JSON.stringify(payload));
  const res = await fetch(url, {
    method: "POST",
    headers: yampiHeaders(),
    body: JSON.stringify(payload),
  });
  const text = await res.text();
  console.log("yampi response", res.status, text.slice(0, 2000));
  let parsed: any = null;
  try {
    parsed = JSON.parse(text);
  } catch {
    /* ignore */
  }
  return { status: res.status, ok: res.ok, body: parsed, raw: text };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  // DESATIVADA em 2026-06-16 — checkout migrado para Shopify nativo.
  // Mantida por 1 semana como backup. Após 2026-06-23, remover.
  return json(410, { error: "desativada", motivo: "checkout_migrado_shopify" });
  if (req.method !== "POST") return json(405, { error: "method_not_allowed" });

  let body: Body;
  try {
    body = await req.json();
  } catch {
    return json(400, { error: "invalid_json" });
  }

  const cep = (body.cep_destino ?? "").replace(/\D/g, "");
  if (cep.length !== 8) return json(400, { erro: "cep_invalido" });
  if (!Array.isArray(body.items) || body.items.length === 0) {
    return json(400, { erro: "items_vazio" });
  }
  const total = Number(body.total);
  if (!isFinite(total) || total <= 0) return json(400, { erro: "total_invalido" });

  console.log("calc-frete payload in", { cep, total, items: body.items.length });
  console.log("env check", {
    alias: !!Deno.env.get("YAMPI_ALIAS"),
    userToken: !!Deno.env.get("YAMPI_USER_TOKEN"),
    secretKey: !!Deno.env.get("YAMPI_SECRET_KEY"),
    cepOrigem: !!Deno.env.get("CEP_ORIGEM"),
  });

  try {
    const map = await getSkuMapping();
    const { ids, quantities, missing } = resolveSkus(body.items, map);
    if (missing) {
      console.error("sku não mapeado", missing);
      return json(200, { opcoes: [], erro: "sku_nao_encontrado", sku: missing });
    }
    console.log("resolved skus", { ids, quantities });

    const cepOrigem = (Deno.env.get("CEP_ORIGEM") ?? "").replace(/\D/g, "");

    const basePayload: Record<string, unknown> = {
      zipcode: cep,
      total,
      skus_ids: ids,
      quantities,
    };
    if (cepOrigem.length === 8) basePayload.zipcode_origin = cepOrigem;

    // 1ª tentativa: payload limpo, sem order_id (cotação de carrinho)
    let result = await callYampi(basePayload);

    // Se a Yampi exigir order_id, tentamos com origin string (legado)
    if (!result.ok && result.status === 422) {
      const fallbackPayload = {
        ...basePayload,
        origin: "cart_page",
      };
      console.log("yampi retry com origin=cart_page");
      result = await callYampi(fallbackPayload);
    }

    if (!result.ok) {
      console.error("yampi shipping-costs error", result.status, result.raw);
      return json(200, {
        opcoes: [],
        erro: "api_indisponivel",
        debug: { yampi_status: result.status, yampi_body: result.body ?? result.raw?.slice(0, 1000) },
      });
    }

    const data = result.body ?? {};
    const list: any[] =
      data?.data ?? data?.shipping_costs ?? data?.quotes ?? data?.options ?? [];

    if (!Array.isArray(list) || list.length === 0) {
      console.warn("yampi sem opções", JSON.stringify(data).slice(0, 1000));
      return json(200, { opcoes: [], erro: "sem_cobertura", debug: { yampi_body: data } });
    }

    const opcoes = list.map((row: any, idx: number) => {
      const valor = Number(row.price ?? row.value ?? row.amount ?? row.cost ?? 0);
      const prazo = Number(row.delivery_time ?? row.deadline ?? row.days ?? row.estimate ?? 0);
      const min = Number(row.delivery_time_min ?? prazo ?? 0);
      const max = Number(row.delivery_time_max ?? prazo ?? 0);
      return {
        id: String(row.id ?? row.code ?? row.service ?? `opt_${idx}`),
        transportadora: String(
          row.name ?? row.carrier ?? row.service_name ?? row.title ?? "Transportadora",
        ),
        valor,
        prazo_min_dias: (min || prazo) + DIAS_EXTRAS,
        prazo_max_dias: (max || prazo) + DIAS_EXTRAS,
      };
    });

    return json(200, { opcoes, erro: null });
  } catch (e) {
    console.error("yampi-calc-frete exception", e);
    return json(200, {
      opcoes: [],
      erro: "api_indisponivel",
      debug: { exception: String(e) },
    });
  }
});
