import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import ricardoDesenhando from "@/assets/ricardo-desenhando.webp";

export default function ArtistaSection() {
  return (
    <section
      aria-labelledby="artista-heading"
      className="relative surface-ivory pt-14 md:pt-20 pb-14 md:pb-20 border-t border-western-stone-warm/10 overflow-hidden"
    >
      {/* Eyebrow */}
      <div className="container-western max-w-4xl text-center mb-8 md:mb-12">
        <p id="artista-heading" className="text-eyebrow mb-4">O artista</p>
        <div className="w-12 h-px bg-western-gold mx-auto" />
      </div>

      {/* Still cinematográfico — foto domina, citação por cima */}
      <figure className="relative mx-auto max-w-[1600px] px-4 md:px-8">
        <div className="relative w-full overflow-hidden rounded-[2px] shadow-2xl shadow-western-green-deep/30 aspect-[4/5] sm:aspect-[16/10] md:aspect-[21/10] lg:aspect-[21/9]">
          <img
            src={ricardoDesenhando}
            alt="Ricardo Botelho, diretor criativo da Western, projetando à mão uma nova matriz de pedra no ateliê em Cajamar/SP."
            loading="lazy"
            decoding="async"
            className="absolute inset-0 w-full h-full object-cover object-center"
          />

          {/* Véu de legibilidade — mobile: base escura; desktop: lateral esquerda */}
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none md:hidden"
            style={{
              background:
                "linear-gradient(180deg, hsl(var(--western-green-deep) / 0.15) 0%, hsl(var(--western-green-deep) / 0.35) 45%, hsl(var(--western-green-deep) / 0.88) 100%)",
            }}
          />
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none hidden md:block"
            style={{
              background:
                "linear-gradient(95deg, hsl(var(--western-green-deep) / 0.88) 0%, hsl(var(--western-green-deep) / 0.6) 38%, hsl(var(--western-green-deep) / 0.15) 65%, transparent 85%)",
            }}
          />

          {/* Marca d'água discreta — canto superior direito, só desktop */}
          <div
            aria-hidden
            className="hidden md:flex absolute top-6 right-8 items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-western-cream/50"
          >
            <span className="w-8 h-px bg-western-gold/60" />
            No ateliê · Cajamar/SP
          </div>

          {/* Bloco editorial — citação + atribuição + CTA */}
          <div className="absolute inset-0 flex items-end md:items-center">
            <div className="w-full md:max-w-[62%] lg:max-w-[54%] px-6 pb-8 pt-16 md:pl-12 md:pr-8 md:py-12 lg:pl-16">
              {/* Filete dourado */}
              <div className="w-10 h-px bg-western-gold mb-5 md:mb-6" />

              <blockquote>
                <p className="font-display text-western-cream leading-[1.15] text-[1.75rem] sm:text-3xl md:text-4xl lg:text-[2.75rem]">
                  <span className="text-western-gold/70 mr-0.5">“</span>
                  Cada peça da Western nasce duas vezes:
                  <span className="italic font-light text-western-gold-soft"> uma na natureza, outra no traço.</span>
                  <span className="text-western-gold/70 ml-0.5">”</span>
                </p>
              </blockquote>

              <figcaption className="mt-6 md:mt-8">
                <p className="font-display text-lg md:text-xl text-western-cream">Ricardo Botelho</p>
                <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-western-cream/60 mt-1">
                  Diretor criativo · 2ª geração
                </p>
              </figcaption>

              <Link
                to="/sobre"
                className="group mt-7 md:mt-9 inline-flex items-center gap-2 min-h-[44px] px-5 py-3 rounded-[2px] bg-western-gold text-western-green-deep hover:bg-western-gold-soft font-mono text-[11px] uppercase tracking-[0.22em] transition-colors"
              >
                Conhecer o ateliê
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>
        </div>
      </figure>
    </section>
  );
}
