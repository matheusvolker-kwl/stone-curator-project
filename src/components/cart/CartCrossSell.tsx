import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useState } from "react";
import { Plus, ArrowRight, Loader2 } from "lucide-react";
import { fetchCollection, fetchProduct } from "@/lib/datasource";
import { cdnImg, formatBRL } from "@/lib/shopify/client";
import { buildCartItem, useCartStore } from "@/stores/cartStore";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

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
      await addItem(item);
      toast.success("Peça adicionada à composição", {
        description: product.title,
        position: "top-right",
      });
    } finally {
      setAdding(null);
    }
  };

  return (
    <div className="px-5 md:px-8 py-6 border-t border-western-gold/15">
      <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-western-gold-soft mb-4">
        Combina com sua composição
      </p>
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
              className="flex items-center gap-3 p-2.5 border border-western-gold/15 hover:border-western-gold/40 transition-colors bg-western-green-deep/30"
            >
              <Link
                to={`/produtos/${node.handle}`}
                onClick={onNavigate}
                className="frame-gallery w-14 h-14 flex-shrink-0 bg-western-paper"
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
                  className="font-display text-sm text-western-cream hover:text-western-gold-soft transition-colors block truncate leading-tight"
                >
                  {node.title}
                </Link>
                {isApproved && minPrice ? (
                  <p className="text-spec text-western-cream-muted text-xs mt-0.5">
                    a partir de {formatBRL(minPrice.amount, minPrice.currencyCode)}
                  </p>
                ) : (
                  <p className="text-spec text-western-cream-muted text-xs mt-0.5">
                    Ver detalhes da peça
                  </p>
                )}
              </div>
              {isApproved ? (
                <button
                  onClick={() => handleQuickAdd(node.handle)}
                  disabled={isAdding}
                  className="h-9 px-3 inline-flex items-center gap-1.5 border border-western-gold/40 text-western-cream hover:bg-western-gold hover:text-western-green-deep hover:border-western-gold font-mono text-[10px] uppercase tracking-[0.22em] transition-colors disabled:opacity-50 flex-shrink-0"
                  aria-label={`Adicionar ${node.title}`}
                >
                  {isAdding ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <>
                      <Plus className="h-3 w-3" /> Adicionar
                    </>
                  )}
                </button>
              ) : (
                <Link
                  to={`/produtos/${node.handle}`}
                  onClick={onNavigate}
                  className="h-9 px-3 inline-flex items-center gap-1 text-western-cream-muted hover:text-western-gold-soft font-mono text-[10px] uppercase tracking-[0.22em] transition-colors flex-shrink-0"
                >
                  Ver peça <ArrowRight className="h-3 w-3" />
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
