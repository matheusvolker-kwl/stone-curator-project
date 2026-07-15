import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchProducts } from "@/lib/datasource";
import Seo from "@/components/seo/Seo";
import ProductCard from "@/components/product/ProductCard";
import ArtistaSection from "@/components/home/ArtistaSection";
import Reveal from "@/components/shared/Reveal";
import SocialProof from "@/components/shared/SocialProof";
import {
  ArrowRight,
  Box,
  Truck,
  ShieldCheck,
  Check,
  X,
  MessageCircle,
} from "lucide-react";
import { BUSINESS } from "@/config/business";
import { texturaPara } from "@/lib/acabamentoTexturas";
import heroCascata from "@/assets/hero-cascata.webp";
import heroCascataSm from "@/assets/hero-cascata-sm.webp";
import iconePedraBranco from "@/assets/icone-pedra-branco.png";
import imgPiscina from "@/assets/about-projetos/piscina-praia.webp";
import imgFonte from "@/assets/about-projetos/cascata-tropical.webp";
import imgJardim from "@/assets/casos-western/unique-garden.webp";
import imgLago from "@/assets/casos-western/projeto-residencial.webp";
import imgLagoHibrido from "@/assets/conjuntos-render/conjunto-lago-hibrido-igarape-equilibrado.webp";
import imgFazzenda from "@/assets/casos-western/fazzenda-park.webp";

/* DS V3 — eyebrow sobre fundo escuro/foto: mesma métrica do .text-eyebrow
 * (sans semibold 14px, tracking 0.06em), em dourado claro porque o bronze
 * não teria contraste sobre o verde profundo. */
const eyebrowDark =
  "font-sans text-[14px] font-semibold uppercase tracking-[0.06em] text-western-gold-soft";

const ACABAMENTOS = [
  { nome: "Moledo", tone: "#8A7A64" },
  { nome: "Arenito", tone: "#C4A883" },
  { nome: "Granito", tone: "#8C8C88" },
  { nome: "Quartzo", tone: "#D9D2C4" },
];

const TILES = [
  { nome: "Piscina", desc: "Cascatas e bordas para o entorno da piscina", img: imgPiscina },
  { nome: "Lago ornamental", desc: "Composições para lagos e espelhos d'água", img: imgLago },
  { nome: "Lago híbrido", desc: "Estrutura Western + pedra natural", img: imgLagoHibrido },
  { nome: "Jardim", desc: "Jardins contemplativos, com ou sem água", img: imgJardim },
  { nome: "Fonte & cascata", desc: "Fontes e quedas com água corrente", img: imgFonte },
];

const PROJETOS = [
  { img: imgFazzenda, nome: "Fazzenda Park", tipo: "Paisagismo · área externa" },
  { img: imgJardim, nome: "Unique Garden", tipo: "Jardim contemplativo" },
  { img: imgLago, nome: "Projeto residencial", tipo: "Lago ornamental" },
  { img: heroCascata, nome: "Piscina com cascata", tipo: "Residencial · SP" },
  { img: imgFonte, nome: "Cascata tropical", tipo: "Área de lazer" },
  { img: imgPiscina, nome: "Piscina de praia", tipo: "Borda e prainha" },
];

/* "Mais especificados" — a 375px a grade de 2 colunas deixava ~163px por card:
 * o nome da peça truncava ("Cascata Santa…") e o coração/código colidiam com a
 * foto. No mobile vira carrossel com peek (card ~76vw, ~285px); de sm pra cima
 * volta a ser grade. Mesmas classes no esqueleto pra não haver salto de layout. */
const featuredTrack =
  "flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-px-6 scrollbar-hide -mx-6 px-6 pb-1 " +
  "sm:mx-0 sm:px-0 sm:scroll-px-0 sm:grid sm:grid-cols-2 sm:gap-6 sm:overflow-visible " +
  "md:grid-cols-3 lg:grid-cols-4";
const featuredItem = "snap-start shrink-0 w-[76vw] max-w-[300px] sm:w-auto sm:max-w-none";

