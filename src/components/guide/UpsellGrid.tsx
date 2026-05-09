import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ArrowRight, Loader2, Minus, Plus, Sparkles, TrendingUp, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { fetchProductsByHandles, fetchProduct } from "@/lib/shopify/queries";
import { cdnImg, formatBRL } from "@/lib/shopify/client";
import { buildCartItem, useCartStore } from "@/stores/cartStore";
import {
  complementosPorTipo,
  itensCasaHandles,
  resolveUpgrade,
  nivelMeta,
  type GuideAnswers,
  type Tipo,
} from "@/data/guideMap";

interface Props {
  answers: GuideAnswers;
  precoBase: number;
}

/* ------------------------------------------------------------------ */
/* Layer A — Complementos                                              */
/* ------------------------------------------------------------------ */
function LayerComplementos({ tipo }: { tipo: Tipo }) {
  const handles = complementosPorTipo[tipo];
  const { data: produtos, isLoading } = useQuery({
    queryKey: ["upsell-complementos", tipo],
    queryFn: () => fetchProductsByHandles(handles),
    staleTime: 5 * 60 * 1000,
  });

  const addItem = useCartStore((s) => s.addItem);
  const addBundle = useCartStore((s) => s.addBundle);
  const cartLoading = useCartStore((s) => s.isLoading);
  const [qtys, setQtys] = useState<Record<string, number>>({});

  const setQty = (handle: string, q: number) =>
    setQtys((prev) => ({ ...prev, [handle]: Math.max(1, q) }));

  const totalSelecionado = useMemo(() => {
    if (!produtos) return 0;
    return produtos.reduce((acc, p) => {
      const q = qtys[p.handle] ?? 1;
      const price = parseFloat(p.priceRange.minVariantPrice.amount);
      return acc + price * q;
    }, 0);
  }, [produtos, qtys]);

  const handleAddOne = async (handle: string) => {
    const product = produtos?.find((p) => p.handle === handle);
    if (!product) return;
    const variantId = product.variants.edges[0]?.node.id;
    if (!variantId) return;
    const item = buildCartItem(product, variantId, qtys[handle] ?? 1);
    if (!item) return;
    await addItem(item);
    toast.success(`${product.title} adicionado`, { description: `Qtd ${qtys[handle] ?? 1}` });
    window.dispatchEvent(new CustomEvent("western:open-cart"));
  };

  const handleAddAll = async () => {
    if (!produtos || produtos.length === 0) return;
    const items = produtos
      .map((p) => {
        const variantId = p.variants.edges[0]?.node.id;
        if (!variantId) return null;
        return buildCartItem(p, variantId, qtys[p.handle] ?? 1);
      })
      .filter((i): i is NonNullable<typeof i> => !!i);
    if (items.length === 0) return;
    await addBundle(items);
    toast.success(`${items.length} complementos adicionados`, {
      description: "Frete otimizado em pedido único.",
    });
    window.dispatchEvent(new CustomEvent("western:open-cart"));
  };

  if (!isLoading && (!produtos || produtos.length === 0)) return null;

  return (
    <section className="mt-16">
      <header className="flex flex-wrap items-end justify-between gap-6 mb-8">
        <div className="max-w-2xl">
          <p className="text-eyebrow mb-3">Camada 01 · Complementos</p>
          <h3 className="font-display text-2xl md:text-3xl text-western-green-deep leading-tight mb-2">
            Peças que somam ao conjunto
          </h3>
          <p className="text-sm text-western-stone-warm leading-relaxed">
            Otimizam o frete (pedido único), ampliam a composição e fecham a leitura
            do projeto. Ajuste a quantidade e adicione direto ao orçamento.
          </p>
        </div>
        {produtos && produtos.length > 1 && (
          <button
            type="button"
            onClick={handleAddAll}
            disabled={cartLoading}
            className="btn-outline-forest disabled:opacity-60"
          >
            <Plus className="h-4 w-4" /> Adicionar todos ({formatBRL(totalSelecionado, "BRL")})
          </button>
        )}
      </header>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-5 w-5 animate-spin text-western-stone-warm" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {produtos!.map((p) => {
            const img = p.images.edges[0]?.node.url;
            const price = p.priceRange.minVariantPrice;
            const qty = qtys[p.handle] ?? 1;
            return (
              <article
                key={p.id}
                className="group flex flex-col bg-white border border-western-stone-warm/20 hover:border-western-gold/60 transition-colors"
              >
                <Link
                  to={`/produtos/${p.handle}`}
                  className="aspect-square bg-western-cream/40 overflow-hidden"
                >
                  {img && (
                    <img
                      src={cdnImg(img, 600)}
                      alt={p.title}
                      className="w-full h-full object-contain p-4 group-hover:scale-[1.03] transition-transform duration-500"
                      loading="lazy"
                    />
                  )}
                </Link>
                <div className="flex-1 p-5 flex flex-col gap-3">
                  <Link to={`/produtos/${p.handle}`}>
                    <h4 className="font-display text-lg text-western-green-deep leading-tight">
                      {p.title}
                    </h4>
                  </Link>
                  <p className="text-spec text-western-stone-warm">
                    {formatBRL(price.amount, price.currencyCode)} <span className="opacity-60">/ un.</span>
                  </p>

                  <div className="mt-auto flex items-stretch gap-2">
                    <div className="flex items-center border border-western-stone-warm/30">
                      <button
                        type="button"
                        onClick={() => setQty(p.handle, qty - 1)}
                        className="h-10 w-9 flex items-center justify-center text-western-stone-warm hover:text-western-green-deep"
                        aria-label="Diminuir"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-7 text-center font-mono text-sm text-western-green-deep">
                        {qty}
                      </span>
                      <button
                        type="button"
                        onClick={() => setQty(p.handle, qty + 1)}
                        className="h-10 w-9 flex items-center justify-center text-western-stone-warm hover:text-western-green-deep"
                        aria-label="Aumentar"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleAddOne(p.handle)}
                      disabled={cartLoading}
                      className="flex-1 inline-flex items-center justify-center gap-2 bg-western-green-deep text-western-cream hover:bg-western-green-mid font-mono text-[11px] uppercase tracking-[0.2em] transition-colors disabled:opacity-60"
                    >
                      <Plus className="h-3.5 w-3.5" /> Adicionar
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Layer B — Upgrade                                                   */
/* ------------------------------------------------------------------ */
function LayerUpgrade({
  answers,
  precoBase,
}: {
  answers: GuideAnswers;
  precoBase: number;
}) {
  const upgrade = useMemo(() => resolveUpgrade(answers), [answers]);
  const tipo = answers.tipo as Tipo;
  const proximoNivel = answers.nivel === "essencial" ? "equilibrada" : "completa";
  const meta = upgrade && tipo ? nivelMeta[tipo][proximoNivel] : null;

  const { data: product } = useQuery({
    queryKey: ["upsell-upgrade", upgrade?.handle],
    queryFn: () => (upgrade ? fetchProduct(upgrade.handle) : Promise.resolve(null)),
    enabled: !!upgrade,
    staleTime: 5 * 60 * 1000,
  });

  const addItem = useCartStore((s) => s.addItem);
  const cartLoading = useCartStore((s) => s.isLoading);

  if (!upgrade || !meta) return null;

  const delta = upgrade.preco - precoBase;
  const heroImg = product?.images.edges[0]?.node.url;

  const handleSwap = async () => {
    if (!product) {
      toast.error("Conjunto indisponível. Fale com um consultor.");
      return;
    }
    const variantId = product.variants.edges[0]?.node.id;
    if (!variantId) return;
    const item = buildCartItem(product, variantId, 1);
    if (!item) return;
    await addItem(item);
    toast.success(`Upgrade adicionado: ${upgrade.nome}`, {
      description: "Você pode remover o conjunto base no orçamento, se preferir.",
    });
    window.dispatchEvent(new CustomEvent("western:open-cart"));
  };

  return (
    <section className="mt-16">
      <p className="text-eyebrow mb-3">Camada 02 · Upgrade</p>
      <h3 className="font-display text-2xl md:text-3xl text-western-green-deep leading-tight mb-6">
        Quer levar o projeto a um patamar acima?
      </h3>

      <article className="grid md:grid-cols-[1fr_1.4fr] border border-western-gold/40 bg-western-green-deep text-western-cream overflow-hidden">
        <div className="aspect-square md:aspect-auto bg-western-green-mid overflow-hidden">
          {heroImg ? (
            <img
              src={cdnImg(heroImg, 800)}
              alt={upgrade.nome}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <TrendingUp className="h-10 w-10 text-western-gold/40" />
            </div>
          )}
        </div>
        <div className="p-7 md:p-10 flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-western-gold border border-western-gold/40 px-2.5 py-1">
              <TrendingUp className="h-3 w-3" /> Próximo nível · {meta.label}
            </span>
          </div>
          <h4 className="font-display text-2xl md:text-3xl leading-tight mb-2">
            {upgrade.nome}
          </h4>
          <p className="text-sm text-western-cream/75 mb-5">{meta.tagline}</p>
          <p className="text-sm text-western-cream/85 leading-relaxed mb-6">{meta.detalhe}</p>

          <div className="flex items-baseline gap-3 flex-wrap mb-1">
            <span className="font-display text-3xl text-western-gold">
              {formatBRL(upgrade.preco, "BRL")}
            </span>
            {delta > 0 && (
              <span className="font-mono text-xs uppercase tracking-[0.18em] text-western-cream/70">
                +{formatBRL(delta, "BRL")} vs. base
              </span>
            )}
          </div>
          <p className="text-xs text-western-cream/60 mb-7">{meta.pecas} · {meta.faixaPreco}</p>

          <div className="mt-auto flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={handleSwap}
              disabled={cartLoading || !product}
              className="inline-flex items-center justify-center gap-2 h-11 px-5 bg-western-gold text-western-green-deep hover:bg-western-gold/90 font-mono text-xs uppercase tracking-[0.22em] transition-colors disabled:opacity-60"
            >
              <ShoppingBag className="h-4 w-4" /> Adicionar upgrade ao orçamento
            </button>
            <Link
              to={`/produtos/${upgrade.handle}`}
              className="inline-flex items-center justify-center gap-2 h-11 px-4 border border-western-cream/30 text-western-cream hover:border-western-gold hover:text-western-gold font-mono text-xs uppercase tracking-[0.22em] transition-colors"
            >
              Ver detalhes <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </article>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Layer C — Itens autorais da casa                                    */
/* ------------------------------------------------------------------ */
function LayerCasa() {
  const { data: produtos, isLoading } = useQuery({
    queryKey: ["upsell-casa"],
    queryFn: () => fetchProductsByHandles(itensCasaHandles),
    staleTime: 10 * 60 * 1000,
  });

  const addItem = useCartStore((s) => s.addItem);
  const cartLoading = useCartStore((s) => s.isLoading);

  const handleAdd = async (handle: string) => {
    const product = produtos?.find((p) => p.handle === handle);
    if (!product) return;
    const variantId = product.variants.edges[0]?.node.id;
    if (!variantId) return;
    const item = buildCartItem(product, variantId, 1);
    if (!item) return;
    await addItem(item);
    toast.success(`${product.title} adicionado`);
    window.dispatchEvent(new CustomEvent("western:open-cart"));
  };

  if (!isLoading && (!produtos || produtos.length === 0)) return null;

  return (
    <section className="mt-16 pt-16 border-t border-western-stone-warm/20">
      <header className="max-w-2xl mb-8">
        <p className="text-eyebrow mb-3">Camada 03 · Assinatura Western</p>
        <h3 className="font-display text-2xl md:text-3xl text-western-green-deep leading-tight mb-2">
          Itens autorais da casa
        </h3>
        <p className="text-sm text-western-stone-warm leading-relaxed">
          Peças exclusivas que viram presente para o cliente final, ponto focal de
          living e geram margem expressiva para revenda especificada.
        </p>
      </header>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-5 w-5 animate-spin text-western-stone-warm" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {produtos!.map((p) => {
            const img = p.images.edges[0]?.node.url;
            const price = p.priceRange.minVariantPrice;
            return (
              <article
                key={p.id}
                className="group flex flex-col bg-western-cream/40 border border-western-stone-warm/20 hover:border-western-gold/60 transition-colors"
              >
                <Link to={`/produtos/${p.handle}`} className="aspect-[4/5] overflow-hidden">
                  {img && (
                    <img
                      src={cdnImg(img, 700)}
                      alt={p.title}
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                      loading="lazy"
                    />
                  )}
                </Link>
                <div className="flex-1 p-5 flex flex-col gap-3">
                  <span className="inline-flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.22em] text-western-gold w-fit">
                    <Sparkles className="h-3 w-3" /> Edição autoral
                  </span>
                  <Link to={`/produtos/${p.handle}`}>
                    <h4 className="font-display text-lg text-western-green-deep leading-tight">
                      {p.title}
                    </h4>
                  </Link>
                  <p className="text-spec text-western-stone-warm">
                    {formatBRL(price.amount, price.currencyCode)}
                  </p>
                  <button
                    type="button"
                    onClick={() => handleAdd(p.handle)}
                    disabled={cartLoading}
                    className="mt-auto inline-flex items-center justify-center gap-2 h-10 border border-western-green-deep text-western-green-deep hover:bg-western-green-deep hover:text-western-cream font-mono text-[11px] uppercase tracking-[0.22em] transition-colors disabled:opacity-60"
                  >
                    <Plus className="h-3.5 w-3.5" /> Somar ao orçamento
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Orquestrador                                                        */
/* ------------------------------------------------------------------ */
export default function UpsellGrid({ answers, precoBase }: Props) {
  const tipo = answers.tipo as Tipo | undefined;
  if (!tipo) return null;

  return (
    <div className="mt-20 pt-12 border-t border-western-stone-warm/20">
      <div className="max-w-3xl mb-2">
        <p className="text-eyebrow mb-4">Complete sua composição</p>
        <h2 className="font-display text-3xl md:text-4xl text-western-green-deep leading-tight mb-3">
          Três caminhos para fechar o projeto
        </h2>
        <p className="text-western-stone-warm leading-relaxed">
          Adicione complementos no mesmo pedido, leve o conjunto a um patamar superior
          ou inclua peças autorais que diferenciam a especificação.
        </p>
      </div>

      <LayerComplementos tipo={tipo} />
      <LayerUpgrade answers={answers} precoBase={precoBase} />
      <LayerCasa />
    </div>
  );
}
