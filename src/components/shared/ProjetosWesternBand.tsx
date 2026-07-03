import img01 from "@/assets/projetos-western/01_hero-tapirai.webp.asset.json";
import img02 from "@/assets/projetos-western/02_pedra-detalhe.webp.asset.json";
import img03 from "@/assets/projetos-western/03_piscina-cascata.webp.asset.json";
import img04 from "@/assets/projetos-western/04_piscina-mirante.webp.asset.json";
import img05 from "@/assets/projetos-western/05_cascata-escalonada.webp.asset.json";
import img06 from "@/assets/projetos-western/06_piscina-cascata-serra.webp.asset.json";
import img07 from "@/assets/projetos-western/07_cascata-piscina.webp.asset.json";
import img08 from "@/assets/projetos-western/08_piscina-paisagismo.webp.asset.json";
import img09 from "@/assets/projetos-western/09_piscina-cascata-2.webp.asset.json";
import img10 from "@/assets/projetos-western/10_piscina-vista.webp.asset.json";
import img11 from "@/assets/projetos-western/11_cascata-ferns.webp.asset.json";
import img12 from "@/assets/projetos-western/12_borda-pedra.webp.asset.json";

interface ProjetoFoto {
  src: string;
  caption: string;
}

const FOTOS: ProjetoFoto[] = [
  { src: img01.url, caption: "Cascata em pedra · Tapiraí (SP)" },
  { src: img03.url, caption: "Piscina com cascata · projeto Western" },
  { src: img02.url, caption: "Detalhe do material · Western" },
  { src: img11.url, caption: "Cascata tropical · projeto Western" },
  { src: img06.url, caption: "Cascata e serra · projeto Western" },
  { src: img04.url, caption: "Piscina e mirante · projeto Western" },
  { src: img12.url, caption: "Borda em pedra · projeto Western" },
  { src: img05.url, caption: "Cascata escalonada · projeto Western" },
  { src: img09.url, caption: "Piscina natural · projeto Western" },
  { src: img07.url, caption: "Cascata sobre a piscina · projeto Western" },
  { src: img08.url, caption: "Piscina com paisagismo · projeto Western" },
  { src: img10.url, caption: "Vista do projeto · projeto Western" },
];

export default function ProjetosWesternBand() {
  return (
    <section className="bg-western-cream-muted py-14 md:py-20">
      <div className="container-western">
        <header className="text-center max-w-2xl mx-auto mb-10 md:mb-14">
          <p className="text-eyebrow">Obras Western</p>
          <div className="w-12 h-px bg-western-gold mx-auto my-5" />
          <h2 className="font-display text-3xl md:text-4xl text-western-green-deep">
            Cascatas e pedras instaladas por nós
          </h2>
          <p className="text-spec italic text-western-stone-warm mt-4">
            Projetos executados pela Western. Cada obra é única — tonalidades e composições variam conforme o ambiente.
          </p>
        </header>

        <div className="columns-2 md:columns-3 lg:columns-4 gap-4">
          {FOTOS.map((foto, i) => (
            <figure
              key={foto.src}
              className="group relative overflow-hidden rounded-[2px] break-inside-avoid mb-4 bg-western-stone-warm/10"
            >
              <img
                src={foto.src}
                alt={foto.caption}
                loading="lazy"
                decoding="async"
                sizes="(min-width: 1024px) 360px, (min-width: 768px) 33vw, 50vw"
                className="w-full h-auto object-cover transition-transform duration-500 ease-out motion-safe:group-hover:scale-[1.03]"
              />
              <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-4 pt-10 pb-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-western-cream">
                  {foto.caption}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
