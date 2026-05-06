import { Link, NavLink, useLocation } from "react-router-dom";
import { useCartStore } from "@/stores/cartStore";
import { ShoppingBag, User, Menu, X } from "lucide-react";
import logoBege from "@/assets/logo-horizontal-bege.png";
import logoVerde from "@/assets/logo-horizontal-verde.png";
import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";

const nav = [
  { to: "/", label: "Início", end: true },
  { to: "/linhas", label: "Linhas" },
  { to: "/conjuntos", label: "Conjuntos" },
  { to: "/guia-de-compra", label: "Guia de Compra" },
  { to: "/sobre", label: "Sobre" },
  { to: "/contato", label: "B2B" },
];

// Rotas onde o header se sobrepõe a uma seção clara (creme/ivory) no topo
const CREAM_ROUTES = ["/linhas", "/conjuntos", "/guia-de-compra", "/parceiro"];

export default function Header({ onCartOpen }: { onCartOpen: () => void }) {
  const items = useCartStore((s) => s.items);
  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();

  const isCream =
    CREAM_ROUTES.some((r) => pathname.startsWith(r)) && pathname !== "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Fecha menu ao trocar de rota
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

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
      <div className="container-western flex items-center justify-between py-2 lg:py-3">
        {/* Hamburger — mobile/tablet */}
        <button
          onClick={() => setMenuOpen(true)}
          aria-label="Abrir menu"
          className={`lg:hidden -ml-2 p-2 ${textColor} ${hoverColor} transition-colors`}
        >
          <Menu className="h-5 w-5" />
        </button>

        <Link
          to="/"
          aria-label="Western — Início"
          className="flex items-center lg:flex-none absolute left-1/2 -translate-x-1/2 lg:static lg:translate-x-0"
        >
          <img
            src={isCream ? logoVerde : logoBege}
            alt="Western"
            className="h-16 lg:h-20 w-auto"
          />
        </Link>

        <nav className="hidden lg:flex items-center gap-6 xl:gap-9">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `link-underline font-mono text-xs uppercase tracking-[0.22em] whitespace-nowrap ${
                  isActive ? activeColor : `${textColor} ${hoverColor}`
                } transition-colors`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-1 lg:gap-5">
          <Link
            to="/parceiro/login"
            className={`hidden lg:inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.22em] whitespace-nowrap ${textColor} ${hoverColor} transition-colors`}
          >
            <User className="h-4 w-4" />
            Parceiro
          </Link>
          <button
            onClick={onCartOpen}
            aria-label="Abrir pedido"
            className={`relative inline-flex items-center justify-center -mr-2 p-2 ${textColor} ${hoverColor} transition-colors`}
          >
            <ShoppingBag className="h-5 w-5" />
            {totalItems > 0 && (
              <span className="absolute top-0 right-0 bg-western-gold text-western-green-deep font-mono text-[10px] tracking-wider px-1.5 py-0.5 leading-none">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent
          side="left"
          className="w-[85%] max-w-sm p-0 bg-western-green-deep border-r border-western-gold/20 text-western-cream [&>button]:hidden"
        >
          <SheetTitle className="sr-only">Menu de navegação</SheetTitle>
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between px-6 py-5 border-b border-western-gold/15">
              <img src={logoBege} alt="Western" className="h-10 w-auto" />
              <button
                onClick={() => setMenuOpen(false)}
                aria-label="Fechar menu"
                className="-mr-2 p-2 text-western-cream hover:text-western-gold-soft transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex-1 px-6 py-8 flex flex-col gap-1">
              <p className="text-eyebrow mb-5 text-western-cream-muted">
                Navegação
              </p>
              {nav.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `font-display text-2xl py-3 transition-colors ${
                      isActive
                        ? "text-western-gold-soft"
                        : "text-western-cream hover:text-western-gold-soft"
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}

              <div className="h-px bg-western-gold/15 my-6" />

              <p className="text-eyebrow mb-3 text-western-cream-muted">
                Parceiro
              </p>
              <Link
                to="/parceiro/login"
                className="flex items-center gap-3 py-3 font-mono text-xs uppercase tracking-[0.22em] text-western-cream hover:text-western-gold-soft transition-colors"
              >
                <User className="h-4 w-4" />
                Acessar conta
              </Link>
              <Link
                to="/parceiro/cadastro"
                className="py-3 font-mono text-xs uppercase tracking-[0.22em] text-western-cream hover:text-western-gold-soft transition-colors"
              >
                · Cadastro B2B
              </Link>
            </nav>

            <div className="px-6 py-6 border-t border-western-gold/15 space-y-3">
              <a
                href="https://wa.me/5511993403485"
                target="_blank"
                rel="noopener noreferrer"
                className="block font-mono text-xs uppercase tracking-[0.22em] text-western-cream-muted hover:text-western-gold-soft transition-colors"
              >
                WhatsApp
              </a>
              <a
                href="https://instagram.com/westernpools"
                target="_blank"
                rel="noopener noreferrer"
                className="block font-mono text-xs uppercase tracking-[0.22em] text-western-cream-muted hover:text-western-gold-soft transition-colors"
              >
                Instagram
              </a>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
}
