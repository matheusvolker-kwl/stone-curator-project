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
      description: `${items.length} peça(s) · ${faixa} · acabamento ${acabLabel}`,
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
    <div className="surface-ivory min-h-screen relative">
      <Seo
        title={`Conjunto ${leaf.nome} · ${tipoLbl} ${tamanhoLabels[tamanho]} · Western`}
        description={`${leaf.subtitulo}. Composição ${nivelLabels[nivel].toLowerCase()} pronta para ${tipoLbl.toLowerCase()} — ${faixa}. Veja peças, preço e ajuste tudo peça por peça.`}
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
      <div className="container-western pt-8">
        <nav className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-western-stone-warm">
          <Link to="/conjuntos" className="hover:text-western-green-deep">
            Conjuntos
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-western-green-deep">{leaf.nome}</span>
        </nav>
      </div>

      {/* ── HERO + RAIL ─────────────────────────────────────────────── */}
      <section className="container-western pt-8 pb-16 md:pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-10 lg:gap-16 items-start">
          {/* Coluna esquerda: render + título */}
          <div className="min-w-0">
            <Reveal variant="fade-up" duration={750}>
              <div className="relative aspect-[4/3] bg-western-paper overflow-hidden shadow-[0_44px_64px_-32px_hsl(var(--western-stone-dark)/0.5)] group">
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
                <span className="absolute top-3 right-3 inline-flex items-center gap-1.5 px-2 py-1 bg-western-cream/85 border border-western-stone-warm/20 font-mono text-[9px] uppercase tracking-[0.2em] text-western-green-deep pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity">
                  <Maximize2 className="h-3 w-3" /> Clique para ampliar
                </span>
                <p className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent px-6 py-4 font-display italic text-[13px] text-western-cream leading-snug pointer-events-none">
                  Uma composição possível. No próximo passo você adapta cada peça ao seu espaço.
                </p>
              </div>
            </Reveal>

            <Reveal variant="fade-up" duration={700} delay={120}>
              <div className="mt-8">
                <p className="eyebrow-bar mb-4">
                  Sua sugestão · {nivelLabels[nivel]} para {faixa}
                </p>
                <h1 className="font-display text-4xl md:text-6xl text-western-green-deep leading-[1.02]">
                  {leaf.nome}
                </h1>
                <div className="w-12 h-px bg-western-gold mt-6 mb-6" />
                <p className="font-display italic text-lg md:text-xl text-western-stone-warm leading-relaxed max-w-[620px]">
                  {leaf.subtitulo}. {nivelMeta[nivel].tagline}.
                </p>
                <div className="mt-6 flex flex-wrap gap-2">
                  <Tag>{tipoLbl}</Tag>
                  <Tag>{tamanhoLabels[tamanho]} · {faixa}</Tag>
                  <Tag>{nivelLabels[nivel]}</Tag>
                  <Tag>Acabamento {acabLabel}</Tag>
                </div>
              </div>
            </Reveal>
          </div>

          {/* Rail sticky à direita */}
          <aside className="lg:sticky lg:top-24">
            <div className="bg-white border border-western-stone-warm/15 p-6 md:p-7 shadow-[0_24px_44px_-30px_hsl(var(--western-stone-dark)/0.35)]">
              <p className="eyebrow-bar mb-3">Para {faixa}</p>
              {isSugestao && (
                <div className="mb-4 inline-flex items-center gap-2 bg-western-gold/15 text-western-gold px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.22em]">
                  <Sparkles className="h-3 w-3" /> Nossa sugestão para o seu espaço
                </div>
              )}

              <div className="mb-5">
                {isLoading ? (
                  <div className="h-10 w-40 bg-western-paper animate-pulse" />
                ) : (
                  <>
                    <GatedPrice
                      amount={totalPreco || leaf.preco}
                      className="font-display text-[38px] leading-none text-western-green-deep"
                    />
                    {totalPreco > 0 && (
                      <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.22em] text-western-stone-warm">
                        Em até 12× no checkout
                      </p>
                    )}
                    {isApproved && (
                      <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.22em] text-western-gold">
                        Preço de parceiro aplicado
                      </p>
                    )}
                  </>
                )}
              </div>

              <div className="space-y-2.5">
                <button
                  type="button"
                  onClick={onAdicionarOrcamento}
                  disabled={isLoading}
                  className="w-full h-12 bg-western-green-deep text-western-cream font-mono text-[11px] uppercase tracking-[0.22em] hover:bg-western-green-deep/90 disabled:opacity-50 transition-colors inline-flex items-center justify-center gap-2"
                >
                  Adicionar ao meu orçamento
                </button>
                <Link
                  to={refinarHref}
                  className="w-full h-12 border border-western-green-deep text-western-green-deep font-mono text-[11px] uppercase tracking-[0.22em] hover:bg-western-green-deep hover:text-western-cream transition-colors inline-flex items-center justify-center gap-2"
                >
                  Personalizar peça por peça <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              <div className="mt-4 flex flex-wrap gap-3 text-[11px] font-mono uppercase tracking-[0.18em]">
                <button
                  type="button"
                  onClick={() => setQuoteOpen(true)}
                  className="inline-flex items-center gap-1.5 text-western-stone-warm hover:text-western-green-deep transition-colors"
                >
                  <Download className="h-3.5 w-3.5" /> Baixar proposta (PDF)
                </button>
                <button
                  type="button"
                  onClick={onSalvarProjeto}
                  className="inline-flex items-center gap-1.5 text-western-stone-warm hover:text-western-green-deep transition-colors"
                >
                  <Bookmark className="h-3.5 w-3.5" /> Salvar projeto
                </button>
              </div>

              <div className="mt-6 pt-5 border-t border-western-stone-warm/15">
                <ul className="space-y-2 font-sans text-[12.5px] text-western-green-deep/85 leading-snug">
                  <li className="flex items-start gap-2">
                    <Check className="h-3.5 w-3.5 text-western-gold mt-0.5 flex-shrink-0" />
                    {totalPecas || leaf.preco > 0 ? `${totalPecas} peça(s) na composição` : "Composição curada"}
                  </li>
                  <li className="flex items-start gap-2">
                    <Truck className="h-3.5 w-3.5 text-western-gold mt-0.5 flex-shrink-0" />
                    Produção {BUSINESS.prazoProducaoLabel} · frete calculado por destino
                  </li>
                  <li className="flex items-start gap-2">
                    <ShieldCheck className="h-3.5 w-3.5 text-western-gold mt-0.5 flex-shrink-0" />
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
      <section className="surface-paper border-t border-western-stone-warm/15 py-16 md:py-20">
        <div className="container-western">
          <div className="max-w-3xl">
            <p className="text-section-label mb-3">O que vem no conjunto</p>
            <h2 className="font-display text-3xl md:text-4xl text-western-green-deep leading-tight">
              {totalPecas > 0
                ? `${totalPecas} peças, uma leitura só.`
                : "As peças desta composição."}
            </h2>
            <p className="mt-3 text-western-stone-warm text-[15px] leading-relaxed max-w-[62ch]">
              Cada peça é vendida avulsa — você vê exatamente o que leva. No próximo
              passo você ajusta quantidade e substituições.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {isLoading && pecasEnriched.length === 0
              ? Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-white animate-pulse">
                    <div className="aspect-square bg-western-paper" />
                    <div className="p-4 space-y-2">
                      <div className="h-4 w-2/3 bg-western-paper" />
                      <div className="h-3 w-1/3 bg-western-paper" />
                    </div>
                  </div>
                ))
              : pecasEnriched.map((p, i) => (
                  <Link
                    key={`${p.handle}-${i}`}
                    to={`/produtos/${p.handle}`}
                    className="group bg-white border border-western-stone-warm/10 flex flex-col hover:border-western-gold/60 hover:shadow-[0_20px_36px_-24px_hsl(var(--western-stone-dark)/0.35)] transition-all"
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
                      <span className="absolute top-2.5 right-2.5 bg-western-green-deep text-western-cream font-mono text-[10px] uppercase tracking-[0.18em] px-2 py-1">
                        {p.qty}×
                      </span>
                    </div>
                    <div className="p-4">
                      <h3 className="font-display text-[16px] text-western-green-deep leading-tight line-clamp-2">
                        {p.title}
                      </h3>
                      <div className="mt-2 font-sans text-[13px] font-medium text-western-green-deep">
                        <GatedPrice amount={p.unitPrice} suffix="/ un." />
                      </div>
                    </div>
                  </Link>
                ))}
          </div>
        </div>
      </section>

      {/* ── Por que essa composição ─────────────────────────────────── */}
      <section className="border-t border-western-stone-warm/15 py-16 md:py-20">
        <div className="container-western grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-12">
          <div>
            <p className="text-section-label mb-3">Por que essa composição</p>
            <h2 className="font-display text-3xl md:text-4xl text-western-green-deep leading-tight">
              {nivelMeta[nivel].tagline}.
            </h2>
            <div className="w-12 h-px bg-western-gold mt-5 mb-6" />
            <p className="text-[15.5px] text-western-stone-warm leading-relaxed max-w-[62ch]">
              Para {faixa.toLowerCase()} de {tipoLbl.toLowerCase()}, essa densidade
              equilibra presença e respiro. {nivelMeta[nivel].detalhe}
            </p>
            <p className="mt-4 text-[15.5px] text-western-stone-warm leading-relaxed max-w-[62ch]">
              O conjunto {leaf.nome} nasceu de projetos reais especificados no ateliê
              Western — os volumes conversam entre si e o acabamento {acabLabel.toLowerCase()}
              amarra a leitura mineral do espaço.
            </p>
          </div>
          <aside className="border-l-2 border-western-gold pl-6 py-2 self-start">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-western-gold mb-3">
              Do ateliê
            </p>
            <p className="font-display italic text-[19px] text-western-green-deep leading-snug">
              “Cada conjunto é uma partitura — a Western entrega as peças já em
              conversa. Você personaliza a partir de uma base que funciona.”
            </p>
            <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.22em] text-western-stone-warm">
              Curadoria Western · Cajamar/SP
            </p>
          </aside>
        </div>
      </section>

      <InstallationSection config={installConfig} />

      <ProjetosWesternBand />

      <SocialProofBand />

      {/* ── Fecho racional ──────────────────────────────────────────── */}
      <section className="border-t border-western-stone-warm/15 surface-paper py-14">
        <div className="container-western">
          <p className="text-section-label mb-6">Antes de decidir</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <Fact label="Área indicada" value={faixa} />
            <Fact label="Peças no conjunto" value={totalPecas ? `${totalPecas} peças` : "Sob curadoria"} />
            <Fact label="Frete" value="Calculado por destino" />
            <Fact label="Extras" value="Garantia 1 ano" />
          </div>
          <p className="mt-8 font-mono text-[10px] uppercase tracking-[0.2em] text-western-stone-warm/70 inline-flex items-center gap-2">
            <Info className="h-3 w-3" /> Produção em Cajamar/SP · {BUSINESS.prazoProducaoLabel}
          </p>
        </div>
      </section>

      <div className="container-western py-10">
        <SectionDivider />
        <div className="mt-8 text-center">
          <Link
            to={backToCaminhos}
            className="font-mono text-[10px] uppercase tracking-[0.22em] text-western-stone-warm hover:text-western-green-deep transition-colors"
          >
            ← Voltar aos {hasContext ? "três caminhos" : "conjuntos"}
          </Link>
        </div>
      </div>

      {/* Barra fixa mobile — CTA duplo */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-western-stone-warm/20 px-4 py-3 flex gap-2 shadow-[0_-8px_24px_-12px_hsl(var(--western-stone-dark)/0.25)]">
        <Link
          to={refinarHref}
          className="flex-1 h-11 border border-western-green-deep text-western-green-deep font-mono text-[10.5px] uppercase tracking-[0.2em] inline-flex items-center justify-center"
        >
          Personalizar
        </Link>
        <button
          type="button"
          onClick={onAdicionarOrcamento}
          disabled={isLoading}
          className="flex-1 h-11 bg-western-green-deep text-western-cream font-mono text-[10.5px] uppercase tracking-[0.2em] disabled:opacity-50"
        >
          Adicionar
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
            className="absolute top-4 right-4 h-11 w-11 flex items-center justify-center text-western-cream/80 hover:text-western-cream border border-western-cream/20 hover:border-western-cream/60 transition-colors z-10"
          >
            <X className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => setZoomed((z) => !z)}
            className={`relative block mx-auto max-w-[92vw] max-h-[88vh] overflow-auto ${
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
          <span className="absolute bottom-4 left-1/2 -translate-x-1/2 font-mono text-[10px] uppercase tracking-[0.25em] text-western-cream/70 text-center px-4">
            Clique na imagem para ampliar · esc para fechar
          </span>
        </div>,
        document.body
      )}
    </div>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-mono text-[10px] uppercase tracking-[0.2em] px-3 py-1.5 border border-western-stone-warm/25 text-western-green-deep">
      {children}
    </span>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-western-stone-warm mb-2">
        {label}
      </p>
      <p className="font-display text-[18px] text-western-green-deep leading-snug">
        {value}
      </p>
    </div>
  );
}
