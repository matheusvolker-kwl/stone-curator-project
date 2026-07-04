import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { cdnImg, cdnSrcSet } from "@/lib/catalog/client";
import iconePedra from "@/assets/icone-pedra-verde.png";
import type { ShopifyCollection } from "@/lib/catalog/types";
import { LINHA_COVER_OVERRIDES } from "@/lib/lineCovers";

interface Props {
  collections: Array<ShopifyCollection & { count?: number }>;
  isLoading?: boolean;
}

export default function ColecoesGrid({ collections, isLoading }: Props) {
  const showSkeleton = isLoading && collections.length === 0;
  const showEmpty = !isLoading && collections.length === 0;
  return (
    <section className="surface-ivory py-16 md:py-24 border-t border-western-stone-warm/10">
      <div className="container-western">
        <div className="flex items-end justify-between flex-wrap gap-4 mb-10 md:mb-14">
          <div>
            <p className="text-eyebrow mb-3">Coleções</p>
            <h2 className="font-display text-3xl md:text-5xl text-western-green-deep leading-[1.05]">
              Catálogo completo, organizado por linha.
            </h2>
          </div>
          <Link
            to="/linhas"
            className="link-underline font-mono text-xs uppercase tracking-[0.22em] text-western-green-deep"
          >
            Ver todas as coleções →
          </Link>
        </div>

        {showEmpty ? (
          <div className="border border-dashed border-western-stone-warm/30 p-10 text-center text-sm text-western-stone-warm">
            Não foi possível carregar as coleções agora. Tente novamente em instantes.
          </div>
        ) : showSkeleton ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white border border-western-stone-warm/10 overflow-hidden">
                <div className="aspect-[4/5] bg-western-stone-warm/10 animate-pulse" />
                <div className="p-4 md:p-5 space-y-2">
                  <div className="h-4 w-3/4 bg-western-stone-warm/10 animate-pulse" />
                  <div className="h-3 w-1/3 bg-western-stone-warm/10 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">

          {collections.map((c) => {
            const cover = LINHA_COVER_OVERRIDES[c.handle];

            return (
              <Link
                key={c.handle}
                to={`/linhas/${c.handle}`}
                className="group relative block bg-white border border-western-stone-warm/10 hover:border-western-gold/60 transition-all overflow-hidden"
              >
                <div className="aspect-[4/5] overflow-hidden bg-western-paper">
                  {cover ? (
                    <img
                      src={cover.url}
                      sizes="(min-width: 1024px) 25vw, 45vw"
                      width={800}
                      height={1000}
                      alt={cover.alt}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : c.image ? (
                    <img
                      src={cdnImg(c.image.url, 600)}
                      srcSet={cdnSrcSet(c.image.url, [400, 600, 900])}
                      sizes="(min-width: 1024px) 25vw, 45vw"
                      width={800}
                      height={1000}
                      alt={c.image.altText ?? c.title}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <img src={iconePedra} alt="" className="h-14 opacity-30" />
                    </div>
                  )}
                </div>
                <div className="p-4 md:p-5">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-display text-lg md:text-xl text-western-green-deep group-hover:text-western-gold transition-colors leading-tight">
                      {c.title}
                    </h3>
                    <ArrowUpRight className="h-4 w-4 text-western-stone-warm/50 group-hover:text-western-gold transition-colors flex-shrink-0 mt-1" />
                  </div>
                  {typeof c.count === "number" && (
                    <p className="text-spec text-western-stone-warm/80 mt-1 text-xs">
                      {c.count} {c.count === 1 ? "modelo" : "modelos"}
                    </p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
        )}
      </div>

    </section>
  );
}

