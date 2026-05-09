import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Package } from "lucide-react";

const PERFIS = ["Arquiteto", "Paisagista", "Lojista", "Construtora", "Cliente final"] as const;

type Form = {
  nome: string;
  email: string;
  telefone: string;
  cep: string;
  endereco: string;
  cidade: string;
  uf: string;
  perfil: string;
  projeto: string;
};

const INITIAL: Form = {
  nome: "",
  email: "",
  telefone: "",
  cep: "",
  endereco: "",
  cidade: "",
  uf: "",
  perfil: "Arquiteto",
  projeto: "",
};

export default function PedirAmostras() {
  const [f, setF] = useState<Form>(INITIAL);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const set =
    <K extends keyof Form>(k: K) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setF((p) => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from("leads").insert({
      type: "amostras",
      nome: f.nome,
      email: f.email,
      telefone: f.telefone,
      cep: f.cep,
      endereco: f.endereco,
      cidade: f.cidade,
      uf: f.uf.toUpperCase(),
      mensagem: f.projeto,
      payload: { perfil: f.perfil },
      origem: "site/pedir-amostras",
    });
    setLoading(false);
    if (error) {
      toast.error("Não foi possível enviar agora.", { description: error.message });
      return;
    }
    setDone(true);
  };

  if (done) {
    return (
      <div className="surface-ivory">
        <div className="container-western py-32 max-w-2xl text-center">
          <Package className="h-10 w-10 text-western-gold mx-auto mb-6" />
          <p className="text-eyebrow mb-6">Kit a caminho</p>
          <div className="w-12 h-px bg-western-gold mx-auto mb-8" />
          <h1 className="font-display text-4xl md:text-5xl text-western-green-deep leading-tight mb-6">
            Em 5–7 dias úteis você recebe<br />os 4 acabamentos para ver na mão.
          </h1>
          <p className="text-western-stone-warm leading-relaxed mb-10">
            Quartzo, Arenito, Moledo e Granito — pequenas amostras das texturas e
            cores reais, na escala em que a peça chega ao canteiro.
          </p>
          <Link to="/linhas" className="btn-outline-forest">
            Explorar o catálogo
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="surface-ivory">
      <div className="container-western py-20 md:py-28 max-w-2xl">
        <p className="text-eyebrow mb-5">Kit de amostras</p>
        <div className="w-12 h-px bg-western-gold mb-8" />
        <h1 className="font-display text-4xl md:text-6xl text-western-green-deep leading-[1.05] mb-6">
          Receba os 4 acabamentos<br />na sua mesa.
        </h1>
        <p className="text-western-stone-warm text-lg leading-relaxed mb-4">
          Especificar pedra por foto é apostar — textura e variação cromática só se
          decidem no toque. Enviamos uma amostra física dos quatro acabamentos —
          <span className="text-western-green-deep"> Quartzo, Arenito, Moledo e Granito </span>
          — gratuitamente.
        </p>
        <p className="text-spec text-western-stone-warm mb-12 uppercase tracking-[0.18em]">
          Gratuito · 5–7 dias úteis · Brasil inteiro
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Field label="Nome" value={f.nome} onChange={set("nome")} required />
          <Field label="E-mail" type="email" value={f.email} onChange={set("email")} required />
          <Field label="Telefone com WhatsApp" value={f.telefone} onChange={set("telefone")} required />

          <div>
            <Label className="text-eyebrow mb-3 block">Sou</Label>
            <select
              value={f.perfil}
              onChange={set("perfil")}
              className="h-12 w-full bg-transparent border border-western-stone-warm/30 px-3 text-western-green-deep focus-visible:border-western-gold focus:outline-none"
            >
              {PERFIS.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-1">
              <Field label="CEP" value={f.cep} onChange={set("cep")} required />
            </div>
            <div className="col-span-2">
              <Field label="Cidade" value={f.cidade} onChange={set("cidade")} required />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div className="col-span-3">
              <Field label="Endereço, número, complemento" value={f.endereco} onChange={set("endereco")} required />
            </div>
            <div>
              <Field label="UF" value={f.uf} onChange={set("uf")} required maxLength={2} />
            </div>
          </div>

          <div>
            <Label htmlFor="projeto" className="text-eyebrow mb-3 block">
              Sobre o projeto <span className="text-western-stone-warm/60 normal-case tracking-normal">(opcional)</span>
            </Label>
            <Textarea
              id="projeto"
              value={f.projeto}
              onChange={set("projeto")}
              placeholder="Conte rapidamente o que está pensando — ajuda a sugerir composições."
              rows={4}
              className="bg-transparent border-western-stone-warm/30 rounded-none text-western-green-deep focus-visible:border-western-gold"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-western-green-deep text-western-cream hover:bg-western-green-mid font-mono text-xs uppercase tracking-[0.25em] rounded-none disabled:opacity-60"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Quero o kit"}
          </Button>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required,
  maxLength,
}: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  required?: boolean;
  maxLength?: number;
}) {
  return (
    <div>
      <Label className="text-eyebrow mb-3 block">{label}</Label>
      <Input
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        maxLength={maxLength}
        className="h-12 bg-transparent border-western-stone-warm/30 rounded-none text-western-green-deep focus-visible:border-western-gold"
      />
    </div>
  );
}
