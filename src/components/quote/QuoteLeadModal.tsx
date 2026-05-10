import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, FileDown, Send, CheckCircle2, MessageCircle, UserCheck } from "lucide-react";
import { BUSINESS } from "@/config/business";
import PhoneInput from "@/components/forms/PhoneInput";
import EmailInput from "@/components/forms/EmailInput";
import { emailSchema, phoneBRSchema } from "@/lib/forms/br";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { submitQuoteLead, type QuoteOrigem } from "@/lib/leads";
import type { PdfProjetoContext } from "@/lib/pdf/orcamentoPdf";
import type { CartItem } from "@/stores/cartStore";
import { formatBRL } from "@/lib/shopify/client";

const baseSchema = z.object({
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
  items: CartItem[];
  subtotal: number;
  currency?: string;
  origem: QuoteOrigem;
  payloadExtra?: Record<string, unknown>;
  projetoContext?: PdfProjetoContext;
  /** Override CTA copy (e.g. "Solicitar orçamento sob consulta"). */
  ctaLabel?: string;
  /** Title shown in the modal header. */
  title?: string;
}

export default function QuoteLeadModal({
  open,
  onOpenChange,
  items,
  subtotal,
  currency = "BRL",
  origem,
  payloadExtra,
  projetoContext,
  ctaLabel,
  title,
}: Props) {
  const { user, isApproved, empresa } = useAuth();
  const isLogged = !!user;

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
  const [numero, setNumero] = useState<string>("");
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);

  useEffect(() => {
    if (!open) return;
    setSuccess(false);
    setErrors({});
    setPdfBlob(null);
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
    const parsed = baseSchema.safeParse(form);
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
      const res = await submitQuoteLead({
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
        showPrices: isApproved,
        origem,
        payloadExtra,
        projetoContext,
      });
      setNumero(res.numero);
      setPdfBlob(res.pdfBlob ?? null);
      setSuccess(true);
      toast.success("Pedido enviado! Um vendedor entrará em contato.");
    } catch (err) {
      console.error(err);
      toast.error("Não foi possível enviar agora. Tente novamente em instantes.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownloadPdf = () => {
    if (!pdfBlob) {
      toast.error("PDF indisponível. Tente novamente.");
      return;
    }
    const url = URL.createObjectURL(pdfBlob);
    const a = document.createElement("a");
    a.href = url;
    const stamp = new Date()
      .toISOString()
      .replace(/[-:]/g, "")
      .replace("T", "-")
      .slice(0, 13);
    a.download = `western-orcamento-${numero || stamp}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const whatsappUrl = (() => {
    const valorTxt = isApproved ? ` (subtotal ${formatBRL(subtotal, currency)})` : "";
    const msg = `Olá! Acabei de enviar o orçamento Nº ${numero || ""} com ${items.length} ${items.length === 1 ? "item" : "itens"}${valorTxt}. Gostaria de falar com um vendedor.`;
    return `https://wa.me/${BUSINESS.whatsappFabrica}?text=${encodeURIComponent(msg)}`;
  })();

  const headerTitle =
    title ?? (origem === "guia_composicao" ? "Solicitar orçamento do projeto" : "Solicitar orçamento");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto bg-western-cream border-western-stone-warm/20">
        <DialogHeader>
          <p className="text-eyebrow">Pedido de orçamento</p>
          <DialogTitle className="font-display text-2xl text-western-green-deep">
            {success ? "Recebido!" : headerTitle}
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
                <p className="font-medium mb-1">
                  Composição salva {numero && <span className="font-mono text-xs text-western-gold">· Nº {numero}</span>}
                </p>
                <p className="text-western-stone-warm leading-relaxed">
                  {isApproved
                    ? `Subtotal de referência: ${formatBRL(subtotal, currency)}.`
                    : "Os preços serão confirmados pelo vendedor após validação do cadastro."}
                </p>
                {isLogged ? (
                  <p className="text-western-stone-warm leading-relaxed mt-2 text-xs">
                    O PDF também ficou disponível em{" "}
                    <Link
                      to="/minha-conta/orcamentos"
                      className="text-western-green-deep font-medium underline-offset-2 hover:underline"
                    >
                      Minha conta · Orçamentos
                    </Link>
                    .
                  </p>
                ) : (
                  <p className="text-western-stone-warm leading-relaxed mt-2 text-xs">
                    Quer guardar todas as suas composições?{" "}
                    <Link
                      to="/parceiro/cadastro"
                      className="text-western-green-deep font-medium underline-offset-2 hover:underline"
                    >
                      Crie uma conta
                    </Link>{" "}
                    e elas ficam salvas pra sempre.
                  </p>
                )}
              </div>
            </div>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full h-12 inline-flex items-center justify-center gap-2 bg-western-gold text-western-green-deep hover:bg-western-gold/90 font-mono text-xs uppercase tracking-[0.25em] transition-colors"
            >
              <MessageCircle className="h-4 w-4" /> Falar com vendedor agora
            </a>
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={!pdfBlob}
              className="w-full h-11 inline-flex items-center justify-center gap-2 border border-western-green-deep/30 text-western-green-deep hover:border-western-green-deep font-mono text-[11px] uppercase tracking-[0.22em] transition-colors disabled:opacity-50"
            >
              <FileDown className="h-4 w-4" /> Baixar PDF da composição
            </button>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="w-full h-10 text-western-stone-warm hover:text-western-green-deep font-mono text-[11px] uppercase tracking-[0.22em] transition-colors"
            >
              Fechar
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            {isLogged ? (
              <div className="flex items-start gap-3 p-3 bg-western-green-deep/5 border border-western-green-deep/15">
                <UserCheck className="h-4 w-4 text-western-green-deep mt-0.5 flex-shrink-0" />
                <div className="text-xs text-western-green-deep leading-relaxed">
                  Enviando como <strong>{form.nome || user?.email}</strong>
                  {form.empresa && <> · {form.empresa}</>}.
                  <br />
                  <span className="text-western-stone-warm">
                    Sua composição vai ficar salva em{" "}
                    <Link
                      to="/minha-conta/orcamentos"
                      className="underline-offset-2 hover:underline"
                    >
                      Minha conta · Orçamentos
                    </Link>
                    .
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-western-stone-warm leading-relaxed -mt-1">
                Já é parceiro?{" "}
                <Link
                  to="/parceiro/login"
                  className="text-western-green-deep font-medium underline-offset-2 hover:underline"
                >
                  Entre na sua conta
                </Link>{" "}
                para guardar suas composições.
              </p>
            )}

            {/* Campos contato — escondidos quando logado e prefilled */}
            {!isLogged && (
              <>
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
                    <Label className="text-spec text-western-stone-warm">WhatsApp *</Label>
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
              </>
            )}

            {/* Campos faltantes para usuário logado (caso profile incompleto) */}
            {isLogged && !form.telefone && (
              <div>
                <Label className="text-spec text-western-stone-warm">WhatsApp *</Label>
                <PhoneInput
                  value={form.telefone}
                  onChange={handleChange("telefone")}
                  className="rounded-none mt-1"
                />
                {errors.telefone && <p className="text-xs text-red-600 mt-1">{errors.telefone}</p>}
              </div>
            )}

            <div>
              <Label className="text-spec text-western-stone-warm">
                {isLogged ? "Mensagem para o vendedor" : "Mensagem (opcional)"}
              </Label>
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
                  <Send className="h-4 w-4" /> {ctaLabel ?? "Enviar pedido de orçamento"}
                </>
              )}
            </button>

            <p className="text-[10.5px] text-western-stone-warm text-center leading-relaxed">
              O PDF da composição fica disponível para download logo após o envio.
            </p>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
