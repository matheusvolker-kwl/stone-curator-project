// Shared Yampi helpers for edge functions.
// Inlined per-function runtime cache for SKU mapping.

const YAMPI_API_BASE = "https://api.dooki.com.br/v2";

export function yampiHeaders() {
  return {
    "Content-Type": "application/json",
    "User-Token": Deno.env.get("YAMPI_USER_TOKEN") ?? "",
    "User-Secret-Key": Deno.env.get("YAMPI_SECRET_KEY") ?? "",
  };
}

export function yampiBaseUrl() {
  const alias = Deno.env.get("YAMPI_ALIAS") ?? "";
  return `${YAMPI_API_BASE}/${alias}`;
}

type SkuMap = Record<string, number>;
let cache: { map: SkuMap; ts: number } | null = null;
const TTL_MS = 6 * 60 * 60 * 1000; // 6h

export async function getSkuMapping(force = false): Promise<SkuMap> {
  if (!force && cache && Date.now() - cache.ts < TTL_MS) {
    return cache.map;
  }
  const map: SkuMap = {};
  let page = 1;
  // Paginated: limit=100
  while (true) {
    const url = `${yampiBaseUrl()}/catalog/skus?limit=100&page=${page}`;
    const res = await fetch(url, { headers: yampiHeaders() });
    if (!res.ok) {
      throw new Error(`yampi /catalog/skus failed: ${res.status} ${await res.text()}`);
    }
    const json = await res.json();
    const data: Array<{ id: number; sku: string }> = json?.data ?? [];
    for (const row of data) {
      if (row?.sku) map[row.sku] = row.id;
    }
    const meta = json?.meta?.pagination;
    if (!meta || page >= (meta.total_pages ?? 1)) break;
    page += 1;
    if (page > 50) break; // safety
  }
  cache = { map, ts: Date.now() };
  return map;
}

export function resolveSkus(
  items: Array<{ sku: string; quantidade: number }>,
  map: SkuMap,
): { ids: number[]; quantities: number[]; missing: string | null } {
  const ids: number[] = [];
  const quantities: number[] = [];
  for (const item of items) {
    const id = map[item.sku];
    if (!id) return { ids: [], quantities: [], missing: item.sku };
    ids.push(id);
    quantities.push(item.quantidade);
  }
  return { ids, quantities, missing: null };
}
