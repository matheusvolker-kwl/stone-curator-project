// Public WooCommerce storefront URL — used by the Store API checkout flow.
// Override with VITE_WOO_STORE_URL if the production domain changes.

export const WOO_STORE_URL =
  (import.meta.env.VITE_WOO_STORE_URL as string | undefined) ??
  "https://checkout.westernstore.com.br";

export const WOO_STORE_ORIGIN = WOO_STORE_URL.replace(/\/+$/, "");
