// Catalog-visibility filters. Applied BEFORE the adapter so they affect
// both listing and detail flows.

import type { WooProduct } from "./types";

/** Multi-volume hidden box SKUs (WEST-CSC-CX1, ...-CX2, etc.). */
const HIDDEN_BOX_SKU = /-CX\d+$/i;

/** Produtos internos de teste (ex.: WEST-FC-TESTE) — nunca expor no catálogo. */
const TEST_SKU = /TESTE/i;

/**
 * True if the product should appear in the public catalog.
 * Excludes: drafts, non-visible products, hidden multi-volume boxes, test SKUs.
 */
export function isPublicCatalogProduct(p: WooProduct): boolean {
  if (p.status !== "publish") return false;
  if (p.catalog_visibility === "hidden") return false;
  if (p.sku && HIDDEN_BOX_SKU.test(p.sku)) return false;
  if (p.sku && TEST_SKU.test(p.sku)) return false;
  return true;
}

export function filterPublicCatalog(products: WooProduct[]): WooProduct[] {
  return products.filter(isPublicCatalogProduct);
}
