import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchCollections, fetchProducts, isSeasonal } from "@/lib/shopify/queries";
// isSeasonal kept for filtering linhas only

import ProductCard from "@/components/product/ProductCard";
import ProjetosSection from "@/components/home/ProjetosSection";
import ArtistaSection from "@/components/home/ArtistaSection";
import RespiroSection from "@/components/home/RespiroSection";
import { ArrowRight } from "lucide-react";
import iconePedraVerde from "@/assets/icone-pedra-verde.png";
import heroCascata from "@/assets/hero-cascata.jpg";


export default function Index() {
  const { data: collections = [] } = useQuery({
    queryKey: ["collections"],
    queryFn: () => fetchCollections(20),
  });
  const { data: featured = [] } = useQuery({
    queryKey: ["featured-products"],
    queryFn: () => fetchProducts(6),
  });

  const linhas = collections.filter((c) => !isSeasonal(c) && c.handle !== "conjuntos");

  return (
    <>
      {/* HERO — full-bleed cinematográfico */}
      <section className="relative w-full min-h-[88vh] md:min-h-[92vh] overflow-hidden bg-western-green-deep">
        {/* Foto LCP */}
        <img
          src={heroCascata}
          alt="Cascata escultural Western em borda de piscina natural com paisagismo tropical."
          loading="eager"
          fetchPriority="high"
          width={1820}
          height={1213}
          className="absolute inset-0 w-full h-full object-cover object-center animate-hero-drift will-change-transform"
        />

        {/* Gradiente verde da base — leitura do texto */}
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden
          style={{
            background:
              "linear-gradient(to top, hsl(var(--western-green-deep) / 0.9) 0%, hsl(var(--western-green-deep) / 0.5) 32%, transparent 62%)",
          }}
        />

        {/* Vinheta lateral esquerda — assenta o bloco de texto */}
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden
          style={{
            background:
              "linear-gradient(to right, hsl(var(--western-stone-dark) / 0.45), transparent 45%)",
          }}
        />

        {/* Grão sutil */}
        <div
          className="absolute inset-0 opacity-[0.07] mix-blend-overlay pointer-events-none"
          aria-hidden
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.85  0 0 0 0 0.78  0 0 0 0 0.55  0 0 0 1 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
          }}
        />

        {/* Shimmer dourado no topo */}
        <div className="absolute top-0 left-0 right-0 h-px overflow-hidden" aria-hidden>
          <div className="h-full w-1/3 bg-gradient-to-r from-transparent via-western-gold/60 to-transparent animate-hero-shimmer" />
        </div>

        {/* Texto — canto inferior esquerdo */}
        <div className="absolute inset-0 flex items-end">
          <div className="container-western pb-16 md:pb-24 w-full">
            <div className="max-w-2xl animate-fade-in-up">
              <p className="text-eyebrow text-[10px] md:text-xs mb-6 md:mb-8 text-western-gold-soft">
                Pedras · Cascatas · Paisagismo
              </p>
              <div className="w-12 h-px bg-western-gold mb-8 md:mb-10" />
              <h1
                className="font-display text-4xl md:text-7xl lg:text-[5.5rem] leading-[1.05] md:leading-[1.02] tracking-tight text-western-cream"
                style={{ textShadow: "0 2px 28px rgba(0,0,0,0.45)" }}
              >
                A pedra <span className="text-western-gold-soft italic font-light">contempla</span>
                <br />
                antes de ser colocada.
              </h1>
              <div className="mt-10 md:mt-14 flex flex-col items-start gap-5 md:flex-row md:items-center md:gap-8">
                <Link to="/linhas" className="btn-gold">
                  Explorar linhas <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/sobre"
                  className="link-underline font-mono text-xs uppercase tracking-[0.22em] text-western-cream"
                >
                  · Sobre a curadoria
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Specs dos quatro acabamentos — canto inferior direito */}
        <div
          className="absolute bottom-10 right-12 hidden lg:flex gap-6 text-spec text-western-cream/80"
          style={{ textShadow: "0 1px 12px rgba(0,0,0,0.5)" }}
        >
          <span>Quartzo</span><span>·</span>
          <span>Arenito</span><span>·</span>
          <span>Moledo</span><span>·</span>
          <span>Granito</span>
        </div>
      </section>


      {/* LINHAS — superfície creme */}
      {linhas.length > 0 && (
        <section className="surface-ivory py-20 md:py-32">
          <div className="container-western">
            <div className="flex items-end justify-between mb-12 md:mb-16 flex-wrap gap-4">
              <div>
                <p className="text-eyebrow mb-4">Linhas de produtos</p>
                <div className="w-12 h-px bg-western-gold mb-6" />
                <h2 className="font-display text-4xl md:text-5xl text-western-green-deep">
                  O catálogo, organizado.
                </h2>
              </div>
              <Link
                to="/linhas"
                className="link-underline font-mono text-xs uppercase tracking-[0.2em] text-western-green-deep"
              >
                Ver todas →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10 md:gap-y-14">
              {linhas.slice(0, 6).map((c) => (
                <Link
                  key={c.handle}
                  to={`/linhas/${c.handle}`}
                  className="group block"
                >
                  <div className="frame-product aspect-[4/3] overflow-hidden mb-5">
                    {c.image ? (
                      <img
                        src={c.image.url}
                        alt={c.image.altText ?? c.title}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <img src={iconePedraVerde} alt="" className="h-16 opacity-30" />
                      </div>
                    )}
                  </div>
                  <h3 className="font-display text-2xl text-western-green-deep group-hover:text-western-gold transition-colors">
                    {c.title}
                  </h3>
                  {c.description && (
                    <p className="text-spec text-western-stone-warm mt-2 line-clamp-2">
                      {c.description}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* SOBRE — verde */}
      <section className="surface-forest py-20 md:py-32">
        <div className="container-western grid md:grid-cols-2 gap-12 md:gap-16 items-center">
          <div>
            <p className="text-eyebrow mb-5">Sobre · A Western</p>
            <div className="w-12 h-px bg-western-gold mb-8" />
            <h2 className="font-display text-4xl md:text-5xl text-western-cream leading-[1.1] mb-8 md:mb-10">
              Pedra é <span className="text-western-gold-soft italic">tempo</span> — nós só revelamos o que ela já é.
            </h2>
            <div className="space-y-6 text-western-cream-muted leading-relaxed max-w-md">
              <p>
                A Western nasceu da observação paciente das pedreiras
                brasileiras. Cada lote é visitado, cada peça é escolhida pela
                mão de quem conhece o material há décadas — não pela conveniência
                logística.
              </p>
              <p>
                Trabalhamos sob encomenda, com tiragem limitada por estação. O
                que entregamos não é volume: é procedência, consistência cromática
                e a certeza de que a peça que chega ao canteiro é a peça que foi
                especificada.
              </p>
            </div>
            <Link
              to="/sobre"
              className="mt-10 link-underline font-mono text-xs uppercase tracking-[0.22em] text-western-gold-soft inline-flex items-center"
            >
              Conheça nosso processo —
            </Link>
          </div>
          <div className="frame-gallery aspect-[5/4] border-western-gold/30">
            <img
              src="https://images.unsplash.com/photo-1602002418082-a4443e081dd1?auto=format&fit=crop&w=1600&q=80"
              alt="Cascata em pedra natural"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* ARTISTA — creme */}
      <ArtistaSection />

      {/* RESPIRO — full-bleed cinematográfico */}
      <RespiroSection />

      {/* PROJETOS — verde */}
      <ProjetosSection />

      {/* DESTAQUES — creme */}
      {featured.length > 0 && (
        <section className="surface-ivory py-20 md:py-32">
          <div className="container-western">
            <div className="mb-12 md:mb-16">
              <p className="text-eyebrow mb-4">Em destaque</p>
              <div className="w-12 h-px bg-western-gold mb-6" />
              <h2 className="font-display text-4xl md:text-5xl text-western-green-deep">
                Peças para especificar.
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10 md:gap-y-14">
              {featured.slice(0, 6).map((p) => (
                <ProductCard key={p.node.id} product={p.node} surface="cream" />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* B2B / PROCESSO — verde */}
      <section className="surface-forest py-20 md:py-32">
        <div className="container-western">
          <div className="max-w-3xl mx-auto text-center mb-14 md:mb-20">
            <div className="w-12 h-px bg-western-gold mx-auto mb-8" />
            <h2 className="font-display text-3xl md:text-5xl text-western-cream leading-[1.15]">
              Trabalhamos exclusivamente com arquitetos, paisagistas e construtoras.
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 max-w-5xl mx-auto">
            {[
              { eyebrow: "Pedido mínimo", t: "Sob consulta", d: "Variável por categoria de pedra e dimensão da peça." },
              { eyebrow: "Prazo de produção", t: "15 a 30 dias", d: "Conforme disponibilidade do lote e acabamento." },
              { eyebrow: "Pagamento", t: "30 / 60 / 90", d: "Faturado para CNPJ. Sinal opcional em peças exclusivas." },
            ].map((s) => (
              <div key={s.t} className="border-t md:border-t-0 md:border-l border-western-gold/30 pt-6 md:pt-0 md:pl-8">
                <p className="text-eyebrow mb-4">{s.eyebrow}</p>
                <h3 className="font-display text-3xl text-western-cream mb-4">{s.t}</h3>
                <p className="text-western-cream-muted leading-relaxed text-sm">{s.d}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-14 md:mt-20">
            <Link to="/parceiro/cadastro" className="btn-outline-cream">
              Solicitar credenciamento —
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
