import { Link } from "react-router-dom";
import {
  Scale,
  Boxes,
  Truck,
  DoorOpen,
  Hammer,
  MapPin,
  Paintbrush,
  Building2,
  ArrowRight,
} from "lucide-react";

import quadriplex3d from "@/assets/a-pedra/quadriplex-3d.webp";
import quadriplexObra from "@/assets/a-pedra/quadriplex-obra.webp";

/**
 * VARIANTE B — "duas provas, dois blocos limpos".
 *
 * TESE: o bloco atual falha porque a coluna direita é uma gaveta — prova 3D,
 * estatística, currículo e link, quatro assuntos num invólucro só. Aqui são
 * DOIS blocos com UM assunto cada: MEDIDA (dourado — o físico, o que se pesa)
 * e MÉTODO (verde — o processo, o que se prevê). A cor e a borda de topo
 * codificam o TIPO de prova; não decoram. O currículo do ateliê sai do meio do
 * argumento e vira rodapé da seção, onde credencial pertence.
 *
 * A inversão de hierarquia das barras foi resolvida por UMA régua só: a régua
 * inteira é a pedra natural (contorno tracejado, sem tinta) e os 280 kg são o
 * único trecho PINTADO dentro dela, a 10% da largura. A proporção continua
 * verdadeira; o que muda é quem recebe tinta e quem recebe contorno.
 *
 * SACRIFÍCIO: perde-se o impacto de dois display-stat empilhados — "quase 3 t"
 * desce a um rótulo de régua. A comparação fica menos teatral e mais métrica.
 */

/** Consequências do peso — decompostas da frase única que existia no parágrafo. */
const CONSEQUENCIAS = [
  { icon: Truck, texto: "Desce de caminhão comum, na mão." },
  { icon: DoorOpen, texto: "Entra por onde as pessoas entram." },
  { icon: Hammer, texto: "Fixa com argamassa AC3 de loja de bairro." },
];

/** Rodapé de credencial — sai do meio do argumento, vira assinatura da seção. */
const CREDENCIAL = [
  { icon: MapPin, texto: "Ateliê próprio em Cajamar/SP desde 1993" },
  { icon: Paintbrush, texto: "Pintado à mão, peça por peça" },
  { icon: Building2, texto: "Cristal Pool e Genesis compram há mais de duas décadas" },
];

