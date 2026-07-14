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
  Wallet,
  LayoutGrid,
  FileText,
  MessageCircle,
  ChevronRight,
  Check,
  Lock,
} from "lucide-react";
import Seo from "@/components/seo/Seo";
import Reveal from "@/components/shared/Reveal";
import ProjetosSection from "@/components/home/ProjetosSection";
import ArtistaSection from "@/components/home/ArtistaSection";

import SocialProof from "@/components/shared/SocialProof";
import { BUSINESS } from "@/config/business";
import heroParceria from "@/assets/hero-parceria.webp";
import heroParceriaSm from "@/assets/hero-parceria-sm.webp";
import parceriaInstalacao from "@/assets/parceria-instalacao.webp";
import parceriaInstalacaoSm from "@/assets/parceria-instalacao-sm.webp";
import parceriaDetalhe from "@/assets/parceria-detalhe.webp";
import parceriaDetalheSm from "@/assets/parceria-detalhe-sm.webp";
import thiagoCastro from "@/assets/thiago-castro.webp";

/** Eyebrow sobre fundo escuro/foto — bronze não teria contraste ali. */
const EYEBROW_DARK =
  "font-sans text-[14px] font-semibold uppercase tracking-[0.06em] text-western-gold-soft";

type DorItem = {
  Icon: typeof Feather;
  dor: string;
  ancora: string;
  virada: React.ReactNode;
};

const DORES: DorItem[] = [
  {
    Icon: Hammer,
    dor: "Pedra natural é pesada e cara de instalar.",
    ancora: "Muito mais leve",
    virada: (
      <>
        Instala <strong className="text-western-green-deep font-semibold">sem estrutura extra</strong>, com menos mão de obra.
      </>
    ),
  },
  {
    Icon: Brush,
    dor: "O acabamento artificial denuncia que é falso.",
    ancora: "6 fases à mão",
    virada: (
      <>
        Pintura mineral em camadas. O cliente <strong className="text-western-green-deep font-semibold">jura que é pedra de verdade</strong>.
      </>
    ),
  },
  {
    Icon: Layers,
    dor: "Você recusa projetos que não consegue executar.",
    ancora: "Viabiliza o difícil",
    virada: (
      <>
        Cascata de 15m, pele em cobertura, limite de peso: <strong className="text-western-green-deep font-semibold">serviço novo que você fatura</strong>.
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
        Acabamento premium sustenta preço que <strong className="text-western-cream font-semibold">revestimento comum não alcança</strong>.
      </>
    ),
  },
  {
    Icon: LineChart,
    numero: "2×",
    t: "Produto que mais cresce",
    d: (
      <>
        A linha de pedras <strong className="text-western-cream font-semibold">dobrou de vendas</strong> nos últimos ciclos.
      </>
    ),
  },
  {
    Icon: Wrench,
    numero: "−",
    t: "Menos custo de obra",
    d: (
      <>
        Leveza reduz <strong className="text-western-cream font-semibold">mão de obra, transporte e estrutura</strong>.
      </>
    ),
  },
];

/** O que o credenciamento libera (referência: screen do kit). */
const LIBERA = [
  {
    Icon: Wallet,
    t: "Preço de parceiro",
    d: "Tabela de atacado, liberada só para profissionais.",
  },
  {
    Icon: Box,
    t: "Modelos 3D no SketchUp",
    d: "+300 mil downloads no 3D Warehouse — especifique no seu projeto.",
  },
  {
    Icon: LayoutGrid,
    t: "Composições prontas",
    d: "Conjuntos por ambiente, com o papel de cada peça.",
  },
  {
    Icon: FileText,
    t: "Condições B2B",
    d: `NF-e, garantia de ${BUSINESS.garantiaLabel} e reposição garantida.`,
  },
];

const PUBLICO = [
  "Arquitetos",
  "Paisagistas",
  "Laguistas",
  "Jardineiros",
  "Garden centers",
  "Lojas",
  "Construtoras",
];

