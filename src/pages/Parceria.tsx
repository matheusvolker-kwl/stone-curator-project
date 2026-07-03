import { Link } from "react-router-dom";
import { ArrowRight, Feather, Palette, Box, ShieldCheck } from "lucide-react";
import Seo from "@/components/seo/Seo";
import Reveal from "@/components/shared/Reveal";
import ProjetosSection from "@/components/home/ProjetosSection";
import ArtistaSection from "@/components/home/ArtistaSection";
import MarcasInstitucionais from "@/components/shared/MarcasInstitucionais";
import { useScrollY } from "@/hooks/useScrollY";
import { BUSINESS } from "@/config/business";
import heroCascata from "@/assets/hero-cascata.webp";
import heroCascataSm from "@/assets/hero-cascata-sm.webp";

const BENEFICIOS = [
  {
    Icon: Feather,
    t: "Muito mais leve que pedra natural",
    d: "Instala sem estrutura extra — acelera a obra e libera o projeto.",
  },
  {
    Icon: Palette,
    t: "6 fases de pintura mineral à mão",
    d: "Resiste ao cloro, ao UV e ao tempo sem perder profundidade de cor.",
  },
  {
    Icon: Box,
    t: "4 acabamentos e modelos 3D no SketchUp",
    d: "Mais de 300 mil downloads no 3D Warehouse por profissionais do setor.",
  },
  {
    Icon: ShieldCheck,
    t: `Durabilidade com garantia de ${BUSINESS.garantiaLabel}`,
    d: "Composto mineral com fibra de PET reciclado — leveza, resistência e menos impacto.",
  },
];

const PASSOS = [
  { n: "01", t: "Cadastre-se com seu CNPJ", d: "Formulário curto, feito para profissionais do ramo." },
  { n: "02", t: "Acesso liberado", d: "Validação automática pelo ramo — liberação rápida, sem burocracia." },
  { n: "03", t: "Preço de parceiro e modelos 3D", d: "Tabela de atacado, catálogo completo e arquivos SketchUp." },
  { n: "04", t: "Compre no atacado", d: `Pedido mínimo ${BUSINESS.pedidoMinimoLabel}, produção em ${BUSINESS.prazoProducaoDias} dias úteis.` },
];

