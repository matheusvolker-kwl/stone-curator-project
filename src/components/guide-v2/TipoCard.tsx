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

/**
 * Card de tipo de ambiente — DS V3.
 * Card inteiro clicável (alvo muito acima de 48px), título sans 20px, apoio em
 * 14px (mínimo do sistema — antes era display itálico 13px). Selecionado =
 * borda verde 2px + selo dourado sobre a foto (único lugar onde o dourado é o
 * acento certo: sobre imagem o verde não teria contraste).
 */
export default function TipoCard({ value, label, microcopy, image, selected, onSelect, variant }: Props) {
  return (
    <button
      type="button"
      onClick={() => onSelect(value)}
      aria-pressed={selected}
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-lg border-2 bg-white text-left transition-colors duration-200",
        selected
          ? "border-western-cta shadow-[0_22px_36px_-28px_hsl(var(--western-stone-dark)/0.42)]"
          : "border-western-border-soft hover:border-western-border-strong",
        variant === "wide" ? "col-span-2" : ""
      )}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-western-paper">
        <img
          src={image}
          alt=""
          aria-hidden
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover"
        />

        {selected && (
          <span
            aria-hidden
            className="anim-mark absolute left-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-western-gold text-western-green-deep"
          >
            <Check className="h-4 w-4" strokeWidth={2.5} />
          </span>
        )}
      </div>

      <div
        className={cn(
          "flex flex-1 flex-col border-t px-4 py-4 transition-colors duration-200",
          selected ? "border-western-cta/30 bg-western-ivory" : "border-western-border-soft"
        )}
      >
        <span className="font-sans text-[20px] font-semibold leading-tight text-western-green-deep">
          {label}
        </span>
        {microcopy && (
          <span className="text-meta mt-1.5 line-clamp-2 leading-snug">{microcopy}</span>
        )}
      </div>
    </button>
  );
}
