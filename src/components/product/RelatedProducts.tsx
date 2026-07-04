import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { fetchCollection } from "@/lib/datasource";
import { cdnImg, cdnSrcSet } from "@/lib/catalog/client";
import { extractDimensions, parseProductDescription } from "@/lib/catalog/parseDescription";


interface Props {
  collectionHandle?: string;
  collectionTitle?: string;
  currentHandle: string;
  productTitle: string;
}

export default function RelatedProducts({
  collectionHandle,
  collectionTitle,
  currentHandle,
  productTitle,
}: Props) {
  const { data: coll } = useQuery({
    queryKey: ["collection-related", collectionHandle],
    queryFn: () => fetchCollection(collectionHandle!, 12),
    enabled: !!collectionHandle,
  });
  const { data: conjuntos } = useQuery({
    queryKey: ["collection-related", "conjuntos"],
    queryFn: () => fetchCollection("conjuntos", 6),
  });

  const related =
    coll?.products?.edges
      ?.map((e) => e.node)
      .filter((p) => p.handle !== currentHandle)
      .slice(0, 4) ?? [];

  const sets =
    conjuntos?.products?.edges
      ?.map((e) => e.node)
      .filter((p) => p.handle !== currentHandle)
      .slice(0, 2) ?? [];

  if (related.length === 0 && sets.length === 0) return null;

  return (
    <section className="py-14 md:py-20">
      <div className="container-western">
        {related.length > 0 && (
          <>
            <header className="mb-10">
              <p className="text-eyebrow mb-4">Compõe bem com</p>
              <div className="w-12 h-px bg-western-gold mb-6" />
              <h2 className="font-display text-2xl md:text-3xl text-western-green-deep leading-tight">
                Pedras frequentemente especificadas em conjunto com {productTitle}
              </h2>
            </header>

            <ul className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {related.map((p) => {
                const img = p.images.edges[0]?.node;
                const parsed = parseProductDescription(p.descriptionHtml);
                const dims = extractDimensions(parsed.ficha);
                const peso = parsed.ficha.find((f) => /peso/i.test(f.label))?.value;
                const dimsLabel = dims ? `${dims.c} × ${dims.l} × ${dims.a} cm` : null;
                return (
                  <li key={p.id}>
                    <Link
                      to={`/produtos/${p.handle}`}
                      className="group block border border-transparent hover:border-western-gold/60 transition-colors"
                    >
                      <div className="aspect-[4/3] bg-western-paper overflow-hidden">
                        {img && (
                          <img
                            src={cdnImg(img.url, 600)}
                            alt={img.altText ?? p.title}
                            loading="lazy"
                            className="w-full h-full object-contain p-4 transition-transform duration-500 group-hover:scale-[1.04]"
                          />
                        )}
                      </div>
                      <div className="px-1 pt-4 pb-2">
                        {p.productType && (
                          <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-western-stone-warm/70 mb-1">
                            {p.productType}
                          </p>
                        )}
                        <p className="font-display text-lg text-western-green-deep leading-tight">
                          {p.title}
                        </p>
                        {(dimsLabel || peso) && (
                          <p className="text-spec text-western-stone-warm mt-1">
                            {[dimsLabel, peso].filter(Boolean).join(" · ")}
                          </p>
                        )}
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </>
        )}

        {sets.length > 0 && (
          <div className="mt-10">
            <p className="text-eyebrow mb-6">Conjuntos prontos com esta peça</p>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {sets.map((s) => {
                const img = s.images.edges[0]?.node;
                return (
                  <li key={s.id}>
                    <Link
                      to={`/produtos/${s.handle}`}
                      className="group block border border-western-stone-warm/15 hover:border-western-gold/60 transition-colors bg-western-paper"
                    >
                      <div className="grid grid-cols-[140px_1fr] gap-5 items-center p-4">
                        <div className="aspect-square bg-western-cream overflow-hidden">
                          {img && (
                            <img
                              src={cdnImg(img.url, 400)}
                              alt={img.altText ?? s.title}
                              loading="lazy"
                              className="w-full h-full object-contain p-2"
                            />
                          )}
                        </div>
                        <div>
                          <p className="font-display text-lg text-western-green-deep">{s.title}</p>
                          <p className="text-spec text-western-stone-warm mt-1 line-clamp-2">
                            {s.description}
                          </p>
                          <span className="mt-3 inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-western-green-deep group-hover:text-western-gold transition-colors">
                            Ver conjunto <ArrowRight className="h-3 w-3" />
                          </span>
                        </div>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
