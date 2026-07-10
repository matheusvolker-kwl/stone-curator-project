import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Search, Mail, Phone, Building2, ArrowRight, Archive, Trash2, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { chipCls, type Lead } from "@/components/admin/adminUtils";
import {
  QUOTE_STATUS_LABEL,
  QUOTE_STATUS_CLS,
  type QuoteStatus,
  type QuoteThread,
  type QuotePayload,
} from "@/components/admin/quoteTypes";
import { formatBRL } from "@/lib/catalog/client";
import { LoadError } from "@/components/admin/LoadError";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { toast } from "sonner";

const ALL_STATUS: ("all" | QuoteStatus)[] = [
  "all", "novo", "em_atendimento", "proposta_enviada", "fechado", "perdido", "arquivado",
];

interface QuoteRow {
  lead: Lead;
  thread: QuoteThread;
  payload: QuotePayload;
}

export default function AdminQuotes() {
  const [rows, setRows] = useState<QuoteRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [statusFilter, setStatusFilter] = useState<"all" | QuoteStatus>("all");
  const [q, setQ] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const [leadsRes, threadsRes] = await Promise.all([
      supabase
        .from("leads")
        .select("*")
        .eq("type", "orcamento")
        .order("created_at", { ascending: false })
        .limit(2000),
      supabase.from("quote_threads").select("*"),
    ]);
    if (leadsRes.error || threadsRes.error) {
      setLoadError(true);
      setRows([]);
      setLoading(false);
      return;
    }
    const threadByLead = new Map<string, QuoteThread>();
    ((threadsRes.data as QuoteThread[]) ?? []).forEach((t) => threadByLead.set(t.lead_id, t));
    const built: QuoteRow[] = ((leadsRes.data as Lead[]) ?? []).map((lead) => ({
      lead,
      thread:
        threadByLead.get(lead.id) ??
        ({
          id: "",
          lead_id: lead.id,
          status: "novo",
          notas: null,
          pago_em: null,
          forma_pagamento: null,
          parcelas: null,
          valor_final: null,
          observacoes_venda: null,
          archived_at: null,
          created_at: lead.created_at,
          updated_at: lead.created_at,
        } as QuoteThread),
      payload: (lead.payload as unknown as QuotePayload) ?? {
        items: [], subtotal: 0, currency: "BRL",
      },
    }));
    setRows(built);
    setLoadError(false);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [confirmArchiveOpen, setConfirmArchiveOpen] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: rows.length };
    rows.forEach((r) => {
      c[r.thread.status] = (c[r.thread.status] ?? 0) + 1;
    });
    return c;
  }, [rows]);

  const filtered = useMemo(
    () =>
      rows.filter((r) => {
        if (statusFilter !== "all" && r.thread.status !== statusFilter) return false;
        if (q) {
          const hay = [
            r.lead.nome, r.lead.empresa, r.lead.email, r.lead.telefone, r.lead.cidade,
            r.payload.numero, r.payload.summary,
          ].filter(Boolean).join(" ").toLowerCase();
          if (!hay.includes(q.toLowerCase())) return false;
        }
        return true;
      }),
    [rows, statusFilter, q],
  );

  // Limpa seleção quando o contexto (filtro/busca) muda
  useEffect(() => { setSelectedIds(new Set()); }, [statusFilter, q]);

  const filteredIds = useMemo(() => filtered.map((r) => r.lead.id), [filtered]);
  const allFilteredSelected = filteredIds.length > 0 && filteredIds.every((id) => selectedIds.has(id));
  const someFilteredSelected = filteredIds.some((id) => selectedIds.has(id));

  const toggleOne = (id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id); else next.delete(id);
      return next;
    });
  };
  const toggleAllFiltered = (checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) filteredIds.forEach((id) => next.add(id));
      else filteredIds.forEach((id) => next.delete(id));
      return next;
    });
  };
  const clearSelection = () => setSelectedIds(new Set());

  const selectedRows = useMemo(
    () => rows.filter((r) => selectedIds.has(r.lead.id)),
    [rows, selectedIds],
  );

  const handleArchiveSelected = async () => {
    if (selectedIds.size === 0) return;
    setArchiving(true);
    const now = new Date().toISOString();
    // Só arquiva os que ainda NÃO estão arquivados; os que não têm thread persistida precisam de upsert
    const targets = selectedRows.filter((r) => r.thread.status !== "arquivado");
    try {
      const results = await Promise.allSettled(
        targets.map((r) => {
          if (r.thread.id) {
            return supabase
              .from("quote_threads")
              .update({ status: "arquivado", archived_at: now })
              .eq("id", r.thread.id);
          }
          return supabase
            .from("quote_threads")
            .upsert(
              { lead_id: r.lead.id, status: "arquivado", archived_at: now },
              { onConflict: "lead_id" },
            );
        }),
      );
      let ok = 0, fail = 0;
      results.forEach((res) => {
        if (res.status === "fulfilled" && !res.value.error) ok++;
        else fail++;
      });
      if (fail === 0) toast.success(`${ok} orçamento(s) arquivado(s).`);
      else if (ok === 0) toast.error(`Falha ao arquivar ${fail} orçamento(s).`);
      else toast.warning(`${ok} arquivado(s), ${fail} falharam.`);
    } catch (e) {
      console.error(e);
      toast.error("Erro ao arquivar orçamentos.");
    } finally {
      setArchiving(false);
      setConfirmArchiveOpen(false);
      clearSelection();
      load();
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) return;
    setDeleting(true);
    const ids = Array.from(selectedIds);
    try {
      const results = await Promise.allSettled(
        ids.map((id) => supabase.from("leads").delete().eq("id", id)),
      );
      let ok = 0, fail = 0;
      results.forEach((res) => {
        if (res.status === "fulfilled" && !res.value.error) ok++;
        else fail++;
      });
      if (fail === 0) toast.success(`${ok} orçamento(s) excluído(s).`);
      else if (ok === 0) toast.error(`Falha ao excluir ${fail} orçamento(s).`);
      else toast.warning(`${ok} excluído(s), ${fail} falharam.`);
    } catch (e) {
      console.error(e);
      toast.error("Erro ao excluir orçamentos.");
    } finally {
      setDeleting(false);
      setConfirmDeleteOpen(false);
      clearSelection();
      load();
    }
  };


  if (loading)
    return (
      <div className="py-20 flex justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-western-gold" />
      </div>
    );

  if (loadError)
    return (
      <div>
        <p className="text-eyebrow mb-3">Comercial</p>
        <div className="w-12 h-px bg-western-gold mb-6" />
        <h1 className="font-display text-3xl mb-6">Orçamentos</h1>
        <LoadError onRetry={load} />
      </div>
    );

  return (
    <div className={selectedIds.size > 0 ? "pb-28 sm:pb-24" : undefined}>
      <p className="text-eyebrow mb-3">Comercial</p>
      <div className="w-12 h-px bg-western-gold mb-6" />
      <h1 className="font-display text-3xl mb-2">Orçamentos</h1>
      <p className="text-western-stone-warm mb-8 max-w-2xl">
        Pedidos de orçamento recebidos pelo carrinho. Clique para ver os itens, enviar uma proposta com desconto/parcelamento e fechar a venda.
      </p>

      {/* Filtros de status */}
      <div className="flex flex-wrap gap-2 mb-4">
        {ALL_STATUS.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={chipCls(statusFilter === s)}
          >
            {s === "all" ? "Todos" : QUOTE_STATUS_LABEL[s as QuoteStatus]}
            <span className="ml-2 opacity-60">{counts[s] ?? 0}</span>
          </button>
        ))}
      </div>

      {/* Busca */}
      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-western-stone-warm" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar por nome, empresa, e-mail, número…"
          className="h-10 pl-9 rounded-none border-western-stone-warm/25"
        />
      </div>

      {/* Lista */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="border border-dashed border-western-stone-warm/25 bg-white p-10 text-center text-western-stone-warm">
            Nenhum orçamento neste filtro.
          </div>
        ) : (
          <div className="flex items-center gap-3 px-2 pb-1 border-b border-western-stone-warm/15">
            <Checkbox
              checked={allFilteredSelected ? true : someFilteredSelected ? "indeterminate" : false}
              onCheckedChange={(v) => toggleAllFiltered(v === true)}
              aria-label="Selecionar todos (filtro atual)"
            />
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-western-stone-warm">
              {selectedIds.size > 0 ? `${selectedIds.size} selecionado(s)` : "Selecionar todos (filtro atual)"}
            </span>
          </div>
        )}
        {filtered.map((r) => {
          const checked = selectedIds.has(r.lead.id);
          return (
            <div
              key={r.lead.id}
              className={`flex items-stretch border bg-white hover:border-western-gold/60 transition-colors ${checked ? "border-western-gold/60 bg-western-gold/5" : "border-western-stone-warm/15"}`}
            >
              <div
                className="pl-3 pr-1 flex items-center"
                onClick={(e) => e.stopPropagation()}
              >
                <Checkbox
                  checked={checked}
                  onCheckedChange={(v) => toggleOne(r.lead.id, v === true)}
                  aria-label={`Selecionar orçamento ${r.payload.numero ?? r.lead.id.slice(0, 5)}`}
                />
              </div>
              <Link
                to={`/admin/orcamentos/${r.lead.id}`}
                className="flex-1 block"
              >
                <div className="p-4 md:p-5 grid md:grid-cols-[180px_1fr_auto] gap-4 items-center">
                  {/* Status + número + data */}
                  <div className="space-y-2">
                    <span
                      className={`inline-flex px-2 py-1 border font-mono text-[10px] uppercase tracking-[0.18em] ${QUOTE_STATUS_CLS[r.thread.status]}`}
                    >
                      {QUOTE_STATUS_LABEL[r.thread.status]}
                    </span>
                    <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-western-stone-warm">
                      Nº {r.payload.numero ?? r.lead.id.slice(0, 5).toUpperCase()}
                    </p>
                    <p className="text-[10px] font-mono text-western-stone-warm/70">
                      {new Date(r.lead.created_at).toLocaleString("pt-BR")}
                    </p>
                  </div>

                  {/* Cliente + resumo */}
                  <div className="min-w-0">
                    <p className="font-display text-lg text-western-green-deep">
                      {r.lead.nome || r.lead.empresa || r.lead.email || "(sem nome)"}
                    </p>
                    <div className="text-xs text-western-stone-warm mt-1 flex flex-wrap gap-x-4 gap-y-1">
                      {r.lead.empresa && (
                        <span className="inline-flex items-center gap-1">
                          <Building2 className="h-3 w-3" /> {r.lead.empresa}
                        </span>
                      )}
                      {r.lead.email && (
                        <span className="inline-flex items-center gap-1">
                          <Mail className="h-3 w-3" /> {r.lead.email}
                        </span>
                      )}
                      {r.lead.telefone && (
                        <span className="inline-flex items-center gap-1">
                          <Phone className="h-3 w-3" /> {r.lead.telefone}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-western-green-deep mt-2">
                      {r.payload.items?.length ?? 0}{" "}
                      {r.payload.items?.length === 1 ? "item" : "itens"} ·{" "}
                      <span className="font-mono">
                        {r.payload.subtotal > 0
                          ? formatBRL(r.payload.subtotal, r.payload.currency || "BRL")
                          : "—"}
                      </span>
                    </p>
                  </div>

                  <ArrowRight className="hidden md:block h-4 w-4 text-western-stone-warm" />
                </div>
              </Link>
            </div>
          );
        })}
      </div>

      {selectedIds.size > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-western-stone-warm/30 bg-western-cream/98 backdrop-blur px-4 py-3 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] sm:sticky sm:bottom-4 sm:mt-6 sm:border sm:shadow-md">
          <div className="max-w-6xl mx-auto flex flex-wrap items-center gap-2 sm:gap-3">
            <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-western-green-deep">
              {selectedIds.size} selecionado(s)
            </span>
            <div className="flex-1" />
            <Button
              onClick={() => setConfirmArchiveOpen(true)}
              disabled={archiving || deleting}
              className="h-9 rounded-none bg-western-green-deep hover:bg-western-green-mid text-western-cream font-mono text-[11px] uppercase tracking-[0.18em]"
            >
              {archiving ? <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" /> : <Archive className="h-3.5 w-3.5 mr-2" />} Arquivar
            </Button>
            <Button
              onClick={() => setConfirmDeleteOpen(true)}
              disabled={archiving || deleting}
              className="h-9 rounded-none bg-red-700 hover:bg-red-800 text-white font-mono text-[11px] uppercase tracking-[0.18em]"
            >
              {deleting ? <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" /> : <Trash2 className="h-3.5 w-3.5 mr-2" />} Excluir
            </Button>
            <Button
              onClick={clearSelection}
              variant="ghost"
              className="h-9 rounded-none font-mono text-[11px] uppercase tracking-[0.18em]"
            >
              <X className="h-3.5 w-3.5 mr-1" /> Limpar
            </Button>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirmArchiveOpen}
        onOpenChange={setConfirmArchiveOpen}
        title={`Arquivar ${selectedIds.size} orçamento(s)?`}
        description="Eles somem da lista padrão mas continuam acessíveis pelo filtro Arquivado. Nada é apagado."
        confirmLabel={archiving ? "Arquivando…" : "Arquivar"}
        onConfirm={handleArchiveSelected}
      />

      <ConfirmDialog
        open={confirmDeleteOpen}
        onOpenChange={setConfirmDeleteOpen}
        title={`Excluir ${selectedIds.size} orçamento(s) e todo o histórico?`}
        description="Não tem volta. Os orçamentos selecionados, propostas, mensagens e PDFs vinculados serão apagados."
        confirmLabel={deleting ? "Excluindo…" : "Excluir"}
        danger
        onConfirm={handleDeleteSelected}
      />
    </div>
  );
}

