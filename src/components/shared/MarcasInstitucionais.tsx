import logoCobasi from "@/assets/parceiros/cobasi.svg";
import logoCristal from "@/assets/parceiros/cristal-pool.svg";
import logoBiopet from "@/assets/parceiros/biopet.svg";
import logoGenesis from "@/assets/parceiros/genesis.svg";
import logoCobasiCream from "@/assets/parceiros/cobasi-cream.png";
import logoBiopetCream from "@/assets/parceiros/biopet-cream.png";
import logoGenesisCream from "@/assets/parceiros/genesis-cream.png";

interface Marca {
  nome: string;
  site: string;
  /** Logo em verde — para fundos claros */
  logoDark: string;
  /** Logo em creme — para fundos escuros. Se ausente, usa logoDark com filtro CSS. */
  logoLight?: string;
  /** Largura máxima em px — calibra peso visual entre logos diferentes */
  larguraMax: number;
}

const PARCEIROS: Marca[] = [
  { nome: "Biopet Lagos",        site: "https://bplagos.com.br",            logoDark: logoBiopet,  logoLight: logoBiopetCream,  larguraMax: 130 },
  { nome: "Cristal Pool",        site: "https://www.cristalpool.com.br",    logoDark: logoCristal,                              larguraMax: 170 },
  { nome: "Genesis Ecossistemas",site: "https://genesisecossistemas.com",   logoDark: logoGenesis, logoLight: logoGenesisCream, larguraMax: 110 },
  { nome: "Cobasi",              site: "https://www.cobasi.com.br",         logoDark: logoCobasi,  logoLight: logoCobasiCream,  larguraMax: 170 },
];

interface Props {
  /** Compacta: sem cabeçalho, ideal pra Home */
  compacta?: boolean;
  /** Variante de fundo: light (sobre ivory/paper) ou dark (sobre forest) */
  variante?: "light" | "dark";
  /** Sem caixas/bordas: logos livres em row, ideal pra interlúdios editoriais */
  semBordas?: boolean;
  eyebrow?: string;
  titulo?: React.ReactNode;
  descricao?: React.ReactNode;
  semLinks?: boolean;
}

export default function MarcasInstitucionais({
  compacta = false,
  variante = "light",
  semBordas = false,
  eyebrow,
  titulo,
  descricao,
  semLinks = false,
}: Props) {
  const isDark = variante === "dark";

  const renderLogo = (p: Marca, className: string, maxHeightClass: string) => {
    const useFilter = isDark && !p.logoLight;
    const content = (
      <img
        src={isDark && p.logoLight ? p.logoLight : p.logoDark}
        alt={p.nome}
        loading="lazy"
        style={{
          maxWidth: `${p.larguraMax}px`,
          ...(useFilter ? { filter: "brightness(0) invert(1)" } : {}),
        }}
        className={`w-full ${maxHeightClass} object-contain transition-all duration-500 ${
          isDark ? "opacity-65 group-hover:opacity-100" : "opacity-75 group-hover:opacity-100"
        } group-hover:scale-[1.04]`}
      />
    );

    if (semLinks) {
      return (
        <div aria-label={p.nome} title={p.nome} className={className}>
          {content}
        </div>
      );
    }

    return (
      <a
        href={p.site}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={p.nome}
        title={p.nome}
        className={className}
      >
        {content}
      </a>
    );
  };

  return (
    <section className={compacta ? "" : "mt-14 md:mt-16"}>
      {!compacta && (
        <div className="text-center max-w-2xl mx-auto mb-12 md:mb-14">
          {eyebrow && (
            <p className={`text-eyebrow mb-4 ${isDark ? "text-western-gold-soft" : ""}`}>
              {eyebrow}
            </p>
          )}
          <div className="w-12 h-px bg-western-gold mx-auto mb-7" />
          {titulo && (
            <h2
              className={`font-display text-3xl md:text-4xl leading-[1.1] mb-5 ${
                isDark ? "text-western-cream" : "text-western-green-deep"
              }`}
            >
              {titulo}
            </h2>
          )}
          {descricao && (
            <p
              className={`leading-relaxed text-base md:text-[17px] ${
                isDark ? "text-western-cream-muted" : "text-western-stone-warm"
              }`}
            >
              {descricao}
            </p>
          )}
        </div>
      )}

      {semBordas ? (
        <ul className="flex flex-wrap items-center justify-center gap-x-8 md:gap-x-12 gap-y-6">
          {PARCEIROS.map((p) => (
            <li key={p.nome}>
              {renderLogo(
                p,
                "group flex items-center justify-center h-16 md:h-20 transition-all",
                "max-h-14 md:max-h-16"
              )}
            </li>
          ))}
        </ul>
      ) : (
        <ul
          className={`grid grid-cols-2 md:grid-cols-4 ${
            isDark
              ? "border-y border-western-gold/20"
              : "border-y border-western-stone-warm/15"
          }`}
        >
          {PARCEIROS.map((p, i) => (
            <li
              key={p.nome}
              className={`${
                isDark ? "border-western-gold/15" : "border-western-stone-warm/15"
              } ${i > 0 && i % 2 !== 0 ? "border-l md:border-l" : ""} ${
                i >= 2 ? "border-t md:border-t-0" : ""
              } ${i > 0 ? "md:border-l" : ""}`}
            >
              {renderLogo(
                p,
                "group flex items-center justify-center h-28 md:h-36 px-6 transition-all",
                "max-h-20 md:max-h-24"
              )}
            </li>
          ))}
        </ul>
      )}

      {!compacta && (
        <p
          className={`font-mono text-[10px] uppercase tracking-[0.28em] mt-6 text-center ${
            isDark ? "text-western-cream-muted/70" : "text-western-stone-warm/60"
          }`}
        >
          Parceiros institucionais · {new Date().getFullYear() - 1993}+ anos de coautoria
        </p>
      )}
    </section>
  );
}

