import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Reveal from "@/components/shared/Reveal";
import escalaSantaBarbara from "@/assets/escala/WEST-CSB.webp";

/**
 * "A tecnologia Western" — 2ª seção da home: o QUE / PRA QUEM / PORQUÊ.
 *
 * O que havia antes: "o que fazemos" respondido com uma LISTA DE SKU ("cascatas,
 * pedras, revestimentos e fontes") e "para quem" respondido com CARGOS
 * ("arquitetos, paisagistas, laguistas e lojas"). Qualquer distribuidor escreve
 * as duas. A tecnologia — molde tirado da pedra real, composto mineral com fibra
 * de PET, ~10% do peso — entrava como bullet nº 2 e só era DEFENDIDA na 9ª seção,
 * sete telas abaixo. A home afirmava o EFEITO e nunca dava a CAUSA nem a PROVA.
 *
 * Agora a seção faz três coisas, nesta ordem:
 *   1. CAUSA   — o h2 afirma o método sobre o OBJETO (não acusa o leitor).
 *   2. PROVA   — a foto da peça real ao lado de uma pessoa de 1,70 m, a ~3 m:
 *                a distância exata do claim da legenda. A prova vem ANTES do
 *                argumento (à esquerda no desktop, acima no celular).
 *   3. CONSEQUÊNCIA — o 3º bloco devolve a pedra ao projeto, com número.
 *
 * Sem ícone lucide e sem checkmark de propósito: gramática de checklist de
 * e-commerce não prova textura nem invenção — foto prova. Os antigos Gem (joia
 * LAPIDADA; a Western reproduz pedra BRUTA) e Boxes (caixa = distribuidor, a
 * leitura que a seção existe para derrubar) saíram por dizerem a coisa errada.
 *
 * Fecha com a bifurcação profissional × casa, preservada verbatim: um único
 * botão sólido (cadastro → ver preços) e a casa como off-ramp de texto.
 *
 * Específica da home — o layout presume o slot logo após o herói. Não é
 * reutilizável (o docblock antigo prometia isso e nunca aconteceu).
 */

/* A PROVA em número, amarrada a um SKU NOMEADO — nunca ao genérico "uma cascata
   grande", que ninguém pode conferir. Fonte: obras.ts:181,186 ("Cascata Santa
   Bárbara, 280 kg"), o único peso PUBLICADO para este SKU (código CSB →
   cascata-santa-barbara, skuHandleMap.ts:13). O equivalente natural usa a MESMA
   conta da PDP (TamanhoReal.tsx:71 → peso × 10 = 2.800 kg), por isso "quase 3
   toneladas" — arredondado para fora, nunca para dentro.
   ⚠ BLOQUEIO: o dono precisa cravar este peso antes de publicar. O mesmo CSB
   aparece com 215 kg em pecasPlaceholder.ts:7 (arquivo sintético, não
   renderizado) e o FAQ.tsx:30 repete os 215 como "uma cascata grande". A PDP lê
   o peso da loja: home e PDP TÊM de mostrar o mesmo número. */
const PROVA = {
  peca: "Cascata Santa Bárbara",
  pesoKg: 280,
  natural: "quase 3 toneladas",
};

