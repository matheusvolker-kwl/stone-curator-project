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
import { BUSINESS } from "@/config/business";
import {
  extractSizeWeight,
  TAMANHO_META,
  PESO_META,
  type TamanhoBucket,
  type PesoBucket,
} from "@/lib/catalog/sizeWeight";
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

const TAMANHOS: TamanhoBucket[] = ["pequeno", "medio", "grande", "enorme"];
const PESOS: PesoBucket[] = ["leve", "medio", "pesado", "muito-pesado"];

export default function ProductGrid({ products, isLoading, emptyLabel }: Props) {
  const [params, setParams] = useSearchParams();

  const q = params.get("q") ?? "";
  const sort = (params.get("sort") as SortKey) || "";
  const activeTamanhos = (params.get("tamanho") ?? "")
    .split(",")
    .filter(Boolean) as TamanhoBucket[];
  const activePesos = (params.get("peso") ?? "")
    .split(",")
    .filter(Boolean) as PesoBucket[];

  const update = (key: string, value: string | null) => {
    const next = new URLSearchParams(params);
    if (value && value.length) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  };

  const toggle = (key: "tamanho" | "peso", value: string) => {
    const current = key === "tamanho" ? activeTamanhos : activePesos;
    const set = new Set<string>(current);
    set.has(value) ? set.delete(value) : set.add(value);
    update(key, set.size ? Array.from(set).join(",") : null);
  };

  const clearFilters = () => {
    const next = new URLSearchParams(params);
    next.delete("q");
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

  const filtered = useMemo(() => {
    let list = enriched;
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
    if (activeTamanhos.length) {
      list = list.filter(
        (p) => p.sw.tamanho == null || activeTamanhos.includes(p.sw.tamanho)
      );
    }
    if (activePesos.length) {
      list = list.filter(
        (p) => p.sw.peso == null || activePesos.includes(p.sw.peso)
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
  }, [enriched, q, activeTamanhos, activePesos, sort]);

  const hasFilters = !!q || activeTamanhos.length > 0 || activePesos.length > 0;
  const activeCount = (q ? 1 : 0) + activeTamanhos.length + activePesos.length;
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
        <span aria-hidden="true" className="text-[20px] leading-none text-western-stone-warm">
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
              className="h-[52px] w-full rounded-lg border-[1.5px] border-western-border-strong bg-western-paper pl-12 pr-4 font-sans text-[16px] text-western-green-deep transition-colors placeholder:text-western-stone-warm focus:border-western-cta focus:outline-none"
            />
          </div>
        </div>

        <FilterChips
          eyebrow="Tamanho"
          subline="maior dimensão"
          options={TAMANHOS.map((k) => ({
            key: k,
            label: TAMANHO_META[k].label,
            hint: TAMANHO_META[k].hint,
          }))}
          active={activeTamanhos}
          onToggle={(v) => toggle("tamanho", v)}
        />

        <FilterChips
          eyebrow="Peso"
          options={PESOS.map((k) => ({
            key: k,
            label: PESO_META[k].label,
            hint: PESO_META[k].hint,
          }))}
          active={activePesos}
          onToggle={(v) => toggle("peso", v)}
        />

        <div className="space-y-4 border-t border-western-border-soft pt-5">
          <p className="text-meta">
            Produção em {BUSINESS.prazoProducaoDias} dias úteis após a confirmação.
          </p>
          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="tap-target inline-flex items-center gap-2 font-sans text-[16px] font-semibold text-western-cta underline underline-offset-4 decoration-western-gold hover:text-western-green-deep"
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
            <SelectTrigger className="h-[52px] w-[200px] rounded-lg border-[1.5px] border-western-border-strong bg-white px-4 font-sans text-[16px] font-semibold text-western-green-deep">
              <SelectValue placeholder="Ordenar" />
            </SelectTrigger>
            <SelectContent className="rounded-lg">
              <SelectItem value="az" className="text-[16px]">Nome A–Z</SelectItem>
              <SelectItem value="za" className="text-[16px]">Nome Z–A</SelectItem>
              <SelectItem value="price-asc" className="text-[16px]">Menor preço</SelectItem>
              <SelectItem value="price-desc" className="text-[16px]">Maior preço</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-4 sm:gap-6 xl:grid-cols-3">
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
          <div className="grid grid-cols-2 gap-4 sm:gap-6 xl:grid-cols-3">
            {filtered.map((p) => (
              <ProductCard key={p.node.id} product={p.node} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function FilterChips({
  eyebrow,
  subline,
  options,
  active,
  onToggle,
}: {
  eyebrow: string;
  subline?: string;
  options: Array<{ key: string; label: string; hint: string }>;
  active: string[];
  onToggle: (key: string) => void;
}) {
  return (
    <div>
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-3">
        <p className="text-eyebrow">{eyebrow}</p>
        {subline && <span className="text-meta">{subline}</span>}
      </div>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const isActive = active.includes(opt.key);
          return (
            <button
              key={opt.key}
              type="button"
              onClick={() => onToggle(opt.key)}
              aria-pressed={isActive}
              className={cn(
                "tap-target inline-flex flex-col justify-center rounded-full border-[1.5px] px-4 py-2 text-left font-sans transition-colors",
                isActive
                  ? "border-western-cta bg-western-cta text-western-cream"
                  : "border-western-border-strong bg-white text-western-green-deep hover:border-western-cta"
              )}
            >
              <span className="text-[16px] font-semibold leading-tight">{opt.label}</span>
              <span
                className={cn(
                  "text-[14px] leading-tight",
                  isActive ? "text-western-cream/80" : "text-western-stone-warm"
                )}
              >
                {opt.hint}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
