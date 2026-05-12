import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ShieldCheck, MessageCircle, ArrowRight } from "lucide-react";
import { BUSINESS } from "@/config/business";

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
  const next = params.get("next") || "/minha-conta";

  // If already logged in, send to next/account
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate(next, { replace: true });
    });
  }, [navigate, next]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
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
        description: "Liberaremos seu acesso em até 2 dias úteis.",
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
    if (!email) {
      toast.error("Informe seu e-mail acima.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
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
          <aside className="space-y-8 md:sticky md:top-28">
            <div>
              <p className="text-eyebrow mb-4">Acesso restrito</p>
              <div className="w-12 h-px bg-western-gold mb-6" />
              <h2 className="font-display text-3xl md:text-4xl text-western-green-deep leading-[1.1] mb-5">
                Plataforma exclusiva para parceiros aprovados.
              </h2>
              <p className="text-western-stone-warm leading-relaxed text-[15px] md:text-base">
                Este site da Western atende exclusivamente arquitetos, paisagistas, construtoras e
                garden centers com CNPJ ativo. O acesso à tabela comercial, modelos 3D e
                composições só é liberado após análise do cadastro — leva até 2 dias úteis.
              </p>
            </div>

            {/* Card 1 — Solicitar cadastro */}
            <Link
              to="/parceiro/cadastro"
              className="group relative block bg-western-green-deep text-western-cream p-7 md:p-8 transition-colors duration-500 hover:bg-western-green-mid"
            >
              <div className="flex items-start gap-4 mb-5">
                <ShieldCheck className="h-6 w-6 text-western-gold-soft mt-0.5 flex-shrink-0" strokeWidth={1.4} />
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-western-gold-soft mb-2">
                    Sou empresa / profissional
                  </p>
                  <p className="font-display text-xl md:text-[22px] leading-tight">
                    Solicitar credenciamento B2B.
                  </p>
                </div>
              </div>
              <span className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.24em] text-western-cream link-underline">
                Fazer cadastro <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>

            {/* Card 2 — Cliente final → WhatsApp */}
            <a
              href={waClienteFinalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative block border border-western-stone-warm/25 bg-western-paper/60 p-7 md:p-8 transition-colors duration-500 hover:border-western-gold/60 hover:bg-western-paper"
            >
              <div className="flex items-start gap-4 mb-5">
                <MessageCircle className="h-6 w-6 text-western-gold mt-0.5 flex-shrink-0" strokeWidth={1.4} />
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-western-gold mb-2">
                    Sou cliente final
                  </p>
                  <p className="font-display text-xl md:text-[22px] leading-tight text-western-green-deep">
                    Quero fazer um projeto
                  </p>
                </div>
              </div>
              <p className="text-[13px] text-western-stone-warm leading-relaxed mb-5 max-w-sm">
                Atendimento direto com nosso time pelo WhatsApp — indicamos um arquiteto
                parceiro ou cuidamos do seu projeto residencial.
              </p>
              <span className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.24em] text-western-green-deep link-underline">
                Falar no WhatsApp <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </span>
            </a>
          </aside>

          {/* COLUNA DIREITA — formulário */}
          <div className="md:max-w-md md:mx-auto w-full">
            <p className="text-eyebrow mb-5">Acesso de parceiro</p>
            <div className="w-12 h-px bg-western-gold mb-8" />
            <h1 className="font-display text-4xl md:text-5xl text-western-green-deep leading-[1.05] mb-10">
              {showReset ? "Recuperar senha." : "Entrar."}
            </h1>

            <form className="space-y-6" onSubmit={showReset ? handleReset : handleLogin}>
              <div>
                <Label htmlFor="email" className="text-eyebrow mb-3 block">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="h-12 bg-transparent border-western-stone-warm/30 rounded-none text-western-green-deep focus-visible:border-western-gold"
                />
              </div>
              {!showReset && (
                <div>
                  <Label htmlFor="password" className="text-eyebrow mb-3 block">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    className="h-12 bg-transparent border-western-stone-warm/30 rounded-none text-western-green-deep focus-visible:border-western-gold"
                  />
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-western-green-deep text-western-cream hover:bg-western-green-mid font-mono text-xs uppercase tracking-[0.25em] rounded-none disabled:opacity-60"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : showReset ? "Enviar link" : "Entrar"}
              </Button>

              <button
                type="button"
                onClick={() => setShowReset((v) => !v)}
                className="block mx-auto text-spec text-western-stone-warm hover:text-western-gold link-underline"
              >
                {showReset ? "← Voltar ao login" : "Esqueci minha senha"}
              </button>
            </form>

            <p className="text-spec text-western-stone-warm mt-8 text-center md:hidden">
              Ainda não é parceiro?{" "}
              <Link to="/parceiro/cadastro" className="link-underline text-western-gold">
                Solicite cadastro
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
