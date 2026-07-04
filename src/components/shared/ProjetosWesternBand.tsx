import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, X, Play } from "lucide-react";
import { CASOS_WESTERN, type CasoWestern } from "@/data/casosWestern";

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

function Caption({ caso }: { caso: CasoWestern }) {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/65 to-transparent px-4 pt-20 pb-4">
      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-western-gold/90 drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
        {caso.credito}
      </p>
      <p className="font-display text-base md:text-lg text-western-cream mt-1.5 leading-snug drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
        {caso.titulo}
      </p>
    </div>
  );
}

function PlayBadge() {
  return (
    <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 px-2 py-1 bg-western-cream/90 border border-western-stone-warm/20 font-mono text-[9px] uppercase tracking-[0.22em] text-western-green-deep">
      <Play className="h-3 w-3 fill-current" /> Vídeo
    </span>
  );
}

function PlayOverlay() {
  return (
    <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
      <span className="h-14 w-14 md:h-16 md:w-16 rounded-full bg-western-cream/95 border border-western-gold/40 flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110">
        <Play className="h-6 w-6 md:h-7 md:w-7 text-western-green-deep fill-current translate-x-[2px]" />
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
          <p className="text-eyebrow text-western-gold-soft">Depoimentos & obras</p>
          <div className="w-12 h-px bg-western-gold mx-auto my-5" />
          <h2 className="font-display text-3xl md:text-4xl text-western-cream">
            Projetos que a Western tornou possível
          </h2>
          <p className="text-spec italic text-western-cream-muted mt-4">
            Arquitetos, empresários e destinos icônicos contam por que escolheram Western.
          </p>
        </header>

        {/* Destaque */}
        {destaque && (
          <button
            type="button"
            onClick={() => setOpenIndex(items.indexOf(destaque))}
            className="group relative block w-full overflow-hidden rounded-[2px] bg-western-stone-warm/10 ring-1 ring-western-gold/10 shadow-[0_20px_50px_-25px_rgba(0,0,0,0.7)] mb-4 md:mb-5 aspect-[16/9] md:aspect-[21/9]"
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
            <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent px-6 md:px-10 pt-20 pb-6 md:pb-8">
              <p className="font-mono text-[10px] md:text-[11px] uppercase tracking-[0.22em] text-western-gold">
                {destaque.credito}
              </p>
              <p className="font-display text-xl md:text-3xl text-western-cream mt-2 leading-snug max-w-2xl">
                {destaque.titulo}
              </p>
              <p className="hidden md:block text-western-cream/85 mt-3 max-w-2xl text-sm leading-relaxed">
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
              className="group relative block overflow-hidden rounded-[2px] bg-western-stone-warm/10 ring-1 ring-western-gold/10 shadow-[0_16px_40px_-24px_rgba(0,0,0,0.7)] aspect-[4/5] text-left"
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
          className="max-w-6xl w-[95vw] p-0 bg-western-green-deep border-western-gold/20 [&>button]:hidden"
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

              <div className="px-6 md:px-8 pt-5 pb-6 bg-western-green-deep">
                <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-western-gold">
                  {current.credito}
                </p>
                <p className="font-display text-lg md:text-xl text-western-cream mt-2">
                  {current.titulo}
                </p>
                <p className="text-western-cream/80 text-sm mt-2 leading-relaxed max-w-3xl">
                  {current.story}
                </p>
                {current.tipo === "video" && !current.mediaUrl && (
                  <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.22em] text-western-gold/70">
                    Vídeo em breve
                  </p>
                )}
              </div>

              <button
                onClick={close}
                aria-label="Fechar"
                className="absolute top-3 right-3 h-10 w-10 flex items-center justify-center bg-black/60 text-western-cream hover:bg-black/85 transition-colors rounded-full"
              >
                <X className="h-5 w-5" />
              </button>
              <button
                onClick={prev}
                aria-label="Anterior"
                className="absolute top-[38%] -translate-y-1/2 left-3 h-11 w-11 flex items-center justify-center bg-black/60 text-western-cream hover:bg-black/85 transition-colors rounded-full"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={next}
                aria-label="Próxima"
                className="absolute top-[38%] -translate-y-1/2 right-3 h-11 w-11 flex items-center justify-center bg-black/60 text-western-cream hover:bg-black/85 transition-colors rounded-full"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
