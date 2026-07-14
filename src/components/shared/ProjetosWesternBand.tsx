import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, X, Play } from "lucide-react";
import { CASOS_WESTERN, type CasoWestern } from "@/data/casosWestern";

/* Eyebrow sobre fundo escuro: sans semibold 14px, tracking 0.06em, dourado claro
 * (o bronze do .text-eyebrow não teria contraste sobre o verde profundo). */
const EYEBROW_DARK =
  "font-sans text-[14px] font-semibold uppercase tracking-[0.06em] text-western-gold-soft";

/* Overlay verde de proteção — texto sobre foto nunca sem overlay. */
const PHOTO_SCRIM =
  "bg-gradient-to-t from-western-green-deep/95 via-western-green-deep/70 to-transparent";

function isEmbed(url: string) {
  return /youtube\.com|youtu\.be|vimeo\.com/i.test(url);
}

function toEmbedUrl(url: string) {
  // YouTube
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}?autoplay=1&rel=0`;
  const vm = url.match(/vimeo\.com\/(\d+)/);
  if (vm) return `https://player.vimeo.com/video/${vm[1]}?autoplay=1`;
  return url;
}

/* Legenda SEMPRE visível (não depende de hover — no celular não existe hover). */
function Caption({ caso }: { caso: CasoWestern }) {
  return (
    <div className={`pointer-events-none absolute inset-x-0 bottom-0 ${PHOTO_SCRIM} px-4 pt-16 pb-4`}>
      <p className={EYEBROW_DARK}>{caso.credito}</p>
      <p className="font-sans text-[20px] font-semibold text-western-cream mt-1.5 leading-snug">
        {caso.titulo}
      </p>
    </div>
  );
}

function PlayBadge() {
  return (
    <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-western-cream/95 border border-western-border-soft font-sans text-[14px] font-semibold text-western-green-deep">
      <Play className="h-4 w-4 fill-current" /> Vídeo
    </span>
  );
}

function PlayOverlay() {
  return (
    <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
      <span className="h-16 w-16 md:h-[72px] md:w-[72px] rounded-full bg-western-cream/95 border border-western-gold/40 flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110">
        <Play className="h-7 w-7 md:h-8 md:w-8 text-western-green-deep fill-current translate-x-[2px]" />
      </span>
    </span>
  );
}

