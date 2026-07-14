import { useMemo } from "react";

interface Props {
  productTitle: string;
  /** SKU do produto (pode vir com sufixo de variante, ex.: "WEST-CSB-A"). */
  sku?: string | null;
  /** Dimensões da PEÇA (sem embalagem), de parseDescription → "Ficha técnica". */
  dims?: { c: string; l: string; a: string } | null;
  /** Peso líquido da PEÇA em kg, ex.: "190". */
  pesoKg?: string | null;
}

/**
 * ÚNICO lugar da PDP onde a medida e o peso REAIS da peça aparecem.
 *
 * Por quê aqui: é onde a pergunta "que tamanho isso tem de verdade?" nasce —
 * colada à foto de escala humana e à decisão de compra. E o argumento central
 * da marca (equivalente natural = peso × 10) só existe COM o peso ao lado.
 * Especificações não repete nenhum número; a peça EMBALADA (volumes, caixas,
 * peso bruto) vive só em "Entrega", que é onde ela importa: o frete.
 */

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

function scrollToEntrega(e: React.MouseEvent) {
  e.preventDefault();
  document.getElementById("entrega")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function TamanhoReal({ productTitle, sku, dims, pesoKg }: Props) {
  const img = useMemo(() => ESCALA[baseKey(sku)] ?? null, [sku]);

  const pesoNum = pesoKg ? Number(pesoKg) : null;
  const peso = pesoNum && !Number.isNaN(pesoNum) ? pesoNum : null;

  const cells = dims
    ? [
        { label: "Comprimento", v: dims.c },
        { label: "Largura", v: dims.l },
        { label: "Altura", v: dims.a },
      ].filter((d) => d.v)
    : [];

  // Este bloco é a ÚNICA casa da medida e do peso da peça. Se a foto de escala
  // faltar num SKU novo, o bloco continua de pé (sem a foto) — o número nunca
  // pode sumir da página. Hoje os 50 códigos do catálogo têm foto.
  if (!peso && cells.length === 0) return null;

  const x10 = peso ? Math.round(peso * 10) : null;

  return (
    <section className="surface-paper py-14 md:py-20 scroll-mt-24" id="tamanho">
      <div className="max-w-5xl mx-auto px-6 md:px-8">
        <header className="mb-9 md:mb-12 max-w-2xl">
          <p className="text-section-label mb-3">A leveza · Tamanho real</p>
          <h2 className="display-lg text-western-green-deep">
            {img ? "Do lado de uma pessoa de 1,70 m" : "Tamanho e peso reais"}
          </h2>
          <p className="text-body mt-3">
            Pra você sentir o tamanho e o peso na hora — sem fazer conta.
          </p>
        </header>

        <div
          className={
            img
              ? "grid md:grid-cols-[minmax(220px,330px)_1fr] gap-8 md:gap-12 md:items-center"
              : "grid"
          }
        >
          {img && (
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
          )}

          <div className="min-w-0">
            {cells.length > 0 && (
              <>
                <p className="text-sublabel mb-4">Dimensões da peça · cm</p>
                <div className="flex flex-wrap items-end gap-x-8 gap-y-5 mb-4">
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
                <p className="text-meta mb-7">Variação artesanal de até ±3 cm por peça</p>
              </>
            )}

            {peso && (
              <div className="border-t border-western-border-soft pt-6">
                <p className="text-sublabel mb-4">Peso da peça · kg</p>
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
                      ≈{x10?.toLocaleString("pt-BR")}
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
            )}

            {/* Separa os dois modelos de dado: a PEÇA (aqui) e a CAIXA (Entrega).
             * Sem repetir número — só aponta o caminho. */}
            <p className="mt-7 pt-6 border-t border-western-border-soft text-meta">
              Medidas e peso da peça, sem embalagem. Quantas caixas e quanto pesa para o frete:{" "}
              <a
                href="#entrega"
                onClick={scrollToEntrega}
                className="font-semibold text-western-green-deep underline decoration-western-gold underline-offset-4 hover:decoration-2"
              >
                ver Entrega
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
