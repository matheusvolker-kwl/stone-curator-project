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

// ─── Cache (memory + persistent localStorage SWR) ────────────────────────────
const CATALOG_TTL_MS = 60_000;
const PERSIST_TTL_MS = 10 * 60_000; // 10 min
const PERSIST_KEY = "western-catalog-v1";
const PERSIST_CATS_KEY = "western-categories-v1";

function readPersist<T>(key: string, ttlMs: number): { data: T; fresh: boolean } | null {
  try {
    if (typeof localStorage === "undefined") return null;
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { t: number; d: T };
    if (!parsed || typeof parsed.t !== "number") return null;
    const age = Date.now() - parsed.t;
    // Return even if stale — SWR pattern. Drop if extremely old (>24h).
    if (age > 24 * 60 * 60_000) return null;
    return { data: parsed.d, fresh: age < ttlMs };
  } catch {
    return null;
  }
}

function writePersist<T>(key: string, data: T) {
  try {
    if (typeof localStorage === "undefined") return;
    localStorage.setItem(key, JSON.stringify({ t: Date.now(), d: data }));
  } catch {
    /* quota / private mode — ignore */
  }
}

export function clearCatalogCache() {
  try {
    localStorage.removeItem(PERSIST_KEY);
    localStorage.removeItem(PERSIST_CATS_KEY);
  } catch {
    /* ignore */
  }
  catalogPromise = null;
  catalogExpires = 0;
  categoriesPromise = null;
  categoriesExpires = 0;
  listingCatalogMemory = null;
  listingCatalogPromise = null;
  listingCatalogExpires = 0;
}

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
  const cached = readPersist<WooCategory[]>(PERSIST_CATS_KEY, PERSIST_TTL_MS);
  categoriesPromise = (async () => {
    const res = await wooFetch<WooCategory[]>({
      path: "products/categories",
      params: { per_page: 100, hide_empty: true },
    });
    writePersist(PERSIST_CATS_KEY, res);
    return res;
  })();
  categoriesExpires = now + CATALOG_TTL_MS;
  categoriesPromise.catch(() => {
    categoriesPromise = null;
    categoriesExpires = 0;
  });
  if (cached) {
    // SWR: return cached immediately, revalidate in background.
    return cached.data;
  }
  return categoriesPromise;
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

let listingCatalogMemory: ShopifyProductNode[] | null = null;
let listingCatalogPromise: Promise<ShopifyProductNode[]> | null = null;
let listingCatalogExpires = 0;

function buildListingCatalogSync(products: WooProduct[]): ShopifyProductNode[] {
  const { groups, others } = groupAcabamentoBundles(products);
  const adaptedOthers = others.map((p) => adaptProduct(p));
  const adaptedGroups = groups.map(adaptAcabamentoGroup);
  return [...adaptedGroups, ...adaptedOthers];
}

function revalidateListingCatalog(): Promise<ShopifyProductNode[]> {
  const p = (async () => {
    const raw = await getAllPublicProducts();
    const adapted = buildListingCatalogSync(raw);
    listingCatalogMemory = adapted;
    writePersist(PERSIST_KEY, adapted);
    return adapted;
  })();
  listingCatalogPromise = p;
  listingCatalogExpires = Date.now() + CATALOG_TTL_MS;
  p.catch(() => {
    listingCatalogPromise = null;
    listingCatalogExpires = 0;
  });
  return p;
}

async function getListingCatalog(): Promise<ShopifyProductNode[]> {
  const now = Date.now();
  if (listingCatalogMemory && listingCatalogExpires > now) return listingCatalogMemory;
  if (listingCatalogPromise && listingCatalogExpires > now) return listingCatalogPromise;

  // Try persistent cache first (SWR).
  const cached = readPersist<ShopifyProductNode[]>(PERSIST_KEY, PERSIST_TTL_MS);
  if (cached) {
    listingCatalogMemory = cached.data;
    listingCatalogExpires = now + CATALOG_TTL_MS;
    // If stale, revalidate in background.
    if (!cached.fresh) revalidateListingCatalog().catch(() => {});
    return cached.data;
  }
  // No cache — must block on network.
  return revalidateListingCatalog();
}

function hasCachedListing(): boolean {
  if (listingCatalogMemory) return true;
  const cached = readPersist<ShopifyProductNode[]>(PERSIST_KEY, PERSIST_TTL_MS);
  return !!cached;
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
  // Fast path: catalog already cached (memory or localStorage).
  if (hasCachedListing()) {
    const [raw, listing] = await Promise.all([getAllPublicProducts(), getListingCatalog()]);
    const node = listing.find((p) => p.handle === handle);
    if (!node) return null;
    if (node.id.startsWith("gid://woo/bundle-group/")) return node;
    const wooProduct = raw.find((p) => p.slug === handle);
    if (!wooProduct) return node;
    const isVariable =
      wooProduct.type === "variable" ||
      (Array.isArray(wooProduct.variations) && wooProduct.variations.length > 0);
    if (!isVariable) return node;
    const variations = await getVariationsFor(wooProduct);
    return adaptProduct(wooProduct, variations);
  }

  // Cold path: skip 1.4MB catalog. Fetch just this product by slug.
  try {
    const bySlug = await wooFetch<WooProduct[]>({
      path: "products",
      params: { slug: handle, status: "publish", per_page: 1 },
    });
    const filtered = filterPublicCatalog(bySlug ?? []);
    const wooProduct = filtered[0];
    if (wooProduct) {
      // Kick off full catalog warm in background so subsequent nav is instant.
      getListingCatalog().catch(() => {});
      const isVariable =
        wooProduct.type === "variable" ||
        (Array.isArray(wooProduct.variations) && wooProduct.variations.length > 0);
      const variations = isVariable ? await getVariationsFor(wooProduct) : [];
      return adaptProduct(wooProduct, variations);
    }
  } catch {
    /* fall through to full catalog */
  }

  // Fallback: original behavior.
  const [raw, listing] = await Promise.all([getAllPublicProducts(), getListingCatalog()]);
  const node = listing.find((p) => p.handle === handle);
  if (!node) return null;
  if (node.id.startsWith("gid://woo/bundle-group/")) return node;
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
