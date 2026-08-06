import { Fragment, useMemo } from "react";
import { Link } from "react-router-dom";

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
    <section className="surface-paper py-10 md:py-14 scroll-mt-24" id="tamanho">
      <div className="container-western">
        <header className="mb-6 md:mb-8 max-w-2xl">
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
            <figure className="relative m-0 overflow-hidden rounded-xl border border-western-border-soft bg-western-cream-muted">
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
            {/* V2 (06/08): cada número com o PRÓPRIO rótulo em cima. A v1
                punha a legenda na linha meta, longe dos números — o dono
                reprovou (obrigava a mapear a ordem de cabeça). A régua única
                de 18/07 segue viva: células na mesma linha, × entre medidas,
                divisor antes do peso. */}
            <div className="flex flex-wrap items-end gap-x-2.5 gap-y-3">
              {cells.map((d, i) => (
                <Fragment key={d.label}>
                  {i > 0 && (
                    <span
                      aria-hidden
                      className="pb-0.5 font-sans text-[16px] text-western-border-strong"
                    >
                      ×
                    </span>
                  )}
                  <span>
                    <span className="mb-1 block font-sans text-[11px] font-semibold uppercase tracking-[0.1em] text-western-stone-warm">
                      {d.label}
                    </span>
                    <span className="font-sans text-[26px] md:text-[30px] font-bold tabular-nums leading-none text-western-green-deep">
                      {d.v}
                    </span>
                  </span>
                </Fragment>
              ))}
              {cells.length > 0 && (
                <span className="pb-0.5 font-sans text-[14px] text-western-stone-warm">cm</span>
              )}
              {peso && (
                <>
                  {cells.length > 0 && (
                    <span
                      aria-hidden
                      className="mx-1.5 pb-0.5 font-normal text-western-border-strong"
                    >
                      |
                    </span>
                  )}
                  <span>
                    <span className="mb-1 block font-sans text-[11px] font-semibold uppercase tracking-[0.1em] text-western-stone-warm">
                      Peso
                    </span>
                    <span className="font-sans text-[26px] md:text-[30px] font-bold tabular-nums leading-none text-western-green-deep">
                      {peso}
                      <span className="ml-1 text-[14px] font-normal text-western-stone-warm">kg</span>
                    </span>
                  </span>
                </>
              )}
            </div>
            <p className="text-meta mt-2.5 max-w-[54ch]">
              {peso && (
                <>
                  Pedra natural do mesmo tamanho:{" "}
                  <b className="text-western-stone-warm">≈{x10?.toLocaleString("pt-BR")} kg</b> ·{" "}
                  <span className="font-semibold text-western-green-deep">10× mais leve</span> ·{" "}
                </>
              )}
              variação artesanal de até 5% por peça
            </p>

            {peso && (
              <>
                <p className="mt-4 flex items-center gap-2 font-sans text-[15px] font-semibold text-western-green-deep">
                  <svg
                    width="18"
                    height="18"
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
                  Sobe sem guindaste — instala em terraços, coberturas e pavimentos altos.
                </p>
                <p className="mt-3">
                  <Link
                    to="/a-pedra"
                    className="tap-target inline-flex items-center gap-1.5 font-sans text-[15px] font-semibold text-western-green-deep hover:text-western-cta transition-colors"
                  >
                    Por que ela pesa 10% →
                  </Link>
                </p>
              </>
            )}

            {/* Separa os dois modelos de dado: a PEÇA (aqui) e a CAIXA (Entrega).
             * Sem repetir número — só aponta o caminho. */}
            <p className="mt-5 pt-4 border-t border-western-border-soft text-meta">
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
