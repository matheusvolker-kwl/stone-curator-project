/**
 * Telemetria leve para registrar falhas críticas do cliente.
 *
 * - Loga sempre no console (visível para o dev em qualquer ambiente).
 * - Envia para a edge function `log-client-error`, que persiste em
 *   `public.client_errors` e dispara webhook (Slack/Discord) se
 *   `ALERT_WEBHOOK_URL` estiver configurado.
 *
 * Falhas no envio NUNCA bloqueiam o fluxo do usuário.
 */
import { supabase } from "@/integrations/supabase/client";

export type Severity = "error" | "warn" | "info";

export interface ReportErrorInput {
  source: string;
  message?: string;
  error?: unknown;
  severity?: Severity;
  context?: Record<string, unknown>;
}

function extractMessage(error: unknown, fallback = "Unknown error"): string {
  if (!error) return fallback;
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message || fallback;
  if (typeof error === "object" && error && "message" in error) {
    const m = (error as { message?: unknown }).message;
    if (typeof m === "string") return m;
  }
  try {
    return JSON.stringify(error);
  } catch {
    return fallback;
  }
}

function extractStack(error: unknown): string | undefined {
  if (error instanceof Error && error.stack) return error.stack;
  return undefined;
}

export async function reportError({
  source,
  message,
  error,
  severity = "error",
  context = {},
}: ReportErrorInput): Promise<void> {
  const finalMessage = message ?? extractMessage(error);
  const stack = extractStack(error);

  // Sempre loga no console primeiro
  const logFn = severity === "error" ? console.error : severity === "warn" ? console.warn : console.info;
  logFn(`[telemetry] ${source}: ${finalMessage}`, { context, error });

  if (typeof window === "undefined") return;

  try {
    await supabase.functions.invoke("log-client-error", {
      body: {
        source,
        severity,
        message: finalMessage,
        stack,
        url: window.location.href,
        context,
      },
    });
  } catch (err) {
    // Telemetria nunca quebra o app
    console.warn("[telemetry] failed to ship error", err);
  }
}
