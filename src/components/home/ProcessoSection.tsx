import Reveal from "@/components/shared/Reveal";
import detalheMatriz from "@/assets/about-projetos/detalhe-matriz.jpg";
import cascataMirante from "@/assets/about-projetos/cascata-mirante.webp";
import cascataEscalonada from "@/assets/about-projetos/cascata-escalonada.jpg";
import ricardoDesenhando from "@/assets/ricardo-desenhando.webp";
import irmaosGruta from "@/assets/irmaos-botelho-gruta.webp";
import piscinaPraia from "@/assets/about-projetos/piscina-praia.webp";

const ETAPAS = [
  { n: "01", t: "Desenho da matriz", d: "Cada modelo nasce de um estudo em papel — direto do traço do Ricardo.", img: ricardoDesenhando, alt: "Ricardo desenhando uma nova matriz no ateliê." },
  { n: "02", t: "Escultura da forma", d: "A matriz é esculpida à mão, respeitando a geologia real da pedra referência.", img: detalheMatriz, alt: "Detalhe de matriz em processo de escultura." },
  { n: "03", t: "Composto mineral", d: "Fórmula de alta resistência: leve, durável e resistente a intempéries.", img: irmaosGruta, alt: "Fabricação artesanal no ateliê Western em Cajamar." },
  { n: "04", t: "Pintura em 6 fases", d: "Cinco cores sobrepostas por fase — simulando sedimentação geológica.", img: cascataEscalonada, alt: "Cascata escalonada com acabamento pintado à mão." },
  { n: "05", t: "Cura e acabamento", d: "Selante que resiste a cloro, raios UV e variação térmica sem manutenção.", img: cascataMirante, alt: "Cascata acabada instalada em mirante paisagístico." },
  { n: "06", t: "Instalação em obra", d: "Peças modulares, leves e sem guindaste — chegam prontas pra montagem.", img: piscinaPraia, alt: "Instalação Western em projeto de piscina praia." },
];

export default function ProcessoSection() {
  return (
    <section className="surface-ivory py-16 md:py-24 border-t border-western-stone-warm/10">
      <div className="container-western">
        <Reveal variant="fade-up" duration={700}>
          <div className="max-w-3xl mb-12 md:mb-16">
            <p className="text-eyebrow mb-4">Processo artesanal</p>
            <h2 className="font-display text-3xl md:text-5xl text-western-green-deep leading-[1.05]">
              Seis etapas entre o{" "}
              <span className="italic font-light text-western-gold">
                traço e a pedra.
              </span>
            </h2>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
          {ETAPAS.map((e, i) => (
            <Reveal key={e.n} variant="fade-up" delay={(i % 3) * 100} duration={700}>
              <article className="group">
                <div className="relative aspect-[4/5] overflow-hidden bg-western-paper mb-5">
                  <img
                    src={e.img}
                    alt={e.alt}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.04]"
                  />
                  <span className="absolute top-4 left-4 font-display text-3xl text-western-cream drop-shadow-[0_2px_10px_rgba(15,40,24,0.7)]">
                    {e.n}
                  </span>
                </div>
                <h3 className="font-display text-xl md:text-2xl text-western-green-deep mb-2 leading-tight">
                  {e.t}
                </h3>
                <p className="text-sm text-western-stone-warm leading-relaxed">
                  {e.d}
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
