import { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { Heart } from "lucide-react";
import { fetchProductsByHandles } from "@/lib/datasource";
import { cdnImg } from "@/lib/catalog/client";

export default function FavoritosCompartilhados() {
  const [params] = useSearchParams();
  const raw = params.get("itens") ?? "";

  const handles = useMemo(() => {
    const seen = new Set<string>();
    return raw
      .split(",")
      .map((s) => s.trim())
      .filter((s) => {
        if (!s || seen.has(s)) return false;
        seen.add(s);
        return true;
      })
      .slice(0, 50);
  }, [raw]);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["shared-favorites", handles.join(",")],
    queryFn: () => fetchProductsByHandles(handles),
    enabled: handles.length > 0,
    staleTime: 60_000,
  });

  return (
    <div className="surface-ivory min-h-[60vh]">
      <Helmet>
        <title>Seleção compartilhada — Western</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div className="container-western py-10 md:py-16">
        <div className="max-w-3xl mb-10 md:mb-14">
          <p className="text-eyebrow mb-4">Seleção compartilhada</p>
          <div className="w-12 h-px bg-western-gold mb-6" />
          <h1 className="font-display text-4xl md:text-5xl text-western-green-deep leading-[1.05]">
            Pedras selecionadas
          </h1>
          <p className="mt-5 text-western-stone-warm leading-relaxed">
            Uma seleção enviada por alguém. Explore cada peça e monte o seu próprio orçamento.
          </p>
        </div>

        {handles.length === 0 ? (
          <div className="border border-dashed border-western-stone-warm/30 p-10 text-center bg-white">
            <Heart className="h-8 w-8 text-western-stone-warm/40 mx-auto mb-4" />
            <p className="text-western-stone-warm">Nenhum item na seleção.</p>
          </div>
        ) : isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6" aria-hidden="true">
            {Array.from({ length: Math.min(handles.length, 8) }).map((_, i) => (
              <div key={i} className="aspect-square bg-western-paper animate-pulse" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <p className="text-western-stone-warm">Nenhuma pedra encontrada para esta seleção.</p>
        ) : (
          <ul className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {products.map((p) => {
              const img = p.images.edges[0]?.node;
              return (
                <li key={p.id}>
                  <Link
                    to={`/produtos/${p.handle}`}
                    className="group block border border-transparent hover:border-western-gold/60 transition-colors bg-white"
                  >
                    <div className="aspect-square bg-western-paper overflow-hidden">
                      {img && (
                        <img
                          src={cdnImg(img.url, 400)}
                          alt={img.altText ?? p.title}
                          loading="lazy"
                          decoding="async"
                          className="w-full h-full object-contain p-4 transition-transform duration-500 group-hover:scale-[1.04]"
                        />
                      )}
                    </div>
                    <div className="px-3 py-3">
                      <p className="font-display text-base text-western-green-deep leading-tight line-clamp-2">
                        {p.title}
                      </p>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
