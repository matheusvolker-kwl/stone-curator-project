import { useMemo, useState, type ReactNode } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowRight, Search, SlidersHorizontal, X } from "lucide-react";
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
import {
  PRODUCT_CATEGORIES,
  findCategory,
  parentCategory,
  type ProductCategory,
} from "@/lib/catalogScenes";
import type { ShopifyProduct } from "@/lib/catalog/types";
import { compareCatalogo, naturalTitleCompare } from "@/lib/lineOrder";
import { buscarProdutos } from "@/lib/search/engine";
import { matchAtalhos } from "@/lib/search/vocab";
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

/** "até 60 cm", "40 cm ou mais", "40–80 cm" — rótulo do chip de filtro ativo. */
function rotuloFaixa(r: Range, absMax: number, unit: string): string {
  if (r.min <= 0) return `até ${r.max} ${unit}`;
  if (r.max >= absMax) return `${r.min} ${unit} ou mais`;
  return `${r.min}–${r.max} ${unit}`;
}

function naCategoria(p: ShopifyProduct, c: ProductCategory): boolean {
  return (p.node.collections?.edges ?? []).some((e) => c.handles.includes(e.node.handle));
}

/** Uma entrada do filtro de categoria. */
interface OpcaoCategoria {
  cat: ProductCategory;
  /** peças desta categoria na página — define se ela aparece */
  total: number;
  /** peças que sobram com a busca e as réguas atuais — decide antes de clicar */
  count: number;
  filhos: OpcaoCategoria[];
}

/** Filtro ativo: tocar remove. */
function ChipAtivo({ children, onRemove }: { children: ReactNode; onRemove: () => void }) {
  return (
    <button
      type="button"
      onClick={onRemove}
      className="inline-flex h-9 items-center gap-1.5 rounded-full border border-western-border-strong bg-white pl-3.5 pr-2.5 font-sans text-[14px] font-semibold text-western-green-deep transition-colors hover:border-western-green-deep"
    >
      {children}
      <X className="h-4 w-4 text-western-stone-warm" aria-hidden="true" />
      <span className="sr-only">(remover filtro)</span>
    </button>
  );
}

