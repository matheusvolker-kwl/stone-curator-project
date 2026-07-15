import { useEffect, useMemo, useRef, useState } from "react";
import { Link, Navigate, useParams, useSearchParams } from "react-router-dom";
import { ChevronDown, ChevronUp, ExternalLink, Info, RotateCcw, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { reportError } from "@/lib/telemetry";
import QuoteLeadModal from "@/components/quote/QuoteLeadModal";
import { useCartStore, type CartItem } from "@/stores/cartStore";
import GuideHeader from "@/components/guide-v2/GuideHeader";
import PecaRow from "@/components/guide-v2/PecaRow";
import AutoralCard from "@/components/guide-v2/AutoralCard";
import AutoralProductModal from "@/components/guide-v2/AutoralProductModal";
import AcabamentoCard from "@/components/guide-v2/AcabamentoCard";
import ProjetoSidebar from "@/components/guide-v2/ProjetoSidebar";
import ContextoChips from "@/components/guide-v2/ContextoChips";
import SectionDivider from "@/components/guide-v2/SectionDivider";
import Reveal from "@/components/shared/Reveal";
import ProjetosWesternBand from "@/components/shared/ProjetosWesternBand";
import brasao from "@/assets/brasao.png";
import {
  acabamentoMeta,
  nivelLabelMap,
  tipoVisualMap,
  type Acabamento,
  type ProjetoExtra,
  type ProjetoPeca,
  type TipoVisual,
} from "@/components/guide-v2/types";
import { autoralToExtra, type AutoralItem } from "@/components/guide-v2/autoraisCatalog";
import { useGuideProducts } from "@/components/guide-v2/useGuideProducts";
import { buildContextQuery } from "@/components/guide-v2/useGuideQuery";
import {
  guideMap,
  m2ToTamanhoId,
  faixaArea,
  whatsappConsultor,
  type ConjuntoLeaf,
  type Nivel,
} from "@/data/guideMap";

/**
 * Pilha sticky do wizard: GuideHeader (80px) + ContextoChips (44px) = 124px.
 * Sem reservar esse espaço, a barra cobria a 1ª peça da lista.
 */
const STICKY_STACK = "scroll-mt-[140px]";

function findConjunto(handle: string): { conjunto: ConjuntoLeaf; nivel: Nivel } | null {
  let found: { conjunto: ConjuntoLeaf; nivel: Nivel } | null = null;
  const walk = (n: unknown, key?: string) => {
    if (!n || typeof n !== "object") return;
    if ("handle" in (n as object) && (n as ConjuntoLeaf).handle === handle) {
      found = { conjunto: n as ConjuntoLeaf, nivel: (key as Nivel) ?? "equilibrada" };
      return;
    }
    Object.entries(n as Record<string, unknown>).forEach(([k, v]) => walk(v, k));
  };
  walk(guideMap);
  return found;
}

function pecasIguais(a: ProjetoPeca[], b: ProjetoPeca[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i].id !== b[i].id || a[i].qty !== b[i].qty) return false;
  }
  return true;
}

