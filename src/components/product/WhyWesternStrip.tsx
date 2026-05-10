import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { BUSINESS } from "@/config/business";

const CARDS = [
  {
    big: "10×",
    title: "Mais leve que pedra natural",
    text: "Viabiliza laje, mezanino, andar alto e reduz o custo total da obra em 30 a 50%.",
    cta: "Tecnologia",
    to: "/por-que-western",
    external: false,
  },
  {
    big: "6",
    title: "Fases de pintura mineral",
    text: "Manual, peça por peça, com 5 cores sobrepostas em cada fase. Resiste a cloro, UV e intempéries por décadas.",
    cta: "Processo",
    to: "/por-que-western",
    external: false,
  },
  {
    big: "+300k",
    title: "Downloads no SketchUp Warehouse",
    text: "Catálogo completo em 3D, especificado por estúdios no Brasil e no exterior. Projete a composição inteira antes de qualquer compra.",
    cta: "3D Warehouse",
    to: BUSINESS.sketchupWarehouse,
    external: true,
  },
  {
    big: "33",
    title: "Anos no Brasil",
    text: "Empresa familiar fundada em 1993. Tecnologia trazida do Arizona — mesmos artistas que assinaram trabalhos da Disney.",
    cta: "Nossa história",
    to: "/sobre",
    external: false,
  },
];

export default function WhyWesternStrip() {
  return (
    <section className="bg-western-green-deep text-western-cream py-20 md:py-28">
      <div className="container-western">
        <header className="text-center max-w-2xl mx-auto mb-14">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-western-gold mb-4">
            Por que Western
          </p>
          <h2 className="font-display text-3xl md:text-4xl leading-tight">
            Os argumentos que estão em todas as peças do nosso catálogo.
          </h2>
        </header>

        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {CARDS.map((c) => {
            const inner = (
              <>
                <p className="font-display text-5xl text-western-cream mb-3 leading-none">{c.big}</p>
                <p className="text-base font-medium text-western-cream mb-2">{c.title}</p>
                <p className="text-sm text-western-cream/70 leading-relaxed mb-5">{c.text}</p>
                <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-western-gold group-hover:translate-x-0.5 transition-transform">
                  {c.cta} <ArrowRight className="h-3 w-3" />
                </span>
              </>
            );
            return (
              <li key={c.title} className="border-t border-western-cream/30 pt-7">
                {c.external ? (
                  <a href={c.to} target="_blank" rel="noopener noreferrer" className="group block">
                    {inner}
                  </a>
                ) : (
                  <Link to={c.to} className="group block">
                    {inner}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
