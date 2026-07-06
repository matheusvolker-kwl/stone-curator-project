import { supabase } from "@/integrations/supabase/client";
import type { CartItem } from "@/stores/cartStore";
import { orcamentoPdfBlob, type PdfProjetoContext } from "@/lib/pdf/orcamentoPdf";
import { computeItemsHash } from "@/lib/leads/itemsHash";
import { reportError } from "@/lib/telemetry";

export async function submitSecureLead(
  lead: Record<string, unknown>,
  token: string,
): Promise<{ ok: boolean; id?: string; error?: string }> {
  const { data, error } = await supabase.functions.invoke("lead-submit", {
    body: { token, lead },
  });
  if (error) return { ok: false, error: error.message };
  return (data as { ok: boolean; id?: string; error?: string }) ?? { ok: false, error: "sem resposta" };
}

export async function submitContactLead(
  input: {
    nome: string;
    email: string;
    telefone: string;
    cidade?: string;
    uf?: string;
    mensagem?: string;
    origem: string;
    payload?: Record<string, unknown>;
  },
  token: string,
): Promise<{ ok: boolean; error?: string }> {
  const res = await submitSecureLead(
    {
      type: "contato",
      nome: input.nome,
      email: input.email || null,
      telefone: input.telefone || null,
      cidade: input.cidade ?? null,
      uf: input.uf ?? null,
      mensagem: input.mensagem ?? null,
      origem: input.origem,
      payload: input.payload ?? {},
    },
    token,
  );
  if (!res.ok) {
    void reportError({
      source: "submitContactLead",
      message: "Falha ao registrar lead de contato",
      error: new Error(res.error ?? "unknown"),
      context: { origem: input.origem },
    });
    return { ok: false, error: res.error };
  }
  return { ok: true };
}

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
  const itemsHash = await computeItemsHash(items);

  const { data: rpcData, error } = await supabase.rpc("register_orcamento_lead", {
    _items_hash: itemsHash,
    _nome: contact.nome,
    _email: contact.email,
    _telefone: contact.telefone,
    _empresa: contact.empresa ?? null,
    _cidade: contact.cidade ?? null,
    _mensagem: contact.mensagem ?? null,
    _origem: origem,
    _payload: {
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

  if (error || !rpcData || (Array.isArray(rpcData) && rpcData.length === 0)) {
    void reportError({
      source: "submitQuoteLead.rpc",
      message: "Falha ao registrar orçamento via RPC",
      error: error ?? new Error("empty rpc result"),
      context: { origem, userId, itemsCount: items.length, subtotal, numero },
    });
    throw error ?? new Error("Falha ao registrar orçamento");
  }
  const row = Array.isArray(rpcData) ? rpcData[0] : rpcData;
  const lead = { id: (row as { lead_id: string }).lead_id };

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
    void reportError({
      source: "submitQuoteLead.pdfBuild",
      message: "Falha ao gerar PDF do orçamento",
      error: e,
      context: { leadId: lead.id, itemsCount: items.length, origem },
    });
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
        void reportError({
          source: "save-quote-pdf.invoke",
          message: "Edge function save-quote-pdf retornou erro",
          error: saveErr,
          context: { leadId: lead.id, userId, itemsCount: items.length, subtotal, sizeKb: Math.round((pdfBlob.size ?? 0) / 1024) },
        });
      }
    } catch (e) {
      console.warn("PDF save failed", e);
      void reportError({
        source: "save-quote-pdf.invoke",
        message: "Exceção ao chamar save-quote-pdf",
        error: e,
        context: { leadId: lead.id, userId, itemsCount: items.length, subtotal },
      });
    }
  }

  // Fire-and-forget: envia o PDF por e-mail ao cliente (logado ou anônimo).
  if (pdfBlob && contact.email) {
    void (async () => {
      try {
        const pdfBase64 = await blobToBase64(pdfBlob);
        await supabase.functions.invoke("send-quote-email", {
          body: { email: contact.email, nome: contact.nome, numero, pdfBase64 },
        });
      } catch (e) {
        console.warn("send-quote-email failed", e);
      }
    })();
  }

  return { leadId: lead.id, numero, pdfStored, pdfBlob };
}
