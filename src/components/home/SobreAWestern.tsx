import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpToLine, Feather, HardHat, Home } from "lucide-react";
import Reveal from "@/components/shared/Reveal";
/* PLACEHOLDER (dono, 2026-07-17): foto de escala 1,70 m. Trocar só este import
   e a legenda quando a foto definitiva vier. */
import escalaSantaBarbara from "@/assets/escala/WEST-CSB.webp";

/**
 * "A tecnologia Western" — 2ª seção da home. REDESIGN da diagramação
 * (2026-07-17, mesmo conteúdo, mesma voz) — o dono aprovou o conteúdo mas
 * reprovou a FORMA. Hierarquia 1+2 aprovada, agora bem diagramada:
 *   - Banda A: PROVA (foto-âncora limpa, prova ESCALA) + PROMESSA (herói com
 *     filete dourado — o que dá peso ao 1 sem ícone).
 *   - Banda B: os 2 fatos de apoio DISTRIBUÍDOS numa faixa 2-up de largura
 *     total, leves (ícone outline + corpo quieto): coadjuvantes claros.
 *   - Bifurcação: DUAS PORTAS gêmeas (tiles com ícone) — pergunta e escolha no
 *     MESMO bloco (antes a pergunta ficava de um lado e os links do outro).
 * Sem chip sobre a foto (a foto prova escala, não peso). Sem repetir o "o que
 * é" (vive no cabeçalho). Eixo = alternativa; nada diz que a PEÇA é mais barata.
 * Nada centralizado à força: 3 bandas num único eixo esquerdo (trilho do
 * container), demarcadas por hairlines. Ver [[western-voz-e-ordem]].
 */

const PROVA = {
  peca: "Cascata Santa Bárbara",
  pesoKg: 280,
  natural: "quase 3 toneladas",
};

/* Os 2 fatos de APOIO (o herói fica no JSX, com peso maior via filete dourado).
   1 ícone lucide por fato — ajudam a escanear, sem poluir. */
