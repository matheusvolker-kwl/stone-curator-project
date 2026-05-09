import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

export default function PartnerLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = params.get("next") || "/parceiro/conta";

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
    } else if (profile?.status === "rejected") {
      toast.error("Acesso indisponível.", {
        description: "Fale com o comercial pelo WhatsApp.",
      });
    } else {
      toast.success(`Bem-vindo${profile?.empresa ? `, ${profile.empresa}` : ""}.`);
    }
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
      <div className="container-western py-20 md:py-28 max-w-md">
        <p className="text-eyebrow mb-5">Acesso de parceiro</p>
        <div className="w-12 h-px bg-western-gold mb-8" />
        <h1 className="font-display text-4xl md:text-5xl text-western-green-deep leading-[1.05] mb-12">
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

        <p className="text-spec text-western-stone-warm mt-8 text-center">
          Ainda não é parceiro?{" "}
          <Link to="/parceiro/cadastro" className="link-underline text-western-gold">
            Solicite cadastro
          </Link>
        </p>
      </div>
    </div>
  );
}
