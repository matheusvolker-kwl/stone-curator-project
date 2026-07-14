import { useQuery } from "@tanstack/react-query";
import { Link, useSearchParams } from "react-router-dom";
import { fetchCollections, fetchProducts, isSeasonal } from "@/lib/datasource";
import { cdnImg, cdnSrcSet } from "@/lib/catalog/client";
import iconePedra from "@/assets/icone-pedra-verde.png";
import { useMemo } from "react";
import { ArrowRight, X } from "lucide-react";
import ProductCard from "@/components/product/ProductCard";
import { LINHA_COVER_OVERRIDES } from "@/lib/lineCovers";
import { LINHA_DESCRIPTIONS } from "@/lib/lineDescriptions";
import { linhaRank } from "@/lib/lineOrder";

export default function Linhas() {
  const { data: collections = [], isLoading: loadingCollections } = useQuery({
    queryKey: ["collections"],
    queryFn: () => fetchCollections(50),
  });

  const [params, setParams] = useSearchParams();
  const q = (params.get("q") ?? "").trim();

  const { data: products = [], isLoading: loadingProducts } = useQuery({
    queryKey: ["productSearch", q],
    queryFn: () => {
      const term = q.replace(/[^\p{L}\p{N}\s-]/gu, " ").trim();
      if (!term) return Promise.resolve([]);
      const query = `title:*${term}* OR tag:*${term}* OR sku:*${term}* OR product_type:*${term}*`;
      return fetchProducts(24, query);
    },
    enabled: q.length >= 2,
    staleTime: 60_000,
  });

  const linhas = useMemo(() => {
    const base = [...collections.filter((c) => !isSeasonal(c))].sort(
      (a, b) => linhaRank(a.handle) - linhaRank(b.handle),
    );
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

  const linhasList = useMemo(() => {
    const src = q && totalResults === 0 ? collections.filter((c) => !isSeasonal(c)) : linhas;
    const seen = new Set<string>();
    return src.filter((c) => { if (seen.has(c.handle)) return false; seen.add(c.handle); return true; });
  }, [q, totalResults, collections, linhas]);


  return (
    <div className="surface-ivory">
      <div className="container-western py-12 md:py-20">
        {/* Cabeçalho — hierarquia contida: eyebrow, display, apoio, ação */}
        <header className="max-w-2xl mb-10 md:mb-16">
          {q ? (
            <>
              <p className="text-eyebrow mb-4">Resultados da busca</p>
              <h1 className="display-lg text-western-green-deep">
                Resultados para “{q}”.
              </h1>
              <p className="text-body mt-5 max-w-[46ch]">
                {isSearching
                  ? "Buscando…"
                  : totalResults === 0
                    ? "Nada encontrado. Refine o termo ou explore o catálogo completo abaixo."
                    : `${linhas.length} ${linhas.length === 1 ? "linha" : "linhas"} · ${products.length} ${products.length === 1 ? "peça" : "peças"}.`}
              </p>
              <button
                type="button"
                onClick={() => setParams(new URLSearchParams(), { replace: true })}
                className="tap-target mt-4 -ml-1 inline-flex items-center gap-2 px-1 font-sans text-[16px] font-semibold text-western-green-deep transition-colors hover:text-western-bronze"
              >
                <X className="h-5 w-5" aria-hidden="true" /> Limpar busca
              </button>
            </>
          ) : (
            <>
              <p className="text-eyebrow mb-4">Catálogo</p>
              <h1 className="display-lg text-western-green-deep">
                Todas as linhas.
              </h1>
              <p className="text-body mt-5 max-w-[46ch]">
                Cada peça tem um papel na cena. Navegue por linha — ou veja o
                catálogo inteiro.
              </p>
              <p className="text-meta mt-3 max-w-[52ch]">
                A maioria das peças está disponível em até 4 acabamentos:
                Quartzo, Arenito, Moledo e Granito.
              </p>

              {/* CTA primário verde, full-width no mobile */}
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link to="/produtos" className="btn-primary w-full sm:w-auto">
                  Ver o catálogo inteiro
                  <ArrowRight className="h-5 w-5" aria-hidden="true" />
                </Link>
                <Link to="/guia-de-composicao" className="btn-outline-forest w-full sm:w-auto">
                  Montar no guia
                </Link>
              </div>
            </>
          )}
        </header>

        {/* Peças encontradas na busca — ProductCard mantém o preço gated */}
        {q && products.length > 0 && (
          <section className="mb-14 md:mb-20">
            <h2 className="text-eyebrow mb-6">Peças</h2>
            <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
              {products.map(({ node: p }) => (
                <ProductCard key={p.handle} product={p} />
              ))}
            </div>
          </section>
        )}

        {q && linhas.length > 0 && <h2 className="text-eyebrow mb-6">Linhas</h2>}

        {/* Grid de linhas — 2 colunas já no mobile (cards compactos, foto primeiro) */}
        {loadingCollections ? (
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 sm:gap-y-12 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="aspect-[4/3] animate-pulse rounded-2xl bg-western-stone-warm/10"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 sm:gap-y-12 lg:grid-cols-3">
            {linhasList.map((c) => {
              const cover = LINHA_COVER_OVERRIDES[c.handle];
              const desc = LINHA_DESCRIPTIONS[c.handle] ?? c.description;
              const count = c.productsCount ?? 0;

              return (
                <Link
                  key={c.handle}
                  to={c.handle === "amostras" ? "/western-box" : `/linhas/${c.handle}`}
                  className="group block"
                >
                  <div className="frame-product mb-3 aspect-[4/3] overflow-hidden rounded-2xl sm:mb-4">
                    {cover ? (
                      <img
                        src={cover.url}
                        sizes="(min-width: 1024px) 380px, 45vw"
                        alt={cover.alt}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : c.image ? (
                      <img
                        src={cdnImg(c.image.url, 800)}
                        srcSet={cdnSrcSet(c.image.url, [400, 800, 1200])}
                        sizes="(min-width: 1024px) 380px, 45vw"
                        alt={c.image.altText ?? c.title}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-western-cream">
                        <img src={iconePedra} alt="" className="h-12 opacity-30" />
                      </div>
                    )}
                  </div>

                  <h2 className="font-sans text-[20px] font-semibold leading-snug text-western-green-deep transition-colors group-hover:text-western-bronze">
                    {c.title}
                  </h2>
                  {count > 0 && (
                    <p className="text-meta mt-1">
                      {count} {count === 1 ? "peça" : "peças"}
                    </p>
                  )}
                  {/* Descrição some no mobile: mantém o card compacto (2 colunas) */}
                  {desc && (
                    <div className="mt-2 hidden sm:block">
                      <p className="text-meta line-clamp-2">{desc}</p>
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        )}

        {/* Faixa institucional — verde escuro pontual; aqui o dourado é o acento certo */}
        <section className="surface-forest mt-14 rounded-2xl px-6 py-8 md:mt-20 md:px-10 md:py-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="max-w-xl">
              <p className="mb-3 font-sans text-[14px] font-semibold uppercase tracking-[0.06em] text-western-gold-soft">
                Projeto residencial? Sem CNPJ?
              </p>
              <p className="display-md text-western-cream">
                Conte sobre o seu projeto e receba um orçamento sob medida.
              </p>
            </div>
            <Link
              to="/contrate-a-western"
              className="btn-gold w-full shrink-0 md:w-auto"
            >
              Pedir orçamento
              <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
