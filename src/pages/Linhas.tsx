import { useQuery } from "@tanstack/react-query";
import { Link, useSearchParams } from "react-router-dom";
import { fetchCollections, fetchProducts, isSeasonal } from "@/lib/shopify/queries";
import { cdnImg, cdnSrcSet, formatBRL } from "@/lib/shopify/client";
import iconePedra from "@/assets/icone-pedra-verde.png";
import { useMemo } from "react";
import { ArrowRight, X } from "lucide-react";

export default function Linhas() {
  const { data: collections = [], isLoading: loadingCollections } = useQuery({
    queryKey: ["collections"],
    queryFn: () => fetchCollections(50),
  });

  const [params, setParams] = useSearchParams();
  const q = (params.get("q") ?? "").trim();

  // Busca de produtos (Shopify) — só dispara quando há query
  const { data: products = [], isLoading: loadingProducts } = useQuery({
    queryKey: ["productSearch", q],
    queryFn: () => {
      // Sintaxe Shopify: title, vendor, tag, product_type, sku
      const term = q.replace(/[^\p{L}\p{N}\s-]/gu, " ").trim();
      if (!term) return Promise.resolve([]);
      const query = `title:*${term}* OR tag:*${term}* OR sku:*${term}* OR product_type:*${term}*`;
      return fetchProducts(24, query);
    },
    enabled: q.length >= 2,
    staleTime: 60_000,
  });

  const linhas = useMemo(() => {
    const base = collections.filter((c) => !isSeasonal(c));
    if (!q) return base;
    const needle = q.toLowerCase();
    return base.filter(
      (c) =>
        c.title.toLowerCase().includes(needle) ||
        (c.description ?? "").toLowerCase().includes(needle) ||
        c.handle.toLowerCase().includes(needle)
    );
  }, [collections, q]);

  const totalResults = q ? linhas.length + products.length : 0;
  const isSearching = q.length >= 2 && (loadingCollections || loadingProducts);

  return (
    <div className="surface-ivory">
      <div className="container-western py-20 md:py-28">
        <div className="max-w-3xl mb-14 md:mb-20">
          <p className="text-eyebrow mb-5">{q ? "Resultados da busca" : "Linhas de produtos"}</p>
          <div className="w-12 h-px bg-western-gold mb-8" />
          {q ? (
            <>
              <h1 className="font-display text-4xl md:text-5xl text-western-green-deep leading-[1.05]">
                Resultados para <span className="italic">"{q}"</span>
              </h1>
              <p className="mt-6 text-western-stone-warm leading-relaxed">
                {isSearching
                  ? "Buscando…"
                  : totalResults === 0
                  ? "Nada encontrado. Refine o termo ou explore o catálogo completo abaixo."
                  : `${linhas.length} ${linhas.length === 1 ? "linha" : "linhas"} · ${products.length} ${products.length === 1 ? "produto" : "produtos"}.`}
              </p>
              <button
                onClick={() => setParams(new URLSearchParams(), { replace: true })}
                className="mt-5 inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-western-gold hover:underline"
              >
                <X className="h-3 w-3" /> Limpar busca
              </button>
            </>
          ) : (
            <>
              <h1 className="font-display text-4xl md:text-6xl text-western-green-deep leading-[1.05]">
                Nosso catálogo completo,<br />organizado por linhas.
              </h1>
              <p className="mt-8 text-western-stone-warm text-lg leading-relaxed">
                As linhas são nossas categorias permanentes do catálogo — cascatas,
                pedras grandes, fósseis decorativos, pisadas, bordas, fontes.
                Todos são complementares e estão disponíveis em 04 tipos de
                acabamentos: Quartzo, Arenito, Moledo e Granito.
              </p>
            </>
          )}
        </div>

        {/* Resultados de produtos (só na busca) */}
        {q && products.length > 0 && (
          <div className="mb-16">
            <p className="text-eyebrow mb-5">Produtos</p>
            <div className="w-8 h-px bg-western-gold/50 mb-6" />
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
              {products.map(({ node: p }) => {
                const img = p.images?.edges?.[0]?.node;
                const minPrice = p.priceRange?.minVariantPrice;
                return (
                  <Link key={p.handle} to={`/produto/${p.handle}`} className="group block">
                    <div className="frame-product aspect-square overflow-hidden mb-3 bg-western-stone-warm/5">
                      {img ? (
                        <img
                          src={cdnImg(img.url, 600)}
                          srcSet={cdnSrcSet(img.url, [300, 600, 900])}
                          sizes="(min-width: 1024px) 280px, (min-width: 640px) 30vw, 45vw"
                          alt={img.altText ?? p.title}
                          loading="lazy"
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <img src={iconePedra} alt="" className="h-10 opacity-30" />
                        </div>
                      )}
                    </div>
                    <h3 className="font-display text-base text-western-green-deep group-hover:text-western-gold transition-colors line-clamp-2">
                      {p.title}
                    </h3>
                    {minPrice && (
                      <p className="text-spec text-western-stone-warm mt-1">
                        a partir de {formatBRL(parseFloat(minPrice.amount), minPrice.currencyCode)}
                      </p>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Linhas (sempre — quando busca está vazia OU como fallback) */}
        {q && linhas.length > 0 && (
          <p className="text-eyebrow mb-5">Linhas</p>
        )}
        {q && linhas.length > 0 && <div className="w-8 h-px bg-western-gold/50 mb-6" />}

        {loadingCollections ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-14">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-[4/3] bg-western-stone-warm/10 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-14">
            {!q && (
              <Link
                to="/produtos"
                className="group block frame-product aspect-[4/3] overflow-hidden bg-western-green-deep text-western-paper p-8 flex flex-col justify-between transition-colors hover:bg-western-green-deep/90"
              >
                <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-western-gold/90">
                  Catálogo completo
                </p>
                <div>
                  <h3 className="font-display text-3xl leading-tight text-western-paper group-hover:text-western-gold transition-colors">
                    Ver todos os produtos
                  </h3>
                  <p className="text-spec text-western-paper/70 mt-3 leading-relaxed">
                    Filtre por tamanho e peso, ordene por preço.
                  </p>
                  <span className="inline-flex items-center gap-1.5 mt-5 font-mono text-[10px] uppercase tracking-[0.22em] text-western-gold">
                    Abrir catálogo <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>
            )}
            {(q && totalResults === 0
              ? collections.filter((c) => !isSeasonal(c))
              : linhas
            ).map((c) => (
              <Link key={c.handle} to={`/linhas/${c.handle}`} className="group block">
                <div className="frame-product aspect-[4/3] overflow-hidden mb-5">
                  {c.image ? (
                    <img
                      src={cdnImg(c.image.url, 800)}
                      srcSet={cdnSrcSet(c.image.url, [400, 800, 1200])}
                      sizes="(min-width: 1024px) 380px, (min-width: 640px) 45vw, 90vw"
                      alt={c.image.altText ?? c.title}
                      loading="lazy"
                      decoding="async"
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
