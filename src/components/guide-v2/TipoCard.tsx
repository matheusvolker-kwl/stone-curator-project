import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import type { TipoVisual } from "./types";

interface Props {
  value: TipoVisual;
  label: string;
  microcopy?: string;
  image: string;
  selected: boolean;
  onSelect: (v: TipoVisual) => void;
  variant?: "wide";
}

export default function TipoCard({ value, label, microcopy, image, selected, onSelect, variant }: Props) {
  return (
    <button
      type="button"
      onClick={() => onSelect(value)}
      aria-pressed={selected}
      className={cn(
        "group relative flex flex-col text-left bg-white border transition-all duration-500 overflow-hidden",
        selected
          ? "border-western-gold shadow-[0_36px_56px_-30px_hsl(var(--western-stone-dark)/0.45)] anim-settle"
          : "border-western-stone-warm/15 hover:border-western-gold/60 hover:shadow-[0_28px_44px_-30px_hsl(var(--western-stone-dark)/0.35)] hover:-translate-y-1",
        variant === "wide" ? "col-span-2" : ""
      )}
    >
      <div className="aspect-[4/5] w-full relative overflow-hidden bg-western-paper">
        <img
          src={image}
          alt=""
          aria-hidden
          loading="lazy"
          decoding="async"
          className={cn(
            "w-full h-full object-cover transition-all duration-700",
            selected ? "scale-[1.04]" : "group-hover:scale-[1.03]",
            !selected && "grayscale-[20%] group-hover:grayscale-0"
          )}
        />
        {/* gradient leitura */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(180deg, transparent 55%, hsl(var(--western-green-deep) / 0.55) 100%)",
          }}
        />
        {selected && (
          <span
            aria-hidden
            className="anim-mark absolute top-3 left-3 inline-flex items-center justify-center w-7 h-7 bg-western-gold text-western-green-deep"
          >
            <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
          </span>
        )}
      </div>
      <div className="px-5 pt-4 pb-5 border-t border-western-stone-warm/10">
        <div className="font-display text-[18px] text-western-green-deep leading-tight">{label}</div>
        {microcopy && (
          <div className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-western-gold">
            {microcopy}
          </div>
        )}
      </div>
    </button>
  );
}
