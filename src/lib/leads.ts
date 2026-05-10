import { supabase } from "@/integrations/supabase/client";
import type { CartItem } from "@/stores/cartStore";
import { orcamentoPdfBlob, type PdfProjetoContext } from "@/lib/pdf/orcamentoPdf";

export interface QuoteContact {
  nome: string;
  email: string;
  telefone: string;
  empresa?: string;
  cidade?: string;
  mensagem?: string;
}

export type QuoteOrigem = "cart_drawer" | "guia_composicao";

export interface QuoteSubmission {
  contact: QuoteContact;
  items: CartItem[];
  subtotal: number;
  currency: string;
  userId?: string | null;
  showPrices?: boolean;
  origem?: QuoteOrigem;
  payloadExtra?: Record<string, unknown>;
  projetoContext?: PdfProjetoContext;
}

export interface QuoteResult {
  leadId: string;
  numero: string;
  pdfStored: boolean;
  pdfBlob?: Blob;
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result;
      if (typeof result === "string") resolve(result.split(",")[1] ?? result);
      else reject(new Error("Não foi possível preparar o PDF para salvar."));
    };
    reader.onerror = () => reject(reader.error ?? new Error("Não foi possível ler o PDF."));
    reader.readAsDataURL(blob);
  });
}

function summarizeItems(items: CartItem[]) {
  return items.map((i) => ({
    handle: i.productHandle,
    title: i.productTitle,
    variantId: i.variantId,
    variantTitle: i.variantTitle,
    options: i.selectedOptions,
    quantity: i.quantity,
    unitPrice: parseFloat(i.price.amount),
    currency: i.price.currencyCode,
    image: i.productImage,
  }));
}

export async function submitQuoteLead({
  contact,
  items,
  subtotal,
  currency,
  userId,
  showPrices = false,
  origem = "cart_drawer",
  payloadExtra,
  projetoContext,
}: QuoteSubmission): Promise<QuoteResult> {
  const lineSummary = items
    .map((i) => `${i.quantity}× ${i.productTitle}`)
    .join(" | ");

  const numero = Math.random().toString(36).slice(2, 7).toUpperCase();
  const leadId = crypto.randomUUID();

  const { error } = await supabase
    .from("leads")
    .insert({
      id: leadId,
      type: "orcamento",
      origem,
      nome: contact.nome,
      email: contact.email,
      telefone: contact.telefone,
      empresa: contact.empresa ?? null,
      cidade: contact.cidade ?? null,
      mensagem: contact.mensagem ?? null,
      user_id: userId ?? null,
      payload: {
        items: summarizeItems(items),
        subtotal,
        currency,
        summary: lineSummary,
        numero,
        origem,
        projeto: projetoContext ?? null,
        extra: payloadExtra ?? null,
        submitted_at: new Date().toISOString(),
      } as never,
    });

  if (error) throw error;
  const lead = { id: leadId };

  // Always generate the PDF blob — used for download in success screen
  let pdfBlob: Blob | undefined;
  try {
    pdfBlob = await orcamentoPdfBlob({
      items,
      subtotal,
      currency,
      cliente: {
        nome: contact.nome,
        email: contact.email,
        telefone: contact.telefone,
        empresa: contact.empresa,
        cidade: contact.cidade,
        mensagem: contact.mensagem,
      },
      showPrices,
      numero,
      projeto: projetoContext,
    });
  } catch (e) {
    console.warn("PDF generation failed", e);
  }

  let pdfStored = false;

  // Save PDF in the customer's account when authenticated.
  // This goes through a backend function to avoid browser-side Storage RLS issues.
  if (userId && pdfBlob) {
    try {
      const pdfBase64 = await blobToBase64(pdfBlob);
      const { error: saveErr } = await supabase.functions.invoke("save-quote-pdf", {
        body: {
          leadId: lead.id,
          pdfBase64,
          subtotal,
          itemsCount: items.length,
        },
      });

      if (!saveErr) {
        pdfStored = true;
      } else {
        console.warn("PDF save failed", saveErr);
      }
    } catch (e) {
      console.warn("PDF save failed", e);
    }
  }

  return { leadId: lead.id, numero, pdfStored, pdfBlob };
}
