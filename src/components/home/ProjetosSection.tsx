import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { PROJETOS, type Projeto } from "@/data/projetos";
import ProjetoModal from "./ProjetoModal";

export default function ProjetosSection() {
  const [active, setActive] = useState<Projeto | null>(null);

  return (
    <section className="surface-paper py-20 md:py-28 border-t border-western-stone-warm/10">
      <div className="container-western">
        <div className="max-w-3xl mb-14 md:mb-20">
          <p className="text-eyebrow mb-4">Projetos especificados</p>
          <h2 className="font-display text-3xl md:text-5xl text-western-green-deep leading-[1.05] mb-6">
            Obras assinadas com{" "}
            <span className="text-western-gold italic font-light">Western.</span>
          </h2>
          <p className="text-western-stone-warm text-base md:text-[17px] leading-relaxed max-w-xl">
            Arquitetos, paisagistas e clientes que escolheram a pedra artesanal Western como resposta técnica e estética.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 md:gap-12">
          {PROJETOS.map((p) => {
            const [autor, contexto] = p.eyebrow.split("·").map((s) => s.trim());
            return (
              <button
                key={p.slug}
                onClick={() => setActive(p)}
                className="group text-left flex flex-col"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-western-stone-warm/10 mb-6">
                  <img
                    src={p.cover}
                    alt={`Obra: ${p.titulo}`}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.03]"
                  />
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
                  <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-western-gold">
                    Projeto
                  </p>
                  <h3 className="font-display text-2xl md:text-3xl text-western-green-deep leading-[1.15]">
                    {p.titulo}
                  </h3>
                  <p className="text-sm text-western-stone-warm leading-relaxed">
                    {autor}
                    {contexto && (
                      <span className="text-western-stone-warm/70"> · {contexto}</span>
                    )}
                  </p>
                  <div className="pt-3 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] text-western-green-deep border-b border-western-green-deep/25 group-hover:border-western-gold group-hover:text-western-gold transition-colors pb-1">
                    Ver projeto
                    <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                  </div>
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
