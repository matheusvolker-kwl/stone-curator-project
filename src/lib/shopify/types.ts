// Shopify Storefront API types — minimal subset for Western Pools storefront

export interface ShopifyImage {
  url: string;
  altText: string | null;
  width?: number;
  height?: number;
}

export interface ShopifyMoney {
  amount: string;
  currencyCode: string;
}

/**
 * Variant shape consumed by the app. Originally Shopify-only; now carries
 * optional WooCommerce metadata used by the Store API checkout (cartStore +
 * woo-checkout). Optional so the Shopify path stays type-compatible.
 */
export interface ShopifyVariant {
  id: string;
  title: string;
  sku?: string | null;
  availableForSale: boolean;
  price: ShopifyMoney;
  selectedOptions: Array<{ name: string; value: string }>;
  image?: ShopifyImage | null;
  /** WooCommerce parent product id (numeric, as in REST). */
  wooParentProductId?: number;
  /** WooCommerce variation id (numeric). Null for simple/bundle products. */
  wooVariationId?: number | null;
  /** Kind hint for the Store API add-item payload. */
  wooKind?: "simple" | "variation" | "bundle";
  /** Attributes for variable products, slugified (e.g. pa_acabamento=quartzo). */
  wooAttributes?: Array<{ slug: string; value: string }>;
}

export interface ShopifyMetafield {
  key: string;
  value: string;
  namespace?: string;
}

export interface ShopifyProductNode {
  id: string;
  handle: string;
  title: string;
  description: string;
  descriptionHtml?: string;
  vendor?: string;
  productType?: string;
  tags?: string[];
  priceRange: {
    minVariantPrice: ShopifyMoney;
  };
  images: { edges: Array<{ node: ShopifyImage }> };
  variants: { edges: Array<{ node: ShopifyVariant }> };
  options: Array<{ name: string; values: string[] }>;
  collections?: { edges: Array<{ node: { handle: string; title: string } }> };
  modelo3d?: ShopifyMetafield | null;
}

export interface ShopifyProduct {
  node: ShopifyProductNode;
}

export interface ShopifyCollection {
  id: string;
  handle: string;
  title: string;
  description: string;
  image: ShopifyImage | null;
  productsCount?: number;
}
