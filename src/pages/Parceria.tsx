import { Link } from "react-router-dom";
import {
  ArrowRight,
  Feather,
  Palette,
  Box,
  ShieldCheck,
  Quote,
  TrendingUp,
  LineChart,
  Wrench,
  Hammer,
  Brush,
  Layers,
} from "lucide-react";
import Seo from "@/components/seo/Seo";
import Reveal from "@/components/shared/Reveal";
import ProjetosSection from "@/components/home/ProjetosSection";
import ArtistaSection from "@/components/home/ArtistaSection";

import SocialProof from "@/components/shared/SocialProof";
import { useScrollY } from "@/hooks/useScrollY";
import { BUSINESS } from "@/config/business";
import heroParceria from "@/assets/hero-parceria.webp";
import heroParceriaSm from "@/assets/hero-parceria-sm.webp";
import parceriaInstalacao from "@/assets/parceria-instalacao.webp";
import parceriaInstalacaoSm from "@/assets/parceria-instalacao-sm.webp";
import parceriaDetalhe from "@/assets/parceria-detalhe.webp";
import parceriaDetalheSm from "@/assets/parceria-detalhe-sm.webp";
import thiagoCastro from "@/assets/thiago-castro.webp";

type DorItem = {
  Icon: typeof Feather;
  dor: string;
  ancora: string;
  virada: React.ReactNode;
};

const DORES: DorItem[] = [
  {
    Icon: Hammer,
    dor: "Pedra natural Ã© pesada e cara de instalar.",
    ancora: "Muito mais leve",
    virada: (
      <>
        Instala <strong className="text-western-green-deep font-semibold">sem estrutura extra</strong>, com menos mÃ£o de obra.
      </>
    ),
  },
  {
    Icon: Brush,
    dor: "O acabamento artificial denuncia que Ã© falso.",
    ancora: "6 fases Ã  mÃ£o",
    virada: (
      <>
        Pintura mineral em camadas. O cliente <strong className="text-western-green-deep font-semibold">jura que Ã© pedra de verdade</strong>.
      </>
    ),
  },
  {
    Icon: Layers,
    dor: "VocÃª recusa projetos que nÃ£o consegue executar.",
    ancora: "Viabiliza o difÃ­cil",
    virada: (
      <>
        Cascata de 15m, pele em cobertura, limite de peso: <strong className="text-western-green-deep font-semibold">serviÃ§o novo que vocÃª fatura</strong>.
      </>
    ),
  },
];

type GanhoItem = {
  Icon: typeof TrendingUp;
  numero: string;
  t: string;
  d: React.ReactNode;
};

const GANHOS: GanhoItem[] = [
  {
    Icon: TrendingUp,
    numero: "+",
    t: "Cobra mais",
    d: (
      <>
        Acabamento premium sustenta preÃ§o que <strong className="text-western-cream font-semibold">revestimento comum nÃ£o alcanÃ§a</strong>.
      </>
    ),
  },
  {
    Icon: LineChart,
    numero: "2Ã—",
    t: "Produto que mais cresce",
    d: (
      <>
        A linha de pedras <strong className="text-western-cream font-semibold">dobrou de vendas</strong> nos Ãºltimos ciclos.
      </>
    ),
  },
  {
    Icon: Wrench,
    numero: "âˆ’",
    t: "Menos custo de obra",
    d: (
      <>
        Leveza reduz <strong className="text-western-cream font-semibold">mÃ£o de obra, transporte e estrutura</strong>.
      </>
    ),
  },
];

const BENEFICIOS = [
  {
    Icon: Feather,
    t: "Muito mais leve",
    d: "Instala sem estrutura extra.",
  },
  {
    Icon: Palette,
    t: "6 fases de pintura Ã  mÃ£o",
    d: "Resiste ao cloro, UV e tempo.",
  },
  {
    Icon: Box,
    t: "4 acabamentos + 3D SketchUp",
    d: "+300 mil downloads no 3D Warehouse.",
  },
  {
    Icon: ShieldCheck,
    t: `Garantia de ${BUSINESS.garantiaLabel}`,
    d: "Composto mineral com PET reciclado.",
  },
];

