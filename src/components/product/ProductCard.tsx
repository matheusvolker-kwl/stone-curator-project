import { Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import type { ShopifyProductNode } from "@/lib/catalog/types";
import { cdnImg, cdnSrcSet } from "@/lib/catalog/client";
import { fetchProduct } from "@/lib/datasource";
import { ArrowRight } from "lucide-react";
import WishlistButton from "./WishlistButton";
import GatedPrice from "@/components/shared/GatedPrice";

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
  const linha = product.collections?.edges?.[0]?.node?.title ?? null;
  const queryClient = useQueryClient();

  // Detecta acabamentos disponíveis a partir das opções
  const finishOption = product.options.find((o) => /acabament|cor|finish/i.test(o.name));
  const finishes = finishOption?.values?.length ? finishOption.values : DEFAULT_FINISHES;

  // Detecta dimensão a partir do variant title ou do título
  const variantTitle = product.variants.edges[0]?.node?.title ?? "";
  const dim =
    dimensionFromTitle(variantTitle) ||
    dimensionFromTitle(product.title) ||
    null;

  // Prefetch do PDP no hover/focus — clique fica instantâneo
  const prefetch = () => {
    queryClient.prefetchQuery({
      queryKey: ["product", product.handle],
      queryFn: () => fetchProduct(product.handle),
      staleTime: 1000 * 60 * 5,
    });
  };

  return (
    <Link
      to={`/produtos/${product.handle}`}
      onMouseEnter={prefetch}
      onFocus={prefetch}
      onTouchStart={prefetch}
      className="group relative flex flex-col overflow-hidden rounded-lg border border-western-border-soft bg-white shadow-[0_2px_10px_-6px_hsl(var(--western-stone-dark)/0.25)] transition-shadow duration-200 hover:shadow-[0_14px_30px_-16px_hsl(var(--western-stone-dark)/0.35)]"
    >
      {code && (
        <span className="absolute top-3 right-3 z-10 rounded-sm bg-white/90 px-2 py-0.5 font-sans text-[14px] font-semibold uppercase tracking-[0.06em] text-western-bronze">
          {code}
        </span>
      )}

      {/* Favoritar: sempre visível no toque (não há hover no celular) */}
      <div className="absolute top-3 left-3 z-10 transition-opacity md:opacity-0 md:group-hover:opacity-100 md:focus-within:opacity-100">
        <WishlistButton
          handle={product.handle}
          title={product.title}
          image={img ? cdnImg(img.url, 400) : null}
          className="h-12 w-12 rounded-lg"
        />
      </div>

      <div className="aspect-square overflow-hidden bg-western-paper">
        {img ? (
          <img
            src={cdnImg(img.url, 700)}
            srcSet={cdnSrcSet(img.url, [400, 700, 1000])}
            sizes="(min-width: 1024px) 320px, 45vw"
            width={700}
            height={700}
            alt={img.altText || product.title}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-contain p-4 transition-transform duration-500 ease-out group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-western-cream/60 text-[14px] font-semibold text-western-stone-warm">
            Foto da peça
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4 md:p-5">
        {linha && <p className="text-meta">{linha}</p>}

        <h3 className="font-sans text-[20px] font-semibold leading-[1.25] text-western-green-deep line-clamp-2 group-hover:underline group-hover:decoration-western-gold group-hover:underline-offset-4">
          {product.title}
        </h3>

        {dim && <p className="text-meta">{dim}</p>}

        {/* Acabamentos — tamanho fixo + shrink-0: no celular os swatches
            colapsavam em barras porque o flex os espremia. */}
        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1.5">
          <span className="flex shrink-0 items-center gap-1.5">
            {finishes.slice(0, 4).map((f) => {
              const key = f.toLowerCase().split(/\s+/)[0];
              const swatch = FINISH_SWATCHES[key] ?? "30 12% 55%";
              return (
                <span
                  key={f}
                  title={f}
                  aria-hidden="true"
                  className="h-4 w-4 shrink-0 rounded-full ring-1 ring-western-border-strong"
                  style={{ backgroundColor: `hsl(${swatch})` }}
                />
              );
            })}
          </span>
          <span className="text-meta">
            {finishes.length} {finishes.length === 1 ? "acabamento" : "acabamentos"}
          </span>
        </div>

        <div className="mt-auto flex flex-col gap-2 border-t border-western-border-soft pt-3">
          <GatedPrice
            amount={product.priceRange.minVariantPrice.amount}
            currency={product.priceRange.minVariantPrice.currencyCode}
            className="font-sans text-[20px] font-bold tabular-nums text-western-green-deep"
            linked={false}
          />
          <span className="inline-flex items-center gap-1.5 font-sans text-[16px] font-semibold text-western-cta transition-colors group-hover:text-western-green-deep">
            Ver a peça
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
