// Single switch point for the data source. Reads VITE_DATA_SOURCE at build
// time. Default: shopify (production unchanged). Set to "woo" to read from
// the WooCommerce layer instead. Reversal is just changing the env + rebuild.

import * as shopify from "@/lib/shopify/queries";
import * as woo from "@/lib/woocommerce/queries";

const source =
  (import.meta.env.VITE_DATA_SOURCE as string | undefined) === "woo" ? woo : shopify;

export const fetchCollections = source.fetchCollections;
export const fetchCollection = source.fetchCollection;
export const fetchProduct = source.fetchProduct;
export const fetchProducts = source.fetchProducts;
export const fetchProductsByHandles = source.fetchProductsByHandles;
export const isSeasonal = source.isSeasonal;
