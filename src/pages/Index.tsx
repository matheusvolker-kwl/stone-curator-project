import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchCollections, fetchProducts } from "@/lib/shopify/queries";
import ProductCard from "@/components/product/ProductCard";
import { ArrowRight } from "lucide-react";
import brasao from "@/assets/brasao.png";
import iconePedra from "@/assets/icone-pedra-bege.png";

export default function Index() {
  const { data: collections = [] } = useQuery({
    queryKey: ["collections"],
    queryFn: () => fetchCollections(20),
  });
  const { data: featured = [] } = useQuery({
    queryKey: ["featured-products"],
    queryFn: () => fetchProducts(6),
  });

  return (
    <>
      {/* HERO */}
      <section className="relative min-h-[90vh] flex items-center pt-20 pb-32 overflow-hidden">
        <div
          className="absolute inset-0 -z-10 opacity-30"
          aria-hidden
          style={{
            backgroundImage:
              "radial-gradient(ellipse at 70% 40%, hsl(var(--western-gold) / 0.15) 0%, transparent 60%)",
          }}
        />
        <div className="container-western grid md:grid-cols-12 gap-12 items-center">
          <div className="md:col-span-7 animate-fade-in-up">
            <p className="text-eyebrow mb-8">Western Pools — Catálogo B2B</p>
            <h1 className="font-display text-5xl md:text-7xl lg:text-8xl leading-[0.95] tracking-tight text-western-cream">
              A pedra que <br />
              <span className="text-western-gold-soft italic font-light">se especifica.</span>
            </h1>
            <p className="mt-10 max-w-lg text-lg text-western-cream-muted leading-relaxed">
              Composto mineral autoral, fabricado peça a peça em São Paulo. Para
              quem projeta paisagens duradouras.
            </p>
            <div className="mt-12 flex flex-wrap gap-5">
              <Link
                to="/colecoes"
                className="inline-flex items-center gap-3 px-8 py-4 bg-western-gold text-western-green-deep hover:bg-western-gold-soft transition-colors font-mono text-xs uppercase tracking-[0.25em]"
              >
                Ver coleções <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/parceiro/cadastro"
                className="inline-flex items-center px-8 py-4 border border-western-gold/40 text-western-cream hover:border-western-gold transition-colors font-mono text-xs uppercase tracking-[0.25em]"
              >
                Cadastro de parceiro
              </Link>
            </div>
          </div>
          <div className="md:col-span-5 hidden md:flex justify-center animate-fade-in" style={{ animationDelay: "200ms" }}>
            <img src={brasao} alt="Brasão Western Pools" className="w-72 lg:w-96 opacity-90" />
          </div>
        </div>
      </section>

      {/* MANIFESTO */}
      <section className="py-32 border-t border-western-gold/10">
        <div className="container-western max-w-4xl text-center">
          <img src={iconePedra} alt="" className="h-12 mx-auto mb-10 opacity-70" />
          <p className="font-display text-3xl md:text-4xl leading-[1.4] text-western-cream">
            Não extraímos pedra. Reproduzimos com fidelidade autoral a estética
            das pedras naturais — em composto mineral de alta resistência,
            artesanal, peça a peça.
          </p>
        </div>
      </section>

      {/* COLLECTIONS */}
      <section className="py-32 border-t border-western-gold/10">
        <div className="container-western">
          <div className="flex items-end justify-between mb-16 flex-wrap gap-4">
            <div>
              <p className="text-eyebrow mb-4">Onze coleções</p>
              <h2 className="font-display text-4xl md:text-5xl text-western-cream">
                O catálogo, organizado.
              </h2>
            </div>
            <Link to="/colecoes" className="link-underline font-mono text-xs uppercase tracking-[0.2em] text-western-cream">
              Ver todas →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-14">
            {collections.slice(0, 6).map((c) => (
              <Link
                key={c.handle}
                to={`/colecoes/${c.handle}`}
                className="group hairline-top block"
              >
                <div className="frame-gallery aspect-[4/3] overflow-hidden mb-5">
                  {c.image ? (
                    <img
                      src={c.image.url}
                      alt={c.image.altText ?? c.title}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center surface-cream">
                      <img src={iconePedra} alt="" className="h-16 opacity-40" />
                    </div>
                  )}
                </div>
                <h3 className="font-display text-2xl text-western-cream group-hover:text-western-gold-soft transition-colors">
                  {c.title}
                </h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      {featured.length > 0 && (
        <section className="py-32 border-t border-western-gold/10">
          <div className="container-western">
            <div className="flex items-end justify-between mb-16 flex-wrap gap-4">
              <div>
                <p className="text-eyebrow mb-4">Em destaque</p>
                <h2 className="font-display text-4xl md:text-5xl text-western-cream">
                  Peças para especificar.
                </h2>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-14">
              {featured.slice(0, 6).map((p) => (
                <ProductCard key={p.node.id} product={p.node} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* PROCESS */}
      <section className="py-32 border-t border-western-gold/10">
        <div className="container-western">
          <div className="max-w-2xl mb-16">
            <p className="text-eyebrow mb-4">Como funciona</p>
            <h2 className="font-display text-4xl md:text-5xl text-western-cream">
              Quatro passos, sem ruído.
            </h2>
          </div>
          <ol className="grid grid-cols-1 md:grid-cols-4 gap-12">
            {[
              { n: "01", t: "Cadastro", d: "Aprovação de parceiro em até 2 dias úteis." },
              { n: "02", t: "Especificação", d: "Ficha técnica, modelo 3D e textura macro." },
              { n: "03", t: "Pedido", d: "Pedido mínimo R$ 1.000. Pagamento antecipado." },
              { n: "04", t: "Produção", d: "15 dias úteis. Retirada na fábrica ou frete." },
            ].map((s) => (
              <li key={s.n}>
                <div className="text-spec text-western-gold mb-4">{s.n}</div>
                <h3 className="font-display text-2xl text-western-cream mb-3">{s.t}</h3>
                <p className="text-western-cream-muted leading-relaxed">{s.d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* PARTNER CTA */}
      <section className="py-32 border-t border-western-gold/10">
        <div className="container-western">
          <div className="frame-gallery p-12 md:p-20 text-center">
            <p className="text-eyebrow mb-6 !text-western-stone-dark">Para quem projeta</p>
            <h2 className="font-display text-4xl md:text-5xl text-western-green-deep mb-6">
              Arquitetos, paisagistas e revendas qualificadas.
            </h2>
            <p className="text-western-stone-dark/80 max-w-2xl mx-auto mb-10 leading-relaxed">
              Acesse condição comercial diferenciada, ficha técnica completa e
              biblioteca SketchUp do catálogo.
            </p>
            <Link
              to="/parceiro/cadastro"
              className="inline-flex items-center gap-3 px-8 py-4 bg-western-green-deep text-western-cream hover:bg-western-green-mid transition-colors font-mono text-xs uppercase tracking-[0.25em]"
            >
              Solicitar cadastro <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
