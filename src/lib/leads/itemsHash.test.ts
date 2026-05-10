import { describe, it, expect } from "vitest";
import { computeItemsHash } from "./itemsHash";
import type { CartItem } from "@/stores/cartStore";

const item = (variantId: string, quantity: number, amount: string): CartItem =>
  ({
    variantId,
    quantity,
    price: { amount, currencyCode: "BRL" },
    productHandle: "h",
    productTitle: "t",
    variantTitle: "v",
    selectedOptions: [],
    productImage: null,
  }) as unknown as CartItem;

describe("computeItemsHash", () => {
  it("igual para mesmos itens em ordem diferente", async () => {
    const a = await computeItemsHash([item("v1", 2, "10.00"), item("v2", 1, "20.00")]);
    const b = await computeItemsHash([item("v2", 1, "20.00"), item("v1", 2, "10.00")]);
    expect(a).toBe(b);
  });

  it("diferente quando muda quantidade", async () => {
    const a = await computeItemsHash([item("v1", 2, "10.00")]);
    const b = await computeItemsHash([item("v1", 3, "10.00")]);
    expect(a).not.toBe(b);
  });

  it("diferente quando muda variante", async () => {
    const a = await computeItemsHash([item("v1", 1, "10.00")]);
    const b = await computeItemsHash([item("v2", 1, "10.00")]);
    expect(a).not.toBe(b);
  });

  it("diferente quando muda preço", async () => {
    const a = await computeItemsHash([item("v1", 1, "10.00")]);
    const b = await computeItemsHash([item("v1", 1, "11.00")]);
    expect(a).not.toBe(b);
  });

  it("hash hex de 64 caracteres (sha256)", async () => {
    const h = await computeItemsHash([item("v1", 1, "10.00")]);
    expect(h).toMatch(/^[0-9a-f]{64}$/);
  });
});
