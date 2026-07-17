import { useQuery } from "@tanstack/react-query";
import { Link, useSearchParams } from "react-router-dom";
import { fetchCollections, fetchProducts, isSeasonal } from "@/lib/datasource";
import { cdnImg, cdnSrcSet } from "@/lib/catalog/client";
import iconePedra from "@/assets/icone-pedra-verde.png";
import { useMemo } from "react";
import { ArrowRight, X } from "lucide-react";
import ProductCard from "@/components/product/ProductCard";
import Seo from "@/components/seo/Seo";
import { LINHA_COVER_OVERRIDES } from "@/lib/lineCovers";
import { LINHA_DESCRIPTIONS } from "@/lib/lineDescriptions";
import { resolveSearch } from "@/lib/search/vocab";
import {
  CATALOG_SCENES,
  PEDRAS_HANDLES,
  PEDRAS_VIRTUAL,
  PEDRAS_VIRTUAL_HANDLE,
} from "@/lib/catalogScenes";
import type { ShopifyCollection } from "@/lib/catalog/types";

/** Um card do índice, já normalizado (categoria real ou "Pedras decorativas"). */
interface LinhaCardData {
  handle: string;
  coverKey: string;
  image: ShopifyCollection["image"] | null;
  title: string;
  count: number;
  desc?: string | null;
  to: string;
}

function LinhaCard({ c }: { c: LinhaCardData }) {
  const cover = LINHA_COVER_OVERRIDES[c.coverKey];
  return (
    <Link to={c.to} className="group block">
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

      <h3 className="font-sans text-[20px] font-semibold leading-snug text-western-green-deep transition-colors group-hover:text-western-bronze">
        {c.title}
      </h3>
      {c.count > 0 && (
        <p className="text-meta mt-1">
          {c.count} {c.count === 1 ? "peça" : "peças"}
        </p>
      )}
      {c.desc && (
        <div className="mt-2 hidden sm:block">
          <p className="text-meta line-clamp-2">{c.desc}</p>
        </div>
      )}
    </Link>
  );
}

