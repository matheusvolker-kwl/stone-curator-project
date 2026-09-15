// Mensagens do Supabase Auth em português.
//
// O Supabase devolve inglês cru ("email rate limit exceeded", "New password
// should be different from the old password") e o parceiro lia isso num toast
// sem saber o que fazer. A ordem dos testes importa: o "invalid" genérico do
// link vencido fica por último, senão engoliria "invalid email".

interface ErroAuth {
  message?: string;
  code?: string;
}

export function traduzirErroAuth(e: ErroAuth | null | undefined): string {
  const msg = (e?.message ?? "").toLowerCase();
  const code = (e?.code ?? "").toLowerCase();
  if (code === "same_password" || msg.includes("different from the old")) {
    return "A nova senha precisa ser diferente da atual.";
  }
  if (code === "weak_password" || msg.includes("password should") || msg.includes("weak password")) {
    return "Senha fraca. Use pelo menos 8 caracteres, com algum número.";
  }
  if (
    code.includes("rate_limit") ||
    msg.includes("rate limit") ||
    msg.includes("security purposes") ||
    msg.includes("too many")
  ) {
    return "Muitos pedidos seguidos. Espere um minuto e tente de novo.";
  }
  if (code === "email_address_invalid" || msg.includes("validate email") || msg.includes("invalid email")) {
    return "Confira o e-mail digitado.";
  }
  if (code.startsWith("session_") || msg.includes("session missing") || msg.includes("jwt")) {
    return "Sua sessão de redefinição acabou. Peça um novo link.";
  }
  if (code === "otp_expired" || msg.includes("expired") || msg.includes("invalid")) {
    return "Este link já foi usado ou expirou. Peça um novo.";
  }
  return "Não deu para concluir agora. Tente de novo em instantes.";
}
