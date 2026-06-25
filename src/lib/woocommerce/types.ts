// Raw WooCommerce REST API types — minimal subset used by the adapter.
// Reference: https://woocommerce.github.io/woocommerce-rest-api-docs/

export interface WooImage {
  id: number;
  src: string;
  name?: string;
  alt?: string;
}

export interface WooMetaData {
  id?: number;
  key: string;
  value: unknown;
}

export interface WooAttribute {
  id: number;
  name: string;
  slug?: string;
  position?: number;
  visible?: boolean;
  variation?: boolean;
  options?: string[];
  /** Present on variation objects (single value, not options[]) */
  option?: string;
}

export interface WooCategoryRef {
  id: number;
  name: string;
  slug: string;
}

export interface WooTagRef {
  id: number;
  name: string;
  slug: string;
}

export type WooStockStatus = "instock" | "outofstock" | "onbackorder";
export type WooProductType =
  | "simple"
  | "variable"
  | "grouped"
  | "external"
  | "bundle"
  | string;
export type WooStatus = "publish" | "draft" | "pending" | "private" | string;
export type WooCatalogVisibility = "visible" | "catalog" | "search" | "hidden";

export interface WooProduct {
  id: number;
  name: string;
  slug: string;
  permalink?: string;
  type: WooProductType;
  status: WooStatus;
  catalog_visibility: WooCatalogVisibility;
  description: string;
  short_description: string;
  sku: string;
  price: string;
  regular_price?: string;
  sale_price?: string;
  price_html?: string;
  stock_status: WooStockStatus;
  images: WooImage[];
  categories: WooCategoryRef[];
  tags: WooTagRef[];
  attributes: WooAttribute[];
  default_attributes?: Array<{ id?: number; name: string; option: string }>;
  variations?: number[];
  meta_data: WooMetaData[];
  // Bundle-specific fields (WooCommerce Product Bundles plugin)
  bundle_price?: {
    price?: {
      min?: { incl_tax?: string; excl_tax?: string };
      max?: { incl_tax?: string; excl_tax?: string };
    };
    regular_price?: {
      min?: { incl_tax?: string; excl_tax?: string };
      max?: { incl_tax?: string; excl_tax?: string };
    };
  };
  bundled_items?: Array<{ product_id: number; quantity_default?: number }>;
}

export interface WooVariation {
  id: number;
  sku: string;
  price: string;
  stock_status: WooStockStatus;
  attributes: WooAttribute[];
  image?: WooImage | null;
}

export interface WooCategory {
  id: number;
  name: string;
  slug: string;
  description: string;
  image?: WooImage | null;
  count?: number;
}
