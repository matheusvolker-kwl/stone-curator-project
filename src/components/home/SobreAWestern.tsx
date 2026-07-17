import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Reveal from "@/components/shared/Reveal";
/* PLACEHOLDER (dono, 2026-07-17): a foto das duas pessoas carregando a pedra
   PROVAVA leveza melhor, mas tinha máscaras de COVID visíveis / era foto de
   celular. O dono reverteu SÓ a imagem e vai escolher outra com calma. A
   hierarquia 1+2 e a copy ficaram (foram aprovadas). Quando a foto nova vier,
   troca-se só este import e a legenda abaixo. */
import escalaSantaBarbara from "@/assets/escala/WEST-CSB.webp";

/**
 * "A tecnologia Western" — 2ª seção da home: o QUE / PRA QUEM / PORQUÊ.
 *
 * Reprovação do dono (2026-07-17): "a imagem tá muito estranha, o design todo
 * não está no padrão de qualidade". Dois defeitos concretos:
 *   1. A FOTO não provava a legenda. WEST-CSB.webp é um render de uma pessoa ao
 *      LADO de uma peça, tocando-a — a legenda dizia "a três metros nem o
 *      fundador acerta", mas ela está a um braço de distância. Nada ali prova
 *      leveza; metade do quadro é gramado.
 *   2. A HIERARQUIA era plana. Três blocos com o MESMO peso tipográfico = o
 *      wireframe genérico. Sem argumento principal, nada é memorável.
 *
 * O conserto:
 *   - A FOTO agora PROVA sem número: duas pessoas seguram, sorrindo e com as
 *     mãos, uma pedra que em pedra natural pediria guindaste. É a leveza vista,
 *     não afirmada — dispensa a legenda-truque dos "três metros".
 *   - A HIERARQUIA vira 1 + 2: um argumento PRINCIPAL grande (você entrega o que
 *     desenhou — o diferencial de entregabilidade) e dois fatos de apoio menores
 *     (onde a pedra não entra; o peso em número). Um herói, dois coadjuvantes.
 *
 * Eixo = ALTERNATIVA, nunca acusação (decisão do dono, 2026-07-16): o argumento
 * é o que a Western FAZ, não o que o leitor teria deixado de fazer. Sem "desistiu",
 * sem "matacão", sem % dizendo que a PEÇA é mais barata.
 *
 * Fecha com o link "Como a pedra é feita → /a-pedra" e a bifurcação
 * profissional × casa, preservada verbatim.
 *
 * Específica da home — presume o slot logo após o herói. Não é reutilizável.
 */

/* A PROVA em número, amarrada a um SKU NOMEADO — nunca ao genérico "uma cascata
   grande", que ninguém pode conferir. Fonte: obras.ts:181,186 ("Cascata Santa
   Bárbara, 280 kg"), o único peso PUBLICADO para este SKU. O equivalente natural
   usa a MESMA conta da PDP (peso × 10 = 2.800 kg), por isso "quase 3 toneladas" —
   arredondado para fora, nunca para dentro. IMPORTANTE: este número NÃO descreve
   a foto (a peça da foto é uma pedra redonda genérica, não a Santa Bárbara).
   Legendar a foto com este nome seria mentira; o número vive só no fato de apoio. */
const PROVA = {
  peca: "Cascata Santa Bárbara",
  pesoKg: 280,
  natural: "quase 3 toneladas",
};

/* Os dois fatos de APOIO (o herói fica no JSX, com peso tipográfico maior).
   Ordem: consequência de projeto primeiro, número de conferência depois. */
