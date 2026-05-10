import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const FIELDS: { key: keyof Form; label: string; full?: boolean }[] = [
  { key: "empresa", label: "Razão social", full: true },
  { key: "cnpj", label: "CNPJ" },
  { key: "segmento", label: "Segmento" },
  { key: "nome", label: "Responsável", full: true },
  { key: "cargo", label: "Cargo" },
  { key: "telefone", label: "Telefone" },
  { key: "site", label: "Site" },
  { key: "instagram", label: "Instagram" },
  { key: "cep", label: "CEP" },
  { key: "endereco", label: "Endereço", full: true },
  { key: "numero", label: "Número" },
  { key: "complemento", label: "Complemento" },
  { key: "bairro", label: "Bairro" },
  { key: "cidade", label: "Cidade" },
  { key: "estado", label: "UF" },
];

interface Form {
  nome: string; empresa: string; cnpj: string; segmento: string; telefone: string;
  cidade: string; estado: string; site: string; instagram: string; cargo: string;
  cep: string; endereco: string; numero: string; complemento: string; bairro: string;
}

const EMPTY: Form = {
  nome: "", empresa: "", cnpj: "", segmento: "", telefone: "", cidade: "", estado: "",
  site: "", instagram: "", cargo: "", cep: "", endereco: "", numero: "", complemento: "", bairro: "",
};

export default function AccountProfile() {
  const { user, refresh } = useAuth();
  const [form, setForm] = useState<Form>(EMPTY);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from("partner_profiles").select("*").eq("user_id", user.id).maybeSingle().then(({ data }) => {
      if (data) {
        const next = { ...EMPTY };
        for (const k of Object.keys(EMPTY) as (keyof Form)[]) {
          next[k] = (data[k as keyof typeof data] as string) ?? "";
        }
        setForm(next);
      }
    });
  }, [user]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("partner_profiles").update(form).eq("user_id", user.id);
    setSaving(false);
    if (error) toast.error("Erro ao salvar", { description: error.message });
    else { toast.success("Perfil atualizado."); refresh(); }
  };

  return (
    <div>
      <p className="text-eyebrow mb-3">Meu perfil</p>
      <h2 className="font-display text-3xl text-western-green-deep mb-8">Dados cadastrais</h2>
      <form onSubmit={save} className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-3xl">
        {FIELDS.map((f) => (
          <div key={f.key} className={f.full ? "md:col-span-2" : ""}>
            <Label className="text-eyebrow mb-2 block">{f.label}</Label>
            <Input
              value={form[f.key]}
              onChange={(e) => setForm((p) => ({ ...p, [f.key]: e.target.value }))}
              className="h-11 bg-transparent border-western-stone-warm/30 rounded-none focus-visible:border-western-gold"
            />
          </div>
        ))}
        <div className="md:col-span-2">
          <Button type="submit" disabled={saving} className="h-12 px-7 bg-western-green-deep text-western-cream hover:bg-western-green-mid font-mono text-xs uppercase tracking-[0.25em] rounded-none">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar alterações"}
          </Button>
        </div>
      </form>
    </div>
  );
}
