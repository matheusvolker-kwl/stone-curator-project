import { Link } from "react-router-dom";
import { ArrowRight, Feather, Palette, Box, ShieldCheck, Quote } from "lucide-react";
import Seo from "@/components/seo/Seo";
import Reveal from "@/components/shared/Reveal";
import ProjetosSection from "@/components/home/ProjetosSection";
import ArtistaSection from "@/components/home/ArtistaSection";
import MarcasInstitucionais from "@/components/shared/MarcasInstitucionais";
import { useScrollY } from "@/hooks/useScrollY";
import { BUSINESS } from "@/config/business";
import heroCascata from "@/assets/hero-cascata.webp";
import heroCascataSm from "@/assets/hero-cascata-sm.webp";

const DORES = [
  {
    dor: "A pedra natural é pesada e cara de instalar.",
    virada:
      "A Western é muito mais leve: instala sem estrutura extra, com menos mão de obra e menos imprevisto na obra.",
  },
  {
    dor: "O acabamento artificial denuncia que é falso.",
    virada:
      "São 6 fases de pintura mineral feitas à mão. O cliente passa a mão e jura que é pedra de verdade.",
  },
  {
    dor: "Você recusa projetos que não consegue executar.",
    virada:
      "Cascata de 15 metros, pele de pedra com limite de peso, aplicação em cobertura: a Western viabiliza — e isso é serviço novo que você fatura.",
  },
];

