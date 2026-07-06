// Catalog client utilities — currency formatting + image URL helpers.
// Source-agnostic: handles WooCommerce (Jetpack Photon) and legacy Shopify CDN URLs.

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
 * Parseia entrada monetária no formato brasileiro.
 * Aceita: number direto, "R$ 1.500,00", "1.500,00", "1500,50", "1500.50", "1500".
 * Retorna NaN se vazio/inválido.
 */
export function parseBRL(input: string | number): number {
  if (typeof input === "number") return input;
  if (input == null) return NaN;
  let s = String(input).trim();
  if (!s) return NaN;
  // remove símbolos monetários e espaços
  s = s.replace(/[R$\s\u00a0]/gi, "");
  // mantém apenas dígitos, "." e ","
  s = s.replace(/[^\d.,-]/g, "");
  if (!s) return NaN;
  if (s.includes(",")) {
    // formato BR: "." é separador de milhar, "," é decimal
    s = s.replace(/\./g, "").replace(",", ".");
  }
  // se não tem "," mas tem ".", trata "." como decimal (já pronto)
  const n = Number(s);
  return Number.isFinite(n) ? n : NaN;
}

function isWooImage(url: string): boolean {
  return /checkout\.westernstore\.com\.br|\/wp-content\/uploads\//.test(url);
}

/**
 * Image URL helper. Rewrites Shopify CDN URLs (legacy) and Woo/Jetpack URLs
 * with width hints. Jetpack Photon returns WebP automatically when the browser
 * sends `Accept: image/webp`, and `?w=` preserves PNG transparency.
 */
export function cdnImg(url: string | undefined | null, width = 800): string {
  if (!url) return "";
  if (url.includes("cdn.shopify.com")) {
    const sep = url.includes("?") ? "&" : "?";
    return `${url}${sep}width=${width}&format=webp`;
  }
  if (isWooImage(url)) {
    const sep = url.includes("?") ? "&" : "?";
    return `${url}${sep}w=${width}&quality=82&strip=all`;
  }
  return url;
}

export function cdnSrcSet(url: string | undefined | null, widths: number[] = [400, 800, 1200]): string {
  if (!url) return "";
  if (url.includes("cdn.shopify.com") || isWooImage(url)) {
    return widths.map((w) => `${cdnImg(url, w)} ${w}w`).join(", ");
  }
  return url;
}
