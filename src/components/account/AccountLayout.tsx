import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useRef } from "react";
import {
  LayoutDashboard,
  User,
  FileStack,
  ShoppingBag,
  FileDown,
  Heart,
  Package,
  Settings,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { TIER_LABEL, TIER_BADGE_CLS, type Tier } from "@/components/admin/adminUtils";
import { usePartnerTier } from "@/hooks/usePartnerPricing";

const items = [
  { to: "/minha-conta", label: "Visão geral", icon: LayoutDashboard, end: true },
  { to: "/minha-conta/perfil", label: "Meu perfil", icon: User },
  { to: "/minha-conta/pedidos", label: "Pedidos", icon: ShoppingBag },
  { to: "/minha-conta/orcamentos", label: "Orçamentos", icon: FileStack },
  { to: "/minha-conta/sketches", label: "Sketches", icon: FileDown },
  { to: "/minha-conta/favoritos", label: "Favoritos", icon: Heart },
  { to: "/minha-conta/amostras", label: "Amostras", icon: Package },
  { to: "/minha-conta/preferencias", label: "Preferências", icon: Settings },
];

export default function AccountLayout() {
  const { empresa, user, signOut } = useAuth();
  const navigate = useNavigate();
  const { tier } = usePartnerTier();
  const { pathname } = useLocation();
  const navRef = useRef<HTMLElement>(null);

  // Em mobile (nav horizontal), traz o item ativo para o viewport
  useEffect(() => {
    const el = navRef.current?.querySelector<HTMLAnchorElement>("a[aria-current='page']");
    el?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [pathname]);

  return (
    <div className="surface-ivory min-h-[80vh]">
      <div className="container-western py-10 md:py-14">
        <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
          {/* Sidebar */}
          <aside className="md:w-64 flex-shrink-0">
            <p className="text-eyebrow mb-2">Minha conta</p>
            <h1 className="font-display text-2xl text-western-green-deep mb-2 leading-tight">
              {empresa || user?.email?.split("@")[0]}
            </h1>
            <span
              className={`inline-flex items-center px-2 py-1 border font-mono text-[10px] uppercase tracking-[0.18em] mb-6 ${TIER_BADGE_CLS[tier as Tier]}`}
            >
              {TIER_LABEL[tier as Tier]}
            </span>

            <nav ref={navRef} className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible -mx-2 md:mx-0 px-2 md:px-0 pb-2 md:pb-0 scroll-smooth">
              {items.map((it) => (
                <NavLink
                  key={it.to}
                  to={it.to}
                  end={it.end}
                  className={({ isActive }) =>
                    `flex-shrink-0 inline-flex items-center gap-3 px-3 py-2 font-mono text-[11px] uppercase tracking-[0.2em] border-l-2 transition-colors whitespace-nowrap ${
                      isActive
                        ? "border-western-gold text-western-green-deep bg-western-gold/5"
                        : "border-transparent text-western-stone-warm hover:text-western-green-deep"
                    }`
                  }
                >
                  <it.icon className="h-4 w-4" /> {it.label}
                </NavLink>
              ))}
              <button
                onClick={async () => { await signOut(); navigate("/", { replace: true }); }}
                className="flex-shrink-0 inline-flex items-center gap-3 px-3 py-2 font-mono text-[11px] uppercase tracking-[0.2em] text-western-stone-warm hover:text-red-700 mt-2"
              >
                <LogOut className="h-4 w-4" /> Sair
              </button>
            </nav>
          </aside>

          {/* Content */}
          <main className="flex-1 min-w-0">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
