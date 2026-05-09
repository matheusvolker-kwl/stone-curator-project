import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Check, X, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Partner {
  id: string;
  user_id: string;
  nome: string | null;
  empresa: string | null;
  cnpj: string | null;
  segmento: string | null;
  telefone: string | null;
  cidade: string | null;
  site: string | null;
  status: "pending" | "approved" | "rejected";
  created_at: string;
}

interface Lead {
  id: string;
  type: string;
  nome: string | null;
  email: string | null;
  telefone: string | null;
  empresa: string | null;
  cidade: string | null;
  uf: string | null;
  mensagem: string | null;
  origem: string | null;
  created_at: string;
}

type Tab = "parceiros" | "leads";

export default function Admin() {
  const [tab, setTab] = useState<Tab>("parceiros");
  const [partners, setPartners] = useState<Partner[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<"all" | Partner["status"]>("pending");
  const [leadFilter, setLeadFilter] = useState<string>("all");

  const load = async () => {
    setLoading(true);
    const [{ data: p }, { data: l }] = await Promise.all([
      supabase.from("partner_profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("leads").select("*").order("created_at", { ascending: false }).limit(500),
    ]);
    setPartners((p as Partner[]) ?? []);
    setLeads((l as Lead[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const setStatus = async (p: Partner, status: Partner["status"]) => {
    const patch: Partial<Partner> & { approved_at?: string | null } = { status };
    if (status === "approved") patch.approved_at = new Date().toISOString();
    const { error } = await supabase.from("partner_profiles").update(patch).eq("id", p.id);
    if (error) {
      toast.error("Não foi possível atualizar.", { description: error.message });
      return;
    }
    toast.success(status === "approved" ? "Parceiro aprovado." : status === "rejected" ? "Acesso negado." : "Status atualizado.");
    load();
  };

  const filteredPartners =
    statusFilter === "all" ? partners : partners.filter((p) => p.status === statusFilter);
  const filteredLeads = leadFilter === "all" ? leads : leads.filter((l) => l.type === leadFilter);
  const leadTypes = Array.from(new Set(leads.map((l) => l.type)));

  return (
    <div className="surface-ivory">
      <div className="container-western py-12 md:py-16 max-w-6xl">
        <p className="text-eyebrow mb-4">Painel admin</p>
        <div className="w-12 h-px bg-western-gold mb-6" />
        <h1 className="font-display text-3xl md:text-4xl text-western-green-deep leading-[1.05] mb-10">
          Western · Backoffice
        </h1>

        <div className="flex gap-1 border-b border-western-stone-warm/20 mb-8">
          {(["parceiros", "leads"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 h-11 font-mono text-xs uppercase tracking-[0.22em] border-b-2 transition-colors -mb-px ${
                tab === t
                  ? "border-western-gold text-western-green-deep"
                  : "border-transparent text-western-stone-warm hover:text-western-green-deep"
              }`}
            >
              {t === "parceiros" ? `Parceiros (${partners.length})` : `Leads (${leads.length})`}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="py-20 flex justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-western-gold" />
          </div>
        ) : tab === "parceiros" ? (
          <>
            <div className="flex gap-2 mb-6 flex-wrap">
              {(["pending", "approved", "rejected", "all"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`h-9 px-4 font-mono text-[11px] uppercase tracking-[0.18em] border ${
                    statusFilter === s
                      ? "border-western-gold text-western-green-deep bg-western-gold/10"
                      : "border-western-stone-warm/25 text-western-stone-warm hover:border-western-gold/60"
                  }`}
                >
                  {s === "all" ? "Todos" : s === "pending" ? "Pendentes" : s === "approved" ? "Aprovados" : "Recusados"}
                </button>
              ))}
            </div>
            <div className="space-y-3">
              {filteredPartners.length === 0 && (
                <p className="text-western-stone-warm py-10 text-center">Nenhum parceiro nesse filtro.</p>
              )}
              {filteredPartners.map((p) => (
                <div key={p.id} className="border border-western-stone-warm/20 bg-white p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
                    <div>
                      <h3 className="font-display text-xl text-western-green-deep">
                        {p.empresa || "—"}
                      </h3>
                      <p className="text-spec text-western-stone-warm mt-1">
                        {[p.nome, p.segmento, p.cidade].filter(Boolean).join(" · ")}
                      </p>
                    </div>
                    <StatusChip status={p.status} />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-x-6 gap-y-1 text-xs text-western-stone-warm mb-4">
                    {p.cnpj && <span>CNPJ: {p.cnpj}</span>}
                    {p.telefone && (
                      <span className="inline-flex items-center gap-1">
                        <Phone className="h-3 w-3" /> {p.telefone}
                      </span>
                    )}
                    {p.site && <span>{p.site}</span>}
                    <span>Cadastro: {new Date(p.created_at).toLocaleDateString("pt-BR")}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {p.status !== "approved" && (
                      <Button
                        onClick={() => setStatus(p, "approved")}
                        className="h-9 px-4 bg-western-green-deep text-western-cream hover:bg-western-green-mid font-mono text-[11px] uppercase tracking-[0.2em] rounded-none"
                      >
                        <Check className="h-3.5 w-3.5 mr-1" /> Aprovar
                      </Button>
                    )}
                    {p.status !== "rejected" && (
                      <Button
                        onClick={() => setStatus(p, "rejected")}
                        variant="outline"
                        className="h-9 px-4 border-western-stone-warm/30 text-western-stone-warm hover:border-red-700 hover:text-red-700 font-mono text-[11px] uppercase tracking-[0.2em] rounded-none"
                      >
                        <X className="h-3.5 w-3.5 mr-1" /> Recusar
                      </Button>
                    )}
                    {p.status !== "pending" && (
                      <Button
                        onClick={() => setStatus(p, "pending")}
                        variant="ghost"
                        className="h-9 px-4 text-western-stone-warm hover:text-western-green-deep font-mono text-[11px] uppercase tracking-[0.2em] rounded-none"
                      >
                        Reverter
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="flex gap-2 mb-6 flex-wrap">
              <button
                onClick={() => setLeadFilter("all")}
                className={`h-9 px-4 font-mono text-[11px] uppercase tracking-[0.18em] border ${
                  leadFilter === "all"
                    ? "border-western-gold text-western-green-deep bg-western-gold/10"
                    : "border-western-stone-warm/25 text-western-stone-warm hover:border-western-gold/60"
                }`}
              >
                Todos
              </button>
              {leadTypes.map((t) => (
                <button
                  key={t}
                  onClick={() => setLeadFilter(t)}
                  className={`h-9 px-4 font-mono text-[11px] uppercase tracking-[0.18em] border ${
                    leadFilter === t
                      ? "border-western-gold text-western-green-deep bg-western-gold/10"
                      : "border-western-stone-warm/25 text-western-stone-warm hover:border-western-gold/60"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            <div className="space-y-2">
              {filteredLeads.length === 0 && (
                <p className="text-western-stone-warm py-10 text-center">Nenhum lead nesse filtro.</p>
              )}
              {filteredLeads.map((l) => (
                <div key={l.id} className="border border-western-stone-warm/20 bg-white p-4 flex flex-wrap gap-x-6 gap-y-1 items-start">
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-western-gold w-32 flex-shrink-0">
                    {l.type}
                  </span>
                  <div className="flex-1 min-w-[200px]">
                    <p className="text-western-green-deep font-medium">
                      {l.nome || l.empresa || l.email || "(sem nome)"}
                    </p>
                    <p className="text-xs text-western-stone-warm mt-0.5 flex flex-wrap gap-x-4">
                      {l.email && (
                        <a href={`mailto:${l.email}`} className="inline-flex items-center gap-1 hover:text-western-gold">
                          <Mail className="h-3 w-3" /> {l.email}
                        </a>
                      )}
                      {l.telefone && (
                        <a href={`https://wa.me/55${l.telefone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:text-western-gold">
                          <Phone className="h-3 w-3" /> {l.telefone}
                        </a>
                      )}
                      {(l.cidade || l.uf) && <span>{[l.cidade, l.uf].filter(Boolean).join("/")}</span>}
                    </p>
                    {l.mensagem && <p className="text-xs text-western-stone-warm mt-1 italic">"{l.mensagem}"</p>}
                  </div>
                  <span className="text-[10px] font-mono text-western-stone-warm/70 whitespace-nowrap">
                    {new Date(l.created_at).toLocaleString("pt-BR")}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
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
