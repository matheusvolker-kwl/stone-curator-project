import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import PhoneInput from "@/components/forms/PhoneInput";
import CnpjInput from "@/components/forms/CnpjInput";
import CepInput from "@/components/forms/CepInput";
import EmailInput from "@/components/forms/EmailInput";
import {
  cnpjSchema, phoneBRSchema, cepSchema, emailSchema, UF_LIST,
  normalizeText, focusFirstInvalid,
} from "@/lib/forms/br";
import { z } from "zod";

interface Form {
  nome: string; empresa: string; cnpj: string; segmento: string; telefone: string;
  email: string;
  cidade: string; estado: string; site: string; instagram: string; cargo: string;
  cep: string; endereco: string; numero: string; complemento: string; bairro: string;
}

const EMPTY: Form = {
  nome: "", empresa: "", cnpj: "", segmento: "", telefone: "", email: "",
  cidade: "", estado: "", site: "", instagram: "", cargo: "",
  cep: "", endereco: "", numero: "", complemento: "", bairro: "",
};

const schema = z.object({
  empresa: z.string().transform(normalizeText).pipe(z.string().min(2, "Informe a razão social").max(160)),
  cnpj: cnpjSchema,
  segmento: z.string().max(80).optional().or(z.literal("")),
  nome: z.string().transform(normalizeText).pipe(z.string().min(2, "Informe o responsável").max(120)),
  cargo: z.string().max(60).optional().or(z.literal("")),
  telefone: phoneBRSchema,
  email: emailSchema.optional().or(z.literal("")),
  site: z.string().max(200).optional().or(z.literal("")),
  instagram: z.string().max(60).optional().or(z.literal("")),
  cep: cepSchema.optional().or(z.literal("")),
  endereco: z.string().max(200).optional().or(z.literal("")),
  numero: z.string().max(20).optional().or(z.literal("")),
  complemento: z.string().max(80).optional().or(z.literal("")),
  bairro: z.string().max(80).optional().or(z.literal("")),
  cidade: z.string().max(80).optional().or(z.literal("")),
  estado: z.union([z.enum(UF_LIST as unknown as [string, ...string[]]), z.literal("")]).optional(),
});

