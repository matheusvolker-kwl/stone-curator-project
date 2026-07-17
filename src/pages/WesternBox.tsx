import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { usePublishStickyBarHeight } from "@/hooks/usePublishStickyBarHeight";
import {
  Check,
  Package,
  Truck,
  FileText,
  ShoppingBag,
  ChevronRight,
  Minus,
  Plus,
  Lock,
  MessageCircle,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Seo from "@/components/seo/Seo";
import Reveal from "@/components/shared/Reveal";
import { submitCheckoutHandoff } from "@/lib/woo-checkout";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { BUSINESS } from "@/config/business";

import hero from "@/assets/western-box/hero.webp";
import boxFechada from "@/assets/western-box/box-fechada.webp";
import boxAberta from "@/assets/western-box/box-aberta.webp";
import lifestyle from "@/assets/western-box/lifestyle.webp";
import catalogo from "@/assets/western-box/catalogo.webp";
import texQuartzo from "@/assets/western-box/tex-quartzo.webp";
import texArenito from "@/assets/western-box/tex-arenito.webp";
import texMoledo from "@/assets/western-box/tex-moledo.webp";
import texGranito from "@/assets/western-box/tex-granito.webp";
import pb3Quartzo from "@/assets/western-box/pb3-quartzo.webp";
import pb3Arenito from "@/assets/western-box/pb3-arenito.webp";
import pb3Moledo from "@/assets/western-box/pb3-moledo.webp";
import pb3Granito from "@/assets/western-box/pb3-granito.webp";

// =============================================================================
// CONFIG — mesma constante do anterior (Woo product id real)
// =============================================================================
const WESTERN_BOX_WOO_PRODUCT_ID: number | null = 1559;
const PRICE_LABEL = "R$ 149,90";

const WHATSAPP_URL = `https://wa.me/${BUSINESS.whatsappFabrica}`;

const GALLERY = [
  { src: boxFechada, alt: "Western Box fechada com selo dourado" },
  { src: boxAberta, alt: "Western Box aberta com as quatro amostras e o catálogo" },
  { src: lifestyle, alt: "Western Box em uso sobre a mesa de trabalho" },
  { src: catalogo, alt: "Catálogo oficial Western Pools" },
];

const ACABAMENTOS = [
  {
    id: "quartzo",
    nome: "Quartzo",
    descricao: "Elegância contemporânea, textura refinada e visual sofisticado.",
    texture: texQuartzo,
    pb3: pb3Quartzo,
  },
  {
    id: "arenito",
    nome: "Arenito",
    descricao: "Tons naturais e acolhedores, perfeitos para projetos integrados à natureza.",
    texture: texArenito,
    pb3: pb3Arenito,
  },
  {
    id: "moledo",
    nome: "Moledo",
    descricao: "Textura marcante, personalidade e aspecto orgânico.",
    texture: texMoledo,
    pb3: pb3Moledo,
  },
  {
    id: "granito",
    nome: "Granito",
    descricao: "Versatilidade, equilíbrio e um acabamento atemporal.",
    texture: texGranito,
    pb3: pb3Granito,
  },
] as const;

const INCLUI = [
  "Amostra Quartzo",
  "Amostra Arenito",
  "Amostra Moledo",
  "Amostra Granito",
  "Catálogo oficial Western Pools",
  "Embalagem premium exclusiva",
];

const FERRAMENTA = [
  "Comparar todos os acabamentos lado a lado",
  "Avaliar textura, relevo e tonalidade reais",
  "Visualizar os materiais sob a iluminação do ambiente onde serão instalados",
  "Apresentar opções aos seus clientes com muito mais segurança",
  "Definir o acabamento ideal antes de investir no projeto",
];

const PARA_QUEM = [
  "Arquitetos",
  "Paisagistas",
  "Designers de exteriores",
  "Piscineiros",
  "Revendedores",
  "Clientes finais",
];

// ---------------------------------------------------------------------------
// BUY ACTION — única, compartilhada por TODOS os pontos de compra
// ---------------------------------------------------------------------------
function useBuyAction() {
  const disabled = WESTERN_BOX_WOO_PRODUCT_ID === null;
  const buy = (qty: number = 1) => {
    if (disabled || WESTERN_BOX_WOO_PRODUCT_ID === null) return;
    submitCheckoutHandoff([
      {
        id: `wbox-${WESTERN_BOX_WOO_PRODUCT_ID}`,
        title: "Western Box",
        handle: "western-box",
        variantId: String(WESTERN_BOX_WOO_PRODUCT_ID),
        price: "149.90",
        quantity: Math.max(1, qty | 0),
        wooParentProductId: WESTERN_BOX_WOO_PRODUCT_ID,
        wooVariationId: null,
        wooAttributes: [],
        wooKind: "simple",
      } as never,
    ]);
    toast.success("Redirecionando para o checkout…");
  };
  return { disabled, buy };
}

// ---------------------------------------------------------------------------
// STICKY BUY BAR — barra fixa de rodapé (V3): CTA verde, full-width no mobile
// ---------------------------------------------------------------------------
function StickyBuyBar({ anchorRefs }: { anchorRefs: React.RefObject<HTMLElement>[] }) {
  const { disabled, buy } = useBuyAction();
  const [visible, setVisible] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);
  // Publica a altura da barra p/ o FAB do WhatsApp subir acima do CTA (não cobrir).
  usePublishStickyBarHeight(barRef, visible);

  // A sticky bar é o ponto de compra "de reserva": só aparece quando NENHUM
  // CTA real (topo, faixa do meio, CTA final) está na viewport. Assim nunca
  // convivem dois "Adicionar ao carrinho" sólidos na mesma tela.
  useEffect(() => {
    const els = anchorRefs.map((r) => r.current).filter(Boolean) as HTMLElement[];
    if (els.length === 0) return;
    const intersecting = new Set<Element>();
    const obs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) intersecting.add(entry.target);
          else intersecting.delete(entry.target);
        }
        setVisible(intersecting.size === 0);
      },
      { threshold: 0 },
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [anchorRefs]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 90, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 90, opacity: 0 }}
          transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
          ref={barRef}
          className="fixed inset-x-0 bottom-0 z-40 border-t border-western-border-soft bg-western-paper shadow-[0_-10px_30px_-16px_rgba(35,28,20,0.28)]"
        >
          <div className="container-western py-3">
            <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
              <div className="flex items-baseline gap-3">
                <span className="font-sans text-[22px] font-bold tabular-nums leading-none text-western-green-deep">
                  {PRICE_LABEL}
                </span>
                <span className="text-meta">Cashback 100% · sem cadastro</span>
              </div>
              <button
                type="button"
                onClick={() => buy(1)}
                disabled={disabled}
                className="btn-primary tap-target w-full sm:w-auto sm:min-w-[280px]"
              >
                <ShoppingBag className="h-5 w-5" aria-hidden />
                {disabled ? "Em breve" : "Adicionar ao carrinho"}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ---------------------------------------------------------------------------
