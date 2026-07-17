import { useMemo, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";
import { cdnImg, cdnSrcSet } from "@/lib/catalog/client";
import Lightbox, { type LightboxFoto } from "@/components/shared/Lightbox";

interface ImageNode {
  url: string;
  altText: string | null;
}

interface Props {
  images: ImageNode[];
  activeIndex: number;
  onChange: (idx: number) => void;
  productTitle: string;
}

export default function ProductGallery({
  images,
  activeIndex,
  onChange,
  productTitle,
}: Props) {
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const total = images.length;
  // Pré-carrega a imagem alvo antes de trocar — a troca não pisca.
  const goTo = useCallback(
    (idx: number) => {
      const nx = images[idx];
      if (nx) { const img = new Image(); img.src = cdnImg(nx.url, 1200); }
      onChange(idx);
    },
    [onChange, images]
  );
  const goPrev = useCallback(
    () => goTo((activeIndex - 1 + total) % total),
    [goTo, activeIndex, total]
  );
  const goNext = useCallback(
    () => goTo((activeIndex + 1) % total),
    [goTo, activeIndex, total]
  );

  // Fotos do lightbox compartilhado — mesmo alt da galeria, CDN responsivo.
  const lightboxFotos = useMemo<LightboxFoto[]>(
    () =>
      images.map((img, idx) => ({
        src: cdnImg(img.url, 1200),
        srcSet: cdnSrcSet(img.url, [800, 1200, 2000]),
        sizes: "100vw",
        alt:
          img.altText ??
          (images.length > 1
            ? `${productTitle} — imagem ${idx + 1} de ${images.length}`
            : productTitle),
      })),
    [images, productTitle]
  );

  if (!images.length) return null;
  const current = images[activeIndex];

  return (
    <>
      <div className="relative group">
        <div className="frame-product aspect-square overflow-hidden relative">
          <button
            type="button"
            onClick={() => setLightboxOpen(true)}
            className="absolute inset-0 w-full h-full cursor-zoom-in"
            aria-label="Abrir imagem em tela cheia"
          >
            <img
              key={activeIndex}
              src={cdnImg(current.url, 1200)}
              srcSet={cdnSrcSet(current.url, [600, 1000, 1400])}
              sizes="(min-width: 768px) 50vw, 100vw"
              width={1200}
              height={1200}
              alt={current.altText ?? (total > 1 ? `${productTitle} — imagem ${activeIndex + 1} de ${total}` : productTitle)}
              decoding="async"
              className="w-full h-full object-contain p-4 md:p-8 animate-fade-in pointer-events-none"
            />
          </button>


          {/* Expand hint */}
          <span className="absolute top-3 right-3 inline-flex items-center gap-1.5 px-2 py-1 bg-western-cream/85 border border-western-stone-warm/20 text-[14px] font-semibold uppercase tracking-[0.06em] text-western-green-deep pointer-events-none opacity-70 group-hover:opacity-100 transition-opacity">
            <Maximize2 className="h-3 w-3" /> Ampliar
          </span>

          {/* Counter */}
          {total > 1 && (
            <span className="absolute bottom-3 right-3 px-2 py-1 bg-western-cream/85 border border-western-stone-warm/20 text-[14px] font-semibold uppercase tracking-[0.06em] tabular-nums text-western-stone-warm pointer-events-none">
              {activeIndex + 1} / {total}
            </span>
          )}
        </div>

        {/* Side arrows — sempre visíveis */}
        {total > 1 && (
          <>
            <button
              type="button"
              onClick={goPrev}
              aria-label="Imagem anterior"
              className="absolute z-10 left-2 md:-left-4 top-[58%] md:top-1/2 -translate-y-1/2 h-11 w-11 md:h-11 md:w-11 flex items-center justify-center bg-western-cream border border-western-stone-warm/25 text-western-stone-warm hover:text-western-green-deep hover:border-western-gold transition-colors shadow-sm"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={goNext}
              aria-label="Próxima imagem"
              className="absolute z-10 right-2 md:-right-4 top-[58%] md:top-1/2 -translate-y-1/2 h-11 w-11 md:h-11 md:w-11 flex items-center justify-center bg-western-cream border border-western-stone-warm/25 text-western-stone-warm hover:text-western-green-deep hover:border-western-gold transition-colors shadow-sm"
            >
              <ChevronRight className="h-5 w-5" />
            </button>

          </>
        )}
      </div>

      {/* Thumbs */}
      {total > 1 && (
        <div className="flex gap-3 mt-4 overflow-x-auto scrollbar-hide -mx-2 px-2">
          {images.map((img, idx) => (
            <button
              key={img.url}
              type="button"
              onClick={() => onChange(idx)}
              className={`frame-product w-16 h-16 md:w-20 md:h-20 flex-shrink-0 transition-all ${
                idx === activeIndex
                  ? "ring-2 ring-western-gold ring-offset-2 ring-offset-western-ivory opacity-100"
                  : "opacity-70 hover:opacity-100 hover:ring-1 hover:ring-western-stone-warm/40"
              }`}
              aria-label={`Imagem ${idx + 1}`}
              aria-current={idx === activeIndex}
            >
              <img
                src={cdnImg(img.url, 200)}
                width={80}
                height={80}
                alt=""
                loading="lazy"
                decoding="async"
                className="w-full h-full object-contain p-1"
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox compartilhado (portal Radix, z-overlay) — mesma foto da
          galeria; navegar dentro dele sincroniza thumbs e imagem principal. */}
      <Lightbox
        fotos={lightboxFotos}
        index={lightboxOpen ? activeIndex : null}
        onIndexChange={goTo}
        onClose={() => setLightboxOpen(false)}
        label={productTitle}
        zoomable
      />
    </>
  );
}
