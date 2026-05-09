import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Loader2, Plus, Sparkles, Check } from "lucide-react";
import { toast } from "sonner";
import { fetchProductsByHandles } from "@/lib/shopify/queries";
import { cdnImg, formatBRL } from "@/lib/shopify/client";
import { buildCartItem, useCartStore } from "@/stores/cartStore";
import { itensCasaHandles } from "@/data/guideMap";
import GuideStepFooter from "./GuideStepFooter";

interface Props {
  onBack: () => void;
  onNext: () => void;
}

export default function StepCasa({ onBack, onNext }: Props) {
  const { data: produtos, isLoading } = useQuery({
    queryKey: ["upsell-casa"],
    queryFn: () => fetchProductsByHandles(itensCasaHandles),
    staleTime: 10 * 60 * 1000,
  });

  const addItem = useCartStore((s) => s.addItem);
  const cartItems = useCartStore((s) => s.items);
  const cartLoading = useCartStore((s) => s.isLoading);

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
    <div className="animate-in fade-in duration-300">
      <header className="mb-8">
        <p className="text-eyebrow mb-3">Etapa 08 · Assinatura Western</p>
        <h2 className="font-display text-3xl md:text-4xl text-western-green-deep leading-tight mb-3">
          Itens autorais da casa
        </h2>
        <p className="text-western-stone-warm leading-relaxed max-w-2xl">
          Peças exclusivas que viram presente para o cliente final, ponto focal de
          living e geram margem expressiva para revenda especificada.
        </p>
        <p className="text-sm text-western-stone-warm/80 italic max-w-2xl mt-3">
          Faisal especifica esses itens em quase todos os projetos premiados —
          são detalhes que fazem o cliente lembrar de quem assinou o ambiente.
        </p>
      </header>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-5 w-5 animate-spin text-western-stone-warm" />
        </div>
      ) : !produtos || produtos.length === 0 ? (
        <p className="text-sm text-western-stone-warm py-8">Sem itens disponíveis no momento.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
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
                <Link to={`/produtos/${p.handle}`} className="aspect-[4/5] overflow-hidden">
                  {img && (
                    <img
                      src={cdnImg(img, 700)}
                      alt={p.title}
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                      loading="lazy"
                    />
                  )}
                </Link>
                <div className="flex-1 p-5 flex flex-col gap-3">
                  <span className="inline-flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.22em] text-western-gold w-fit">
                    <Sparkles className="h-3 w-3" /> Edição autoral
                  </span>
                  <Link to={`/produtos/${p.handle}`}>
                    <h4 className="font-display text-lg text-western-green-deep leading-tight">
                      {p.title}
                    </h4>
                  </Link>
                  <p className="text-spec text-western-stone-warm">
                    {formatBRL(price.amount, price.currencyCode)}
                  </p>
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

      <GuideStepFooter
        onBack={onBack}
        onNext={onNext}
        nextLabel={
          addedCount > 0
            ? `Finalizar com ${addedCount} ${addedCount === 1 ? "item autoral" : "itens autorais"}`
            : "Finalizar meu projeto"
        }
        skipLabel={addedCount === 0 ? "Não preciso disso agora" : undefined}
        onSkip={addedCount === 0 ? onNext : undefined}
        addedCount={addedCount}
      />
    </div>
  );
}
