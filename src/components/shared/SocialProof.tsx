import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import {
  SOCIAL_PROOF,
  SOCIAL_PROOF_LABELS,
  type SocialProofGroup,
  type PessoaComFoto,
  type MarcaComLogo,
} from "@/data/socialProof";
import { resolverProva } from "@/data/socialProofLinks";

const faceImages = import.meta.glob("../../assets/famosos/*.{webp,jpg,jpeg,png}", {
  eager: true, query: "?url", import: "default",
}) as Record<string, string>;
const facePointers = import.meta.glob("../../assets/famosos/*.{webp,jpg,jpeg,png}.asset.json", {
  eager: true,
}) as Record<string, { url?: string; default?: { url?: string } }>;
function buildFotoMap(): Record<string, string> {
  const map: Record<string, string> = {};
  for (const [path, url] of Object.entries(faceImages)) {
    const slug = (path.split("/").pop() ?? "").replace(/\.(webp|jpg|jpeg|png)$/i, "");
    map[slug] = url as string;
  }
  for (const [path, mod] of Object.entries(facePointers)) {
    const slug = (path.split("/").pop() ?? "").replace(/\.(webp|jpg|jpeg|png)\.asset\.json$/i, "");
    const url = mod?.url ?? mod?.default?.url;
    if (url && !map[slug]) map[slug] = url;
  }
  return map;
}
const FOTOS = buildFotoMap();

// (Logos de marcas descontinuados: renderizamos wordmark tipográfico padronizado.)

