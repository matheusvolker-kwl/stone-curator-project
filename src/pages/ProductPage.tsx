import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchProduct } from "@/lib/shopify/queries";
import { parseProductDescription, extractDimensions } from "@/lib/shopify/parseDescription";
import { useEffect, useMemo, useState } from "react";
import { buildCartItem, useCartStore } from "@/stores/cartStore";
import { formatBRL, cdnImg, cdnSrcSet } from "@/lib/shopify/client";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ChevronRight, Loader2, Info, MessageCircle, Download } from "lucide-react";
import { BUSINESS } from "@/config/business";
import { toast } from "sonner";
import FinishSelector from "@/components/product/FinishSelector";
import PriceGate from "@/components/shared/PriceGate";
import { useAuth } from "@/hooks/useAuth";
import HardFactsCard from "@/components/product/HardFactsCard";
import CustomPaintNote from "@/components/product/CustomPaintNote";
import ProductInProjects from "@/components/product/ProductInProjects";
import ProductComparison from "@/components/product/ProductComparison";
import RelatedProducts from "@/components/product/RelatedProducts";
import WhyWesternStrip from "@/components/product/WhyWesternStrip";
import SocialProofBand from "@/components/product/SocialProofBand";
import ProductPagination from "@/components/product/ProductPagination";

