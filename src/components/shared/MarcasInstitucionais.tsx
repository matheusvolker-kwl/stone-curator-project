import logoCobasi from "@/assets/parceiros/cobasi.svg";
import logoCristal from "@/assets/parceiros/cristal-pool.svg";
import logoBiopet from "@/assets/parceiros/biopet.svg";
import logoGenesis from "@/assets/parceiros/genesis.svg";
import logoCobasiCream from "@/assets/parceiros/cobasi-cream.png";
import logoCristalCream from "@/assets/parceiros/cristal-pool-cream.png";
import logoBiopetCream from "@/assets/parceiros/biopet-cream.png";
import logoGenesisCream from "@/assets/parceiros/genesis-cream.png";

interface Marca {
  nome: string;
  site: string;
  /** Logo em verde — para fundos claros */
  logoDark: string;
  /** Logo em creme — para fundos escuros */
  logoLight: string;
  /** Largura máxima em px — calibra peso visual entre logos diferentes */
  larguraMax: number;
}

const PARCEIROS: Marca[] = [
  { nome: "Biopet Lagos",        site: "https://bplagos.com.br",            logoDark: logoBiopet,  logoLight: logoBiopetCream,  larguraMax: 200 },
  { nome: "Cristal Pool",        site: "https://www.cristalpool.com.br",    logoDark: logoCristal, logoLight: logoCristalCream, larguraMax: 260 },
  { nome: "Genesis Ecossistemas",site: "https://genesisecossistemas.com",   logoDark: logoGenesis, logoLight: logoGenesisCream, larguraMax: 180 },
  { nome: "Cobasi",              site: "https://www.cobasi.com.br",         logoDark: logoCobasi,  logoLight: logoCobasiCream,  larguraMax: 200 },
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
}

export default function MarcasInstitucionais({
  compacta = false,
  variante = "light",
  semBordas = false,
  eyebrow,
  titulo,
  descricao,
}: Props) {
  const isDark = variante === "dark";

  return (
    <section className={compacta ? "" : "mt-20 md:mt-24"}>
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
        <ul className="flex flex-wrap items-center justify-center gap-x-12 md:gap-x-20 gap-y-8">
          {PARCEIROS.map((p) => (
            <li key={p.nome}>
              <a
                href={p.site}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={p.nome}
                title={p.nome}
                className="group flex items-center justify-center h-16 md:h-20 transition-all"
              >
                <img
                  src={isDark ? p.logoLight : p.logoDark}
                  alt={p.nome}
                  loading="lazy"
                  style={{ maxWidth: `${p.larguraMax}px` }}
                  className={`w-full max-h-14 md:max-h-16 object-contain transition-all duration-500 ${
                    isDark
                      ? "opacity-65 group-hover:opacity-100"
                      : "opacity-75 group-hover:opacity-100"
                  } group-hover:scale-[1.04]`}
                />
              </a>
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
              <a
                href={p.site}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={p.nome}
                title={p.nome}
                className="group flex items-center justify-center h-28 md:h-36 px-6 transition-all"
              >
                <img
                  src={isDark ? p.logoLight : p.logoDark}
                  alt={p.nome}
                  loading="lazy"
                  style={{ maxWidth: `${p.larguraMax}px` }}
                  className={`w-full max-h-20 md:max-h-24 object-contain transition-all duration-500 ${
                    isDark
                      ? "opacity-70 group-hover:opacity-100"
                      : "opacity-80 group-hover:opacity-100"
                  } group-hover:scale-[1.04]`}
                />
              </a>
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