const BENEFICIOS = [
  {
    Icon: Feather,
    t: "Muito mais leve",
    d: "Instala sem estrutura extra.",
  },
  {
    Icon: Palette,
    t: "6 fases de pintura à mão",
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
  { n: "1", t: "Cadastro com CNPJ", d: "Formulário curto, com o CNPJ da empresa." },
  { n: "2", t: "Acesso liberado na hora", d: "Validação automática pelo seu ramo." },
  { n: "3", t: "Preço e 3D", d: "Tabela de atacado e arquivos SketchUp." },
  {
    n: "4",
    t: "Compre no atacado",
    d: `Produção em ${BUSINESS.prazoProducaoDias} dias úteis · garantia de ${BUSINESS.garantiaLabel}.`,
  },
];

const CONFIANCA = [
  { Icon: Check, t: "Aprovação automática e imediata" },
  { Icon: FileText, t: "NF-e em todo pedido" },
  { Icon: ShieldCheck, t: `Garantia de ${BUSINESS.garantiaLabel} · ateliê brasileiro desde ${BUSINESS.fundadaEm}` },
  { Icon: Lock, t: `CNPJ ${BUSINESS.cnpj}` },
];

const DUVIDAS = [
  {
    q: "Preciso de CNPJ?",
    a: "Sim. É uma loja para profissionais — o CNPJ ativo libera o preço de parceiro.",
  },
  {
    q: "Tem algum custo?",
    a: "Não. O credenciamento é gratuito.",
  },
  {
    q: "Quanto tempo até liberar?",
    a: "Na hora. A validação é automática pelo ramo de atuação.",
  },
  {
    q: "Sou cliente final, posso comprar?",
    a: "O atendimento a projeto residencial é direto pelo WhatsApp — é só tocar no atalho no topo da página.",
  },
];

export default function Parceria() {
  const waHref = `https://wa.me/${BUSINESS.whatsappFabrica}?text=${encodeURIComponent(
    "Olá! Vim pela página de parceria e quero conversar sobre a Western."
  )}`;
  const waClienteFinal = `https://wa.me/${BUSINESS.whatsappFabrica}?text=${encodeURIComponent(
    "Olá Western! Sou cliente final e gostaria de fazer um projeto com pedras Western."
  )}`;

  return (
    <>
      <Seo
        title="Western — Parceria"
        description="Há 33 anos recriando a natureza em pedra artesanal. Fabricamos peça a peça em Cajamar/SP para profissionais do paisagismo e da construção. Seja parceiro Western."
        path="/parceria"
        ogType="website"
      />

      {/* 1. HERO — foto + overlay verde. CTA dourado porque está sobre foto. */}
      <section className="relative w-full min-h-[560px] md:min-h-[620px] overflow-hidden bg-western-green-deep">
        <img
          src={heroParceria}
          srcSet={`${heroParceriaSm} 900w, ${heroParceria} 1800w`}
          sizes="100vw"
          alt="Pedra artesanal Western à beira de piscina com água cristalina."
          loading="eager"
          {...({ fetchpriority: "high" } as Record<string, string>)}
          decoding="async"
          width={1800}
          height={1343}
          className="absolute inset-0 w-full h-full object-cover object-[center_60%]"
        />
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden
          style={{
            background:
              "linear-gradient(180deg, hsl(var(--western-green-deep) / 0.62) 0%, hsl(var(--western-green-deep) / 0.58) 40%, hsl(var(--western-green-deep) / 0.92) 100%)",
          }}
        />

        <div className="relative container-western w-full pt-16 pb-14 md:pt-24 md:pb-20 flex items-end min-h-[560px] md:min-h-[620px]">
          <div className="max-w-2xl text-western-cream">
            <Reveal variant="fade-up" duration={700}>
              <p className={`${EYEBROW_DARK} mb-4`}>
                Credenciamento B2B · Aprovação imediata
              </p>
            </Reveal>
            <Reveal variant="fade-up" duration={800} delay={100}>
              <h1 className="display-xl text-western-cream mb-4">
                Solicite acesso de parceiro comercial.
              </h1>
            </Reveal>
            <Reveal variant="fade-up" duration={700} delay={200}>
              <p className="text-[17px] md:text-[18px] leading-[1.6] text-western-cream-muted max-w-xl mb-8">
                Atendemos profissionais do paisagismo e da construção com CNPJ ativo. A tabela de
                atacado, os modelos 3D e as composições são liberados na hora do cadastro.
              </p>
            </Reveal>
            <Reveal variant="fade-up" duration={600} delay={300}>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <Link to="/parceiro/cadastro" className="btn-gold w-full sm:w-auto">
                  Criar meu cadastro <ArrowRight className="h-5 w-5" aria-hidden />
                </Link>
                <Link to="/linhas" className="btn-outline-cream w-full sm:w-auto">
                  Ver catálogo
                </Link>
              </div>
              <p className="mt-4 text-[14px] text-western-cream-muted">
                Grátis · leva menos de 2 minutos · precisa de CNPJ
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* 2. ATALHO CLIENTE FINAL + O QUE O CADASTRO LIBERA */}
      <section className="surface-ivory py-14 md:py-20">
        <div className="container-western">
          <Reveal variant="fade-up" duration={700}>
            <a
              href={waClienteFinal}
              target="_blank"
              rel="noopener noreferrer"
              className="tap-target flex items-center gap-4 w-full max-w-2xl p-4 md:p-5 rounded-[10px] bg-white border border-western-border-soft hover:border-western-border-strong transition-colors"
            >
              <span className="flex-shrink-0 flex items-center justify-center h-11 w-11 rounded-[10px] bg-western-paper">
                <MessageCircle className="h-5 w-5 text-western-green-deep" strokeWidth={1.75} aria-hidden />
              </span>
              <span className="flex-1 min-w-0">
                <span className="block font-sans text-[17px] font-semibold text-western-green-deep leading-snug">
                  Sou cliente final
                </span>
                <span className="block text-[15px] text-western-stone-warm leading-snug mt-0.5">
                  Quero um projeto residencial — atendimento direto pelo WhatsApp.
                </span>
              </span>
              <ChevronRight className="h-5 w-5 text-western-border-strong flex-shrink-0" aria-hidden />
            </a>
          </Reveal>

          <Reveal variant="fade-up" duration={700} delay={80}>
            <div className="mt-14 md:mt-20 max-w-2xl">
              <p className="text-eyebrow mb-3">O que o cadastro libera</p>
              <h2 className="display-lg text-western-green-deep">
                Tudo que um profissional precisa para especificar.
              </h2>
            </div>
          </Reveal>

          <ul className="mt-10 md:mt-12 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {LIBERA.map((item, i) => (
              <Reveal key={item.t} variant="fade-up" delay={i * 70} duration={650}>
                <li className="h-full flex items-start gap-4 bg-white border border-western-border-soft rounded-[10px] p-6 md:p-7">
                  <item.Icon className="h-6 w-6 text-western-bronze flex-shrink-0 mt-0.5" strokeWidth={1.75} aria-hidden />
                  <div>
                    <h3 className="font-sans text-[20px] font-semibold text-western-green-deep leading-snug mb-1.5">
                      {item.t}
                    </h3>
                    <p className="text-[16px] leading-[1.55] text-western-stone-warm">{item.d}</p>
                  </div>
                </li>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* 3. ESPELHO DA DOR + VIRADA */}
      <section className="surface-paper py-16 md:py-24">
        <div className="container-western">
          <Reveal variant="fade-up" duration={700}>
            <div className="max-w-2xl mb-10 md:mb-14">
              <p className="text-eyebrow mb-3">Quem já executa entende</p>
              <h2 className="display-lg text-western-green-deep">
                Você conhece esses problemas.
              </h2>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12 items-start">
            <Reveal variant="fade-up" duration={800} className="lg:col-span-2 lg:sticky lg:top-24">
              <div className="w-full aspect-[4/5] overflow-hidden rounded-[16px] bg-western-cream">
                <img
                  src={parceriaDetalhe}
                  srcSet={`${parceriaDetalheSm} 600w, ${parceriaDetalhe} 1200w`}
                  sizes="(min-width: 1024px) 40vw, 100vw"
                  alt="Detalhe da pedra Western entre vegetação — acabamento natural que engana o olho."
                  loading="lazy"
                  decoding="async"
                  width={1200}
                  height={1500}
                  className="w-full h-full object-cover object-center"
                />
              </div>
            </Reveal>

            <ul className="lg:col-span-3 space-y-4 md:space-y-6">
              {DORES.map((item, i) => (
                <Reveal key={item.dor} variant="fade-up" delay={i * 90} duration={700}>
                  <li className="bg-white border border-western-border-soft rounded-[10px] p-6 md:p-7">
                    <p className="text-[17px] md:text-[18px] leading-[1.5] text-western-stone-warm mb-5">
                      “{item.dor}”
                    </p>
                    <div className="flex items-start gap-4 pt-5 border-t border-western-border-soft">
                      <item.Icon className="h-6 w-6 text-western-bronze mt-0.5 flex-shrink-0" strokeWidth={1.75} aria-hidden />
                      <div>
                        <p className="text-eyebrow mb-1.5">{item.ancora}</p>
                        <p className="text-[17px] leading-[1.6] text-western-stone-warm">
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

      {/* 4. O GANHO NO BOLSO — faixa verde pontual */}
      <section className="surface-forest py-16 md:py-24">
        <div className="container-western">
          {/* TODO: inserir números reais de ganho/markup quando o cliente fornecer */}
          <Reveal variant="fade-up" duration={700}>
            <div className="max-w-2xl mb-10 md:mb-14">
              <p className={`${EYEBROW_DARK} mb-3`}>O ganho no bolso</p>
              <h2 className="display-lg text-western-cream">
                A conta fecha antes da obra começar.
              </h2>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12 items-center">
            <Reveal variant="fade-up" duration={800} className="lg:col-span-2 order-last lg:order-first">
              <div className="w-full aspect-[4/5] overflow-hidden rounded-[16px] bg-western-green-mid/30">
                <img
                  src={parceriaInstalacao}
                  srcSet={`${parceriaInstalacaoSm} 600w, ${parceriaInstalacao} 1200w`}
                  sizes="(min-width: 1024px) 40vw, 100vw"
                  alt="Profissional instalando pedra Western — leveza que dispensa estrutura extra."
                  loading="lazy"
                  decoding="async"
                  width={1200}
                  height={1500}
                  className="w-full h-full object-cover object-center"
                />
              </div>
            </Reveal>

            <ul className="lg:col-span-3 space-y-4 md:space-y-5">
              {GANHOS.map((g, i) => (
                <Reveal key={g.t} variant="fade-up" delay={i * 90} duration={700}>
                  <li className="bg-western-green-mid/40 border border-western-gold/25 rounded-[10px] p-6 md:p-7 flex items-start gap-5">
                    <g.Icon className="h-6 w-6 text-western-gold-soft flex-shrink-0 mt-1" strokeWidth={1.75} aria-hidden />
                    <div className="flex-1">
                      <div className="flex items-baseline gap-3 mb-2">
                        <span className="display-md text-western-gold-soft">{g.numero}</span>
                        <h3 className="font-sans text-[20px] font-semibold text-western-cream leading-snug">
                          {g.t}
                        </h3>
                      </div>
                      <p className="text-[16px] md:text-[17px] leading-[1.6] text-western-cream-muted">
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

      {/* 5. PROVA — 33 anos */}
      <section className="surface-ivory pt-16 md:pt-24 pb-4">
        <div className="container-western max-w-3xl text-center">
          <Reveal variant="fade-up" duration={700}>
            <p className="text-eyebrow mb-4">A prova</p>
          </Reveal>
          <Reveal variant="fade-up" duration={800} delay={80}>
            <h2 className="display-lg text-western-green-deep mb-6">
              Não é promessa de vendedor. É o que a Western faz há {BUSINESS.anosOperacao} anos.
            </h2>
          </Reveal>
          <Reveal variant="fade-up" duration={750} delay={160}>
            <p className="text-[17px] md:text-[18px] leading-[1.65] text-western-stone-warm">
              Técnica trazida do <strong className="text-western-green-deep font-semibold">Arizona</strong> pelos artistas que assinaram trabalhos para a <strong className="text-western-green-deep font-semibold">Disney</strong>.{" "}
              Composto mineral com <strong className="text-western-green-deep font-semibold">PET reciclado</strong>, fabricado peça a peça em <strong className="text-western-green-deep font-semibold">Cajamar/SP</strong>.
            </p>
          </Reveal>
        </div>
      </section>

      <Reveal variant="fade-up" duration={800}>
        <ArtistaSection />
      </Reveal>

      {/* 6. PROJETOS */}
      <Reveal variant="fade-up" duration={800}>
        <ProjetosSection />
      </Reveal>

      {/* 7. DEPOIMENTO */}
      <section className="surface-ivory py-16 md:py-24">
        <div className="container-western max-w-3xl">
          {/* TODO: substituir por depoimento real de parceiro */}
          <Reveal variant="fade-up" duration={700}>
            <div className="text-center mb-10 md:mb-12">
              <p className="text-eyebrow">Quem já é parceiro</p>
            </div>
          </Reveal>

          <Reveal variant="fade-up" duration={800} delay={100}>
            <figure className="relative bg-white border border-western-border-soft rounded-[16px] p-8 md:p-12">
              <Quote
                className="h-8 w-8 text-western-gold/40 mb-5"
                strokeWidth={1.5}
                aria-hidden
              />
              <blockquote className="display-md text-western-green-deep">
                “Instalei minha primeira cascata Western e o cliente não acreditou que não era pedra de verdade. Hoje é o serviço que mais me dá lucro — e o que mais me indicam.”
              </blockquote>
              <figcaption className="mt-8 pt-6 border-t border-western-border-soft flex items-center gap-4">
                <img
                  src={thiagoCastro}
                  alt="Thiago Castro, paisagista parceiro Western no Rio de Janeiro."
                  loading="lazy"
                  decoding="async"
                  width={48}
                  height={48}
                  className="h-12 w-12 rounded-full object-cover border border-western-border-soft flex-shrink-0"
                />
                <div>
                  <p className="font-sans text-[17px] font-semibold text-western-green-deep leading-tight">
                    Thiago Castro
                  </p>
                  <p className="text-meta mt-0.5">Rio de Janeiro · Paisagista</p>
                </div>
              </figcaption>
            </figure>
          </Reveal>
        </div>
      </section>

      {/* 8. POR QUE PEDRA WESTERN */}
      <section className="surface-paper py-16 md:py-24">
        <div className="container-western">
          <Reveal variant="fade-up" duration={700}>
            <div className="max-w-2xl mb-10 md:mb-14">
              <p className="text-eyebrow mb-3">Por que Western</p>
              <h2 className="display-lg text-western-green-deep">
                A pedra que resolve o projeto — e sobrevive a ele.
              </h2>
            </div>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {BENEFICIOS.map(({ Icon, t, d }, i) => (
              <Reveal key={t} variant="fade-up" delay={i * 70} duration={650}>
                <div className="h-full bg-white border border-western-border-soft rounded-[10px] p-6 md:p-7">
                  <Icon className="h-6 w-6 text-western-bronze mb-5" strokeWidth={1.75} aria-hidden />
                  <h3 className="font-sans text-[20px] font-semibold text-western-green-deep leading-snug mb-2">
                    {t}
                  </h3>
                  <p className="text-[16px] leading-[1.55] text-western-stone-warm">{d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 9. PROVA SOCIAL */}
      <section className="surface-forest py-16 md:py-20">
        <div className="container-western max-w-5xl">
          <Reveal variant="fade-up" duration={750}>
            <SocialProof
              variant="dark"
              eyebrow="Especificada por quem define o mercado"
              titulo={<>Profissionais e marcas que mantêm a Western em seus projetos.</>}
              groups={["celebridades", "profissionais", "marcas"]}
            />
          </Reveal>
        </div>
      </section>

      {/* 10. COMO FUNCIONA + PARA QUEM É */}
      <section className="surface-ivory py-16 md:py-24">
        <div className="container-western">
          <Reveal variant="fade-up" duration={700}>
            <div className="max-w-2xl mb-10 md:mb-14">
              <p className="text-eyebrow mb-3">Como funciona</p>
              <h2 className="display-lg text-western-green-deep">
                Quatro passos até virar parceiro.
              </h2>
            </div>
          </Reveal>

          <ol className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {PASSOS.map((p, i) => (
              <Reveal key={p.n} variant="fade-up" delay={i * 80} duration={650}>
                <li className="h-full bg-white border border-western-border-soft rounded-[10px] p-6 md:p-7">
                  <span className="inline-flex items-center justify-center h-9 w-9 rounded-[6px] bg-western-paper text-western-bronze font-sans text-[16px] font-semibold mb-4">
                    {p.n}
                  </span>
                  <h3 className="font-sans text-[20px] font-semibold text-western-green-deep leading-snug mb-2">
                    {p.t}
                  </h3>
                  <p className="text-[16px] leading-[1.55] text-western-stone-warm">{p.d}</p>
                </li>
              </Reveal>
            ))}
          </ol>

          {/* Para quem é */}
          <Reveal variant="fade-up" duration={700} delay={100}>
            <div className="mt-12 md:mt-16">
              <p className="font-sans text-[17px] font-semibold text-western-green-deep mb-4">
                Feito para quem trabalha com pedra e paisagem:
              </p>
              <ul className="flex flex-wrap gap-2 md:gap-3">
                {PUBLICO.map((p) => (
                  <li
                    key={p}
                    className="inline-flex items-center gap-2 h-10 px-4 rounded-full bg-white border border-western-border-soft text-[16px] text-western-green-deep"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-western-gold flex-shrink-0" aria-hidden />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          {/* Sinais de confiança perto da decisão */}
          <Reveal variant="fade-up" duration={700} delay={140}>
            <ul className="mt-12 md:mt-14 pt-8 border-t border-western-border-soft grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
              {CONFIANCA.map(({ Icon, t }) => (
                <li key={t} className="flex items-center gap-3 text-[16px] text-western-stone-warm">
                  <Icon className="h-5 w-5 text-western-bronze flex-shrink-0" strokeWidth={1.75} aria-hidden />
                  {t}
                </li>
              ))}
            </ul>
          </Reveal>

          {/* Degrau de baixo compromisso */}
          <Reveal variant="fade-up" duration={700} delay={180}>
            <div className="mt-10 flex flex-col sm:flex-row sm:items-center gap-3">
              <Link to="/parceiro/cadastro" className="btn-primary w-full sm:w-auto">
                Criar meu cadastro <ArrowRight className="h-5 w-5" aria-hidden />
              </Link>
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline-forest w-full sm:w-auto"
              >
                <MessageCircle className="h-5 w-5" aria-hidden />
                Falar com um consultor
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 11. DÚVIDAS RÁPIDAS */}
      <section className="surface-paper py-16 md:py-24">
        <div className="container-western max-w-3xl">
          <Reveal variant="fade-up" duration={700}>
            <p className="text-eyebrow mb-3">Dúvidas rápidas</p>
            <h2 className="display-lg text-western-green-deep mb-10 md:mb-12">
              Antes de se cadastrar.
            </h2>
          </Reveal>
          <dl className="space-y-4">
            {DUVIDAS.map(({ q, a }, i) => (
              <Reveal key={q} variant="fade-up" delay={i * 70} duration={650}>
                <div className="bg-white border border-western-border-soft rounded-[10px] p-6 md:p-7">
                  <dt className="font-sans text-[20px] font-semibold text-western-green-deep leading-snug mb-2">
                    {q}
                  </dt>
                  <dd className="text-[17px] leading-[1.6] text-western-stone-warm">{a}</dd>
                </div>
              </Reveal>
            ))}
          </dl>
        </div>
      </section>

      {/* 12. CTA FINAL — faixa verde. CTA dourado por estar sobre verde. */}
      <section className="surface-forest py-16 md:py-24">
        <div className="container-western max-w-3xl text-center">
          <Reveal variant="fade-up" duration={800}>
            <p className={`${EYEBROW_DARK} mb-4`}>Parceria Western</p>
            <h2 className="display-lg text-western-cream mb-6">
              Pronto para o preço de parceiro?
            </h2>
            <p className="text-[17px] md:text-[18px] leading-[1.6] text-western-cream-muted max-w-xl mx-auto mb-8">
              Cadastro com CNPJ, aprovação automática e imediata. Grátis para profissionais do ramo.
            </p>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center gap-3 max-w-md mx-auto sm:max-w-none">
              <Link to="/parceiro/cadastro" className="btn-gold w-full sm:w-auto">
                Criar meu cadastro <ArrowRight className="h-5 w-5" aria-hidden />
              </Link>
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline-cream w-full sm:w-auto"
              >
                <MessageCircle className="h-5 w-5" aria-hidden />
                Falar no WhatsApp
              </a>
            </div>
            <p className="mt-6 text-[14px] text-western-cream-muted">
              Ateliê desde {BUSINESS.fundadaEm} · NF-e em todo pedido · Garantia de {BUSINESS.garantiaLabel}
            </p>
          </Reveal>
        </div>
      </section>
    </>
  );
}
