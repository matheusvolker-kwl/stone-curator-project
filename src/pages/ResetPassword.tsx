import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import EmailInput from "@/components/forms/EmailInput";
import PasswordField from "@/components/forms/PasswordField";
import FieldLabel from "@/components/forms/FieldLabel";
import Seo from "@/components/seo/Seo";
import { BUSINESS } from "@/config/business";
import { emailSchema, passwordSchema } from "@/lib/forms/br";
import { traduzirErroAuth } from "@/lib/auth/erros";
import { ROTA_REDEFINIR_SENHA, linkInicial } from "@/lib/auth/recuperacao";

/**
 * Redefinir senha — quatro estados, nunca uma tela muda:
 *   verificando → lendo o link (não pisca "abra o link" para quem acabou de abrir)
 *   pronto      → formulário da nova senha
 *   expirado    → o link já foi usado ou venceu: diz isso e pede outro aqui mesmo
 *   sem-link    → chegou sem link: explica e oferece o envio
 * Antes eram dois, e o link vencido caía em "Abra o link enviado por e-mail" —
 * a pessoa tinha acabado de abrir e ficava sem saída.
 */
type Estado = "verificando" | "pronto" | "expirado" | "sem-link";

const waSenhaUrl = `https://wa.me/${BUSINESS.whatsappFabrica}?text=${encodeURIComponent(
  "Olá Western! Não estou conseguindo redefinir a senha da minha conta de parceiro.",
)}`;

function PedirNovoLink() {
  const [email, setEmail] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    const r = emailSchema.safeParse(email);
    if (!r.success) {
      toast.error("Informe um e-mail válido.");
      return;
    }
    setEnviando(true);
    const { error } = await supabase.auth.resetPasswordForEmail(r.data, {
      redirectTo: `${window.location.origin}${ROTA_REDEFINIR_SENHA}`,
    });
    setEnviando(false);
    if (error) {
      toast.error(traduzirErroAuth(error));
      return;
    }
    setEnviado(true);
  };

  if (enviado) {
    return (
      <p className="text-body" role="status">
        Pronto. Se o e-mail estiver cadastrado, o link chega em instantes — confira também o spam.
        Use sempre o link mais recente.
      </p>
    );
  }

  return (
    <form onSubmit={enviar} className="space-y-6" noValidate>
      <div>
        <FieldLabel htmlFor="email-reset">E-mail do cadastro</FieldLabel>
        <EmailInput id="email-reset" value={email} onChange={setEmail} required autoComplete="email" />
      </div>
      <Button type="submit" disabled={enviando} size="lg" className="w-full">
        {enviando ? (
          <>
            <Loader2 className="animate-spin" aria-hidden="true" /> Enviando…
          </>
        ) : (
          "Enviar novo link"
        )}
      </Button>
    </form>
  );
}

