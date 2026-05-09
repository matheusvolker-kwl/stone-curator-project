import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import retrato from "@/assets/ricardo-luiz-carlos.webp";

export default function ArtistaSection() {
  return (
    <section className="surface-ivory py-16 md:py-24 border-t border-western-stone-warm/10">
      <div className="container-western grid md:grid-cols-12 gap-10 md:gap-14 items-center">
        <div className="md:col-span-5">
          <div className="relative aspect-[4/5] overflow-hidden border border-western-gold/30 max-w-[380px]">
            <img
              src={retrato}
              alt="Ricardo e Luiz Carlos Botelho — segunda geração à frente da Western"
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-western-green-deep/90 backdrop-blur-sm px-5 py-3 border-t border-western-gold/30">
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-western-gold-soft">
                Geração 2 · desde 1996
              </p>
              <p className="font-display text-lg text-western-cream leading-tight mt-1">
                Ricardo & Luiz Carlos Botelho
              </p>
            </div>
          </div>
        </div>

        <div className="md:col-span-7">
          <p className="text-eyebrow mb-3">A família Botelho · 33 anos</p>
          <h2 className="font-display text-2xl md:text-4xl text-western-green-deep leading-[1.1] mb-6">
            Uma fábrica familiar que sobreviveu ao que{" "}
            <span className="italic font-light text-western-gold">
              quase todas as concorrentes abandonaram.
            </span>
          </h2>
          <div className="space-y-4 text-western-stone-warm leading-relaxed text-sm md:text-base max-w-xl">
            <p>
              Em 1993, <strong className="text-western-green-deep">Luiz Duarte Botelho</strong>{" "}
              trouxe do Arizona — dos mesmos artistas que assinaram trabalhos da Disney e de Las
              Vegas — a tecnologia de pedras artesanais em composto mineral. Foi a primeira no
              Brasil.
            </p>
            <p>
              Em 1996, os filhos <strong className="text-western-green-deep">Ricardo</strong> e{" "}
              <strong className="text-western-green-deep">Luiz Carlos Botelho</strong> retornaram
              do Japão e integraram a operação. Sob a segunda geração, a Western reduziu o tempo
              de uma matriz de 40 dias para 1, e tornou-se referência nacional do paisagismo de
              alto padrão.
            </p>
          </div>
          <Link
            to="/sobre"
            className="inline-flex items-center gap-2 mt-7 font-mono text-xs uppercase tracking-[0.22em] text-western-green-deep link-underline"
          >
            Conhecer a história completa <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </section>
  );
}
