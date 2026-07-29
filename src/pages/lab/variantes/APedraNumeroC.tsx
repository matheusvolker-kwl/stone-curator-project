import { Link } from "react-router-dom";
import { ArrowRight, Box, Camera, Equal, Feather, Truck } from "lucide-react";

import quadriplex3d from "@/assets/a-pedra/quadriplex-3d.webp";
import quadriplexObra from "@/assets/a-pedra/quadriplex-obra.webp";

/**
 * VARIANTE C — "A FOTO É O ARGUMENTO".
 *
 * TESE: o par render × obra construída é a prova mais forte da Western e hoje
 * está espremido numa coluna de meia largura. Aqui ele vira o protagonista, em
 * largura total, com a legenda que NOMEIA a âncora (espelho, biombo, paredão).
 * O peso desce para uma faixa de dados enxuta ancorada logo abaixo do díptico:
 * presente e verdadeiro, mas sem competir com a imagem.
 *
 * O QUE SACRIFICA: os números perdem a escala display-stat (o "280 kg" gigante
 * de 5,5rem deixa de existir) e o currículo do ateliê desce a linha de crédito —
 * quem lê só os títulos sai daqui com a prova visual, não com a estatística.
 */
export default function APedraNumeroC() {
  return (
    <section className="surface-paper section border-t border-western-border-soft">
      <div className="container-western">
        {/* CABEÇALHO ASSIMÉTRICO — título à esquerda (7 col), apoio à direita
            (5 col, começando na 8). `lg:items-end` alinha a BASE do parágrafo
            com a base da última linha do título: se o título quebrar em duas
            linhas, nada fica ragged. */}
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-10">
          <div className="lg:col-span-7">
            <p className="text-eyebrow mb-3">O projeto antes da obra</p>
            <h2 className="display-lg text-western-green-deep max-w-[22ch]">
              O mesmo quarto: o render e a obra entregue.
            </h2>
          </div>
          <div className="lg:col-span-5 lg:col-start-8">
            <p className="text-body max-w-[46ch]">
              Toda peça tem bloco 3D no SketchUp — você monta a composição, valida com o
              cliente e só compra depois de aprovado.{" "}
              <span className="font-semibold text-western-bronze">+300 mil downloads.</span>
            </p>
          </div>
        </div>

        {/* O DÍPTICO — protagonista, largura total do container.
            CODIFICAÇÃO DE COR/BORDA (significa algo verdadeiro, não decora):
            DOURADO = o que ainda é projeção (render); VERDE = o que já é
            entrega (obra construída). O chip sobre a foto repete a mesma cor,
            e sobre fundo escuro o acento é gold-soft — nunca bronze. */}
        <div className="mt-8 grid gap-5 md:mt-10 md:grid-cols-2 md:gap-6">
          {/* PAINEL 1 — PROJEÇÃO */}
          <figure className="flex flex-col overflow-hidden rounded-xl border border-western-gold/40 bg-white shadow-[0_10px_30px_-24px_hsl(var(--western-stone-dark)/0.5)]">
            <div className="relative">
              <img
                src={quadriplex3d}
                alt="Render do quarto: paredão de rocha, espelho arqueado dourado e biombo de vareta contra o painel ripado."
                loading="lazy"
                decoding="async"
                className="w-full aspect-[16/10] md:aspect-[4/3] object-cover"
              />
              <span className="absolute left-3 top-3 inline-flex items-center gap-2 rounded-lg bg-western-green-deep/90 px-3 py-1.5 font-sans text-[14px] font-semibold uppercase tracking-[0.06em] text-western-gold-soft backdrop-blur-sm">
                <Box className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
                Render
              </span>
            </div>
            {/* min-h + items-center: as duas legendas ocupam a mesma caixa
                mesmo se uma quebrar em 2 linhas no mobile. */}
            <figcaption className="flex min-h-[3.25rem] items-center px-4 py-3 text-meta">
              Projeto 3D · antes de a primeira peça sair do ateliê
            </figcaption>
            {/* mt-auto trava o fio no rodapé do cartão: os dois fios ficam na
                MESMA linha de base, independente da altura da legenda. */}
            <div className="mt-auto h-[3px] bg-western-gold" aria-hidden />
          </figure>

          {/* PAINEL 2 — ENTREGA */}
          <figure className="flex flex-col overflow-hidden rounded-xl border border-western-green-deep/25 bg-white shadow-[0_10px_30px_-24px_hsl(var(--western-stone-dark)/0.5)]">
            <div className="relative">
              <img
                src={quadriplexObra}
                alt="Foto do mesmo quarto construído: o mesmo paredão, espelho e biombo, em obra entregue."
                loading="lazy"
                decoding="async"
                className="w-full aspect-[16/10] md:aspect-[4/3] object-cover"
              />
              <span className="absolute left-3 top-3 inline-flex items-center gap-2 rounded-lg bg-western-green-deep/90 px-3 py-1.5 font-sans text-[14px] font-semibold uppercase tracking-[0.06em] text-western-cream backdrop-blur-sm">
                <Camera className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
                Foto
              </span>
            </div>
            <figcaption className="flex min-h-[3.25rem] items-center px-4 py-3 text-meta">
              A obra construída · registro no local
            </figcaption>
            <div className="mt-auto h-[3px] bg-western-cta" aria-hidden />
          </figure>
        </div>

        {/* A ÂNCORA — sem ela o olho procura sozinho, não acha, e lê mismatch.
            O ícone Equal diz "são o mesmo" antes de a frase dizer. */}
        <p className="mt-4 flex max-w-prose items-start gap-2.5 text-meta">
          <Equal className="mt-[3px] h-4 w-4 shrink-0 text-western-bronze" strokeWidth={2} aria-hidden />
          <span>
            O mesmo espelho arqueado, o mesmo biombo, o mesmo paredão — do projeto à obra
            entregue.
          </span>
        </p>

        {/* FAIXA DE DADOS — ancorada na foto (mesma largura, logo abaixo).
            RESOLVE A HIERARQUIA INVERTIDA: em vez de duas barras concorrendo,
            UMA régua só. Os 10% dourados são a verdade geométrica (280 kg de
            ~3 t); o restante é campo neutro, não um bloco pesado. A ênfase
            muda pela SATURAÇÃO, não pelo tamanho — a proporção continua honesta.
            As duas colunas abrem com eyebrow: baseline igual por construção. */}
        <div className="mt-6 rounded-xl border border-western-border-soft bg-western-ivory p-6 md:mt-8 md:p-8">
          <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
            <div className="lg:col-span-5">
              <p className="text-eyebrow mb-4 flex items-center gap-2">
                <Feather className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
                O peso
              </p>
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="display-lg tabular-nums text-western-green-deep">280 kg</span>
                <span className="text-body">contra quase 3 t em pedra natural</span>
              </div>
              <div
                className="mt-4 h-3 w-full overflow-hidden rounded-full bg-western-border-soft"
                aria-hidden
              >
                <div className="h-full w-[10%] rounded-full bg-western-gold" />
              </div>
              {/* flex-wrap: a 320px os dois rótulos não cabem na mesma linha e
                  sem isto eles se espremem em 2 colunas estreitas e ilegíveis.
                  Ao quebrar, empilham alinhados à esquerda — não centralizados. */}
              <div className="mt-2 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <span className="text-meta text-western-bronze">Western · 10% do peso</span>
                <span className="text-meta">Pedra natural · 100%</span>
              </div>
              <p className="text-meta mt-3">
                A maior cascata da linha × a mesma peça em pedra natural.
              </p>
            </div>

            <div className="lg:col-span-6 lg:col-start-7">
              <p className="text-eyebrow mb-4 flex items-center gap-2">
                <Truck className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
                O que isso muda na obra
              </p>
              <p className="text-body max-w-[48ch]">
                A peça em si não é mais barata que pedra natural. A obra é: instalação,
                transporte e mão de obra caem no mínimo 30%. Desce de caminhão comum na mão,
                entra por onde as pessoas entram e fixa com argamassa AC3 de loja de bairro.
              </p>
            </div>
          </div>
        </div>

        {/* LINHA DE CRÉDITO — o currículo do ateliê é ASSINATURA, não argumento:
            sai da coluna onde disputava atenção e vira rodapé tipográfico.
            A frase dos tons é a regra do dono: declarativa, sem CTA. */}
        <div className="mt-8 flex flex-col gap-3 border-t border-western-border-soft pt-5 md:mt-10 md:flex-row md:items-end md:justify-between md:gap-8">
          <p className="text-meta max-w-[58ch]">
            Ateliê próprio em Cajamar/SP desde 1993 · pintado à mão, peça por peça · Cristal
            Pool e Genesis compram há mais de duas décadas. O ateliê desenvolve tons conforme
            a geologia da região de cada projeto.
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
