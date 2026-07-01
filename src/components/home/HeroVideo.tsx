import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import heroCascata from "@/assets/hero-cascata.webp";
import iconePedraBranco from "@/assets/icone-pedra-branco.png";

/**
 * HERO editorial com vídeo em loop. Fallback = still + gradiente escuro.
 * Vídeo é muted/autoplay/loop/playsInline pra rodar sem interação, com poster.
 */
export default function HeroVideo() {
  return (
    <section className="relative w-full h-[78vh] min-h-[560px] overflow-hidden bg-western-green-deep">
      <video
        className="absolute inset-0 w-full h-full object-cover"
        src="/videos/projetos/cascata.mp4"
        poster={heroCascata}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden
      />
      {/* Scrim vertical à esquerda pra leitura do texto sobre o vídeo */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden
        style={{
          background:
            "linear-gradient(95deg, hsl(var(--western-green-deep) / 0.92) 0%, hsl(var(--western-green-deep) / 0.65) 42%, hsl(var(--western-green-deep) / 0.15) 78%, transparent 100%)",
        }}
      />
      {/* Grão + vinheta inferior sutil */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden
        style={{
          background:
            "linear-gradient(to top, hsl(var(--western-green-deep) / 0.55) 0%, transparent 40%)",
        }}
      />

      <img
        src={iconePedraBranco}
        alt=""
        aria-hidden
        className="absolute right-[6%] top-1/2 -translate-y-1/2 w-[38vw] max-w-[520px] opacity-[0.12] pointer-events-none select-none mix-blend-screen"
      />

      <div className="absolute inset-0 flex items-center">
        <div className="container-western w-full">
          <div className="max-w-xl text-western-cream animate-fade-in">
            <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-western-gold-soft mb-5">
              Desde 1993 · Cajamar/SP
            </p>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl leading-[1.05] mb-6">
              Pedras artesanais para{" "}
              <span className="italic font-light text-western-gold-soft">
                projetos profissionais.
              </span>
            </h1>
            <p className="text-base md:text-lg text-western-cream/85 max-w-md mb-10 leading-relaxed">
              Cascatas, revestimentos e composições em composto mineral —
              feitas peça a peça para arquitetos e paisagistas.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                to="/linhas"
                className="inline-flex items-center gap-2 h-12 px-7 bg-western-gold text-western-green-deep hover:bg-western-gold-soft font-mono text-xs uppercase tracking-[0.22em] transition-colors"
              >
                Ver catálogo <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/western-box"
                className="inline-flex items-center gap-2 h-12 px-7 border border-western-cream/50 text-western-cream hover:border-western-gold hover:text-western-gold-soft font-mono text-xs uppercase tracking-[0.22em] transition-colors"
              >
                Peça as amostras
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
