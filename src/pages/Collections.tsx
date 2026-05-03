import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { fetchCollections } from "@/lib/shopify/queries";
import iconePedra from "@/assets/icone-pedra-bege.png";

export default function Collections() {
  const { data = [], isLoading } = useQuery({
    queryKey: ["collections"],
    queryFn: () => fetchCollections(50),
  });

  return (
    <div className="container-western py-20 md:py-28">
      <div className="max-w-3xl mb-20">
        <p className="text-eyebrow mb-5">Coleções</p>
        <h1 className="font-display text-5xl md:text-6xl text-western-cream leading-[1.05]">
          Onze coleções, uma curadoria.
        </h1>
        <p className="mt-8 text-western-cream-muted text-lg leading-relaxed">
          Cada coleção é organizada por aplicação e escala — do detalhe
          decorativo às peças estruturais. Todos os acabamentos disponíveis em
          Quartzo, Arenito, Moledo e Granito.
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-14">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-[4/3] bg-western-green-mid animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-14">
          {data.map((c) => (
            <Link key={c.handle} to={`/colecoes/${c.handle}`} className="group hairline-top block">
              <div className="frame-gallery aspect-[4/3] overflow-hidden mb-5">
                {c.image ? (
                  <img
                    src={c.image.url}
                    alt={c.image.altText ?? c.title}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center surface-cream">
                    <img src={iconePedra} alt="" className="h-16 opacity-40" />
                  </div>
                )}
              </div>
              <h3 className="font-display text-2xl text-western-cream group-hover:text-western-gold-soft transition-colors">
                {c.title}
              </h3>
              {c.description && (
                <p className="text-spec text-western-cream-muted mt-2 line-clamp-2">
                  {c.description}
                </p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
