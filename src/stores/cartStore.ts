// Cart store — estado 100% local (Zustand + persist).
//
// Phase 1 da migração Woo: o checkout não roteia mais pela Shopify Storefront
// API. addItem/updateQuantity/removeItem mexem só no array — não há sync com
// nenhum carrinho remoto. A sessão Woo só é criada quando o cliente clica
// "Finalizar compra" (via buildWooCheckoutSession em src/lib/woo-checkout.ts).
//
// CartItem carrega metadados Woo (parent id, variation id, kind, atributos)
// que vêm do adapter — necessários para a Store API montar variações e bundles
// corretamente.

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { toast } from "sonner";
import type { ShopifyMoney, ShopifyProductNode } from "@/lib/catalog/types";


export interface CartItem {
  productHandle: string;
  productTitle: string;
  productImage: string | null;
  variantId: string;
  variantTitle: string;
  sku?: string | null;
  pesoKg?: number;
  price: ShopifyMoney;
  quantity: number;
  selectedOptions: Array<{ name: string; value: string }>;
  // ── WooCommerce metadata (carregado pelo adapter; usado no checkout) ──
  wooParentProductId?: number;
  wooVariationId?: number | null;
  wooKind?: "simple" | "variation" | "bundle";
  wooAttributes?: Array<{ slug: string; value: string }>;
  /**
   * Configuração dos itens embrulhados quando o bundle tem base VARIÁVEL
   * (kits "Leve 3"). Vira o campo `bundle_config` da linha do handoff.
   */
  wooBundleConfig?: Array<{
    bundled_item_id: number;
    quantity: number;
    variation_id: number | null;
    attributes: Array<{ slug: string; value: string }>;
  }>;
  /** Handle do conjunto/guia, quando o item veio de uma composição. */
  conjuntoRef?: string;
  /** Handle da 1ª coleção/categoria do produto — usado para cross-sell inteligente. */
  collectionHandle?: string;
}

interface CartStore {
  items: CartItem[];
  isLoading: boolean;
  /**
   * opts.silent: só pulsa o badge, sem toast (para adições em lote — ex.:
   * "adicionar todos os favoritos" — que emitem um único toast-resumo).
   */
  addItem: (item: CartItem, opts?: { silent?: boolean }) => void;
  /** opts.label/description: toast rico (ex.: nome do conjunto), no lugar do
   *  genérico — assim o chamador não precisa disparar um segundo toast. */
  addBundle: (
    items: CartItem[],
    opts?: { label?: string; description?: string; silent?: boolean },
  ) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  removeItem: (variantId: string) => void;
  clearCart: () => void;
}

// FONTE ÚNICA de feedback do carrinho. Todo add passa por aqui: pulsa o badge
// do header (sinal ambiente) e mostra NO MÁXIMO um toast com ação "Ver". Os
// chamadores (PDP, kit, cross-sell, conjunto) NÃO disparam toast próprio — isso
// gerava 2–3 toasts empilhados com vocabulário divergente. Vocabulário único:
// "orçamento" (funil consultivo B2B).
function notifyCartChanged(opts?: { toastLabel?: string; toastDescription?: string }) {
  if (typeof window === "undefined") return;
  // Não abre o drawer automaticamente — só pulsa o ícone e dispara toast discreto.
  window.dispatchEvent(new CustomEvent("western:cart-pulse"));
  if (opts?.toastLabel) {
    toast.success(opts.toastLabel, {
      description: opts.toastDescription,
      action: {
        label: "Ver",
        onClick: () => window.dispatchEvent(new CustomEvent("western:open-cart")),
      },
    });
  }
}


const CHAVE_CARRINHO = "western-cart";

/* Gravação protegida. Sem isto, se o localStorage recusar a escrita (cota
 * cheia, navegação privada restrita), o zustand já mudou a memória e só DEPOIS
 * estoura: a peça aparece na tela e some no próximo carregamento, sem aviso.
 * Agora o cliente é avisado na hora (id fixo = um aviso só, sem empilhar). */
