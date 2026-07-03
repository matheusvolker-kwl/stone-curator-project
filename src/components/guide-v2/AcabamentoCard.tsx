import { cn } from "@/lib/utils";
import type { Acabamento } from "./types";
import { acabamentoMeta } from "./types";
import { acabamentoTexturas } from "@/lib/acabamentoTexturas";


interface Props {
  value: Acabamento;
  index: number;
  selected: boolean;
  onSelect: (v: Acabamento) => void;
}

export default function AcabamentoCard({ value, index, selected, onSelect }: Props) {
  const meta = acabamentoMeta[value];
  return (
    <div className="relative">
      {/* Fita gold escapando do canto superior direito quando há tag */}
      {meta.tag && (
        <div
          aria-hidden
          className="absolute -top-2 -right-2 z-10 px-2.5 py-1 bg-western-gold text-western-green-deep font-mono text-[9px] uppercase tracking-[0.22em] shadow-[0_8px_14px_-8px_hsl(var(--western-stone-dark)/0.5)]"
        >
          ◆ {meta.tag}
        </div>
      )}
      <button
        type="button"
        onClick={() => onSelect(value)}
        aria-pressed={selected}
        className={cn(
          "group flex items-center gap-4 px-5 h-[96px] bg-white border text-left w-full transition-all duration-500",
          selected
            ? "border-western-gold shadow-[0_22px_32px_-22px_hsl(var(--western-stone-dark)/0.4)] anim-settle"
            : "border-western-stone-warm/15 hover:border-western-gold/60 hover:-translate-y-0.5"
        )}
      >
        <span
          aria-hidden
          className={cn(
            "w-12 h-12 rounded-full border flex-shrink-0 transition-all duration-500 relative bg-cover bg-center overflow-hidden",
            selected
              ? "border-western-gold scale-110 rotate-[8deg] shadow-[0_8px_18px_-10px_hsl(var(--western-stone-dark)/0.5)]"
              : "border-western-stone-warm/20 group-hover:scale-105 group-hover:rotate-3"
          )}
          style={{
            backgroundColor: meta.chip,
            backgroundImage: acabamentoTexturas[value] ? `url(${acabamentoTexturas[value]})` : undefined,
          }}
        >
          <span
            aria-hidden
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse at 30% 25%, rgba(255,255,255,0.35) 0%, transparent 55%)",
            }}
          />
        </span>

        <div className="flex flex-col min-w-0">
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-western-gold">
            {String(index).padStart(2, "0")}
          </span>
          <span className="font-display text-[18px] text-western-green-deep leading-none mt-0.5">
            {meta.label}
          </span>
        </div>
      </button>
    </div>
  );
}
