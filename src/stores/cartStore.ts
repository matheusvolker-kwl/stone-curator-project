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
  addItem: (item: CartItem) => void;
  addBundle: (items: CartItem[]) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  removeItem: (variantId: string) => void;
  clearCart: () => void;
}

function notifyCartChanged(opts?: { toastLabel?: string }) {
  if (typeof window === "undefined") return;
  // Não abre o drawer automaticamente — só pulsa o ícone e dispara toast discreto.
  window.dispatchEvent(new CustomEvent("western:cart-pulse"));
  if (opts?.toastLabel) {
    toast.success(opts.toastLabel, {
      action: {
        label: "Ver",
        onClick: () => window.dispatchEvent(new CustomEvent("western:open-cart")),
      },
    });
  }
}


export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,

      addItem: (item) => {
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
        notifyCartChanged({ toastLabel: "Adicionada ao orçamento" });

      },

      addBundle: (newItems) => {
        const next = [...get().items];
        for (const item of newItems) {
          const idx = next.findIndex((i) => i.variantId === item.variantId);
          if (idx >= 0) {
            next[idx] = {
              ...next[idx],
              quantity: next[idx].quantity + item.quantity,
              conjuntoRef: item.conjuntoRef ?? next[idx].conjuntoRef,
            };
          } else {
            next.push(item);
          }
        }
        set({ items: next });
        const totalQty = newItems.reduce((s, i) => s + i.quantity, 0);
        notifyCartChanged({
          toastLabel:
            newItems.length > 1
              ? `${newItems.length} peças adicionadas ao orçamento`
              : `${totalQty > 1 ? `${totalQty} ` : ""}Adicionada ao orçamento`,
        });

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
      name: "western-cart",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
    },
  ),
);

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
