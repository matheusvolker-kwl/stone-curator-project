import { Check, Plus, X } from "lucide-react";
import { formatPreco } from "@/data/guideMap";
import type { AutoralItem } from "./autoraisCatalog";
import { cn } from "@/lib/utils";

interface Props {
  item: AutoralItem;
  selected: boolean;
  onToggle: () => void;
}

export default function AutoralCard({ item, selected, onToggle }: Props) {
  return (
    <article
      className={cn(
        "bg-card border p-6 flex flex-col transition-colors",
        selected ? "border-western-green-deep" : "border-western-stone-warm/20"
      )}
    >
      <div
        className="aspect-[4/3] w-full mb-4"
        style={{
          background:
            "linear-gradient(135deg, hsl(var(--western-cream-muted) / 0.5), hsl(var(--western-cream)))",
        }}
      />
      <h4 className="font-display text-[18px] text-western-green-deep leading-tight">{item.nome}</h4>
      <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-western-stone-warm/70 mt-1">
        {item.codigo} · {item.pesoKg} kg
      </p>
      <p className="font-sans text-base font-medium text-western-green-deep mt-2 mb-4">{formatPreco(item.preco)}</p>

      {selected ? (
        <button
          type="button"
          onClick={onToggle}
          className="mt-auto inline-flex items-center justify-between gap-2 px-4 h-11 bg-western-green-deep text-western-cream font-mono text-[11px] uppercase tracking-[0.22em]"
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
          className="mt-auto inline-flex items-center justify-center gap-2 px-4 h-11 border border-western-green-deep text-western-green-deep font-mono text-[11px] uppercase tracking-[0.22em] hover:bg-western-green-deep hover:text-western-cream transition-colors"
        >
          <Plus className="h-3.5 w-3.5" /> Adicionar ao projeto
        </button>
      )}
    </article>
  );
}
