import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchCollections, fetchProducts, isSeasonal } from "@/lib/shopify/queries";
import ProductCard from "@/components/product/ProductCard";
import { ArrowRight } from "lucide-react";
import brasao from "@/assets/brasao.png";
import iconePedraVerde from "@/assets/icone-pedra-verde.png";

const FAMILIES = [
  { num: "01", name: "Quartzo", desc: "Tom claro, leitoso, com brilho cristalino. Para projetos que pedem luz e leveza.", swatch: "hsl(38, 35%, 86%)" },
  { num: "02", name: "Arenito", desc: "Areia quente, camadas sedimentares visíveis. Calor e textura para ambientes orgânicos.", swatch: "hsl(32, 36%, 65%)" },
  { num: "03", name: "Moledo", desc: "Marrom médio terroso, textura rústica nobre. A pedra brasileira por excelência.", swatch: "hsl(20, 30%, 45%)" },
  { num: "04", name: "Granito", desc: "Escuro, denso, mineral. A profundidade que ancora qualquer composição.", swatch: "hsl(140, 8%, 22%)" },
];

export default function Index() {
  const { data: collections = [] } = useQuery({
    queryKey: ["collections"],
    queryFn: () => fetchCollections(20),
  });
  const { data: featured = [] } = useQuery({
    queryKey: ["featured-products"],
    queryFn: () => fetchProducts(6),
  });

  const linhas = collections.filter((c) => !isSeasonal(c));
  const sazonais = collections.filter((c) => isSeasonal(c));

  return (
    <>
      {/* HERO — verde */}
      <section className="surface-forest relative min-h-[88vh] md:min-h-[92vh] flex items-center pt-10 pb-20 md:pt-16 md:pb-32 overflow-hidden">
        <div
          className="absolute inset-0 -z-10 opacity-40"
          aria-hidden
          style={{
            backgroundImage:
              "radial-gradient(ellipse at 70% 40%, hsl(var(--western-gold) / 0.18) 0%, transparent 60%), radial-gradient(circle at 20% 90%, hsl(var(--western-stone-dark) / 0.5) 0%, transparent 50%)",
          }}
        />
        <div className="container-western grid md:grid-cols-12 gap-12 items-center">
          <div className="md:col-span-7 animate-fade-in-up">
            <p className="text-eyebrow text-[10px] md:text-xs mb-6 md:mb-8">Pedras · Cascatas · Paisagismo</p>
            <div className="w-12 h-px bg-western-gold mb-8 md:mb-10" />
            <h1 className="font-display text-4xl md:text-7xl lg:text-[5.5rem] leading-[1.05] md:leading-[1.02] tracking-tight text-western-cream">
              A pedra <span className="text-western-gold-soft italic font-light">contempla</span>
              <br />
              antes de ser colocada.
            </h1>
            <p className="mt-8 md:mt-12 max-w-xl text-base md:text-lg text-western-cream-muted leading-relaxed">
              Curadoria de pedras autorais para projetos de paisagismo premium —
              quartzo, arenito, moledo e granito, selecionados peça por peça,
              entregues sob encomenda para arquitetos e paisagistas.
            </p>
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
          <div className="md:col-span-5 hidden md:flex justify-center animate-fade-in" style={{ animationDelay: "200ms" }}>
            <img src={brasao} alt="" className="w-72 lg:w-96 opacity-90" />
          </div>
        </div>
        <div className="absolute bottom-10 right-12 hidden lg:flex gap-6 text-spec text-western-cream-muted/70">
          <span>Quartzo</span><span>·</span>
          <span>Arenito</span><span>·</span>
          <span>Moledo</span><span>·</span>
          <span>Granito</span>
        </div>
      </section>

      {/* FAMÍLIAS DE ACABAMENTO — verde */}
      <section className="surface-forest pt-20 pb-16 md:pt-32 md:pb-24 border-t border-western-gold/15">
        <div className="container-western">
          <p className="text-eyebrow mb-5">A curadoria · 04 acabamentos</p>
          <div className="w-12 h-px bg-western-gold mb-8" />
          <h2 className="font-display text-4xl md:text-6xl text-western-cream leading-[1.05] mb-12 md:mb-20 max-w-3xl">
            Quatro famílias de pedra, uma única exigência.
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
            {FAMILIES.map((f) => (
              <article
                key={f.name}
                className="border border-western-gold/15 bg-western-green-mid/40 p-6 md:p-8 flex flex-col h-full hover:border-western-gold/40 transition-colors group"
              >
                <div className="flex items-start justify-between mb-8 md:mb-12">
                  <span className="text-spec text-western-cream-muted">{f.num}</span>
                  <span
                    className="block w-10 h-10 rounded-full"
                    style={{ background: f.swatch }}
                  />
                </div>
                <h3 className="font-display text-3xl text-western-cream mb-4">{f.name}</h3>
                <p className="text-western-cream-muted leading-relaxed text-sm flex-1">
                  {f.desc}
                </p>
                <Link
                  to={`/linhas`}
                  className="text-eyebrow mt-8 inline-flex items-center gap-2 group-hover:text-western-gold transition-colors"
                >
                  Explorar acabamento →
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* LINHAS — superfície creme */}
      {linhas.length > 0 && (
        <section className="surface-ivory py-20 md:py-32">
          <div className="container-western">
            <div className="flex items-end justify-between mb-12 md:mb-16 flex-wrap gap-4">
              <div>
                <p className="text-eyebrow mb-4">Linhas de produto</p>
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

      {/* COLEÇÕES SAZONAIS — ivory */}
      <section className="surface-ivory py-20 md:py-32">
        <div className="container-western">
          <div className="flex items-end justify-between mb-12 md:mb-16 flex-wrap gap-4">
            <div>
              <p className="text-eyebrow mb-4">Coleções · Sazonais</p>
              <div className="w-12 h-px bg-western-gold mb-6" />
              <h2 className="font-display text-4xl md:text-5xl text-western-green-deep max-w-2xl">
                Edições de temporada, em tiragem limitada.
              </h2>
            </div>
            <Link
              to="/colecoes"
              className="link-underline font-mono text-xs uppercase tracking-[0.2em] text-western-green-deep"
            >
              Ver coleções →
            </Link>
          </div>

          {sazonais.length === 0 ? (
            <div className="border border-western-stone-warm/20 p-16 text-center max-w-2xl mx-auto">
              <p className="text-eyebrow mb-4">Próxima edição</p>
              <p className="font-display text-3xl text-western-green-deep mb-3">
                Coleção Verão 26 · em breve
              </p>
              <p className="text-western-stone-warm">
                Seja avisado quando a próxima curadoria sazonal abrir.
              </p>
              <Link to="/parceiro/cadastro" className="btn-outline-forest mt-8">
                Quero ser avisado
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {sazonais.slice(0, 2).map((c) => (
                <Link
                  key={c.handle}
                  to={`/colecoes/${c.handle}`}
                  className="group block"
                >
                  <div className="frame-product aspect-[5/4] overflow-hidden mb-6">
                    {c.image ? (
                      <img
                        src={c.image.url}
                        alt={c.image.altText ?? c.title}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full" />
                    )}
                  </div>
                  <h3 className="font-display text-3xl text-western-green-deep group-hover:text-western-gold transition-colors">
                    {c.title}
                  </h3>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

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
