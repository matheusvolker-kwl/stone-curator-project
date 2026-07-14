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
          <span className="opacity-50 line-through text-[0.78em] font-normal">
            {formatBRL(base, currency)}
          </span>
        )}
        <span>{formatBRL(final, currency)}</span>
        {suffix && <span className="opacity-60">{suffix}</span>}
      </span>
    );
  }

  if (variant === "hidden") return null;

  const label = lockedLabel ?? (session ? "Aguardando aprovação" : "Ver preço de parceiro");
  const to = session ? "/minha-conta" : "/parceiro/cadastro";
  const Icon = session ? Lock : Unlock;

  const lockedClass =
    variant === "badge"
      ? "inline-flex items-center gap-1 font-mono text-[9px] uppercase tracking-[0.16em] px-1.5 py-0.5 border border-western-stone-warm/25 text-western-stone-warm hover:text-western-gold hover:border-western-gold/60 transition-colors"
      : variant === "block"
        ? "inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] text-western-stone-warm hover:text-western-gold transition-colors"
        : "inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-western-stone-warm/80 hover:text-western-gold transition-colors";

  const iconClass =
    variant === "badge" ? "h-2.5 w-2.5" : variant === "block" ? "h-3.5 w-3.5" : "h-3 w-3";

  if (!linked) {
    return (
      <span className={lockedClass}>
        <Icon className={iconClass} /> {label}
      </span>
    );
  }

  return (
    <Link to={to} className={lockedClass} ref={guardRef}>
      <Icon className={iconClass} /> {label}
    </Link>
  );
}
