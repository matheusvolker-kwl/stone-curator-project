import { Link } from "react-router-dom";
import type { ShopifyProductNode } from "@/lib/shopify/types";
import { cdnImg, cdnSrcSet } from "@/lib/shopify/client";
import { ArrowRight } from "lucide-react";
import WishlistButton from "./WishlistButton";

interface Props {
  product: ShopifyProductNode;
  surface?: "forest" | "cream";
}

const FINISH_SWATCHES: Record<string, string> = {
  quartzo: "38 35% 86%",
  arenito: "32 36% 65%",
  moledo: "20 30% 45%",
  granito: "140 8% 22%",
};

const DEFAULT_FINISHES = ["Quartzo", "Arenito", "Moledo", "Granito"];

function dimensionFromTitle(t: string): string | null {
  const m = t.match(/(\d+)\s*[x×]\s*(\d+)(?:\s*[x×]\s*(\d+))?/i);
  if (!m) return null;
  return m[3] ? `${m[1]}×${m[2]}×${m[3]} cm` : `${m[1]}×${m[2]} cm`;
}

export default function ProductCard({ product }: Props) {
  const img = product.images.edges[0]?.node;
  const sku = product.variants.edges[0]?.node?.sku ?? "";
  const code = sku.split("-")[1] ?? sku.slice(0, 4).toUpperCase();

  // Detecta acabamentos disponíveis a partir das opções
  const finishOption = product.options.find((o) => /acabament|cor|finish/i.test(o.name));
  const finishes = finishOption?.values?.length ? finishOption.values : DEFAULT_FINISHES;

  // Detecta dimensão a partir do variant title ou do título
  const variantTitle = product.variants.edges[0]?.node?.title ?? "";
  const dim =
    dimensionFromTitle(variantTitle) ||
    dimensionFromTitle(product.title) ||
    null;

  return (
    <Link
      to={`/produtos/${product.handle}`}
      className="group relative flex flex-col bg-white border border-western-stone-warm/10 hover:border-western-gold/60 transition-all duration-300"
    >
      {code && (
        <span className="absolute top-3 right-3 z-10 font-mono text-[10px] uppercase tracking-[0.18em] text-western-gold bg-white/80 px-2 py-1">
          {code}
        </span>
      )}
      <div className="absolute top-3 left-3 z-10 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
        <WishlistButton
          handle={product.handle}
          title={product.title}
          image={img ? cdnImg(img.url, 400) : null}
        />
      </div>

      <div className="aspect-square overflow-hidden bg-western-paper">
        {img ? (
          <img
            src={cdnImg(img.url, 700)}
            srcSet={cdnSrcSet(img.url, [400, 700, 1000])}
            sizes="(min-width: 1024px) 320px, 45vw"
            alt={img.altText ?? product.title}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-contain p-4 transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          />
        ) : (
          <div className="w-full h-full" />
        )}
      </div>

      <div className="flex flex-col gap-2 p-4 md:p-5">
        <h3 className="font-sans text-sm md:text-base font-medium text-western-green-deep leading-snug line-clamp-2">
          {product.title}
        </h3>

        {dim && (
          <p className="text-spec text-western-stone-warm/80 text-xs">{dim}</p>
        )}

        {/* Swatches */}
        <div className="flex items-center gap-1.5 mt-1">
          {finishes.slice(0, 4).map((f) => {
            const key = f.toLowerCase().split(/\s+/)[0];
            const swatch = FINISH_SWATCHES[key] ?? "30 12% 55%";
            return (
              <span
                key={f}
                title={f}
                className="w-3.5 h-3.5 rounded-full ring-1 ring-western-stone-warm/20"
                style={{ backgroundColor: `hsl(${swatch})` }}
              />
            );
          })}
          <span className="ml-auto text-[10px] font-mono uppercase tracking-[0.18em] text-western-stone-warm/70">
            {finishes.length} acabamentos
          </span>
        </div>

        <div className="mt-3 pt-3 border-t border-western-stone-warm/10 flex items-center justify-between">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-western-stone-warm/70">
            Login para preço
          </span>
          <span className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.2em] text-western-green-deep group-hover:text-western-gold transition-colors">
            Ver produto <ArrowRight className="h-3 w-3" />
          </span>
        </div>
      </div>
    </Link>
  );
}
