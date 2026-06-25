// Single switch point for the data source. WooCommerce is the only source.
export {
  fetchCollections,
  fetchCollection,
  fetchProduct,
  fetchProducts,
  fetchProductsByHandles,
  isSeasonal,
} from "@/lib/woocommerce/queries";
