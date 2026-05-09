import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ArrowRight, Check, Loader2, ShoppingBag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  nivelMeta,
  tamanhoLabels,
  tipoLabels,
  type ConjuntoLeaf,
  type GuideAnswers,
} from "@/data/guideMap";
import { fetchProduct } from "@/lib/shopify/queries";
import { cdnImg, formatBRL } from "@/lib/shopify/client";
import { parseProductDescription } from "@/lib/shopify/parseDescription";
import { buildCartItem, useCartStore } from "@/stores/cartStore";
import FinishSelector from "@/components/product/FinishSelector";
import GuideStepFooter from "./GuideStepFooter";

interface Props {
  conjunto: ConjuntoLeaf;
  answers: GuideAnswers;
  onBack: () => void;
  onNext: () => void;
  onAcabamentoChange?: (acabamento: string) => void;
}

// Mapeamento simples de overlay tonal por acabamento (HSL triplet do FinishSelector).
const FINISH_TINT: Record<string, string> = {
  quartzo: "38 35% 86%",
  arenito: "32 36% 65%",
  moledo: "20 30% 45%",
  granito: "140 8% 22%",
};

function tintFor(value: string): string {
  const key = value.toLowerCase().trim().split(/\s+/)[0];
  return FINISH_TINT[key] ?? "30 12% 55%";
}

function buildChips(answers: GuideAnswers, conjunto: ConjuntoLeaf): string[] {
  const out: string[] = [];
  const { tipo, tamanho, nivel, composicao, jardim } = answers;
  if (tipo) out.push(tipoLabels[tipo]);
  if (tipo && tamanho && tamanhoLabels[tamanho]) out.push(tamanhoLabels[tamanho]);
  if (tipo && nivel) out.push(nivelMeta[tipo][nivel].label);
  if (composicao === "comNaturais") out.push("Western + naturais");
  if (composicao === "somenteWestern") out.push("Só Western");
  if (jardim === "comFonte") out.push("Com fonte");
  if (jardim === "seco") out.push("Jardim seco");
  return out;
}

