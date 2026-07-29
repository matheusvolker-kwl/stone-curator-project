// Régua de faixa (dual-range) para filtrar por TAMANHO (cm) ou PESO (kg).
//
// Substitui os antigos "buckets" (Pequeno/Médio/Grande/Enorme), que (a) assustavam
// no rótulo "Enorme" e (b) eram inconsistentes: produto sem medida passava em
// qualquer bucket. Aqui é contínuo — e, quando a faixa é estreitada, o ProductGrid
// exclui quem não tem medida (não há como posicioná-lo na régua).
//
// Técnica: dois <input type="range"> nativos sobrepostos (acessível + ótimo no
// toque). Os trilhos têm pointer-events:none; só os "thumbs" recebem toque
// (ver `.range-thumb` em index.css).

import { cn } from "@/lib/utils";

export interface Range {
  min: number;
  max: number;
}

function label(value: Range, absMin: number, absMax: number, unit: string): string {
  const full = value.min <= absMin && value.max >= absMax;
  if (full) return "qualquer";
  const maxTxt = value.max >= absMax ? `${absMax}+ ${unit}` : `${value.max} ${unit}`;
  if (value.min <= absMin) return `até ${maxTxt}`;
  if (value.max >= absMax) return `${value.min} ${unit} ou mais`;
  return `${value.min}–${value.max} ${unit}`;
}

export default function RangeFilter({
  eyebrow,
  unit,
  absMin,
  absMax,
  step,
  value,
  onChange,
}: {
  eyebrow: string;
  unit: string;
  absMin: number;
  absMax: number;
  step: number;
  value: Range;
  onChange: (v: Range) => void;
}) {
  const full = value.min <= absMin && value.max >= absMax;
  const span = absMax - absMin || 1;
  const pct = (n: number) => ((Math.min(Math.max(n, absMin), absMax) - absMin) / span) * 100;

  return (
    <div>
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <p className="text-eyebrow">{eyebrow}</p>
        <span
          className={cn(
            "text-meta tabular-nums",
            !full && "font-semibold text-western-green-deep",
          )}
        >
          {label(value, absMin, absMax, unit)}
        </span>
      </div>

      {/* Régua */}
      <div className="relative h-9">
        <div className="pointer-events-none absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-western-border-soft" />
        <div
          className="pointer-events-none absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-western-cta"
          style={{ left: `${pct(value.min)}%`, right: `${100 - pct(value.max)}%` }}
        />
        <input
          type="range"
          min={absMin}
          max={absMax}
          step={step}
          value={value.min}
          onChange={(e) =>
            onChange({ min: Math.min(Number(e.target.value), value.max - step), max: value.max })
          }
          aria-label={`${eyebrow} — mínimo (${unit})`}
          className="range-thumb absolute inset-x-0 top-0 h-9 w-full appearance-none bg-transparent"
        />
        <input
          type="range"
          min={absMin}
          max={absMax}
          step={step}
          value={value.max}
          onChange={(e) =>
            onChange({ min: value.min, max: Math.max(Number(e.target.value), value.min + step) })
          }
          aria-label={`${eyebrow} — máximo (${unit})`}
          className="range-thumb absolute inset-x-0 top-0 h-9 w-full appearance-none bg-transparent"
        />
      </div>

      {/* Extremos da régua */}
      <div className="mt-1 flex justify-between text-[13px] tabular-nums text-western-stone-warm">
        <span>{absMin} {unit}</span>
        <span>{absMax}+ {unit}</span>
      </div>
    </div>
  );
}
