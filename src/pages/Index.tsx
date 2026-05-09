import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchCollections, fetchProducts, isSeasonal } from "@/lib/shopify/queries";

import ProductCard from "@/components/product/ProductCard";
import ColecoesGrid from "@/components/home/ColecoesGrid";
import ProjetosSection from "@/components/home/ProjetosSection";
import ArtistaSection from "@/components/home/ArtistaSection";
import MarcasInstitucionais from "@/components/shared/MarcasInstitucionais";
import { ArrowRight, ShieldCheck, Truck, Box } from "lucide-react";
import heroCascata from "@/assets/hero-cascata.webp";
import heroCascataSm from "@/assets/hero-cascata-sm.webp";
import { BUSINESS } from "@/config/business";

export default function Index() {
  const { data: collections = [] } = useQuery({
    queryKey: ["collections"],
    queryFn: () => fetchCollections(20),
  });
  const { data: featured = [] } = useQuery({
    queryKey: ["featured-products"],
    queryFn: () => fetchProducts(8),
  });

  const linhas = collections.filter((c) => !isSeasonal(c) && c.handle !== "conjuntos");

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
          fetchPriority="high"
          decoding="async"
          width={1820}
          height={1213}
          className="absolute inset-0 w-full h-full object-cover object-center"
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

      {/* COLEÇÕES — destaques */}
      <ColecoesGrid collections={linhas} />

      {/* MAIS ESPECIFICADOS */}
      {featured.length > 0 && (
        <section className="surface-paper py-16 md:py-24 border-t border-western-stone-warm/10">
          <div className="container-western">
            <div className="flex items-end justify-between mb-10 md:mb-12 flex-wrap gap-4">
              <div>
                <p className="text-eyebrow mb-3">Em destaque</p>
                <h2 className="font-display text-3xl md:text-5xl text-western-green-deep leading-[1.05]">
                  Mais especificados pelos parceiros.
                </h2>
              </div>
              <Link
                to="/linhas"
                className="link-underline font-mono text-xs uppercase tracking-[0.22em] text-western-green-deep"
              >
                Ver catálogo completo →
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {featured.slice(0, 8).map((p) => (
                <ProductCard key={p.node.id} product={p.node} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* PROJETOS — prova social */}
      <ProjetosSection />

      {/* Faixa institucional — Camadas 2 e 3 */}
      <section className="surface-paper border-t border-western-stone-warm/15 py-16 md:py-20">
        <div className="container-western max-w-5xl">
          <div className="text-center mb-10">
            <p className="text-eyebrow mb-4">Prova de procedência</p>
            <div className="w-12 h-px bg-western-gold mx-auto mb-6" />
            <p className="font-display text-2xl md:text-3xl text-western-green-deep leading-[1.15] max-w-2xl mx-auto">
              Especificada por{" "}
              <Link to="/parceiros-arquitetos" className="underline decoration-western-gold/40 underline-offset-4 hover:decoration-western-gold transition-colors">
                Marcelo Faisal, Fabiano Hayasaki e Ronaldo Luidi
              </Link>
              . Atende marcas institucionais há mais de uma década.
            </p>
          </div>

          <MarcasInstitucionais compacta />

          <div className="text-center mt-8">
            <Link to="/sobre" className="link-underline font-mono text-xs uppercase tracking-[0.22em] text-western-green-deep">
              Sobre a Western →
            </Link>
          </div>
        </div>
      </section>


      {/* ARTISTA — Ricardo */}
      <ArtistaSection />

      {/* B2B — credenciamento */}
      <section className="surface-forest py-16 md:py-24">
        <div className="container-western">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-eyebrow mb-4">Seja parceiro Western</p>
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
            <div className="grid grid-cols-2 gap-px bg-western-gold/15">
              {[
                { eyebrow: "Pedido mínimo", t: BUSINESS.pedidoMinimoLabel },
                { eyebrow: "Prazo", t: "15 dias úteis" },
                { eyebrow: "Pagamento", t: "100% antecipado" },
                { eyebrow: "Frete", t: "Transportadora ou retirada" },
              ].map((s) => (
                <div key={s.t} className="bg-western-green-deep p-6 md:p-8">
                  <p className="text-eyebrow mb-3">{s.eyebrow}</p>
                  <h3 className="font-display text-2xl md:text-3xl text-western-cream">{s.t}</h3>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
