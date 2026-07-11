import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Check, X, Phone, Search, Download, Eye, Save, ShieldCheck, LayoutGrid, Table as TableIcon, ExternalLink, ShieldX, ChevronsUpDown, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from "@/components/ui/sheet";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toCSV, downloadCSV, KV, TIERS, TIER_LABEL, TIER_BADGE_CLS, type Partner, type Tier } from "@/components/admin/adminUtils";
import { CredenciamentoTab } from "./AdminCredenciamentos";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { LoadError } from "@/components/admin/LoadError";

function StatusChip({ status }: { status: Partner["status"] }) {
  const map = {
    pending: { label: "Em análise", cls: "border-western-stone-warm/40 text-western-stone-warm" },
    approved: { label: "Aprovado", cls: "border-green-700/40 text-green-800 bg-green-50" },
    rejected: { label: "Recusado", cls: "border-red-700/40 text-red-700 bg-red-50" },
    cancelled: { label: "Cancelada", cls: "border-slate-500/40 text-slate-700 bg-slate-100" },
  };
  const m = map[status] ?? map.pending;
  return (
    <span className={`inline-flex items-center px-2.5 py-1 border font-mono text-[10px] uppercase tracking-[0.18em] ${m.cls}`}>
      {m.label}
    </span>
  );
}

