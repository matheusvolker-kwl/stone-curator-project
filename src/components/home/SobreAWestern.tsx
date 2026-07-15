import { Link } from "react-router-dom";
import { Gem, Users, Boxes, ArrowRight } from "lucide-react";
import Reveal from "@/components/shared/Reveal";
import { BUSINESS } from "@/config/business";

/**
 * "O que é a Western Store" — orientação para quem cai de paraquedas na home.
 *
 * Fica logo após o herói: no scroll, é o momento em que o visitante pergunta
 * "espera, o que É isso, é pra mim, dá pra comprar?". Responde O QUE fazemos,
 * PRA QUEM e COMO facilitamos a obra do parceiro (foco B2B), e então bifurca
 * (profissional × casa). Substituiu/absorveu a antiga seção de segmentação —
 * o fork virou os dois CTAs no rodapé da seção, sem alongar a home.
 *
 * Reutilizável: pode entrar (numa versão compacta) no catálogo/cadastro depois.
 */
const PILARES = [
  {
    Icon: Gem,
    t: "O que fazemos",
    d: "Cascatas, pedras, revestimentos e fontes que reproduzem a pedra natural — com cerca de 10% do peso, atóxicas e prontas pra instalar.",
  },
  {
    Icon: Users,
    t: "Para quem é",
    d: "Arquitetos, paisagistas, laguistas, piscineiros e lojas. O preço de parceiro (atacado) é liberado no cadastro com CNPJ.",
  },
  {
    Icon: Boxes,
    t: "Como facilitamos sua obra",
    d: `Modelos 3D, conjuntos prontos e ficha técnica. Produção em ${BUSINESS.prazoProducaoLabel}, garantia de ${BUSINESS.garantiaLabel} e reposição.`,
  },
];

export default function SobreAWestern() {
  return (
    <section
      id="o-que-e"
      className="surface-paper border-b border-western-border-soft py-16 md:py-24"
      aria-label="O que é a Western Store"
    >
      <div className="container-western max-w-5xl">
        <Reveal variant="fade-up" duration={650}>
          <div className="max-w-2xl">
            <p className="text-eyebrow mb-3">A Western Store</p>
            <h2 className="display-lg text-western-green-deep">
              Pedra artesanal, para quem projeta e revende.
            </h2>
            <p className="text-body mt-4 max-w-[58ch]">
              Ateliê próprio desde 1993. Reproduzimos a pedra natural com cerca de
              10% do peso — instala sem guindaste, até em cobertura. Aqui o
              profissional compra no atacado, com projeto e suporte do ateliê.
            </p>
          </div>
        </Reveal>

        <div className="mt-10 md:mt-12 grid gap-8 md:grid-cols-3">
          {PILARES.map(({ Icon, t, d }, i) => (
            <Reveal key={t} variant="fade-up" delay={i * 90} duration={600} distance={16}>
              <div className="h-full">
                <span className="flex h-12 w-12 items-center justify-center rounded-[12px] bg-western-cta/10">
                  <Icon
                    className="h-6 w-6 text-western-cta"
                    strokeWidth={1.75}
                    aria-hidden="true"
                  />
                </span>
                <h3 className="font-display text-[20px] text-western-green-deep mt-4">{t}</h3>
                <p className="text-[16px] leading-[1.6] text-western-stone-warm mt-2">{d}</p>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Bifurca profissional × casa — absorveu a antiga seção de segmentação. */}
        <Reveal variant="fade-up" duration={600}>
          <div className="mt-10 md:mt-12 flex flex-col gap-4 border-t border-western-border-soft pt-8 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[17px] font-semibold text-western-green-deep">
              Você é profissional, ou é para a sua casa?
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link to="/parceiro/cadastro" className="btn-primary w-full sm:w-auto">
                Criar cadastro · ver preços
                <ArrowRight className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
              </Link>
              <Link
                to="/para-sua-casa"
                className="tap-target inline-flex items-center justify-center gap-1.5 font-sans text-[16px] font-semibold text-western-green-deep hover:text-western-cta transition-colors"
              >
                É para a minha casa
                <ArrowRight className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
