import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import PasswordField from "@/components/forms/PasswordField";
import { passwordSchema } from "@/lib/forms/br";

export default function ResetPassword() {
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ password?: string; confirm?: string }>({});
  const navigate = useNavigate();

  useEffect(() => {
    // Supabase auto-processes the recovery token in the URL hash and emits PASSWORD_RECOVERY.
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") setReady(true);
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    return () => sub.subscription.unsubscribe();
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
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Senha redefinida.");
    navigate("/minha-conta", { replace: true });
  };

  return (
    <div className="surface-ivory">
      <div className="container-western py-20 md:py-28 max-w-md">
        <p className="text-eyebrow mb-5">Recuperação de senha</p>
        <div className="w-12 h-px bg-western-gold mb-8" />
        <h1 className="font-display text-4xl md:text-5xl text-western-green-deep leading-[1.05] mb-10">
          Defina uma nova senha.
        </h1>
        {!ready ? (
          <p className="text-western-stone-warm">
            Abra o link de redefinição enviado por e-mail para continuar.
          </p>
        ) : (
          <form onSubmit={submit} className="space-y-6" noValidate>
            <div>
              <Label htmlFor="newpw" className="text-eyebrow mb-3 block">Nova senha</Label>
              <PasswordField
                id="newpw"
                value={password}
                onChange={setPassword}
                required
                error={errors.password}
              />
            </div>
            <div>
              <Label htmlFor="newpw2" className="text-eyebrow mb-3 block">Confirmar</Label>
              <PasswordField
                id="newpw2"
                value={confirm}
                onChange={setConfirm}
                required
                showStrength={false}
                error={errors.confirm}
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-western-green-deep text-western-cream hover:bg-western-green-mid font-mono text-xs uppercase tracking-[0.25em] rounded-none disabled:opacity-60"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar nova senha"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
