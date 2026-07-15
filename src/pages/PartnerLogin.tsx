import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ShieldCheck, MessageCircle, ArrowRight } from "lucide-react";
import { BUSINESS } from "@/config/business";
import EmailInput from "@/components/forms/EmailInput";
import PasswordField from "@/components/forms/PasswordField";
import FieldLabel from "@/components/forms/FieldLabel";
import { emailSchema } from "@/lib/forms/br";

const waClienteFinalUrl = `https://wa.me/${BUSINESS.whatsappFabrica}?text=${encodeURIComponent(
  "Olá Western! Sou cliente final e gostaria de comprar / fazer um projeto com pedras Western."
)}`;

export default function PartnerLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const navigate = useNavigate();
  const [params] = useSearchParams();
  // Aprovado cai direto no catálogo (comprar), não na conta — a conta fica a um
  // clique no header. Se veio de uma página específica (?next=), volta pra ela.
  const next = params.get("next") || "/linhas";

  // If already logged in, send to next/account
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate(next, { replace: true });
    });
  }, [navigate, next]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const r = emailSchema.safeParse(email);
    if (!r.success) {
      toast.error(r.error.issues[0]?.message ?? "E-mail inválido");
      return;
    }
    if (password.length < 1) {
      toast.error("Informe sua senha.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email: r.data, password });
    setLoading(false);
    if (error) {
      toast.error("Não foi possível entrar.", { description: error.message });
      return;
    }

    // Check approval status
    const { data: profile } = await supabase
      .from("partner_profiles")
      .select("status, empresa")
      .maybeSingle();
    if (profile?.status === "pending") {
      toast.info("Cadastro em análise", {
        description: "Liberamos seu acesso por e-mail em breve.",
      });
      navigate("/minha-conta", { replace: true });
      return;
    }
    if (profile?.status === "rejected") {
      toast.error("Acesso indisponível.", {
        description: "Fale com o comercial pelo WhatsApp.",
      });
      navigate("/minha-conta", { replace: true });
      return;
    }
    toast.success(`Bem-vindo${profile?.empresa ? `, ${profile.empresa}` : ""}.`);
    navigate(next, { replace: true });
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    const r = emailSchema.safeParse(email);
    if (!r.success) {
      toast.error("Informe um e-mail válido.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(r.data, {
      redirectTo: `${window.location.origin}/parceiro/redefinir-senha`,
    });
    setLoading(false);
    if (error) toast.error(error.message);
    else toast.success("Enviamos um e-mail com o link de redefinição.");
    setShowReset(false);
  };

  return (
    <div className="surface-ivory">
      <div className="container-western py-16 md:py-24 max-w-5xl">
        <div className="grid md:grid-cols-[1fr_1.1fr] gap-10 md:gap-16 items-start">
          {/* COLUNA ESQUERDA — contexto B2B + saída pra cliente final */}
          <aside className="space-y-6 md:space-y-8 md:sticky md:top-28 order-2 md:order-1">
            <div className="hidden md:block">
              <p className="text-eyebrow mb-4">Acesso restrito</p>
              <div className="w-12 h-px bg-western-gold mb-6" />
              <h2 className="display-lg mb-5">Plataforma exclusiva para parceiros aprovados.</h2>
              <p className="text-body">
                A Western atende profissionais e empresas do paisagismo e da construção com CNPJ ativo — de arquitetos e paisagistas a laguistas, jardineiros, garden centers, lojas e construtoras. O acesso à tabela comercial, modelos 3D e composições é liberado automaticamente para profissionais do ramo, na hora do cadastro.
              </p>
            </div>

            {/* Card 1 — Solicitar cadastro (dourado sobre verde: acento permitido) */}
            <Link
              to="/parceiro/cadastro"
              className="group block rounded-[16px] surface-forest p-6 md:p-8 transition-colors duration-200 hover:bg-western-green-mid"
            >
              <div className="flex items-start gap-4 mb-5">
                <ShieldCheck className="h-6 w-6 flex-shrink-0 text-western-gold-soft mt-0.5" strokeWidth={1.75} aria-hidden="true" />
                <div>
                  <p className="font-sans text-[14px] font-semibold uppercase tracking-[0.06em] text-western-gold-soft mb-2">
                    Sou empresa / profissional
                  </p>
                  <p className="display-md text-western-cream">Solicitar credenciamento B2B.</p>
                </div>
              </div>
              <p className="font-sans text-[16px] leading-relaxed text-western-cream/80 mb-6 max-w-sm">
                Cadastro gratuito com CNPJ. Aprovação automática para profissionais do ramo — preço de parceiro, modelos 3D e composições liberados na hora.
              </p>
              <span className="btn-gold w-full sm:w-auto">
                Fazer cadastro
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </span>
            </Link>

            {/* Card 2 — Cliente final → WhatsApp */}
            <a
              href={waClienteFinalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group block rounded-[16px] border border-western-border-soft bg-western-paper p-6 md:p-8 transition-colors duration-200 hover:border-western-border-strong hover:bg-western-cream/40"
            >
              <div className="flex items-start gap-4 mb-5">
                <MessageCircle className="h-6 w-6 flex-shrink-0 text-western-bronze mt-0.5" strokeWidth={1.75} aria-hidden="true" />
                <div>
                  <p className="font-sans text-[14px] font-semibold uppercase tracking-[0.06em] text-western-bronze mb-2">
                    Sou cliente final
                  </p>
                  <p className="display-md text-western-green-deep">Quero fazer um projeto</p>
                </div>
              </div>
              <p className="font-sans text-[16px] leading-relaxed text-western-stone-warm mb-6 max-w-sm">
                Atendimento direto com nosso time pelo WhatsApp — indicamos um arquiteto parceiro ou cuidamos do seu projeto residencial.
              </p>
              <span className="btn-outline-forest w-full sm:w-auto">
                Falar no WhatsApp
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </span>
            </a>
          </aside>

          {/* COLUNA DIREITA — formulário */}
          <div className="md:max-w-md md:mx-auto w-full order-1 md:order-2">
            <p className="text-eyebrow mb-5">Acesso de parceiro</p>
            <div className="w-12 h-px bg-western-gold mb-8" />
            <h1 className="display-xl mb-4">{showReset ? "Recuperar senha." : "Entrar."}</h1>
            <p className="text-body mb-8">
              {showReset
                ? "Informe o e-mail do cadastro e enviamos um link para você criar uma nova senha."
                : "Entre com o e-mail e a senha do seu cadastro de parceiro para ver preço, modelos 3D e composições."}
            </p>

            <form className="space-y-6" onSubmit={showReset ? handleReset : handleLogin} noValidate>
              <div>
                <FieldLabel htmlFor="email">E-mail</FieldLabel>
                <EmailInput
                  id="email"
                  value={email}
                  onChange={setEmail}
                  required
                  autoComplete="email"
                />
              </div>
              {!showReset && (
                <div>
                  <FieldLabel htmlFor="password">Senha</FieldLabel>
                  <PasswordField
                    id="password"
                    value={password}
                    onChange={setPassword}
                    required
                    showStrength={false}
                    autoComplete="current-password"
                  />
                </div>
              )}

              <Button type="submit" disabled={loading} size="lg" className="w-full">
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" aria-hidden="true" /> {showReset ? "Enviando…" : "Entrando…"}
                  </>
                ) : showReset ? (
                  "Enviar link"
                ) : (
                  "Entrar"
                )}
              </Button>

              <button
                type="button"
                onClick={() => setShowReset((v) => !v)}
                className="tap-target mx-auto flex items-center justify-center px-2 font-sans text-[16px] font-semibold text-western-green-deep underline underline-offset-4 decoration-western-bronze transition-colors hover:text-western-cta"
              >
                {showReset ? "Voltar ao login" : "Esqueci minha senha"}
              </button>
            </form>

            <p className="font-sans text-[16px] text-western-stone-warm mt-8 text-center md:hidden">
              Ainda não é parceiro?{" "}
              <Link
                to="/parceiro/cadastro"
                className="font-semibold text-western-green-deep underline underline-offset-4 decoration-western-bronze"
              >
                Solicite cadastro
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
