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
        "group flex items-center gap-4 px-5 h-[96px] bg-white border text-left transition-all duration-500",
        selected
          ? "border-western-gold shadow-[0_22px_32px_-22px_hsl(var(--western-stone-dark)/0.4)] anim-settle"
          : "border-western-stone-warm/15 hover:border-western-gold/60 hover:-translate-y-0.5"
      )}
    >
      <span
        aria-hidden
        className={cn(
          "w-12 h-12 rounded-full border flex-shrink-0 transition-all duration-500 relative",
          selected
            ? "border-western-gold scale-110 rotate-[8deg] shadow-[0_8px_18px_-10px_hsl(var(--western-stone-dark)/0.5)]"
            : "border-western-stone-warm/20 group-hover:scale-105 group-hover:rotate-3"
        )}
        style={{ backgroundColor: meta.chip }}
      >
        {/* pequeno highlight para dar volume tátil */}
        <span
          aria-hidden
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 30% 25%, rgba(255,255,255,0.45) 0%, transparent 55%)",
          }}
        />
      </span>
      <div className="flex flex-col min-w-0">
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-western-gold">
          {String(index).padStart(2, "0")}
        </span>
        <span className="flex items-center gap-2 mt-0.5">
          <span className="font-display text-[18px] text-western-green-deep leading-none">{meta.label}</span>
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
