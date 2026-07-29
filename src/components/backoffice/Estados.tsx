import { AlertTriangle, Inbox, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Os 4 estados do backoffice: carregando · vazio · ERRO · sucesso.
 *
 * Esta é a peça que impede o "0 silencioso" de voltar. Já aconteceu: um 403 em
 * `has_role` virou `data = null`, a tela mostrou "nenhum parceiro pendente" e o
 * dono ficou CEGO — achou que não tinha nada, quando na verdade a query tinha
 * falhado.
 *
 * A regra: VAZIO e ERRO são telas DIFERENTES e precisam PARECER diferentes.
 *   - vazio  = tom neutro, "não há nada aqui" (informativo, calmo)
 *   - erro   = tom de aviso (#B3372E), mostra a mensagem real + "Tentar de novo"
 *
 * Nunca escreva `const { data } = await supabase...` e jogue `data ?? []` na
 * tela. Guarde o `error` e passe para cá.
 *
 *   const { data, error } = await supabase.from("x").select("*");
 *   if (error) setErro(error);
 */

/* ─────────────────────────────────────────────────────────────
 * Carregando
 * ───────────────────────────────────────────────────────────── */

interface CarregandoProps {
  /** Quantas linhas-fantasma desenhar. Default 5. */
  linhas?: number;
  className?: string;
}

/** Skeleton de linhas — imita a tabela para o layout não "pular". */
export function EstadoCarregando({ linhas = 5, className }: CarregandoProps) {
  return (
    <div className={cn("divide-y divide-western-border-soft", className)} aria-busy="true" aria-live="polite">
      <span className="sr-only">Carregando…</span>
      {Array.from({ length: linhas }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 h-control px-4">
          <div className="h-3 rounded-sm bg-western-border-soft animate-pulse flex-1" style={{ maxWidth: "28%" }} />
          <div className="h-3 rounded-sm bg-western-border-soft/70 animate-pulse flex-1" style={{ maxWidth: "20%" }} />
          <div className="h-3 rounded-sm bg-western-border-soft/70 animate-pulse flex-1 hidden md:block" style={{ maxWidth: "18%" }} />
          <div className="h-3 rounded-sm bg-western-border-soft/50 animate-pulse w-16 ml-auto" />
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
 * Vazio
 * ───────────────────────────────────────────────────────────── */

interface VazioProps {
  titulo: string;
  mensagem?: string;
  /** Slot de ação — normalmente um <button className="btn-primary">. */
  acao?: React.ReactNode;
  icone?: React.ElementType;
  className?: string;
}

/** "Não há nada aqui" — tom NEUTRO. Não é erro, e não pode parecer erro. */
export function EstadoVazio({ titulo, mensagem, acao, icone: Icone = Inbox, className }: VazioProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        "rounded-xl border border-dashed border-western-border-strong bg-western-paper",
        "px-6 py-14",
        className,
      )}
    >
      <Icone className="h-7 w-7 text-western-stone-warm/50" aria-hidden="true" />
      <p className="mt-4 font-display text-[18px] font-semibold text-western-green-deep">{titulo}</p>
      {mensagem && <p className="text-body mt-2 max-w-md">{mensagem}</p>}
      {acao && <div className="mt-6">{acao}</div>}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
 * ERRO
 * ───────────────────────────────────────────────────────────── */

/** Extrai uma mensagem legível de qualquer coisa que o Supabase/fetch jogue. */
export function mensagemDeErro(erro: unknown): string {
  if (!erro) return "Erro desconhecido.";
  if (typeof erro === "string") return erro;
  if (erro instanceof Error) return erro.message;
  if (typeof erro === "object") {
    const e = erro as { message?: unknown; error_description?: unknown; details?: unknown; hint?: unknown };
    const base = e.message ?? e.error_description ?? e.details;
    if (typeof base === "string" && base.trim()) {
      return typeof e.hint === "string" && e.hint.trim() ? `${base} (${e.hint})` : base;
    }
  }
  return "Erro desconhecido.";
}

interface ErroProps {
  /** O erro cru (PostgrestError, Error, string…). A mensagem real É mostrada. */
  erro: unknown;
  onRetry?: () => void;
  /** Default: "Não consegui carregar". */
  titulo?: string;
  /** Versão enxuta, para caber dentro de um card. */
  compacto?: boolean;
  className?: string;
}

/**
 * Estado de ERRO — visualmente DIFERENTE do vazio (tom #B3372E, ícone de aviso,
 * mensagem real do erro e "Tentar de novo"). Um erro NUNCA pode se disfarçar de
 * lista vazia.
 */
export function EstadoErro({ erro, onRetry, titulo = "Não consegui carregar", compacto, className }: ErroProps) {
  const msg = mensagemDeErro(erro);

  return (
    <div
      role="alert"
      className={cn(
        "rounded-xl border border-status-error/35 bg-status-error/[0.06]",
        compacto ? "p-4" : "px-6 py-8",
        className,
      )}
    >
      <div className={cn("flex gap-3", compacto ? "items-start" : "items-start")}>
        <AlertTriangle className="h-5 w-5 flex-shrink-0 text-status-error mt-0.5" aria-hidden="true" />

        <div className="flex-1 min-w-0">
          <p className={cn("font-semibold text-status-error", compacto ? "text-[15px]" : "text-[16px]")}>{titulo}</p>

          {/* A mensagem REAL do erro. É isto que evita o dono ficar cego. */}
          <p className="text-[15px] leading-[1.5] text-western-stone-dark/85 mt-1 break-words">{msg}</p>

          <p className="text-meta mt-2">
            Isto é uma falha de carregamento — não quer dizer que a lista esteja vazia.
          </p>

          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className={cn(
                "tap-target mt-4 inline-flex items-center justify-center gap-2 rounded-lg px-5",
                "border border-status-error/50 text-status-error font-semibold text-[15px]",
                "hover:bg-status-error/10 transition-colors",
              )}
            >
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              Tentar de novo
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
