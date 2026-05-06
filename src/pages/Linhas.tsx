import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { fetchCollections, isSeasonal } from "@/lib/shopify/queries";
import { cdnImg, cdnSrcSet } from "@/lib/shopify/client";
import iconePedra from "@/assets/icone-pedra-verde.png";

export default function Linhas() {
  const { data = [], isLoading } = useQuery({
    queryKey: ["collections"],
    queryFn: () => fetchCollections(50),
  });

  const linhas = data.filter((c) => !isSeasonal(c));

  return (
    <div className="surface-ivory">
      <div className="container-western py-20 md:py-28">
        <div className="max-w-3xl mb-20">
          <p className="text-eyebrow mb-5">Linhas de produtos</p>
          <div className="w-12 h-px bg-western-gold mb-8" />
          <h1 className="font-display text-4xl md:text-6xl text-western-green-deep leading-[1.05]">
            Nosso catálogo completo,<br />organizado por linhas.
          </h1>
          <p className="mt-8 text-western-stone-warm text-lg leading-relaxed">
            As linhas são nossas categorias permanentes do catálogo — cascatas,
            pedras grandes, fósseis decorativos, pisadas, bordas, fontes.
            Todos são complementares e estão disponíveis em 04 tipos de
            acabamentos: Quartzo, Arenito, Moledo e Granito.
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-14">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-[4/3] bg-western-stone-warm/10 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-14">
            {linhas.map((c) => (
              <Link key={c.handle} to={`/linhas/${c.handle}`} className="group block">
                <div className="frame-product aspect-[4/3] overflow-hidden mb-5">
                  {c.image ? (
                    <img
                      src={c.image.url}
                      alt={c.image.altText ?? c.title}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <img src={iconePedra} alt="" className="h-16 opacity-30" />
                    </div>
                  )}
                </div>
                <h3 className="font-display text-2xl text-western-green-deep group-hover:text-western-gold transition-colors">
                  {c.title}
                </h3>
                {c.description && (
                  <p className="text-spec text-western-stone-warm mt-2 line-clamp-2">
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
