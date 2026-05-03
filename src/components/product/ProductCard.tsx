import { Link } from "react-router-dom";
import type { ShopifyProductNode } from "@/lib/shopify/types";
import { formatBRL } from "@/lib/shopify/client";

export default function ProductCard({ product }: { product: ShopifyProductNode }) {
  const img = product.images.edges[0]?.node;
  const price = product.priceRange.minVariantPrice;
  const code = (product.variants.edges[0]?.node?.sku ?? "").split("-")[1] ?? "";

  return (
    <Link
      to={`/produtos/${product.handle}`}
      className="group block hairline-top"
    >
      <div className="frame-gallery aspect-square mb-5 overflow-hidden">
        {img ? (
          <img
            src={img.url}
            alt={img.altText ?? product.title}
            loading="lazy"
            className="w-full h-full object-contain p-6 transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          />
        ) : (
          <div className="w-full h-full bg-western-cream-muted/30" />
        )}
      </div>
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="font-display text-xl md:text-2xl leading-tight text-western-cream group-hover:text-western-gold-soft transition-colors">
          {product.title}
        </h3>
        {code && <span className="text-spec text-western-cream-muted">{code}</span>}
      </div>
      <p className="text-spec text-western-cream-muted mt-1">
        {formatBRL(price.amount, price.currencyCode)}
      </p>
    </Link>
  );
}
