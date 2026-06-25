// Catalog types — source-agnostic product/collection shapes.
// Historically Shopify-shaped; kept stable as the WooCommerce adapter maps
// into this same structure. Legacy `Shopify*` names are exported as aliases
// for back-compat with code that hasn't been renamed.

export interface CatalogImage {
  url: string;
  altText: string | null;
  width?: number;
  height?: number;
}

export interface CatalogMoney {
  amount: string;
  currencyCode: string;
}

/**
 * Variant shape consumed by the app. Carries optional WooCommerce metadata
 * used by the Store API checkout (cartStore + woo-checkout).
 */
export interface CatalogVariant {
  id: string;
  title: string;
  sku?: string | null;
  availableForSale: boolean;
  price: CatalogMoney;
  selectedOptions: Array<{ name: string; value: string }>;
  image?: CatalogImage | null;
  /** WooCommerce parent product id (numeric, as in REST). */
  wooParentProductId?: number;
  /** WooCommerce variation id (numeric). Null for simple/bundle products. */
  wooVariationId?: number | null;
  /** Kind hint for the Store API add-item payload. */
  wooKind?: "simple" | "variation" | "bundle";
  /** Attributes for variable products, slugified (e.g. pa_acabamento=quartzo). */
  wooAttributes?: Array<{ slug: string; value: string }>;
}

export interface CatalogMetafield {
  key: string;
  value: string;
  namespace?: string;
}

export interface CatalogProductNode {
  id: string;
  handle: string;
  title: string;
  description: string;
  descriptionHtml?: string;
  vendor?: string;
  productType?: string;
  tags?: string[];
  priceRange: {
    minVariantPrice: CatalogMoney;
  };
  images: { edges: Array<{ node: CatalogImage }> };
  variants: { edges: Array<{ node: CatalogVariant }> };
  options: Array<{ name: string; values: string[] }>;
  collections?: { edges: Array<{ node: { handle: string; title: string } }> };
  modelo3d?: CatalogMetafield | null;
}

export interface CatalogProduct {
  node: CatalogProductNode;
}

export interface CatalogCollection {
  id: string;
  handle: string;
  title: string;
  description: string;
  image: CatalogImage | null;
  productsCount?: number;
}

// Back-compat aliases — code still importing Shopify* names keeps working.
export type ShopifyImage = CatalogImage;
export type ShopifyMoney = CatalogMoney;
export type ShopifyVariant = CatalogVariant;
export type ShopifyMetafield = CatalogMetafield;
export type ShopifyProductNode = CatalogProductNode;
export type ShopifyProduct = CatalogProduct;
export type ShopifyCollection = CatalogCollection;
