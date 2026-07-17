import { Link } from "react-router-dom";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Download, Check, Package, Paintbrush, FileText, ArrowRight } from "lucide-react";
import { BUSINESS } from "@/config/business";
import type { ParsedDescription } from "@/lib/catalog/parseDescription";

/**
 * REGRA DE OURO DESTA PDP — cada número aparece UMA vez, no lugar onde a
 * pergunta nasce:
 *   • A PEÇA (medida + peso real)  → bloco "Tamanho real" (acima). AQUI: nunca.
 *   • A EMBALAGEM (volumes, caixas, peso bruto) → aba "Entrega". É dado de frete.
 *   • Especificações → do que é feita, código, garantia. Zero medida.
 */

interface Props {
  parsed: ParsedDescription;
  /** Ficha SEM medida/peso: Código, Material, Garantia. Montada na ProductPage. */
  fichaRows: Array<{ label: string; value: string }>;
  modelo3dValue?: string;
  hideModelo3d?: boolean;
}

const COMPOSICAO = [
  {
    label: "Estrutura",
    text: "Cimento estrutural reforçado com fibra de PET reciclado. Suporta peso humano, perfuração e carga paisagística — não trinca, não estilhaça.",
  },
  {
    label: "Interior oco",
    text: "Até 10× mais leve que pedra natural. Permite passar tubulação hidráulica, fiação e bombas por dentro da peça.",
  },
  {
    label: "Pintura mineral",
    text: "6 fases manuais sobrepostas, simulando sedimentação geológica. Resiste a cloro, sol, chuva e variação térmica.",
  },
  {
    label: "Sustentabilidade",
    text: "Zero extração ambiental — o molde é tirado da pedra real no local. Cada peça incorpora plástico PET que iria para aterro.",
  },
];

const SKETCHUP_INCLUI = [
  "Geometria fiel à peça real, escala 1:1",
  "Materiais base aplicados (acabamento neutro)",
  "Pivot ajustado para encaixe direto na composição",
  "Compatível com SketchUp Pro e Free, versões 2020+",
];

/* O que acompanha a peça. Sem promessa de vídeo de instalação — ele não vai
 * existir (decisão do dono). Só manual impresso + guia. */
const NA_CAIXA = [
  {
    Icon: Package,
    title: "Peça pronta para instalar",
    desc: "Acabamento finalizado, embalada com proteção para transporte.",
  },
  {
    Icon: Paintbrush,
    title: "Kit de retoque incluso",
    desc: "Pintura mineral na mesma cor da peça, para eventuais reparos.",
  },
  {
    Icon: FileText,
    title: "Manual de fixação",
    desc: "Instruções passo a passo impressas — as mesmas do guia online.",
  },
];

/* DS V3: gatilho do acordeão é UI, não display — sans semibold 20px, alvo 56px. */
const TRIGGER =
  "font-sans text-[18px] md:text-[20px] font-semibold text-western-green-deep " +
  "py-5 min-h-[56px] hover:no-underline";

const ITEM = "border-western-border-soft";

/* Linha de ficha (dt/dd) — 16px mínimo de UI, hairline suave. */
const ROW =
  "flex justify-between gap-6 border-b border-western-border-soft py-3.5 font-sans text-[16px]";

