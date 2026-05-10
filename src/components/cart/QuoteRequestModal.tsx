import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, FileDown, Send, CheckCircle2 } from "lucide-react";
import PhoneInput from "@/components/forms/PhoneInput";
import EmailInput from "@/components/forms/EmailInput";
import { emailSchema, phoneBRSchema } from "@/lib/forms/br";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useCartStore } from "@/stores/cartStore";
import { submitQuoteLead } from "@/lib/leads";
import { downloadOrcamentoPdf } from "@/lib/pdf/orcamentoPdf";
import { formatBRL } from "@/lib/shopify/client";

const schema = z.object({
  nome: z.string().trim().min(2, "Informe seu nome").max(120),
  email: emailSchema,
  telefone: phoneBRSchema,
  empresa: z.string().trim().max(120).optional().or(z.literal("")),
  cidade: z.string().trim().max(120).optional().or(z.literal("")),
  mensagem: z.string().trim().max(1000).optional().or(z.literal("")),
});

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function QuoteRequestModal({ open, onOpenChange }: Props) {
  const { user, isApproved, empresa } = useAuth();
  const { items } = useCartStore();
  const subtotal = items.reduce((s, i) => s + parseFloat(i.price.amount) * i.quantity, 0);
  const currency = items[0]?.price.currencyCode ?? "BRL";

  const [form, setForm] = useState({
    nome: "",
    email: "",
    telefone: "",
    empresa: "",
    cidade: "",
    mensagem: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Prefill from partner profile
  useEffect(() => {
    if (!open) return;
    setSuccess(false);
    setErrors({});
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("partner_profiles")
        .select("nome, telefone, cidade, empresa")
        .eq("user_id", user.id)
        .maybeSingle();
      setForm((f) => ({
        ...f,
        nome: data?.nome || f.nome,
        email: user.email || f.email,
        telefone: data?.telefone || f.telefone,
        empresa: data?.empresa || empresa || f.empresa,
        cidade: data?.cidade || f.cidade,
      }));
    })();
  }, [open, user, empresa]);

  const handleChange = (k: keyof typeof form) => (v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      toast.error("Adicione peças à composição antes de pedir orçamento.");
      return;
    }
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      parsed.error.issues.forEach((i) => {
        errs[i.path[0] as string] = i.message;
      });
      setErrors(errs);
      return;
    }
    setSubmitting(true);
    try {
      await submitQuoteLead({
        contact: {
          nome: parsed.data.nome,
          email: parsed.data.email,
          telefone: parsed.data.telefone,
          empresa: parsed.data.empresa || undefined,
          cidade: parsed.data.cidade || undefined,
          mensagem: parsed.data.mensagem || undefined,
        },
        items,
        subtotal,
        currency,
        userId: user?.id ?? null,
      });
      setSuccess(true);
      toast.success("Orçamento enviado! Um vendedor entrará em contato.");
    } catch (err) {
      console.error(err);
      toast.error("Não foi possível enviar agora. Tente novamente em instantes.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownloadPdf = () => {
    downloadOrcamentoPdf({
      items,
      subtotal,
      currency,
      cliente: {
        nome: form.nome,
        email: form.email,
        telefone: form.telefone,
        empresa: form.empresa,
        cidade: form.cidade,
        mensagem: form.mensagem,
      },
      showPrices: isApproved,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto bg-western-cream border-western-stone-warm/20">
        <DialogHeader>
          <p className="text-eyebrow">Pedido de orçamento</p>
          <DialogTitle className="font-display text-2xl text-western-green-deep">
            {success ? "Recebido!" : "Quase lá"}
          </DialogTitle>
          <DialogDescription className="text-western-stone-warm">
            {success
              ? "Em até 1 dia útil um vendedor entra em contato pelo WhatsApp ou e-mail informado."
              : `${items.length} ${items.length === 1 ? "item" : "itens"} na composição · um vendedor cuida do restante.`}
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="space-y-5 pt-2">
            <div className="flex items-start gap-3 p-4 border border-western-gold/30 bg-western-gold/5">
              <CheckCircle2 className="h-5 w-5 text-western-gold mt-0.5 flex-shrink-0" />
              <div className="text-sm text-western-green-deep">
                <p className="font-medium mb-1">Sua composição foi salva.</p>
                <p className="text-western-stone-warm leading-relaxed">
                  {isApproved
                    ? `Subtotal de referência: ${formatBRL(subtotal, currency)}.`
                    : "Os preços serão confirmados pelo vendedor após validação do cadastro."}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleDownloadPdf}
              className="w-full h-12 inline-flex items-center justify-center gap-2 bg-western-green-deep text-western-cream hover:bg-western-green-deep/90 font-mono text-xs uppercase tracking-[0.22em] transition-colors"
            >
              <FileDown className="h-4 w-4" /> Baixar PDF da composição
            </button>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="w-full h-10 border border-western-stone-warm/30 text-western-green-deep hover:border-western-green-deep font-mono text-[11px] uppercase tracking-[0.22em] transition-colors"
            >
              Fechar
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-spec text-western-stone-warm">Nome *</Label>
                <Input
                  value={form.nome}
                  onChange={(e) => handleChange("nome")(e.target.value)}
                  className="rounded-none mt-1"
                  placeholder="Seu nome completo"
                />
                {errors.nome && <p className="text-xs text-red-600 mt-1">{errors.nome}</p>}
              </div>
              <div>
                <Label className="text-spec text-western-stone-warm">Empresa</Label>
                <Input
                  value={form.empresa}
                  onChange={(e) => handleChange("empresa")(e.target.value)}
                  className="rounded-none mt-1"
                  placeholder="Estúdio, escritório…"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-spec text-western-stone-warm">E-mail *</Label>
                <div className="mt-1">
                  <EmailInput value={form.email} onChange={handleChange("email")} />
                </div>
                {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
              </div>
              <div>
                <Label className="text-spec text-western-stone-warm">Telefone *</Label>
                <PhoneInput
                  value={form.telefone}
                  onChange={handleChange("telefone")}
                  className="rounded-none mt-1"
                />
                {errors.telefone && <p className="text-xs text-red-600 mt-1">{errors.telefone}</p>}
              </div>
            </div>

            <div>
              <Label className="text-spec text-western-stone-warm">Cidade</Label>
              <Input
                value={form.cidade}
                onChange={(e) => handleChange("cidade")(e.target.value)}
                className="rounded-none mt-1"
                placeholder="Cidade · UF"
              />
            </div>

            <div>
              <Label className="text-spec text-western-stone-warm">Mensagem (opcional)</Label>
              <Textarea
                value={form.mensagem}
                onChange={(e) => handleChange("mensagem")(e.target.value)}
                className="rounded-none mt-1 min-h-[90px]"
                placeholder="Prazo, projeto, dúvidas, observações…"
                maxLength={1000}
              />
            </div>

            {isApproved && (
              <div className="flex justify-between items-baseline border-t border-western-stone-warm/20 pt-3">
                <span className="text-eyebrow text-western-stone-warm">Subtotal de referência</span>
                <span className="font-display text-xl text-western-green-deep">
                  {formatBRL(subtotal, currency)}
                </span>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full h-12 inline-flex items-center justify-center gap-2 bg-western-gold text-western-green-deep hover:bg-western-gold/90 font-mono text-xs uppercase tracking-[0.25em] transition-colors disabled:opacity-50"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Send className="h-4 w-4" /> Enviar pedido de orçamento
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleDownloadPdf}
              className="w-full h-10 inline-flex items-center justify-center gap-2 border border-western-stone-warm/30 text-western-green-deep hover:border-western-green-deep font-mono text-[11px] uppercase tracking-[0.22em] transition-colors"
            >
              <FileDown className="h-4 w-4" /> Baixar PDF agora
            </button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
