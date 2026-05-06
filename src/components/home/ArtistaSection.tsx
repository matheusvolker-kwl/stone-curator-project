import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import retrato from "@/assets/ricardo-botelho.webp";

export default function ArtistaSection() {
  return (
    <section className="surface-ivory py-14 md:py-20 border-t border-western-stone-warm/10">
      <div className="container-western grid md:grid-cols-12 gap-8 md:gap-12 items-center">
        <div className="md:col-span-4">
          <div className="relative aspect-[4/5] overflow-hidden border border-western-gold/30 max-w-[320px]">
            <img
              src={retrato}
              alt="Ricardo Botelho, desenhista e escultor — autor das peças Western"
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        <div className="md:col-span-7 md:col-start-6">
          <p className="text-eyebrow mb-3">Por trás da curadoria</p>
          <h2 className="font-display text-2xl md:text-4xl text-western-green-deep leading-[1.1] mb-5">
            Cada peça nasce do traço de{" "}
            <span className="italic font-light text-western-gold">Ricardo Botelho.</span>
          </h2>
          <p className="text-western-stone-warm leading-relaxed max-w-xl mb-6 text-sm md:text-base">
            Desenhista e escultor, Ricardo é o autor dos projetos de cada item do
            catálogo Western. Da observação da pedra natural até a produção em
            composto mineral de alta resistência, todo o conjunto tem coerência
            porque tem um único olhar organizando.
          </p>
          <Link
            to="/sobre"
            className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.22em] text-western-green-deep link-underline"
          >
            Conhecer a Western <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </section>
  );
}
