import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, AnimatePresence, useReducedMotion } from "framer-motion";
import { Check, ShieldCheck, Package, Truck, Sparkles, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
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
// CONFIGURAÇÃO DO PRODUTO NO WOOCOMMERCE — preserve, mesma constante do anterior
// =============================================================================
const WESTERN_BOX_WOO_PRODUCT_ID: number | null = null;
const PRICE_LABEL = "R$ 149,90";

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
  "Sample Quartzo",
  "Sample Arenito",
  "Sample Moledo",
  "Sample Granito",
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
// BUY ACTION — usado pelo CTA inline e pelo sticky buy bar
// ---------------------------------------------------------------------------
function useBuyAction() {
  const disabled = WESTERN_BOX_WOO_PRODUCT_ID === null;
  const buy = () => {
    if (disabled || WESTERN_BOX_WOO_PRODUCT_ID === null) return;
    submitCheckoutHandoff([
      {
        id: `wbox-${WESTERN_BOX_WOO_PRODUCT_ID}`,
        title: "Western Box",
        handle: "western-box",
        variantId: String(WESTERN_BOX_WOO_PRODUCT_ID),
        price: "149.90",
        quantity: 1,
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

function BuyButton({ size = "lg", className }: { size?: "lg" | "default"; className?: string }) {
  const { disabled, buy } = useBuyAction();
  return (
    <Button
      onClick={buy}
      disabled={disabled}
      size={size}
      className={cn(
        "group relative overflow-hidden bg-western-gold text-western-green-deep hover:bg-western-gold-soft font-medium tracking-[0.18em] uppercase transition-all duration-500",
        size === "lg" && "h-14 px-12 text-[12px]",
        className,
      )}
    >
      <span className="relative z-10">{disabled ? "Em breve" : "Quero minha Western Box"}</span>
      <span
        className="absolute inset-0 -translate-x-full bg-western-cream transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-0 group-disabled:hidden"
        aria-hidden
      />
    </Button>
  );
}

// ---------------------------------------------------------------------------
// STICKY BUY BAR — surge depois do hero
// ---------------------------------------------------------------------------
function StickyBuyBar() {
  const { disabled, buy } = useBuyAction();
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > window.innerHeight * 0.85);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 w-[min(94vw,640px)]"
        >
          <div className="flex items-center justify-between gap-4 rounded-full border border-western-gold/30 bg-western-green-deep/95 backdrop-blur-md pl-6 pr-2 py-2 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.5)]">
            <div className="flex flex-col leading-tight">
              <span className="text-[10px] uppercase tracking-[0.2em] text-western-gold-soft">Western Box</span>
              <span className="font-display text-western-cream text-lg">{PRICE_LABEL}</span>
            </div>
            <Button
              onClick={buy}
              disabled={disabled}
              className="h-11 rounded-full px-6 bg-western-gold text-western-green-deep hover:bg-western-gold-soft text-[11px] uppercase tracking-[0.16em]"
            >
              {disabled ? "Em breve" : "Comprar agora"}
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ---------------------------------------------------------------------------
// PARALLAX IMAGE — usa useScroll para movimento sutil em containers full-bleed
// ---------------------------------------------------------------------------
function ParallaxImage({
  src,
  alt,
  className,
  range = 80,
  scale = 1.1,
}: {
  src: string;
  alt: string;
  className?: string;
  range?: number;
  scale?: number;
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
        style={{ y, scale }}
        className="absolute inset-0 h-full w-full object-cover will-change-transform"
        loading="lazy"
      />
    </div>
  );
}

export default function WesternBox() {
  const [acabamentoAtivo, setAcabamentoAtivo] = useState<(typeof ACABAMENTOS)[number]["id"]>("quartzo");
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const ativo = ACABAMENTOS.find((a) => a.id === acabamentoAtivo)!;
  const reduce = useReducedMotion();

  // Parallax do hero
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress: heroProg } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(heroProg, [0, 1], reduce ? [0, 0] : [0, 220]);
  const heroScale = useTransform(heroProg, [0, 1], reduce ? [1, 1] : [1, 1.15]);
  const heroTitleY = useTransform(heroProg, [0, 1], reduce ? [0, 0] : [0, -60]);
  const heroOpacity = useTransform(heroProg, [0, 0.8], [1, 0]);

  return (
    <>
      <Seo
        title="Western Box — Kit oficial de amostras Western Pools"
        description="Os quatro acabamentos Western em mãos, com catálogo oficial e cashback de 100%. Veja, toque, compare e decida antes do projeto."
        path="/western-box"
        ogType="product"
        image={hero.url}
      />

      <StickyBuyBar />

      {/* =================== HERO EDITORIAL FULL-VIEWPORT =================== */}
      <section
        ref={heroRef}
        className="relative h-[100svh] min-h-[640px] w-full overflow-hidden bg-western-green-deep text-western-cream"
      >
        <motion.div style={{ y: heroY, scale: heroScale }} className="absolute inset-0 will-change-transform">
          <img
            src={hero.url}
            alt="Western Box à beira da piscina com os quatro samples e o catálogo Western Pools"
            className="h-full w-full object-cover"
            loading="eager"
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-t from-western-green-deep via-western-green-deep/40 to-western-green-deep/10" />
        <div className="absolute inset-0 bg-gradient-to-r from-western-green-deep/65 via-transparent to-transparent" />

        <motion.div
          style={{ y: heroTitleY, opacity: heroOpacity }}
          className="container-western relative z-10 flex h-full flex-col justify-end pb-24 md:pb-32"
        >
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="text-[11px] uppercase tracking-[0.32em] text-western-gold-soft mb-8"
          >
            Western Box · Edição oficial
          </motion.p>
          <h1 className="font-display max-w-5xl text-[clamp(3rem,9vw,8.5rem)] leading-[0.92] tracking-[-0.02em] text-western-cream">
            {"O primeiro passo".split(" ").map((w, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 60 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.1, delay: 0.35 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                className="mr-[0.25em] inline-block"
              >
                {w}
              </motion.span>
            ))}
            <br />
            {"para escolher com confiança.".split(" ").map((w, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 60 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.1, delay: 0.55 + i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                className="mr-[0.25em] inline-block italic font-light text-western-gold-soft"
              >
                {w}
              </motion.span>
            ))}
          </h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, delay: 1.1 }}
            className="mt-10 max-w-md text-western-cream/70 text-base leading-relaxed font-light"
          >
            A coleção física dos quatro acabamentos Western Pools — entregue na sua mesa, com
            catálogo oficial da marca.
          </motion.p>
        </motion.div>

        {/* Scroll cue */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6, duration: 1 }}
          style={{ opacity: heroOpacity }}
          className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 flex flex-col items-center gap-2 text-western-cream/60"
        >
          <span className="text-[10px] uppercase tracking-[0.3em]">Role para descobrir</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          >
            <ArrowDown className="h-4 w-4" />
          </motion.div>
        </motion.div>
      </section>

      {/* =================== INTRO — FRASE DE IMPACTO =================== */}
      <section className="bg-western-paper py-32 md:py-48">
        <div className="container-western">
          <Reveal variant="fade-up" duration={1100} distance={40}>
            <p className="text-[11px] uppercase tracking-[0.28em] text-western-gold mb-10">
              Por que existe
            </p>
          </Reveal>
          <div className="font-display text-[clamp(2.5rem,7vw,6rem)] leading-[1.02] tracking-[-0.02em] text-western-green-deep">
            {["Veja.", "Toque.", "Compare.", "Decida."].map((word, i) => (
              <Reveal
                key={word}
                variant="fade-up"
                delay={i * 180}
                duration={1100}
                distance={60}
                as="span"
                className="mr-[0.3em] inline-block"
              >
                <span className={cn(i === 3 && "italic font-light text-western-gold")}>{word}</span>
              </Reveal>
            ))}
          </div>
          <Reveal variant="fade-up" delay={700} duration={900}>
            <p className="mt-16 max-w-xl text-western-stone-warm text-lg leading-relaxed font-light">
              Conhecer um acabamento apenas pela tela nunca conta a história completa. A Western Box
              leva até você uma seleção exclusiva com os quatro acabamentos, com catálogo oficial,
              para que você analise texturas, cores e detalhes exatamente como eles serão
              percebidos no seu projeto.
            </p>
          </Reveal>
        </div>
      </section>

      {/* =================== O QUE ACOMPANHA — IMAGEM HERO + CHECKLIST =================== */}
      <section className="bg-western-ivory">
        <div className="grid md:grid-cols-12 gap-0">
          <Reveal
            variant="fade"
            duration={1400}
            className="md:col-span-7 relative h-[70vh] md:h-[110vh] md:sticky md:top-0"
          >
            <ParallaxImage
              src={boxAberta.url}
              alt="Western Box aberta exibindo os quatro samples e o catálogo"
              className="h-full w-full"
              range={60}
              scale={1.08}
            />
          </Reveal>

          <div className="md:col-span-5 px-6 md:px-16 py-24 md:py-40 flex flex-col justify-center">
            <Reveal variant="fade-up" duration={900}>
              <p className="text-[11px] uppercase tracking-[0.28em] text-western-gold mb-6">
                O que acompanha
              </p>
            </Reveal>
            <Reveal variant="fade-up" delay={100} duration={1000} distance={40}>
              <h2 className="font-display text-[clamp(2.25rem,4vw,3.5rem)] leading-[1.05] tracking-[-0.01em] text-western-green-deep">
                Tudo o que você precisa para especificar com{" "}
                <span className="italic font-light text-western-gold">segurança</span>.
              </h2>
            </Reveal>
            <ul className="mt-14 space-y-0">
              {INCLUI.map((item, i) => (
                <Reveal key={item} variant="fade-up" delay={200 + i * 90} duration={800}>
                  <li className="flex items-center gap-5 py-5 border-b border-western-stone-warm/15 group">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-western-gold/40 transition-all duration-500 group-hover:bg-western-gold group-hover:scale-110">
                      <Check className="h-4 w-4 text-western-gold transition-colors duration-500 group-hover:text-western-green-deep" />
                    </span>
                    <span className="font-display text-xl md:text-2xl text-western-stone-dark">
                      {item}
                    </span>
                  </li>
                </Reveal>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* =================== OS 4 ACABAMENTOS — CENTERPIECE =================== */}
      <section className="relative bg-western-green-deep text-western-cream py-32 md:py-48 overflow-hidden">
        <div className="container-western">
          <div className="max-w-3xl mb-20 md:mb-28">
            <Reveal variant="fade-up" duration={900}>
              <p className="text-[11px] uppercase tracking-[0.28em] text-western-gold-soft mb-8">
                Os quatro acabamentos
              </p>
            </Reveal>
            <Reveal variant="fade-up" delay={100} duration={1100} distance={50}>
              <h2 className="font-display text-[clamp(2.5rem,6vw,5.5rem)] leading-[0.98] tracking-[-0.02em]">
                A assinatura Western,<br />
                <span className="italic font-light text-western-gold-soft">em quatro temperamentos.</span>
              </h2>
            </Reveal>
          </div>

          <div className="grid md:grid-cols-12 gap-10 md:gap-14 items-start">
            {/* Cards de textura */}
            <div className="md:col-span-7 grid grid-cols-2 gap-4 md:gap-6">
              {ACABAMENTOS.map((a, i) => {
                const active = a.id === acabamentoAtivo;
                const hovered = hoveredCard === a.id;
                return (
                  <Reveal key={a.id} variant="fade-up" delay={i * 120} duration={900}>
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
                        {/* Textura */}
                        <img
                          src={a.texture}
                          alt={`Textura ${a.nome}`}
                          className={cn(
                            "absolute inset-0 h-full w-full object-cover transition-all duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
                            hovered ? "scale-110 opacity-0" : "scale-100 opacity-100",
                          )}
                          loading="lazy"
                        />
                        {/* PB3 — crossfade no hover */}
                        <img
                          src={a.pb3}
                          alt={`PB3 ${a.nome}`}
                          className={cn(
                            "absolute inset-0 h-full w-full object-cover transition-all duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
                            hovered ? "scale-100 opacity-100" : "scale-110 opacity-0",
                          )}
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-western-green-deep/80 via-transparent to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-5 md:p-7 flex items-end justify-between">
                          <div>
                            <p className="text-[10px] uppercase tracking-[0.24em] text-western-gold-soft mb-2">
                              {String(i + 1).padStart(2, "0")} · {hovered ? "Em peça PB3" : "Textura"}
                            </p>
                            <h3 className="font-display text-2xl md:text-3xl text-western-cream">
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

            {/* Painel descritivo do ativo */}
            <div className="md:col-span-5 md:sticky md:top-32">
              <Reveal variant="fade-up" duration={900}>
                <div className="border-l-2 border-western-gold/40 pl-8">
                  <p className="text-[11px] uppercase tracking-[0.28em] text-western-gold-soft mb-6">
                    Acabamento em destaque
                  </p>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={ativo.id}
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -14 }}
                      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <h3 className="font-display text-[clamp(3rem,5vw,4.5rem)] leading-[0.95] text-western-cream tracking-[-0.02em]">
                        {ativo.nome}
                      </h3>
                      <p className="mt-6 text-western-cream/75 text-lg leading-relaxed font-light max-w-sm">
                        {ativo.descricao}
                      </p>
                    </motion.div>
                  </AnimatePresence>
                  <p className="mt-10 text-[11px] uppercase tracking-[0.22em] text-western-cream/40">
                    Passe o cursor sobre os cards
                  </p>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* =================== FERRAMENTA DE ESPECIFICAÇÃO =================== */}
      <section className="bg-western-paper py-32 md:py-44">
        <div className="container-western grid md:grid-cols-12 gap-12">
          <div className="md:col-span-5">
            <Reveal variant="fade-up" duration={900}>
              <p className="text-[11px] uppercase tracking-[0.28em] text-western-gold mb-6">
                Mais do que amostras
              </p>
            </Reveal>
            <Reveal variant="fade-up" delay={100} duration={1100} distance={50}>
              <h2 className="font-display text-[clamp(2.25rem,5vw,4.5rem)] leading-[1] tracking-[-0.02em] text-western-green-deep">
                Uma ferramenta de{" "}
                <span className="italic font-light text-western-gold">especificação</span>.
              </h2>
            </Reveal>
          </div>
          <ul className="md:col-span-7 md:pt-4">
            {FERRAMENTA.map((item, i) => (
              <Reveal key={item} variant="fade-up" delay={i * 120} duration={900}>
                <li className="grid grid-cols-[auto_1fr] gap-8 items-baseline border-b border-western-stone-warm/15 py-7 group cursor-default">
                  <span className="font-display text-western-gold text-3xl md:text-4xl leading-none w-12 shrink-0 transition-transform duration-500 group-hover:translate-x-1">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="font-display text-xl md:text-2xl text-western-stone-dark leading-snug">
                    {item}
                  </span>
                </li>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* =================== CATÁLOGO — FULL BLEED =================== */}
      <section className="bg-western-ivory">
        <div className="grid md:grid-cols-12 gap-0 items-stretch">
          <div className="md:col-span-5 px-6 md:px-16 py-24 md:py-40 flex flex-col justify-center order-2 md:order-1">
            <Reveal variant="fade-up" duration={900}>
              <p className="text-[11px] uppercase tracking-[0.28em] text-western-gold mb-6">
                Catálogo Western Pools
              </p>
            </Reveal>
            <Reveal variant="fade-up" delay={100} duration={1100} distance={50}>
              <h2 className="font-display text-[clamp(2.25rem,4.5vw,4rem)] leading-[1.02] tracking-[-0.01em] text-western-green-deep">
                Inspiração e técnica,<br />
                <span className="italic font-light text-western-gold">em um único material.</span>
              </h2>
            </Reveal>
            <Reveal variant="fade-up" delay={250} duration={900}>
              <p className="mt-10 font-sans text-base md:text-lg text-western-stone-warm leading-relaxed font-light max-w-md">
                Inspirações, aplicações, informações técnicas e toda a linha Western Pools.
                Pensado para acompanhar você durante toda a fase de especificação.
              </p>
            </Reveal>
          </div>
          <div className="md:col-span-7 relative h-[70vh] md:h-[90vh] order-1 md:order-2">
            <ParallaxImage
              src={catalogo.url}
              alt="Catálogo oficial Western Pools"
              className="h-full w-full"
              range={60}
              scale={1.08}
            />
          </div>
        </div>
      </section>

      {/* =================== CASHBACK — MOMENTO DRAMÁTICO =================== */}
      <section className="relative py-40 md:py-56 overflow-hidden bg-western-green-deep text-western-cream">
        <ParallaxImage
          src={lifestyle.url}
          alt=""
          className="absolute inset-0 h-full w-full opacity-25"
          range={100}
          scale={1.15}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-western-green-deep via-western-green-deep/85 to-western-green-deep/40" />
        <div className="container-western relative z-10 max-w-4xl">
          <Reveal variant="fade-up" duration={900}>
            <p className="text-[11px] uppercase tracking-[0.32em] text-western-gold-soft mb-10 flex items-center gap-3">
              <Sparkles className="h-3 w-3" /> Cashback exclusivo
            </p>
          </Reveal>
          <div className="relative">
            <Reveal variant="scale" duration={1400}>
              <p className="font-display text-[clamp(7rem,22vw,22rem)] leading-[0.85] tracking-[-0.04em] text-western-gold">
                100<span className="text-western-gold-soft">%</span>
              </p>
            </Reveal>
          </div>
          <Reveal variant="fade-up" delay={300} duration={1100} distance={50}>
            <p className="mt-8 font-display text-[clamp(1.75rem,3.5vw,3rem)] leading-tight text-western-cream max-w-2xl">
              de volta como crédito na sua{" "}
              <span className="italic font-light text-western-gold-soft">primeira compra</span>.
            </p>
          </Reveal>
          <Reveal variant="fade-up" delay={500} duration={900}>
            <p className="mt-10 max-w-xl text-western-cream/70 text-base md:text-lg leading-relaxed font-light">
              Os {PRICE_LABEL} investidos na Western Box retornam integralmente como crédito. Na
              prática, você conhece nossos materiais sem perder esse investimento.
            </p>
          </Reveal>
        </div>
      </section>

      {/* =================== PARA QUEM É — MARQUEE =================== */}
      <section className="bg-western-paper py-28 overflow-hidden">
        <div className="container-western mb-14">
          <Reveal variant="fade-up" duration={900}>
            <p className="text-[11px] uppercase tracking-[0.28em] text-western-gold mb-6 text-center">
              Para quem é
            </p>
          </Reveal>
          <Reveal variant="fade-up" delay={100} duration={1000} distance={40}>
            <h2 className="font-display text-[clamp(2rem,4.5vw,3.5rem)] leading-[1.05] text-western-green-deep text-center max-w-3xl mx-auto tracking-[-0.01em]">
              Feita para quem decide com{" "}
              <span className="italic font-light text-western-gold">critério</span>.
            </h2>
          </Reveal>
        </div>

        <div className="relative w-full overflow-hidden">
          <div className="flex gap-16 whitespace-nowrap animate-[wb-marquee_38s_linear_infinite] hover:[animation-play-state:paused]">
            {[...PARA_QUEM, ...PARA_QUEM, ...PARA_QUEM].map((p, i) => (
              <span
                key={i}
                className="font-display text-[clamp(2.5rem,6vw,5rem)] leading-none text-western-green-deep/85 flex items-center gap-16 tracking-[-0.01em]"
              >
                {p}
                <span className="h-2 w-2 rounded-full bg-western-gold shrink-0" />
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* =================== ENVIO + SPECS =================== */}
      <section className="bg-western-ivory py-28 border-t border-western-stone-warm/10">
        <div className="container-western grid md:grid-cols-2 gap-16 md:gap-24 items-center">
          <Reveal variant="fade-right" duration={1100}>
            <div className="relative overflow-hidden">
              <ParallaxImage
                src={boxFechada.url}
                alt="Western Box fechada com selo da marca"
                className="aspect-[4/5] w-full"
                range={40}
                scale={1.08}
              />
            </div>
          </Reveal>
          <div>
            <Reveal variant="fade-up" duration={900}>
              <p className="text-[11px] uppercase tracking-[0.28em] text-western-gold mb-6">Envio</p>
            </Reveal>
            <Reveal variant="fade-up" delay={100} duration={1000} distance={40}>
              <h2 className="font-display text-[clamp(1.75rem,3vw,2.75rem)] text-western-green-deep leading-[1.1] tracking-[-0.01em]">
                Preparada cuidadosamente e enviada em até{" "}
                <span className="italic font-light text-western-gold">5 a 7 dias úteis</span>{" "}
                após a confirmação do pedido.
              </h2>
            </Reveal>

            <dl className="mt-14 grid grid-cols-1 sm:grid-cols-3 gap-8 border-t border-western-stone-warm/15 pt-10">
              {[
                { icon: Package, label: "Conteúdo", value: "4 samples + Catálogo" },
                { icon: Truck, label: "Valor", value: PRICE_LABEL },
                { icon: ShieldCheck, label: "Cashback", value: "100%" },
              ].map((s, i) => (
                <Reveal key={s.label} variant="fade-up" delay={i * 120} duration={800}>
                  <div>
                    <dt className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-western-stone-warm">
                      <s.icon className="h-3.5 w-3.5" /> {s.label}
                    </dt>
                    <dd className="mt-3 font-display text-xl text-western-green-deep leading-snug">
                      {s.value}
                    </dd>
                  </div>
                </Reveal>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* =================== CTA FINAL DRAMÁTICO =================== */}
      <section className="relative h-[90vh] min-h-[600px] overflow-hidden bg-western-green-deep text-western-cream flex items-center justify-center text-center">
        <ParallaxImage
          src={hero.url}
          alt=""
          className="absolute inset-0 h-full w-full opacity-40"
          range={120}
          scale={1.15}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-western-green-deep via-western-green-deep/70 to-western-green-deep/30" />

        <div className="container-western relative z-10 max-w-4xl px-6">
          <Reveal variant="fade-up" duration={900}>
            <p className="text-[11px] uppercase tracking-[0.32em] text-western-gold-soft mb-10">
              Pronto para começar
            </p>
          </Reveal>
          <Reveal variant="fade-up" delay={100} duration={1300} distance={60}>
            <p className="font-display text-[clamp(2.5rem,6.5vw,6rem)] leading-[0.98] tracking-[-0.02em] text-western-cream">
              Veja, toque, compare<br />
              <span className="italic font-light text-western-gold-soft">e decida com convicção.</span>
            </p>
          </Reveal>
          <Reveal variant="fade-up" delay={400} duration={900}>
            <div className="mt-14 flex flex-col items-center gap-5">
              <BuyButton />
              <span className="text-[10px] uppercase tracking-[0.24em] text-western-cream/55">
                {PRICE_LABEL} · Cashback 100% · Envio em 5–7 dias úteis
              </span>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Keyframes para o marquee */}
      <style>{`
        @keyframes wb-marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.3333%); }
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-\\[wb-marquee_38s_linear_infinite\\] { animation: none !important; }
        }
      `}</style>
    </>
  );
}
