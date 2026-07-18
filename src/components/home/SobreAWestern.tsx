import { Link } from "react-router-dom";
import { ArrowRight, HardHat, Home } from "lucide-react";
import Reveal from "@/components/shared/Reveal";
/* PLACEHOLDER (dono, 2026-07-17): foto de escala 1,70 m. Trocar só este import
   e a legenda quando a foto definitiva vier. */
import escalaSantaBarbara from "@/assets/escala/WEST-CSB.webp";

/**
 * "A tecnologia Western" — 2ª seção da home. REDIAGRAMAÇÃO (2026-07-18):
 * o conteúdo segue o aprovado (o quê / pra quem / o que muda), mas agora numa
 * ÚNICA composição de 12 colunas em vez de 4 bandas empilhadas:
 *   - Cabeçalho em 2 colunas (headline 7 / apoio 5, alinhados pela base) —
 *     mata a meia-tela vazia à direita do display.
 *   - Corpo em 2 colunas que se ESTICAM juntas (items-stretch): foto-âncora de
 *     escala à esquerda; à direita os TRÊS fatos com o MESMO tratamento
 *     tipográfico (número bronze + título + corpo), hairlines entre eles,
 *     distribuídos pela altura da foto (justify-between) — margens de topo e
 *     base alinhadas com a figura.
 *   - Bifurcação na mesma gramática: pergunta na coluna esquerda (4) e as duas
 *     portas à direita (8) — não é mais uma 4ª banda solta.
 * Ícones de apoio saíram (eram um 3º padrão visual); a numeração 01–03 conversa
 * com o "Como comprar" (1–4) e os passos da PDP. Mobile: pilha única —
 * headline → apoio → foto → fatos → portas (~2,5 telas, antes ~5).
 */

const FATOS: { titulo: string; corpo: React.ReactNode }[] = [
  {
    titulo: "Você entrega o que desenhou.",
    corpo:
      "Tem bloco no SketchUp. Você mostra ao cliente na tela e entrega aquilo — sem içamento, sem empilhamento, sem surpresa na hora da obra.",
  },
  {
    titulo: "Entra onde a pedra não entra.",
    corpo:
      "Sacada, laje, cobertura, obra pronta. Sobe pela escada, cabe no elevador, apoia onde a pedra natural nunca subiria.",
  },
  {
    titulo: "O peso, em número.",
    corpo: (
      <>
        Cascata Santa Bárbara: <span className="font-semibold text-western-green-deep">280 kg</span>.
        A mesma peça em pedra natural passaria de{" "}
        <span className="font-semibold text-western-green-deep">quase 3 toneladas</span>.
      </>
    ),
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
        {/* CABEÇALHO — headline à esquerda, apoio à direita, base alinhada.
            O parágrafo de apoio ocupa a meia-tela que antes ficava vazia. */}
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
                Molde tirado da pedra real: mesma textura, mesma resistência, cerca de 10% do peso.
              </p>
              <p className="text-meta mt-3">Ateliê próprio em Cajamar, desde 1993.</p>
            </div>
          </div>
        </Reveal>

        {/* CORPO — foto-âncora + 3 fatos no mesmo tratamento. As duas colunas
            se esticam juntas: topo do fato 01 alinha com o topo da foto, o link
            fecha na base (margens alinhadas, nada flutuando). */}
        <div className="mt-10 md:mt-14 grid gap-10 md:grid-cols-12 md:gap-12 lg:gap-16 md:items-stretch">
          {/* A COLUNA DOS FATOS define a altura da linha; a foto preenche essa
              altura com object-cover (nada de justify-between esticando os
              fatos — os vãos entre hairlines ficavam maiores que o conteúdo). */}
          <Reveal variant="fade-up" duration={700} className="md:col-span-5">
            <figure className="h-full flex flex-col">
              <div className="relative flex-1 overflow-hidden rounded-2xl aspect-[4/3] md:aspect-auto">
                <img
                  src={escalaSantaBarbara}
                  alt="Peça Western ao lado de uma pessoa de 1,70 m, num jardim — referência de tamanho real."
                  width={1080}
                  height={1341}
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-cover"
                />
              </div>
              <figcaption className="mt-4 flex items-baseline justify-between gap-4">
                <p className="text-body text-western-green-deep">
                  Tamanho real, ao lado de uma pessoa de 1,70 m.
                </p>
                <p className="text-meta shrink-0">Escala verdadeira</p>
              </figcaption>
            </figure>
          </Reveal>

          <Reveal variant="fade-up" delay={100} duration={700} className="md:col-span-7">
            <div className="flex flex-col gap-7">
              {FATOS.map(({ titulo, corpo }, i) => (
                <div
                  key={titulo}
                  className={
                    i === 0
                      ? "grid grid-cols-[2.75rem_1fr] gap-x-4"
                      : "grid grid-cols-[2.75rem_1fr] gap-x-4 border-t border-western-border-soft pt-7"
                  }
                >
                  <span
                    className="font-sans text-[14px] font-semibold tracking-[0.06em] text-western-bronze pt-1.5"
                    aria-hidden="true"
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="text-title-sm text-western-green-deep">{titulo}</h3>
                    <p className="text-body mt-2 max-w-[52ch]">{corpo}</p>
                  </div>
                </div>
              ))}

              <div className="grid grid-cols-[2.75rem_1fr] gap-x-4 border-t border-western-border-soft pt-6">
                <span aria-hidden="true" />
                <Link
                  to="/a-pedra"
                  className="tap-target inline-flex w-fit items-center gap-1.5 font-sans text-[16px] font-semibold text-western-green-deep hover:text-western-cta transition-colors"
                >
                  Como a pedra é feita
                  <ArrowRight className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
                </Link>
              </div>
            </div>
          </Reveal>
        </div>

        {/* BIFURCAÇÃO profissional × casa — mesma gramática de 12 colunas:
            pergunta à esquerda, as duas portas à direita. Deixou de ser uma
            banda extra centrada em si mesma. */}
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
                  className="group tap-target flex flex-col rounded-2xl border border-western-border-soft bg-white p-6 md:p-7 shadow-[0_18px_36px_-30px_hsl(var(--western-stone-dark)/0.22)] transition-all duration-200 hover:-translate-y-0.5 hover:border-western-border-strong hover:shadow-[0_26px_48px_-28px_hsl(var(--western-stone-dark)/0.30)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-western-gold-soft focus-visible:ring-offset-2 focus-visible:ring-offset-western-paper"
                >
                  <div className="flex items-center gap-4">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-western-cream text-western-green-deep">
                      <Icon className="h-6 w-6" strokeWidth={1.6} aria-hidden="true" />
                    </span>
                    <h4 className="text-title-sm">{titulo}</h4>
                  </div>
                  <p className="text-body mt-4 max-w-[34ch]">{desc}</p>
                  <span className="mt-5 inline-flex items-center gap-1.5 font-sans text-[16px] font-semibold text-western-green-deep transition-colors group-hover:text-western-cta">
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
