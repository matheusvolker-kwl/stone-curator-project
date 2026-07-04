import {
  SOCIAL_PROOF,
  SOCIAL_PROOF_LABELS,
  type SocialProofGroup,
  type PessoaComFoto,
  type MarcaComLogo,
} from "@/data/socialProof";

/* Rostos: resolve por slug em src/assets/famosos/ (arquivo cru ou .asset.json) */
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

/* Logos: resolve por slug em src/assets/marcas/ (arquivo cru ou .asset.json) */
const logoImages = import.meta.glob("../../assets/marcas/*.{svg,png,webp}", {
  eager: true, query: "?url", import: "default",
}) as Record<string, string>;
const logoPointers = import.meta.glob("../../assets/marcas/*.{svg,png,webp}.asset.json", {
  eager: true,
}) as Record<string, { url?: string; default?: { url?: string } }>;
function buildLogoMap(): Record<string, string> {
  const map: Record<string, string> = {};
  for (const [path, url] of Object.entries(logoImages)) {
    const slug = (path.split("/").pop() ?? "").replace(/\.(svg|png|webp)$/i, "");
    map[slug] = url as string;
  }
  for (const [path, mod] of Object.entries(logoPointers)) {
    const slug = (path.split("/").pop() ?? "").replace(/\.(svg|png|webp)\.asset\.json$/i, "");
    const url = mod?.url ?? mod?.default?.url;
    if (url && !map[slug]) map[slug] = url;
  }
  return map;
}
const LOGOS = buildLogoMap();

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
  /** Compacto: retratos menores + faixa de logos enxuta (ideal PDP). */
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
  const avatarBg = isDark ? "bg-western-green-mid/40" : "bg-western-cream";
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

  const avatarSize = compact ? "w-16 h-16 md:w-[4.5rem] md:h-[4.5rem]" : "w-20 h-20 md:w-24 md:h-24";
  const rowGap = compact ? "gap-6 md:gap-8" : "gap-8 md:gap-12";
  const logoH = compact ? "h-8 md:h-9" : "h-10 md:h-12";
  const logoGap = compact ? "gap-x-8 gap-y-5" : "gap-x-10 md:gap-x-14 gap-y-7";

  const renderAvatarRow = (pessoas: readonly PessoaComFoto[]) => (
    <ul className={`flex flex-wrap items-start justify-center ${rowGap}`}>
      {pessoas.map((c) => {
        const foto = FOTOS[c.slug];
        return (
          <li key={c.slug} className="group flex flex-col items-center w-24 md:w-28">
            <div className={`relative ${avatarSize} rounded-full overflow-hidden ${avatarBg} shrink-0 flex items-center justify-center ring-1 ring-western-gold/25 group-hover:ring-western-gold/60 transition-all duration-300 ease-out group-hover:scale-[1.06]`}>
              {foto ? (
                <img src={foto} alt={`Retrato de ${c.nome}`} loading="lazy" decoding="async" width={96} height={96}
                  className="w-full h-full object-cover grayscale-[45%] brightness-[0.98] group-hover:grayscale-0 group-hover:brightness-100 transition-all duration-500 ease-out" />
              ) : (
                <span className={`font-display text-xl md:text-2xl ${monogramText} tracking-wide`} aria-hidden="true">{iniciais(c.nome)}</span>
              )}
            </div>
            <p className={`mt-3 text-center font-sans text-[13px] md:text-sm leading-tight ${captionColor}`}>{c.nome}</p>
          </li>
        );
      })}
    </ul>
  );

  const renderMarca = (m: MarcaComLogo) => {
    const logo = LOGOS[m.slug];
    if (logo) {
      return (
        <img src={logo} alt={m.nome} title={m.nome} loading="lazy" decoding="async"
          style={{ filter: logoFilter, maxWidth: "180px" }}
          className={`w-auto ${logoH} object-contain opacity-70 group-hover:opacity-100 transition-all duration-500 group-hover:scale-[1.04]`} />
      );
    }
    return (
      <span title={m.nome}
        className={`font-display leading-none ${wordmarkColor} opacity-70 group-hover:opacity-100 transition-all duration-500 ${compact ? "text-sm md:text-base" : "text-base md:text-xl"}`}>
        {m.nome}
      </span>
    );
  };

  return (
    <div className={className}>
      {(eyebrow || titulo) && (
        <div className="text-center mb-10 md:mb-14">
          {eyebrow && <p className={`font-mono text-[10px] uppercase tracking-[0.28em] ${eyebrowColor} mb-5`}>{eyebrow}</p>}
          <div className={`w-10 h-px ${goldLine} mx-auto mb-6`} />
          {titulo && <h2 className={`font-display text-2xl md:text-[2rem] ${nameColor} leading-[1.2] max-w-2xl mx-auto`}>{titulo}</h2>}
        </div>
      )}

      {avatarGroups.map((g) => (
        <div key={g} className={compact ? "mb-9 md:mb-10" : "mb-12 md:mb-16"}>
          <p className={`text-center font-mono text-[10px] uppercase tracking-[0.28em] ${eyebrowColor} mb-6 md:mb-7`}>{SOCIAL_PROOF_LABELS[g]}</p>
          {renderAvatarRow(SOCIAL_PROOF[g] as readonly PessoaComFoto[])}
        </div>
      ))}

      {showMarcas && (
        <div className={avatarGroups.length ? "mt-2" : ""}>
          <p className={`text-center font-mono text-[10px] uppercase tracking-[0.28em] ${eyebrowColor} mb-6 md:mb-8`}>{SOCIAL_PROOF_LABELS.marcas}</p>
          <ul className={`flex flex-wrap items-center justify-center max-w-full ${logoGap}`}>
            {(SOCIAL_PROOF.marcas as readonly MarcaComLogo[]).map((m) => (
              <li key={m.slug} className={`group flex items-center justify-center ${logoH}`}>{renderMarca(m)}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
