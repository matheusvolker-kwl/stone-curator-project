import { Check } from "lucide-react";
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

/**
 * Card de acabamento — DS V3.
 * Alvo de toque folgado (card inteiro, ≥120px de altura), rótulo sans 20px
 * (nada de display abaixo de 22px), numeral como eyebrow bronze 14px e estado
 * selecionado explícito: borda verde 2px + marca de seleção, não só um brilho.
 * A borda é sempre 2px (cor muda) para não deslocar o layout ao selecionar.
 */
export default function AcabamentoCard({ value, index, selected, onSelect }: Props) {
  const meta = acabamentoMeta[value];

  return (
    <button
      type="button"
      onClick={() => onSelect(value)}
      aria-pressed={selected}
      className={cn(
        "group flex h-full w-full flex-col gap-3 rounded-[10px] border-2 bg-white p-4 text-left transition-colors duration-200 min-h-[120px]",
        selected
          ? "border-western-cta bg-western-ivory shadow-[0_18px_32px_-26px_hsl(var(--western-stone-dark)/0.4)]"
          : "border-western-border-soft hover:border-western-border-strong hover:bg-western-paper"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span
          aria-hidden
          className={cn(
            "h-12 w-12 flex-shrink-0 rounded-full border bg-cover bg-center transition-colors duration-200",
            selected ? "border-western-cta" : "border-western-border-strong"
          )}
          style={{
            backgroundColor: meta.chip,
            backgroundImage: acabamentoTexturas[value] ? `url(${acabamentoTexturas[value]})` : undefined,
          }}
        />

        {selected && (
          <span
            aria-hidden
            className="anim-mark inline-flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-western-cta text-western-cream"
          >
            <Check className="h-4 w-4" strokeWidth={2.5} />
          </span>
        )}
      </div>

      <div className="mt-auto min-w-0">
        <span className="text-eyebrow block tabular-nums">{String(index).padStart(2, "0")}</span>
        <span className="mt-1 block font-sans text-[20px] font-semibold leading-tight text-western-green-deep">
          {meta.label}
        </span>

        {meta.tag && (
          <span className="mt-2 inline-flex items-center rounded-[6px] bg-western-gold px-2 py-1 font-sans text-[14px] font-semibold tracking-[0.06em] text-western-green-deep">
            {meta.tag}
          </span>
        )}
      </div>
    </button>
  );
}