export default function ProductTabs({
  parsed,
  fichaRows,
  modelo3dValue,
  hideModelo3d = false,
}: Props) {
  const url = modelo3dValue?.trim() || BUSINESS.sketchupWarehouse;
  const isProductSpecific = !!modelo3dValue?.trim();

  const scrollToTamanho = (e: React.MouseEvent) => {
    e.preventDefault();
    document.getElementById("tamanho")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section className="surface-paper border-t border-western-border-soft py-14 md:py-20">
      <div className="container-western">
        <Accordion
          type="multiple"
          defaultValue={["descricao", "specs", "entrega"]}
          className="w-full max-w-5xl border-t border-western-border-soft"
        >
          {/* DESCRIÇÃO — narrativa. Nenhum número. */}
          <AccordionItem value="descricao" className={ITEM}>
            <AccordionTrigger className={TRIGGER}>Descrição</AccordionTrigger>
            <AccordionContent className="pt-2 pb-10">
              <div className="grid md:grid-cols-12 gap-10 lg:gap-16">
                <div className="md:col-span-7 space-y-5">
                  <p className="text-section-label mb-2">Sobre a peça</p>
                  {parsed.lead && <p className="text-body">{parsed.lead}</p>}
                  {parsed.intro && <p className="text-body">{parsed.intro}</p>}
                </div>

                {parsed.aplicacoes.length > 0 && (
                  <div className="md:col-span-5">
                    <p className="text-section-label mb-4">Aplicações</p>
                    <ul className="space-y-3">
                      {parsed.aplicacoes.map((a) => (
                        <li key={a} className="flex gap-3 items-start">
                          <Check
                            className="h-5 w-5 text-western-bronze mt-0.5 shrink-0"
                            aria-hidden
                          />
                          <span className="font-sans text-[16px] leading-relaxed text-western-green-deep">
                            {a}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* ESPECIFICAÇÕES — do que é feita, código, garantia. ZERO medida:
            * medida e peso da peça vivem só em "Tamanho real"; volumes e peso
            * bruto vivem só em "Entrega". Aqui só o ponteiro. */}
          <AccordionItem value="specs" className={ITEM}>
            <AccordionTrigger className={TRIGGER}>Especificações</AccordionTrigger>
            <AccordionContent className="pt-2 pb-10">
              <div className="grid md:grid-cols-12 gap-10 lg:gap-16">
                <div className="md:col-span-7">
                  <p className="text-section-label mb-5">Composição & material</p>
                  <ul className="space-y-5">
                    {COMPOSICAO.map((item) => (
                      <li key={item.label}>
                        <p className="font-sans font-semibold text-[16px] text-western-green-deep mb-1">
                          {item.label}
                        </p>
                        <p className="font-sans text-[16px] leading-relaxed text-western-stone-warm">
                          {item.text}
                        </p>
                      </li>
                    ))}
                  </ul>

                  {/* A ficha AFIRMA oca/10×/perfurável e não prova. A prova, com
                      a foto do furo em obra real, mora na página do argumento. */}
                  <Link
                    to="/a-pedra"
                    className="tap-target mt-6 inline-flex items-center gap-1.5 font-sans text-base font-semibold text-western-green-deep hover:text-western-cta transition-colors"
                  >
                    Como a pedra é feita por dentro
                    <ArrowRight className="h-5 w-5" strokeWidth={1.75} aria-hidden />
                  </Link>
                </div>

                <div className="md:col-span-5 space-y-10">
                  {/* Ponteiro — quem procura medida aqui acha o caminho na hora,
                    * sem repetir número nenhum. */}
                  <a
                    href="#tamanho"
                    onClick={scrollToTamanho}
                    className="group flex items-center justify-between gap-4 min-h-control rounded-lg border border-western-border-soft bg-western-cream px-5 py-4 transition-colors hover:border-western-green-deep"
                  >
                    <span className="font-sans text-[16px] text-western-green-deep">
                      <span className="font-semibold">Medidas e peso da peça</span>{" "}
                      <span className="text-western-stone-warm">— veja Tamanho real</span>
                    </span>
                    <ArrowRight
                      className="h-5 w-5 shrink-0 text-western-bronze transition-transform motion-safe:group-hover:translate-x-0.5"
                      aria-hidden
                    />
                  </a>

                  {fichaRows.length > 0 && (
                    <div>
                      <p className="text-section-label mb-4">Ficha técnica</p>
                      <dl>
                        {fichaRows.map((f) => (
                          <div key={f.label} className={ROW}>
                            <dt className="text-western-stone-warm">{f.label}</dt>
                            <dd className="font-semibold text-western-green-deep text-right break-words">
                              {f.value}
                            </dd>
                          </div>
                        ))}
                      </dl>
                    </div>
                  )}

                  {parsed.observacoes.length > 0 && (
                    <div>
                      <p className="text-section-label mb-4">Observações</p>
                      <ul className="space-y-4">
                        {parsed.observacoes.map((o, i) => (
                          <li key={i}>
                            {o.label && (
                              <p className="font-sans font-semibold text-[16px] text-western-green-deep mb-1">
                                {o.label}
                              </p>
                            )}
                            <p className="text-body">{o.text}</p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* MODELO 3D · SKETCHUP */}
          {!hideModelo3d && (
            <AccordionItem value="modelo3d" className={ITEM}>
              <AccordionTrigger className={TRIGGER}>Modelo 3D</AccordionTrigger>
              <AccordionContent className="pt-2 pb-10">
                <div className="grid md:grid-cols-12 gap-10 lg:gap-16">
                  <div className="md:col-span-7 space-y-5">
                    <h3 className="display-md text-western-green-deep">
                      Modele a composição inteira antes de comprar.
                    </h3>
                    <p className="text-body max-w-[58ch]">
                      Visualize proporções, escala e enquadramento exatos no projeto.
                      Aprove a peça com o cliente antes da produção — sem surpresa de obra,
                      sem especificação no escuro.
                    </p>
                    <div className="pt-3">
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex w-full sm:w-auto items-center justify-center gap-2 min-h-control px-6 rounded-lg bg-western-cta text-western-cream hover:bg-western-green-deep font-sans text-[16px] font-semibold transition-colors"
                      >
                        <Download className="h-5 w-5" aria-hidden />
                        {isProductSpecific ? "Baixar modelo 3D (.skp)" : "Abrir no 3D Warehouse"}
                      </a>
                    </div>
                  </div>

                  <div className="md:col-span-5">
                    <p className="text-sublabel mb-4">O que está incluso</p>
                    <ul className="space-y-3">
                      {SKETCHUP_INCLUI.map((it) => (
                        <li key={it} className="flex gap-3 items-start">
                          <Check
                            className="h-5 w-5 text-western-bronze mt-0.5 shrink-0"
                            aria-hidden
                          />
                          <span className="font-sans text-[16px] leading-relaxed text-western-stone-warm">
                            {it}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          )}

          {/* ENTREGA — a peça EMBALADA mora aqui, e só aqui. É o que a
            * transportadora cobra: quantos volumes, cada caixa, peso bruto. */}
          <AccordionItem value="entrega" id="entrega" className={`${ITEM} scroll-mt-24`}>
            <AccordionTrigger className={TRIGGER}>Entrega</AccordionTrigger>
            <AccordionContent className="pt-2 pb-10">
              <div className="grid md:grid-cols-12 gap-10 lg:gap-16">
                <div className="md:col-span-7 space-y-10">
                  <div>
                    <p className="text-section-label mb-4">Produção & entrega</p>
                    <dl className="space-y-5">
                      {[
                        {
                          k: "Produção",
                          v: `Sob encomenda em ${BUSINESS.cidadeAtelie}/${BUSINESS.ufAtelie}. ${BUSINESS.prazoProducaoDias} dias úteis após confirmação do pedido.`,
                        },
                        {
                          k: "Entrega",
                          v: "Frete calculado por destino e dimensões. Retira em fábrica disponível.",
                        },
                      ].map((row) => (
                        <div key={row.k}>
                          <dt className="font-sans font-semibold text-[16px] text-western-green-deep mb-1">
                            {row.k}
                          </dt>
                          <dd className="text-body">{row.v}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>

                  {parsed.embalado.length > 0 && (
                    <div>
                      <p className="text-section-label mb-4">Como a peça chega</p>
                      <p className="text-meta mb-4">
                        Medidas e peso da caixa — é o que a transportadora cobra no frete.
                      </p>
                      <dl>
                        {parsed.embalado.map((f) => (
                          <div key={f.label} className={ROW}>
                            <dt className="text-western-stone-warm">{f.label}</dt>
                            <dd className="font-semibold text-western-green-deep text-right break-words">
                              {f.value}
                            </dd>
                          </div>
                        ))}
                      </dl>
                    </div>
                  )}

                  <div>
                    <p className="text-section-label mb-4">Cuidados</p>
                    <p className="text-body max-w-[60ch]">
                      Manutenção zero. Limpeza com pano macio levemente úmido ou jato de água.
                      Evite produtos abrasivos ou ácidos. A pintura mineral resiste a cloro de
                      piscina, intempéries e raios UV — não escama, não desbota.
                    </p>
                  </div>
                </div>

                <div className="md:col-span-5">
                  <p className="text-section-label mb-4">O que vem na caixa</p>
                  <div className="rounded-2xl border border-western-border-soft bg-western-cream px-5 py-6 md:px-7 md:py-7">
                    <ul className="space-y-5">
                      {NA_CAIXA.map(({ Icon, title, desc }) => (
                        <li key={title} className="flex gap-3">
                          <Icon
                            className="h-5 w-5 flex-shrink-0 text-western-bronze mt-0.5"
                            strokeWidth={1.5}
                            aria-hidden="true"
                          />
                          <div>
                            <p className="font-sans font-semibold text-[16px] text-western-green-deep leading-snug">
                              {title}
                            </p>
                            <p className="font-sans text-[14px] text-western-stone-warm leading-relaxed mt-1">
                              {desc}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </section>
  );
}
