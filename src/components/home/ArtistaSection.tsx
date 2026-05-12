import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import ricardoDesenhando from "@/assets/ricardo-desenhando.webp";

export default function ArtistaSection() {
  return (
    <section className="surface-ivory pt-14 md:pt-18 pb-14 md:pb-18 border-t border-western-stone-warm/10">
      {/* Eyebrow centralizado, anunciando a seção */}
      <div className="container-western max-w-4xl text-center mb-7 md:mb-10">
        <p className="text-eyebrow mb-4">O artista</p>
        <div className="w-12 h-px bg-western-gold mx-auto" />
      </div>

      {/* Foto widescreen full-bleed (com pequena margem lateral) */}
      <figure className="relative mx-auto max-w-[1600px] px-4 md:px-8">
        <div className="relative aspect-[21/9] overflow-hidden shadow-2xl shadow-western-green-deep/25">
          <img
            src={ricardoDesenhando}
            alt="Ricardo Botelho desenhando uma nova matriz no ateliê Western em Cajamar/SP"
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover object-center"
          />
          {/* Legenda flutuante no canto inferior */}
          <figcaption className="absolute bottom-4 left-4 md:bottom-6 md:left-8 pl-3 border-l-2 border-western-gold bg-western-green-deep/40 backdrop-blur-sm py-1.5 pr-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-western-gold-soft">
              No ateliê · Cajamar/SP
            </p>
            <p className="text-xs text-western-cream/90 mt-0.5">
              Ricardo desenhando uma nova matriz.
            </p>
          </figcaption>
        </div>
      </figure>

      {/* Bloco de texto abaixo — citação como herói + corpo + CTA */}
      <div className="container-western max-w-6xl mt-8 md:mt-10 text-center">
        <blockquote className="font-display text-2xl md:text-4xl lg:text-[2.75rem] text-western-green-deep leading-[1.15]">
          <span className="text-western-gold-soft">“</span>Cada peça da Western nasce duas vezes:<br />
          <span className="italic font-light text-western-gold">
            uma na natureza, outra no traço.
          </span>
          <span className="text-western-gold-soft">”</span>
        </blockquote>

        <div className="mt-5 mb-2">
          <p className="font-display text-xl text-western-green-deep">
            Ricardo Botelho
          </p>
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-western-stone-warm/70 mt-1.5">
            Diretor criativo · 2ª geração
          </p>
        </div>

        <Link
          to="/sobre"
          className="inline-flex items-center gap-2 mt-6 font-mono text-xs uppercase tracking-[0.22em] text-western-green-deep link-underline"
        >
          Conhecer o ateliê <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </section>
  );
}
