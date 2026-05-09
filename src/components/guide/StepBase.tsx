import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ArrowRight, Check, Loader2, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import {
  nivelMeta,
  tamanhoLabels,
  tipoLabels,
  type ConjuntoLeaf,
  type GuideAnswers,
  type Tipo,
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

function buildIndicadoPara(answers: GuideAnswers): string[] {
  const out: string[] = [];
  const { tipo, tamanho, nivel, composicao, jardim } = answers;
  if (tipo && tamanho && tamanhoLabels[tamanho]) {
    out.push(`${tipoLabels[tipo].toLowerCase()} de ${tamanhoLabels[tamanho].toLowerCase()}`);
  }
  if (tipo && nivel) out.push(`presença ${nivelMeta[tipo][nivel].label.toLowerCase()}`);
  if (composicao === "comNaturais") out.push("projeto que combina Western com pedras naturais");
  if (jardim === "comFonte") out.push("jardim com elemento de água integrado");
  if (nivel === "essencial") out.push("primeiro pedido ou projeto piloto");
  if (nivel === "completa") out.push("projeto cenográfico de alto impacto");
  return out;
}

function PlaceholderImg() {
  return (
    <svg viewBox="0 0 400 400" className="w-full h-full" aria-hidden="true">
      <rect width="400" height="400" fill="hsl(var(--western-green-deep))" />
      <g fill="hsl(var(--western-gold) / 0.35)">
        <ellipse cx="140" cy="290" rx="90" ry="40" />
        <ellipse cx="240" cy="270" rx="120" ry="55" />
        <ellipse cx="200" cy="220" rx="70" ry="30" />
      </g>
      <line x1="40" y1="320" x2="360" y2="320" stroke="hsl(var(--western-gold) / 0.5)" strokeWidth="1" />
    </svg>
  );
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

  const bullets = buildIndicadoPara(answers);
  const precoReal = selectedVariant ? parseFloat(selectedVariant.price.amount) : conjunto.preco;
  const moeda = selectedVariant?.price.currencyCode ?? "BRL";

  // Conjunto base já está no carrinho?
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
    <div className="animate-in fade-in duration-300">
      <p className="text-eyebrow mb-3">Etapa 05 · Seu conjunto</p>
      <h2 className="font-display text-3xl md:text-4xl text-western-green-deep leading-tight mb-8">
        Confirme o conjunto base
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-[5fr_6fr] gap-10 lg:gap-12 items-start">
        {/* Galeria */}
        <div className="space-y-3">
          <div className="aspect-square w-full bg-western-green-deep overflow-hidden">
            {isLoading ? (
              <div className="w-full h-full animate-pulse bg-western-green-mid" />
            ) : heroImg ? (
              <img
                src={cdnImg(heroImg, 1000)}
                alt={conjunto.nome}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              <PlaceholderImg />
            )}
          </div>
          {galeriaImgs.length > 1 && (
            <div className="grid grid-cols-3 gap-3">
              {galeriaImgs.slice(1).map((url, i) => (
                <div key={i} className="aspect-square bg-western-green-deep overflow-hidden">
                  <img
                    src={cdnImg(url, 400)}
                    alt={`${conjunto.nome} – vista ${i + 2}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Conteúdo */}
        <div>
          <div className="w-12 h-px bg-western-gold mb-5" />
          <h3 className="font-display text-2xl md:text-3xl text-western-green-deep leading-[1.1] mb-2">
            {conjunto.nome}
          </h3>
          <p className="text-spec text-western-stone-warm mb-6">{conjunto.subtitulo}</p>

          <div className="mb-1 flex items-baseline gap-3 flex-wrap">
            <p className="text-spec text-western-stone-warm">A partir de</p>
            <p className="font-display text-3xl text-western-green-deep">
              {formatBRL(precoReal, moeda)}
            </p>
          </div>
          <p className="text-xs text-western-stone-warm/80 mb-6">
            Conjunto base · acabamento selecionado
          </p>

          {/* Acabamento */}
          <div className="mb-6 border-t border-western-stone-warm/15 pt-5">
            <div className="flex items-center justify-between mb-3">
              <p className="font-mono uppercase tracking-[0.18em] text-xs text-western-green-deep">
                Acabamento
              </p>
              <p className="text-xs text-western-stone-warm">{acabamento}</p>
            </div>
            <FinishSelector
              values={finishValues}
              selected={acabamento}
              onSelect={setAcabamento}
            />
          </div>

          {/* Indicado para */}
          <div className="border-t border-western-stone-warm/15 pt-5 mb-6">
            <p className="font-mono uppercase tracking-[0.18em] text-xs text-western-green-deep mb-3">
              Indicado para
            </p>
            <ul className="space-y-2">
              {bullets.map((b, i) => (
                <li key={i} className="flex gap-3 text-western-stone-warm text-sm">
                  <Check className="h-4 w-4 text-western-gold mt-0.5 shrink-0" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>

          {parsed?.aplicacoes && parsed.aplicacoes.length > 0 && (
            <div className="border-t border-western-stone-warm/15 pt-5 mb-6">
              <p className="font-mono uppercase tracking-[0.18em] text-xs text-western-green-deep mb-3">
                Peças incluídas
              </p>
              <ul className="space-y-1.5">
                {parsed.aplicacoes.slice(0, 6).map((p, i) => (
                  <li key={i} className="text-sm text-western-stone-warm flex gap-3">
                    <span className="text-western-gold/60 font-mono text-xs mt-0.5">·</span>
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

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
                <ShoppingBag className="h-4 w-4" /> Adicionar conjunto ao orçamento
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
    </div>
  );
}
