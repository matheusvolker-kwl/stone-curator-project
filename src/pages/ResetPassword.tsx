import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import PasswordField from "@/components/forms/PasswordField";
import FieldLabel from "@/components/forms/FieldLabel";
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
      <div className="container-western py-16 md:py-24 max-w-md">
        <p className="text-eyebrow mb-5">Recuperação de senha</p>
        <div className="w-12 h-px bg-western-gold mb-8" />
        <h1 className="display-xl mb-6">Defina uma nova senha.</h1>
        {!ready ? (
          <p className="text-body">
            Abra o link de redefinição enviado por e-mail para continuar.
          </p>
        ) : (
          <>
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
      </div>
    </div>
  );
}