const PASSOS = [
  { n: "01", t: "Cadastro com CNPJ", d: "FormulÃ¡rio curto." },
  { n: "02", t: "Acesso liberado", d: "ValidaÃ§Ã£o automÃ¡tica pelo ramo." },
  { n: "03", t: "PreÃ§o e 3D", d: "Tabela de atacado e arquivos SketchUp." },
  { n: "04", t: "Compre no atacado", d: `Sem pedido mÃ­nimo Â· produÃ§Ã£o ${BUSINESS.prazoProducaoDias} dias Ãºteis.` },
];

/** Placeholder visual â€” cliente preenche depois com foto real. */
function ImageSlot({ aspect = "aspect-[4/3]", texto }: { aspect?: string; texto: string }) {
  return (
    <div
      className={`w-full ${aspect} bg-western-green-mid/20 border-2 border-dashed border-western-gold/30 flex items-center justify-center p-6`}
      role="img"
      aria-label={texto}
    >
      <p className="font-mono text-[10px] md:text-[11px] uppercase tracking-[0.22em] text-western-stone-warm text-center leading-relaxed max-w-xs">
        {texto}
      </p>
    </div>
  );
}

export default function Parceria() {
  const scrollY = useScrollY();
  const heroParallax = `translate3d(0, ${scrollY * 0.18}px, 0) scale(${1 + scrollY * 0.0003})`;
  const waHref = `https://wa.me/${BUSINESS.whatsappFabrica}?text=${encodeURIComponent(
    "OlÃ¡! Vim pela pÃ¡gina de parceria e quero conversar sobre a Western."
  )}`;

  return (
    <>
      <Seo
        title="Western â€” Parceria"
        description="HÃ¡ 33 anos recriando a natureza em pedra artesanal. Fabricamos peÃ§a a peÃ§a em Cajamar/SP para profissionais do paisagismo e da construÃ§Ã£o. Seja parceiro Western."
        path="/parceria"
        ogType="website"
      />

      {/* 1. HERO */}
      <section className="relative w-full h-[85vh] min-h-[600px] overflow-hidden bg-western-green-deep">
        <img
          src={heroParceria}
          srcSet={`${heroParceriaSm} 900w, ${heroParceria} 1800w`}
          sizes="100vw"
          alt="Pedra artesanal Western Ã  beira de piscina com Ã¡gua cristalina."
          loading="eager"
          {...({ fetchpriority: "high" } as Record<string, string>)}
          decoding="async"
          width={1800}
          height={1343}
          className="absolute inset-0 w-full h-full object-cover object-[center_60%] will-change-transform"
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
                  Programa de parceiros Â· {BUSINESS.anosOperacao} anos
                </p>
              </Reveal>
              <Reveal variant="fade-up" duration={900} delay={120}>
                <h1 className="font-display text-4xl md:text-6xl lg:text-7xl leading-[1.02] mb-6">
                  Entregue o lago que o cliente jura ser natural{" "}
                  <span className="italic font-light text-western-gold-soft">â€” e cobre por isso.</span>
                </h1>
              </Reveal>
              <Reveal variant="fade-up" duration={800} delay={240}>
                <p className="text-western-cream-muted text-lg md:text-xl max-w-2xl leading-relaxed mb-10">
                  Pedra artesanal leve, com acabamento que engana o olho.
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
                    Ver catÃ¡logo
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
              <p className="text-eyebrow mb-3">Quem jÃ¡ executa entende</p>
              <div className="w-12 h-px bg-western-gold mb-6" />
              <h2 className="font-display text-3xl md:text-5xl text-western-green-deep leading-[1.05]">
                VocÃª conhece esses problemas.
              </h2>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-10 items-start">
            {/* SLOT DE IMAGEM - cliente vai fornecer */}
            <Reveal variant="fade-up" duration={800} className="lg:col-span-2 lg:sticky lg:top-24">
              <div className="w-full aspect-[4/5] overflow-hidden bg-western-green-mid/20">
                <img
                  src={parceriaDetalhe}
                  srcSet={`${parceriaDetalheSm} 600w, ${parceriaDetalhe} 1200w`}
                  sizes="(min-width: 1024px) 40vw, 100vw"
                  alt="Detalhe da pedra Western entre vegetaÃ§Ã£o â€” acabamento natural que engana o olho."
                  loading="lazy"
                  decoding="async"
                  width={1200}
                  height={1500}
                  className="w-full h-full object-cover object-center"
                />
              </div>
            </Reveal>

            <ul className="lg:col-span-3 space-y-6">
              {DORES.map((item, i) => (
                <Reveal key={item.dor} variant="fade-up" delay={i * 100} duration={700}>
                  <li className="border-t border-western-stone-warm/25 pt-6">
                    <p className="font-display text-lg md:text-xl text-western-stone-warm/75 italic leading-snug mb-4">
                      â€œ{item.dor}â€
                    </p>
                    <div className="flex items-start gap-4 border-l-2 border-western-gold pl-5">
                      <item.Icon className="h-5 w-5 text-western-gold mt-1 flex-shrink-0" strokeWidth={1.5} aria-hidden />
                      <div>
                        <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-western-gold mb-1.5">
                          {item.ancora}
                        </p>
                        <p className="text-western-stone-warm leading-relaxed text-[15px] md:text-base">
                          {item.virada}
                        </p>
                      </div>
                    </div>
                  </li>
                </Reveal>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* 3. O GANHO NO BOLSO */}
      <section className="surface-forest py-16 md:py-24 border-y border-western-gold/15">
        <div className="container-western">
          {/* TODO: inserir nÃºmeros reais de ganho/markup quando o cliente fornecer */}
          <Reveal variant="fade-up" duration={700}>
            <div className="max-w-2xl mb-12 md:mb-14">
              <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-western-gold-soft mb-4">
                O ganho no bolso
              </p>
              <h2 className="font-display text-3xl md:text-5xl text-western-cream leading-[1.05]">
                A conta fecha{" "}
                <span className="italic font-light text-western-gold-soft">antes da obra comeÃ§ar.</span>
              </h2>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-12 items-center">
            {/* SLOT DE IMAGEM - cliente vai fornecer */}
            <Reveal variant="fade-up" duration={800} className="lg:col-span-2 order-last lg:order-first">
              <div className="w-full aspect-[4/5] overflow-hidden bg-western-green-mid/20">
                <img
                  src={parceriaInstalacao}
                  srcSet={`${parceriaInstalacaoSm} 600w, ${parceriaInstalacao} 1200w`}
                  sizes="(min-width: 1024px) 40vw, 100vw"
                  alt="Profissional instalando pedra Western â€” leveza que dispensa estrutura extra."
                  loading="lazy"
                  decoding="async"
                  width={1200}
                  height={1500}
                  className="w-full h-full object-cover object-center"
                />
              </div>
            </Reveal>

            <ul className="lg:col-span-3 space-y-px bg-western-gold/20 border border-western-gold/20">
              {GANHOS.map((g, i) => (
                <Reveal key={g.t} variant="fade-up" delay={i * 90} duration={700}>
                  <li className="bg-western-green-deep p-7 md:p-8 flex items-start gap-5">
                    <g.Icon className="h-6 w-6 text-western-gold flex-shrink-0 mt-1" strokeWidth={1.4} aria-hidden />
                    <div className="flex-1">
                      <div className="flex items-baseline gap-3 mb-2">
                        <span className="font-display text-3xl md:text-4xl text-western-gold-soft leading-none">
                          {g.numero}
                        </span>
                        <h3 className="font-display text-lg md:text-xl text-western-cream leading-tight">
                          {g.t}
                        </h3>
                      </div>
                      <p className="text-sm md:text-base text-western-cream-muted leading-relaxed">
                        {g.d}
                      </p>
                    </div>
                  </li>
                </Reveal>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* 4. PROVA â€” 33 anos + Ricardo */}
      <section className="surface-ivory pt-20 md:pt-28 pb-4 border-b border-western-stone-warm/10">
        <div className="container-western max-w-3xl text-center">
          <Reveal variant="fade-up" duration={700}>
            <p className="text-eyebrow mb-4">A prova</p>
            <div className="w-12 h-px bg-western-gold mx-auto mb-8" />
          </Reveal>
          <Reveal variant="fade-up" duration={800} delay={100}>
            <h2 className="font-display text-3xl md:text-5xl text-western-green-deep leading-[1.05] mb-6">
              NÃ£o Ã© promessa de vendedor.{" "}
              <span className="italic font-light text-western-gold">
                Ã‰ o que a Western faz hÃ¡ {BUSINESS.anosOperacao} anos.
              </span>
            </h2>
          </Reveal>
          <Reveal variant="fade-up" duration={750} delay={200}>
            <p className="text-western-stone-warm text-base md:text-lg leading-relaxed">
              TÃ©cnica trazida do <strong className="text-western-green-deep font-semibold">Arizona</strong> pelos artistas que assinaram trabalhos para a <strong className="text-western-green-deep font-semibold">Disney</strong>.{" "}
              Composto mineral com <strong className="text-western-green-deep font-semibold">PET reciclado</strong>, fabricado peÃ§a a peÃ§a em <strong className="text-western-green-deep font-semibold">Cajamar/SP</strong>.
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

      {/* 6. DEPOIMENTO */}
      <section className="surface-ivory py-24 md:py-32 border-t border-western-stone-warm/10">
        <div className="container-western max-w-3xl">
          {/* TODO: substituir por depoimento real de parceiro */}
          <Reveal variant="fade-up" duration={750}>
            <div className="text-center mb-12">
              <p className="text-eyebrow mb-3">Quem jÃ¡ Ã© parceiro</p>
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
                â€œInstalei minha primeira cascata Western e o cliente nÃ£o acreditou que nÃ£o era pedra de verdade. Hoje Ã© o serviÃ§o que mais me dÃ¡ lucro â€” e o que mais me indicam.â€
              </blockquote>
              <figcaption className="mt-10 pl-4 md:pl-10 flex items-center gap-4">
                <img
                  src={thiagoCastro}
                  alt="Thiago Castro, paisagista parceiro Western no Rio de Janeiro."
                  loading="lazy"
                  decoding="async"
                  width={48}
                  height={48}
                  className="h-12 w-12 rounded-full object-cover border border-western-stone-warm/30 flex-shrink-0"
                />
                <div>
                  <p className="font-display text-base text-western-green-deep leading-tight">
                    Thiago Castro
                  </p>
                  <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-western-stone-warm mt-1">
                    Rio de Janeiro Â· Paisagista
                  </p>
                </div>
              </figcaption>
            </figure>
          </Reveal>

          <Reveal variant="fade-up" duration={700} delay={220}>
            <p className="text-center mt-12 text-sm md:text-base text-western-stone-warm">
              Junte-se aos profissionais que jÃ¡ sÃ£o parceiros Western.
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
                <span className="italic font-light text-western-gold">â€” e sobrevive a ele.</span>
              </h2>
            </div>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-western-stone-warm/15 border border-western-stone-warm/15">
            {BENEFICIOS.map(({ Icon, t, d }, i) => (
              <Reveal key={t} variant="fade-up" delay={i * 80} duration={700}>
                <div className="bg-western-ivory p-7 md:p-8 h-full">
                  <Icon className="h-6 w-6 text-western-gold mb-5" strokeWidth={1.4} aria-hidden />
                  <h3 className="font-display text-lg md:text-xl text-western-green-deep leading-tight mb-2">
                    {t}
                  </h3>
                  <p className="text-sm text-western-stone-warm leading-relaxed">
                    {d}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 8. PROVA SOCIAL â€” rostos + mural de logos */}
      <section className="surface-forest py-16 md:py-20 border-y border-western-gold/15">
        <div className="container-western max-w-5xl">
          <Reveal variant="fade-up" duration={750}>
            <SocialProof
              variant="dark"
              eyebrow="Especificada por quem define o mercado"
              titulo={<>Profissionais e marcas que mantÃªm a Western em seus projetos.</>}
              groups={["celebridades", "profissionais", "marcas"]}
            />
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
                Quatro passos atÃ© virar parceiro.
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
                  <h3 className="font-display text-xl md:text-2xl text-western-green-deep leading-tight mb-2">
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
              <span>Ainda nÃ£o quer se cadastrar?</span>
              <Link
                to="/linhas"
                className="font-mono text-[11px] uppercase tracking-[0.22em] text-western-green-deep hover:text-western-gold border-b border-western-stone-warm/30 hover:border-western-gold pb-0.5 transition-colors"
              >
                Ver catÃ¡logo
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
              Pronto para entregar o que ninguÃ©m{" "}
              <span className="italic font-light text-western-gold-soft">na sua regiÃ£o entrega?</span>
            </h2>
            <p className="text-western-cream-muted text-base md:text-lg max-w-xl mx-auto mb-10 leading-relaxed">
              Cadastro na hora para profissionais do paisagismo e da construÃ§Ã£o.
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
