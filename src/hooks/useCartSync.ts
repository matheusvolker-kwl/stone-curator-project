// No-op: legacy hook from the Shopify Storefront cart era. Cart is now
// entirely local until checkout, so there's nothing to sync. Kept as a stub
// so existing imports don't break — remove on Phase 2 cleanup.
export function useCartSync() {
  /* intentionally empty */
}
