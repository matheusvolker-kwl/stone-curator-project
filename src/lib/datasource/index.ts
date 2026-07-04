// Single switch point for the data source. WooCommerce is the only source.
import { fetchProduct } from "@/lib/woocommerce/queries";
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
 */
export async function fetchProductsByHandlesHydrated(
  handles: string[],
): Promise<ShopifyProductNode[]> {
  if (handles.length === 0) return [];
  const nodes = await Promise.all(handles.map((h) => fetchProduct(h)));
  return nodes.filter((n): n is ShopifyProductNode => !!n);
}
