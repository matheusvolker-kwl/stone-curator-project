import logoCobasi from "@/assets/parceiros/cobasi.png";
import logoUnique from "@/assets/parceiros/unique-garden.png";
import logoCristal from "@/assets/parceiros/cristal-pool.png";
import logoBiopet from "@/assets/parceiros/biopet.png";
import logoGenesis from "@/assets/parceiros/genesis.png";

interface Marca {
  nome: string;
  site: string;
  logo: string;
  /** Altura específica em px (max-h). Default 56. */
  altura?: number;
}

const PARCEIROS: Marca[] = [
  { nome: "Cobasi", site: "https://www.cobasi.com.br", logo: logoCobasi, altura: 44 },
  { nome: "Unique Garden", site: "https://www.uniquegarden.com.br", logo: logoUnique, altura: 64 },
  { nome: "Cristal Pool", site: "https://www.cristalpool.com.br", logo: logoCristal, altura: 56 },
  { nome: "Genesis Ecossistemas", site: "https://genesisecossistemas.com", logo: logoGenesis, altura: 80 },
  { nome: "Biopet Lagos", site: "https://bplagos.com.br", logo: logoBiopet, altura: 60 },
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

      <div className="surface-forest border border-western-gold/15">
        <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-px bg-western-gold/15">
          {PARCEIROS.map((p) => (
            <li key={p.nome} className="surface-forest">
              <a
                href={p.site}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={p.nome}
                title={p.nome}
                className="group flex items-center justify-center h-32 md:h-36 px-6 hover:bg-western-green-mid/40 transition-colors"
              >
                <img
                  src={p.logo}
                  alt={p.nome}
                  loading="lazy"
                  style={{ maxHeight: `${p.altura ?? 56}px` }}
                  className="w-auto max-w-[170px] object-contain opacity-85 group-hover:opacity-100 transition-opacity"
                />
              </a>
            </li>
          ))}
        </ul>
      </div>

      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-western-stone-warm/70 mt-4 text-center">
        Cobasi · Unique Garden · Cristal Pool · Genesis Ecossistemas · Biopet Lagos
      </p>
    </section>
  );
}
