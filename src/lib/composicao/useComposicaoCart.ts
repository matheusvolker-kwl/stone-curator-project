/**
 * Hook compartilhado que transforma uma composição {handle, qty}[] em peças
 * enriquecidas (nome/preço/foto reais do catálogo) e no CartItem[] do orçamento.
 * Extraído do ConjuntoPage para que /obras (obra → carrinho) use a MESMA
 * regra de bundle/Woo — sem duplicar lógica.
 *
 * Peças cujo variantId não começa com gid:// (sem variante comprável) ficam
 * fora do carrinho — mas nunca em silêncio: o clique informa quais ficaram de
 * fora. Se a consulta ao catálogo ainda não resolveu (ou falhou por rede/
 * proxy), addToOrcamento resolve NA HORA do clique em vez de recusá-lo — era
 * isso que fazia o botão de /obras "não adicionar nada".
 */
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { fetchProductsByHandlesHydrated } from "@/lib/datasource";
import { cdnImg } from "@/lib/catalog/client";
import { useCartStore, type CartItem } from "@/stores/cartStore";
import { acabamentoMeta, type Acabamento } from "@/components/guide-v2/types";
import type { ShopifyProductNode } from "@/lib/catalog/types";

export interface ComposicaoInput {
  handle: string;
  qty: number;
}

function montarPecas(
  composicao: ComposicaoInput[],
  produtos: ShopifyProductNode[] | undefined,
  acabamento: Acabamento,
) {
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
}

type PecaResolvida = ReturnType<typeof montarPecas>[number];

const compravel = (p: PecaResolvida) =>
  Boolean(p.variantId && p.variantId.startsWith("gid://"));

function cartItemsFrom(
  pecas: PecaResolvida[],
  acabamento: Acabamento,
  conjuntoRef?: string,
): CartItem[] {
  const acabLabel = acabamentoMeta[acabamento].label;
  return pecas.filter(compravel).map((p) => ({
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
}

export function useComposicaoCart(
  composicao: ComposicaoInput[],
  acabamento: Acabamento = "moledo",
) {
  const handles = useMemo(() => composicao.map((r) => r.handle), [composicao]);
  const { addBundle } = useCartStore();

  const { data: produtos, isLoading, refetch } = useQuery({
    queryKey: ["composicao-cart", handles],
    queryFn: () => fetchProductsByHandlesHydrated(handles),
    enabled: handles.length > 0,
    staleTime: 5 * 60 * 1000,
  });

  const pecas = useMemo(
    () => montarPecas(composicao, produtos, acabamento),
    [composicao, produtos, acabamento],
  );

  const totalPecas = pecas.reduce((s, p) => s + p.qty, 0);
  const totalPreco = pecas.reduce((s, p) => s + p.unitPrice * p.qty, 0);

  const buildCartItems = (conjuntoRef?: string): CartItem[] =>
    cartItemsFrom(pecas, acabamento, conjuntoRef);

  const addToOrcamento = async (opts: {
    label: string;
    description?: string;
    conjuntoRef?: string;
  }): Promise<boolean> => {
    // Autocura: consulta carregando ou com erro → resolve agora. O React Query
    // dedupa com a consulta em voo, então isso não duplica requests.
    let base = produtos;
    if (!base || base.length === 0) {
      base = (await refetch()).data;
    }
    const pecasAgora = montarPecas(composicao, base, acabamento);
    const items = cartItemsFrom(pecasAgora, acabamento, opts.conjuntoRef);

    if (items.length === 0) {
      if (!base || base.length === 0) {
        // Nada resolveu porque o CATÁLOGO não respondeu — não é peça indisponível.
        toast.error(
          "Não conseguimos consultar o catálogo agora. Tente novamente em instantes.",
        );
      } else {
        toast.error(
          "Nenhuma peça desta obra está disponível para orçamento direto. Fale com o ateliê para uma proposta.",
        );
      }
      return false;
    }

    addBundle(items, { label: opts.label, description: opts.description });

    const deFora = pecasAgora.filter((p) => !compravel(p));
    if (deFora.length > 0) {
      toast.info(
        `${deFora.length} ${deFora.length === 1 ? "peça ficou" : "peças ficaram"} de fora (sob consulta): ${deFora
          .map((p) => p.title)
          .join(", ")}`,
      );
    }
    return true;
  };

  return { pecas, isLoading, totalPecas, totalPreco, buildCartItems, addToOrcamento };
}
