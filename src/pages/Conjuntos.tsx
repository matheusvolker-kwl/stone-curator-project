import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { fetchProductsByHandles } from "@/lib/datasource";
import { cdnImg } from "@/lib/catalog/client";
import {
  guideMap,
  tipoLabels,
  tamanhoLabels,
  faixaArea,
  formatPreco,
  nivelMeta,
  pecasPorTipoNivel,
  type Tipo,
  type Tamanho,
  type Nivel,
} from "@/data/guideMap";
import GatedPrice from "@/components/shared/GatedPrice";
import { ArrowRight, SlidersHorizontal, X } from "lucide-react";
import ProjetosWesternBand from "@/components/shared/ProjetosWesternBand";
import { conjuntoRenders } from "@/data/conjuntoRenders";
import { nivelImage } from "@/components/guide-v2/imagery";

type LeafMeta = {
  handle: string;
  nome: string;
  precoFallback: number;
  tipo: Tipo;
  tamanho: Tamanho;
  nivel: Nivel;
};

const TIPOS_ORDER: Tipo[] = [
  "piscina",
  "lago",
  "lago-hibrido",
  "jardim-seco",
  "jardim-fonte",
];

const TIPO_DESCRICAO: Record<Tipo, string> = {
  piscina: "Bordas, cascatas e revestimentos para áreas molhadas.",
  lago: "Composição 100% Western — leitura mineral e contemplativa.",
  "lago-hibrido": "Western combinado com pedras naturais para projetos mistos.",
  "jardim-seco": "Jardins minerais sem fonte — desenho contemplativo.",
  "jardim-fonte": "Jardins com fonte ou espelho d'água integrado.",
};

// Achata o guideMap em uma lista linear de folhas com metadados
const ALL_LEAVES: LeafMeta[] = TIPOS_ORDER.flatMap((tipo) =>
  (Object.keys(guideMap[tipo]) as Tamanho[]).flatMap((tamanho) =>
    (Object.keys(guideMap[tipo][tamanho]) as Nivel[]).map((nivel) => {
      const leaf = guideMap[tipo][tamanho][nivel];
      return {
        handle: leaf.handle,
        nome: leaf.nome,
        precoFallback: leaf.preco,
        tipo,
        tamanho,
        nivel,
      };
    }),
  ),
);

const ALL_HANDLES = ALL_LEAVES.map((l) => l.handle);

/** Conjuntos mostrados por local antes do "ver todos" (1 linha no desktop). */
const PREVIEW_POR_TIPO = 3;

const PRECO_MIN_GLOBAL = Math.min(...ALL_LEAVES.map((l) => l.precoFallback));
const PRECO_MAX_GLOBAL = Math.max(...ALL_LEAVES.map((l) => l.precoFallback));

const NIVEL_ADJETIVO: Record<Nivel, string> = {
  essencial: "essencial",
  equilibrada: "equilibrada",
  completa: "completa",
};

