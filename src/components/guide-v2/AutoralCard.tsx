import { Minus, Plus } from "lucide-react";
import { formatPreco } from "@/data/guideMap";
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
        "group relative bg-white flex flex-col transition-all duration-300 overflow-hidden cursor-zoom-in",
        selected
          ? "shadow-[0_18px_28px_-22px_hsl(var(--western-stone-dark)/0.45)] outline outline-1 outline-western-gold"
          : "shadow-[0_10px_20px_-18px_hsl(var(--western-stone-dark)/0.35)] hover:-translate-y-0.5 hover:shadow-[0_18px_28px_-22px_hsl(var(--western-stone-dark)/0.4)]"
      )}
      onClick={onOpen}
    >
      {/* Imagem — fundo paper, peça inteira */}
      <div className="relative aspect-square w-full bg-western-paper overflow-hidden">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.nome}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-contain p-3 transition-transform duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="w-full h-full bg-western-paper" />
        )}

        {/* Botão flutuante: adiciona a primeira unidade ou mais uma */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (selected && onSetQty) onSetQty(currentQty + 1);
            else onToggle();
          }}
          aria-label={selected ? "Adicionar mais uma unidade" : "Adicionar ao projeto"}
          className={cn(
            "absolute top-2 right-2 inline-flex items-center justify-center h-8 rounded-full font-mono text-[10px] uppercase tracking-[0.18em] transition-all duration-300",
            selected
              ? "bg-western-green-deep text-western-cream anim-settle px-2.5 gap-1.5 min-w-[32px]"
              : "w-8 bg-white/95 text-western-green-deep border border-western-stone-warm/20 hover:bg-western-gold hover:border-western-gold opacity-0 group-hover:opacity-100"
          )}
        >
          {selected ? (
            <><Plus className="h-3 w-3" strokeWidth={2.5} /> {currentQty}×</>
          ) : (
            <Plus className="h-3.5 w-3.5" />
          )}
        </button>
      </div>

      {/* Info compacta */}
      <div className="px-3.5 py-3 border-t border-western-stone-warm/10">
        <h4 className="font-display text-[14px] text-western-green-deep leading-tight line-clamp-1">
          {item.nome}
        </h4>
        <div className="flex items-baseline justify-between mt-1.5 gap-2">
          <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-western-stone-warm/80 truncate">
            {item.codigo}
          </p>
          <p className="font-display text-[15px] text-western-green-deep flex-shrink-0">
            {formatPreco(item.preco)}
          </p>
        </div>
        {selected && onSetQty && (
          <div
            className="mt-3 inline-flex w-full items-center justify-between border border-western-stone-warm/25 bg-western-ivory"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => onSetQty(currentQty - 1)}
              aria-label={currentQty <= 1 ? "Remover do projeto" : "Diminuir quantidade"}
              className="h-8 w-9 inline-flex items-center justify-center text-western-green-deep hover:bg-western-paper transition-colors"
            >
              <Minus className="h-3 w-3" />
            </button>
            <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-western-green-deep">
              {currentQty} no projeto
            </span>
            <button
              type="button"
              onClick={() => onSetQty(currentQty + 1)}
              aria-label="Aumentar quantidade"
              className="h-8 w-9 inline-flex items-center justify-center text-western-green-deep hover:bg-western-paper transition-colors"
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>
        )}
      </div>
    </article>
  );
}
