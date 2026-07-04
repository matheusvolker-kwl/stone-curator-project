import { useEffect, useRef, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, X, Maximize2 } from "lucide-react";
import { cdnImg, cdnSrcSet } from "@/lib/catalog/client";

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
  const [zoomed, setZoomed] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const openedOnceRef = useRef(false);


  const total = images.length;
  const goPrev = useCallback(
    () => onChange((activeIndex - 1 + total) % total),
    [activeIndex, total, onChange]
  );
  const goNext = useCallback(
    () => onChange((activeIndex + 1) % total),
    [activeIndex, total, onChange]
  );

  // Keyboard nav + focus-trap when lightbox open
  useEffect(() => {
    if (!lightboxOpen) return;
    const getFocusables = (): HTMLElement[] => {
      const root = dialogRef.current;
      if (!root) return [];
      const nodes = root.querySelectorAll<HTMLElement>(
        'button,[href],[tabindex]:not([tabindex="-1"])',
      );
      return Array.from(nodes).filter(
        (el) => !el.hasAttribute("disabled") && el.offsetParent !== null,
      );
    };
    // Move focus into the dialog on open
    const focusables = getFocusables();
    (focusables[0] ?? dialogRef.current)?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setLightboxOpen(false);
        return;
      }
      if (e.key === "ArrowLeft") {
        goPrev();
        return;
      }
      if (e.key === "ArrowRight") {
        goNext();
        return;
      }
      if (e.key === "Tab") {
        const items = getFocusables();
        if (items.length === 0) {
          e.preventDefault();
          dialogRef.current?.focus();
          return;
        }
        const first = items[0];
        const last = items[items.length - 1];
        const active = document.activeElement as HTMLElement | null;
        if (e.shiftKey) {
          if (active === first || !dialogRef.current?.contains(active)) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (active === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxOpen, goPrev, goNext]);

  // Return focus to trigger when closing
  useEffect(() => {
    if (lightboxOpen) {
      openedOnceRef.current = true;
    } else if (openedOnceRef.current) {
      triggerRef.current?.focus();
    }
  }, [lightboxOpen]);

  // Lock body scroll when lightbox open
  useEffect(() => {

    if (lightboxOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [lightboxOpen]);

  if (!images.length) return null;
  const current = images[activeIndex];

  return (
    <>
      <div className="relative group">
        <div className="frame-product aspect-square overflow-hidden relative">
          <button
            ref={triggerRef}
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
          <span className="absolute top-3 right-3 inline-flex items-center gap-1.5 px-2 py-1 bg-western-cream/85 border border-western-stone-warm/20 font-mono text-[9px] uppercase tracking-[0.2em] text-western-green-deep pointer-events-none opacity-70 group-hover:opacity-100 transition-opacity">
            <Maximize2 className="h-3 w-3" /> Ampliar
          </span>

          {/* Counter */}
          {total > 1 && (
            <span className="absolute bottom-3 right-3 px-2 py-1 bg-western-cream/85 border border-western-stone-warm/20 font-mono text-[9px] uppercase tracking-[0.2em] text-western-stone-warm pointer-events-none">
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
              className="absolute left-0 md:-left-4 top-1/2 -translate-y-1/2 h-11 w-11 md:h-11 md:w-11 flex items-center justify-center bg-western-cream border border-western-stone-warm/25 text-western-stone-warm hover:text-western-green-deep hover:border-western-gold transition-colors shadow-sm"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={goNext}
              aria-label="Próxima imagem"
              className="absolute right-0 md:-right-4 top-1/2 -translate-y-1/2 h-11 w-11 md:h-11 md:w-11 flex items-center justify-center bg-western-cream border border-western-stone-warm/25 text-western-stone-warm hover:text-western-green-deep hover:border-western-gold transition-colors shadow-sm"
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

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-[100] bg-western-green-deep flex items-center justify-center"
          role="dialog"
          aria-modal="true"
          aria-label="Visualização ampliada"
        >
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            aria-label="Fechar (Esc)"
            className="absolute top-4 right-4 h-11 w-11 flex items-center justify-center text-western-cream/80 hover:text-western-cream border border-western-cream/20 hover:border-western-cream/60 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          {total > 1 && (
            <>
              <button
                type="button"
                onClick={goPrev}
                aria-label="Imagem anterior (←)"
                className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 h-12 w-12 flex items-center justify-center text-western-cream/80 hover:text-western-cream border border-western-cream/20 hover:border-western-cream/60 transition-colors"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                type="button"
                onClick={goNext}
                aria-label="Próxima imagem (→)"
                className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 h-12 w-12 flex items-center justify-center text-western-cream/80 hover:text-western-cream border border-western-cream/20 hover:border-western-cream/60 transition-colors"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}

          <button
            type="button"
            onClick={() => setZoomed((z) => !z)}
            className={`relative block mx-auto max-w-[92vw] max-h-[88vh] overflow-auto ${
              zoomed ? "cursor-zoom-out" : "cursor-zoom-in"
            }`}
            aria-label={zoomed ? "Reduzir zoom" : "Ampliar"}
          >
            <img
              key={activeIndex}
              src={cdnImg(current.url, 2000)}
              width={2000}
              height={2000}
              alt={current.altText ?? productTitle}
              className={`block mx-auto transition-transform duration-300 ${
                zoomed ? "scale-[1.6]" : "scale-100"
              } max-w-[92vw] max-h-[88vh] object-contain`}
            />
          </button>

          <span className="absolute bottom-4 left-1/2 -translate-x-1/2 font-mono text-[10px] uppercase tracking-[0.25em] text-western-cream/70">
            {activeIndex + 1} / {total} · ← → para navegar · esc para fechar
          </span>
        </div>
      )}
    </>
  );
}
