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
      className={`border border-red-400/60 bg-red-50 text-red-800 ${compact ? "p-3" : "p-5"} ${className ?? ""}`}
    >
      <div className="flex items-start gap-3">
        <AlertTriangle className={`${compact ? "h-4 w-4 mt-0.5" : "h-5 w-5 mt-0.5"} flex-shrink-0`} />
        <div className="flex-1 min-w-0">
          <p className={`font-mono uppercase tracking-[0.18em] ${compact ? "text-[10px]" : "text-[11px]"} text-red-800`}>
            Falha ao carregar
          </p>
          <p className={`${compact ? "text-xs mt-0.5" : "text-sm mt-1"}`}>
            {message ?? "Não foi possível carregar. Tentar de novo."}
          </p>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className={`mt-2 inline-flex items-center gap-1.5 font-mono uppercase tracking-[0.18em] ${
                compact ? "text-[10px]" : "text-[11px]"
              } border border-red-700/50 text-red-800 hover:bg-red-100 px-3 py-1.5`}
            >
              <RefreshCw className="h-3 w-3" /> Tentar de novo
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
