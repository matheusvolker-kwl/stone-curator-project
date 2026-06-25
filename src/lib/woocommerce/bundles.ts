// Acabamento bundle grouping.
//
// Context: the 3 multi-volume products (CSB/CSC/FSL) exist as FOUR separate
// bundle products in Woo, one per acabamento (Quartzo, Arenito, Moledo,
// Granito). SKU follows the short form WEST-<PRODUTO>-Q|A|M|G, e.g.:
//   WEST-CSC-Q, WEST-CSC-A, WEST-CSC-M, WEST-CSC-G
//
// The regex is also tolerant to the LONG form (-QUARTZO/-ARENITO/-MOLEDO/
// -GRANITO) because variable simples use long names in variation attributes
// and future bundles may use either form.
//
// Grouping turns N bundle products into ONE virtual ShopifyProductNode whose
// `options` exposes a single "Acabamento" selector with up to 4 values, and
// whose `variants.edges` carries one entry per real Woo bundle (each variant
// keeps the real bundle SKU/price/id, used by the cart and checkout).

import type { WooProduct } from "./types";

export type AcabamentoName = "Quartzo" | "Arenito" | "Moledo" | "Granito";

export const ACABAMENTO_ORDER: AcabamentoName[] = [
  "Quartzo",
  "Arenito",
  "Moledo",
  "Granito",
];

const INITIAL_TO_NAME: Record<string, AcabamentoName> = {
  Q: "Quartzo",
  A: "Arenito",
  M: "Moledo",
  G: "Granito",
};

const LONG_TO_NAME: Record<string, AcabamentoName> = {
  QUARTZO: "Quartzo",
  ARENITO: "Arenito",
  MOLEDO: "Moledo",
  GRANITO: "Granito",
};

/**
 * Match SKU suffix `-Q|A|M|G` (short) or `-QUARTZO|ARENITO|MOLEDO|GRANITO` (long).
 * Returns { prefix, acabamento } or null when not an acabamento variant.
 *
 *   WEST-CSC-Q       → { prefix: "WEST-CSC",  acabamento: "Quartzo" }
 *   WEST-CSC-QUARTZO → { prefix: "WEST-CSC",  acabamento: "Quartzo" }
 *   WEST-CSC-CX1     → null   (caixa oculta, filtrada antes daqui)
 *   WEST-PEDRA-X     → null
 */
export function parseAcabamentoSku(sku: string | undefined | null): {
  prefix: string;
  acabamento: AcabamentoName;
} | null {
  if (!sku) return null;
  const long = sku.match(/^(.+)-(QUARTZO|ARENITO|MOLEDO|GRANITO)$/i);
  if (long) {
    const key = long[2].toUpperCase();
    return { prefix: long[1].toUpperCase(), acabamento: LONG_TO_NAME[key] };
  }
  const short = sku.match(/^(.+)-([QAMG])$/i);
  if (short) {
    const key = short[2].toUpperCase();
    return { prefix: short[1].toUpperCase(), acabamento: INITIAL_TO_NAME[key] };
  }
  return null;
}

/**
 * True if the product is a Woo bundle (Product Bundles plugin).
 * We only group products that are ACTUALLY bundles — a stray non-bundle product
 * with a -Q/-A/-M/-G suffix would be treated as a normal product.
 */
export function isBundleProduct(p: WooProduct): boolean {
  if (p.type === "bundle") return true;
  // Heuristic fallback: bundle_price/bundled_items populated by the plugin.
  if (Array.isArray(p.bundled_items) && p.bundled_items.length > 0) return true;
  return false;
}

/**
 * Identify whether a Woo product participates in an acabamento bundle group.
 */
export function getBundleGroupKey(p: WooProduct): {
  prefix: string;
  acabamento: AcabamentoName;
} | null {
  if (!isBundleProduct(p)) return null;
  return parseAcabamentoSku(p.sku);
}

export interface AcabamentoGroup {
  prefix: string;
  /** Slug canônico: o slug do bundle Quartzo se existir; senão, o primeiro pela ordem. */
  canonicalSlug: string;
  /** Membros do grupo na ordem Quartzo → Arenito → Moledo → Granito. */
  members: Array<{ acabamento: AcabamentoName; product: WooProduct }>;
}

/**
 * Compute a "canonical" slug for the grouped product:
 *  - se o slug original termina com `-quartzo|arenito|moledo|granito` (long) ou `-q|-a|-m|-g` (short), removemos o sufixo;
 *  - caso contrário, usamos o slug do produto canônico inalterado.
 */
export function stripAcabamentoSlugSuffix(slug: string): string {
  return slug
    .replace(/-(?:quartzo|arenito|moledo|granito)$/i, "")
    .replace(/-[qamg]$/i, "");
}

/**
 * Partition a list of Woo products into:
 *  - `groups`: acabamento bundle groups (each with up to 4 members)
 *  - `others`: products that pass through unchanged (avulsos, simples, etc.)
 */
export function groupAcabamentoBundles(products: WooProduct[]): {
  groups: AcabamentoGroup[];
  others: WooProduct[];
} {
  const buckets = new Map<string, AcabamentoGroup>();
  const others: WooProduct[] = [];

  for (const p of products) {
    const key = getBundleGroupKey(p);
    if (!key) {
      others.push(p);
      continue;
    }
    let bucket = buckets.get(key.prefix);
    if (!bucket) {
      bucket = { prefix: key.prefix, canonicalSlug: "", members: [] };
      buckets.set(key.prefix, bucket);
    }
    bucket.members.push({ acabamento: key.acabamento, product: p });
  }

  for (const bucket of buckets.values()) {
    // Sort members in the canonical order
    bucket.members.sort(
      (a, b) =>
        ACABAMENTO_ORDER.indexOf(a.acabamento) -
        ACABAMENTO_ORDER.indexOf(b.acabamento),
    );
    // Canonical slug: prefer Quartzo, otherwise first member; strip suffix.
    const canonicalProduct =
      bucket.members.find((m) => m.acabamento === "Quartzo")?.product ??
      bucket.members[0]!.product;
    bucket.canonicalSlug = stripAcabamentoSlugSuffix(canonicalProduct.slug);
  }

  return { groups: Array.from(buckets.values()), others };
}
