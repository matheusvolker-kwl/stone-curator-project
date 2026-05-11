import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchProduct } from "@/lib/shopify/queries";
import { parseProductDescription, extractDimensions } from "@/lib/shopify/parseDescription";
import { useEffect, useMemo, useRef, useState } from "react";
import { buildCartItem, useCartStore } from "@/stores/cartStore";
import { formatBRL } from "@/lib/shopify/client";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ChevronRight, Loader2, Info, MessageCircle, Download, Folder } from "lucide-react";
import { BUSINESS } from "@/config/business";
import { toast } from "sonner";
import FinishSelector from "@/components/product/FinishSelector";
import PriceGate from "@/components/shared/PriceGate";
import { useAuth } from "@/hooks/useAuth";
import HardFactsCard from "@/components/product/HardFactsCard";
import CustomPaintNote from "@/components/product/CustomPaintNote";
import ProductGallery from "@/components/product/ProductGallery";
import ScrollProgress from "@/components/shared/ScrollProgress";
import BackToTop from "@/components/shared/BackToTop";
import StickyBuyBar from "@/components/product/StickyBuyBar";
import DeliverySignals from "@/components/product/DeliverySignals";
import { inRange } from "@/lib/seededRandom";
import { trackRecentlyViewed } from "@/hooks/useRecentlyViewed";

import ProductComparison from "@/components/product/ProductComparison";
import RelatedProducts from "@/components/product/RelatedProducts";
import WhyWesternStrip from "@/components/product/WhyWesternStrip";
import SocialProofBand from "@/components/product/SocialProofBand";
import ProductPagination from "@/components/product/ProductPagination";
import ProductInUse from "@/components/product/ProductInUse";
import WishlistButton from "@/components/product/WishlistButton";

// Pluraliza nomes de coleção singulares ("Pedra Grande" → "Pedras Grandes").
function pluralizeCollection(title?: string): string {
  if (!title) return "";
  const lower = title.toLowerCase();
  if (lower.endsWith("s")) return title;
  // "Pedra X" → "Pedras X+s" (assume X é adjetivo terminando em vogal/consoante)
  const m = title.match(/^(Pedra)\s+(\S+)(.*)$/i);
  if (m) {
    const adj = m[2];
    const adjPlural = /[aeiouáéíóú]$/i.test(adj) ? `${adj}s` : `${adj}es`;
    return `Pedras ${adjPlural}${m[3]}`;
  }
  return title;
}