const APOIO = [
  {
    label: "Onde a pedra não entra",
    Icon: ArrowUpToLine,
    body: "Sacada, laje, cobertura, obra pronta. Sobe pela escada, cabe no elevador, apoia onde a pedra natural nunca subiria.",
  },
  {
    label: "O peso, em número",
    Icon: Feather,
    body: (
      <>
        {PROVA.peca}:{" "}
        <span className="font-semibold text-western-green-deep">{PROVA.pesoKg} kg</span>. A mesma
        peça em pedra natural passaria de{" "}
        <span className="font-semibold text-western-green-deep">{PROVA.natural}</span>.
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
        {/* CABEÇALHO — inalterado. Carrega o "o que é" (molde/textura/10%). */}
        <Reveal variant="fade-up" duration={650}>
          <div className="max-w-2xl">
            <p className="text-eyebrow mb-3">A tecnologia Western</p>
            <h2 className="display-lg text-western-green-deep">
              Por fora, é a pedra.
              <br />
              <span className="text-western-bronze">Por dentro, é invenção nossa.</span>
            </h2>
            <p className="text-body mt-4 max-w-[54ch]">
              Molde tirado da pedra real: mesma textura, mesma resistência, cerca de 10% do peso.
            </p>
            <p className="text-meta mt-3">Ateliê próprio em Cajamar, desde 1993.</p>
          </div>
        </Reveal>

        {/* BANDA A — PROVA + PROMESSA. items-center: foto alta e promessa curta
            se encontram no eixo do olho (equilibrado, não flutuante). */}
        <div className="mt-10 md:mt-14 grid gap-8 md:grid-cols-12 md:gap-12 lg:gap-16 md:items-center">
          {/* PROVA — foto-âncora limpa (4:5 nativo, sem crop, sem overlay). */}
          <Reveal variant="fade-up" duration={700} className="md:col-span-6 lg:col-span-5">
            <figure>
              <img
                src={escalaSantaBarbara}
                alt="Peça Western ao lado de uma pessoa de 1,70 m, num jardim — referência de tamanho real."
                width={1080}
                height={1341}
                loading="lazy"
                decoding="async"
                className="w-full aspect-[4/5] object-cover rounded-2xl"
              />
              <figcaption className="mt-4">
                <p className="text-body text-western-green-deep max-w-[34ch]">
                  Tamanho real, ao lado de uma pessoa de 1,70 m.
                </p>
                <p className="text-meta mt-1.5">Peça Western · escala verdadeira</p>
              </figcaption>
            </figure>
          </Reveal>

          {/* PROMESSA — o herói. O filete dourado (border-l) dá o peso do 1+2
              sem ícone. O link "Como a pedra é feita" mora aqui: enche a coluna
              e é o lugar contextual de "isso é pedra de verdade?". */}
          <Reveal variant="fade-up" delay={100} duration={700} className="md:col-span-6 lg:col-span-7">
            <div className="border-l-2 border-western-gold pl-5 md:pl-6">
              <h3 className="display-md text-western-green-deep">Você entrega o que desenhou.</h3>
              <p className="text-body mt-3 max-w-[48ch]">
                Tem bloco no SketchUp. Você mostra ao cliente na tela e entrega aquilo — sem
                içamento, sem empilhamento, sem surpresa na hora da obra.
              </p>
              <Link
                to="/a-pedra"
                className="tap-target mt-5 inline-flex items-center gap-1.5 font-sans text-[16px] font-semibold text-western-green-deep hover:text-western-cta transition-colors"
              >
                Como a pedra é feita
                <ArrowRight className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
              </Link>
            </div>
          </Reveal>
        </div>

        {/* BANDA B — os 2 apoios, distribuídos numa faixa 2-up de largura total.
            Leves de propósito (ícone outline + corpo quieto): coadjuvantes. */}
        <Reveal
          variant="fade-up"
          duration={600}
          className="mt-10 md:mt-12 border-t border-western-border-soft pt-8 md:pt-10"
        >
          <ul className="grid gap-8 md:grid-cols-2 md:gap-10">
            {APOIO.map(({ label, body, Icon }) => (
              <li key={label} className="flex items-start gap-4">
                <span className="mt-0.5 flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-western-border-soft bg-western-ivory text-western-bronze">
                  <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
                </span>
                <div>
                  <p className="text-eyebrow mb-1.5">{label}</p>
                  <p className="text-body max-w-[46ch]">{body}</p>
                </div>
              </li>
            ))}
          </ul>
        </Reveal>

        {/* BIFURCAÇÃO profissional × casa — DUAS PORTAS de peso idêntico.
            Conserta a queixa do dono: pergunta e escolhas no MESMO bloco (o olho
            não viaja de um lado ao outro). Nada centralizado — cabeçalho segue o
            rail à esquerda; os dois tiles ocupam a largura. Sem botão preto: o
            CTA cheio de cadastro vive no hero e volta em "Como comprar". */}
        <Reveal variant="fade-up" duration={600}>
          <div className="mt-12 md:mt-16 border-t border-western-border-soft pt-8 md:pt-10">
            <div className="max-w-xl">
              <p className="text-eyebrow mb-2">Por onde você começa</p>
              <h3 className="text-title-sm">Você é profissional, ou é para a sua casa?</h3>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 sm:gap-5">
              {PORTAS.map(({ to, Icon, titulo, desc, acao }) => (
                <Link
                  key={to}
                  to={to}
                  className="group tap-target flex flex-col rounded-2xl border border-western-border-soft bg-white p-6 md:p-7 shadow-[0_18px_36px_-30px_hsl(var(--western-stone-dark)/0.22)] transition-all duration-200 hover:-translate-y-0.5 hover:border-western-border-strong hover:shadow-[0_26px_48px_-28px_hsl(var(--western-stone-dark)/0.30)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-western-gold-soft focus-visible:ring-offset-2 focus-visible:ring-offset-western-paper"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-western-cream text-western-green-deep">
                    <Icon className="h-6 w-6" strokeWidth={1.6} aria-hidden="true" />
                  </span>
                  <h4 className="text-title-sm mt-5">{titulo}</h4>
                  <p className="text-body mt-2 max-w-[34ch]">{desc}</p>
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
