import { describe, expect, it, vi } from "vitest";

const { ouvintes } = vi.hoisted(() => ({ ouvintes: [] as Array<(evento: string) => void> }));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      onAuthStateChange: (cb: (evento: string) => void) => {
        ouvintes.push(cb);
        return { data: { subscription: { unsubscribe() {} } } };
      },
    },
  },
}));

import { ROTA_REDEFINIR_SENHA, destinoDoEvento, lerLink } from "./recuperacao";
import { traduzirErroAuth } from "./erros";

describe("lerLink — o que o link do e-mail trouxe", () => {
  it("link vencido (o redirect real do Supabase)", () => {
    window.history.replaceState(
      null,
      "",
      "/parceiro/redefinir-senha#error=access_denied&error_code=otp_expired&error_description=Email+link+is+invalid+or+has+expired&sb=",
    );
    expect(lerLink()).toEqual({ erro: "otp_expired", tokenHash: null });
  });

  it("link bom no formato padrão não é erro", () => {
    window.history.replaceState(null, "", "/parceiro/redefinir-senha#access_token=x&type=recovery");
    expect(lerLink()).toEqual({ erro: null, tokenHash: null });
  });

  it("token_hash só vale para recovery", () => {
    window.history.replaceState(null, "", "/parceiro/redefinir-senha?token_hash=abc&type=recovery");
    expect(lerLink().tokenHash).toBe("abc");
    window.history.replaceState(null, "", "/parceiro/redefinir-senha?token_hash=abc&type=signup");
    expect(lerLink().tokenHash).toBeNull();
  });
});

describe("destinoDoEvento — a sessão de recuperação sempre chega ao formulário", () => {
  it("o ouvinte é registrado na carga do módulo", () => {
    expect(ouvintes).toHaveLength(1);
  });

  it("caiu na home (redirect fora da lista): leva ao formulário", () => {
    expect(destinoDoEvento("PASSWORD_RECOVERY", "/")).toBe(ROTA_REDEFINIR_SENHA);
  });

  it("já está no formulário: não recarrega", () => {
    expect(destinoDoEvento("PASSWORD_RECOVERY", ROTA_REDEFINIR_SENHA)).toBeNull();
  });

  it("login comum não mexe em nada", () => {
    expect(destinoDoEvento("SIGNED_IN", "/")).toBeNull();
    expect(destinoDoEvento("INITIAL_SESSION", "/minha-conta")).toBeNull();
  });
});

describe("traduzirErroAuth — nada de inglês cru no toast", () => {
  it.each([
    [{ message: "email rate limit exceeded", code: "over_email_send_rate_limit" }, "Muitos pedidos seguidos"],
    [{ message: "For security purposes, you can only request this after 42 seconds." }, "Muitos pedidos seguidos"],
    [{ message: "New password should be different from the old password.", code: "same_password" }, "diferente da atual"],
    [{ message: "Password should be at least 6 characters.", code: "weak_password" }, "Senha fraca"],
    [{ message: "Auth session missing!" }, "sessão de redefinição acabou"],
    [{ message: "Email link is invalid or has expired", code: "otp_expired" }, "já foi usado ou expirou"],
    [{ message: "Unable to validate email address: invalid format", code: "email_address_invalid" }, "Confira o e-mail"],
    [{ message: "algo inesperado" }, "Tente de novo"],
  ])("%j", (erro, trecho) => {
    expect(traduzirErroAuth(erro)).toContain(trecho);
  });
});
