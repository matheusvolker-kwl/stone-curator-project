import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchCollection } from "@/lib/datasource";
import { ChevronLeft } from "lucide-react";
import ProductGrid from "@/components/product/ProductGrid";
import Reveal from "@/components/shared/Reveal";

export default function LinhaPage() {
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
          <h1 className="font-display text-4xl text-western-green-deep">
            Linha não encontrada
          </h1>
          <Link to="/linhas" className="link-underline mt-6 inline-block text-western-gold">
            Ver todas as linhas
          </Link>
        </div>
      </div>
    );
  }

  const products = data?.products?.edges ?? [];

  return (
    <div className="surface-ivory">
      <div className="container-western py-10 md:py-16">
        <Link
          to="/linhas"
          className="inline-flex items-center gap-2 text-western-stone-warm hover:text-western-gold transition-colors font-mono text-xs uppercase tracking-[0.2em] mb-8"
        >
          <ChevronLeft className="h-4 w-4" /> Linhas
        </Link>

        <Reveal variant="fade-up">
          <div className="max-w-3xl mb-10 md:mb-14">
            <p className="text-eyebrow mb-4">Linha</p>
            <div className="w-12 h-px bg-western-gold mb-6" />
            <h1 className="font-display text-4xl md:text-5xl text-western-green-deep leading-[1.05]">
              {data?.title ?? "—"}
            </h1>
            {data?.description && (
              <p className="mt-5 text-western-stone-warm leading-relaxed">
                {data.description}
              </p>
            )}
          </div>
        </Reveal>

        <ProductGrid products={products} isLoading={isLoading} />
      </div>
    </div>
  );
}
