import { cn } from "@/lib/utils";
import iconePedra from "@/assets/icone-pedra-verde.png";
import type { TipoVisual } from "./types";

interface Props {
  value: TipoVisual;
  label: string;
  microcopy?: string;
  selected: boolean;
  onSelect: (v: TipoVisual) => void;
  variant?: "wide";
}

export default function TipoCard({ value, label, microcopy, selected, onSelect, variant }: Props) {
  return (
    <button
      type="button"
      onClick={() => onSelect(value)}
      aria-pressed={selected}
      className={cn(
        "group relative flex flex-col text-left bg-white border transition-all overflow-hidden",
        selected
          ? "border-western-green-deep border-2 shadow-[0_22px_36px_-26px_hsl(var(--western-stone-dark)/0.45)]"
          : "border-western-stone-warm/15 hover:border-western-gold/60 hover:shadow-[0_18px_32px_-26px_hsl(var(--western-stone-dark)/0.35)]",
        variant === "wide" ? "col-span-2 md:col-span-2" : ""
      )}
    >
      <div className="aspect-[4/3] w-full bg-western-paper relative overflow-hidden flex items-center justify-center">
        <img
          src={iconePedra}
          alt=""
          aria-hidden
          className={cn(
            "h-12 transition-opacity duration-500",
            selected ? "opacity-50" : "opacity-25 group-hover:opacity-40"
          )}
        />
        {selected && (
          <span className="absolute top-3 left-3 w-1.5 h-1.5 rounded-full bg-western-gold" />
        )}
      </div>
      <div className="px-5 pt-4 pb-5 border-t border-western-stone-warm/10">
        <div className="font-display text-[17px] text-western-green-deep leading-tight">{label}</div>
        {microcopy && (
          <div className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-western-gold">
            {microcopy}
          </div>
        )}
      </div>
    </button>
  );
}
