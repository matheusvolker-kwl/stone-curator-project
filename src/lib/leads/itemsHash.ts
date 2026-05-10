import type { CartItem } from "@/stores/cartStore";

/**
 * Hash determinístico da composição para dedup de orçamentos.
 * Mesmos itens (variant + qty + preço unit) → mesmo hash.
 */
export async function computeItemsHash(items: CartItem[]): Promise<string> {
  const normalized = items
    .map((i) => `${i.variantId}:${i.quantity}:${i.price.amount}`)
    .sort()
    .join("|");
  const buf = new TextEncoder().encode(normalized);
  const digest = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
