import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

import quadriplex3d from "@/assets/a-pedra/quadriplex-3d.webp";
import quadriplexObra from "@/assets/a-pedra/quadriplex-obra.webp";

/**
 * VARIANTE F — "DUAS PERGUNTAS".
 *
 * ESTRATÉGIA DE CARGA: o conteúdo não está mais organizado pela taxonomia de
 * quem escreveu (peso · método · outros eixos), e sim como resposta às duas
 * perguntas que o cliente faz. Com a pergunta na tela, cada item vira resposta —
 * e resposta se lê mais leve que afirmação solta, porque o leitor já sabe por
 * que aquilo está ali. As 8 respostas da 1ª pergunta viram QUATRO blocos de
 * duas linhas (lead em negrito + corpo), então o olho conta 4, não 8.
 * ORDEM DE LEITURA: pergunta 1 → o número (único visual da coluna esquerda) →
 * as 4 respostas → pergunta 2 → o par render/obra → o método → assinatura.
 * SUBTRAÇÃO: morreram os três cartões brancos, as sombras e TODOS os ícones
 * (o ruído que o dono chamou de poluição). Sobra UM painel tingido — a contagem
 * de peso — porque é o único lugar onde o desenho é o argumento.
 * SACRIFÍCIO: o tom fica mais dialogado, menos editorial-silencioso; e o eixo
 * "ambiente" perde autonomia — vira a quarta resposta de instalação.
 */

/** Um bloco = 280 kg. Dez blocos ≈ 2.800 kg — a mesma peça em pedra natural. */
const BLOCOS_PEDRA_NATURAL = 10;

/**
 * PERGUNTA 1 — "dá para instalar no meu caso?".
 * Oito unidades de conteúdo agrupadas em quatro respostas. O agrupamento é o
 * trabalho: chegada, permanência, custo e origem. O custo entra aqui porque
 * quem pergunta por instalação está perguntando pelo custo da obra — e a
 * ressalva vem PRIMEIRO na frase, para nunca virar promessa de peça barata.
 */
const RESPOSTAS_INSTALACAO = [
  {
    lead: "Chega e entra.",
    corpo:
      "Desce de caminhão comum, na mão, e entra por onde as pessoas entram. Sem travar a rua, sem guindaste, sem transtorno com vizinho.",
  },
  {
    lead: "Fica onde precisa ficar.",
    corpo:
      "Peso que cabe em laje, apartamento, pavimento alto, cobertura e deck. Fixa com argamassa AC3 de loja de bairro.",
  },
  {
    lead: "A obra sai mais barata.",
    corpo:
      "A peça em si não é mais barata que pedra natural. A obra é: instalação, transporte e mão de obra caem no mínimo 30%.",
  },
  {
    lead: "É oca por dentro, e não sai de pedreira.",
    corpo:
      "Fio, caixa, bomba e o que a instalação pedir passam por dentro. O molde é tirado da pedra real, em composto mineral com PET reciclado. Zero extração.",
  },
];

/** Assinatura — credencial, não prova. Fica discreta e em uma linha só. */
const CREDENCIAL = [
  "Ateliê próprio em Cajamar/SP desde 1993",
  "Pintado à mão, peça por peça",
  "Cristal Pool e Genesis compram há mais de duas décadas",
];

