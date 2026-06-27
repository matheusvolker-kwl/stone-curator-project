import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Loader2, AlertTriangle } from "lucide-react";
import { passwordSchema } from "@/lib/forms/br";

export default function AccountPreferences() {
  const { user, signOut, refresh } = useAuth();
  const navigate = useNavigate();
  const [newsletter, setNewsletter] = useState(true);
  const [pwLoading, setPwLoading] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [cancelOpen, setCancelOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from("partner_profiles").select("newsletter_opt_in").eq("user_id", user.id).maybeSingle()
      .then(({ data }) => { if (data) setNewsletter(data.newsletter_opt_in ?? true); });
  }, [user]);

  const toggleNewsletter = async (v: boolean) => {
    if (!user) return;
    setNewsletter(v);
    const { error } = await supabase.from("partner_profiles").update({ newsletter_opt_in: v }).eq("user_id", user.id);
    if (error) { toast.error(error.message); setNewsletter(!v); }
    else toast.success(v ? "Inscrito na newsletter." : "Você não receberá mais e-mails.");
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const r = passwordSchema.safeParse(newPassword);
    if (!r.success) return toast.error(r.error.issues[0]?.message ?? "Senha inválida.");
    setPwLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setPwLoading(false);
    if (error) toast.error(error.message);
    else { toast.success("Senha atualizada."); setNewPassword(""); }
  };

  const cancelAccount = async () => {
    if (!user) return;
    if (reason.trim().length < 10) return toast.error("Conte rapidamente o motivo (mín. 10 caracteres).");
    if (confirmText !== "CANCELAR") return toast.error('Digite "CANCELAR" para confirmar.');
    setCancelling(true);
    const { error } = await supabase.from("partner_profiles").update({
      status: "cancelled",
      cancellation_reason: reason.trim(),
      cancelled_at: new Date().toISOString(),
    }).eq("user_id", user.id);
    if (error) { setCancelling(false); return toast.error(error.message); }
    await signOut();
    await refresh();
    toast.success("Conta cancelada.");
    navigate("/", { replace: true });
  };

  return (
    <div className="space-y-12">
      <header>
        <p className="text-eyebrow mb-3">Preferências</p>
        <h2 className="font-display text-3xl text-western-green-deep">Conta e privacidade</h2>
      </header>

      <section className="border border-western-stone-warm/15 bg-white p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="font-display text-lg text-western-green-deep">Newsletter</p>
            <p className="text-sm text-western-stone-warm">Lançamentos, projetos e oportunidades B2B. Sem spam.</p>
          </div>
          <Switch checked={newsletter} onCheckedChange={toggleNewsletter} />
        </div>
      </section>

      <section className="border border-western-stone-warm/15 bg-white p-6">
        <p className="font-display text-lg text-western-green-deep mb-4">Alterar senha</p>
        <form onSubmit={changePassword} className="flex flex-col sm:flex-row gap-3 max-w-lg">
          <Input type="password" autoComplete="new-password" placeholder="Nova senha (mín. 8)" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="h-11 bg-transparent border-western-stone-warm/30 rounded-none" />
          <Button type="submit" disabled={pwLoading} className="h-11 px-6 bg-western-green-deep text-western-cream hover:bg-western-green-mid font-mono text-[11px] uppercase tracking-[0.22em] rounded-none">
            {pwLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Atualizar"}
          </Button>
        </form>
      </section>

      <section className="border border-red-500/30 bg-red-50/40 p-6">
        <div className="flex items-start gap-3 mb-4">
          <AlertTriangle className="h-5 w-5 text-red-700 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-display text-lg text-red-900">Cancelar minha conta</p>
            <p className="text-sm text-red-900/80">Sua conta será desativada. Mantemos histórico para fins legais (LGPD), mas você não conseguirá mais acessar o painel.</p>
          </div>
        </div>
        {!cancelOpen ? (
          <Button onClick={() => setCancelOpen(true)} variant="outline" className="rounded-none border-red-700 text-red-700 hover:bg-red-700 hover:text-white font-mono text-[11px] uppercase tracking-[0.22em] h-10 px-5">
            Quero cancelar
          </Button>
        ) : (
          <div className="space-y-4">
            <div>
              <Label className="text-eyebrow mb-2 block text-red-900">Motivo (obrigatório)</Label>
              <Textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} className="bg-white border-red-300 rounded-none" placeholder="Conte rapidamente por que está saindo." />
            </div>
            <div>
              <Label className="text-eyebrow mb-2 block text-red-900">Digite CANCELAR para confirmar</Label>
              <Input value={confirmText} onChange={(e) => setConfirmText(e.target.value)} className="h-11 bg-white border-red-300 rounded-none max-w-xs" />
            </div>
            <div className="flex gap-2">
              <Button onClick={cancelAccount} disabled={cancelling} className="rounded-none bg-red-700 hover:bg-red-800 text-white font-mono text-[11px] uppercase tracking-[0.22em] h-10 px-5">
                {cancelling ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirmar cancelamento"}
              </Button>
              <Button onClick={() => { setCancelOpen(false); setReason(""); setConfirmText(""); }} variant="outline" className="rounded-none h-10 px-5 font-mono text-[11px] uppercase tracking-[0.22em]">
                Voltar
              </Button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
