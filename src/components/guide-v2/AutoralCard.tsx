import { Minus, Plus } from "lucide-react";
import GatedPrice from "@/components/shared/GatedPrice";
import type { AutoralItem } from "./autoraisCatalog";
import { cn } from "@/lib/utils";

interface Props {
  item: AutoralItem;
  index?: number;
  selected: boolean;
  qty?: number;
  onToggle: () => void;
  onSetQty?: (qty: number) => void;
  onOpen?: () => void;
}

export default function AutoralCard({ item, selected, qty = 0, onToggle, onSetQty, onOpen }: Props) {
  const currentQty = Math.max(qty, selected ? 1 : 0);

  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-lg bg-white cursor-pointer transition-shadow duration-300",
        selected
          ? "border-2 border-western-gold shadow-[0_18px_32px_-26px_hsl(var(--western-stone-dark)/0.4)]"
          : "border border-western-border-soft shadow-[0_12px_24px_-22px_hsl(var(--western-stone-dark)/0.32)] hover:shadow-[0_20px_34px_-26px_hsl(var(--western-stone-dark)/0.4)]"
      )}
      onClick={onOpen}
    >
      <div className="relative aspect-square w-full bg-western-paper overflow-hidden">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.nome}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-contain p-3"
          />
        ) : (
          <div className="w-full h-full bg-western-paper" />
        )}

        {/* Adiciona a 1ª unidade ou mais uma. SEMPRE visível: no mobile (sem
            hover) o botão escondido atrás de group-hover era inalcançável. */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (selected && onSetQty) onSetQty(currentQty + 1);
            else onToggle();
          }}
          aria-label={selected ? `Adicionar mais uma unidade de ${item.nome}` : `Adicionar ${item.nome} ao projeto`}
          className={cn(
            "absolute top-2 right-2 inline-flex h-12 items-center justify-center gap-1.5 rounded-lg font-sans text-[15px] font-semibold tabular-nums transition-colors",
            selected
              ? "anim-settle min-w-tap px-3 bg-western-cta text-western-cream"
              : "w-12 bg-white text-western-green-deep border border-western-border-strong hover:bg-western-cta hover:text-western-cream hover:border-western-cta"
          )}
        >
          {selected ? (
            <>
              <Plus className="h-4 w-4" strokeWidth={2.5} aria-hidden /> {currentQty}×
            </>
          ) : (
            <Plus className="h-5 w-5" aria-hidden />
          )}
        </button>
      </div>

      <div className="flex flex-col flex-1 px-4 py-3.5 border-t border-western-border-soft">
        <h4 className="font-sans text-[16px] font-semibold text-western-green-deep leading-snug line-clamp-2">
          {item.nome}
        </h4>

        <div className="mt-2 flex items-baseline justify-between gap-2">
          <p className="text-meta truncate">{item.codigo}</p>
          <GatedPrice
            amount={item.preco}
            variant="hidden"
            className="font-sans text-[16px] font-semibold tabular-nums text-western-green-deep flex-shrink-0"
          />
        </div>

        {selected && onSetQty && (
          <div
            className="mt-3 inline-flex w-full items-center justify-between rounded-lg border border-western-border-strong bg-western-ivory overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => onSetQty(currentQty - 1)}
              aria-label={currentQty <= 1 ? `Remover ${item.nome} do projeto` : `Diminuir quantidade de ${item.nome}`}
              className="h-12 w-12 inline-flex items-center justify-center text-western-green-deep hover:bg-western-paper transition-colors"
            >
              <Minus className="h-4 w-4" aria-hidden />
            </button>
            <span className="font-sans text-[15px] font-semibold tabular-nums text-western-green-deep">
              {currentQty} no projeto
            </span>
            <button
              type="button"
              onClick={() => onSetQty(currentQty + 1)}
              aria-label={`Aumentar quantidade de ${item.nome}`}
              className="h-12 w-12 inline-flex items-center justify-center text-western-green-deep hover:bg-western-paper transition-colors"
            >
              <Plus className="h-4 w-4" aria-hidden />
            </button>
          </div>
        )}
      </div>
    </article>
  );
}