export default function APedraNumeroF() {
  return (
    <section className="surface-paper section border-t border-western-border-soft">
      <div className="container-western">
        <p className="text-eyebrow">Antes de comprar, perguntam duas coisas</p>

        {/* ==============================================================
            PERGUNTA 1 — instalação.
            Grade 12 colunas: o painel do número à esquerda (5), as respostas
            à direita (7). Mesma régua, mesma calha, topo alinhado — nada
            centralizado. No mobile o painel vem primeiro porque é o visual
            que sustenta as quatro respostas seguintes.
            ============================================================== */}
        <h2 className="display-lg text-western-green-deep mt-4 max-w-[18ch]">
          Dá para instalar no meu caso?
        </h2>

        <div className="mt-8 grid gap-8 lg:mt-10 lg:grid-cols-12 lg:gap-x-12">
          {/* O ÚNICO painel tingido da seção. A contagem: cada bloco é a MESMA
              unidade (280 kg), então a diferença não é de tamanho de desenho —
              é de quantidade de peça. O olho conta, não mede. */}
          <div className="rounded-xl bg-western-ivory p-6 md:p-7 lg:col-span-5">
            <p className="text-eyebrow">A mesma peça, nos dois materiais</p>

            <div className="mt-5 space-y-5">
              <div>
                <div className="flex flex-wrap items-center gap-1.5" aria-hidden>
                  <span className="h-8 w-8 rounded-[3px] bg-western-gold" />
                </div>
                <p className="mt-2.5 flex flex-wrap items-baseline gap-x-2.5">
                  <span className="display-md tabular-nums text-western-green-deep">
                    280 kg
                  </span>
                  <span className="text-meta font-semibold text-western-bronze">
                    Western · 1 bloco
                  </span>
                </p>
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-1.5" aria-hidden>
                  {Array.from({ length: BLOCOS_PEDRA_NATURAL }, (_, i) => (
                    <span
                      key={i}
                      className="h-8 w-8 rounded-[3px] border border-western-border-strong bg-western-paper"
                    />
                  ))}
                </div>
                <p className="mt-2.5 flex flex-wrap items-baseline gap-x-2.5">
                  <span className="display-md tabular-nums text-western-stone-warm">
                    quase 3 t
                  </span>
                  <span className="text-meta">Pedra natural · 10 blocos</span>
                </p>
              </div>
            </div>

            <p className="text-meta mt-4">
              Cada bloco representa 280 kg. A maior cascata da linha.
            </p>

            {/* A razão vira consequência: é aqui que o número encosta na obra.
                Usa text-title-sm — o MESMO nível dos leads das respostas — para
                não abrir um sétimo degrau tipográfico só para uma frase. */}
            <p className="text-title-sm mt-5 border-t border-western-border-strong/70 pt-5">
              Uma desce na mão. A outra pede guindaste.
            </p>
          </div>

          {/* AS QUATRO RESPOSTAS. Duas colunas a partir de sm, com subgrid nas
              linhas: os leads das duas respostas irmãs começam na mesma altura
              e os corpos também, mesmo com textos de tamanhos diferentes.
              As quatro linhas são AUTO, nunca 1fr: no lg esta lista é um item
              esticado ao lado do painel, e linha 1fr engoliria a folga sobrando
              — o segundo par descolaria do seu lead (ragged). Com auto +
              content-start as linhas empacotam no topo e o subgrid continua
              dando a linha de base compartilhada entre as irmãs. */}
          <ul className="grid gap-x-10 gap-y-7 sm:grid-cols-2 sm:grid-rows-[auto_auto_auto_auto] sm:content-start lg:col-span-7 lg:gap-y-8">
            {RESPOSTAS_INSTALACAO.map(({ lead, corpo }) => (
              <li
                key={lead}
                className="border-l-2 border-western-gold/70 pl-4 sm:row-span-2 sm:grid sm:grid-rows-subgrid sm:gap-y-2"
              >
                <p className="text-title-sm">{lead}</p>
                <p className="text-body">{corpo}</p>
              </li>
            ))}
          </ul>
        </div>

        {/* ==============================================================
            PERGUNTA 2 — fidelidade. Mesma régua da pergunta 1: título na
            largura toda, depois 12 colunas (foto 7 · texto 5).
            ============================================================== */}
        <div className="mt-14 border-t border-western-border-soft pt-10 md:mt-16 md:pt-12">
          <h2 className="display-lg text-western-green-deep max-w-[18ch]">
            Vou receber o que eu vi?
          </h2>

          <div className="mt-8 grid gap-8 lg:mt-10 lg:grid-cols-12 lg:gap-x-12">
            {/* Duas VISTAS do mesmo quarto (luz de render × luz de dia). A
                legenda NOMEIA a âncora — sem ela o olho procura sozinho, não
                acha, e lê descasamento. RENDER NUNCA vira foto. Cada vista é
                uma <figure> aninhada: um <figure> só admite UM <figcaption>. */}
            <figure className="overflow-hidden rounded-xl border border-western-border-soft bg-western-paper lg:col-span-7">
              <div className="grid grid-cols-2 gap-px bg-western-border-soft">
                <figure>
                  <img
                    src={quadriplex3d}
                    alt="Render do quarto: paredão de rocha, espelho arqueado dourado e biombo de vareta contra o painel ripado."
                    loading="lazy"
                    decoding="async"
                    className="aspect-[4/3] w-full bg-western-paper object-cover"
                  />
                  <figcaption className="text-meta bg-western-paper px-3 py-2.5">
                    Projeto 3D · render
                  </figcaption>
                </figure>
                <figure>
                  <img
                    src={quadriplexObra}
                    alt="Foto do mesmo quarto construído: o mesmo paredão, o mesmo espelho arqueado e o mesmo biombo, em obra entregue."
                    loading="lazy"
                    decoding="async"
                    className="aspect-[4/3] w-full bg-western-paper object-cover"
                  />
                  <figcaption className="text-meta bg-western-paper px-3 py-2.5">
                    A obra construída · foto
                  </figcaption>
                </figure>
              </div>
              <figcaption className="text-meta border-t border-western-border-soft px-4 py-3">
                O mesmo quarto: o mesmo espelho arqueado, o mesmo biombo, o mesmo
                paredão — do projeto à obra entregue.
              </figcaption>
            </figure>

            {/* O método, escrito como percurso (desenha → apresenta → ajusta →
                compra). O ponto não é "temos bloco 3D": é que a composição usa
                AS MESMAS peças que serão entregues. */}
            {/* SEM a barra dourada aqui, de propósito: a barra é o carimbo das
                QUATRO respostas da pergunta 1. Repeti-la em mais dois parágrafos
                viraria textura (6 trilhos iguais = padrão = parede) e diria ao
                olho que método e instalação são a mesma coisa. Coluna limpa. */}
            <div className="lg:col-span-5">
              <p className="text-body">
                Toda peça tem bloco 3D no SketchUp. Você monta a composição no CAD
                ou no SketchUp com as mesmas peças que vão ser entregues,
                apresenta, ajusta com o cliente e só compra depois de aprovado.
              </p>
              <p className="text-body mt-4">
                Como a peça desenhada{" "}
                <span className="font-semibold text-western-green-deep">é</span> a
                peça entregue, o render sai fiel — e a execução vira montagem, não
                improviso.
              </p>

              <p className="mt-7 flex flex-wrap items-baseline gap-x-2.5 border-t border-western-border-soft pt-5">
                <span className="display-md tabular-nums text-western-green-deep">
                  +300 mil
                </span>
                <span className="text-meta">downloads dos blocos</span>
              </p>
            </div>
          </div>
        </div>

        {/* ==============================================================
            ASSINATURA — credencial, não prova. Uma faixa rasa: três créditos
            em linha, a nota dos tons e o link para as obras.
            ============================================================== */}
        <div className="mt-12 border-t border-western-border-soft pt-6 md:mt-14">
          <ul className="grid gap-2 sm:grid-cols-3 sm:gap-x-8">
            {CREDENCIAL.map((texto) => (
              <li key={texto} className="text-meta">
                {texto}
              </li>
            ))}
          </ul>

          <div className="mt-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-8">
            <p className="text-meta max-w-[56ch]">
              O ateliê desenvolve tons conforme a geologia da região de cada
              projeto.
            </p>
            <Link to="/obras" className="link-cta shrink-0">
              Ver obras entregues
              <ArrowRight className="h-5 w-5" strokeWidth={1.75} aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
