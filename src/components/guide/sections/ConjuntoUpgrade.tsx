import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Check, Plus, RefreshCw, Sparkles, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import {
  nivelMeta,
  resolveUpgrade,
  type ConjuntoLeaf,
  type GuideAnswers,
  type Tipo,
} from "@/data/guideMap";
import { fetchProduct } from "@/lib/shopify/queries";
import { cdnImg } from "@/lib/shopify/client";
import { buildCartItem, useCartStore } from "@/stores/cartStore";
import GatedPrice from "@/components/shared/GatedPrice";

interface Props {
  conjunto: ConjuntoLeaf;
  answers: GuideAnswers;
  acabamento: string;
}

export default function ConjuntoUpgrade({ conjunto, answers, acabamento }: Props) {
  const { data: baseProduct } = useQuery({
    queryKey: ["guide-product", conjunto.handle],
    queryFn: () => fetchProduct(conjunto.handle),
    retry: false,
  });
  const baseVariant = baseProduct?.variants.edges.find((e) =>
    e.node.selectedOptions.some(
      (o) => /acabamento/i.test(o.name) && o.value.toLowerCase() === acabamento.toLowerCase()
    )
  )?.node ?? baseProduct?.variants.edges[0]?.node ?? null;
  const basePrice = baseVariant ? parseFloat(baseVariant.price.amount) : conjunto.preco;
  const upgrade = useMemo(() => resolveUpgrade(answers), [answers]);
  const tipo = answers.tipo as Tipo | undefined;
  const nivelAtual = answers.nivel ?? "essencial";
  const proximoNivel = nivelAtual === "essencial" ? "equilibrada" : "completa";
  const metaUp = upgrade && tipo ? nivelMeta[tipo][proximoNivel] : null;
  const metaAtual = tipo ? nivelMeta[tipo][nivelAtual] : null;

  const addItem = useCartStore((s) => s.addItem);
  const removeItem = useCartStore((s) => s.removeItem);
  const cartItems = useCartStore((s) => s.items);
  const cartLoading = useCartStore((s) => s.isLoading);

  const { data: upProduct } = useQuery({
    queryKey: ["upsell-upgrade", upgrade?.handle],
    queryFn: () => (upgrade ? fetchProduct(upgrade.handle) : Promise.resolve(null)),
    enabled: !!upgrade,
    staleTime: 5 * 60 * 1000,
  });

  if (!upgrade || !metaUp) return null;

  const upInCart = cartItems.some((i) => i.productHandle === upgrade.handle);
  const baseAdded = cartItems.some((i) => i.productHandle === conjunto.handle);
  const upImg = upProduct?.images.edges[0]?.node.url;
  const delta = upgrade.preco - basePrice;

  const swapBaseForUpgrade = async () => {
    if (!upProduct) return;
    const variantId = upProduct.variants.edges[0]?.node.id;
    if (!variantId) return;
    const item = buildCartItem(upProduct, variantId, 1);
    if (!item) return;
    const baseLines = cartItems.filter((i) => i.productHandle === conjunto.handle);
    for (const line of baseLines) await removeItem(line.variantId);
    await addItem(item);
    toast.success(`Upgrade aplicado: ${upgrade.nome}`, { description: "Conjunto base substituído." });
  };

  const addUpgradeOnly = async () => {
    if (!upProduct) return;
    const variantId = upProduct.variants.edges[0]?.node.id;
    if (!variantId) return;
    const item = buildCartItem(upProduct, variantId, 1);
    if (!item) return;
    await addItem(item);
    toast.success(`Upgrade adicionado: ${upgrade.nome}`);
  };

  return (
    <section id="upgrade" className="scroll-mt-32">
      <div className="relative bg-western-green-deep text-western-cream border border-western-gold/40 overflow-hidden">
        <div className="absolute -top-3 left-5 z-10">
          <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.22em] bg-western-gold text-western-green-deep px-2.5 py-1">
            <TrendingUp className="h-3 w-3" /> Suba de patamar
          </span>
        </div>

        <div className="grid sm:grid-cols-[40%_1fr] gap-0">
          {/* Imagem do upgrade */}
          <div className="relative aspect-square sm:aspect-auto bg-western-green-mid overflow-hidden">
            {upImg ? (
              <img
                src={cdnImg(upImg, 700)}
                alt={upgrade.nome}
                className="absolute inset-0 w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-western-green-mid to-western-green-deep" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-western-green-deep/60 via-transparent to-transparent" />
            <div className="absolute bottom-3 left-3 right-3">
              <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-western-gold mb-1">
                Versão {metaUp.label}
              </p>
              <p className="font-display text-base text-western-cream leading-tight">
                {upgrade.nome}
              </p>
            </div>
          </div>

          {/* Conteúdo */}
          <div className="p-6 md:p-7 flex flex-col gap-4">
            <div>
              <p className="text-eyebrow text-western-gold mb-2">Vale a pena ir além</p>
              <h3 className="font-display text-xl md:text-2xl text-western-cream leading-tight mb-2">
                Quer levar o projeto a um patamar acima?
              </h3>
              <p className="text-sm text-western-cream/75 leading-relaxed">
                {metaUp.pecas}
              </p>
            </div>

            {/* Comparativo */}
            <div className="grid grid-cols-2 gap-3 py-3 border-y border-western-cream/15">
              <div>
                <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-western-cream/50 mb-1">
                  Você está em
                </p>
                <p className="font-display text-sm text-western-cream/85 leading-tight">
                  {metaAtual?.label ?? "Base"}
                </p>
                <GatedPrice
                  amount={basePrice}
                  currency="BRL"
                  className="font-mono text-[10px] uppercase tracking-[0.18em] text-western-cream/60 mt-1"
                />
              </div>
              <div className="border-l border-western-cream/15 pl-3">
                <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-western-gold mb-1">
                  Indo para
                </p>
                <p className="font-display text-sm text-western-gold leading-tight">
                  {metaUp.label}
                </p>
                <GatedPrice
                  amount={upgrade.preco}
                  currency="BRL"
                  className="font-mono text-[10px] uppercase tracking-[0.18em] text-western-gold/90 mt-1"
                />
              </div>
            </div>

            {delta > 0 && (
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-western-cream/70">
                Diferença · <GatedPrice amount={delta} currency="BRL" className="inline text-western-gold" />
              </p>
            )}

            <div className="flex flex-col sm:flex-row gap-2 mt-auto">
              <button
                type="button"
                onClick={baseAdded ? swapBaseForUpgrade : addUpgradeOnly}
                disabled={cartLoading || !upProduct}
                className="flex-1 inline-flex items-center justify-center gap-2 h-11 bg-western-gold text-western-green-deep hover:bg-western-gold/90 font-mono text-[11px] uppercase tracking-[0.22em] transition-colors disabled:opacity-60"
              >
                {upInCart ? (
                  <><Check className="h-3.5 w-3.5" /> Upgrade no projeto</>
                ) : baseAdded ? (
                  <><RefreshCw className="h-3.5 w-3.5" /> Trocar base pelo upgrade</>
                ) : (
                  <><Sparkles className="h-3.5 w-3.5" /> Aplicar upgrade</>
                )}
              </button>
              {baseAdded && !upInCart && (
                <button
                  type="button"
                  onClick={addUpgradeOnly}
                  disabled={cartLoading || !upProduct}
                  className="inline-flex items-center justify-center gap-2 h-11 px-4 border border-western-cream/30 text-western-cream/85 hover:border-western-gold hover:text-western-gold font-mono text-[10px] uppercase tracking-[0.2em] transition-colors disabled:opacity-60"
                >
                  <Plus className="h-3.5 w-3.5" /> Somar
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
