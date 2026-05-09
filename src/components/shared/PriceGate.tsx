import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Lock } from "lucide-react";

interface Props {
  /** Conteúdo exibido para parceiros aprovados/admin (preço real). Opcional para variant="block". */
  children?: React.ReactNode;
  /** Estilo compacto (cards) ou completo (PDP) */
  variant?: "inline" | "block";
  /** Texto do CTA */
  ctaLabel?: string;
}

export default function PriceGate({ children, variant = "inline", ctaLabel = "Acessar para ver preço" }: Props) {
  const { isApproved, session, partnerStatus } = useAuth();
  if (isApproved) return <>{children}</>;

  if (variant === "inline") {
    return (
      <Link
        to={session ? "/parceiro/conta" : "/parceiro/login"}
        className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-western-stone-warm/80 hover:text-western-gold transition-colors"
      >
        <Lock className="h-3 w-3" /> {session ? "Aguardando aprovação" : "Login para preço"}
      </Link>
    );
  }

  // block (PDP)
  const msg = !session
    ? "Os preços do catálogo são exclusivos para parceiros credenciados. Faça login ou solicite seu cadastro B2B."
    : partnerStatus === "pending"
    ? "Seu cadastro está em análise. Liberaremos os preços e a tabela completa em até 2 dias úteis."
    : "Acesso indisponível. Fale com o nosso comercial.";
  return (
    <div className="border border-western-gold/40 bg-western-gold/5 px-5 py-6">
      <div className="flex items-start gap-3 mb-4">
        <Lock className="h-4 w-4 text-western-gold mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-eyebrow mb-2">Condição parceiro</p>
          <p className="text-spec text-western-green-deep leading-relaxed">{msg}</p>
        </div>
      </div>
      {!session && (
        <div className="flex flex-wrap gap-2 mt-3">
          <Link
            to="/parceiro/login"
            className="inline-flex items-center justify-center h-11 px-5 bg-western-green-deep text-western-cream hover:bg-western-green-mid font-mono text-[11px] uppercase tracking-[0.22em]"
          >
            {ctaLabel}
          </Link>
          <Link
            to="/parceiro/cadastro"
            className="inline-flex items-center justify-center h-11 px-5 border border-western-green-deep/30 text-western-green-deep hover:border-western-gold hover:text-western-gold font-mono text-[11px] uppercase tracking-[0.22em]"
          >
            Solicitar cadastro
          </Link>
        </div>
      )}
    </div>
  );
}
