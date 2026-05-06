import { useEffect, useRef, useState } from "react";
import respiroPedra from "@/assets/respiro-pedra.jpg";

/**
 * Respiro cinematográfico — pausa visual full-bleed entre Artista e Projetos.
 * Sem CTA, sem moldura. Só matéria.
 *  - Parallax leve no scroll (desktop)
 *  - Zoom respirando lento (ASMR)
 *  - Texto entra via IntersectionObserver
 *  - Respeita prefers-reduced-motion
 */
export default function RespiroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [visible, setVisible] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, []);

  // Fade-in do texto quando a seção entra
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.intersectionRatio >= 0.4) setVisible(true);
        });
      },
      { threshold: [0, 0.4, 0.8] }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Parallax sutil (desktop)
  useEffect(() => {
    if (reduced) return;
    if (typeof window === "undefined") return;
    if (window.matchMedia("(max-width: 768px)").matches) return;

    let raf = 0;
    let ticking = false;

    const update = () => {
      const el = sectionRef.current;
      const img = imgRef.current;
      if (!el || !img) return;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      // Posição relativa do centro da seção em relação ao centro da viewport
      const centerOffset = rect.top + rect.height / 2 - vh / 2;
      const translate = centerOffset * -0.12; // 0.12 = sutil
      img.style.transform = `translate3d(0, ${translate}px, 0) scale(1.08)`;
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        raf = requestAnimationFrame(update);
        ticking = true;
      }
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [reduced]);

  return (
    <section
      ref={sectionRef}
      aria-label="Pausa visual — matéria, projeto, lugar"
      className="relative w-full h-screen overflow-hidden bg-western-stone-dark"
    >
      {/* Imagem com parallax + zoom respirando */}
      <div className="absolute inset-0 overflow-hidden">
        <img
          ref={imgRef}
          src={respiroPedra}
          alt="Corredor arquitetônico entre paredes de pedra escavada, teto de bambu, piso de madeira e brita."
          loading="lazy"
          fetchPriority="low"
          className={`absolute inset-0 w-full h-full object-cover object-center will-change-transform ${
            reduced ? "" : "animate-breathe-zoom"
          }`}
          style={{ transform: "scale(1.08)" }}
        />
      </div>

      {/* Vinheta nas bordas — centraliza o olho */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 45%, hsl(var(--western-stone-dark) / 0.55) 100%)",
        }}
      />

      {/* Gradiente inferior — assenta o texto */}
      <div
        className="absolute inset-x-0 bottom-0 h-1/2 pointer-events-none"
        aria-hidden
        style={{
          background:
            "linear-gradient(to top, hsl(var(--western-stone-dark) / 0.85) 0%, transparent 100%)",
        }}
      />

      {/* Grão sutil — costura com o hero */}
      <div
        className="absolute inset-0 opacity-[0.06] mix-blend-overlay pointer-events-none"
        aria-hidden
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.85  0 0 0 0 0.78  0 0 0 0 0.55  0 0 0 1 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
        }}
      />

      {/* Texto — fade-in lento */}
      <div className="absolute inset-0 flex items-end">
        <div className="container-western pb-16 md:pb-24">
          <div
            className={`max-w-2xl transition-all duration-[1400ms] ease-out ${
              visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            <p className="font-mono text-[10px] md:text-xs uppercase tracking-[0.32em] text-western-gold-soft mb-5">
              Matéria · Projeto · Lugar
            </p>
            <div className="w-12 h-px bg-western-gold-soft/70 mb-8" />
            <h2 className="font-display text-3xl md:text-5xl lg:text-6xl text-western-cream leading-[1.1]">
              A pedra encontra a{" "}
              <span className="italic font-light text-western-gold-soft">
                arquitetura.
              </span>
            </h2>
          </div>
        </div>
      </div>

      {/* Indicador discreto de scroll — canto inferior direito */}
      <div
        className={`absolute bottom-10 right-8 md:right-12 hidden md:flex flex-col items-end gap-3 transition-opacity duration-1000 ${
          visible ? "opacity-70" : "opacity-0"
        }`}
        aria-hidden
      >
        <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-western-cream-muted">
          01 — Respiro
        </span>
        <div className="relative w-px h-12 overflow-hidden bg-western-cream-muted/20">
          {!reduced && (
            <div className="absolute inset-x-0 top-0 h-1/2 bg-western-gold-soft animate-scroll-tick" />
          )}
        </div>
      </div>
    </section>
  );
}
