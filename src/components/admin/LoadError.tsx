import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  message?: string;
  onRetry?: () => void;
  compact?: boolean;
  className?: string;
}

/** Estado de ERRO de carregamento — diferente e visível vs. "vazio". */
export function LoadError({ message, onRetry, compact, className }: Props) {
  return (
    <div
      role="alert"
      className={`rounded-xl border border-status-error/35 bg-status-error/[0.06] text-western-stone-dark ${compact ? "p-3" : "p-5"} ${className ?? ""}`}
    >
      <div className="flex items-start gap-3">
        <AlertTriangle className={`${compact ? "h-5 w-5 mt-0.5" : "h-6 w-6 mt-0.5"} flex-shrink-0 text-status-error`} />
        <div className="flex-1 min-w-0">
          <p className={`font-semibold text-status-error ${compact ? "text-[15px]" : "text-[16px]"}`}>
            Falha ao carregar
          </p>
          <p className={`text-[15px] leading-[1.5] text-western-stone-dark/85 ${compact ? "mt-0.5" : "mt-1"}`}>
            {message ?? "Não foi possível carregar. Tentar de novo."}
          </p>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="tap-target mt-3 inline-flex items-center gap-2 rounded-lg border border-status-error/50 px-5 text-[15px] font-semibold text-status-error hover:bg-status-error/[0.1] transition-colors"
            >
              <RefreshCw className="h-4 w-4" /> Tentar de novo
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
