// PDP virtual do Conjunto — /conjuntos/:handle
// Conjuntos NÃO são produtos Woo; a página é montada a partir de:
//   • guideMap  → tipo/tamanho/nivel + nome/subtítulo
//   • conjuntoRenders → render da composição (fallback nivelImage)
//   • conjuntoComposicao → peças (handle Woo + qty)
//   • fetchProductsByHandles → nome/preço/foto real das peças
//   • installation.ts → InstallationSection/TrustStrip resolvido pela composição
// A PDP é a etapa "avaliar de perto" entre os 3 cards (/guia-de-composicao/composicoes)
// e o Refinar (/guia-de-composicao/refinar/:handle).

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Link, Navigate, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ArrowRight,
  Bookmark,
  Check,
  ChevronRight,
  Download,
  Info,
  Maximize2,
  ShieldCheck,
  Sparkles,
  Truck,
  X,
} from "lucide-react";

import Seo from "@/components/seo/Seo";
import Reveal from "@/components/shared/Reveal";
import GatedPrice from "@/components/shared/GatedPrice";
import ProjetosWesternBand from "@/components/shared/ProjetosWesternBand";
import SocialProofBand from "@/components/product/SocialProofBand";
import {
  InstallationSection,
  InstallationTrustStrip,
} from "@/components/product/InstallationModule";
import QuoteLeadModal from "@/components/quote/QuoteLeadModal";
import ContextoChips from "@/components/guide-v2/ContextoChips";
import SectionDivider from "@/components/guide-v2/SectionDivider";
import { nivelImage } from "@/components/guide-v2/imagery";
import {
  acabamentoMeta,
  tipoVisualMap,
  type Acabamento,
  type TipoVisual,
} from "@/components/guide-v2/types";
import { buildContextQuery } from "@/components/guide-v2/useGuideQuery";

import { cdnImg } from "@/lib/catalog/client";
import { fetchProductsByHandlesHydrated } from "@/lib/datasource";
import { useCartStore, type CartItem } from "@/stores/cartStore";
import { useAuth } from "@/hooks/useAuth";
import { BUSINESS } from "@/config/business";
import {
  faixaArea,
  getConjuntoByHandle,
  nivelLabels,
  nivelMeta,
  tipoLabels,
  tamanhoLabels,
} from "@/data/guideMap";
import { conjuntoComposicao } from "@/data/conjuntoComposicao";
import { conjuntoRenders } from "@/data/conjuntoRenders";
import {
  getInstallationConfig,
  type InstallationType,
} from "@/data/installation";

function resolveInstallType(
  composicao: { handle: string; qty: number }[] | undefined,
): InstallationType {
  if (!composicao || composicao.length === 0) return "pedra";
  if (composicao.some((r) => r.handle.startsWith("cascata-"))) return "cascata";
  if (composicao.some((r) => r.handle.startsWith("fonte-"))) return "fonte";
  return "pedra";
}

