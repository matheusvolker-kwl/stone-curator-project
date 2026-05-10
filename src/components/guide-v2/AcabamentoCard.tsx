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
        "group flex items-center gap-4 px-5 h-[92px] bg-white border text-left transition-all",
        selected
          ? "border-western-green-deep border-2 shadow-[0_18px_28px_-22px_hsl(var(--western-stone-dark)/0.4)]"
          : "border-western-stone-warm/15 hover:border-western-gold/60"
      )}
    >
      <span
        aria-hidden
        className={cn(
          "w-11 h-11 rounded-full border flex-shrink-0 transition-transform",
          selected ? "border-western-gold scale-105" : "border-western-stone-warm/20 group-hover:scale-105"
        )}
        style={{ backgroundColor: meta.chip }}
      />
      <div className="flex flex-col min-w-0">
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-western-gold">
          {String(index).padStart(2, "0")}
        </span>
        <span className="flex items-center gap-2 mt-0.5">
          <span className="font-display text-[17px] text-western-green-deep leading-none">{meta.label}</span>
          {meta.tag && (
            <span className="font-mono text-[9px] uppercase tracking-wider px-1.5 py-0.5 bg-western-gold text-western-green-deep">
              {meta.tag}
            </span>
          )}
        </span>
      </div>
    </button>
  );
}
