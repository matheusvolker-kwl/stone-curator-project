import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Reveal from "@/components/shared/Reveal";
import boxAberta from "@/assets/western-box/box-aberta.webp.asset.json";
import lifestyle from "@/assets/western-box/lifestyle.webp.asset.json";

/**
 * Bloco editorial da Western Box na Home.
 * Mensagem central: amostra física + valor volta como crédito na 1ª compra.
 */
export default function WesternBoxTeaser() {
  return (
    <section className="surface-ivory py-16 md:py-24 border-t border-western-stone-warm/10">
      <div className="container-western grid md:grid-cols-2 gap-10 md:gap-16 items-center">
        <Reveal variant="fade-right" duration={800}>
          <div className="relative">
            <div className="aspect-[4/5] overflow-hidden bg-western-paper shadow-2xl shadow-western-green-deep/20">
              <img
                src={boxAberta.url}
                alt="Western Box — kit de amostras físicas das pedras artesanais."
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="hidden md:block absolute -bottom-10 -right-10 w-2/3 aspect-[4/3] overflow-hidden border-8 border-western-ivory shadow-xl shadow-western-green-deep/25">
              <img
                src={lifestyle.url}
                alt="Amostras Western em uso durante especificação de projeto."
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </Reveal>

        <Reveal variant="fade-left" delay={120} duration={800}>
          <div>
            <p className="text-eyebrow mb-4">Western Box · Amostras físicas</p>
            <h2 className="font-display text-3xl md:text-5xl text-western-green-deep leading-[1.05] mb-6">
              Sinta a pedra{" "}
              <span className="italic font-light text-western-gold">
                antes de especificar.
              </span>
            </h2>
            <p className="text-western-stone-warm text-base md:text-[17px] leading-relaxed mb-6 max-w-md">
              Quatro acabamentos em amostras reais — Quartzo, Arenito, Moledo e
              Granito — enviados até você. Cor, textura, densidade: tudo o que
              a tela não mostra.
            </p>

            <div className="border-l-2 border-western-gold pl-5 py-2 mb-8 bg-western-cream/40">
              <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-western-green-deep mb-1.5">
                Risco zero
              </p>
              <p className="text-sm text-western-green-deep">
                O valor investido na box volta como{" "}
                <strong className="font-semibold">crédito integral</strong> na
                sua primeira compra.
              </p>
            </div>

            <Link
              to="/western-box"
              className="inline-flex items-center gap-2 h-12 px-7 bg-western-green-deep text-western-cream hover:bg-western-green-deep/90 font-mono text-xs uppercase tracking-[0.22em] transition-colors"
            >
              Conhecer a Western Box <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
