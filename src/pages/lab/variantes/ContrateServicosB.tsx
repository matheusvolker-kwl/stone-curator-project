import { Link } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  Eye,
  Factory,
  Feather,
  HardHat,
  Leaf,
  LifeBuoy,
  PencilRuler,
  Sparkles,
} from "lucide-react";

import serraImg from "@/assets/parceria-instalacao.webp";

/**
 * ALTERNATIVA B — manter as duas seções, trocar o DISPOSITIVO da segunda.
 *
 * TESE: os dois papéis são legítimos e devem continuar separados — a primeira
 * seção ARGUMENTA (por que a Western), a segunda LISTA O ESCOPO (o que você
 * recebe). O erro nunca foi existirem duas: foi vestirem a mesma roupa. Então o
 * argumento fica em cartões (vitrine, foto ao lado) e a entrega vira ÍNDICE —
 * linhas com fio separador, ícone como marcador de linha e coluna de custo.
 * O ritmo da página muda ao virar a seção, e o leitor sabe que mudou de assunto.
 *
 * SACRIFÍCIO: o índice tem menos peso visual que quatro cartões — quem só passa
 * o olho vê "uma lista" e não "quatro produtos". Trocamos brilho por leitura.
 */

type Diferencial = {
  icon: LucideIcon;
  titulo: string;
  desc: string;
  /* Só entra aqui o diferencial que tem prova NAVEGÁVEL no próprio site. É essa
     diferença — e não uma taxonomia inventada — que a borda dourada codifica. */
  prova?: { to: string; label: string };
};

const DIFERENCIAIS: Diferencial[] = [
  {
    icon: Factory,
    titulo: "Quem fabrica, executa",
    desc: "Do molde à instalação — ninguém conhece a peça como a fábrica que a inventou.",
    prova: { to: "/obras", label: "Ver obras entregues" },
  },
  {
    icon: Feather,
    titulo: "Viabiliza o inviável",
    desc: "Pedra até 10× mais leve permite cascatas e piscinas onde a pedra natural não aguenta: declives, lajes, estruturas críticas.",
    prova: { to: "/a-pedra", label: "Por que a pedra pesa 10× menos" },
  },
  {
    icon: Eye,
    titulo: "Render antes da obra",
    desc: "Você e seu cliente aprovam o resultado em 3D antes de a primeira peça sair da fábrica.",
  },
  {
    icon: Leaf,
    titulo: "Equipe própria + baixo impacto",
    desc: "Instalação por profissionais com 20+ anos de casa. Molde tirado da pedra real, com PET reciclado — zero extração.",
  },
];

type Servico = {
  icon: LucideIcon;
  titulo: string;
  desc: string;
  /* Mesma verdade que a seção "Como funciona" já publica: a consultoria inicial
     é gratuita; o resto é orçado depois dela. A cor só repete esse fato. */
  custo: "gratis" | "consulta";
};

const SERVICOS: Servico[] = [
  {
    icon: Sparkles,
    titulo: "Consultoria",
    desc: "Especificação, viabilidade técnica e orientação sobre acabamentos, quantidades e integração ao projeto.",
    custo: "gratis",
  },
  {
    icon: PencilRuler,
    titulo: "Projeto & Render",
    desc: "Visualização 3D fotorrealista antes da obra — decida com segurança e alinhe expectativas com o cliente.",
    custo: "consulta",
  },
  {
    icon: HardHat,
    titulo: "Instalação",
    desc: "Execução pela equipe Western, com técnica apurada, fixação correta e acabamento integrado ao paisagismo.",
    custo: "consulta",
  },
  {
    icon: LifeBuoy,
    titulo: "Acompanhamento",
    desc: "Suporte contínuo do conceito à entrega — logística, cronograma e ajustes finos no local da obra.",
    custo: "consulta",
  },
];

/* Selo de custo — mesma gramática do bloco "Como funciona" (dourado sólido para
   grátis, papel/bronze para sob consulta), de propósito: a página inteira usa um
   código de cor só. */
const CHIP_BASE =
  "inline-flex items-center rounded-sm px-2.5 py-1 font-sans text-[14px] font-semibold leading-none whitespace-nowrap";
const CHIP_GRATIS = `${CHIP_BASE} bg-western-gold text-western-green-deep`;
const CHIP_CONSULTA = `${CHIP_BASE} bg-western-paper border border-western-border-strong text-western-bronze`;

