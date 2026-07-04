import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, AnimatePresence, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Check,
  ShieldCheck,
  Package,
  Truck,
  Sparkles,
  ChevronRight,
  Minus,
  Plus,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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

import hero from "@/assets/western-box/hero.webp.asset.json";
import boxFechada from "@/assets/western-box/box-fechada.webp.asset.json";
import boxAberta from "@/assets/western-box/box-aberta.webp.asset.json";
import lifestyle from "@/assets/western-box/lifestyle.webp.asset.json";
import catalogo from "@/assets/western-box/catalogo.webp.asset.json";
import texQuartzo from "@/assets/western-box/tex-quartzo.webp.asset.json";
import texArenito from "@/assets/western-box/tex-arenito.webp.asset.json";
import texMoledo from "@/assets/western-box/tex-moledo.webp.asset.json";
import texGranito from "@/assets/western-box/tex-granito.webp.asset.json";
import pb3Quartzo from "@/assets/western-box/pb3-quartzo.webp.asset.json";
import pb3Arenito from "@/assets/western-box/pb3-arenito.webp.asset.json";
import pb3Moledo from "@/assets/western-box/pb3-moledo.webp.asset.json";
import pb3Granito from "@/assets/western-box/pb3-granito.webp.asset.json";

// =============================================================================
// CONFIG — mesma constante do anterior (Woo product id real)
// =============================================================================
const WESTERN_BOX_WOO_PRODUCT_ID: number | null = 1559;
const PRICE_LABEL = "R$ 149,90";

const GALLERY = [
  { src: boxFechada.url, alt: "Western Box fechada com selo dourado" },
  { src: boxAberta.url, alt: "Western Box aberta com as quatro amostras e o catálogo" },
  { src: lifestyle.url, alt: "Western Box em uso sobre a mesa de trabalho" },
  { src: catalogo.url, alt: "Catálogo oficial Western Pools" },
];

