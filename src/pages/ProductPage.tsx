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
  MapPin,
  ShieldCheck,
  FileText,
  Truck,
} from "lucide-react";
import { BUSINESS } from "@/config/business";
import FinishSelector from "@/components/product/FinishSelector";
import ComposicaoCena from "@/components/product/ComposicaoCena";
import { useAuth } from "@/hooks/useAuth";
import ProductGallery from "@/components/product/ProductGallery";
import Seo, { SITE_URL } from "@/components/seo/Seo";
import ScrollProgress from "@/components/shared/ScrollProgress";
import BackToTop from "@/components/shared/BackToTop";
import ProductTabs from "@/components/product/ProductTabs";
import { trackRecentlyViewed } from "@/hooks/useRecentlyViewed";
import TamanhoReal from "@/components/product/TamanhoReal";
import CalculadoraQuantidade from "@/components/product/CalculadoraQuantidade";
import RelatedProducts from "@/components/product/RelatedProducts";
import SocialProofBand from "@/components/product/SocialProofBand";
import { getAplicadas } from "@/components/product/ProductInUse";
import WishlistButton from "@/components/product/WishlistButton";
import Reveal from "@/components/shared/Reveal";
import { InstallationSection } from "@/components/product/InstallationModule";
import StickyBuyBarLab from "@/components/product/lab/StickyBuyBarLab";
import KitUpsell from "@/components/product/KitUpsell";
import {
  getInstallationConfig,
  resolveInstallationType,
} from "@/data/installation";

/* Eram cópias à mão do .btn-primary/.btn-outline-forest (auditoria 2026-07-17:
 * a PDP tinha 24 de 27 CTAs fora do sistema). Agora são as classes do DS — o
 * que também dá a elas o "press" do btn-base, que faltava aqui. */
const CTA_PRIMARY = "btn-primary w-full";
const CTA_OUTLINE = "btn-outline-forest";

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

