import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchProducts } from "@/lib/datasource";
import Seo from "@/components/seo/Seo";
import ProductCard from "@/components/product/ProductCard";
import ArtistaSection from "@/components/home/ArtistaSection";
import Reveal from "@/components/shared/Reveal";
import SocialProof from "@/components/shared/SocialProof";
import { useScrollY } from "@/hooks/useScrollY";
import {
  ArrowRight,
  Box,
  Truck,
  ShieldCheck,
  Check,
  X,
} from "lucide-react";
import heroCascata from "@/assets/hero-cascata.webp";
import heroCascataSm from "@/assets/hero-cascata-sm.webp";
import iconePedraBranco from "@/assets/icone-pedra-branco.png";
import imgPiscina from "@/assets/about-projetos/piscina-praia.webp";
import imgFonte from "@/assets/about-projetos/cascata-tropical.webp";
import imgJardim from "@/assets/casos-western/unique-garden.webp";
import imgLago from "@/assets/casos-western/projeto-residencial.webp";
import imgFazzenda from "@/assets/casos-western/fazzenda-park.webp";
import imgMirante from "@/assets/about-projetos/cascata-mirante.webp";
import { BUSINESS } from "@/config/business";

const ACABAMENTOS = [
  { nome: "Moledo", tone: "#8A7A64" },
  { nome: "Arenito", tone: "#C4A883" },
  { nome: "Granito", tone: "#8C8C88" },
  { nome: "Quartzo", tone: "#D9D2C4" },
];

