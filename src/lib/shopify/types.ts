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

export interface ShopifyVariant {
  id: string;
  title: string;
  sku?: string | null;
  availableForSale: boolean;
  weight?: number | null;
  weightUnit?: string | null;
  price: ShopifyMoney;
  selectedOptions: Array<{ name: string; value: string }>;
  image?: ShopifyImage | null;
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
  pesoKg?: ShopifyMetafield | null;
  comprimentoCm?: ShopifyMetafield | null;
  larguraCm?: ShopifyMetafield | null;
  alturaCm?: ShopifyMetafield | null;
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
