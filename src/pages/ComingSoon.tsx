import { useEffect, useRef, useState } from "react";
import DustCanvas from "@/components/DustCanvas";
import Seo from "@/components/seo/Seo";
import logoAsset from "@/assets/coming-soon-logo.png";

/**
 * Página de pré-lançamento — tela cheia, fora do SiteLayout.
 * Coreografia: fundo → bloom do glow → reveal do logo → tagline.
 * Atmosfera viva: poeira ambiente + reativa, scene breathing,
 * logo backlit, sheen, parallax, recompensa de interação.
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

  // Parallax + recompensa de interação (proximidade do centro)
  useEffect(() => {
    if (reduced) return;
    let cx = 0, cy = 0;
    let mx = 0, my = 0;
    let proximity = 0; // 0..1, suavizado
    let targetProx = 0;
    let raf = 0;

    const onMove = (e: MouseEvent) => {
      const w = window.innerWidth, h = window.innerHeight;
      mx = (e.clientX / w - 0.5) * -1; // contrário
      my = (e.clientY / h - 0.5) * -1;
      // distância normalizada até o centro (0 = no centro, 1 = canto)
      const dx = (e.clientX - w / 2) / (w / 2);
      const dy = (e.clientY - h / 2) / (h / 2);
      const d = Math.min(1, Math.hypot(dx, dy));
      targetProx = 1 - d; // perto do centro -> 1
    };
    window.addEventListener("mousemove", onMove);

    const tick = () => {
      cx += (mx - cx) * 0.06;
      cy += (my - cy) * 0.06;
      proximity += (targetProx - proximity) * 0.05;
      const tx = cx * 10, ty = cy * 10;
      if (logoRef.current) {
        logoRef.current.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
      }
      if (glowRef.current) {
        const reward = 1 + proximity * 0.18; // até +18% de escala
        glowRef.current.style.transform =
          `translate3d(${cx * 24}px, ${cy * 24}px, 0) scale(${2.2 * reward})`;
        glowRef.current.style.setProperty("--cs-reward", String(1 + proximity * 0.35));
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
      <Seo
        title="Western Store — lançamento em breve"
        description="A loja B2B de pedras artesanais Western está em preparação. Ateliê em Cajamar/SP desde 1993."
        path="/"
      />
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

      {/* Vinheta — respira (scene breathing) */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[3] cs-vignette"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.65) 100%)",
        }}
      />

      {/* Poeira (ambiente + reativa) */}
      <DustCanvas />

      {/* Glow âmbar atrás do logo — bloom de entrada + respiração */}
      <div
        ref={glowRef}
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 z-[6] cs-bloom cs-breathe"
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
            src={logoAsset}
            alt="WESTERN STORE"
            draggable={false}
            className="cs-logo-backlit"
            style={{
              display: "block",
              width: "clamp(260px, 42vw, 620px)",
              height: "auto",
              willChange: "transform, filter",
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

        {/* Hairline elegante */}
        <div
          aria-hidden="true"
          className="cs-hairline mt-9"
          style={{
            width: "clamp(80px, 9vw, 140px)",
            height: "1px",
            background:
              "linear-gradient(90deg, transparent 0%, rgba(217,184,140,0.55) 50%, transparent 100%)",
            boxShadow: "0 0 8px rgba(217,184,140,0.35)",
          }}
        />

        <div className="mt-7 text-center cs-tagline font-display">
          <p
            className="cs-pulse"
            style={{
              color: "hsl(var(--western-gold))",
              fontSize: "clamp(14px, 1.45vw, 20px)",
              letterSpacing: "0.45em",
              fontWeight: 500,
              textTransform: "uppercase",
              textIndent: "0.45em",
            }}
          >
            Lançamento em breve
          </p>
          <p
            className="mt-3 font-display"
            style={{
              color: "rgba(217,184,140,0.5)",
              fontSize: "clamp(12px, 1vw, 15px)",
              letterSpacing: "0.3em",
              fontStyle: "italic",
              textIndent: "0.3em",
            }}
          >
            westernstore.com.br
          </p>
        </div>
      </div>

      <style>{`
        /* ----- Bloom de entrada do glow ----- */
        @keyframes cs-bloom-kf {
          0%   { opacity: 0;    transform: scale(0.6); filter: blur(80px); }
          60%  { opacity: 1;    transform: scale(2.45); filter: blur(44px); }
          100% { opacity: 0.95; transform: scale(2.2);  filter: blur(44px); }
        }
        .cs-bloom { animation: cs-bloom-kf 2.4s cubic-bezier(0.22,1,0.36,1) 0.05s both; }

        /* ----- Respiração contínua do glow (entra após o bloom) ----- */
        @keyframes cs-breathe-kf {
          0%, 100% { opacity: calc(0.82 * var(--cs-reward, 1)); }
          50%      { opacity: calc(1.00 * var(--cs-reward, 1)); }
        }
        .cs-breathe { animation: cs-bloom-kf 2.4s cubic-bezier(0.22,1,0.36,1) 0.05s both,
                                cs-breathe-kf 7s ease-in-out 2.5s infinite; }

        /* ----- Grain drift ----- */
        @keyframes cs-grain-kf {
          0% { transform: translate(0,0); }
          25% { transform: translate(-2%, 1%); }
          50% { transform: translate(1%, -1%); }
          75% { transform: translate(-1%, 2%); }
          100% { transform: translate(0,0); }
        }
        .cs-grain { animation: cs-grain-kf 8s steps(6) infinite; }

        /* ----- Scene breathing (vinheta/exposição) ----- */
        @keyframes cs-vignette-kf {
          0%, 100% { opacity: 0.92; }
          50%      { opacity: 1; }
        }
        .cs-vignette { animation: cs-vignette-kf 9.5s ease-in-out infinite; }

        /* ----- Reveal do logo ----- */
        @keyframes cs-logo-reveal-kf {
          0%   { opacity: 0; filter: blur(10px); transform: translateY(14px) scale(0.985); }
          100% { opacity: 1; filter: blur(0);    transform: translateY(0) scale(1); }
        }
        .cs-logo-reveal {
          animation: cs-logo-reveal-kf 2s cubic-bezier(0.22,1,0.36,1) 0.7s both;
        }

        /* ----- Backlit pulse no drop-shadow do logo (sincroniza com o glow) ----- */
        @keyframes cs-backlit-kf {
          0%, 100% { filter: drop-shadow(0 0 18px rgba(201,165,126,0.12)); }
          50%      { filter: drop-shadow(0 0 34px rgba(212,170,120,0.28)); }
        }
        .cs-logo-backlit { animation: cs-backlit-kf 7s ease-in-out 2.7s infinite; }

        /* ----- Hairline ----- */
        @keyframes cs-hairline-kf {
          0%   { opacity: 0; transform: scaleX(0.2); }
          100% { opacity: 1; transform: scaleX(1); }
        }
        .cs-hairline {
          transform-origin: center;
          animation: cs-hairline-kf 1.4s cubic-bezier(0.22,1,0.36,1) 1.6s both;
        }

        /* ----- Tagline ----- */
        @keyframes cs-tagline-kf {
          0%   { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .cs-tagline { animation: cs-tagline-kf 1.4s cubic-bezier(0.22,1,0.36,1) 1.9s both; }

        @keyframes cs-pulse-kf {
          0%, 100% { opacity: 0.78; }
          50%      { opacity: 1; }
        }
        .cs-pulse { animation: cs-pulse-kf 3.6s ease-in-out infinite; }

        /* ----- Sheen ----- */
        .cs-sheen-mask { mix-blend-mode: screen; }
        @keyframes cs-sheen-kf {
          0%   { transform: translateX(-120%) skewX(-12deg); opacity: 0; }
          12%  { opacity: 0.55; }
          35%  { transform: translateX(220%)  skewX(-12deg); opacity: 0; }
          100% { transform: translateX(220%)  skewX(-12deg); opacity: 0; }
        }
        .cs-sheen {
          position: absolute; top: 0; left: 0; height: 100%; width: 40%;
          background: linear-gradient(100deg,
            rgba(255,255,255,0) 0%,
            rgba(255,235,200,0.22) 50%,
            rgba(255,255,255,0) 100%);
          filter: blur(4px);
          animation: cs-sheen-kf 7s ease-in-out 2.8s infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .cs-breathe, .cs-grain, .cs-vignette, .cs-logo-reveal, .cs-logo-backlit,
          .cs-hairline, .cs-tagline, .cs-pulse, .cs-sheen, .cs-bloom {
            animation: none !important;
          }
          .cs-logo-reveal { opacity: 1; filter: none; transform: none; }
          .cs-hairline { opacity: 1; transform: none; }
          .cs-tagline { opacity: 1; transform: none; }
          .cs-logo-backlit { filter: drop-shadow(0 0 22px rgba(201,165,126,0.18)); }
        }
      `}</style>
    </div>
  );
}