export default function APedraNumeroB() {
  return (
    <section className="surface-paper section border-t border-western-border-soft">
      <div className="container-western">
        {/* Grade de 4 linhas compartilhadas: cabeçalho · título · prova · fecho.
            Com grid-rows-subgrid os dois blocos usam a MESMA régua horizontal —
            título de 1 linha e de 2 linhas não desalinham o corpo abaixo.
            No mobile a grade desmonta e o ritmo volta pras margens (mt-*). */}
        <div className="grid gap-y-8 lg:grid-cols-2 lg:gap-x-10 lg:gap-y-5 lg:grid-rows-[auto_auto_1fr_auto]">
          {/* ============================================================
              BLOCO 1 — MEDIDA (dourado). Assunto único: o peso.
              ============================================================ */}
          <article className="rounded-xl border border-western-border-soft border-t-[3px] border-t-western-gold bg-white p-6 md:p-7 shadow-[0_10px_30px_-24px_hsl(var(--western-stone-dark)/0.5)] lg:row-span-4 lg:grid lg:grid-rows-subgrid">
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
              {/* Números na mesma linha de base: o herói em display-stat, o
                  comparativo em corpo pequeno. A ênfase tipográfica é da
                  Western; a régua abaixo mantém a escala real (10%). */}
              <div className="flex items-baseline justify-between gap-4">
                <p className="display-stat text-western-green-deep">280 kg</p>
                <p className="text-title-sm text-western-stone-warm text-right">quase 3 t</p>
              </div>

              {/* A régua: o contorno tracejado é a pedra natural (100%); a tinta
                  dourada é a Western (10%). Uma régua, duas leituras. */}
              <div
                className="mt-4 h-10 rounded-md border border-dashed border-western-border-strong bg-western-ivory p-1"
                aria-hidden
              >
                <div className="h-full w-[10%] rounded-sm bg-western-gold" />
              </div>
              <div className="mt-2 flex items-start justify-between gap-4">
                <p className="text-meta text-western-bronze font-semibold">Western</p>
                <p className="text-meta text-right">Pedra natural</p>
              </div>
              <p className="text-meta mt-3">
                A maior cascata da linha × a mesma peça em pedra natural.
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

            {/* GUARDA DE CONTEÚDO: a PEÇA não é mais barata. A OBRA é. */}
            <p className="text-body mt-6 lg:mt-0 max-w-[48ch]">
              A peça em si não é mais barata que pedra natural. A obra é:{" "}
              <span className="font-semibold text-western-green-deep">
                instalação, transporte e mão de obra caem no mínimo 30%.
              </span>
            </p>
          </article>

          {/* ============================================================
              BLOCO 2 — MÉTODO (verde). Assunto único: ver antes de comprar.
              ============================================================ */}
          <article className="rounded-xl border border-western-border-soft border-t-[3px] border-t-western-cta bg-white p-6 md:p-7 shadow-[0_10px_30px_-24px_hsl(var(--western-stone-dark)/0.5)] lg:row-span-4 lg:grid lg:grid-rows-subgrid">
            <header className="flex items-center gap-3">
              <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-western-cta/25 bg-western-cta/[0.07] text-western-cta">
                <Boxes className="h-5 w-5" strokeWidth={1.75} aria-hidden />
              </span>
              <span className="text-eyebrow text-western-cta">Método</span>
            </header>

            <h2 className="display-md text-western-green-deep mt-4 lg:mt-0 max-w-[24ch]">
              O projeto aprovado antes de a peça existir.
            </h2>

            <div className="mt-5 lg:mt-0 lg:self-start">
              {/* Duas VISTAS do mesmo quarto (luz de render × luz de dia). A
                  legenda NOMEIA a âncora — sem ela o olho procura sozinho, não
                  acha, e lê mismatch. RENDER NUNCA é apresentado como foto. */}
              {/* Cada vista é uma <figure> ANINHADA com a sua própria legenda: um
                  <figure> só admite UM <figcaption>. Três legendas soltas dentro
                  do mesmo <figure> (como estava na /a-pedra v1) é markup inválido
                  e o leitor de tela lê legenda errada na imagem errada. */}
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
                    <figcaption className="text-meta px-3 py-2.5">A obra construída · foto</figcaption>
                  </figure>
                </div>
                <figcaption className="text-meta border-t border-western-border-soft px-3 py-2.5">
                  O mesmo quarto: o mesmo espelho arqueado, o mesmo biombo, o mesmo paredão —
                  do projeto à obra entregue.
                </figcaption>
              </figure>

              {/* Mesma gramática do bloco de MEDIDA: fio + lista com ícone.
                  Aqui o ícone é o do bloco (Boxes), porque o item É o método. */}
              <ul className="mt-6 space-y-3 border-t border-western-border-soft pt-5">
                <li className="flex items-start gap-3">
                  <Boxes
                    className="h-5 w-5 shrink-0 mt-0.5 text-western-cta"
                    strokeWidth={1.75}
                    aria-hidden
                  />
                  <span className="text-body">
                    Toda peça tem bloco 3D no SketchUp — você monta a composição, valida com o
                    cliente e só compra depois de aprovado.
                  </span>
                </li>
              </ul>
            </div>

            <p className="text-body mt-6 lg:mt-0 max-w-[48ch]">
              Os blocos já saíram do ateliê para a mesa de quem projeta:{" "}
              <span className="font-semibold text-western-green-deep">+300 mil downloads.</span>
            </p>
          </article>
        </div>

        {/* ============================================================
            RODAPÉ — a credencial. Fora do argumento, sob os dois blocos:
            é assinatura, não prova. A frase dos tons é declarativa, sem CTA
            e sem bloco próprio (regra do dono).
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
