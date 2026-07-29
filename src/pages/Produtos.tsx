import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ChevronLeft, ArrowRight, UserPlus } from "lucide-react";
import { fetchProducts } from "@/lib/datasource";
import ProductGrid from "@/components/product/ProductGrid";
import Reveal from "@/components/shared/Reveal";
import Seo from "@/components/seo/Seo";
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
      <Seo
        title="Todas as peças — catálogo Western"
        description="Toda a coleção de pedras artesanais em uma única vista. Filtre por tamanho e peso, ordene por preço. Preço de parceiro após cadastro com CNPJ."
        path="/produtos"
      />
      <div className="container-western pb-14 pt-6 md:pb-20 md:pt-10">
        <Link
          to="/linhas"
          className="tap-target -ml-1 mb-3 inline-flex items-center gap-2 px-1 font-sans text-[15px] font-semibold text-western-cta transition-colors hover:text-western-green-deep"
        >
          {/* O menu agora chama /linhas de "Catálogo" — o caminho de volta tem
              que usar a mesma palavra, senão o visitante não reconhece de onde veio. */}
          <ChevronLeft className="h-5 w-5" /> Catálogo
        </Link>

        {/* Cabeçalho enxuto: h1 + uma linha. A dobra é do produto, não do texto —
            a auditoria reprovou o parágrafo que explicava a própria página. */}
        {/* Balcão: listagem é ferramenta — display-md + uma linha meta. */}
        <div className="mb-5 max-w-3xl md:mb-6">
          <h1 className="display-md text-western-green-deep">Todas as peças.</h1>
          <p className="text-meta mt-1.5">
            Toda a coleção em uma vista. Filtre por tamanho, peso e preço.
          </p>
        </div>

        {/* Gate de preço como faixa fina horizontal acima do grid — o visitante
            ainda bate no muro do CNPJ, mas ele não empurra mais o catálogo pra
            baixo da dobra. Só para quem NÃO tem preço (visitante/parceiro pendente). */}
        {!isApproved && (
          <div className="mb-6 flex flex-col gap-3 rounded-lg border border-western-border-soft bg-white px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:gap-5 md:mb-8 md:px-5">
            <p className="text-ui text-western-stone-warm">
              <span className="font-semibold text-western-green-deep">Preço de parceiro</span>
              {" "}— o atacado, peça a peça, aparece após o cadastro com CNPJ.
            </p>
            <div className="flex shrink-0 flex-col gap-2.5 sm:flex-row sm:items-center sm:gap-5">
              <Link to="/parceiro/cadastro" className="btn-primary w-full sm:w-auto">
                <UserPlus className="h-5 w-5" />
                Cadastre-se para ver preços
              </Link>
              <Link to="/para-sua-casa" className="link-cta shrink-0">
                Sem CNPJ?
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        )}

        <ProductGrid products={products} isLoading={isLoading} />

        {/* Rampa pro guia — cross-sell de composição. Uma peça não faz uma cena;
            funila quem já navegou o catálogo para montar a composição pronta.
            Convive com a saída B2C logo abaixo (peça banda mais leve, verde). */}
        <Reveal variant="fade-up">
          <div className="mt-16 flex flex-col gap-6 rounded-xl border border-western-border-strong bg-western-cream px-6 py-8 md:mt-20 md:flex-row md:items-center md:justify-between md:gap-10 md:px-10 md:py-10">
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

        {/* A faixa se anuncia como "Projeto residencial? Sem CNPJ?" e mandava
            pra porta B2B. Agora vai pra /para-sua-casa, que é literalmente a
            página que responde isso. */}
        <Link
          to="/para-sua-casa"
          className="group mt-6 flex flex-col gap-6 rounded-xl bg-western-green-deep px-6 py-8 text-western-cream transition-colors hover:bg-western-green-mid md:mt-8 md:flex-row md:items-center md:justify-between md:gap-10 md:px-10 md:py-10"
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
