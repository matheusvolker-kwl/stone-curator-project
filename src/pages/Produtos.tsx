import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { fetchProducts } from "@/lib/shopify/queries";
import ProductGrid from "@/components/product/ProductGrid";

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
          className="inline-flex items-center gap-2 text-western-stone-warm hover:text-western-gold transition-colors font-mono text-xs uppercase tracking-[0.2em] mb-8"
        >
          <ChevronLeft className="h-4 w-4" /> Linhas
        </Link>

        <div className="max-w-3xl mb-10 md:mb-14">
          <p className="text-eyebrow mb-4">Catálogo completo</p>
          <div className="w-12 h-px bg-western-gold mb-6" />
          <h1 className="font-display text-4xl md:text-5xl text-western-green-deep leading-[1.05]">
            Todos os produtos
          </h1>
          <p className="mt-5 text-western-stone-warm leading-relaxed">
            Toda a coleção em uma única vista. Filtre por tamanho e peso, ordene
            por preço — ou navegue por linha quando souber a categoria.
          </p>
        </div>

        <ProductGrid products={products} isLoading={isLoading} />
      </div>
    </div>
  );
}
