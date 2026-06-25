// Adapter: WooCommerce REST objects → Shopify-shaped types consumed by the app.
//
// Output shape MUST mirror src/lib/shopify/types.ts exactly so consumers can
// swap imports without rewriting components.

import type {
  ShopifyCollection,
  ShopifyImage,
  ShopifyMoney,
  ShopifyProductNode,
  ShopifyVariant,
} from "@/lib/catalog/types";
import {
  ACABAMENTO_ORDER,
  type AcabamentoGroup,
} from "./bundles";
import type {
  WooCategory,
  WooImage,
  WooProduct,
  WooVariation,
} from "./types";

const CURRENCY = "BRL";

function money(amount: string | number | undefined | null): ShopifyMoney {
  const value =
    amount === undefined || amount === null || amount === ""
      ? "0"
      : typeof amount === "number"
        ? String(amount)
        : amount;
  return { amount: value, currencyCode: CURRENCY };
}

function img(i: WooImage | null | undefined): ShopifyImage {
  return {
    url: i?.src ?? "",
    altText: i?.alt && i.alt.length > 0 ? i.alt : null,
  };
}

function getMetaString(p: WooProduct, key: string): string | null {
  const m = p.meta_data?.find((x) => x.key === key);
  if (!m || m.value === undefined || m.value === null) return null;
  return typeof m.value === "string" ? m.value : JSON.stringify(m.value);
}

// ─────────────────────────────────────────────────────────────────────────────
// Price resolution — Woo bundles return product.price = "0"; the real total
// lives in bundle_price.price.min.incl_tax. We also fall back to price_html
// (already locale-rendered by WP) for any future exotic type.

function parsePriceFromHtml(html?: string): number {
  if (!html) return 0;
  const text = html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ");
  const tokens = text.match(/[\d.,]+/g);
  if (!tokens) return 0;
  let best = 0;
  for (const tok of tokens) {
    let norm = tok;
    // BR "4.235,00" -> comma is decimal sep (last comma after last dot)
    if (tok.includes(",") && tok.lastIndexOf(",") > tok.lastIndexOf(".")) {
      norm = tok.replace(/\./g, "").replace(",", ".");
    } else {
      // US "4,235.00" or plain "4235"
      norm = tok.replace(/,/g, "");
    }
    const n = parseFloat(norm);
    if (!Number.isNaN(n) && n > best) best = n;
  }
  return best;
}

export function resolveWooPrice(p: WooProduct): string {
  // 1) raw price, only if numerically > 0 ("0" string is truthy in JS)
  const direct = parseFloat(p.price ?? "");
  if (!Number.isNaN(direct) && direct > 0) return String(direct);
  // 2) bundle_price.price.min.incl_tax (fallback excl_tax)
  const bp =
    p.bundle_price?.price?.min?.incl_tax ??
    p.bundle_price?.price?.min?.excl_tax;
  const bpNum = parseFloat(bp ?? "");
  if (!Number.isNaN(bpNum) && bpNum > 0) return String(bpNum);
  // 3) parse price_html (locale-rendered fallback)
  const fromHtml = parsePriceFromHtml(p.price_html);
  if (fromHtml > 0) return String(fromHtml);
  // 4) give up
  return "0";
}

// TODO: compareAtPrice — Woo bundles expose bundle_price.regular_price.min.incl_tax.
// Surface only when regular > price (real discount). ShopifyVariant has no
// compareAtPrice field today; omit until the type is extended.

// ─────────────────────────────────────────────────────────────────────────────
// Categories → Collections

