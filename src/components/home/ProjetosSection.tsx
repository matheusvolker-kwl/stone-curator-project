import { useState } from "react";
import { Play, ArrowRight } from "lucide-react";
import { PROJETOS, type Projeto } from "@/data/projetos";
import ProjetoModal from "./ProjetoModal";

export default function ProjetosSection() {
  const [active, setActive] = useState<Projeto | null>(null);

  return (
    <section className="surface-forest py-20 md:py-32 border-t border-western-gold/15">
      <div className="container-western">
        <p className="text-eyebrow mb-5">Arquivo · Projetos</p>
        <div className="w-12 h-px bg-western-gold mb-8" />
        <h2 className="font-display text-4xl md:text-6xl text-western-cream leading-[1.05] mb-6 md:mb-8 max-w-3xl">
          Onde a pedra encontra <span className="text-western-gold-soft italic font-light">o projeto.</span>
        </h2>
        <p className="max-w-xl text-western-cream-muted leading-relaxed mb-12 md:mb-16">
          Curadoria de obras assinadas em que a Western foi a resposta técnica e estética.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {PROJETOS.map((p) => (
            <button
              key={p.slug}
              onClick={() => setActive(p)}
              className="group text-left border border-western-gold/15 bg-western-green-mid/30 hover:border-western-gold/40 transition-colors flex flex-col"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={p.cover}
                  alt={p.titulo}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                />
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(to top, hsl(var(--western-green-deep) / 0.55) 0%, transparent 45%)",
                  }}
                  aria-hidden
                />
                <span className="absolute bottom-4 right-4 h-11 w-11 rounded-full bg-western-gold/90 text-western-green-deep flex items-center justify-center shadow-lg backdrop-blur-sm transition-transform group-hover:scale-110">
                  <Play className="h-4 w-4 fill-current" />
                </span>
              </div>
              <div className="p-6 md:p-8 flex flex-col flex-1">
                <p className="text-eyebrow mb-3">{p.eyebrow}</p>
                <h3 className="font-display text-2xl md:text-3xl text-western-cream mb-3 group-hover:text-western-gold-soft transition-colors">
                  {p.titulo}
                </h3>
                <p className="text-western-cream-muted leading-relaxed text-sm flex-1 mb-6">
                  {p.snippet}
                </p>
                <span className="text-eyebrow inline-flex items-center gap-2 text-western-gold-soft group-hover:text-western-gold transition-colors">
                  Ver projeto <ArrowRight className="h-3 w-3" />
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <ProjetoModal projeto={active} onClose={() => setActive(null)} />
    </section>
  );
}
