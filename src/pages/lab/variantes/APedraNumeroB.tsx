import { Link } from "react-router-dom";
import {
  Scale,
  Boxes,
  Truck,
  DoorOpen,
  TrafficCone,
  Hammer,
  Layers,
  MapPin,
  Paintbrush,
  Building2,
  TrendingDown,
  Cable,
  Leaf,
  ArrowRight,
} from "lucide-react";

import quadriplex3d from "@/assets/a-pedra/quadriplex-3d.webp";
import quadriplexObra from "@/assets/a-pedra/quadriplex-obra.webp";

/**
 * VARIANTE B — refino 2 (dono escolheu a B e pediu para aprimorar).
 *
 * O QUE MUDOU E POR QUÊ:
 *
 * 1. OS DOIS PARÁGRAFOS DE RODAPÉ SAÍRAM. O dono: "não estão equivalentes,
 *    com bom design e bem posicionados". Estava certo, e a causa era de
 *    arquitetura, não de estilo: à esquerda vivia uma RESSALVA de preço e à
 *    direita uma ESTATÍSTICA. Dois registros distintos no mesmo slot, e como os
 *    cartões têm alturas de conteúdo diferentes, a última faixa do subgrid abria
 *    um vazio antes deles. Custo e função viraram a terceira banda, que é onde
 *    pertencem — nenhum dos dois é consequência do peso.
 *
 * 2. O PESO FICOU VISUAL POR CONTAGEM, não por barra. Uma barra longa lê como
 *    DOMÍNIO: a pedra natural ocupava a régua inteira e vencia a seção. Uma
 *    pilha lê como FARDO. Mesmo dado, retórica oposta, os dois honestos. Um
 *    bloco = 280 kg: a Western tem UM, a pedra natural tem DEZ. Ninguém precisa
 *    calcular — conta. E a linha de baixo transforma a razão em consequência
 *    (na mão × guindaste), que é o que o cliente sente na obra.
 *
 * 3. OS TRÊS EIXOS FICARAM SEPARADOS. O dono resume assim: "não é só a pedra
 *    leve — é muito mais". Então: MEDIDA (o que o peso resolve) e MÉTODO (ver
 *    antes de existir) nos dois cartões; e uma banda de três para o que NÃO
 *    decorre do peso — custo de obra, o oco como função, e o ambiente.
 *
 * SACRIFÍCIO: a seção ficou mais alta. Em troca, cada afirmação está no eixo
 * certo e nenhuma sobra pendurada no fim de um cartão.
 */

/** Um bloco = 280 kg. Dez blocos ≈ 2.800 kg — a mesma peça em pedra natural. */
const BLOCOS_PEDRA_NATURAL = 10;

/** O que o PESO resolve. Tudo aqui é consequência direta de pesar 10× menos. */
const CONSEQUENCIAS = [
  { icon: Truck, texto: "Desce de caminhão comum, na mão." },
  { icon: DoorOpen, texto: "Entra por onde as pessoas entram." },
  {
    icon: TrafficCone,
    texto: "Sem travar a rua, sem guindaste, sem transtorno com vizinho.",
  },
  {
    icon: Layers,
    texto: "Peso que cabe em laje, apartamento, pavimento alto, cobertura e deck.",
  },
  { icon: Hammer, texto: "Fixa com argamassa AC3 de loja de bairro." },
];

/** O que NÃO decorre do peso — os outros dois eixos, mais o custo de obra. */
const OUTROS_EIXOS = [
  {
    icon: TrendingDown,
    rotulo: "Custo",
    texto:
      "A peça em si não é mais barata que pedra natural. A obra é: instalação, transporte e mão de obra caem no mínimo 30%.",
  },
  {
    icon: Cable,
    rotulo: "Função",
    texto:
      "Oca por dentro — dá para esconder fio, caixa, bomba e o que mais a instalação pedir.",
  },
  {
    icon: Leaf,
    rotulo: "Ambiente",
    texto:
      "Molde tirado da pedra real, em composto mineral com PET reciclado. Zero extração.",
  },
];

/** Rodapé de credencial — assinatura da seção, não prova. */
const CREDENCIAL = [
  { icon: MapPin, texto: "Ateliê próprio em Cajamar/SP desde 1993" },
  { icon: Paintbrush, texto: "Pintado à mão, peça por peça" },
  { icon: Building2, texto: "Cristal Pool e Genesis compram há mais de duas décadas" },
];

