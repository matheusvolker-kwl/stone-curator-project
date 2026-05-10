import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useCartStore } from "@/stores/cartStore";
import { ShoppingBag, User, Menu, X, Search, ShieldCheck, LogOut, Heart } from "lucide-react";
import { useWishlist } from "@/hooks/useWishlist";
import logoVerde from "@/assets/logo-horizontal-verde.png";
import logoBege from "@/assets/logo-horizontal-bege.png";
import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const nav = [
  { to: "/linhas", label: "Linhas" },
  { to: "/conjuntos", label: "Conjuntos" },
  { to: "/guia-de-compra", label: "Guia" },
  { to: "/pedir-amostras", label: "Amostras" },
  { to: "/sobre", label: "Sobre" },
  { to: "/contato", label: "Contato" },
];

export default function Header({ onCartOpen }: { onCartOpen: () => void }) {
  const items = useCartStore((s) => s.items);
  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { session, isAdmin, empresa, signOut, user } = useAuth();
  const { items: wishItems } = useWishlist();
  const wishCount = wishItems.length;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setMenuOpen(false), [pathname]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    navigate(`/linhas?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <header
      className={`sticky top-0 z-40 transition-shadow duration-300 bg-western-ivory border-b border-western-stone-warm/15 ${
        scrolled ? "shadow-[0_4px_20px_-12px_rgba(15,40,24,0.18)]" : ""
      }`}
    >
      <div className="container-western flex items-center gap-4 lg:gap-8 py-3 lg:py-4">
        {/* Hamburger mobile */}
        <button
          onClick={() => setMenuOpen(true)}
          aria-label="Abrir menu"
          className="lg:hidden -ml-2 p-2 text-western-green-deep hover:text-western-gold transition-colors"
        >
          <Menu className="h-5 w-5" />
        </button>

        <Link to="/" aria-label="Western — Início" className="flex-shrink-0">
          <img src={logoVerde} alt="Western" className="h-12 lg:h-14 w-auto" />
        </Link>

        {/* Nav desktop */}
        <nav className="hidden lg:flex items-center gap-7 xl:gap-9">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `link-underline font-mono text-xs uppercase tracking-[0.22em] whitespace-nowrap transition-colors ${
                  isActive
                    ? "text-western-gold"
                    : "text-western-green-deep hover:text-western-gold"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Search */}
        <form
          onSubmit={handleSearch}
          className="hidden md:flex flex-1 max-w-sm ml-auto items-center gap-2 px-3 h-10 border border-western-stone-warm/25 bg-white focus-within:border-western-gold transition-colors"
        >
          <Search className="h-4 w-4 text-western-stone-warm flex-shrink-0" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            type="search"
            placeholder="Buscar pedra, código, acabamento…"
            className="flex-1 bg-transparent outline-none text-sm text-western-green-deep placeholder:text-western-stone-warm/60"
          />
        </form>

        <div className="flex items-center gap-1 lg:gap-3 ml-auto md:ml-0">
          {session ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  aria-label="Minha conta"
                  className="hidden lg:inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.22em] text-western-green-deep hover:text-western-gold transition-colors"
                >
                  <User className="h-4 w-4" />
                  <span className="max-w-[140px] truncate normal-case tracking-normal">
                    {empresa || user?.email?.split("@")[0] || "Conta"}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => navigate("/minha-conta")}>
                  <User className="h-4 w-4 mr-2" /> Minha conta
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem onClick={() => navigate("/admin")}>
                    <ShieldCheck className="h-4 w-4 mr-2" /> Painel admin
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={async () => {
                    await signOut();
                    navigate("/", { replace: true });
                  }}
                >
                  <LogOut className="h-4 w-4 mr-2" /> Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link
              to="/parceiro/login"
              aria-label="Área do parceiro"
              className="hidden lg:inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.22em] text-western-green-deep hover:text-western-gold transition-colors"
            >
              <User className="h-4 w-4" /> Parceiro
            </Link>
          )}
          {session && (
            <Link
              to="/minha-conta/favoritos"
              aria-label="Favoritos"
              className="relative inline-flex items-center justify-center p-2 text-western-green-deep hover:text-western-gold transition-colors"
            >
              <Heart className="h-5 w-5" />
              {wishCount > 0 && (
                <span className="absolute top-0 right-0 bg-western-gold text-western-green-deep font-mono text-[10px] tracking-wider px-1.5 py-0.5 leading-none">
                  {wishCount}
                </span>
              )}
            </Link>
          )}
          <button
            onClick={onCartOpen}
            aria-label="Abrir orçamento"
            className="relative inline-flex items-center justify-center -mr-2 p-2 text-western-green-deep hover:text-western-gold transition-colors"
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
              <img src={logoBege} alt="Western" className="h-12 w-auto" />
              <button
                onClick={() => setMenuOpen(false)}
                aria-label="Fechar menu"
                className="-mr-2 p-2 text-western-cream hover:text-western-gold-soft transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex-1 px-6 py-8 flex flex-col gap-1">
              <p className="text-eyebrow mb-5 text-western-cream-muted">Catálogo</p>
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
              <p className="text-eyebrow mb-3 text-western-cream-muted">Parceiro</p>
              <Link
                to="/parceiro/login"
                className="flex items-center gap-3 py-3 font-mono text-xs uppercase tracking-[0.22em] text-western-cream hover:text-western-gold-soft transition-colors"
              >
                <User className="h-4 w-4" /> Acessar conta
              </Link>
              {session && (
                <Link
                  to="/minha-conta/favoritos"
                  className="flex items-center gap-3 py-3 font-mono text-xs uppercase tracking-[0.22em] text-western-cream hover:text-western-gold-soft transition-colors"
                >
                  <Heart className="h-4 w-4" /> Favoritos {wishCount > 0 && <span className="text-western-gold-soft">({wishCount})</span>}
                </Link>
              )}
              <Link
                to="/parceiro/cadastro"
                className="py-3 font-mono text-xs uppercase tracking-[0.22em] text-western-cream hover:text-western-gold-soft transition-colors"
              >
                · Solicitar acesso B2B
              </Link>
            </nav>
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
}