const GANHOS = [
  {
    t: "Cobra mais pelo mesmo serviço",
    d: "Acabamento premium sustenta um preço que revestimento comum não alcança — margem que fica com você.",
  },
  {
    t: "Produto que mais cresce",
    d: "A linha de pedras artesanais dobrou de vendas nos últimos ciclos. É a alavanca de margem mais direta para quem revende.",
  },
  {
    t: "Menos custo de obra",
    d: "Leveza reduz mão de obra, transporte e reforço estrutural. O que você economiza na execução vira lucro.",
  },
];

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
  { n: "02", t: "Acesso liberado", d: "Validação automática pelo ramo — liberação na hora, sem espera." },
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

      {/* 1. HERO — promessa de resultado */}
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
              "linear-gradient(180deg, hsl(var(--western-green-deep) / 0.7) 0%, hsl(var(--western-green-deep) / 0.5) 45%, hsl(var(--western-green-deep) / 0.88) 100%)",
          }}
        />

        <div className="absolute inset-0 flex items-end pb-16 md:pb-24">
          <div className="container-western w-full">
            <div className="max-w-3xl text-western-cream">
              <Reveal variant="fade-up" duration={800}>
                <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-western-gold-soft mb-6">
                  Programa de parceiros · {BUSINESS.anosOperacao} anos
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
                  Pedra artesanal muito mais leve, com acabamento que engana o olho. Você instala mais rápido, aceita projetos que hoje recusa e cobra mais pelo resultado.
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
                    className="inline-flex items-center gap-2 h-12 px-7 border border-western-cream/40 text-western-cream hover:border-western-cream/70 font-mono text-xs uppercase tracking-[0.22em] transition-colors"
                  >
                    Ver catálogo
                  </Link>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* 2. ESPELHO DA DOR + VIRADA */}
      <section className="surface-ivory py-20 md:py-28 border-b border-western-stone-warm/10">
        <div className="container-western">
          <Reveal variant="fade-up" duration={700}>
            <div className="max-w-2xl mb-12 md:mb-16">
              <p className="text-eyebrow mb-3">Quem já executa entende</p>
              <div className="w-12 h-px bg-western-gold mb-6" />
              <h2 className="font-display text-3xl md:text-5xl text-western-green-deep leading-[1.05]">
                Você conhece esses problemas.
              </h2>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6">
            {DORES.map((item, i) => (
              <Reveal key={item.dor} variant="fade-up" delay={i * 100} duration={750}>
                <article className="h-full flex flex-col border-t border-western-stone-warm/25 pt-6">
                  <p className="font-display text-lg md:text-xl text-western-stone-warm/80 leading-snug mb-6 italic">
                    “{item.dor}”
                  </p>
                  <div className="mt-auto border-l-2 border-western-gold pl-5">
                    <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-western-gold mb-2">
                      Com Western
                    </p>
                    <p className="text-western-green-deep leading-relaxed text-[15px] md:text-base">
                      {item.virada}
                    </p>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 3. O GANHO NO BOLSO */}
      <section className="surface-forest py-16 md:py-24 border-y border-western-gold/15">
        <div className="container-western">
          {/* TODO: inserir números reais de ganho/markup quando o cliente fornecer */}
          <Reveal variant="fade-up" duration={700}>
            <div className="max-w-2xl mb-12 md:mb-14">
              <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-western-gold-soft mb-4">
                O ganho no bolso
              </p>
              <h2 className="font-display text-3xl md:text-5xl text-western-cream leading-[1.05]">
                A conta fecha{" "}
                <span className="italic font-light text-western-gold-soft">antes da obra começar.</span>
              </h2>
            </div>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-western-gold/20 border border-western-gold/20">
            {GANHOS.map((g, i) => (
              <Reveal key={g.t} variant="fade-up" delay={i * 100} duration={700}>
                <div className="bg-western-green-deep p-8 md:p-10 h-full">
                  <h3 className="font-display text-xl md:text-2xl text-western-cream leading-tight mb-4">
                    {g.t}
                  </h3>
                  <p className="text-sm md:text-base text-western-cream-muted leading-relaxed">
                    {g.d}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 4. PROVA — ponte para os 33 anos + Ricardo */}
      <section className="surface-ivory pt-20 md:pt-28 pb-4 border-b border-western-stone-warm/10">
        <div className="container-western max-w-3xl text-center">
          <Reveal variant="fade-up" duration={700}>
            <p className="text-eyebrow mb-4">A prova</p>
            <div className="w-12 h-px bg-western-gold mx-auto mb-8" />
          </Reveal>
          <Reveal variant="fade-up" duration={800} delay={100}>
            <h2 className="font-display text-3xl md:text-5xl text-western-green-deep leading-[1.05] mb-6">
              Isso não é promessa de vendedor.{" "}
              <span className="italic font-light text-western-gold">
                É o que a Western faz há {BUSINESS.anosOperacao} anos.
              </span>
            </h2>
          </Reveal>
          <Reveal variant="fade-up" duration={750} delay={200}>
            <p className="text-western-stone-warm text-base md:text-lg leading-relaxed">
              Técnica trazida do Arizona pelos mesmos artistas que assinaram trabalhos para a Disney. Um composto mineral com fibra de PET reciclado, fabricado peça a peça em Cajamar/SP — leve, resistente, e com um acabamento que se confunde com a pedra da serra.
            </p>
          </Reveal>
        </div>
      </section>

      <Reveal variant="fade-up" duration={800}>
        <ArtistaSection />
      </Reveal>

      {/* 5. PROJETOS */}
      <Reveal variant="fade-up" duration={800}>
        <ProjetosSection />
      </Reveal>

      {/* 6. PROVA SOCIAL DO PAR — depoimento */}
      <section className="surface-ivory py-20 md:py-28 border-t border-western-stone-warm/10">
        <div className="container-western max-w-3xl">
          {/* TODO: substituir por depoimento real de parceiro */}
          <Reveal variant="fade-up" duration={750}>
            <div className="text-center mb-10">
              <p className="text-eyebrow mb-3">Quem já é parceiro</p>
              <div className="w-12 h-px bg-western-gold mx-auto" />
            </div>
          </Reveal>

          <Reveal variant="fade-up" duration={800} delay={120}>
            <figure className="relative bg-western-paper/60 border border-western-stone-warm/15 p-10 md:p-14">
              <Quote
                className="absolute top-6 left-6 h-10 w-10 text-western-gold/25"
                strokeWidth={1.2}
                aria-hidden
              />
              <blockquote className="font-display text-xl md:text-2xl lg:text-3xl text-western-green-deep leading-[1.25] italic pl-4 md:pl-10">
                [depoimento de um parceiro laguista/loja entra aqui — a fala real de alguém que fatura mais com Western há alguns ciclos, ancorando o resultado em números do próprio negócio dele]
              </blockquote>
              <figcaption className="mt-8 pl-4 md:pl-10 flex items-center gap-4">
                <div
                  className="h-12 w-12 rounded-full bg-western-stone-warm/20 border border-western-stone-warm/30 flex-shrink-0"
                  aria-hidden
                />
                <div>
                  <p className="font-display text-base text-western-green-deep leading-tight">
                    Nome do parceiro
                  </p>
                  <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-western-stone-warm mt-1">
                    Cidade/UF · segmento
                  </p>
                </div>
              </figcaption>
            </figure>
          </Reveal>

          <Reveal variant="fade-up" duration={700} delay={220}>
            <p className="text-center mt-10 text-sm md:text-base text-western-stone-warm">
              Junte-se aos profissionais que já são parceiros Western.
            </p>
          </Reveal>
        </div>
      </section>

      {/* 7. POR QUE PEDRA WESTERN */}
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

      {/* 8. MARCAS + ARQUITETOS */}
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

      {/* 9. COMO FUNCIONA */}
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

          {/* Degrau de baixo compromisso */}
          <Reveal variant="fade-up" duration={700} delay={150}>
            <div className="mt-12 md:mt-14 pt-6 border-t border-western-stone-warm/15 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-western-stone-warm">
              <span>Ainda não quer se cadastrar?</span>
              <Link
                to="/linhas"
                className="font-mono text-[11px] uppercase tracking-[0.22em] text-western-green-deep hover:text-western-gold border-b border-western-stone-warm/30 hover:border-western-gold pb-0.5 transition-colors"
              >
                Ver catálogo
              </Link>
              <span aria-hidden>ou</span>
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-[11px] uppercase tracking-[0.22em] text-western-green-deep hover:text-western-gold border-b border-western-stone-warm/30 hover:border-western-gold pb-0.5 transition-colors"
              >
                Falar no WhatsApp
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 10. CTA FINAL */}
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
              Cadastro na hora para profissionais do paisagismo e da construção — de arquitetos e paisagistas a laguistas, jardineiros, garden centers, lojas e construtoras.
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
