import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ChevronLeft, ArrowRight } from "lucide-react";
import { fetchProducts } from "@/lib/datasource";
import ProductGrid from "@/components/product/ProductGrid";
import Reveal from "@/components/shared/Reveal";

export default function Produtos() {
  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products", "all"],
    queryFn: () => fetchProducts(250),
  });

  return (
    <div className="surface-ivory">
      <div className="container-western py-10 md:py-16">
        <Link
          to="/linhas"
          className="tap-target -ml-1 mb-6 inline-flex items-center gap-2 px-1 font-sans text-[16px] font-semibold text-western-cta transition-colors hover:text-western-green-deep"
        >
          {/* O menu agora chama /linhas de "Catálogo" — o caminho de volta tem
              que usar a mesma palavra, senão o visitante não reconhece de onde veio. */}
          <ChevronLeft className="h-5 w-5" /> Catálogo
        </Link>

        <Reveal variant="fade-up">
          <div className="mb-10 max-w-3xl md:mb-14">
            <p className="text-eyebrow mb-4">Catálogo completo</p>
            <h1 className="display-xl text-western-green-deep">Todas as peças.</h1>
            <p className="text-body mt-5">
              Toda a coleção em uma única vista. Filtre por tamanho e peso, ordene
              por preço — ou navegue por linha quando souber a categoria.
            </p>
          </div>
        </Reveal>

        <ProductGrid products={products} isLoading={isLoading} />

        <Link
          to="/contrate-a-western"
          className="group mt-16 flex flex-col gap-6 rounded-2xl bg-western-green-deep px-6 py-8 text-western-cream transition-colors hover:bg-western-green-mid md:mt-20 md:flex-row md:items-center md:justify-between md:gap-10 md:px-10 md:py-10"
        >
          <div className="max-w-xl">
            <p className="mb-3 font-sans text-[14px] font-semibold uppercase tracking-[0.06em] text-western-gold-soft">
              Projeto residencial? Sem CNPJ?
            </p>
            <p className="display-md">
              Conte sobre o seu projeto e receba um orçamento sob medida.
            </p>
          </div>
          <span className="btn-gold w-full shrink-0 md:w-auto">
            Pedir orçamento
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
          </span>
        </Link>
      </div>
    </div>
  );
}
