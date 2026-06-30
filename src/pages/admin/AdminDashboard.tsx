import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ArrowRight, ShieldCheck, RefreshCw, ShoppingBag, MessageSquare } from "lucide-react";

interface PendingPartner {
  user_id: string;
  empresa: string | null;
  nome: string | null;
  pending_reason: string | null;
  created_at: string;
}

interface PendingThread {
  lead_id: string;
  status: string;
  updated_at: string;
  lead: { nome: string | null; empresa: string | null; created_at: string } | null;
}

interface RecentOrder {
  id: string;
  numero: string;
  titulo: string;
  status: string;
  created_at: string;
}

interface FunnelRow {
  semana: string;
  orcamentos: number;
  pedidos: number;
  promovidos: number;
  pdf_redownloads: number;
  taxa_conversao_pct: number | null;
  horas_medias_ate_promocao: number | null;
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

export default function AdminDashboard() {
  const [credPending, setCredPending] = useState<PendingPartner[]>([]);
  const [reanalises, setReanalises] = useState<PendingPartner[]>([]);
  const [threads, setThreads] = useState<PendingThread[]>([]);
  const [orders, setOrders] = useState<RecentOrder[]>([]);
  const [funnel, setFunnel] = useState<FunnelRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [partnersRes, threadsRes, ordersRes, funnelRes] = await Promise.all([
        supabase
          .from("partner_profiles")
          .select("user_id, empresa, nome, pending_reason, created_at, status, approved_at")
          .eq("status", "pending")
          .order("created_at", { ascending: false })
          .limit(50),
        supabase
          .from("quote_threads")
          .select("lead_id, status, updated_at, lead:leads(nome, empresa, created_at)")
          .in("status", ["novo", "em_atendimento"])
          .order("updated_at", { ascending: false })
          .limit(8),
        supabase
          .from("production_orders")
          .select("id, numero, titulo, status, created_at")
          .order("created_at", { ascending: false })
          .limit(5),
        supabase.from("lead_conversion_funnel" as never).select("*").limit(8),
      ]);

      const partners = (partnersRes.data as (PendingPartner & { approved_at: string | null })[]) ?? [];
      // Novos cadastros = nunca aprovados. Reanálises = já tinham approved_at.
      setCredPending(partners.filter((p) => !p.approved_at).slice(0, 6));
      setReanalises(partners.filter((p) => p.approved_at).slice(0, 6));
      setThreads((threadsRes.data as unknown as PendingThread[]) ?? []);
      setOrders((ordersRes.data as RecentOrder[]) ?? []);
      setFunnel((funnelRes.data as unknown as FunnelRow[]) ?? []);
      setLoading(false);
    })();
  }, []);

  if (loading) return <div className="py-20 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-western-gold" /></div>;

  return (
    <div className="space-y-10">
      <header>
        <p className="text-eyebrow mb-3">Central de ação</p>
        <div className="w-12 h-px bg-western-gold mb-6" />
        <h1 className="font-display text-3xl md:text-4xl mb-2">Bom trabalho hoje.</h1>
        <p className="text-western-stone-warm">
          Tudo que precisa de uma decisão sua, em um só lugar.
        </p>
      </header>

      <div className="grid lg:grid-cols-2 gap-6">
        <ActionCard
          title="Credenciamentos pendentes"
          count={credPending.length}
          icon={ShieldCheck}
          to="/admin/credenciamentos"
          empty="Nenhum novo cadastro aguardando aprovação."
        >
          {credPending.map((p) => (
            <Link key={p.user_id} to="/admin/credenciamentos" className="flex items-center justify-between gap-3 py-2.5 px-3 hover:bg-western-cream/40 border-l-2 border-western-gold/40">
              <div className="min-w-0">
                <p className="text-sm font-medium text-western-green-deep truncate">{p.empresa || p.nome || "Sem nome"}</p>
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-western-stone-warm">{fmtDate(p.created_at)}</p>
              </div>
              <ArrowRight className="h-4 w-4 text-western-stone-warm flex-shrink-0" />
            </Link>
          ))}
        </ActionCard>

        <ActionCard
          title="Reanálises de cadastro"
          count={reanalises.length}
          icon={RefreshCw}
          to="/admin/parceiros"
          empty="Nenhum parceiro com cadastro editado para reanalisar."
        >
          {reanalises.map((p) => (
            <Link key={p.user_id} to="/admin/parceiros" className="flex items-start justify-between gap-3 py-2.5 px-3 hover:bg-western-cream/40 border-l-2 border-blue-500/40">
              <div className="min-w-0">
                <p className="text-sm font-medium text-western-green-deep truncate">{p.empresa || p.nome || "Sem nome"}</p>
                {p.pending_reason && (
                  <p className="text-xs text-western-stone-warm truncate">{p.pending_reason}</p>
                )}
              </div>
              <ArrowRight className="h-4 w-4 text-western-stone-warm flex-shrink-0 mt-1" />
            </Link>
          ))}
        </ActionCard>

        <ActionCard
          title="Mensagens a responder"
          count={threads.length}
          icon={MessageSquare}
          to="/admin/orcamentos"
          empty="Nenhum orçamento aguardando sua resposta."
        >
          {threads.map((t) => (
            <Link
              key={t.lead_id}
              to={`/admin/orcamentos/${t.lead_id}`}
              className="flex items-center justify-between gap-3 py-2.5 px-3 hover:bg-western-cream/40 border-l-2 border-violet-500/50"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-western-green-deep truncate">
                  {t.lead?.empresa || t.lead?.nome || "Orçamento"}
                </p>
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-western-stone-warm">
                  {t.status === "novo" ? "Novo · " : "Em atendimento · "}
                  atualizado {fmtDate(t.updated_at)}
                </p>
              </div>
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-western-gold whitespace-nowrap">Abrir →</span>
            </Link>
          ))}
        </ActionCard>

        <ActionCard
          title="Pedidos recentes"
          count={orders.length}
          icon={ShoppingBag}
          to="/admin/pedidos"
          empty="Nenhum pedido criado ainda."
        >
          {orders.map((o) => (
            <Link key={o.id} to="/admin/pedidos" className="flex items-center justify-between gap-3 py-2.5 px-3 hover:bg-western-cream/40 border-l-2 border-emerald-600/40">
              <div className="min-w-0">
                <p className="text-sm font-medium text-western-green-deep truncate">Nº {o.numero} · {o.titulo}</p>
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-western-stone-warm">
                  {o.status} · {fmtDate(o.created_at)}
                </p>
              </div>
              <ArrowRight className="h-4 w-4 text-western-stone-warm flex-shrink-0" />
            </Link>
          ))}
        </ActionCard>
      </div>

      {funnel.length > 0 && (
        <div>
          <p className="text-eyebrow mb-3">Funil de conversão</p>
          <div className="w-12 h-px bg-western-gold mb-6" />
          <div className="border border-western-stone-warm/20 bg-white overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-western-cream/40">
                <tr className="text-left">
                  <th className="px-4 py-3 text-[10px] font-mono uppercase tracking-[0.18em] text-western-stone-warm">Semana</th>
                  <th className="px-4 py-3 text-[10px] font-mono uppercase tracking-[0.18em] text-western-stone-warm">Orçamentos</th>
                  <th className="px-4 py-3 text-[10px] font-mono uppercase tracking-[0.18em] text-western-stone-warm">Pedidos</th>
                  <th className="px-4 py-3 text-[10px] font-mono uppercase tracking-[0.18em] text-western-stone-warm">Conversão</th>
                </tr>
              </thead>
              <tbody>
                {funnel.map((r) => (
                  <tr key={r.semana} className="border-t border-western-stone-warm/15">
                    <td className="px-4 py-2 text-western-green-deep font-mono text-xs">{new Date(r.semana).toLocaleDateString("pt-BR")}</td>
                    <td className="px-4 py-2 text-western-green-deep">{r.orcamentos}</td>
                    <td className="px-4 py-2 text-western-green-deep">{r.pedidos}</td>
                    <td className="px-4 py-2 font-mono text-xs text-western-gold">{r.taxa_conversao_pct ?? 0}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function ActionCard({
  title, count, icon: Icon, to, empty, children,
}: {
  title: string;
  count: number;
  icon: React.ElementType;
  to: string;
  empty: string;
  children: React.ReactNode;
}) {
  const urgent = count > 0;
  return (
    <section className={`border bg-white ${urgent ? "border-western-gold" : "border-western-stone-warm/20"}`}>
      <header className="flex items-center justify-between px-5 py-4 border-b border-western-stone-warm/15">
        <div className="flex items-center gap-2">
          <Icon className={`h-4 w-4 ${urgent ? "text-western-gold" : "text-western-stone-warm"}`} />
          <h3 className="font-display text-base text-western-green-deep">{title}</h3>
          {urgent && (
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-western-gold bg-western-gold/10 border border-western-gold/40 px-2 py-0.5">
              {count}
            </span>
          )}
        </div>
        <Link to={to} className="font-mono text-[10px] uppercase tracking-[0.22em] text-western-stone-warm hover:text-western-gold inline-flex items-center gap-1">
          Ver tudo <ArrowRight className="h-3 w-3" />
        </Link>
      </header>
      <div className="py-1">
        {count === 0 ? (
          <p className="px-5 py-6 text-sm text-western-stone-warm text-center">{empty}</p>
        ) : (
          children
        )}
      </div>
    </section>
  );
}
