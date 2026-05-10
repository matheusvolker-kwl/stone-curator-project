import { Check, Plus } from "lucide-react";
import { formatPreco } from "@/data/guideMap";
import type { AutoralItem } from "./autoraisCatalog";
import { cn } from "@/lib/utils";

interface Props {
  item: AutoralItem;
  index?: number;
  selected: boolean;
  qty?: number;
  onToggle: () => void;
  onOpen?: () => void;
}

export default function AutoralCard({ item, selected, qty = 0, onToggle, onOpen }: Props) {
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

        {/* Botão flutuante + / check com qty */}
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onToggle(); }}
          aria-label={selected ? "Remover do projeto" : "Adicionar ao projeto"}
          className={cn(
            "absolute top-2 right-2 inline-flex items-center justify-center h-8 rounded-full font-mono text-[10px] uppercase tracking-[0.18em] transition-all duration-300",
            selected
              ? "bg-western-green-deep text-western-cream anim-settle px-2.5 gap-1.5 min-w-[32px]"
              : "w-8 bg-white/95 text-western-green-deep border border-western-stone-warm/20 hover:bg-western-gold hover:border-western-gold opacity-0 group-hover:opacity-100"
          )}
        >
          {selected ? (
            qty > 1 ? <><Check className="h-3 w-3" strokeWidth={2.5} /> {qty}×</> : <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
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
      </div>
    </article>
  );
}