const TILES = [
  { nome: "Piscina", desc: "Cascatas e bordas para o entorno da piscina", img: imgPiscina },
  { nome: "Lago ornamental", desc: "Composições para lagos e espelhos d'água", img: imgLago },
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

const btnGold =
  "inline-flex items-center justify-center gap-2 h-12 px-7 bg-western-gold text-western-green-deep hover:bg-western-gold/90 font-mono text-xs uppercase tracking-[0.22em] transition-colors";
const btnGhostDark =
  "inline-flex items-center justify-center gap-2 h-12 px-7 border border-western-cream/50 text-western-cream hover:border-western-gold hover:text-western-gold font-mono text-xs uppercase tracking-[0.22em] transition-colors";
const btnSecondary =
  "inline-flex items-center justify-center gap-2 h-12 px-7 border border-western-green-deep/30 text-western-green-deep hover:border-western-gold hover:text-western-gold font-mono text-xs uppercase tracking-[0.22em] transition-colors";

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function Index() {
  const scrollY = useScrollY();
  const { data: featured = [], isLoading: loadingFeatured } = useQuery({
    queryKey: ["featured-products"],
    queryFn: () => fetchProducts(8),
  });

  const heroParallax = `translate3d(0, ${scrollY * 0.18}px, 0) scale(${1 + scrollY * 0.0003})`;
  const symbolParallax = `translate3d(0, calc(-50% + ${scrollY * -0.08}px), 0)`;

  return (
    <>
      <Seo
        title="Western — Pedras artesanais para paisagismo profissional"
        description="Réplica fiel da pedra natural, ~10% do peso: sobe sem guindaste, instala até em laje. Catálogo B2B para arquitetos, paisagistas e laguistas, com modelos 3D no SketchUp."
        path="/"
        ogType="website"
      />

      {/* 1 — HERO "Declaração 10%" */}
      <section className="relative w-full h-[78vh] min-h-[560px] overflow-hidden bg-western-green-deep">
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
          className="absolute inset-0 w-full h-full object-cover object-center will-change-transform"
          style={{ transform: heroParallax }}
        />
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden
          style={{
            background:
              "linear-gradient(92deg, hsl(var(--western-green-deep) / 0.9) 0%, hsl(var(--western-green-deep) / 0.6) 46%, transparent 82%)",
          }}
        />
        <img
          src={iconePedraBranco}
          alt=""
          aria-hidden
          className="absolute right-[6%] top-1/2 w-[42vw] max-w-[520px] opacity-[0.12] pointer-events-none select-none mix-blend-screen will-change-transform"
          style={{ transform: symbolParallax }}
        />
        <div className="absolute inset-0 flex items-center">
          <div className="container-western w-full">
            <div className="max-w-xl text-western-cream animate-fade-in-up">
              <div className="w-12 h-px bg-western-gold mb-6" />
              <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-western-gold mb-5">
                Pedra artesanal desde 1993
              </p>
              <h1 className="font-display text-5xl md:text-6xl lg:text-7xl leading-[1.0]">
                Pedra de verdade.
                <br />
                <span className="text-western-gold">10% do peso.</span>
              </h1>
              <p className="text-western-cream/80 text-base md:text-lg leading-relaxed max-w-md mt-6 mb-9">
                Reprodução fiel da pedra natural. Sem guindaste — sobe até na laje.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Link to="/produtos" className={btnGold}>
                  Ver produtos <ArrowRight className="h-4 w-4" />
                </Link>
                <button onClick={() => scrollToId("como-comprar")} className={btnGhostDark}>
                  Como comprar
                </button>
              </div>
              <div className="flex flex-wrap gap-x-10 gap-y-4 mt-11 pt-7 border-t border-western-cream/15">
                {[
                  { b: "+400", s: "modelos" },
                  { b: "+300 mil", s: "downloads no SketchUp" },
                  { b: "33 anos", s: "de ateliê" },
                ].map((x) => (
                  <div key={x.s}>
                    <p className="font-display text-2xl md:text-3xl text-western-cream leading-none">{x.b}</p>
                    <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-western-cream/60 mt-1.5">{x.s}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2 — Barra de confiança (sem prazo) */}
      <section className="bg-white border-b border-western-stone-warm/10">
        <div className="container-western py-5 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
          {[
            { Icon: Box, t: "+400 modelos", d: "Formato para cada cena." },
            { Icon: ShieldCheck, t: "Garantia de 1 ano", d: "+ reposição em caso de avaria." },
            { Icon: Truck, t: "Reposição garantida", d: "Chegou com defeito? A gente repõe." },
            { Icon: Check, t: "≈10% do peso", d: "Instala sem guindaste." },
          ].map(({ Icon, t, d }, i) => (
            <Reveal key={t} variant="fade-up" delay={i * 70} duration={550} distance={14}>
              <div className="flex items-start gap-3">
                <Icon className="h-5 w-5 text-western-gold mt-0.5 flex-shrink-0" strokeWidth={1.4} />
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-western-green-deep">{t}</p>
                  <p className="text-xs text-western-stone-warm mt-0.5">{d}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* 3 — O que você vai construir? (intenção por aplicação → guia) */}
      <section className="surface-ivory py-14 md:py-20">
        <div className="container-western">
          <Reveal variant="fade-up" duration={700}>
            <p className="text-eyebrow mb-3">Compre por projeto</p>
            <h2 className="font-display text-3xl md:text-5xl text-western-green-deep leading-[1.05] mb-8 md:mb-10">
              O que você vai construir?
            </h2>
          </Reveal>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {TILES.map((t, i) => (
              <Reveal key={t.nome} variant="fade-up" delay={(i % 4) * 80} duration={600} distance={18}>
                <Link to="/guia-de-composicao" className="group block">
                  <div className="relative overflow-hidden aspect-[4/5] bg-western-cream-muted">
                    <img
                      src={t.img}
                      alt={t.nome}
                      loading="lazy"
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-western-green-deep/80 via-western-green-deep/10 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-4">
                      <p className="font-display text-xl text-western-cream leading-tight">{t.nome}</p>
                      <p className="text-[12px] text-western-cream/75 mt-1 leading-snug">{t.desc}</p>
                    </div>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 4 — Mais especificados (Woo) */}
      <section className="surface-paper py-12 md:py-16 border-t border-western-stone-warm/10" id="produtos">
        <div className="container-western">
          <Reveal variant="fade-up" duration={700}>
            <div className="flex items-end justify-between mb-8 md:mb-10 flex-wrap gap-4">
              <div>
                <p className="text-eyebrow mb-3">Em destaque</p>
                <h2 className="font-display text-3xl md:text-5xl text-western-green-deep leading-[1.05]">
                  Mais especificados.
                </h2>
              </div>
              <Link to="/produtos" className="link-underline font-mono text-xs uppercase tracking-[0.22em] text-western-green-deep">
                Ver catálogo completo →
              </Link>
            </div>
          </Reveal>
          {loadingFeatured && featured.length === 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <div className="aspect-square bg-western-stone-warm/10 animate-pulse" />
                  <div className="h-4 w-3/4 bg-western-stone-warm/10 animate-pulse" />
                  <div className="h-3 w-1/3 bg-western-stone-warm/10 animate-pulse" />
                </div>
              ))}
            </div>
          ) : featured.length === 0 ? (
            <div className="border border-dashed border-western-stone-warm/30 p-10 text-center text-sm text-western-stone-warm">
              Catálogo indisponível no momento. Tente recarregar em instantes.
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {featured.slice(0, 8).map((p, i) => (
                <Reveal key={p.node.id} variant="fade-up" delay={(i % 4) * 90} duration={650} distance={20}>
                  <ProductCard product={p.node} />
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 5 — Western Box (porta de entrada, cashback) */}
      <section className="surface-ivory py-14 md:py-20 border-y border-western-stone-warm/10">
        <div className="container-western">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            <Reveal variant="fade-right" duration={700}>
              <div className="grid grid-cols-2 gap-px bg-western-stone-warm/10">
                {ACABAMENTOS.map((a) => (
                  <div key={a.nome} className="flex items-end p-4 min-h-[130px] md:min-h-[150px]" style={{ background: a.tone }}>
                    <span className="font-display text-lg" style={{ color: "rgba(18,22,15,.82)" }}>{a.nome}</span>
                  </div>
                ))}
              </div>
            </Reveal>
            <Reveal variant="fade-left" delay={100} duration={700}>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-western-gold bg-western-green-deep inline-block px-3 py-1.5 mb-4">
                  Porta de entrada
                </p>
                <h2 className="font-display text-3xl md:text-4xl text-western-green-deep leading-tight mb-4">
                  Western Box — os 4 acabamentos na sua mão.
                </h2>
                <p className="text-western-stone-warm leading-relaxed max-w-md mb-7">
                  A amostra que se paga: os <b className="text-western-green-deep">R$149,90 voltam como crédito</b> no seu
                  primeiro pedido. Aberta a todos, sem cadastro e sem mínimo.
                </p>
                <div className="flex items-center gap-5 flex-wrap">
                  <span className="font-display text-3xl text-western-green-deep">R$ 149,90</span>
                  <Link to="/western-box" className={btnSecondary}>
                    Conhecer a Box <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* 6 — Veja em uso (projetos reais) */}
      <section className="surface-paper py-14 md:py-20">
        <div className="container-western">
          <Reveal variant="fade-up" duration={700}>
            <p className="text-eyebrow mb-3">Veja em uso</p>
            <h2 className="font-display text-3xl md:text-5xl text-western-green-deep leading-[1.05] mb-8 md:mb-10">
              Projetos reais, pedra Western.
            </h2>
          </Reveal>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-5">
            {PROJETOS.map((p, i) => (
              <Reveal key={p.nome} variant="fade-up" delay={(i % 3) * 80} duration={620} distance={18}>
                <figure className="group relative overflow-hidden aspect-[4/3] bg-western-cream-muted">
                  <img
                    src={p.img}
                    alt={p.nome}
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-western-green-deep/75 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />
                  <figcaption className="absolute inset-x-0 bottom-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-400">
                    <p className="font-display text-base text-western-cream leading-tight">{p.nome}</p>
                    <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-western-cream/75 mt-0.5">{p.tipo}</p>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
          <div className="text-center mt-9">
            <Link to="/guia-de-composicao" className={btnSecondary}>
              Ver como montar o seu <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 7 — Por que Western e não pedra natural */}
      <section className="surface-ivory py-14 md:py-20 border-y border-western-stone-warm/10">
        <div className="container-western max-w-5xl">
          <Reveal variant="fade-up" duration={700}>
            <p className="text-eyebrow mb-3">Por que Western</p>
            <h2 className="font-display text-3xl md:text-5xl text-western-green-deep leading-[1.05] mb-8 md:mb-10">
              A pedra sem o peso da pedra.
            </h2>
          </Reveal>
          <div className="grid md:grid-cols-2 gap-4 md:gap-6">
            <Reveal variant="fade-up" duration={650}>
              <div className="border border-western-stone-warm/20 bg-western-paper/50 p-7 md:p-8 h-full">
                <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-western-stone-warm mb-5">Pedra natural</p>
                <ul className="space-y-3.5">
                  {[
                    "Pesada — exige guindaste e caminhão Munck",
                    "Difícil em laje, cobertura ou terraço",
                    "Variedade limitada ao que a natureza deu",
                    "Obra pesada, mais tempo e custo",
                  ].map((t) => (
                    <li key={t} className="flex gap-3 items-start text-[14.5px] text-western-stone-warm">
                      <X className="h-4 w-4 text-western-stone-warm/60 mt-0.5 shrink-0" />
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
            <Reveal variant="fade-up" delay={100} duration={650}>
              <div className="border border-western-gold/40 bg-western-green-deep p-7 md:p-8 h-full">
                <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-western-gold mb-5">Pedra Western</p>
                <ul className="space-y-3.5">
                  {[
                    "≈10% do peso — instala sem guindaste",
                    "Vai na laje, na cobertura e no terraço",
                    "+400 modelos, formatos para cada cena",
                    "Reprodução fiel da textura da pedra real",
                  ].map((t) => (
                    <li key={t} className="flex gap-3 items-start text-[14.5px] text-western-cream">
                      <Check className="h-4 w-4 text-western-gold mt-0.5 shrink-0" />
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>
          <p className="text-center italic text-sm text-western-stone-warm/85 mt-8 max-w-xl mx-auto">
            Mesma leitura de pedra natural, sem a obra pesada. Ateliê próprio desde 1993.
          </p>
        </div>
      </section>

      {/* 8 — Como comprar (4 passos) */}
      <section className="surface-paper py-14 md:py-20" id="como-comprar">
        <div className="container-western">
          <Reveal variant="fade-up" duration={700}>
            <p className="text-eyebrow mb-3">Loja para profissionais</p>
            <h2 className="font-display text-3xl md:text-5xl text-western-green-deep leading-[1.05] mb-8 md:mb-10">
              Como comprar na Western.
            </h2>
          </Reveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
            {[
              { n: "1", t: "Cadastre-se grátis", d: "Rápido, com o CNPJ da empresa." },
              { n: "2", t: "Acesso na hora", d: "Aprovação automática e imediata." },
              { n: "3", t: "Preço de parceiro", d: "Valor de atacado e modelos 3D liberados." },
              { n: "4", t: "Monte e finalize", d: "Pedido mín. R$700 · garantia de 1 ano." },
            ].map((s, i) => (
              <Reveal key={s.n} variant="fade-up" delay={i * 80} duration={600} distance={16}>
                <div className="flex gap-4 items-start">
                  <span className="font-mono text-lg text-western-gold border border-western-gold/40 w-10 h-10 flex items-center justify-center shrink-0">
                    {s.n}
                  </span>
                  <div>
                    <p className="font-sans font-medium text-[15px] text-western-green-deep mb-1">{s.t}</p>
                    <p className="text-[13.5px] text-western-stone-warm leading-relaxed">{s.d}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
          <div className="flex items-center gap-4 flex-wrap mt-10">
            <Link to="/parceiro/cadastro" className={btnGold}>
              Criar cadastro grátis <ArrowRight className="h-4 w-4" />
            </Link>
            <span className="text-[13px] text-western-stone-warm">Leva menos de 2 minutos · precisa de CNPJ</span>
          </div>
        </div>
      </section>

      {/* 9 — Não sabe por onde começar? → guia */}
      <section className="surface-ivory py-12 md:py-16 border-y border-western-stone-warm/10">
        <div className="container-western text-center max-w-xl mx-auto">
          <Reveal variant="fade-up" duration={650}>
            <h2 className="font-display text-2xl md:text-4xl text-western-green-deep leading-tight mb-3">
              Não sabe por onde começar?
            </h2>
            <p className="text-western-stone-warm mb-7">
              Responda 3 perguntas e o ateliê indica o conjunto pronto para o seu projeto.
            </p>
            <Link to="/guia-de-composicao" className={btnSecondary}>
              Montar no guia <ArrowRight className="h-4 w-4" />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* 10 — Prova social (rostos + logos, componente do app) */}
      <section className="surface-forest py-16 md:py-20 border-y border-western-gold/15">
        <div className="container-western max-w-5xl">
          <Reveal variant="fade-up" duration={750}>
            <SocialProof
              variant="dark"
              eyebrow="Quem especifica e confia na Western"
              titulo={<>Especificada pelo topo do mercado — de celebridades a profissionais de referência.</>}
              groups={["celebridades", "profissionais", "marcas"]}
            />
          </Reveal>
          <div className="text-center mt-10 md:mt-12">
            <Link to="/sobre" className="font-mono text-xs uppercase tracking-[0.22em] text-western-gold hover:text-western-gold/80 transition-colors">
              Conhecer a Western →
            </Link>
          </div>
        </div>
      </section>

      {/* 11 — Ricardo / ateliê (componente do app) */}
      <Reveal variant="fade-up" duration={800}>
        <ArtistaSection />
      </Reveal>

      {/* 12 — Credenciamento B2B (nossa versão, sem prazo) */}
      <section className="surface-forest py-14 md:py-18">
        <div className="container-western">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <Reveal variant="fade-right" duration={750}>
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-western-gold mb-4 font-medium">Seja parceiro Western</p>
                <h2 className="font-display text-3xl md:text-5xl text-western-cream leading-[1.1] mb-6">
                  Tabela de preços, condições e modelos 3D liberados após o cadastro.
                </h2>
                <p className="text-western-cream/70 leading-relaxed max-w-md mb-8">
                  Atendemos profissionais e empresas com CNPJ ativo — de arquitetos e paisagistas a laguistas,
                  jardineiros, garden centers, lojas e construtoras.
                </p>
                <Link to="/parceiro/cadastro" className={btnGold}>
                  Solicitar acesso B2B <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </Reveal>
            <Reveal variant="fade-left" delay={120} duration={750}>
              <div className="grid grid-cols-2 gap-px bg-western-gold/15">
                {[
                  { eyebrow: "Pedido mínimo", t: "R$ 700" },
                  { eyebrow: "Garantia", t: BUSINESS.garantiaLabel },
                  { eyebrow: "Reposição", t: "Em caso de avaria" },
                  { eyebrow: "Cadastro", t: "Automático por CNPJ" },
                ].map((s) => (
                  <div key={s.eyebrow} className="bg-western-green-deep p-6 md:p-8">
                    <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-western-gold/80 mb-3 font-medium">{s.eyebrow}</p>
                    <h3 className="font-display text-2xl md:text-3xl text-western-cream">{s.t}</h3>
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
