import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchCollection } from "@/lib/shopify/queries";
import ProductCard from "@/components/product/ProductCard";
import { ChevronLeft } from "lucide-react";

export default function ColecaoSazonalPage() {
  const { handle = "" } = useParams();
  const { data, isLoading } = useQuery({
    queryKey: ["collection", handle],
    queryFn: () => fetchCollection(handle, 100),
    enabled: !!handle,
  });

  if (!isLoading && !data) {
    return (
      <div className="surface-ivory">
        <div className="container-western py-32 text-center">
          <h1 className="font-display text-4xl text-western-green-deep">Coleção não encontrada</h1>
          <Link to="/colecoes" className="link-underline mt-6 inline-block text-western-gold">
            Ver coleções
          </Link>
        </div>
      </div>
    );
  }

  const products = data?.products?.edges ?? [];

  return (
    <div className="surface-ivory">
      <div className="container-western py-20 md:py-28">
        <Link
          to="/colecoes"
          className="inline-flex items-center gap-2 text-western-stone-warm hover:text-western-gold transition-colors font-mono text-xs uppercase tracking-[0.2em] mb-10"
        >
          <ChevronLeft className="h-4 w-4" /> Coleções
        </Link>

        {data?.image && (
          <div className="frame-product aspect-[16/7] mb-16 overflow-hidden">
            <img
              src={data.image.url}
              alt={data.image.altText ?? data.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="max-w-3xl mb-20">
          <p className="text-eyebrow mb-5">Coleção sazonal</p>
          <div className="w-12 h-px bg-western-gold mb-8" />
          <h1 className="font-display text-5xl md:text-6xl text-western-green-deep leading-[1.05]">
            {data?.title ?? "—"}
          </h1>
          {data?.description && (
            <p className="mt-8 text-western-stone-warm text-lg leading-relaxed">
              {data.description}
            </p>
          )}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-14">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-square bg-western-stone-warm/10 animate-pulse" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <p className="text-western-stone-warm">Nenhuma peça nesta coleção ainda.</p>
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