export default function StepBase({ conjunto, answers, onBack, onNext, onAcabamentoChange }: Props) {
  const { data: product, isLoading } = useQuery({
    queryKey: ["guide-product", conjunto.handle],
    queryFn: () => fetchProduct(conjunto.handle),
    retry: false,
  });

  const addItem = useCartStore((s) => s.addItem);
  const cartItems = useCartStore((s) => s.items);
  const cartLoading = useCartStore((s) => s.isLoading);

  const finishOption = product?.options.find((o) => /acabamento/i.test(o.name));
  const finishValues = finishOption?.values ?? ["Quartzo", "Arenito", "Moledo", "Granito"];
  const [acabamento, setAcabamento] = useState<string>(finishValues[0]);

  useEffect(() => {
    if (finishOption && !finishOption.values.includes(acabamento)) {
      setAcabamento(finishOption.values[0]);
    }
  }, [finishOption, acabamento]);

  useEffect(() => {
    onAcabamentoChange?.(acabamento);
  }, [acabamento, onAcabamentoChange]);

  const selectedVariant = useMemo(() => {
    if (!product) return null;
    return (
      product.variants.edges.find((e) =>
        e.node.selectedOptions.some(
          (o) => /acabamento/i.test(o.name) && o.value.toLowerCase() === acabamento.toLowerCase()
        )
      )?.node ?? product.variants.edges[0]?.node ?? null
    );
  }, [product, acabamento]);

  const parsed = useMemo(() => {
    return product?.descriptionHtml ? parseProductDescription(product.descriptionHtml) : null;
  }, [product]);

  const galeriaImgs = product?.images.edges.slice(0, 4).map((e) => e.node.url) ?? [];
  const heroImg = galeriaImgs[0];

  const chips = buildChips(answers, conjunto);
  const precoReal = selectedVariant ? parseFloat(selectedVariant.price.amount) : conjunto.preco;
  const moeda = selectedVariant?.price.currencyCode ?? "BRL";
  const tint = tintFor(acabamento);

  const baseAdded = cartItems.some((i) => i.productHandle === conjunto.handle);

  const handleAdd = async () => {
    if (!product || !selectedVariant) {
      toast.error("Conjunto indisponível no momento. Fale com um consultor.");
      return;
    }
    const item = buildCartItem(product, selectedVariant.id, 1);
    if (!item) return;
    await addItem(item);
    toast.success(`${conjunto.nome} adicionado`, {
      description: `Acabamento ${acabamento}.`,
    });
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <p className="text-eyebrow mb-3">Etapa 05 · Seu conjunto</p>
      <h2 className="font-display text-3xl md:text-4xl text-western-green-deep leading-tight mb-6">
        A composição que combina com o seu projeto
      </h2>

      {/* HERO EDITORIAL */}
      <div className="relative w-full aspect-[16/9] md:aspect-[21/9] bg-western-green-deep overflow-hidden mb-6">
        {isLoading ? (
          <div className="w-full h-full animate-pulse bg-western-green-mid" />
        ) : heroImg ? (
          <AnimatePresence mode="wait">
            <motion.img
              key={heroImg}
              src={cdnImg(heroImg, 1600)}
              alt={conjunto.nome}
              className="absolute inset-0 w-full h-full object-cover"
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              loading="lazy"
            />
          </AnimatePresence>
        ) : null}

        {/* Tint do acabamento — crossfade */}
        <AnimatePresence>
          <motion.div
            key={acabamento}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.22 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 mix-blend-multiply pointer-events-none"
            style={{ backgroundColor: `hsl(${tint})` }}
            aria-hidden
          />
        </AnimatePresence>

        {/* Gradiente para legibilidade do overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-western-green-deep/85 via-western-green-deep/30 to-transparent" />

        {/* Overlay editorial */}
        <div className="absolute inset-x-0 bottom-0 p-5 md:p-8 text-western-cream">
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-western-gold mb-2">
            Curadoria Western · {conjunto.subtitulo}
          </p>
          <h3 className="font-display text-2xl md:text-4xl leading-[1.05] mb-3 max-w-3xl">
            {conjunto.nome}
          </h3>
          {chips.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {chips.map((c) => (
                <span
                  key={c}
                  className="font-mono text-[10px] uppercase tracking-[0.18em] px-2 py-1 bg-western-cream/15 backdrop-blur-sm border border-western-cream/20"
                >
                  {c}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Swatch do acabamento atual */}
        <div className="absolute top-5 right-5 flex items-center gap-2 bg-western-green-deep/60 backdrop-blur-sm px-3 py-2 border border-western-cream/15">
          <motion.span
            key={acabamento}
            initial={{ scale: 0.7 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 320, damping: 22 }}
            className="block w-5 h-5 rounded-full ring-1 ring-western-cream/30"
            style={{ backgroundColor: `hsl(${tint})` }}
            aria-hidden
          />
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-western-cream">
            Acabamento {acabamento}
          </span>
        </div>
      </div>

      {/* Galeria thumb */}
      {galeriaImgs.length > 1 && (
        <div className="grid grid-cols-3 gap-3 mb-8">
          {galeriaImgs.slice(1).map((url, i) => (
            <div key={i} className="aspect-[4/3] bg-western-green-deep overflow-hidden">
              <img
                src={cdnImg(url, 500)}
                alt={`${conjunto.nome} – vista ${i + 2}`}
                className="w-full h-full object-cover hover:scale-[1.04] transition-transform duration-500"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      )}

      <div className="grid lg:grid-cols-[1.15fr_1fr] gap-8 lg:gap-12">
        {/* Detalhes esquerda */}
        <div>
          <div className="border-t border-western-stone-warm/15 pt-5 mb-6">
            <p className="font-mono uppercase tracking-[0.18em] text-xs text-western-green-deep mb-4">
              Acabamento
            </p>
            <FinishSelector
              values={finishValues}
              selected={acabamento}
              onSelect={setAcabamento}
            />
          </div>

          {parsed?.aplicacoes && parsed.aplicacoes.length > 0 && (
            <div className="border-t border-western-stone-warm/15 pt-5">
              <p className="font-mono uppercase tracking-[0.18em] text-xs text-western-green-deep mb-3">
                Peças incluídas
              </p>
              <ul className="space-y-1.5">
                {parsed.aplicacoes.slice(0, 8).map((p, i) => (
                  <li key={i} className="text-sm text-western-stone-warm flex gap-3">
                    <span className="text-western-gold/70 font-mono text-[10px] mt-0.5 w-5">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Compra direita */}
        <div className="lg:sticky lg:top-24 self-start">
          <div className="bg-western-cream/40 border border-western-stone-warm/20 p-6">
            <p className="text-spec text-western-stone-warm mb-1">A partir de</p>
            <p className="font-display text-4xl text-western-green-deep mb-1">
              {formatBRL(precoReal, moeda)}
            </p>
            <p className="text-xs text-western-stone-warm/80 mb-6">
              Conjunto base · acabamento {acabamento.toLowerCase()}
            </p>

            <button
              type="button"
              onClick={handleAdd}
              disabled={cartLoading || !selectedVariant}
              className={`w-full justify-center mb-3 ${baseAdded ? "btn-outline-forest" : "btn-gold"} disabled:opacity-60`}
            >
              {cartLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : baseAdded ? (
                <>
                  <Check className="h-4 w-4" /> Adicionado · adicionar novamente
                </>
              ) : (
                <>
                  <ShoppingBag className="h-4 w-4" /> Reservar este conjunto
                </>
              )}
            </button>

            {product && (
              <Link
                to={`/produtos/${product.handle}`}
                className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-western-stone-warm hover:text-western-green-deep transition-colors"
              >
                Ver detalhes do conjunto <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            )}

            <p className="mt-6 pt-5 border-t border-western-stone-warm/15 text-xs text-western-stone-warm/80 italic leading-relaxed">
              Faisal recomenda: confirme a presença com o acabamento antes de ver os complementos —
              cada acabamento muda a temperatura do projeto.
            </p>
          </div>
        </div>
      </div>

      <GuideStepFooter
        onBack={onBack}
        onNext={onNext}
        nextLabel={baseAdded ? "Seguir para complementos" : "Seguir só com o conjunto base"}
        skipLabel={!baseAdded ? "Ainda não quero adicionar" : undefined}
        onSkip={!baseAdded ? onNext : undefined}
        addedCount={baseAdded ? 1 : 0}
      />
    </motion.div>
  );
}
