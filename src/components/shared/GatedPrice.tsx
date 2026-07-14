import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Lock, Unlock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { usePartnerPricing } from "@/hooks/usePartnerPricing";
import { formatBRL } from "@/lib/catalog/client";

interface Props {
  amount: string | number;
  currency?: string;
  /** Sufixo opcional após o valor (ex: "/ un.") */
  suffix?: string;
  /** Estilo do valor revelado (parceiro aprovado) */
  className?: string;
  /** Variantes do fallback (visitante / pendente) */
  variant?: "inline" | "badge" | "block" | "hidden";
  /** Texto custom para o fallback */
  lockedLabel?: string;
  /**
   * false quando o componente vive dentro de um ancestral clicável (ex.:
   * ProductCard, que é um <Link>) — o fallback vira <span> para não aninhar
   * <a> dentro de <a>.
   */
  linked?: boolean;
}

/* === Chip do gate B2B (V3) =================================================
 * É o elemento que TODO visitante vê na vitrine, então ele segue as regras de
 * texto do V3 e não as de "legenda decorativa":
 *   - Source Sans 3 semibold, sentence case. Nunca mono, nunca caixa-alta 10px.
 *   - 16px (UI) nas variantes de compra; 14px é o piso absoluto (badge).
 *   - Verde-escuro sobre marfim + borda visível → contraste AA+ para 40+.
 *   - Alvo de toque ≥48px (52px na variante block, altura padrão de controle).
 *   - Raios do sistema: 6px em badge, 10px no resto. Sem cantos vivos.
 * Repouso igual em todas as variantes (identidade única de chip) e hover que
 * preenche de verde — sem virar um segundo CTA primário concorrendo com o
 * botão verde da página. Utilities explícitas de propósito: classes de
 * @layer components perderiam para as utilities dos consumidores.
 * ========================================================================== */
const CHIP_BASE =
  "inline-flex items-center gap-2 font-sans font-semibold rounded-[10px] " +
  "border border-western-border-strong bg-western-ivory text-western-green-deep";

const CHIP_SIZE: Record<"inline" | "badge" | "block", string> = {
  // Padrão da vitrine: cards de peça/conjunto, barra fixa.
  inline: "min-h-[48px] px-3.5 py-2 text-[16px]",
  // Compacto (selo sobre foto/lista densa) — 14px é o mínimo permitido.
  badge: "min-h-[48px] px-3 py-1.5 text-[14px] rounded-[6px] gap-1.5",
  // Slot de preço da PDP/composição: ocupa a largura do bloco, altura de controle.
  block: "min-h-[52px] w-full justify-center px-5 py-3 text-[16px]",
};

/** Só o <a> ganha afordância de hover/foco; o <span> é inerte por definição. */
const CHIP_INTERACTIVE =
  "transition-colors duration-200 hover:border-western-cta hover:bg-western-cta " +
  "hover:text-western-cream focus-visible:outline-none focus-visible:ring-2 " +
  "focus-visible:ring-western-cta focus-visible:ring-offset-2";

/**
 * Renderiza o preço para parceiros aprovados (com desconto do tier aplicado)
 * ou um chip "Ver preço de parceiro" para visitantes/pendentes.
 */
export default function GatedPrice({
  amount,
  currency = "BRL",
  suffix,
  className,
  variant = "inline",
  lockedLabel,
  linked = true,
}: Props) {
  const { isApproved, session } = useAuth();
  const { discountPct } = usePartnerPricing();
  const guardRef = useRef<HTMLAnchorElement>(null);

  // Guarda de dev: o fallback do gate é um <a>. Se o componente vive dentro de
  // um card clicável (ProductCard, ConjuntoCard...), quem chama TEM que passar
  // linked={false} — senão vira <a> dentro de <a> (HTML inválido; o React
  // reclama e o clique fica ambíguo). Já aconteceu 3×; a trava avisa na hora.
  useEffect(() => {
    if (!import.meta.env.DEV || !linked || isApproved) return;
    const anchor = guardRef.current?.parentElement?.closest("a");
    if (anchor) {
      // eslint-disable-next-line no-console
      console.error(
        "[GatedPrice] está dentro de um <a> (%s) e vai aninhar links. Passe linked={false}.",
        anchor.getAttribute("href") ?? "sem href",
      );
    }
  }, [linked, isApproved]);

  if (isApproved) {
    const base = typeof amount === "number" ? amount : parseFloat(amount);
    if (!Number.isFinite(base) || base <= 0) {
      return (
        <span className={`${className ?? ""} inline-flex items-baseline`}>
          <span>Sob consulta</span>
        </span>
      );
    }
    const hasDiscount = discountPct > 0;
    const final = hasDiscount ? base * (1 - discountPct / 100) : base;
    return (
      <span className={`${className ?? ""} inline-flex flex-wrap items-baseline gap-x-2 gap-y-0.5`}>
        {hasDiscount && (
          // Proporcional ao preço, mas travado no piso de 14px: o consumidor
          // pode montar este bloco em 16px (card relacionado) e 0.78em cairia
          // para ~12px. Cor sólida em vez de opacity — opacidade quebra o AA.
          <span className="text-[length:max(14px,0.78em)] font-normal text-western-stone-warm line-through">
            {formatBRL(base, currency)}
          </span>
        )}
        <span>{formatBRL(final, currency)}</span>
        {suffix && (
          <span className="text-[length:max(14px,0.8em)] font-normal text-western-stone-warm">
            {suffix}
          </span>
        )}
      </span>
    );
  }

  if (variant === "hidden") return null;

  const label = lockedLabel ?? (session ? "Aguardando aprovação" : "Ver preço de parceiro");
  const to = session ? "/minha-conta" : "/parceiro/cadastro";
  const Icon = session ? Lock : Unlock;

  const sizeClass = CHIP_SIZE[variant];
  // 20px = ícone inline do DS; na badge (14px) acompanha o texto.
  const iconClass = variant === "badge" ? "h-4 w-4 shrink-0" : "h-5 w-5 shrink-0";

  const content = (
    <>
      <Icon className={iconClass} aria-hidden="true" />
      <span>{label}</span>
    </>
  );

  if (!linked) {
    return <span className={`${CHIP_BASE} ${sizeClass}`}>{content}</span>;
  }

  return (
    <Link to={to} className={`${CHIP_BASE} ${sizeClass} ${CHIP_INTERACTIVE}`} ref={guardRef}>
      {content}
    </Link>
  );
}
