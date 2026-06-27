import { useEffect, useRef, useState } from "react";
import DustCanvas from "@/components/DustCanvas";
import logoAsset from "@/assets/coming-soon-logo.png.asset.json";

/**
 * Página de pré-lançamento — tela cheia, fora do SiteLayout.
 * Atmosfera dark/luxo, partículas no cursor, sheen no logo, glow respirando.
 */
export default function ComingSoon() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const logoRef = useRef<HTMLImageElement | null>(null);
  const glowRef = useRef<HTMLDivElement | null>(null);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
  }, []);

  // Parallax suave do logo + glow
  useEffect(() => {
    if (reduced) return;
    let tx = 0, ty = 0, cx = 0, cy = 0;
    let mx = 0, my = 0;
    let raf = 0;

    const onMove = (e: MouseEvent) => {
      const w = window.innerWidth, h = window.innerHeight;
      mx = (e.clientX / w - 0.5) * -1; // contrário
      my = (e.clientY / h - 0.5) * -1;
    };
    window.addEventListener("mousemove", onMove);

    const tick = () => {
      cx += (mx - cx) * 0.06;
      cy += (my - cy) * 0.06;
      tx = cx * 10; ty = cy * 10;
      if (logoRef.current) {
        logoRef.current.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
      }
      if (glowRef.current) {
        glowRef.current.style.transform = `translate3d(${cx * 24}px, ${cy * 24}px, 0) scale(2.2)`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
    };
  }, [reduced]);

  // Sem context-menu na página
  useEffect(() => {
    const node = wrapRef.current;
    if (!node) return;
    const prevent = (e: Event) => e.preventDefault();
    node.addEventListener("contextmenu", prevent);
    return () => node.removeEventListener("contextmenu", prevent);
  }, []);

  return (
    <div
      ref={wrapRef}
      className="relative w-screen h-[100dvh] overflow-hidden select-none"
      style={{
        background:
          "radial-gradient(ellipse at center, #1C140D 0%, #120D08 45%, #0E0B08 100%)",
      }}
    >
      {/* Film grain */}
      <svg
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 w-full h-full opacity-[0.07] mix-blend-overlay z-[2] cs-grain"
      >
        <filter id="cs-noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#cs-noise)" />
      </svg>

      {/* Vinheta */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[3]"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.65) 100%)",
        }}
      />

      {/* Poeira reativa */}
      <DustCanvas />

      {/* Glow âmbar atrás do logo */}
      <div
        ref={glowRef}
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 z-[6] cs-breathe"
        style={{
          width: "60vmin",
          height: "60vmin",
          marginLeft: "-30vmin",
          marginTop: "-30vmin",
          background:
            "radial-gradient(circle at center, rgba(212,170,120,0.22) 0%, rgba(212,170,120,0.10) 35%, rgba(212,170,120,0) 70%)",
          filter: "blur(44px)",
          transform: "scale(2.2)",
          willChange: "transform, opacity",
        }}
      />

      {/* Conteúdo central */}
      <div className="relative z-[10] w-full h-full flex flex-col items-center justify-center px-6">
        <div className="relative cs-logo-reveal" style={{ willChange: "transform, filter, opacity" }}>
          <img
            ref={logoRef}
            src={logoAsset.url}
            alt="WESTERN STORE"
            draggable={false}
            style={{
              display: "block",
              width: "clamp(260px, 42vw, 620px)",
              height: "auto",
              filter: "drop-shadow(0 0 24px rgba(201,165,126,0.15))",
              willChange: "transform",
            }}
          />
          {/* Sheen */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 overflow-hidden cs-sheen-mask"
          >
            <div className="cs-sheen" />
          </div>
        </div>

        <div
          className="mt-10 text-center cs-tagline"
          style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
        >
          <p
            className="cs-pulse"
            style={{
              color: "hsl(var(--western-gold))",
              fontSize: "clamp(11px, 1.1vw, 14px)",
              letterSpacing: "0.55em",
              fontWeight: 500,
              textTransform: "uppercase",
              textIndent: "0.55em",
            }}
          >
            Lançamento em breve
          </p>
          <p
            className="mt-4"
            style={{
              color: "rgba(217,184,140,0.45)",
              fontSize: "clamp(10px, 0.85vw, 12px)",
              letterSpacing: "0.35em",
              textTransform: "lowercase",
              textIndent: "0.35em",
            }}
          >
            westernstore.com.br
          </p>
        </div>
      </div>

      <style>{`
        @keyframes cs-breathe-kf {
          0%, 100% { opacity: 0.85; transform: scale(2.1); }
          50% { opacity: 1; transform: scale(2.35); }
        }
        .cs-breathe { animation: cs-breathe-kf 7s ease-in-out infinite; }

        @keyframes cs-grain-kf {
          0% { transform: translate(0,0); }
          25% { transform: translate(-2%, 1%); }
          50% { transform: translate(1%, -1%); }
          75% { transform: translate(-1%, 2%); }
          100% { transform: translate(0,0); }
        }
        .cs-grain { animation: cs-grain-kf 8s steps(6) infinite; }

        @keyframes cs-logo-reveal-kf {
          0% { opacity: 0; filter: blur(10px); transform: translateY(14px) scale(0.985); }
          100% { opacity: 1; filter: blur(0); transform: translateY(0) scale(1); }
        }
        .cs-logo-reveal {
          animation: cs-logo-reveal-kf 2s cubic-bezier(0.22,1,0.36,1) 0.15s both;
        }

        @keyframes cs-tagline-kf {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .cs-tagline { animation: cs-tagline-kf 1.4s cubic-bezier(0.22,1,0.36,1) 0.9s both; }

        @keyframes cs-pulse-kf {
          0%, 100% { opacity: 0.78; }
          50% { opacity: 1; }
        }
        .cs-pulse { animation: cs-pulse-kf 3.6s ease-in-out infinite; }

        .cs-sheen-mask { mix-blend-mode: screen; }
        @keyframes cs-sheen-kf {
          0% { transform: translateX(-120%) skewX(-12deg); opacity: 0; }
          12% { opacity: 0.55; }
          35% { transform: translateX(220%) skewX(-12deg); opacity: 0; }
          100% { transform: translateX(220%) skewX(-12deg); opacity: 0; }
        }
        .cs-sheen {
          position: absolute; top: 0; left: 0; height: 100%; width: 40%;
          background: linear-gradient(100deg,
            rgba(255,255,255,0) 0%,
            rgba(255,235,200,0.22) 50%,
            rgba(255,255,255,0) 100%);
          filter: blur(4px);
          animation: cs-sheen-kf 7s ease-in-out infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .cs-breathe, .cs-grain, .cs-logo-reveal, .cs-tagline, .cs-pulse, .cs-sheen {
            animation: none !important;
          }
          .cs-logo-reveal { opacity: 1; filter: none; transform: none; }
        }
      `}</style>
    </div>
  );
}