function iniciais(nome: string): string {
  const limpo = nome.replace(/\(.*?\)/g, "").trim();
  const parts = limpo.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

interface Props {
  groups?: SocialProofGroup[];
  variant?: "light" | "dark";
  compact?: boolean;
  titulo?: React.ReactNode;
  eyebrow?: string;
  className?: string;
  /**
   * Torna clicável APENAS quem tem lastro real (obra + mídia) — resolvido por
   * socialProofLinks. Quem não tem obra continua não-clicável: nada de
   * afordância falsa. Off por padrão (ex.: reasseguro no meio do cadastro).
   */
  interactive?: boolean;
  /**
   * "tiers" (padrão): um rótulo por grupo, grade centralizada e estreita.
   * "row": celebridades + profissionais numa FILEIRA só, largura cheia, sem os
   * rótulos de tier — mostra a função de cada pessoa, que informa mais do que
   * a nossa taxonomia interna.
   */
  layout?: "tiers" | "row";
  /** "left" acompanha o ritmo editorial do resto do site (eyebrow+título à esquerda). */
  align?: "center" | "left";
}

export default function SocialProof({
  groups = ["celebridades", "profissionais", "marcas"],
  variant = "light",
  compact = false,
  titulo,
  eyebrow,
  className = "",
  interactive = false,
  layout = "tiers",
  align = "center",
}: Props) {
  const isRow = layout === "row";
  const isLeft = align === "left";
  const isDark = variant === "dark";

  /* V3: eyebrow = sans semibold 14px, tracking 0.06em. Nunca mono, nunca 10px.
   * Sobre fundo claro a cor é bronze (.text-eyebrow); sobre o verde profundo o
   * bronze não teria contraste, então trocamos por dourado claro. */
  const eyebrowCls = isDark
    ? "font-sans text-[14px] font-semibold uppercase tracking-[0.06em] text-western-gold-soft"
    : "text-eyebrow";

  const nameColor = isDark ? "text-western-cream" : "text-western-green-deep";
  const goldLine = isDark ? "bg-western-gold/50" : "bg-western-gold";
  const tileBg = isDark ? "bg-western-green-mid/40" : "bg-western-cream-muted";
  const monogramText = isDark ? "text-western-gold-soft" : "text-western-green-deep";
  const captionColor = isDark ? "text-western-cream" : "text-western-green-deep";
  const wordmarkColor = isDark ? "text-western-cream" : "text-western-green-deep";
  const tileRing = isDark ? "ring-western-gold/25" : "ring-western-border-soft";

  const avatarGroups = groups.filter(
    (g) => g === "celebridades" || g === "profissionais",
  ) as Array<"celebridades" | "profissionais">;
  const showMarcas = groups.includes("marcas");

  const tierMax = compact ? "max-w-md md:max-w-lg" : "max-w-md md:max-w-2xl";
  const tileGap = compact ? "gap-3 md:gap-4" : "gap-4 md:gap-6";

  const renderPessoa = (c: PessoaComFoto) => {
        const foto = FOTOS[c.slug];
        const prova = interactive ? resolverProva(c.slug) : null;
        const conteudo = (
          <>
            {/* Raio 10px (md do V3) — sem cantos vivos. */}
            <div
              className={`relative w-full aspect-[4/5] overflow-hidden rounded-[10px] ${tileBg} ring-1 ${tileRing} shadow-[0_14px_30px_-20px_rgba(15,41,24,0.45)] transition-all duration-300 ${
                prova ? "group-hover:ring-western-gold/60 group-hover:shadow-[0_18px_36px_-18px_rgba(15,41,24,0.55)]" : ""
              }`}
            >
              {foto ? (
                /* Foto sempre em cor cheia: a prova é o rosto, e no celular não
                 * existe hover para "revelar" a imagem. */
                <img
                  src={foto}
                  alt={`Retrato de ${c.nome}`}
                  loading="lazy"
                  decoding="async"
                  width={320}
                  height={400}
                  className="w-full h-full object-cover object-center transition-transform duration-500 ease-out motion-safe:group-hover:scale-[1.03]"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  {/* Monograma ≥22px — único lugar onde a display cabe aqui. */}
                  <span className={`font-display text-3xl md:text-4xl ${monogramText}`} aria-hidden="true">
                    {iniciais(c.nome)}
                  </span>
                </div>
              )}
            </div>
            {/* Nome: sans semibold 16px (UI). Nunca abaixo de 14px.
                A seta é a afordância de "tem obra atrás" — visível também no
                toque (no celular não existe hover para revelar). */}
            <p
              className={`mt-3 text-center font-sans text-[16px] font-semibold leading-snug ${captionColor} ${
                prova ? "transition-colors group-hover:text-western-gold-soft" : ""
              }`}
            >
              {c.nome}
              {prova && (
                <ArrowUpRight
                  className="inline-block h-3.5 w-3.5 ml-1 -translate-y-[1px] opacity-70"
                  aria-hidden="true"
                />
              )}
            </p>
            {c.papel && (
              <p
                className={`text-center font-sans text-[13px] leading-snug mt-1 ${
                  isDark ? "text-western-cream/60" : "text-western-stone-warm"
                }`}
              >
                {c.papel}
              </p>
            )}
          </>
        );
        return (
          <li key={c.slug} className="group flex flex-col items-center">
            {prova ? (
              <Link
                to={`/obras/${prova.obra.slug}`}
                aria-label={`Ver a obra: ${prova.obra.titulo}`}
                className="flex w-full flex-col items-center"
              >
                {conteudo}
              </Link>
            ) : (
              conteudo
            )}
          </li>
        );
  };

  const renderTier = (pessoas: readonly PessoaComFoto[], full = false) => (
    <ul
      className={
        full
          ? "grid grid-cols-3 gap-4 sm:grid-cols-6 md:gap-6"
          : `grid grid-cols-3 ${tileGap} ${tierMax} mx-auto`
      }
    >
      {pessoas.map(renderPessoa)}
    </ul>
  );

  /* Marcas = WORDMARK tipográfico (decisão de marca: nunca logotipo).
   * Sans semibold, ≥16px, opacidade cheia — legibilidade não depende de hover. */
  const wordmarkFs = compact
    ? { mobile: 16, desktop: 18 }
    : { mobile: 17, desktop: 20 };
  const renderMarca = (m: MarcaComLogo) => {
    const prova = interactive ? resolverProva(m.slug) : null;
    const wordmark = (
      <span
        style={{
          fontSize: `${wordmarkFs.mobile}px`,
          lineHeight: 1.2,
          letterSpacing: "0.02em",
          ["--wm-fs-md" as string]: `${wordmarkFs.desktop}px`,
        }}
        className={`whitespace-nowrap text-center font-sans font-semibold ${wordmarkColor} md:text-[length:var(--wm-fs-md)] ${
          prova ? "transition-colors group-hover/marca:text-western-gold-soft" : ""
        }`}
      >
        {m.nome}
        {prova && (
          <ArrowUpRight
            className="inline-block h-3 w-3 ml-1 -translate-y-[1px] opacity-70"
            aria-hidden="true"
          />
        )}
      </span>
    );
    return prova ? (
      <Link
        to={`/obras/${prova.obra.slug}`}
        aria-label={`Ver a obra: ${prova.obra.titulo}`}
        className="group/marca tap-target inline-flex items-center"
      >
        {wordmark}
      </Link>
    ) : (
      wordmark
    );
  };

  /* layout="row": celebridades + profissionais viram uma fileira só. */
  const pessoasRow = avatarGroups.flatMap(
    (g) => SOCIAL_PROOF[g] as readonly PessoaComFoto[],
  );

  return (
    <div className={className}>
      {(eyebrow || titulo) && (
        <div className={`${isLeft ? "" : "text-center"} mb-9 md:mb-12`}>
          {eyebrow && <p className={`${eyebrowCls} mb-4`}>{eyebrow}</p>}
          <div className={`w-12 h-px ${goldLine} ${isLeft ? "" : "mx-auto"} mb-5`} />
          {titulo && (
            <h2 className={`display-lg ${nameColor} max-w-2xl ${isLeft ? "" : "mx-auto"}`}>
              {titulo}
            </h2>
          )}
        </div>
      )}

      {isRow && avatarGroups.length === 2 ? (
        /* Dois grupos: separados por ESPAÇO (filete dourado + respiro), não por
         * dois títulos concorrentes. O olho agrupa por proximidade muito antes
         * de agrupar por legenda — e os 6 preenchem a largura (3 rostos numa
         * grade de 6 colunas deixavam meia seção vazia). No celular quebra 3+3. */
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:gap-8">
          <div className="min-w-0 flex-1">
            <p className={`${eyebrowCls} mb-4`}>{SOCIAL_PROOF_LABELS[avatarGroups[0]]}</p>
            <ul className="grid grid-cols-3 gap-4 md:gap-5">
              {(SOCIAL_PROOF[avatarGroups[0]] as readonly PessoaComFoto[]).map(renderPessoa)}
            </ul>
          </div>
          <div
            className={`hidden w-px self-stretch md:block ${isDark ? "bg-western-gold/30" : "bg-western-gold/40"}`}
            aria-hidden
          />
          <div className="min-w-0 flex-1">
            <p className={`${eyebrowCls} mb-4`}>{SOCIAL_PROOF_LABELS[avatarGroups[1]]}</p>
            <ul className="grid grid-cols-3 gap-4 md:gap-5">
              {(SOCIAL_PROOF[avatarGroups[1]] as readonly PessoaComFoto[]).map(renderPessoa)}
            </ul>
          </div>
        </div>
      ) : isRow ? (
        pessoasRow.length > 0 && renderTier(pessoasRow, true)
      ) : (
        avatarGroups.map((g) => (
            <div key={g} className={compact ? "mb-8 md:mb-9" : "mb-10 md:mb-12"}>
              <p className={`text-center ${eyebrowCls} mb-5 md:mb-6`}>
                {SOCIAL_PROOF_LABELS[g]}
              </p>
              {renderTier(SOCIAL_PROOF[g] as readonly PessoaComFoto[])}
            </div>
          ))
      )}

      {showMarcas && (
        <div
          className={
            isRow
              ? `mt-10 md:mt-14 pt-8 border-t ${isDark ? "border-western-gold/15" : "border-western-border-soft"}`
              : avatarGroups.length
                ? "mt-1"
                : ""
          }
        >
          <p className={`${isLeft ? "" : "text-center"} ${eyebrowCls} mb-6 md:mb-7`}>
            {SOCIAL_PROOF_LABELS.marcas}
          </p>
          <ul
            className={
              isRow
                ? "flex flex-wrap items-center gap-x-8 gap-y-4 md:gap-x-12"
                : "grid grid-cols-2 gap-x-6 gap-y-5 md:flex md:flex-wrap md:items-center md:justify-center md:gap-x-10 lg:gap-x-14 md:gap-y-6 max-w-full"
            }
          >
            {(SOCIAL_PROOF.marcas as readonly MarcaComLogo[]).map((m) => (
              <li key={m.slug} className={isRow ? "flex items-center" : "flex items-center justify-center"}>
                {renderMarca(m)}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
