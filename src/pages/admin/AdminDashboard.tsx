import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ArrowRight } from "lucide-react";

interface FunnelRow {
  semana: string;
  orcamentos: number;
  pedidos: number;
  promovidos: number;
  pdf_redownloads: number;
  taxa_conversao_pct: number | null;
  horas_medias_ate_promocao: number | null;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    pendingPartners: 0,
    pendingSamples: 0,
    leads7d: 0,
    leads30d: 0,
    cancelled30d: 0,
    totalUsers: 0,
  });
  const [funnel, setFunnel] = useState<FunnelRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const since7 = new Date(Date.now() - 7 * 86400000).toISOString();
      const since30 = new Date(Date.now() - 30 * 86400000).toISOString();
      const [{ data: partners }, { data: leads }, { data: funnelData }] = await Promise.all([
        supabase.from("partner_profiles").select("status, cancelled_at"),
        supabase.from("leads").select("type, payload, created_at").limit(2000),
        supabase.from("lead_conversion_funnel" as never).select("*").limit(8),
      ]);
      const sampleLeads = (leads ?? []).filter((l) => l.type === "amostras");
      const pendingSamples = sampleLeads.filter((l) => {
        const s = (l.payload as { aprovacao_status?: string })?.aprovacao_status;
        return !s || s === "pending";
      }).length;
      setStats({
        pendingPartners: (partners ?? []).filter((p) => p.status === "pending").length,
        pendingSamples,
        leads7d: (leads ?? []).filter((l) => l.created_at > since7).length,
        leads30d: (leads ?? []).filter((l) => l.created_at > since30).length,
        cancelled30d: (partners ?? []).filter((p) => p.cancelled_at && p.cancelled_at > since30).length,
        totalUsers: (partners ?? []).length,
      });
      setFunnel((funnelData as unknown as FunnelRow[]) ?? []);
      setLoading(false);
    })();
  }, []);

  if (loading) return <div className="py-20 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-western-gold" /></div>;

  const cards = [
    { label: "Parceiros pendentes", value: stats.pendingPartners, to: "/admin/parceiros", urgent: stats.pendingPartners > 0 },
    { label: "Amostras a aprovar", value: stats.pendingSamples, to: "/admin/amostras", urgent: stats.pendingSamples > 0 },
    { label: "Leads · 7 dias", value: stats.leads7d, to: "/admin/leads" },
    { label: "Leads · 30 dias", value: stats.leads30d, to: "/admin/leads" },
    { label: "Contas canceladas (30d)", value: stats.cancelled30d, to: "/admin/usuarios" },
    { label: "Total de cadastros", value: stats.totalUsers, to: "/admin/usuarios" },
  ];

  return (
    <div>
      <p className="text-eyebrow mb-3">Dashboard</p>
      <div className="w-12 h-px bg-western-gold mb-6" />
      <h1 className="font-display text-3xl md:text-4xl mb-3">Western · Backoffice</h1>
      <p className="text-western-stone-warm mb-10">
        Painel central de gestão: aprove parceiros, acompanhe leads, gerencie tiers e o programa Western Pro.
      </p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((c) => (
          <Link
            key={c.label}
            to={c.to}
            className={`group block border bg-white p-5 transition-all hover:shadow-md ${
              c.urgent ? "border-western-gold" : "border-western-stone-warm/20 hover:border-western-gold/50"
            }`}
          >
            <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-western-stone-warm">{c.label}</p>
            <p className={`font-display text-4xl mt-3 ${c.urgent ? "text-western-gold" : "text-western-green-deep"}`}>{c.value}</p>
            <p className="mt-3 text-[11px] font-mono uppercase tracking-[0.2em] text-western-stone-warm/80 inline-flex items-center gap-1 group-hover:text-western-gold transition-colors">
              Abrir <ArrowRight className="h-3 w-3" />
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
