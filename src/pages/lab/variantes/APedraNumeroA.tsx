import { Link } from "react-router-dom";
import {
  ArrowRight,
  Boxes,
  DoorOpen,
  Feather,
  MapPin,
  Mountain,
  Package,
  PencilRuler,
  TrendingDown,
  Truck,
  Wrench,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import quadriplex3d from "@/assets/a-pedra/quadriplex-3d.webp";
import quadriplexObra from "@/assets/a-pedra/quadriplex-obra.webp";

/**
 * VARIANTE A — "UMA RÉGUA SÓ".
 * TESE: a comparação de peso é o espetáculo. Ela deixa de ser meia-coluna e passa
 * a ocupar a banda inteira: duas barras na MESMA régua, lidas em dois segundos.
 * Tudo o mais desce como camada de apoio — a gaveta da coluna direita foi desmontada
 * em quatro camadas com donos distintos (obra → preço → 3D → ateliê).
 * SACRIFÍCIO: perde-se o confronto lado a lado (número × 3D na mesma dobra); a seção
 * fica mais alta e a prova 3D só aparece depois de rolar a régua inteira.
 */

/* ---------------------------------------------------------------------------
 * A INVERSÃO DE HIERARQUIA, RESOLVIDA (o defeito nº 2 do briefing).
 * Antes: "280 kg" ganhava uma barra dourada de 10% e "quase 3 t" ganhava a barra
 * cheia e mais pesada — geometria certa, retórica invertida.
 * Agora a decisão é explícita: A TIPOGRAFIA CARREGA A RETÓRICA, A BARRA CARREGA A
 * GEOMETRIA. O 280 kg é display-stat (o maior elemento do site) e sua barra é a
 * única MACIÇA da seção; a pedra natural fica um degrau abaixo em display-lg e sua
 * barra, apesar de ocupar 100% da régua, é FANTASMA (tracejada, hachurada, sem
 * tinta). A proporção continua literalmente verdadeira — 10% contra 100% — mas o
 * peso de tinta está do lado certo.
 * ------------------------------------------------------------------------- */
const HACHURA_NATURAL = {
  backgroundImage:
    "repeating-linear-gradient(135deg, hsl(var(--western-stone-warm) / 0.16) 0 2px, transparent 2px 9px)",
} as const;

/* Camada de apoio 1 — o que a régua significa NA OBRA. Três fatos, um assunto só:
   por isso os três cartões são idênticos. Cor que não codifica nada é proibida. */
const NA_OBRA: { icon: LucideIcon; titulo: string; desc: string }[] = [
  {
    icon: Truck,
    titulo: "Caminhão comum",
    desc: "Desce na mão, sem guindaste.",
  },
  {
    icon: DoorOpen,
    titulo: "Entra por onde as pessoas entram",
    desc: "Passa pelo vão da porta, sem abrir parede.",
  },
  {
    icon: Wrench,
    titulo: "Argamassa AC3",
    desc: "Fixa com material de loja de bairro.",
  },
];

export default function APedraNumeroA() {
  return (
    <section className="surface-paper section border-t border-western-border-soft">
      <div className="container-western">
        {/* CABEÇALHO assimétrico: título à esquerda na medida de leitura, escopo da
            medição à direita e alinhado pela BASE — não é centralizar, é equalizar. */}
        <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between md:gap-10">
          <div className="max-w-[26ch]">
            <p className="text-eyebrow mb-3">O número</p>
            <h2 className="display-lg text-western-green-deep">A mesma peça, na mesma régua.</h2>
          </div>
          <p className="text-meta md:max-w-[30ch] md:text-right">
            A maior cascata da linha, comparada peça a peça com a mesma forma em pedra natural.
          </p>
        </header>

        {/* ================= A RÉGUA — banda inteira ================= */}
        <div className="mt-9 md:mt-12">
          {/* Linha 1 — WESTERN. Selo maciço + número no topo da escala. */}
          <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
            <div className="flex items-end gap-3">
              <span
                className="mb-1.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-western-gold/45 bg-western-gold/12"
                aria-hidden
              >
                <Feather className="h-[18px] w-[18px] text-western-bronze" strokeWidth={1.75} />
              </span>
              <p className="display-stat text-western-green-deep">280 kg</p>
            </div>
            <p className="text-eyebrow mb-2">Pedra Western</p>
          </div>

          <div className="mt-3 h-9 overflow-hidden rounded-lg border border-western-border-soft bg-white/60 md:h-11">
            <div className="h-full w-[10%] bg-western-gold" aria-hidden />
          </div>

          {/* Linha 2 — PEDRA NATURAL. Selo tracejado + número um degrau abaixo. */}
          <div className="mt-8 flex flex-wrap items-end justify-between gap-x-6 gap-y-2 md:mt-10">
            <div className="flex items-end gap-3">
              <span
                className="mb-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-dashed border-western-stone-warm/45"
                aria-hidden
              >
                <Mountain className="h-[18px] w-[18px] text-western-stone-warm" strokeWidth={1.75} />
              </span>
              <p className="display-lg text-western-stone-warm">quase 3 t</p>
            </div>
            <p className="text-sublabel mb-1.5">Pedra natural</p>
          </div>

          <div
            className="relative mt-3 h-9 rounded-lg border border-dashed border-western-stone-warm/45 md:h-11"
            style={HACHURA_NATURAL}
          >
            {/* O FIO: marca, dentro da barra da pedra natural, onde a peça Western
                termina. É aqui que a seção se lê em dois segundos. */}
            <div className="absolute inset-y-0 left-[10%] w-[2px] bg-western-gold" aria-hidden />
          </div>

          {/* Rótulo do fio, ancorado na mesma coordenada de 10%. */}
          <div className="relative mt-2 h-5">
            {/* 14px é o mínimo absoluto do DS (público 40+) — inclusive em rótulo de escala. */}
            <span className="absolute left-[10%] -translate-x-1/2 font-sans text-[14px] font-semibold tabular-nums text-western-bronze">
              10%
            </span>
          </div>
          <p className="text-meta mt-1 max-w-prose">
            As duas barras dividem a mesma régua. O fio dourado marca onde a peça Western termina.
          </p>
        </div>

        {/* ============ CAMADA DE APOIO 1 — o que muda na obra ============ */}
        <div className="mt-11 grid gap-4 md:mt-14 md:grid-cols-3 md:gap-5">
          {NA_OBRA.map(({ icon: Icone, titulo, desc }) => (
            <div
              key={titulo}
              className="rounded-xl border border-western-border-soft bg-white/70 p-5 shadow-[0_10px_30px_-24px_hsl(var(--western-stone-dark)/0.5)] md:p-6"
            >
              <span
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-western-border-soft bg-western-ivory"
                aria-hidden
              >
                <Icone className="h-[18px] w-[18px] text-western-bronze" strokeWidth={1.75} />
              </span>
              {/* Linha de base travada: títulos de 1 e de 2 linhas não podem empurrar
                  o corpo para alturas diferentes no grid de 3 colunas. */}
              <h3 className="text-title-sm mt-4 md:min-h-[2.95rem]">{titulo}</h3>
              <p className="text-meta mt-1.5">{desc}</p>
            </div>
          ))}
        </div>

        {/* ============ CAMADA DE APOIO 2 — o preço, em par ============
            Aqui a cor da BORDA codifica algo verdadeiro e o par existe justamente
            para impedir a leitura errada: cinza tracejado = o que NÃO muda (a peça),
            dourado maciço = o que muda (a obra). Mesma régua de cor da banda acima. */}
        <div className="mt-5 grid gap-4 md:grid-cols-2 md:gap-5">
          <div className="rounded-xl border border-western-border-soft border-l-[3px] border-l-western-stone-warm/50 bg-white/70 p-5 md:p-6">
            <div className="flex items-center gap-2.5">
              <Package className="h-[18px] w-[18px] text-western-stone-warm" strokeWidth={1.75} aria-hidden />
              <span className="text-sublabel">A peça</span>
            </div>
            <p className="text-body mt-3">
              A peça em si não é mais barata que pedra natural.
            </p>
          </div>

          <div className="rounded-xl border border-western-border-soft border-l-[3px] border-l-western-gold bg-western-ivory p-5 md:p-6">
            <div className="flex items-center gap-2.5">
              <TrendingDown className="h-[18px] w-[18px] text-western-bronze" strokeWidth={1.75} aria-hidden />
              <span className="text-eyebrow">A obra</span>
            </div>
            <p className="text-body mt-3">
              Instalação, transporte e mão de obra caem no mínimo 30%.
            </p>
          </div>
        </div>

        {/* ============ CAMADA DE APOIO 3 — a prova 3D, com ar próprio ============
            Sai da gaveta e ganha fio de corte + assunto próprio. O verde codifica
            uma terceira categoria verdadeira: não é argumento de peso nem de preço,
            é O QUE A WESTERN ENTREGA ANTES DA OBRA. */}
        <div className="mt-12 border-t border-western-border-soft pt-10 md:mt-16 md:pt-12">
          <div className="grid items-start gap-8 lg:grid-cols-12 lg:gap-12">
            <figure className="overflow-hidden rounded-xl border border-western-border-soft bg-white lg:col-span-7">
              {/* Fica em 2 colunas SEMPRE: é um antes/depois do mesmo quarto — empilhar
                  mata o confronto. O preço disso é a legenda apertada no celular, onde
                  "Projeto 3D · render" cabe em 1 linha e "A obra construída · foto" em 2:
                  min-h iguala as duas caixas até sm e sai do caminho depois. */}
              <div className="grid grid-cols-2 gap-px bg-western-border-soft">
                <div className="bg-white">
                  <img
                    src={quadriplex3d}
                    alt="Render do quarto: paredão de rocha, espelho arqueado dourado e biombo de vareta contra o painel ripado."
                    loading="lazy"
                    decoding="async"
                    className="aspect-square w-full object-cover"
                  />
                  <figcaption className="text-meta min-h-[3.9rem] px-4 py-2.5 sm:min-h-0">
                    Projeto 3D · render
                  </figcaption>
                </div>
                <div className="bg-white">
                  <img
                    src={quadriplexObra}
                    alt="Foto do mesmo quarto construído: o mesmo paredão, espelho e biombo, em obra entregue."
                    loading="lazy"
                    decoding="async"
                    className="aspect-square w-full object-cover"
                  />
                  <figcaption className="text-meta min-h-[3.9rem] px-4 py-2.5 sm:min-h-0">
                    A obra construída · foto
                  </figcaption>
                </div>
              </div>
              <figcaption className="text-meta border-t border-western-border-soft px-4 py-2.5">
                O mesmo quarto: o mesmo espelho arqueado, o mesmo biombo, o mesmo paredão — do
                projeto à obra entregue.
              </figcaption>
            </figure>

            <div className="lg:col-span-5">
              <div className="flex items-center gap-2.5">
                <span
                  className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-western-cta/25 bg-western-cta/10"
                  aria-hidden
                >
                  <PencilRuler className="h-[18px] w-[18px] text-western-cta" strokeWidth={1.75} />
                </span>
                <p className="text-eyebrow">O projeto antes da obra</p>
              </div>
              <h3 className="display-md mt-4 text-western-green-deep">
                Você monta a composição antes de comprar.
              </h3>
              <p className="text-body mt-3 max-w-prose-sm">
                Toda peça tem bloco 3D no SketchUp — você monta a composição, valida com o cliente
                e só compra depois de aprovado.
              </p>

              {/* O dado de downloads deixa de flutuar solto: vira prova ANCORADA no 3D. */}
              <div className="mt-5 inline-flex items-center gap-3 rounded-lg border border-western-border-soft bg-white/70 px-4 py-3">
                <Boxes className="h-5 w-5 shrink-0 text-western-bronze" strokeWidth={1.75} aria-hidden />
                {/* Papel do DS, não escala nova: display-md já é o degrau certo aqui.
                    text-[1.35rem] inventado era exatamente o drift que o DS nomeia. */}
                <span className="display-md tabular-nums text-western-green-deep">+300 mil</span>
                <span className="text-meta">downloads dos blocos</span>
              </div>

              <div>
                <Link to="/obras" className="link-cta mt-3">
                  Ver obras entregues
                  <ArrowRight className="h-5 w-5" strokeWidth={1.75} aria-hidden />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* ============ CAMADA DE APOIO 4 — o ateliê, uma linha só ============
            Era um bloco dentro da gaveta; vira rodapé de procedência. A frase dos
            tons segue a regra do dono: declarativa, sem CTA, sem bloco próprio. */}
        <div className="mt-10 flex items-start gap-2.5 border-t border-western-border-soft pt-6">
          <MapPin className="h-[18px] w-[18px] shrink-0 text-western-stone-warm" strokeWidth={1.75} aria-hidden />
          <p className="text-meta max-w-[76ch]">
            Ateliê próprio em Cajamar/SP desde 1993 · pintado à mão, peça por peça · Cristal Pool e
            Genesis compram há mais de duas décadas. O ateliê desenvolve tons conforme a geologia da
            região de cada projeto.
          </p>
        </div>
      </div>
    </section>
  );
}
