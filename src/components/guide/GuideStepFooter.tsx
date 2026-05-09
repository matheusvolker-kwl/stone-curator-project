import { ArrowLeft, ArrowRight } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { formatBRL } from "@/lib/shopify/client";

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

  return (
    <div className="mt-12 pt-6 border-t border-western-stone-warm/15">
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
                Orçamento parcial
              </p>
              <p className="font-display text-lg text-western-green-deep leading-tight">
                {formatBRL(total, "BRL")}{" "}
                <span className="text-xs text-western-stone-warm font-mono">
                  · {totalQty} {totalQty === 1 ? "item" : "itens"}
                </span>
              </p>
            </div>
          )}
          <button
            type="button"
            onClick={onNext}
            className="btn-gold"
          >
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
  );
}
