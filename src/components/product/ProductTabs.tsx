import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import HardFactsCard from "@/components/product/HardFactsCard";
import WhatsInTheBox from "@/components/product/WhatsInTheBox";
import { Download } from "lucide-react";
import { BUSINESS } from "@/config/business";
import type { ParsedDescription } from "@/lib/shopify/parseDescription";

interface Props {
  parsed: ParsedDescription;
  pesoKg: string | null;
  dimsStr: string | null;
  dims: { c: string; l: string; a: string } | null;
  fichaRows: Array<{ label: string; value: string }>;
  modelo3dValue?: string;
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

export default function ProductTabs({
  parsed,
  pesoKg,
  dimsStr,
  dims,
  fichaRows,
  modelo3dValue,
}: Props) {
  const url = modelo3dValue?.trim() || BUSINESS.sketchupWarehouse;
  const isProductSpecific = !!modelo3dValue?.trim();

  return (
    <section className="surface-paper border-t border-western-stone-warm/15 mt-16 md:mt-24 py-14 md:py-20">
      <div className="container-western">
        <Tabs defaultValue="descricao" className="w-full">
          <TabsList className="h-auto bg-transparent rounded-none p-0 border-b border-western-stone-warm/20 w-full justify-start gap-0 mb-10 overflow-x-auto">
            {[
              { v: "descricao", l: "Descrição" },
              { v: "specs", l: "Especificações" },
              { v: "entrega", l: "Entrega & instalação" },
            ].map((t) => (
              <TabsTrigger
                key={t.v}
                value={t.v}
                className="relative rounded-none px-6 py-4 font-mono text-[11px] uppercase tracking-[0.22em] text-western-stone-warm data-[state=active]:bg-transparent data-[state=active]:text-western-green-deep data-[state=active]:shadow-none data-[state=active]:after:content-[''] data-[state=active]:after:absolute data-[state=active]:after:bottom-[-1px] data-[state=active]:after:left-0 data-[state=active]:after:right-0 data-[state=active]:after:h-px data-[state=active]:after:bg-western-gold transition-colors hover:text-western-green-deep"
              >
                {t.l}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* DESCRIÇÃO */}
          <TabsContent value="descricao" className="mt-0">
            <div className="grid md:grid-cols-12 gap-10 lg:gap-16 max-w-5xl">
              <div className="md:col-span-7 space-y-6">
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
                    <p className="text-eyebrow mb-3">Aplicações</p>
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
                <p className="text-eyebrow mb-5">Composição & material</p>
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
          </TabsContent>

          {/* ESPECIFICAÇÕES */}
          <TabsContent value="specs" className="mt-0">
            <div className="grid md:grid-cols-12 gap-10 lg:gap-16 max-w-5xl">
              <div className="md:col-span-5">
                <HardFactsCard pesoKg={pesoKg} dimensoes={dimsStr} variant="card" />
              </div>

              <div className="md:col-span-7 space-y-10">
                {dims && (
                  <div>
                    <p className="text-eyebrow mb-4">Dimensões</p>
                    <div className="grid grid-cols-3 gap-px bg-western-stone-warm/15 border border-western-stone-warm/15">
                      {[
                        { rotulo: "Comprimento", sigla: "C", valor: dims.c },
                        { rotulo: "Largura", sigla: "L", valor: dims.l },
                        { rotulo: "Altura", sigla: "A", valor: dims.a },
                      ].map((d) => (
                        <div key={d.sigla} className="bg-western-cream p-4 text-center">
                          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-western-stone-warm/70 mb-2">
                            {d.sigla} · {d.rotulo}
                          </p>
                          <p className="font-sans font-semibold text-xl text-western-green-deep tabular-nums">
                            {d.valor || "—"}
                            <span className="font-sans font-normal text-[11px] text-western-stone-warm/70 ml-1">cm</span>
                          </p>
                        </div>
                      ))}
                    </div>
                    <p className="text-meta mt-3 text-center">Variação artesanal de até ±3 cm por peça</p>
                  </div>
                )}

                {fichaRows.length > 0 && (
                  <div>
                    <p className="text-eyebrow mb-4">Ficha técnica</p>
                    <dl>
                      {fichaRows.map((f) => (
                        <div
                          key={f.label}
                          className="flex justify-between gap-4 border-b border-western-stone-warm/15 py-3 text-spec"
                        >
                          <dt className="text-western-stone-warm">{f.label}</dt>
                          <dd className="text-western-green-deep text-right break-words">{f.value}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                )}

                {parsed.observacoes.length > 0 && (
                  <div>
                    <p className="text-eyebrow mb-4">Observações</p>
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

                <div>
                  <p className="text-eyebrow mb-3">Modelo 3D · SketchUp</p>
                  <p className="font-sans text-[14px] leading-relaxed text-western-stone-warm mb-4 max-w-[60ch]">
                    Modele a composição inteira no SketchUp antes de comprar — visualize proporções,
                    escala e enquadramento exatos no projeto.
                  </p>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 h-11 px-5 bg-western-gold/10 border border-western-gold/60 text-western-green-deep hover:bg-western-gold hover:border-western-gold font-mono text-[11px] uppercase tracking-[0.22em] transition-colors"
                  >
                    <Download className="h-4 w-4" />
                    {isProductSpecific ? "Baixar modelo 3D (.skp)" : "Abrir no 3D Warehouse"}
                  </a>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* ENTREGA & INSTALAÇÃO */}
          <TabsContent value="entrega" className="mt-0">
            <div className="grid md:grid-cols-12 gap-10 lg:gap-16 max-w-5xl">
              <div className="md:col-span-7 space-y-10">
                <div>
                  <p className="text-eyebrow mb-4">Produção & entrega</p>
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
                      {
                        k: "Instalação",
                        v: "Kit completo incluso. Fixação com argamassa C3 (qualquer loja de material de construção).",
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
                  <p className="text-eyebrow mb-4">Cuidados</p>
                  <p className="font-sans text-[14px] leading-relaxed text-western-stone-warm max-w-[60ch]">
                    Manutenção zero. Limpeza com pano macio levemente úmido ou jato de água.
                    Evite produtos abrasivos ou ácidos. A pintura mineral resiste a cloro de
                    piscina, intempéries e raios UV — não escama, não desbota.
                  </p>
                </div>
              </div>

              <div className="md:col-span-5">
                <WhatsInTheBox />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}
