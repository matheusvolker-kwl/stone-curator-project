import { Link } from "react-router-dom";
import { Lock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { usePartnerPricing } from "@/hooks/usePartnerPricing";
import { formatBRL } from "@/lib/shopify/client";

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
}

/**
 * Renderiza o preço para parceiros aprovados (com desconto do tier aplicado)
 * ou um chip "Login para preço" para visitantes/pendentes.
 */
export default function GatedPrice({
  amount,
  currency = "BRL",
  suffix,
  className,
  variant = "inline",
  lockedLabel,
}: Props) {
  const { isApproved, session } = useAuth();
  const { discountPct } = usePartnerPricing();

  if (isApproved) {
    const base = typeof amount === "number" ? amount : parseFloat(amount);
    const hasDiscount = discountPct > 0 && Number.isFinite(base);
    const final = hasDiscount ? base * (1 - discountPct / 100) : base;
    return (
      <span className={className}>
        {hasDiscount && (
          <span className="opacity-50 line-through mr-2 text-[0.85em]">
            {formatBRL(base, currency)}
          </span>
        )}
        {formatBRL(final, currency)}
        {suffix && <span className="opacity-60 ml-1">{suffix}</span>}
      </span>
    );
  }

  if (variant === "hidden") return null;

  const label = lockedLabel ?? (session ? "Aguardando aprovação" : "Login para preço");
  const to = session ? "/minha-conta" : "/parceiro/login";

  if (variant === "badge") {
    return (
      <Link
        to={to}
        className="inline-flex items-center gap-1 font-mono text-[9px] uppercase tracking-[0.16em] px-1.5 py-0.5 border border-western-stone-warm/25 text-western-stone-warm hover:text-western-gold hover:border-western-gold/60 transition-colors"
      >
        <Lock className="h-2.5 w-2.5" /> {label}
      </Link>
    );
  }

  if (variant === "block") {
    return (
      <Link
        to={to}
        className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] text-western-stone-warm hover:text-western-gold transition-colors"
      >
        <Lock className="h-3.5 w-3.5" /> {label}
      </Link>
    );
  }

  return (
    <Link
      to={to}
      className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-western-stone-warm/80 hover:text-western-gold transition-colors"
    >
      <Lock className="h-3 w-3" /> {label}
    </Link>
  );
}
