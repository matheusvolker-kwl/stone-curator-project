import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { fetchCollection } from "@/lib/shopify/queries";
import { cdnImg } from "@/lib/shopify/client";

interface Props {
  collectionHandle?: string;
  collectionTitle?: string;
  currentHandle: string;
}

export default function ProductPagination({
  collectionHandle,
  collectionTitle,
  currentHandle,
}: Props) {
  const { data: coll } = useQuery({
    queryKey: ["collection-pagination", collectionHandle],
    queryFn: () => fetchCollection(collectionHandle!, 50),
    enabled: !!collectionHandle,
  });

  if (!collectionHandle) return null;
  const products = coll?.products?.edges?.map((e) => e.node) ?? [];
  const idx = products.findIndex((p) => p.handle === currentHandle);
  if (idx < 0 || products.length < 2) return null;

  const prev = products[(idx - 1 + products.length) % products.length];
  const next = products[(idx + 1) % products.length];

  const Side = ({
    p,
    side,
  }: {
    p: typeof products[number];
    side: "prev" | "next";
  }) => {
    const img = p.images.edges[0]?.node;
    return (
      <Link
        to={`/produtos/${p.handle}`}
        className={`group flex items-center gap-4 ${
          side === "next" ? "justify-end text-right" : ""
        }`}
      >
        {side === "prev" && (
          <div className="w-16 h-16 bg-western-paper overflow-hidden flex-shrink-0">
            {img && (
              <img
                src={cdnImg(img.url, 200)}
                alt=""
                loading="lazy"
                className="w-full h-full object-contain p-1 transition-transform group-hover:scale-105"
              />
            )}
          </div>
        )}
        <div>
          <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-western-stone-warm/70 mb-1 inline-flex items-center gap-1.5">
            {side === "prev" ? (
              <>
                <ArrowLeft className="h-3 w-3" /> Peça anterior
              </>
            ) : (
              <>
                Próxima peça <ArrowRight className="h-3 w-3" />
              </>
            )}
          </p>
          <p className="font-display text-base text-western-green-deep group-hover:text-western-gold transition-colors">
            {p.title}
          </p>
        </div>
        {side === "next" && (
          <div className="w-16 h-16 bg-western-paper overflow-hidden flex-shrink-0">
            {img && (
              <img
                src={cdnImg(img.url, 200)}
                alt=""
                loading="lazy"
                className="w-full h-full object-contain p-1 transition-transform group-hover:scale-105"
              />
            )}
          </div>
        )}
      </Link>
    );
  };

  return (
    <section className="border-t border-western-stone-warm/15 py-12 md:py-16">
      <div className="container-western grid grid-cols-1 md:grid-cols-3 items-center gap-8">
        <Side p={prev} side="prev" />
        <p className="hidden md:block text-center font-mono text-[10px] uppercase tracking-[0.3em] text-western-stone-warm/70">
          {collectionTitle ?? "Coleção"} · {idx + 1} de {products.length}
        </p>
        <Side p={next} side="next" />
      </div>
    </section>
  );
}
