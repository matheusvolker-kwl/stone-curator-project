import { cn } from "@/lib/utils";
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
        "group relative flex flex-col text-left bg-card border transition-all overflow-hidden",
        selected
          ? "border-western-green-deep border-2 scale-[1.01]"
          : "border-western-stone-warm/20 hover:border-western-stone-warm/60",
        variant === "wide" ? "col-span-2" : ""
      )}
    >
      <div
        className="aspect-[4/3] w-full"
        style={{
          background:
            "linear-gradient(135deg, hsl(var(--western-cream-muted) / 0.4), hsl(var(--western-cream)))",
        }}
      >
        <div className="w-full h-full flex items-center justify-center text-western-stone-warm/40 font-mono text-[10px] uppercase tracking-[0.2em]">
          {label}
        </div>
      </div>
      <div className="px-4 pt-3 pb-4">
        <div className="font-display text-base text-western-green-deep">{label}</div>
        {microcopy && (
          <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-western-stone-warm/70">
            {microcopy}
          </div>
        )}
      </div>
    </button>
  );
}
