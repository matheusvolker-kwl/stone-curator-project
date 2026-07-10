import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Mail, Phone, Search, Download, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from "@/components/ui/sheet";
import { toCSV, downloadCSV, chipCls, KV, type Lead, LEAD_TYPE_LABEL, LEAD_TYPE_BADGE_CLS } from "@/components/admin/adminUtils";
import { LoadError } from "@/components/admin/LoadError";

const PAGE_SIZE = 50;
const KNOWN_TYPES = ["partner_signup", "newsletter", "amostras", "visita", "contato", "pedido_novo", "b2c_orcamento", "pdf_pedido"];

export default function AdminLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [reloadNonce, setReloadNonce] = useState(0);
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [qInput, setQInput] = useState("");
  const [q, setQ] = useState(""); // valor com debounce
  const [page, setPage] = useState(0);
  const [drawer, setDrawer] = useState<Lead | null>(null);
  const [exporting, setExporting] = useState(false);

  // Debounce da busca
  useEffect(() => {
    const t = setTimeout(() => { setQ(qInput.trim()); setPage(0); }, 300);
    return () => clearTimeout(t);
  }, [qInput]);

  // Reset de página quando o filtro muda
  useEffect(() => { setPage(0); }, [typeFilter]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    (async () => {
      let query = supabase
        .from("leads")
        .select("*", { count: "exact" })
        // /admin/orcamentos cuida dos orçamentos abertos
        .neq("type", "orcamento")
        .order("last_activity_at", { ascending: false })
        .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1);

      if (typeFilter !== "all") query = query.eq("type", typeFilter as never);

      if (q) {
        // Busca server-side (case-insensitive) em campos de texto
        const escaped = q.replace(/[%,]/g, " ");
        const pattern = `%${escaped}%`;
        query = query.or(
          [
            `nome.ilike.${pattern}`,
            `email.ilike.${pattern}`,
            `telefone.ilike.${pattern}`,
            `empresa.ilike.${pattern}`,
            `cidade.ilike.${pattern}`,
            `mensagem.ilike.${pattern}`,
            `origem.ilike.${pattern}`,
          ].join(",")
        );
      }

      const { data, count, error } = await query;
      if (cancelled) return;
      if (error) {
        console.error(error);
        setLeads([]); setTotal(0);
        setLoadError(true);
      } else {
        setLeads((data as Lead[]) ?? []);
        setTotal(count ?? 0);
        setLoadError(false);
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [typeFilter, q, page, reloadNonce]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const types = useMemo(() => KNOWN_TYPES, []);

  const handleExportCsv = async () => {
    setExporting(true);
    try {
      // Exporta resultados completos do filtro atual (até 5000)
      let query = supabase
        .from("leads")
        .select("*")
        .neq("type", "orcamento")
        .order("last_activity_at", { ascending: false })
        .limit(5000);
      if (typeFilter !== "all") query = query.eq("type", typeFilter as never);
      if (q) {
        const pattern = `%${q.replace(/[%,]/g, " ")}%`;
        query = query.or(
          [
            `nome.ilike.${pattern}`,
            `email.ilike.${pattern}`,
            `telefone.ilike.${pattern}`,
            `empresa.ilike.${pattern}`,
            `cidade.ilike.${pattern}`,
            `mensagem.ilike.${pattern}`,
            `origem.ilike.${pattern}`,
          ].join(",")
        );
      }
      const { data } = await query;
      const rows = (data ?? []) as unknown as Record<string, unknown>[];
      downloadCSV(`leads-${new Date().toISOString().slice(0, 10)}.csv`, toCSV(rows));
    } finally {
      setExporting(false);
    }
  };

  return (
    <div>
      <p className="text-eyebrow mb-3">Leads</p>
      <div className="w-12 h-px bg-western-gold mb-6" />
      <h1 className="font-display text-3xl mb-2">Caixa de entrada</h1>
      <p className="text-western-stone-warm mb-8">Todos os formulários do site, unificados.</p>

      <div className="flex flex-wrap gap-2 mb-4">
        <button onClick={() => setTypeFilter("all")} className={chipCls(typeFilter === "all")}>Todos</button>
        {types.map((t) => (
          <button key={t} onClick={() => setTypeFilter(t)} className={chipCls(typeFilter === t)}>{LEAD_TYPE_LABEL[t] ?? t}</button>
        ))}
      </div>
      <div className="flex flex-wrap gap-3 mb-6 items-center">
        <div className="relative flex-1 min-w-[220px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-western-stone-warm" />
          <Input value={qInput} onChange={(e) => setQInput(e.target.value)} placeholder="Buscar nome, e-mail, mensagem…" className="h-10 pl-9 rounded-none border-western-stone-warm/25" />
        </div>
        <Button onClick={handleExportCsv} disabled={exporting} variant="outline" className="h-10 rounded-none border-western-stone-warm/25 font-mono text-[11px] uppercase tracking-[0.18em]">
          {exporting ? <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" /> : <Download className="h-3.5 w-3.5 mr-2" />} CSV
        </Button>
        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-western-stone-warm">
          {loading ? "…" : `${total} ${total === 1 ? "lead" : "leads"}`}
        </span>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-western-gold" /></div>
      ) : (
        <div className="space-y-2">
          {leads.length === 0 && <p className="text-western-stone-warm py-10 text-center">Nenhum lead nesse filtro.</p>}
          {leads.map((l) => {
            const badgeCls = LEAD_TYPE_BADGE_CLS[l.type] ?? "border-western-stone-warm/30 text-western-stone-warm bg-white";
            const label = LEAD_TYPE_LABEL[l.type] ?? l.type;
            const downloads = (l.payload as Record<string, unknown> | null)?.downloads as number | undefined;
            const activity = l.last_activity_at ?? l.created_at;
            return (
              <button key={l.id} onClick={() => setDrawer(l)} className="w-full text-left border border-western-stone-warm/20 bg-white p-4 flex flex-wrap gap-x-6 gap-y-1 items-start hover:border-western-gold/60 transition-colors">
                <span className={`inline-flex items-center px-2 py-0.5 border font-mono text-[10px] uppercase tracking-[0.18em] flex-shrink-0 ${badgeCls}`}>{label}</span>
                <div className="flex-1 min-w-[200px]">
                  <p className="text-western-green-deep font-medium">
                    {l.nome || l.empresa || l.email || "(sem nome)"}
                    {downloads && downloads > 1 && <span className="ml-2 text-[10px] font-mono text-western-gold">×{downloads} downloads</span>}
                  </p>
                  <p className="text-xs text-western-stone-warm mt-0.5 flex flex-wrap gap-x-4">
                    {l.email && (
                      <a
                        href={`mailto:${l.email}`}
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 hover:text-western-gold hover:underline"
                      >
                        <Mail className="h-3 w-3" /> {l.email}
                      </a>
                    )}
                    {l.telefone && (
                      <a
                        href={`https://wa.me/${l.telefone.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 hover:text-western-gold hover:underline"
                      >
                        <Phone className="h-3 w-3" /> {l.telefone}
                      </a>
                    )}
                    {(l.cidade || l.uf) && <span>{[l.cidade, l.uf].filter(Boolean).join("/")}</span>}
                    {l.origem && <span className="text-western-stone-warm/60">{l.origem}</span>}
                  </p>
                  {l.mensagem && <p className="text-xs text-western-stone-warm mt-1 italic line-clamp-1">"{l.mensagem}"</p>}
                </div>
                <span className="text-[10px] font-mono text-western-stone-warm/70 whitespace-nowrap">{new Date(activity).toLocaleString("pt-BR")}</span>
              </button>
            );
          })}
        </div>
      )}

      {!loading && total > PAGE_SIZE && (
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-western-stone-warm/15">
          <span className="text-[11px] font-mono text-western-stone-warm">
            Página {page + 1} de {totalPages}
          </span>
          <div className="flex gap-2">
            <Button variant="outline" disabled={page === 0} onClick={() => setPage((p) => Math.max(0, p - 1))} className="h-9 rounded-none border-western-stone-warm/25">
              <ChevronLeft className="h-4 w-4" /> Anterior
            </Button>
            <Button variant="outline" disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)} className="h-9 rounded-none border-western-stone-warm/25">
              Próxima <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <Sheet open={!!drawer} onOpenChange={(o) => !o && setDrawer(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Lead · {drawer && (LEAD_TYPE_LABEL[drawer.type] ?? drawer.type)}</SheetTitle>
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
