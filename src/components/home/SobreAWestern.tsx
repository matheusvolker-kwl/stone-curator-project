import { Link } from "react-router-dom";
import {
  ArrowRight,
  Box,
  Feather,
  Fingerprint,
  HardHat,
  Home,
  Paintbrush,
  Recycle,
  ShoppingBag,
} from "lucide-react";
import Reveal from "@/components/shared/Reveal";
import pg3Ambientada from "@/assets/tecnologia/pg3-ambientada.webp";

/**
 * "A tecnologia Western" — 2ª seção da home, formato "linha de produção"
 * (V1 escolhida pelo dono no lab, 2026-07-18). Função: quem desceu do hero
 * entende O QUE a Western faz, POR QUE faz sentido e percebe que PODE COMPRAR
 * aqui — didático, escaneável, com o produto aplicado como palco.
 *   - Cabeçalho em 2 colunas (headline 7 / apoio 5, base alinhada).
 *   - Foto panorâmica da PG3 ambientada (o produto na prainha) — a prova
 *     visual de que "isso aqui vira obra de verdade".
 *   - 4 passos numerados com ícones, na ordem em que a peça nasce:
 *     molde real → mineral + PET (oca) → ~10% do peso → pronta pra obra.
 *   - Fecho com CTA de catálogo (a ponte pra loja) + bifurcação de sempre.
 */

const PASSOS = [
  {
    Icon: Fingerprint,
    titulo: "Molde da pedra real",
    corpo:
      "O molde nasce de uma rocha natural, no lugar onde ela está. Fissuras, veios e textura vêm dela.",
  },
  {
    Icon: Recycle,
    titulo: "Mineral + PET reciclado",
    corpo:
      "Casca de composto mineral de alta resistência, armada com fibra de PET. A peça nasce oca.",
  },
  {
    Icon: Paintbrush,
    titulo: "Seis camadas de pintura",
    corpo:
      "Aplicadas à mão antes da entrega. E o tempo trabalha a favor: a cor ganha pátina e a peça fica cada vez mais parecida com a rocha.",
  },
  {
    Icon: Feather,
    titulo: "Cerca de 10% do peso",
    corpo:
      "Cascata Santa Bárbara: 280 kg. A mesma peça em pedra natural passaria de 3 toneladas.",
  },
  {
    Icon: Box,
    titulo: "Bloco 3D no SketchUp",
    corpo:
      "Cada peça tem seu modelo 3D. Você projeta com a peça exata e o cliente aprova o que vai receber — antes da obra.",
  },
  {
    Icon: ShoppingBag,
    titulo: "Pronta, do ateliê pra obra",
    corpo:
      "Pisável, perfurável, esconde a fiação. Produzida em 15 dias úteis e enviada pro Brasil todo.",
  },
];

/* As DUAS PORTAS da bifurcação — tiles gêmeos de peso idêntico (equilíbrio, não
   pirâmide). Cada card inteiro é o alvo (1 foco por caminho). */
const PORTAS = [
  {
    to: "/parceiro/cadastro",
    Icon: HardHat,
    titulo: "Sou profissional",
    desc: "Preços de parceiro, catálogo completo e condições para o seu projeto.",
    acao: "Ver preços",
  },
  {
    to: "/para-sua-casa",
    Icon: Home,
    titulo: "É para a minha casa",
    desc: "Do projeto à obra: a Western leva a pedra até o seu jardim.",
    acao: "Ver como funciona",
  },
];