export default function Index() {
  const { data: featured = [], isLoading: loadingFeatured } = useQuery({
    queryKey: ["featured-products"],
    queryFn: () => fetchProducts(8),
  });

  return (
    <>
      <Seo
        title="Western — Pedras artesanais para paisagismo profissional"
        description="Cascatas, pedras e revestimentos artesanais, até 10× mais leves que a pedra natural — sem guindaste. Catálogo B2B para arquitetos, paisagistas e laguistas, com modelos 3D no SketchUp."
        path="/"
        ogType="website"
      />

      {/* 1 — HERO "Declaração 10%" (foto full-bleed + overlay verde de proteção) */}
      <section className="relative w-full overflow-hidden bg-western-green-deep">
        <img
          src={heroCascata}
          srcSet={`${heroCascataSm} 900w, ${heroCascata} 1800w`}
          sizes="100vw"
          alt="Projeto Western — piscina com cascata de pedra artesanal."
          loading="eager"
          {...({ fetchpriority: "high" } as Record<string, string>)}
          decoding="async"
          width={1820}
          height={1213}
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        {/* Scrim mobile: vertical e mais denso — o texto ocupa a largura toda */}
        <div
          className="absolute inset-0 pointer-events-none md:hidden"
          aria-hidden
          style={{
            background:
              "linear-gradient(180deg, hsl(var(--western-green-deep) / 0.9) 0%, hsl(var(--western-green-deep) / 0.7) 55%, hsl(var(--western-green-deep) / 0.86) 100%)",
          }}
        />
        {/* Scrim desktop: horizontal — texto vive na metade esquerda */}
        <div
          className="absolute inset-0 pointer-events-none hidden md:block"
          aria-hidden
          style={{
            background:
              "linear-gradient(92deg, hsl(var(--western-green-deep) / 0.92) 0%, hsl(var(--western-green-deep) / 0.66) 48%, transparent 84%)",
          }}
        />
        {/* Símbolo da marca como marca d'água (estático — o DS não usa parallax) */}
        <img
          src={iconePedraBranco}
          alt=""
          aria-hidden
          className="hidden md:block absolute right-[6%] top-1/2 -translate-y-1/2 w-[38vw] max-w-[480px] opacity-[0.1] pointer-events-none select-none"
        />

        <div className="relative container-western py-16 md:py-24 md:min-h-[620px] md:flex md:items-center">
          <div className="w-full max-w-2xl text-western-cream animate-fade-in-up">
            <div className="w-12 h-px bg-western-gold mb-6" />
            <p className={`${eyebrowDark} mb-4`}>Pedra artesanal desde 1993</p>
            <h1 className="display-xl text-western-cream">
              Natureza que ninguém acredita ser{" "}
              <span className="text-western-gold-soft">obra.</span>
            </h1>
            <p className="text-[17px] md:text-[19px] leading-[1.6] text-western-cream/85 max-w-md mt-5 mb-6">
              Cascatas, pedras e revestimentos artesanais — até 10× mais leves — para projetos e profissionais.
            </p>

            {/* Comparativo visual de peso — o argumento-assinatura, tangível
                (auditoria). Razão, não kg absoluto, para não overclaim. */}
            <div className="mb-8 max-w-[320px]">
              <div className="mb-1.5 flex items-baseline justify-between text-[14px] text-western-cream/75">
                <span>Pedra natural</span>
                <span>peso cheio</span>
              </div>
              <div
                className="h-2.5 w-full overflow-hidden rounded-full bg-western-cream/15"
                role="img"
                aria-label="Pedra natural: peso de referência (100%)"
              >
                <div className="h-full w-full rounded-full bg-western-cream/45" />
              </div>
              <div className="mb-1.5 mt-4 flex items-baseline justify-between text-[14px] text-western-gold-soft">
                <span className="font-semibold">A mesma peça, em Western</span>
                <span className="font-semibold tabular-nums">~10% do peso</span>
              </div>
              <div
                className="h-2.5 w-full overflow-hidden rounded-full bg-western-gold/20"
                role="img"
                aria-label="Peça Western: cerca de 10% do peso da pedra natural"
              >
                <div className="h-full w-[10%] rounded-full bg-western-gold" />
              </div>
            </div>
            {/* Hierarquia de CTA: a AÇÃO de maior valor (converter) vem primeiro.
                Dourado porque o verde não teria contraste sobre a foto com overlay
                verde — é a regra do V3 (verde é primário sobre fundo claro; sobre
                foto/verde, o acento dourado assume). */}
            <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3">
              <Link to="/parceiro/cadastro" className="btn-gold w-full sm:w-auto">
                Criar cadastro · ver preços <ArrowRight className="h-5 w-5" strokeWidth={1.75} />
              </Link>
              <Link to="/produtos" className="btn-outline-cream w-full sm:w-auto">
                Ver catálogo
              </Link>
            </div>
            <a
              href={`https://wa.me/${BUSINESS.whatsappFabrica}?text=${encodeURIComponent(
                "Olá, vim pelo site da Western e gostaria de falar com o ateliê.",
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 text-[15px] text-western-cream/80 hover:text-western-gold-soft transition-colors"
            >
              <MessageCircle className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
              Prefere falar? Chame o ateliê no WhatsApp
            </a>
            <div className="flex flex-wrap gap-x-10 gap-y-5 mt-10 pt-7 border-t border-western-cream/20">
              {[
                { b: "+400", s: "modelos" },
                { b: "+300 mil", s: "downloads no SketchUp" },
                { b: "33 anos", s: "de ateliê" },
              ].map((x) => (
                <div key={x.s}>
                  <p className="display-md text-western-cream">{x.b}</p>
                  <p className="text-[14px] text-western-cream/70 mt-1.5">{x.s}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 1b — Segmentação B2B×B2C inline (substitui o antigo modal de entrada).
          Uma porta só para "por onde começar": profissional (vê preço) ou casa. */}
      <section className="surface-paper border-b border-western-border-soft py-12 md:py-16">
        <div className="container-western">
          <Reveal variant="fade-up" duration={600}>
            <div className="max-w-2xl mb-7 md:mb-9">
              <p className="text-eyebrow mb-3">Por onde começar</p>
              <h2 className="display-md text-western-green-deep">
                Você é profissional, ou é para a sua casa?
              </h2>
            </div>
          </Reveal>
          <div className="grid gap-4 sm:grid-cols-2">
            <Reveal variant="fade-up" duration={600} distance={16}>
              <div className="h-full flex flex-col rounded-[16px] border border-western-border-soft bg-white p-6 md:p-7">
                <h3 className="font-display text-[20px] text-western-green-deep">
                  Sou profissional ou revenda
                </h3>
                <p className="mt-2 text-[16px] leading-[1.6] text-western-stone-warm flex-1">
                  Arquiteto, paisagista, laguista ou loja. Cadastre-se e veja os
                  preços de parceiro — atacado, com CNPJ.
                </p>
                <Link to="/parceiro/cadastro" className="btn-primary mt-5 w-full sm:w-auto">
                  Criar cadastro · ver preços
                  <ArrowRight className="h-5 w-5" strokeWidth={1.75} />
                </Link>
              </div>
            </Reveal>
            <Reveal variant="fade-up" duration={600} distance={16} delay={80}>
              <div className="h-full flex flex-col rounded-[16px] border border-western-border-soft bg-white p-6 md:p-7">
                <h3 className="font-display text-[20px] text-western-green-deep">
                  É para a minha casa
                </h3>
                <p className="mt-2 text-[16px] leading-[1.6] text-western-stone-warm flex-1">
                  Quer uma cascata, lago ou área de lazer em casa? A gente cuida
                  do projeto pra você, do desenho à entrega.
                </p>
                <Link to="/para-sua-casa" className="btn-outline-forest mt-5 w-full sm:w-auto">
                  Ver as opções para a sua casa
                  <ArrowRight className="h-5 w-5" strokeWidth={1.75} />
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* 2 — Barra de confiança */}
      <section className="bg-white border-b border-western-border-soft">
        <div className="container-western py-6 md:py-7 grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-8">
          {[
            { Icon: Box, t: "+400 modelos", d: "Formato para cada cena." },
            { Icon: ShieldCheck, t: "Garantia de 1 ano", d: "+ reposição em caso de avaria." },
            { Icon: Truck, t: "Reposição garantida", d: "Chegou com defeito? A gente repõe." },
            { Icon: Check, t: "≈10% do peso", d: "Instala sem guindaste." },
          ].map(({ Icon, t, d }, i) => (
            <Reveal key={t} variant="fade-up" delay={i * 70} duration={550} distance={14}>
              <div className="flex items-start gap-3">
                <Icon className="h-6 w-6 text-western-bronze mt-0.5 flex-shrink-0" strokeWidth={1.75} />
                <div>
                  <p className="font-sans text-[16px] font-semibold text-western-green-deep leading-snug">{t}</p>
                  <p className="text-meta mt-1">{d}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* 3 — O que você vai construir? (intenção por aplicação → guia) */}
      <section className="surface-ivory py-16 md:py-24">
        <div className="container-western">
          <Reveal variant="fade-up" duration={700}>
            <p className="text-eyebrow mb-3">Compre por projeto</p>
            <h2 className="display-lg text-western-green-deep mb-8 md:mb-12">
              O que você vai construir?
            </h2>
          </Reveal>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
            {TILES.map((t, i) => (
              <Reveal key={t.nome} variant="fade-up" delay={(i % 4) * 80} duration={600} distance={18}>
                <Link to="/guia-de-composicao" className="group block">
                  <div className="relative overflow-hidden rounded-[16px] aspect-[4/5] bg-western-cream-muted">
                    <img
                      src={t.img}
                      alt={t.nome}
                      loading="lazy"
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-western-green-deep/90 via-western-green-deep/25 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-4 md:p-5">
                      <p className="font-sans text-[20px] font-semibold text-western-cream leading-snug">{t.nome}</p>
                      <p className="text-[14px] text-western-cream/80 mt-1 leading-snug">{t.desc}</p>
                    </div>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 4 — Mais especificados (catálogo dinâmico) */}
      <section className="surface-paper py-16 md:py-20 border-t border-western-border-soft" id="produtos">
        <div className="container-western">
          <Reveal variant="fade-up" duration={700}>
            <div className="flex items-end justify-between mb-8 md:mb-12 flex-wrap gap-4">
              <div>
                <p className="text-eyebrow mb-3">Em destaque</p>
                <h2 className="display-lg text-western-green-deep">Mais especificados.</h2>
              </div>
              <Link
                to="/produtos"
                className="tap-target inline-flex items-center gap-2 font-sans text-[16px] font-semibold text-western-green-deep underline underline-offset-4 decoration-western-gold hover:decoration-western-green-deep transition-colors"
              >
                Ver catálogo completo <ArrowRight className="h-5 w-5" strokeWidth={1.75} />
              </Link>
            </div>
          </Reveal>
          {loadingFeatured && featured.length === 0 ? (
            <div className={featuredTrack}>
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className={`${featuredItem} space-y-3`}>
                  <div className="aspect-square rounded-[16px] bg-western-stone-warm/10 animate-pulse" />
                  <div className="h-5 w-3/4 rounded-[6px] bg-western-stone-warm/10 animate-pulse" />
                  <div className="h-4 w-1/3 rounded-[6px] bg-western-stone-warm/10 animate-pulse" />
                </div>
              ))}
            </div>
          ) : featured.length === 0 ? (
            <div className="rounded-[16px] border border-dashed border-western-border-strong p-10 text-center text-body">
              Catálogo indisponível no momento. Tente recarregar em instantes.
            </div>
          ) : (
            <div className={featuredTrack}>
              {featured.slice(0, 8).map((p, i) => (
                <Reveal
                  key={p.node.id}
                  className={featuredItem}
                  variant="fade-up"
                  delay={(i % 4) * 90}
                  duration={650}
                  distance={20}
                >
                  <ProductCard product={p.node} />
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 5 — Western Box (porta de entrada, preço aberto) */}
      <section className="surface-ivory py-16 md:py-24 border-y border-western-border-soft">
        <div className="container-western">
          <div className="grid md:grid-cols-2 gap-8 md:gap-14 items-center">
            <Reveal variant="fade-right" duration={700}>
              <div className="grid grid-cols-2 gap-px rounded-[16px] overflow-hidden bg-western-border-soft">
                {ACABAMENTOS.map((a) => (
                  <div
                    key={a.nome}
                    className="relative flex items-end p-4 min-h-[140px] md:min-h-[160px] overflow-hidden"
                    style={{ backgroundColor: a.tone }}
                  >
                    <img
                      src={texturaPara(a.nome)}
                      alt={`Acabamento ${a.nome}`}
                      loading="lazy"
                      decoding="async"
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                    {/* gradiente inferior — mantém o rótulo legível sobre texturas escuras */}
                    <span
                      aria-hidden
                      className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/55 via-black/15 to-transparent"
                    />
                    <span className="relative font-sans text-[16px] font-semibold text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.55)]">
                      {a.nome}
                    </span>
                  </div>
                ))}
              </div>
            </Reveal>
            <Reveal variant="fade-left" delay={100} duration={700}>
              <div>
                <p className={`${eyebrowDark} inline-flex items-center rounded-sm bg-western-green-deep px-3 py-1.5 mb-5`}>
                  Porta de entrada
                </p>
                <h2 className="display-lg text-western-green-deep mb-4">
                  Western Box — os 4 acabamentos na sua mão.
                </h2>
                <p className="text-body max-w-md mb-8">
                  A amostra que se paga: os{" "}
                  <b className="text-western-green-deep font-semibold">R$ 149,90 voltam como crédito</b> no seu
                  primeiro pedido. Aberta a todos, sem cadastro e sem mínimo.
                </p>
                <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                  <span className="text-price">R$ 149,90</span>
                  <Link to="/western-box" className="btn-primary w-full sm:w-auto">
                    Conhecer a Box <ArrowRight className="h-5 w-5" strokeWidth={1.75} />
                  </Link>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* 6 — Veja em uso (projetos reais) */}
      <section className="surface-paper py-16 md:py-24">
        <div className="container-western">
          <Reveal variant="fade-up" duration={700}>
            <p className="text-eyebrow mb-3">Veja em uso</p>
            <h2 className="display-lg text-western-green-deep mb-8 md:mb-12">
              Projetos reais, pedra Western.
            </h2>
          </Reveal>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-7 md:gap-x-6 md:gap-y-10">
            {PROJETOS.map((p, i) => (
              <Reveal key={p.nome} variant="fade-up" delay={(i % 3) * 80} duration={620} distance={18}>
                {/* A legenda vivia POR CIMA da foto: nas fotos claras (água turquesa,
                    areia) o texto creme sumia (~1,1:1). Agora ela vive FORA da imagem,
                    sobre o fundo claro da seção — contraste não depende da foto. */}
                <figure className="group">
                  <div className="relative overflow-hidden rounded-[16px] aspect-[4/3] bg-western-cream-muted">
                    <img
                      src={p.img}
                      alt={p.nome}
                      loading="lazy"
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <figcaption className="mt-3">
                    <p className="font-sans text-[17px] font-semibold text-western-green-deep leading-snug">
                      {p.nome}
                    </p>
                    <p className="text-[14px] leading-snug text-western-stone-warm mt-1">{p.tipo}</p>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
          <div className="mt-10 md:text-center">
            <Link to="/guia-de-composicao" className="btn-outline-forest w-full md:w-auto">
              Ver como montar o seu <ArrowRight className="h-5 w-5" strokeWidth={1.75} />
            </Link>
          </div>
        </div>
      </section>

      {/* 7 — Por que Western e não pedra natural */}
      <section className="surface-ivory py-16 md:py-24 border-y border-western-border-soft">
        <div className="container-western max-w-5xl">
          <Reveal variant="fade-up" duration={700}>
            <p className="text-eyebrow mb-3">Por que Western</p>
            <h2 className="display-lg text-western-green-deep mb-8 md:mb-12">
              A pedra sem o peso da pedra.
            </h2>
          </Reveal>
          <div className="grid md:grid-cols-2 gap-4 md:gap-6">
            <Reveal variant="fade-up" duration={650}>
              <div className="rounded-[16px] border border-western-border-soft bg-western-paper p-7 md:p-9 h-full">
                <p className="text-sublabel mb-6">Pedra natural</p>
                <ul className="space-y-4">
                  {[
                    "Pesada — exige guindaste e caminhão Munck",
                    "Difícil em cobertura, terraço ou pavimento alto",
                    "Variedade limitada ao que a natureza deu",
                    "Obra pesada, mais tempo e custo",
                  ].map((t) => (
                    <li key={t} className="flex gap-3 items-start text-[17px] leading-[1.5] text-western-stone-warm">
                      <X className="h-5 w-5 text-western-stone-warm/70 mt-0.5 shrink-0" strokeWidth={1.75} />
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
            <Reveal variant="fade-up" delay={100} duration={650}>
              <div className="rounded-[16px] border border-western-gold/40 bg-western-green-deep p-7 md:p-9 h-full">
                <p className={`${eyebrowDark} mb-6`}>Pedra Western</p>
                <ul className="space-y-4">
                  {[
                    "≈10% do peso — instala sem guindaste",
                    "Fácil em cobertura, terraço e pavimento alto",
                    "+400 modelos, formatos para cada cena",
                    "Reprodução fiel da textura da pedra real",
                  ].map((t) => (
                    <li key={t} className="flex gap-3 items-start text-[17px] leading-[1.5] text-western-cream">
                      <Check className="h-5 w-5 text-western-gold-soft mt-0.5 shrink-0" strokeWidth={1.75} />
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>
          <p className="text-center text-[16px] text-western-stone-warm mt-9 max-w-xl mx-auto">
            Mesma leitura de pedra natural, sem a obra pesada. Ateliê próprio desde 1993.
          </p>
        </div>
      </section>

      {/* 8 — Como comprar (4 passos) */}
      <section className="surface-paper py-16 md:py-24" id="como-comprar">
        <div className="container-western">
          <Reveal variant="fade-up" duration={700}>
            <p className="text-eyebrow mb-3">Loja para profissionais</p>
            <h2 className="display-lg text-western-green-deep mb-8 md:mb-12">
              Como comprar na Western.
            </h2>
          </Reveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { n: "1", t: "Cadastre-se grátis", d: "Rápido, com o CNPJ da empresa." },
              { n: "2", t: "Acesso na hora", d: "Aprovação automática e imediata." },
              { n: "3", t: "Preço de parceiro", d: "Valor de atacado e modelos 3D liberados." },
              { n: "4", t: "Monte e finalize", d: `Pedido mín. ${BUSINESS.pedidoMinimoLabel} · garantia de ${BUSINESS.garantiaLabel}.` },
            ].map((s, i) => (
              <Reveal key={s.n} variant="fade-up" delay={i * 80} duration={600} distance={16}>
                <div className="flex gap-4 items-start">
                  <span className="font-sans text-[20px] font-semibold text-western-bronze bg-white border border-western-border-soft rounded-[10px] w-12 h-12 flex items-center justify-center shrink-0">
                    {s.n}
                  </span>
                  <div>
                    <p className="font-sans text-[17px] font-semibold text-western-green-deep mb-1">{s.t}</p>
                    <p className="text-[16px] leading-[1.5] text-western-stone-warm">{s.d}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mt-12">
            <Link to="/parceiro/cadastro" className="btn-primary w-full sm:w-auto">
              Criar cadastro grátis <ArrowRight className="h-5 w-5" strokeWidth={1.75} />
            </Link>
            <span className="text-[16px] text-western-stone-warm">Leva menos de 2 minutos · precisa de CNPJ</span>
          </div>
        </div>
      </section>

      {/* 9 — Não sabe por onde começar? → guia */}
      <section className="surface-ivory py-14 md:py-20 border-y border-western-border-soft">
        <div className="container-western text-center max-w-xl mx-auto">
          <Reveal variant="fade-up" duration={650}>
            <h2 className="display-lg text-western-green-deep mb-3">Não sabe por onde começar?</h2>
            <p className="text-body mb-8">
              Responda 3 perguntas e o ateliê indica o conjunto pronto para o seu projeto.
            </p>
            <Link to="/guia-de-composicao" className="btn-outline-forest w-full sm:w-auto">
              Montar no guia <ArrowRight className="h-5 w-5" strokeWidth={1.75} />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* 10 — Prova social (faixa institucional escura) */}
      <section className="surface-forest py-16 md:py-24 border-y border-western-gold/15">
        <div className="container-western max-w-5xl">
          <Reveal variant="fade-up" duration={750}>
            <SocialProof
              variant="dark"
              eyebrow="Quem especifica e confia na Western"
              titulo={<>Especificada pelo topo do mercado — de celebridades a profissionais de referência.</>}
              groups={["celebridades", "profissionais", "marcas"]}
            />
          </Reveal>
          <div className="text-center mt-10 md:mt-14">
            <Link
              to="/sobre"
              className="tap-target inline-flex items-center gap-2 font-sans text-[16px] font-semibold text-western-gold-soft underline underline-offset-4 decoration-western-gold/50 hover:decoration-western-gold-soft transition-colors"
            >
              Conhecer a Western <ArrowRight className="h-5 w-5" strokeWidth={1.75} />
            </Link>
          </div>
        </div>
      </section>

      {/* 11 — Ricardo / ateliê */}
      <Reveal variant="fade-up" duration={800}>
        <ArtistaSection />
      </Reveal>

      {/* 12 — Credenciamento B2B (fechamento de conversão) */}
      <section className="surface-forest py-16 md:py-24">
        <div className="container-western">
          <div className="grid md:grid-cols-2 gap-10 md:gap-14 items-center">
            <Reveal variant="fade-right" duration={750}>
              <div>
                <p className={`${eyebrowDark} mb-4`}>Seja parceiro Western</p>
                <h2 className="display-lg text-western-cream mb-6">
                  Tabela de preços, condições e modelos 3D liberados após o cadastro.
                </h2>
                <p className="text-[17px] leading-[1.6] text-western-cream/80 max-w-md mb-9">
                  Atendemos profissionais e empresas com CNPJ ativo — de arquitetos e paisagistas a laguistas,
                  jardineiros, garden centers, lojas e construtoras.
                </p>
                {/* Dourado: único CTA da faixa escura, onde o verde não teria contraste. */}
                <Link to="/parceiro/cadastro" className="btn-gold w-full sm:w-auto">
                  Solicitar acesso B2B <ArrowRight className="h-5 w-5" strokeWidth={1.75} />
                </Link>
              </div>
            </Reveal>
            <Reveal variant="fade-left" delay={120} duration={750}>
              <div className="grid grid-cols-2 gap-px rounded-[16px] overflow-hidden bg-western-gold/20">
                {[
                  { eyebrow: "Pedido mínimo", t: BUSINESS.pedidoMinimoLabel },
                  { eyebrow: "Garantia", t: BUSINESS.garantiaLabel },
                  { eyebrow: "Reposição", t: "Em caso de avaria" },
                  { eyebrow: "Cadastro", t: "Automático por CNPJ" },
                ].map((s) => (
                  <div key={s.eyebrow} className="bg-western-green-deep p-6 md:p-8">
                    <p className={`${eyebrowDark} mb-3`}>{s.eyebrow}</p>
                    <h3 className="display-md text-western-cream">{s.t}</h3>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
