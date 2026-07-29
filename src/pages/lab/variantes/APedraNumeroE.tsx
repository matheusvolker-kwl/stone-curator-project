import { useId, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronDown } from "lucide-react";

import quadriplex3d from "@/assets/a-pedra/quadriplex-3d.webp";
import quadriplexObra from "@/assets/a-pedra/quadriplex-obra.webp";

/**
 * VARIANTE E — "ARGUMENTO × FICHA" (separar registros).
 *
 * ESTRATÉGIA DE CARGA: a poluição não vinha da quantidade, vinha de misturar dois registros.
 * ARGUMENTO se lê; REFERÊNCIA se consulta. Aqui os dois estão fisicamente separados. Em cima,
 * três coisas competem: a frase-título, o peso desenhado por CONTAGEM e o par render/obra —
 * e o peso tem um pico real (display-stat), porque uma seção sem pico é parede. Embaixo, uma
 * FICHA: pares rótulo/valor na mesma régua, fio entre linhas, ZERO ícone, ZERO cartão colorido.
 * Ficha densa não polui porque o olho procura o rótulo e para — MAS 14 linhas viram 2 telas no
 * celular, então só os 8 dados que sustentam os dois argumentos ficam abertos; composição e
 * ateliê moram atrás de UM botão real (aria-expanded, teclado nativo). Nada some da seção.
 *
 * ORDEM DE LEITURA: título ("na mão × guindaste") → peso (280 kg / quase 3 t, por contagem)
 * → par render/obra → ficha (Na obra · Projeto) → composição e ateliê sob demanda → obras.
 * As colunas da ficha herdam as do argumento: esquerda = peso, direita = projeto.
 *
 * SACRIFÍCIO: os oito argumentos que desceram para a ficha viram dado e perdem força retórica;
 * custo, oca e ambiente pedem um clique. Quem só passa o olho leva o peso e a fidelidade.
 */

/** Um bloco = 280 kg. Dez blocos ≈ 2.800 kg — a mesma peça em pedra natural. */
const BLOCOS_PEDRA_NATURAL = 10;

type LinhaFicha = { rotulo: string; valor: string; numeros?: boolean };
type GrupoFicha = { titulo: string; linhas: LinhaFicha[] };

/** Aberto por padrão: os 8 dados que provam o peso e o projeto — os dois argumentos de cima. */
const FICHA_ABERTA: GrupoFicha[] = [
  {
    titulo: "Na obra",
    linhas: [
      { rotulo: "Transporte", valor: "Desce de caminhão comum, na mão." },
      { rotulo: "Acesso", valor: "Entra por onde as pessoas entram." },
      { rotulo: "Rua", valor: "Sem travar a rua, sem guindaste, sem transtorno com vizinho." },
      {
        rotulo: "Onde assenta",
        valor: "Laje, apartamento, pavimento alto, cobertura e deck.",
      },
      { rotulo: "Fixação", valor: "Argamassa AC3 de loja de bairro." },
    ],
  },
  {
    titulo: "Projeto",
    linhas: [
      {
        rotulo: "Bloco 3D",
        valor:
          "Toda peça tem bloco no SketchUp. Você monta a composição com as mesmas peças que serão entregues, apresenta e ajusta com o cliente — e só compra depois de aprovado.",
      },
      {
        rotulo: "Fidelidade",
        valor: "A peça desenhada é a peça entregue: o render sai fiel e a execução vira montagem.",
      },
      { rotulo: "Downloads", valor: "+300 mil downloads dos blocos.", numeros: true },
    ],
  },
];

/** Sob demanda: verdadeiro, mas não é o que decide a leitura da seção. */
const FICHA_SOB_DEMANDA: GrupoFicha[] = [
  {
    titulo: "A peça",
    linhas: [
      {
        rotulo: "Custo",
        valor:
          "A peça em si não é mais barata que pedra natural. A obra é: instalação, transporte e mão de obra caem no mínimo 30%.",
        numeros: true,
      },
      {
        rotulo: "Função",
        valor: "Oca por dentro — esconde fio, caixa, bomba e o que a instalação pedir.",
      },
      {
        rotulo: "Ambiente",
        valor: "Molde tirado da pedra real, em composto mineral com PET reciclado. Zero extração.",
      },
    ],
  },
  {
    titulo: "Ateliê",
    linhas: [
      { rotulo: "Origem", valor: "Ateliê próprio em Cajamar/SP desde 1993.", numeros: true },
      {
        rotulo: "Acabamento",
        valor:
          "Pintado à mão, peça por peça, em tons desenvolvidos conforme a geologia da região de cada projeto.",
      },
      { rotulo: "Clientes", valor: "Cristal Pool e Genesis compram há mais de duas décadas." },
    ],
  },
];