export default function Parceria() {
  const scrollY = useScrollY();
  const heroParallax = `translate3d(0, ${scrollY * 0.18}px, 0) scale(${1 + scrollY * 0.0003})`;
  const waHref = `https://wa.me/${BUSINESS.whatsappFabrica}?text=${encodeURIComponent(
    "Olá! Vim pela página de parceria e quero conversar sobre a Western."
  )}`;

  return (
    <>
      <Seo
        title="Western — Parceria"
        description="Há 33 anos recriando a natureza em pedra artesanal. Fabricamos peça a peça em Cajamar/SP para profissionais do paisagismo e da construção. Seja parceiro Western."
        path="/parceria"
        ogType="website"
      />

      {/* HERO editorial imersivo */}
      <section className="relative w-full h-[85vh] min-h-[600px] overflow-hidden bg-western-green-deep">
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
              "linear-gradient(180deg, hsl(var(--western-green-deep) / 0.65) 0%, hsl(var(--western-green-deep) / 0.45) 45%, hsl(var(--western-green-deep) / 0.85) 100%)",
          }}
        />

        <div className="absolute inset-0 flex items-end pb-16 md:pb-24">
          <div className="container-western w-full">
            <div className="max-w-3xl text-western-cream">
              <Reveal variant="fade-up" duration={800}>
                <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-western-gold-soft mb-6">
                  {BUSINESS.anosOperacao} anos · Pedra artesanal
                </p>
              </Reveal>
              <Reveal variant="fade-up" duration={900} delay={120}>
                <h1 className="font-display text-4xl md:text-6xl lg:text-7xl leading-[1.02] mb-6">
                  Viabilizamos o que parecia impossível{" "}
                  <span className="italic font-light text-western-gold-soft">
                    — com acabamento de obra de arte.
                  </span>
                </h1>
              </Reveal>
              <Reveal variant="fade-up" duration={800} delay={240}>
                <p className="text-western-cream-muted text-lg md:text-xl max-w-2xl leading-relaxed mb-10">
                  Há {BUSINESS.anosOperacao} anos recriamos a natureza em pedra artesanal — do habitat da arara-azul a cascatas que o cliente jura serem naturais.
                </p>
              </Reveal>
              <Reveal variant="fade-up" duration={700} delay={360}>
                <div className="flex flex-wrap items-center gap-3">
                  <Link
                    to="/parceiro/cadastro"
                    className="inline-flex items-center gap-2 h-12 px-7 bg-western-gold text-western-green-deep hover:bg-western-gold-soft font-mono text-xs uppercase tracking-[0.22em] transition-colors"
                  >
                    Quero ser parceiro <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    to="/linhas"
                    className="inline-flex items-center gap-2 h-12 px-7 border border-western-cream/40 text-western-cream hover:border-western-gold hover:text-western-gold-soft font-mono text-xs uppercase tracking-[0.22em] transition-colors"
                  >
                    Ver catálogo
                  </Link>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* HISTÓRIA — editorial */}
      <section className="surface-ivory py-20 md:py-28 border-b border-western-stone-warm/10">
        <div className="container-western max-w-4xl text-center">
          <Reveal variant="fade-up" duration={700}>
            <p className="text-eyebrow mb-4">A origem</p>
            <div className="w-12 h-px bg-western-gold mx-auto mb-8" />
          </Reveal>
          <Reveal variant="fade-up" duration={800} delay={100}>
            <h2 className="font-display text-3xl md:text-5xl text-western-green-deep leading-[1.1] mb-8">
              Tecnologia trazida do Arizona,{" "}
              <span className="italic font-light text-western-gold">fabricada peça a peça em Cajamar.</span>
            </h2>
          </Reveal>
          <Reveal variant="fade-up" duration={750} delay={200}>
            <p className="text-western-stone-warm text-base md:text-lg leading-relaxed max-w-2xl mx-auto">
              A Western nasceu ao lado dos mesmos artistas que assinaram trabalhos para a Disney. Trouxemos essa técnica para o Brasil e desenvolvemos um composto mineral com fibra de PET reciclado — leve, resistente, e com um acabamento que se confunde com a pedra da serra.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Ricardo — reaproveitado */}
      <Reveal variant="fade-up" duration={800}>
        <ArtistaSection />
      </Reveal>

      {/* Projetos — reaproveitado */}
      <Reveal variant="fade-up" duration={800}>
        <ProjetosSection />
      </Reveal>

      {/* POR QUE PEDRA WESTERN */}
      <section className="surface-paper py-16 md:py-24 border-t border-western-stone-warm/10">
        <div className="container-western">
          <Reveal variant="fade-up" duration={700}>
            <div className="max-w-2xl mb-12 md:mb-16">
              <p className="text-eyebrow mb-3">Por que Western</p>
              <h2 className="font-display text-3xl md:text-5xl text-western-green-deep leading-[1.05]">
                A pedra que resolve o projeto{" "}
                <span className="italic font-light text-western-gold">— e sobrevive a ele.</span>
              </h2>
            </div>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-western-stone-warm/15 border border-western-stone-warm/15">
            {BENEFICIOS.map(({ Icon, t, d }, i) => (
              <Reveal key={t} variant="fade-up" delay={i * 90} duration={700}>
                <div className="bg-western-ivory p-8 md:p-10 h-full">
                  <Icon className="h-6 w-6 text-western-gold mb-5" strokeWidth={1.4} />
                  <h3 className="font-display text-xl md:text-2xl text-western-green-deep leading-tight mb-3">
                    {t}
                  </h3>
                  <p className="text-sm md:text-base text-western-stone-warm leading-relaxed">
                    {d}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* MARCAS + ARQUITETOS */}
      <section className="surface-forest py-16 md:py-20 border-y border-western-gold/15">
        <div className="container-western max-w-4xl">
          <Reveal variant="fade-up" duration={750}>
            <div className="text-center mb-10 md:mb-12">
              <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-western-gold-soft/85 mb-5">
                Especificada por quem define o mercado
              </p>
              <div className="w-10 h-px bg-western-gold/50 mx-auto mb-7" />
              <h2 className="font-display text-2xl md:text-[2rem] text-western-cream leading-[1.2] max-w-2xl mx-auto">
                Arquitetos e marcas que mantêm a Western em seus projetos.
              </h2>
              <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-western-gold-soft/90 mt-6">
                Marcelo Faisal · Fabiano Hayasaki · Ronaldo Luidi
              </p>
            </div>
          </Reveal>
          <Reveal variant="fade-up" delay={120} duration={750}>
            <div className="pt-8 border-t border-western-gold/15">
              <MarcasInstitucionais compacta variante="dark" semBordas semLinks />
            </div>
          </Reveal>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section className="surface-ivory py-16 md:py-24 border-t border-western-stone-warm/10">
        <div className="container-western">
          <Reveal variant="fade-up" duration={700}>
            <div className="max-w-2xl mb-12 md:mb-16">
              <p className="text-eyebrow mb-3">Como funciona</p>
              <h2 className="font-display text-3xl md:text-5xl text-western-green-deep leading-[1.05]">
                Quatro passos até virar parceiro.
              </h2>
            </div>
          </Reveal>
          <ol className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-4">
            {PASSOS.map((p, i) => (
              <Reveal key={p.n} variant="fade-up" delay={i * 100} duration={700}>
                <li className="relative border-t-2 border-western-gold/60 pt-6 h-full">
                  <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-western-gold block mb-4">
                    {p.n}
                  </span>
                  <h3 className="font-display text-xl md:text-2xl text-western-green-deep leading-tight mb-3">
                    {p.t}
                  </h3>
                  <p className="text-sm text-western-stone-warm leading-relaxed">
                    {p.d}
                  </p>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="surface-forest py-20 md:py-28">
        <div className="container-western max-w-3xl text-center">
          <Reveal variant="fade-up" duration={800}>
            <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-western-gold-soft mb-6">
              Parceria Western
            </p>
            <h2 className="font-display text-3xl md:text-5xl lg:text-6xl text-western-cream leading-[1.05] mb-8">
              Pronto para entregar o que ninguém{" "}
              <span className="italic font-light text-western-gold-soft">na sua região entrega?</span>
            </h2>
            <p className="text-western-cream-muted text-base md:text-lg max-w-xl mx-auto mb-10 leading-relaxed">
              Tabela de atacado, modelos 3D e catálogo completo liberados após o cadastro.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                to="/parceiro/cadastro"
                className="inline-flex items-center gap-2 h-12 px-8 bg-western-gold text-western-green-deep hover:bg-western-gold-soft font-mono text-xs uppercase tracking-[0.22em] transition-colors"
              >
                Quero ser parceiro <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-xs uppercase tracking-[0.22em] text-western-gold-soft hover:text-western-gold transition-colors border-b border-western-gold/30 hover:border-western-gold pb-1"
              >
                Falar no WhatsApp
              </a>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
