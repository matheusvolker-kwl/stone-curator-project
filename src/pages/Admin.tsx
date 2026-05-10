import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Loader2, Check, X, Mail, Phone, Search, Download, Eye, Copy,
  ShieldCheck, Trash2, ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from "@/components/ui/sheet";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";

interface Partner {
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
  status: "pending" | "approved" | "rejected";
  created_at: string;
  approved_at: string | null;
}

interface Lead {
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
}

interface AdminUser {
  id: string;
  user_id: string;
  created_at: string;
}

const SAMPLE_STATUSES = ["pending", "approved", "shipped", "delivered"] as const;
type SampleStatus = (typeof SAMPLE_STATUSES)[number];

const SAMPLE_STATUS_LABEL: Record<SampleStatus, string> = {
  pending: "Pendente",
  approved: "Aprovado",
  shipped: "Enviado",
  delivered: "Entregue",
};

function toCSV<T extends Record<string, unknown>>(rows: T[]): string {
  if (!rows.length) return "";
  const cols = Object.keys(rows[0]);
  const esc = (v: unknown) => {
    if (v === null || v === undefined) return "";
    const s = typeof v === "object" ? JSON.stringify(v) : String(v);
    return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [cols.join(";"), ...rows.map((r) => cols.map((c) => esc(r[c])).join(";"))].join("\n");
}

function downloadCSV(filename: string, content: string) {
  const blob = new Blob(["\ufeff" + content], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function Admin() {
  const { user } = useAuth();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const [{ data: p }, { data: l }, { data: r }] = await Promise.all([
      supabase.from("partner_profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("leads").select("*").order("created_at", { ascending: false }).limit(1000),
      supabase.from("user_roles").select("*").eq("role", "admin"),
    ]);
    setPartners((p as Partner[]) ?? []);
    setLeads((l as Lead[]) ?? []);
    setAdmins((r as AdminUser[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const samples = useMemo(
    () => leads.filter((l) => l.type === "amostras"),
    [leads]
  );

  const counts = useMemo(() => {
    const since = (days: number) => Date.now() - days * 24 * 60 * 60 * 1000;
    const last7 = leads.filter((l) => new Date(l.created_at).getTime() > since(7)).length;
    const last30 = leads.filter((l) => new Date(l.created_at).getTime() > since(30)).length;
    return {
      total: leads.length,
      last7,
      last30,
      pendingPartners: partners.filter((p) => p.status === "pending").length,
      pendingSamples: samples.filter((s) => (s.payload as { aprovacao_status?: string })?.aprovacao_status === "pending" || !(s.payload as { aprovacao_status?: string })?.aprovacao_status).length,
    };
  }, [leads, partners, samples]);

  return (
    <div className="surface-ivory min-h-screen">
      <div className="container-western py-12 md:py-16 max-w-7xl">
        <p className="text-eyebrow mb-4">Painel admin</p>
        <div className="w-12 h-px bg-western-gold mb-6" />
        <h1 className="font-display text-3xl md:text-4xl text-western-green-deep leading-[1.05] mb-3">
          Western · Backoffice
        </h1>
        <p className="text-western-stone-warm mb-8">
          Gerencie cadastros de parceiros, leads recebidos, solicitações de amostras e administradores do sistema.
        </p>

        {/* Cards de contagem */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
          <KPI label="Parceiros pendentes" value={counts.pendingPartners} accent />
          <KPI label="Amostras a aprovar" value={counts.pendingSamples} accent />
          <KPI label="Leads · últimos 7 dias" value={counts.last7} />
          <KPI label="Leads · últimos 30 dias" value={counts.last30} />
        </div>

        {loading ? (
          <div className="py-20 flex justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-western-gold" />
          </div>
        ) : (
          <Tabs defaultValue="parceiros" className="w-full">
            <TabsList className="bg-transparent border-b border-western-stone-warm/20 rounded-none h-auto p-0 w-full justify-start gap-1 mb-8">
              {[
                { v: "parceiros", l: `Parceiros (${partners.length})` },
                { v: "leads", l: `Leads (${leads.length})` },
                { v: "amostras", l: `Amostras (${samples.length})` },
                { v: "config", l: "Configurações" },
              ].map((t) => (
                <TabsTrigger
                  key={t.v}
                  value={t.v}
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-western-gold data-[state=active]:text-western-green-deep data-[state=active]:bg-transparent data-[state=active]:shadow-none px-5 h-11 font-mono text-xs uppercase tracking-[0.22em] -mb-px"
                >
                  {t.l}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="parceiros"><PartnersTab partners={partners} reload={load} /></TabsContent>
            <TabsContent value="leads"><LeadsTab leads={leads} /></TabsContent>
            <TabsContent value="amostras"><SamplesTab samples={samples} reload={load} /></TabsContent>
            <TabsContent value="config"><ConfigTab admins={admins} currentUserId={user?.id ?? null} reload={load} /></TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}

function KPI({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div className={`border bg-white p-4 ${accent && value > 0 ? "border-western-gold" : "border-western-stone-warm/20"}`}>
      <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-western-stone-warm">{label}</p>
      <p className={`font-display text-3xl mt-2 ${accent && value > 0 ? "text-western-gold" : "text-western-green-deep"}`}>{value}</p>
    </div>
  );
}

function StatusChip({ status }: { status: Partner["status"] }) {
  const map = {
    pending: { label: "Em análise", cls: "border-western-stone-warm/40 text-western-stone-warm" },
    approved: { label: "Aprovado", cls: "border-green-700/40 text-green-800 bg-green-50" },
    rejected: { label: "Recusado", cls: "border-red-700/40 text-red-700 bg-red-50" },
  };
  const m = map[status];
  return (
    <span className={`inline-flex items-center px-2.5 py-1 border font-mono text-[10px] uppercase tracking-[0.18em] ${m.cls}`}>
      {m.label}
    </span>
  );
}

/* -------------------- PARCEIROS -------------------- */
function PartnersTab({ partners, reload }: { partners: Partner[]; reload: () => void }) {
  const [statusFilter, setStatusFilter] = useState<"all" | Partner["status"]>("pending");
  const [segmentFilter, setSegmentFilter] = useState<string>("all");
  const [ufFilter, setUfFilter] = useState<string>("all");
  const [q, setQ] = useState("");
  const [drawer, setDrawer] = useState<Partner | null>(null);

  const segments = useMemo(
    () => Array.from(new Set(partners.map((p) => p.segmento).filter(Boolean))) as string[],
    [partners]
  );
  const ufs = useMemo(
    () => Array.from(new Set(partners.map((p) => p.estado).filter(Boolean))) as string[],
    [partners]
  );

  const filtered = useMemo(() => {
    return partners.filter((p) => {
      if (statusFilter !== "all" && p.status !== statusFilter) return false;
      if (segmentFilter !== "all" && p.segmento !== segmentFilter) return false;
      if (ufFilter !== "all" && p.estado !== ufFilter) return false;
      if (q) {
        const hay = [p.nome, p.empresa, p.cnpj, p.email_dummy ?? "", p.cidade].filter(Boolean).join(" ").toLowerCase();
        if (!hay.includes(q.toLowerCase())) return false;
      }
      return true;
    });
  }, [partners, statusFilter, segmentFilter, ufFilter, q]);

  const setStatus = async (p: Partner, status: Partner["status"]) => {
    const patch: Partial<Partner> & { approved_at?: string | null } = { status };
    if (status === "approved") patch.approved_at = new Date().toISOString();
    if (status === "pending" || status === "rejected") patch.approved_at = null;
    const { error } = await supabase.from("partner_profiles").update(patch).eq("id", p.id);
    if (error) { toast.error("Não foi possível atualizar.", { description: error.message }); return; }
    toast.success(status === "approved" ? "Parceiro aprovado." : status === "rejected" ? "Acesso negado." : "Status atualizado.");
    reload();
  };

  const exportCSV = () => {
    downloadCSV(`parceiros-${new Date().toISOString().slice(0, 10)}.csv`, toCSV(filtered as unknown as Record<string, unknown>[]));
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-4">
        {(["pending", "approved", "rejected", "all"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`h-9 px-4 font-mono text-[11px] uppercase tracking-[0.18em] border transition-colors ${
              statusFilter === s
                ? "border-western-gold text-western-green-deep bg-western-gold/10"
                : "border-western-stone-warm/25 text-western-stone-warm hover:border-western-gold/60"
            }`}
          >
            {s === "all" ? "Todos" : s === "pending" ? "Pendentes" : s === "approved" ? "Aprovados" : "Recusados"}
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
        <Button onClick={exportCSV} variant="outline" className="h-10 rounded-none border-western-stone-warm/25 font-mono text-[11px] uppercase tracking-[0.18em]">
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
              <StatusChip status={p.status} />
            </div>
            <div className="grid sm:grid-cols-2 gap-x-6 gap-y-1 text-xs text-western-stone-warm mb-4">
              {p.cnpj && <span>CNPJ: {p.cnpj}</span>}
              {p.telefone && <span className="inline-flex items-center gap-1"><Phone className="h-3 w-3" /> {p.telefone}</span>}
              {p.instagram && <span>@{p.instagram.replace(/^@/, "")}</span>}
              {p.site && <span>{p.site}</span>}
              <span>Cadastro: {new Date(p.created_at).toLocaleDateString("pt-BR")}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {p.status !== "approved" && (
                <Button onClick={() => setStatus(p, "approved")} className="h-9 px-4 bg-western-green-deep text-western-cream hover:bg-western-green-mid font-mono text-[11px] uppercase tracking-[0.2em] rounded-none">
                  <Check className="h-3.5 w-3.5 mr-1" /> Aprovar
                </Button>
              )}
              {p.status !== "rejected" && (
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
              <div className="pt-4 border-t border-western-stone-warm/15">
                <KV k="Cadastro" v={new Date(drawer.created_at).toLocaleString("pt-BR")} />
                {drawer.approved_at && <KV k="Aprovado em" v={new Date(drawer.approved_at).toLocaleString("pt-BR")} />}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

/* -------------------- LEADS -------------------- */
function LeadsTab({ leads }: { leads: Lead[] }) {
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [q, setQ] = useState("");
  const [drawer, setDrawer] = useState<Lead | null>(null);

  const types = useMemo(() => Array.from(new Set(leads.map((l) => l.type))), [leads]);

  const filtered = useMemo(
    () => leads.filter((l) => {
      if (typeFilter !== "all" && l.type !== typeFilter) return false;
      if (q) {
        const hay = [l.nome, l.empresa, l.email, l.telefone, l.cidade, l.mensagem, l.origem].filter(Boolean).join(" ").toLowerCase();
        if (!hay.includes(q.toLowerCase())) return false;
      }
      return true;
    }),
    [leads, typeFilter, q]
  );

  const exportCSV = () => downloadCSV(`leads-${new Date().toISOString().slice(0, 10)}.csv`, toCSV(filtered as unknown as Record<string, unknown>[]));

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-4">
        <button onClick={() => setTypeFilter("all")} className={chipCls(typeFilter === "all")}>Todos</button>
        {types.map((t) => (
          <button key={t} onClick={() => setTypeFilter(t)} className={chipCls(typeFilter === t)}>{t}</button>
        ))}
      </div>
      <div className="flex flex-wrap gap-3 mb-6 items-center">
        <div className="relative flex-1 min-w-[220px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-western-stone-warm" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar nome, e-mail, mensagem…" className="h-10 pl-9 rounded-none border-western-stone-warm/25" />
        </div>
        <Button onClick={exportCSV} variant="outline" className="h-10 rounded-none border-western-stone-warm/25 font-mono text-[11px] uppercase tracking-[0.18em]">
          <Download className="h-3.5 w-3.5 mr-2" /> CSV
        </Button>
      </div>

      <div className="space-y-2">
        {filtered.length === 0 && <p className="text-western-stone-warm py-10 text-center">Nenhum lead nesse filtro.</p>}
        {filtered.map((l) => (
          <button key={l.id} onClick={() => setDrawer(l)} className="w-full text-left border border-western-stone-warm/20 bg-white p-4 flex flex-wrap gap-x-6 gap-y-1 items-start hover:border-western-gold/60 transition-colors">
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-western-gold w-32 flex-shrink-0">{l.type}</span>
            <div className="flex-1 min-w-[200px]">
              <p className="text-western-green-deep font-medium">{l.nome || l.empresa || l.email || "(sem nome)"}</p>
              <p className="text-xs text-western-stone-warm mt-0.5 flex flex-wrap gap-x-4">
                {l.email && <span className="inline-flex items-center gap-1"><Mail className="h-3 w-3" /> {l.email}</span>}
                {l.telefone && <span className="inline-flex items-center gap-1"><Phone className="h-3 w-3" /> {l.telefone}</span>}
                {(l.cidade || l.uf) && <span>{[l.cidade, l.uf].filter(Boolean).join("/")}</span>}
                {l.origem && <span className="text-western-stone-warm/60">{l.origem}</span>}
              </p>
              {l.mensagem && <p className="text-xs text-western-stone-warm mt-1 italic line-clamp-1">"{l.mensagem}"</p>}
            </div>
            <span className="text-[10px] font-mono text-western-stone-warm/70 whitespace-nowrap">{new Date(l.created_at).toLocaleString("pt-BR")}</span>
          </button>
        ))}
      </div>

      <Sheet open={!!drawer} onOpenChange={(o) => !o && setDrawer(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Lead · {drawer?.type}</SheetTitle>
            <SheetDescription>Recebido em {drawer && new Date(drawer.created_at).toLocaleString("pt-BR")}</SheetDescription>
          </SheetHeader>
          {drawer && (
            <div className="mt-6 space-y-3 text-sm">
              <KV k="Nome" v={drawer.nome} />
              <KV k="E-mail" v={drawer.email} />
              <KV k="Telefone" v={drawer.telefone} />
              <KV k="Empresa" v={drawer.empresa} />
              <KV k="CNPJ" v={drawer.cnpj} />
              <KV k="Segmento" v={drawer.segmento} />
              <KV k="Cidade/UF" v={[drawer.cidade, drawer.uf].filter(Boolean).join("/")} />
              <KV k="Endereço" v={drawer.endereco} />
              <KV k="CEP" v={drawer.cep} />
              <KV k="Origem" v={drawer.origem} />
              {drawer.mensagem && (
                <div>
                  <p className="text-eyebrow mb-1">Mensagem</p>
                  <p className="text-western-green-deep whitespace-pre-wrap">{drawer.mensagem}</p>
                </div>
              )}
              {drawer.payload && Object.keys(drawer.payload).length > 0 && (
                <div className="pt-4 border-t border-western-stone-warm/15">
                  <p className="text-eyebrow mb-2">Dados adicionais</p>
                  <dl className="space-y-1">
                    {Object.entries(drawer.payload).map(([k, v]) => (
                      <KV key={k} k={k} v={typeof v === "object" ? JSON.stringify(v) : String(v)} />
                    ))}
                  </dl>
                </div>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

/* -------------------- AMOSTRAS -------------------- */
function SamplesTab({ samples, reload }: { samples: Lead[]; reload: () => void }) {
  const [statusFilter, setStatusFilter] = useState<"all" | SampleStatus>("pending");
  const [drawer, setDrawer] = useState<Lead | null>(null);

  const getStatus = (l: Lead): SampleStatus => {
    const s = (l.payload as { aprovacao_status?: string })?.aprovacao_status as SampleStatus | undefined;
    return s && (SAMPLE_STATUSES as readonly string[]).includes(s) ? s : "pending";
  };

  const filtered = samples.filter((s) => statusFilter === "all" || getStatus(s) === statusFilter);

  const setSampleStatus = async (l: Lead, status: SampleStatus) => {
    const newPayload = { ...(l.payload || {}), aprovacao_status: status, ultima_atualizacao: new Date().toISOString() };
    // payload is JSONB — use update via REST. Note: leads has no UPDATE policy, so this requires admin role check via RLS.
    // We'll use an upsert workaround: insert a new row would duplicate. Instead we update in-place; if RLS blocks, surface error.
    const { error } = await supabase.from("leads").update({ payload: newPayload } as never).eq("id", l.id);
    if (error) { toast.error("Não foi possível atualizar.", { description: error.message }); return; }
    toast.success(`Status atualizado: ${SAMPLE_STATUS_LABEL[status]}`);
    reload();
  };

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copiado.");
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-6">
        <button onClick={() => setStatusFilter("all")} className={chipCls(statusFilter === "all")}>Todos</button>
        {SAMPLE_STATUSES.map((s) => (
          <button key={s} onClick={() => setStatusFilter(s)} className={chipCls(statusFilter === s)}>{SAMPLE_STATUS_LABEL[s]}</button>
        ))}
      </div>

      <div className="border border-western-gold/30 bg-western-gold/5 p-4 mb-6">
        <p className="text-xs text-western-green-deep">
          <strong>Política:</strong> kit de amostras é aprovado em até 2 dias úteis pelo time comercial. Avance os pedidos pelo workflow Pendente → Aprovado → Enviado → Entregue.
        </p>
      </div>

      <div className="space-y-3">
        {filtered.length === 0 && <p className="text-western-stone-warm py-10 text-center">Nenhuma amostra nesse status.</p>}
        {filtered.map((l) => {
          const st = getStatus(l);
          const endereco = [l.endereco, l.cidade, l.uf, l.cep].filter(Boolean).join(", ");
          return (
            <div key={l.id} className="border border-western-stone-warm/20 bg-white p-5">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
                <div>
                  <h3 className="font-display text-lg text-western-green-deep">{l.nome || l.empresa || "—"}</h3>
                  <p className="text-spec text-western-stone-warm mt-1">
                    {[l.empresa, l.email, l.telefone].filter(Boolean).join(" · ")}
                  </p>
                </div>
                <span className="inline-flex items-center px-2.5 py-1 border border-western-gold/40 text-western-green-deep bg-western-gold/10 font-mono text-[10px] uppercase tracking-[0.18em]">
                  {SAMPLE_STATUS_LABEL[st]}
                </span>
              </div>
              {endereco && (
                <div className="flex items-center gap-2 mb-3 text-xs text-western-stone-warm bg-western-paper px-3 py-2 border border-western-stone-warm/15">
                  <span className="flex-1">{endereco}</span>
                  <button onClick={() => copy(endereco)} className="hover:text-western-gold inline-flex items-center gap-1"><Copy className="h-3 w-3" /> copiar</button>
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                {st === "pending" && <Button onClick={() => setSampleStatus(l, "approved")} className="h-9 px-4 bg-western-green-deep text-western-cream hover:bg-western-green-mid font-mono text-[11px] uppercase tracking-[0.2em] rounded-none"><Check className="h-3.5 w-3.5 mr-1" /> Aprovar</Button>}
                {st === "approved" && <Button onClick={() => setSampleStatus(l, "shipped")} className="h-9 px-4 bg-western-gold text-western-green-deep hover:bg-western-gold/90 font-mono text-[11px] uppercase tracking-[0.2em] rounded-none">Marcar como enviado</Button>}
                {st === "shipped" && <Button onClick={() => setSampleStatus(l, "delivered")} className="h-9 px-4 bg-western-green-mid text-western-cream font-mono text-[11px] uppercase tracking-[0.2em] rounded-none">Marcar como entregue</Button>}
                <Button onClick={() => setDrawer(l)} variant="ghost" className="h-9 px-4 text-western-stone-warm hover:text-western-green-deep font-mono text-[11px] uppercase tracking-[0.2em] rounded-none ml-auto">
                  <Eye className="h-3.5 w-3.5 mr-1" /> Detalhes
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      <Sheet open={!!drawer} onOpenChange={(o) => !o && setDrawer(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Pedido de amostra</SheetTitle>
            <SheetDescription>Recebido em {drawer && new Date(drawer.created_at).toLocaleString("pt-BR")}</SheetDescription>
          </SheetHeader>
          {drawer && (
            <div className="mt-6 space-y-3 text-sm">
              <KV k="Nome" v={drawer.nome} />
              <KV k="Empresa" v={drawer.empresa} />
              <KV k="CNPJ" v={drawer.cnpj} />
              <KV k="E-mail" v={drawer.email} />
              <KV k="Telefone" v={drawer.telefone} />
              <KV k="Endereço de envio" v={[drawer.endereco, drawer.cidade, drawer.uf, drawer.cep].filter(Boolean).join(", ")} />
              {drawer.mensagem && (
                <div>
                  <p className="text-eyebrow mb-1">Mensagem</p>
                  <p className="text-western-green-deep whitespace-pre-wrap">{drawer.mensagem}</p>
                </div>
              )}
              {drawer.payload && Object.keys(drawer.payload).length > 0 && (
                <div className="pt-4 border-t border-western-stone-warm/15">
                  <p className="text-eyebrow mb-2">Itens / detalhes</p>
                  <pre className="text-xs bg-western-paper p-3 overflow-auto whitespace-pre-wrap break-all">{JSON.stringify(drawer.payload, null, 2)}</pre>
                </div>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

/* -------------------- CONFIG -------------------- */
function ConfigTab({ admins, currentUserId, reload }: { admins: AdminUser[]; currentUserId: string | null; reload: () => void }) {
  const removeAdmin = async (id: string) => {
    if (!confirm("Remover este administrador?")) return;
    const { error } = await supabase.from("user_roles").delete().eq("id", id);
    if (error) { toast.error("Não foi possível remover.", { description: error.message }); return; }
    toast.success("Administrador removido.");
    reload();
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="border border-western-stone-warm/20 bg-white p-6">
        <div className="flex items-center gap-2 mb-1">
          <ShieldCheck className="h-4 w-4 text-western-gold" />
          <h3 className="font-display text-xl text-western-green-deep">Administradores</h3>
        </div>
        <p className="text-xs text-western-stone-warm mb-5">
          Quem pode acessar este painel. {admins.length} {admins.length === 1 ? "admin ativo" : "admins ativos"}.
        </p>
        <div className="space-y-2">
          {admins.map((a) => (
            <div key={a.id} className="flex items-center gap-3 p-3 border border-western-stone-warm/15">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-western-green-deep font-mono truncate">{a.user_id}</p>
                <p className="text-[10px] text-western-stone-warm font-mono uppercase tracking-[0.18em]">
                  Desde {new Date(a.created_at).toLocaleDateString("pt-BR")}
                  {a.user_id === currentUserId && " · você"}
                </p>
              </div>
              {a.user_id !== currentUserId && (
                <button onClick={() => removeAdmin(a.id)} className="p-2 text-western-stone-warm hover:text-red-700 transition-colors">
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
        <p className="text-xs text-western-stone-warm mt-5 leading-relaxed">
          Para promover um novo administrador, peça que ele crie a conta como parceiro e depois inclua o user_id manualmente na tabela de roles (ou implemente um convite por e-mail em um próximo passo).
        </p>
      </div>

      <div className="border border-western-stone-warm/20 bg-white p-6">
        <h3 className="font-display text-xl text-western-green-deep mb-1">Avisos do sistema</h3>
        <p className="text-xs text-western-stone-warm mb-5">Lembretes operacionais.</p>
        <ul className="space-y-3 text-sm text-western-stone-warm">
          <li className="flex gap-2"><Check className="h-4 w-4 text-western-gold flex-shrink-0 mt-0.5" /> Amostras devem ser aprovadas em até 2 dias úteis.</li>
          <li className="flex gap-2"><Check className="h-4 w-4 text-western-gold flex-shrink-0 mt-0.5" /> Cadastros B2B passam por checagem de CNPJ antes da aprovação.</li>
          <li className="flex gap-2"><ExternalLink className="h-4 w-4 text-western-gold flex-shrink-0 mt-0.5" /> E-mails automáticos não estão ativos — notifique manualmente por enquanto.</li>
        </ul>
      </div>
    </div>
  );
}

/* -------------------- HELPERS -------------------- */
function chipCls(active: boolean) {
  return `h-9 px-4 font-mono text-[11px] uppercase tracking-[0.18em] border transition-colors ${
    active
      ? "border-western-gold text-western-green-deep bg-western-gold/10"
      : "border-western-stone-warm/25 text-western-stone-warm hover:border-western-gold/60"
  }`;
}

function KV({ k, v }: { k: string; v: string | null | undefined }) {
  if (!v) return null;
  return (
    <div className="flex gap-3 text-sm">
      <dt className="text-[10px] font-mono uppercase tracking-[0.18em] text-western-stone-warm w-32 flex-shrink-0 pt-1">{k}</dt>
      <dd className="text-western-green-deep flex-1 break-words">{v}</dd>
    </div>
  );
}
