import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Sparkles, Check } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { fetchProductsByHandles } from "@/lib/shopify/queries";
import { cdnImg } from "@/lib/shopify/client";
import { buildCartItem, useCartStore } from "@/stores/cartStore";
import { itensCasaHandles } from "@/data/guideMap";
import GatedPrice from "@/components/shared/GatedPrice";
import GuideProductQuickView from "../GuideProductQuickView";

export default function SectionAutorais() {
  const { data: produtos, isLoading } = useQuery({
    queryKey: ["upsell-casa"],
    queryFn: () => fetchProductsByHandles(itensCasaHandles),
    staleTime: 10 * 60 * 1000,
  });

  const addItem = useCartStore((s) => s.addItem);
  const cartItems = useCartStore((s) => s.items);
  const cartLoading = useCartStore((s) => s.isLoading);
  const [quickHandle, setQuickHandle] = useState<string | null>(null);

  const addedCount = useMemo(
    () => cartItems.filter((i) => itensCasaHandles.includes(i.productHandle)).length,
    [cartItems]
  );

  const handleAdd = async (handle: string) => {
    const product = produtos?.find((p) => p.handle === handle);
    if (!product) return;
    const variantId = product.variants.edges[0]?.node.id;
    if (!variantId) return;
    const item = buildCartItem(product, variantId, 1);
    if (!item) return;
    await addItem(item);
    toast.success(`${product.title} adicionado`);
  };

  return (
    <section id="autorais" className="scroll-mt-32 border-t border-western-stone-warm/15 pt-10">
      <header className="mb-5 flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className="text-eyebrow mb-1.5 flex items-center gap-2">
            <Sparkles className="h-3 w-3 text-western-gold" /> Itens autorais
          </p>
          <h3 className="font-display text-xl md:text-2xl text-western-green-deep leading-tight">
            Edições exclusivas da casa
          </h3>
        </div>
        {addedCount > 0 && (
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-western-green-deep bg-western-cream/50 border border-western-gold/40 px-2.5 py-1">
            {addedCount} no projeto
          </span>
        )}
      </header>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="border border-western-stone-warm/15 bg-western-cream/40">
              <Skeleton className="aspect-[4/5] rounded-none" />
              <div className="p-5 space-y-3">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-3 w-1/3" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : !produtos || produtos.length === 0 ? (
        <p className="text-sm text-western-stone-warm py-8">Sem itens disponíveis no momento.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {produtos.map((p) => {
            const img = p.images.edges[0]?.node.url;
            const price = p.priceRange.minVariantPrice;
            const inCart = cartItems.some((i) => i.productHandle === p.handle);
            return (
              <article
                key={p.id}
                className={`group flex flex-col bg-western-cream/40 border transition-colors ${
                  inCart ? "border-western-gold" : "border-western-stone-warm/20 hover:border-western-gold/60"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setQuickHandle(p.handle)}
                  className="aspect-[4/5] overflow-hidden block w-full"
                  aria-label={`Ver detalhes de ${p.title}`}
                >
                  {img && (
                    <img
                      src={cdnImg(img, 700)}
                      alt={p.title}
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                      loading="lazy"
                    />
                  )}
                </button>
                <div className="flex-1 p-5 flex flex-col gap-3">
                  <button
                    type="button"
                    onClick={() => setQuickHandle(p.handle)}
                    className="text-left"
                  >
                    <h4 className="font-display text-lg text-western-green-deep leading-tight hover:text-western-gold transition-colors">
                      {p.title}
                    </h4>
                  </button>
                  <GatedPrice
                    amount={price.amount}
                    currency={price.currencyCode}
                    className="text-spec text-western-stone-warm"
                  />
                  <button
                    type="button"
                    onClick={() => handleAdd(p.handle)}
                    disabled={cartLoading}
                    className="mt-auto inline-flex items-center justify-center gap-2 h-10 border border-western-green-deep text-western-green-deep hover:bg-western-green-deep hover:text-western-cream font-mono text-[11px] uppercase tracking-[0.22em] transition-colors disabled:opacity-60"
                  >
                    {inCart ? (
                      <><Check className="h-3.5 w-3.5" /> Adicionado</>
                    ) : (
                      <><Plus className="h-3.5 w-3.5" /> Somar ao orçamento</>
                    )}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <GuideProductQuickView
        handle={quickHandle}
        open={!!quickHandle}
        onOpenChange={(o) => !o && setQuickHandle(null)}
      />
    </section>
  );
}
