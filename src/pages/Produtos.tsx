import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ChevronLeft, ArrowRight, UserPlus } from "lucide-react";
import { fetchProducts } from "@/lib/datasource";
import ProductGrid from "@/components/product/ProductGrid";
import Reveal from "@/components/shared/Reveal";
import { useAuth } from "@/hooks/useAuth";

export default function Produtos() {
  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products", "all"],
    queryFn: () => fetchProducts(250),
  });
  // Mesma fonte de verdade do gate no card: sem preço = sem acesso de parceiro.
  // Aqui decide se o visitante vê a rampa de cadastro no topo do catálogo.
  const { isApproved } = useAuth();

  return (
    <div className="surface-ivory">
      <div className="container-western py-12 md:py-20">
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
            <p className="text-body mt-5 max-w-[60ch]">
              Toda a coleção em uma única vista. Filtre por tamanho e peso, ordene
              por preço — ou navegue por categoria quando souber o que procura.
            </p>
          </div>
        </Reveal>

        {/* Dupla rampa de público — onde o visitante bate no gate de preço pela
            1ª vez. Só para quem NÃO tem preço (visitante/parceiro pendente): o
            caminho principal é o cadastro CNPJ; o secundário é a saída B2C. */}
        {!isApproved && (
          <Reveal variant="fade-up">
            <div className="mb-10 flex flex-col gap-5 rounded-2xl border border-western-border-soft bg-white p-6 sm:flex-row sm:items-center sm:justify-between sm:gap-6 md:mb-12 md:p-7">
              <div className="max-w-md">
                <p className="text-eyebrow mb-2">Preços de parceiro</p>
                <p className="text-body">
                  O preço de atacado, peça a peça, aparece após o cadastro com CNPJ.
                </p>
              </div>
              <div className="flex flex-col items-stretch gap-3 sm:shrink-0 sm:items-end">
                <Link to="/parceiro/cadastro" className="btn-primary w-full sm:w-auto">
                  <UserPlus className="h-5 w-5" />
                  Cadastre-se para ver preços
                </Link>
                <Link
                  to="/para-sua-casa"
                  className="tap-target inline-flex items-center justify-center gap-2 px-1 font-sans text-[16px] font-semibold text-western-green-deep underline underline-offset-4 decoration-western-gold transition-colors hover:text-western-cta"
                >
                  Sem CNPJ? Veja as opções para a sua casa
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </Reveal>
        )}

        <ProductGrid products={products} isLoading={isLoading} />

        {/* Rampa pro guia — cross-sell de composição. Uma peça não faz uma cena;
            funila quem já navegou o catálogo para montar a composição pronta.
            Convive com a saída B2C logo abaixo (peça banda mais leve, verde). */}
        <Reveal variant="fade-up">
          <div className="mt-16 flex flex-col gap-6 rounded-2xl border border-western-border-strong bg-western-cream px-6 py-8 md:mt-20 md:flex-row md:items-center md:justify-between md:gap-10 md:px-10 md:py-10">
            <div className="max-w-xl">
              <p className="text-eyebrow mb-3">Guia de composição</p>
              <p className="display-md text-western-green-deep">
                Não sabe quais peças combinar?
              </p>
              <p className="text-body mt-3">
                Uma peça não faz uma cena. Responda 3 perguntas e o ateliê monta a
                composição pronta.
              </p>
            </div>
            <Link
              to="/guia-de-composicao"
              className="btn-primary w-full shrink-0 md:w-auto"
            >
              Montar no guia
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </Reveal>

        <Link
          to="/contrate-a-western"
          className="group mt-6 flex flex-col gap-6 rounded-2xl bg-western-green-deep px-6 py-8 text-western-cream transition-colors hover:bg-western-green-mid md:mt-8 md:flex-row md:items-center md:justify-between md:gap-10 md:px-10 md:py-10"
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
