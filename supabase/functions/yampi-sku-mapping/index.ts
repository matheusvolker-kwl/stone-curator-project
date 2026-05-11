// Edge function: yampi-sku-mapping
// Utilitária — retorna o mapping { sku: idYampi } com cache em memória (TTL 6h).
import { getSkuMapping } from "../_shared/yampi.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  try {
    const url = new URL(req.url);
    const force = url.searchParams.get("refresh") === "1";
    const map = await getSkuMapping(force);
    return new Response(
      JSON.stringify({ count: Object.keys(map).length, map }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("yampi-sku-mapping", e);
    return new Response(
      JSON.stringify({ error: "mapping_failed", detail: String(e) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
