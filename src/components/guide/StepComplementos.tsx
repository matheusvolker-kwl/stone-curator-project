import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Minus, Plus, Check } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { fetchProductsByHandles } from "@/lib/shopify/queries";
import { cdnImg, formatBRL } from "@/lib/shopify/client";
import { buildCartItem, useCartStore } from "@/stores/cartStore";
import { complementosPorTipo, type Tipo } from "@/data/guideMap";
import GuideStepFooter from "./GuideStepFooter";

interface Props {
  tipo: Tipo;
  onBack: () => void;
  onNext: () => void;
}

export default function StepComplementos({ tipo, onBack, onNext }: Props) {
  const handles = complementosPorTipo[tipo];
  const { data: produtos, isLoading } = useQuery({
    queryKey: ["upsell-complementos", tipo],
    queryFn: () => fetchProductsByHandles(handles),
    staleTime: 5 * 60 * 1000,
  });

  const addItem = useCartStore((s) => s.addItem);
  const addBundle = useCartStore((s) => s.addBundle);
  const cartItems = useCartStore((s) => s.items);
  const cartLoading = useCartStore((s) => s.isLoading);
  const [qtys, setQtys] = useState<Record<string, number>>({});

  const setQty = (h: string, q: number) =>
    setQtys((prev) => ({ ...prev, [h]: Math.max(1, q) }));

  const totalSelecionado = useMemo(() => {
    if (!produtos) return 0;
    return produtos.reduce((acc, p) => {
      const q = qtys[p.handle] ?? 1;
      const price = parseFloat(p.priceRange.minVariantPrice.amount);
      return acc + price * q;
    }, 0);
  }, [produtos, qtys]);

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
    toast.success(`${product.title} adicionado`, { description: `Qtd ${qtys[handle] ?? 1}` });
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

  return (
    <div className="animate-in fade-in duration-300">
      <header className="mb-8">
        <p className="text-eyebrow mb-3">Etapa 06 · Complementos</p>
        <h2 className="font-display text-3xl md:text-4xl text-western-green-deep leading-tight mb-3">
          Peças que somam ao conjunto
        </h2>
        <p className="text-western-stone-warm leading-relaxed max-w-2xl mb-3">
          Otimizam o frete (mesmo pedido), ampliam a composição e fecham a leitura
          do projeto. Ajuste a quantidade e adicione o que fizer sentido.
        </p>
        <p className="text-sm text-western-stone-warm/80 italic max-w-2xl mb-5">
          Faisal recomenda ao menos 2 complementos para que a composição não
          pareça interrompida — esferas e cascalhos costumam fechar a leitura.
        </p>
        {produtos && produtos.length > 1 && (
          <button
            type="button"
            onClick={handleAddAll}
            disabled={cartLoading}
            className="btn-outline-forest disabled:opacity-60"
          >
            <Plus className="h-4 w-4" /> Reservar todos ({formatBRL(totalSelecionado, "BRL")})
          </button>
        )}
      </header>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="border border-western-stone-warm/15 bg-white">
              <Skeleton className="aspect-square rounded-none" />
              <div className="p-5 space-y-3">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-3 w-1/3" />
                <div className="flex gap-2 pt-2">
                  <Skeleton className="h-10 w-24" />
                  <Skeleton className="h-10 flex-1" />
                </div>
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
                <Link to={`/produtos/${p.handle}`} className="aspect-square bg-western-cream/40 overflow-hidden">
                  {img && (
                    <img
                      src={cdnImg(img, 600)}
                      alt={p.title}
                      className="w-full h-full object-contain p-4 group-hover:scale-[1.03] transition-transform duration-500"
                      loading="lazy"
                    />
                  )}
                </Link>
                <div className="flex-1 p-5 flex flex-col gap-3">
                  <Link to={`/produtos/${p.handle}`}>
                    <h4 className="font-display text-lg text-western-green-deep leading-tight">
                      {p.title}
                    </h4>
                  </Link>
                  <p className="text-spec text-western-stone-warm">
                    {formatBRL(price.amount, price.currencyCode)}{" "}
                    <span className="opacity-60">/ un.</span>
                  </p>

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
                        <>
                          <Check className="h-3.5 w-3.5" /> Adicionado
                        </>
                      ) : (
                        <>
                          <Plus className="h-3.5 w-3.5" /> Adicionar
                        </>
                      )}
                    </button>
                  </div>
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
            ? `Seguir com ${addedCount} ${addedCount === 1 ? "complemento" : "complementos"}`
            : "Seguir só com o conjunto base"
        }
        skipLabel={addedCount === 0 ? "Não preciso disso agora" : undefined}
        onSkip={addedCount === 0 ? onNext : undefined}
        addedCount={addedCount}
      />
    </div>
  );
}
