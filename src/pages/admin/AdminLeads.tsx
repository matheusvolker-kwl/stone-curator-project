import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Mail, Phone, Search, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from "@/components/ui/sheet";
import { toCSV, downloadCSV, chipCls, KV, type Lead, LEAD_TYPE_LABEL, LEAD_TYPE_BADGE_CLS } from "@/components/admin/adminUtils";

export default function AdminLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [q, setQ] = useState("");
  const [drawer, setDrawer] = useState<Lead | null>(null);

  useEffect(() => {
    // Orçamentos têm página própria em /admin/orcamentos — aqui os outros tipos (incluindo pedido_novo).
    supabase.from("leads").select("*").neq("type", "orcamento")
      .order("last_activity_at", { ascending: false }).limit(2000)
      .then(({ data }) => { setLeads((data as Lead[]) ?? []); setLoading(false); });
  }, []);

  const types = useMemo(() => Array.from(new Set(leads.map((l) => l.type))), [leads]);
  const filtered = useMemo(() => leads.filter((l) => {
    if (typeFilter !== "all" && l.type !== typeFilter) return false;
    if (q) {
      const hay = [l.nome, l.empresa, l.email, l.telefone, l.cidade, l.mensagem, l.origem].filter(Boolean).join(" ").toLowerCase();
      if (!hay.includes(q.toLowerCase())) return false;
    }
    return true;
  }), [leads, typeFilter, q]);

  if (loading) return <div className="py-20 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-western-gold" /></div>;

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
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar nome, e-mail, mensagem…" className="h-10 pl-9 rounded-none border-western-stone-warm/25" />
        </div>
        <Button onClick={() => downloadCSV(`leads-${new Date().toISOString().slice(0,10)}.csv`, toCSV(filtered as unknown as Record<string,unknown>[]))} variant="outline" className="h-10 rounded-none border-western-stone-warm/25 font-mono text-[11px] uppercase tracking-[0.18em]">
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