export default function AccountProfile() {
  const { user, refresh } = useAuth();
  const [form, setForm] = useState<Form>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm((p) => ({ ...p, [k]: v }));

  useEffect(() => {
    if (!user) return;
    supabase.from("partner_profiles").select("*").eq("user_id", user.id).maybeSingle().then(({ data }) => {
      if (data) {
        const next = { ...EMPTY };
        for (const k of Object.keys(EMPTY) as (keyof Form)[]) {
          next[k] = ((data as Record<string, unknown>)[k] as string) ?? "";
        }
        setForm(next);
      }
    });
  }, [user]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const r = schema.safeParse(form);
    if (!r.success) {
      const errs: Record<string, string> = {};
      r.error.issues.forEach((i) => (errs[i.path.join(".")] = i.message));
      setErrors(errs);
      toast.error("Confira os campos destacados.");
      focusFirstInvalid(formRef.current, errs);
      return;
    }
    setErrors({});
    setSaving(true);
    const { email: _omit, ...persist } = form;
    void _omit;
    const { error } = await supabase.from("partner_profiles").update({
      ...persist,
      empresa: normalizeText(form.empresa),
      nome: normalizeText(form.nome),
    }).eq("user_id", user.id);
    setSaving(false);
    if (error) toast.error("Erro ao salvar", { description: error.message });
    else { toast.success("Perfil atualizado."); refresh(); }
  };

  const inputCls = "h-11 bg-transparent border-western-stone-warm/30 rounded-none focus-visible:border-western-gold";

  return (
    <div>
      <p className="text-eyebrow mb-3">Meu perfil</p>
      <h2 className="font-display text-3xl text-western-green-deep mb-8">Dados cadastrais</h2>
      <form ref={formRef} onSubmit={save} noValidate className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-3xl">
        <Field full label="Razão social" id="empresa" error={errors.empresa}>
          <Input id="empresa" value={form.empresa} onChange={(e) => set("empresa", e.target.value)} className={inputCls} />
        </Field>

        <Field label="CNPJ" id="cnpj" error={errors.cnpj}>
          <CnpjInput id="cnpj" value={form.cnpj} onChange={(v) => set("cnpj", v)} error={errors.cnpj} />
        </Field>

        <Field label="Segmento" id="segmento" error={errors.segmento}>
          <Input id="segmento" value={form.segmento} onChange={(e) => set("segmento", e.target.value)} className={inputCls} />
        </Field>

        <Field full label="Responsável" id="nome" error={errors.nome}>
          <Input id="nome" value={form.nome} onChange={(e) => set("nome", e.target.value)} className={inputCls} />
        </Field>

        <Field label="Cargo" id="cargo" error={errors.cargo}>
          <Input id="cargo" value={form.cargo} onChange={(e) => set("cargo", e.target.value)} className={inputCls} />
        </Field>

        <Field label="Telefone" id="telefone" error={errors.telefone}>
          <PhoneInput id="telefone" value={form.telefone} onChange={(v) => set("telefone", v)} error={errors.telefone} />
        </Field>

        <Field label="E-mail de contato" id="email" error={errors.email}>
          <EmailInput id="email" value={form.email} onChange={(v) => set("email", v)} error={errors.email} />
        </Field>

        <Field label="Site" id="site" error={errors.site}>
          <Input id="site" placeholder="https://" value={form.site} onChange={(e) => set("site", e.target.value)} className={inputCls} />
        </Field>

        <Field label="Instagram" id="instagram" error={errors.instagram}>
          <Input id="instagram" value={form.instagram} onChange={(e) => set("instagram", e.target.value.replace(/^@/, ""))} className={inputCls} />
        </Field>

        <Field label="CEP" id="cep" error={errors.cep}>
          <CepInput
            id="cep"
            value={form.cep}
            onChange={(v) => set("cep", v)}
            onResolved={(d) => setForm((p) => ({
              ...p,
              endereco: d.logradouro || p.endereco,
              bairro: d.bairro || p.bairro,
              cidade: d.localidade || p.cidade,
              estado: d.uf || p.estado,
            }))}
            focusNextId="numero"
            error={errors.cep}
          />
        </Field>

        <Field full label="Endereço" id="endereco" error={errors.endereco}>
          <Input id="endereco" value={form.endereco} onChange={(e) => set("endereco", e.target.value)} className={inputCls} />
        </Field>

        <Field label="Número" id="numero" error={errors.numero}>
          <Input id="numero" value={form.numero} onChange={(e) => set("numero", e.target.value)} className={inputCls} />
        </Field>

        <Field label="Complemento" id="complemento" error={errors.complemento}>
          <Input id="complemento" value={form.complemento} onChange={(e) => set("complemento", e.target.value)} className={inputCls} />
        </Field>

        <Field label="Bairro" id="bairro" error={errors.bairro}>
          <Input id="bairro" value={form.bairro} onChange={(e) => set("bairro", e.target.value)} className={inputCls} />
        </Field>

        <Field label="Cidade" id="cidade" error={errors.cidade}>
          <Input id="cidade" value={form.cidade} onChange={(e) => set("cidade", e.target.value)} className={inputCls} />
        </Field>

        <Field label="UF" id="estado" error={errors.estado}>
          <select
            id="estado"
            value={form.estado}
            onChange={(e) => set("estado", e.target.value)}
            className="h-11 w-full bg-transparent border border-western-stone-warm/30 px-3 rounded-none text-western-green-deep focus:outline-none focus:border-western-gold"
          >
            <option value="">—</option>
            {UF_LIST.map((uf) => <option key={uf} value={uf}>{uf}</option>)}
          </select>
        </Field>

        <div className="md:col-span-2">
          <Button type="submit" disabled={saving} className="h-12 px-7 bg-western-green-deep text-western-cream hover:bg-western-green-mid font-mono text-xs uppercase tracking-[0.25em] rounded-none disabled:opacity-60">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar alterações"}
          </Button>
        </div>
      </form>
    </div>
  );
}

function Field({
  label, id, error, full, children,
}: {
  label: string; id: string; error?: string; full?: boolean; children: React.ReactNode;
}) {
  return (
    <div className={full ? "md:col-span-2" : ""}>
      <Label htmlFor={id} className="text-eyebrow mb-2 block">{label}</Label>
      {children}
      {error && (
        <p id={`${id}-error`} className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-red-700/80">
          {error}
        </p>
      )}
    </div>
  );
}
