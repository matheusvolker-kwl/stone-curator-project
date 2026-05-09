import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { BUSINESS } from "@/config/business";
import { Loader2, MapPin } from "lucide-react";

type Form = {
  nome: string;
  email: string;
  telefone: string;
  pessoas: string;
  datas: string;
  projeto: string;
};

const INITIAL: Form = {
  nome: "",
  email: "",
  telefone: "",
  pessoas: "2",
  datas: "",
  projeto: "",
};

export default function AgendarVisita() {
  const [f, setF] = useState<Form>(INITIAL);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const set =
    <K extends keyof Form>(k: K) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setF((p) => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from("leads").insert({
      type: "visita",
      nome: f.nome,
      email: f.email,
      telefone: f.telefone,
      mensagem: f.projeto,
      payload: { pessoas: f.pessoas, datas_preferidas: f.datas },
      origem: "site/visitar",
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
          <MapPin className="h-10 w-10 text-western-gold mx-auto mb-6" />
          <p className="text-eyebrow mb-6">Visita solicitada</p>
          <div className="w-12 h-px bg-western-gold mx-auto mb-8" />
          <h1 className="font-display text-4xl md:text-5xl text-western-green-deep leading-tight mb-6">
            Recebemos sua solicitação.
          </h1>
          <p className="text-western-stone-warm leading-relaxed mb-10">
            Em até 1 dia útil retornamos pelo WhatsApp confirmando a melhor data
            entre as que você sugeriu.
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
        <p className="text-eyebrow mb-5">Visita ao ateliê</p>
        <div className="w-12 h-px bg-western-gold mb-8" />
        <h1 className="font-display text-4xl md:text-6xl text-western-green-deep leading-[1.05] mb-6">
          Conheça onde<br />a pedra nasce.
        </h1>
        <p className="text-western-stone-warm text-lg leading-relaxed mb-4">
          Ver o ateliê é entender porque cada peça tem variação. Recebemos
          arquitetos, paisagistas e clientes finais com hora marcada — para você
          tocar nos quatro acabamentos, ver as composições montadas em escala e
          conversar com quem produz.
        </p>
        <p className="text-spec text-western-stone-warm mb-12 uppercase tracking-[0.18em]">
          {BUSINESS.cidadeAtelie}/{BUSINESS.ufAtelie} · {BUSINESS.horarioAtelie} · Retirada gratuita
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Field label="Nome" value={f.nome} onChange={set("nome")} required />
          <Field label="E-mail" type="email" value={f.email} onChange={set("email")} required />
          <Field label="Telefone com WhatsApp" value={f.telefone} onChange={set("telefone")} required />
          <Field label="Quantas pessoas vêm?" type="number" value={f.pessoas} onChange={set("pessoas")} required />

          <div>
            <Label htmlFor="datas" className="text-eyebrow mb-3 block">3 datas e horários preferidos</Label>
            <Textarea
              id="datas"
              value={f.datas}
              onChange={set("datas")}
              placeholder="Ex.: 12/03 às 10h · 14/03 às 14h · 15/03 às 9h"
              rows={3}
              required
              className="bg-transparent border-western-stone-warm/30 rounded-none text-western-green-deep focus-visible:border-western-gold"
            />
          </div>

          <div>
            <Label htmlFor="projeto" className="text-eyebrow mb-3 block">
              Tipo de projeto <span className="text-western-stone-warm/60 normal-case tracking-normal">(opcional)</span>
            </Label>
            <Textarea
              id="projeto"
              value={f.projeto}
              onChange={set("projeto")}
              placeholder="Residencial, hotelaria, comercial — conte um pouco do escopo."
              rows={3}
              className="bg-transparent border-western-stone-warm/30 rounded-none text-western-green-deep focus-visible:border-western-gold"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-western-green-deep text-western-cream hover:bg-western-green-mid font-mono text-xs uppercase tracking-[0.25em] rounded-none disabled:opacity-60"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Solicitar visita"}
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
}: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <Label className="text-eyebrow mb-3 block">{label}</Label>
      <Input
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        className="h-12 bg-transparent border-western-stone-warm/30 rounded-none text-western-green-deep focus-visible:border-western-gold"
      />
    </div>
  );
}