export default function ProductGrid({ products, isLoading, emptyLabel }: Props) {
  const [params, setParams] = useSearchParams();

  const q = params.get("q") ?? "";
  const buscando = q.trim().length >= 2;
  const sort = (params.get("sort") as SortKey) || "";
  /* Categoria (dono, 2026-07-18): o filtro mais pedido. O produto já traz as
     coleções dele, então casa por handle. Aceita subcategoria de pedra
     (pedras-pequenas / pedras-medias / pedras-grandes). */
  const cat = params.get("cat") ?? "";
  const catAtual = cat ? findCategory(cat) : undefined;

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

  // Medida/peso uma vez por peça, já na ordem padrão do catálogo — é ela que
  // desempata a relevância da busca e que vale quando não há busca.
  const enriched = useMemo(
    () =>
      [...products]
        .sort((a, b) => compareCatalogo(a.node, b.node))
        .map((p) => ({ ...p, sw: extractSizeWeight(p.node) })),
    [products],
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

  const tamRange = parseRange(params.get("tamanho"), maxCm);
  const pesRange = parseRange(params.get("peso"), maxKg);
  const tamActive = tamRange.min > 0 || tamRange.max < maxCm;
  const pesActive = pesRange.min > 0 || pesRange.max < maxKg;

  const setRange = (key: "tamanho" | "peso", r: Range, absMax: number) => {
    const full = r.min <= 0 && r.max >= absMax;
    update(key, full ? null : `${r.min}-${r.max}`);
  };

  // 1) Busca por relevância: código, nome, acabamento, sinônimo, erro de digitação.
  const buscados = useMemo(
    () => (buscando ? buscarProdutos(q, enriched).map((a) => a.item) : enriched),
    [buscando, q, enriched],
  );

  // 2) Réguas. Faixa estreitada → peça SEM medida sai (não há como posicioná-la
  //    na régua) — foi essa a inconsistência do antigo filtro por bucket.
  const medidos = useMemo(
    () =>
      buscados.filter(
        (p) =>
          (!tamActive ||
            (p.sw.maiorDimensaoCm != null &&
              p.sw.maiorDimensaoCm >= tamRange.min &&
              p.sw.maiorDimensaoCm <= tamRange.max)) &&
          (!pesActive ||
            (p.sw.pesoKg != null && p.sw.pesoKg >= pesRange.min && p.sw.pesoKg <= pesRange.max)),
      ),
    [buscados, tamActive, tamRange.min, tamRange.max, pesActive, pesRange.min, pesRange.max],
  );

  // 3) Categorias presentes NESTA página; a contagem já reflete busca e réguas.
  const opcoes = useMemo(() => {
    const monta = (c: ProductCategory): OpcaoCategoria => ({
      cat: c,
      total: enriched.filter((p) => naCategoria(p, c)).length,
      count: medidos.filter((p) => naCategoria(p, c)).length,
      filhos: (c.children ?? []).map(monta).filter((f) => f.total > 0),
    });
    return PRODUCT_CATEGORIES.map(monta).filter((o) => o.total > 0);
  }, [enriched, medidos]);

  // Numa linha só (ex.: /linhas/pedras-decorativas) o filtro vira as subdivisões dela.
  const soUmaLinha = opcoes.length === 1;
  const lista = soUmaLinha ? opcoes[0].filhos : opcoes;
  const mostraCategorias = lista.length > 1;
  const todasAtiva = !catAtual || (soUmaLinha && catAtual.key === opcoes[0].cat.key);
  const catAtiva = !!catAtual && !todasAtiva;
  // Mãe aberta: a própria categoria ativa, ou a mãe da subcategoria ativa.
  const maeAberta =
    !soUmaLinha && catAtual
      ? catAtual.children?.length
        ? catAtual
        : parentCategory(catAtual.key)
      : undefined;
  const filhosAbertos = maeAberta
    ? (opcoes.find((o) => o.cat.key === maeAberta.key)?.filhos ?? [])
    : [];

  const escolher = (key: string) => {
    if (cat !== key) return update("cat", key);
    // Desmarcar uma subcategoria volta pra mãe ("Grandes" → todas as pedras).
    const mae = parentCategory(key);
    update("cat", mae && !soUmaLinha ? mae.key : null);
  };

  const filtered = useMemo(() => {
    const arr = catAtual ? medidos.filter((p) => naCategoria(p, catAtual)) : [...medidos];
    const preco = (p: (typeof arr)[number]) => parseFloat(p.node.priceRange.minVariantPrice.amount);
    switch (sort) {
      case "az":
        arr.sort((a, b) => naturalTitleCompare(a.node.title, b.node.title));
        break;
      case "za":
        arr.sort((a, b) => naturalTitleCompare(b.node.title, a.node.title));
        break;
      case "price-asc":
        arr.sort((a, b) => preco(a) - preco(b));
        break;
      case "price-desc":
        arr.sort((a, b) => preco(b) - preco(a));
        break;
      // padrão: relevância (com busca) ou a ordem curada do catálogo (sem busca)
    }
    return arr;
  }, [medidos, catAtual, sort]);

  const hasFilters = !!q || catAtiva || tamActive || pesActive;
  const reguasAtivas = (tamActive ? 1 : 0) + (pesActive ? 1 : 0);
  // Mobile: réguas recolhidas pra não empurrar as peças pra baixo da dobra;
  // abertas se a URL já chega com faixa estreitada.
  const [reguasAbertas, setReguasAbertas] = useState(reguasAtivas > 0);
  // Busca de serviço ("projeto 3d") não é peça: o vazio aponta a página certa.
  const atalhos = useMemo(() => (buscando ? matchAtalhos(q, 2) : []), [buscando, q]);

  const campoBusca = (id: string, rotuloVisivel: boolean) => (
    <div>
      <label htmlFor={id} className={rotuloVisivel ? "text-eyebrow mb-3 block" : "sr-only"}>
        Buscar
      </label>
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-western-stone-warm"
          aria-hidden="true"
        />
        <input
          id={id}
          type="search"
          value={q}
          onChange={(e) => update("q", e.target.value || null)}
          placeholder="Nome, código ou acabamento"
          autoComplete="off"
          className="h-control w-full appearance-none rounded-lg border-[1.5px] border-western-border-strong bg-western-paper pl-12 pr-12 font-sans text-[15px] text-western-green-deep transition-colors placeholder:text-western-stone-warm focus:border-western-cta focus:outline-none [&::-webkit-search-cancel-button]:hidden"
        />
        {q && (
          <button
            type="button"
            onClick={() => update("q", null)}
            aria-label="Limpar busca"
            className="absolute right-1.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-md text-western-stone-warm transition-colors hover:text-western-green-deep"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  );

  /* Linha da lista de categorias (desktop) — Balcão: 44px, 15px, contagem à direita. */
  const linhaCls = (on: boolean, vazia: boolean, forte = false) =>
    cn(
      "flex h-11 w-full items-center justify-between gap-3 rounded-md px-3 text-left font-sans text-[15px] transition-colors",
      on
        ? "bg-western-cta font-semibold text-western-cream"
        : vazia
          ? "cursor-default text-western-stone-warm/60"
          : cn("text-western-green-deep hover:bg-western-paper", forte ? "font-semibold" : "font-medium"),
    );
  const contagemCls = (on: boolean) =>
    cn("shrink-0 tabular-nums text-[14px] font-normal", on ? "text-western-cream/75" : "text-western-stone-warm");

  const linhaCategoria = (o: OpcaoCategoria, nivel: 0 | 1): ReactNode => {
    const on = cat === o.cat.key;
    const aberta = maeAberta?.key === o.cat.key;
    const vazia = o.count === 0 && !on;
    return (
      <li key={o.cat.key}>
        <button
          type="button"
          onClick={() => escolher(o.cat.key)}
          aria-pressed={on}
          disabled={vazia}
          className={cn(linhaCls(on, vazia, aberta), nivel === 1 && "pl-4")}
        >
          <span className="truncate">{o.cat.label}</span>
          <span className={contagemCls(on)}>{o.count}</span>
        </button>
        {aberta && o.filhos.length > 0 && (
          <ul className="my-0.5 ml-3 space-y-0.5 border-l border-western-border-soft pl-1.5">
            {o.filhos.map((f) => linhaCategoria(f, 1))}
          </ul>
        )}
      </li>
    );
  };

  /* Pílula (mobile) — uma linha só que rola de lado, sem quebrar em escada. */
  const pilula = (key: string, label: string, count: number, on: boolean, onClick: () => void) => {
    const vazia = count === 0 && !on;
    return (
      <button
        key={key}
        type="button"
        onClick={onClick}
        aria-pressed={on}
        disabled={vazia}
        className={cn(
          "inline-flex h-11 shrink-0 items-center gap-2 rounded-full border px-4 font-sans text-[15px] font-semibold transition-colors",
          on
            ? "border-western-cta bg-western-cta text-western-cream"
            : vazia
              ? "border-western-border-soft bg-white text-western-stone-warm/60"
              : "border-western-border-strong bg-white text-western-green-deep",
        )}
      >
        {label}
        <span className={cn("tabular-nums text-[14px] font-normal", on ? "text-western-cream/70" : "text-western-stone-warm")}>
          {count}
        </span>
      </button>
    );
  };
  const trilhoCls =
    "-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden";

  const reguas = (
    <>
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
      </div>
    </>
  );

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[300px_1fr] lg:gap-12">
      {/* Rail de filtros — desktop. Ordem de uso: buscar, cortar por categoria,
          afinar por medida. Rola sozinho quando passa da altura da tela. */}
      <aside className="hidden space-y-8 rounded-lg border border-western-border-soft bg-white p-6 lg:sticky lg:top-24 lg:block lg:max-h-[calc(100vh-7rem)] lg:self-start lg:overflow-y-auto">
        {campoBusca("busca-catalogo", true)}

        {mostraCategorias && (
          <div>
            <p className="text-eyebrow mb-2">Categoria</p>
            <ul className="space-y-0.5">
              <li>
                <button
                  type="button"
                  onClick={() => update("cat", null)}
                  aria-pressed={todasAtiva}
                  className={linhaCls(todasAtiva, false)}
                >
                  <span>Todas</span>
                  <span className={contagemCls(todasAtiva)}>{medidos.length}</span>
                </button>
              </li>
              {lista.map((o) => linhaCategoria(o, 0))}
            </ul>
          </div>
        )}

        {reguas}
      </aside>

      {/* Resultados */}
      <div className="min-w-0">
        {/* Mobile: busca sempre à vista, categorias numa linha que rola de lado
            e a medida recolhida num botão — as peças começam logo abaixo. */}
        <div className="mb-5 space-y-3 lg:hidden">
          {campoBusca("busca-catalogo-mobile", false)}

          {mostraCategorias && (
            <div className={trilhoCls} role="group" aria-label="Categoria">
              {pilula("todas", "Todas", medidos.length, todasAtiva, () => update("cat", null))}
              {lista.map((o) =>
                pilula(
                  o.cat.key,
                  o.cat.label,
                  o.count,
                  cat === o.cat.key || maeAberta?.key === o.cat.key,
                  () => escolher(o.cat.key),
                ),
              )}
            </div>
          )}
          {filhosAbertos.length > 0 && (
            <div className={trilhoCls} role="group" aria-label={maeAberta?.label}>
              {filhosAbertos.map((f) =>
                pilula(f.cat.key, f.cat.label, f.count, cat === f.cat.key, () => escolher(f.cat.key)),
              )}
            </div>
          )}

          <button
            type="button"
            onClick={() => setReguasAbertas((o) => !o)}
            aria-expanded={reguasAbertas}
            className="btn-outline-forest w-full justify-between bg-white px-5"
          >
            <span className="inline-flex items-center gap-2.5">
              <SlidersHorizontal className="h-5 w-5 text-western-bronze" aria-hidden="true" />
              Tamanho e peso
              {reguasAtivas > 0 && (
                <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-western-cta px-1.5 text-[14px] font-semibold text-western-cream">
                  {reguasAtivas}
                </span>
              )}
            </span>
            <span aria-hidden="true" className="text-[18px] leading-none text-western-stone-warm">
              {reguasAbertas ? "−" : "+"}
            </span>
          </button>
          {reguasAbertas && (
            <div className="space-y-8 rounded-lg border border-western-border-soft bg-white p-5">
              {reguas}
            </div>
          )}
        </div>

        {/* Filtros ativos — cada um sai com um toque; "Limpar tudo" zera. */}
        {hasFilters && (
          <div className="mb-4 flex flex-wrap items-center gap-2">
            {q && <ChipAtivo onRemove={() => update("q", null)}>“{q}”</ChipAtivo>}
            {catAtiva && catAtual && (
              <ChipAtivo onRemove={() => update("cat", null)}>
                {catAtual.fullLabel ?? catAtual.label}
              </ChipAtivo>
            )}
            {tamActive && (
              <ChipAtivo onRemove={() => update("tamanho", null)}>
                Tamanho {rotuloFaixa(tamRange, maxCm, "cm")}
              </ChipAtivo>
            )}
            {pesActive && (
              <ChipAtivo onRemove={() => update("peso", null)}>
                Peso {rotuloFaixa(pesRange, maxKg, "kg")}
              </ChipAtivo>
            )}
            <button
              type="button"
              onClick={clearFilters}
              className="tap-target inline-flex items-center px-2 font-sans text-[14px] font-semibold text-western-cta underline decoration-western-gold underline-offset-4 hover:text-western-green-deep"
            >
              Limpar tudo
            </button>
          </div>
        )}

        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-western-border-soft pb-4">
          <p className="text-spec">
            {isLoading
              ? "Carregando…"
              : `${filtered.length} de ${products.length} ${products.length === 1 ? "peça" : "peças"}`}
          </p>
          <Select
            value={sort || undefined}
            onValueChange={(v) => update("sort", v === "padrao" ? null : v)}
          >
            <SelectTrigger className="h-control w-[200px] rounded-lg border-[1.5px] border-western-border-strong bg-white px-4 font-sans text-[15px] font-semibold text-western-green-deep">
              <SelectValue placeholder={buscando ? "Mais relevantes" : "Ordenar"} />
            </SelectTrigger>
            <SelectContent className="rounded-lg">
              <SelectItem value="padrao" className="text-[15px]">
                {buscando ? "Mais relevantes" : "Ordem do catálogo"}
              </SelectItem>
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
              <div key={i} className="aspect-square animate-pulse rounded-lg bg-western-cream/60" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-lg border border-western-border-soft bg-white px-6 py-14 text-center">
            <p className="text-body">
              {hasFilters
                ? "Nenhuma peça encontrada com os filtros atuais."
                : emptyLabel ?? "Nenhuma peça disponível no momento."}
            </p>
            {atalhos.length > 0 && (
              <div className="mt-5 flex flex-col items-center gap-3">
                {atalhos.map((a) => (
                  <Link key={a.id} to={a.to} className="link-cta">
                    {a.label}
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                ))}
              </div>
            )}
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
