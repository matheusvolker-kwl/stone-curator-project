import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import HardFactsCard from "@/components/product/HardFactsCard";
import WhatsInTheBox from "@/components/product/WhatsInTheBox";
import { Download, Check } from "lucide-react";
import { BUSINESS } from "@/config/business";
import type { ParsedDescription } from "@/lib/catalog/parseDescription";

interface Props {
  parsed: ParsedDescription;
  pesoKg: string | null;
  dimsStr: string | null;
  dims: { c: string; l: string; a: string } | null;
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

const TRIGGER =
  "font-mono text-[12px] md:text-[13px] uppercase tracking-[0.22em] text-western-green-deep py-5 hover:no-underline";

export default function ProductTabs({
  parsed,
  pesoKg,
  dimsStr,
  dims,
  fichaRows,
  modelo3dValue,
  hideModelo3d = false,
}: Props) {
  const url = modelo3dValue?.trim() || BUSINESS.sketchupWarehouse;
  const isProductSpecific = !!modelo3dValue?.trim();

  return (
    <section className="surface-paper border-t border-western-stone-warm/15 py-12 md:py-16">
      <div className="container-western">
        <Accordion
          type="multiple"
          defaultValue={["descricao", "specs", "entrega"]}
          className="w-full max-w-5xl border-t border-western-stone-warm/20"
        >
          {/* DESCRIÇÃO */}
          <AccordionItem value="descricao" className="border-western-stone-warm/20">
            <AccordionTrigger className={TRIGGER}>Descrição</AccordionTrigger>
            <AccordionContent className="pt-2 pb-8">
              <div className="grid md:grid-cols-12 gap-10 lg:gap-16">
                <div className="md:col-span-7 space-y-6">
                  <p className="text-section-label mb-2">Sobre a peça</p>
                  {parsed.lead && (
                    <p className="font-sans text-[16px] leading-relaxed text-western-stone-warm">
                      {parsed.lead}
                    </p>
                  )}
                  {parsed.intro && (
                    <p className="font-sans text-[15px] leading-relaxed text-western-stone-warm">
                      {parsed.intro}
                    </p>
                  )}
                  {parsed.aplicacoes.length > 0 && (
                    <div className="pt-4">
                      <p className="text-sublabel mb-3">Aplicações</p>
                      <p className="font-sans text-[15px] text-western-green-deep">
                        {parsed.aplicacoes.map((a, i) => (
                          <span key={a}>
                            {a}
                            {i < parsed.aplicacoes.length - 1 && (
                              <span className="text-western-stone-warm/50 mx-2">·</span>
                            )}
                          </span>
                        ))}
                      </p>
                    </div>
                  )}
                </div>

                <div className="md:col-span-5">
                  <p className="text-section-label mb-5">Composição & material</p>
                  <ul className="space-y-5">
                    {COMPOSICAO.map((item) => (
                      <li key={item.label}>
                        <p className="font-sans font-medium text-[14px] text-western-green-deep mb-1">
                          {item.label}
                        </p>
                        <p className="font-sans text-[13.5px] leading-relaxed text-western-stone-warm">
                          {item.text}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* ESPECIFICAÇÕES */}
          <AccordionItem value="specs" className="border-western-stone-warm/20">
            <AccordionTrigger className={TRIGGER}>Especificações</AccordionTrigger>
            <AccordionContent className="pt-2 pb-8">
              <div className="grid md:grid-cols-12 gap-10 lg:gap-16">
                <div className="md:col-span-5">
                  <HardFactsCard pesoKg={pesoKg} dimensoes={dimsStr} variant="card" />
                </div>

                <div className="md:col-span-7 space-y-10">
                  {dims && (
                    <div>
                      <p className="text-section-label mb-4">Dimensões</p>
                      <div className="grid grid-cols-3 gap-px bg-western-stone-warm/15 border border-western-stone-warm/15">
                        {[
                          { rotulo: "Comprimento", sigla: "C", valor: dims.c },
                          { rotulo: "Largura", sigla: "L", valor: dims.l },
                          { rotulo: "Altura", sigla: "A", valor: dims.a },
                        ].map((d) => (
                          <div key={d.sigla} className="bg-western-cream p-4 text-center">
                            <p className="text-sublabel mb-2">
                              {d.sigla} · {d.rotulo}
                            </p>
                            <p className="font-sans font-semibold text-xl text-western-green-deep tabular-nums">
                              {d.valor || "—"}
                              <span className="font-sans font-normal text-[11px] text-western-stone-warm/70 ml-1">
                                cm
                              </span>
                            </p>
                          </div>
                        ))}
                      </div>
                      <p className="text-meta mt-3 text-center">
                        Variação artesanal de até ±3 cm por peça
                      </p>
                    </div>
                  )}

                  {parsed.embalado.length > 0 && (
                    <div>
                      <p className="text-section-label mb-4">Dados de envio</p>
                      <p className="text-meta mb-4">
                        Medidas da embalagem — usadas para cálculo de frete
                      </p>
                      <dl>
                        {parsed.embalado.map((f) => (
                          <div
                            key={f.label}
                            className="flex justify-between gap-4 border-b border-western-stone-warm/15 py-3 text-spec"
                          >
                            <dt className="text-western-stone-warm">{f.label}</dt>
                            <dd className="text-western-green-deep text-right break-words">
                              {f.value}
                            </dd>
                          </div>
                        ))}
                      </dl>
                    </div>
                  )}

                  {fichaRows.length > 0 && (
                    <div>
                      <p className="text-section-label mb-4">Ficha técnica</p>
                      <dl>
                        {fichaRows.map((f) => (
                          <div
                            key={f.label}
                            className="flex justify-between gap-4 border-b border-western-stone-warm/15 py-3 text-spec"
                          >
                            <dt className="text-western-stone-warm">{f.label}</dt>
                            <dd className="text-western-green-deep text-right break-words">
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
                              <p className="font-sans font-medium text-[13px] text-western-green-deep mb-1">
                                {o.label}
                              </p>
                            )}
                            <p className="font-sans text-[14px] leading-relaxed text-western-stone-warm">
                              {o.text}
                            </p>
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
            <AccordionItem value="modelo3d" className="border-western-stone-warm/20">
              <AccordionTrigger className={TRIGGER}>Modelo 3D</AccordionTrigger>
              <AccordionContent className="pt-2 pb-8">
                <div className="grid md:grid-cols-12 gap-10 lg:gap-16">
                  <div className="md:col-span-7 space-y-5">
                    <h3 className="font-display text-2xl md:text-3xl text-western-green-deep leading-tight">
                      Modele a composição inteira antes de comprar.
                    </h3>
                    <p className="font-sans text-[15px] leading-relaxed text-western-stone-warm max-w-[58ch]">
                      Visualize proporções, escala e enquadramento exatos no projeto.
                      Aprove a peça com o cliente antes da produção — sem surpresa de obra,
                      sem especificação no escuro.
                    </p>
                    <div className="pt-3">
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 h-12 px-6 bg-western-gold text-western-green-deep hover:bg-western-gold/90 font-mono text-[11px] uppercase tracking-[0.22em] font-semibold transition-colors"
                      >
                        <Download className="h-4 w-4" />
                        {isProductSpecific ? "Baixar modelo 3D (.skp)" : "Abrir no 3D Warehouse"}
                      </a>
                    </div>
                  </div>

                  <div className="md:col-span-5">
                    <p className="text-sublabel mb-4">O que está incluso</p>
                    <ul className="space-y-3">
                      {SKETCHUP_INCLUI.map((it) => (
                        <li key={it} className="flex gap-3 items-start">
                          <Check className="h-4 w-4 text-western-gold mt-0.5 shrink-0" />
                          <span className="font-sans text-[14px] leading-relaxed text-western-stone-warm">
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

          {/* ENTREGA & INSTALAÇÃO */}
          <AccordionItem value="entrega" className="border-western-stone-warm/20">
            <AccordionTrigger className={TRIGGER}>Entrega</AccordionTrigger>
            <AccordionContent className="pt-2 pb-8">
              <div className="grid md:grid-cols-12 gap-10 lg:gap-16">
                <div className="md:col-span-7 space-y-10">
                  <div>
                    <p className="text-section-label mb-4">Produção & entrega</p>
                    <dl className="space-y-4">
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
                          <dt className="font-sans font-medium text-[13px] text-western-green-deep mb-1">
                            {row.k}
                          </dt>
                          <dd className="font-sans text-[14px] leading-relaxed text-western-stone-warm">
                            {row.v}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </div>

                  <div>
                    <p className="text-section-label mb-4">Cuidados</p>
                    <p className="font-sans text-[14px] leading-relaxed text-western-stone-warm max-w-[60ch]">
                      Manutenção zero. Limpeza com pano macio levemente úmido ou jato de água.
                      Evite produtos abrasivos ou ácidos. A pintura mineral resiste a cloro de
                      piscina, intempéries e raios UV — não escama, não desbota.
                    </p>
                  </div>
                </div>

                <div className="md:col-span-5">
                  <p className="text-section-label mb-4">O que vem na caixa</p>
                  <WhatsInTheBox />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </section>
  );
}
