import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { PROJETOS, type Projeto } from "@/data/projetos";
import ProjetoModal from "./ProjetoModal";

export default function ProjetosSection() {
  const [active, setActive] = useState<Projeto | null>(null);

  return (
    <section className="surface-forest py-16 md:py-24 border-t border-western-gold/15">
      <div className="container-western">
        <div className="flex items-end justify-between flex-wrap gap-4 mb-10 md:mb-14">
          <div>
            <p className="text-eyebrow mb-3">Projetos especificados</p>
            <h2 className="font-display text-3xl md:text-5xl text-western-cream leading-[1.05] max-w-2xl">
              Obras assinadas com{" "}
              <span className="text-western-gold-soft italic font-light">Western.</span>
            </h2>
          </div>
          <p className="text-western-cream-muted text-sm max-w-xs">
            Prova social — projetos de arquitetos e paisagistas que escolheram a Western como resposta técnica e estética.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {PROJETOS.map((p) => (
            <button
              key={p.slug}
              onClick={() => setActive(p)}
              className="group text-left bg-western-green-mid/30 border border-western-gold/15 hover:border-western-gold/50 transition-colors flex flex-col"
            >
              <div className="relative aspect-[4/5] overflow-hidden">
                <img
                  src={p.cover}
                  alt={p.titulo}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                />
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(to top, hsl(var(--western-green-deep) / 0.85) 0%, transparent 55%)",
                  }}
                  aria-hidden
                />
                <div className="absolute bottom-3 left-3 right-3">
                  {(() => {
                    const [nome, contexto] = p.eyebrow.split("·").map((s) => s.trim());
                    return (
                      <>
                        <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-western-gold-soft mb-1.5">
                          {p.titulo}
                        </p>
                        <h3 className="font-display text-xl md:text-2xl text-western-cream leading-[1.1] line-clamp-2">
                          {nome}
                        </h3>
                        {contexto && (
                          <p className="text-[11px] text-western-cream-muted mt-1 line-clamp-1">
                            {contexto}
                          </p>
                        )}
                      </>
                    );
                  })()}
                </div>
              </div>
              <div className="px-3 py-2.5 border-t border-western-gold/10 flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-western-cream-muted">
                  Ver projeto
                </span>
                <ArrowRight className="h-3 w-3 text-western-gold-soft group-hover:translate-x-0.5 transition-transform" />
              </div>
            </button>
          ))}
        </div>
      </div>

      <ProjetoModal projeto={active} onClose={() => setActive(null)} />
    </section>
  );
}
