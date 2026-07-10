import {
  SOCIAL_PROOF,
  SOCIAL_PROOF_LABELS,
  type SocialProofGroup,
  type PessoaComFoto,
  type MarcaComLogo,
} from "@/data/socialProof";

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
}

export default function SocialProof({
  groups = ["celebridades", "profissionais", "marcas"],
  variant = "light",
  compact = false,
  titulo,
  eyebrow,
  className = "",
}: Props) {
  const isDark = variant === "dark";
  const eyebrowColor = isDark ? "text-western-gold-soft/85" : "text-western-gold";
  const nameColor = isDark ? "text-western-cream" : "text-western-green-deep";
  const goldLine = isDark ? "bg-western-gold/50" : "bg-western-gold";
  const tileBg = isDark ? "bg-western-green-mid/40" : "bg-western-cream-muted";
  const monogramText = isDark ? "text-western-gold-soft" : "text-western-green-deep";
  const captionColor = isDark ? "text-western-cream" : "text-western-green-deep";
  const wordmarkColor = isDark ? "text-western-cream" : "text-western-green-deep";
  const logoFilter = isDark
    ? "brightness(0) saturate(100%) invert(96%) sepia(10%) saturate(220%) hue-rotate(350deg) brightness(103%) contrast(96%)"
    : "brightness(0) saturate(100%) invert(15%) sepia(28%) saturate(900%) hue-rotate(95deg) brightness(70%) contrast(92%)";

  const avatarGroups = groups.filter(
    (g) => g === "celebridades" || g === "profissionais",
  ) as Array<"celebridades" | "profissionais">;
  const showMarcas = groups.includes("marcas");

  const tierMax = compact ? "max-w-md md:max-w-lg" : "max-w-md md:max-w-2xl";
  const tileGap = compact ? "gap-3 md:gap-4" : "gap-4 md:gap-6";
  // Altura óptica base para logos (px). Wordmarks se alinham à mesma cap-height.
  const logoBaseH = compact ? { mobile: 20, desktop: 26 } : { mobile: 22, desktop: 30 };
  const logoMaxW = compact ? 130 : 150;
  const logoGap = compact ? "gap-x-8 gap-y-5" : "gap-x-10 md:gap-x-14 gap-y-7";

  const renderTier = (pessoas: readonly PessoaComFoto[]) => (
    <ul className={`grid grid-cols-3 ${tileGap} ${tierMax} mx-auto`}>
      {pessoas.map((c) => {
        const foto = FOTOS[c.slug];
        return (
          <li key={c.slug} className="group flex flex-col items-center">
            <div className={`relative w-full aspect-[4/5] overflow-hidden rounded-[3px] ${tileBg} ring-1 ring-western-gold/20 group-hover:ring-western-gold/50 shadow-[0_16px_34px_-20px_rgba(0,0,0,0.65)] transition-all duration-500`}>
              {foto ? (
                <img
                  src={foto}
                  alt={`Retrato de ${c.nome}`}
                  loading="lazy"
                  decoding="async"
                  width={320}
                  height={400}
                  className="w-full h-full object-cover object-center grayscale-[35%] brightness-[0.97] group-hover:grayscale-0 group-hover:brightness-100 transition-all duration-700 ease-out motion-safe:group-hover:scale-[1.03]"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className={`font-display text-3xl md:text-4xl ${monogramText}`} aria-hidden="true">{iniciais(c.nome)}</span>
                </div>
              )}
            </div>
            <p className={`mt-3 text-center font-display text-sm md:text-base leading-tight ${captionColor}`}>{c.nome}</p>
          </li>
        );
      })}
    </ul>
  );

  // Todas as marcas viram wordmark padronizado (sem variação de tamanho por marca).
  const wordmarkFs = compact
    ? { mobile: 15, desktop: 18 }
    : { mobile: 16, desktop: 20 };
  const renderMarca = (m: MarcaComLogo) => (
    <span
      title={m.nome}
      style={{
        fontSize: `${wordmarkFs.mobile}px`,
        lineHeight: 1,
        letterSpacing: "0.02em",
        ["--wm-fs-md" as string]: `${wordmarkFs.desktop}px`,
      }}
      className={`whitespace-nowrap text-center font-display leading-none ${wordmarkColor} opacity-70 group-hover:opacity-100 transition-opacity duration-500 md:text-[length:var(--wm-fs-md)]`}
    >
      {m.nome}
    </span>
  );

  return (
    <div className={className}>
      {(eyebrow || titulo) && (
        <div className="text-center mb-9 md:mb-12">
          {eyebrow && <p className={`font-mono text-[10px] uppercase tracking-[0.28em] ${eyebrowColor} mb-4`}>{eyebrow}</p>}
          <div className={`w-10 h-px ${goldLine} mx-auto mb-5`} />
          {titulo && <h2 className={`font-display text-2xl md:text-[2rem] ${nameColor} leading-[1.2] max-w-2xl mx-auto`}>{titulo}</h2>}
        </div>
      )}

      {avatarGroups.map((g) => (
        <div key={g} className={compact ? "mb-8 md:mb-9" : "mb-10 md:mb-12"}>
          <p className={`text-center font-mono text-[10px] uppercase tracking-[0.28em] ${eyebrowColor} mb-5 md:mb-6`}>{SOCIAL_PROOF_LABELS[g]}</p>
          {renderTier(SOCIAL_PROOF[g] as readonly PessoaComFoto[])}
        </div>
      ))}

      {showMarcas && (
        <div className={avatarGroups.length ? "mt-1" : ""}>
          <p className={`text-center font-mono text-[10px] uppercase tracking-[0.28em] ${eyebrowColor} mb-6 md:mb-7`}>{SOCIAL_PROOF_LABELS.marcas}</p>
          <ul className="grid grid-cols-2 gap-x-6 gap-y-5 md:flex md:flex-wrap md:items-center md:justify-center md:gap-x-10 lg:gap-x-14 md:gap-y-6 max-w-full">
            {(SOCIAL_PROOF.marcas as readonly MarcaComLogo[]).map((m) => (
              <li key={m.slug} className="group flex items-center justify-center">
                {renderMarca(m)}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
