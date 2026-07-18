import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ProductCard from "@/components/product/ProductCard";
import RangeFilter, { type Range } from "@/components/product/RangeFilter";
import { BUSINESS } from "@/config/business";
import { extractSizeWeight } from "@/lib/catalog/sizeWeight";
import { PRODUCT_CATEGORIES } from "@/lib/catalogScenes";
import type { ShopifyProduct } from "@/lib/catalog/types";
import { linhaRank, naturalTitleCompare } from "@/lib/lineOrder";
import { cn } from "@/lib/utils";

type SortKey = "az" | "za" | "price-asc" | "price-desc";

interface Props {
  products: ShopifyProduct[];
  isLoading?: boolean;
  /** mensagem mostrada quando há 0 resultados sem filtros (catálogo vazio) */
  emptyLabel?: string;
}

/** Arredonda o máximo do catálogo para um número "redondo" (piso mínimo). */
function roundUp(n: number, step: number, floor: number) {
  return Math.max(floor, Math.ceil(n / step) * step);
}

/** Lê "min-max" da URL; fora do formato → faixa cheia (sem filtro). */
function parseRange(raw: string | null, absMax: number): Range {
  if (raw) {
    const m = raw.match(/^(\d+)-(\d+)$/);
    if (m) {
      const min = Math.max(0, Math.min(Number(m[1]), absMax));
      const max = Math.min(absMax, Math.max(Number(m[2]), 0));
      if (min <= max) return { min, max };
    }
  }
  return { min: 0, max: absMax };
}

