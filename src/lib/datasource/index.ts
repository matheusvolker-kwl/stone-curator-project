// Single switch point for the data source. WooCommerce is the only source.
import { fetchProduct, warmListingCatalog } from "@/lib/woocommerce/queries";
import type { ShopifyProductNode } from "@/lib/catalog/types";

export {
  fetchCollections,
  fetchCollection,
  fetchProduct,
  fetchProducts,
  fetchProductsByHandles,
  isSeasonal,
} from "@/lib/woocommerce/queries";

/**
 * Hidrata cada handle via `fetchProduct` (traz variações reais de produtos
 * variáveis e grupos de bundle) — necessário para composições de conjunto
 * onde precisamos selecionar a variante do acabamento escolhido.
 *
 * Robustez (bug do add-to-cart de /obras, 2026-08):
 * - catálogo aquecido ANTES do fan-out: frio, N peças viravam ~2N requests
 *   simultâneos ao proxy e qualquer 429/queda derrubava a composição;
 * - allSettled em vez de all: a falha de UMA peça não zera a obra inteira;
 * - perda deixa rastro no console — nunca some em silêncio.
 */
export async function fetchProductsByHandlesHydrated(
  handles: string[],
): Promise<ShopifyProductNode[]> {
  if (handles.length === 0) return [];
  await warmListingCatalog();
  const settled = await Promise.allSettled(handles.map((h) => fetchProduct(h)));
  const nodes: ShopifyProductNode[] = [];
  settled.forEach((s, i) => {
    if (s.status === "rejected") {
      console.warn(`[composicao] peça "${handles[i]}" falhou ao hidratar:`, s.reason);
    } else if (!s.value) {
      console.warn(`[composicao] peça "${handles[i]}" não existe no catálogo público`);
    } else {
      nodes.push(s.value);
    }
  });
  return nodes;
}
