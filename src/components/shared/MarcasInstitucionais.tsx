import logoCobasi from "@/assets/parceiros/cobasi.png";
import logoUnique from "@/assets/parceiros/unique-garden.png";
import logoCristal from "@/assets/parceiros/cristal-pool.png";
import logoBiopet from "@/assets/parceiros/biopet.png";
import logoGenesis from "@/assets/parceiros/genesis.png";

interface Marca {
  nome: string;
  site: string;
  logo: string;
}

const PARCEIROS: Marca[] = [
  { nome: "Cobasi", site: "https://www.cobasi.com.br", logo: logoCobasi },
  { nome: "Unique Garden", site: "https://www.uniquegarden.com.br", logo: logoUnique },
  { nome: "Cristal Pool", site: "https://www.cristalpool.com.br", logo: logoCristal },
  { nome: "Genesis Ecossistemas", site: "https://genesisecossistemas.com", logo: logoGenesis },
  { nome: "Biopet Lagos", site: "https://bplagos.com.br", logo: logoBiopet },
];

interface Props {
  /** Compacta: sem título/eyebrow internos, ideal pra Home */
  compacta?: boolean;
  eyebrow?: string;
  titulo?: React.ReactNode;
  descricao?: React.ReactNode;
}

export default function MarcasInstitucionais({
  compacta = false,
  eyebrow,
  titulo,
  descricao,
}: Props) {
  return (
    <section className={compacta ? "" : "mt-20 md:mt-28 pt-14 border-t border-western-stone-warm/20"}>
      {!compacta && (
        <>
          {eyebrow && <p className="text-eyebrow mb-5">{eyebrow}</p>}
          <div className="w-12 h-px bg-western-gold mb-8" />
          {titulo && (
            <h2 className="font-display text-3xl md:text-5xl text-western-green-deep leading-[1.05] mb-8">
              {titulo}
            </h2>
          )}
          {descricao && (
            <p className="text-western-stone-warm leading-relaxed text-lg max-w-2xl mb-12">
              {descricao}
            </p>
          )}
        </>
      )}

      <div className="border-y border-western-stone-warm/20 bg-western-cream">
        <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 divide-x divide-y md:divide-y-0 divide-western-stone-warm/15 sm:[&>li:nth-child(-n+3)]:md:border-t-0">
          {PARCEIROS.map((p) => (
            <li key={p.nome} className="bg-western-cream">
              <a
                href={p.site}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={p.nome}
                title={p.nome}
                className="group flex items-center justify-center h-28 md:h-32 px-5 hover:bg-western-paper transition-colors"
              >
                <img
                  src={p.logo}
                  alt={p.nome}
                  loading="lazy"
                  className="max-h-12 md:max-h-14 max-w-[140px] w-auto object-contain opacity-80 group-hover:opacity-100 transition-opacity"
                />
              </a>
            </li>
          ))}
        </ul>
      </div>

      {/* Lista textual acessível, neutra */}
      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-western-stone-warm/70 mt-4 text-center">
        Cobasi · Unique Garden · Cristal Pool · Genesis Ecossistemas · Biopet Lagos
      </p>
    </section>
  );
}
