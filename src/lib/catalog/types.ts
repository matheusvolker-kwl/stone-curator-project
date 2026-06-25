// Catalog types — aliases over the existing Shopify-shaped types.
//
// Phase 1 of the WooCommerce migration: keeps two paths type-compatible.
// On Phase 2 cleanup we will invert: the real definitions move here and the
// Shopify path is deleted.
//
// New consumers should import from "@/lib/catalog/types".

export type {
  ShopifyImage as CatalogImage,
  ShopifyMoney as CatalogMoney,
  ShopifyVariant as CatalogVariant,
  ShopifyMetafield as CatalogMetafield,
  ShopifyProductNode as CatalogProductNode,
  ShopifyProduct as CatalogProduct,
  ShopifyCollection as CatalogCollection,
} from "@/lib/shopify/types";