export default function ProductPage() {
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
  /**
   * Âncora da barra fixa. Fica SEMPRE no CTA primário inline (que vive abaixo do
   * H1) — a barra só entra quando esse botão já saiu da viewport pra cima, então
   * ela nunca pode cobrir o título. Era o bug: o ref morava no CTA secundário.
   */
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

  /**
   * Galeria canônica: AMBIENTE (aplicada) abre → estúdio (capa Woo) →
   * detalhe (aplicada _close) → demais fotos do Woo. O herói é a peça em
   * projeto real (DS: prova antes da forma); o estúdio vem em seguida para
   * leitura de silhueta. A foto de escala vive SÓ no bloco Tamanho real.
   */
  const galleryImages = useMemo(() => {
    if (!product) return [];
    const wooImages = product.images.edges.map((e) => e.node);
    const aplicadas = getAplicadas(product.variants.edges[0]?.node?.sku);
    const ambiente = aplicadas.ambiente
      ? [{ url: aplicadas.ambiente, altText: `${product.title} aplicado em projeto real` }]
      : [];
    const close = aplicadas.close
      ? [{ url: aplicadas.close, altText: `${product.title} — detalhe do acabamento` }]
      : [];
    if (ambiente.length === 0 && close.length === 0) return wooImages;
    return [...ambiente, ...wooImages.slice(0, 1), ...close, ...wooImages.slice(1)];
  }, [product]);

  /* Pular para a foto da variante SÓ quando a troca veio do usuário — no load,
   * com o acabamento pré-selecionado, o salto atropelaria o ambiente que abre
   * a galeria. */
  const userTouchedOptions = useRef(false);
  useEffect(() => {
    if (!product || !variant?.image?.url) return;
    if (!userTouchedOptions.current) return;
    const idx = galleryImages.findIndex((img) => img.url === variant.image!.url);
    if (idx >= 0) setActiveImage(idx);
  }, [variant?.image?.url, product, galleryImages]);

  /* DS: Moledo é o best-seller e vem PRÉ-SELECIONADO — o CTA nasce destravado.
   * Só age quando ainda não há escolha (nunca sobrescreve o usuário). */
  useEffect(() => {
    if (!product) return;
    const acab = visibleOptions.find((o) => /acabament/i.test(o.name));
    if (!acab) return;
    setActiveOptions((prev) => {
      if (prev[acab.name]) return prev;
      const moledo = acab.values.find((v) => /moledo/i.test(v));
      return moledo ? { ...prev, [acab.name]: moledo } : prev;
    });
  }, [product?.handle, visibleOptions]);

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
        <div className="container-western py-24 md:py-32">
          <div className="grid md:grid-cols-2 gap-12">
            <div className="aspect-square rounded-xl bg-western-stone-warm/10 animate-pulse" />
            <div className="space-y-4">
              <div className="h-12 w-2/3 rounded-lg bg-western-stone-warm/10 animate-pulse" />
              <div className="h-5 w-1/3 rounded-sm bg-western-stone-warm/10 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="surface-ivory">
        <div className="container-western py-24 md:py-32 text-center">
          <h1 className="display-lg text-western-green-deep">Peça não encontrada</h1>
          <Link
            to="/linhas"
            className="mt-8 inline-flex items-center justify-center min-h-control px-6 rounded-lg bg-western-cta text-western-cream hover:bg-western-green-deep font-sans text-[15px] font-semibold transition-colors"
          >
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
    // O feedback — toast ÚNICO com "Ver" + pulso do badge — vive no cartStore.
    // Não disparamos um segundo toast aqui (era o empilhamento que o dono viu).
    addItem(item);
  };

  /* Medida e peso da PEÇA: extraídos aqui, mas entregues a UM só consumidor —
   * o bloco "Tamanho real". A ficha de Especificações não repete número nenhum:
   * fora comprimento/largura/altura/peso (moram no Tamanho real) e acabamento
   * (é uma decisão, tomada acima no FinishSelector — não um dado a repetir),
   * sobra o que só a ficha tem: código e material. Garantia vem do BUSINESS. */
  const dims = extractDimensions(parsed.ficha);
  const fichaRows = [
    ...parsed.ficha.filter(
      (f) => !/comprimento|largura|altura|peso|garantia|acabament/i.test(f.label)
    ),
    { label: "Garantia", value: BUSINESS.garantiaLabel },
  ];
  const pesoStr = parsed.ficha.find((f) => /peso/i.test(f.label))?.value ?? "";
  const pesoKg = pesoStr.match(/(\d+[.,]?\d*)/)?.[1]?.replace(",", ".") ?? null;

  const plainDesc = (product.description || product.title).replace(/\s+/g, " ").trim();
  const productJsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    image: images.map((i) => i.url),
    description: plainDesc.slice(0, 300),
    sku: sku || undefined,
    brand: { "@type": "Brand", name: "Western" },
    url: `${SITE_URL}/produtos/${product.handle}`,
  };

  const breadcrumbJsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Catálogo", item: `${SITE_URL}/linhas` },
      ...(collection
        ? [{ "@type": "ListItem", position: 2, name: parentLabel, item: `${SITE_URL}${parentRoute}` }]
        : []),
      {
        "@type": "ListItem",
        position: collection ? 3 : 2,
        name: product.title,
        item: `${SITE_URL}/produtos/${product.handle}`,
      },
    ],
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
    /* A barra fixa publica a própria altura em --sticky-buy-bar-h; reservar esse
     * espaço no fim da página garante que ela nunca cubra conteúdo. */
    <div className="surface-ivory" style={{ paddingBottom: "var(--sticky-buy-bar-h, 0px)" }}>
      <Seo
        title={`${product.title} — Western`}
        description={plainDesc.slice(0, 160) || `${product.title}: pedra artesanal Western.`}
        path={`/produtos/${product.handle}`}
        ogType="product"
        image={images[0]?.url}
        jsonLd={[productJsonLd, breadcrumbJsonLd]}
      />
      <ScrollProgress />
      <BackToTop />
      <div className="container-western pt-8 md:pt-16 pb-10 md:pb-14">
        {/* Breadcrumb — sans 14px, alvo de toque confortável (nada de mono 10px) */}
        <nav
          aria-label="breadcrumb"
          className="flex items-center flex-wrap gap-x-2 gap-y-1 font-sans text-[14px] text-western-stone-warm mb-7 md:mb-9"
        >
          <Link
            to="/linhas"
            className="inline-flex items-center min-h-[36px] hover:text-western-green-deep transition-colors"
          >
            Catálogo
          </Link>
          <ChevronRight className="h-4 w-4 opacity-40" aria-hidden />
          {collection ? (
            <>
              <Link
                to={parentRoute}
                className="inline-flex items-center min-h-[36px] hover:text-western-green-deep transition-colors"
              >
                {parentLabel}
              </Link>
              <ChevronRight className="h-4 w-4 opacity-40" aria-hidden />
            </>
          ) : null}
          <span className="font-semibold text-western-green-deep">{product.title}</span>
        </nav>

        <div className="grid md:grid-cols-2 gap-10 lg:gap-20 items-start">
          {/* Galeria */}
          <div className="md:sticky md:top-24 min-w-0">
            <ProductGallery
              images={galleryImages}
              activeIndex={activeImage}
              onChange={setActiveImage}
              productTitle={product.title}
            />
          </div>

          {/* Escada de decisão — uma decisão por vez */}
          <div className="md:py-2 text-western-green-deep min-w-0">
            {collectionDisplay && <p className="text-eyebrow mb-4">{collectionDisplay}</p>}
            <div className="w-10 h-px bg-western-gold mb-5" />
            <h1 className="display-xl text-western-green-deep">{product.title}</h1>
            {sku && <p className="text-meta mt-3">SKU · {sku}</p>}
            {parsed.lead && (
              <p className="text-body mt-5 max-w-[52ch] break-words">
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
              <section className="mt-8 space-y-7" aria-label="Compra">
                {/* 1 — Preço */}
                <div>
                  <p className="text-price">{formatBRL(priceAmount, priceCurrency)}</p>
                  <p className="text-meta mt-1.5">À vista · parcela no checkout</p>
                </div>

                {/* 2 — Acabamento */}
                {acabOption && (
                  <div className="pt-7 border-t border-western-border-soft">
                    <p className="text-eyebrow mb-4">
                      Escolha o acabamento{" "}
                      <span className="text-western-gold">· obrigatório</span>
                    </p>
                    <div
                      className={
                        acabPending
                          ? "rounded-lg ring-2 ring-western-gold/40 ring-offset-4 ring-offset-western-ivory transition-all"
                          : ""
                      }
                    >
                      <FinishSelector
                        values={acabOption.values}
                        selected={activeOptions[acabOption.name] ?? null}
                        onSelect={(val) => {
                          userTouchedOptions.current = true;
                          setActiveOptions((prev) => ({ ...prev, [acabOption.name]: val }));
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* 3 — Outras opções */}
                {otherOptions.length > 0 && (
                  <div className="pt-7 border-t border-western-border-soft space-y-6">
                    {otherOptions.map((option) => (
                      <div key={option.name}>
                        <p className="text-eyebrow mb-4">{option.name}</p>
                        <div className="flex flex-wrap gap-3">
                          {option.values.map((val) => {
                            const selected = activeOptions[option.name] === val;
                            return (
                              <button
                                key={val}
                                onClick={() => {
                                  userTouchedOptions.current = true;
                                  setActiveOptions((prev) => ({
                                    ...prev,
                                    [option.name]: val,
                                  }));
                                }}
                                aria-pressed={selected}
                                className={`tap-target inline-flex items-center justify-center px-5 rounded-full border font-sans text-[15px] transition-colors ${
                                  selected
                                    ? "border-western-gold bg-western-gold/10 text-western-green-deep font-semibold"
                                    : "border-western-border-strong text-western-green-deep font-medium hover:border-western-green-deep"
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

                {/* 4 — Quantidade + CTA (primário verde, full-width no mobile) */}
                <div className="pt-7 border-t border-western-border-soft">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex items-center h-control rounded-lg border border-western-border-strong bg-white transition-opacity ${
                        acabPending ? "opacity-50" : ""
                      }`}
                    >
                      <button
                        onClick={() => setQty(Math.max(1, qty - 1))}
                        disabled={acabPending}
                        className="h-control w-12 flex items-center justify-center rounded-l-[10px] hover:bg-western-paper transition-colors text-western-green-deep text-xl disabled:cursor-not-allowed"
                        aria-label="Diminuir quantidade"
                      >
                        −
                      </button>
                      <span className="px-3 font-sans font-semibold text-[15px] min-w-[2ch] text-center tabular-nums">
                        {qty}
                      </span>
                      <button
                        onClick={() => setQty(qty + 1)}
                        disabled={acabPending}
                        className="h-control w-12 flex items-center justify-center rounded-r-[10px] hover:bg-western-paper transition-colors text-western-green-deep text-xl disabled:cursor-not-allowed"
                        aria-label="Aumentar quantidade"
                      >
                        +
                      </button>
                    </div>
                    <WishlistButton
                      handle={product.handle}
                      title={product.title}
                      image={product.images.edges[0]?.node?.url ?? null}
                      className="!h-control !w-[52px] !p-0 justify-center flex-shrink-0 rounded-lg"
                    />
                  </div>

                  <Button
                    ref={addBtnRef as React.RefObject<HTMLButtonElement>}
                    onClick={handleAdd}
                    disabled={!variant?.availableForSale || isLoadingCart || !!pendingOption}
                    className={`group mt-4 w-full h-control px-6 rounded-lg font-sans text-[15px] font-semibold normal-case tracking-normal transition-[background-color,color,transform] duration-150 ease-out active:scale-[0.97] motion-reduce:active:scale-100 ${
                      acabPending
                        ? "bg-western-stone-warm/20 text-western-green-deep/70 hover:bg-western-stone-warm/25 disabled:opacity-100"
                        : "bg-western-cta text-western-cream hover:bg-western-green-deep disabled:opacity-45"
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
                        <span className="truncate">Adicionar ao orçamento</span>
                        <ArrowRight className="h-5 w-5 ml-2 transition-transform motion-safe:group-hover:translate-x-0.5" />
                      </>
                    ) : (
                      "Indisponível"
                    )}
                  </Button>

                  {/* Upsell "Leve 3, −10%" — pós-quantidade (C-refinado) */}
                  <KitUpsell product={product} variant={variant} />

                  {/* Modelo 3D — secundário, nunca compete com o primário */}
                  <a
                    href={m3dUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${CTA_OUTLINE} mt-3 w-full sm:w-auto`}
                  >
                    <Box className="h-5 w-5" />
                    {m3dIsProductSpecific ? "Baixar modelo 3D (.skp)" : "Abrir no 3D Warehouse"}
                  </a>

                  {/* Sinais de confiança perto da decisão */}
                  <p className="mt-6 text-meta flex flex-wrap items-center gap-x-2 gap-y-1.5">
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="h-4 w-4 text-western-bronze" aria-hidden />
                      <span>
                        <span className="font-semibold text-western-green-deep">+1.000 peças</span>{" "}
                        vendidas Brasil afora
                      </span>
                    </span>
                    <span className="opacity-40">·</span>
                    <span>Garantia {BUSINESS.garantiaLabel}</span>
                    <span className="opacity-40">·</span>
                    <span>
                      Instalação guiada, passo a passo ·{" "}
                      <a
                        href="#instalacao"
                        onClick={(e) => {
                          e.preventDefault();
                          document
                            .getElementById("instalacao")
                            ?.scrollIntoView({ behavior: "smooth", block: "start" });
                        }}
                        className="font-semibold text-western-green-deep underline decoration-western-gold underline-offset-4 hover:decoration-2"
                      >
                        ver como
                      </a>
                    </span>
                  </p>

                  <p className="mt-2 text-meta">
                    Pronto em {BUSINESS.prazoProducaoDias} dias úteis · Retira em{" "}
                    {BUSINESS.cidadeAtelie}/{BUSINESS.ufAtelie} · Frete no checkout
                  </p>

                  {/* Selos colados à decisão (kit pdp.jsx:101-102) — NF-e, entrega
                   * rastreada e reposição. Não repete garantia/prazo (já acima). */}
                  <p className="mt-4 pt-4 border-t border-western-border-soft text-meta flex flex-wrap items-center gap-x-2 gap-y-1.5">
                    <span className="inline-flex items-center gap-1.5">
                      <FileText className="h-4 w-4 text-western-bronze" aria-hidden />
                      Compra segura
                    </span>
                    <span className="opacity-40">·</span>
                    <span className="inline-flex items-center gap-1.5">
                      <Truck className="h-4 w-4 text-western-bronze" aria-hidden />
                      Entrega rastreada
                    </span>
                    <span className="opacity-40">·</span>
                    <span className="inline-flex items-center gap-1.5">
                      <ShieldCheck className="h-4 w-4 text-western-bronze" aria-hidden />
                      Reposição garantida em caso de avaria
                    </span>
                  </p>
                </div>
              </section>
            ) : (
              /* Gate de preço — política comercial B2B (visitante nunca vê preço) */
              <section className="mt-8" aria-label="Acesso de parceiro">
                <div className="rounded-xl border border-western-border-soft bg-western-paper p-6 md:p-7">
                  <span className="inline-flex items-center gap-2 mb-5 rounded-full border border-western-border-soft bg-white px-3.5 py-1.5">
                    <Lock className="h-4 w-4 text-western-bronze" aria-hidden />
                    <span className="font-sans text-[14px] font-semibold uppercase tracking-[0.06em] text-western-bronze">
                      Ver preço de parceiro
                    </span>
                  </span>
                  <p className="display-md text-western-green-deep">
                    Preço de atacado liberado no cadastro.
                  </p>
                  <p className="text-body mt-3 max-w-[46ch]">
                    Grátis, aprovação na hora. Tabela de parceiro, modelos 3D e composições,
                    pagamento em Pix, boleto ou cartão.
                  </p>
                  <div className="mt-6 flex flex-col sm:flex-row gap-3">
                    <Link
                      ref={addBtnRef as React.RefObject<HTMLAnchorElement>}
                      to="/parceiro/cadastro"
                      className={`${CTA_PRIMARY} sm:flex-1`}
                    >
                      Criar conta de parceiro
                    </Link>
                    <Link to="/parceiro/login" className={`${CTA_OUTLINE} w-full sm:flex-1`}>
                      Já sou parceiro · entrar
                    </Link>
                  </div>
                </div>

                {/* A linha "Pedido mínimo · fale no WhatsApp" saiu daqui (dono:
                    "não agrega"): o pedido mínimo já vive na aba Entrega, e o
                    WhatsApp tem o botão flutuante do site. O gate fica limpo:
                    card de parceiro → "ou" → porta da casa. */}
                <div className="flex items-center gap-4 mb-7 mt-6">
                  <div className="flex-1 h-px bg-western-border-soft" />
                  <span className="font-sans text-[14px] font-semibold uppercase tracking-[0.06em] text-western-bronze">
                    ou
                  </span>
                  <div className="flex-1 h-px bg-western-border-soft" />
                </div>

                {/* Casa = off-ramp discreto, UM caminho só. Antes esta coluna
                    empilhava 2 botões + 2 links de WhatsApp competindo com o card
                    de parceiro (a ação primária). O dono da casa tem uma porta:
                    /para-sua-casa, que responde preço, prazo e "não tenho CNPJ". */}
                <p className="text-body text-western-green-deep">
                  É para a sua casa?{" "}
                  <Link
                    to="/para-sua-casa"
                    className="font-semibold text-western-green-deep underline decoration-western-gold underline-offset-4 hover:decoration-2"
                  >
                    A gente monta seu orçamento
                  </Link>
                </p>
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

      {/* Chips-âncora (DS: página longa ganha âncoras; a barra fixa cobre a
          compra — estas cobrem a LEITURA). */}
      <nav
        aria-label="Seções da página"
        className="border-y border-western-border-soft surface-paper"
      >
        <div className="container-western">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide py-3">
            {[
              ["medidas", "Medidas e peso"],
              ["ficha", "Ficha da peça"],
              ["instalacao", "Instalação"],
              ["cena", "Onde usar & composição"],
              ["relacionados", "Relacionados"],
            ].map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() =>
                  document
                    .getElementById(id)
                    ?.scrollIntoView({ behavior: "smooth", block: "start" })
                }
                className="tap-target shrink-0 inline-flex items-center px-4 rounded-full border border-western-border-strong font-sans text-[15px] font-medium text-western-green-deep hover:border-western-green-deep transition-colors"
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* ORDEM DA JORNADA (dono, 2026-07-18): calcular → confiar → aprofundar
       * → expandir por último (o que tem botão pra fora da PDP fecha a página). */}

      {/* A conta — PRIMEIRA coisa após a compra nos produtos que a usam
       * (revestimento/pisada): o cliente calcula a quantidade antes de tudo. */}
      <div id="quantidade" className="scroll-mt-24">
        <Reveal variant="fade-up">
          <CalculadoraQuantidade
            key={product.handle}
            handle={product.handle}
            isApproved={isApproved}
            onUseQuantity={(n) => {
              setQty(n);
              addBtnRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
            }}
          />
        </Reveal>
      </div>

      {/* A leveza — Tamanho real */}
      <div id="medidas" className="scroll-mt-24">
        <Reveal variant="fade-up">
          <TamanhoReal
            productTitle={product.title}
            sku={sku || product.variants.edges[0]?.node?.sku}
            dims={dims}
            pesoKg={pesoKg}
          />
        </Reveal>
      </div>

      {/* Ficha da peça (híbrido: trilho no desktop, acordeão no mobile) —
       * Descrição · Especificações · Entrega, logo abaixo da leveza. */}
      <div id="ficha" className="scroll-mt-24">
        <ProductTabs
          parsed={parsed}
          fichaRows={fichaRows}
          modelo3dValue={product.modelo3d?.value}
          hideModelo3d
        />
      </div>
      <div id="instalacao" className="scroll-mt-24">
        <InstallationSection config={installationConfig} />
      </div>

      {/* Onde usar & composição — FUNDIDAS, por último de propósito: os dois
       * assuntos têm botões que tiram o cliente da PDP (obras, guia, conjuntos). */}
      <div id="cena" className="scroll-mt-24">
        <Reveal variant="fade-up">
          <ComposicaoCena
            productHandle={product.handle}
            productTitle={product.title}
            collectionHandle={collection?.handle}
          />
        </Reveal>
      </div>
      {/* "Veja em uso" absorvido pela galeria canônica (estúdio → ambiente → detalhe) */}
      <Reveal variant="fade-up">
        <SocialProofBand />
      </Reveal>
      <div id="relacionados" className="scroll-mt-24">
        <Reveal variant="fade-up">
          <RelatedProducts
            collectionHandle={collection?.handle}
            collectionTitle={collection?.title}
            currentHandle={product.handle}
            currentSku={sku || product.variants.edges[0]?.node?.sku}
            productTitle={product.title}
          />
        </Reveal>
      </div>

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
