import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { usePartnerPricing } from "@/hooks/usePartnerPricing";
import { supabase } from "@/integrations/supabase/client";
import { TIER_LABEL, type Tier } from "@/components/admin/adminUtils";
import { ArrowRight, Clock, ShieldCheck, XCircle } from "lucide-react";

export default function AccountIndex() {
  const { user, partnerStatus, isAdmin, empresa } = useAuth();
  const { tier, discountPct, paymentMethods, loading } = usePartnerPricing();
  const [counts, setCounts] = useState({ orcamentos: 0, sketches: 0, favoritos: 0 });

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [q, s, f] = await Promise.all([
        supabase.from("quote_pdfs").select("id", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("guide_exports").select("id", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("wishlists").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      ]);
      setCounts({ orcamentos: q.count ?? 0, sketches: s.count ?? 0, favoritos: f.count ?? 0 });
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

      {partnerStatus !== "approved" && !isAdmin && (
        <div className="border border-western-gold/40 bg-western-gold/5 px-5 py-4 text-spec text-western-green-deep">
          Sua conta está em análise. Liberamos o catálogo com preços, descontos e amostras assim que aprovarmos seu cadastro B2B (até 2 dias úteis).
        </div>
      )}

      <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KPI label="Tier" value={loading ? "…" : TIER_LABEL[tier as Tier].replace("Western Pro ", "")} />
        <KPI label="Desconto" value={loading ? "…" : `${discountPct}%`} />
        <KPI label="Parcelas" value={loading ? "…" : `${paymentMethods.parcelas_max}x`} />
        <KPI label="Boleto" value={loading ? "…" : paymentMethods.boleto ? "Sim" : "Não"} />
      </section>

      <section className="grid md:grid-cols-3 gap-3">
        <Card to="/minha-conta/orcamentos" eyebrow="Orçamentos" title={`${counts.orcamentos} salvos`} />
        <Card to="/minha-conta/sketches" eyebrow="Sketches" title={`${counts.sketches} salvos`} />
        <Card to="/minha-conta/favoritos" eyebrow="Favoritos" title={`${counts.favoritos} pedras`} />
      </section>

      <section className="grid md:grid-cols-2 gap-3">
        <Card to="/linhas" eyebrow="Catálogo" title="Ver linhas e preços liberados" />
        <Card to="/pedir-amostras" eyebrow="Kit de amostras" title="Receber 4 acabamentos" />
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

function KPI({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-western-stone-warm/15 bg-white p-4">
      <p className="text-eyebrow mb-2">{label}</p>
      <p className="font-display text-xl text-western-green-deep leading-tight">{value}</p>
    </div>
  );
}

function Card({ to, eyebrow, title }: { to: string; eyebrow: string; title: string }) {
  return (
    <Link to={to} className="group border border-western-stone-warm/20 bg-white p-5 hover:border-western-gold transition-colors flex items-center justify-between gap-4">
      <div>
        <p className="text-eyebrow mb-2">{eyebrow}</p>
        <p className="text-spec text-western-green-deep">{title}</p>
      </div>
      <ArrowRight className="h-4 w-4 text-western-stone-warm group-hover:text-western-gold transition-colors" />
    </Link>
  );
}
