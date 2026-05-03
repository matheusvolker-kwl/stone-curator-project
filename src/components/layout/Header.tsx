import { Link, NavLink, useLocation } from "react-router-dom";
import { useCartStore } from "@/stores/cartStore";
import { ShoppingBag, User } from "lucide-react";
import logoBege from "@/assets/logo-horizontal-bege.png";
import logoVerde from "@/assets/logo-horizontal-verde.png";
import { useState, useEffect } from "react";

const nav = [
  { to: "/linhas", label: "Linhas" },
  { to: "/colecoes", label: "Coleções" },
  { to: "/guia-de-compra", label: "Guia" },
  { to: "/sobre", label: "Sobre" },
  { to: "/contato", label: "B2B" },
];

// Rotas onde o header se sobrepõe a uma seção clara (creme/ivory) no topo
const CREAM_ROUTES = ["/linhas", "/colecoes", "/guia-de-compra", "/parceiro"];

export default function Header({ onCartOpen }: { onCartOpen: () => void }) {
  const items = useCartStore((s) => s.items);
  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();

  const isCream =
    CREAM_ROUTES.some((r) => pathname.startsWith(r)) && pathname !== "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const textColor = isCream
    ? "text-western-green-deep"
    : "text-western-cream";
  const hoverColor = isCream
    ? "hover:text-western-gold"
    : "hover:text-western-gold-soft";
  const activeColor = isCream ? "text-western-gold" : "text-western-gold-soft";
  const bgColor = scrolled
    ? isCream
      ? "bg-western-ivory/90 backdrop-blur-md border-b border-western-stone-warm/15"
      : "bg-western-green-deep/90 backdrop-blur-md border-b border-western-gold/15"
    : "bg-transparent";

  return (
    <header
      className={`sticky top-0 z-40 transition-colors duration-500 ${bgColor}`}
    >
      <div className="container-western flex items-center justify-between py-5 md:py-6">
        <Link to="/" aria-label="Western — Início" className="flex items-center">
          <img
            src={isCream ? logoVerde : logoBege}
            alt="Western"
            className="h-7 md:h-8 w-auto"
          />
        </Link>

        <nav className="hidden md:flex items-center gap-10">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `link-underline font-mono text-xs uppercase tracking-[0.22em] ${
                  isActive ? activeColor : `${textColor} ${hoverColor}`
                } transition-colors`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3 md:gap-5">
          <Link
            to="/parceiro/login"
            className={`hidden md:inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.22em] ${textColor} ${hoverColor} transition-colors`}
          >
            <User className="h-4 w-4" />
            Parceiro
          </Link>
          <button
            onClick={onCartOpen}
            aria-label="Abrir pedido"
            className={`relative inline-flex items-center gap-2 ${textColor} ${hoverColor} transition-colors`}
          >
            <ShoppingBag className="h-5 w-5" />
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-3 bg-western-gold text-western-green-deep font-mono text-[10px] tracking-wider px-1.5 py-0.5 leading-none">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
