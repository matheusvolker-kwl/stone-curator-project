import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Check, Loader2, ShoppingBag, TrendingUp, Plus, Sparkles, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  nivelMeta,
  resolveUpgrade,
  tamanhoLabels,
  tipoLabels,
  type ConjuntoLeaf,
  type GuideAnswers,
  type Tipo,
} from "@/data/guideMap";
import { fetchProduct } from "@/lib/shopify/queries";
import { cdnImg } from "@/lib/shopify/client";
import { parseProductDescription } from "@/lib/shopify/parseDescription";
import { buildCartItem, useCartStore } from "@/stores/cartStore";
import FinishSelector from "@/components/product/FinishSelector";
import GatedPrice from "@/components/shared/GatedPrice";
import GuideProductQuickView from "../GuideProductQuickView";

interface Props {
  conjunto: ConjuntoLeaf;
  answers: GuideAnswers;
  onAcabamentoChange?: (acabamento: string) => void;
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

export default function SectionConjunto({ conjunto, answers, onAcabamentoChange }: Props) {
  const { data: product, isLoading } = useQuery({
    queryKey: ["guide-product", conjunto.handle],
    queryFn: () => fetchProduct(conjunto.handle),
    retry: false,
  });

  const addItem = useCartStore((s) => s.addItem);
  const removeItem = useCartStore((s) => s.removeItem);
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

  const heroImg = product?.images.edges[0]?.node.url;
  const chips = buildChips(answers, conjunto);
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

  // === UPGRADE inline ===
  const upgrade = useMemo(() => resolveUpgrade(answers), [answers]);
  const tipo = answers.tipo as Tipo | undefined;
  const nivelAtual = answers.nivel ?? "essencial";
  const proximoNivel = nivelAtual === "essencial" ? "equilibrada" : "completa";
  const metaUp = upgrade && tipo ? nivelMeta[tipo][proximoNivel] : null;

  const { data: upProduct } = useQuery({
    queryKey: ["upsell-upgrade", upgrade?.handle],
    queryFn: () => (upgrade ? fetchProduct(upgrade.handle) : Promise.resolve(null)),
    enabled: !!upgrade,
    staleTime: 5 * 60 * 1000,
  });

  const upInCart = upgrade ? cartItems.some((i) => i.productHandle === upgrade.handle) : false;
  const swapBaseForUpgrade = async () => {
    if (!upgrade || !upProduct) return;
    const variantId = upProduct.variants.edges[0]?.node.id;
    if (!variantId) return;
    const item = buildCartItem(upProduct, variantId, 1);
    if (!item) return;
    const baseLines = cartItems.filter((i) => i.productHandle === conjunto.handle);
    for (const line of baseLines) await removeItem(line.variantId);
    await addItem(item);
    toast.success(`Upgrade aplicado: ${upgrade.nome}`, { description: "Conjunto base substituído." });
  };
  const addUpgradeOnly = async () => {
    if (!upgrade || !upProduct) return;
    const variantId = upProduct.variants.edges[0]?.node.id;
    if (!variantId) return;
    const item = buildCartItem(upProduct, variantId, 1);
    if (!item) return;
    await addItem(item);
    toast.success(`Upgrade adicionado: ${upgrade.nome}`);
  };

  return (
    <section id="conjunto" className="scroll-mt-28">
      <header className="mb-6">
        <p className="text-eyebrow mb-2">Seu conjunto base</p>
        <h3 className="font-display text-2xl md:text-3xl text-western-green-deep leading-tight">
          A composição que combina com o seu projeto
        </h3>
      </header>

      {/* HERO */}
      <div className="relative w-full aspect-[4/3] sm:aspect-[16/9] md:aspect-[21/9] bg-western-green-deep overflow-hidden mb-6">
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

        <div className="absolute inset-0 bg-gradient-to-t from-western-green-deep/85 via-western-green-deep/30 to-transparent" />

        <div className="absolute inset-x-0 bottom-0 p-5 md:p-8 text-western-cream">
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-western-gold mb-2">
            Curadoria Western · {conjunto.subtitulo}
          </p>
          <h4 className="font-display text-2xl md:text-4xl leading-[1.05] mb-3 max-w-3xl">
            {conjunto.nome}
          </h4>
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
      </div>

      <div className="grid lg:grid-cols-[1.15fr_1fr] gap-8 lg:gap-10">
        {/* esquerda */}
        <div>
          <div className="border-t border-western-stone-warm/15 pt-5 mb-6">
            <p className="font-mono uppercase tracking-[0.18em] text-xs text-western-green-deep mb-4">
              Acabamento
            </p>
            <FinishSelector values={finishValues} selected={acabamento} onSelect={setAcabamento} />
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

        {/* direita: compra + upgrade */}
        <div className="space-y-4">
          <div className="bg-western-cream/40 border border-western-stone-warm/20 p-6">
            <p className="text-spec text-western-stone-warm mb-1">A partir de</p>
            <GatedPrice
              amount={precoReal}
              currency={moeda}
              className="font-display text-3xl text-western-green-deep"
              variant="block"
            />
            <p className="text-xs text-western-stone-warm/80 mb-5">
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
                <><Check className="h-4 w-4" /> No projeto · adicionar de novo</>
              ) : (
                <><ShoppingBag className="h-4 w-4" /> Adicionar conjunto</>
              )}
            </button>
            {product && (
              <button
                type="button"
                onClick={() => setQuickOpen(true)}
                className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-western-stone-warm hover:text-western-green-deep transition-colors"
              >
                Ver detalhes <ArrowRight className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* UPGRADE card */}
          {upgrade && metaUp && (
            <div className="relative bg-western-green-deep text-western-cream border border-western-gold/50 p-5 shadow-[0_24px_60px_-30px_rgba(184,146,79,0.5)]">
              <div className="absolute -top-3 left-4">
                <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.22em] bg-western-gold text-western-green-deep px-2.5 py-1">
                  <TrendingUp className="h-3 w-3" /> Versão {metaUp.label}
                </span>
              </div>
              <p className="font-display text-lg text-western-cream leading-tight mt-2 mb-1">
                Quer levar a um patamar acima?
              </p>
              <p className="text-xs text-western-cream/70 mb-3">
                {upgrade.nome} — {metaUp.pecas}
              </p>
              <div className="flex items-baseline gap-3 mb-4">
                <GatedPrice
                  amount={upgrade.preco}
                  currency="BRL"
                  className="font-display text-xl text-western-gold"
                />
                {upgrade.preco - precoReal > 0 && (
                  <GatedPrice
                    amount={upgrade.preco - precoReal}
                    currency="BRL"
                    className="font-mono text-[10px] uppercase tracking-[0.2em] text-western-cream/60"
                    variant="hidden"
                  />
                )}
              </div>
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={baseAdded ? swapBaseForUpgrade : addUpgradeOnly}
                  disabled={cartLoading || !upProduct}
                  className="inline-flex items-center justify-center gap-2 h-10 bg-western-gold text-western-green-deep hover:bg-western-gold/90 font-mono text-[11px] uppercase tracking-[0.22em] transition-colors disabled:opacity-60"
                >
                  {upInCart ? (
                    <><Check className="h-3.5 w-3.5" /> Upgrade no projeto</>
                  ) : baseAdded ? (
                    <><RefreshCw className="h-3.5 w-3.5" /> Trocar base pelo upgrade</>
                  ) : (
                    <><Sparkles className="h-3.5 w-3.5" /> Aplicar upgrade</>
                  )}
                </button>
                {baseAdded && !upInCart && (
                  <button
                    type="button"
                    onClick={addUpgradeOnly}
                    disabled={cartLoading || !upProduct}
                    className="inline-flex items-center justify-center gap-2 h-9 border border-western-cream/30 text-western-cream/80 hover:border-western-gold hover:text-western-gold font-mono text-[10px] uppercase tracking-[0.2em] transition-colors disabled:opacity-60"
                  >
                    <Plus className="h-3.5 w-3.5" /> Adicionar sem remover base
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <GuideProductQuickView
        handle={product?.handle ?? null}
        open={quickOpen}
        onOpenChange={setQuickOpen}
      />
    </section>
  );
}
