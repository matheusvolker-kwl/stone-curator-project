import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import ricardoDesenhando from "@/assets/ricardo-desenhando.webp";

export default function ArtistaSection() {
  return (
    <section className="surface-ivory pt-14 md:pt-18 pb-14 md:pb-18 border-t border-western-border-soft">
      {/* Eyebrow centralizado, anunciando a seção */}
      <div className="container-western max-w-4xl text-center mb-7 md:mb-10">
        <p className="text-eyebrow mb-4">O artista</p>
        <div className="w-12 h-px bg-western-gold mx-auto" />
      </div>

      {/* Foto widescreen (com margem lateral). No celular, proporção mais alta:
       * 21/9 vira uma fresta de 60px numa tela de 390px. */}
      <figure className="relative mx-auto max-w-[1600px] px-4 md:px-8">
        <div className="relative aspect-[16/10] md:aspect-[21/9] overflow-hidden rounded-[16px] shadow-[0_28px_60px_-32px_rgba(15,41,24,0.45)]">
          <img
            src={ricardoDesenhando}
            alt="Ricardo Botelho desenhando uma nova matriz no ateliê Western em Cajamar/SP"
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover object-center"
          />
          {/* Legenda fixa (nunca dependente de hover — no celular não existe hover),
           * sobre overlay verde de proteção para garantir contraste AA. */}
          <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-western-green-deep/95 via-western-green-deep/70 to-transparent px-4 md:px-8 pt-16 pb-4 md:pb-6">
            <p className="font-sans text-[14px] font-semibold uppercase tracking-[0.06em] text-western-gold-soft">
              No ateliê · Cajamar/SP
            </p>
            <p className="font-sans text-[16px] text-western-cream mt-1">
              Ricardo desenhando uma nova matriz.
            </p>
          </figcaption>
        </div>
      </figure>

      {/* Bloco de texto abaixo — citação como herói + assinatura + CTA */}
      <div className="container-western max-w-4xl mt-9 md:mt-12 text-center">
        {/* Display Archivo, sempre ≥22px. Sem serifa, sem itálico, sem dourado
         * como cor de texto sobre fundo claro (dourado é acento sobre foto/verde). */}
        <blockquote className="display-xl text-western-green-deep">
          “Cada peça da Western nasce duas vezes: uma na natureza, outra no traço.”
        </blockquote>

        <div className="mt-6 mb-2">
          {/* Abaixo de 22px a display não entra: assinatura em sans semibold 20px. */}
          <p className="font-sans text-[20px] font-semibold text-western-green-deep">
            Ricardo Botelho
          </p>
          <p className="text-meta mt-1.5">
            Diretor criativo · Família Botelho, 2ª geração do ateliê
          </p>
        </div>

        {/* CTA primário = verde. Link com .btn-primary (52px, 16px, raio 10px). */}
        <Link to="/sobre" className="btn-primary mt-7 w-full sm:w-auto">
          Conhecer o ateliê <ArrowRight className="h-5 w-5" strokeWidth={1.75} />
        </Link>
      </div>
    </section>
  );
}
