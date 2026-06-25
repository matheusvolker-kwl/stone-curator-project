// Image helpers — re-export. cdnImg/cdnSrcSet currently only rewrite Shopify
// CDN URLs; for WooCommerce/Jetpack URLs they pass through unchanged, which is
// the desired behavior for now (no width hinting needed).
export { cdnImg, cdnSrcSet } from "@/lib/shopify/client";
