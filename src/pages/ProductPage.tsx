import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchProduct } from "@/lib/datasource";
import { parseProductDescription, extractDimensions } from "@/lib/catalog/parseDescription";
import { useEffect, useMemo, useRef, useState } from "react";
import { buildCartItem, useCartStore } from "@/stores/cartStore";
import { formatBRL } from "@/lib/catalog/client";
import { Button } from "@/components/ui/button";
import { ChevronRight, Loader2, MessageCircle, ArrowRight } from "lucide-react";
import { BUSINESS } from "@/config/business";
import { toast } from "sonner";
import FinishSelector from "@/components/product/FinishSelector";
import PriceGate from "@/components/shared/PriceGate";
import { useAuth } from "@/hooks/useAuth";
import ProductGallery from "@/components/product/ProductGallery";
import Seo from "@/components/seo/Seo";
import ScrollProgress from "@/components/shared/ScrollProgress";
import BackToTop from "@/components/shared/BackToTop";
import StickyBuyBar from "@/components/product/StickyBuyBar";
import DeliverySignals from "@/components/product/DeliverySignals";
import ProductTabs from "@/components/product/ProductTabs";
import { trackRecentlyViewed } from "@/hooks/useRecentlyViewed";

import ProductComparison from "@/components/product/ProductComparison";
import RelatedProducts from "@/components/product/RelatedProducts";
import WhyWesternStrip from "@/components/product/WhyWesternStrip";
import SocialProofBand from "@/components/product/SocialProofBand";
import ProductPagination from "@/components/product/ProductPagination";
import ProductInUse from "@/components/product/ProductInUse";
import WishlistButton from "@/components/product/WishlistButton";
import PurchaseProof from "@/components/product/PurchaseProof";
import ProjetosWesternBand from "@/components/shared/ProjetosWesternBand";
import {
  InstallationTrustStrip,
  InstallationSection,
} from "@/components/product/InstallationModule";
import {
  getInstallationConfig,
  resolveInstallationType,
} from "@/data/installation";

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
  // Filtra garantia legacy vinda do catálogo; usamos BUSINESS.garantiaLabel (1 ano).
  const dims = extractDimensions(parsed.ficha);
  const fichaCleaned = parsed.ficha.filter(
    (f) => !/comprimento|largura|altura|garantia/i.test(f.label)
  );
  const acabamentosRow = fichaCleaned.find((f) => /acabament/i.test(f.label));
  const fichaRows = [
    ...fichaCleaned.filter((f) => !/acabament/i.test(f.label)),
    { label: "Garantia", value: BUSINESS.garantiaLabel },
  ];

  // Peso (kg) extraído da ficha — usado nos blocos de comparativo
  const pesoStr = parsed.ficha.find((f) => /peso/i.test(f.label))?.value ?? "";
  const pesoKg = pesoStr.match(/(\d+[.,]?\d*)/)?.[1]?.replace(",", ".") ?? null;
  const dimsStr = dims ? `${dims.c} × ${dims.l} × ${dims.a} cm` : null;

  const plainDesc = (product.description || product.title).replace(/\s+/g, " ").trim();
  const productJsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    image: images.map((i) => i.url),
    description: plainDesc.slice(0, 300),
    sku: sku || undefined,
    brand: { "@type": "Brand", name: "Western" },
    url: `https://westernstore.lovable.app/produtos/${product.handle}`,
  };

  const installationConfig = getInstallationConfig(
    resolveInstallationType(collection?.handle, product.title),
  );

  return (
    <div className="surface-ivory">
      <Seo
        title={`${product.title} — Western`}
        description={plainDesc.slice(0, 160) || `${product.title}: pedra artesanal Western para projetos de paisagismo profissional.`}
        path={`/produtos/${product.handle}`}
        ogType="product"
        image={images[0]?.url}
        jsonLd={productJsonLd}
      />
      <ScrollProgress />
      <BackToTop />
      <div className="container-western pt-12 md:pt-20 pb-8 md:pb-10">
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
          <div className="md:sticky md:top-24 min-w-0">
            <ProductGallery
              images={images}
              activeIndex={activeImage}
              onChange={setActiveImage}
              productTitle={product.title}
            />
          </div>

          {/* Details */}
          <div className="md:py-2 text-western-green-deep min-w-0">
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
              <p className="font-sans text-[14.5px] leading-relaxed text-western-stone-warm mt-5 max-w-[48ch] break-words">
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
                const priceAmount = variant?.price.amount ?? product.priceRange.minVariantPrice.amount;
                const priceCurrency = variant?.price.currencyCode ?? product.priceRange.minVariantPrice.currencyCode;
                const acabOption = visibleOptions.find((o) => /acabament/i.test(o.name));
                const otherOptions = visibleOptions.filter(
                  (o) => !/acabament/i.test(o.name)
                );

                return (
                  <>
                    {/* 2.1 — PREÇO (sempre cheio, sem "a partir de") */}
                    <div>
                      {isApproved ? (
                        <>
                          <p className="text-price">{formatBRL(priceAmount, priceCurrency)}</p>
                          <p className="text-meta mt-2">Preço parceiro · à vista</p>
                        </>
                      ) : (
                        <PriceGate variant="block" />
                      )}
                    </div>

                    {/* 2.2 — Acabamento (obrigatório) */}
                    {acabOption && (
                      <div className="pt-6 border-t border-western-stone-warm/15">
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

                    {/* 2.3 — Outras opções */}
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

                    {/* 2.4 — Stepper + CTA principal + Wishlist */}
                    {isApproved && (
                      <div className="pt-6 border-t border-western-stone-warm/15">
                        <div className="flex items-stretch gap-2">
                          <div
                            className={`flex items-center border border-western-stone-warm/30 h-14 bg-western-paper transition-opacity ${
                              acabPending ? "opacity-50" : ""
                            }`}
                          >
                            <button
                              onClick={() => setQty(Math.max(1, qty - 1))}
                              disabled={acabPending}
                              className="h-14 w-10 sm:w-12 flex items-center justify-center hover:bg-western-gold/10 transition-colors text-western-green-deep text-lg disabled:cursor-not-allowed"
                              aria-label="Diminuir"
                            >
                              −
                            </button>
                            <span className="px-2 sm:px-3 font-sans font-medium text-base min-w-[2ch] text-center tabular-nums">
                              {qty}
                            </span>
                            <button
                              onClick={() => setQty(qty + 1)}
                              disabled={acabPending}
                              className="h-14 w-10 sm:w-12 flex items-center justify-center hover:bg-western-gold/10 transition-colors text-western-green-deep text-lg disabled:cursor-not-allowed"
                              aria-label="Aumentar"
                            >
                              +
                            </button>
                          </div>
                          <Button
                            onClick={handleAdd}
                            disabled={!variant?.availableForSale || isLoadingCart || !!pendingOption}
                            className={`group flex-1 min-w-0 h-14 px-2 sm:px-4 font-mono font-bold text-[11px] sm:text-xs uppercase tracking-[0.18em] sm:tracking-[0.25em] rounded-none transition-all motion-safe:active:translate-y-[1px] ${
                              acabPending
                                ? "bg-western-stone-warm/20 text-western-stone-warm hover:bg-western-stone-warm/25 disabled:opacity-100"
                                : "bg-western-green-deep text-western-gold hover:bg-western-green-deep/90 border border-western-gold/30 hover:border-western-gold/60 shadow-[0_18px_40px_-20px_rgba(27,38,33,0.6)] disabled:opacity-60"
                            }`}
                          >
                            {isLoadingCart ? (
                              <Loader2 className="h-5 w-5 animate-spin" />
                            ) : acabPending ? (
                              <span className="truncate">Selecione o acabamento</span>
                            ) : pendingOption ? (
                              <span className="truncate">Selecione {pendingOption.name.toLowerCase()}</span>
                            ) : variant?.availableForSale ? (
                              <>
                                <span className="truncate">Adicionar ao pedido</span>
                                <ArrowRight className="hidden sm:inline-block h-4 w-4 ml-2 transition-transform motion-safe:group-hover:translate-x-0.5" />
                              </>
                            ) : (
                              "Indisponível"
                            )}
                          </Button>
                          <WishlistButton
                            handle={product.handle}
                            title={product.title}
                            image={product.images.edges[0]?.node?.url ?? null}
                            className="!h-14 !w-12 sm:!w-14 !p-0 justify-center flex-shrink-0"
                          />
                        </div>

                        {/* Micro-prova social ancorada ao CTA */}
                        <div className="mt-4">
                          <PurchaseProof />
                        </div>
                      </div>
                    )}

                    {/* 2.5 — Sinais de entrega (após CTA, reforço) */}
                    <div>
                      <DeliverySignals variant="full" />
                    </div>

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
                          className="inline-flex items-start gap-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-western-stone-warm hover:text-western-gold transition-colors text-left max-w-full"
                        >
                          <MessageCircle className="h-3.5 w-3.5 shrink-0 mt-px" />
                          <span className="break-words">Pintura personalizada · falar com consultor</span>
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
      <ProjetosWesternBand />
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

