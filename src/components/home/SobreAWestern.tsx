import { Link } from "react-router-dom";
import { Gem, Users, Boxes, Check, ArrowRight } from "lucide-react";
import Reveal from "@/components/shared/Reveal";
import { BUSINESS } from "@/config/business";

/**
 * "O que é a Western Store" — orientação para quem cai de paraquedas na home.
 *
 * Fica logo após o herói: no scroll, é o momento em que o visitante pergunta
 * "o que É isso, é pra mim, dá pra comprar?". Foi desenhada para ser lida NUM
 * RELANCE — pouco texto, ícone por pilar e bullets curtos (não parágrafos):
 * O QUE fazemos / PRA QUEM / COMO facilitamos a obra do parceiro. Fecha com a
 * bifurcação profissional × casa, onde a AÇÃO principal (cadastro → ver preços)
 * é o único botão sólido; a casa é um off-ramp discreto.
 *
 * Reutilizável: pode entrar (compacto) no catálogo/cadastro depois.
 */
const PILARES = [
  {
    Icon: Gem,
    t: "O que fazemos",
    itens: [
      "Cascatas, pedras, revestimentos e fontes",
      "~10% do peso — instala sem guindaste",
    ],
  },
  {
    Icon: Users,
    t: "Para quem é",
    itens: ["Arquitetos, paisagistas, laguistas e lojas", "Preço de atacado com CNPJ"],
  },
  {
    Icon: Boxes,
    t: "Como facilitamos sua obra",
    itens: ["Modelos 3D e conjuntos prontos", `Garantia de ${BUSINESS.garantiaLabel} + reposição`],
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
            <p className="text-body mt-4 max-w-[52ch]">
              O ateliê de pedra artesanal desde 1993 — agora, a loja do profissional.
            </p>
          </div>
        </Reveal>

        <div className="mt-10 md:mt-14 grid gap-8 md:grid-cols-3 md:gap-10">
          {PILARES.map(({ Icon, t, itens }, i) => (
            <Reveal key={t} variant="fade-up" delay={i * 90} duration={600} distance={16}>
              <div className="h-full">
                <span className="flex h-14 w-14 items-center justify-center rounded-[14px] bg-western-cta/10">
                  <Icon
                    className="h-7 w-7 text-western-cta"
                    strokeWidth={1.75}
                    aria-hidden="true"
                  />
                </span>
                <h3 className="font-display text-[21px] text-western-green-deep mt-5">{t}</h3>
                <ul className="mt-3 space-y-2.5">
                  {itens.map((it) => (
                    <li
                      key={it}
                      className="flex items-start gap-2.5 text-[16px] leading-snug text-western-stone-warm"
                    >
                      <Check
                        className="h-5 w-5 text-western-cta/70 mt-0.5 shrink-0"
                        strokeWidth={2}
                        aria-hidden="true"
                      />
                      {it}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Bifurca profissional × casa — a AÇÃO principal é o cadastro (ver preços);
            a casa é off-ramp discreto. Absorveu a antiga seção de segmentação. */}
        <Reveal variant="fade-up" duration={600}>
          <div className="mt-12 md:mt-16 border-t border-western-border-soft pt-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <p className="text-[18px] font-semibold text-western-green-deep max-w-[22ch]">
                Você é profissional, ou é para a sua casa?
              </p>
              <div className="flex flex-col gap-2.5 md:items-end">
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
                <p className="text-meta sm:text-right">
                  Grátis · aprovação na hora · precisa de CNPJ
                </p>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