export default function ProductGrid({ products, isLoading, emptyLabel }: Props) {
  const [params, setParams] = useSearchParams();

  const q = params.get("q") ?? "";
  const sort = (params.get("sort") as SortKey) || "";
  /* Categoria (dono, 2026-07-18): o filtro mais pedido. O produto já traz as
     coleções dele, então casa por handle — sem camada de dados extra. */
  const cat = params.get("cat") ?? "";

  const update = (key: string, value: string | null) => {
    const next = new URLSearchParams(params);
    if (value && value.length) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  };

  const clearFilters = () => {
    const next = new URLSearchParams(params);
    next.delete("q");
    next.delete("cat");
    next.delete("tamanho");
    next.delete("peso");
    setParams(next, { replace: true });
  };

  // Pré-computa size/weight uma vez por produto
  const enriched = useMemo(
    () =>
      products.map((p) => ({
        ...p,
        sw: extractSizeWeight(p.node),
      })),
    [products]
  );

  // Máximos reais do catálogo → definem a escala da régua (adapta por página).
  const { maxCm, maxKg } = useMemo(() => {
    let mc = 0;
    let mk = 0;
    for (const p of enriched) {
      if (p.sw.maiorDimensaoCm != null) mc = Math.max(mc, p.sw.maiorDimensaoCm);
      if (p.sw.pesoKg != null) mk = Math.max(mk, p.sw.pesoKg);
    }
    return { maxCm: roundUp(mc, 10, 60), maxKg: roundUp(mk, 10, 40) };
  }, [enriched]);

  /* Categorias presentes NESTE conjunto (com contagem). Só entra chip que tem
     peça — numa linha/coleção específica sobra 1 chip só, e aí ele nem aparece.
     A contagem deixa decidir antes de clicar (regra do Balcão). */
  const categorias = useMemo(() => {
    const count = new Map<string, number>();
    for (const p of enriched) {
      const handles = (p.node.collections?.edges ?? []).map((e) => e.node.handle);
      for (const c of PRODUCT_CATEGORIES) {
        if (c.handles.some((h) => handles.includes(h))) {
          count.set(c.key, (count.get(c.key) ?? 0) + 1);
        }
      }
    }
    return PRODUCT_CATEGORIES.filter((c) => (count.get(c.key) ?? 0) > 0).map((c) => ({
      ...c,
      count: count.get(c.key) ?? 0,
    }));
  }, [enriched]);

  const tamRange = parseRange(params.get("tamanho"), maxCm);
  const pesRange = parseRange(params.get("peso"), maxKg);
  const tamActive = tamRange.min > 0 || tamRange.max < maxCm;
  const pesActive = pesRange.min > 0 || pesRange.max < maxKg;

  const setRange = (key: "tamanho" | "peso", r: Range, absMax: number) => {
    const full = r.min <= 0 && r.max >= absMax;
    update(key, full ? null : `${r.min}-${r.max}`);
  };

  const filtered = useMemo(() => {
    let list = enriched;
    if (cat) {
      const handles = PRODUCT_CATEGORIES.find((c) => c.key === cat)?.handles ?? [];
      list = list.filter((p) =>
        (p.node.collections?.edges ?? []).some((e) => handles.includes(e.node.handle)),
      );
    }
    if (q) {
      const needle = q.toLowerCase();
      list = list.filter(
        (p) =>
          p.node.title.toLowerCase().includes(needle) ||
          (p.node.variants.edges[0]?.node?.sku ?? "")
            .toLowerCase()
            .includes(needle)
      );
    }
    // Régua: quando a faixa é estreitada, produto SEM medida sai (não há como
    // posicioná-lo na régua) — foi essa a inconsistência do filtro por bucket.
    if (tamActive) {
      list = list.filter(
        (p) =>
          p.sw.maiorDimensaoCm != null &&
          p.sw.maiorDimensaoCm >= tamRange.min &&
          p.sw.maiorDimensaoCm <= tamRange.max
      );
    }
    if (pesActive) {
      list = list.filter(
        (p) =>
          p.sw.pesoKg != null &&
          p.sw.pesoKg >= pesRange.min &&
          p.sw.pesoKg <= pesRange.max
      );
    }
    const arr = [...list];
    switch (sort) {
      case "az":
        arr.sort((a, b) => naturalTitleCompare(a.node.title, b.node.title));
        break;
      case "za":
        arr.sort((a, b) => naturalTitleCompare(b.node.title, a.node.title));
        break;
      case "price-asc":
        arr.sort(
          (a, b) =>
            parseFloat(a.node.priceRange.minVariantPrice.amount) -
            parseFloat(b.node.priceRange.minVariantPrice.amount)
        );
        break;
      case "price-desc":
        arr.sort(
          (a, b) =>
            parseFloat(b.node.priceRange.minVariantPrice.amount) -
            parseFloat(a.node.priceRange.minVariantPrice.amount)
        );
        break;
      default:
        // Ordenação padrão curada: linha carro-chefe primeiro, título natural dentro da linha.
        arr.sort((a, b) => {
          const ra = linhaRank(a.node.collections?.edges?.[0]?.node?.handle);
          const rb = linhaRank(b.node.collections?.edges?.[0]?.node?.handle);
          if (ra !== rb) return ra - rb;
          return naturalTitleCompare(a.node.title, b.node.title);
        });
    }
    return arr;
  }, [enriched, cat, q, tamActive, tamRange.min, tamRange.max, pesActive, pesRange.min, pesRange.max, sort]);

  const hasFilters = !!q || !!cat || tamActive || pesActive;
  const activeCount = (q ? 1 : 0) + (cat ? 1 : 0) + (tamActive ? 1 : 0) + (pesActive ? 1 : 0);
  // Mobile: filtros começam recolhidos pra não empurrar os produtos pra baixo
  // da dobra; abertos automaticamente se a URL já chega com filtros ativos.
  const [filtersOpen, setFiltersOpen] = useState(hasFilters);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[300px_1fr] lg:gap-12">
      {/* Toggle de filtros — só mobile/tablet */}
      <button
        type="button"
        onClick={() => setFiltersOpen((o) => !o)}
        aria-expanded={filtersOpen}
        className="btn-outline-forest w-full justify-between bg-white px-5 lg:hidden"
      >
        <span className="inline-flex items-center gap-2.5">
          <SlidersHorizontal className="h-5 w-5 text-western-bronze" />
          Filtrar e buscar
          {activeCount > 0 && (
            <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-western-cta px-1.5 text-[14px] font-semibold text-western-cream">
              {activeCount}
            </span>
          )}
        </span>
        <span aria-hidden="true" className="text-[18px] leading-none text-western-stone-warm">
          {filtersOpen ? "−" : "+"}
        </span>
      </button>

      {/* Rail de filtros */}
      <aside
        className={cn(
          "space-y-8 rounded-lg border border-western-border-soft bg-white p-6 lg:sticky lg:top-24 lg:self-start",
          filtersOpen ? "block" : "hidden lg:block"
        )}
      >
        {/* CATEGORIA — o filtro que o dono pediu, no topo do rail (é o primeiro
            corte que o profissional faz). Chips em modo Balcão: h-11, 15px, com
            a contagem pra decidir antes de clicar. Só aparece se o conjunto tem
            mais de uma categoria (numa linha específica não faz sentido). */}
        {categorias.length > 1 && (
          <div>
            <p className="text-eyebrow mb-3">Categoria</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => update("cat", null)}
                aria-pressed={!cat}
                className={cn(
                  "inline-flex h-11 items-center rounded-full border px-4 font-sans text-[15px] font-semibold transition-colors",
                  !cat
                    ? "border-western-cta bg-western-cta text-western-cream"
                    : "border-western-border-strong bg-white text-western-green-deep hover:border-western-green-deep",
                )}
              >
                Todas
              </button>
              {categorias.map((c) => {
                const on = cat === c.key;
                return (
                  <button
                    key={c.key}
                    type="button"
                    onClick={() => update("cat", on ? null : c.key)}
                    aria-pressed={on}
                    className={cn(
                      "inline-flex h-11 items-center gap-2 rounded-full border px-4 font-sans text-[15px] font-semibold transition-colors",
                      on
                        ? "border-western-cta bg-western-cta text-western-cream"
                        : "border-western-border-strong bg-white text-western-green-deep hover:border-western-green-deep",
                    )}
                  >
                    {c.label}
                    <span
                      className={cn(
                        "tabular-nums text-[14px] font-normal",
                        on ? "text-western-cream/70" : "text-western-stone-warm",
                      )}
                    >
                      {c.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div>
          <p className="text-eyebrow mb-3">Buscar</p>
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-western-stone-warm" />
            <input
              type="search"
              value={q}
              onChange={(e) => update("q", e.target.value || null)}
              placeholder="Nome ou código"
              aria-label="Buscar peça por nome ou código"
              className="h-control w-full rounded-lg border-[1.5px] border-western-border-strong bg-western-paper pl-12 pr-4 font-sans text-[15px] text-western-green-deep transition-colors placeholder:text-western-stone-warm focus:border-western-cta focus:outline-none"
            />
          </div>
        </div>

        {/* Régua de TAMANHO (maior dimensão, cm) */}
        <RangeFilter
          eyebrow="Tamanho"
          unit="cm"
          absMin={0}
          absMax={maxCm}
          step={5}
          value={tamRange}
          onChange={(r) => setRange("tamanho", r, maxCm)}
        />

        {/* Régua de PESO (kg) */}
        <RangeFilter
          eyebrow="Peso"
          unit="kg"
          absMin={0}
          absMax={maxKg}
          step={5}
          value={pesRange}
          onChange={(r) => setRange("peso", r, maxKg)}
        />

        <div className="space-y-4 border-t border-western-border-soft pt-5">
          <p className="text-meta">
            A régua usa a maior dimensão da peça. Peças sem medida na ficha não
            entram quando você estreita a faixa.
          </p>
          <p className="text-meta">
            Produção em {BUSINESS.prazoProducaoDias} dias úteis após a confirmação.
          </p>
          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="tap-target inline-flex items-center gap-2 font-sans text-[15px] font-semibold text-western-cta underline underline-offset-4 decoration-western-gold hover:text-western-green-deep"
            >
              <X className="h-4 w-4" /> Limpar filtros
            </button>
          )}
        </div>
      </aside>

      {/* Resultados */}
      <div>
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-western-border-soft pb-5">
          <p className="text-spec">
            {isLoading
              ? "Carregando…"
              : `${filtered.length} de ${products.length} ${products.length === 1 ? "peça" : "peças"}`}
          </p>
          <Select
            value={sort || undefined}
            onValueChange={(v) => update("sort", v || null)}
          >
            <SelectTrigger className="h-control w-[200px] rounded-lg border-[1.5px] border-western-border-strong bg-white px-4 font-sans text-[15px] font-semibold text-western-green-deep">
              <SelectValue placeholder="Ordenar" />
            </SelectTrigger>
            <SelectContent className="rounded-lg">
              <SelectItem value="az" className="text-[15px]">Nome A–Z</SelectItem>
              <SelectItem value="za" className="text-[15px]">Nome Z–A</SelectItem>
              <SelectItem value="price-asc" className="text-[15px]">Menor preço</SelectItem>
              <SelectItem value="price-desc" className="text-[15px]">Maior preço</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="aspect-square animate-pulse rounded-lg bg-western-cream/60"
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-lg border border-western-border-soft bg-white px-6 py-16 text-center">
            <p className="text-body">
              {hasFilters
                ? "Nenhuma peça encontrada com os filtros atuais."
                : emptyLabel ?? "Nenhuma peça disponível no momento."}
            </p>
            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="btn-outline-forest mt-6 w-full sm:w-auto"
              >
                Limpar filtros
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((p) => (
              <ProductCard key={p.node.id} product={p.node} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