/**
 * Uma BANDA da ficha: dois grupos lado a lado, títulos e corpos na mesma linha de base
 * (subgrid). Toda a tipografia da ficha vem do DS — nenhum tamanho inventado, nada abaixo
 * de 14px (piso do público 40+).
 */
function BandaFicha({ grupos }: { grupos: GrupoFicha[] }) {
  return (
    <div className="grid gap-x-14 gap-y-10 lg:grid-cols-2 lg:grid-rows-[auto_1fr]">
      {grupos.map((grupo) => (
        <div key={grupo.titulo} className="lg:row-span-2 lg:grid lg:grid-rows-subgrid lg:gap-y-4">
          <h3 className="text-section-label">{grupo.titulo}</h3>

          <dl className="mt-4 lg:mt-0">
            {grupo.linhas.map(({ rotulo, valor, numeros }) => (
              <div
                key={rotulo}
                className="grid gap-x-6 gap-y-1 border-t border-western-border-soft py-3.5 sm:grid-cols-[8.5rem_minmax(0,1fr)]"
              >
                <dt className="text-sublabel sm:pt-[2px]">{rotulo}</dt>
                <dd className={`text-body-balcao ${numeros ? "tabular-nums" : ""}`}>{valor}</dd>
              </div>
            ))}
          </dl>
        </div>
      ))}
    </div>
  );
}

