// Catalog client utilities — currency formatting + image URL helpers.
// Source-agnostic: works with WooCommerce/Jetpack URLs (passthrough) and
// historically with Shopify CDN URLs.

export const STORE_PUBLIC_URL = "https://westernstore.com.br";

export function formatBRL(amount: string | number, currency = "BRL") {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (Number.isNaN(num)) return "—";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(num);
}

/**
 * Image URL helper. For legacy Shopify CDN URLs, injects width/format hints;
 * for everything else (Woo/Jetpack) returns the URL unchanged — Woo already
 * serves appropriately sized images.
 */
export function cdnImg(url: string | undefined | null, width = 800): string {
  if (!url) return "";
  if (!url.includes("cdn.shopify.com")) return url;
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}width=${width}&format=webp`;
}

export function cdnSrcSet(url: string | undefined | null, widths: number[] = [400, 800, 1200]): string {
  if (!url) return "";
  if (!url.includes("cdn.shopify.com")) return url;
  return widths.map((w) => `${cdnImg(url, w)} ${w}w`).join(", ");
}
