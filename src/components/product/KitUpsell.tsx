import { useState } from "react";
import { Check, Layers } from "lucide-react";
import type { ShopifyProductNode, ShopifyVariant } from "@/lib/catalog/types";
import { formatBRL } from "@/lib/catalog/client";
import { useCartStore, type CartItem } from "@/stores/cartStore";
import { KIT_BY_BASE_PRODUCT, KIT_UPSELL_ENABLED } from "@/data/kits";

interface Props {
  product: ShopifyProductNode;
  /** Variante resolvida (acabamento escolhido). O upsell só aparece pós-decisão. */
  variant: ShopifyVariant | null;
}

/**
 * Upsell pós-quantidade (C-refinado): "Leve 3, −10%" — adiciona o KIT
 * (Product Bundle do Woo) ao pedido, herdando o acabamento escolhido.
 * Não é toggle concorrente: vive abaixo do CTA principal, discreto.
 */
export default function KitUpsell({ product, variant }: Props) {
  const addItem = useCartStore((s) => s.addItem);
  const [added, setAdded] = useState(false);

  if (!KIT_UPSELL_ENABLED || !variant) return null;
  const kit = variant.wooParentProductId
    ? KIT_BY_BASE_PRODUCT[variant.wooParentProductId]
    : undefined;
  if (!kit) return null;

  const unit = parseFloat(variant.price.amount);
  if (!Number.isFinite(unit) || unit <= 0) return null;

  const full = unit * kit.units;
  const kitPrice = full * (1 - kit.discountPct / 100);
  const acabamento = variant.selectedOptions.find((o) =>
    /acabament/i.test(o.name),
  )?.value;

  const handleAddKit = () => {
    const item: CartItem = {
      productHandle: product.handle,
      productTitle: kit.kitTitle,
      productImage: product.images.edges[0]?.node?.url ?? null,
      variantId: `gid://woo/kit/${kit.kitProductId}/${acabamento ?? "unico"}`,
      variantTitle: acabamento ? `Acabamento ${acabamento}` : "",
      sku: variant.sku ? `KIT-${variant.sku}` : null,
      price: { amount: kitPrice.toFixed(2), currencyCode: variant.price.currencyCode },
      quantity: 1,
      selectedOptions: acabamento ? [{ name: "Acabamento", value: acabamento }] : [],
      wooParentProductId: kit.kitProductId,
      wooVariationId: null,
      wooKind: "bundle",
      wooAttributes: [],
      wooBundleConfig: [
        {
          bundled_item_id: kit.bundledItemId,
          quantity: kit.units,
          variation_id: variant.wooVariationId ?? null,
          attributes: variant.wooAttributes ?? [],
        },
      ],
      collectionHandle: product.collections?.edges?.[0]?.node?.handle,
    };
    addItem(item);
    setAdded(true);
    // Toast único (com "Ver") vive no cartStore; aqui só o estado visual do botão.
    window.setTimeout(() => setAdded(false), 3500);
  };

  return (
    <div className="mt-4 border border-western-gold/35 bg-western-gold/[0.06] p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[14px] font-semibold uppercase tracking-[0.06em] text-western-gold flex items-center gap-1.5">
            <Layers className="h-3.5 w-3.5" /> Leve 3 · economize {kit.discountPct}%
          </p>
          <p className="mt-2 font-sans text-sm text-western-green-deep">
            {kit.kitTitle}
            {acabamento ? ` — ${acabamento}` : ""}
          </p>
          <p className="mt-1 font-sans text-sm">
            <span className="text-western-stone-warm line-through mr-2">{formatBRL(full)}</span>
            <span className="font-semibold text-western-green-deep">{formatBRL(kitPrice)}</span>
          </p>
        </div>
        <button
          type="button"
          onClick={handleAddKit}
          className="h-11 px-4 rounded-[10px] border border-western-gold text-western-green-deep hover:bg-western-gold/15 font-semibold text-[14px] uppercase tracking-[0.06em] transition-colors inline-flex items-center gap-2 flex-shrink-0"
        >
          {added ? (
            <>
              <Check className="h-3.5 w-3.5 text-western-gold" /> No pedido
            </>
          ) : (
            "Adicionar kit"
          )}
        </button>
      </div>
    </div>
  );
}
