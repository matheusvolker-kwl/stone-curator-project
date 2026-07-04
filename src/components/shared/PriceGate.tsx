import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Lock, Unlock, Check, Package, MessageCircle } from "lucide-react";
import { BUSINESS } from "@/config/business";

interface Props {
  /** Conteúdo exibido para parceiros aprovados/admin (preço real). Opcional para variant="block". */
  children?: React.ReactNode;
  /** Estilo compacto (cards) ou completo (PDP) */
  variant?: "inline" | "block";
  /** Texto do CTA (usado apenas na variante inline legacy) */
  ctaLabel?: string;
  /** Handle/nome do produto — usado para linkar o orçamento B2C com contexto */
  productRef?: string;
}

export default function PriceGate({ children, variant = "inline", productRef }: Props) {
  const { isApproved, session } = useAuth();
  if (isApproved) return <>{children}</>;

  // ─── Inline (cards de listagem): enxuto, sem pitch ───
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

  // ─── Block (PDP): pitch de parceria, preço 100% oculto ───
  const beneficios = [
    "Catálogo completo pronto para montar seu pedido e comprar",
    "Artes, modelos SketchUp, guia de compra e de instalação",
    "Fotos aplicadas, de estúdio e descrições detalhadas",
    "Pagamento em Pix, boleto ou cartão de crédito",
  ];

  const orcamentoTo = productRef
    ? `/orcamento?ref=${encodeURIComponent(productRef)}`
    : "/orcamento";
  const waHref = `https://wa.me/${BUSINESS.whatsappFabrica}?text=${encodeURIComponent(
    productRef
      ? `Olá Western! Tenho interesse no produto "${productRef}" para o meu projeto residencial.`
      : "Olá Western! Gostaria de um orçamento para o meu projeto residencial."
  )}`;

  return (
    <div className="border border-western-gold/40 bg-western-gold/[0.06] px-5 py-6 md:px-6 md:py-7 min-w-0">
      <p className="text-eyebrow mb-3">PREÇO EXCLUSIVO PARA PARCEIROS B2B</p>
      <h3 className="font-display text-2xl md:text-[26px] leading-[1.15] text-western-green-deep mb-3">
        Preço de parceiro comercial, liberado na hora
      </h3>
      <p className="text-spec text-western-green-deep/85 leading-relaxed mb-5">
        A Western Store é exclusiva para parceiros. A aprovação é automática e
        imediata para empresas com CNAE compatível — sem espera, sem análise manual.
      </p>

      <ul className="space-y-2 mb-5">
        {beneficios.map((b) => (
          <li
            key={b}
            className="flex items-start gap-2 text-[13px] leading-snug text-western-green-deep/90"
          >
            <Check className="h-4 w-4 text-western-gold mt-0.5 flex-shrink-0" />
            <span>{b}</span>
          </li>
        ))}
      </ul>

      <div className="border border-western-green-deep/15 bg-western-cream/60 px-4 py-3 mb-5 flex items-start gap-3">
        <Package className="h-4 w-4 text-western-green-deep mt-0.5 flex-shrink-0" />
        <p className="text-[12.5px] leading-snug text-western-green-deep/90">
          <span className="font-mono uppercase tracking-[0.14em] text-[11px] text-western-green-deep">
            Western Box
          </span>{" "}
          — leve o kit de amostras + catálogo e receba o valor 100% de volta em cashback
          na primeira compra.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2">
        <Link
          to="/parceiro/cadastro"
          className="flex items-center justify-center text-center h-11 px-5 bg-western-gold text-western-green-deep hover:bg-western-gold/90 font-mono text-[11px] uppercase tracking-[0.22em] transition-colors w-full sm:w-auto whitespace-normal"
        >
          CRIAR CONTA DE PARCEIRO COMERCIAL
        </Link>
        <Link
          to="/parceiro/login"
          className="flex items-center justify-center text-center h-11 px-5 border border-western-green-deep/30 text-western-green-deep hover:border-western-gold hover:text-western-gold font-mono text-[11px] uppercase tracking-[0.22em] w-full sm:w-auto whitespace-normal"
        >
          Já sou parceiro · Entrar
        </Link>
      </div>
      <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.18em] text-western-stone-warm/80">
        Grátis · aprovação na hora
      </p>

      {/* ─── Trilha B2C — cliente final sem CNPJ ─── */}
      <div className="mt-6 pt-5 border-t border-western-green-deep/15">
        <div className="flex items-center gap-3 mb-3">
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-western-stone-warm/70">
            ou
          </span>
          <span className="h-px flex-1 bg-western-green-deep/15" />
        </div>
        <h4 className="font-display text-lg md:text-xl text-western-green-deep leading-tight mb-1.5">
          É para o seu projeto residencial?
        </h4>
        <p className="text-[13px] leading-snug text-western-green-deep/80 mb-4">
          Sem CNPJ? A gente monta seu orçamento.
        </p>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <Link
            to={orcamentoTo}
            className="flex items-center justify-center text-center h-11 px-5 bg-western-green-deep text-western-cream hover:bg-western-green-deep/90 font-mono text-[11px] uppercase tracking-[0.22em] transition-colors w-full sm:w-auto whitespace-normal"
          >
            Peça um orçamento
          </Link>
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-western-stone-warm hover:text-western-green-deep transition-colors"
          >
            <MessageCircle className="h-3.5 w-3.5" /> Falar no WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}

