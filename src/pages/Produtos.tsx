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
          className="inline-flex items-center gap-2 text-western-stone-warm hover:text-western-gold transition-colors font-mono text-xs uppercase tracking-[0.2em] mb-8"
        >
          <ChevronLeft className="h-4 w-4" /> Linhas
        </Link>

        <Reveal variant="fade-up">
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
        </Reveal>

        <ProductGrid products={products} isLoading={isLoading} />

        <Link to="/contrate-a-western" className="group mt-14 md:mt-20 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border border-western-gold/30 bg-western-green-deep px-6 py-6 md:px-10 md:py-8 text-western-cream transition-colors hover:bg-western-green-deep/90">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-western-gold-soft mb-2">Projeto residencial? Sem CNPJ?</p>
            <p className="font-display text-xl md:text-2xl leading-tight">Conte sobre o seu projeto e receba um orçamento sob medida.</p>
          </div>
          <span className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] text-western-gold whitespace-nowrap">Pedir orçamento <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" /></span>
        </Link>
      </div>
    </div>
  );
}
