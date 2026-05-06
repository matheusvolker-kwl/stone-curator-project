import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { fetchProducts } from "@/lib/shopify/queries";
import { cdnImg, formatBRL } from "@/lib/shopify/client";
import { buildCartItem, useCartStore } from "@/stores/cartStore";
import type { Tipo } from "@/data/guideMap";

// Termos de busca por tipo — Shopify Storefront search syntax
const queryByTipo: Record<Tipo, string> = {
  lago: "tag:lago OR tag:cascata OR tag:pedra-led",
  piscina: "tag:piscina OR tag:cascata OR tag:pedra-led",
  jardim: "tag:jardim OR tag:fonte OR tag:pisada",
};

export default function UpsellGrid({ tipo }: { tipo: Tipo }) {
  const { data: produtos, isLoading } = useQuery({
    queryKey: ["upsell", tipo],
    queryFn: async () => {
      const edges = await fetchProducts(8, queryByTipo[tipo]);
      // Filtra fora os "conjuntos" — queremos peças avulsas no upsell
      return edges
        .map((e) => e.node)
        .filter((p) => !/conjunto/i.test(p.handle))
        .slice(0, 6);
    },
    staleTime: 5 * 60 * 1000,
  });

  const addItem = useCartStore((s) => s.addItem);
  const cartLoading = useCartStore((s) => s.isLoading);

  const handleAdd = async (productHandle: string) => {
    const product = produtos?.find((p) => p.handle === productHandle);
    if (!product) return;
    const variantId = product.variants.edges[0]?.node.id;
    if (!variantId) return;
    const item = buildCartItem(product, variantId, 1);
    if (!item) return;
    await addItem(item);
    toast.success(`${product.title} adicionado ao orçamento`);
    window.dispatchEvent(new CustomEvent("western:open-cart"));
  };

  if (!isLoading && (!produtos || produtos.length === 0)) return null;

  return (
    <section className="mt-20 pt-16 border-t border-western-stone-warm/20">
      <div className="max-w-3xl mb-10">
        <p className="text-eyebrow mb-4">Complete sua composição</p>
        <h2 className="font-display text-3xl md:text-4xl text-western-green-deep leading-tight mb-3">
          Peças que combinam com este conjunto
        </h2>
        <p className="text-western-stone-warm leading-relaxed">
          Otimizam o frete, ampliam a composição e conversam com a estética do
          conjunto recomendado.
        </p>
      </div>

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
                className="group flex flex-col bg-white border border-western-stone-warm/20 hover:border-western-gold/60 transition-colors overflow-hidden"
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
                  <Link to={`/produtos/${p.handle}`} className="block">
                    <h3 className="font-display text-lg text-western-green-deep leading-tight">
                      {p.title}
                    </h3>
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
                    <Plus className="h-3.5 w-3.5" /> Adicionar
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
