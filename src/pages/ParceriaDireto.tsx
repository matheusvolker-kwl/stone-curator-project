import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { MessageCircle, ArrowRight } from "lucide-react";
import Seo from "@/components/seo/Seo";
import Reveal from "@/components/shared/Reveal";
import { useScrollY } from "@/hooks/useScrollY";
import { BUSINESS } from "@/config/business";
import heroCascata from "@/assets/hero-cascata.webp";
import heroCascataSm from "@/assets/hero-cascata-sm.webp";

const PROVAS = [
  { n: `${BUSINESS.anosOperacao} anos`, l: "de pedra artesanal no Brasil" },
  { n: "+300 mil", l: "downloads dos modelos 3D no SketchUp" },
  { n: "Muito mais leve", l: "instala sem estrutura extra" },
];

export default function ParceriaDireto() {
  const scrollY = useScrollY();
  const heroParallax = `translate3d(0, ${scrollY * 0.18}px, 0) scale(${1 + scrollY * 0.0003})`;

  const waHref = `https://wa.me/${BUSINESS.whatsappFabrica}?text=${encodeURIComponent(
    "Olá Western! Vim pelo anúncio e quero conhecer a condição de parceiro / receber a tabela."
  )}`;

  return (
    <>
      <Seo
        title="Western — Fale com um especialista"
        description="Atendimento direto no WhatsApp para profissionais do paisagismo e da construção. Receba a tabela de parceiro e conheça a pedra artesanal Western."
        path="/parceria-direto"
      />
      <Helmet>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      {/* 1. HERO — WhatsApp em primeiro plano */}
      <section className="relative w-full min-h-[85vh] md:min-h-[90vh] overflow-hidden bg-western-green-deep">
        <img
          src={heroCascata}
          srcSet={`${heroCascataSm} 900w, ${heroCascata} 1800w`}
          sizes="100vw"
          alt="Cascata artesanal Western em projeto de paisagismo."
          loading="eager"
          {...({ fetchpriority: "high" } as Record<string, string>)}
          decoding="async"
          width={1820}
          height={1213}
          className="absolute inset-0 w-full h-full object-cover object-center will-change-transform"
          style={{ transform: heroParallax }}
        />
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden
          style={{
            background:
              "linear-gradient(180deg, hsl(var(--western-green-deep) / 0.75) 0%, hsl(var(--western-green-deep) / 0.55) 45%, hsl(var(--western-green-deep) / 0.92) 100%)",
          }}
        />

        <div className="relative z-10 flex items-end min-h-[85vh] md:min-h-[90vh] pb-14 md:pb-20">
          <div className="container-western w-full">
            <div className="max-w-3xl text-western-cream">
              <Reveal variant="fade-up" duration={800}>
                <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-western-gold-soft mb-6">
                  Parceiro Western · Atendimento direto
                </p>
              </Reveal>
              <Reveal variant="fade-up" duration={900} delay={120}>
                <h1 className="font-display text-4xl md:text-6xl lg:text-7xl leading-[1.02] mb-6">
                  Entregue o lago que o cliente jura ser natural{" "}
                  <span className="italic font-light text-western-gold-soft">— e cobre por isso.</span>
                </h1>
              </Reveal>
              <Reveal variant="fade-up" duration={800} delay={240}>
                <p className="text-western-cream-muted text-lg md:text-xl max-w-2xl leading-relaxed mb-10">
                  Pedra artesanal muito mais leve, com acabamento que engana o olho. Fale agora com nosso time e receba a tabela de parceiro.
                </p>
              </Reveal>
              <Reveal variant="fade-up" duration={700} delay={360}>
                <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                  <a
                    href={waHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-3 h-14 md:h-16 px-8 md:px-10 bg-western-gold text-western-green-deep hover:bg-western-gold-soft font-mono text-xs md:text-sm uppercase tracking-[0.22em] transition-colors shadow-lg shadow-western-green-deep/40"
                  >
                    <MessageCircle className="h-5 w-5" strokeWidth={1.6} />
                    Falar no WhatsApp agora
                  </a>
                  <Link
                    to="/parceiro/cadastro"
                    className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.24em] text-western-cream/85 hover:text-western-gold-soft transition-colors border-b border-western-cream/25 hover:border-western-gold-soft pb-1 self-start sm:self-auto"
                  >
                    Prefere se cadastrar direto? <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* 2. FAIXA DE 3 PROVAS */}
      <section className="surface-forest py-14 md:py-16 border-y border-western-gold/15">
        <div className="container-western">
          <ul className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8 text-center">
            {PROVAS.map((p, i) => (
              <Reveal key={p.l} variant="fade-up" delay={i * 100} duration={700}>
                <li>
                  <p className="font-display text-3xl md:text-4xl lg:text-5xl text-western-gold-soft leading-none mb-3">
                    {p.n}
                  </p>
                  <p className="font-mono text-[11px] md:text-xs uppercase tracking-[0.24em] text-western-cream-muted leading-snug max-w-[16rem] mx-auto">
                    {p.l}
                  </p>
                </li>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* 3. MINI PROVA + CTA FINAL */}
      <section className="surface-ivory py-16 md:py-24">
        <div className="container-western max-w-3xl text-center">
          <Reveal variant="fade-up" duration={750}>
            <p className="text-eyebrow mb-4">Especificada pelo topo do mercado</p>
            <div className="w-12 h-px bg-western-gold mx-auto mb-8" />
          </Reveal>
          <Reveal variant="fade-up" duration={800} delay={100}>
            <p className="font-display text-xl md:text-2xl lg:text-[1.7rem] text-western-green-deep leading-[1.35] mb-10 md:mb-12">
              Projetos de Neymar a resorts, especificada por arquitetos como{" "}
              <span className="italic font-light text-western-gold">
                Marcelo Faisal, Fabiano Hayasaki e Ronaldo Luidi.
              </span>
            </p>
          </Reveal>

          <Reveal variant="fade-up" duration={700} delay={220}>
            <div className="flex flex-col items-center gap-5">
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-3 h-14 md:h-16 px-8 md:px-10 bg-western-gold text-western-green-deep hover:bg-western-gold-soft font-mono text-xs md:text-sm uppercase tracking-[0.22em] transition-colors shadow-lg shadow-western-green-deep/20"
              >
                <MessageCircle className="h-5 w-5" strokeWidth={1.6} />
                Falar no WhatsApp agora
              </a>
              <Link
                to="/parceiro/cadastro"
                className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.24em] text-western-stone-warm hover:text-western-gold transition-colors border-b border-western-stone-warm/25 hover:border-western-gold pb-1"
              >
                ou cadastre-se para ver o preço de parceiro <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
