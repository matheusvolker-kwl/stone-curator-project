import { supabase } from "@/integrations/supabase/client";
import type { CartItem } from "@/stores/cartStore";
import { orcamentoPdfBlob } from "@/lib/pdf/orcamentoPdf";

export interface QuoteContact {
  nome: string;
  email: string;
  telefone: string;
  empresa?: string;
  cidade?: string;
  mensagem?: string;
}

export interface QuoteSubmission {
  contact: QuoteContact;
  items: CartItem[];
  subtotal: number;
  currency: string;
  userId?: string | null;
  showPrices?: boolean;
}

export interface QuoteResult {
  leadId: string;
  numero: string;
  pdfStored: boolean;
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
}: QuoteSubmission): Promise<QuoteResult> {
  const lineSummary = items
    .map((i) => `${i.quantity}× ${i.productTitle}`)
    .join(" | ");

  const numero = Math.random().toString(36).slice(2, 7).toUpperCase();

  const { data: lead, error } = await supabase
    .from("leads")
    .insert({
      type: "orcamento",
      origem: "cart_drawer",
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
        submitted_at: new Date().toISOString(),
      },
    })
    .select("id")
    .single();

  if (error || !lead) throw error ?? new Error("Falha ao registrar orçamento");

  let pdfStored = false;

  // Upload PDF when user is authenticated
  if (userId) {
    try {
      const blob = await orcamentoPdfBlob({
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
      });

      const path = `${userId}/${lead.id}.pdf`;
      const { error: upErr } = await supabase.storage
        .from("orcamentos")
        .upload(path, blob, { contentType: "application/pdf", upsert: true });

      if (!upErr) {
        await supabase.from("quote_pdfs").insert({
          user_id: userId,
          lead_id: lead.id,
          storage_path: path,
          subtotal,
          items_count: items.length,
        });
        pdfStored = true;
      } else {
        console.warn("PDF upload failed", upErr);
      }
    } catch (e) {
      console.warn("PDF generation/upload failed", e);
    }
  }

  return { leadId: lead.id, numero, pdfStored };
}
