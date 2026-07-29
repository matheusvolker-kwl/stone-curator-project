import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

import quadriplex3d from "@/assets/a-pedra/quadriplex-3d.webp";
import quadriplexObra from "@/assets/a-pedra/quadriplex-obra.webp";

/**
 * VARIANTE D — "UMA COISA POR VEZ".
 *
 * ESTRATÉGIA DE CARGA: a carga não some, ela se espalha. Nada de cartão denso:
 * a seção é uma sequência vertical de momentos, cada um com UMA ideia e muito
 * ar em volta. Dois pesos alternados e explícitos — PICO (o número; o par
 * render/obra) rompe a margem e usa escala editorial; VALE (as consequências,
 * o método, os três eixos, a assinatura) roda num trilho fixo rótulo-à-esquerda
 * / texto-à-direita, em texto pequeno e linhas de cabelo. O trilho é a régua
 * compartilhada: todos os vales começam na mesma coluna, calhas iguais, nada
 * centralizado. Um índice numerado abre a seção para o leitor saber o que vem.
 * ABAIXO DE lg o trilho colapsa em coluna única — lá quem carrega a hierarquia
 * é a ESCADA DE RESPIRO, e ela é escalonada de propósito: 40px entre vale e
 * pico do mesmo capítulo, 48px no momento isolado, 64px na coda do ateliê,
 * 96px entre capítulos. 2,4× do menor ao maior: no celular o leitor sente a
 * troca de capítulo sem depender do trilho.
 * ORDEM DE LEITURA: índice → 01 peso (número → o que ele resolve) → 02 método
 * (o par de imagens → como se chega nele) → 03 o que não é peso → assinatura.
 * SACRIFÍCIO: a seção fica bem mais alta e quem passa o olho rápido pode parar
 * no meio; e abrimos mão de ícone decorativo — ruído é o que combatemos aqui.
 */

/** Um bloco = 280 kg. Dez blocos ≈ 2.800 kg — a mesma peça em pedra natural. */
const BLOCOS_PEDRA_NATURAL = 10;

/** Trilho dos VALES: rótulo à esquerda, conteúdo à direita. Régua única. */
const TRILHO =
  "grid gap-y-4 lg:grid-cols-[minmax(0,11rem)_minmax(0,1fr)] lg:gap-x-12";

/** Índice de abertura — a hierarquia anunciada antes de começar. */
const INDICE = [
  { n: "01", titulo: "Peso", nota: "280 kg onde a natural pesa quase 3 t" },
  { n: "02", titulo: "Método", nota: "ver a obra antes de ela existir" },
  { n: "03", titulo: "O que não é peso", nota: "custo, função e ambiente" },
];

/** O que o PESO resolve. Tudo aqui é consequência direta de pesar 10× menos. */
const CONSEQUENCIAS = [
  "Desce de caminhão comum, na mão.",
  "Entra por onde as pessoas entram.",
  "Sem travar a rua, sem guindaste, sem transtorno com vizinho.",
  "Peso que cabe em laje, apartamento, pavimento alto, cobertura e deck.",
  "Fixa com argamassa AC3 de loja de bairro.",
];

/** O percurso do projeto — uma etapa por linha, na ordem em que acontece. */
const ETAPAS = [
  "Toda peça tem bloco 3D no SketchUp.",
  "Você monta a composição no CAD ou no SketchUp com as mesmas peças que vão ser entregues.",
  "Apresenta, ajusta com o cliente, e só compra depois de aprovado.",
];

/** Os eixos que NÃO decorrem do peso. Um por linha, um de cada vez. */
const EIXOS = [
  {
    rotulo: "Custo",
    texto:
      "A peça em si não é mais barata que pedra natural. A obra é: instalação, transporte e mão de obra caem no mínimo 30%.",
  },
  {
    rotulo: "Função",
    texto:
      "Oca por dentro — dá para esconder fio, caixa, bomba e o que mais a instalação pedir.",
  },
  {
    rotulo: "Ambiente",
    texto:
      "Molde tirado da pedra real, em composto mineral com PET reciclado. Zero extração.",
  },
];

