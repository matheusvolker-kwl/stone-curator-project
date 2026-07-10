import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchProduct } from "@/lib/datasource";
import { parseProductDescription, extractDimensions } from "@/lib/catalog/parseDescription";
import { useEffect, useMemo, useRef, useState } from "react";
import { buildCartItem, useCartStore } from "@/stores/cartStore";
import { formatBRL } from "@/lib/catalog/client";
import { Button } from "@/components/ui/button";
import {
  ChevronRight,
  Loader2,
  ArrowRight,
  Box,
  Lock,
  MessageCircle,
  MapPin,
} from "lucide-react";
import { BUSINESS } from "@/config/business";
import { toast } from "sonner";
import FinishSelector from "@/components/product/FinishSelector";
import { useAuth } from "@/hooks/useAuth";
import ProductGallery from "@/components/product/ProductGallery";
import Seo, { SITE_URL } from "@/components/seo/Seo";
import ScrollProgress from "@/components/shared/ScrollProgress";
import BackToTop from "@/components/shared/BackToTop";
import ProductTabs from "@/components/product/ProductTabs";
import { trackRecentlyViewed } from "@/hooks/useRecentlyViewed";
import ProductComparison from "@/components/product/ProductComparison";
import RelatedProducts from "@/components/product/RelatedProducts";
import SocialProofBand from "@/components/product/SocialProofBand";
import ProductInUse from "@/components/product/ProductInUse";
import WishlistButton from "@/components/product/WishlistButton";
import Reveal from "@/components/shared/Reveal";
import { InstallationSection } from "@/components/product/InstallationModule";
import StickyBuyBarLab from "@/components/product/lab/StickyBuyBarLab";
import {
  getInstallationConfig,
  resolveInstallationType,
} from "@/data/installation";

