import { SOCIAL_PROOF, SOCIAL_PROOF_LABELS, type SocialProofGroup, type PessoaComFoto } from "@/data/socialProof";

// Resolve fotos automaticamente pela convenção src/assets/famosos/{slug}.(webp|jpg|jpeg|png)
const rawImages = import.meta.glob(
  "../../assets/famosos/*.{webp,jpg,jpeg,png}",
  { eager: true, query: "?url", import: "default" },
) as Record<string, string>;

// Também aceita pointers .asset.json (ex.: {slug}.webp.asset.json com { url })
const rawPointers = import.meta.glob(
  "../../assets/famosos/*.asset.json",
  { eager: true },
) as Record<string, { url?: string; default?: { url?: string } }>;

function buildFotoMap(): Record<string, string> {
  const map: Record<string, string> = {};
  for (const [path, url] of Object.entries(rawImages)) {
    const file = path.split("/").pop() ?? "";
    const slug = file.replace(/\.(webp|jpg|jpeg|png)$/i, "");
    map[slug] = url;
  }
  for (const [path, mod] of Object.entries(rawPointers)) {
    const file = path.split("/").pop() ?? "";
    const slug = file.replace(/\.(webp|jpg|jpeg|png)\.asset\.json$/i, "");
    const url = (mod?.default?.url ?? mod?.url) as string | undefined;
    if (url && !map[slug]) map[slug] = url;
  }
  return map;
}

const FOTOS = buildFotoMap();

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
  titulo?: React.ReactNode;
  eyebrow?: string;
  className?: string;
}

export default function SocialProof({
  groups = ["celebridades", "profissionais", "parceiros", "empresas"],
  variant = "light",
  titulo,
  eyebrow,
  className = "",
}: Props) {
  const isDark = variant === "dark";
  const eyebrowColor = isDark ? "text-western-gold-soft/85" : "text-western-gold";
  const nameColor = isDark ? "text-western-cream" : "text-western-green-deep";
  const dividerColor = isDark ? "bg-western-gold/25" : "bg-western-stone-warm/20";
  const goldLine = isDark ? "bg-western-gold/50" : "bg-western-gold";
  const avatarBg = isDark
    ? "bg-western-green-mid/40"
    : "bg-western-cream";
  const monogramText = isDark ? "text-western-gold-soft" : "text-western-green-deep";
  const captionColor = isDark ? "text-western-cream" : "text-western-green-deep";

  const avatarGroups = groups.filter((g) => g === "celebridades" || g === "profissionais") as Array<
    "celebridades" | "profissionais"
  >;
  const textGroups = groups.filter((g) => g === "parceiros" || g === "empresas") as Array<
    "parceiros" | "empresas"
  >;

  const renderAvatarRow = (pessoas: readonly PessoaComFoto[]) => (
    <ul className="flex flex-wrap items-start justify-center gap-6 md:gap-10">
      {pessoas.map((c) => {
        const foto = FOTOS[c.slug];
        return (
          <li key={c.slug} className="group flex flex-col items-center w-24 md:w-28">
            <div
              className={`relative w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden ${avatarBg} shrink-0 flex items-center justify-center ring-1 ring-western-gold/25 group-hover:ring-western-gold/60 transition-all duration-300 ease-out group-hover:scale-[1.06]`}
            >
              {foto ? (
                <img
                  src={foto}
                  alt={`Retrato de ${c.nome}`}
                  loading="lazy"
                  decoding="async"
                  width={80}
                  height={80}
                  className="w-full h-full object-cover grayscale-[45%] brightness-[0.98] group-hover:grayscale-0 group-hover:brightness-100 transition-all duration-300 ease-out"
                />
              ) : (
                <span
                  className={`font-display text-lg md:text-xl ${monogramText} tracking-wide`}
                  aria-hidden="true"
                >
                  {iniciais(c.nome)}
                </span>
              )}
            </div>
            <p className={`mt-3 text-center font-sans text-[13px] leading-tight ${captionColor}`}>
              {c.nome}
            </p>
          </li>
        );
      })}
    </ul>
  );

  return (
    <div className={className}>
      {(eyebrow || titulo) && (
        <div className="text-center mb-10 md:mb-12">
          {eyebrow && (
            <p className={`font-mono text-[10px] uppercase tracking-[0.28em] ${eyebrowColor} mb-5`}>
              {eyebrow}
            </p>
          )}
          <div className={`w-10 h-px ${goldLine} mx-auto mb-6`} />
          {titulo && (
            <h2 className={`font-display text-2xl md:text-[2rem] ${nameColor} leading-[1.2] max-w-2xl mx-auto`}>
              {titulo}
            </h2>
          )}
        </div>
      )}

      {avatarGroups.map((g, idx) => (
        <div key={g} className={idx === avatarGroups.length - 1 ? "mb-10 md:mb-12" : "mb-10 md:mb-12"}>
          <p className={`text-center font-mono text-[10px] uppercase tracking-[0.28em] ${eyebrowColor} mb-6`}>
            {SOCIAL_PROOF_LABELS[g]}
          </p>
          {renderAvatarRow(SOCIAL_PROOF[g] as readonly PessoaComFoto[])}
        </div>
      ))}

      {textGroups.length > 0 && (
        <ul
          className={`grid gap-y-8 ${
            textGroups.length === 2 ? "md:grid-cols-2" : "md:grid-cols-1"
          } md:gap-y-0 md:divide-x ${dividerColor}`}
        >
          {textGroups.map((g) => {
            const nomes = SOCIAL_PROOF[g] as readonly string[];
            return (
              <li key={g} className="px-4 md:px-8 text-center">
                <p className={`font-mono text-[10px] uppercase tracking-[0.28em] ${eyebrowColor} mb-4`}>
                  {SOCIAL_PROOF_LABELS[g]}
                </p>
                <div className={`w-8 h-px ${goldLine} mx-auto mb-5 opacity-60`} />
                <ul className="space-y-1.5">
                  {nomes.map((n) => (
                    <li
                      key={n}
                      className={`font-sans text-[15px] font-medium ${nameColor} leading-snug`}
                    >
                      {n}
                    </li>
                  ))}
                </ul>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