export default function ContrateServicosB() {
  return (
    <section>
      {/* ── 3) ARGUMENTO — vitrine: foto grande à esquerda, 4 cartões 2×2 ───── */}
      <div className="surface-ivory section">
        <div className="container-western">
          <div className="max-w-6xl grid md:grid-cols-12 gap-10 md:gap-14 items-stretch">
            {/* Coluna-texto: a foto CRESCE até o pé da coluna de cartões
                (items-stretch + flex-1). Sem isso as duas colunas terminavam em
                alturas diferentes e a seção lia torta no desktop. */}
            <div className="md:col-span-5 flex flex-col">
              <p className="text-eyebrow">Por que a Western</p>
              <h2 className="display-lg text-western-green-deep mt-3">
                Um único parceiro que já resolveu o que ninguém tinha resolvido.
              </h2>
              <p className="mt-5 text-body">
                A Western é a fábrica e a executora. Isso significa custo, prazo, técnica e
                responsabilidade concentrados em um só time — do render 3D à peça posicionada
                em obra.
              </p>
              <div className="mt-8 overflow-hidden rounded-xl aspect-[4/3] md:aspect-auto md:flex-1 md:min-h-[280px]">
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

            <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
              {DIFERENCIAIS.map((d) => (
                <article
                  key={d.titulo}
                  /* O hover dourado SÓ existe no cartão que tem para onde ir.
                     Nos outros dois não há link — pintar a borda no hover seria
                     cor decorativa prometendo um clique que não existe. */
                  className={`h-full flex flex-col bg-white rounded-lg p-6 md:p-7 border border-western-border-soft border-l-[3px] shadow-[0_10px_30px_-24px_hsl(var(--western-stone-dark)/0.5)] ${
                    d.prova
                      ? "border-l-western-gold transition-colors hover:border-western-gold/45"
                      : "border-l-western-border-strong"
                  }`}
                >
                  <span
                    className={`inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border text-western-bronze mb-5 ${
                      d.prova
                        ? "bg-western-gold/10 border-western-gold/35"
                        : "bg-western-paper border-western-border-soft"
                    }`}
                  >
                    <d.icon className="h-6 w-6" strokeWidth={1.75} aria-hidden />
                  </span>
                  {/* Linha de base: "Equipe própria + baixo impacto" quebra em 2
                      linhas e as outras não. min-h de 2 linhas trava o topo do
                      corpo na mesma altura nos quatro cartões. */}
                  <h3 className="text-title-sm sm:min-h-[2.95rem] mb-2">{d.titulo}</h3>
                  <p className="text-spec leading-relaxed flex-1">{d.desc}</p>
                  {d.prova ? (
                    /* flex-1 no parágrafo empurra o link para o pé — os dois
                       links caem na mesma linha de base entre os cartões.
                       min-h-tap (48px) dá o alvo de toque exigido; mt-2/-mb-3
                       devolvem o espaçamento ÓPTICO do mt-5 original — a área
                       clicável cresce para dentro do padding, o desenho não. */
                    <Link
                      to={d.prova.to}
                      className="mt-2 -mb-3 inline-flex min-h-tap items-center gap-2 font-sans text-[15px] font-semibold text-western-green-deep underline underline-offset-4 decoration-western-gold hover:decoration-western-green-deep transition-colors"
                    >
                      {d.prova.label}
                      <ArrowRight className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                    </Link>
                  ) : null}
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── 4) ENTREGA — índice de escopo: fios, marcador de linha, coluna de
          custo. Nenhum cartão, nenhum ícone em quadrado: ao virar a seção o
          leitor sente que trocou de assunto sem precisar ler o título. ────── */}
      <div className="surface-paper section border-y border-western-border-soft">
        <div className="container-western">
          <div className="max-w-6xl">
            {/* Cabeçalho assimétrico (título à esquerda, legenda do código de cor
                à direita) — o inverso do header centralizado da versão atual. */}
            <header className="grid md:grid-cols-12 gap-x-8 gap-y-5 items-end">
              <div className="md:col-span-7">
                <p className="text-eyebrow">O que fazemos por você</p>
                <h2 className="display-lg text-western-green-deep mt-3">
                  O escopo, item por item.
                </h2>
                <p className="mt-4 text-body max-w-xl">
                  Podemos apenas fornecer as peças com manual e instruções de instalação, ou
                  executar com a nossa equipe. Você contrata o escopo que precisar.
                </p>
              </div>

              <ul className="md:col-span-5 md:justify-self-end flex flex-wrap items-center gap-x-5 gap-y-2">
                <li className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-[2px] bg-western-gold" aria-hidden />
                  <span className="text-meta">Sem custo</span>
                </li>
                <li className="flex items-center gap-2">
                  <span
                    className="h-3 w-3 rounded-[2px] bg-western-paper border border-western-border-strong"
                    aria-hidden
                  />
                  <span className="text-meta">Orçado após a consultoria</span>
                </li>
              </ul>
            </header>

            <ul className="mt-10 border-b border-western-border-soft">
              {SERVICOS.map((s) => {
                const gratis = s.custo === "gratis";
                return (
                  <li
                    key={s.titulo}
                    /* O fio de topo é o segundo portador do código: dourado na
                       linha gratuita, neutro nas demais. Borda que significa. */
                    className={`border-t ${
                      gratis ? "border-t-western-gold/50" : "border-t-western-border-soft"
                    }`}
                  >
                    <div className="grid grid-cols-[1fr_auto] md:grid-cols-12 gap-x-4 md:gap-x-8 gap-y-2 md:gap-y-0 md:items-baseline py-6 md:py-7">
                      {/* Ícone como MARCADOR DE LINHA (20px, sem quadrado), não
                          como selo de cartão. items-baseline alinha o ícone ao
                          título e o título ao corpo e ao selo: uma régua só. */}
                      <div className="col-start-1 row-start-1 md:col-span-4 flex items-baseline gap-3 min-w-0">
                        <s.icon
                          className={`h-5 w-5 shrink-0 translate-y-[3px] ${
                            gratis ? "text-western-gold" : "text-western-bronze"
                          }`}
                          strokeWidth={1.75}
                          aria-hidden
                        />
                        <h3 className="text-title-sm">{s.titulo}</h3>
                      </div>

                      <div className="col-start-2 row-start-1 md:col-span-2 md:col-start-11 justify-self-end">
                        <span className={gratis ? CHIP_GRATIS : CHIP_CONSULTA}>
                          {gratis ? "Grátis" : "Sob consulta"}
                        </span>
                      </div>

                      {/* Mobile: o corpo entra na calha do ícone (pl-8 = 20px do
                          ícone + 12px do gap) para o marcador virar trilho. */}
                      <p className="col-span-2 row-start-2 pl-8 md:col-span-6 md:col-start-5 md:row-start-1 md:pl-0 text-spec leading-relaxed">
                        {s.desc}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
