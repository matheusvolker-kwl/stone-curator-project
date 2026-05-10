import { useQuery } from "@tanstack/react-query";
import { fetchCollection } from "@/lib/shopify/queries";
import ProductCard from "@/components/product/ProductCard";

export default function Conjuntos() {
  const { data, isLoading } = useQuery({
    queryKey: ["collection", "conjuntos"],
    queryFn: () => fetchCollection("conjuntos", 50),
  });

  const products = data?.products?.edges ?? [];

  return (
    <div className="surface-ivory">
      <div className="container-western py-20 md:py-28">
        <div className="max-w-3xl mb-20">
          <p className="text-eyebrow mb-5">Curadoria · Conjuntos</p>
          <div className="w-12 h-px bg-western-gold mb-8" />
          <h1 className="font-display text-4xl md:text-6xl text-western-green-deep leading-[1.05]">
            Conjuntos para<br />começar com confiança.
          </h1>
          <p className="mt-8 text-western-stone-warm text-lg leading-relaxed">
            Cada conjunto é uma composição curada para um ambiente específico —
            cascatas, bordas de piscina, jardins contemplativos. Pedras, volumes
            e acabamentos já equilibrados, prontos para o seu projeto.
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-14">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-square bg-western-stone-warm/10 animate-pulse" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="border border-western-stone-warm/20 p-12 md:p-16 text-center max-w-2xl mx-auto bg-white">
            <p className="text-eyebrow mb-4">Em curadoria</p>
            <p className="font-display text-3xl text-western-green-deep mb-4">
              Conjuntos a caminho
            </p>
            <p className="text-western-stone-warm mb-8">
              Estamos finalizando nossa primeira leva de conjuntos curados.
              Enquanto isso, monte o seu pelo Guia de Composição ou explore as linhas.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <a
                href="/guia-de-composicao"
                className="inline-flex items-center px-6 py-3 bg-western-green-deep text-western-cream hover:bg-western-green-deep/90 transition-colors font-mono text-xs uppercase tracking-[0.25em]"
              >
                Abrir o guia
              </a>
              <a
                href="/linhas"
                className="inline-flex items-center px-6 py-3 border border-western-stone-warm/30 text-western-green-deep hover:border-western-gold transition-colors font-mono text-xs uppercase tracking-[0.25em]"
              >
                Ver linhas
              </a>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-14">
            {products.map((p) => (
              <ProductCard key={p.node.id} product={p.node} surface="cream" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
