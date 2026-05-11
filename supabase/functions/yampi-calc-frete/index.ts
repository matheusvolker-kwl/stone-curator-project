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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
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

  try {
    const map = await getSkuMapping();
    const { ids, quantities, missing } = resolveSkus(body.items, map);
    if (missing) return json(500, { erro: "sku_nao_encontrado", sku: missing });

    const payload = {
      order_id: 0,
      zipcode: cep,
      total,
      origin: "cart_page",
      skus_ids: ids,
      quantities,
    };

    const res = await fetch(`${yampiBaseUrl()}/logistics/shipping-costs`, {
      method: "POST",
      headers: yampiHeaders(),
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      console.error("yampi shipping-costs error", res.status, await res.text());
      return json(200, { opcoes: [], erro: "api_indisponivel" });
    }

    const data = await res.json();
    const list: any[] =
      data?.data ?? data?.shipping_costs ?? data?.quotes ?? data?.options ?? [];

    if (!Array.isArray(list) || list.length === 0) {
      return json(200, { opcoes: [], erro: "sem_cobertura" });
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
    console.error("yampi-calc-frete", e);
    return json(200, { opcoes: [], erro: "api_indisponivel" });
  }
});
