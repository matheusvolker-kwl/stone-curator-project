import { Link } from "react-router-dom";
import {
  Sparkles,
  PencilRuler,
  HardHat,
  LifeBuoy,
  Feather,
  Eye,
  Leaf,
  Factory,
  ArrowRight,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import serraImg from "@/assets/parceria-instalacao.webp";

/* ALTERNATIVA C — SUBORDINAR: o diferencial vira prova do passo.
 * Tese: em vez de duas seções vizinhas com a mesma roupa (4 cartões + 4 cartões),
 * sobra UMA. A entrega manda; cada diferencial deixa de ser cartão e vira uma
 * linha de prova ancorada na entrega que ele sustenta — ícone pequeno, 14px,
 * régua dourada. A página perde uma seção inteira e ganha ritmo.
 * Sacrifica: o argumento perde palco próprio (não há mais uma dobra que grite
 * "por que a Western"), e quem só passa o olho lê serviço, não diferencial.
 */

type Entrega = {
  icon: LucideIcon;
  titulo: string;
  desc: string;
  /* A prova é o diferencial da seção 3, ancorado onde ele é verdadeiro. */
  provaIcon: LucideIcon;
  prova: string;
  /* Sinal de preço. Vira borda dourada + selo — mesma gramática que a seção
     "Como funciona" já usa (Grátis × Sob consulta). Cor aqui significa PREÇO,
     e só isso: nenhum outro item ganha dourado.
     TODO item carrega selo, inclusive os pagos: deixar os pagos em branco foi
     testado e REPROVADO pelo dono na seção "Como funciona" ("liam como preço
     escondido"). Meia gramática é pior que nenhuma. */
  gratis: boolean;
};

const ENTREGAS: Entrega[] = [
  {
    icon: Sparkles,
    titulo: "Consultoria",
    desc: "Especificação, viabilidade técnica e orientação sobre acabamentos, quantidades e integração ao projeto.",
    provaIcon: Feather,
    prova:
      "Pedra até 10× mais leve permite cascatas e piscinas onde a pedra natural não aguenta: declives, lajes, estruturas críticas.",
    gratis: true,
  },
  {
    icon: PencilRuler,
    titulo: "Projeto & Render",
    desc: "Visualização 3D fotorrealista antes da obra — decida com segurança e alinhe expectativas com o cliente.",
    provaIcon: Eye,
    prova:
      "Você e seu cliente aprovam o resultado em 3D antes de a primeira peça sair da fábrica.",
    gratis: false,
  },
  {
    icon: HardHat,
    titulo: "Instalação",
    desc: "Execução pela equipe Western, com técnica apurada, fixação correta e acabamento integrado ao paisagismo.",
    provaIcon: Leaf,
    prova:
      "Instalação por profissionais com 20+ anos de casa. Molde tirado da pedra real, com PET reciclado — zero extração.",
    gratis: false,
  },
  {
    icon: LifeBuoy,
    titulo: "Acompanhamento",
    desc: "Suporte contínuo do conceito à entrega — logística, cronograma e ajustes finos no local da obra.",
    provaIcon: Factory,
    prova:
      "Do molde à instalação — ninguém conhece a peça como a fábrica que a inventou.",
    gratis: false,
  },
];

/* Duas peles de ícone que CODIFICAM papel, não decoram:
 * · ENTREGA = ícone emoldurado (quadrado 44px, fundo branco, fio) — é escopo.
 * · PROVA   = ícone nu, 16px, bronze — é anotação, não item contratável.
 * A moldura dourada aparece só no item cujo preço é zero. */
const ICON_BOX =
  "inline-flex h-11 w-11 items-center justify-center rounded-lg bg-white border";
const ICON_BOX_PADRAO = "border-western-border-strong text-western-bronze";
const ICON_BOX_GRATIS = "border-western-gold text-western-green-deep";

export default function ContrateServicosC() {
  return (
    <section className="surface-paper section border-y border-western-border-soft">
      <div className="container-western">
        <div className="max-w-6xl">
          {/* Diagramação 1 — MESMA RÉGUA: as duas colunas penduram do mesmo fio
              (border-t + pt-6). Nada de coluna começando em altura diferente da
              outra; no celular cada uma mantém o próprio fio, mesma leitura. */}
          <div className="grid md:grid-cols-12 gap-10 md:gap-14 items-start">
            {/* — COLUNA DO ARGUMENTO (o que sobrou da seção 3) — */}
            {/* pt acompanha o py do <li> em CADA faixa (6 no mobile, 7 no md):
                com pt-6 fixo, a partir de md o eyebrow subia 4px em relação à
                primeira entrega e a "mesma régua" deixava de ser verdade. */}
            <div className="md:col-span-5 border-t border-western-border-soft pt-6 md:pt-7">
              <p className="text-eyebrow">O que fazemos por você</p>
              {/* Sem "Um único parceiro": a fórmula estava nas duas seções. */}
              <h2 className="display-lg text-western-green-deep mt-3">
                A fábrica e a executora são o mesmo time.
              </h2>
              <p className="mt-5 text-body">
                Custo, prazo, técnica e responsabilidade não se dividem entre
                fornecedores — do render 3D à peça posicionada em obra. Cada
                entrega vem com a razão técnica que a sustenta.
              </p>

              <div className="mt-8 aspect-[4/3] overflow-hidden rounded-xl">
                <img
                  src={serraImg}
                  alt="Equipe própria da Western instalando peças em obra"
                  width={800}
                  height={600}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* A saída fica colada na foto da equipe: é ali que o leitor
                  pergunta "como duas pessoas carregam isso na mão?". */}
              <Link to="/a-pedra" className="link-cta mt-4">
                Por que a pedra pesa 10× menos
                <ArrowRight className="h-5 w-5" strokeWidth={1.75} aria-hidden />
              </Link>
            </div>

            {/* — COLUNA DA ENTREGA —
                Diagramação 2 — LEDGER, NÃO CARTÃO: uma coluna só, linhas
                separadas por fio. Some o problema de baseline por construção
                (não há dois cartões lado a lado para desalinhar) e o ritmo
                deixa de repetir os cartões da seção "Como funciona". */}
            <ol className="md:col-span-7 border-t border-b border-western-border-soft divide-y divide-western-border-soft">
              {ENTREGAS.map((e) => (
                <li
                  key={e.titulo}
                  /* Diagramação 3 — UM ÚNICO EIXO DE TEXTO: trilho fixo de
                     2.75rem para o ícone; título, descrição e prova compartilham
                     exatamente a mesma margem esquerda, em desk e mobile. */
                  className="grid grid-cols-[2.75rem_1fr] gap-x-4 sm:gap-x-5 py-6 md:py-7"
                >
                  <span
                    className={`${ICON_BOX} ${
                      e.gratis ? ICON_BOX_GRATIS : ICON_BOX_PADRAO
                    }`}
                  >
                    <e.icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
                  </span>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      <h3 className="font-sans font-semibold text-[18px] leading-[1.3] text-western-green-deep">
                        {e.titulo}
                      </h3>
                      {/* Mesma gramática da seção "Como funciona": dourado
                          sólido = zero; fio + bronze = sob consulta. Nenhum item
                          fica sem sinal de preço.
                          Diferença de FUNDO, não de gramática: lá o selo neutro
                          é paper porque mora numa carta branca; aqui o chão já é
                          paper, então o neutro inverte para branco — senão o
                          preenchimento sumia e sobrava só o fio. */}
                      <span
                        className={`rounded-sm px-2.5 py-1 font-sans text-[14px] font-semibold leading-none ${
                          e.gratis
                            ? "bg-western-gold text-western-green-deep"
                            : "border border-western-border-strong bg-white text-western-bronze"
                        }`}
                      >
                        {e.gratis ? "Grátis" : "Sob consulta"}
                      </span>
                    </div>

                    <p className="mt-2 text-spec leading-relaxed">{e.desc}</p>

                    {/* PROVA: superfície branca + régua dourada fina à esquerda.
                        O dourado sólido é preço; o dourado a 40% num fio é
                        "isto é argumento, não é escopo". Nunca decorativo. */}
                    <div className="mt-4 flex gap-3 rounded-r-lg border-l-2 border-western-gold/40 bg-white py-3 pl-4 pr-4">
                      <e.provaIcon
                        className="h-4 w-4 mt-[3px] shrink-0 text-western-bronze"
                        strokeWidth={1.75}
                        aria-hidden
                      />
                      <p className="text-meta leading-[1.55]">{e.prova}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
