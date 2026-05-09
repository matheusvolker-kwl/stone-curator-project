import { useState } from "react";
import { Loader2, FileDown, X } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { sketchAssetsFor, WHATSAPP_NUMBER } from "@/data/guideMap";

const SEGMENTOS = [
  { id: "arquiteto", label: "Arquiteto" },
  { id: "paisagista", label: "Paisagista" },
  { id: "construtora", label: "Construtora" },
  { id: "cliente_final", label: "Cliente final" },
  { id: "outro", label: "Outro" },
] as const;

const schema = z.object({
  nome: z.string().trim().min(2, "Nome muito curto").max(100),
  email: z.string().trim().email("E-mail inválido").max(255),
  whatsapp: z.string().trim().min(10, "Telefone inválido").max(20),
  segmento: z.string().min(1, "Selecione seu perfil"),
  empresa: z.string().trim().max(150).optional(),
});

interface Props {
  open: boolean;
  onClose: () => void;
  conjuntoNome: string;
  conjuntoHandle: string;
  acabamento: string;
  contexto?: { tipo?: string; areaM2?: number };
  nomePreFill?: string;
}

export default function SketchLeadModal({
  open,
  onClose,
  conjuntoNome,
  conjuntoHandle,
  acabamento,
  contexto,
  nomePreFill,
}: Props) {
  const [form, setForm] = useState({
    nome: nomePreFill ?? "",
    email: "",
    whatsapp: "",
    segmento: "",
    empresa: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const flat: Record<string, string> = {};
      parsed.error.issues.forEach((i) => {
        flat[i.path[0] as string] = i.message;
      });
      setErrors(flat);
      return;
    }
    setErrors({});
    setSubmitting(true);

    // Persistência local enquanto o backend de leads não está plugado.
    // Quando habilitarmos Lovable Cloud, este bloco vira chamada à edge function.
    try {
      const lead = {
        ...parsed.data,
        conjunto: conjuntoNome,
        handle: conjuntoHandle,
        acabamento,
        contexto,
        createdAt: new Date().toISOString(),
      };
      const prev = JSON.parse(localStorage.getItem("western-leads") || "[]");
      localStorage.setItem("western-leads", JSON.stringify([...prev, lead]));

      // Notifica o consultor pelo WhatsApp em paralelo (atalho enquanto não há email backend)
      const waText = encodeURIComponent(
        `Novo lead do guia\nNome: ${lead.nome}\nE-mail: ${lead.email}\nWhatsApp: ${lead.whatsapp}\nPerfil: ${lead.segmento}\nConjunto: ${lead.conjunto} (${lead.acabamento})`
      );
      // não abre janela; só prepara — opcional. Mantemos o foco no download.
      void waText;

      await new Promise((r) => setTimeout(r, 700)); // micro feedback
      setDone(true);
      toast.success("Sketch liberado para download", {
        description: "Em até 48h enviaremos a versão SketchUp (.skp) por e-mail.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const assets = sketchAssetsFor(conjuntoHandle);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="sketch-lead-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-western-green-deep/70 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-western-ivory border border-western-gold/30 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar"
          className="absolute top-4 right-4 p-2 text-western-stone-warm hover:text-western-green-deep transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="p-6 md:p-10">
          {!done ? (
            <>
              <p className="text-eyebrow mb-4">Sketch + condição comercial</p>
              <h3 id="sketch-lead-title" className="font-display text-2xl md:text-3xl text-western-green-deep leading-tight mb-3">
                Receba a prancha técnica e a proposta deste conjunto
              </h3>
              <p className="text-sm text-western-stone-warm leading-relaxed mb-8">
                Você recebe agora a prancha em PDF e o arquivo SketchUp (.skp) por
                e-mail em até 48h, junto com uma condição comercial preparada para
                seu perfil.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field
                    label="Nome"
                    error={errors.nome}
                    value={form.nome}
                    onChange={(v) => setForm((f) => ({ ...f, nome: v }))}
                    required
                  />
                  <Field
                    label="E-mail"
                    type="email"
                    error={errors.email}
                    value={form.email}
                    onChange={(v) => setForm((f) => ({ ...f, email: v }))}
                    required
                  />
                  <Field
                    label="WhatsApp"
                    type="tel"
                    placeholder="(11) 99999-9999"
                    error={errors.whatsapp}
                    value={form.whatsapp}
                    onChange={(v) => setForm((f) => ({ ...f, whatsapp: v }))}
                    required
                  />
                  <Field
                    label="Empresa / CNPJ"
                    optional
                    error={errors.empresa}
                    value={form.empresa}
                    onChange={(v) => setForm((f) => ({ ...f, empresa: v }))}
                  />
                </div>

                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-western-green-deep mb-3">
                    Sou <span className="text-western-stone-warm/60">(obrigatório)</span>
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {SEGMENTOS.map((s) => (
                      <button
                        type="button"
                        key={s.id}
                        onClick={() => setForm((f) => ({ ...f, segmento: s.id }))}
                        className={`px-4 py-2 font-mono text-[11px] uppercase tracking-[0.18em] border transition-colors ${
                          form.segmento === s.id
                            ? "bg-western-green-deep text-western-cream border-western-green-deep"
                            : "border-western-stone-warm/30 text-western-stone-warm hover:border-western-gold hover:text-western-green-deep"
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                  {errors.segmento && (
                    <p className="mt-2 text-xs text-destructive">{errors.segmento}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-gold w-full justify-center mt-6 disabled:opacity-60"
                >
                  {submitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <FileDown className="h-4 w-4" />
                      Receber sketch + condição comercial
                    </>
                  )}
                </button>
                <p className="text-[11px] text-western-stone-warm/70 text-center">
                  Seus dados são usados apenas pela equipe Western para enviar o
                  material e a proposta. Sem cadastro em mailing.
                </p>
              </form>
            </>
          ) : (
            <div className="text-center py-6">
              <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-western-gold/15 text-western-gold mb-5">
                <FileDown className="h-7 w-7" />
              </div>
              <h3 className="font-display text-2xl md:text-3xl text-western-green-deep mb-3">
                Pronto. Seu sketch está liberado.
              </h3>
              <p className="text-sm text-western-stone-warm leading-relaxed mb-8 max-w-md mx-auto">
                Faça o download da prancha técnica abaixo. O arquivo SketchUp (.skp)
                e a condição comercial chegam por e-mail em até 48h.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a
                  href={assets.pdfUrl}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-gold justify-center"
                >
                  <FileDown className="h-4 w-4" /> Baixar prancha (PDF)
                </a>
                <a
                  href={assets.skpUrl}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-outline-forest justify-center"
                >
                  <FileDown className="h-4 w-4" /> Baixar SketchUp (.skp)
                </a>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="mt-8 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-western-stone-warm hover:text-western-green-deep transition-colors"
              >
                Fechar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface FieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  optional?: boolean;
  error?: string;
}
function Field({ label, value, onChange, type = "text", placeholder, required, optional, error }: FieldProps) {
  return (
    <label className="block">
      <span className="block font-mono text-[10px] uppercase tracking-[0.2em] text-western-green-deep mb-2">
        {label}{" "}
        {optional && <span className="text-western-stone-warm/50 normal-case tracking-normal">(opcional)</span>}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        maxLength={255}
        className={`w-full px-3 py-3 bg-white border text-sm text-western-green-deep focus:outline-none focus:border-western-gold ${
          error ? "border-destructive" : "border-western-stone-warm/30"
        }`}
      />
      {error && <p className="mt-1.5 text-xs text-destructive">{error}</p>}
    </label>
  );
}