export default function GuiaRefinar() {
  const { handle } = useParams();
  const [params, setParams] = useSearchParams();
  const [quoteOpen, setQuoteOpen] = useState(false);
  const { addBundle, isLoading: cartLoading } = useCartStore();

  const found = useMemo(() => (handle ? findConjunto(handle) : null), [handle]);
  const acabamento = (params.get("acabamento") as Acabamento | null) ?? "moledo";
  const tipoRaw = params.get("tipo");
  const tipoVisual: TipoVisual = (tipoRaw === "lago-reduzido" ? "lago" : (tipoRaw as TipoVisual | null)) ?? "lago";
  const area = params.get("area");
  const nivelParam = (params.get("nivel") as Nivel | null) ?? found?.nivel ?? "equilibrada";

  // Busca produtos REAIS do Shopify (peças base + autorais)
  const { pecas: baseInicial, autorais, isLoading } = useGuideProducts(nivelParam, tipoVisual, handle, acabamentoMeta[acabamento].label);

  const [pecas, setPecas] = useState<ProjetoPeca[]>([]);
  const [extras, setExtras] = useState<ProjetoExtra[]>([]);
  const [showAcab, setShowAcab] = useState(false);
  const [modalItem, setModalItem] = useState<AutoralItem | null>(null);
  const [modalIndex, setModalIndex] = useState(0);
  const stickySentinelRef = useRef<HTMLDivElement | null>(null);

  // Sincroniza peças base sempre que o catálogo Shopify recarrega
  useEffect(() => {
    setPecas(baseInicial);
  }, [baseInicial]);

  useEffect(() => {
    const updateStickyTop = () => {
      const top = stickySentinelRef.current?.getBoundingClientRect().bottom ?? 0;
      document.documentElement.style.setProperty("--guide-sticky-top", `${Math.max(0, top)}px`);
    };

    updateStickyTop();
    window.addEventListener("scroll", updateStickyTop, { passive: true });
    window.addEventListener("resize", updateStickyTop);

    return () => {
      window.removeEventListener("scroll", updateStickyTop);
      window.removeEventListener("resize", updateStickyTop);
      document.documentElement.style.removeProperty("--guide-sticky-top");
    };
  }, []);

  const isCustomizado = pecas.length > 0 && !pecasIguais(pecas, baseInicial);

  if (!found) {
    return <Navigate to="/guia-de-composicao" replace />;
  }
  const { conjunto } = found;
  const tipoMeta = tipoVisualMap[tipoVisual];
  const tamanhoId = area ? m2ToTamanhoId(tipoMeta.tipo, Number(area)) : null;

  const onQty = (id: string, qty: number) => {
    setPecas((prev) =>
      qty <= 0 ? prev.filter((p) => p.id !== id) : prev.map((p) => (p.id === id ? { ...p, qty } : p))
    );
  };
  const onRemove = (id: string) => setPecas((prev) => prev.filter((p) => p.id !== id));

  const isExtraSelected = (id: string) => extras.some((e) => e.id === id);
  const getExtraQty = (id: string) => extras.find((e) => e.id === id)?.qty ?? 0;
  const toggleExtra = (id: string) => {
    setExtras((prev) =>
      prev.some((e) => e.id === id)
        ? prev.filter((e) => e.id !== id)
        : [...prev, autoralToExtra(autorais.find((a) => a.id === id)!)]
    );
  };
  const setExtraQty = (id: string, qty: number) => {
    if (qty <= 0) {
      setExtras((prev) => prev.filter((e) => e.id !== id));
      return;
    }
    setExtras((prev) => {
      if (prev.some((e) => e.id === id)) {
        return prev.map((e) => (e.id === id ? { ...e, qty } : e));
      }
      const item = autorais.find((a) => a.id === id);
      return item ? [...prev, { ...autoralToExtra(item), qty }] : prev;
    });
  };

  const setAcabamento = (a: Acabamento) => {
    const next = new URLSearchParams(params);
    next.set("acabamento", a);
    setParams(next, { replace: true });
    setShowAcab(false);
  };

  const ctx = { tipoVisual, area: area ? Number(area) : undefined, acabamento };
  const backToCaminhos = `/guia-de-composicao/composicoes?${buildContextQuery(ctx)}`;

  const onBaixarComposicao = () => {
    setQuoteOpen(true);
  };

  // Mapeia peças + extras do guia para o shape de CartItem usado em submitQuoteLead/PDF
  const quoteItems: CartItem[] = useMemo(() => {
    const acabLabel = acabamentoMeta[acabamento].label;
    const toItem = (
      it: {
        id: string;
        nome: string;
        codigo: string;
        preco: number;
        qty: number;
        imageUrl?: string;
        productHandle?: string;
        variantId?: string;
        variantTitle?: string;
        wooParentProductId?: number;
        wooVariationId?: number | null;
        wooKind?: "simple" | "variation" | "bundle";
        wooAttributes?: Array<{ slug: string; value: string }>;
      },
    ): CartItem => ({
      productHandle: it.productHandle || it.codigo || it.id,
      productTitle: it.nome,
      productImage: it.imageUrl ?? null,
      variantId: it.variantId || it.id,
      variantTitle: it.variantTitle || acabLabel,
      price: { amount: String(it.preco || 0), currencyCode: "BRL" },
      quantity: it.qty,
      selectedOptions: [{ name: "Acabamento", value: acabLabel }],
      wooParentProductId: it.wooParentProductId,
      wooVariationId: it.wooVariationId ?? null,
      wooKind: it.wooKind,
      wooAttributes: it.wooAttributes ?? [],
      conjuntoRef: handle,
    });
    return [...pecas.map(toItem), ...extras.map(toItem)];
  }, [pecas, extras, acabamento, handle]);

  const quoteSubtotal = quoteItems.reduce(
    (s, i) => s + parseFloat(i.price.amount) * i.quantity,
    0,
  );

  const projetoContext = {
    conjuntoNome: found?.conjunto.nome,
    acabamento: acabamentoMeta[acabamento].label,
    tipoVisual: tipoVisualMap[tipoVisual].label,
    areaM2: area ? Number(area) : undefined,
    modo: (isCustomizado ? "consulta" : "curado") as "consulta" | "curado",
  };

  const whatsHref = whatsappConsultor(tipoMeta.tipo, conjunto.nome);

  const onFinalizarCompra = async () => {
    const purchasable = quoteItems.filter((item) => item.variantId.startsWith("gid://"));
    const baseContext = {
      handle,
      conjunto: found?.conjunto.nome,
      itemsTotal: quoteItems.length,
      purchasable: purchasable.length,
      subtotal: quoteSubtotal,
      acabamento,
      tipoVisual,
    };
    if (purchasable.length === 0) {
      void reportError({
        source: "refinar.finalizar-compra",
        severity: "warn",
        message: "Nenhuma peça comprável (variantId Shopify ausente)",
        context: baseContext,
      });
      toast.error("Nenhuma peça desta composição está disponível para compra direta. Use Baixar composição para receber o orçamento.");
      return;
    }
    const dropped = quoteItems.length - purchasable.length;
    try {
      addBundle(purchasable);
      const { submitCheckoutHandoff } = await import("@/lib/woo-checkout");
      const result = submitCheckoutHandoff(purchasable);
      if (result.submitted === 0) {
        void reportError({
          source: "refinar.finalizar-compra",
          message: "Nenhuma linha enviada ao hand-off",
          context: { ...baseContext, dropped },
        });
        toast.error("Não foi possível abrir o checkout. Tente novamente.");
        return;
      }
      if (result.skipped > 0) {
        toast.message(`${result.skipped} peça(s) sem ID Woo foram retiradas do checkout.`);
      }
      if (dropped > 0) {
        toast.message(`${dropped} peça(s) sob consulta foram retiradas do checkout. Solicite o orçamento separadamente para incluí-las.`);
      }
      // navegação top-level já foi disparada por form.submit().
    } catch (e) {
      void reportError({
        source: "refinar.finalizar-compra",
        message: "addBundle/checkout falhou",
        error: e,
        context: { ...baseContext, dropped },
      });
      toast.error("Erro ao montar carrinho. Tente novamente.");
    }
  };

  return (
    <div className="min-h-screen surface-ivory relative">
      <GuideHeader step={3} breadcrumb={{ label: "Voltar · Três caminhos", to: backToCaminhos }} />
      {area && (
        <ContextoChips tipo={tipoVisual} area={Number(area)} acabamento={acabamento} />
      )}
      <div ref={stickySentinelRef} aria-hidden="true" className="h-0" />

      <main className="container-western pt-12 md:pt-16 pb-32 lg:pb-24 relative">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-10 lg:gap-16 items-start">
          <div className="min-w-0">
            {/* Cabeçalho */}
            <Reveal variant="fade-up" duration={700} delay={120}>
              <div className="flex items-start justify-between gap-6">
                <div className="min-w-0">
                  <p className="text-eyebrow mb-4">Etapa 03 · Composição base</p>
                  <h1 className="display-xl text-western-green-deep">{conjunto.nome}</h1>
                  <div className="w-12 h-px bg-western-gold mt-6 mb-6" />

                  <div className="flex flex-wrap gap-2">
                    <Tag>{tipoMeta.label}</Tag>
                    {tamanhoId && tamanhoId !== "consultor" && (
                      <Tag>{faixaArea[tipoVisual][tamanhoId]}</Tag>
                    )}
                    <Tag>{nivelLabelMap[nivelParam]}</Tag>
                    <Tag>{acabamentoMeta[acabamento].label}</Tag>
                  </div>

                  <p className="text-body mt-6 max-w-[62ch]">
                    O conjunto se ajusta a você.
                    {conjunto.subtitulo ? ` ${conjunto.subtitulo}.` : ""}
                  </p>
                </div>

                <Link
                  to={backToCaminhos}
                  className="hidden md:inline-flex tap-target items-center gap-2 flex-shrink-0 font-sans text-[14px] font-semibold tracking-[0.06em] text-western-stone-warm hover:text-western-green-deep transition-colors"
                >
                  <ExternalLink className="h-4 w-4" aria-hidden /> Trocar de composição
                </Link>
              </div>
            </Reveal>

            <div className="mt-12">
              <SectionDivider />
            </div>

            {/* Aviso sob consulta */}
            {isCustomizado && (
              <div className="mt-10 rounded-[10px] border border-western-gold/40 bg-western-gold/[0.08] p-5 md:p-6">
                <p className="text-eyebrow inline-flex items-center gap-2 mb-2">
                  <Info className="h-4 w-4" aria-hidden /> Projeto autoral · sob consulta
                </p>
                <p className="text-body max-w-[62ch]">
                  Você está ajustando a composição original. Projetos personalizados seguem para nossa
                  equipe e voltam com uma proposta em até 3 dias úteis.
                </p>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 mt-5">
                  <button
                    type="button"
                    onClick={() => setPecas(baseInicial)}
                    className="btn-outline-forest w-full sm:w-auto"
                  >
                    <RotateCcw className="h-4 w-4" aria-hidden /> Voltar à composição original
                  </button>
                  <a
                    href={whatsHref}
                    target="_blank"
                    rel="noreferrer"
                    className="tap-target inline-flex items-center justify-center gap-2 px-2 font-sans text-[16px] font-semibold text-western-green-deep hover:text-western-bronze transition-colors"
                  >
                    <MessageCircle className="h-4 w-4" aria-hidden /> Falar com consultor
                  </a>
                </div>
              </div>
            )}

            {/* Peças */}
            <section className={`mt-12 ${STICKY_STACK}`}>
              <p className="text-eyebrow mb-3">Peças desta composição</p>
              <h2 className="display-lg text-western-green-deep">Ajuste o conjunto peça por peça.</h2>
              <div className="mt-8">
                {isLoading && pecas.length === 0 ? (
                  <SkeletonRows count={4} />
                ) : (
                  pecas.map((p, i) => (
                    <PecaRow key={p.id} peca={p} index={i} onQty={onQty} onRemove={onRemove} />
                  ))
                )}
              </div>
            </section>

            <div className="mt-14">
              <SectionDivider />
            </div>

            {/* Autorais */}
            <section className={`mt-12 ${STICKY_STACK}`}>
              <p className="text-eyebrow mb-3">Itens autorais</p>
              <h2 className="display-lg text-western-green-deep">Peças que somam ao projeto.</h2>
              <p className="text-body mt-4 max-w-[62ch]">
                Vendidas avulsas, viajam no mesmo pedido com frete otimizado. Toque para ver detalhes.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 mt-8">
                {isLoading && autorais.length === 0 ? (
                  <SkeletonCards count={4} />
                ) : (
                  autorais.map((a, i) => (
                    <AutoralCard
                      key={a.id}
                      item={a}
                      index={i}
                      selected={isExtraSelected(a.id)}
                      qty={getExtraQty(a.id)}
                      onToggle={() => toggleExtra(a.id)}
                      onSetQty={(q) => setExtraQty(a.id, q)}
                      onOpen={() => { setModalItem(a); setModalIndex(i); }}
                    />
                  ))
                )}
              </div>
            </section>

            <div className="mt-14">
              <SectionDivider />
            </div>

            {/* Trocar acabamento */}
            <section className={`mt-12 ${STICKY_STACK}`}>
              <p className="text-eyebrow mb-4">
                Acabamento atual · {acabamentoMeta[acabamento].label}
              </p>
              <button
                type="button"
                onClick={() => setShowAcab((v) => !v)}
                aria-expanded={showAcab}
                className="btn-outline-forest w-full md:w-auto"
              >
                {showAcab ? (
                  <ChevronUp className="h-4 w-4" aria-hidden />
                ) : (
                  <ChevronDown className="h-4 w-4" aria-hidden />
                )}
                {showAcab ? "Fechar" : "Trocar acabamento desta composição"}
              </button>

              {showAcab && (
                <div className="mt-6 max-w-2xl">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {(Object.keys(acabamentoMeta) as Acabamento[]).map((a, i) => (
                      <AcabamentoCard
                        key={a}
                        value={a}
                        index={i + 1}
                        selected={acabamento === a}
                        onSelect={setAcabamento}
                      />
                    ))}
                  </div>
                  <p className="text-meta mt-4">Trocar o acabamento recalcula o projeto inteiro.</p>
                </div>
              )}
            </section>
          </div>

          <ProjetoSidebar
            conjunto={conjunto}
            pecas={pecas}
            extras={extras}
            acabamento={acabamento}
            isCustomizado={isCustomizado}
            onResetBase={() => setPecas(baseInicial)}
            onFinalizar={onBaixarComposicao}
            onFinalizarCompra={onFinalizarCompra}
            checkoutLoading={cartLoading}
            projetoMeta={{
              conjuntoHandle: handle,
              conjuntoNome: found?.conjunto.nome,
              tipoVisual: tipoVisualMap[tipoVisual].label,
              areaM2: area ? Number(area) : undefined,
              nivel: nivelParam,
            }}
          />
        </div>
      </main>

      <ProjetosWesternBand />

      <AutoralProductModal
        item={modalItem}
        index={modalIndex}
        selected={modalItem ? isExtraSelected(modalItem.id) : false}
        qty={modalItem ? getExtraQty(modalItem.id) : 0}
        onClose={() => setModalItem(null)}
        onToggle={() => modalItem && toggleExtra(modalItem.id)}
        onSetQty={(q) => modalItem && setExtraQty(modalItem.id, q)}
      />

      <QuoteLeadModal
        open={quoteOpen}
        onOpenChange={setQuoteOpen}
        items={quoteItems}
        subtotal={quoteSubtotal}
        currency="BRL"
        origem="guia_composicao"
        projetoContext={projetoContext}
        ctaLabel={isCustomizado ? "Solicitar orçamento sob consulta" : "Liberar PDF da composição"}
        title={isCustomizado ? "Solicitar orçamento sob consulta" : "Baixar composição do projeto"}
        payloadExtra={{
          conjuntoHandle: handle,
          conjuntoNome: found?.conjunto.nome,
          acabamento,
          tipoVisual,
          areaM2: area ? Number(area) : undefined,
          isCustomizado,
        }}
      />

      <img
        src={brasao}
        alt=""
        aria-hidden
        className="hidden md:block fixed bottom-6 right-6 w-20 opacity-[0.04] pointer-events-none select-none z-0"
      />
    </div>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-western-border-strong px-3.5 py-1.5 font-sans text-[14px] font-semibold text-western-green-deep">
      {children}
    </span>
  );
}

function SkeletonRows({ count }: { count: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex items-start gap-5 py-6 border-b border-western-border-soft first:border-t animate-pulse"
        >
          <div className="w-24 h-24 rounded-[10px] bg-western-paper" />
          <div className="flex-1 space-y-3">
            <div className="h-5 w-2/3 rounded-[6px] bg-western-paper" />
            <div className="h-4 w-1/3 rounded-[6px] bg-western-paper" />
            <div className="h-5 w-1/4 rounded-[6px] bg-western-paper" />
          </div>
        </div>
      ))}
    </>
  );
}

function SkeletonCards({ count }: { count: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-[10px] border border-western-border-soft bg-white overflow-hidden animate-pulse"
        >
          <div className="aspect-square bg-western-paper" />
          <div className="p-4 space-y-3">
            <div className="h-5 w-2/3 rounded-[6px] bg-western-paper" />
            <div className="h-4 w-1/3 rounded-[6px] bg-western-paper" />
          </div>
        </div>
      ))}
    </>
  );
}
