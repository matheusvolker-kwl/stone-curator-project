import { useMemo, useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { OBRAS_WESTERN, type ObraCategoria, type ObraWestern } from "@/data/obrasWestern";

type FilterKey = "todos" | ObraCategoria;

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "todos", label: "Todos" },
  { key: "piscinas", label: "Piscinas" },
  { key: "cascatas", label: "Cascatas" },
  { key: "jardins", label: "Jardins" },
];

function Caption({ obra }: { obra: ObraWestern }) {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-4 pt-12 pb-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100">
      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-western-cream leading-snug">
        {obra.obra}
        <span className="opacity-70"> · {obra.local}</span>
      </p>
      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-western-gold/90 mt-1">
        {obra.produto}
      </p>
    </div>
  );
}

export default function ProjetosWesternBand() {
  const [filter, setFilter] = useState<FilterKey>("todos");
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const filtered = useMemo(
    () =>
      filter === "todos"
        ? OBRAS_WESTERN
        : OBRAS_WESTERN.filter((o) => o.categoria === filter),
    [filter]
  );

  const destaque = filtered.find((o) => o.destaque) ?? filtered[0];
  const restantes = filtered.filter((o) => o.id !== destaque?.id);

  const close = useCallback(() => setOpenIndex(null), []);
  const next = useCallback(
    () => setOpenIndex((i) => (i === null ? null : (i + 1) % filtered.length)),
    [filtered.length]
  );
  const prev = useCallback(
    () =>
      setOpenIndex((i) =>
        i === null ? null : (i - 1 + filtered.length) % filtered.length
      ),
    [filtered.length]
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

  const current = openIndex !== null ? filtered[openIndex] : null;

  return (
    <section className="bg-western-cream-muted py-14 md:py-20">
      <div className="container-western">
        <header className="text-center max-w-2xl mx-auto mb-8 md:mb-10">
          <p className="text-eyebrow">Obras Western</p>
          <div className="w-12 h-px bg-western-gold mx-auto my-5" />
          <h2 className="font-display text-3xl md:text-4xl text-western-green-deep">
            Cascatas e pedras instaladas por nós
          </h2>
          <p className="text-spec italic text-western-stone-warm mt-4">
            Portfólio selecionado de projetos executados com peças Western — em piscinas, cascatas e jardins.
          </p>
        </header>

        {/* Filtro */}
        <div className="flex flex-wrap justify-center gap-2 mb-10 md:mb-12">
          {FILTERS.map((f) => {
            const active = filter === f.key;
            return (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-4 py-2 font-mono text-[10px] uppercase tracking-[0.22em] border transition-colors ${
                  active
                    ? "border-western-gold text-western-gold bg-western-gold/5"
                    : "border-western-stone-warm/25 text-western-stone-warm hover:border-western-gold/60 hover:text-western-green-deep"
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>

        {/* Destaque + grade 4:5 */}
        {destaque && (
          <button
            type="button"
            onClick={() => setOpenIndex(filtered.indexOf(destaque))}
            className="group relative block w-full overflow-hidden rounded-[2px] bg-western-stone-warm/10 mb-4 md:mb-5 aspect-[16/9] md:aspect-[21/9]"
          >
            <img
              src={destaque.src}
              alt={`${destaque.obra} — ${destaque.local}`}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover transition-transform duration-700 ease-out motion-safe:group-hover:scale-[1.02]"
            />
            <Caption obra={destaque} />
          </button>
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
          {restantes.map((obra) => (
            <button
              type="button"
              key={obra.id}
              onClick={() => setOpenIndex(filtered.indexOf(obra))}
              className="group relative block overflow-hidden rounded-[2px] bg-western-stone-warm/10 aspect-[4/5]"
            >
              <img
                src={obra.src}
                alt={`${obra.obra} — ${obra.local}`}
                loading="lazy"
                decoding="async"
                sizes="(min-width: 1024px) 300px, (min-width: 768px) 33vw, 50vw"
                className="w-full h-full object-cover transition-transform duration-500 ease-out motion-safe:group-hover:scale-[1.04]"
              />
              <Caption obra={obra} />
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
              <img
                src={current.src}
                alt={`${current.obra} — ${current.local}`}
                className="w-full max-h-[80vh] object-contain bg-black"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent px-6 pt-16 pb-5">
                <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-western-cream">
                  {current.obra} <span className="opacity-70">· {current.local}</span>
                </p>
                <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-western-gold mt-1.5">
                  {current.produto}
                </p>
              </div>

              <button
                onClick={close}
                aria-label="Fechar"
                className="absolute top-3 right-3 h-10 w-10 flex items-center justify-center bg-black/50 text-western-cream hover:bg-black/80 transition-colors rounded-full"
              >
                <X className="h-5 w-5" />
              </button>
              <button
                onClick={prev}
                aria-label="Anterior"
                className="absolute top-1/2 -translate-y-1/2 left-3 h-11 w-11 flex items-center justify-center bg-black/50 text-western-cream hover:bg-black/80 transition-colors rounded-full"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={next}
                aria-label="Próxima"
                className="absolute top-1/2 -translate-y-1/2 right-3 h-11 w-11 flex items-center justify-center bg-black/50 text-western-cream hover:bg-black/80 transition-colors rounded-full"
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
