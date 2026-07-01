import { useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import { PROJETOS, type Projeto } from "@/data/projetos";
import ProjetoModal from "./ProjetoModal";

/**
 * Projetos assinados — prova social.
 * - 3 col no desktop (cards maiores), 1 col mobile, 2 col md.
 * - Hover: se houver vídeo, roda em loop suave; senão, zoom sutil.
 * - Eyebrow correto: "Acabamento:" quando aplicável (via campo `acabamento`).
 */
export default function ProjetosSection() {
  const [active, setActive] = useState<Projeto | null>(null);

  return (
    <section className="surface-forest py-16 md:py-24 border-t border-western-gold/15">
      <div className="container-western">
        <div className="flex items-end justify-between flex-wrap gap-6 mb-10 md:mb-14">
          <div>
            <p className="text-eyebrow mb-3">Projetos assinados</p>
            <h2 className="font-display text-3xl md:text-5xl text-western-cream leading-[1.05] max-w-2xl">
              Obras que escolheram a{" "}
              <span className="text-western-gold-soft italic font-light">Western.</span>
            </h2>
          </div>
          <p className="text-western-cream-muted text-sm max-w-xs">
            Projetos de arquitetos e paisagistas que trouxeram a Western pra dentro de obras de referência no país.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {PROJETOS.map((p) => (
            <ProjetoCard key={p.slug} projeto={p} onOpen={() => setActive(p)} />
          ))}
        </div>
      </div>

      <ProjetoModal projeto={active} onClose={() => setActive(null)} />
    </section>
  );
}

function ProjetoCard({ projeto: p, onOpen }: { projeto: Projeto; onOpen: () => void }) {
  const vidRef = useRef<HTMLVideoElement>(null);
  const [hover, setHover] = useState(false);

  const onEnter = () => {
    setHover(true);
    const v = vidRef.current;
    if (v) {
      v.currentTime = 0;
      void v.play().catch(() => void 0);
    }
  };
  const onLeave = () => {
    setHover(false);
    const v = vidRef.current;
    if (v) v.pause();
  };

  const [nome, contexto] = p.eyebrow.split("·").map((s) => s.trim());

  return (
    <button
      type="button"
      onClick={onOpen}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onFocus={onEnter}
      onBlur={onLeave}
      className="group relative text-left bg-western-green-mid/25 border border-western-gold/15 hover:border-western-gold/50 hover:-translate-y-1 transition-all duration-500 overflow-hidden flex flex-col shadow-lg shadow-western-green-deep/25 hover:shadow-2xl hover:shadow-western-green-deep/45"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-western-green-deep">
        <img
          src={p.cardCover ?? p.cover}
          alt={p.titulo}
          loading="lazy"
          decoding="async"
          className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-out ${hover ? "scale-[1.05] opacity-0" : "scale-100 opacity-100"}`}
        />
        {p.video && (
          <video
            ref={vidRef}
            src={p.video}
            poster={p.cardCover ?? p.cover}
            muted
            loop
            playsInline
            preload="none"
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${hover ? "opacity-100" : "opacity-0"}`}
          />
        )}

        {/* Vinheta + gradiente inferior forte pra legibilidade */}
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden
          style={{
            background:
              "linear-gradient(to top, hsl(var(--western-green-deep) / 0.95) 0%, hsl(var(--western-green-deep) / 0.55) 30%, transparent 60%)",
          }}
        />

        <div className="absolute bottom-5 left-5 right-5">
          <p className="text-[10px] font-mono uppercase tracking-[0.24em] text-western-gold-soft mb-2">
            {p.titulo}
          </p>
          <h3 className="font-display text-2xl md:text-[1.8rem] text-western-cream leading-[1.1] drop-shadow-[0_2px_8px_hsl(var(--western-green-deep)/0.75)]">
            {nome}
          </h3>
          {contexto && (
            <p className="text-xs text-western-cream-muted mt-2 line-clamp-1">
              {contexto}
            </p>
          )}
        </div>
      </div>

      <div className="px-5 py-3.5 border-t border-western-gold/15 flex items-center justify-between bg-western-green-deep/40">
        <span className="text-[10px] font-mono uppercase tracking-[0.22em] text-western-gold-soft">
          Ver projeto
        </span>
        <ArrowRight className="h-3.5 w-3.5 text-western-gold-soft group-hover:translate-x-1 transition-transform" />
      </div>
    </button>
  );
}
