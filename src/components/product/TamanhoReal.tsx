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
    <section className="surface-paper py-14 md:py-20 scroll-mt-24" id="tamanho">
      <div className="max-w-5xl mx-auto px-6 md:px-8">
        <header className="mb-9 md:mb-12 max-w-2xl">
          <p className="text-section-label mb-3">A leveza · Tamanho real</p>
          <h2 className="display-lg text-western-green-deep">
            Do lado de uma pessoa de 1,70 m
          </h2>
          <p className="text-body mt-3">
            Pra você sentir o tamanho e o peso na hora — sem fazer conta.
          </p>
        </header>

        <div className="grid md:grid-cols-[minmax(220px,330px)_1fr] gap-8 md:gap-12 md:items-center">
          <figure className="relative m-0 overflow-hidden rounded-[16px] border border-western-border-soft bg-western-cream-muted">
            <img
              src={img}
              alt={`Pessoa de 1,70 m ao lado de ${productTitle} — referência de tamanho real`}
              loading="lazy"
              decoding="async"
              className="block w-full aspect-[4/5] object-cover"
            />
            <figcaption className="absolute inset-x-0 bottom-0 flex items-center gap-2 px-4 py-3 bg-gradient-to-t from-western-green-deep/90 to-transparent">
              <svg width="10" height="16" viewBox="0 0 9 15" fill="#fff" aria-hidden="true">
                <circle cx="4.5" cy="2.6" r="2.3" />
                <path d="M4.5 5.4c-1.9 0-3 1.2-3 3.1V11h1.1v3.4h3.8V11H7.5V8.5c0-1.9-1.1-3.1-3-3.1Z" />
              </svg>
              <span className="font-sans text-[14px] font-semibold text-white">
                Pessoa de 1,70 m · escala real
              </span>
            </figcaption>
          </figure>

          <div className="min-w-0">
            {cells.length > 0 && (
              <>
                <p className="text-sublabel mb-4">Dimensões · cm</p>
                <div className="flex flex-wrap items-end gap-x-8 gap-y-5 mb-7">
                  {cells.map((d) => (
                    <div key={d.label} className="flex flex-col leading-none">
                      <span className="font-sans text-[34px] font-bold tracking-tight tabular-nums text-western-green-deep">
                        {d.v}
                      </span>
                      <span className="mt-2 font-sans text-[14px] text-western-stone-warm">
                        {d.label}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}

            <div className="border-t border-western-border-soft pt-6">
              <div className="flex flex-wrap items-center gap-x-7 gap-y-4">
                <div>
                  <p className="font-sans text-[14px] text-western-stone-warm mb-1">Western</p>
                  <p className="font-sans text-[28px] font-bold leading-none tabular-nums text-western-green-deep">
                    {peso}
                    <span className="text-[16px] font-normal text-western-stone-warm ml-1">
                      kg
                    </span>
                  </p>
                </div>
                <div>
                  <p className="font-sans text-[14px] text-western-stone-warm mb-1 max-w-[24ch]">
                    Pedra natural do mesmo tamanho
                  </p>
                  <p className="font-sans text-[28px] font-semibold leading-none tabular-nums text-western-stone-warm">
                    ≈{x10.toLocaleString("pt-BR")}
                    <span className="text-[16px] font-normal ml-1">kg</span>
                  </p>
                </div>
                <span className="inline-flex items-center rounded-full border border-western-border-strong bg-white px-4 py-2 font-sans text-[14px] font-semibold text-western-green-deep">
                  10× mais leve
                </span>
              </div>

              <p className="mt-6 flex items-center gap-2 font-sans text-[17px] font-semibold text-western-green-deep">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="shrink-0 text-western-bronze"
                  aria-hidden="true"
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