export default function APedraNumeroD() {
  return (
    <section className="surface-paper section border-t border-western-border-soft">
      <div className="container-western">
        {/* ══════════════════════════════════════════════════════════════
            ABERTURA — o índice. Existe por causa do sacrifício da variante:
            a seção é longa, então a pessoa precisa saber o que vem antes de
            aceitar rolar. Fica no trilho, como todo vale.
            ══════════════════════════════════════════════════════════════ */}
        <div className={TRILHO}>
          <p className="text-eyebrow lg:pt-2">A pedra</p>
          <div>
            <h2 className="display-lg text-western-green-deep max-w-prose">
              Primeiro o peso. Depois o método. E o que não é peso.
            </h2>

            <ol className="mt-8 grid gap-x-8 gap-y-5 border-t border-western-border-soft pt-6 md:grid-cols-3 md:grid-rows-[auto_auto]">
              {INDICE.map(({ n, titulo, nota }) => (
                <li key={n} className="md:row-span-2 md:grid md:grid-rows-subgrid md:gap-1">
                  <p className="text-ui font-semibold text-western-green-deep">
                    <span className="text-western-bronze tabular-nums">{n}</span>{" "}
                    <span className="ml-1">{titulo}</span>
                  </p>
                  <p className="text-meta">{nota}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════
            01 · PESO — abertura do capítulo.
            ══════════════════════════════════════════════════════════════ */}
        <div className={`${TRILHO} mt-24 md:mt-32`}>
          <p className="text-eyebrow lg:pt-1">
            <span className="tabular-nums">01</span> · Peso
          </p>
          <h3 className="display-md text-western-green-deep max-w-prose">
            A mesma peça — a maior cascata da linha — nos dois materiais.
          </h3>
        </div>

        {/* ─── PICO 1 · O NÚMERO ────────────────────────────────────────
            Rompe o trilho e volta para a margem da grade: pico ocupa tudo.
            A comparação é por CONTAGEM, não por barra: cada bloco é a mesma
            unidade (280 kg), a Western tem UM, a pedra natural tem DEZ. O
            olho conta, não mede. O desenho é aria-hidden — o dado já está
            escrito ao lado, e dez blocos anunciados um a um seria ruído.
            ────────────────────────────────────────────────────────────── */}
        <div className="mt-8 rounded-xl bg-western-ivory px-6 py-12 md:px-12 md:py-16">
          <div className="grid items-center gap-x-10 gap-y-12 sm:grid-cols-[minmax(0,13rem)_minmax(0,1fr)]">
            <p className="flex flex-col gap-1">
              <span className="display-stat text-western-green-deep">280 kg</span>
              <span className="text-meta text-western-bronze font-semibold">
                Western · 1 bloco
              </span>
            </p>
            <div className="flex flex-wrap items-center gap-2" aria-hidden>
              <span className="h-9 w-9 rounded-[3px] bg-western-gold" />
            </div>

            <p className="flex flex-col gap-1">
              <span className="display-lg text-western-stone-warm">quase 3 t</span>
              <span className="text-meta">Pedra natural · 10 blocos</span>
            </p>
            <div className="flex flex-wrap items-center gap-2" aria-hidden>
              {Array.from({ length: BLOCOS_PEDRA_NATURAL }, (_, i) => (
                <span
                  key={i}
                  className="h-9 w-9 rounded-[3px] border border-western-border-strong bg-western-paper"
                />
              ))}
            </div>
          </div>

          <p className="text-meta mt-10 max-w-prose-lg">
            Cada bloco representa 280 kg. É a mesma peça, nos dois materiais.
          </p>
        </div>

        {/* ─── A CONSEQUÊNCIA EM UMA LINHA ──────────────────────────────
            Momento sozinho, de propósito: é onde o número encosta na obra.
            ────────────────────────────────────────────────────────────── */}
        <p className="display-md text-western-green-deep mt-12 max-w-prose">
          Uma desce na mão. A outra pede guindaste.
        </p>

        {/* ─── VALE · O QUE O PESO RESOLVE ──────────────────────────────
            Cinco itens, um por linha, separados por linha de cabelo. Sem
            ícone: cinco ícones aqui seriam cinco ruídos disputando o olho.
            ────────────────────────────────────────────────────────────── */}
        <div className={`${TRILHO} mt-10`}>
          <p className="text-eyebrow lg:pt-1">O que isso resolve</p>
          <ul className="border-t border-western-border-soft">
            {CONSEQUENCIAS.map((texto) => (
              <li
                key={texto}
                className="border-b border-western-border-soft py-4 text-body max-w-prose-lg"
              >
                {texto}
              </li>
            ))}
          </ul>
        </div>

        {/* ══════════════════════════════════════════════════════════════
            02 · MÉTODO — abertura do capítulo.
            ══════════════════════════════════════════════════════════════ */}
        <div className={`${TRILHO} mt-24 md:mt-32`}>
          <p className="text-eyebrow lg:pt-1">
            <span className="tabular-nums">02</span> · Método
          </p>
          <h3 className="display-md text-western-green-deep max-w-prose">
            O que você desenha é o que chega na obra.
          </h3>
        </div>

        {/* ─── PICO 2 · O PAR RENDER / OBRA ─────────────────────────────
            Segundo pico: rompe o trilho, ocupa a largura, e é o único
            momento em que a imagem fala sozinha. A legenda NOMEIA a âncora
            (espelho, biombo, paredão) — sem isso o olho procura, não acha, e
            lê descasamento. RENDER NUNCA é apresentado como foto.
            ────────────────────────────────────────────────────────────── */}
        <div className="mt-8">
          <div className="grid gap-4 md:grid-cols-2 md:gap-5">
            <figure>
              <img
                src={quadriplex3d}
                alt="Render do quarto: paredão de rocha, espelho arqueado dourado e biombo de vareta contra o painel ripado."
                loading="lazy"
                decoding="async"
                className="w-full aspect-[4/3] rounded-lg border border-western-border-soft object-cover"
              />
              <figcaption className="text-meta mt-3">Projeto 3D · render</figcaption>
            </figure>
            <figure>
              <img
                src={quadriplexObra}
                alt="Foto do mesmo quarto construído: o mesmo paredão, espelho e biombo, em obra entregue."
                loading="lazy"
                decoding="async"
                className="w-full aspect-[4/3] rounded-lg border border-western-border-soft object-cover"
              />
              <figcaption className="text-meta mt-3">A obra construída · foto</figcaption>
            </figure>
          </div>

          <p className="text-meta mt-6 max-w-prose-lg">
            O mesmo quarto: o mesmo espelho arqueado, o mesmo biombo, o mesmo paredão — do
            projeto à obra entregue.
          </p>
        </div>

        {/* ─── VALE · COMO SE CHEGA NISSO ───────────────────────────────
            O percurso em três etapas, na ordem em que quem projeta vive.
            Nada de <div> entre <ol> e <li>.
            ────────────────────────────────────────────────────────────── */}
        <div className={`${TRILHO} mt-10`}>
          <p className="text-eyebrow lg:pt-1">Como se chega nisso</p>
          <div>
            <ol className="border-t border-western-border-soft">
              {ETAPAS.map((texto, i) => (
                <li
                  key={texto}
                  className="flex gap-4 border-b border-western-border-soft py-4"
                >
                  <span className="text-ui font-semibold tabular-nums text-western-bronze">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-body max-w-prose-lg">{texto}</span>
                </li>
              ))}
            </ol>

            <p className="text-body mt-6 max-w-prose-lg">
              Como a peça desenhada{" "}
              <span className="font-semibold text-western-green-deep">é</span> a peça
              entregue, o render sai fiel ao resultado — e a execução vira montagem, não
              improviso.
            </p>

            <p className="text-meta mt-4">
              Os blocos já saíram do ateliê para a mesa de quem projeta:{" "}
              <span className="font-semibold text-western-green-deep">
                +300 mil downloads.
              </span>
            </p>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════
            03 · O QUE NÃO É PESO — três eixos, um por linha.
            Aqui está a tentação de re-adensar (a banda de três colunas da
            versão reprovada). Empilhado: cada eixo chega sozinho, na régua
            do trilho, com o mesmo respiro dos outros vales.
            ══════════════════════════════════════════════════════════════ */}
        <div className={`${TRILHO} mt-24 md:mt-32`}>
          <p className="text-eyebrow lg:pt-1">
            <span className="tabular-nums">03</span> · O que não é peso
          </p>
          <div>
            <h3 className="display-md text-western-green-deep max-w-prose">
              Não é só a pedra ser leve.
            </h3>

            <ul className="mt-8 border-t border-western-border-soft">
              {EIXOS.map(({ rotulo, texto }) => (
                <li
                  key={rotulo}
                  className="grid gap-x-8 gap-y-1 border-b border-western-border-soft py-6 md:grid-cols-[minmax(0,8rem)_minmax(0,1fr)]"
                >
                  <span className="text-ui font-semibold text-western-green-deep">
                    {rotulo}
                  </span>
                  <span className="text-body max-w-prose-lg">{texto}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════
            ASSINATURA — credencial, não prova. Discreta, no mesmo trilho,
            fechando a seção sem competir com nenhum pico.
            ══════════════════════════════════════════════════════════════ */}
        <div className={`${TRILHO} mt-16 border-t border-western-border-soft pt-8`}>
          <p className="text-eyebrow lg:pt-1">O ateliê</p>
          <div>
            <p className="text-meta max-w-prose-lg">
              Ateliê próprio em Cajamar/SP desde 1993 · pintado à mão, peça por peça ·
              Cristal Pool e Genesis compram há mais de duas décadas.
            </p>
            <p className="text-meta mt-3 max-w-prose-lg">
              O ateliê desenvolve tons conforme a geologia da região de cada projeto.
            </p>

            <Link
              to="/obras"
              className="link-cta mt-6 inline-flex min-h-tap items-center gap-2"
            >
              Ver obras entregues
              <ArrowRight className="h-5 w-5" strokeWidth={1.75} aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
