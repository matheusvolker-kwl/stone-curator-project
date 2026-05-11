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
import WhatsInTheBox from "@/components/product/WhatsInTheBox";
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

            {/* Blurb curto — 1 frase, sans, funcional */}
            {parsed.lead && (
              <p className="font-sans text-[14.5px] leading-relaxed text-western-stone-warm mt-5 max-w-[48ch]">
                {(() => {
                  const cleaned = parsed.lead
                    .replace(new RegExp(`^A?\\s*${escapeRegExp(product.title)}\\s*`, "i"), "")
                    .trim();
                  const firstSentence = cleaned.split(/(?<=[.!?])\s/)[0] ?? cleaned;
                  return firstSentence.charAt(0).toUpperCase() + firstSentence.slice(1);
                })()}
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
                        <p className="text-eyebrow mb-3">
                          Acabamento{" "}
                          <span className="text-western-gold">· obrigatório</span>
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

                    {/* 2.3 — Preço grande (sans-serif, e-commerce) + stepper */}
                    <div className="pt-6 border-t border-western-stone-warm/15">
                      {isApproved ? (
                        <div className="flex items-end justify-between gap-4 flex-wrap">
                          <div className="min-w-0">
                            {variant ? (
                              <PriceDisplay
                                amount={variant.price.amount}
                                currency={variant.price.currencyCode}
                              />
                            ) : (
                              <p className="font-sans text-xl text-western-stone-warm tabular-nums leading-none">
                                {priceDisplay}
                              </p>
                            )}
                            <p className="text-meta mt-2">
                              À vista · condição parceiro
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
                            <span className="px-4 font-sans font-medium text-base min-w-[2ch] text-center tabular-nums">
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

                    {/* 2.6 — Link discreto: pintura personalizada */}
                    {visibleOptions.some((o) => /acabament/i.test(o.name)) && (
                      <div className="pt-1">
                        <button
                          onClick={() => {
                            const msg = `Olá! Gostaria de uma pintura personalizada para ${product.title}.`;
                            window.open(
                              `https://wa.me/${BUSINESS.whatsappFabrica}?text=${encodeURIComponent(msg)}`,
                              "_blank"
                            );
                          }}
                          className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-western-stone-warm hover:text-western-gold transition-colors"
                        >
                          <MessageCircle className="h-3.5 w-3.5" /> Pintura personalizada · falar com consultor
                        </button>
                      </div>
                    )}
                  </>
                );
              })()}
            </section>

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

      {/* Conteúdo aprofundado em abas */}
      <ProductTabs
        parsed={parsed}
        pesoKg={pesoKg}
        dimsStr={dimsStr}
        dims={dims}
        fichaRows={fichaRows}
        modelo3dValue={product.modelo3d?.value}
      />

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
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-western-stone-warm/60 w-6">
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

function PriceDisplay({ amount, currency }: { amount: string; currency: string }) {
  // formatBRL → "R$ 1.240,00"
  const formatted = formatBRL(amount, currency);
  // Split currency, integer part, cents
  const m = formatted.match(/^(R\$)\s*([\d.]+),(\d{2})$/);
  if (!m) {
    return <p className="text-price">{formatted}</p>;
  }
  const [, cur, intPart, cents] = m;
  return (
    <p className="text-price">
      <span className="text-price-currency">{cur}</span>
      {intPart}
      <span className="text-price-cents">,{cents}</span>
    </p>
  );
}
