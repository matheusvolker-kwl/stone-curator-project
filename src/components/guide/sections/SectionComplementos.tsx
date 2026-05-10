import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Minus, Plus, Check } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { fetchProductsByHandles } from "@/lib/shopify/queries";
import { cdnImg } from "@/lib/shopify/client";
import { buildCartItem, useCartStore } from "@/stores/cartStore";
import { complementosPorTipo, type Tipo } from "@/data/guideMap";
import GatedPrice from "@/components/shared/GatedPrice";
import GuideProductQuickView from "../GuideProductQuickView";

interface Props {
  tipo: Tipo;
}

export default function SectionComplementos({ tipo }: Props) {
  const handles = complementosPorTipo[tipo];
  const { data: produtos, isLoading } = useQuery({
    queryKey: ["upsell-complementos", tipo],
    queryFn: () => fetchProductsByHandles(handles),
    staleTime: 5 * 60 * 1000,
    enabled: handles.length > 0,
  });

  const addItem = useCartStore((s) => s.addItem);
  const addBundle = useCartStore((s) => s.addBundle);
  const cartItems = useCartStore((s) => s.items);
  const cartLoading = useCartStore((s) => s.isLoading);
  const [qtys, setQtys] = useState<Record<string, number>>({});
  const [quickHandle, setQuickHandle] = useState<string | null>(null);

  const setQty = (h: string, q: number) =>
    setQtys((prev) => ({ ...prev, [h]: Math.max(1, q) }));

  const addedCount = useMemo(
    () => cartItems.filter((i) => handles.includes(i.productHandle)).length,
    [cartItems, handles]
  );

  const handleAddOne = async (handle: string) => {
    const product = produtos?.find((p) => p.handle === handle);
    if (!product) return;
    const variantId = product.variants.edges[0]?.node.id;
    if (!variantId) return;
    const item = buildCartItem(product, variantId, qtys[handle] ?? 1);
    if (!item) return;
    await addItem(item);
    toast.success(`${product.title} adicionado`);
  };

  const handleAddAll = async () => {
    if (!produtos || produtos.length === 0) return;
    const items = produtos
      .map((p) => {
        const variantId = p.variants.edges[0]?.node.id;
        if (!variantId) return null;
        return buildCartItem(p, variantId, qtys[p.handle] ?? 1);
      })
      .filter((i): i is NonNullable<typeof i> => !!i);
    if (items.length === 0) return;
    await addBundle(items);
    toast.success(`${items.length} complementos adicionados`, {
      description: "Frete otimizado em pedido único.",
    });
  };

  if (handles.length === 0) return null;

  return (
    <section id="complementos" className="scroll-mt-32 border-t border-western-stone-warm/15 pt-10">
      <header className="mb-5 flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className="text-eyebrow mb-1.5">Complementos</p>
          <h3 className="font-display text-xl md:text-2xl text-western-green-deep leading-tight">
            Peças que somam ao conjunto
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {addedCount > 0 && (
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-western-green-deep bg-western-cream/50 border border-western-gold/40 px-2.5 py-1">
              {addedCount} no projeto
            </span>
          )}
          {produtos && produtos.length > 1 && (
            <button
              type="button"
              onClick={handleAddAll}
              disabled={cartLoading}
              className="btn-outline-forest disabled:opacity-60"
            >
              <Plus className="h-4 w-4" /> Reservar todos
            </button>
          )}
        </div>
      </header>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="border border-western-stone-warm/15 bg-white">
              <Skeleton className="aspect-square rounded-none" />
              <div className="p-5 space-y-3">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-3 w-1/3" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : !produtos || produtos.length === 0 ? (
        <p className="text-sm text-western-stone-warm py-8">
          Nenhum complemento disponível para este tipo agora.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {produtos.map((p) => {
            const img = p.images.edges[0]?.node.url;
            const price = p.priceRange.minVariantPrice;
            const qty = qtys[p.handle] ?? 1;
            const inCart = cartItems.some((i) => i.productHandle === p.handle);
            return (
              <article
                key={p.id}
                className={`group flex flex-col bg-white border transition-colors ${
                  inCart ? "border-western-gold" : "border-western-stone-warm/20 hover:border-western-gold/60"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setQuickHandle(p.handle)}
                  className="aspect-square bg-western-cream/40 overflow-hidden block w-full"
                  aria-label={`Ver detalhes de ${p.title}`}
                >
                  {img && (
                    <img
                      src={cdnImg(img, 600)}
                      alt={p.title}
                      className="w-full h-full object-contain p-4 group-hover:scale-[1.03] transition-transform duration-500"
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
                    suffix="/ un."
                    className="text-spec text-western-stone-warm"
                  />

                  <div className="mt-auto flex items-stretch gap-2">
                    <div className="flex items-center border border-western-stone-warm/30">
                      <button
                        type="button"
                        onClick={() => setQty(p.handle, qty - 1)}
                        className="h-10 w-9 flex items-center justify-center text-western-stone-warm hover:text-western-green-deep"
                        aria-label="Diminuir"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-7 text-center font-mono text-sm text-western-green-deep">
                        {qty}
                      </span>
                      <button
                        type="button"
                        onClick={() => setQty(p.handle, qty + 1)}
                        className="h-10 w-9 flex items-center justify-center text-western-stone-warm hover:text-western-green-deep"
                        aria-label="Aumentar"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleAddOne(p.handle)}
                      disabled={cartLoading}
                      className="flex-1 inline-flex items-center justify-center gap-2 bg-western-green-deep text-western-cream hover:bg-western-green-mid font-mono text-[11px] uppercase tracking-[0.2em] transition-colors disabled:opacity-60"
                    >
                      {inCart ? (
                        <><Check className="h-3.5 w-3.5" /> Adicionado</>
                      ) : (
                        <><Plus className="h-3.5 w-3.5" /> Adicionar</>
                      )}
                    </button>
                  </div>
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
