import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, X } from "lucide-react";
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
} from "@/lib/shopify/sizeWeight";
import type { ShopifyProduct } from "@/lib/shopify/types";
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
        arr.sort((a, b) => a.node.title.localeCompare(b.node.title));
        break;
      case "za":
        arr.sort((a, b) => b.node.title.localeCompare(a.node.title));
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
    }
    return arr;
  }, [enriched, q, activeTamanhos, activePesos, sort]);

  const hasFilters = !!q || activeTamanhos.length > 0 || activePesos.length > 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-10">
      {/* Sidebar */}
      <aside className="lg:sticky lg:top-24 lg:self-start space-y-8 bg-white border border-western-stone-warm/15 p-6">
        <div>
          <p className="text-eyebrow mb-3">Buscar</p>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-western-stone-warm" />
            <input
              type="search"
              value={q}
              onChange={(e) => update("q", e.target.value || null)}
              placeholder="Nome ou SKU"
              className="w-full h-10 pl-9 pr-3 bg-western-paper border border-western-stone-warm/20 text-sm text-western-green-deep placeholder:text-western-stone-warm/60 focus:outline-none focus:border-western-gold"
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

        <div className="pt-2 border-t border-western-stone-warm/15 space-y-3">
          <p className="text-spec text-western-stone-warm/80 text-xs leading-relaxed">
            Pedido mínimo {BUSINESS.pedidoMinimoLabel} · produção{" "}
            {BUSINESS.prazoProducaoDias} dias úteis após confirmação.
          </p>
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-western-gold hover:underline"
            >
              <X className="h-3 w-3" /> Limpar filtros
            </button>
          )}
        </div>
      </aside>

      {/* Resultados */}
      <div>
        <div className="flex items-center justify-between gap-4 mb-6 pb-4 border-b border-western-stone-warm/15 flex-wrap">
          <p className="text-spec text-western-stone-warm">
            {isLoading
              ? "Carregando…"
              : `${filtered.length} de ${products.length} ${products.length === 1 ? "peça" : "peças"}`}
          </p>
          <Select
            value={sort || undefined}
            onValueChange={(v) => update("sort", v || null)}
          >
            <SelectTrigger className="w-[180px] h-9 rounded-none border-western-stone-warm/25 bg-white font-mono text-xs uppercase tracking-[0.18em] text-western-green-deep">
              <SelectValue placeholder="Ordene" />
            </SelectTrigger>
            <SelectContent className="rounded-none">
              <SelectItem value="az">Nome A–Z</SelectItem>
              <SelectItem value="za">Nome Z–A</SelectItem>
              <SelectItem value="price-asc">Menor preço</SelectItem>
              <SelectItem value="price-desc">Maior preço</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="aspect-square bg-western-stone-warm/10 animate-pulse"
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center bg-white border border-western-stone-warm/15">
            <p className="text-western-stone-warm">
              {hasFilters
                ? "Nenhuma peça encontrada com os filtros atuais."
                : emptyLabel ?? "Nenhuma peça disponível no momento."}
            </p>
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="mt-4 inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.2em] text-western-gold hover:underline"
              >
                Limpar filtros
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-6">
            {filtered.map((p) => (
              <ProductCard key={p.node.id} product={p.node} surface="cream" />
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
      <div className="flex items-baseline justify-between mb-3">
        <p className="text-eyebrow">{eyebrow}</p>
        {subline && (
          <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-western-stone-warm/60">
            {subline}
          </span>
        )}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => {
          const isActive = active.includes(opt.key);
          return (
            <button
              key={opt.key}
              type="button"
              onClick={() => onToggle(opt.key)}
              title={opt.hint}
              aria-pressed={isActive}
              className={cn(
                "px-3 py-1.5 border text-xs transition-colors",
                "font-medium",
                isActive
                  ? "bg-western-green-deep text-western-paper border-western-green-deep"
                  : "bg-western-paper text-western-green-deep border-western-stone-warm/25 hover:border-western-gold hover:text-western-gold"
              )}
            >
              <span className="block leading-tight">{opt.label}</span>
              <span
                className={cn(
                  "block font-mono text-[9px] uppercase tracking-[0.16em] leading-tight mt-0.5",
                  isActive ? "text-western-paper/70" : "text-western-stone-warm/70"
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
