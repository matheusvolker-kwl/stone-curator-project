import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, ShieldCheck, Clock, XCircle } from "lucide-react";
import CnpjInput from "@/components/forms/CnpjInput";
import PhoneInput from "@/components/forms/PhoneInput";
import { passwordSchema } from "@/lib/forms/br";

export default function PartnerAccount() {
  const { user, signOut, refresh, partnerStatus, empresa, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [saving, setSaving] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [profile, setProfile] = useState({
    nome: "",
    empresa: "",
    cnpj: "",
    segmento: "",
    telefone: "",
    cidade: "",
    site: "",
  });
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    if (!user) return;
    supabase
      .from("partner_profiles")
      .select("nome, empresa, cnpj, segmento, telefone, cidade, site")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data)
          setProfile({
            nome: data.nome ?? "",
            empresa: data.empresa ?? "",
            cnpj: data.cnpj ?? "",
            segmento: data.segmento ?? "",
            telefone: data.telefone ?? "",
            cidade: data.cidade ?? "",
            site: data.site ?? "",
          });
      });
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("partner_profiles")
      .update(profile)
      .eq("user_id", user.id);
    setSaving(false);
    if (error) toast.error("Não foi possível salvar.", { description: error.message });
    else {
      toast.success("Dados atualizados.");
      refresh();
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const pw = passwordSchema.safeParse(newPassword);
    if (!pw.success) {
      toast.error(pw.error.issues[0]?.message ?? "Senha inválida.");
      return;
    }
    setPwLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setPwLoading(false);
    if (error) toast.error(error.message);
    else {
      toast.success("Senha atualizada.");
      setNewPassword("");
    }
  };

  const claimAdmin = async () => {
    const { data, error } = await supabase.rpc("claim_first_admin");
    if (error) toast.error(error.message);
    else if (data) {
      toast.success("Acesso admin concedido.");
      await refresh();
    } else {
      toast.info("Já existe um administrador no sistema.");
    }
  };

  const statusBadge = () => {
    if (isAdmin)
      return (
        <span className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.2em] text-western-gold">
          <ShieldCheck className="h-3.5 w-3.5" /> Administrador
        </span>
      );
    if (partnerStatus === "approved")
      return (
        <span className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.2em] text-western-green-deep">
          <ShieldCheck className="h-3.5 w-3.5" /> Parceiro aprovado
        </span>
      );
    if (partnerStatus === "rejected")
      return (
        <span className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.2em] text-red-700">
          <XCircle className="h-3.5 w-3.5" /> Acesso recusado
        </span>
      );
    return (
      <span className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.2em] text-western-stone-warm">
        <Clock className="h-3.5 w-3.5" /> Em análise
      </span>
    );
  };

  return (
    <div className="surface-ivory">
      <div className="container-western py-16 md:py-24 max-w-3xl">
        <p className="text-eyebrow mb-5">Minha conta</p>
        <div className="w-12 h-px bg-western-gold mb-8" />
        <h1 className="font-display text-4xl md:text-5xl text-western-green-deep leading-[1.05] mb-3">
          {empresa || profile.empresa || "Bem-vindo"}.
        </h1>
        <div className="mb-12">{statusBadge()}</div>

        {params.get("aviso") === "pendente" && partnerStatus !== "approved" && !isAdmin && (
          <div className="mb-10 border border-western-gold/40 bg-western-gold/5 px-5 py-4 text-spec text-western-green-deep">
            Esta área é liberada após aprovação do seu cadastro B2B (até 2 dias úteis).
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-3 mb-10">
          {isAdmin && (
            <Link to="/admin" className="border border-western-gold/40 bg-western-gold/5 p-5 hover:bg-western-gold/10 transition-colors">
              <p className="text-eyebrow mb-2">Painel admin</p>
              <p className="text-spec text-western-green-deep">Aprovar parceiros · Leads</p>
            </Link>
          )}
          <Link to="/linhas" className="border border-western-stone-warm/20 p-5 hover:border-western-gold transition-colors">
            <p className="text-eyebrow mb-2">Catálogo</p>
            <p className="text-spec text-western-green-deep">Ver linhas e preços liberados</p>
          </Link>
          <Link to="/pedir-amostras" className="border border-western-stone-warm/20 p-5 hover:border-western-gold transition-colors">
            <p className="text-eyebrow mb-2">Kit de amostras</p>
            <p className="text-spec text-western-green-deep">Receber 4 acabamentos</p>
          </Link>
        </div>

        <section className="mb-14">
          <h2 className="font-display text-2xl text-western-green-deep mb-6">Dados cadastrais</h2>
          <form onSubmit={handleSave} className="space-y-5" noValidate>
            <Row label="Razão social" id="empresa" value={profile.empresa} onChange={(v) => setProfile((p) => ({ ...p, empresa: v }))} />
            <div>
              <Label htmlFor="cnpj" className="text-eyebrow mb-3 block">CNPJ</Label>
              <CnpjInput id="cnpj" value={profile.cnpj} onChange={(v) => setProfile((p) => ({ ...p, cnpj: v }))} />
            </div>
            <Row label="Segmento" id="segmento" value={profile.segmento} onChange={(v) => setProfile((p) => ({ ...p, segmento: v }))} />
            <Row label="Responsável" id="nome" value={profile.nome} onChange={(v) => setProfile((p) => ({ ...p, nome: v }))} />
            <div>
              <Label htmlFor="telefone" className="text-eyebrow mb-3 block">Telefone</Label>
              <PhoneInput id="telefone" value={profile.telefone} onChange={(v) => setProfile((p) => ({ ...p, telefone: v }))} />
            </div>
            <Row label="Cidade" id="cidade" value={profile.cidade} onChange={(v) => setProfile((p) => ({ ...p, cidade: v }))} />
            <Row label="Site / Instagram" id="site" value={profile.site} onChange={(v) => setProfile((p) => ({ ...p, site: v }))} />
            <Button
              type="submit"
              disabled={saving}
              className="h-12 px-7 bg-western-green-deep text-western-cream hover:bg-western-green-mid font-mono text-xs uppercase tracking-[0.25em] rounded-none"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar alterações"}
            </Button>
          </form>
        </section>

        <section className="mb-14">
          <h2 className="font-display text-2xl text-western-green-deep mb-6">Alterar senha</h2>
          <form onSubmit={handleChangePassword} className="flex flex-col sm:flex-row gap-3 max-w-lg">
            <Input
              type="password"
              autoComplete="new-password"
              placeholder="Nova senha (mín. 8 caracteres)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="h-12 bg-transparent border-western-stone-warm/30 rounded-none focus-visible:border-western-gold"
            />
            <Button
              type="submit"
              disabled={pwLoading}
              className="h-12 px-7 bg-western-green-deep text-western-cream hover:bg-western-green-mid font-mono text-xs uppercase tracking-[0.25em] rounded-none"
            >
              {pwLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Atualizar"}
            </Button>
          </form>
        </section>

        <section className="mb-14 border-t border-western-stone-warm/15 pt-10">
          <p className="text-eyebrow mb-3">E-mail da conta</p>
          <p className="text-western-green-deep mb-6">{user?.email}</p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={async () => {
                await signOut();
                navigate("/", { replace: true });
              }}
              className="h-11 px-5 border border-western-green-deep/25 text-western-green-deep hover:border-western-gold hover:text-western-gold font-mono text-[11px] uppercase tracking-[0.22em]"
            >
              Sair
            </button>
            {!isAdmin && (
              <button
                onClick={claimAdmin}
                className="h-11 px-5 border border-dashed border-western-stone-warm/40 text-western-stone-warm hover:border-western-gold hover:text-western-gold font-mono text-[11px] uppercase tracking-[0.22em]"
                title="Concede admin se ainda não houver admin no sistema"
              >
                Reivindicar admin (1ª vez)
              </button>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function Row({ label, id, value, onChange }: { label: string; id?: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <Label htmlFor={id} className="text-eyebrow mb-3 block">{label}</Label>
      <Input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-12 bg-transparent border-western-stone-warm/30 rounded-none focus-visible:border-western-gold"
      />
    </div>
  );
}
