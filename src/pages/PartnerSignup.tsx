import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function PartnerSignup() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);
    toast.success("Cadastro recebido", {
      description: "Retornaremos em até 2 dias úteis.",
      position: "top-right",
    });
  };

  if (submitted) {
    return (
      <div className="surface-cream">
        <div className="container-western py-32 max-w-2xl text-center">
          <p className="text-eyebrow mb-6">Cadastro recebido</p>
          <div className="w-12 h-px bg-western-gold mx-auto mb-8" />
          <h1 className="font-display text-4xl md:text-5xl text-western-green-deep leading-tight mb-6">
            Obrigado. Sua solicitação está em análise.
          </h1>
          <p className="text-western-stone-warm leading-relaxed">
            Retornamos em até 2 dias úteis com sua condição comercial diferenciada
            e acesso ao catálogo completo.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="surface-cream">
      <div className="container-western py-20 md:py-28 max-w-2xl">
        <p className="text-eyebrow mb-5">Cadastro B2B</p>
        <div className="w-12 h-px bg-western-gold mb-8" />
        <h1 className="font-display text-5xl md:text-6xl text-western-green-deep leading-[1.05] mb-6">
          Solicite acesso de parceiro.
        </h1>
        <p className="text-western-stone-warm text-lg leading-relaxed mb-12">
          Para arquitetos, paisagistas, construtoras, garden centers e revendas
          qualificadas. Aprovação em até 2 dias úteis.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Field label="Razão social" name="company" required />
          <Field label="CNPJ" name="cnpj" required />
          <Field label="Segmento" name="segment" placeholder="Arquitetura, paisagismo, garden center..." required />
          <Field label="Site ou Instagram" name="web" />
          <Field label="Responsável" name="name" required />
          <Field label="E-mail" name="email" type="email" required />
          <Field label="Telefone" name="phone" required />

          <Button
            type="submit"
            className="w-full h-12 bg-western-green-deep text-western-cream hover:bg-western-green-mid font-mono text-xs uppercase tracking-[0.25em] rounded-none mt-4"
          >
            Enviar solicitação
          </Button>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  placeholder,
}: {
  label: string;
  name: string;
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
        required={required}
        placeholder={placeholder}
        className="h-12 bg-transparent border-western-stone-warm/30 rounded-none text-western-green-deep placeholder:text-western-stone-warm/50 focus-visible:border-western-gold"
      />
    </div>
  );
}
