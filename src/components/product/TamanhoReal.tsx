import { useMemo } from "react";

interface Props {
  productTitle: string;
  /** SKU do produto (pode vir com sufixo de variante, ex.: "WEST-CSB-A"). */
  sku?: string | null;
  /** Dimensões da peça (sem embalagem), de parseDescription. */
  dims?: { c: string; l: string; a: string } | null;
  /** Peso líquido da peça em kg, ex.: "190". */
  pesoKg?: string | null;
}

// Resolução automática da foto de escala por SKU.
// Arquivos: src/assets/escala/WEST-<CODE>.webp (mulher de 1,70 m ao lado da peça real).
const RAW = import.meta.glob("/src/assets/escala/*.webp", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;

const ESCALA: Record<string, string> = {};
for (const path in RAW) {
  const file = path.split("/").pop() ?? "";
  const name = file.replace(/\.[^.]+$/, "").toUpperCase(); // WEST-CSB
  ESCALA[name] = RAW[path];
}

// SKU real vem com prefixo de marca e sufixo de variante (ex.: "WEST-CSB-A").
// A foto de escala é por código base: "WEST-<CODE>".
function baseKey(sku?: string | null): string {
  if (!sku) return "";
  const s = sku.trim().toUpperCase();
  const m = s.match(/^WEST(?:ERN)?-[A-Z0-9]+/);
  return m ? m[0].replace(/^WESTERN-/, "WEST-") : "";
}

export default function TamanhoReal({ productTitle, sku, dims, pesoKg }: Props) {
  const img = useMemo(() => ESCALA[baseKey(sku)] ?? null, [sku]);

  const peso = pesoKg ? Number(pesoKg) : null;
  if (!img || !peso || Number.isNaN(peso)) return null;

  const x10 = Math.round(peso * 10);
  const cells = dims
    ? [
        { label: "Comprimento", v: dims.c },
        { label: "Largura", v: dims.l },
        { label: "Altura", v: dims.a },
      ].filter((d) => d.v)
    : [];

  return (
    <section className="bg-western-paper py-14 md:py-20" id="tamanho">
      <div className="max-w-5xl mx-auto px-6 md:px-8">
        <header className="mb-8 md:mb-10 max-w-2xl">
          <p className="text-section-label mb-3">A leveza · Tamanho real</p>
          <h2 className="font-display text-3xl md:text-4xl text-western-green-deep leading-tight">
            Do lado de uma pessoa de 1,70 m
          </h2>
          <p className="mt-3 text-spec text-western-stone-warm leading-relaxed">
            Pra você sentir o tamanho e o peso na hora — sem fazer conta.
          </p>
        </header>

        <div className="grid md:grid-cols-[minmax(220px,330px)_1fr] gap-8 md:gap-12 md:items-center">
          <figure className="relative m-0 overflow-hidden rounded-sm border border-western-stone-warm/15 bg-western-cream-muted">
            <img
              src={img}
              alt={`Pessoa de 1,70 m ao lado de ${productTitle} — referência de tamanho real`}
              loading="lazy"
              decoding="async"
              className="block w-full aspect-[4/5] object-cover"
            />
            <figcaption className="absolute inset-x-0 bottom-0 flex items-center gap-2 px-3 py-2.5 bg-gradient-to-t from-western-green-deep/90 to-transparent">
              <svg width="9" height="15" viewBox="0 0 9 15" fill="#fff" aria-hidden="true">
                <circle cx="4.5" cy="2.6" r="2.3" />
                <path d="M4.5 5.4c-1.9 0-3 1.2-3 3.1V11h1.1v3.4h3.8V11H7.5V8.5c0-1.9-1.1-3.1-3-3.1Z" />
              </svg>
              <span className="font-mono text-[10.5px] font-bold tracking-wide text-white">
                Pessoa de 1,70 m · escala real
              </span>
            </figcaption>
          </figure>

          <div className="min-w-0">
            {cells.length > 0 && (
              <>
                <p className="font-mono text-[10.5px] font-bold uppercase tracking-[0.12em] text-western-stone-warm/70 mb-3">
                  Dimensões · cm
                </p>
                <div className="flex flex-wrap items-end gap-x-7 gap-y-4 mb-6">
                  {cells.map((d) => (
                    <div key={d.label} className="flex flex-col leading-none">
                      <span className="font-mono text-[34px] font-bold text-western-green-deep tracking-tight tabular-nums">
                        {d.v}
                      </span>
                      <span className="mt-2 text-[11px] uppercase tracking-wide text-western-stone-warm/70">
                        {d.label}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}

            <div className="border-t border-western-stone-warm/15 pt-5">
              <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                <div>
                  <p className="text-[12px] text-western-stone-warm/80 mb-0.5">Western</p>
                  <p className="font-mono text-[26px] font-bold text-western-green-deep leading-none">
                    {peso}
                    <span className="text-[14px] font-normal text-western-stone-warm ml-1">kg</span>
                  </p>
                </div>
                <div>
                  <p className="text-[12px] text-western-stone-warm/80 mb-0.5 max-w-[22ch]">
                    Pedra natural do mesmo tamanho
                  </p>
                  <p className="font-mono text-[26px] font-semibold text-western-stone-warm/80 leading-none">
                    ≈{x10.toLocaleString("pt-BR")}
                    <span className="text-[14px] font-normal ml-1">kg</span>
                  </p>
                </div>
                <span className="font-mono text-[12.5px] font-bold text-western-green-deep bg-western-paper border border-western-stone-warm/30 px-3 py-1.5 rounded-full">
                  10× mais leve
                </span>
              </div>
              <p className="mt-5 flex items-center gap-2 text-[16px] font-medium text-western-green-deep">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="shrink-0"
                >
                  <path d="M3 8.5l3.2 3.2L13 5" />
                </svg>
                Sobe sem guindaste — instala até em laje.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