export default function ProductPage() {
  const { handle = "" } = useParams();
  const { isApproved } = useAuth();
  const { data: product, isLoading } = useQuery({
    queryKey: ["product", handle],
    queryFn: () => fetchProduct(handle),
    enabled: !!handle,
  });

  const [activeOptions, setActiveOptions] = useState<Record<string, string>>({});

  // Pré-seleciona Moledo (acabamento mais vendido) quando o produto carrega
  useEffect(() => {
    if (!product) return;
    const acab = product.options.find((o) => /acabament/i.test(o.name));
    if (!acab) return;
    const moledo = acab.values.find((v) => /moledo/i.test(v));
    if (moledo) {
      setActiveOptions((prev) =>
        prev[acab.name] ? prev : { ...prev, [acab.name]: moledo }
      );
    }
  }, [product]);
  const [activeImage, setActiveImage] = useState(0);
  const [qty, setQty] = useState(1);
  const addItem = useCartStore((s) => s.addItem);
  const isLoadingCart = useCartStore((s) => s.isLoading);

  const visibleOptions = useMemo(
    () =>
      product?.options.filter(
        (o) => o.values.length > 1 || o.name.toLowerCase() !== "title"
      ) ?? [],
    [product]
  );

  const allOptionsSelected = useMemo(
    () => visibleOptions.every((o) => !!activeOptions[o.name]),
    [visibleOptions, activeOptions]
  );

  const variant = useMemo(() => {
    if (!product) return null;
    const variants = product.variants.edges.map((e) => e.node);
    if (visibleOptions.length === 0) return variants[0];
    if (!allOptionsSelected) return null;
    return (
      variants.find((v) =>
        v.selectedOptions.every((o) => activeOptions[o.name] === o.value)
      ) ?? null
    );
  }, [product, activeOptions, visibleOptions, allOptionsSelected]);

  // Sincroniza imagem com a variante selecionada (Shopify variant.image)
  useEffect(() => {
    if (!product || !variant?.image?.url) return;
    const idx = product.images.edges.findIndex(
      (e) => e.node.url === variant.image!.url
    );
    if (idx >= 0) setActiveImage(idx);
  }, [variant?.image?.url, product]);

  const parsed = useMemo(
    () => parseProductDescription(product?.descriptionHtml),
    [product?.descriptionHtml]
  );

  if (isLoading) {
    return (
      <div className="surface-ivory">
        <div className="container-western py-32">
          <div className="grid md:grid-cols-2 gap-12">
            <div className="aspect-square bg-western-stone-warm/10 animate-pulse" />
            <div className="space-y-4">
              <div className="h-12 w-2/3 bg-western-stone-warm/10 animate-pulse" />
              <div className="h-4 w-1/3 bg-western-stone-warm/10 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="surface-ivory">
        <div className="container-western py-32 text-center">
          <h1 className="font-display text-4xl text-western-green-deep">Peça não encontrada</h1>
          <Link to="/linhas" className="link-underline mt-6 inline-block text-western-gold">
            Voltar para linhas
          </Link>
        </div>
      </div>
    );
  }

  const images = product.images.edges.map((e) => e.node);
  const sku = variant?.sku ?? "";
  const collection = product.collections?.edges?.[0]?.node;
  const parentRoute = collection
    ? `/linhas/${collection.handle}`
    : "/linhas";
  const parentLabel = collection?.title ?? "Linhas";

  const handleAdd = async () => {
    if (!variant) return;
    const item = buildCartItem(product, variant.id, qty);
    if (!item) return;
    await addItem(item);
    toast.success("Peça adicionada ao pedido", {
      description: product.title,
      position: "top-right",
    });
  };


  // Ficha técnica: extrai dimensões individuais e separa acabamentos
  const dims = extractDimensions(parsed.ficha);
  const fichaCleaned = parsed.ficha.filter(
    (f) => !/comprimento|largura|altura/i.test(f.label)
  );
  const acabamentosRow = fichaCleaned.find((f) => /acabament/i.test(f.label));
  const fichaRows = fichaCleaned.filter((f) => !/acabament/i.test(f.label));

  // Peso (kg) extraído da ficha — usado nos blocos de comparativo
  const pesoStr = parsed.ficha.find((f) => /peso/i.test(f.label))?.value ?? "";
  const pesoKg = pesoStr.match(/(\d+[.,]?\d*)/)?.[1]?.replace(",", ".") ?? null;
  const dimsStr = dims ? `${dims.c} × ${dims.l} × ${dims.a} cm` : null;

  return (
    <div className="surface-ivory">
      <div className="container-western py-12 md:py-20">
        {/* Breadcrumb */}
        <nav
          aria-label="breadcrumb"
          className="flex items-center flex-wrap gap-x-2 gap-y-1 font-mono text-[10px] uppercase tracking-[0.22em] text-western-stone-warm/80 mb-10"
        >
          <Link to="/linhas" className="hover:text-western-gold transition-colors">
            Catálogo
          </Link>
          <ChevronRight className="h-3 w-3 opacity-50" />
          {collection ? (
            <>
              <Link to={parentRoute} className="hover:text-western-gold transition-colors">
                {parentLabel}
              </Link>
              <ChevronRight className="h-3 w-3 opacity-50" />
            </>
          ) : null}
          <span className="text-western-green-deep">{product.title}</span>
        </nav>

        <div className="grid md:grid-cols-2 gap-10 lg:gap-20 items-start">
          {/* Gallery */}
          <div className="md:sticky md:top-24">
            <div className="frame-product aspect-square overflow-hidden">
              {images[activeImage] && (
                <img
                  key={activeImage}
                  src={cdnImg(images[activeImage].url, 1200)}
                  srcSet={cdnSrcSet(images[activeImage].url, [600, 1000, 1400])}
                  sizes="(min-width: 768px) 50vw, 100vw"
                  alt={images[activeImage].altText ?? product.title}
                  decoding="async"
                  className="w-full h-full object-contain p-4 md:p-8 animate-fade-in"
                />
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-3 mt-4 overflow-x-auto scrollbar-hide -mx-2 px-2">
                {images.map((img, idx) => (
                  <button
                    key={img.url}
                    onClick={() => setActiveImage(idx)}
                    className={`frame-product w-16 h-16 md:w-20 md:h-20 flex-shrink-0 transition-opacity ${
                      idx === activeImage ? "opacity-100" : "opacity-60 hover:opacity-90"
                    }`}
                    aria-label={`Imagem ${idx + 1}`}
                  >
                    <img src={cdnImg(img.url, 200)} alt="" loading="lazy" decoding="async" className="w-full h-full object-contain p-1" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="md:py-2 text-western-green-deep">
            {/* Header */}
            {collection && <p className="text-eyebrow mb-5">{collection.title}</p>}
            <div className="w-12 h-px bg-western-gold mb-6" />
            <h1 className="font-display text-3xl md:text-5xl leading-[1.05]">
              {product.title}
            </h1>
            {sku && (
              <p className="text-spec text-western-stone-warm mt-3 tracking-[0.15em]">
                SKU · {sku}
              </p>
            )}

            {/* Lead — editorial drop-cap */}
            {parsed.lead && (
              <p
                className="product-lead mt-10"
                dangerouslySetInnerHTML={{
                  __html: parsed.lead.replace(
                    new RegExp(`^A?\\s*${escapeRegExp(product.title)}\\s*`, "i"),
                    ""
                  ).charAt(0).toUpperCase() +
                    parsed.lead.replace(
                      new RegExp(`^A?\\s*${escapeRegExp(product.title)}\\s*`, "i"),
                      ""
                    ).slice(1),
                }}
              />
            )}

            {/* Intro secundário */}
            {parsed.intro && (
              <p className="mt-6 text-[15px] leading-[1.8] text-western-stone-warm max-w-[58ch]">
                {parsed.intro}
              </p>
            )}

            {/* Aplicações */}
            {parsed.aplicacoes.length > 0 && (
              <div className="mt-12">
                <p className="text-eyebrow mb-5">Aplicações</p>
                <ul className="product-list">
                  {parsed.aplicacoes.map((a) => (
                    <li key={a}>{a}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Acabamento — seletor com swatches (inline na coluna de compra) */}
            {(() => {
              const acabOption = visibleOptions.find((o) => /acabament/i.test(o.name));
              if (!acabOption) return null;
              return (
                <div className="mt-12">
                  <div className="flex items-baseline justify-between mb-4 gap-3">
                    <p className="text-eyebrow">Acabamento</p>
                    <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-western-stone-warm/80">
                      mesmo preço
                    </span>
                  </div>
                  <FinishSelector
                    values={acabOption.values}
                    selected={activeOptions[acabOption.name] ?? null}
                    onSelect={(val) =>
                      setActiveOptions((prev) => ({ ...prev, [acabOption.name]: val }))
                    }
                  />
                </div>
              );
            })()}

            {/* Outras opções (tamanho etc.) */}
            {visibleOptions.filter((o) => !/acabament/i.test(o.name)).length > 0 && (
              <div className="mt-10 space-y-8">
                {visibleOptions
                  .filter((o) => !/acabament/i.test(o.name))
                  .map((option) => (
                    <div key={option.name}>
                      <p className="text-eyebrow mb-4">{option.name}</p>
                      <div className="flex flex-wrap gap-2.5">
                        {option.values.map((val) => {
                          const selected = activeOptions[option.name] === val;
                          return (
                            <button
                              key={val}
                              onClick={() =>
                                setActiveOptions((prev) => ({ ...prev, [option.name]: val }))
                              }
                              className={`px-5 py-2.5 font-mono text-xs uppercase tracking-[0.2em] border transition-all duration-300 ${
                                selected
                                  ? "border-western-gold text-western-gold bg-western-gold/5"
                                  : "border-western-stone-warm/25 text-western-green-deep hover:border-western-gold/60"
                              }`}
                            >
                              {val}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
              </div>
            )}

            {/* Price + Add */}
            <div className="mt-12 pt-8 border-t border-western-stone-warm/20">
              {(() => {
                const pendingOption = visibleOptions.find(
                  (o) => !activeOptions[o.name]
                );
                const priceDisplay = variant
                  ? formatBRL(variant.price.amount, variant.price.currencyCode)
                  : `a partir de ${formatBRL(
                      product.priceRange.minVariantPrice.amount,
                      product.priceRange.minVariantPrice.currencyCode
                    )}`;
                return (
                  <>
                    {isApproved ? (
                      <div className="flex items-baseline justify-between mb-7 gap-4 flex-wrap">
                        <span className="text-eyebrow">Condição parceiro</span>
                        <span
                          className={`font-display text-western-green-deep ${
                            variant ? "text-3xl" : "text-xl text-western-stone-warm"
                          }`}
                        >
                          {priceDisplay}
                        </span>
                      </div>
                    ) : (
                      <div className="mb-7">
                        <PriceGate variant="block" />
                      </div>
                    )}

                    {pendingOption && (
                      <div className="mb-5 flex items-start gap-2.5 px-4 py-3 border border-western-gold/40 bg-western-gold/5">
                        <Info className="h-4 w-4 text-western-gold mt-0.5 flex-shrink-0" />
                        <p className="text-spec text-western-green-deep leading-relaxed">
                          Escolha {pendingOption.name.toLowerCase() === "acabamento" ? "o acabamento" : `a opção de ${pendingOption.name.toLowerCase()}`} para ver o preço final e adicionar ao pedido.
                        </p>
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row items-stretch gap-3">
                      <div className="flex items-center justify-between sm:justify-start border border-western-stone-warm/30 h-12">
                        <button
                          onClick={() => setQty(Math.max(1, qty - 1))}
                          className="h-12 w-12 flex items-center justify-center hover:bg-western-gold/10 transition-colors text-western-green-deep text-lg"
                          aria-label="Diminuir"
                        >
                          −
                        </button>
                        <span className="px-4 text-spec min-w-[2ch] text-center">{qty}</span>
                        <button
                          onClick={() => setQty(qty + 1)}
                          className="h-12 w-12 flex items-center justify-center hover:bg-western-gold/10 transition-colors text-western-green-deep text-lg"
                          aria-label="Aumentar"
                        >
                          +
                        </button>
                      </div>
                      <Button
                        onClick={handleAdd}
                        disabled={!isApproved || !variant?.availableForSale || isLoadingCart || !!pendingOption}
                        className="flex-1 h-12 bg-western-green-deep text-western-cream hover:bg-western-green-mid font-mono text-xs uppercase tracking-[0.25em] rounded-none disabled:opacity-60"
                      >
                        {isLoadingCart ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : !isApproved ? (
                          "Login para pedir"
                        ) : pendingOption ? (
                          `Selecione ${pendingOption.name.toLowerCase()}`
                        ) : variant?.availableForSale ? (
                          "Adicionar ao pedido"
                        ) : (
                          "Indisponível"
                        )}
                      </Button>
                    </div>

                    <button
                      onClick={() => {
                        const msg = `Olá! Gostaria de falar sobre ${product.title}${sku ? ` (SKU ${sku})` : ""}.`;
                        window.open(
                          `https://wa.me/5511993403485?text=${encodeURIComponent(msg)}`,
                          "_blank"
                        );
                      }}
                      className="mt-3 w-full h-11 inline-flex items-center justify-center gap-2 border border-western-green-deep/25 text-western-green-deep hover:border-western-gold hover:text-western-gold font-mono text-[11px] uppercase tracking-[0.22em] transition-colors"
                    >
                      <MessageCircle className="h-4 w-4" /> Falar com consultor
                    </button>

                    {(() => {
                      const url = product.modelo3d?.value?.trim() || BUSINESS.sketchupWarehouse;
                      const isProductSpecific = !!product.modelo3d?.value?.trim();
                      return (
                        <div className="mt-4">
                          <p className="text-spec text-western-stone-warm/80 text-xs mb-2 leading-relaxed">
                            Modele a composição inteira no SketchUp do seu estúdio antes de comprar.
                          </p>
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full h-11 inline-flex items-center justify-center gap-2 border border-western-gold/60 text-western-gold hover:bg-western-gold hover:text-western-green-deep font-mono text-[11px] uppercase tracking-[0.22em] transition-colors"
                          >
                            <Download className="h-4 w-4" />
                            {isProductSpecific ? "Baixar modelo 3D (.skp)" : "Modelos no 3D Warehouse"}
                          </a>
                        </div>
                      );
                    })()}

                    <ul className="text-spec text-western-stone-warm/80 leading-relaxed mt-5 text-xs space-y-1">
                      <li>· Produção sob demanda · {BUSINESS.prazoProducaoDias} dias úteis</li>
                      <li>· Pedido mínimo {BUSINESS.pedidoMinimoLabel} · pagamento antecipado</li>
                      <li>· Frete CIF sob orçamento para todo o Brasil</li>
                    </ul>
                  </>
                );
              })()}
            </div>

            {/* Accordions */}
            <Accordion
              type="single"
              collapsible
              className="mt-14 border-t border-western-stone-warm/20"
              defaultValue="ficha"
            >
              {(fichaRows.length > 0 || dims || acabamentosRow) && (
                <ProductAccordion numeral="I" title="Ficha técnica" value="ficha">
                  {dims && (
                    <div className="mb-7">
                      <p className="text-eyebrow mb-4">Dimensões</p>
                      <div className="grid grid-cols-3 gap-px bg-western-stone-warm/15 border border-western-stone-warm/15">
                        {[
                          { rotulo: "Comprimento", sigla: "C", valor: dims.c },
                          { rotulo: "Largura",     sigla: "L", valor: dims.l },
                          { rotulo: "Altura",      sigla: "A", valor: dims.a },
                        ].map((d) => (
                          <div key={d.sigla} className="bg-western-cream p-4 text-center">
                            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-western-gold mb-2">
                              {d.sigla} · {d.rotulo}
                            </p>
                            <p className="font-display text-xl text-western-green-deep tabular-nums">
                              {d.valor || "—"}
                              <span className="font-mono text-[10px] text-western-stone-warm/70 ml-1">cm</span>
                            </p>
                          </div>
                        ))}
                      </div>
                      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-western-stone-warm/60 mt-3 text-center">
                        Variação artesanal de até ±3 cm por peça
                      </p>
                    </div>
                  )}
                  <dl className="space-y-0">
                    {fichaRows
                      .filter((f) => !/acabament/i.test(f.label))
                      .map((f) => (
                        <SpecRow key={f.label} dt={f.label} dd={f.value} />
                      ))}
                  </dl>
                  {acabamentosRow && (
                    <div className="mt-6">
                      <p className="text-eyebrow mb-3">Acabamentos disponíveis</p>
                      <div className="flex flex-wrap gap-2">
                        {acabamentosRow.value
                          .split(/[·•|,]/)
                          .map((v) => v.trim())
                          .filter(Boolean)
                          .map((v) => (
                            <span key={v} className="spec-chip">
                              {v}
                            </span>
                          ))}
                      </div>
                    </div>
                  )}
                </ProductAccordion>
              )}

              <ProductAccordion numeral="II" title="Composição & material" value="composicao">
                <p className="text-spec text-western-stone-warm leading-[1.8] mb-6">
                  Toda peça Western é fabricada artesanalmente em composto mineral proprietário,
                  desenvolvido há 33 anos no nosso ateliê. Reproduz fielmente a estética da pedra
                  natural — sem nenhuma extração ambiental.
                </p>

                <ul className="space-y-5">
                  {[
                    {
                      label: "Estrutura",
                      text: "Cimento estrutural reforçado com fibra de fios de PET reciclado, formando uma teia tridimensional interna que dá leveza, resistência a impacto e durabilidade muito superiores ao cimento puro.",
                    },
                    {
                      label: "Interior oco",
                      text: "Pesa até 10× menos que pedra natural equivalente. Permite passar tubulação hidráulica, fiação de iluminação e bombas por dentro da peça — sem embutir nada na obra civil.",
                    },
                    {
                      label: "Pintura mineral",
                      text: "6 fases de pintura manual, com 5 cores sobrepostas a cada fase, simulando sedimentação geológica. Resiste a cloro, sol, chuva e variação térmica. Não desbota, não escama, manutenção zero.",
                    },
                    {
                      label: "Resistência mecânica",
                      text: "Suporta peso humano (pisar, sentar), perfuração com furadeira para passagem de fios e carga estrutural compatível com uso paisagístico. Não trinca, não estilhaça.",
                    },
                    {
                      label: "Sustentabilidade",
                      text: "Zero extração ambiental — o molde é tirado da pedra real no local sem mover a pedra. Cada peça incorpora plástico PET que iria para aterro como armadura estrutural.",
                    },
                    {
                      label: "Garantia",
                      text: "5 anos formais contra defeitos de fabricação. Histórico real: peças instaladas desde 1995 envelhecem melhor — musgo, oxidação ambiental e pátina natural valorizam o produto com o tempo.",
                    },
                  ].map((item) => (
                    <li key={item.label}>
                      <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-western-gold mb-1.5">
                        {item.label}
                      </p>
                      <p className="text-spec text-western-stone-warm leading-[1.8]">
                        {item.text}
                      </p>
                    </li>
                  ))}
                </ul>
              </ProductAccordion>

              {parsed.observacoes.length > 0 && (
                <ProductAccordion numeral="III" title="Observações" value="obs">
                  <ul className="space-y-5">
                    {parsed.observacoes.map((o, i) => (
                      <li key={i}>
                        {o.label && (
                          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-western-gold mb-1.5">
                            {o.label}
                          </p>
                        )}
                        <p className="text-spec text-western-stone-warm leading-[1.8]">
                          {o.text}
                        </p>
                      </li>
                    ))}
                  </ul>
                </ProductAccordion>
              )}

              {parsed.modelo3dHtml && (
                <ProductAccordion numeral="IV" title="Modelo 3D · SketchUp" value="modelo">
                  <div
                    className="product-prose"
                    dangerouslySetInnerHTML={{ __html: parsed.modelo3dHtml }}
                  />
                </ProductAccordion>
              )}

              <ProductAccordion numeral="V" title="Produção & entrega" value="entrega">
                <p className="text-spec text-western-stone-warm leading-[1.8]">
                  Cada peça é produzida sob encomenda em nosso ateliê em {BUSINESS.cidadeAtelie}/{BUSINESS.ufAtelie}.
                  Prazo de produção de {BUSINESS.prazoProducaoDias} dias úteis após confirmação do pagamento.
                  Instalação simples com argamassa C3 (loja de bairro). Kit de pintura para
                  retoque incluso. Frete calculado conforme destino e dimensões.
                </p>
              </ProductAccordion>

              <ProductAccordion numeral="VI" title="Cuidados" value="cuidados">
                <p className="text-spec text-western-stone-warm leading-[1.8]">
                  Manutenção zero. Limpeza com pano macio levemente úmido ou jato de água.
                  Evite produtos abrasivos ou ácidos. A pintura mineral resiste a cloro de
                  piscina, intempéries e raios UV — não escama, não desbota.
                </p>
              </ProductAccordion>
            </Accordion>

            {/* Fallback se padrão não bater */}
            {parsed.rawHtml && (
              <div
                className="product-prose mt-10"
                dangerouslySetInnerHTML={{ __html: parsed.rawHtml }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function ProductAccordion({
  numeral,
  title,
  value,
  children,
}: {
  numeral: string;
  title: string;
  value: string;
  children: React.ReactNode;
}) {
  return (
    <AccordionItem value={value} className="border-b border-western-stone-warm/20">
      <AccordionTrigger className="py-6 hover:no-underline group [&>svg]:text-western-stone-warm">
        <span className="flex items-baseline gap-5 text-left">
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-western-gold w-6">
            {numeral}.
          </span>
          <span className="font-display text-xl text-western-green-deep group-hover:text-western-gold transition-colors">
            {title}
          </span>
        </span>
      </AccordionTrigger>
      <AccordionContent className="pb-8 pl-7 md:pl-11">{children}</AccordionContent>
    </AccordionItem>
  );
}

function SpecRow({ dt, dd }: { dt: string; dd: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-western-stone-warm/15 py-3 text-spec">
      <dt className="text-western-stone-warm flex-shrink-0 min-w-0">{dt}</dt>
      <dd className="text-western-green-deep text-right min-w-0 break-words">{dd}</dd>
    </div>
  );
}
