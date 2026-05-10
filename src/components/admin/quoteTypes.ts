// Tipos compartilhados pelo módulo de Orçamentos do admin.
export type QuoteStatus =
  | "novo"
  | "em_atendimento"
  | "proposta_enviada"
  | "fechado"
  | "perdido"
  | "arquivado";

export const QUOTE_STATUS_LABEL: Record<QuoteStatus, string> = {
  novo: "Novo",
  em_atendimento: "Em atendimento",
  proposta_enviada: "Proposta enviada",
  fechado: "Fechado",
  perdido: "Perdido",
  arquivado: "Arquivado",
};

export const QUOTE_STATUS_CLS: Record<QuoteStatus, string> = {
  novo: "border-western-gold/60 text-western-gold bg-western-gold/10",
  em_atendimento: "border-blue-500/40 text-blue-700 bg-blue-50",
  proposta_enviada: "border-violet-500/40 text-violet-700 bg-violet-50",
  fechado: "border-emerald-600/50 text-emerald-700 bg-emerald-50",
  perdido: "border-red-500/40 text-red-700 bg-red-50",
  arquivado: "border-western-stone-warm/40 text-western-stone-warm bg-western-stone-warm/10",
};

export interface QuoteThread {
  id: string;
  lead_id: string;
  status: QuoteStatus;
  notas: string | null;
  pago_em: string | null;
  forma_pagamento: string | null;
  parcelas: number | null;
  valor_final: number | null;
  observacoes_venda: string | null;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface QuotePayloadItem {
  handle: string;
  title: string;
  variantId?: string;
  variantTitle?: string;
  options?: { name: string; value: string }[];
  quantity: number;
  unitPrice: number;
  currency?: string;
  image?: string | null;
}

export interface QuotePayload {
  items: QuotePayloadItem[];
  subtotal: number;
  currency: string;
  numero?: string;
  summary?: string;
  submitted_at?: string;
}

export interface QuoteProposal {
  id: string;
  lead_id: string;
  numero: string;
  items: QuotePayloadItem[];
  subtotal: number;
  discount_pct: number;
  discount_value: number;
  total: number;
  forma_pagamento: string | null;
  parcelas: number | null;
  validade_dias: number | null;
  observacoes: string | null;
  pdf_path: string | null;
  sent_at: string | null;
  created_at: string;
}
