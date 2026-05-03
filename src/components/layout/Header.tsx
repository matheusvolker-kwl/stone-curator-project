import { Link, NavLink } from "react-router-dom";
import { useCartStore } from "@/stores/cartStore";
import { ShoppingBag, User } from "lucide-react";
import logo from "@/assets/logo-horizontal-bege.png";
import { useState, useEffect } from "react";

const nav = [
  { to: "/colecoes", label: "Coleções" },
  { to: "/guia-de-compra", label: "Guia de compra" },
  { to: "/sobre", label: "Sobre" },
  { to: "/contato", label: "Contato" },
];

export default function Header({ onCartOpen }: { onCartOpen: () => void }) {
  const items = useCartStore((s) => s.items);
  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 transition-colors duration-500 ${
        scrolled
          ? "bg-western-green-deep/90 backdrop-blur-md border-b border-western-gold/15"
          : "bg-transparent"
      }`}
    >
      <div className="container-western flex items-center justify-between py-5 md:py-6">
        <Link to="/" aria-label="Western Pools — Início" className="flex items-center">
          <img src={logo} alt="Western Pools" className="h-8 md:h-9 w-auto" />
        </Link>

        <nav className="hidden md:flex items-center gap-10">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `link-underline font-mono text-xs uppercase tracking-[0.2em] ${
                  isActive ? "text-western-gold-soft" : "text-western-cream"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3 md:gap-5">
          <Link
            to="/parceiro/login"
            className="hidden md:inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-western-cream hover:text-western-gold-soft transition-colors"
          >
            <User className="h-4 w-4" />
            Parceiro
          </Link>
          <button
            onClick={onCartOpen}
            aria-label="Abrir pedido"
            className="relative inline-flex items-center gap-2 text-western-cream hover:text-western-gold-soft transition-colors"
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
