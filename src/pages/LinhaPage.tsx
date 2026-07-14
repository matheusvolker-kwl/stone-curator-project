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
        <div className="container-western py-24 md:py-32">
          <div className="mx-auto max-w-md text-center">
            <h1 className="display-lg text-western-green-deep">
              Linha não encontrada.
            </h1>
            <p className="text-body mt-4">
              O endereço pode ter mudado. Veja as linhas disponíveis no catálogo.
            </p>
            <Link
              to="/linhas"
              className="btn-primary mt-8 w-full sm:w-auto"
            >
              Ver todas as linhas
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const products = data?.products?.edges ?? [];

  return (
    <div className="surface-ivory">
      <div className="container-western py-8 md:py-14">
        {/* Volta para o índice de linhas — alvo de toque cheio */}
        <Link
          to="/linhas"
          className="tap-target -ml-2 mb-6 inline-flex items-center gap-2 px-2 font-sans text-[16px] font-semibold text-western-stone-warm transition-colors hover:text-western-green-deep md:mb-8"
        >
          <ChevronLeft className="h-5 w-5" aria-hidden="true" /> Todas as linhas
        </Link>

        <Reveal variant="fade-up">
          <header className="mb-10 max-w-2xl md:mb-14">
            <p className="text-eyebrow mb-4">Linha</p>
            <h1 className="display-lg text-western-green-deep">
              {data?.title ?? "—"}
            </h1>
            {data?.description && (
              <p className="text-body mt-5 max-w-[52ch]">{data.description}</p>
            )}
            {!isLoading && products.length > 0 && (
              <p className="text-meta mt-4">
                {products.length} {products.length === 1 ? "peça" : "peças"} nesta linha
              </p>
            )}
          </header>
        </Reveal>

        <ProductGrid products={products} isLoading={isLoading} />
      </div>
    </div>
  );
}
