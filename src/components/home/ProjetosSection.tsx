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
              <div className="relative aspect-[4/5] overflow-hidden bg-western-green-deep">
                {/* Imagem com tratamento unificador (duotone sutil verde+dourado) */}
                <img
                  src={p.cardCover ?? p.cover}
                  alt={p.titulo}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                  style={{
                    filter: "grayscale(0.55) contrast(1.05) brightness(0.92) sepia(0.18)",
                  }}
                />
                {/* Overlay de cor da marca — uniformiza paleta entre as fotos */}
                <div
                  className="absolute inset-0 pointer-events-none mix-blend-color opacity-60 transition-opacity duration-500 group-hover:opacity-30"
                  style={{
                    background:
                      "linear-gradient(160deg, hsl(var(--western-green-deep)) 0%, hsl(var(--western-gold) / 0.55) 100%)",
                  }}
                  aria-hidden
                />
                {/* Vinheta sutil para foco no rosto */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      "radial-gradient(ellipse at 50% 35%, transparent 45%, hsl(var(--western-green-deep) / 0.35) 100%)",
                  }}
                  aria-hidden
                />
                {/* Gradiente forte no rodapé para legibilidade do nome */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(to top, hsl(var(--western-green-deep) / 0.96) 0%, hsl(var(--western-green-deep) / 0.7) 28%, transparent 60%)",
                  }}
                  aria-hidden
                />
                <div className="absolute bottom-4 left-4 right-4">
                  {(() => {
                    const [nome, contexto] = p.eyebrow.split("·").map((s) => s.trim());
                    return (
                      <>
                        <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-western-gold-soft mb-2">
                          {p.titulo}
                        </p>
                        <h3 className="font-display text-2xl md:text-[1.7rem] text-western-cream leading-[1.05] line-clamp-2 drop-shadow-[0_2px_8px_hsl(var(--western-green-deep)/0.6)]">
                          {nome}
                        </h3>
                        {contexto && (
                          <p className="text-[11px] text-western-cream-muted mt-1.5 line-clamp-1">
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
