import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Lock, Unlock } from "lucide-react";

interface Props {
  /** Conteúdo exibido para parceiros aprovados/admin (preço real). Opcional para variant="block". */
  children?: React.ReactNode;
  /** Estilo compacto (cards) ou completo (PDP) */
  variant?: "inline" | "block";
  /** Texto do CTA */
  ctaLabel?: string;
}

export default function PriceGate({ children, variant = "inline", ctaLabel = "Ver preço de parceiro" }: Props) {
  const { isApproved, session, partnerStatus } = useAuth();
  if (isApproved) return <>{children}</>;

  if (variant === "inline") {
    const to = session ? "/minha-conta" : "/parceiro/cadastro";
    const Icon = session ? Lock : Unlock;
    const label = session ? "Aguardando aprovação" : "Ver preço de parceiro";
    return (
      <Link
        to={to}
        className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-western-stone-warm/80 hover:text-western-gold transition-colors"
      >
        <Icon className="h-3 w-3" /> {label}
      </Link>
    );
  }

  // block (PDP)
  const msg = !session
    ? "Os preços do catálogo são exclusivos para parceiros credenciados. Faça login ou solicite seu cadastro B2B."
    : partnerStatus === "pending"
    ? "Seu cadastro está em análise. Liberamos os preços e a tabela completa por e-mail em breve."
    : "Acesso indisponível. Fale com o nosso comercial.";
  const IconBlock = !session ? Unlock : Lock;
  return (
    <div className="border border-western-gold/40 bg-western-gold/5 px-5 py-6 min-w-0">
      <div className="flex items-start gap-3 mb-4 min-w-0">
        <IconBlock className="h-4 w-4 text-western-gold mt-0.5 flex-shrink-0" />
        <div className="min-w-0">
          <p className="text-eyebrow mb-2">Condição parceiro</p>
          <p className="text-spec text-western-green-deep leading-relaxed break-words">{msg}</p>
        </div>
      </div>
      {!session && (
        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 mt-3">
          <Link
            to="/parceiro/cadastro"
            className="flex items-center justify-center text-center h-11 px-5 bg-western-gold text-western-green-deep hover:bg-western-gold/90 font-mono text-[11px] uppercase tracking-[0.22em] transition-colors w-full sm:w-auto whitespace-normal"
          >
            {ctaLabel}
          </Link>
          <Link
            to="/parceiro/login"
            className="flex items-center justify-center text-center h-11 px-5 border border-western-green-deep/30 text-western-green-deep hover:border-western-gold hover:text-western-gold font-mono text-[11px] uppercase tracking-[0.22em] w-full sm:w-auto whitespace-normal"
          >
            Já sou parceiro · Entrar
          </Link>
        </div>
      )}
    </div>
  );
}
