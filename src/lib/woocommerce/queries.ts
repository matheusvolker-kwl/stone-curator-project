// WooCommerce queries — same 6 signatures as src/lib/shopify/queries.ts so
// consumers can swap imports without touching component code.

import type {
  ShopifyCollection,
  ShopifyProduct,
  ShopifyProductNode,
} from "@/lib/catalog/types";
import { wooFetch } from "./client";
import { adaptAcabamentoGroup, adaptCategory, adaptProduct } from "./adapter";
import { groupAcabamentoBundles } from "./bundles";
import { filterPublicCatalog } from "./filters";
import type { WooCategory, WooProduct, WooVariation } from "./types";

// ─── Cache (per page-load, short) ────────────────────────────────────────────
const CATALOG_TTL_MS = 60_000;

let catalogPromise: Promise<WooProduct[]> | null = null;
let catalogExpires = 0;

async function getAllPublicProducts(): Promise<WooProduct[]> {
  const now = Date.now();
  if (catalogPromise && catalogExpires > now) return catalogPromise;
  catalogPromise = (async () => {
    const raw = await wooFetch<WooProduct[]>({
      path: "products",
      params: { per_page: 100, status: "publish" },
    });
    return filterPublicCatalog(raw);
  })();
  catalogExpires = now + CATALOG_TTL_MS;
  try {
    return await catalogPromise;
  } catch (e) {
    catalogPromise = null;
    catalogExpires = 0;
    throw e;
  }
}

let categoriesPromise: Promise<WooCategory[]> | null = null;
let categoriesExpires = 0;

async function getAllCategories(): Promise<WooCategory[]> {
  const now = Date.now();
  if (categoriesPromise && categoriesExpires > now) return categoriesPromise;
  categoriesPromise = wooFetch<WooCategory[]>({
    path: "products/categories",
    params: { per_page: 100, hide_empty: true },
  });
  categoriesExpires = now + CATALOG_TTL_MS;
  try {
    return await categoriesPromise;
  } catch (e) {
    categoriesPromise = null;
    categoriesExpires = 0;
    throw e;
  }
}

async function getVariationsFor(p: WooProduct): Promise<WooVariation[]> {
  if (p.type !== "variable" || !p.variations || p.variations.length === 0) return [];
  try {
    const res = await wooFetch<WooVariation[] | { error: string; fallback: true }>({
      path: `products/${p.id}/variations`,
      params: { per_page: 100 },
    });
    if (!Array.isArray(res)) return [];
    return res;
  } catch {
    return [];
  }
}

// ─── Listing catalog (NO variation fetches) ──────────────────────────────────
// Used by every list/grid path. Cards don't need variation-level data.

let listingCatalogPromise: Promise<ShopifyProductNode[]> | null = null;
let listingCatalogExpires = 0;

function buildListingCatalogSync(products: WooProduct[]): ShopifyProductNode[] {
  const { groups, others } = groupAcabamentoBundles(products);
  const adaptedOthers = others.map((p) => adaptProduct(p));
  const adaptedGroups = groups.map(adaptAcabamentoGroup);
  return [...adaptedGroups, ...adaptedOthers];
}

async function getListingCatalog(): Promise<ShopifyProductNode[]> {
  const now = Date.now();
  if (listingCatalogPromise && listingCatalogExpires > now) return listingCatalogPromise;
  listingCatalogPromise = (async () => {
    const raw = await getAllPublicProducts();
    return buildListingCatalogSync(raw);
  })();
  listingCatalogExpires = now + CATALOG_TTL_MS;
  try {
    return await listingCatalogPromise;
  } catch (e) {
    listingCatalogPromise = null;
    listingCatalogExpires = 0;
    throw e;
  }
}

// ─── Public API (mirrors shopify/queries.ts) ─────────────────────────────────

export async function fetchCollections(first = 20): Promise<ShopifyCollection[]> {
  const cats = await getAllCategories();
  return cats.slice(0, first).map(adaptCategory);
}

export async function fetchCollection(
  handle: string,
  first = 50,
): Promise<
  | (ShopifyCollection & { products: { edges: ShopifyProduct[] } })
  | null
> {
  const [cats, adapted] = await Promise.all([getAllCategories(), getListingCatalog()]);
  const cat = cats.find((c) => c.slug === handle);
  if (!cat) return null;

  const matching = adapted.filter((p) =>
    p.collections?.edges.some((e) => e.node.handle === handle),
  );
  return {
    ...adaptCategory(cat),
    products: {
      edges: matching.slice(0, first).map((node) => ({ node })),
    },
  };
}

/**
 * PDP path. Resolves the node via the cached listing catalog, then — only for
 * the single variable parent — fetches /variations to hydrate variant images.
 * Bundle groups and simple products skip the extra request entirely.
 */
export async function fetchProduct(handle: string): Promise<ShopifyProductNode | null> {
  const [raw, listing] = await Promise.all([getAllPublicProducts(), getListingCatalog()]);
  const node = listing.find((p) => p.handle === handle);
  if (!node) return null;

  // Bundle groups have id "gid://woo/bundle-group/..." — no variations to fetch.
  if (node.id.startsWith("gid://woo/bundle-group/")) return node;

  // Locate the underlying Woo product by slug to check if variable.
  const wooProduct = raw.find((p) => p.slug === handle);
  if (!wooProduct) return node;

  const isVariable =
    wooProduct.type === "variable" ||
    (Array.isArray(wooProduct.variations) && wooProduct.variations.length > 0);
  if (!isVariable) return node;

  const variations = await getVariationsFor(wooProduct);
  return adaptProduct(wooProduct, variations);
}

export async function fetchProducts(first = 50, query?: string): Promise<ShopifyProduct[]> {
  const adapted = await getListingCatalog();
  let list = adapted;
  if (query && query.trim().length > 0) {
    const q = query.toLowerCase();
    list = list.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        (p.tags ?? []).some((t) => t.toLowerCase().includes(q)),
    );
  }
  return list.slice(0, first).map((node) => ({ node }));
}

export async function fetchProductsByHandles(handles: string[]): Promise<ShopifyProductNode[]> {
  if (handles.length === 0) return [];
  const adapted = await getListingCatalog();
  const byHandle = new Map(adapted.map((p) => [p.handle, p]));
  return handles.map((h) => byHandle.get(h)).filter((p): p is ShopifyProductNode => !!p);
}

/** Mirrors shopify/queries.ts:isSeasonal exactly. */
export function isSeasonal(c: { handle: string; description?: string }) {
  return (
    c.handle.startsWith("colecao-") ||
    /sazonal|temporada|edicao|edição/i.test(c.description ?? "")
  );
}