export default function Linhas() {
  const { data: collections = [], isLoading: loadingCollections } = useQuery({
    queryKey: ["collections"],
    queryFn: () => fetchCollections(50),
  });

  const [params, setParams] = useSearchParams();
  const q = (params.get("q") ?? "").trim();

  const { data: allProducts = [], isLoading: loadingProducts } = useQuery({
    queryKey: ["search-all-products"],
    queryFn: () => fetchProducts(300),
    enabled: q.length >= 2,
    staleTime: 60_000,
  });

  // Busca inteligente: sinônimo + acento + atalhos de intenção (serviço/cena).
  const smart = useMemo(
    () => resolveSearch(q, collections, allProducts, isSeasonal, { linhas: 12, produtos: 48, atalhos: 4 }),
    [q, collections, allProducts],
  );
  const products = smart.produtos;
  const atalhos = smart.atalhos;

  const collByHandle = useMemo(() => {
    const m = new Map<string, ShopifyCollection>();
    collections.forEach((c) => m.set(c.handle, c));
    return m;
  }, [collections]);

  // Índice agrupado por CENA (Água / Superfícies / Volumes / Detalhes).
  // "Pedras decorativas" funde as 3 categorias de pedra num card só.
  const scenes = useMemo(() => {
    const toCard = (handle: string): LinhaCardData | null => {
      if (handle === PEDRAS_VIRTUAL_HANDLE) {
        const count = PEDRAS_HANDLES.reduce(
          (s, ph) => s + (collByHandle.get(ph)?.productsCount ?? 0),
          0,
        );
        if (count === 0) return null;
        return {
          handle,
          coverKey: PEDRAS_VIRTUAL.coverFrom,
          image: collByHandle.get(PEDRAS_VIRTUAL.coverFrom)?.image ?? null,
          title: PEDRAS_VIRTUAL.title,
          count,
          desc: "Grandes, médias e pequenas — filtre por tamanho.",
          to: `/linhas/${PEDRAS_VIRTUAL_HANDLE}`,
        };
      }
      const c = collByHandle.get(handle);
      if (!c || (c.productsCount ?? 0) === 0) return null;
      return {
        handle,
        coverKey: handle,
        image: c.image ?? null,
        title: c.title,
        count: c.productsCount ?? 0,
        desc: LINHA_DESCRIPTIONS[handle] ?? c.description,
        to: `/linhas/${handle}`,
      };
    };
    return CATALOG_SCENES.map((scene) => ({
      scene,
      cards: scene.handles.map(toCard).filter((x): x is LinhaCardData => x !== null),
    })).filter((s) => s.cards.length > 0);
  }, [collByHandle]);

  // Linhas que casam com a busca — já com sinônimo/acento (via smart).
  const searchLinhas = smart.linhas;

  const totalResults = q ? searchLinhas.length + products.length : 0;
  const isSearching = q.length >= 2 && (loadingCollections || loadingProducts);

  const searchCards: LinhaCardData[] = useMemo(
    () =>
      searchLinhas.map((c) => ({
        handle: c.handle,
        coverKey: c.handle,
        image: c.image ?? null,
        title: c.title,
        count: c.productsCount ?? 0,
        desc: LINHA_DESCRIPTIONS[c.handle] ?? c.description,
        to: c.handle === "amostras" ? "/western-box" : `/linhas/${c.handle}`,
      })),
    [searchLinhas],
  );

  return (
    <div className="surface-ivory">
      <Seo
        title="Catálogo Western — pedras artesanais por cena"
        description="Navegue por cena — água, superfícies, volumes e detalhes — ou veja o catálogo inteiro. A maioria das peças vem em até 4 acabamentos."
        path="/linhas"
      />
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
                    ? atalhos.length > 0
                      ? "Nenhuma peça com esse nome — mas veja para onde ir logo abaixo."
                      : "Nada encontrado. Refine o termo ou explore o catálogo completo abaixo."
                    : `${searchLinhas.length} ${searchLinhas.length === 1 ? "categoria" : "categorias"} · ${products.length} ${products.length === 1 ? "peça" : "peças"}.`}
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
                O que você vai construir?
              </h1>
              <p className="text-body mt-5 max-w-[48ch]">
                Navegue por cena — água, superfícies, volumes e detalhes. Ou veja
                o catálogo inteiro de uma vez.
              </p>
              <p className="text-meta mt-3 max-w-[52ch]">
                A maioria das peças vem em até 4 acabamentos: Quartzo, Arenito,
                Moledo e Granito.
              </p>

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

        {/* Ir para — atalhos de intenção. A busca leva quem digita serviço/cena
            ("projeto 3d", "instalação", "amostra", "piscina") pra tela certa. */}
        {q && atalhos.length > 0 && (
          <section className="mb-12 md:mb-16">
            <h2 className="text-eyebrow mb-5">Ir para</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {atalhos.map((a) => (
                <Link
                  key={a.id}
                  to={a.to}
                  className="group flex items-center gap-4 rounded-[12px] border border-western-border-soft bg-white p-4 transition-colors hover:border-western-cta"
                >
                  <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-[8px] bg-western-cta/10">
                    <ArrowRight className="h-5 w-5 text-western-cta" aria-hidden="true" />
                  </span>
                  <span className="min-w-0">
                    <span className="block font-sans text-[17px] font-semibold text-western-green-deep">
                      {a.label}
                    </span>
                    <span className="text-meta">{a.desc}</span>
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

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

        {/* Índice de linhas */}
        {loadingCollections ? (
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 sm:gap-y-12 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="aspect-[4/3] animate-pulse rounded-2xl bg-western-stone-warm/10"
              />
            ))}
          </div>
        ) : q ? (
          // Busca: grade plana das linhas que casaram
          searchCards.length > 0 && (
            <>
              <h2 className="text-eyebrow mb-6">Categorias</h2>
              <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 sm:gap-y-12 lg:grid-cols-3">
                {searchCards.map((c) => (
                  <LinhaCard key={c.handle} c={c} />
                ))}
              </div>
            </>
          )
        ) : (
          // Navegação: agrupada por CENA
          <div className="space-y-14 md:space-y-20">
            {scenes.map(({ scene, cards }) => (
              <section key={scene.key} aria-labelledby={`cena-${scene.key}`}>
                <div className="mb-6 md:mb-8 max-w-2xl">
                  <h2
                    id={`cena-${scene.key}`}
                    className="font-display text-[26px] md:text-[30px] font-semibold text-western-green-deep"
                  >
                    {scene.titulo}
                  </h2>
                  <p className="text-meta mt-2">{scene.descricao}</p>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 sm:gap-y-12 lg:grid-cols-3">
                  {cards.map((c) => (
                    <LinhaCard key={c.handle} c={c} />
                  ))}
                </div>
              </section>
            ))}
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
              to="/para-sua-casa"
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
