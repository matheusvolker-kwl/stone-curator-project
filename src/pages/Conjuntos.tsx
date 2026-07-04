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

const PRECO_MIN_GLOBAL = Math.min(...ALL_LEAVES.map((l) => l.precoFallback));
const PRECO_MAX_GLOBAL = Math.max(...ALL_LEAVES.map((l) => l.precoFallback));

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

  const activeCount =
    tiposSel.size +
    tamanhosSel.size +
    (precoMax < PRECO_MAX_GLOBAL ? 1 : 0);

  return (
    <div className="surface-ivory min-h-screen">
      {/* HERO */}
      <header className="border-b border-western-stone-warm/15">
        <div className="container-western py-16 md:py-24">
          <div className="max-w-3xl">
            <p className="text-eyebrow mb-5">Curadoria · Conjuntos</p>
            <div className="w-12 h-px bg-western-gold mb-8" />
            <h1 className="font-display text-4xl md:text-6xl text-western-green-deep leading-[1.05]">
              Conjuntos curados,
              <br />
              prontos para projetar.
            </h1>
            <p className="mt-8 text-western-stone-warm text-lg leading-relaxed">
              45 composições organizadas pelo local de aplicação — piscinas,
              lagos, lagos híbridos e jardins. Cada conjunto reúne pedras,
              volumes e acabamentos já equilibrados pela curadoria Western.
            </p>
          </div>
        </div>
      </header>

      <div className="container-western py-12 md:py-16">
        <div className="lg:grid lg:grid-cols-[260px_1fr] lg:gap-12">
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
          <div className="lg:hidden mb-6 flex items-center justify-between">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-western-stone-warm">
              {filtered.length} conjuntos
            </p>
            <button
              onClick={() => setFiltersOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 border border-western-green-deep text-western-green-deep font-mono text-xs uppercase tracking-[0.2em]"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
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
                    className="aspect-[4/5] bg-western-stone-warm/10 animate-pulse"
                  />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="border border-western-stone-warm/20 bg-white p-12 text-center">
                <p className="font-display text-2xl text-western-green-deep mb-3">
                  Nenhum conjunto nessa combinação.
                </p>
                <p className="text-western-stone-warm mb-6">
                  Tente relaxar algum filtro.
                </p>
                <button
                  onClick={clearAll}
                  className="font-mono text-xs uppercase tracking-[0.2em] text-western-gold hover:text-western-green-deep"
                >
                  Limpar filtros
                </button>
              </div>
            ) : (
              <div className="space-y-20">
                {TIPOS_ORDER.map((tipo) => {
                  const items = grouped.get(tipo) ?? [];
                  if (items.length === 0) return null;
                  return (
                    <section key={tipo}>
                      <div className="flex items-end justify-between gap-6 mb-8 pb-5 border-b border-western-stone-warm/15">
                        <div>
                          <p className="text-eyebrow mb-2">
                            Local de aplicação
                          </p>
                          <h2 className="font-display text-3xl md:text-4xl text-western-green-deep">
                            {tipoLabels[tipo]}
                          </h2>
                          <p className="mt-2 text-western-stone-warm text-sm max-w-xl">
                            {TIPO_DESCRICAO[tipo]}
                          </p>
                        </div>
                        <p className="hidden md:block font-mono text-xs uppercase tracking-[0.2em] text-western-stone-warm/70 shrink-0">
                          {items.length}{" "}
                          {items.length === 1 ? "conjunto" : "conjuntos"}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                        {items.map(({ leaf, shopify, preco, img }) => (
                          <ConjuntoCard
                            key={leaf.handle}
                            leaf={leaf}
                            shopify={shopify}
                            preco={preco}
                            img={img}
                          />
                        ))}
                      </div>
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
            className="absolute inset-0 bg-western-green-deep/50"
            onClick={() => setFiltersOpen(false)}
          />
          <div className="relative ml-auto w-full max-w-sm bg-western-cream h-full overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <p className="font-display text-2xl text-western-green-deep">
                Filtros
              </p>
              <button
                onClick={() => setFiltersOpen(false)}
                className="p-2 text-western-stone-warm hover:text-western-green-deep"
                aria-label="Fechar filtros"
              >
                <X className="h-5 w-5" />
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
              onClick={() => setFiltersOpen(false)}
              className="mt-8 w-full py-3 bg-western-green-deep text-western-cream font-mono text-xs uppercase tracking-[0.25em]"
            >
              Ver {filtered.length} conjuntos
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
      <div className="hidden lg:flex items-center justify-between pb-4 border-b border-western-stone-warm/15">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-western-stone-warm">
          {totalResults} resultados
        </p>
        {activeCount > 0 && (
          <button
            onClick={onClear}
            className="font-mono text-[10px] uppercase tracking-[0.2em] text-western-gold hover:text-western-green-deep"
          >
            Limpar ({activeCount})
          </button>
        )}
      </div>

      {/* Local de aplicação */}
      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-western-green-deep mb-4">
          Local de aplicação
        </p>
        <ul className="space-y-2.5">
          {TIPOS_ORDER.map((t) => {
            const active = tiposSel.has(t);
            return (
              <li key={t}>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <span
                    className={`relative w-4 h-4 border transition-colors ${
                      active
                        ? "bg-western-green-deep border-western-green-deep"
                        : "border-western-stone-warm/40 group-hover:border-western-green-deep"
                    }`}
                  >
                    {active && (
                      <svg
                        viewBox="0 0 16 16"
                        className="absolute inset-0 text-western-cream"
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
                  <span className="text-sm text-western-green-deep">
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
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-western-green-deep mb-4">
          Porte do projeto
        </p>
        <div className="flex flex-wrap gap-2">
          {(["pequeno", "medio", "grande"] as Tamanho[]).map((t) => {
            const active = tamanhosSel.has(t);
            return (
              <button
                key={t}
                onClick={() => onToggleTamanho(t)}
                className={`px-3 py-1.5 text-xs font-mono uppercase tracking-[0.15em] border transition-colors ${
                  active
                    ? "bg-western-green-deep text-western-cream border-western-green-deep"
                    : "border-western-stone-warm/30 text-western-green-deep hover:border-western-green-deep"
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
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-western-green-deep mb-4">
          Investimento até
        </p>
        <div className="space-y-3">
          <input
            type="range"
            min={PRECO_MIN_GLOBAL}
            max={PRECO_MAX_GLOBAL}
            step={500}
            value={precoMax}
            onChange={(e) => onPrecoMax(Number(e.target.value))}
            className="w-full accent-western-green-deep"
          />
          <div className="flex items-center justify-between text-xs font-mono text-western-stone-warm">
            <span>{formatPreco(PRECO_MIN_GLOBAL)}</span>
            <span className="text-western-green-deep font-semibold">
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
      className="group flex flex-col bg-white border border-western-stone-warm/10 hover:border-western-gold/60 transition-all duration-300"
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
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-western-stone-warm/50">
                Imagem em breve
              </span>
            </div>
          );
        })()}
        <span className="absolute top-3 left-3 font-mono text-[10px] uppercase tracking-[0.18em] text-western-cream bg-western-green-deep/80 px-2 py-1">
          {tamanhoLabels[leaf.tamanho]} · {faixaArea[leaf.tipo][leaf.tamanho]}
        </span>
      </div>

      <div className="flex flex-col gap-2 p-5">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-western-gold">
          Composição{" "}
          {leaf.nivel === "essencial"
            ? "essencial"
            : leaf.nivel === "equilibrada"
              ? "equilibrada"
              : "completa"}
        </p>
        <h3 className="font-display text-2xl text-western-green-deep">
          {leaf.nome}
        </h3>
        <p className="text-xs text-western-stone-warm/80 line-clamp-2">
          {tipoLabels[leaf.tipo]} ·{" "}
          {shopify?.description?.slice(0, 80) ??
            "Composição curada Western pronta para projetar."}
        </p>

        <div className="mt-3 pt-3 border-t border-western-stone-warm/10 flex items-end justify-between">
          <GatedPrice
            amount={String(preco)}
            currency="BRL"
            className="font-sans text-lg font-semibold text-western-green-deep"
          />
          <span className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.2em] text-western-stone-warm/70 group-hover:text-western-gold transition-colors">
            Ver conjunto <ArrowRight className="h-3 w-3" />
          </span>
        </div>
      </div>
    </Link>
  );
}