const APOIO = [
  {
    label: "Onde a pedra não entra",
    p: "Sacada, laje, cobertura, obra pronta. Sobe pela escada, cabe no elevador, apoia onde a pedra natural nunca subiria.",
  },
  {
    label: "O peso, em número",
    p: `${PROVA.peca}: ${PROVA.pesoKg} kg. A mesma peça em pedra natural passaria de ${PROVA.natural}.`,
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
        <Reveal variant="fade-up" duration={650}>
          <div className="max-w-2xl">
            <p className="text-eyebrow mb-3">A tecnologia Western</p>
            {/* Afirmação sobre o OBJETO, nunca sobre o leitor. O <br> fixa as
                duas linhas; "invenção nossa" em bronze marca onde está o argumento. */}
            <h2 className="display-lg text-western-green-deep">
              Por fora, é a pedra.
              <br />
              <span className="text-western-bronze">Por dentro, é invenção nossa.</span>
            </h2>
            <p className="text-body mt-4 max-w-[54ch]">
              Molde tirado da pedra real: mesma textura, mesma resistência, cerca de 10% do peso.
              Leve, porém, é só o começo.
            </p>
            <p className="text-meta mt-3">Ateliê próprio em Cajamar, desde 1993.</p>
          </div>
        </Reveal>

        <div className="mt-10 md:mt-14 grid gap-8 md:grid-cols-12 md:gap-12 md:items-center">
          {/* Foto placeholder (ver import): escala real — pessoa de 1,70 m ao
              lado da peça. Nativa 4:5 (1080×1341); aspect-[4/5] não decapita a
              figura. A legenda fala do que ESTA foto mostra (escala), não de
              carregar — a foto de "carregar sem içamento" saiu com o dono. */}
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

          <Reveal variant="fade-up" delay={100} duration={700} className="md:col-span-6 lg:col-span-7">
            {/* HIERARQUIA 1 + 2. O herói é o diferencial de ENTREGABILIDADE
                (SketchUp), em display-md; os dois fatos de apoio vêm depois de um
                filete, em text-title-sm — tipograficamente menores de propósito,
                para que a página tenha UM argumento principal e não três iguais. */}
            <div>
              <p className="text-eyebrow mb-2">O que muda</p>
              <h3 className="display-md text-western-green-deep">
                Você entrega o que desenhou.
              </h3>
              <p className="text-body mt-3 max-w-[48ch]">
                Tem bloco no SketchUp. Você mostra ao cliente na tela e entrega aquilo — sem
                içamento, sem empilhamento, sem surpresa na hora da obra.
              </p>
            </div>

            <div className="mt-8 border-t border-western-border-soft pt-8 grid gap-8 sm:grid-cols-2">
              {APOIO.map(({ label, p }) => (
                <div key={label}>
                  <p className="text-eyebrow mb-2">{label}</p>
                  <p className="text-title-sm text-western-green-deep">{p}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>

        {/* ENTRADA Nº1 DE /a-pedra: saída para quem ainda pergunta "isso é pedra
            de verdade?" — por isso vem ANTES da bifurcação. */}
        <Reveal variant="fade-up" duration={600}>
          <div className="mt-10 md:mt-12">
            <Link
              to="/a-pedra"
              className="tap-target inline-flex items-center gap-1.5 font-sans text-[16px] font-semibold text-western-green-deep hover:text-western-cta transition-colors"
            >
              Como a pedra é feita
              <ArrowRight className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
            </Link>
          </div>
        </Reveal>

        {/* Bifurca profissional × casa — a AÇÃO principal é o cadastro (ver preços);
            a casa é off-ramp discreto. Preservada verbatim. */}
        <Reveal variant="fade-up" duration={600}>
          <div className="mt-12 md:mt-16 border-t border-western-border-soft pt-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <p className="text-[18px] font-semibold text-western-green-deep max-w-[22ch]">
                Você é profissional, ou é para a sua casa?
              </p>
              <div className="flex flex-col gap-2.5 md:items-end">
                <div className="flex flex-col gap-3 md:flex-row md:items-center">
                  <Link to="/parceiro/cadastro" className="btn-primary w-full md:w-auto">
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
                <p className="text-meta md:text-right">
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
