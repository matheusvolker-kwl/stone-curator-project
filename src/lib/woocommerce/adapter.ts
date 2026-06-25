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
} from "@/lib/shopify/types";
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
          price: money(p.price),
          selectedOptions: [],
          image: p.images?.[0] ? img(p.images[0]) : null,
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

  return {
    id: `gid://woo/product/${p.id}`,
    handle: p.slug,
    title: p.name,
    description: stripHtml(p.short_description || p.description || ""),
    descriptionHtml: p.description ?? "",
    vendor: undefined,
    productType: p.categories?.[0]?.name,
    tags: (p.tags ?? []).map((t) => t.name),
    priceRange: { minVariantPrice: money(p.price) },
    images: { edges: (p.images ?? []).map((i) => ({ node: img(i) })) },
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
    .map((m) => parseFloat(m.product.price) || 0)
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
      price: money(m.product.price),
      selectedOptions: [{ name: "Acabamento", value: m.acabamento }],
      image: m.product.images?.[0] ? img(m.product.images[0]) : null,
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
    priceRange: { minVariantPrice: money(minPrice || canonical.price) },
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
