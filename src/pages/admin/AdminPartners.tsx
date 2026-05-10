import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Check, X, Phone, Search, Download, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from "@/components/ui/sheet";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toCSV, downloadCSV, KV, TIER_LABEL, TIER_BADGE_CLS, type Partner, type Tier } from "@/components/admin/adminUtils";

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
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<"all" | Partner["status"]>("pending");
  const [segmentFilter, setSegmentFilter] = useState<string>("all");
  const [ufFilter, setUfFilter] = useState<string>("all");
  const [q, setQ] = useState("");
  const [drawer, setDrawer] = useState<Partner | null>(null);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("partner_profiles").select("*").order("created_at", { ascending: false });
    setPartners((data as Partner[]) ?? []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const segments = useMemo(() => Array.from(new Set(partners.map((p) => p.segmento).filter(Boolean))) as string[], [partners]);
  const ufs = useMemo(() => Array.from(new Set(partners.map((p) => p.estado).filter(Boolean))) as string[], [partners]);

  const filtered = useMemo(() => partners.filter((p) => {
    if (statusFilter !== "all" && p.status !== statusFilter) return false;
    if (segmentFilter !== "all" && p.segmento !== segmentFilter) return false;
    if (ufFilter !== "all" && p.estado !== ufFilter) return false;
    if (q) {
      const hay = [p.nome, p.empresa, p.cnpj, p.cidade].filter(Boolean).join(" ").toLowerCase();
      if (!hay.includes(q.toLowerCase())) return false;
    }
    return true;
  }), [partners, statusFilter, segmentFilter, ufFilter, q]);

  const setStatus = async (p: Partner, status: Partner["status"]) => {
    const patch: Record<string, unknown> = { status };
    if (status === "approved") patch.approved_at = new Date().toISOString();
    if (status === "pending" || status === "rejected") patch.approved_at = null;
    const { error } = await supabase.from("partner_profiles").update(patch).eq("id", p.id);
    if (error) { toast.error("Não foi possível atualizar.", { description: error.message }); return; }
    toast.success(status === "approved" ? "Parceiro aprovado." : status === "rejected" ? "Acesso negado." : "Status atualizado.");
    load();
  };

  if (loading) return <div className="py-20 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-western-gold" /></div>;

  return (
    <div>
      <p className="text-eyebrow mb-3">Parceiros</p>
      <div className="w-12 h-px bg-western-gold mb-6" />
      <h1 className="font-display text-3xl mb-2">Cadastros B2B</h1>
      <p className="text-western-stone-warm mb-8">Aprove, recuse ou consulte a base de parceiros.</p>

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

      <div className="space-y-3">
        {filtered.length === 0 && <p className="text-western-stone-warm py-10 text-center">Nenhum parceiro nesse filtro.</p>}
        {filtered.map((p) => (
          <div key={p.id} className="border border-western-stone-warm/20 bg-white p-5">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
              <div>
                <h3 className="font-display text-xl text-western-green-deep">{p.empresa || "—"}</h3>
                <p className="text-spec text-western-stone-warm mt-1">
                  {[p.nome, p.cargo, p.segmento, [p.cidade, p.estado].filter(Boolean).join("/")].filter(Boolean).join(" · ")}
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <StatusChip status={p.status} />
                <span className={`inline-flex items-center px-2 py-0.5 border font-mono text-[10px] uppercase tracking-[0.18em] ${TIER_BADGE_CLS[p.tier as Tier]}`}>
                  {TIER_LABEL[p.tier as Tier]}
                </span>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-x-6 gap-y-1 text-xs text-western-stone-warm mb-4">
              {p.cnpj && <span>CNPJ: {p.cnpj}</span>}
              {p.telefone && <span className="inline-flex items-center gap-1"><Phone className="h-3 w-3" /> {p.telefone}</span>}
              {p.instagram && <span>@{p.instagram.replace(/^@/, "")}</span>}
              {p.site && <span>{p.site}</span>}
              <span>Cadastro: {new Date(p.created_at).toLocaleDateString("pt-BR")}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {p.status !== "approved" && p.status !== "cancelled" && (
                <Button onClick={() => setStatus(p, "approved")} className="h-9 px-4 bg-western-green-deep text-western-cream hover:bg-western-green-mid font-mono text-[11px] uppercase tracking-[0.2em] rounded-none">
                  <Check className="h-3.5 w-3.5 mr-1" /> Aprovar
                </Button>
              )}
              {p.status !== "rejected" && p.status !== "cancelled" && (
                <Button onClick={() => setStatus(p, "rejected")} variant="outline" className="h-9 px-4 border-western-stone-warm/30 text-western-stone-warm hover:border-red-700 hover:text-red-700 font-mono text-[11px] uppercase tracking-[0.2em] rounded-none">
                  <X className="h-3.5 w-3.5 mr-1" /> Recusar
                </Button>
              )}
              {p.status !== "pending" && (
                <Button onClick={() => setStatus(p, "pending")} variant="ghost" className="h-9 px-4 text-western-stone-warm hover:text-western-green-deep font-mono text-[11px] uppercase tracking-[0.2em] rounded-none">
                  Reverter
                </Button>
              )}
              <Button onClick={() => setDrawer(p)} variant="ghost" className="h-9 px-4 text-western-stone-warm hover:text-western-green-deep font-mono text-[11px] uppercase tracking-[0.2em] rounded-none ml-auto">
                <Eye className="h-3.5 w-3.5 mr-1" /> Detalhes
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Sheet open={!!drawer} onOpenChange={(o) => !o && setDrawer(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{drawer?.empresa || "Parceiro"}</SheetTitle>
            <SheetDescription>Detalhes completos do cadastro.</SheetDescription>
          </SheetHeader>
          {drawer && (
            <div className="mt-6 space-y-4 text-sm">
              <KV k="Status" v={drawer.status} />
              <KV k="Tier" v={TIER_LABEL[drawer.tier as Tier]} />
              <KV k="Responsável" v={[drawer.nome, drawer.cargo].filter(Boolean).join(" · ") || "—"} />
              <KV k="CNPJ" v={drawer.cnpj} />
              <KV k="Segmento" v={drawer.segmento} />
              <KV k="Telefone" v={drawer.telefone} />
              <KV k="Site" v={drawer.site} />
              <KV k="Instagram" v={drawer.instagram} />
              <div className="pt-4 border-t border-western-stone-warm/15">
                <p className="text-eyebrow mb-3">Endereço</p>
                <KV k="CEP" v={drawer.cep} />
                <KV k="Logradouro" v={[drawer.endereco, drawer.numero].filter(Boolean).join(", ")} />
                <KV k="Complemento" v={drawer.complemento} />
                <KV k="Bairro" v={drawer.bairro} />
                <KV k="Cidade/UF" v={[drawer.cidade, drawer.estado].filter(Boolean).join("/")} />
              </div>
              {drawer.cancellation_reason && (
                <div className="pt-4 border-t border-western-stone-warm/15">
                  <p className="text-eyebrow mb-2">Motivo do cancelamento</p>
                  <p className="text-western-green-deep whitespace-pre-wrap">{drawer.cancellation_reason}</p>
                  {drawer.cancelled_at && <p className="text-xs text-western-stone-warm mt-2">em {new Date(drawer.cancelled_at).toLocaleString("pt-BR")}</p>}
                </div>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
