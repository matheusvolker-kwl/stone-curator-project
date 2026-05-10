import { useEffect, useMemo, useRef, useState } from "react";
import { Link, Navigate, useParams, useSearchParams } from "react-router-dom";
import { ChevronDown, ChevronUp, ExternalLink, Info, RotateCcw, MessageCircle } from "lucide-react";
import QuoteLeadModal from "@/components/quote/QuoteLeadModal";
import type { CartItem } from "@/stores/cartStore";
import GuideHeader from "@/components/guide-v2/GuideHeader";
import PecaRow from "@/components/guide-v2/PecaRow";
import AutoralCard from "@/components/guide-v2/AutoralCard";
import AutoralProductModal from "@/components/guide-v2/AutoralProductModal";
import AcabamentoCard from "@/components/guide-v2/AcabamentoCard";
import ProjetoSidebar from "@/components/guide-v2/ProjetoSidebar";
import ContextoChips from "@/components/guide-v2/ContextoChips";
import SectionDivider from "@/components/guide-v2/SectionDivider";
import Reveal from "@/components/shared/Reveal";
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
  tamanhoLabels,
  whatsappConsultor,
  type ConjuntoLeaf,
  type Nivel,
} from "@/data/guideMap";

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

  const found = useMemo(() => (handle ? findConjunto(handle) : null), [handle]);
  const acabamento = (params.get("acabamento") as Acabamento | null) ?? "moledo";
  const tipoRaw = params.get("tipo");
  const tipoVisual: TipoVisual = (tipoRaw === "lago-reduzido" ? "lago" : (tipoRaw as TipoVisual | null)) ?? "lago";
  const area = params.get("area");
  const nivelParam = (params.get("nivel") as Nivel | null) ?? found?.nivel ?? "equilibrada";

  // Busca produtos REAIS do Shopify (peças base + autorais)
  const { pecas: baseInicial, autorais, isLoading } = useGuideProducts(nivelParam, tipoVisual);

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

  const onFinalizar = () => {
    setQuoteOpen(true);
  };

  // Mapeia peças + extras do guia para o shape de CartItem usado em submitQuoteLead/PDF
  const quoteItems: CartItem[] = useMemo(() => {
    const acabLabel = acabamentoMeta[acabamento].label;
    const toItem = (
      it: { id: string; nome: string; codigo: string; preco: number; qty: number; imageUrl?: string },
    ): CartItem => ({
      lineId: null,
      productHandle: it.codigo || it.id,
      productTitle: it.nome,
      productImage: it.imageUrl ?? null,
      variantId: it.id,
      variantTitle: acabLabel,
      price: { amount: String(it.preco || 0), currencyCode: "BRL" },
      quantity: it.qty,
      selectedOptions: [{ name: "Acabamento", value: acabLabel }],
    });
    return [...pecas.map(toItem), ...extras.map(toItem)];
  }, [pecas, extras, acabamento]);

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

  return (
    <div className="min-h-screen surface-ivory relative">
      <GuideHeader breadcrumb={{ label: "Voltar · Três caminhos", to: backToCaminhos }} />
      {area && (
        <ContextoChips tipo={tipoVisual} area={Number(area)} acabamento={acabamento} />
      )}
      <div ref={stickySentinelRef} aria-hidden="true" className="h-0" />
      <main className="container-western pt-12 md:pt-16 pb-32 lg:pb-20 relative">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-10 lg:gap-16 items-start">
          <div className="min-w-0">
            {/* Cabeçalho */}
            <Reveal variant="fade-up" duration={750}>
              <p className="font-display italic text-xl md:text-2xl text-western-green-deep mb-5">
                O conjunto se ajusta a você.
              </p>
            </Reveal>
            <Reveal variant="fade-up" duration={700} delay={120}>
              <div className="flex items-start justify-between gap-6">
                <div>
                  <p className="eyebrow-bar mb-4">Etapa 03 · Composição base</p>
                  <h1 className="font-display text-3xl md:text-[44px] text-western-green-deep leading-[1.05]">
                    {conjunto.nome}
                  </h1>
                  <div className="w-12 h-px bg-western-gold mt-5 mb-5" />
                  <div className="flex flex-wrap gap-2">
                    <Tag>{tipoMeta.label}</Tag>
                    {tamanhoId && tamanhoId !== "consultor" && (
                      <Tag>{tamanhoLabels[tamanhoId]}</Tag>
                    )}
                    <Tag>{nivelLabelMap[nivelParam]}</Tag>
                    <Tag>{acabamentoMeta[acabamento].label}</Tag>
                  </div>
                  <p className="font-display italic text-lg md:text-xl text-western-stone-warm leading-relaxed mt-6 max-w-[620px]">
                    {conjunto.subtitulo}. Cascata central com pedras de apoio que constroem volume sem
                    sobrecarregar o espaço.
                  </p>
                </div>
                <Link
                  to={backToCaminhos}
                  className="hidden md:inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-western-stone-warm hover:text-western-green-deep flex-shrink-0"
                >
                  <ExternalLink className="h-3 w-3" /> Trocar de composição
                </Link>
              </div>
            </Reveal>

            <div className="mt-14"><SectionDivider /></div>

            {/* Aviso sob consulta */}
            {isCustomizado && (
              <div className="mt-10 border-l-2 border-western-gold pl-5 py-4 bg-western-gold/[0.06]">
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-western-gold inline-flex items-center gap-2 mb-2">
                  <Info className="h-3 w-3" /> Projeto autoral · sob consulta
                </p>
                <p className="font-display italic text-[15px] text-western-stone-warm leading-relaxed max-w-[620px]">
                  Você está ajustando a composição original. O SketchUp é entregue apenas para os conjuntos
                  curados — projetos personalizados seguem para nossa equipe e voltam com prévia em até 48h.
                </p>
                <div className="flex flex-wrap items-center gap-3 mt-5">
                  <button
                    type="button"
                    onClick={() => setPecas(baseInicial)}
                    className="inline-flex items-center gap-2 h-10 px-4 border border-western-green-deep text-western-green-deep font-mono text-[10px] uppercase tracking-[0.22em] hover:bg-western-green-deep hover:text-western-cream transition-colors"
                  >
                    <RotateCcw className="h-3 w-3" /> Voltar à composição original
                  </button>
                  <a
                    href={whatsHref}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 h-10 px-4 font-mono text-[10px] uppercase tracking-[0.22em] text-western-stone-warm hover:text-western-green-deep transition-colors"
                  >
                    <MessageCircle className="h-3 w-3" /> Falar com consultor →
                  </a>
                </div>
              </div>
            )}

            {/* Peças */}
            <section className="mt-10">
              <p className="eyebrow-bar mb-3">Peças desta composição</p>
              <h2 className="font-display text-2xl md:text-[30px] text-western-green-deep leading-tight">
                Ajuste o conjunto peça por peça.
              </h2>
              <div className="mt-6">
                {isLoading && pecas.length === 0 ? (
                  <SkeletonRows count={4} />
                ) : (
                  pecas.map((p, i) => (
                    <PecaRow key={p.id} peca={p} index={i} onQty={onQty} onRemove={onRemove} />
                  ))
                )}
              </div>
            </section>

            <div className="mt-14"><SectionDivider /></div>

            {/* Autorais */}
            <section className="mt-10">
              <p className="eyebrow-bar mb-3">Itens autorais</p>
              <h2 className="font-display text-2xl md:text-[30px] text-western-green-deep leading-tight">
                Peças que somam ao projeto.
              </h2>
              <p className="font-display italic text-[16px] text-western-stone-warm max-w-[620px] mt-3 leading-relaxed">
                Vendidas avulsas, viajam no mesmo pedido com frete otimizado. Clique para ver detalhes.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4 mt-8">
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

            <div className="mt-14"><SectionDivider /></div>

            {/* Trocar acabamento */}
            <section className="mt-10">
              <p className="eyebrow-bar mb-3">
                Acabamento atual · {acabamentoMeta[acabamento].label}
              </p>
              <button
                type="button"
                onClick={() => setShowAcab((v) => !v)}
                className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] text-western-green-deep hover:text-western-gold transition-colors"
              >
                {showAcab ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
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
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-western-stone-warm/70 mt-4">
                    Trocar o acabamento recalcula o projeto inteiro.
                  </p>
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
            onFinalizar={onFinalizar}
          />
        </div>
      </main>

      <AutoralProductModal
        item={modalItem}
        index={modalIndex}
        selected={modalItem ? isExtraSelected(modalItem.id) : false}
        qty={modalItem ? getExtraQty(modalItem.id) : 0}
        onClose={() => setModalItem(null)}
        onToggle={() => modalItem && toggleExtra(modalItem.id)}
        onSetQty={(q) => modalItem && setExtraQty(modalItem.id, q)}
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
    <span className="font-mono text-[10px] uppercase tracking-[0.2em] px-3 py-1.5 border border-western-stone-warm/25 text-western-green-deep">
      {children}
    </span>
  );
}

function SkeletonRows({ count }: { count: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-start gap-5 py-6 border-b border-western-stone-warm/15 first:border-t animate-pulse">
          <div className="w-24 h-24 bg-western-paper" />
          <div className="flex-1 space-y-2.5">
            <div className="h-5 w-2/3 bg-western-paper" />
            <div className="h-3 w-1/3 bg-western-paper" />
            <div className="h-4 w-1/4 bg-western-paper" />
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
        <div key={i} className="bg-white animate-pulse">
          <div className="aspect-[4/3] bg-western-paper" />
          <div className="p-6 space-y-3">
            <div className="h-5 w-2/3 bg-western-paper" />
            <div className="h-3 w-1/3 bg-western-paper" />
            <div className="h-5 w-1/4 bg-western-paper" />
            <div className="h-12 w-full bg-western-paper mt-4" />
          </div>
        </div>
      ))}
    </>
  );
}