export function adaptCategory(c: WooCategory): ShopifyCollection {
  return {
    id: `gid://woo/category/${c.id}`,
    handle: c.slug,
    title: c.name,
    description: c.description ?? "",
    image: c.image ? img(c.image) : null,
    productsCount: c.count,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Single (non-bundle) product → ShopifyProductNode

function buildOptions(p: WooProduct): Array<{ name: string; values: string[] }> {
  return (p.attributes ?? [])
    .filter((a) => a.variation === true && Array.isArray(a.options))
    .map((a) => ({ name: a.name, values: a.options ?? [] }));
}

function buildVariantsFromVariations(
  p: WooProduct,
  variations: WooVariation[],
): { edges: Array<{ node: ShopifyVariant }> } {
  // Map attribute display name → slug (e.g. "Acabamento" → "pa_acabamento")
  // when the parent product carries it. Falls back to the display name, which
  // the Store API also accepts.
  const slugByName = new Map<string, string>();
  for (const a of p.attributes ?? []) {
    if (a.name && a.slug) slugByName.set(a.name, a.slug);
  }
  const edges = variations.map((v) => ({
    node: {
      id: `gid://woo/variation/${v.id}`,
      title: (v.attributes ?? []).map((a) => a.option).filter(Boolean).join(" / ") || p.name,
      sku: v.sku ?? null,
      availableForSale: v.stock_status === "instock",
      price: money(v.price),
      selectedOptions: (v.attributes ?? []).map((a) => ({
        name: a.name,
        value: a.option ?? "",
      })),
      image: v.image ? img(v.image) : null,
      wooParentProductId: p.id,
      wooVariationId: v.id,
      wooKind: "variation",
      wooAttributes: (v.attributes ?? []).map((a) => ({
        slug: slugByName.get(a.name) ?? a.name,
        value: a.option ?? "",
      })),
    } satisfies ShopifyVariant,
  }));
  return { edges };
}

function buildSyntheticSimpleVariant(p: WooProduct): { edges: Array<{ node: ShopifyVariant }> } {
  return {
    edges: [
      {
        node: {
          id: `gid://woo/product/${p.id}`,
          title: p.name,
          sku: p.sku ?? null,
          availableForSale: p.stock_status === "instock",
          price: money(resolveWooPrice(p)),
          selectedOptions: [],
          image: p.images?.[0] ? img(p.images[0]) : null,
          wooParentProductId: p.id,
          wooVariationId: null,
          wooKind: "simple",
          wooAttributes: [],
        },
      },
    ],
  };
}

/**
 * Adapt a single Woo product (not part of an acabamento bundle group).
 * If the product is `variable`, pass its loaded variations; otherwise a
 * synthetic single variant is generated from the product itself.
 */
export function adaptProduct(
  p: WooProduct,
  variations?: WooVariation[],
): ShopifyProductNode {
  const isVariable = p.type === "variable" || (Array.isArray(p.variations) && p.variations.length > 0);
  const variants =
    isVariable && variations && variations.length > 0
      ? buildVariantsFromVariations(p, variations)
      : buildSyntheticSimpleVariant(p);

  const modelo3dValue = getMetaString(p, "modelo_3d_url");

  // Merge variation images into images.edges (dedup by URL) so the gallery
  // can find the active variant.image and swap the main photo on selection.
  const baseImages = (p.images ?? []).map(img);
  const seen = new Set<string>(baseImages.map((i) => i.url).filter(Boolean));
  const mergedImages = [...baseImages];
  if (variations && variations.length > 0) {
    for (const v of variations) {
      if (!v.image) continue;
      const vi = img(v.image);
      if (!vi.url || seen.has(vi.url)) continue;
      seen.add(vi.url);
      mergedImages.push(vi);
    }
  }

  return {
    id: `gid://woo/product/${p.id}`,
    handle: p.slug,
    title: p.name,
    description: stripHtml(p.short_description || p.description || ""),
    descriptionHtml: p.description ?? "",
    vendor: undefined,
    productType: p.categories?.[0]?.name,
    tags: (p.tags ?? []).map((t) => t.name),
    priceRange: { minVariantPrice: money(resolveWooPrice(p)) },
    images: { edges: mergedImages.map((node) => ({ node })) },
    variants,
    options: buildOptions(p),
    collections: {
      edges: (p.categories ?? []).map((c) => ({
        node: { handle: c.slug, title: c.name },
      })),
    },
    modelo3d: modelo3dValue
      ? { key: "modelo_3d_url", value: modelo3dValue, namespace: "custom" }
      : null,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Acabamento bundle group → 1 virtual ShopifyProductNode

export function adaptAcabamentoGroup(group: AcabamentoGroup): ShopifyProductNode {
  // Canonical product: Quartzo if present, else first.
  const canonical =
    group.members.find((m) => m.acabamento === "Quartzo")?.product ??
    group.members[0]!.product;

  const minPrice = group.members
    .map((m) => parseFloat(resolveWooPrice(m.product)) || 0)
    .filter((n) => n > 0)
    .reduce((min, n) => (min === 0 || n < min ? n : min), 0);

  // Tags / categories: union across members (slug-uniq).
  const tagSet = new Set<string>();
  for (const m of group.members) for (const t of m.product.tags ?? []) tagSet.add(t.name);

  const collMap = new Map<string, { handle: string; title: string }>();
  for (const m of group.members) {
    for (const c of m.product.categories ?? []) {
      if (!collMap.has(c.slug)) collMap.set(c.slug, { handle: c.slug, title: c.name });
    }
  }

  // Options: single "Acabamento" with the values present in the group, in canonical order.
  const acabamentoValues = ACABAMENTO_ORDER.filter((name) =>
    group.members.some((m) => m.acabamento === name),
  );

  const variantEdges = group.members.map((m) => {
    const node: ShopifyVariant = {
      id: `gid://woo/bundle/${m.product.id}`,
      title: m.acabamento,
      sku: m.product.sku ?? null,
      availableForSale: m.product.stock_status === "instock",
      price: money(resolveWooPrice(m.product)),
      selectedOptions: [{ name: "Acabamento", value: m.acabamento }],
      image: m.product.images?.[0] ? img(m.product.images[0]) : null,
      wooParentProductId: m.product.id,
      wooVariationId: null,
      wooKind: "bundle",
      wooAttributes: [],
    };
    return { node };
  });

  // Canonical title: strip trailing " - <Acabamento>" or " <Acabamento>" if present.
  const cleanTitle = canonical.name
    .replace(/\s*[-–]\s*(quartzo|arenito|moledo|granito)\s*$/i, "")
    .replace(/\s+(quartzo|arenito|moledo|granito)\s*$/i, "")
    .trim();

  const modelo3dValue = getMetaString(canonical, "modelo_3d_url");

  return {
    id: `gid://woo/bundle-group/${group.prefix}`,
    handle: group.canonicalSlug,
    title: cleanTitle || canonical.name,
    description: stripHtml(canonical.short_description || canonical.description || ""),
    descriptionHtml: canonical.description ?? "",
    productType: canonical.categories?.[0]?.name,
    tags: Array.from(tagSet),
    priceRange: { minVariantPrice: money(String(minPrice || resolveWooPrice(canonical))) },
    images: { edges: (canonical.images ?? []).map((i) => ({ node: img(i) })) },
    variants: { edges: variantEdges },
    options: [{ name: "Acabamento", values: acabamentoValues }],
    collections: { edges: Array.from(collMap.values()).map((node) => ({ node })) },
    modelo3d: modelo3dValue
      ? { key: "modelo_3d_url", value: modelo3dValue, namespace: "custom" }
      : null,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}
