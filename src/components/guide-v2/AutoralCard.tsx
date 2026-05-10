import { Check, Plus, X } from "lucide-react";
import { formatPreco } from "@/data/guideMap";
import { stoneCrops } from "./imagery";
import type { AutoralItem } from "./autoraisCatalog";
import { cn } from "@/lib/utils";

interface Props {
  item: AutoralItem;
  index?: number;
  selected: boolean;
  onToggle: () => void;
}

export default function AutoralCard({ item, index = 0, selected, onToggle }: Props) {
  const image = stoneCrops[index % stoneCrops.length];
  return (
    <article
      className={cn(
        "bg-white flex flex-col transition-all duration-500 overflow-hidden",
        selected
          ? "shadow-[0_28px_42px_-26px_hsl(var(--western-stone-dark)/0.45)] -translate-y-1 outline outline-1 outline-western-gold"
          : "shadow-[0_18px_32px_-26px_hsl(var(--western-stone-dark)/0.35)] hover:-translate-y-1 hover:shadow-[0_28px_44px_-28px_hsl(var(--western-stone-dark)/0.4)]"
      )}
    >
      <div className="aspect-[4/3] w-full bg-western-paper overflow-hidden">
        <img
          src={image}
          alt=""
          aria-hidden
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover transition-transform duration-700 hover:scale-[1.04]"
        />
      </div>
      <div className="p-6 flex flex-col flex-1 border-t border-western-stone-warm/10">
        <h4 className="font-display text-[20px] text-western-green-deep leading-tight">{item.nome}</h4>
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-western-gold mt-1.5">
          {item.codigo} · {item.pesoKg} kg
        </p>
        <p className="font-display text-[20px] text-western-green-deep mt-3 mb-5">{formatPreco(item.preco)}</p>

        {selected ? (
          <button
            type="button"
            onClick={onToggle}
            className="mt-auto inline-flex items-center justify-between gap-2 px-4 h-12 bg-western-green-deep text-western-cream font-mono text-[11px] uppercase tracking-[0.22em]"
          >
            <span className="inline-flex items-center gap-2">
              <Check className="h-3.5 w-3.5" /> No projeto
            </span>
            <X className="h-3.5 w-3.5" />
          </button>
        ) : (
          <button
            type="button"
            onClick={onToggle}
            className="mt-auto inline-flex items-center justify-center gap-2 px-4 h-12 border border-western-green-deep text-western-green-deep font-mono text-[11px] uppercase tracking-[0.22em] hover:bg-western-green-deep hover:text-western-cream transition-colors"
          >
            <Plus className="h-3.5 w-3.5" /> Adicionar ao projeto
          </button>
        )}
      </div>
    </article>
  );
}
