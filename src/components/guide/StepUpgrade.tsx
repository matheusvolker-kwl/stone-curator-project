import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ArrowRight, Loader2, ShoppingBag, TrendingUp, Check, Plus, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { fetchProduct } from "@/lib/shopify/queries";
import { cdnImg, formatBRL } from "@/lib/shopify/client";
import { buildCartItem, useCartStore } from "@/stores/cartStore";
import {
  resolveConjunto,
  resolveUpgrade,
  nivelMeta,
  type GuideAnswers,
  type Tipo,
} from "@/data/guideMap";
import GuideStepFooter from "./GuideStepFooter";

interface Props {
  answers: GuideAnswers;
  precoBase: number;
  onBack: () => void;
  onNext: () => void;
}

function diffPecas(baseStr: string, upgStr: string): string {
  // Tenta extrair número mínimo de cada faixa "4–6 peças" → 4
  const baseN = parseInt(baseStr.match(/\d+/)?.[0] ?? "0", 10);
  const upgN = parseInt(upgStr.match(/\d+/)?.[0] ?? "0", 10);
  const diff = upgN - baseN;
  return diff > 0 ? `+${diff} peças no conjunto` : "Mais peças no conjunto";
}

export default function StepUpgrade({ answers, precoBase, onBack, onNext }: Props) {
  const upgrade = useMemo(() => resolveUpgrade(answers), [answers]);
  const baseConjunto = useMemo(() => resolveConjunto(answers), [answers]);
  const tipo = answers.tipo as Tipo;
  const nivelAtual = answers.nivel ?? "essencial";
  const proximoNivel = nivelAtual === "essencial" ? "equilibrada" : "completa";
  const meta = upgrade && tipo ? nivelMeta[tipo][proximoNivel] : null;
  const metaBase = tipo ? nivelMeta[tipo][nivelAtual] : null;

  const { data: upProduct } = useQuery({
    queryKey: ["upsell-upgrade", upgrade?.handle],
    queryFn: () => (upgrade ? fetchProduct(upgrade.handle) : Promise.resolve(null)),
    enabled: !!upgrade,
    staleTime: 5 * 60 * 1000,
  });

  const baseHandle =
    baseConjunto && baseConjunto !== "consultor" ? baseConjunto.handle : null;

  const { data: baseProduct } = useQuery({
    queryKey: ["upsell-base", baseHandle],
    queryFn: () => (baseHandle ? fetchProduct(baseHandle) : Promise.resolve(null)),
    enabled: !!baseHandle,
    staleTime: 5 * 60 * 1000,
  });

  const addItem = useCartStore((s) => s.addItem);
  const cartItems = useCartStore((s) => s.items);
  const cartLoading = useCartStore((s) => s.isLoading);

  if (!upgrade || !meta || !metaBase || !baseConjunto || baseConjunto === "consultor") {
    onNext();
    return null;
  }

  const delta = upgrade.preco - precoBase;
  const upgradeImg = upProduct?.images.edges[0]?.node.url;
  const baseImg = baseProduct?.images.edges[0]?.node.url;
  const inCart = cartItems.some((i) => i.productHandle === upgrade.handle);
  const baseInCart = cartItems.some((i) => i.productHandle === baseConjunto.handle);

  const handleSwap = async () => {
    if (!upProduct) {
      toast.error("Conjunto indisponível. Fale com um consultor.");
      return;
    }
    const variantId = upProduct.variants.edges[0]?.node.id;
    if (!variantId) return;
    const item = buildCartItem(upProduct, variantId, 1);
    if (!item) return;
    await addItem(item);
    toast.success(`Upgrade adicionado: ${upgrade.nome}`, {
      description: baseInCart
        ? "Você pode remover o conjunto base no orçamento, se preferir."
        : undefined,
    });
  };

  // Bullets do que o upgrade adiciona (baseado em metadados)
  const upgradeBenefits: string[] = [
    diffPecas(metaBase.pecas, meta.pecas),
    `Presença ${meta.label.toLowerCase()} — ${meta.tagline.toLowerCase()}`,
    "Ponto focal mais robusto e leitura imersiva",
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <header className="mb-8">
        <p className="text-eyebrow mb-3">Etapa 07 · Upgrade</p>
        <h2 className="font-display text-3xl md:text-4xl text-western-green-deep leading-tight mb-3">
          Quer levar o projeto a um patamar acima?
        </h2>
        <p className="text-western-stone-warm leading-relaxed max-w-2xl">
          Compare lado a lado. O upgrade troca seu conjunto base por uma composição
          mais robusta — só vale se fizer sentido para o seu cliente.
        </p>
      </header>

      <div className="grid md:grid-cols-2 gap-4 md:gap-5 items-stretch">
        {/* BASE */}
        <article className="relative flex flex-col bg-white border border-western-stone-warm/25">
          <div className="px-5 pt-5 pb-3 flex items-center justify-between border-b border-western-stone-warm/15">
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-western-stone-warm">
              Sua escolha · {metaBase.label}
            </span>
            {baseInCart && (
              <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-western-green-deep flex items-center gap-1">
                <Check className="h-3 w-3" /> No orçamento
              </span>
            )}
          </div>
          <div className="aspect-[4/3] bg-western-cream/40 overflow-hidden">
            {baseImg ? (
              <img
                src={cdnImg(baseImg, 700)}
                alt={baseConjunto.nome}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full bg-western-green-deep/10" />
            )}
          </div>
          <div className="p-5 flex-1 flex flex-col">
            <h4 className="font-display text-xl text-western-green-deep leading-tight mb-1">
              {baseConjunto.nome}
            </h4>
            <p className="text-xs text-western-stone-warm mb-4">{metaBase.pecas}</p>
            <div className="mt-auto">
              <p className="font-display text-2xl text-western-green-deep">
                {formatBRL(precoBase, "BRL")}
              </p>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-western-stone-warm mt-1">
                Conjunto base
              </p>
            </div>
          </div>
        </article>

        {/* UPGRADE */}
        <motion.article
          whileHover={{ y: -2 }}
          className="relative flex flex-col bg-western-green-deep text-western-cream border border-western-gold/50 shadow-[0_24px_60px_-30px_rgba(184,146,79,0.5)]"
        >
          <div className="absolute -top-3 left-5 z-10">
            <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.22em] bg-western-gold text-western-green-deep px-2.5 py-1">
              <TrendingUp className="h-3 w-3" /> Recomendado · {meta.label}
            </span>
          </div>
          <div className="px-5 pt-5 pb-3 flex items-center justify-end border-b border-western-cream/10">
            {inCart && (
              <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-western-gold flex items-center gap-1">
                <Check className="h-3 w-3" /> Adicionado
              </span>
            )}
          </div>
          <div className="aspect-[4/3] bg-western-green-mid overflow-hidden relative">
            {upgradeImg ? (
              <img
                src={cdnImg(upgradeImg, 700)}
                alt={upgrade.nome}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Sparkles className="h-10 w-10 text-western-gold/40" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-western-green-deep/40 to-transparent" />
          </div>
          <div className="p-5 flex-1 flex flex-col">
            <h4 className="font-display text-xl text-western-cream leading-tight mb-1">
              {upgrade.nome}
            </h4>
            <p className="text-xs text-western-cream/65 mb-4">{meta.pecas}</p>

            <ul className="space-y-2 mb-5">
              {upgradeBenefits.map((b, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-western-cream/85 leading-snug">
                  <Plus className="h-3.5 w-3.5 text-western-gold mt-0.5 shrink-0" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>

            <div className="mt-auto">
              <div className="flex items-baseline gap-3 flex-wrap">
                <p className="font-display text-2xl text-western-gold">
                  {formatBRL(upgrade.preco, "BRL")}
                </p>
                {delta > 0 && (
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-western-cream/70">
                    +{formatBRL(delta, "BRL")}
                  </span>
                )}
              </div>
              <div className="mt-4 flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={handleSwap}
                  disabled={cartLoading || !upProduct}
                  className="flex-1 inline-flex items-center justify-center gap-2 h-11 bg-western-gold text-western-green-deep hover:bg-western-gold/90 font-mono text-[11px] uppercase tracking-[0.22em] transition-colors disabled:opacity-60"
                >
                  {cartLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : inCart ? (
                    <><Check className="h-4 w-4" /> Adicionado</>
                  ) : (
                    <><ShoppingBag className="h-4 w-4" /> Reservar upgrade</>
                  )}
                </button>
                <Link
                  to={`/produtos/${upgrade.handle}`}
                  className="inline-flex items-center justify-center gap-2 h-11 px-3 border border-western-cream/30 text-western-cream hover:border-western-gold hover:text-western-gold font-mono text-[10px] uppercase tracking-[0.22em] transition-colors"
                >
                  Detalhes <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </div>
        </motion.article>
      </div>

      <p className="mt-5 text-xs text-western-stone-warm/80 italic max-w-2xl">
        Faisal observa: 7 em cada 10 arquitetos que escolheram {metaBase.label.toLowerCase()} fizeram o upgrade depois de ver o cliente final reagir ao projeto.
      </p>

      <GuideStepFooter
        onBack={onBack}
        onNext={onNext}
        nextLabel={inCart ? "Seguir com o upgrade" : "Manter o conjunto base"}
        skipLabel={!inCart ? "Não, pode seguir" : undefined}
        onSkip={!inCart ? onNext : undefined}
        addedCount={inCart ? 1 : 0}
      />
    </motion.div>
  );
}