const ACABAMENTOS = [
  {
    id: "quartzo",
    nome: "Quartzo",
    descricao: "Elegância contemporânea, textura refinada e visual sofisticado.",
    texture: texQuartzo.url,
    pb3: pb3Quartzo.url,
  },
  {
    id: "arenito",
    nome: "Arenito",
    descricao: "Tons naturais e acolhedores, perfeitos para projetos integrados à natureza.",
    texture: texArenito.url,
    pb3: pb3Arenito.url,
  },
  {
    id: "moledo",
    nome: "Moledo",
    descricao: "Textura marcante, personalidade e aspecto orgânico.",
    texture: texMoledo.url,
    pb3: pb3Moledo.url,
  },
  {
    id: "granito",
    nome: "Granito",
    descricao: "Versatilidade, equilíbrio e um acabamento atemporal.",
    texture: texGranito.url,
    pb3: pb3Granito.url,
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
// PARALLAX IMAGE
// ---------------------------------------------------------------------------
function ParallaxImage({
  src,
  alt,
  className,
  range = 60,
  scale = 1.08,
  objectPosition = "center",
}: {
  src: string;
  alt: string;
  className?: string;
  range?: number;
  scale?: number;
  objectPosition?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [-range, range]);
  return (
    <div ref={ref} className={cn("relative overflow-hidden", className)}>
      <motion.img
        src={src}
        alt={alt}
        style={{ y, scale, objectPosition }}
        className="absolute inset-0 h-full w-full object-cover will-change-transform"
        loading="lazy"
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// STICKY BUY BAR — some quando o painel de compra do topo está visível
// ---------------------------------------------------------------------------
function StickyBuyBar({ topBuyRef }: { topBuyRef: React.RefObject<HTMLElement> }) {
  const { disabled, buy } = useBuyAction();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = topBuyRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        const past = entry.boundingClientRect.top < 0;
        setVisible(!entry.isIntersecting && past);
      },
      { threshold: 0, rootMargin: "0px 0px -10% 0px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [topBuyRef]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="fixed bottom-3 left-1/2 z-50 -translate-x-1/2 w-[min(96vw,720px)] px-2"
        >
          <div className="flex items-center justify-between gap-3 rounded-full border border-western-gold/30 bg-western-green-deep/95 backdrop-blur-md pl-5 pr-1.5 py-1.5 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.55)]">
            <div className="flex items-center gap-3 min-w-0">
              <img
                src={boxFechada.url}
                alt=""
                className="hidden sm:block h-10 w-10 rounded-full object-cover border border-western-gold/30"
              />
              <div className="flex flex-col leading-tight min-w-0">
                <span className="text-[10px] uppercase tracking-[0.2em] text-western-gold-soft truncate">
                  Western Box
                </span>
                <span className="font-display text-western-cream text-base sm:text-lg tabular-nums">
                  {PRICE_LABEL}
                </span>
              </div>
            </div>
            <Button
              onClick={() => buy(1)}
              disabled={disabled}
              className="h-10 sm:h-11 rounded-full px-4 sm:px-6 bg-western-gold text-western-green-deep hover:bg-western-gold-soft text-[10px] sm:text-[11px] uppercase tracking-[0.16em] shrink-0"
            >
              {disabled ? "Em breve" : "Adicionar"}
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ---------------------------------------------------------------------------
// QTY STEPPER
// ---------------------------------------------------------------------------
function QtyStepper({ qty, setQty }: { qty: number; setQty: (n: number) => void }) {
  return (
    <div className="inline-flex items-center border border-western-stone-warm/30 h-12 bg-western-paper">
      <button
        type="button"
        onClick={() => setQty(Math.max(1, qty - 1))}
        className="h-12 w-12 flex items-center justify-center text-western-green-deep hover:bg-western-gold/10 transition-colors"
        aria-label="Diminuir quantidade"
      >
        <Minus className="h-3.5 w-3.5" />
      </button>
      <span className="px-4 font-display text-lg text-western-green-deep tabular-nums min-w-[2.5ch] text-center">
        {qty}
      </span>
      <button
        type="button"
        onClick={() => setQty(qty + 1)}
        className="h-12 w-12 flex items-center justify-center text-western-green-deep hover:bg-western-gold/10 transition-colors"
        aria-label="Aumentar quantidade"
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// PRODUCT TOP — galeria + painel de compra (estrutura clássica de PDP)
// ---------------------------------------------------------------------------
function ProductTop({ topBuyRef }: { topBuyRef: React.RefObject<HTMLDivElement> }) {
  const { disabled, buy } = useBuyAction();
  const [active, setActive] = useState(0);
  const [qty, setQty] = useState(1);

  return (
    <section className="bg-western-paper pt-6 md:pt-10 pb-12 md:pb-20" ref={topBuyRef as never}>
      <div className="container-western">
        {/* Breadcrumb */}
        <nav
          aria-label="breadcrumb"
          className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.22em] text-western-stone-warm mb-6 md:mb-10"
        >
          <Link to="/" className="hover:text-western-green-deep transition-colors">
            Home
          </Link>
          <ChevronRight className="h-3 w-3 opacity-50" />
          <span className="text-western-green-deep">Amostras</span>
        </nav>

        <div className="grid md:grid-cols-12 gap-8 md:gap-14 items-start">
          {/* GALERIA */}
          <div className="md:col-span-7">
            {/* Desktop: imagem grande + thumbs verticais */}
            <div className="hidden md:grid grid-cols-[88px_1fr] gap-4">
              <div className="flex flex-col gap-3">
                {GALLERY.map((g, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActive(i)}
                    onMouseEnter={() => setActive(i)}
                    className={cn(
                      "relative aspect-square overflow-hidden border bg-western-ivory transition-all duration-300",
                      active === i
                        ? "border-western-gold"
                        : "border-western-stone-warm/15 hover:border-western-stone-warm/40",
                    )}
                    aria-label={`Ver imagem ${i + 1}`}
                  >
                    <img src={g.src} alt="" className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
                  </button>
                ))}
              </div>
              <div className="relative aspect-[4/5] overflow-hidden bg-western-ivory border border-western-stone-warm/15">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={active}
                    src={GALLERY[active].src}
                    alt={GALLERY[active].alt}
                    initial={{ opacity: 0, scale: 1.02 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                </AnimatePresence>
              </div>
            </div>

            {/* Mobile: carrossel scroll-snap */}
            <div className="md:hidden -mx-4">
              <div className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar gap-3 px-4">
                {GALLERY.map((g, i) => (
                  <div
                    key={i}
                    className="snap-center shrink-0 w-[88%] aspect-[4/5] bg-western-ivory border border-western-stone-warm/15 overflow-hidden"
                  >
                    <img src={g.src} alt={g.alt} className="h-full w-full object-cover" loading={i === 0 ? "eager" : "lazy"} />
                  </div>
                ))}
              </div>
              <div className="flex justify-center gap-1.5 mt-4">
                {GALLERY.map((_, i) => (
                  <span
                    key={i}
                    className="h-1 w-6 rounded-full bg-western-stone-warm/25"
                    aria-hidden
                  />
                ))}
              </div>
            </div>
          </div>

          {/* PAINEL DE COMPRA */}
          <div className="md:col-span-5 md:sticky md:top-24">
            <p className="text-[10px] uppercase tracking-[0.32em] text-western-gold mb-3">
              Amostras · Edição oficial
            </p>
            <h1 className="font-display text-[clamp(1.85rem,5vw,3.25rem)] leading-[1.02] tracking-[-0.01em] text-western-green-deep">
              Western Box
              <span className="block italic font-light text-western-gold text-[0.7em] mt-2">
                Amostras + Catálogo
              </span>
            </h1>

            <p className="mt-5 text-western-stone-warm text-[15px] md:text-base leading-relaxed font-light max-w-md">
              Os quatro acabamentos Western em mãos, com o catálogo oficial. Veja, toque, compare e
              decida com convicção antes de especificar.
            </p>

            {/* Preço */}
            <div className="mt-7 pb-7 border-b border-western-stone-warm/20">
              <div className="flex items-end gap-3">
                <span className="font-display text-[clamp(2.25rem,5vw,3rem)] leading-none text-western-green-deep tabular-nums">
                  {PRICE_LABEL}
                </span>
                <span className="text-[11px] uppercase tracking-[0.22em] text-western-stone-warm pb-1.5">
                  à vista
                </span>
              </div>
              <div className="mt-4 inline-flex items-center gap-2 bg-western-green-deep text-western-gold-soft px-3.5 py-2 text-[11px] uppercase tracking-[0.22em]">
                <Sparkles className="h-3 w-3" />
                Cashback 100% no 1º pedido
              </div>
            </div>

            {/* Qty + CTA */}
            <div className="mt-7 flex flex-col sm:flex-row gap-3 sm:items-stretch">
              <QtyStepper qty={qty} setQty={setQty} />
              <Button
                onClick={() => buy(qty)}
                disabled={disabled}
                className="group relative overflow-hidden flex-1 h-12 bg-western-green-deep text-western-gold hover:bg-western-green-deep/90 border border-western-gold/40 hover:border-western-gold font-mono font-bold text-[12px] uppercase tracking-[0.22em] rounded-none disabled:opacity-60"
              >
                <span className="relative z-10">
                  {disabled ? "Em breve" : "Adicionar ao carrinho"}
                </span>
              </Button>
            </div>

            {/* Trust line */}
            <ul className="mt-7 space-y-2.5 text-[12px] text-western-stone-warm">
              <li className="flex items-center gap-2.5">
                <Truck className="h-3.5 w-3.5 text-western-gold shrink-0" />
                Envio para todo o Brasil em 5 a 7 dias úteis
              </li>
              <li className="flex items-center gap-2.5">
                <Lock className="h-3.5 w-3.5 text-western-gold shrink-0" />
                Pagamento e ambiente 100% seguros
              </li>
              <li className="flex items-center gap-2.5">
                <Package className="h-3.5 w-3.5 text-western-gold shrink-0" />
                Embalagem premium · 4 amostras + catálogo
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
function MidBuyStrip() {
  const { disabled, buy } = useBuyAction();
  return (
    <section className="bg-western-ivory py-12 md:py-16 border-y border-western-stone-warm/15">
      <div className="container-western">
        <div className="grid md:grid-cols-[160px_1fr_auto] gap-6 md:gap-10 items-center">
          <div className="hidden md:block aspect-square w-40 overflow-hidden bg-western-paper border border-western-stone-warm/15">
            <img src={boxFechada.url} alt="" className="h-full w-full object-cover" loading="lazy" />
          </div>
          <div className="flex md:hidden items-center gap-4">
            <div className="aspect-square w-20 shrink-0 overflow-hidden bg-western-paper border border-western-stone-warm/15">
              <img src={boxFechada.url} alt="" className="h-full w-full object-cover" loading="lazy" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.24em] text-western-gold mb-1">Western Box</p>
              <p className="font-display text-2xl text-western-green-deep tabular-nums leading-none">
                {PRICE_LABEL}
              </p>
              <p className="text-[11px] text-western-stone-warm mt-1">Cashback 100% no 1º pedido</p>
            </div>
          </div>
          <div className="hidden md:block">
            <p className="text-[11px] uppercase tracking-[0.28em] text-western-gold mb-2">
              Pronto para decidir?
            </p>
            <h3 className="font-display text-[clamp(1.5rem,2.5vw,2.25rem)] text-western-green-deep leading-tight tracking-[-0.01em]">
              Western Box ·{" "}
              <span className="tabular-nums">{PRICE_LABEL}</span>{" "}
              <span className="italic font-light text-western-gold">com 100% de cashback</span>
            </h3>
          </div>
          <Button
            onClick={() => buy(1)}
            disabled={disabled}
            className="w-full md:w-auto h-12 px-8 bg-western-green-deep text-western-gold hover:bg-western-green-deep/90 border border-western-gold/40 hover:border-western-gold font-mono font-bold text-[12px] uppercase tracking-[0.22em] rounded-none disabled:opacity-60"
          >
            {disabled ? "Em breve" : "Adicionar ao carrinho"}
          </Button>
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------
export default function WesternBox() {
  const [acabamentoAtivo, setAcabamentoAtivo] = useState<(typeof ACABAMENTOS)[number]["id"]>("quartzo");
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const ativo = ACABAMENTOS.find((a) => a.id === acabamentoAtivo)!;
  const topBuyRef = useRef<HTMLDivElement>(null);
  const { disabled, buy } = useBuyAction();

  return (
    <>
      <Seo
        title="Western Box — Kit oficial de amostras Western Pools"
        description="Os quatro acabamentos Western em mãos, com catálogo oficial e cashback de 100%. Veja, toque, compare e decida antes do projeto."
        path="/western-box"
        ogType="product"
        image={hero.url}
      />

      <StickyBuyBar topBuyRef={topBuyRef as never} />

      {/* 1. TOPO CLÁSSICO DE PRODUTO */}
      <ProductTop topBuyRef={topBuyRef} />





      {/* 2. INTRO EDITORIAL */}
      <section className="bg-western-paper py-20 md:py-32">
        <div className="container-western">
          <Reveal variant="fade-up" duration={1000} distance={40}>
            <p className="text-[11px] uppercase tracking-[0.28em] text-western-gold mb-8">
              Por que existe
            </p>
          </Reveal>
          <div className="font-display text-[clamp(2rem,7vw,5.5rem)] leading-[1.02] tracking-[-0.02em] text-western-green-deep">
            {["Veja.", "Toque.", "Compare.", "Decida."].map((word, i) => (
              <Reveal
                key={word}
                variant="fade-up"
                delay={i * 160}
                duration={1000}
                distance={50}
                as="span"
                className="mr-[0.28em] inline-block"
              >
                <span className={cn(i === 3 && "italic font-light text-western-gold")}>{word}</span>
              </Reveal>
            ))}
          </div>
          <Reveal variant="fade-up" delay={600} duration={900}>
            <p className="mt-10 md:mt-14 max-w-xl text-western-stone-warm text-base md:text-lg leading-relaxed font-light">
              Conhecer um acabamento apenas pela tela nunca conta a história completa. A Western Box
              leva até você uma seleção exclusiva com os quatro acabamentos, com catálogo oficial,
              para que você analise texturas, cores e detalhes exatamente como eles serão
              percebidos no seu projeto.
            </p>
          </Reveal>
        </div>
      </section>

      {/* 3. O QUE ACOMPANHA */}
      <section className="bg-western-ivory">
        <div className="grid md:grid-cols-12 gap-0">
          <div className="md:col-span-7 relative h-[60vh] md:h-[90vh] md:sticky md:top-0">
            <ParallaxImage
              src={boxAberta.url}
              alt="Western Box aberta exibindo as quatro amostras e o catálogo"
              className="h-full w-full"
              range={50}
              scale={1.06}
            />
          </div>
          <div className="md:col-span-5 px-6 md:px-14 py-16 md:py-28 flex flex-col justify-center">
            <Reveal variant="fade-up" duration={900}>
              <p className="text-[11px] uppercase tracking-[0.28em] text-western-gold mb-5">
                O que acompanha
              </p>
            </Reveal>
            <Reveal variant="fade-up" delay={100} duration={1000} distance={40}>
              <h2 className="font-display text-[clamp(1.85rem,4vw,3.25rem)] leading-[1.05] tracking-[-0.01em] text-western-green-deep">
                Tudo o que você precisa para especificar com{" "}
                <span className="italic font-light text-western-gold">segurança</span>.
              </h2>
            </Reveal>
            <ul className="mt-10 md:mt-12">
              {INCLUI.map((item, i) => (
                <Reveal key={item} variant="fade-up" delay={150 + i * 70} duration={700}>
                  <li className="flex items-center gap-4 py-4 border-b border-western-stone-warm/15 group">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-western-gold/40 transition-all duration-500 group-hover:bg-western-gold group-hover:scale-110">
                      <Check className="h-3.5 w-3.5 text-western-gold transition-colors duration-500 group-hover:text-western-green-deep" />
                    </span>
                    <span className="font-display text-lg md:text-xl text-western-stone-dark">
                      {item}
                    </span>
                  </li>
                </Reveal>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* 4. OS 4 ACABAMENTOS */}
      <section className="relative bg-western-green-deep text-western-cream py-20 md:py-32 overflow-hidden">
        <div className="container-western">
          <div className="max-w-3xl mb-14 md:mb-20">
            <Reveal variant="fade-up" duration={900}>
              <p className="text-[11px] uppercase tracking-[0.28em] text-western-gold-soft mb-6">
                Os quatro acabamentos
              </p>
            </Reveal>
            <Reveal variant="fade-up" delay={100} duration={1000} distance={50}>
              <h2 className="font-display text-[clamp(2rem,5.5vw,4.75rem)] leading-[1] tracking-[-0.02em]">
                A assinatura Western,<br />
                <span className="italic font-light text-western-gold-soft">
                  em quatro temperamentos.
                </span>
              </h2>
            </Reveal>
          </div>

          <div className="grid md:grid-cols-12 gap-8 md:gap-12 items-start">
            <div className="md:col-span-7 grid grid-cols-2 gap-3 md:gap-5">
              {ACABAMENTOS.map((a, i) => {
                const active = a.id === acabamentoAtivo;
                const hovered = hoveredCard === a.id;
                return (
                  <Reveal key={a.id} variant="fade-up" delay={i * 100} duration={800}>
                    <button
                      type="button"
                      onClick={() => setAcabamentoAtivo(a.id)}
                      onMouseEnter={() => {
                        setHoveredCard(a.id);
                        setAcabamentoAtivo(a.id);
                      }}
                      onMouseLeave={() => setHoveredCard(null)}
                      className={cn(
                        "group relative w-full text-left overflow-hidden border transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]",
                        active
                          ? "border-western-gold shadow-[0_20px_60px_-20px_rgba(0,0,0,0.6)]"
                          : "border-western-cream/10 hover:border-western-gold/60",
                      )}
                      style={{ transform: hovered ? "translateY(-6px)" : "translateY(0)" }}
                    >
                      <div className="relative aspect-[4/5] overflow-hidden">
                        <img
                          src={a.texture}
                          alt={`Textura ${a.nome}`}
                          className={cn(
                            "absolute inset-0 h-full w-full object-cover transition-all duration-[1100ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
                            hovered ? "scale-110 opacity-0" : "scale-100 opacity-100",
                          )}
                          loading="lazy"
                        />
                        <img
                          src={a.pb3}
                          alt={`PB3 ${a.nome}`}
                          className={cn(
                            "absolute inset-0 h-full w-full object-cover transition-all duration-[1100ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
                            hovered ? "scale-100 opacity-100" : "scale-110 opacity-0",
                          )}
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-western-green-deep/80 via-transparent to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 flex items-end justify-between">
                          <div>
                            <p className="text-[10px] uppercase tracking-[0.22em] text-western-gold-soft mb-1.5">
                              {String(i + 1).padStart(2, "0")} ·{" "}
                              {hovered ? "Em peça PB3" : "Textura"}
                            </p>
                            <h3 className="font-display text-xl md:text-2xl text-western-cream">
                              {a.nome}
                            </h3>
                          </div>
                          <span
                            className={cn(
                              "h-2 w-2 rounded-full transition-all duration-500",
                              active ? "bg-western-gold scale-150" : "bg-western-cream/30",
                            )}
                          />
                        </div>
                      </div>
                    </button>
                  </Reveal>
                );
              })}
            </div>

            <div className="md:col-span-5 md:sticky md:top-28">
              <Reveal variant="fade-up" duration={900}>
                <div className="border-l-2 border-western-gold/40 pl-6 md:pl-8">
                  <p className="text-[11px] uppercase tracking-[0.28em] text-western-gold-soft mb-4">
                    Em destaque
                  </p>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={ativo.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -12 }}
                      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <h3 className="font-display text-[clamp(2.25rem,5vw,4rem)] leading-[0.95] text-western-cream tracking-[-0.02em]">
                        {ativo.nome}
                      </h3>
                      <p className="mt-5 text-western-cream/75 text-base md:text-lg leading-relaxed font-light max-w-sm">
                        {ativo.descricao}
                      </p>
                    </motion.div>
                  </AnimatePresence>
                  <p className="mt-8 text-[10px] uppercase tracking-[0.22em] text-western-cream/40 hidden md:block">
                    Passe o cursor sobre os cards
                  </p>
                  <p className="mt-8 text-[10px] uppercase tracking-[0.22em] text-western-cream/40 md:hidden">
                    Toque nos cards para alternar
                  </p>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* 5. SEGUNDO PONTO DE COMPRA */}
      <MidBuyStrip />

      {/* 5.5 RESPIRO EDITORIAL — foto hero (amostras à beira da piscina) em parallax wide */}
      <section className="relative w-full overflow-hidden bg-western-green-deep">
        <div className="relative w-full aspect-[4/3] sm:aspect-[16/9] md:aspect-[21/9] max-h-[90vh]">
          <ParallaxImage
            src={hero.url}
            alt="Amostras Western à beira da piscina"
            className="absolute inset-0 h-full w-full"
            range={30}
            scale={1.06}
            objectPosition="center 65%"
          />
          {/* overlay sutil só na base, mantendo a foto clara e as amostras visíveis */}
          <div className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-western-green-deep/45 to-transparent pointer-events-none" />
          <div className="absolute inset-x-0 bottom-0 p-6 md:p-12">
            <div className="container-western">
              <Reveal variant="fade-up" duration={1100} distance={28}>
                <p className="font-display text-western-cream text-[clamp(1rem,2.2vw,1.75rem)] leading-snug tracking-[-0.01em] max-w-xl drop-shadow-[0_2px_12px_rgba(0,0,0,0.5)]">
                  Projetos de alto padrão{" "}
                  <span className="italic font-light text-western-gold-soft">
                    começam pelo toque.
                  </span>
                </p>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FERRAMENTA DE ESPECIFICAÇÃO */}
      <section className="bg-western-paper py-20 md:py-32">
        <div className="container-western grid md:grid-cols-12 gap-10 md:gap-14">
          <div className="md:col-span-5">
            <Reveal variant="fade-up" duration={900}>
              <p className="text-[11px] uppercase tracking-[0.28em] text-western-gold mb-5">
                Mais do que amostras
              </p>
            </Reveal>
            <Reveal variant="fade-up" delay={100} duration={1000} distance={40}>
              <h2 className="font-display text-[clamp(1.85rem,4.5vw,4rem)] leading-[1.02] tracking-[-0.02em] text-western-green-deep">
                Uma ferramenta de{" "}
                <span className="italic font-light text-western-gold">especificação</span>.
              </h2>
            </Reveal>
          </div>
          <ul className="md:col-span-7 md:pt-2">
            {FERRAMENTA.map((item, i) => (
              <Reveal key={item} variant="fade-up" delay={i * 110} duration={800}>
                <li className="grid grid-cols-[auto_1fr] gap-5 md:gap-7 items-baseline border-b border-western-stone-warm/15 py-5 md:py-6 group cursor-default">
                  <span className="font-display text-western-gold text-2xl md:text-3xl leading-none w-10 shrink-0 transition-transform duration-500 group-hover:translate-x-1">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="font-display text-base md:text-xl text-western-stone-dark leading-snug">
                    {item}
                  </span>
                </li>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* 7. CATÁLOGO */}
      <section className="bg-western-ivory">
        <div className="grid md:grid-cols-12 gap-0 items-stretch">
          <div className="md:col-span-5 px-6 md:px-14 py-16 md:py-28 flex flex-col justify-center order-2 md:order-1">
            <Reveal variant="fade-up" duration={900}>
              <p className="text-[11px] uppercase tracking-[0.28em] text-western-gold mb-5">
                Catálogo Western Pools
              </p>
            </Reveal>
            <Reveal variant="fade-up" delay={100} duration={1000} distance={40}>
              <h2 className="font-display text-[clamp(1.85rem,4vw,3.5rem)] leading-[1.05] tracking-[-0.01em] text-western-green-deep">
                Inspiração e técnica,<br />
                <span className="italic font-light text-western-gold">em um único material.</span>
              </h2>
            </Reveal>
            <Reveal variant="fade-up" delay={200} duration={900}>
              <p className="mt-8 md:mt-10 font-sans text-base text-western-stone-warm leading-relaxed font-light max-w-md">
                Inspirações, aplicações, informações técnicas e toda a linha Western Pools. Pensado
                para acompanhar você durante toda a fase de especificação.
              </p>
            </Reveal>
          </div>
          <div className="md:col-span-7 relative h-[55vh] md:h-[80vh] order-1 md:order-2">
            <ParallaxImage
              src={catalogo.url}
              alt="Catálogo oficial Western Pools"
              className="h-full w-full"
              range={50}
              scale={1.06}
            />
          </div>
        </div>
      </section>

      {/* 8. CASHBACK 100% */}
      <section className="relative py-24 md:py-40 overflow-hidden bg-western-green-deep text-western-cream">
        <ParallaxImage
          src={lifestyle.url}
          alt=""
          className="absolute inset-0 h-full w-full opacity-25"
          range={80}
          scale={1.12}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-western-green-deep via-western-green-deep/85 to-western-green-deep/40" />
        <div className="container-western relative z-10 max-w-4xl">
          <Reveal variant="fade-up" duration={900}>
            <p className="text-[11px] uppercase tracking-[0.32em] text-western-gold-soft mb-8 flex items-center gap-3">
              <Sparkles className="h-3 w-3" /> Cashback exclusivo
            </p>
          </Reveal>
          <Reveal variant="scale" duration={1200}>
            <p className="font-display text-[clamp(5.5rem,20vw,18rem)] leading-[0.85] tracking-[-0.04em] text-western-gold">
              100<span className="text-western-gold-soft">%</span>
            </p>
          </Reveal>
          <Reveal variant="fade-up" delay={250} duration={1000} distance={40}>
            <p className="mt-6 md:mt-8 font-display text-[clamp(1.5rem,3vw,2.5rem)] leading-tight text-western-cream max-w-2xl">
              de volta como crédito na sua{" "}
              <span className="italic font-light text-western-gold-soft">primeira compra</span>.
            </p>
          </Reveal>
          <Reveal variant="fade-up" delay={400} duration={900}>
            <p className="mt-8 max-w-xl text-western-cream/70 text-base leading-relaxed font-light">
              Os {PRICE_LABEL} investidos na Western Box retornam integralmente como crédito. Na
              prática, você conhece nossos materiais sem perder esse investimento.
            </p>
          </Reveal>
        </div>
      </section>

      {/* 9. PARA QUEM É */}
      <section className="bg-western-paper py-20 md:py-24 overflow-hidden">
        <div className="container-western mb-10 md:mb-14">
          <Reveal variant="fade-up" duration={900}>
            <p className="text-[11px] uppercase tracking-[0.28em] text-western-gold mb-5 text-center">
              Para quem é
            </p>
          </Reveal>
          <Reveal variant="fade-up" delay={100} duration={1000} distance={40}>
            <h2 className="font-display text-[clamp(1.85rem,4.5vw,3.25rem)] leading-[1.05] text-western-green-deep text-center max-w-3xl mx-auto tracking-[-0.01em]">
              Feita para quem decide com{" "}
              <span className="italic font-light text-western-gold">critério</span>.
            </h2>
          </Reveal>
        </div>
        <div className="relative w-full overflow-hidden">
          <div className="flex gap-12 md:gap-16 whitespace-nowrap animate-[wb-marquee_38s_linear_infinite] hover:[animation-play-state:paused]">
            {[...PARA_QUEM, ...PARA_QUEM, ...PARA_QUEM].map((p, i) => (
              <span
                key={i}
                className="font-display text-[clamp(2rem,5.5vw,4.5rem)] leading-none text-western-green-deep/85 flex items-center gap-12 md:gap-16 tracking-[-0.01em]"
              >
                {p}
                <span className="h-2 w-2 rounded-full bg-western-gold shrink-0" />
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* 10. ENVIO + SPECS + DÚVIDAS — ACORDEÃO */}
      <section className="bg-western-ivory py-20 md:py-28 border-t border-western-stone-warm/10">
        <div className="container-western grid md:grid-cols-12 gap-10 md:gap-16">
          <div className="md:col-span-5">
            <Reveal variant="fade-up" duration={900}>
              <p className="text-[11px] uppercase tracking-[0.28em] text-western-gold mb-5">
                Tudo o que você precisa saber
              </p>
            </Reveal>
            <Reveal variant="fade-up" delay={100} duration={1000} distance={40}>
              <h2 className="font-display text-[clamp(1.75rem,3.5vw,2.75rem)] text-western-green-deep leading-[1.08] tracking-[-0.01em]">
                Envio, conteúdo e{" "}
                <span className="italic font-light text-western-gold">cashback</span> sem letras
                miúdas.
              </h2>
            </Reveal>
            <Reveal variant="fade" delay={250} duration={900}>
              <div className="hidden md:block mt-10 aspect-[4/5] overflow-hidden border border-western-stone-warm/15">
                <img
                  src={boxFechada.url}
                  alt="Western Box fechada com selo da marca"
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
            </Reveal>
          </div>

          <div className="md:col-span-7">
            <Accordion type="single" collapsible defaultValue="envio" className="w-full">
              <AccordionItem value="envio" className="border-b border-western-stone-warm/20">
                <AccordionTrigger className="font-display text-lg md:text-xl text-western-green-deep py-5 hover:no-underline">
                  Envio e prazo
                </AccordionTrigger>
                <AccordionContent className="text-western-stone-warm leading-relaxed text-[15px]">
                  Sua Western Box é preparada cuidadosamente e enviada em até 5 a 7 dias úteis após
                  a confirmação do pedido. Despachamos para todo o Brasil com código de
                  rastreamento.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="conteudo" className="border-b border-western-stone-warm/20">
                <AccordionTrigger className="font-display text-lg md:text-xl text-western-green-deep py-5 hover:no-underline">
                  O que vem na caixa
                </AccordionTrigger>
                <AccordionContent className="text-western-stone-warm leading-relaxed text-[15px]">
                  <ul className="space-y-1.5">
                    <li>· 4 amostras físicas: Quartzo, Arenito, Moledo e Granito</li>
                    <li>· Catálogo oficial Western Pools impresso</li>
                    <li>· Embalagem premium exclusiva</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="cashback" className="border-b border-western-stone-warm/20">
                <AccordionTrigger className="font-display text-lg md:text-xl text-western-green-deep py-5 hover:no-underline">
                  Como funciona o cashback de 100%
                </AccordionTrigger>
                <AccordionContent className="text-western-stone-warm leading-relaxed text-[15px]">
                  Os {PRICE_LABEL} investidos na Western Box retornam integralmente como crédito no
                  seu primeiro pedido na Western Pools. O crédito é aplicado automaticamente no
                  fechamento e é válido por 12 meses a partir da entrega da caixa.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="duvidas" className="border-b border-western-stone-warm/20">
                <AccordionTrigger className="font-display text-lg md:text-xl text-western-green-deep py-5 hover:no-underline">
                  Outras dúvidas
                </AccordionTrigger>
                <AccordionContent className="text-western-stone-warm leading-relaxed text-[15px]">
                  Fale com nosso time pelo WhatsApp ou pelo formulário de contato — respondemos em
                  poucas horas úteis e ajudamos a escolher o melhor acabamento para o seu projeto.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            <div className="mt-8 border-t border-western-stone-warm/20 pt-8">
              <p className="font-display text-lg md:text-xl text-western-green-deep leading-snug">Ficou em dúvida sobre o acabamento ideal?</p>
              <p className="mt-2 text-western-stone-warm text-[15px] leading-relaxed">Conte sobre o seu projeto e nosso time ajuda a especificar — sem compromisso de compra.</p>
              <Link to="/orcamento" className="mt-5 inline-flex items-center gap-2 border border-western-green-deep/30 px-6 h-12 items-center font-mono text-[11px] uppercase tracking-[0.22em] text-western-green-deep hover:bg-western-green-deep hover:text-western-cream transition-colors">Falar sobre meu projeto</Link>
            </div>
          </div>
        </div>
      </section>

      {/* 11. CTA FINAL */}
      <section className="relative min-h-[70vh] md:min-h-[80vh] overflow-hidden bg-western-green-deep text-western-cream flex items-center justify-center text-center py-24 md:py-32">
        <ParallaxImage
          src={lifestyle.url}
          alt=""
          className="absolute inset-0 h-full w-full opacity-40"
          range={100}
          scale={1.12}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-western-green-deep via-western-green-deep/70 to-western-green-deep/30" />
        <div className="container-western relative z-10 max-w-4xl px-4">
          <Reveal variant="fade-up" duration={900}>
            <p className="text-[11px] uppercase tracking-[0.32em] text-western-gold-soft mb-8">
              Pronto para começar
            </p>
          </Reveal>
          <Reveal variant="fade-up" delay={100} duration={1200} distance={50}>
            <p className="font-display text-[clamp(2rem,6vw,5rem)] leading-[1] tracking-[-0.02em] text-western-cream">
              Receba a Western Box,<br />
              <span className="italic font-light text-western-gold-soft">
                descubra nossos acabamentos
              </span>
              <br />
              e transforme {PRICE_LABEL} em crédito.
            </p>
          </Reveal>
          <Reveal variant="fade-up" delay={350} duration={900}>
            <div className="mt-10 md:mt-14 flex flex-col items-center gap-4">
              <Button
                onClick={() => buy(1)}
                disabled={disabled}
                className="group relative overflow-hidden h-14 px-10 md:px-14 bg-western-gold text-western-green-deep hover:bg-western-gold-soft font-mono font-bold text-[12px] uppercase tracking-[0.22em] rounded-none disabled:opacity-60"
              >
                <span className="relative z-10">
                  {disabled ? "Em breve" : "Adicionar ao carrinho · " + PRICE_LABEL}
                </span>
              </Button>
              <span className="text-[10px] uppercase tracking-[0.24em] text-western-cream/55">
                Cashback 100% · Envio em 5–7 dias úteis · Ambiente seguro
              </span>
            </div>
          </Reveal>
        </div>
      </section>

      <style>{`
        @keyframes wb-marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.3333%); }
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-\\[wb-marquee_38s_linear_infinite\\] { animation: none !important; }
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </>
  );
}
