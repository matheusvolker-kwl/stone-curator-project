import { Link } from "react-router-dom";
import {
  Sparkles,
  PencilRuler,
  HardHat,
  LifeBuoy,
  Feather,
  Eye,
  Factory,
  Leaf,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import serraImg from "@/assets/parceria-instalacao.webp";

/* VARIANTE A — "FUNDIR: O SERVIÇO É A ESPINHA".
 * Tese: uma seção só. A ENTREGA (Consultoria → Projeto & Render → Instalação →
 * Acompanhamento) é a espinha visível e numerada; o DIFERENCIAL deixa de ser card
 * irmão e entra ancorado DENTRO da etapa que ele prova ("Render antes da obra" é a
 * prova de "Projeto & Render"; "Quem fabrica, executa" é a prova de "Instalação").
 * Isso mata de uma vez a fórmula repetida ("Um único parceiro…") e a sobreposição
 * de conteúdo entre as duas seções vizinhas.
 * Sacrifica: "Por que a Western" some como seção autônoma — o argumento passa a
 * viver na abertura e, picado, dentro de cada entrega. Quem só bate o olho nos
 * títulos lê a lista de serviços, não a lista de motivos.
 */

type Etapa = {
  ordem: string;
  icon: LucideIcon;
  titulo: string;
  desc: string;
  provaIcon: LucideIcon;
  provaTitulo: string;
  provaDesc: string;
};

/* O pareamento é factual, não decorativo: cada prova é o diferencial que explica
 * por que AQUELA etapa funciona na Western e não em quem só fornece pedra. */
const ETAPAS: Etapa[] = [
  {
    ordem: "01",
    icon: Sparkles,
    titulo: "Consultoria",
    desc: "Especificação, viabilidade técnica e orientação sobre acabamentos e quantidades.",
    provaIcon: Feather,
    provaTitulo: "Viabiliza o inviável",
    provaDesc:
      "Pedra até 10× mais leve permite cascatas e piscinas onde a pedra natural não aguenta: declives, lajes, estruturas críticas.",
  },
  {
    ordem: "02",
    icon: PencilRuler,
    titulo: "Projeto & Render",
    desc: "Visualização 3D fotorrealista antes da obra — decida com segurança e alinhe expectativas com o cliente.",
    provaIcon: Eye,
    provaTitulo: "Render antes da obra",
    provaDesc:
      "Você e seu cliente aprovam o resultado em 3D antes de a primeira peça sair da fábrica.",
  },
  {
    ordem: "03",
    icon: HardHat,
    titulo: "Instalação",
    desc: "Execução pela equipe Western: fixação correta e acabamento integrado ao paisagismo.",
    provaIcon: Factory,
    provaTitulo: "Quem fabrica, executa",
    provaDesc:
      "Do molde à instalação — ninguém conhece a peça como a fábrica que a inventou.",
  },
  {
    ordem: "04",
    icon: LifeBuoy,
    titulo: "Acompanhamento",
    desc: "Logística, cronograma e ajustes finos no local da obra, do conceito à entrega.",
    provaIcon: Leaf,
    /* O título voltou a cobrir as DUAS metades do texto (era só "Equipe própria",
     * e a segunda frase — PET reciclado — ficava órfã do rótulo). */
    provaTitulo: "Equipe própria, baixo impacto",
    provaDesc:
      "Profissionais com 20+ anos de casa. Molde tirado da pedra real, com PET reciclado — zero extração.",
  },
];

/* Diagramação — as três decisões que resolvem o "ragged" apontado pelo dono:
 * 1) TRILHO COMPARTILHADO por `grid-rows-subgrid` (mesmo idioma já usado nos
 *    passos de /contrate-a-western). Os cartões dividem as MESMAS quatro faixas
 *    — cabeçalho, título, corpo (1fr), prova — então título, corpo e o fio
 *    dourado da prova começam na mesma altura em QUALQUER largura. Foi trocado
 *    por isso um par de min-height chutados (2.9rem/3.9rem) que só acertava em
 *    uma largura: entre 1024 e 1200px o texto passava de 4 para 5 linhas e a
 *    fileira voltava a ficar ragged;
 * 2) a faixa do corpo é `1fr` — a sobra fica nela, e a prova encosta no rodapé
 *    do cartão sem depender de altura fixa;
 * 3) nada de bloco centralizado — a abertura é assimétrica (texto 7 col / foto 5),
 *    e a régua de leitura é a mesma do container.
 * Onde não há suporte a subgrid, degrada para o layout flex antigo: desalinha,
 * não quebra.
 */
const CARD =
  "flex h-full flex-col bg-white border border-western-border-soft rounded-lg p-6 md:p-7 shadow-[0_10px_30px_-24px_hsl(var(--western-stone-dark)/0.5)] hover:border-western-gold/50 transition-colors sm:row-span-4 sm:grid sm:grid-rows-subgrid sm:gap-0";
const CARD_ICON =
  "inline-flex h-12 w-12 items-center justify-center rounded-lg bg-western-paper border border-western-border-soft text-western-bronze";
const CARD_TITLE =
  "font-sans font-semibold text-[18px] leading-snug text-western-green-deep";
const CARD_DESC = "text-spec leading-relaxed flex-1 mt-2";

export default function ContrateServicosA() {
  return (
    <section className="surface-paper section border-b border-western-border-soft">
      <div className="container-western">
        <div className="max-w-6xl">
          {/* ABERTURA — assimétrica: o argumento à esquerda, a prova visual à
              direita. A foto da equipe fica no topo (e não no rodapé do texto)
              porque ela É o argumento de "a fábrica também executa". */}
          <div className="grid md:grid-cols-12 gap-10 md:gap-14 items-start">
            <div className="md:col-span-7">
              <p className="text-eyebrow">O que fazemos por você</p>
              <h2 className="display-lg text-western-green-deep mt-3">
                Quatro etapas, um só time — da consultoria à peça posicionada em obra.
              </h2>
              <p className="mt-5 text-body max-w-prose-lg">
                A Western é a fábrica e a executora. Custo, prazo, técnica e
                responsabilidade concentrados em um só lugar. Cada etapa abaixo vem com
                o motivo de ela funcionar aqui.
              </p>

              <Link to="/a-pedra" className="link-cta mt-6">
                Por que a pedra pesa 10× menos
                <ArrowRight className="h-5 w-5" strokeWidth={1.75} aria-hidden />
              </Link>
            </div>

            <div className="md:col-span-5">
              <div className="aspect-[4/3] overflow-hidden rounded-xl">
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
            </div>
          </div>

          {/* LEGENDA — ensina o padrão de leitura antes do primeiro cartão. Existe
              porque a cor aqui CODIFICA algo: neutro = entrega, fio dourado = prova. */}
          <p className="mt-12 md:mt-14 flex flex-wrap items-center gap-x-6 gap-y-2 text-meta">
            <span className="inline-flex items-center gap-2">
              <span
                className="h-3 w-3 rounded-sm border border-western-border-strong bg-white"
                aria-hidden
              />
              O que você recebe
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="h-3 w-[3px] bg-western-gold" aria-hidden />
              Por que funciona aqui
            </span>
          </p>

          {/* O <li> É o cartão (e não um invólucro): o item da grade precisa ser
              quem herda as faixas, senão o subgrid não chega ao conteúdo.
              sm = 2 colunas → duas fileiras de cartão → 8 faixas;
              lg = 4 colunas → uma fileira → 4 faixas. */}
          <ol className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:grid-rows-[auto_auto_1fr_auto_auto_auto_1fr_auto] lg:grid-cols-4 lg:grid-rows-[auto_auto_1fr_auto] md:gap-5">
            {ETAPAS.map((etapa) => (
              <li key={etapa.titulo} className={CARD}>
                {/* FAIXA 1 — ícone à esquerda, ordinal à direita: a única linha do
                    cartão com duas âncoras. Dá ritmo horizontal sem centralizar. */}
                <div className="flex items-start justify-between gap-3">
                  <span className={CARD_ICON}>
                    <etapa.icon className="h-6 w-6" strokeWidth={1.75} aria-hidden />
                  </span>
                  <span className="font-sans text-[14px] font-semibold tracking-[0.06em] text-western-bronze pt-1">
                    {etapa.ordem}
                  </span>
                </div>

                {/* FAIXA 2 — título. FAIXA 3 — corpo (absorve a sobra). */}
                <h3 className={`${CARD_TITLE} mt-5`}>{etapa.titulo}</h3>
                <p className={CARD_DESC}>{etapa.desc}</p>

                {/* FAIXA 4 — prova, full-bleed no rodapé: fundo paper (um degrau
                    abaixo do branco da entrega), fio dourado na borda esquerda e
                    ícone menor sem moldura. Como a faixa é compartilhada, o fio
                    cai na mesma altura em todos os cartões da fileira. */}
                <div className="mt-6 -mx-6 md:-mx-7 -mb-6 md:-mb-7 rounded-b-lg border-t border-l-2 border-t-western-border-soft border-l-western-gold bg-western-paper px-6 md:px-7 py-5">
                  {/* Duas linhas reservadas: "Equipe própria, baixo impacto"
                      quebra e as outras não. Aqui o min-height é legítimo — os
                      rótulos são quatro strings fixas e curtas, o teto é
                      conhecido (≤2 linhas em qualquer coluna). O que NÃO pode é
                      min-height em texto corrido de tamanho livre. */}
                  <p className="flex items-start gap-2 min-h-[2.5rem] font-sans text-[15px] font-semibold leading-snug text-western-bronze">
                    <etapa.provaIcon
                      className="h-[18px] w-[18px] shrink-0 mt-[2px]"
                      strokeWidth={1.75}
                      aria-hidden
                    />
                    {etapa.provaTitulo}
                  </p>
                  <p className="mt-2 text-meta leading-[1.45]">{etapa.provaDesc}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