export default function APedraNumeroB() {
  return (
    <section className="surface-paper section border-t border-western-border-soft">
      <div className="container-western">
        {/* Três faixas compartilhadas: cabeçalho · título · corpo. A quarta
            faixa (o "fecho") morreu junto com os parágrafos pendurados. */}
        <div className="grid gap-y-8 lg:grid-cols-2 lg:gap-x-10 lg:gap-y-5 lg:grid-rows-[auto_auto_1fr]">
          {/* ============================================================
              BLOCO 1 — MEDIDA (dourado). Assunto único: o que o peso resolve.
              ============================================================ */}
          <article className="rounded-xl border border-western-border-soft border-t-[3px] border-t-western-gold bg-white p-6 md:p-7 shadow-[0_10px_30px_-24px_hsl(var(--western-stone-dark)/0.5)] lg:row-span-3 lg:grid lg:grid-rows-subgrid">
            <header className="flex items-center gap-3">
              <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-western-gold/45 bg-western-gold/10 text-western-bronze">
                <Scale className="h-5 w-5" strokeWidth={1.75} aria-hidden />
              </span>
              <span className="text-eyebrow">Medida</span>
            </header>

            <h2 className="display-md text-western-green-deep mt-4 lg:mt-0 max-w-[24ch]">
              280 kg onde a pedra natural pesa quase 3 toneladas.
            </h2>

            <div className="mt-5 lg:mt-0 lg:self-start">
              {/* ────────────────────────────────────────────────────────
                  A CONTAGEM. Cada bloco é a MESMA unidade (280 kg), então a
                  diferença não é de tamanho de desenho — é de quantidade de
                  peça. O olho conta, não mede. A Western fica sozinha e
                  inteira; a pedra natural vira pilha, e pilha lê como fardo.
                  aria-hidden no desenho: a informação já está no texto ao
                  lado, e dez blocos anunciados um a um seria ruído.
                  ──────────────────────────────────────────────────────── */}
              <p className="text-eyebrow mb-4">A mesma peça, nos dois materiais</p>

              <div className="space-y-4">
                <div>
                  <div className="flex flex-wrap items-center gap-1.5" aria-hidden>
                    <span className="h-8 w-8 rounded-[3px] bg-western-gold" />
                  </div>
                  <p className="mt-2 flex flex-wrap items-baseline gap-x-2">
                    <span className="font-display text-[26px] leading-none text-western-green-deep">
                      280 kg
                    </span>
                    <span className="text-meta text-western-bronze font-semibold">
                      Western · 1 bloco
                    </span>
                  </p>
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-1.5" aria-hidden>
                    {Array.from({ length: BLOCOS_PEDRA_NATURAL }, (_, i) => (
                      <span
                        key={i}
                        className="h-8 w-8 rounded-[3px] border border-western-border-strong bg-western-ivory"
                      />
                    ))}
                  </div>
                  <p className="mt-2 flex flex-wrap items-baseline gap-x-2">
                    <span className="font-display text-[26px] leading-none text-western-stone-warm">
                      quase 3 t
                    </span>
                    <span className="text-meta">Pedra natural · 10 blocos</span>
                  </p>
                </div>
              </div>

              <p className="text-meta mt-3">
                Cada bloco representa 280 kg — a maior cascata da linha. É a mesma peça,
                nos dois materiais.
              </p>

              {/* A razão vira consequência: é aqui que o número encosta na obra. */}
              <p className="mt-4 rounded-lg bg-western-ivory px-4 py-3 text-body">
                Uma desce <span className="font-semibold text-western-green-deep">na mão</span>.
                A outra pede{" "}
                <span className="font-semibold text-western-green-deep">guindaste</span>.
              </p>

              <ul className="mt-6 space-y-3 border-t border-western-border-soft pt-5">
                {CONSEQUENCIAS.map(({ icon: Icon, texto }) => (
                  <li key={texto} className="flex items-start gap-3">
                    <Icon
                      className="h-5 w-5 shrink-0 mt-0.5 text-western-bronze"
                      strokeWidth={1.75}
                      aria-hidden
                    />
                    <span className="text-body">{texto}</span>
                  </li>
                ))}
              </ul>
            </div>
          </article>

          {/* ============================================================
              BLOCO 2 — MÉTODO (verde). Assunto único: ver antes de existir.
              ============================================================ */}
          <article className="rounded-xl border border-western-border-soft border-t-[3px] border-t-western-cta bg-white p-6 md:p-7 shadow-[0_10px_30px_-24px_hsl(var(--western-stone-dark)/0.5)] lg:row-span-3 lg:grid lg:grid-rows-subgrid">
            <header className="flex items-center gap-3">
              <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-western-cta/25 bg-western-cta/[0.07] text-western-cta">
                <Boxes className="h-5 w-5" strokeWidth={1.75} aria-hidden />
              </span>
              <span className="text-eyebrow text-western-cta">Método</span>
            </header>

            <h2 className="display-md text-western-green-deep mt-4 lg:mt-0 max-w-[24ch]">
              O que você desenha é o que chega na obra.
            </h2>

            <div className="mt-5 lg:mt-0 lg:self-start">
              {/* Duas VISTAS do mesmo quarto (luz de render × luz de dia). A
                  legenda NOMEIA a âncora — sem ela o olho procura sozinho, não
                  acha, e lê mismatch. RENDER NUNCA é apresentado como foto.
                  Cada vista é uma <figure> aninhada com a sua legenda: um
                  <figure> só admite UM <figcaption>. */}
              <figure className="overflow-hidden rounded-lg border border-western-border-soft">
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
                  O mesmo quarto: o mesmo espelho arqueado, o mesmo biombo, o mesmo paredão —
                  do projeto à obra entregue.
                </figcaption>
              </figure>

              {/* O ARGUMENTO DE FIDELIDADE (pedido do dono). O ponto não é
                  "temos bloco 3D": é que a composição desenhada no CAD ou no
                  SketchUp usa AS MESMAS peças que serão entregues — por isso o
                  desenho e a obra se parecem tanto. Escrito como PERCURSO
                  (desenha → apresenta → aprova → executa) porque é assim que
                  quem projeta vive o processo. */}
              <p className="text-body mt-6 border-t border-western-border-soft pt-5">
                Toda peça tem bloco 3D no SketchUp. Você monta a composição no CAD ou no
                SketchUp com as mesmas peças que vão ser entregues, apresenta, ajusta com o
                cliente e só compra depois de aprovado.
              </p>
              <p className="text-body mt-3">
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
          </article>
        </div>

        {/* ============================================================
            TERCEIRA BANDA — "não é só a pedra leve".
            Os três itens aqui NÃO são consequência do peso: custo de obra,
            o oco como função, e o ambiente. Estavam pendurados no fim dos
            cartões (o que o dono reprovou) ou não estavam em lugar nenhum.
            Grade de três com subgrid: rótulo e texto começam na mesma altura.
            ============================================================ */}
        <div className="mt-10 rounded-xl border border-western-border-soft bg-white p-6 md:p-7">
          <p className="text-eyebrow mb-5">Não é só a pedra ser leve</p>
          <ul className="grid gap-6 md:grid-cols-3 md:gap-8 md:grid-rows-[auto_1fr]">
            {OUTROS_EIXOS.map(({ icon: Icon, rotulo, texto }) => (
              <li key={rotulo} className="md:row-span-2 md:grid md:grid-rows-subgrid md:gap-2">
                <div className="flex items-center gap-2.5">
                  <Icon
                    className="h-5 w-5 shrink-0 text-western-bronze"
                    strokeWidth={1.75}
                    aria-hidden
                  />
                  <span className="font-sans text-[15px] font-semibold text-western-green-deep">
                    {rotulo}
                  </span>
                </div>
                <p className="mt-2 text-body md:mt-0">{texto}</p>
              </li>
            ))}
          </ul>
        </div>

        {/* ============================================================
            RODAPÉ — a credencial. Fora do argumento: é assinatura, não prova.
            A frase dos tons é declarativa, sem CTA (regra do dono).
            ============================================================ */}
        <div className="mt-10 border-t border-western-border-soft pt-6">
          <ul className="grid gap-4 md:grid-cols-3 md:gap-6">
            {CREDENCIAL.map(({ icon: Icon, texto }) => (
              <li key={texto} className="flex items-start gap-3">
                <Icon
                  className="h-4 w-4 shrink-0 mt-1 text-western-bronze"
                  strokeWidth={1.75}
                  aria-hidden
                />
                <span className="text-meta">{texto}</span>
              </li>
            ))}
          </ul>

          <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <p className="text-meta max-w-[56ch]">
              O ateliê desenvolve tons conforme a geologia da região de cada projeto.
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
