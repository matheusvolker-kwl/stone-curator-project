import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight, Clock, ShieldCheck, XCircle, ShoppingBag, Truck, FileStack } from "lucide-react";

interface OrderSummary {
  id: string;
  numero: string;
  titulo: string;
  status: string;
  previsao_entrega: string | null;
}

const ACTIVE_STATUS = ["aguardando", "em_producao", "controle_qualidade", "pronto", "em_transporte"];

export default function AccountIndex() {
  const { user, partnerStatus, isAdmin, empresa } = useAuth();
  const [pendingReason, setPendingReason] = useState<string | null>(null);
  const [activeOrders, setActiveOrders] = useState<OrderSummary[]>([]);
  const [counts, setCounts] = useState({ ativos: 0, transito: 0, composicoes: 0 });

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [{ data: orders }, { data: comps }, { data: profile }] = await Promise.all([
        supabase
          .from("production_orders")
          .select("id, numero, titulo, status, previsao_entrega")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
        supabase.from("leads").select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("type", "orcamento"),
        supabase.from("partner_profiles").select("pending_reason").eq("user_id", user.id).maybeSingle(),
      ]);
      const all = (orders as OrderSummary[]) ?? [];
      const ativos = all.filter((o) => ACTIVE_STATUS.includes(o.status));
      const transito = all.filter((o) => o.status === "em_transporte" || o.status === "pronto").length;
      setActiveOrders(ativos.slice(0, 3));
      setCounts({ ativos: ativos.length, transito, composicoes: (comps as unknown as { length: number })?.length ?? 0 });
      setPendingReason((profile as { pending_reason: string | null } | null)?.pending_reason ?? null);
    })();
  }, [user]);

  const statusBadge = () => {
    if (isAdmin) return <Badge tone="gold" icon={ShieldCheck}>Administrador</Badge>;
    if (partnerStatus === "approved") return <Badge tone="green" icon={ShieldCheck}>Parceiro aprovado</Badge>;
    if (partnerStatus === "rejected") return <Badge tone="red" icon={XCircle}>Acesso recusado</Badge>;
    return <Badge tone="muted" icon={Clock}>Em análise</Badge>;
  };

  return (
    <div className="space-y-10">
      <header>
        <p className="text-eyebrow mb-3">Visão geral</p>
        <h2 className="font-display text-3xl md:text-4xl text-western-green-deep leading-[1.05] mb-4">
          Olá, {empresa?.split(" ")[0] || user?.email?.split("@")[0]}.
        </h2>
        <div className="flex flex-wrap gap-3">{statusBadge()}</div>
      </header>

      {partnerStatus === "pending" && !isAdmin && (
        <div className="border border-western-gold/40 bg-western-gold/5 px-5 py-4 text-spec text-western-green-deep">
          {pendingReason ? (
            <>
              <strong className="block mb-1 font-display text-base">Cadastro em reanálise</strong>
              {pendingReason}
            </>
          ) : (
            <>Sua conta está em análise. Liberamos o catálogo completo assim que aprovarmos seu cadastro B2B (até 2 dias úteis).</>
          )}
        </div>
      )}

      <section className="grid grid-cols-3 gap-3">
        <KPI label="Pedidos ativos" value={String(counts.ativos)} icon={ShoppingBag} />
        <KPI label="Em trânsito" value={String(counts.transito)} icon={Truck} />
        <KPI label="Composições" value={String(counts.composicoes)} icon={FileStack} />
      </section>

      <section>
        <div className="flex items-baseline justify-between mb-4">
          <p className="text-eyebrow">Pedidos em andamento</p>
          <Link to="/minha-conta/pedidos" className="font-mono text-[10px] uppercase tracking-[0.22em] text-western-gold hover:underline">
            Ver todos
          </Link>
        </div>
        {activeOrders.length === 0 ? (
          <div className="border border-dashed border-western-stone-warm/30 p-8 text-center">
            <p className="text-spec text-western-stone-warm">Nenhum pedido em produção no momento.</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {activeOrders.map((o) => (
              <Link
                key={o.id}
                to="/minha-conta/pedidos"
                className="block border border-western-stone-warm/15 bg-white p-4 hover:border-western-gold/40 transition-colors"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-western-stone-warm">Nº {o.numero}</p>
                    <p className="font-display text-base text-western-green-deep truncate">{o.titulo}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-western-stone-warm" />
                </div>
              </Link>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Badge({ tone, icon: Icon, children }: { tone: "gold" | "green" | "red" | "muted"; icon: React.ElementType; children: React.ReactNode }) {
  const cls = {
    gold: "text-western-gold",
    green: "text-western-green-deep",
    red: "text-red-700",
    muted: "text-western-stone-warm",
  }[tone];
  return (
    <span className={`inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.2em] ${cls}`}>
      <Icon className="h-3.5 w-3.5" /> {children}
    </span>
  );
}

function KPI({ label, value, icon: Icon }: { label: string; value: string; icon: React.ElementType }) {
  return (
    <div className="border border-western-stone-warm/15 bg-white p-4">
      <Icon className="h-4 w-4 text-western-gold mb-2" />
      <p className="text-eyebrow mb-1">{label}</p>
      <p className="font-display text-2xl text-western-green-deep leading-tight">{value}</p>
    </div>
  );
}
