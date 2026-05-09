import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import ricardoDesenhando from "@/assets/ricardo-desenhando.png";

export default function ArtistaSection() {
  return (
    <section className="surface-ivory py-20 md:py-28 border-t border-western-stone-warm/10">
      <div className="container-western max-w-6xl grid md:grid-cols-12 gap-10 md:gap-16 items-center">
        {/* Foto — ocupa o respiro */}
        <div className="md:col-span-7">
          <figure className="relative">
            <div className="aspect-[4/3] md:aspect-[5/4] overflow-hidden shadow-2xl shadow-western-green-deep/20">
              <img
                src={ricardoDesenhando}
                alt="Ricardo Botelho desenhando uma matriz no ateliê Western"
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover transition-transform duration-[1500ms] ease-out hover:scale-[1.03]"
              />
            </div>
            <figcaption className="mt-4 pl-4 border-l-2 border-western-gold">
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-western-gold-soft">
                No ateliê · Cajamar/SP
              </p>
              <p className="text-spec text-western-stone-warm/80 mt-1">
                Ricardo desenhando uma nova matriz.
              </p>
            </figcaption>
          </figure>
        </div>

        {/* Texto — frase como herói */}
        <div className="md:col-span-5">
          <p className="text-eyebrow mb-5">O artista</p>
          <div className="w-12 h-px bg-western-gold mb-7" />

          <blockquote className="font-display text-2xl md:text-4xl lg:text-[2.6rem] text-western-green-deep leading-[1.12]">
            <span className="text-western-gold-soft">“</span>Cada peça da Western nasce duas vezes:{" "}
            <span className="italic font-light text-western-gold">
              uma na natureza, outra no traço.
            </span>
            <span className="text-western-gold-soft">”</span>
          </blockquote>

          <div className="mt-7 mb-8">
            <p className="font-display text-lg text-western-green-deep">
              Ricardo Botelho
            </p>
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-western-stone-warm/70 mt-1">
              Diretor criativo · 2ª geração
            </p>
          </div>

          <p className="text-sm md:text-base text-western-stone-warm leading-relaxed max-w-md">
            Ricardo desenha cada matriz, define a paleta das seis camadas de
            pintura e assina o gesto de toda peça que sai do ateliê. É o traço
            dele que transforma uma pedra encontrada na mata em elemento autoral
            de projeto.
          </p>

          <Link
            to="/sobre"
            className="inline-flex items-center gap-2 mt-9 font-mono text-xs uppercase tracking-[0.22em] text-western-green-deep link-underline"
          >
            Conhecer o ateliê <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </section>
  );
}
