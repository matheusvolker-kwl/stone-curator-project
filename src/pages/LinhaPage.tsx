import { useParams, Link, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchCollection } from "@/lib/shopify/queries";
import ProductCard from "@/components/product/ProductCard";
import { ChevronLeft, Search, X } from "lucide-react";
import { useMemo } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BUSINESS } from "@/config/business";

const FINISHES = [
  { key: "quartzo", label: "Quartzo", swatch: "38 35% 86%" },
  { key: "arenito", label: "Arenito", swatch: "32 36% 65%" },
  { key: "moledo", label: "Moledo", swatch: "20 30% 45%" },
  { key: "granito", label: "Granito", swatch: "140 8% 22%" },
];

type SortKey = "featured" | "az" | "za" | "price-asc" | "price-desc";

export default function LinhaPage() {
  const { handle = "" } = useParams();
  const [params, setParams] = useSearchParams();

  const { data, isLoading } = useQuery({
    queryKey: ["collection", handle],
    queryFn: () => fetchCollection(handle, 100),
    enabled: !!handle,
  });

  const q = params.get("q") ?? "";
  const sort = (params.get("sort") as SortKey) || "featured";
  const activeFinishes = (params.get("acabamento") ?? "")
    .split(",")
    .filter(Boolean);

  const update = (key: string, value: string | null) => {
    const next = new URLSearchParams(params);
    if (value && value.length) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  };

  const toggleFinish = (key: string) => {
    const set = new Set(activeFinishes);
    set.has(key) ? set.delete(key) : set.add(key);
    update("acabamento", set.size ? Array.from(set).join(",") : null);
  };

  const clearFilters = () => setParams(new URLSearchParams(), { replace: true });

  const all = data?.products?.edges ?? [];

  const filtered = useMemo(() => {
    let list = all;
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
    if (activeFinishes.length) {
      list = list.filter((p) => {
        const opt = p.node.options.find((o) =>
          /acabament|cor|finish/i.test(o.name)
        );
        const vals = (opt?.values ?? []).map((v) => v.toLowerCase());
        return activeFinishes.every((f) => vals.some((v) => v.includes(f)));
      });
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
  }, [all, q, activeFinishes, sort]);

  if (!isLoading && !data) {
    return (
      <div className="surface-ivory">
        <div className="container-western py-32 text-center">
          <h1 className="font-display text-4xl text-western-green-deep">
            Linha não encontrada
          </h1>
          <Link to="/linhas" className="link-underline mt-6 inline-block text-western-gold">
            Ver todas as linhas
          </Link>
        </div>
      </div>
    );
  }

  const hasFilters = q || activeFinishes.length > 0;

  return (
    <div className="surface-ivory">
      <div className="container-western py-10 md:py-16">
        <Link
          to="/linhas"
          className="inline-flex items-center gap-2 text-western-stone-warm hover:text-western-gold transition-colors font-mono text-xs uppercase tracking-[0.2em] mb-8"
        >
          <ChevronLeft className="h-4 w-4" /> Linhas
        </Link>

        <div className="max-w-3xl mb-10 md:mb-14">
          <p className="text-eyebrow mb-4">Linha</p>
          <div className="w-12 h-px bg-western-gold mb-6" />
          <h1 className="font-display text-4xl md:text-5xl text-western-green-deep leading-[1.05]">
            {data?.title ?? "—"}
          </h1>
          {data?.description && (
            <p className="mt-5 text-western-stone-warm leading-relaxed">
              {data.description}
            </p>
          )}
        </div>

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

            <div>
              <p className="text-eyebrow mb-3">Acabamento</p>
              <div className="space-y-2.5">
                {FINISHES.map((f) => {
                  const checked = activeFinishes.includes(f.key);
                  return (
                    <label
                      key={f.key}
                      className="flex items-center gap-3 cursor-pointer group"
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={() => toggleFinish(f.key)}
                      />
                      <span
                        className="w-4 h-4 rounded-full ring-1 ring-western-stone-warm/20"
                        style={{ backgroundColor: `hsl(${f.swatch})` }}
                      />
                      <span className="text-sm text-western-green-deep group-hover:text-western-gold transition-colors">
                        {f.label}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="pt-2 border-t border-western-stone-warm/15 space-y-3">
              <p className="text-spec text-western-stone-warm/80 text-xs leading-relaxed">
                Pedido mínimo {BUSINESS.pedidoMinimoLabel} · produção {BUSINESS.prazoProducaoDias} dias úteis após confirmação.
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

          {/* Results */}
          <div>
            <div className="flex items-center justify-between gap-4 mb-6 pb-4 border-b border-western-stone-warm/15 flex-wrap">
              <p className="text-spec text-western-stone-warm">
                {isLoading
                  ? "Carregando…"
                  : `${filtered.length} de ${all.length} ${all.length === 1 ? "peça" : "peças"}`}
              </p>
              <Select
                value={sort}
                onValueChange={(v) => update("sort", v === "featured" ? null : v)}
              >
                <SelectTrigger className="w-[200px] h-9 rounded-none border-western-stone-warm/25 bg-white font-mono text-xs uppercase tracking-[0.18em] text-western-green-deep">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-none">
                  <SelectItem value="featured">Mais especificados</SelectItem>
                  <SelectItem value="az">Nome A–Z</SelectItem>
                  <SelectItem value="za">Nome Z–A</SelectItem>
                  <SelectItem value="price-asc">Menor preço</SelectItem>
                  <SelectItem value="price-desc">Maior preço</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
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
                  Nenhuma peça encontrada com os filtros atuais.
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
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filtered.map((p) => (
                  <ProductCard key={p.node.id} product={p.node} surface="cream" />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