export default function ResetPassword() {
  const [estado, setEstado] = useState<Estado>(linkInicial.erro ? "expirado" : "verificando");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ password?: string; confirm?: string }>({});
  const navigate = useNavigate();
  const { refresh } = useAuth();

  useEffect(() => {
    // O link já disse que venceu: só limpa a barra de endereço (recarregar não
    // deve repetir a mensagem) e mostra o pedido de um novo.
    if (linkInicial.erro) {
      linkInicial.erro = null;
      window.history.replaceState(window.history.state, "", ROTA_REDEFINIR_SENHA);
      return;
    }
    let ativo = true;
    const liberar = () => {
      if (ativo) setEstado("pronto");
    };
    // O cliente do Supabase lê o link sozinho (#access_token…&type=recovery) e
    // guarda a sessão — que pode chegar antes OU depois desta página montar.
    const { data: sub } = supabase.auth.onAuthStateChange((evento, sessao) => {
      if (sessao && evento !== "SIGNED_OUT") liberar();
    });
    (async () => {
      // Link no formato ?token_hash= (template de e-mail próprio): valida aqui.
      // Zera antes de esperar, para o token nunca ser usado duas vezes.
      const tokenHash = linkInicial.tokenHash;
      linkInicial.tokenHash = null;
      if (tokenHash) {
        const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: "recovery" });
        window.history.replaceState(window.history.state, "", ROTA_REDEFINIR_SENHA);
        if (!ativo) return;
        if (error) {
          setEstado("expirado");
          return;
        }
      }
      const { data } = await supabase.auth.getSession();
      if (!ativo) return;
      if (data.session) liberar();
      else setEstado((e) => (e === "verificando" ? "sem-link" : e));
    })();
    return () => {
      ativo = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const r = passwordSchema.safeParse(password);
    const errs: { password?: string; confirm?: string } = {};
    if (!r.success) errs.password = r.error.issues[0]?.message;
    if (password !== confirm) errs.confirm = "As senhas não coincidem";
    if (errs.password || errs.confirm) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setLoading(true);
    const { data, error } = await supabase.auth.updateUser({ password });
    if (error) {
      setLoading(false);
      // Sessão de recuperação que acabou: o caminho é pedir outro link.
      if (error.code?.startsWith("session_") || /session missing|jwt/i.test(error.message)) {
        setEstado("expirado");
      }
      toast.error(traduzirErroAuth(error));
      return;
    }
    // Quem tinha senha provisória (gerada pelo admin) acabou de criar a sua:
    // limpa a marca, senão a tela de troca obrigatória abriria de novo.
    if (data.user) {
      await supabase
        .from("partner_profiles")
        .update({ senha_provisoria_em: null })
        .eq("user_id", data.user.id);
    }
    await refresh();
    setLoading(false);
    toast.success("Senha redefinida.");
    navigate("/minha-conta", { replace: true });
  };

  return (
    <div className="surface-ivory">
      <Seo
        title="Redefinir senha · Western"
        description="Defina uma nova senha para a sua conta de parceiro Western. Abra o link enviado por e-mail para continuar."
        path={ROTA_REDEFINIR_SENHA}
        noindex
      />
      <div className="container-western py-16 md:py-24 max-w-md">
        <p className="text-eyebrow mb-5">Recuperação de senha</p>
        <div className="w-12 h-px bg-western-gold mb-8" />

        {estado === "verificando" && (
          <>
            <h1 className="display-xl mb-6">Defina uma nova senha.</h1>
            <p className="text-body inline-flex items-center gap-2" role="status">
              <Loader2 className="h-5 w-5 animate-spin text-western-stone-warm" aria-hidden="true" />
              Validando o link…
            </p>
          </>
        )}

        {estado === "pronto" && (
          <>
            <h1 className="display-xl mb-6">Defina uma nova senha.</h1>
            <p className="text-body mb-8">
              Escolha uma senha nova para a sua conta de parceiro. Ela passa a valer no próximo acesso.
            </p>
            <form onSubmit={submit} className="space-y-6" noValidate>
              <div>
                <FieldLabel htmlFor="newpw">Nova senha</FieldLabel>
                <PasswordField
                  id="newpw"
                  value={password}
                  onChange={setPassword}
                  required
                  error={errors.password}
                />
              </div>
              <div>
                <FieldLabel htmlFor="newpw2">Confirmar senha</FieldLabel>
                <PasswordField
                  id="newpw2"
                  value={confirm}
                  onChange={setConfirm}
                  required
                  showStrength={false}
                  error={errors.confirm}
                />
              </div>
              <Button type="submit" disabled={loading} size="lg" className="w-full">
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" aria-hidden="true" /> Salvando…
                  </>
                ) : (
                  "Salvar nova senha"
                )}
              </Button>
            </form>
          </>
        )}

        {estado === "expirado" && (
          <>
            <h1 className="display-xl mb-6">Este link não vale mais.</h1>
            <p className="text-body mb-8">
              O link de redefinição vale por pouco tempo e só uma vez — e cada pedido novo anula os
              anteriores. Peça outro abaixo e use o mais recente.
            </p>
            <PedirNovoLink />
          </>
        )}

        {estado === "sem-link" && (
          <>
            <h1 className="display-xl mb-6">Defina uma nova senha.</h1>
            <p className="text-body mb-8">
              Esta página abre pelo link que enviamos por e-mail. Não recebeu ou perdeu o e-mail?
              Peça um novo.
            </p>
            <PedirNovoLink />
          </>
        )}

        {(estado === "expirado" || estado === "sem-link") && (
          <div className="mt-8 space-y-3 text-center font-sans text-[15px] text-western-stone-warm">
            <p>
              Lembrou a senha?{" "}
              <Link
                to="/parceiro/login"
                className="font-semibold text-western-green-deep underline underline-offset-4 decoration-western-bronze"
              >
                Entrar
              </Link>
            </p>
            <p>
              O e-mail não chega?{" "}
              <a
                href={waSenhaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-western-green-deep underline underline-offset-4 decoration-western-bronze"
              >
                Fale com a Western no WhatsApp
              </a>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