export default function ProjetosWesternBand() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const items = CASOS_WESTERN;

  const destaque = items.find((c) => c.destaque) ?? items[0];
  const restantes = items.filter((c) => c.id !== destaque?.id);

  const close = useCallback(() => setOpenIndex(null), []);
  const next = useCallback(
    () => setOpenIndex((i) => (i === null ? null : (i + 1) % items.length)),
    [items.length]
  );
  const prev = useCallback(
    () =>
      setOpenIndex((i) =>
        i === null ? null : (i - 1 + items.length) % items.length
      ),
    [items.length]
  );

  useEffect(() => {
    if (openIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openIndex, next, prev]);

  const current = openIndex !== null ? items[openIndex] : null;

  return (
    <section className="surface-forest border-y border-western-gold/15 py-14 md:py-20">
      <div className="container-western">
        <header className="text-center max-w-2xl mx-auto mb-10 md:mb-14">
          <p className={EYEBROW_DARK}>Depoimentos e obras</p>
          <div className="w-12 h-px bg-western-gold mx-auto my-5" />
          <h2 className="display-lg text-western-cream">
            Projetos que a Western tornou possível
          </h2>
          <p className="font-sans text-[17px] leading-[1.6] text-western-cream/85 mt-4">
            Arquitetos, empresários e destinos icônicos contam por que escolheram Western.
          </p>
        </header>

        {/* Destaque */}
        {destaque && (
          <button
            type="button"
            onClick={() => setOpenIndex(items.indexOf(destaque))}
            className="group relative block w-full overflow-hidden rounded-[16px] bg-western-green-mid/30 ring-1 ring-western-gold/15 shadow-[0_20px_50px_-25px_rgba(0,0,0,0.7)] mb-4 md:mb-5 aspect-[4/3] sm:aspect-[16/9] md:aspect-[21/9] text-left"
          >
            <img
              src={destaque.posterUrl}
              alt={`${destaque.titulo} — ${destaque.credito}`}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover transition-transform duration-700 ease-out motion-safe:group-hover:scale-[1.02]"
            />
            {destaque.tipo === "video" && (
              <>
                <PlayBadge />
                <PlayOverlay />
              </>
            )}
            <div className={`pointer-events-none absolute inset-x-0 bottom-0 ${PHOTO_SCRIM} px-5 md:px-10 pt-20 pb-5 md:pb-8`}>
              <p className={EYEBROW_DARK}>{destaque.credito}</p>
              {/* display-md nunca desce abaixo de 22px, nem no celular. */}
              <h3 className="display-md text-western-cream mt-2 max-w-2xl">
                {destaque.titulo}
              </h3>
              <p className="hidden md:block font-sans text-[17px] leading-[1.6] text-western-cream/85 mt-3 max-w-2xl">
                {destaque.story}
              </p>
            </div>
          </button>
        )}

        {/* Grade dos demais */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {restantes.map((caso) => (
            <button
              type="button"
              key={caso.id}
              onClick={() => setOpenIndex(items.indexOf(caso))}
              className="group relative block overflow-hidden rounded-[16px] bg-western-green-mid/30 ring-1 ring-western-gold/15 shadow-[0_16px_40px_-24px_rgba(0,0,0,0.7)] aspect-[4/5] text-left"
            >
              <img
                src={caso.posterUrl}
                alt={`${caso.titulo} — ${caso.credito}`}
                loading="lazy"
                decoding="async"
                sizes="(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw"
                className="w-full h-full object-cover transition-transform duration-500 ease-out motion-safe:group-hover:scale-[1.04]"
              />
              {caso.tipo === "video" && (
                <>
                  <PlayBadge />
                  <PlayOverlay />
                </>
              )}
              <Caption caso={caso} />
            </button>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      <Dialog open={openIndex !== null} onOpenChange={(o) => !o && close()}>
        <DialogContent
          className="max-w-6xl w-[95vw] max-h-[90dvh] overflow-y-auto p-0 bg-western-green-deep border-western-gold/20 rounded-[16px] [&>button]:hidden"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          {current && (
            <div className="relative">
              <div className="w-full bg-black flex items-center justify-center">
                {current.tipo === "video" && current.mediaUrl ? (
                  isEmbed(current.mediaUrl) ? (
                    <div className="w-full aspect-video">
                      <iframe
                        src={toEmbedUrl(current.mediaUrl)}
                        title={current.titulo}
                        allow="autoplay; encrypted-media; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full"
                      />
                    </div>
                  ) : (
                    <video
                      src={current.mediaUrl}
                      poster={current.posterUrl}
                      controls
                      muted
                      autoPlay
                      playsInline
                      className="w-full max-h-[80vh] object-contain bg-black"
                    />
                  )
                ) : (
                  <img
                    src={current.mediaUrl || current.posterUrl}
                    alt={`${current.titulo} — ${current.credito}`}
                    className="w-full max-h-[80vh] object-contain bg-black"
                  />
                )}
              </div>

              <div className="px-5 md:px-8 pt-5 pb-6 bg-western-green-deep">
                <p className={EYEBROW_DARK}>{current.credito}</p>
                <h3 className="display-md text-western-cream mt-2">{current.titulo}</h3>
                <p className="font-sans text-[17px] leading-[1.6] text-western-cream/85 mt-3 max-w-3xl">
                  {current.story}
                </p>
                {current.tipo === "video" && !current.mediaUrl && (
                  <p className="mt-4 font-sans text-[14px] text-western-cream/75">
                    Vídeo em breve.
                  </p>
                )}
              </div>

              {/* Ícone sozinho só em X/fechar e setas — alvo de toque ≥48px. */}
              <button
                onClick={close}
                aria-label="Fechar"
                className="tap-target absolute top-[max(0.75rem,env(safe-area-inset-top))] right-3 flex items-center justify-center bg-western-green-deep/85 text-western-cream hover:bg-western-green-deep transition-colors rounded-full z-10"
              >
                <X className="h-6 w-6" strokeWidth={1.75} />
              </button>
              <button
                onClick={prev}
                aria-label="Anterior"
                className="tap-target absolute top-1/2 -translate-y-1/2 left-3 flex items-center justify-center bg-western-green-deep/75 text-western-cream hover:bg-western-green-deep transition-colors rounded-full"
              >
                <ChevronLeft className="h-6 w-6" strokeWidth={1.75} />
              </button>
              <button
                onClick={next}
                aria-label="Próxima"
                className="tap-target absolute top-1/2 -translate-y-1/2 right-3 flex items-center justify-center bg-western-green-deep/75 text-western-cream hover:bg-western-green-deep transition-colors rounded-full"
              >
                <ChevronRight className="h-6 w-6" strokeWidth={1.75} />
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