export default function ConjuntoPage() {
  const { handle } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { isApproved, session } = useAuth();
  const { addBundle } = useCartStore();
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [zoomed, setZoomed] = useState(false);

  useEffect(() => {
    if (!lightboxOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [lightboxOpen]);

  const info = useMemo(() => (handle ? getConjuntoByHandle(handle) : null), [handle]);

  // Contexto vindo do guia (query) — usado só p/ chips e link do Refinar
  const acabamentoQP = params.get("acabamento") as Acabamento | null;
  const acabamento: Acabamento = acabamentoQP ?? "moledo";
  const tipoRaw = params.get("tipo");
  const tipoVisualQP: TipoVisual | null =
    tipoRaw === "lago-reduzido" ? "lago" : (tipoRaw as TipoVisual | null);
  const areaQP = params.get("area");
  const hasContext = Boolean(acabamentoQP && tipoVisualQP && areaQP);

  const composicao = handle ? conjuntoComposicao[handle] : undefined;
  const composicaoHandles = useMemo(
    () => (composicao ? composicao.map((r) => r.handle) : []),
    [composicao],
  );

  const { data: produtos, isLoading } = useQuery({
    queryKey: ["conjunto-page", handle, composicaoHandles],
    queryFn: () => fetchProductsByHandlesHydrated(composicaoHandles),
    enabled: composicaoHandles.length > 0,
    staleTime: 5 * 60 * 1000,
  });

  const pecasEnriched = useMemo(() => {
    const acabLabel = acabamentoMeta[acabamento].label;
    if (!composicao) return [];
    const byHandle = new Map((produtos ?? []).map((p) => [p.handle, p] as const));
    return composicao.map((row) => {
      const prod = byHandle.get(row.handle);
      const variant =
        prod?.variants.edges.find((e) =>
          e.node.selectedOptions?.some((o) => o.name === "Acabamento" && o.value === acabLabel),
        )?.node ?? prod?.variants.edges[0]?.node;
      const unit = variant
        ? parseFloat(variant.price.amount)
        : prod
          ? parseFloat(prod.priceRange.minVariantPrice.amount)
          : 0;
      const img = prod?.images.edges[0]?.node;
      return {
        handle: row.handle,
        qty: row.qty,
        title: prod?.title ?? row.handle,
        unitPrice: Number.isFinite(unit) ? unit : 0,
        imageUrl: img?.url ? cdnImg(img.url, 800) : undefined,
        variantId: variant?.id,
        variantTitle: variant?.title,
        wooParentProductId: variant?.wooParentProductId,
        wooVariationId: variant?.wooVariationId ?? null,
        wooKind: variant?.wooKind,
        wooAttributes: variant?.wooAttributes ?? [],
      };
    });
  }, [composicao, produtos, acabamento]);

  const totalPecas = pecasEnriched.reduce((s, p) => s + p.qty, 0);
  const totalPreco = pecasEnriched.reduce((s, p) => s + p.unitPrice * p.qty, 0);

  if (!info) return <Navigate to="/conjuntos" replace />;
  const { tipo, tamanho, nivel, leaf } = info;
  const faixa = faixaArea[tipo][tamanho];
  const tipoLbl = tipoLabels[tipo];
  // Gender agreement: only "piscina" is feminine → "Pequena/Média/Grande"
  const sizeLabel = tipo === "piscina"
    ? { pequeno: "Pequena", medio: "Média", grande: "Grande" }[tamanho]
    : tamanhoLabels[tamanho];
  const tipoVisual: TipoVisual = tipoVisualQP ?? tipo;
  const render = conjuntoRenders[leaf.handle] ?? nivelImage[nivel];
  const isSugestao = nivel === "equilibrada";
  const installType = resolveInstallType(composicao);
  const installConfig = getInstallationConfig(installType);
  const acabLabel = acabamentoMeta[acabamento].label;

  // Link para Refinar preserva o contexto (ou cria com defaults sensatos)
  const refinarQs = buildContextQuery({
    tipoVisual: tipoVisualQP ?? tipo,
    area: areaQP
      ? Number(areaQP)
      : tamanho === "pequeno"
        ? 4
        : tamanho === "medio"
          ? 8
          : 15,
    acabamento,
  });
  const refinarHref = `/guia-de-composicao/refinar/${leaf.handle}?${refinarQs}&nivel=${nivel}`;
  const backToCaminhos = hasContext
    ? `/guia-de-composicao/composicoes?${buildContextQuery({
        tipoVisual: tipoVisualQP!,
        area: Number(areaQP),
        acabamento,
      })}`
    : "/conjuntos";

  // ── Handlers ────────────────────────────────────────────────────────────
  const buildCartItems = (): CartItem[] =>
    pecasEnriched
      .filter((p) => p.variantId && p.variantId.startsWith("gid://"))
      .map((p) => ({
        productHandle: p.handle,
        productTitle: p.title,
        productImage: p.imageUrl ?? null,
        variantId: p.variantId!,
        variantTitle: p.variantTitle ?? acabLabel,
        price: { amount: String(p.unitPrice), currencyCode: "BRL" },
        quantity: p.qty,
        selectedOptions: [{ name: "Acabamento", value: acabLabel }],
        wooParentProductId: p.wooParentProductId,
        wooVariationId: p.wooVariationId ?? null,
        wooKind: p.wooKind,
        wooAttributes: p.wooAttributes ?? [],
        conjuntoRef: leaf.handle,
      }));

  const onAdicionarOrcamento = () => {
    const items = buildCartItems();
    if (items.length === 0) {
      toast.error(
        "Nenhuma peça deste conjunto está disponível para orçamento direto. Solicite proposta consultiva.",
      );
      return;
    }
    addBundle(items);
    toast.success(`Conjunto ${leaf.nome} adicionado ao orçamento`, {
      description: `${items.length} ${items.length === 1 ? "peça" : "peças"} · ${faixa} · acabamento ${acabLabel}`,
    });
  };

  const quoteItems = useMemo(() => buildCartItems(), [pecasEnriched, acabLabel]);
  const quoteSubtotal = quoteItems.reduce(
    (s, i) => s + parseFloat(i.price.amount) * i.quantity,
    0,
  );

  const onSalvarProjeto = () => {
    if (!session) {
      toast.message("Entre para salvar este projeto na sua conta.", {
        action: {
          label: "Entrar",
          onClick: () => navigate("/parceiro/login"),
        },
      });
      return;
    }
    toast.success("Projeto salvo em Minha Conta › Composições.");
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `Conjunto ${leaf.nome} · ${tipoLbl}`,
    description: `${leaf.subtitulo}. ${nivelMeta[nivel].detalhe}`,
    image: render,
    brand: { "@type": "Brand", name: "Western" },
    offers: {
      "@type": "Offer",
      priceCurrency: "BRL",
      price: totalPreco > 0 ? totalPreco.toFixed(2) : leaf.preco.toFixed(2),
      availability: "https://schema.org/InStock",
    },
  };

  return (
    <div className="surface-ivory min-h-screen relative pb-32 lg:pb-0">
      <Seo
        title={`Conjunto ${leaf.nome} · ${tipoLbl} ${sizeLabel} · Western`}
        description={`${leaf.subtitulo} pronta para ${tipoLbl.toLowerCase()} de ${faixa.toLowerCase()}. Veja peças, preço e ajuste tudo peça por peça.`}
        path={`/conjuntos/${leaf.handle}`}
        ogType="product"
        image={render}
        jsonLd={jsonLd}
      />

      {hasContext && tipoVisualQP && areaQP && (
        <ContextoChips
          tipo={tipoVisualQP}
          area={Number(areaQP)}
          acabamento={acabamento}
        />
      )}

      {/* Breadcrumb */}
      <div className="container-western pt-6">
        <nav className="flex items-center gap-1.5 font-sans text-[14px] text-western-stone-warm">
          <Link
            to="/conjuntos"
            className="tap-target inline-flex items-center font-semibold hover:text-western-green-deep hover:underline underline-offset-4 transition-colors"
          >
            Conjuntos
          </Link>
          <ChevronRight className="h-4 w-4 shrink-0" />
          <span className="text-western-green-deep">{leaf.nome}</span>
        </nav>
      </div>

      {/* ── HERO + RAIL ─────────────────────────────────────────────── */}
      <section className="container-western pt-4 pb-16 md:pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-10 lg:gap-16 items-start">
          {/* Coluna esquerda: render + título */}
          <div className="min-w-0">
            <Reveal variant="fade-up" duration={750}>
              <div className="relative aspect-[4/3] rounded-2xl bg-western-paper overflow-hidden shadow-[0_44px_64px_-32px_hsl(var(--western-stone-dark)/0.5)] group">
                <button
                  type="button"
                  onClick={() => {
                    setZoomed(false);
                    setLightboxOpen(true);
                  }}
                  className="absolute inset-0 w-full h-full cursor-zoom-in"
                  aria-label="Ampliar render do conjunto"
                >
                  <img
                    src={render}
                    alt={`Render do conjunto ${leaf.nome}`}
                    className="w-full h-full object-cover pointer-events-none"
                  />
                </button>
                <span className="absolute top-4 right-4 inline-flex items-center gap-1.5 rounded-md bg-western-cream/90 px-3 py-1.5 font-sans text-[14px] font-semibold text-western-green-deep pointer-events-none">
                  <Maximize2 className="h-4 w-4" /> Ampliar
                </span>
                <p className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-western-green-deep/95 via-western-green-deep/70 to-transparent px-5 py-5 md:px-7 font-sans text-[15px] md:text-[16px] text-western-cream leading-snug pointer-events-none">
                  Uma composição possível. No próximo passo você adapta cada peça ao seu espaço.
                </p>
              </div>
            </Reveal>

            <Reveal variant="fade-up" duration={700} delay={120}>
              <div className="mt-8">
                <p className="text-eyebrow mb-4">
                  Sua sugestão · {nivelLabels[nivel]} para {faixa.toLowerCase()}
                </p>
                <h1 className="display-xl text-western-green-deep">
                  {leaf.nome}
                </h1>
                <div className="w-12 h-px bg-western-gold mt-6 mb-6" />
                <p className="text-body max-w-[62ch]">
                  {leaf.subtitulo}. {nivelMeta[nivel].tagline}.
                </p>
                <div className="mt-6 flex flex-wrap gap-2">
                  <Tag>{tipoLbl}</Tag>
                  <Tag>{sizeLabel} · {faixa}</Tag>
                  <Tag>{nivelLabels[nivel]}</Tag>
                  <Tag>Acabamento {acabLabel}</Tag>
                </div>
              </div>
            </Reveal>
          </div>

          {/* Rail sticky à direita */}
          <aside className="lg:sticky lg:top-24">
            <div className="rounded-2xl bg-white border border-western-border-soft p-6 md:p-7 shadow-[0_24px_44px_-30px_hsl(var(--western-stone-dark)/0.35)]">
              <p className="text-eyebrow mb-3">Para {faixa.toLowerCase()}</p>
              {isSugestao && (
                <div className="mb-4 inline-flex items-center gap-2 rounded-md bg-western-gold/15 px-3 py-2 font-sans text-[14px] font-semibold text-western-bronze">
                  <Sparkles className="h-4 w-4" /> Nossa sugestão para o seu espaço
                </div>
              )}

              <div className="mb-6">
                {isLoading ? (
                  <div className="h-10 w-40 rounded-md bg-western-paper animate-pulse" />
                ) : (
                  <>
                    <GatedPrice
                      amount={totalPreco || leaf.preco}
                      variant="block"
                      className="text-price"
                    />
                    {totalPreco > 0 && (
                      <p className="mt-2 text-meta">
                        Em até 12× no checkout
                      </p>
                    )}
                    {isApproved && (
                      <p className="mt-1 font-sans text-[14px] font-semibold text-western-bronze">
                        Preço de parceiro aplicado
                      </p>
                    )}
                  </>
                )}
              </div>

              <div className="space-y-3">
                <button
                  type="button"
                  onClick={onAdicionarOrcamento}
                  disabled={isLoading}
                  className="btn-primary w-full"
                >
                  Adicionar ao meu orçamento
                </button>
                <Link to={refinarHref} className="btn-outline-forest w-full">
                  Personalizar peça por peça <ArrowRight className="h-5 w-5" />
                </Link>
              </div>

              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1">
                <button
                  type="button"
                  onClick={() => setQuoteOpen(true)}
                  className="tap-target inline-flex items-center gap-2 font-sans text-[16px] font-semibold text-western-stone-warm hover:text-western-green-deep hover:underline underline-offset-4 transition-colors"
                >
                  <Download className="h-5 w-5" /> Baixar proposta (PDF)
                </button>
                <button
                  type="button"
                  onClick={onSalvarProjeto}
                  className="tap-target inline-flex items-center gap-2 font-sans text-[16px] font-semibold text-western-stone-warm hover:text-western-green-deep hover:underline underline-offset-4 transition-colors"
                >
                  <Bookmark className="h-5 w-5" /> Salvar projeto
                </button>
              </div>

              <div className="mt-6 pt-5 border-t border-western-border-soft">
                <ul className="space-y-3">
                  <li className="flex items-start gap-2.5 font-sans text-[16px] leading-snug text-western-green-deep">
                    <Check className="h-5 w-5 text-western-gold mt-0.5 flex-shrink-0" />
                    {totalPecas || leaf.preco > 0 ? `${totalPecas} ${totalPecas === 1 ? "peça" : "peças"} na composição` : "Composição curada"}
                  </li>
                  <li className="flex items-start gap-2.5 font-sans text-[16px] leading-snug text-western-green-deep">
                    <Truck className="h-5 w-5 text-western-gold mt-0.5 flex-shrink-0" />
                    Produção {BUSINESS.prazoProducaoLabel} · frete calculado por destino
                  </li>
                  <li className="flex items-start gap-2.5 font-sans text-[16px] leading-snug text-western-green-deep">
                    <ShieldCheck className="h-5 w-5 text-western-gold mt-0.5 flex-shrink-0" />
                    Garantia de {BUSINESS.garantiaLabel}
                  </li>
                </ul>
              </div>

              <div className="mt-5">
                <InstallationTrustStrip config={installConfig} />
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* ── O que vem no conjunto ───────────────────────────────────── */}
      <section className="surface-paper border-t border-western-border-soft py-16 md:py-20">
        <div className="container-western">
          <div className="max-w-3xl">
            <p className="text-section-label mb-3">O que vem no conjunto</p>
            <h2 className="display-lg text-western-green-deep">
              {totalPecas > 0
                ? `${totalPecas} peças, uma leitura só.`
                : "As peças desta composição."}
            </h2>
            <p className="mt-4 text-body max-w-[62ch]">
              Cada peça é vendida avulsa — você vê exatamente o que leva. No próximo
              passo você ajusta quantidade e substituições.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {isLoading && pecasEnriched.length === 0
              ? Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="rounded-lg bg-white overflow-hidden animate-pulse">
                    <div className="aspect-square bg-western-paper" />
                    <div className="p-4 space-y-2">
                      <div className="h-4 w-2/3 rounded-sm bg-western-paper" />
                      <div className="h-3 w-1/3 rounded-sm bg-western-paper" />
                    </div>
                  </div>
                ))
              : pecasEnriched.map((p, i) => (
                  <Link
                    key={`${p.handle}-${i}`}
                    to={`/produtos/${p.handle}`}
                    className="group flex flex-col overflow-hidden rounded-lg bg-white border border-western-border-soft hover:border-western-gold/60 hover:shadow-[0_20px_36px_-24px_hsl(var(--western-stone-dark)/0.35)] transition-all"
                    aria-label={`Ver peça ${p.title}`}
                  >
                    <div className="relative aspect-square bg-western-paper overflow-hidden">
                      {p.imageUrl ? (
                        <img
                          src={p.imageUrl}
                          alt={p.title}
                          loading="lazy"
                          className="w-full h-full object-contain p-3 transition-transform duration-500 group-hover:scale-[1.03]"
                        />
                      ) : (
                        <div className="w-full h-full" />
                      )}
                      <span className="absolute top-2.5 right-2.5 rounded-md bg-western-green-deep px-2.5 py-1 font-sans text-[14px] font-semibold tabular-nums text-western-cream">
                        {p.qty}×
                      </span>
                    </div>
                    <div className="flex flex-1 flex-col p-4">
                      <h3 className="font-sans text-[17px] font-semibold tracking-normal leading-snug text-western-green-deep line-clamp-2">
                        {p.title}
                      </h3>
                      <div className="mt-auto pt-3 font-sans text-[16px] font-semibold tabular-nums text-western-green-deep">
                        {/* dentro do <Link> do card — sem <a> aninhado */}
                        <GatedPrice amount={p.unitPrice} suffix="/ un." linked={false} />
                      </div>
                    </div>
                  </Link>
                ))}
          </div>
        </div>
      </section>

      {/* ── Por que essa composição ─────────────────────────────────── */}
      <section className="border-t border-western-border-soft py-16 md:py-20">
        <div className="container-western grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-12">
          <div>
            <p className="text-section-label mb-3">Por que essa composição</p>
            <h2 className="display-lg text-western-green-deep">
              {nivelMeta[nivel].tagline}.
            </h2>
            <div className="w-12 h-px bg-western-gold mt-5 mb-6" />
            <p className="text-body max-w-[62ch]">
              Para {faixa.toLowerCase()} de {tipoLbl.toLowerCase()}, essa densidade
              equilibra presença e respiro. {nivelMeta[nivel].detalhe}
            </p>
            <p className="mt-4 text-body max-w-[62ch]">
              O conjunto {leaf.nome} nasceu de projetos reais especificados no ateliê
              Western — os volumes conversam entre si e o acabamento {acabLabel.toLowerCase()}{" "}
              amarra a leitura mineral do espaço.
            </p>
          </div>
          <aside className="border-l-2 border-western-gold pl-6 py-2 self-start">
            <p className="text-eyebrow mb-3">Do ateliê</p>
            <p className="font-sans text-[19px] font-medium leading-relaxed text-western-green-deep">
              “Cada conjunto é uma partitura — a Western entrega as peças já em
              conversa. Você personaliza a partir de uma base que funciona.”
            </p>
            <p className="mt-3 text-meta">
              Curadoria Western · Cajamar/SP
            </p>
          </aside>
        </div>
      </section>

      <InstallationSection config={installConfig} />

      <ProjetosWesternBand />

      <SocialProofBand />

      {/* ── Fecho racional ──────────────────────────────────────────── */}
      <section className="border-t border-western-border-soft surface-paper py-14">
        <div className="container-western">
          <p className="text-section-label mb-6">Antes de decidir</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <Fact label="Área indicada" value={faixa} />
            <Fact label="Peças no conjunto" value={totalPecas ? `${totalPecas} peças` : "Sob curadoria"} />
            <Fact label="Frete" value="Calculado por destino" />
            <Fact label="Extras" value="Garantia 1 ano" />
          </div>
          <p className="mt-8 inline-flex items-center gap-2 text-meta">
            <Info className="h-4 w-4 shrink-0" /> Produção em Cajamar/SP · {BUSINESS.prazoProducaoLabel}
          </p>
        </div>
      </section>

      <div className="container-western py-10">
        <SectionDivider />
        <div className="mt-8 text-center">
          <Link
            to={backToCaminhos}
            className="tap-target inline-flex items-center justify-center gap-2 font-sans text-[16px] font-semibold text-western-stone-warm hover:text-western-green-deep hover:underline underline-offset-4 transition-colors"
          >
            ← Voltar aos {hasContext ? "três caminhos" : "conjuntos"}
          </Link>
        </div>
      </div>

      {/* Barra fixa mobile — CTA primário full-width (V3) */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-western-border-soft px-4 pt-3 pb-4 shadow-[0_-8px_24px_-12px_hsl(var(--western-stone-dark)/0.25)]">
        <div className="flex items-center justify-between gap-4 mb-2">
          <GatedPrice
            amount={totalPreco || leaf.preco}
            className="font-sans text-[20px] font-semibold tabular-nums text-western-green-deep"
          />
          <Link
            to={refinarHref}
            className="tap-target inline-flex items-center gap-1.5 font-sans text-[16px] font-semibold text-western-green-deep underline underline-offset-4"
          >
            Personalizar <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <button
          type="button"
          onClick={onAdicionarOrcamento}
          disabled={isLoading}
          className="btn-primary w-full"
        >
          Adicionar ao orçamento
        </button>
      </div>

      <QuoteLeadModal
        open={quoteOpen}
        onOpenChange={setQuoteOpen}
        items={quoteItems}
        subtotal={quoteSubtotal}
        currency="BRL"
        origem="guia_composicao"
        title={`Baixar proposta · ${leaf.nome}`}
        ctaLabel="Enviar proposta em PDF"
        projetoContext={{
          conjuntoNome: leaf.nome,
          acabamento: acabLabel,
          tipoVisual: tipoVisualMap[tipoVisual]?.label ?? tipoLbl,
          areaM2: areaQP ? Number(areaQP) : undefined,
          modo: "curado",
        }}
        payloadExtra={{
          conjuntoHandle: leaf.handle,
          conjuntoNome: leaf.nome,
          nivel,
          tipo,
          tamanho,
          acabamento,
          origem: "pdp_conjunto",
        }}
      />

      {lightboxOpen && typeof document !== "undefined" && createPortal(
        <div
          className="fixed inset-0 z-[999] bg-western-green-deep flex items-center justify-center"
          role="dialog"
          aria-modal="true"
          aria-label="Render ampliado"
        >
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            aria-label="Fechar (Esc)"
            className="tap-target absolute top-4 right-4 flex items-center justify-center rounded-md text-western-cream/80 hover:text-western-cream border border-western-cream/25 hover:border-western-cream/70 transition-colors z-10"
          >
            <X className="h-6 w-6" />
          </button>
          <button
            type="button"
            onClick={() => setZoomed((z) => !z)}
            className={`relative block mx-auto max-w-[92vw] max-h-[88vh] overflow-auto rounded-2xl ${
              zoomed ? "cursor-zoom-out" : "cursor-zoom-in"
            }`}
            aria-label={zoomed ? "Reduzir zoom" : "Ampliar"}
          >
            <img
              src={render}
              alt={`Render do conjunto ${leaf.nome}`}
              decoding="async"
              loading="eager"
              className={`block mx-auto transition-transform duration-300 ${
                zoomed ? "scale-[1.8]" : "scale-100"
              } max-w-[92vw] max-h-[88vh] object-contain touch-pinch-zoom`}
              style={{ touchAction: "pinch-zoom" }}
            />
          </button>
          <span className="absolute bottom-4 left-1/2 -translate-x-1/2 font-sans text-[14px] text-western-cream/80 text-center px-4">
            Toque na imagem para ampliar · esc para fechar
          </span>
        </div>,
        document.body
      )}
    </div>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-western-border-strong bg-white px-4 py-2 font-sans text-[14px] font-semibold text-western-green-deep">
      {children}
    </span>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-eyebrow mb-2">{label}</p>
      <p className="font-sans text-[18px] font-semibold tracking-normal leading-snug text-western-green-deep">
        {value}
      </p>
    </div>
  );
}
