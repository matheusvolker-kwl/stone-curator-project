import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchCollections, fetchProducts, isSeasonal } from "@/lib/shopify/queries";

import ProductCard from "@/components/product/ProductCard";
import ColecoesGrid from "@/components/home/ColecoesGrid";
import ProjetosSection from "@/components/home/ProjetosSection";
import ArtistaSection from "@/components/home/ArtistaSection";
import MarcasInstitucionais from "@/components/shared/MarcasInstitucionais";
import Reveal from "@/components/shared/Reveal";
import { useScrollY } from "@/hooks/useScrollY";
import { ArrowRight, ShieldCheck, Truck, Box } from "lucide-react";
import heroCascata from "@/assets/hero-cascata.webp";
import heroCascataSm from "@/assets/hero-cascata-sm.webp";
import iconePedraBranco from "@/assets/icone-pedra-branco.png";
import { BUSINESS } from "@/config/business";

export default function Index() {
  const scrollY = useScrollY();
  const { data: collections = [] } = useQuery({
    queryKey: ["collections"],
    queryFn: () => fetchCollections(20),
  });
  const { data: featured = [] } = useQuery({
    queryKey: ["featured-products"],
    queryFn: () => fetchProducts(8),
  });

  const linhasAll = collections.filter((c) => !isSeasonal(c) && c.handle !== "conjuntos");
  // Home: mostra no máx 8 (2 linhas × 4 col), sem "Fontes para Jardim", com "Pisadas".
  const semFontes = linhasAll.filter((c) => c.handle !== "fontes-para-jardim");
  const pisadas = linhasAll.find((c) => c.handle === "pisadas");
  const linhas = (
    pisadas && !semFontes.some((c) => c.handle === "pisadas")
      ? [...semFontes, pisadas]
      : semFontes
  ).slice(0, 8);

  // Parallax sutil — imagem desce mais devagar que o scroll, símbolo flutua
  const heroParallax = `translate3d(0, ${scrollY * 0.18}px, 0) scale(${1 + scrollY * 0.0003})`;
  const symbolParallax = `translate3d(0, calc(-50% + ${scrollY * -0.08}px), 0)`;

  return (
    <>
      {/* HERO — comercial, 70vh, foto + bloco esquerdo */}
      <section className="relative w-full h-[70vh] min-h-[520px] overflow-hidden bg-western-green-deep">
        <img
          src={heroCascata}
          srcSet={`${heroCascataSm} 900w, ${heroCascata} 1800w`}
          sizes="100vw"
          alt="Cascata Western em paisagismo profissional."
          loading="eager"
          {...({ fetchpriority: "high" } as Record<string, string>)}
          decoding="async"
          width={1820}
          height={1213}
          className="absolute inset-0 w-full h-full object-cover object-center will-change-transform"
          style={{ transform: heroParallax }}
        />
        {/* Overlay vertical para leitura */}
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden
          style={{
            background:
              "linear-gradient(95deg, hsl(var(--western-green-deep) / 0.85) 0%, hsl(var(--western-green-deep) / 0.55) 45%, transparent 78%)",
          }}
        />

        {/* Marca-d'água — símbolo Western em opacidade leve, com flutuação no scroll */}
        <img
          src={iconePedraBranco}
          alt=""
          aria-hidden
          className="absolute right-[6%] top-1/2 w-[42vw] max-w-[560px] opacity-[0.14] pointer-events-none select-none mix-blend-screen will-change-transform"
          style={{ transform: symbolParallax }}
        />

        <div className="absolute inset-0 flex items-center">
          <div className="container-western w-full">
            <div className="max-w-xl text-western-cream animate-fade-in-up">
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl leading-[1.05] mb-10">
                Pedras artesanais para projetos profissionais.
              </h1>
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  to="/linhas"
                  className="inline-flex items-center gap-2 h-12 px-7 bg-western-gold text-western-green-deep hover:bg-western-gold-soft font-mono text-xs uppercase tracking-[0.22em] transition-colors"
                >
                  Ver catálogo <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/parceiro/cadastro"
                  className="inline-flex items-center gap-2 h-12 px-7 border border-western-cream/50 text-western-cream hover:border-western-gold hover:text-western-gold-soft font-mono text-xs uppercase tracking-[0.22em] transition-colors"
                >
                  Seja parceiro
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Faixa de garantias — transição suave do hero pro fundo claro */}
      <section className="bg-white border-b border-western-stone-warm/10">
        <div className="container-western py-5 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
          {[
            { Icon: ShieldCheck, t: `Pedido mínimo ${BUSINESS.pedidoMinimoLabel}`, d: "Exclusivo para profissionais com CNPJ." },
            { Icon: Truck, t: "Produção em 15 dias úteis", d: "Após confirmação do pedido." },
            { Icon: Box, t: "Modelos 3D em SketchUp", d: "+300 mil downloads por profissionais no Warehouse." },
          ].map(({ Icon, t, d }, i) => (
            <Reveal key={t} variant="fade-up" delay={i * 80} duration={600} distance={16}>
              <div className="flex items-start gap-3">
                <Icon className="h-5 w-5 text-western-gold mt-0.5 flex-shrink-0" strokeWidth={1.4} />
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-western-green-deep">{t}</p>
                  <p className="text-xs text-western-stone-warm mt-0.5">{d}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* AVISO B2B + GUIA — faixa editorial split (verde + cream) */}
      <section className="border-y border-western-green-deep/10">
        <Reveal variant="fade-up" duration={700}>
          <div className="grid md:grid-cols-2 relative">
            {/* Divisor central dourado em md+ */}
            <div className="hidden md:block absolute left-1/2 top-6 bottom-6 w-px bg-western-gold/25 z-10 pointer-events-none" />

            {/* Coluna 01 — B2B (verde profundo) */}
            <Link
              to="/parceiro/cadastro"
              className="group relative flex flex-col justify-between p-10 md:p-14 bg-western-green-deep transition-colors duration-500 hover:bg-western-green-deep/90 min-h-[260px]"
            >
              <div className="space-y-5">
                <span className="block font-mono text-[10px] uppercase tracking-[0.3em] text-western-gold">
                  01 / B2B
                </span>
                <h3 className="font-display text-2xl md:text-3xl lg:text-[2rem] text-western-cream leading-tight">
                  Site exclusivo para empresas parceiras.{" "}
                  <span className="italic text-western-cream/70">Ainda não é parceiro?</span>
                </h3>
              </div>
              <div className="mt-10 flex items-center gap-3">
                <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-western-gold border-b border-western-gold/40 pb-1 group-hover:border-western-gold transition-colors">
                  Fazer cadastro
                </span>
                <ArrowRight className="h-3.5 w-3.5 text-western-gold transition-transform duration-300 group-hover:translate-x-1" />
              </div>
            </Link>

            {/* Coluna 02 — Guia (cream) */}
            <Link
              to="/guia-de-composicao"
              className="group relative flex flex-col justify-between p-10 md:p-14 bg-western-cream transition-colors duration-500 hover:bg-western-cream-muted min-h-[260px]"
            >
              <div className="space-y-5">
                <span className="block font-mono text-[10px] uppercase tracking-[0.3em] text-western-green-deep/60">
                  02 / Guia
                </span>
                <h3 className="font-display text-2xl md:text-3xl lg:text-[2rem] text-western-green-deep leading-tight">
                  Dúvidas para montar sua composição?{" "}
                  <span className="italic text-western-stone-warm">Use nosso guia interativo.</span>
                </h3>
              </div>
              <div className="mt-10 flex items-center gap-3">
                <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-western-green-deep border-b border-western-green-deep/30 pb-1 group-hover:border-western-green-deep transition-colors">
                  Acessar o guia
                </span>
                <ArrowRight className="h-3.5 w-3.5 text-western-green-deep transition-transform duration-300 group-hover:translate-x-1" />
              </div>
            </Link>
          </div>
        </Reveal>
      </section>

      {/* COLEÇÕES — destaques */}
      <Reveal variant="fade-up" duration={800}>
        <ColecoesGrid collections={linhas} />
      </Reveal>

      {/* MAIS ESPECIFICADOS */}
      {featured.length > 0 && (
        <section className="surface-paper py-12 md:py-16 border-t border-western-stone-warm/10">
          <div className="container-western">
            <Reveal variant="fade-up" duration={700}>
              <div className="flex items-end justify-between mb-8 md:mb-10 flex-wrap gap-4">
                <div>
                  <p className="text-eyebrow mb-3">Em destaque</p>
                  <h2 className="font-display text-3xl md:text-5xl text-western-green-deep leading-[1.05]">
                    Produtos mais comprados.
                  </h2>
                </div>
                <Link
                  to="/linhas"
                  className="link-underline font-mono text-xs uppercase tracking-[0.22em] text-western-green-deep"
                >
                  Ver catálogo completo →
                </Link>
              </div>
            </Reveal>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {featured.slice(0, 8).map((p, i) => (
                <Reveal key={p.node.id} variant="fade-up" delay={(i % 4) * 90} duration={650} distance={20}>
                  <ProductCard product={p.node} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* PROJETOS — prova social */}
      <Reveal variant="fade-up" duration={800}>
        <ProjetosSection />
      </Reveal>

      {/* Faixa institucional — interlúdio dark editorial */}
      <section className="surface-forest py-14 md:py-18 border-y border-western-gold/15">
        <div className="container-western max-w-4xl">
          <Reveal variant="fade-up" duration={750}>
            <div className="text-center mb-8 md:mb-10">
              <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-western-gold-soft/85 mb-5">
                Prova de procedência
              </p>
              <div className="w-10 h-px bg-western-gold/50 mx-auto mb-7" />
              <h2 className="font-display text-2xl md:text-[2rem] text-western-cream leading-[1.2] max-w-2xl mx-auto">
                Especificada pelos arquitetos que assinam os jardins mais publicados do país.
              </h2>
              <Link
                to="/parceiros-arquitetos"
                className="inline-block mt-7 font-mono text-[11px] uppercase tracking-[0.28em] text-western-gold-soft/90 hover:text-western-gold transition-colors"
              >
                Marcelo Faisal · Fabiano Hayasaki · Ronaldo Luidi
              </Link>
            </div>
          </Reveal>

          <Reveal variant="fade-up" delay={120} duration={750}>
            <div className="pt-6 md:pt-8 border-t border-western-gold/15">
              <MarcasInstitucionais compacta variante="dark" semBordas />
            </div>
          </Reveal>

          <div className="text-center mt-8">
            <Link
              to="/sobre"
              className="font-mono text-xs uppercase tracking-[0.22em] text-western-gold-soft hover:text-western-gold transition-colors"
            >
              Conhecer a Western →
            </Link>
          </div>
        </div>
      </section>


      {/* ARTISTA — Ricardo */}
      <Reveal variant="fade-up" duration={800}>
        <ArtistaSection />
      </Reveal>

      {/* B2B — credenciamento */}
      <section className="surface-forest py-12 md:py-16">
        <div className="container-western">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <Reveal variant="fade-right" duration={750}>
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-western-gold/90 mb-4 font-medium">Seja parceiro Western</p>
                <h2 className="font-display text-3xl md:text-5xl text-western-cream leading-[1.1] mb-6">
                  Tabela de preços, condições comerciais e modelos 3D liberados após credenciamento.
                </h2>
                <p className="text-western-cream-muted leading-relaxed max-w-md mb-8">
                  Trabalhamos exclusivamente com arquitetos, paisagistas, construtoras e garden centers com CNPJ ativo.
                </p>
                <Link
                  to="/parceiro/cadastro"
                  className="inline-flex items-center gap-2 h-12 px-7 bg-western-gold text-western-green-deep hover:bg-western-gold-soft font-mono text-xs uppercase tracking-[0.22em] transition-colors"
                >
                  Solicitar acesso B2B <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </Reveal>
            <Reveal variant="fade-left" delay={120} duration={750}>
              <div className="grid grid-cols-2 gap-px bg-western-gold/15">
                {[
                  { eyebrow: "Pedido mínimo", t: BUSINESS.pedidoMinimoLabel },
                  { eyebrow: "Prazo", t: "15 dias úteis" },
                  { eyebrow: "Garantia", t: `${BUSINESS.garantiaAnos} anos` },
                  { eyebrow: "Frete", t: "Transportadora ou retirada" },
                ].map((s) => (
                  <div key={s.t} className="bg-western-green-deep p-6 md:p-8">
                    <p className="text-eyebrow mb-3">{s.eyebrow}</p>
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
