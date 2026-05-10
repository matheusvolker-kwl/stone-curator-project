import { cn } from "@/lib/utils";
import type { Acabamento } from "./types";
import { acabamentoMeta } from "./types";

interface Props {
  value: Acabamento;
  index: number;
  selected: boolean;
  onSelect: (v: Acabamento) => void;
}

export default function AcabamentoCard({ value, index, selected, onSelect }: Props) {
  const meta = acabamentoMeta[value];
  return (
    <button
      type="button"
      onClick={() => onSelect(value)}
      aria-pressed={selected}
      className={cn(
        "flex items-center gap-3 px-4 h-[88px] bg-card border text-left transition-all",
        selected
          ? "border-western-green-deep border-2"
          : "border-western-stone-warm/20 hover:border-western-stone-warm/60"
      )}
    >
      <span
        aria-hidden
        className="w-9 h-9 rounded-full border border-western-stone-warm/20 flex-shrink-0"
        style={{ backgroundColor: meta.chip }}
      />
      <div className="flex flex-col">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-western-stone-warm/70">
          {String(index).padStart(2, "0")}
        </span>
        <span className="flex items-center gap-2">
          <span className="font-display text-base text-western-green-deep">{meta.label}</span>
          {meta.tag && (
            <span className="font-mono text-[9px] uppercase tracking-wider px-1.5 py-0.5 bg-western-gold text-western-cream">
              {meta.tag}
            </span>
          )}
        </span>
      </div>
    </button>
  );
}
