import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import GatedPrice from "@/components/shared/GatedPrice";

interface Props {
  onBack?: () => void;
  onNext: () => void;
  nextLabel: string;
  skipLabel?: string;
  onSkip?: () => void;
  /** Quantidade de itens adicionados nesta etapa (controla copy/estado). */
  addedCount?: number;
}

export default function GuideStepFooter({
  onBack,
  onNext,
  nextLabel,
  skipLabel,
  onSkip,
  addedCount = 0,
}: Props) {
  const items = useCartStore((s) => s.items);
  const total = items.reduce(
    (acc, i) => acc + parseFloat(i.price.amount) * i.quantity,
    0
  );
  const totalQty = items.reduce((acc, i) => acc + i.quantity, 0);

  // Mobile sticky: mostra um CTA fixo quando o footer in-flow não está visível
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [showStickyMobile, setShowStickyMobile] = useState(false);

  useEffect(() => {
    if (!sentinelRef.current) return;
    const obs = new IntersectionObserver(
      ([entry]) => setShowStickyMobile(!entry.isIntersecting),
      { rootMargin: "0px 0px -10% 0px", threshold: 0 }
    );
    obs.observe(sentinelRef.current);
    return () => obs.disconnect();
  }, []);

  return (
    <>
      <div ref={sentinelRef} className="mt-12 pt-6 border-t border-western-stone-warm/15">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-western-stone-warm hover:text-western-green-deep transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Voltar
              </button>
            )}
            {onSkip && skipLabel && (
              <button
                type="button"
                onClick={onSkip}
                className="font-mono text-[11px] uppercase tracking-[0.2em] text-western-stone-warm/70 hover:text-western-green-deep underline-offset-4 hover:underline"
              >
                {skipLabel}
              </button>
            )}
          </div>

          <div className="flex items-center gap-5">
            {totalQty > 0 && (
              <div className="text-right hidden sm:block">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-western-stone-warm">
                  Orçamento parcial · {totalQty} {totalQty === 1 ? "item" : "itens"}
                </p>
                <GatedPrice
                  amount={total}
                  className="font-display text-lg text-western-green-deep leading-tight"
                  variant="block"
                />
              </div>
            )}
            <button type="button" onClick={onNext} className="btn-gold">
              {nextLabel} <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
        {addedCount > 0 && (
          <p className="mt-3 text-xs text-western-stone-warm sm:hidden">
            {addedCount} {addedCount === 1 ? "item adicionado" : "itens adicionados"} nesta etapa
          </p>
        )}
      </div>

      {/* Sticky mobile CTA — aparece quando o footer sai da tela. xl:hidden e bottom acima da barra do carrinho mobile. */}
      <div
        className={`xl:hidden fixed left-0 right-0 z-30 px-4 transition-all duration-300 ${
          showStickyMobile ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0 pointer-events-none"
        }`}
        style={{ bottom: "76px" }}
        aria-hidden={!showStickyMobile}
      >
        <div className="flex items-center gap-2 bg-white border border-western-stone-warm/20 shadow-[0_12px_32px_-12px_rgba(15,40,24,0.25)] p-2">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              aria-label="Voltar"
              className="h-11 w-11 shrink-0 inline-flex items-center justify-center text-western-stone-warm hover:text-western-green-deep border border-western-stone-warm/20"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
          )}
          <button
            type="button"
            onClick={onNext}
            className="btn-gold flex-1 justify-center h-11"
          >
            <span className="truncate">{nextLabel}</span>
            <ArrowRight className="h-4 w-4 shrink-0" />
          </button>
        </div>
      </div>
    </>
  );
}