export default function SobreAWestern() {
  return (
    <section
      id="o-que-e"
      className="surface-paper border-b border-western-border-soft py-16 md:py-24"
      aria-label="A tecnologia Western"
    >
      <div className="container-western">
        {/* CABEÇALHO — headline à esquerda, apoio à direita, base alinhada. */}
        <Reveal variant="fade-up" duration={650}>
          <div className="grid gap-4 md:grid-cols-12 md:gap-12 lg:gap-16 md:items-end">
            <div className="md:col-span-7">
              <p className="text-eyebrow mb-3">A tecnologia Western</p>
              <h2 className="display-lg text-western-green-deep">
                Por fora, é a pedra.
                <br />
                <span className="text-western-bronze">Por dentro, é invenção nossa.</span>
              </h2>
            </div>
            <div className="md:col-span-5 md:pb-1.5">
              <p className="text-body max-w-[44ch]">
                Réplica autoral de pedra natural, feita à mão. Entenda em quatro passos por que ela
                entra onde a rocha nunca entraria.
              </p>
              <p className="text-meta mt-3">Ateliê próprio em Cajamar, desde 1993.</p>
            </div>
          </div>
        </Reveal>

        {/* O PRODUTO COMO PALCO — PG3 ambientada na prainha. */}
        <Reveal variant="fade-up" duration={700}>
          <figure className="mt-10 md:mt-12">
            <div className="relative overflow-hidden rounded-xl aspect-[4/3] sm:aspect-[16/9] lg:aspect-[21/9]">
              <img
                src={pg3Ambientada}
                alt="Pedra Grande 3 — peça Western instalada na prainha de uma piscina de praia"
                width={2000}
                height={1500}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover object-[50%_62%]"
              />
            </div>
            <figcaption className="mt-4 flex items-baseline justify-between gap-4">
              <p className="text-body text-western-green-deep">
                Pedra Grande 3, instalada na prainha — pisável, com a fiação escondida por dentro.
              </p>
              <p className="text-meta shrink-0">Catálogo · Pedras Grandes</p>
            </figcaption>
          </figure>
        </Reveal>

        {/* OS 4 PASSOS — a didática, na ordem em que a peça nasce. */}
        <Reveal variant="fade-up" duration={650}>
          {/* 6 passos = 2 fileiras de 3 no desktop (4+2 desequilibra); 2 col no
              tablet; pilha no celular. */}
          <ol className="mt-10 md:mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-10 lg:gap-y-12 border-t border-western-border-soft pt-8 md:pt-10">
            {PASSOS.map(({ Icon, titulo, corpo }, i) => (
              <li key={titulo}>
                <div className="flex items-center gap-3">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-western-cream text-western-green-deep">
                    <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
                  </span>
                  <span
                    className="font-sans text-[14px] font-semibold tracking-[0.06em] text-western-bronze"
                    aria-hidden="true"
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3 className="text-title-sm text-western-green-deep mt-4">{titulo}</h3>
                <p className="text-body mt-2">{corpo}</p>
              </li>
            ))}
          </ol>
        </Reveal>

        {/* FECHO — a ponte pra loja + rota de aprofundamento. */}
        <Reveal variant="fade-up" duration={600}>
          <div className="mt-10 md:mt-12 flex flex-col sm:flex-row sm:items-center gap-4 border-t border-western-border-soft pt-8">
            <Link to="/produtos" className="btn-primary w-full sm:w-auto">
              Ver o catálogo completo
              <ArrowRight className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
            </Link>
            <Link
              to="/a-pedra"
              className="tap-target inline-flex items-center gap-1.5 font-sans text-[15px] font-semibold text-western-green-deep hover:text-western-cta transition-colors"
            >
              Como a pedra é feita
              <ArrowRight className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
            </Link>
          </div>
        </Reveal>

        {/* BIFURCAÇÃO profissional × casa — pergunta à esquerda, portas à direita. */}
        <Reveal variant="fade-up" duration={600}>
          <div className="mt-12 md:mt-16 border-t border-western-border-soft pt-8 md:pt-10 grid gap-6 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-4">
              <p className="text-eyebrow mb-2">Por onde você começa</p>
              <h3 className="text-title-sm max-w-[22ch]">
                Você é profissional, ou é para a sua casa?
              </h3>
            </div>

            <div className="lg:col-span-8 grid gap-4 sm:grid-cols-2 sm:gap-5">
              {PORTAS.map(({ to, Icon, titulo, desc, acao }) => (
                <Link
                  key={to}
                  to={to}
                  className="group tap-target flex flex-col rounded-xl border border-western-border-soft bg-white p-6 md:p-7 shadow-[0_18px_36px_-30px_hsl(var(--western-stone-dark)/0.22)] transition-all duration-200 hover:-translate-y-0.5 hover:border-western-border-strong hover:shadow-[0_26px_48px_-28px_hsl(var(--western-stone-dark)/0.30)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-western-gold-soft focus-visible:ring-offset-2 focus-visible:ring-offset-western-paper"
                >
                  <div className="flex items-center gap-4">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-western-cream text-western-green-deep">
                      <Icon className="h-6 w-6" strokeWidth={1.6} aria-hidden="true" />
                    </span>
                    <h4 className="text-title-sm">{titulo}</h4>
                  </div>
                  <p className="text-body mt-4 max-w-[34ch]">{desc}</p>
                  <span className="mt-5 inline-flex items-center gap-1.5 font-sans text-[15px] font-semibold text-western-green-deep transition-colors group-hover:text-western-cta">
                    {acao}
                    <ArrowRight
                      className="h-5 w-5 transition-transform group-hover:translate-x-0.5"
                      strokeWidth={1.75}
                      aria-hidden="true"
                    />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