const BLOCOS = [
  {
    label: "O que é",
    t: "A pedra que pesa 10%",
    p: "Molde tirado da pedra real, sem tirar a pedra do lugar. Composto mineral com fibra de PET: pisável, perfurável, esconde a fiação por dentro.",
  },
  {
    label: "Pra quem",
    t: "Quem entrega o que desenhou",
    p: "Tem bloco no SketchUp: você mostra ao cliente e entrega aquilo. Sem içamento, sem empilhamento, sem surpresa na obra.",
  },
  {
    label: "O que muda",
    t: "Entra onde pedra não entra",
    p: `${PROVA.peca}: ${PROVA.pesoKg} kg. A mesma em pedra natural: ${PROVA.natural}. Sacada, laje, cobertura e obra pronta deixam de ser problema.`,
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
            {/* Afirmação sobre o OBJETO, nunca sobre o leitor.
                O eixo é ALTERNATIVA, não redenção (decisão do dono, 2026-07-16):
                muita gente trabalha com pedra natural e ninguém errou por isso —
                inclusive os melhores clientes da casa, que compram há duas
                décadas. Os blocos abaixo já disseram "quem riscou a pedra da
                prancha / a conta não fechava"; era acusação, e acusação exclui
                justamente quem já compra. Agora o argumento é o que a Western
                FAZ (planeja, entrega, entra onde a outra não entra), não o que
                o leitor teria deixado de fazer. */}
            {/* Sem max-w em ch: a 2ª frase tem 29 caracteres e qualquer medida
                mais estreita que ela cria uma 3ª linha órfã ("nossa."). O <br>
                já define as duas linhas; o max-w-2xl do bloco segura o resto. */}
            <h2 className="display-lg text-western-green-deep">
              Por fora, é a pedra.
              <br />
              <span className="text-western-bronze">Por dentro, é invenção nossa.</span>
            </h2>
            <p className="text-body mt-4 max-w-[52ch]">
              Reproduz a pedra real no toque e na resistência — com cerca de 10% do peso.
            </p>
          </div>
        </Reveal>

        {/* A foto é 4:5 nativa (1080×1341, como as 50 fotos de escala). Por isso
            a PROVA fica ao LADO do argumento e não numa banda larga: um retrato
            recortado em 21/9 perderia ~65% da altura e decapitaria a referência
            de 1,70 m — que é justamente o que a foto existe para dar. */}
        <div className="mt-10 md:mt-14 grid gap-8 md:grid-cols-12 md:gap-12 md:items-center">
          {/* 6/6 no tablet e 5/7 no desktop: em md a coluna de 5 deixava a foto
              com 259px — a pessoa some e a prova para de provar. Em lg sobra
              largura, e a foto volta a 5 para o texto respirar. */}
          <Reveal variant="fade-up" duration={700} className="md:col-span-6 lg:col-span-5">
            <figure>
              <img
                src={escalaSantaBarbara}
                alt="Cascata Santa Bárbara, réplica Western, ao lado de uma pessoa de 1,70 m num jardim."
                width={1080}
                height={1341}
                loading="lazy"
                decoding="async"
                className="w-full aspect-[4/5] object-cover rounded-2xl"
              />
              {/* Legenda FORA da foto, não em tarja sobreposta (o padrão de
                  /sobre). Medido no browser: a pessoa tem os pés em ~82% da
                  altura e a tarja de 2 linhas começa em ~78% — ela cobria os
                  pés, ou seja, escondia justamente a referência de 1,70 m que a
                  legenda afirma. Ancorar no topo quebra igual em md (a coluna
                  fica com ~290px, o texto quebra em 3 linhas e a tarja invade a
                  cabeça). Num retrato 4:5 dentro de 5/12 a sobreposição sempre
                  come a cabeça ou os pés — então a legenda desce. */}
              <figcaption className="mt-4">
                <p className="text-body text-western-green-deep">
                  A três metros, nem o nosso fundador acerta qual é qual.
                </p>
                <p className="text-meta mt-1.5">
                  {PROVA.peca} · pessoa de 1,70 m · escala real
                </p>
              </figcaption>
            </figure>
          </Reveal>

          {/* Um Reveal para a coluna inteira (não um por bloco): empilhado no
              celular, um stagger por índice só ATRASA blocos que já estão na
              tela. O delay de 100ms mantém a ordem prova → argumento. */}
          <Reveal variant="fade-up" delay={100} duration={700} className="md:col-span-6 lg:col-span-7">
            <div className="space-y-8 md:space-y-10">
              {BLOCOS.map(({ label, t, p }) => (
                <div key={label}>
                  <p className="text-eyebrow mb-2">{label}</p>
                  <h3 className="display-md text-western-green-deep">{t}</h3>
                  <p className="text-body mt-2 max-w-[46ch]">{p}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>

        {/* ENTRADA Nº1 DE /a-pedra — e o conserto desta seção: a home bifurca
            (profissional × casa) ANTES de provar. Este link é a saída para
            quem ainda está na pergunta "isso é pedra de verdade?", e por isso
            vem ANTES da bifurcação, não depois. */}
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
            a casa é off-ramp discreto. Absorveu a antiga seção de segmentação.
            Preservada verbatim, com uma correção: os CTAs viram linha em md (e não
            em sm), o mesmo breakpoint da grade acima — antes, de 640 a 767px, os
            botões já estavam lado a lado enquanto o conteúdo ainda empilhava, e a
            seção parecia meio montada em tablet retrato. */}
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
