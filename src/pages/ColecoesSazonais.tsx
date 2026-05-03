import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { fetchCollections, isSeasonal } from "@/lib/shopify/queries";

export default function ColecoesSazonais() {
  const { data = [], isLoading } = useQuery({
    queryKey: ["collections"],
    queryFn: () => fetchCollections(50),
  });

  const sazonais = data.filter(isSeasonal);

  return (
    <div className="surface-ivory">
      <div className="container-western py-20 md:py-28">
        <div className="max-w-3xl mb-20">
          <p className="text-eyebrow mb-5">Coleções · Edições sazonais</p>
          <div className="w-12 h-px bg-western-gold mb-8" />
          <h1 className="font-display text-5xl md:text-6xl text-western-green-deep leading-[1.05]">
            Curadorias de temporada,<br />em tiragem limitada.
          </h1>
          <p className="mt-8 text-western-stone-warm text-lg leading-relaxed">
            Cada coleção é um recorte sazonal — combinações de acabamento,
            tamanhos e composições escolhidas para um momento. Quando a edição
            encerra, as peças voltam ao catálogo permanente das Linhas.
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="aspect-[5/4] bg-western-stone-warm/10 animate-pulse" />
            ))}
          </div>
        ) : sazonais.length === 0 ? (
          <div className="border border-western-stone-warm/20 p-16 text-center max-w-2xl">
            <p className="text-eyebrow mb-4">Próxima edição</p>
            <p className="font-display text-3xl text-western-green-deep mb-3">
              Coleção Verão 26 · em breve
            </p>
            <p className="text-western-stone-warm mb-8">
              Estamos finalizando a próxima curadoria. Cadastre-se como parceiro
              para ser avisado na abertura.
            </p>
            <Link to="/parceiro/cadastro" className="btn-outline-forest">
              Quero ser avisado
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {sazonais.map((c) => (
              <Link key={c.handle} to={`/colecoes/${c.handle}`} className="group block">
                <div className="frame-product aspect-[5/4] overflow-hidden mb-6">
                  {c.image ? (
                    <img
                      src={c.image.url}
                      alt={c.image.altText ?? c.title}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full" />
                  )}
                </div>
                <p className="text-eyebrow mb-2">Edição sazonal</p>
                <h3 className="font-display text-3xl text-western-green-deep group-hover:text-western-gold transition-colors">
                  {c.title}
                </h3>
                {c.description && (
                  <p className="text-spec text-western-stone-warm mt-3 line-clamp-2">
                    {c.description}
                  </p>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
