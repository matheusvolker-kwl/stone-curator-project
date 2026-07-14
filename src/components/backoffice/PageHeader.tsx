import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Cabeçalho de tela do backoffice.
 *
 *   <PageHeader
 *     titulo="Credenciamentos"
 *     subtitulo="Cadastros que precisam de revisão humana."
 *     acao={<button className="btn-primary">Aprovar selecionados</button>}
 *   />
 *
 * Com voltar (telas de detalhe):
 *   <PageHeader voltar={{ to: "/admin/parceiros", label: "Parceiros" }} titulo="Genesis Piscinas" />
 *
 * REGRA: UMA única ação primária por tela, e no V3 ela é VERDE (.btn-primary).
 * Ação secundária vai no slot `acoesSecundarias` (outline), nunca como um
 * segundo botão cheio competindo pela atenção.
 */

interface Props {
  titulo: string;
  subtitulo?: string;
  /** Rótulo curto acima do título (eyebrow). */
  eyebrow?: string;
  /** A ÚNICA ação primária da tela. Verde. */
  acao?: React.ReactNode;
  /** Ações de apoio (outline/texto). */
  acoesSecundarias?: React.ReactNode;
  voltar?: { to: string; label: string };
  className?: string;
}

export function PageHeader({
  titulo,
  subtitulo,
  eyebrow,
  acao,
  acoesSecundarias,
  voltar,
  className,
}: Props) {
  return (
    <header className={cn("mb-8", className)}>
      {voltar && (
        <Link
          to={voltar.to}
          className="inline-flex items-center gap-1 -ml-1 mb-3 text-[16px] font-semibold text-western-stone-warm hover:text-western-green-deep transition-colors"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          {voltar.label}
        </Link>
      )}

      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          {eyebrow && <p className="text-eyebrow mb-2">{eyebrow}</p>}
          <h1 className="display-md text-western-green-deep">{titulo}</h1>
          {subtitulo && <p className="text-body mt-2 max-w-2xl">{subtitulo}</p>}
        </div>

        {(acao || acoesSecundarias) && (
          <div className="flex flex-shrink-0 flex-wrap items-center gap-3">
            {acoesSecundarias}
            {acao}
          </div>
        )}
      </div>
    </header>
  );
}
