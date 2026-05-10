import { supabase } from "@/integrations/supabase/client";
import type { CartItem } from "@/stores/cartStore";

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
}: QuoteSubmission) {
  const lineSummary = items
    .map((i) => `${i.quantity}× ${i.productTitle}`)
    .join(" | ");

  const { error } = await supabase.from("leads").insert({
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
      submitted_at: new Date().toISOString(),
    },
  });

  if (error) throw error;
}
