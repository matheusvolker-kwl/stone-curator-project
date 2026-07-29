import { cn } from "@/lib/utils";

/**
 * Badge de status — DESSATURADO. Nunca berrante: o status informa, não grita.
 * Cantos 6px, 14px (mínimo do DS), sans semibold.
 *
 *   <StatusBadge status="pendente" />
 *   <StatusBadge status="em_producao" />
 *   <StatusBadge status="novo" label="Novo lead" />   // sobrescreve o rótulo
 *   <StatusBadge status="qualquer_coisa" tom="info" /> // sobrescreve o tom
 *
 * O mapa abaixo cobre os status que JÁ EXISTEM no banco. Não inventei nenhum:
 *   credenciamentos.status_manual  → pendente · aprovado · recusado · na
 *   partner_profiles.status        → pending · approved · rejected · cancelled
 *   quote_threads.status           → novo · em_atendimento · proposta_enviada ·
 *                                    fechado · perdido · arquivado
 *   leads.payload.aprovacao_status → pending · approved · shipped · delivered
 *   pedidos.status                 → aguardando · em_producao · controle_qualidade ·
 *                                    pronto · em_transporte · entregue · retirado · cancelado
 *
 * Status desconhecido não quebra: cai no tom neutro e mostra o valor cru.
 */

export type TomStatus = "neutro" | "info" | "andamento" | "positivo" | "aviso" | "negativo";

/* Semânticas do DS: sucesso #2E7D4F · aviso #9C6812 · erro #B3372E.
 * Tudo dessaturado: fundo ~6%, borda ~30%, texto na cor cheia. */
const TOM_CLS: Record<TomStatus, string> = {
  neutro: "border-western-border-strong bg-western-paper text-western-stone-warm",
  info: "border-western-bronze/35 bg-western-bronze/[0.07] text-western-bronze",
  andamento: "border-status-warning/30 bg-status-warning/[0.07] text-status-warning",
  positivo: "border-status-success/30 bg-status-success/[0.07] text-status-success",
  aviso: "border-status-warning/30 bg-status-warning/[0.07] text-status-warning",
  negativo: "border-status-error/30 bg-status-error/[0.06] text-status-error",
};

interface Meta {
  label: string;
  tom: TomStatus;
}

export const STATUS_META: Record<string, Meta> = {
  /* ── credenciamentos.status_manual ── */
  pendente: { label: "Pendente", tom: "aviso" },
  aprovado: { label: "Aprovado", tom: "positivo" },
  recusado: { label: "Recusado", tom: "negativo" },
  na: { label: "Automático", tom: "neutro" },

  /* ── partner_profiles.status / amostras (aprovacao_status) ── */
  pending: { label: "Pendente", tom: "aviso" },
  approved: { label: "Aprovado", tom: "positivo" },
  rejected: { label: "Recusado", tom: "negativo" },
  cancelled: { label: "Cancelado", tom: "neutro" },
  shipped: { label: "Enviado", tom: "andamento" },
  delivered: { label: "Entregue", tom: "positivo" },

  /* ── quote_threads.status ── */
  novo: { label: "Novo", tom: "info" },
  em_atendimento: { label: "Em atendimento", tom: "andamento" },
  proposta_enviada: { label: "Proposta enviada", tom: "andamento" },
  fechado: { label: "Fechado", tom: "positivo" },
  perdido: { label: "Perdido", tom: "negativo" },
  arquivado: { label: "Arquivado", tom: "neutro" },

  /* ── pedidos.status ── */
  aguardando: { label: "Aguardando", tom: "aviso" },
  em_producao: { label: "Em produção", tom: "andamento" },
  controle_qualidade: { label: "Controle de qualidade", tom: "andamento" },
  pronto: { label: "Pronto", tom: "positivo" },
  em_transporte: { label: "Em transporte", tom: "andamento" },
  entregue: { label: "Entregue", tom: "positivo" },
  retirado: { label: "Retirado", tom: "positivo" },
  cancelado: { label: "Cancelado", tom: "negativo" },
};

/** Rótulo humano de um status (sem o badge) — útil em toasts e títulos. */
export function rotuloStatus(status: string | null | undefined): string {
  if (!status) return "—";
  return STATUS_META[status]?.label ?? status;
}

interface Props {
  status: string | null | undefined;
  /** Sobrescreve o rótulo do mapa. */
  label?: string;
  /** Sobrescreve o tom do mapa. */
  tom?: TomStatus;
  className?: string;
}

export function StatusBadge({ status, label, tom, className }: Props) {
  if (!status) {
    return <span className="text-meta">—</span>;
  }

  const meta = STATUS_META[status];
  const tomFinal = tom ?? meta?.tom ?? "neutro";
  const labelFinal = label ?? meta?.label ?? status;

  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap rounded-sm border px-2.5 py-1",
        "text-[14px] font-semibold leading-none",
        TOM_CLS[tomFinal],
        className,
      )}
    >
      {labelFinal}
    </span>
  );
}