const storageSeguro = {
  getItem: (nome: string) => localStorage.getItem(nome),
  setItem: (nome: string, valor: string) => {
    try {
      localStorage.setItem(nome, valor);
    } catch {
      toast.error("Não foi possível salvar o carrinho neste navegador", {
        id: "carrinho-sem-espaco",
        description:
          "As últimas peças podem se perder ao recarregar a página. Libere espaço no navegador ou use outro.",
      });
    }
  },
  removeItem: (nome: string) => localStorage.removeItem(nome),
};

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,

      addItem: (item, opts) => {
        const existing = get().items.find((i) => i.variantId === item.variantId);
        if (existing) {
          set({
            items: get().items.map((i) =>
              i.variantId === item.variantId
                ? { ...i, quantity: i.quantity + item.quantity }
                : i,
            ),
          });
        } else {
          set({ items: [...get().items, item] });
        }
        // Silencioso (lote): só pulsa. Senão: o ÚNICO toast do fluxo, já com o
        // nome da peça na descrição (antes cada chamador dava seu próprio toast).
        notifyCartChanged(
          opts?.silent
            ? undefined
            : { toastLabel: "Adicionada ao carrinho", toastDescription: item.productTitle },
        );
      },

      addBundle: (newItems, opts) => {
        const next = [...get().items];
        for (const item of newItems) {
          const idx = next.findIndex((i) => i.variantId === item.variantId);
          if (idx >= 0) {
            next[idx] = {
              ...next[idx],
              quantity: next[idx].quantity + item.quantity,
              // Atribuição first-touch: o PRIMEIRO conjunto (ou o add individual)
              // que trouxe a peça mantém o crédito; um merge posterior nunca
              // apaga nem sobrescreve a atribuição. `addItem` já faz o mesmo (via
              // ...next[idx]). Antes o addBundle sobrescrevia com o conjunto novo,
              // perdendo a atribuição original.
              conjuntoRef: next[idx].conjuntoRef ?? item.conjuntoRef,
            };
          } else {
            next.push(item);
          }
        }
        set({ items: next });
        const totalQty = newItems.reduce((s, i) => s + i.quantity, 0);
        notifyCartChanged(
          opts?.silent
            ? undefined
            : {
                toastLabel:
                  opts?.label ??
                  (newItems.length > 1
                    ? `${newItems.length} peças adicionadas ao carrinho`
                    : `${totalQty > 1 ? `${totalQty} ` : ""}Adicionada ao orçamento`),
                toastDescription: opts?.description,
              },
        );
      },

      updateQuantity: (variantId, quantity) => {
        if (quantity <= 0) return get().removeItem(variantId);
        set({
          items: get().items.map((i) =>
            i.variantId === variantId ? { ...i, quantity } : i,
          ),
        });
      },

      removeItem: (variantId) => {
        const next = get().items.filter((i) => i.variantId !== variantId);
        set({ items: next });
      },

      clearCart: () => set({ items: [] }),
    }),
    {
      name: CHAVE_CARRINHO,
      storage: createJSONStorage(() => storageSeguro),
      partialize: (state) => ({ items: state.items }),
      /* VERSÃO DE SCHEMA — o carrinho vive no localStorage do visitante e
       * sobrevive a deploys. Linhas gravadas antes da migração para o Woo não
       * têm wooParentProductId; elas atravessavam o checkout como "skipped" e o
       * cliente perdia peças em silêncio, sem entender por quê.
       * Ao subir a versão, descartamos só as linhas que o checkout não consegue
       * enviar — o resto do carrinho é preservado. */
      version: 2,
      migrate: (persisted, from) => {
        const state = persisted as { items?: CartItem[] } | undefined;
        if (!state?.items) return { items: [] };
        if (from >= 2) return state;
        return { items: state.items.filter((i) => typeof i.wooParentProductId === "number") };
      },
    },
  ),
);

/* SINCRONIA ENTRE ABAS — a causa do "produtos somem do carrinho" (11/09/2026).
 *
 * Cada aba lia o localStorage uma vez só, ao abrir, e a cada adição regravava o
 * array inteiro que tinha na memória. Com duas abas abertas — o normal quando se
 * monta um pedido grande abrindo produtos lado a lado — a aba antiga apagava o
 * que tinha sido adicionado na outra. Não havia limite de quantidade nenhum.
 *
 * Agora toda aba recarrega o carrinho quando outra grava (o evento "storage" só
 * dispara nas OUTRAS abas) e quando volta a ficar visível. key === null é o
 * localStorage.clear() de outra aba. */
if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key === CHAVE_CARRINHO || e.key === null) {
      void useCartStore.persist.rehydrate();
    }
  });
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      void useCartStore.persist.rehydrate();
    }
  });
}

/**
 * Helper: build a CartItem from a product + variant id.
 * Carrega os metadados Woo da variante (parent id, variation id, kind,
 * attributes) — preenchidos pelo adapter para todo produto vindo do Woo.
 */
export function buildCartItem(
  product: ShopifyProductNode,
  variantId: string,
  quantity = 1,
): CartItem | null {
  const variant = product.variants.edges.find((e) => e.node.id === variantId)?.node;
  if (!variant) return null;
  return {
    productHandle: product.handle,
    productTitle: product.title,
    productImage: product.images.edges[0]?.node?.url ?? null,
    variantId: variant.id,
    variantTitle: variant.title,
    sku: variant.sku ?? null,
    price: variant.price,
    quantity,
    selectedOptions: variant.selectedOptions,
    wooParentProductId: variant.wooParentProductId,
    wooVariationId: variant.wooVariationId ?? null,
    wooKind: variant.wooKind,
    wooAttributes: variant.wooAttributes ?? [],
    collectionHandle: product.collections?.edges?.[0]?.node?.handle,
  };
}
