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
      className={`rounded-[16px] border border-[#B3372E]/35 bg-[#B3372E]/[0.06] text-western-stone-dark ${compact ? "p-3" : "p-5"} ${className ?? ""}`}
    >
      <div className="flex items-start gap-3">
        <AlertTriangle className={`${compact ? "h-5 w-5 mt-0.5" : "h-6 w-6 mt-0.5"} flex-shrink-0 text-[#B3372E]`} />
        <div className="flex-1 min-w-0">
          <p className={`font-semibold text-[#B3372E] ${compact ? "text-[16px]" : "text-[17px]"}`}>
            Falha ao carregar
          </p>
          <p className={`text-[15px] leading-[1.5] text-western-stone-dark/85 ${compact ? "mt-0.5" : "mt-1"}`}>
            {message ?? "Não foi possível carregar. Tentar de novo."}
          </p>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="tap-target mt-3 inline-flex items-center gap-2 rounded-[10px] border border-[#B3372E]/50 px-5 text-[16px] font-semibold text-[#B3372E] hover:bg-[#B3372E]/[0.1] transition-colors"
            >
              <RefreshCw className="h-4 w-4" /> Tentar de novo
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
