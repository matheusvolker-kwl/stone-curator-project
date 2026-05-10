import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Inbox,
  FileSignature,
  PackageCheck,
  Truck,
  Settings,
  LogOut,
  ExternalLink,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import logoBege from "@/assets/logo-horizontal-bege.png";

const items = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/orcamentos", label: "Orçamentos", icon: FileSignature },
  { to: "/admin/pedidos", label: "Pedidos", icon: Truck },
  { to: "/admin/parceiros", label: "Parceiros", icon: Users },
  { to: "/admin/leads", label: "Caixa de entrada", icon: Inbox },
  { to: "/admin/amostras", label: "Amostras", icon: PackageCheck },
  { to: "/admin/configuracoes", label: "Configurações", icon: Settings },
];

export default function AdminLayout() {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();

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
          {items.map((it) => (
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
              {it.label}
            </NavLink>
          ))}
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
        {items.map((it) => (
          <NavLink
            key={it.to}
            to={it.to}
            end={it.end}
            className={({ isActive }) =>
              `flex-shrink-0 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] border ${
                isActive ? "border-western-gold text-western-gold-soft" : "border-western-gold/20 text-western-cream/70"
              }`
            }
          >
            {it.label}
          </NavLink>
        ))}
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
