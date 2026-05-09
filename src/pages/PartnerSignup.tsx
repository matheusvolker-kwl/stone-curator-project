import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

type FormState = {
  nome: string;
  empresa: string;
  cnpj: string;
  segmento: string;
  site: string;
  cidade: string;
  telefone: string;
  email: string;
  senha: string;
};

const INITIAL: FormState = {
  nome: "",
  empresa: "",
  cnpj: "",
  segmento: "",
  site: "",
  cidade: "",
  telefone: "",
  email: "",
  senha: "",
};

export default function PartnerSignup() {
  const [form, setForm] = useState<FormState>(INITIAL);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  const set = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (form.senha.length < 8) {
      toast.error("Senha deve ter ao menos 8 caracteres.");
      return;
    }
    setLoading(true);
    try {
      // 1. Create auth user with metadata (trigger creates partner_profile)
      const { error: authError } = await supabase.auth.signUp({
        email: form.email,
        password: form.senha,
        options: {
          emailRedirectTo: `${window.location.origin}/parceiro/login`,
          data: {
            nome: form.nome,
            empresa: form.empresa,
            cnpj: form.cnpj,
            segmento: form.segmento,
            telefone: form.telefone,
            cidade: form.cidade,
            site: form.site,
          },
        },
      });
      if (authError) throw authError;

      // 2. Lead row in inbox (independent of auth — survives even if signup fails partially)
      await supabase.from("leads").insert({
        type: "partner_signup",
        nome: form.nome,
        email: form.email,
        telefone: form.telefone,
        empresa: form.empresa,
        cnpj: form.cnpj,
        segmento: form.segmento,
        cidade: form.cidade,
        payload: { site: form.site },
        origem: "site/parceiro/cadastro",
      });

      setSubmitted(true);
      toast.success("Cadastro recebido", {
        description: "Em até 2 dias úteis liberamos seu acesso.",
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro desconhecido";
      if (msg.toLowerCase().includes("already") || msg.toLowerCase().includes("registered")) {
        toast.error("Este e-mail já está cadastrado.", {
          description: "Use o login ou recupere a senha.",
          action: { label: "Entrar", onClick: () => navigate("/parceiro/login") },
        });
      } else {
        toast.error("Não foi possível concluir o cadastro.", { description: msg });
      }
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="surface-ivory">
        <div className="container-western py-32 max-w-2xl text-center">
          <p className="text-eyebrow mb-6">Cadastro recebido</p>
          <div className="w-12 h-px bg-western-gold mx-auto mb-8" />
          <h1 className="font-display text-4xl md:text-5xl text-western-green-deep leading-tight mb-6">
            Obrigado. Sua solicitação está em análise.
          </h1>
          <p className="text-western-stone-warm leading-relaxed mb-10">
            Em até 2 dias úteis liberamos seu acesso e enviamos sua condição comercial
            diferenciada por e-mail.
          </p>
          <Link to="/" className="link-underline text-western-gold font-mono text-xs uppercase tracking-[0.22em]">
            Voltar ao catálogo
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="surface-ivory">
      <div className="container-western py-20 md:py-28 max-w-2xl">
        <p className="text-eyebrow mb-5">Cadastro B2B</p>
        <div className="w-12 h-px bg-western-gold mb-8" />
        <h1 className="font-display text-4xl md:text-6xl text-western-green-deep leading-[1.05] mb-6">
          Solicite acesso de parceiro.
        </h1>
        <p className="text-western-stone-warm text-lg leading-relaxed mb-12">
          Para arquitetos, paisagistas, construtoras, garden centers e revendas
          qualificadas. Aprovação em até 2 dias úteis.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Field label="Razão social" name="empresa" value={form.empresa} onChange={set("empresa")} required />
          <Field label="CNPJ" name="cnpj" value={form.cnpj} onChange={set("cnpj")} required />
          <Field
            label="Segmento"
            name="segmento"
            value={form.segmento}
            onChange={set("segmento")}
            placeholder="Arquitetura, paisagismo, garden center..."
            required
          />
          <Field label="Cidade" name="cidade" value={form.cidade} onChange={set("cidade")} required />
          <Field label="Site ou Instagram" name="site" value={form.site} onChange={set("site")} />
          <Field label="Responsável" name="nome" value={form.nome} onChange={set("nome")} required />
          <Field label="Telefone com WhatsApp" name="telefone" value={form.telefone} onChange={set("telefone")} required />
          <Field label="E-mail" name="email" value={form.email} onChange={set("email")} type="email" required />
          <Field
            label="Senha (mínimo 8 caracteres)"
            name="senha"
            value={form.senha}
            onChange={set("senha")}
            type="password"
            required
          />

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-western-green-deep text-western-cream hover:bg-western-green-mid font-mono text-xs uppercase tracking-[0.25em] rounded-none mt-4 disabled:opacity-60"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Enviar solicitação"}
          </Button>

          <p className="text-spec text-western-stone-warm text-center pt-2">
            Já é parceiro?{" "}
            <Link to="/parceiro/login" className="link-underline text-western-gold">
              Entrar
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  name,
  value,
  onChange,
  type = "text",
  required,
  placeholder,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <Label htmlFor={name} className="text-eyebrow mb-3 block">
        {label}
      </Label>
      <Input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        autoComplete={type === "password" ? "new-password" : undefined}
        className="h-12 bg-transparent border-western-stone-warm/30 rounded-none text-western-green-deep placeholder:text-western-stone-warm/50 focus-visible:border-western-gold"
      />
    </div>
  );
}