// QTY STEPPER — 52px de altura, bordas visíveis (público 40+)
// ---------------------------------------------------------------------------
function QtyStepper({ qty, setQty }: { qty: number; setQty: (n: number) => void }) {
  return (
    <div className="inline-flex items-center rounded-lg border-[1.5px] border-western-border-strong bg-white">
      <button
        type="button"
        onClick={() => setQty(Math.max(1, qty - 1))}
        className="flex h-control w-[52px] items-center justify-center rounded-l-[9px] text-western-green-deep transition-colors hover:bg-western-paper"
        aria-label="Diminuir quantidade"
      >
        <Minus className="h-5 w-5" />
      </button>
      <span className="min-w-[3ch] px-2 text-center font-sans text-[18px] font-semibold tabular-nums text-western-green-deep">
        {qty}
      </span>
      <button
        type="button"
        onClick={() => setQty(qty + 1)}
        className="flex h-control w-[52px] items-center justify-center rounded-r-[9px] text-western-green-deep transition-colors hover:bg-western-paper"
        aria-label="Aumentar quantidade"
      >
        <Plus className="h-5 w-5" />
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// PRODUCT TOP — galeria + painel de compra (o CTA é o herói da página)
// ---------------------------------------------------------------------------
function ProductTop({ topBuyRef }: { topBuyRef: React.RefObject<HTMLElement> }) {
  const { disabled, buy } = useBuyAction();
  const [active, setActive] = useState(0);
  const [qty, setQty] = useState(1);

  return (
    <section className="surface-paper pb-16 pt-6 md:pb-24 md:pt-10" ref={topBuyRef}>
      <div className="container-western">
        {/* Breadcrumb */}
        <nav
          aria-label="breadcrumb"
          className="mb-6 flex items-center gap-2 text-[14px] text-western-stone-warm md:mb-10"
        >
          <Link
            to="/"
            className="py-2 text-western-stone-warm transition-colors hover:text-western-green-deep hover:underline"
          >
            Início
          </Link>
          <ChevronRight className="h-4 w-4 text-western-border-strong" aria-hidden />
          <span className="font-semibold text-western-green-deep">Amostras</span>
        </nav>

        <div className="grid items-start gap-10 md:grid-cols-12 md:gap-14">
          {/* GALERIA */}
          <div className="md:col-span-7">
            {/* Desktop: imagem grande + miniaturas */}
            <div className="hidden md:grid md:grid-cols-[92px_1fr] md:gap-4">
              <div className="flex flex-col gap-3">
                {GALLERY.map((g, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActive(i)}
                    onMouseEnter={() => setActive(i)}
                    className={cn(
                      "relative aspect-square overflow-hidden rounded-lg border bg-western-ivory transition-colors duration-200",
                      active === i
                        ? "border-[1.5px] border-western-green-deep"
                        : "border-western-border-soft hover:border-western-border-strong",
                    )}
                    aria-label={`Ver imagem ${i + 1}`}
                  >
                    <img
                      src={g.src}
                      alt=""
                      className="absolute inset-0 h-full w-full object-cover"
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>
              <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-western-border-soft bg-western-ivory">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={active}
                    src={GALLERY[active].src}
                    alt={GALLERY[active].alt}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.22, ease: "easeOut" }}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                </AnimatePresence>
              </div>
            </div>

            {/* Mobile: carrossel com scroll-snap */}
            <div className="-mx-6 md:hidden">
              <div className="scrollbar-hide flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth px-6">
                {GALLERY.map((g, i) => (
                  <div
                    key={i}
                    className="aspect-[4/5] w-[86%] shrink-0 snap-center overflow-hidden rounded-2xl border border-western-border-soft bg-western-ivory"
                  >
                    <img
                      src={g.src}
                      alt={g.alt}
                      className="h-full w-full object-cover"
                      loading={i === 0 ? "eager" : "lazy"}
                    />
                  </div>
                ))}
              </div>
              <p className="mt-3 px-6 text-meta">Arraste para ver todas as fotos</p>
            </div>
          </div>

          {/* PAINEL DE COMPRA */}
          <div className="md:col-span-5 md:sticky md:top-24">
            <p className="text-eyebrow">Amostras · Edição oficial</p>

            <div className="mt-4 flex flex-wrap gap-2">
              <span className="inline-flex items-center rounded-full bg-western-green-deep px-4 py-1.5 text-[14px] font-semibold text-western-cream">
                Aberta a todos
              </span>
              <span className="inline-flex items-center rounded-full border border-western-gold px-4 py-1.5 text-[14px] font-semibold text-western-bronze">
                Sem cadastro · sem mínimo
              </span>
            </div>

            <h1 className="display-xl mt-4 text-western-green-deep">Western Box</h1>
            <p className="display-md mt-2 text-western-bronze">Amostras + catálogo</p>

            <p className="text-body mt-5 max-w-md">
              Os quatro acabamentos Western em mãos, com o catálogo oficial. Veja, toque, compare e
              decida com convicção antes de especificar.
            </p>

            {/* Preço — aberto: a Western Box é o único item sem gate */}
            <div className="mt-8 border-b border-western-border-soft pb-8">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="text-price">{PRICE_LABEL}</span>
                <span className="text-meta">à vista · sem pedido mínimo</span>
              </div>
              <span className="mt-4 inline-flex items-center gap-2 rounded-full bg-western-green-deep px-4 py-2 text-[14px] font-semibold text-western-cream">
                <Check className="h-4 w-4 text-western-gold-soft" aria-hidden />
                Cashback 100% no 1º pedido
              </span>
            </div>

            {/* Quantidade + CTA — o CTA é o herói */}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-stretch">
              <QtyStepper qty={qty} setQty={setQty} />
              <button
                type="button"
                onClick={() => buy(qty)}
                disabled={disabled}
                className="btn-primary tap-target w-full sm:flex-1"
              >
                <ShoppingBag className="h-5 w-5" aria-hidden />
                {disabled ? "Em breve" : "Adicionar ao carrinho"}
              </button>
            </div>

            {/* Sinais de confiança */}
            <ul className="mt-8 space-y-3">
              <li className="text-spec flex items-center gap-3">
                <Truck className="h-5 w-5 shrink-0 text-western-bronze" aria-hidden />
                Envio para todo o Brasil em 5 a 7 dias úteis
              </li>
              <li className="text-spec flex items-center gap-3">
                <Lock className="h-5 w-5 shrink-0 text-western-bronze" aria-hidden />
                Pagamento e ambiente 100% seguros
              </li>
              <li className="text-spec flex items-center gap-3">
                <Package className="h-5 w-5 shrink-0 text-western-bronze" aria-hidden />
                Embalagem premium · 4 amostras + catálogo
              </li>
              <li className="text-spec flex items-center gap-3">
                <FileText className="h-5 w-5 shrink-0 text-western-bronze" aria-hidden />
                Compra segura · ateliê brasileiro desde {BUSINESS.fundadaEm}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// MID BUY STRIP — segundo ponto de compra (compacto, depois do desejo)
// ---------------------------------------------------------------------------
function MidBuyStrip({ sectionRef }: { sectionRef: React.Ref<HTMLElement> }) {
  const { disabled, buy } = useBuyAction();
  return (
    <section ref={sectionRef} className="section-tight surface-ivory border-y border-western-border-soft">
      <div className="container-western">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between md:gap-10">
          <div className="flex items-center gap-5">
            <div className="aspect-square w-24 shrink-0 overflow-hidden rounded-lg border border-western-border-soft bg-western-paper md:w-32">
              <img src={boxFechada} alt="" className="h-full w-full object-cover" loading="lazy" />
            </div>
            <div className="min-w-0">
              <p className="text-eyebrow">Pronto para decidir?</p>
              <p className="display-md mt-2 text-western-green-deep">
                Western Box · <span className="tabular-nums">{PRICE_LABEL}</span>
              </p>
              <p className="text-meta mt-1">Com 100% de cashback no primeiro pedido</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => buy(1)}
            disabled={disabled}
            className="btn-primary tap-target w-full md:w-auto md:min-w-[280px]"
          >
            <ShoppingBag className="h-5 w-5" aria-hidden />
            {disabled ? "Em breve" : "Adicionar ao carrinho"}
          </button>
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------
export default function WesternBox() {
  const [acabamentoAtivo, setAcabamentoAtivo] = useState<(typeof ACABAMENTOS)[number]["id"]>("moledo");
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const ativo = ACABAMENTOS.find((a) => a.id === acabamentoAtivo)!;
  const topBuyRef = useRef<HTMLElement>(null);
  const midBuyRef = useRef<HTMLElement>(null);
  const finalCtaRef = useRef<HTMLElement>(null);
  // Todos os CTAs reais de compra: a sticky bar some quando qualquer um está visível.
  const anchorRefs = useMemo(
    () => [topBuyRef, midBuyRef, finalCtaRef],
    [],
  );
  const { disabled, buy } = useBuyAction();

  return (
    <>
      <Seo
        title="Western Box — Kit oficial de amostras Western Pools"
        description="Os quatro acabamentos Western em mãos, com catálogo oficial e cashback de 100%. Veja, toque, compare e decida antes do projeto."
        path="/western-box"
        ogType="product"
        image={hero}
      />

      <StickyBuyBar anchorRefs={anchorRefs} />

      {/* 1. TOPO DE PRODUTO — foto + compra */}
      <ProductTop topBuyRef={topBuyRef} />

      {/* 2. POR QUE EXISTE */}
      <section className="section surface-ivory">
        <div className="container-western">
          <Reveal variant="fade-up" duration={500}>
            <p className="text-eyebrow">Por que existe</p>
          </Reveal>
          <div className="display-xl mt-6 text-western-green-deep">
            {["Veja.", "Toque.", "Compare.", "Decida."].map((word, i) => (
              <Reveal
                key={word}
                variant="fade-up"
                delay={i * 90}
                duration={500}
                distance={18}
                as="span"
                className="mr-[0.3em] inline-block"
              >
                <span className={cn(i === 3 && "text-western-bronze")}>{word}</span>
              </Reveal>
            ))}
          </div>
          <Reveal variant="fade-up" delay={340} duration={500}>
            <p className="text-body mt-8 max-w-[60ch]">
              Conhecer um acabamento apenas pela tela nunca conta a história completa. A Western Box
              leva até você os quatro acabamentos, com o catálogo oficial, para que você analise
              textura, cor e detalhe exatamente como serão percebidos no seu projeto.
            </p>
          </Reveal>
        </div>
      </section>

      {/* 3. O QUE ACOMPANHA */}
      <section className="section surface-paper">
        <div className="container-western">
          <div className="grid items-center gap-10 md:grid-cols-12 md:gap-16">
            <div className="md:col-span-6">
              <div className="aspect-[4/5] overflow-hidden rounded-2xl border border-western-border-soft bg-western-ivory">
                <img
                  src={boxAberta}
                  alt="Western Box aberta exibindo as quatro amostras e o catálogo"
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
            </div>
            <div className="md:col-span-6">
              <Reveal variant="fade-up" duration={500}>
                <p className="text-eyebrow">O que acompanha</p>
              </Reveal>
              <Reveal variant="fade-up" delay={80} duration={500}>
                <h2 className="display-lg mt-4 text-western-green-deep">
                  Tudo para especificar com segurança.
                </h2>
              </Reveal>
              <ul className="mt-8">
                {INCLUI.map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-4 border-b border-western-border-soft py-4"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-western-green-deep">
                      <Check className="h-4 w-4 text-western-cream" aria-hidden />
                    </span>
                    <span className="font-sans text-[17px] font-semibold text-western-stone-dark">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 4. OS QUATRO ACABAMENTOS */}
      <section className="section surface-ivory">
        <div className="container-western">
          <div className="mb-10 max-w-2xl md:mb-14">
            <p className="text-eyebrow">Os quatro acabamentos</p>
            <h2 className="display-lg mt-4 text-western-green-deep">
              A assinatura Western, em quatro temperamentos.
            </h2>
          </div>

          <div className="grid items-start gap-8 md:grid-cols-12 md:gap-12">
            <div className="grid grid-cols-2 gap-4 md:col-span-7 md:gap-5">
              {ACABAMENTOS.map((a, i) => {
                const isActive = a.id === acabamentoAtivo;
                const hovered = hoveredCard === a.id;
                return (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => setAcabamentoAtivo(a.id)}
                    onMouseEnter={() => {
                      setHoveredCard(a.id);
                      setAcabamentoAtivo(a.id);
                    }}
                    onMouseLeave={() => setHoveredCard(null)}
                    aria-pressed={isActive}
                    className={cn(
                      "group w-full overflow-hidden rounded-2xl border bg-white text-left transition-colors duration-200",
                      isActive
                        ? "border-[1.5px] border-western-green-deep shadow-[0_18px_40px_-28px_rgba(35,28,20,0.45)]"
                        : "border-western-border-soft hover:border-western-border-strong",
                    )}
                  >
                    <div className="relative aspect-[4/5] overflow-hidden">
                      <img
                        src={a.texture}
                        alt={`Textura ${a.nome}`}
                        className={cn(
                          "absolute inset-0 h-full w-full object-cover transition-opacity duration-300",
                          hovered ? "opacity-0" : "opacity-100",
                        )}
                        loading="lazy"
                      />
                      <img
                        src={a.pb3}
                        alt={`Peça PB3 em ${a.nome}`}
                        className={cn(
                          "absolute inset-0 h-full w-full object-cover transition-opacity duration-300",
                          hovered ? "opacity-100" : "opacity-0",
                        )}
                        loading="lazy"
                      />
                    </div>
                    <div className="flex items-center justify-between gap-3 px-4 py-4">
                      <div className="min-w-0">
                        <p className="text-[14px] font-semibold uppercase tracking-[0.06em] text-western-bronze">
                          {String(i + 1).padStart(2, "0")} · {hovered ? "Em peça PB3" : "Textura"}
                        </p>
                        <p className="mt-1 font-sans text-[20px] font-semibold text-western-green-deep">
                          {a.nome}
                        </p>
                      </div>
                      <span
                        className={cn(
                          "h-3 w-3 shrink-0 rounded-full transition-colors duration-200",
                          isActive ? "bg-western-green-deep" : "bg-western-border-strong",
                        )}
                        aria-hidden
                      />
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="md:col-span-5 md:sticky md:top-28">
              <div className="rounded-2xl border border-western-border-soft bg-white p-6 md:p-8">
                <p className="text-eyebrow">Em destaque</p>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={ativo.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.22, ease: "easeOut" }}
                  >
                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      <h3 className="display-md text-western-green-deep">{ativo.nome}</h3>
                      {ativo.id === "moledo" && (
                        <span className="inline-flex items-center rounded-full bg-western-gold px-3 py-1 text-[14px] font-semibold text-western-green-deep">
                          Mais escolhido
                        </span>
                      )}
                    </div>
                    <p className="text-body mt-4">{ativo.descricao}</p>
                  </motion.div>
                </AnimatePresence>
                <p className="text-meta mt-6 hidden md:block">
                  Passe o cursor sobre os cards para ver a peça acabada.
                </p>
                <p className="text-meta mt-6 md:hidden">
                  Toque nos cards para alternar entre os acabamentos.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. SEGUNDO PONTO DE COMPRA */}
      <MidBuyStrip sectionRef={midBuyRef} />

      {/* 6. RESPIRO EDITORIAL — foto com overlay verde */}
      <section className="relative w-full overflow-hidden surface-forest">
        <div className="relative aspect-[4/3] max-h-[70vh] w-full sm:aspect-[16/9] md:aspect-[21/9]">
          <img
            src={hero}
            alt="Amostras Western à beira da piscina"
            className="absolute inset-0 h-full w-full object-cover"
            style={{ objectPosition: "center 65%" }}
            loading="lazy"
          />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-western-green-deep/80 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-6 md:p-12">
            <div className="container-western">
              <p className="display-md max-w-xl text-western-cream">
                Projetos de alto padrão começam pelo toque.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FERRAMENTA DE ESPECIFICAÇÃO */}
      <section className="section surface-paper">
        <div className="container-western grid gap-10 md:grid-cols-12 md:gap-14">
          <div className="md:col-span-5">
            <p className="text-eyebrow">Mais do que amostras</p>
            <h2 className="display-lg mt-4 text-western-green-deep">
              Uma ferramenta de especificação.
            </h2>
          </div>
          <ol className="md:col-span-7">
            {FERRAMENTA.map((item, i) => (
              <li
                key={item}
                className="grid grid-cols-[auto_1fr] items-baseline gap-5 border-b border-western-border-soft py-5 md:gap-7 md:py-6"
              >
                <span className="display-md w-10 shrink-0 tabular-nums text-western-bronze">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="font-sans text-[17px] leading-[1.6] text-western-stone-dark">
                  {item}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 8. CATÁLOGO */}
      <section className="section surface-ivory">
        <div className="container-western">
          <div className="grid items-center gap-10 md:grid-cols-12 md:gap-16">
            <div className="md:col-span-6 md:order-2">
              <div className="aspect-[4/3] overflow-hidden rounded-2xl border border-western-border-soft bg-western-paper">
                <img
                  src={catalogo}
                  alt="Catálogo oficial Western Pools"
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
            </div>
            <div className="md:col-span-6 md:order-1">
              <p className="text-eyebrow">Catálogo Western Pools</p>
              <h2 className="display-lg mt-4 text-western-green-deep">
                Inspiração e técnica, em um único material.
              </h2>
              <p className="text-body mt-6 max-w-md">
                Inspirações, aplicações, informações técnicas e toda a linha Western Pools. Pensado
                para acompanhar você durante toda a fase de especificação.
              </p>
              {/* Saída discreta p/ o catálogo: quem pediu amostra vai querer ver as peças. */}
              <Link to="/produtos" className="link-cta mt-6 text-western-green-deep">
                Ver todas as peças
                <ChevronRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 9. CASHBACK 100% — faixa escura pontual */}
      <section className="section surface-forest relative overflow-hidden">
        <img
          src={lifestyle}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-20"
          loading="lazy"
          aria-hidden
        />
        <div className="absolute inset-0 bg-western-green-deep/70" aria-hidden />
        <div className="container-western relative z-10">
          <p className="text-[14px] font-semibold uppercase tracking-[0.06em] text-western-gold-soft">
            Cashback exclusivo
          </p>
          <p className="mt-4 font-display text-[clamp(3rem,8vw,3.5rem)] leading-none tabular-nums tracking-[-0.01em] text-western-gold">
            100<span className="text-western-gold-soft">%</span>
          </p>
          <h2 className="display-lg mt-4 max-w-xl text-western-cream">
            de volta como crédito na sua primeira compra.
          </h2>
          <p className="mt-6 max-w-xl font-sans text-[17px] leading-[1.6] text-western-cream/85">
            Os {PRICE_LABEL} investidos na Western Box voltam integralmente como crédito. Na
            prática, você conhece nossos materiais sem perder esse investimento.
          </p>
        </div>
      </section>

      {/* 10. PARA QUEM É */}
      <section className="section surface-paper">
        <div className="container-western">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-eyebrow">Para quem é</p>
            <h2 className="display-lg mt-4 text-western-green-deep">
              Feita para quem decide com critério.
            </h2>
          </div>
          <div className="mx-auto mt-10 flex max-w-3xl flex-wrap justify-center gap-3">
            {PARA_QUEM.map((p) => (
              <span
                key={p}
                className="inline-flex items-center rounded-full border border-western-border-strong bg-white px-5 py-3 font-sans text-[16px] font-semibold text-western-green-deep"
              >
                {p}
              </span>
            ))}
          </div>
          <p className="text-meta mx-auto mt-8 max-w-2xl text-center">
            Aberta a profissionais e clientes finais — não exige cadastro B2B nem pedido mínimo.
          </p>
        </div>
      </section>

      {/* 11. ENVIO, CONTEÚDO E CASHBACK — acordeão */}
      <section className="section surface-ivory border-t border-western-border-soft">
        <div className="container-western grid gap-10 md:grid-cols-12 md:gap-16">
          <div className="md:col-span-5">
            <p className="text-eyebrow">Sem letras miúdas</p>
            <h2 className="display-lg mt-4 text-western-green-deep">
              Envio, conteúdo e cashback.
            </h2>
            <div className="mt-8 hidden aspect-[4/5] overflow-hidden rounded-2xl border border-western-border-soft md:block">
              <img
                src={boxFechada}
                alt="Western Box fechada com selo da marca"
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </div>
          </div>

          <div className="md:col-span-7">
            <Accordion type="single" collapsible defaultValue="envio" className="w-full">
              <AccordionItem value="envio" className="border-b border-western-border-soft">
                <AccordionTrigger className="py-5 text-left font-sans text-[20px] font-semibold text-western-green-deep hover:no-underline">
                  Envio e prazo
                </AccordionTrigger>
                <AccordionContent className="text-body pb-5">
                  Sua Western Box é preparada com cuidado e enviada em 5 a 7 dias úteis após a
                  confirmação do pedido. Despachamos para todo o Brasil com código de rastreamento.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="conteudo" className="border-b border-western-border-soft">
                <AccordionTrigger className="py-5 text-left font-sans text-[20px] font-semibold text-western-green-deep hover:no-underline">
                  O que vem na caixa
                </AccordionTrigger>
                <AccordionContent className="text-body pb-5">
                  <ul className="space-y-2">
                    <li>◆ 4 amostras físicas: Quartzo, Arenito, Moledo e Granito</li>
                    <li>◆ Catálogo oficial Western Pools impresso</li>
                    <li>◆ Embalagem premium exclusiva</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="cashback" className="border-b border-western-border-soft">
                <AccordionTrigger className="py-5 text-left font-sans text-[20px] font-semibold text-western-green-deep hover:no-underline">
                  Como funciona o cashback de 100%
                </AccordionTrigger>
                <AccordionContent className="text-body pb-5">
                  Os {PRICE_LABEL} investidos na Western Box retornam integralmente como crédito no
                  seu primeiro pedido na Western Pools. O crédito é aplicado automaticamente no
                  fechamento e é válido por 12 meses a partir da entrega da caixa.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="duvidas" className="border-b border-western-border-soft">
                <AccordionTrigger className="py-5 text-left font-sans text-[20px] font-semibold text-western-green-deep hover:no-underline">
                  Preciso de cadastro ou CNPJ?
                </AccordionTrigger>
                <AccordionContent className="text-body pb-5">
                  Não. A Western Box é aberta a todos — profissionais e clientes finais —, sem
                  cadastro de parceiro e sem pedido mínimo.
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <div className="mt-8 rounded-2xl border border-western-border-soft bg-white p-6">
              <p className="font-sans text-[20px] font-semibold leading-snug text-western-green-deep">
                Ficou em dúvida sobre o acabamento ideal?
              </p>
              <p className="text-body mt-2">
                Conte sobre o seu projeto e nosso time ajuda a especificar — sem compromisso de
                compra.
              </p>
              {/* A Western Box é a única compra sem CNPJ — quem chega aqui é
                  residencial. Ia pra porta B2B; vai pra /para-sua-casa. */}
              <Link to="/para-sua-casa" className="btn-outline-forest tap-target mt-6 w-full sm:w-auto">
                Falar sobre meu projeto
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 12. CTA FINAL */}
      <section
        ref={finalCtaRef}
        className="surface-forest relative overflow-hidden py-20 pb-40 text-center md:py-28 md:pb-44"
      >
        <img
          src={lifestyle}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-30"
          loading="lazy"
          aria-hidden
        />
        <div className="absolute inset-0 bg-western-green-deep/75" aria-hidden />
        <div className="container-western relative z-10">
          <p className="text-[14px] font-semibold uppercase tracking-[0.06em] text-western-gold-soft">
            Pronto para começar
          </p>
          <h2 className="display-lg mx-auto mt-4 max-w-2xl text-western-cream">
            Receba a Western Box, descubra nossos acabamentos e transforme {PRICE_LABEL} em crédito.
          </h2>
          <div className="mx-auto mt-8 max-w-[420px]">
            <button
              type="button"
              onClick={() => buy(1)}
              disabled={disabled}
              className="btn-gold tap-target w-full"
            >
              <ShoppingBag className="h-5 w-5" aria-hidden />
              {disabled ? "Em breve" : `Adicionar ao carrinho · ${PRICE_LABEL}`}
            </button>
          </div>
          <p className="mt-4 text-[14px] text-western-cream/80">
            Cashback 100% · Envio em 5 a 7 dias úteis · Ambiente seguro
          </p>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noreferrer"
            className="tap-target mt-6 inline-flex items-center gap-2 font-sans text-[16px] font-semibold text-western-cream underline underline-offset-4 transition-colors hover:text-western-gold-soft"
          >
            <MessageCircle className="h-5 w-5" aria-hidden />
            Falar com um consultor no WhatsApp
          </a>
        </div>
      </section>
    </>
  );
}
