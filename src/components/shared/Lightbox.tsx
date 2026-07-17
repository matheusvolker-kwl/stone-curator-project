// Lightbox — ampliação de fotos em tela cheia (obras, inspirações e PDPs).
// Radix Dialog dá ESC + foco preso + scroll-lock + retorno de foco de graça;
// aqui só a moldura. Controlado por índice: `index === null` = fechado.
// O alt de cada foto vem do chamador e é preservado — a legenda embaixo
// repete o mesmo texto.
// Mobile: fechar é um alvo de 52px; a pinça nativa não funciona dentro do
// Dialog (Radix trava o scroll), então navegação = setas + swipe do carrossel.
// `zoomable` (PDPs): toque na foto alterna zoom 1.6× — resetado ao navegar.
import { useCallback, useEffect, useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogOverlay,
  DialogPortal,
  DialogPrimitiveContent,
  DialogTitle,
} from "@/components/ui/dialog";

export type LightboxFoto = {
  src: string;
  alt: string;
  /** srcSet/sizes opcionais — PDPs servem a foto via CDN responsivo */
  srcSet?: string;
  sizes?: string;
};

type Props = {
  fotos: LightboxFoto[];
  /** índice aberto; null = fechado */
  index: number | null;
  onIndexChange: (i: number) => void;
  onClose: () => void;
  /** rótulo do conjunto — vira o título acessível do diálogo */
  label: string;
  /** toque na foto alterna zoom (padrão: false — obras não usam) */
  zoomable?: boolean;
};

export default function Lightbox({ fotos, index, onIndexChange, onClose, label, zoomable = false }: Props) {
  const aberto = index !== null && index >= 0 && index < fotos.length;
  const total = fotos.length;
  const [zoomed, setZoomed] = useState(false);

  // Trocar de foto (ou fechar) volta ao enquadramento normal.
  useEffect(() => {
    setZoomed(false);
  }, [index]);

  const ir = useCallback(
    (delta: number) => {
      if (index === null || total < 2) return;
      onIndexChange((index + delta + total) % total);
    },
    [index, total, onIndexChange],
  );

  // Setas do teclado — o ESC já é do Radix.
  useEffect(() => {
    if (!aberto) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        ir(-1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        ir(1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [aberto, ir]);

  if (!aberto) return null;
  const foto = fotos[index];

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogPortal>
        <DialogOverlay className="bg-western-green-deep/95 backdrop-blur-sm" />
        <DialogPrimitiveContent
          className="fixed inset-0 z-50 flex flex-col outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
          aria-describedby={undefined}
        >
          <DialogTitle className="sr-only">{`${label} — foto ${index + 1} de ${total}`}</DialogTitle>

          {/* Barra: contador + fechar (52px de alvo) */}
          <div className="flex items-center justify-between gap-4 px-4 py-3 md:px-6">
            <span className="font-sans text-[14px] font-semibold text-western-cream-muted tabular-nums">
              {total > 1 ? `${index + 1} / ${total}` : ""}
            </span>
            <DialogClose
              aria-label="Fechar"
              className="inline-flex h-control w-[52px] items-center justify-center rounded-full border border-western-cream/30 text-western-cream transition-colors hover:bg-western-cream/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-western-gold"
            >
              <X className="h-6 w-6" aria-hidden />
            </DialogClose>
          </div>

          {/* Foto */}
          <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 pb-2 md:px-20">
            {zoomable ? (
              // Botão ocupa a área toda (tamanho definido → max-h-full da foto
              // resolve); quando ampliado, o excedente rola dentro do botão.
              <button
                type="button"
                onClick={() => setZoomed((z) => !z)}
                aria-label={zoomed ? "Reduzir zoom" : "Ampliar"}
                className={`absolute inset-0 flex items-center justify-center overflow-auto px-4 pb-2 md:px-20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-western-gold ${
                  zoomed ? "cursor-zoom-out" : "cursor-zoom-in"
                }`}
              >
                <img
                  src={foto.src}
                  srcSet={foto.srcSet}
                  sizes={foto.sizes}
                  alt={foto.alt}
                  decoding="async"
                  className={`max-h-full max-w-full object-contain rounded-lg transition-transform duration-300 ${
                    zoomed ? "scale-[1.6]" : "scale-100"
                  }`}
                />
              </button>
            ) : (
              <img
                src={foto.src}
                srcSet={foto.srcSet}
                sizes={foto.sizes}
                alt={foto.alt}
                decoding="async"
                className="max-h-full max-w-full object-contain rounded-lg"
              />
            )}

            {total > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => ir(-1)}
                  aria-label="Foto anterior"
                  className="absolute left-2 md:left-5 inline-flex h-control w-[52px] items-center justify-center rounded-full border border-western-cream/30 bg-western-green-deep/70 text-western-cream transition-colors hover:bg-western-cream/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-western-gold"
                >
                  <ChevronLeft className="h-6 w-6" aria-hidden />
                </button>
                <button
                  type="button"
                  onClick={() => ir(1)}
                  aria-label="Próxima foto"
                  className="absolute right-2 md:right-5 inline-flex h-control w-[52px] items-center justify-center rounded-full border border-western-cream/30 bg-western-green-deep/70 text-western-cream transition-colors hover:bg-western-cream/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-western-gold"
                >
                  <ChevronRight className="h-6 w-6" aria-hidden />
                </button>
              </>
            )}
          </div>

          {/* Legenda — o mesmo alt, visível */}
          <div className="px-4 pb-5 pt-2 text-center md:px-20">
            <p className="font-sans text-[14px] leading-[1.5] text-western-cream-muted">
              {foto.alt}
            </p>
            {zoomable && (
              <p className="mt-1 font-sans text-[12px] text-western-cream-muted/70">
                {zoomed ? "Toque na imagem para reduzir" : "Toque na imagem para ampliar"}
              </p>
            )}
          </div>
        </DialogPrimitiveContent>
      </DialogPortal>
    </Dialog>
  );
}
