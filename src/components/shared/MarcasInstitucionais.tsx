import logoCobasi from "@/assets/parceiros/cobasi.png";
import logoUnique from "@/assets/parceiros/unique-garden.png";
import logoCristal from "@/assets/parceiros/cristal-pool.png";
import logoBiopet from "@/assets/parceiros/biopet.png";
import logoGenesis from "@/assets/parceiros/genesis.png";

interface Marca {
  nome: string;
  site: string;
  logo: string;
  /** Logo já é branco/claro — não aplica filtro invert */
  jaClaro?: boolean;
}

const PARCEIROS: Marca[] = [
  { nome: "Cobasi", site: "https://www.cobasi.com.br", logo: logoCobasi },
  { nome: "Unique Garden", site: "https://www.uniquegarden.com.br", logo: logoUnique },
  { nome: "Cristal Pool", site: "https://www.cristalpool.com.br", logo: logoCristal },
  { nome: "Genesis Ecossistemas", site: "https://genesisecossistemas.com", logo: logoGenesis, jaClaro: true },
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
    <section className={compacta ? "" : "mt-24 md:mt-32 pt-16 border-t border-western-stone-warm/20"}>
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

      <div className="surface-forest border border-western-gold/20">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-px bg-western-gold/15">
          {PARCEIROS.map((p) => (
            <a
              key={p.nome}
              href={p.site}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={p.nome}
              className="group surface-forest aspect-[3/2] flex flex-col items-center justify-center px-5 py-6 hover:bg-western-green-mid/40 transition-colors"
            >
              <div className="flex-1 flex items-center justify-center w-full">
                <img
                  src={p.logo}
                  alt={p.nome}
                  loading="lazy"
                  className={`max-h-10 md:max-h-12 w-auto object-contain ${
                    p.jaClaro ? "logo-mono-keep" : "logo-mono"
                  }`}
                />
              </div>
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-western-cream-muted/70 group-hover:text-western-gold-soft transition-colors mt-3 text-center leading-tight">
                {p.nome}
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
