import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ArrowRight, Loader2, ShoppingBag, TrendingUp, Check } from "lucide-react";
import { toast } from "sonner";
import { fetchProduct } from "@/lib/shopify/queries";
import { cdnImg, formatBRL } from "@/lib/shopify/client";
import { buildCartItem, useCartStore } from "@/stores/cartStore";
import { resolveUpgrade, nivelMeta, type GuideAnswers, type Tipo } from "@/data/guideMap";
import GuideStepFooter from "./GuideStepFooter";

interface Props {
  answers: GuideAnswers;
  precoBase: number;
  onBack: () => void;
  onNext: () => void;
}

export default function StepUpgrade({ answers, precoBase, onBack, onNext }: Props) {
  const upgrade = useMemo(() => resolveUpgrade(answers), [answers]);
  const tipo = answers.tipo as Tipo;
  const proximoNivel = answers.nivel === "essencial" ? "equilibrada" : "completa";
  const meta = upgrade && tipo ? nivelMeta[tipo][proximoNivel] : null;

  const { data: product } = useQuery({
    queryKey: ["upsell-upgrade", upgrade?.handle],
    queryFn: () => (upgrade ? fetchProduct(upgrade.handle) : Promise.resolve(null)),
    enabled: !!upgrade,
    staleTime: 5 * 60 * 1000,
  });

  const addItem = useCartStore((s) => s.addItem);
  const cartItems = useCartStore((s) => s.items);
  const cartLoading = useCartStore((s) => s.isLoading);

  if (!upgrade || !meta) {
    // Sem upgrade aplicável — avança automaticamente
    onNext();
    return null;
  }

  const delta = upgrade.preco - precoBase;
  const heroImg = product?.images.edges[0]?.node.url;
  const inCart = cartItems.some((i) => i.productHandle === upgrade.handle);

  const handleSwap = async () => {
    if (!product) {
      toast.error("Conjunto indisponível. Fale com um consultor.");
      return;
    }
    const variantId = product.variants.edges[0]?.node.id;
    if (!variantId) return;
    const item = buildCartItem(product, variantId, 1);
    if (!item) return;
    await addItem(item);
    toast.success(`Upgrade adicionado: ${upgrade.nome}`, {
      description: "Você pode remover o conjunto base no orçamento, se preferir.",
    });
  };

  return (
    <div className="animate-in fade-in duration-300">
      <header className="mb-8">
        <p className="text-eyebrow mb-3">Etapa 07 · Upgrade</p>
        <h2 className="font-display text-3xl md:text-4xl text-western-green-deep leading-tight mb-3">
          Quer levar o projeto a um patamar acima?
        </h2>
        <p className="text-western-stone-warm leading-relaxed max-w-2xl">
          Apenas se fizer sentido — o upgrade troca o conjunto base por uma composição
          mais robusta, com mais peças e presença visual.
        </p>
      </header>

      <article className="grid md:grid-cols-[1fr_1.4fr] border border-western-gold/40 bg-western-green-deep text-western-cream overflow-hidden">
        <div className="aspect-square md:aspect-auto bg-western-green-mid overflow-hidden">
          {heroImg ? (
            <img src={cdnImg(heroImg, 800)} alt={upgrade.nome} className="w-full h-full object-cover" loading="lazy" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <TrendingUp className="h-10 w-10 text-western-gold/40" />
            </div>
          )}
        </div>
        <div className="p-7 md:p-10 flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-western-gold border border-western-gold/40 px-2.5 py-1">
              <TrendingUp className="h-3 w-3" /> Próximo nível · {meta.label}
            </span>
          </div>
          <h4 className="font-display text-2xl md:text-3xl leading-tight mb-2">
            {upgrade.nome}
          </h4>
          <p className="text-sm text-western-cream/75 mb-5">{meta.tagline}</p>
          <p className="text-sm text-western-cream/85 leading-relaxed mb-6">{meta.detalhe}</p>

          <div className="flex items-baseline gap-3 flex-wrap mb-1">
            <span className="font-display text-3xl text-western-gold">
              {formatBRL(upgrade.preco, "BRL")}
            </span>
            {delta > 0 && (
              <span className="font-mono text-xs uppercase tracking-[0.18em] text-western-cream/70">
                +{formatBRL(delta, "BRL")} vs. base
              </span>
            )}
          </div>
          <p className="text-xs text-western-cream/60 mb-7">{meta.pecas} · {meta.faixaPreco}</p>

          <div className="mt-auto flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={handleSwap}
              disabled={cartLoading || !product}
              className="inline-flex items-center justify-center gap-2 h-11 px-5 bg-western-gold text-western-green-deep hover:bg-western-gold/90 font-mono text-xs uppercase tracking-[0.22em] transition-colors disabled:opacity-60"
            >
              {cartLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : inCart ? (
                <><Check className="h-4 w-4" /> Upgrade adicionado</>
              ) : (
                <><ShoppingBag className="h-4 w-4" /> Adicionar upgrade</>
              )}
            </button>
            <Link
              to={`/produtos/${upgrade.handle}`}
              className="inline-flex items-center justify-center gap-2 h-11 px-4 border border-western-cream/30 text-western-cream hover:border-western-gold hover:text-western-gold font-mono text-xs uppercase tracking-[0.22em] transition-colors"
            >
              Ver detalhes <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </article>

      <GuideStepFooter
        onBack={onBack}
        onNext={onNext}
        nextLabel={inCart ? "Avançar com upgrade" : "Avançar sem upgrade"}
        skipLabel={!inCart ? "Pular esta etapa" : undefined}
        onSkip={!inCart ? onNext : undefined}
        addedCount={inCart ? 1 : 0}
      />
    </div>
  );
}
