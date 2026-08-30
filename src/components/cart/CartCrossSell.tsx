import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useState } from "react";
import { Plus, ArrowRight, Loader2 } from "lucide-react";
import { fetchCollection, fetchProduct } from "@/lib/datasource";
import { cdnImg, formatBRL } from "@/lib/catalog/client";
import { buildCartItem, useCartStore } from "@/stores/cartStore";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { usePartnerPricing } from "@/hooks/usePartnerPricing";
import { unitarioComDesconto } from "@/lib/precoParceiro";

interface Props {
  /** Coleção do primeiro item do carrinho (preferência principal). */
  collectionHandle?: string;
  /** Handles já no carrinho — filtrados para evitar duplicatas. */
  excludeHandles: string[];
  /** Callback quando o usuário navega (fecha o drawer). */
  onNavigate: () => void;
}

export default function CartCrossSell({
  collectionHandle,
  excludeHandles,
  onNavigate,
}: Props) {
  const { isApproved } = useAuth();
  const { discountPct } = usePartnerPricing();
  const addItem = useCartStore((s) => s.addItem);
  const [adding, setAdding] = useState<string | null>(null);

  // Tenta a coleção do item primeiro
  const { data: primary, isLoading: loadingPrimary } = useQuery({
    queryKey: ["cart-cross-sell", collectionHandle],
    queryFn: () => fetchCollection(collectionHandle!, 8),
    enabled: !!collectionHandle,
  });

  // Fallback: conjuntos
  const { data: fallback, isLoading: loadingFallback } = useQuery({
    queryKey: ["cart-cross-sell", "conjuntos"],
    queryFn: () => fetchCollection("conjuntos", 8),
  });

  const filterAndPick = (
    edges?: Array<{ node: { handle: string } }>
  ) =>
    edges
      ?.map((e) => e.node)
      .filter((p) => !excludeHandles.includes(p.handle))
      .slice(0, 3) ?? [];

  let suggestions = filterAndPick(primary?.products?.edges);
  if (suggestions.length === 0) {
    suggestions = filterAndPick(fallback?.products?.edges);
  }

  if (loadingPrimary || loadingFallback) return null;
  if (suggestions.length === 0) return null;

  const handleQuickAdd = async (handle: string) => {
    setAdding(handle);
    try {
      const product = await fetchProduct(handle);
      if (!product) {
        toast.error("Não foi possível adicionar esta peça");
        return;
      }
      const variant = product.variants.edges.find((e) => e.node.availableForSale)?.node
        ?? product.variants.edges[0]?.node;
      if (!variant) {
        toast.error("Esta peça não tem variante disponível");
        return;
      }
      const item = buildCartItem(product, variant.id, 1);
      if (!item) return;
      // Toast único (com "Ver") vive no cartStore — sem segundo toast aqui.
      addItem(item);
    } finally {
      setAdding(null);
    }
  };

  return (
    <div className="px-5 md:px-8 py-6 surface-paper border-t border-western-border-soft">
      <p className="text-eyebrow mb-4">Combina com sua composição</p>
      <ul className="space-y-3">
        {suggestions.map((p) => {
          // p é um ShopifyProductNode parcial (vem do collection query)
          const node = p as unknown as {
            id: string;
            handle: string;
            title: string;
            images: { edges: Array<{ node: { url: string; altText: string | null } }> };
            priceRange?: { minVariantPrice: { amount: string; currencyCode: string } };
          };
          const img = node.images?.edges?.[0]?.node;
          const minPrice = node.priceRange?.minVariantPrice;
          const isAdding = adding === node.handle;

          return (
            <li
              key={node.id}
              className="flex items-center gap-3 p-3 rounded-lg border border-western-border-soft bg-white hover:border-western-border-strong transition-colors"
            >
              <Link
                to={`/produtos/${node.handle}`}
                onClick={onNavigate}
                className="w-16 h-16 flex-shrink-0 overflow-hidden rounded-sm bg-western-paper border border-western-border-soft"
              >
                {img && (
                  <img
                    src={cdnImg(img.url, 200)}
                    alt={img.altText ?? node.title}
                    loading="lazy"
                    className="w-full h-full object-contain p-1"
                  />
                )}
              </Link>
              <div className="flex-1 min-w-0">
                <Link
                  to={`/produtos/${node.handle}`}
                  onClick={onNavigate}
                  className="block truncate font-sans text-[16px] font-semibold leading-snug text-western-green-deep hover:text-western-cta transition-colors"
                >
                  {node.title}
                </Link>
                {isApproved && minPrice ? (
                  <p className="font-sans text-[14px] text-western-stone-warm mt-0.5">
                    a partir de {formatBRL(unitarioComDesconto(parseFloat(String(minPrice.amount)), discountPct), minPrice.currencyCode)}
                  </p>
                ) : (
                  <p className="font-sans text-[14px] text-western-stone-warm mt-0.5">
                    Ver detalhes da peça
                  </p>
                )}
              </div>
              {isApproved ? (
                <button
                  type="button"
                  onClick={() => handleQuickAdd(node.handle)}
                  disabled={isAdding}
                  className="flex-shrink-0 min-h-tap px-4 inline-flex items-center justify-center gap-2 rounded-lg bg-western-cta text-western-cream hover:bg-western-green-deep font-sans text-[15px] font-semibold transition-colors disabled:opacity-45"
                  aria-label={`Adicionar ${node.title}`}
                >
                  {isAdding ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <Plus className="h-5 w-5" /> Adicionar
                    </>
                  )}
                </button>
              ) : (
                <Link
                  to={`/produtos/${node.handle}`}
                  onClick={onNavigate}
                  className="flex-shrink-0 min-h-tap px-4 inline-flex items-center justify-center gap-1.5 rounded-lg border border-western-border-strong text-western-green-deep hover:border-western-green-deep hover:bg-western-paper font-sans text-[15px] font-semibold transition-colors"
                >
                  Ver peça <ArrowRight className="h-5 w-5" />
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