export default function ProductPage() {
  const { handle = "" } = useParams();
  const { isApproved } = useAuth();
  const { data: product, isLoading } = useQuery({
    queryKey: ["product", handle],
    queryFn: () => fetchProduct(handle),
    enabled: !!handle,
  });

  const [activeOptions, setActiveOptions] = useState<Record<string, string>>({});

  // Sem pré-seleção de acabamento: a escolha é obrigatória e consciente.
  const [activeImage, setActiveImage] = useState(0);
  const [qty, setQty] = useState(1);
  const addItem = useCartStore((s) => s.addItem);
  const isLoadingCart = useCartStore((s) => s.isLoading);
  const ctaRef = useRef<HTMLDivElement>(null);

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

  // Track recently viewed for the cart drawer "you saw recently" section.
  useEffect(() => {
    if (!product) return;
    trackRecentlyViewed({
      handle: product.handle,
      title: product.title,
      image: product.images.edges[0]?.node?.url ?? null,
    });
  }, [product?.handle]);

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
  const parentLabel = pluralizeCollection(collection?.title) || "Linhas";
  const collectionDisplay = pluralizeCollection(collection?.title);

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


  // Ficha técnica: extrai dimensões individuais e separa acabamentos.
  // Filtra garantia vinda do Shopify (legacy "1 ano") — sempre injetamos 5 anos.
  const dims = extractDimensions(parsed.ficha);
  const fichaCleaned = parsed.ficha.filter(
    (f) => !/comprimento|largura|altura|garantia/i.test(f.label)
  );
  const acabamentosRow = fichaCleaned.find((f) => /acabament/i.test(f.label));
  const fichaRows = [
    ...fichaCleaned.filter((f) => !/acabament/i.test(f.label)),
    { label: "Garantia", value: `${BUSINESS.garantiaAnos} anos` },
  ];

  // Peso (kg) extraído da ficha — usado nos blocos de comparativo
  const pesoStr = parsed.ficha.find((f) => /peso/i.test(f.label))?.value ?? "";
  const pesoKg = pesoStr.match(/(\d+[.,]?\d*)/)?.[1]?.replace(",", ".") ?? null;
  const dimsStr = dims ? `${dims.c} × ${dims.l} × ${dims.a} cm` : null;

  return (
    <div className="surface-ivory">
      <ScrollProgress />
      <BackToTop />
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
          {/* Gallery — sticky no desktop */}
          <div className="md:sticky md:top-24">
            <ProductGallery
              images={images}
              activeIndex={activeImage}
              onChange={setActiveImage}
              productTitle={product.title}
            />
          </div>

          {/* Details */}
          <div className="md:py-2 text-western-green-deep">
            {/* 1 — Header */}
            {collectionDisplay && <p className="text-eyebrow mb-5">{collectionDisplay}</p>}
            <div className="w-12 h-px bg-western-gold mb-6" />
            <h1 className="font-display text-3xl md:text-5xl leading-[1.05]">
              {product.title}
            </h1>
            {sku && (
              <p className="text-spec text-western-stone-warm mt-3 tracking-[0.15em]">
                SKU · {sku}
              </p>
            )}

            {/* 2 — BLOCO DE COMPRA — sem caixa, hierarquia vertical */}
            <section
              ref={ctaRef}
              className="mt-8 space-y-6"
              aria-label="Compra"
            >
              {(() => {
                const pendingOption = visibleOptions.find((o) => !activeOptions[o.name]);
                const acabPending = !!pendingOption && /acabament/i.test(pendingOption.name);
                const priceDisplay = variant
                  ? formatBRL(variant.price.amount, variant.price.currencyCode)
                  : `a partir de ${formatBRL(
                      product.priceRange.minVariantPrice.amount,
                      product.priceRange.minVariantPrice.currencyCode
                    )}`;
                const studios = inRange(`studios:${product.handle}`, 14, 29);
                const acabOption = visibleOptions.find((o) => /acabament/i.test(o.name));
                const otherOptions = visibleOptions.filter(
                  (o) => !/acabament/i.test(o.name)
                );

                return (
                  <>
                    {/* 2.1 — Acabamento (PRIMEIRO, obrigatório) */}
                    {acabOption && (
                      <div>
                        <div className="flex items-baseline justify-between mb-2 gap-3">
                          <p className="text-eyebrow">
                            Acabamento{" "}
                            <span className="text-western-gold">· obrigatório</span>
                          </p>
                          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-western-stone-warm/80">
                            mesmo preço
                          </span>
                        </div>
                        <p className="text-spec text-western-stone-warm italic mb-4 leading-relaxed">
                          Cada peça é produzida sob demanda no acabamento escolhido.
                        </p>
                        <div
                          className={
                            acabPending
                              ? "ring-1 ring-western-gold/40 ring-offset-4 ring-offset-western-paper transition-all"
                              : ""
                          }
                        >
                          <FinishSelector
                            values={acabOption.values}
                            selected={activeOptions[acabOption.name] ?? null}
                            onSelect={(val) =>
                              setActiveOptions((prev) => ({ ...prev, [acabOption.name]: val }))
                            }
                          />
                        </div>
                      </div>
                    )}

                    {/* 2.2 — Outras opções */}
                    {otherOptions.length > 0 && (
                      <div className="pt-6 border-t border-western-stone-warm/15 space-y-6">
                        {otherOptions.map((option) => (
                          <div key={option.name}>
                            <p className="text-eyebrow mb-3">{option.name}</p>
                            <div className="flex flex-wrap gap-2.5">
                              {option.values.map((val) => {
                                const selected = activeOptions[option.name] === val;
                                return (
                                  <button
                                    key={val}
                                    onClick={() =>
                                      setActiveOptions((prev) => ({
                                        ...prev,
                                        [option.name]: val,
                                      }))
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

                    {/* 2.3 — Preço + stepper na mesma linha */}
                    <div className="pt-6 border-t border-western-stone-warm/15">
                      {isApproved ? (
                        <div className="flex items-end justify-between gap-4 flex-wrap">
                          <div className="min-w-0">
                            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-western-stone-warm/80 mb-1">
                              Condição parceiro
                            </p>
                            <p
                              className={`font-display text-western-green-deep ${
                                variant ? "text-3xl md:text-4xl" : "text-xl text-western-stone-warm"
                              } tabular-nums leading-none`}
                            >
                              {priceDisplay}
                            </p>
                          </div>
                          <div
                            className={`flex items-center border border-western-stone-warm/30 h-12 bg-western-paper transition-opacity ${
                              acabPending ? "opacity-50" : ""
                            }`}
                          >
                            <button
                              onClick={() => setQty(Math.max(1, qty - 1))}
                              disabled={acabPending}
                              className="h-12 w-12 flex items-center justify-center hover:bg-western-gold/10 transition-colors text-western-green-deep text-lg disabled:cursor-not-allowed"
                              aria-label="Diminuir"
                            >
                              −
                            </button>
                            <span className="px-4 text-spec min-w-[2ch] text-center tabular-nums">
                              {qty}
                            </span>
                            <button
                              onClick={() => setQty(qty + 1)}
                              disabled={acabPending}
                              className="h-12 w-12 flex items-center justify-center hover:bg-western-gold/10 transition-colors text-western-green-deep text-lg disabled:cursor-not-allowed"
                              aria-label="Aumentar"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      ) : (
                        <PriceGate variant="block" />
                      )}
                    </div>

                    {/* 2.4 — Entrega + condições comerciais (consolidado) */}
                    <div>
                      <DeliverySignals variant="full" />
                    </div>

                    {/* 2.5 — CTA principal */}
                    {isApproved && (
                      <div>
                        <div className="flex items-stretch gap-2">
                          <Button
                            onClick={handleAdd}
                            disabled={!variant?.availableForSale || isLoadingCart || !!pendingOption}
                            className={`flex-1 h-12 font-mono text-xs uppercase tracking-[0.25em] rounded-none transition-all motion-safe:hover:-translate-y-px ${
                              acabPending
                                ? "bg-western-stone-warm/20 text-western-stone-warm hover:bg-western-stone-warm/25 disabled:opacity-100"
                                : "bg-western-gold text-western-green-deep hover:bg-western-gold/90 disabled:opacity-60"
                            }`}
                          >
                            {isLoadingCart ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : acabPending ? (
                              "Selecione o acabamento"
                            ) : pendingOption ? (
                              `Selecione ${pendingOption.name.toLowerCase()}`
                            ) : variant?.availableForSale ? (
                              "Adicionar ao pedido"
                            ) : (
                              "Indisponível"
                            )}
                          </Button>
                          <WishlistButton
                            handle={product.handle}
                            title={product.title}
                            image={product.images.edges[0]?.node?.url ?? null}
                            className="!h-12 !w-12 !p-0 justify-center"
                          />
                        </div>

                      </div>
                    )}

                    {/* 2.6 — Linha sutil única: prova social + consultor (vale para logado e visitante) */}
                    <div className="flex items-center justify-between flex-wrap gap-3 pt-1">
                      <p className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-western-stone-warm">
                        <Folder className="h-3 w-3 text-western-stone-warm/60 flex-shrink-0" />
                        <span>
                          Adicionado por{" "}
                          <span className="text-western-green-deep">{studios}</span> estúdios · 30 dias
                        </span>
                      </p>
                      <button
                        onClick={() => {
                          const msg = `Olá! Gostaria de falar sobre ${product.title}${sku ? ` (SKU ${sku})` : ""}.`;
                          window.open(
                            `https://wa.me/${BUSINESS.whatsappFabrica}?text=${encodeURIComponent(msg)}`,
                            "_blank"
                          );
                        }}
                        className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-western-stone-warm hover:text-western-gold transition-colors"
                      >
                        <MessageCircle className="h-3.5 w-3.5" /> Falar com consultor
                      </button>
                    </div>
                  </>
                );
              })()}
            </section>

            {/* 3 — Lead editorial */}
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

            {/* 4 — Aplicações */}
            {parsed.aplicacoes.length > 0 && (
              <div className="mt-10">
                <p className="text-eyebrow mb-4">Aplicações</p>
                <div className="flex flex-wrap gap-2">
                  {parsed.aplicacoes.map((a) => (
                    <span
                      key={a}
                      className="inline-flex items-center px-3 py-1.5 border border-western-stone-warm/25 bg-western-cream/50 text-spec text-western-green-deep"
                    >
                      {a}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 5 — Dados duros (faixa horizontal compacta) */}
            <HardFactsCard pesoKg={pesoKg} dimensoes={dimsStr} variant="strip" />

            {/* 6 — Pintura personalizada */}
            {visibleOptions.some((o) => /acabament/i.test(o.name)) && (
              <CustomPaintNote
                onConsultor={() => {
                  const msg = `Olá! Gostaria de uma pintura personalizada para ${product.title}.`;
                  window.open(
                    `https://wa.me/${BUSINESS.whatsappFabrica}?text=${encodeURIComponent(msg)}`,
                    "_blank"
                  );
                }}
              />
            )}


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
                </ProductAccordion>
              )}

              {/* placeholder removido: acabamentos já estão no FinishSelector acima */}

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
                  Prazo de produção de {BUSINESS.prazoProducaoDias} dias úteis após confirmação do pedido.
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

      {/* Seções full-width abaixo do hero */}
      
      <ProductInUse productHandle={product.handle} productTitle={product.title} />
      <ProductComparison productTitle={product.title} pesoKg={pesoKg} dimensoes={dimsStr} />
      <RelatedProducts
        collectionHandle={collection?.handle}
        collectionTitle={collection?.title}
        currentHandle={product.handle}
        productTitle={product.title}
      />
      <WhyWesternStrip />
      <SocialProofBand />
      <ProductPagination
        collectionHandle={collection?.handle}
        collectionTitle={collection?.title}
        currentHandle={product.handle}
      />

      {/* Sticky buy bar — aparece após sair do CTA inline */}
      <StickyBuyBar
        triggerRef={ctaRef}
        productImage={product.images.edges[0]?.node?.url ?? null}
        productTitle={product.title}
        selectedFinish={
          Object.entries(activeOptions).find(([k]) => /acabament/i.test(k))?.[1] ?? null
        }
        priceAmount={variant?.price.amount}
        priceCurrency={variant?.price.currencyCode}
        fallbackPriceLabel={`a partir de ${formatBRL(
          product.priceRange.minVariantPrice.amount,
          product.priceRange.minVariantPrice.currencyCode
        )}`}
        qty={qty}
        onQtyChange={setQty}
        onAdd={handleAdd}
        isLoading={isLoadingCart}
        canAdd={!!variant && allOptionsSelected}
        pendingOptionLabel={
          visibleOptions.find((o) => !activeOptions[o.name])?.name.toLowerCase() ?? null
        }
        available={!!variant?.availableForSale}
      />
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
