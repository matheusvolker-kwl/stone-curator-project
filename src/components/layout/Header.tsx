import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useCartStore } from "@/stores/cartStore";
import { ShoppingBag, User, Menu, X, Search, ShieldCheck, LogOut, Heart } from "lucide-react";
import { useWishlist } from "@/hooks/useWishlist";
import logoVerde from "@/assets/logo-horizontal-verde.png";
import logoBege from "@/assets/logo-horizontal-bege.png";
import { useState, useEffect, useMemo, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/useAuth";
import { fetchCollections, fetchProducts, isSeasonal } from "@/lib/datasource";
import { cdnImg, formatBRL } from "@/lib/catalog/client";
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
  { to: "/guia-de-composicao", label: "Guia" },
  { to: "/western-box", label: "Amostras" },
  { to: "/contrate-a-western", label: "Contrate" },
  { to: "/sobre", label: "Sobre" },
  { to: "/contato", label: "Contato" },
];

export default function Header({ onCartOpen }: { onCartOpen: () => void }) {
  const items = useCartStore((s) => s.items);
  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { session, isAdmin, isApproved, empresa, signOut, user } = useAuth();
  const { items: wishItems } = useWishlist();
  const wishCount = wishItems.length;

  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onPulse = () => {
      setPulse(true);
      window.setTimeout(() => setPulse(false), 700);
    };
    window.addEventListener("western:cart-pulse", onPulse);
    return () => window.removeEventListener("western:cart-pulse", onPulse);
  }, []);

  useEffect(() => setMenuOpen(false), [pathname]);

  const [suggestOpen, setSuggestOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const blurTimerRef = useRef<number | null>(null);

  const { data: allProducts = [] } = useQuery({
    queryKey: ["search-catalog-products"],
    queryFn: () => fetchProducts(300),
    staleTime: 60_000,
  });
  const { data: allCollections = [] } = useQuery({
    queryKey: ["search-catalog-collections"],
    queryFn: () => fetchCollections(50),
    staleTime: 60_000,
  });

  const suggestions = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (term.length < 2) return { linhas: [], produtos: [], flatCount: 0 };
    const linhas = allCollections
      .filter((c) => !isSeasonal({ handle: c.handle, description: c.description }))
      .filter(
        (c) =>
          c.title.toLowerCase().includes(term) ||
          c.handle.toLowerCase().includes(term),
      )
      .slice(0, 3);
    const produtos = allProducts
      .filter((p) => {
        const n = p.node;
        if (n.title.toLowerCase().includes(term)) return true;
        return (n.tags ?? []).some((t) => t.toLowerCase().includes(term));
      })
      .slice(0, 6);
    return { linhas, produtos, flatCount: linhas.length + produtos.length };
  }, [query, allCollections, allProducts]);

  useEffect(() => {
    setActiveIndex(-1);
  }, [query]);

  const flatItems = useMemo(
    () => [
      ...suggestions.linhas.map((c) => ({ kind: "linha" as const, handle: c.handle })),
      ...suggestions.produtos.map((p) => ({ kind: "produto" as const, handle: p.node.handle })),
    ],
    [suggestions],
  );

  const closeSuggest = () => {
    setSuggestOpen(false);
    setActiveIndex(-1);
  };

  const handleSuggestFocus = () => {
    if (blurTimerRef.current) window.clearTimeout(blurTimerRef.current);
    if (query.trim().length >= 2 && suggestions.flatCount > 0) setSuggestOpen(true);
  };
  const handleSuggestBlur = () => {
    if (blurTimerRef.current) window.clearTimeout(blurTimerRef.current);
    blurTimerRef.current = window.setTimeout(() => setSuggestOpen(false), 120);
  };

  useEffect(() => {
    if (query.trim().length >= 2 && suggestions.flatCount > 0) setSuggestOpen(true);
    else setSuggestOpen(false);
  }, [query, suggestions.flatCount]);

  const goToItem = (item: { kind: "linha" | "produto"; handle: string }) => {
    closeSuggest();
    setSearchOpen(false);
    setQuery("");
    if (item.kind === "linha") navigate(`/linhas/${item.handle}`);
    else navigate(`/produtos/${item.handle}`);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!suggestOpen || flatItems.length === 0) {
      if (e.key === "Escape") closeSuggest();
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(flatItems.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(-1, i - 1));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      goToItem(flatItems[activeIndex]);
    } else if (e.key === "Escape") {
      closeSuggest();
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    closeSuggest();
    setSearchOpen(false);
    navigate(`/linhas?q=${encodeURIComponent(query.trim())}`);
  };

  const renderSuggestions = (idPrefix: string) => {
    if (!suggestOpen || suggestions.flatCount === 0) return null;
    let idx = -1;
    return (
      <ul
        id={`${idPrefix}search-suggestions`}
        role="listbox"
        className="bg-white border border-western-stone-warm/25 shadow-lg max-h-[70vh] overflow-y-auto"
      >
        {suggestions.linhas.length > 0 && (
          <li className="px-3 pt-3 pb-1 font-mono text-[10px] uppercase tracking-[0.22em] text-western-stone-warm/70">
            Linhas
          </li>
        )}
        {suggestions.linhas.map((c) => {
          idx += 1;
          const i = idx;
          const active = i === activeIndex;
          return (
            <li
              key={`linha-${c.handle}`}
              id={`${idPrefix}search-opt-${i}`}
              role="option"
              aria-selected={active}
              onMouseDown={(e) => {
                e.preventDefault();
                goToItem({ kind: "linha", handle: c.handle });
              }}
              onMouseEnter={() => setActiveIndex(i)}
              className={`flex items-center gap-3 px-3 py-2 cursor-pointer ${
                active ? "bg-western-gold/10" : "hover:bg-western-gold/10"
              }`}
            >
              <div className="h-10 w-10 flex-shrink-0 bg-western-paper overflow-hidden">
                {c.image?.url && (
                  <img
                    src={cdnImg(c.image.url, 80)}
                    alt=""
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <span className="text-sm text-western-green-deep truncate">{c.title}</span>
            </li>
          );
        })}
        {suggestions.produtos.length > 0 && (
          <li className="px-3 pt-3 pb-1 font-mono text-[10px] uppercase tracking-[0.22em] text-western-stone-warm/70">
            Produtos
          </li>
        )}
        {suggestions.produtos.map((p) => {
          idx += 1;
          const i = idx;
          const active = i === activeIndex;
          const node = p.node;
          const img = node.images.edges[0]?.node;
          const price = node.priceRange?.minVariantPrice;
          return (
            <li
              key={`produto-${node.handle}`}
              id={`${idPrefix}search-opt-${i}`}
              role="option"
              aria-selected={active}
              onMouseDown={(e) => {
                e.preventDefault();
                goToItem({ kind: "produto", handle: node.handle });
              }}
              onMouseEnter={() => setActiveIndex(i)}
              className={`flex items-center gap-3 px-3 py-2 cursor-pointer ${
                active ? "bg-western-gold/10" : "hover:bg-western-gold/10"
              }`}
            >
              <div className="h-10 w-10 flex-shrink-0 bg-western-paper overflow-hidden">
                {img?.url && (
                  <img
                    src={cdnImg(img.url, 80)}
                    alt=""
                    loading="lazy"
                    className="w-full h-full object-contain p-1"
                  />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-western-green-deep truncate">{node.title}</p>
                {price && isApproved && (
                  <p className="text-[11px] font-mono text-western-stone-warm">
                    {formatBRL(price.amount, price.currencyCode)}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    );
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
        <div className="hidden md:block relative flex-1 max-w-sm ml-auto">
          <form
            onSubmit={handleSearch}
            className="flex items-center gap-2 px-3 h-10 border border-western-stone-warm/25 bg-white focus-within:border-western-gold transition-colors"
          >
            <Search className="h-4 w-4 text-western-stone-warm flex-shrink-0" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={handleSuggestFocus}
              onBlur={handleSuggestBlur}
              onKeyDown={handleSearchKeyDown}
              type="search"
              placeholder="Buscar linha, peça, código…"
              className="flex-1 bg-transparent outline-none text-sm text-western-green-deep placeholder:text-western-stone-warm/60"
              role="combobox"
              aria-expanded={suggestOpen}
              aria-controls="d-search-suggestions"
              aria-autocomplete="list"
              aria-activedescendant={
                activeIndex >= 0 ? `d-search-opt-${activeIndex}` : undefined
              }
            />
          </form>
          <div className="absolute left-0 right-0 top-full mt-1 z-50">
            {renderSuggestions("d-")}
          </div>
        </div>

        {/* Search mobile (ícone) */}
        <button
          type="button"
          onClick={() => setSearchOpen(true)}
          aria-label="Buscar"
          className="md:hidden ml-auto p-2 text-western-green-deep hover:text-western-gold transition-colors"
        >
          <Search className="h-5 w-5" />
        </button>

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
              aria-label="Entrar"
              className="hidden lg:inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.22em] text-western-green-deep hover:text-western-gold transition-colors whitespace-nowrap"
            >
              <User className="h-4 w-4" />
              <span>Entrar</span>
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
            className={`relative inline-flex items-center justify-center -mr-2 p-2 text-western-green-deep hover:text-western-gold transition-all duration-300 ${
              pulse ? "scale-110" : "scale-100"
            }`}
          >
            <ShoppingBag className={`h-5 w-5 transition-transform ${pulse ? "animate-pulse" : ""}`} />
            {totalItems > 0 && (
              <span
                className={`absolute top-0 right-0 bg-western-gold text-western-green-deep font-mono text-[10px] tracking-wider px-1.5 py-0.5 leading-none transition-shadow ${
                  pulse ? "ring-2 ring-western-gold/60 ring-offset-1 ring-offset-western-ivory" : ""
                }`}
              >
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
            <nav className="flex-1 min-h-0 overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch] px-6 py-8 pb-[max(2rem,env(safe-area-inset-bottom))] flex flex-col gap-1">
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
              <div className="h-px bg-western-gold/15 my-6" />
              <p className="text-eyebrow mb-3 text-western-cream-muted">Parceiro</p>
              {session ? (
                <>
                  <Link
                    to="/minha-conta"
                    className="flex items-center gap-3 py-3 font-mono text-xs uppercase tracking-[0.22em] text-western-cream hover:text-western-gold-soft transition-colors"
                  >
                    <User className="h-4 w-4" /> Minha conta
                  </Link>
                  <Link
                    to="/minha-conta/favoritos"
                    className="flex items-center gap-3 py-3 font-mono text-xs uppercase tracking-[0.22em] text-western-cream hover:text-western-gold-soft transition-colors"
                  >
                    <Heart className="h-4 w-4" /> Favoritos {wishCount > 0 && <span className="text-western-gold-soft">({wishCount})</span>}
                  </Link>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="flex items-center gap-3 py-3 font-mono text-xs uppercase tracking-[0.22em] text-western-cream hover:text-western-gold-soft transition-colors"
                    >
                      <ShieldCheck className="h-4 w-4" /> Painel admin
                    </Link>
                  )}
                  <button
                    onClick={async () => {
                      await signOut();
                      navigate("/", { replace: true });
                    }}
                    className="flex items-center gap-3 py-3 font-mono text-xs uppercase tracking-[0.22em] text-western-cream hover:text-western-gold-soft transition-colors text-left"
                  >
                    <LogOut className="h-4 w-4" /> Sair
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/parceiro/login"
                    className="flex items-center gap-3 py-3 font-mono text-xs uppercase tracking-[0.22em] text-western-cream hover:text-western-gold-soft transition-colors"
                  >
                    <User className="h-4 w-4" /> Acessar conta
                  </Link>
                  <Link
                    to="/parceiro/cadastro"
                    className="py-3 font-mono text-xs uppercase tracking-[0.22em] text-western-cream hover:text-western-gold-soft transition-colors"
                  >
                    · Solicitar acesso B2B
                  </Link>
                </>
              )}
            </nav>
          </div>
        </SheetContent>
      </Sheet>
      {/* Sheet de busca mobile */}
      <Sheet open={searchOpen} onOpenChange={setSearchOpen}>
        <SheetContent side="top" className="bg-western-ivory border-b border-western-stone-warm/15 pt-8 pb-6">
          <SheetTitle className="text-eyebrow mb-3">Buscar no catálogo</SheetTitle>
          <form onSubmit={handleSearch} className="flex items-center gap-2 px-3 h-12 border border-western-stone-warm/30 bg-white focus-within:border-western-gold transition-colors">
            <Search className="h-4 w-4 text-western-stone-warm flex-shrink-0" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              type="search"
              placeholder="Buscar linha, peça, código…"
              className="flex-1 bg-transparent outline-none text-base text-western-green-deep placeholder:text-western-stone-warm/60"
              role="combobox"
              aria-expanded={suggestOpen}
              aria-controls="m-search-suggestions"
              aria-autocomplete="list"
              aria-activedescendant={
                activeIndex >= 0 ? `m-search-opt-${activeIndex}` : undefined
              }
            />
            {query && (
              <button type="button" onClick={() => setQuery("")} aria-label="Limpar" className="text-western-stone-warm hover:text-western-green-deep">
                <X className="h-4 w-4" />
              </button>
            )}
          </form>
          <div className="mt-3">{renderSuggestions("m-")}</div>
          <p className="text-spec text-western-stone-warm mt-3">Pressione Enter para buscar.</p>
        </SheetContent>
      </Sheet>
    </header>
  );
}
