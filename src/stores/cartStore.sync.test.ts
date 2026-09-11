import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { CartItem } from "./cartStore";

vi.mock("sonner", () => {
  const toast = Object.assign(vi.fn(), { success: vi.fn(), error: vi.fn() });
  return { toast };
});

const CHAVE = "western-cart";

function linha(titulo: string, qtd = 1): CartItem {
  return {
    productHandle: titulo.toLowerCase().replace(/\s+/g, "-"),
    productTitle: titulo,
    productImage: null,
    variantId: "var:" + titulo,
    variantTitle: "Granito",
    price: { amount: "100", currencyCode: "BRL" } as CartItem["price"],
    quantity: qtd,
    selectedOptions: [{ name: "Acabamento", value: "Granito" }],
    wooParentProductId: 1,
  };
}

/** O que OUTRA aba grava: o formato do zustand persist. */
function gravarComoOutraAba(itens: CartItem[]) {
  localStorage.setItem(CHAVE, JSON.stringify({ state: { items: itens }, version: 2 }));
}

function nomesGravados(): string[] {
  const bruto = localStorage.getItem(CHAVE);
  return bruto ? JSON.parse(bruto).state.items.map((i: CartItem) => i.productTitle) : [];
}

describe("carrinho — sincronia entre abas", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.resetModules();
  });
  afterEach(() => vi.restoreAllMocks());

  it("uma aba antiga NÃO apaga o que outra aba adicionou (o bug de 11/09/2026)", async () => {
    const { useCartStore } = await import("./cartStore");
    useCartStore.getState().addItem(linha("Pedra Grande 1"), { silent: true });

    // Outra aba, que também tinha a PG1, adiciona 3 PG3 e grava.
    gravarComoOutraAba([linha("Pedra Grande 1"), linha("Pedra Grande 3", 3)]);
    window.dispatchEvent(new StorageEvent("storage", { key: CHAVE }));
    await vi.waitFor(() => expect(useCartStore.getState().items).toHaveLength(2));

    // A aba antiga adiciona a PG4. Antes da correção, isto regravava [PG1, PG4]
    // e a PG3 da outra aba sumia.
    useCartStore.getState().addItem(linha("Pedra Grande 4", 3), { silent: true });
    expect(nomesGravados()).toEqual(["Pedra Grande 1", "Pedra Grande 3", "Pedra Grande 4"]);
  });

  it("recarrega quando a aba volta a ficar visível", async () => {
    const { useCartStore } = await import("./cartStore");
    gravarComoOutraAba([linha("Pedra Média 7", 4)]);
    Object.defineProperty(document, "visibilityState", { value: "visible", configurable: true });
    document.dispatchEvent(new Event("visibilitychange"));
    await vi.waitFor(() =>
      expect(useCartStore.getState().items.map((i) => i.productTitle)).toEqual(["Pedra Média 7"]),
    );
  });

  it("não quebra e avisa quando o navegador recusa gravar", async () => {
    const { toast } = await import("sonner");
    const { useCartStore } = await import("./cartStore");
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("cota cheia", "QuotaExceededError");
    });
    expect(() =>
      useCartStore.getState().addItem(linha("Pedra Pequena 4", 6), { silent: true }),
    ).not.toThrow();
    expect(toast.error).toHaveBeenCalled();
  });
});