export default function APedraNumeroE() {
  const [maisAberto, setMaisAberto] = useState(false);
  const idMais = useId();

  return (
    <section className="surface-ivory section border-t border-western-border-soft">
      <div className="container-western">
        {/* ============================================================
            ARGUMENTO. Curto e alto. Só o que precisa ser LIDO mora aqui.
            ============================================================ */}
        <header className="max-w-prose-lg">
          <p className="text-eyebrow">A pedra</p>
          <h2 className="display-lg text-western-green-deep mt-3">
            Uma desce na mão. A outra pede guindaste.
          </h2>
        </header>

        {/* Duas colunas com faixas compartilhadas: rótulo · afirmação · demonstração.
            A demonstração é a faixa 1fr — as duas começam na MESMA linha de base,
            mesmo com alturas de mídia diferentes. */}
        <div className="mt-10 grid gap-y-12 lg:grid-cols-2 lg:gap-x-16 lg:gap-y-6 lg:grid-rows-[auto_auto_1fr]">
          {/* ---------- COLUNA A — O PESO ---------- */}
          <div className="lg:row-span-3 lg:grid lg:grid-rows-subgrid lg:gap-y-6">
            <p className="text-eyebrow">Peso</p>

            <h3 className="display-md text-western-green-deep max-w-[26ch] mt-3 lg:mt-0">
              A mesma peça — a maior cascata da linha — nos dois materiais.
            </h3>

            <div className="mt-6 lg:mt-0 lg:self-start">
              {/* A CONTAGEM. Cada bloco é a MESMA unidade (280 kg): a diferença não é de
                  tamanho de desenho, é de QUANTIDADE de peça. O olho conta, não mede.
                  As duas linhas têm estrutura IDÊNTICA — número, rótulo, blocos, na mesma
                  régua à esquerda — senão não há comparação, há duas ilustrações soltas.
                  aria-hidden nos blocos porque o dado já está escrito acima deles. */}
              <div className="space-y-6">
                <div>
                  <p className="display-stat text-western-green-deep">280 kg</p>
                  <p className="text-sublabel mt-2">Western · 1 bloco</p>
                  <div className="mt-4 flex flex-wrap items-center gap-1.5" aria-hidden>
                    <span className="h-9 w-9 rounded-sm bg-western-gold" />
                  </div>
                </div>

                <div className="border-t border-western-border-soft pt-6">
                  <p className="display-stat text-western-stone-warm">quase 3 t</p>
                  <p className="text-sublabel mt-2">Pedra natural · 10 blocos</p>
                  <div className="mt-4 flex flex-wrap items-center gap-1.5" aria-hidden>
                    {Array.from({ length: BLOCOS_PEDRA_NATURAL }, (_, i) => (
                      <span
                        key={i}
                        className="h-9 w-9 rounded-sm border border-western-border-strong bg-white"
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ---------- COLUNA B — O PROJETO ---------- */}
          <div className="lg:row-span-3 lg:grid lg:grid-rows-subgrid lg:gap-y-6">
            <p className="text-eyebrow">Projeto antes da obra</p>

            <h3 className="display-md text-western-green-deep max-w-[26ch] mt-3 lg:mt-0">
              O que você desenha é o que chega na obra.
            </h3>

            <div className="mt-6 lg:mt-0 lg:self-start">
              {/* Duas VISTAS do mesmo quarto. A legenda NOMEIA a âncora — sem isso o olho
                  procura sozinho, não acha, e lê descasamento. RENDER NUNCA é apresentado
                  como foto. Cada vista é uma <figure> própria: um <figure> só admite UM
                  <figcaption>. */}
              <figure className="overflow-hidden rounded-lg border border-western-border-soft bg-white">
                <div className="grid grid-cols-2 gap-px bg-western-border-soft">
                  <figure className="bg-white">
                    <img
                      src={quadriplex3d}
                      alt="Render do quarto: paredão de rocha, espelho arqueado dourado e biombo de vareta contra o painel ripado."
                      loading="lazy"
                      decoding="async"
                      className="w-full aspect-square object-cover"
                    />
                    <figcaption className="text-meta px-3 py-2.5">Projeto 3D · render</figcaption>
                  </figure>
                  <figure className="bg-white">
                    <img
                      src={quadriplexObra}
                      alt="Foto do mesmo quarto construído: o mesmo paredão, espelho e biombo, em obra entregue."
                      loading="lazy"
                      decoding="async"
                      className="w-full aspect-square object-cover"
                    />
                    <figcaption className="text-meta px-3 py-2.5">
                      A obra construída · foto
                    </figcaption>
                  </figure>
                </div>
                <figcaption className="text-meta border-t border-western-border-soft px-3 py-2.5">
                  O mesmo quarto: o mesmo espelho arqueado, o mesmo biombo, o mesmo paredão — do
                  projeto à obra entregue.
                </figcaption>
              </figure>
            </div>
          </div>
        </div>

        {/* ============================================================
            FICHA. O outro registro: se consulta, não se lê. Folha branca sobre
            o marfim da seção, régua de rótulo única, números tabulares, nenhum
            ícone. Duas bandas: a aberta (peso e projeto) e a sob demanda.
            ============================================================ */}
        <div className="mt-14 rounded-xl border border-western-border-soft bg-white p-6 md:p-8 lg:p-10">
          <div className="flex flex-col gap-1 border-b border-western-border-strong pb-5">
            <p className="text-eyebrow">Ficha técnica</p>
            <p className="display-md text-western-green-deep">Não é só a pedra ser leve.</p>
          </div>

          <div className="mt-8">
            <BandaFicha grupos={FICHA_ABERTA} />
          </div>

          {/* Botão real: aria-expanded + aria-controls, teclado nativo, altura de toque
              do DS (min-h-tap = 48px). O rótulo NOMEIA o que há dentro — conteúdo
              anunciado não é conteúdo escondido. */}
          <div className="mt-8 border-t border-western-border-strong pt-2">
            <button
              type="button"
              onClick={() => setMaisAberto((v) => !v)}
              aria-expanded={maisAberto}
              aria-controls={idMais}
              className="link-cta min-h-tap"
            >
              {maisAberto ? "Menos" : "Composição, custo de obra e ateliê"}
              <ChevronDown
                className={`h-5 w-5 transition-transform ${maisAberto ? "rotate-180" : ""}`}
                strokeWidth={1.75}
                aria-hidden
              />
            </button>
          </div>

          <div id={idMais} hidden={!maisAberto} className="mt-6">
            <BandaFicha grupos={FICHA_SOB_DEMANDA} />
          </div>
        </div>

        {/* ============================================================
            FECHO. Uma saída, na mesma régua da esquerda. Sem CTA de venda:
            a foto da obra é que é o argumento.
            ============================================================ */}
        <div className="mt-10 flex flex-col gap-4 border-t border-western-border-soft pt-6 md:flex-row md:items-center md:justify-between">
          <p className="text-meta max-w-prose">
            O que está na ficha já foi entregue — em laje, em cobertura e em deck.
          </p>
          <Link to="/obras" className="link-cta shrink-0">
            Ver obras entregues
            <ArrowRight className="h-5 w-5" strokeWidth={1.75} aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  );
}
