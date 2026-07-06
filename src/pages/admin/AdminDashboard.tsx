import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  Loader2, ArrowRight, ShieldCheck, ShoppingBag, MessageSquare,
  Inbox, TrendingUp, UserPlus,
} from "lucide-react";

interface FunnelRow {
  semana: string;
  orcamentos: number;
  pedidos: number;
  promovidos: number;
  pdf_redownloads: number;
  taxa_conversao_pct: number | null;
  horas_medias_ate_promocao: number | null;
}

interface RecentOrder {
  id: string;
  numero: string;
  titulo: string;
  status: string;
  created_at: string;
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

function fmtBRL(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}

function startOfMonthISO() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString();
}

function sevenDaysAgoISO() {
  return new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
}

interface Counts {
  orcamentosNovos: number;
  pedidoNovo7d: number;
  credPendentes: number;
  partnerSignup7d: number;
  inboxTotal: number;
  leadsMonth: number;
  orcamentosAbertos: number;
  vendasMes: number | null;
  fechadosMes: number;
  orcamentosMes: number;
  productionOrders: number;
}

export default function AdminDashboard() {
  const [counts, setCounts] = useState<Counts | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [funnel, setFunnel] = useState<FunnelRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const monthStart = startOfMonthISO();
      const sevenDays = sevenDaysAgoISO();

      const [
        orcNovosRes,
        pedidoNovo7Res,
        credPendRes,
        partnerSignup7Res,
        inboxTotalRes,
        leadsMonthRes,
        orcAbertosRes,
        orcMesRes,
        vendasMesRes,
        recentOrdersRes,
        funnelRes,
        prodOrdersRes,
      ] = await Promise.all([
        supabase.from("quote_threads").select("id", { count: "exact", head: true }).eq("status", "novo"),
        supabase.from("leads").select("id", { count: "exact", head: true }).eq("type", "pedido_novo").gte("created_at", sevenDays),
        supabase.from("credenciamentos").select("id", { count: "exact", head: true }).eq("status_manual", "pendente"),
        supabase.from("leads").select("id", { count: "exact", head: true }).eq("type", "partner_signup").gte("created_at", sevenDays),
        supabase.from("leads").select("id", { count: "exact", head: true })
          .in("type", ["pedido_novo", "contato", "visita", "partner_signup", "newsletter"]),
        supabase.from("leads").select("id", { count: "exact", head: true }).gte("created_at", monthStart),
        supabase.from("quote_threads").select("id", { count: "exact", head: true })
          .not("status", "in", "(fechado,perdido,arquivado)"),
        supabase.from("quote_threads").select("id", { count: "exact", head: true }).gte("created_at", monthStart),
        supabase.from("quote_threads").select("valor_final").eq("status", "fechado").gte("updated_at", monthStart),
        supabase.from("production_orders").select("id, numero, titulo, status, created_at")
          .order("created_at", { ascending: false }).limit(5),
        supabase.from("lead_conversion_funnel" as never).select("*").limit(8),
        supabase.from("production_orders").select("id", { count: "exact", head: true }),
      ]);

      const vendas = vendasMesRes.data as { valor_final: number | null }[] | null;
      const vendasMes = vendas && vendas.length
        ? vendas.reduce((sum, r) => sum + (Number(r.valor_final) || 0), 0)
        : null;

      setCounts({
        orcamentosNovos: orcNovosRes.count ?? 0,
        pedidoNovo7d: pedidoNovo7Res.count ?? 0,
        credPendentes: credPendRes.count ?? 0,
        partnerSignup7d: partnerSignup7Res.count ?? 0,
        inboxTotal: inboxTotalRes.count ?? 0,
        leadsMonth: leadsMonthRes.count ?? 0,
        orcamentosAbertos: orcAbertosRes.count ?? 0,
        vendasMes: vendas === null ? null : vendasMes,
        fechadosMes: vendas?.length ?? 0,
        orcamentosMes: orcMesRes.count ?? 0,
        productionOrders: prodOrdersRes.count ?? 0,
      });
      setRecentOrders((recentOrdersRes.data as RecentOrder[]) ?? []);
      setFunnel((funnelRes.data as unknown as FunnelRow[]) ?? []);
      setLoading(false);
    })();
  }, []);

  if (loading || !counts) {
    return <div className="py-20 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-western-gold" /></div>;
  }

  const ticketMedio = counts.fechadosMes > 0 && counts.vendasMes !== null
    ? counts.vendasMes / counts.fechadosMes
    : null;
  const conversaoPct = counts.orcamentosMes > 0
    ? Math.round((counts.fechadosMes / counts.orcamentosMes) * 100)
    : null;

  const hotQueues = [
    { label: "Orçamentos a responder", value: counts.orcamentosNovos, to: "/admin/orcamentos", icon: MessageSquare },
    { label: "Leads de checkout (7d)", value: counts.pedidoNovo7d, to: "/admin/leads", icon: ShoppingBag },
    { label: "Credenciamentos pendentes", value: counts.credPendentes, to: "/admin/credenciamentos", icon: ShieldCheck },
    { label: "Cadastros de parceiro (7d)", value: counts.partnerSignup7d, to: "/admin/leads", icon: UserPlus },
  ];
  const totalHot = hotQueues.reduce((s, q) => s + q.value, 0);

  return (
    <div className="space-y-10">
      <header>
        <p className="text-eyebrow mb-3">Central de ação</p>
        <div className="w-12 h-px bg-western-gold mb-6" />
        <h1 className="font-display text-3xl md:text-4xl mb-2">Bom trabalho hoje.</h1>
        <p className="text-western-stone-warm">
          {totalHot > 0
            ? `${totalHot} ${totalHot === 1 ? "item precisa" : "itens precisam"} da sua atenção.`
            : "Nenhuma pendência urgente no momento."}
        </p>
      </header>

      {/* Precisa de você hoje */}
      <section className={`border-2 ${totalHot > 0 ? "border-western-gold bg-western-gold/5" : "border-western-stone-warm/20 bg-white"}`}>
        <header className="px-6 py-4 border-b border-western-stone-warm/15 flex items-center justify-between">
          <h2 className="font-display text-xl text-western-green-deep">Precisa de você hoje</h2>
          {totalHot > 0 && (
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-western-gold">Urgente</span>
          )}
        </header>
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-western-stone-warm/15">
          {hotQueues.map((q) => {
            const isHot = q.value > 0;
            return (
              <Link
                key={q.label}
                to={q.to}
                className={`p-5 flex flex-col gap-2 hover:bg-white transition-colors ${!isHot ? "opacity-50" : ""}`}
              >
                <div className="flex items-center gap-2 text-western-stone-warm">
                  <q.icon className="h-4 w-4" />
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em]">{q.label}</span>
                </div>
                <p className={`font-display text-4xl tabular-nums ${isHot ? "text-western-green-deep" : "text-western-stone-warm/60"}`}>
                  {q.value}
                </p>
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-western-gold inline-flex items-center gap-1">
                  Abrir <ArrowRight className="h-3 w-3" />
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* KPIs */}
      <section>
        <p className="text-eyebrow mb-3">Números do mês</p>
        <div className="w-12 h-px bg-western-gold mb-6" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <Kpi label="Leads no mês" value={counts.leadsMonth.toString()} />
          <Kpi label="Orçamentos em aberto" value={counts.orcamentosAbertos.toString()} />
          <Kpi
            label="Vendas fechadas (R$)"
            value={counts.vendasMes === null ? "—" : fmtBRL(counts.vendasMes)}
          />
          <Kpi
            label="Ticket médio"
            value={ticketMedio === null ? "—" : fmtBRL(ticketMedio)}
          />
          <Kpi
            label="Conversão"
            value={conversaoPct === null ? "—" : `${conversaoPct}%`}
          />
        </div>
      </section>

      {/* Caixa de entrada + Pedidos recentes */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Link
          to="/admin/leads"
          className="border border-western-stone-warm/20 bg-white p-6 hover:border-western-gold transition-colors flex items-start justify-between gap-4"
        >
          <div>
            <div className="flex items-center gap-2 text-western-stone-warm mb-2">
              <Inbox className="h-4 w-4" />
              <span className="font-mono text-[10px] uppercase tracking-[0.2em]">Caixa de entrada</span>
            </div>
            <p className="font-display text-3xl tabular-nums text-western-green-deep mb-1">{counts.inboxTotal}</p>
            <p className="text-sm text-western-stone-warm">leads acionáveis · pedidos, contatos, visitas, cadastros, newsletter</p>
          </div>
          <ArrowRight className="h-5 w-5 text-western-stone-warm flex-shrink-0" />
        </Link>

        <section className="border border-western-stone-warm/20 bg-white">
          <header className="flex items-center justify-between px-5 py-4 border-b border-western-stone-warm/15">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-4 w-4 text-western-stone-warm" />
              <h3 className="font-display text-base text-western-green-deep">Pedidos recentes</h3>
            </div>
            <Link to="/admin/pedidos" className="font-mono text-[10px] uppercase tracking-[0.22em] text-western-stone-warm hover:text-western-gold inline-flex items-center gap-1">
              Ver tudo <ArrowRight className="h-3 w-3" />
            </Link>
          </header>
          <div className="py-1">
            {counts.productionOrders === 0 ? (
              <p className="px-5 py-6 text-sm text-western-stone-warm text-center">Nenhum pedido de produção ainda.</p>
            ) : (
              recentOrders.map((o) => (
                <Link key={o.id} to="/admin/pedidos" className="flex items-center justify-between gap-3 py-2.5 px-5 hover:bg-western-cream/40 border-l-2 border-emerald-600/40">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-western-green-deep truncate">Nº {o.numero} · {o.titulo}</p>
                    <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-western-stone-warm">
                      {o.status} · {fmtDate(o.created_at)}
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-western-stone-warm flex-shrink-0" />
                </Link>
              ))
            )}
          </div>
        </section>
      </div>

      {funnel.length > 0 && (
        <div>
          <p className="text-eyebrow mb-3 inline-flex items-center gap-2"><TrendingUp className="h-3.5 w-3.5" /> Funil de conversão</p>
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
                    <td className="px-4 py-2 text-western-green-deep tabular-nums">{r.orcamentos}</td>
                    <td className="px-4 py-2 text-western-green-deep tabular-nums">{r.pedidos}</td>
                    <td className="px-4 py-2 font-mono text-xs text-western-gold tabular-nums">{r.taxa_conversao_pct ?? 0}%</td>
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

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-western-stone-warm/20 bg-white p-5">
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-western-stone-warm mb-2">{label}</p>
      <p className="font-display text-3xl tabular-nums text-western-green-deep">{value}</p>
    </div>
  );
}
