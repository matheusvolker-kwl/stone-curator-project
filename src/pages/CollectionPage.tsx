import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchCollection } from "@/lib/shopify/queries";
import ProductCard from "@/components/product/ProductCard";
import { ChevronLeft } from "lucide-react";

export default function CollectionPage() {
  const { handle = "" } = useParams();
  const { data, isLoading } = useQuery({
    queryKey: ["collection", handle],
    queryFn: () => fetchCollection(handle, 100),
    enabled: !!handle,
  });

  if (!isLoading && !data) {
    return (
      <div className="container-western py-32 text-center">
        <h1 className="font-display text-4xl text-western-cream">Coleção não encontrada</h1>
        <Link to="/colecoes" className="link-underline mt-6 inline-block text-western-gold-soft">
          Ver todas as coleções
        </Link>
      </div>
    );
  }

  const products = data?.products?.edges ?? [];

  return (
    <div className="container-western py-20 md:py-28">
      <Link
        to="/colecoes"
        className="inline-flex items-center gap-2 text-western-cream-muted hover:text-western-gold-soft transition-colors font-mono text-xs uppercase tracking-[0.2em] mb-10"
      >
        <ChevronLeft className="h-4 w-4" /> Coleções
      </Link>

      <div className="max-w-3xl mb-20">
        <p className="text-eyebrow mb-5">Coleção</p>
        <h1 className="font-display text-5xl md:text-6xl text-western-cream leading-[1.05]">
          {data?.title ?? "—"}
        </h1>
        {data?.description && (
          <p className="mt-8 text-western-cream-muted text-lg leading-relaxed">
            {data.description}
          </p>
        )}
        {!isLoading && (
          <p className="text-spec text-western-cream-muted mt-6">
            {products.length} {products.length === 1 ? "peça" : "peças"}
          </p>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-14">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-square bg-western-green-mid animate-pulse" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <p className="text-western-cream-muted">Nenhuma peça nesta coleção.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-14">
          {products.map((p) => (
            <ProductCard key={p.node.id} product={p.node} />
          ))}
        </div>
      )}
    </div>
  );
}
