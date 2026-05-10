import { PROJETOS, type Projeto } from "@/data/projetos";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

interface Props {
  productHandle: string;
  productTitle: string;
}

/**
 * Mostra projetos relacionados a esta peça.
 * Heurística: bate por handle, slug ou termos do título.
 * Se não houver projetos vinculados, exibe os 4 projetos hero (sempre relevante para portfolio).
 */
function pickProjetos(handle: string, title: string): Projeto[] {
  const needle = (handle + " " + title).toLowerCase();
  const matches = PROJETOS.filter((p) =>
    [p.slug, p.titulo, ...p.ficha].some((s) =>
      needle.includes(s.toLowerCase()) || s.toLowerCase().includes(handle)
    )
  );
  if (matches.length >= 3) return matches.slice(0, 6);
  return PROJETOS.slice(0, 6);
}

export default function ProductInProjects({ productHandle, productTitle }: Props) {
  const projetos = pickProjetos(productHandle, productTitle);
  if (projetos.length === 0) return null;

  return (
    <section className="bg-western-cream-muted py-20 md:py-28">
      <div className="container-western">
        <header className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-eyebrow mb-4">Em obra</p>
          <h2 className="font-display text-3xl md:text-4xl text-western-green-deep leading-tight">
            {productTitle} em projetos executados
          </h2>
          <p className="mt-4 text-spec italic text-western-stone-warm leading-relaxed">
            Cada projeto é uma composição autoral. Tonalidades, escala e composições variam conforme o ambiente.
          </p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projetos.slice(0, 6).map((p) => (
            <figure key={p.slug} className="group relative overflow-hidden bg-western-paper aspect-[4/3]">
              <img
                src={p.cover}
                alt={p.titulo}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              />
              <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/40 to-transparent p-5 opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-western-cream/80 mb-1">
                  {p.eyebrow}
                </p>
                <p className="text-western-cream text-sm leading-snug">{p.titulo}</p>
              </figcaption>
            </figure>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link
            to="/#projetos"
            className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.22em] text-western-green-deep hover:text-western-gold transition-colors"
          >
            Ver mais projetos <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </section>
  );
}