function pluralizeCollection(title?: string): string {
  if (!title) return "";
  const lower = title.toLowerCase();
  if (lower.endsWith("s")) return title;
  const m = title.match(/^(Pedra)\s+(\S+)(.*)$/i);
  if (m) {
    const adj = m[2];
    const adjPlural = /[aeiouáéíóú]$/i.test(adj) ? `${adj}s` : `${adj}es`;
    return `Pedras ${adjPlural}${m[3]}`;
  }
  return title;
}

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export default function ProductPageLab() {
  const { handle = "" } = useParams();
  const { isApproved } = useAuth();
  const { data: product, isLoading } = useQuery({
    queryKey: ["product", handle],
    queryFn: () => fetchProduct(handle),
    enabled: !!handle,
  });

  const [activeOptions, setActiveOptions] = useState<Record<string, string>>({});
  const [activeImage, setActiveImage] = useState(0);
  const [qty, setQty] = useState(1);
  const addItem = useCartStore((s) => s.addItem);
  const isLoadingCart = useCartStore((s) => s.isLoading);
  const addBtnRef = useRef<HTMLElement>(null);

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

  useEffect(() => {
    if (!product || !variant?.image?.url) return;
    const idx = product.images.edges.findIndex(
      (e) => e.node.url === variant.image!.url
    );
    if (idx >= 0) setActiveImage(idx);
  }, [variant?.image?.url, product]);

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
  const parentRoute = collection ? `/linhas/${collection.handle}` : "/linhas";
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

  const dims = extractDimensions(parsed.ficha);
  const fichaCleaned = parsed.ficha.filter(
    (f) => !/comprimento|largura|altura|garantia/i.test(f.label)
  );
  const fichaRows = [
    ...fichaCleaned.filter((f) => !/acabament/i.test(f.label)),
    { label: "Garantia", value: BUSINESS.garantiaLabel },
  ];
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
    url: `${SITE_URL}/lab/produtos/${product.handle}`,
  };

  const installationConfig = getInstallationConfig(
    resolveInstallationType(collection?.handle, product.title),
  );

  const m3dValue = product.modelo3d?.value?.trim();
  const m3dUrl = m3dValue || BUSINESS.sketchupWarehouse;
  const m3dIsProductSpecific = !!m3dValue;

  const pendingOption = visibleOptions.find((o) => !activeOptions[o.name]);
  const acabPending = !!pendingOption && /acabament/i.test(pendingOption.name);
  const priceAmount = variant?.price.amount ?? product.priceRange.minVariantPrice.amount;
  const priceCurrency =
    variant?.price.currencyCode ?? product.priceRange.minVariantPrice.currencyCode;
  const acabOption = visibleOptions.find((o) => /acabament/i.test(o.name));
  const otherOptions = visibleOptions.filter((o) => !/acabament/i.test(o.name));

  return (
    <div className="surface-ivory">
      <Seo
        title={`${product.title} — Western (Lab)`}
        description={plainDesc.slice(0, 160) || `${product.title}: pedra artesanal Western.`}
        path={`/lab/produtos/${product.handle}`}
        ogType="product"
        image={images[0]?.url}
        jsonLd={[productJsonLd]}
      />
      <ScrollProgress />
      <BackToTop />
      <div className="container-western pt-12 md:pt-20 pb-8 md:pb-10">
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
          <div className="md:sticky md:top-24 min-w-0">
            <ProductGallery
              images={images}
              activeIndex={activeImage}
              onChange={setActiveImage}
              productTitle={product.title}
            />
            {/* Link fino modelo 3D */}
            <a
              href={m3dUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-western-stone-warm hover:text-western-gold transition-colors"
            >
              <Box className="h-3 w-3" />
              Modelo 3D SketchUp — {m3dIsProductSpecific ? "baixar .skp" : "3D Warehouse"}
            </a>
          </div>

          {/* Details */}
          <div className="md:py-2 text-western-green-deep min-w-0">
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

            {isApproved ? (
              <section className="mt-8 space-y-6" aria-label="Compra">
                {/* Preço */}
                <div>
                  <p className="text-price">{formatBRL(priceAmount, priceCurrency)}</p>
                  <p className="text-meta mt-2">À VISTA · PARCELA NO CHECKOUT</p>
                </div>

                {/* Acabamento */}
                {acabOption && (
                  <div className="pt-6 border-t border-western-stone-warm/15">
                    <p className="text-eyebrow mb-3">
                      ESCOLHA O ACABAMENTO{" "}
                      <span className="text-western-gold">· OBRIGATÓRIO</span>
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

                {/* Outras opções */}
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

                {/* Stepper + CTA + Wishlist */}
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
                        className="h-14 w-11 sm:w-12 flex items-center justify-center hover:bg-western-gold/10 transition-colors text-western-green-deep text-lg disabled:cursor-not-allowed"
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
                        className="h-14 w-11 sm:w-12 flex items-center justify-center hover:bg-western-gold/10 transition-colors text-western-green-deep text-lg disabled:cursor-not-allowed"
                        aria-label="Aumentar"
                      >
                        +
                      </button>
                    </div>
                    <Button
                      ref={addBtnRef as React.RefObject<HTMLButtonElement>}
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

                  {/* Linha de confiança */}
                  <p className="mt-5 font-sans text-[12.5px] text-western-stone-warm leading-relaxed flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-western-gold" />
                      <span>
                        <span className="text-western-green-deep">+1.000 peças</span> instaladas Brasil afora
                      </span>
                    </span>
                    <span className="opacity-40">·</span>
                    <span>Garantia {BUSINESS.garantiaLabel}</span>
                    <span className="opacity-40">·</span>
                    <span>
                      Instala fácil — nível {installationConfig.level} ·{" "}
                      <a
                        href="#instalacao"
                        onClick={(e) => {
                          e.preventDefault();
                          document
                            .getElementById("instalacao")
                            ?.scrollIntoView({ behavior: "smooth", block: "start" });
                        }}
                        className="text-western-gold hover:underline"
                      >
                        ver como →
                      </a>
                    </span>
                  </p>

                  {/* Linha de entrega */}
                  <p className="mt-2 font-sans text-[12.5px] text-western-stone-warm leading-relaxed">
                    Pronto em {BUSINESS.prazoProducaoDias} dias úteis · Retira em{" "}
                    {BUSINESS.cidadeAtelie}/{BUSINESS.ufAtelie} · Frete no checkout
                  </p>
                </div>
              </section>
            ) : (
              /* Gate enxuto */
              <section className="mt-8" aria-label="Acesso de parceiro">
                <div className="border border-western-stone-warm/20 bg-western-paper/60 p-6 space-y-5">
                  <p className="font-display text-[17px] leading-snug text-western-green-deep flex items-start gap-2">
                    <Lock className="h-4 w-4 text-western-gold mt-1 flex-shrink-0" />
                    <span>
                      Preço de atacado liberado no cadastro — grátis, aprovação na hora.
                    </span>
                  </p>
                  <p className="font-sans text-[13.5px] text-western-stone-warm leading-relaxed">
                    Tabela de parceiro, modelos 3D e composições, pagamento em Pix, boleto ou cartão.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Link
                      to="/parceiro/cadastro"
                      className="flex-1 inline-flex items-center justify-center h-12 px-5 bg-western-green-deep text-western-gold border border-western-gold/30 hover:bg-western-green-deep/90 font-mono text-[11px] uppercase tracking-[0.22em] transition-colors"
                    >
                      Criar conta de parceiro
                    </Link>
                    <Link
                      to="/parceiro/login"
                      className="flex-1 inline-flex items-center justify-center h-12 px-5 border border-western-stone-warm/30 text-western-green-deep hover:border-western-gold hover:text-western-gold font-mono text-[11px] uppercase tracking-[0.22em] transition-colors"
                    >
                      Já sou parceiro · entrar
                    </Link>
                  </div>
                </div>

                <div className="flex items-center gap-3 my-6 text-western-stone-warm/60">
                  <div className="flex-1 h-px bg-western-stone-warm/15" />
                  <span className="font-mono text-[10px] uppercase tracking-[0.22em]">ou</span>
                  <div className="flex-1 h-px bg-western-stone-warm/15" />
                </div>

                <div className="space-y-3">
                  <p className="font-sans text-[13.5px] text-western-green-deep leading-relaxed">
                    É para a sua casa? A gente monta seu orçamento.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Link
                      ref={addBtnRef as React.RefObject<HTMLAnchorElement>}
                      to="/orcamento"
                      className="inline-flex items-center justify-center h-11 px-5 border border-western-green-deep/30 text-western-green-deep hover:border-western-gold hover:text-western-gold font-mono text-[11px] uppercase tracking-[0.22em] transition-colors"
                    >
                      Peça um orçamento
                    </Link>
                    <a
                      href={`https://wa.me/${BUSINESS.whatsappFabrica}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 h-11 px-5 font-mono text-[11px] uppercase tracking-[0.22em] text-western-stone-warm hover:text-western-gold transition-colors"
                    >
                      <MessageCircle className="h-3.5 w-3.5" />
                      Falar no WhatsApp
                    </a>
                  </div>
                </div>
              </section>
            )}

            {parsed.rawHtml && (
              <div
                className="product-prose mt-10"
                dangerouslySetInnerHTML={{ __html: parsed.rawHtml }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Below-the-fold — enxuto */}
      <ProductTabs
        parsed={parsed}
        pesoKg={pesoKg}
        dimsStr={dimsStr}
        dims={dims}
        fichaRows={fichaRows}
        modelo3dValue={product.modelo3d?.value}
        hideModelo3d
      />
      <InstallationSection config={installationConfig} />
      <Reveal variant="fade-up">
        <ProductInUse
          productTitle={product.title}
          sku={sku || product.variants.edges[0]?.node?.sku}
        />
      </Reveal>
      <Reveal variant="fade-up">
        <ProductComparison
          productTitle={product.title}
          pesoKg={pesoKg}
          dimensoes={dimsStr}
        />
      </Reveal>
      <Reveal variant="fade-up">
        <SocialProofBand />
      </Reveal>
      <Reveal variant="fade-up">
        <RelatedProducts
          collectionHandle={collection?.handle}
          collectionTitle={collection?.title}
          currentHandle={product.handle}
          productTitle={product.title}
        />
      </Reveal>

      <StickyBuyBarLab
        triggerRef={addBtnRef}
        productImage={images[0]?.url ?? null}
        productTitle={product.title}
        selectedFinish={acabOption ? activeOptions[acabOption.name] ?? null : null}
        priceAmount={variant ? priceAmount : undefined}
        priceCurrency={variant ? priceCurrency : undefined}
        fallbackPriceLabel={`a partir de ${formatBRL(priceAmount, priceCurrency)}`}
        qty={qty}
        onQtyChange={setQty}
        onAdd={handleAdd}
        isLoading={isLoadingCart}
        canAdd={!!variant && !pendingOption}
        pendingOptionLabel={pendingOption?.name.toLowerCase() ?? null}
        available={!!variant?.availableForSale}
      />
    </div>
  );
}
