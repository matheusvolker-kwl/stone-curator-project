import { useState } from "react";
import { ArrowRight, Play } from "lucide-react";
import { PROJETOS, type Projeto } from "@/data/projetos";
import ProjetoModal from "./ProjetoModal";

export default function ProjetosSection() {
  const [active, setActive] = useState<Projeto | null>(null);

  return (
    <section className="surface-paper py-20 md:py-28 border-t border-western-stone-warm/10">
      <div className="container-western">
        <div className="max-w-3xl mb-14 md:mb-20">
          <p className="text-eyebrow mb-4">Projetos especificados</p>
          <h2 className="display-lg text-western-green-deep mb-6">
            Obras assinadas com Western.
          </h2>
          <p className="text-western-stone-warm text-[17px] leading-relaxed max-w-xl">
            Arquitetos, paisagistas e clientes que escolheram a pedra artesanal Western como resposta técnica e estética.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 md:gap-12">
          {PROJETOS.map((p) => {
            const [autor, contexto] = p.eyebrow.split("·").map((s) => s.trim());
            const capa = p.cardCover ?? p.cover;
            // Sem foto da obra, a capa é um still do depoimento: o card diz isso em vez
            // de passar um retrato por obra executada sob o título "Obras assinadas".
            const capaEhDepoimento = !p.cardCover && p.coverEhDepoimento === true;

            return (
              <button
                key={p.slug}
                onClick={() => setActive(p)}
                className="group text-left flex flex-col"
              >
                <div className="relative aspect-[4/3] overflow-hidden rounded-[16px] bg-western-stone-warm/10 mb-6">
                  <img
                    src={capa}
                    alt={
                      capaEhDepoimento
                        ? `${p.titulo} — depoimento em vídeo do cliente.`
                        : `Obra: ${p.titulo}`
                    }
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.03]"
                  />

                  {p.video && (
                    <span className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-[6px] bg-western-green-deep/90 px-3 py-1.5 font-sans text-[14px] font-semibold text-western-cream">
                      <Play className="h-4 w-4 fill-current" aria-hidden />
                      {capaEhDepoimento ? "Depoimento em vídeo" : "Vídeo"}
                    </span>
                  )}

                  <div
                    className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                      background:
                        "linear-gradient(180deg, transparent 55%, hsl(var(--western-green-deep) / 0.35) 100%)",
                    }}
                    aria-hidden
                  />
                </div>

                <div className="space-y-2.5">
                  <p className="text-eyebrow">Projeto</p>
                  <h3 className="display-md text-western-green-deep">
                    {p.titulo}
                  </h3>
                  <p className="text-[16px] text-western-stone-warm leading-relaxed">
                    {autor}
                    {contexto && (
                      <span className="text-western-stone-warm/70"> · {contexto}</span>
                    )}
                  </p>
                  <span className="inline-flex items-center gap-2 min-h-[48px] font-sans text-[17px] font-semibold text-western-green-deep group-hover:text-western-cta transition-colors">
                    Ver projeto
                    <ArrowRight
                      className="h-5 w-5 group-hover:translate-x-0.5 transition-transform"
                      aria-hidden
                    />
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <ProjetoModal projeto={active} onClose={() => setActive(null)} />
    </section>
  );
}
