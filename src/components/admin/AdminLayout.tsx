import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Inbox,
  FileSignature,
  Truck,
  Settings,
  LogOut,
  ExternalLink,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import logoBege from "@/assets/logo-horizontal-bege.png";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

type BadgeKey = "orcamentos" | "credenciamentos" | "parceiros" | "leads";

const BADGE_HINT: Record<BadgeKey, string> = {
  orcamentos: "orçamentos em aberto",
  credenciamentos: "cadastros aguardando análise",
  parceiros: "parceiros aguardando aprovação",
  leads: "novos nos últimos 7 dias",
};

const items: Array<{
  to: string;
  label: string;
  icon: React.ElementType;
  end?: boolean;
  badgeKey?: BadgeKey;
}> = [
  to: string;
  label: string;
  icon: React.ElementType;
  end?: boolean;
  badgeKey?: BadgeKey;
}> = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/orcamentos", label: "Orçamentos", icon: FileSignature, badgeKey: "orcamentos" },
  { to: "/admin/leads", label: "Caixa de entrada", icon: Inbox, badgeKey: "leads" },
  { to: "/admin/pedidos", label: "Pedidos", icon: Truck },
  { to: "/admin/parceiros", label: "Parceiros", icon: Users, badgeKey: "parceiros" },
  { to: "/admin/configuracoes", label: "Configurações", icon: Settings },
];

export default function AdminLayout() {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [counts, setCounts] = useState<Record<BadgeKey, number>>({
    orcamentos: 0,
    credenciamentos: 0,
    parceiros: 0,
    leads: 0,
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const [qt, cred, part, lds] = await Promise.all([
        supabase
          .from("quote_threads")
          .select("id", { count: "exact", head: true })
          .not("status", "in", "(fechado,perdido,arquivado)"),
        supabase
          .from("credenciamentos")
          .select("id", { count: "exact", head: true })
          .eq("status_manual", "pendente"),
        supabase
          .from("partner_profiles")
          .select("id", { count: "exact", head: true })
          .eq("status", "pending"),
        supabase
          .from("leads")
          .select("id", { count: "exact", head: true })
          .neq("type", "orcamento")
          .gte("created_at", sevenDaysAgo),
      ]);
      if (cancelled) return;
      setCounts({
        orcamentos: qt.count ?? 0,
        credenciamentos: cred.count ?? 0,
        parceiros: part.count ?? 0,
        leads: lds.count ?? 0,
      });
    })();
    return () => { cancelled = true; };
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-western-green-deep text-western-cream flex">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 flex-shrink-0 flex-col border-r border-western-gold/15 bg-western-green-deep">
        <div className="px-6 py-6 border-b border-western-gold/15">
          <img src={logoBege} alt="Western" className="h-10 w-auto mb-3" />
          <p className="text-[10px] font-mono uppercase tracking-[0.22em] text-western-gold-soft">
            Backoffice
          </p>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {items.map((it) => {
            const badge = it.badgeKey ? counts[it.badgeKey] : 0;
            return (
              <NavLink
                key={it.to}
                to={it.to}
                end={it.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 font-mono text-[11px] uppercase tracking-[0.2em] transition-colors ${
                    isActive
                      ? "bg-western-gold/15 text-western-gold-soft border-l-2 border-western-gold"
                      : "text-western-cream/75 hover:text-western-gold-soft border-l-2 border-transparent"
                  }`
                }
              >
                <it.icon className="h-4 w-4" />
                <span className="flex-1">{it.label}</span>
                {badge > 0 && (
                  <span className="min-w-[20px] h-5 px-1.5 inline-flex items-center justify-center rounded-full bg-western-gold text-western-green-deep text-[10px] font-bold tabular-nums">
                    {badge > 99 ? "99+" : badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
        <div className="px-3 py-4 border-t border-western-gold/15 space-y-1">
          <button
            onClick={() => navigate("/")}
            className="w-full flex items-center gap-3 px-3 py-2.5 font-mono text-[11px] uppercase tracking-[0.2em] text-western-cream/60 hover:text-western-gold-soft transition-colors"
          >
            <ExternalLink className="h-4 w-4" /> Ver site
          </button>
          <button
            onClick={async () => { await signOut(); navigate("/", { replace: true }); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 font-mono text-[11px] uppercase tracking-[0.2em] text-western-cream/60 hover:text-red-300 transition-colors"
          >
            <LogOut className="h-4 w-4" /> Sair
          </button>
          <p className="px-3 pt-3 text-[10px] text-western-cream/40 truncate">{user?.email}</p>
        </div>
      </aside>

      {/* Mobile top nav */}
      <div className="md:hidden fixed top-0 inset-x-0 z-40 bg-western-green-deep border-b border-western-gold/15 px-4 py-3 flex gap-3 overflow-x-auto">
        {items.map((it) => {
          const badge = it.badgeKey ? counts[it.badgeKey] : 0;
          return (
            <NavLink
              key={it.to}
              to={it.to}
              end={it.end}
              className={({ isActive }) =>
                `flex-shrink-0 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] border inline-flex items-center gap-1.5 ${
                  isActive ? "border-western-gold text-western-gold-soft" : "border-western-gold/20 text-western-cream/70"
                }`
              }
            >
              {it.label}
              {badge > 0 && (
                <span className="min-w-[16px] h-4 px-1 inline-flex items-center justify-center rounded-full bg-western-gold text-western-green-deep text-[9px] font-bold tabular-nums">
                  {badge > 99 ? "99+" : badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Content */}
      <main className="flex-1 bg-western-ivory text-western-green-deep min-w-0 mt-[52px] md:mt-0">
        <div className="p-6 md:p-10 max-w-7xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
