import { Link } from "react-router-dom";
import type { ShopifyProductNode } from "@/lib/shopify/types";
import { formatBRL } from "@/lib/shopify/client";

interface Props {
  product: ShopifyProductNode;
  surface?: "forest" | "cream";
}

export default function ProductCard({ product, surface = "cream" }: Props) {
  const img = product.images.edges[0]?.node;
  const price = product.priceRange.minVariantPrice;
  const code = (product.variants.edges[0]?.node?.sku ?? "").split("-")[1] ?? "";

  const isCream = surface === "cream";
  const titleColor = isCream
    ? "text-western-green-deep group-hover:text-western-gold"
    : "text-western-cream group-hover:text-western-gold-soft";
  const codeColor = isCream
    ? "text-western-stone-warm"
    : "text-western-cream-muted";
  const muteColor = isCream
    ? "text-western-stone-warm"
    : "text-western-cream-muted";

  return (
    <Link to={`/produtos/${product.handle}`} className="group block">
      <div
        className={`aspect-square mb-5 overflow-hidden ${
          isCream ? "frame-product" : "frame-gallery"
        }`}
      >
        {img ? (
          <img
            src={img.url}
            alt={img.altText ?? product.title}
            loading="lazy"
            className="w-full h-full object-contain p-4 transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          />
        ) : (
          <div className="w-full h-full" />
        )}
      </div>
      <div className="flex items-baseline justify-between gap-4">
        <h3
          className={`font-display text-xl md:text-2xl leading-tight transition-colors ${titleColor}`}
        >
          {product.title}
        </h3>
        {code && <span className={`text-spec ${codeColor}`}>{code}</span>}
      </div>
      <p className={`text-spec mt-1 ${muteColor}`}>
        {formatBRL(price.amount, price.currencyCode)}
      </p>
    </Link>
  );
}
