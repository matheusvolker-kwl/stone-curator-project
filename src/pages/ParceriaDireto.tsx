import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { MessageCircle, ArrowRight } from "lucide-react";
import Seo from "@/components/seo/Seo";
import Reveal from "@/components/shared/Reveal";
import { BUSINESS } from "@/config/business";
import heroCascata from "@/assets/hero-cascata.webp";
import heroCascataSm from "@/assets/hero-cascata-sm.webp";

/* DS V3 — landing de anúncio (lead direto no WhatsApp).
 * Escuro/foto continua permitido no hero e na faixa institucional; o dourado
 * é acento e só aparece SOBRE foto/verde. Na seção clara o CTA primário volta
 * a ser verde. Sem parallax, sem itálico/serifa, sem mono, nada abaixo de 14px. */

/** Eyebrow sobre foto/verde — bronze não teria contraste ali. */
const EYEBROW_DARK =
  "font-sans text-[14px] font-semibold uppercase tracking-[0.06em] text-western-gold-soft";

const PROVAS = [
  { n: `${BUSINESS.anosOperacao} anos`, l: "de pedra artesanal no Brasil" },
  { n: "+300 mil", l: "downloads dos modelos 3D no SketchUp" },
  { n: "Muito mais leve", l: "instala sem estrutura extra" },
];

export default function ParceriaDireto() {
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

      {/* 1. HERO — WhatsApp em primeiro plano. CTA dourado porque está sobre foto. */}
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
          className="absolute inset-0 w-full h-full object-cover object-center"
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
                <p className={`${EYEBROW_DARK} mb-5`}>
                  Parceiro Western · Atendimento direto
                </p>
              </Reveal>
              <Reveal variant="fade-up" duration={900} delay={120}>
                <h1 className="display-xl mb-5 text-western-cream">
                  Entregue o lago que o cliente jura ser natural{" "}
                  <span className="text-western-gold-soft">— e cobre por isso.</span>
                </h1>
              </Reveal>
              <Reveal variant="fade-up" duration={800} delay={240}>
                <p className="mb-9 max-w-2xl text-[17px] md:text-[18px] leading-[1.6] text-western-cream-muted">
                  Pedra artesanal muito mais leve, com acabamento que engana o olho. Fale agora com nosso time e receba a tabela de parceiro.
                </p>
              </Reveal>
              <Reveal variant="fade-up" duration={700} delay={360}>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <a
                    href={waHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-gold w-full sm:w-auto"
                  >
                    <MessageCircle className="h-5 w-5" strokeWidth={1.75} aria-hidden />
                    Falar no WhatsApp agora
                  </a>
                  <Link to="/parceiro/cadastro" className="btn-outline-cream w-full sm:w-auto">
                    Prefere se cadastrar direto?
                    <ArrowRight className="h-5 w-5" aria-hidden />
                  </Link>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* 2. FAIXA DE 3 PROVAS — faixa institucional verde. */}
      <section className="surface-forest py-14 md:py-16 border-y border-western-gold/15">
        <div className="container-western">
          <ul className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8 text-center">
            {PROVAS.map((p, i) => (
              <Reveal key={p.l} variant="fade-up" delay={i * 100} duration={700}>
                <li>
                  <p className="display-lg text-western-gold-soft mb-3">
                    {p.n}
                  </p>
                  <p className="mx-auto max-w-[22rem] text-[16px] md:text-[17px] leading-[1.5] text-western-cream-muted">
                    {p.l}
                  </p>
                </li>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* 3. MINI PROVA + CTA FINAL — fundo claro, CTA primário verde. */}
      <section className="surface-ivory py-16 md:py-24">
        <div className="container-western max-w-3xl text-center">
          <Reveal variant="fade-up" duration={750}>
            <p className="text-eyebrow mb-4">Especificada pelo topo do mercado</p>
            <div className="mx-auto mb-8 h-px w-12 bg-western-gold" />
          </Reveal>
          <Reveal variant="fade-up" duration={800} delay={100}>
            <p className="display-md mb-10 text-western-green-deep md:mb-12">
              Projetos de Neymar a resorts, especificada por{" "}
              <span className="text-western-bronze">
                profissionais renomados do paisagismo brasileiro.
              </span>
            </p>
          </Reveal>

          <Reveal variant="fade-up" duration={700} delay={220}>
            <div className="mx-auto flex max-w-md flex-col items-stretch gap-4">
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary w-full"
              >
                <MessageCircle className="h-5 w-5" strokeWidth={1.75} aria-hidden />
                Falar no WhatsApp agora
              </a>
              <Link
                to="/parceiro/cadastro"
                className="tap-target inline-flex items-center justify-center gap-2 font-sans text-[16px] font-semibold text-western-green-deep underline decoration-western-gold underline-offset-4 transition-colors hover:text-western-cta"
              >
                ou cadastre-se para ver o preço de parceiro
                <ArrowRight className="h-5 w-5" aria-hidden />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
