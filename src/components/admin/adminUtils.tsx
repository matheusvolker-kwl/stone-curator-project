// Helpers compartilhados pelas páginas do /admin
export function toCSV<T extends Record<string, unknown>>(rows: T[]): string {
  if (!rows.length) return "";
  const cols = Object.keys(rows[0]);
  const esc = (v: unknown) => {
    if (v === null || v === undefined) return "";
    const s = typeof v === "object" ? JSON.stringify(v) : String(v);
    return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [cols.join(";"), ...rows.map((r) => cols.map((c) => esc(r[c])).join(";"))].join("\n");
}

export function downloadCSV(filename: string, content: string) {
  const blob = new Blob(["\ufeff" + content], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function chipCls(active: boolean) {
  return `h-9 px-4 font-mono text-[11px] uppercase tracking-[0.18em] border transition-colors ${
    active
      ? "border-western-gold text-western-green-deep bg-western-gold/10"
      : "border-western-stone-warm/25 text-western-stone-warm hover:border-western-gold/60"
  }`;
}

export function KV({ k, v }: { k: string; v: string | null | undefined }) {
  if (!v) return null;
  return (
    <div className="flex gap-3 text-sm">
      <dt className="text-[10px] font-mono uppercase tracking-[0.18em] text-western-stone-warm w-32 flex-shrink-0 pt-1">{k}</dt>
      <dd className="text-western-green-deep flex-1 break-words">{v}</dd>
    </div>
  );
}

export const TIERS = ["light", "gold", "platinum", "partner"] as const;
export type Tier = (typeof TIERS)[number];
export const TIER_LABEL: Record<Tier, string> = {
  light: "Western Pro Light",
  gold: "Western Pro Gold",
  platinum: "Western Pro Platinum",
  partner: "Western Pro Partner",
};
export const TIER_BADGE_CLS: Record<Tier, string> = {
  light: "border-western-stone-warm/40 text-western-stone-warm",
  gold: "border-amber-500/50 text-amber-700 bg-amber-50",
  platinum: "border-slate-400/60 text-slate-700 bg-slate-50",
  partner: "border-western-gold/60 text-western-green-deep bg-western-gold/10",
};

export interface Partner {
  id: string;
  user_id: string;
  nome: string | null;
  empresa: string | null;
  cnpj: string | null;
  segmento: string | null;
  telefone: string | null;
  cidade: string | null;
  estado: string | null;
  cep: string | null;
  endereco: string | null;
  numero: string | null;
  complemento: string | null;
  bairro: string | null;
  cargo: string | null;
  instagram: string | null;
  site: string | null;
  status: "pending" | "approved" | "rejected" | "cancelled";
  tier: Tier;
  discount_override: number | null;
  payment_methods: { boleto?: boolean; parcelas_max?: number; kit_gratis?: boolean } | null;
  newsletter_opt_in: boolean;
  cancellation_reason: string | null;
  cancelled_at: string | null;
  created_at: string;
  approved_at: string | null;
}

export interface Lead {
  id: string;
  type: string;
  nome: string | null;
  email: string | null;
  telefone: string | null;
  empresa: string | null;
  cnpj: string | null;
  segmento: string | null;
  cidade: string | null;
  uf: string | null;
  cep: string | null;
  endereco: string | null;
  mensagem: string | null;
  origem: string | null;
  payload: Record<string, unknown> | null;
  created_at: string;
  last_activity_at?: string | null;
  items_hash?: string | null;
}

export const LEAD_TYPE_LABEL: Record<string, string> = {
  partner_signup: "Cadastro parceiro",
  newsletter: "Newsletter",
  amostras: "Amostras",
  visita: "Visita",
  contato: "Contato",
  orcamento: "Orçamento",
  pedido_novo: "Pedido novo",
  pdf_pedido: "PDF re-baixado",
};

export const LEAD_TYPE_BADGE_CLS: Record<string, string> = {
  partner_signup: "border-sky-500/50 text-sky-700 bg-sky-50",
  newsletter: "border-slate-400/50 text-slate-600 bg-slate-50",
  amostras: "border-purple-500/50 text-purple-700 bg-purple-50",
  visita: "border-indigo-500/50 text-indigo-700 bg-indigo-50",
  contato: "border-zinc-400/50 text-zinc-600 bg-zinc-50",
  orcamento: "border-amber-500/60 text-amber-800 bg-amber-50",
  pedido_novo: "border-emerald-600/60 text-emerald-800 bg-emerald-50 font-semibold",
  pdf_pedido: "border-western-gold/60 text-western-green-deep bg-western-gold/10",
};
