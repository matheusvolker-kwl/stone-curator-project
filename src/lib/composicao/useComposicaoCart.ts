/**
 * Hook compartilhado que transforma uma composição {handle, qty}[] em peças
 * enriquecidas (nome/preço/foto reais do catálogo) e no CartItem[] do orçamento.
 * Extraído do ConjuntoPage para que /obras (obra → carrinho) use a MESMA
 * regra de bundle/Woo — sem duplicar lógica.
 *
 * Blindagem nativa: peças cujo variantId não começa com gid:// (sem variante
 * comprável) são descartadas silenciosamente do carrinho; se nenhuma resolver,
 * addToOrcamento retorna false e sinaliza para rota consultiva.
 */
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { fetchProductsByHandlesHydrated } from "@/lib/datasource";
import { cdnImg } from "@/lib/catalog/client";
import { useCartStore, type CartItem } from "@/stores/cartStore";
import { acabamentoMeta, type Acabamento } from "@/components/guide-v2/types";

export interface ComposicaoInput {
  handle: string;
  qty: number;
}

export function useComposicaoCart(
  composicao: ComposicaoInput[],
  acabamento: Acabamento = "moledo",
) {
  const handles = useMemo(() => composicao.map((r) => r.handle), [composicao]);
  const { addBundle } = useCartStore();

  const { data: produtos, isLoading } = useQuery({
    queryKey: ["composicao-cart", handles],
    queryFn: () => fetchProductsByHandlesHydrated(handles),
    enabled: handles.length > 0,
    staleTime: 5 * 60 * 1000,
  });

  const pecas = useMemo(() => {
    const acabLabel = acabamentoMeta[acabamento].label;
    const byHandle = new Map((produtos ?? []).map((p) => [p.handle, p] as const));
    return composicao.map((row) => {
      const prod = byHandle.get(row.handle);
      const variant =
        prod?.variants.edges.find((e) =>
          e.node.selectedOptions?.some(
            (o) => o.name === "Acabamento" && o.value === acabLabel,
          ),
        )?.node ?? prod?.variants.edges[0]?.node;
      const unit = variant
        ? parseFloat(variant.price.amount)
        : prod
          ? parseFloat(prod.priceRange.minVariantPrice.amount)
          : 0;
      const img = prod?.images.edges[0]?.node;
      return {
        handle: row.handle,
        qty: row.qty,
        title: prod?.title ?? row.handle,
        unitPrice: Number.isFinite(unit) ? unit : 0,
        imageUrl: img?.url ? cdnImg(img.url, 800) : undefined,
        variantId: variant?.id,
        variantTitle: variant?.title,
        wooParentProductId: variant?.wooParentProductId,
        wooVariationId: variant?.wooVariationId ?? null,
        wooKind: variant?.wooKind,
        wooAttributes: variant?.wooAttributes ?? [],
      };
    });
  }, [composicao, produtos, acabamento]);

  const totalPecas = pecas.reduce((s, p) => s + p.qty, 0);
  const totalPreco = pecas.reduce((s, p) => s + p.unitPrice * p.qty, 0);

  const buildCartItems = (conjuntoRef?: string): CartItem[] => {
    const acabLabel = acabamentoMeta[acabamento].label;
    return pecas
      .filter((p) => p.variantId && p.variantId.startsWith("gid://"))
      .map((p) => ({
        productHandle: p.handle,
        productTitle: p.title,
        productImage: p.imageUrl ?? null,
        variantId: p.variantId!,
        variantTitle: p.variantTitle ?? acabLabel,
        price: { amount: String(p.unitPrice), currencyCode: "BRL" },
        quantity: p.qty,
        selectedOptions: [{ name: "Acabamento", value: acabLabel }],
        wooParentProductId: p.wooParentProductId,
        wooVariationId: p.wooVariationId ?? null,
        wooKind: p.wooKind,
        wooAttributes: p.wooAttributes ?? [],
        conjuntoRef,
      }));
  };

  const addToOrcamento = (opts: {
    label: string;
    description?: string;
    conjuntoRef?: string;
  }): boolean => {
    const items = buildCartItems(opts.conjuntoRef);
    if (items.length === 0) {
      toast.error(
        "Nenhuma peça desta obra está disponível para orçamento direto. Fale com o ateliê para uma proposta.",
      );
      return false;
    }
    addBundle(items, { label: opts.label, description: opts.description });
    return true;
  };

  return { pecas, isLoading, totalPecas, totalPreco, buildCartItems, addToOrcamento };
}
