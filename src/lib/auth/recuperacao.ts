// O link de "esqueci a senha", onde quer que ele caia.
//
// O e-mail leva ao /parceiro/redefinir-senha — mas se o endereço de volta não
// está na lista do Supabase (ex.: o pedido foi feito numa prévia do Cloudflare),
// ele devolve para a URL padrão do site: a pessoa entra LOGADA na home e nunca
// vê o formulário de nova senha. Foi o "reset quebrado" de 15/09.
//
// Este módulo é importado no main.tsx, na carga: lê a URL antes de o cliente do
// Supabase limpá-la, e ouve o PASSWORD_RECOVERY antes de o cliente terminar de
// processar o link — registrado depois, o evento passaria sem ninguém ouvir.
import { supabase } from "@/integrations/supabase/client";

export const ROTA_REDEFINIR_SENHA = "/parceiro/redefinir-senha";

export interface LinkRecebido {
  /** error_code do link (otp_expired…) — link usado, vencido ou inválido */
  erro: string | null;
  /** link no formato ?token_hash=…&type=recovery (template de e-mail próprio) */
  tokenHash: string | null;
}

export function lerLink(): LinkRecebido {
  if (typeof window === "undefined") return { erro: null, tokenHash: null };
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  const query = new URLSearchParams(window.location.search);
  return {
    erro: hash.get("error_code") || query.get("error_code") || hash.get("error") || query.get("error"),
    tokenHash: query.get("type") === "recovery" ? query.get("token_hash") : null,
  };
}

/** O que a URL trazia quando o site abriu. A página de redefinir consome e zera. */
export const linkInicial: LinkRecebido = lerLink();

/** Para onde levar a pessoa quando o Supabase avisa um evento de login. */
export function destinoDoEvento(evento: string, caminho: string): string | null {
  if (evento !== "PASSWORD_RECOVERY") return null;
  return caminho === ROTA_REDEFINIR_SENHA ? null : ROTA_REDEFINIR_SENHA;
}

if (typeof window !== "undefined") {
  supabase.auth.onAuthStateChange((evento) => {
    const destino = destinoDoEvento(evento, window.location.pathname);
    // A sessão de recuperação já está salva: recarregar na página certa basta.
    if (destino) window.location.replace(destino);
  });
}