export default function AdminPartners() {
  const [searchParams, setSearchParams] = useSearchParams();
  const rawTab = searchParams.get("tab");
  const tab: "credenciamento" | "ativos" = rawTab === "ativos" ? "ativos" : "credenciamento";

  const [counts, setCounts] = useState<{ cred: number; partners: number }>({ cred: 0, partners: 0 });
  const [countsError, setCountsError] = useState(false);

  const loadCounts = async () => {
    try {
      const [c, p] = await Promise.all([
        supabase.from("credenciamentos").select("id", { count: "exact", head: true }).eq("status_manual", "pendente"),
        supabase.from("partner_profiles").select("id", { count: "exact", head: true }).eq("status", "pending"),
      ]);
      if (c.error) throw c.error;
      if (p.error) throw p.error;
      setCounts({ cred: c.count ?? 0, partners: p.count ?? 0 });
      setCountsError(false);
    } catch {
      setCountsError(true);
    }
  };

  useEffect(() => {
    let cancelled = false;
    (async () => { if (!cancelled) await loadCounts(); })();
    return () => { cancelled = true; };
  }, [tab]);

  return (
    <div>
      <p className="text-eyebrow mb-3">Parceiros</p>
      <div className="w-12 h-px bg-western-gold mb-6" />
      <h1 className="font-display text-3xl mb-2">Programa Western Pro</h1>
      <p className="text-western-stone-warm mb-8">Analise credenciamentos, gerencie parceiros ativos e ajuste tier, descontos e permissões.</p>

      {countsError && (
        <div className="mb-6">
          <LoadError message="Não foi possível carregar as contagens de pendências." onRetry={loadCounts} compact />
        </div>
      )}



      <Tabs
        value={tab}
        onValueChange={(v) => {
          const next = new URLSearchParams(searchParams);
          next.set("tab", v);
          setSearchParams(next, { replace: true });
        }}
      >
        <TabsList className="mb-6 rounded-none bg-western-paper border border-western-stone-warm/20 h-auto p-1">
          <TabsTrigger value="credenciamento" className="rounded-none font-mono text-[11px] uppercase tracking-[0.18em] data-[state=active]:bg-western-gold/15 data-[state=active]:text-western-green-deep">
            Credenciamento
            {counts.cred > 0 && (
              <span className="ml-2 inline-flex items-center justify-center min-w-[18px] h-4 px-1 rounded-full bg-western-gold text-western-green-deep text-[9px] font-bold tabular-nums">
                {counts.cred > 99 ? "99+" : counts.cred}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="ativos" className="rounded-none font-mono text-[11px] uppercase tracking-[0.18em] data-[state=active]:bg-western-gold/15 data-[state=active]:text-western-green-deep">
            Ativos
            {counts.partners > 0 && (
              <span className="ml-2 inline-flex items-center justify-center min-w-[18px] h-4 px-1 rounded-full bg-western-gold text-western-green-deep text-[9px] font-bold tabular-nums">
                {counts.partners > 99 ? "99+" : counts.partners}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="credenciamento" className="mt-0">
          <CredenciamentoTab />
        </TabsContent>
        <TabsContent value="ativos" className="mt-0">
          <AtivosTab
            onGoToCredenciamento={() => {
              const next = new URLSearchParams(searchParams);
              next.set("tab", "credenciamento");
              setSearchParams(next, { replace: true });
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function AtivosTab({ onGoToCredenciamento }: { onGoToCredenciamento: () => void }) {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [adminIds, setAdminIds] = useState<Set<string>>(new Set());
  const [tierDefaults, setTierDefaults] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<"all" | Partner["status"]>("all");
  const [segmentFilter, setSegmentFilter] = useState<string>("all");
  const [ufFilter, setUfFilter] = useState<string>("all");
  const [q, setQ] = useState("");
  const [drawer, setDrawer] = useState<Partner | null>(null);
  const [layout, setLayout] = useState<"cards" | "table">("cards");
  const [loadError, setLoadError] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<{ p: Partner; status: Partner["status"] } | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [confirmRevokeOpen, setConfirmRevokeOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Partner | null>(null);
  const [tierChangeOpen, setTierChangeOpen] = useState(false);
  const [bulkTier, setBulkTier] = useState<Tier>("light");
  const [confirmTierOpen, setConfirmTierOpen] = useState(false);
  const [bulkBusy, setBulkBusy] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [pr, rr, tdr] = await Promise.all([
        supabase.from("partner_profiles").select("*").order("created_at", { ascending: false }),
        supabase.from("user_roles").select("user_id, role").eq("role", "admin"),
        supabase.from("tier_defaults").select("tier, discount_pct"),
      ]);
      if (pr.error) throw pr.error;
      if (rr.error) throw rr.error;
      if (tdr.error) throw tdr.error;
      setPartners((pr.data as Partner[]) ?? []);
      setAdminIds(new Set(((rr.data ?? []) as Array<{ user_id: string }>).map((r) => r.user_id)));
      const map: Record<string, number> = {};
      ((tdr.data ?? []) as Array<{ tier: string; discount_pct: number }>).forEach((t) => { map[t.tier] = t.discount_pct; });
      setTierDefaults(map);
      setLoadError(false);
    } catch {
      setLoadError(true);
    }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const segments = useMemo(() => Array.from(new Set(partners.map((p) => p.segmento).filter(Boolean))) as string[], [partners]);
  const ufs = useMemo(() => Array.from(new Set(partners.map((p) => p.estado).filter(Boolean))) as string[], [partners]);

  const filtered = useMemo(() => partners.filter((p) => {
    if (layout === "table" && p.status !== "approved") return false;
    if (layout === "cards" && statusFilter !== "all" && p.status !== statusFilter) return false;
    if (segmentFilter !== "all" && p.segmento !== segmentFilter) return false;
    if (ufFilter !== "all" && p.estado !== ufFilter) return false;
    if (q) {
      const hay = [p.nome, p.empresa, p.cnpj, p.cidade].filter(Boolean).join(" ").toLowerCase();
      if (!hay.includes(q.toLowerCase())) return false;
    }
    return true;
  }), [partners, statusFilter, segmentFilter, ufFilter, q, layout]);

  const tableRows = useMemo(() => {
    if (layout !== "table") return filtered;
    return [...filtered].sort((a, b) => (a.empresa ?? "").localeCompare(b.empresa ?? "", "pt-BR"));
  }, [filtered, layout]);

  const setStatus = async (p: Partner, status: Partner["status"]) => {
    const approvedAt = status === "approved" ? new Date().toISOString() : null;
    const { error } = await supabase
      .from("partner_profiles")
      .update({ status, approved_at: approvedAt } as never)
      .eq("id", p.id);
    if (error) { toast.error("Não foi possível atualizar.", { description: error.message }); return; }
    toast.success(status === "approved" ? "Parceiro aprovado." : status === "rejected" ? "Acesso negado." : "Status atualizado.");
    load();
  };

  /** Wrapper que confirma quando a mudança REVOGA um parceiro já aprovado. */
  const requestSetStatus = async (p: Partner, status: Partner["status"]) => {
    if (p.status === "approved" && status !== "approved") {
      setPendingStatus({ p, status });
      return;
    }
    await setStatus(p, status);
  };

  // ── Multi-seleção (qualquer status) ────────────────────────────────────
  useEffect(() => { setSelectedIds(new Set()); }, [statusFilter, segmentFilter, ufFilter, q, layout]);

  const selectableRows = useMemo(() => filtered, [filtered]);
  const selectableIds = useMemo(() => selectableRows.map((p) => p.id), [selectableRows]);
  const allSelected = selectableIds.length > 0 && selectableIds.every((id) => selectedIds.has(id));
  const someSelected = selectableIds.some((id) => selectedIds.has(id));
  const indeterminate = someSelected && !allSelected;

  const toggleOne = (id: string) =>
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  const toggleAll = () =>
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allSelected) selectableIds.forEach((id) => next.delete(id));
      else selectableIds.forEach((id) => next.add(id));
      return next;
    });
  const clearSelection = () => setSelectedIds(new Set());

  const selectedRows = useMemo(
    () => partners.filter((p) => selectedIds.has(p.id) && p.status === "approved"),
    [partners, selectedIds]
  );

  const handleBulkExport = () => {
    if (selectedRows.length === 0) return;
    downloadCSV(
      `parceiros-selecionados-${new Date().toISOString().slice(0, 10)}.csv`,
      toCSV(selectedRows as unknown as Record<string, unknown>[])
    );
    toast.success(`${selectedRows.length} parceiro(s) exportados.`);
  };

  const handleBulkRevoke = async () => {
    if (selectedRows.length === 0) { setConfirmRevokeOpen(false); return; }
    setBulkBusy(true);
    const results = await Promise.allSettled(
      selectedRows.map((p) =>
        supabase.from("partner_profiles").update({ status: "rejected", approved_at: null } as never).eq("id", p.id)
      )
    );
    const ok = results.filter((x) => x.status === "fulfilled" && !(x as PromiseFulfilledResult<{ error: unknown }>).value.error).length;
    const fail = results.length - ok;
    setBulkBusy(false);
    setConfirmRevokeOpen(false);
    toast.success(`Acesso revogado de ${ok} parceiro(s).`, fail ? { description: `${fail} falharam.` } : undefined);
    clearSelection();
    await load();
  };

  const handleBulkTierChange = async () => {
    if (selectedRows.length === 0) { setConfirmTierOpen(false); return; }
    setBulkBusy(true);
    const results = await Promise.allSettled(
      selectedRows.map((p) =>
        supabase.from("partner_profiles").update({ tier: bulkTier } as never).eq("id", p.id)
      )
    );
    const ok = results.filter((x) => x.status === "fulfilled" && !(x as PromiseFulfilledResult<{ error: unknown }>).value.error).length;
    const fail = results.length - ok;
    setBulkBusy(false);
    setConfirmTierOpen(false);
    setTierChangeOpen(false);
    toast.success(`${ok} parceiro(s) movidos para ${TIER_LABEL[bulkTier]}.`, fail ? { description: `${fail} falharam.` } : undefined);
    clearSelection();
    await load();
  };

  if (loading) return <div className="py-20 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-western-gold" /></div>;
  if (loadError) {
    return (
      <div className="py-6">
        <LoadError message="Não foi possível carregar a lista de parceiros." onRetry={load} />
      </div>
    );
  }

  return (
    <div className={selectedIds.size > 0 ? "pb-24 md:pb-0" : ""}>

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="inline-flex border border-western-stone-warm/25">
          <button
            onClick={() => setLayout("cards")}
            className={`h-9 px-3 font-mono text-[10px] uppercase tracking-[0.18em] inline-flex items-center gap-1.5 ${layout === "cards" ? "bg-western-gold/15 text-western-green-deep" : "text-western-stone-warm"}`}
          >
            <LayoutGrid className="h-3.5 w-3.5" /> Cards
          </button>
          <button
            onClick={() => setLayout("table")}
            className={`h-9 px-3 font-mono text-[10px] uppercase tracking-[0.18em] inline-flex items-center gap-1.5 border-l border-western-stone-warm/25 ${layout === "table" ? "bg-western-gold/15 text-western-green-deep" : "text-western-stone-warm"}`}
          >
            <TableIcon className="h-3.5 w-3.5" /> Tabela
          </button>
        </div>
        {layout === "table" && (
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-western-stone-warm">Apenas aprovados</span>
        )}
      </div>

      {layout === "cards" && (
        <div className="flex flex-wrap gap-2 mb-4">
          {(["pending", "approved", "rejected", "cancelled", "all"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`h-9 px-4 font-mono text-[11px] uppercase tracking-[0.18em] border transition-colors ${
                statusFilter === s
                  ? "border-western-gold text-western-green-deep bg-western-gold/10"
                  : "border-western-stone-warm/25 text-western-stone-warm hover:border-western-gold/60"
              }`}
            >
              {s === "all" ? "Todos" : s === "pending" ? "Pendentes" : s === "approved" ? "Aprovados" : s === "rejected" ? "Recusados" : "Canceladas"}
            </button>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-3 mb-6 items-center">
        <div className="relative flex-1 min-w-[220px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-western-stone-warm" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Nome, empresa, CNPJ, cidade…" className="h-10 pl-9 rounded-none border-western-stone-warm/25" />
        </div>
        <Select value={segmentFilter} onValueChange={setSegmentFilter}>
          <SelectTrigger className="h-10 w-[180px] rounded-none border-western-stone-warm/25"><SelectValue placeholder="Segmento" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os segmentos</SelectItem>
            {segments.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={ufFilter} onValueChange={setUfFilter}>
          <SelectTrigger className="h-10 w-[120px] rounded-none border-western-stone-warm/25"><SelectValue placeholder="UF" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas UFs</SelectItem>
            {ufs.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button onClick={() => downloadCSV(`parceiros-${new Date().toISOString().slice(0,10)}.csv`, toCSV(filtered as unknown as Record<string,unknown>[]))} variant="outline" className="h-10 rounded-none border-western-stone-warm/25 font-mono text-[11px] uppercase tracking-[0.18em]">
          <Download className="h-3.5 w-3.5 mr-2" /> CSV
        </Button>
      </div>

      {selectableRows.length > 0 && (
        <div className="flex items-center gap-3 mb-3 px-3 py-2 border border-western-stone-warm/20 bg-western-paper/60">
          <Checkbox
            checked={allSelected ? true : indeterminate ? "indeterminate" : false}
            onCheckedChange={toggleAll}
            aria-label="Selecionar todos os aprovados"
          />
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-western-stone-warm">
            Selecionar todos os aprovados no filtro ({selectableRows.length})
            {selectedIds.size > 0 && ` · ${selectedIds.size} selecionado(s)`}
          </span>
        </div>
      )}

      {layout === "cards" ? (
        <div className="space-y-3">
          {filtered.length === 0 && <p className="text-western-stone-warm py-10 text-center">Nenhum parceiro nesse filtro.</p>}
          {filtered.map((p) => {
            const pm = (p.payment_methods ?? {}) as { boleto?: boolean; kit_gratis?: boolean };
            const isAdminUser = adminIds.has(p.user_id);
            const hasCred = !!p.credenciamento_id;
            const isApproved = p.status === "approved";
            const selected = selectedIds.has(p.id);
            return (
              <div key={p.id} className={`border bg-white p-5 ${selected ? "border-western-gold bg-western-gold/5" : "border-western-stone-warm/20"}`}>
                <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    {isApproved && (
                      <div className="pt-1" onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selected}
                          onCheckedChange={() => toggleOne(p.id)}
                          aria-label={`Selecionar ${p.empresa ?? p.nome ?? ""}`}
                        />
                      </div>
                    )}
                    <div className="min-w-0">
                      <h3 className="font-display text-xl text-western-green-deep">{p.empresa || "—"}</h3>
                      <p className="text-spec text-western-stone-warm mt-1">
                        {[p.nome, p.cargo, p.segmento, [p.cidade, p.estado].filter(Boolean).join("/")].filter(Boolean).join(" · ")}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <StatusChip status={p.status} />
                    {p.status === "approved" && (
                      <span className={`inline-flex items-center px-2 py-0.5 border font-mono text-[10px] uppercase tracking-[0.18em] ${TIER_BADGE_CLS[p.tier as Tier]}`}>
                        {TIER_LABEL[p.tier as Tier]}
                      </span>
                    )}
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-x-6 gap-y-1 text-xs text-western-stone-warm mb-4">
                  {p.cnpj && <span>CNPJ: {p.cnpj}</span>}
                  {p.telefone && <span className="inline-flex items-center gap-1"><Phone className="h-3 w-3" /> {p.telefone}</span>}
                  {p.instagram && <span>@{p.instagram.replace(/^@/, "")}</span>}
                  {p.site && <span>{p.site}</span>}
                  <span>Cadastro: {new Date(p.created_at).toLocaleDateString("pt-BR")}</span>
                  {p.status === "approved" && (() => {
                    const tierPct = tierDefaults[p.tier] ?? null;
                    const usedPct = p.discount_override ?? tierPct;
                    const label = p.discount_override != null
                      ? `Desconto: ${p.discount_override}% (personalizado)`
                      : tierPct != null
                        ? `Desconto: ${tierPct}% (padrão ${TIER_LABEL[p.tier as Tier]})`
                        : `Desconto: padrão ${TIER_LABEL[p.tier as Tier]}`;
                    return (
                      <span>
                        {label}
                        {pm.boleto ? " · Boleto" : ""}{pm.kit_gratis ? " · Kit grátis" : ""}{isAdminUser ? " · Admin" : ""}
                        {usedPct == null ? "" : ""}
                      </span>
                    );
                  })()}
                </div>
                <div className="flex flex-wrap gap-2">
                  {hasCred && p.status !== "approved" && p.status !== "cancelled" ? (
                    <button
                      onClick={onGoToCredenciamento}
                      className="h-9 px-4 border border-western-gold/60 text-western-green-deep hover:bg-western-gold/10 font-mono text-[11px] uppercase tracking-[0.2em] inline-flex items-center gap-1"
                    >
                      <ExternalLink className="h-3.5 w-3.5 mr-1" /> Analisar no Credenciamento
                    </button>
                  ) : (
                    <>
                      {!hasCred && p.status !== "approved" && p.status !== "cancelled" && (
                        <Button onClick={() => requestSetStatus(p, "approved")} className="h-9 px-4 bg-western-green-deep text-western-cream hover:bg-western-green-mid font-mono text-[11px] uppercase tracking-[0.2em] rounded-none">
                          <Check className="h-3.5 w-3.5 mr-1" /> Aprovar
                        </Button>
                      )}
                      {!hasCred && p.status !== "rejected" && p.status !== "cancelled" && (
                        <Button onClick={() => requestSetStatus(p, "rejected")} variant="outline" className="h-9 px-4 border-western-stone-warm/30 text-western-stone-warm hover:border-red-700 hover:text-red-700 font-mono text-[11px] uppercase tracking-[0.2em] rounded-none">
                          <X className="h-3.5 w-3.5 mr-1" /> Recusar
                        </Button>
                      )}
                    </>
                  )}
                  {p.status !== "pending" && (
                    <Button onClick={() => requestSetStatus(p, "pending")} variant="ghost" className="h-9 px-4 text-western-stone-warm hover:text-western-green-deep font-mono text-[11px] uppercase tracking-[0.2em] rounded-none">
                      Reverter
                    </Button>
                  )}
                  <Button onClick={() => setDrawer(p)} variant="ghost" className="h-9 px-4 text-western-stone-warm hover:text-western-green-deep font-mono text-[11px] uppercase tracking-[0.2em] rounded-none ml-auto">
                    <Eye className="h-3.5 w-3.5 mr-1" /> {p.status === "approved" ? "Detalhes & Tier" : "Detalhes"}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="overflow-x-auto border border-western-stone-warm/20 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-western-paper text-[10px] font-mono uppercase tracking-[0.18em] text-western-stone-warm">
              <tr>
                <th className="px-3 py-3 w-10">
                  <Checkbox
                    checked={allSelected ? true : indeterminate ? "indeterminate" : false}
                    onCheckedChange={toggleAll}
                    disabled={selectableIds.length === 0}
                    aria-label="Selecionar todos"
                  />
                </th>
                <th className="text-left px-4 py-3">Empresa</th>
                <th className="text-left px-4 py-3">Tier</th>
                <th className="text-left px-4 py-3">Desconto</th>
                <th className="text-left px-4 py-3">Boleto</th>
                <th className="text-left px-4 py-3">Kit</th>
                <th className="text-left px-4 py-3">Admin</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {tableRows.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-10 text-center text-western-stone-warm">Nenhum parceiro aprovado.</td></tr>
              )}
              {tableRows.map((p) => {
                const pm = (p.payment_methods ?? {}) as { boleto?: boolean; kit_gratis?: boolean };
                const isAdminUser = adminIds.has(p.user_id);
                const selected = selectedIds.has(p.id);
                return (
                  <tr key={p.id} className={`border-t border-western-stone-warm/10 hover:bg-western-paper/50 ${selected ? "bg-western-gold/5" : ""}`}>
                    <td className="px-3 py-3 align-top" onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selected}
                        onCheckedChange={() => toggleOne(p.id)}
                        aria-label={`Selecionar ${p.empresa ?? ""}`}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-western-green-deep">{p.empresa || "—"}</p>
                      <p className="text-xs text-western-stone-warm">{[p.nome, p.cnpj].filter(Boolean).join(" · ")}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 border font-mono text-[10px] uppercase tracking-[0.18em] ${TIER_BADGE_CLS[p.tier as Tier]}`}>
                        {TIER_LABEL[p.tier as Tier]}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono">{p.discount_override != null ? `${p.discount_override}% *` : "—"}</td>
                    <td className="px-4 py-3">{pm.boleto ? "Sim" : "—"}</td>
                    <td className="px-4 py-3">{pm.kit_gratis ? "Sim" : "—"}</td>
                    <td className="px-4 py-3">{isAdminUser && <ShieldCheck className="h-4 w-4 text-western-gold" />}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => setDrawer(p)} className="inline-flex items-center gap-1 text-xs font-mono uppercase tracking-[0.18em] text-western-stone-warm hover:text-western-gold">
                        <Eye className="h-3.5 w-3.5" /> Editar
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p className="px-4 py-2 text-[10px] text-western-stone-warm">* Desconto personalizado (sobrescreve o padrão do nível).</p>
        </div>
      )}

      {selectedIds.size > 0 && (
        <div className="fixed md:sticky bottom-0 md:bottom-4 left-0 right-0 md:left-auto md:right-auto z-30 md:mt-4 border-t md:border border-western-stone-warm/30 bg-western-cream md:bg-white shadow-lg md:shadow-md">
          <div className="flex flex-wrap items-center gap-3 px-4 py-3">
            <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-western-green-deep">
              {selectedIds.size} selecionado(s)
            </span>
            <div className="flex-1" />
            <Button
              onClick={handleBulkExport}
              disabled={bulkBusy}
              variant="outline"
              className="h-9 rounded-none border-western-stone-warm/30 font-mono text-[11px] uppercase tracking-[0.18em]"
            >
              <Download className="h-3.5 w-3.5 mr-2" /> Exportar (CSV)
            </Button>
            <Button
              onClick={() => setTierChangeOpen(true)}
              disabled={bulkBusy}
              variant="outline"
              className="h-9 rounded-none border-western-stone-warm/30 font-mono text-[11px] uppercase tracking-[0.18em]"
            >
              <ChevronsUpDown className="h-3.5 w-3.5 mr-2" /> Mudar nível
            </Button>
            <Button
              onClick={() => setConfirmRevokeOpen(true)}
              disabled={bulkBusy}
              className="h-9 rounded-none bg-red-700 text-white hover:bg-red-800 font-mono text-[11px] uppercase tracking-[0.18em]"
            >
              <ShieldX className="h-3.5 w-3.5 mr-2" /> Revogar acesso
            </Button>
            <Button
              onClick={clearSelection}
              disabled={bulkBusy}
              variant="ghost"
              className="h-9 rounded-none font-mono text-[11px] uppercase tracking-[0.18em] text-western-stone-warm"
            >
              <X className="h-3.5 w-3.5 mr-1" /> Limpar
            </Button>
          </div>
        </div>
      )}

      {/* Modal: escolher nível em lote */}
      <Sheet open={tierChangeOpen} onOpenChange={(o) => { if (!o) setTierChangeOpen(false); }}>
        <SheetContent className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Mudar nível de {selectedIds.size} parceiro(s)</SheetTitle>
            <SheetDescription>Todos os parceiros selecionados passarão para o nível escolhido. Descontos personalizados individuais são mantidos.</SheetDescription>
          </SheetHeader>
          <div className="mt-6 space-y-4">
            <div>
              <Label className="text-eyebrow mb-2 block">Novo nível</Label>
              <Select value={bulkTier} onValueChange={(v) => setBulkTier(v as Tier)}>
                <SelectTrigger className="h-11 rounded-none border-western-stone-warm/25"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TIERS.map((t) => <SelectItem key={t} value={t}>{TIER_LABEL[t]}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 pt-4">
              <Button
                onClick={() => setTierChangeOpen(false)}
                variant="outline"
                className="flex-1 h-11 rounded-none font-mono text-[11px] uppercase tracking-[0.18em]"
              >
                Cancelar
              </Button>
              <Button
                onClick={() => setConfirmTierOpen(true)}
                className="flex-1 h-11 rounded-none bg-western-green-deep text-western-cream hover:bg-western-green-mid font-mono text-[11px] uppercase tracking-[0.18em]"
              >
                Aplicar
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <ConfirmDialog
        open={confirmTierOpen}
        onOpenChange={setConfirmTierOpen}
        title={`Mudar ${selectedIds.size} parceiro(s) para ${TIER_LABEL[bulkTier]}?`}
        description="Os padrões de desconto do novo nível passam a valer imediatamente para todos os selecionados."
        confirmLabel={bulkBusy ? "Aplicando…" : "Aplicar"}
        onConfirm={handleBulkTierChange}
      />

      <ConfirmDialog
        open={confirmRevokeOpen}
        onOpenChange={setConfirmRevokeOpen}
        title={`Revogar o acesso de ${selectedIds.size} parceiro(s)?`}
        description="Eles perdem imediatamente o acesso ao Programa Western Pro e ao catálogo de atacado. Você pode reverter individualmente depois."
        confirmLabel={bulkBusy ? "Revogando…" : "Revogar acesso"}
        danger
        onConfirm={handleBulkRevoke}
      />



      <PartnerDrawer
        partner={drawer}
        isAdmin={drawer ? adminIds.has(drawer.user_id) : false}
        onClose={() => setDrawer(null)}
        onSaved={load}
        onStatus={requestSetStatus}
      />

      <ConfirmDialog
        open={!!pendingStatus}
        onOpenChange={(o) => { if (!o) setPendingStatus(null); }}
        title={
          pendingStatus?.status === "rejected"
            ? "Revogar acesso do parceiro?"
            : pendingStatus?.status === "cancelled"
              ? "Cancelar parceiro?"
              : "Reverter para em análise?"
        }
        description={`Isto revoga o acesso do parceiro ${
          pendingStatus?.p.empresa || pendingStatus?.p.nome || ""
        } ao Programa Western Pro. Confirmar?`}
        confirmLabel={pendingStatus?.status === "rejected" ? "Revogar acesso" : "Confirmar"}
        danger
        onConfirm={async () => {
          if (!pendingStatus) return;
          const { p, status } = pendingStatus;
          setPendingStatus(null);
          await setStatus(p, status);
        }}
      />
    </div>
  );
}

function PartnerDrawer({
  partner, isAdmin, onClose, onSaved, onStatus,
}: {
  partner: Partner | null;
  isAdmin: boolean;
  onClose: () => void;
  onSaved: () => void;
  onStatus: (p: Partner, status: Partner["status"]) => Promise<void>;
}) {
  const [tier, setTier] = useState<Tier>("light");
  const [discount, setDiscount] = useState<string>("");
  const [boleto, setBoleto] = useState(false);
  const [parcelas, setParcelas] = useState<string>("1");
  const [kit, setKit] = useState(false);
  const [admin, setAdmin] = useState(false);
  const [confirmAdmin, setConfirmAdmin] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!partner) return;
    setTier(partner.tier as Tier);
    setDiscount(partner.discount_override != null ? String(partner.discount_override) : "");
    const pm = (partner.payment_methods ?? {}) as { boleto?: boolean; parcelas_max?: number; kit_gratis?: boolean };
    setBoleto(!!pm.boleto);
    setParcelas(String(pm.parcelas_max ?? 1));
    setKit(!!pm.kit_gratis);
    setAdmin(isAdmin);
  }, [partner, isAdmin]);

  if (!partner) return null;
  const isApproved = partner.status === "approved";

  const save = async () => {
    setSaving(true);
    const payment_methods = {
      boleto,
      parcelas_max: Math.max(1, Math.min(12, parseInt(parcelas, 10) || 1)),
      kit_gratis: kit,
    };
    const discount_override = discount.trim() === "" ? null : Math.max(0, Math.min(100, parseFloat(discount)));
    const { error } = await supabase
      .from("partner_profiles")
      .update({ tier, discount_override, payment_methods } as never)
      .eq("id", partner.id);
    if (error) { toast.error("Erro ao salvar.", { description: error.message }); setSaving(false); return; }

    if (admin && !isAdmin) {
      await supabase.from("user_roles").upsert({ user_id: partner.user_id, role: "admin" }, { onConflict: "user_id,role" });
    } else if (!admin && isAdmin) {
      await supabase.from("user_roles").delete().eq("user_id", partner.user_id).eq("role", "admin");
    }

    toast.success("Configurações atualizadas.");
    setSaving(false);
    onSaved();
  };

  return (
    <Sheet open={!!partner} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{partner.empresa || "Parceiro"}</SheetTitle>
          <SheetDescription>{partner.nome}</SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-western-stone-warm w-32 flex-shrink-0">Status</span>
            <StatusChip status={partner.status} />
          </div>
          <KV k="Responsável" v={[partner.nome, partner.cargo].filter(Boolean).join(" · ") || "—"} />
          <KV k="CNPJ" v={partner.cnpj} />
          <KV k="Segmento" v={partner.segmento} />
          <KV k="Telefone" v={partner.telefone} />
          <KV k="Site" v={partner.site} />
          <KV k="Instagram" v={partner.instagram} />
          <div className="pt-4 border-t border-western-stone-warm/15">
            <p className="text-eyebrow mb-3">Endereço</p>
            <KV k="CEP" v={partner.cep} />
            <KV k="Logradouro" v={[partner.endereco, partner.numero].filter(Boolean).join(", ")} />
            <KV k="Complemento" v={partner.complemento} />
            <KV k="Bairro" v={partner.bairro} />
            <KV k="Cidade/UF" v={[partner.cidade, partner.estado].filter(Boolean).join("/")} />
          </div>
          {partner.cancellation_reason && (
            <div className="pt-4 border-t border-western-stone-warm/15">
              <p className="text-eyebrow mb-2">Motivo do cancelamento</p>
              <p className="text-western-green-deep whitespace-pre-wrap">{partner.cancellation_reason}</p>
              {partner.cancelled_at && <p className="text-xs text-western-stone-warm mt-2">em {new Date(partner.cancelled_at).toLocaleString("pt-BR")}</p>}
            </div>
          )}
        </div>

        {!isApproved ? (
          <div className="mt-6 border-t border-western-stone-warm/15 pt-6 space-y-3">
            <p className="text-eyebrow">Aprovação</p>
            <p className="text-xs text-western-stone-warm">As configurações de tier, desconto e permissões só ficam disponíveis após aprovar o cadastro.</p>
            <div className="flex gap-2">
              {partner.status !== "cancelled" && (
                <Button onClick={async () => { await onStatus(partner, "approved"); onClose(); }} className="flex-1 h-11 bg-western-green-deep text-western-cream hover:bg-western-green-mid font-mono text-[11px] uppercase tracking-[0.2em] rounded-none">
                  <Check className="h-3.5 w-3.5 mr-1" /> Aprovar
                </Button>
              )}
              {partner.status !== "rejected" && partner.status !== "cancelled" && (
                <Button onClick={async () => { await onStatus(partner, "rejected"); onClose(); }} variant="outline" className="flex-1 h-11 border-western-stone-warm/30 text-western-stone-warm hover:border-red-700 hover:text-red-700 font-mono text-[11px] uppercase tracking-[0.2em] rounded-none">
                  <X className="h-3.5 w-3.5 mr-1" /> Recusar
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="mt-6 border-t border-western-stone-warm/15 pt-6 space-y-6">
            <div>
              <p className="text-eyebrow mb-1">Programa Western Pro</p>
              <p className="text-xs text-western-stone-warm">Defina o nível e ajustes individuais deste parceiro.</p>
            </div>

            <div>
              <Label className="text-eyebrow mb-2 block">Nível</Label>
              <Select value={tier} onValueChange={(v) => setTier(v as Tier)}>
                <SelectTrigger className="h-11 rounded-none border-western-stone-warm/25"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TIERS.map((t) => <SelectItem key={t} value={t}>{TIER_LABEL[t]}</SelectItem>)}
                </SelectContent>
              </Select>
              <p className="text-xs text-western-stone-warm mt-2">O nível define os padrões de desconto, boleto e parcelas (configuráveis em Configurações).</p>
            </div>

            <div>
              <Label className="text-eyebrow mb-2 block">Desconto personalizado (%) — opcional</Label>
              <Input
                type="number" min={0} max={100} step="0.5"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                placeholder="Vazio = usa o padrão do nível"
                className="h-11 rounded-none border-western-stone-warm/25"
              />
            </div>

            <div className="flex items-center justify-between border-t border-western-stone-warm/15 pt-4">
              <div>
                <Label className="text-sm">Liberar boleto</Label>
                <p className="text-xs text-western-stone-warm">Cliente pode finalizar com boleto bancário.</p>
              </div>
              <Switch checked={boleto} onCheckedChange={setBoleto} />
            </div>

            <div>
              <Label className="text-eyebrow mb-2 block">Parcelas máximas</Label>
              <Input
                type="number" min={1} max={12}
                value={parcelas}
                onChange={(e) => setParcelas(e.target.value)}
                className="h-11 rounded-none border-western-stone-warm/25"
              />
            </div>

            <div className="flex items-center justify-between border-t border-western-stone-warm/15 pt-4">
              <div>
                <Label className="text-sm">Kit de amostras grátis</Label>
                <p className="text-xs text-western-stone-warm">Aprovação imediata sem custo.</p>
              </div>
              <Switch checked={kit} onCheckedChange={setKit} />
            </div>

            <div className="mt-2 border-2 border-red-300/70 bg-red-50/60 p-4">
              <p className="text-[10px] font-mono uppercase tracking-[0.22em] text-red-800 mb-3 inline-flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5" /> Acesso ao sistema · ação sensível
              </p>
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <Label className="text-sm text-western-green-deep">Promover a admin</Label>
                  <p className="text-xs text-red-800/80 mt-1">
                    Dá acesso <strong>TOTAL</strong> ao painel administrativo (/admin) — leads, orçamentos, pedidos, parceiros, configurações.
                  </p>
                </div>
                <Switch
                  checked={admin}
                  onCheckedChange={(v) => {
                    if (v && !admin) setConfirmAdmin(true);
                    else setAdmin(v);
                  }}
                />
              </div>
            </div>

            <ConfirmDialog
              open={confirmAdmin}
              onOpenChange={setConfirmAdmin}
              title="Promover a administrador?"
              description="Isto dá acesso TOTAL ao painel administrativo para esta pessoa. Confirmar?"
              confirmLabel="Sim, promover"
              danger
              onConfirm={() => { setAdmin(true); setConfirmAdmin(false); }}
            />

            <Button onClick={save} disabled={saving} className="w-full h-12 bg-western-green-deep text-western-cream hover:bg-western-green-mid font-mono text-xs uppercase tracking-[0.25em] rounded-none">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Save className="h-4 w-4 mr-2" /> Salvar configurações</>}
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