export default function Conjuntos() {
  const { data: products, isLoading } = useQuery({
    queryKey: ["conjuntos", "all-handles"],
    queryFn: () => fetchProductsByHandles(ALL_HANDLES),
    staleTime: 1000 * 60 * 5,
  });

  // Filtros
  const [tiposSel, setTiposSel] = useState<Set<Tipo>>(new Set());
  const [tamanhosSel, setTamanhosSel] = useState<Set<Tamanho>>(new Set());
  const [precoMax, setPrecoMax] = useState<number>(PRECO_MAX_GLOBAL);
  const [filtersOpen, setFiltersOpen] = useState(false);
  /**
   * Cada local de aplicação mostra PREVIEW_POR_TIPO conjuntos; o resto abre sob
   * demanda. Sem isso a página despeja 45 cards de uma vez (>26.000px no
   * mobile) — o oposto de "uma decisão por vez".
   */
  const [expandidos, setExpandidos] = useState<Set<Tipo>>(new Set());

  // Mescla shopify + meta
  const enriched = useMemo(() => {
    const byHandle = new Map(
      (products ?? []).map((p) => [p.handle, p] as const),
    );
    return ALL_LEAVES.map((leaf) => {
      const shopify = byHandle.get(leaf.handle);
      const preco = shopify
        ? Number(shopify.priceRange.minVariantPrice.amount)
        : leaf.precoFallback;
      const img = shopify?.images.edges[0]?.node;
      return { leaf, shopify, preco, img };
    });
  }, [products]);

  const filtered = useMemo(() => {
    return enriched.filter(({ leaf, preco }) => {
      if (tiposSel.size > 0 && !tiposSel.has(leaf.tipo)) return false;
      if (tamanhosSel.size > 0 && !tamanhosSel.has(leaf.tamanho)) return false;
      if (preco > precoMax) return false;
      return true;
    });
  }, [enriched, tiposSel, tamanhosSel, precoMax]);

  const grouped = useMemo(() => {
    const map = new Map<Tipo, typeof filtered>();
    for (const tipo of TIPOS_ORDER) map.set(tipo, []);
    for (const item of filtered) map.get(item.leaf.tipo)!.push(item);
    return map;
  }, [filtered]);

  const toggleTipo = (t: Tipo) => {
    setTiposSel((prev) => {
      const next = new Set(prev);
      next.has(t) ? next.delete(t) : next.add(t);
      return next;
    });
  };
  const toggleTamanho = (t: Tamanho) => {
    setTamanhosSel((prev) => {
      const next = new Set(prev);
      next.has(t) ? next.delete(t) : next.add(t);
      return next;
    });
  };

  const clearAll = () => {
    setTiposSel(new Set());
    setTamanhosSel(new Set());
    setPrecoMax(PRECO_MAX_GLOBAL);
  };

  const toggleExpandido = (t: Tipo) => {
    setExpandidos((prev) => {
      const next = new Set(prev);
      next.has(t) ? next.delete(t) : next.add(t);
      return next;
    });
  };

  const activeCount =
    tiposSel.size +
    tamanhosSel.size +
    (precoMax < PRECO_MAX_GLOBAL ? 1 : 0);

  return (
    <div className="surface-ivory min-h-screen">
      {/* HERO */}
      <header className="border-b border-western-border-soft">
        <div className="container-western py-14 md:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-10 lg:gap-16 items-end">
            <div className="max-w-3xl">
              <p className="text-eyebrow mb-4">Curadoria · Conjuntos</p>
              <div className="w-12 h-px bg-western-gold mb-7" />
              <h1 className="display-xl text-western-green-deep">
                Conjuntos curados, prontos para projetar.
              </h1>
              <p className="mt-6 text-body max-w-[60ch]">
                {ALL_LEAVES.length} composições organizadas pelo local de aplicação —
                piscinas, lagos, lagos híbridos e jardins. Cada conjunto reúne
                pedras, volumes e acabamentos já equilibrados pela curadoria
                Western.
              </p>
            </div>

            {/* Atalho guiado — o caminho de maior conversão para quem chega sem rumo */}
            <aside className="surface-forest rounded-2xl p-7 md:p-8">
              <p className="font-sans text-[14px] font-semibold uppercase tracking-[0.06em] text-western-gold-soft mb-3">
                Não sabe por onde começar?
              </p>
              <p className="display-md text-western-cream">
                Responda 3 perguntas e veja os conjuntos certos para o seu
                projeto.
              </p>
              <Link
                to="/guia-de-composicao"
                className="btn-gold mt-7 w-full sm:w-auto"
              >
                Abrir o guia <ArrowRight className="h-5 w-5" />
              </Link>
            </aside>
          </div>
        </div>
      </header>

      <div className="container-western py-12 md:py-16">
        <div className="lg:grid lg:grid-cols-[280px_1fr] lg:gap-12">
          {/* SIDEBAR — desktop */}
          <aside className="hidden lg:block">
            <FilterPanel
              tiposSel={tiposSel}
              tamanhosSel={tamanhosSel}
              precoMax={precoMax}
              onToggleTipo={toggleTipo}
              onToggleTamanho={toggleTamanho}
              onPrecoMax={setPrecoMax}
              onClear={clearAll}
              activeCount={activeCount}
              totalResults={filtered.length}
            />
          </aside>

          {/* MOBILE — botão de abrir filtros */}
          <div className="lg:hidden mb-6 flex items-center justify-between gap-4">
            <p className="font-sans text-[16px] text-western-stone-warm">
              {filtered.length}{" "}
              {filtered.length === 1 ? "conjunto" : "conjuntos"}
            </p>
            <button
              type="button"
              onClick={() => setFiltersOpen(true)}
              className="btn-outline-forest px-5"
            >
              <SlidersHorizontal className="h-5 w-5" />
              Filtros {activeCount > 0 && `(${activeCount})`}
            </button>
          </div>

          {/* MAIN */}
          <main>
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="aspect-[4/5] rounded-lg bg-western-stone-warm/10 animate-pulse"
                  />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="rounded-2xl border border-western-border-soft bg-white p-10 md:p-12 text-center">
                <p className="display-md text-western-green-deep mb-3">
                  Nenhum conjunto nessa combinação.
                </p>
                <p className="text-body mb-7">
                  Tente relaxar algum filtro.
                </p>
                <button
                  type="button"
                  onClick={clearAll}
                  className="btn-outline-forest w-full sm:w-auto"
                >
                  Limpar filtros
                </button>
              </div>
            ) : (
              <div className="space-y-16 md:space-y-20">
                {TIPOS_ORDER.map((tipo) => {
                  const items = grouped.get(tipo) ?? [];
                  if (items.length === 0) return null;
                  // Filtrou por este local? Então já pediu para ver tudo dele.
                  const filtrouEsteTipo = tiposSel.has(tipo);
                  const aberto = expandidos.has(tipo) || filtrouEsteTipo;
                  const visiveis = aberto
                    ? items
                    : items.slice(0, PREVIEW_POR_TIPO);
                  const ocultos = items.length - visiveis.length;
                  return (
                    <section key={tipo}>
                      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3 mb-8 pb-5 border-b border-western-border-soft">
                        <div>
                          <p className="text-eyebrow mb-2">
                            Local de aplicação
                          </p>
                          <h2 className="display-lg text-western-green-deep">
                            {tipoLabels[tipo]}
                          </h2>
                          <p className="mt-3 text-body max-w-xl">
                            {TIPO_DESCRICAO[tipo]}
                          </p>
                        </div>
                        <p className="text-meta shrink-0">
                          {items.length}{" "}
                          {items.length === 1 ? "conjunto" : "conjuntos"}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                        {visiveis.map(({ leaf, shopify, preco, img }) => (
                          <ConjuntoCard
                            key={leaf.handle}
                            leaf={leaf}
                            shopify={shopify}
                            preco={preco}
                            img={img}
                          />
                        ))}
                      </div>

                      {(ocultos > 0 || (aberto && !filtrouEsteTipo)) && (
                        <button
                          type="button"
                          onClick={() => toggleExpandido(tipo)}
                          aria-expanded={aberto}
                          className="btn-outline-forest mt-8 w-full sm:w-auto"
                        >
                          {aberto ? (
                            <>Mostrar menos</>
                          ) : (
                            <>
                              Ver os {items.length} conjuntos de{" "}
                              {tipoLabels[tipo].toLowerCase()}
                              <ArrowRight className="h-5 w-5" />
                            </>
                          )}
                        </button>
                      )}
                    </section>
                  );
                })}
              </div>
            )}
          </main>
        </div>
      </div>

      <ProjetosWesternBand />

      {/* MOBILE — drawer de filtros */}
      {filtersOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-western-green-deep/50 backdrop-blur-[2px]"
            onClick={() => setFiltersOpen(false)}
          />
          <div className="relative ml-auto w-full max-w-sm bg-western-ivory h-full overflow-y-auto rounded-l-2xl p-6 pb-10">
            <div className="flex items-center justify-between mb-7">
              <p className="display-md text-western-green-deep">
                Filtros
              </p>
              <button
                type="button"
                onClick={() => setFiltersOpen(false)}
                className="tap-target inline-flex items-center justify-center rounded-md text-western-stone-warm hover:text-western-green-deep hover:bg-western-paper transition-colors"
                aria-label="Fechar filtros"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <FilterPanel
              tiposSel={tiposSel}
              tamanhosSel={tamanhosSel}
              precoMax={precoMax}
              onToggleTipo={toggleTipo}
              onToggleTamanho={toggleTamanho}
              onPrecoMax={setPrecoMax}
              onClear={clearAll}
              activeCount={activeCount}
              totalResults={filtered.length}
            />
            <button
              type="button"
              onClick={() => setFiltersOpen(false)}
              className="btn-primary mt-8 w-full"
            >
              Ver {filtered.length}{" "}
              {filtered.length === 1 ? "conjunto" : "conjuntos"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// =============== FILTER PANEL ===============
interface FilterPanelProps {
  tiposSel: Set<Tipo>;
  tamanhosSel: Set<Tamanho>;
  precoMax: number;
  onToggleTipo: (t: Tipo) => void;
  onToggleTamanho: (t: Tamanho) => void;
  onPrecoMax: (n: number) => void;
  onClear: () => void;
  activeCount: number;
  totalResults: number;
}

function FilterPanel({
  tiposSel,
  tamanhosSel,
  precoMax,
  onToggleTipo,
  onToggleTamanho,
  onPrecoMax,
  onClear,
  activeCount,
  totalResults,
}: FilterPanelProps) {
  return (
    <div className="lg:sticky lg:top-24 space-y-8">
      <div className="hidden lg:flex items-center justify-between gap-3 pb-4 border-b border-western-border-soft">
        <p className="font-sans text-[16px] text-western-stone-warm">
          {totalResults}{" "}
          {totalResults === 1 ? "resultado" : "resultados"}
        </p>
        {activeCount > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="font-sans text-[14px] font-semibold text-western-bronze underline underline-offset-4 hover:text-western-green-deep transition-colors"
          >
            Limpar ({activeCount})
          </button>
        )}
      </div>

      {/* Local de aplicação */}
      <div>
        <p className="text-eyebrow mb-3">Local de aplicação</p>
        <ul>
          {TIPOS_ORDER.map((t) => {
            const active = tiposSel.has(t);
            return (
              <li key={t}>
                <label className="tap-target flex items-center gap-3 cursor-pointer group">
                  <span
                    className={`relative w-6 h-6 shrink-0 rounded-sm border-[1.5px] transition-colors ${
                      active
                        ? "bg-western-green-deep border-western-green-deep"
                        : "border-western-border-strong bg-white group-hover:border-western-green-deep"
                    }`}
                  >
                    {active && (
                      <svg
                        viewBox="0 0 16 16"
                        className="absolute inset-0.5 text-western-cream"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      >
                        <path d="M3.5 8.5l3 3 6-7" />
                      </svg>
                    )}
                  </span>
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={() => onToggleTipo(t)}
                    className="sr-only"
                  />
                  <span className="font-sans text-[16px] text-western-green-deep">
                    {tipoLabels[t]}
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Tamanho */}
      <div>
        <p className="text-eyebrow mb-3">Porte do projeto</p>
        <div className="flex flex-wrap gap-2">
          {(["pequeno", "medio", "grande"] as Tamanho[]).map((t) => {
            const active = tamanhosSel.has(t);
            return (
              <button
                key={t}
                type="button"
                aria-pressed={active}
                onClick={() => onToggleTamanho(t)}
                className={`tap-target inline-flex items-center justify-center rounded-full border px-5 font-sans text-[16px] font-semibold transition-colors ${
                  active
                    ? "bg-western-green-deep text-western-cream border-western-green-deep"
                    : "bg-white border-western-border-strong text-western-green-deep hover:border-western-green-deep"
                }`}
              >
                {tamanhoLabels[t]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Preço */}
      <div>
        <p className="text-eyebrow mb-3">Investimento até</p>
        <div className="space-y-3">
          <input
            type="range"
            min={PRECO_MIN_GLOBAL}
            max={PRECO_MAX_GLOBAL}
            step={500}
            value={precoMax}
            onChange={(e) => onPrecoMax(Number(e.target.value))}
            aria-label="Investimento máximo"
            className="w-full h-6 accent-western-green-deep cursor-pointer"
          />
          <div className="flex items-center justify-between gap-3 font-sans text-[14px] tabular-nums text-western-stone-warm">
            <span>{formatPreco(PRECO_MIN_GLOBAL)}</span>
            <span className="text-[16px] font-semibold text-western-green-deep">
              {formatPreco(precoMax)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// =============== CARD ===============
import type { ShopifyProductNode } from "@/lib/catalog/types";
interface CardProps {
  leaf: LeafMeta;
  shopify?: ShopifyProductNode;
  preco: number;
  img?: { url: string; altText?: string | null };
}

function ConjuntoCard({ leaf, shopify, preco, img }: CardProps) {
  return (
    <Link
      to={`/conjuntos/${leaf.handle}`}
      className="group flex flex-col overflow-hidden rounded-lg bg-white border border-western-border-soft hover:border-western-gold/60 shadow-[0_16px_32px_-26px_hsl(var(--western-stone-dark)/0.3)] hover:shadow-[0_26px_44px_-26px_hsl(var(--western-stone-dark)/0.34)] transition-all duration-300"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-western-paper">
        {(() => {
          const render = conjuntoRenders[leaf.handle] ?? nivelImage[leaf.nivel];
          if (render) {
            return (
              <img
                src={render}
                alt={leaf.nome}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
              />
            );
          }
          if (img) {
            return (
              <img
                src={cdnImg(img.url, 800)}
                alt={img.altText ?? leaf.nome}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
              />
            );
          }
          return (
            <div className="w-full h-full flex items-center justify-center">
              <span className="font-sans text-[14px] text-western-stone-warm/70">
                Imagem em breve
              </span>
            </div>
          );
        })()}
        <span className="absolute top-3 left-3 rounded-md bg-western-green-deep/90 px-3 py-1.5 font-sans text-[14px] font-semibold text-western-cream">
          {tamanhoLabels[leaf.tamanho]} · {faixaArea[leaf.tipo][leaf.tamanho]}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-5 md:p-6">
        <p className="text-eyebrow">
          Composição {NIVEL_ADJETIVO[leaf.nivel]}
        </p>
        <h3 className="font-sans text-[20px] font-semibold tracking-normal leading-snug text-western-green-deep">
          {leaf.nome}
        </h3>
        <p className="text-meta line-clamp-2">
          {nivelMeta[leaf.nivel].tagline} · {pecasPorTipoNivel[leaf.nivel]}
        </p>

        <div className="mt-auto pt-4 border-t border-western-border-soft flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <GatedPrice
            amount={String(preco)}
            currency="BRL"
            className="font-sans text-[20px] font-semibold tabular-nums text-western-green-deep"
            linked={false}
          />
          <span className="inline-flex items-center gap-1.5 font-sans text-[14px] font-semibold text-western-bronze group-hover:text-western-green-deep transition-colors">
            Ver conjunto <ArrowRight className="h-4 w-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}
