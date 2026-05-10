import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
import { cdnImg } from "@/lib/shopify/client";
import { buildCartItem, useCartStore } from "@/stores/cartStore";
import FinishSelector from "@/components/product/FinishSelector";
import GatedPrice from "@/components/shared/GatedPrice";
import GuideProductQuickView from "../GuideProductQuickView";

interface Props {
  conjunto: ConjuntoLeaf;
  answers: GuideAnswers;
  onAcabamentoChange?: (a: string) => void;
}

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

function buildChips(answers: GuideAnswers): string[] {
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

export default function ConjuntoHero({ conjunto, answers, onAcabamentoChange }: Props) {
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

  const heroImg = product?.images.edges[0]?.node.url;
  const chips = buildChips(answers);
  const precoReal = selectedVariant ? parseFloat(selectedVariant.price.amount) : conjunto.preco;
  const moeda = selectedVariant?.price.currencyCode ?? "BRL";
  const tint = tintFor(acabamento);
  const baseAdded = cartItems.some((i) => i.productHandle === conjunto.handle);
  const [quickOpen, setQuickOpen] = useState(false);

  const handleAdd = async () => {
    if (!product || !selectedVariant) {
      toast.error("Conjunto indisponível no momento. Fale com um consultor.");
      return;
    }
    const item = buildCartItem(product, selectedVariant.id, 1);
    if (!item) return;
    await addItem(item);
    toast.success(`${conjunto.nome} adicionado`, { description: `Acabamento ${acabamento}.` });
  };

  return (
    <>
      {/* Desktop sticky panel */}
      <aside className="hidden lg:block lg:sticky lg:top-32 self-start">
        <div className="bg-white border border-western-stone-warm/20 overflow-hidden">
          <div className="relative w-full aspect-[4/5] bg-western-green-deep overflow-hidden">
            {isLoading ? (
              <div className="w-full h-full animate-pulse bg-western-green-mid" />
            ) : heroImg ? (
              <AnimatePresence mode="wait">
                <motion.img
                  key={heroImg}
                  src={cdnImg(heroImg, 900)}
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

            <div className="absolute inset-0 bg-gradient-to-t from-western-green-deep/85 via-western-green-deep/20 to-transparent" />

            <div className="absolute inset-x-0 bottom-0 p-5 text-western-cream">
              <p className="font-mono text-[9px] uppercase tracking-[0.28em] text-western-gold mb-1.5">
                Curadoria · {conjunto.subtitulo}
              </p>
              <h4 className="font-display text-xl leading-[1.1] mb-2.5">
                {conjunto.nome}
              </h4>
              {chips.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {chips.slice(0, 3).map((c) => (
                    <span
                      key={c}
                      className="font-mono text-[9px] uppercase tracking-[0.18em] px-1.5 py-0.5 bg-western-cream/15 backdrop-blur-sm border border-western-cream/20"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="p-5 space-y-4">
            <div>
              <p className="font-mono uppercase tracking-[0.18em] text-[10px] text-western-stone-warm mb-2.5">
                Acabamento
              </p>
              <FinishSelector values={finishValues} selected={acabamento} onSelect={setAcabamento} />
            </div>

            <div className="border-t border-western-stone-warm/15 pt-4">
              <p className="text-spec text-western-stone-warm mb-1">A partir de</p>
              <GatedPrice
                amount={precoReal}
                currency={moeda}
                className="font-display text-2xl text-western-green-deep block leading-none mb-3"
                variant="block"
              />
              <button
                type="button"
                onClick={handleAdd}
                disabled={cartLoading || !selectedVariant}
                className={`w-full justify-center mb-2 ${baseAdded ? "btn-outline-forest" : "btn-gold"} disabled:opacity-60`}
              >
                {cartLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : baseAdded ? (
                  <><Check className="h-4 w-4" /> No projeto · adicionar +1</>
                ) : (
                  <><ShoppingBag className="h-4 w-4" /> Adicionar conjunto</>
                )}
              </button>
              {product && (
                <button
                  type="button"
                  onClick={() => setQuickOpen(true)}
                  className="w-full text-center inline-flex items-center justify-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-western-stone-warm hover:text-western-green-deep transition-colors py-1"
                >
                  Ver detalhes <ArrowRight className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile / Tablet compact sticky bar */}
      <div className="lg:hidden sticky top-16 z-30 -mx-6 md:-mx-8 px-4 md:px-6 py-3 bg-white/95 backdrop-blur-md border-y border-western-stone-warm/20">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => product && setQuickOpen(true)}
            className="relative h-14 w-14 shrink-0 bg-western-green-deep overflow-hidden"
            aria-label="Ver detalhes do conjunto"
          >
            {heroImg && (
              <img
                src={cdnImg(heroImg, 200)}
                alt={conjunto.nome}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            )}
            <div
              className="absolute inset-0 mix-blend-multiply opacity-25"
              style={{ backgroundColor: `hsl(${tint})` }}
              aria-hidden
            />
          </button>
          <div className="flex-1 min-w-0">
            <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-western-gold leading-none mb-1">
              Conjunto base
            </p>
            <p className="font-display text-sm text-western-green-deep leading-tight truncate">
              {conjunto.nome}
            </p>
            <GatedPrice
              amount={precoReal}
              currency={moeda}
              className="font-mono text-[10px] uppercase tracking-[0.18em] text-western-stone-warm"
            />
          </div>
          <button
            type="button"
            onClick={handleAdd}
            disabled={cartLoading || !selectedVariant}
            className={`shrink-0 inline-flex items-center justify-center gap-1.5 h-10 px-3 font-mono text-[10px] uppercase tracking-[0.2em] disabled:opacity-60 ${
              baseAdded
                ? "border border-western-green-deep text-western-green-deep"
                : "bg-western-gold text-western-green-deep hover:bg-western-gold/90"
            }`}
          >
            {cartLoading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : baseAdded ? (
              <><Check className="h-3.5 w-3.5" /> No projeto</>
            ) : (
              <><ShoppingBag className="h-3.5 w-3.5" /> Adicionar</>
            )}
          </button>
        </div>
        <div className="mt-2.5">
          <FinishSelector values={finishValues} selected={acabamento} onSelect={setAcabamento} />
        </div>
      </div>

      <GuideProductQuickView
        handle={product?.handle ?? null}
        open={quickOpen}
        onOpenChange={setQuickOpen}
      />
    </>
  );
}
