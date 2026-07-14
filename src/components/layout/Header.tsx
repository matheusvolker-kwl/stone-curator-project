import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useCartStore } from "@/stores/cartStore";
import {
  ShoppingBag,
  User,
  Menu,
  X,
  Search,
  ShieldCheck,
  LogOut,
  Heart,
  ChevronRight,
  MessageCircle,
} from "lucide-react";
import { useWishlist } from "@/hooks/useWishlist";
import logoVerde from "@/assets/logo-horizontal-verde.png";
import { useState, useEffect, useMemo, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/useAuth";
import { fetchCollections, fetchProducts, isSeasonal } from "@/lib/datasource";
import { cdnImg, formatBRL } from "@/lib/catalog/client";
import { BUSINESS } from "@/config/business";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/**
 * DS V3 — SHELL.
 * Header de duas fileiras (como o kit `loja-a-vitrine/shell.jsx`):
 *   fileira 1 = marca + ações (buscar / conta / orçamento)
 *   fileira 2 = "menu enxuto de 6 entradas de intenção" (só ≥lg)
 *
 * Foi assim que o estouro de 1280px morreu: nav, busca e ícones não disputam
 * mais a mesma linha de 1.200px. Nav = 16px, peso 500, sentence case
 * (o mono 12px caixa-alta com tracking largo era do design antigo).
 * Tudo o que não é intenção de compra (Conjuntos, Western Box, institucional)
 * vive no drawer "Menu" — disponível no desktop e no mobile.
 */
const NAV_INTENTS = [
  { to: "/linhas", label: "Linhas" },
  { to: "/produtos", label: "Catálogo" },
  { to: "/guia-de-composicao", label: "Guia" },
  { to: "/inspiracoes", label: "Inspirações" },
  // Hub B2C do kit: todo caminho vai direto ao WhatsApp, sem formulário.
  // (Não confundir com /contrate-a-western, que é a página com formulário.)
  { to: "/para-sua-casa", label: "Para sua casa" },
];

/* Ação de intenção primária. Bronze (não dourado chapado): sobre marfim o
 * dourado não bate AA. O verde fica reservado ao CTA de compra. */
const PARTNER_INTENT = { to: "/parceiro/cadastro", label: "Seja parceiro" };

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
        className="bg-white border border-western-border-soft rounded-[10px] shadow-lg max-h-[60vh] overflow-y-auto overflow-hidden"
      >
        {suggestions.linhas.length > 0 && (
          <li className="text-eyebrow px-4 pt-4 pb-2">Linhas</li>
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
              className={`flex items-center gap-3 px-4 min-h-[56px] py-2 cursor-pointer transition-colors ${
                active ? "bg-western-paper" : "hover:bg-western-paper"
              }`}
            >
              <div className="h-11 w-11 flex-shrink-0 bg-western-paper rounded-[6px] overflow-hidden">
                {c.image?.url && (
                  <img
                    src={cdnImg(c.image.url, 80)}
                    alt=""
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <span className="text-[16px] font-medium text-western-green-deep truncate">
                {c.title}
              </span>
            </li>
          );
        })}
        {suggestions.produtos.length > 0 && (
          <li className="text-eyebrow px-4 pt-4 pb-2">Peças</li>
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
              className={`flex items-center gap-3 px-4 min-h-[56px] py-2 cursor-pointer transition-colors ${
                active ? "bg-western-paper" : "hover:bg-western-paper"
              }`}
            >
              <div className="h-11 w-11 flex-shrink-0 bg-western-paper rounded-[6px] overflow-hidden">
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
                <p className="text-[16px] font-medium text-western-green-deep truncate">
                  {node.title}
                </p>
                {price && isApproved && (
                  <p className="text-[14px] tabular-nums text-western-stone-warm">
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

  /* Ação do header: ícone + rótulo (público 40+ não decifra ícone mudo).
     56x48 mínimo — alvo de toque do DS. */
  const actionCls =
    "relative inline-flex flex-col items-center justify-center gap-0.5 min-w-[56px] min-h-[48px] px-2 rounded-[6px] text-[14px] font-semibold text-western-green-deep hover:bg-western-paper transition-colors";

  const navLinkCls = ({ isActive }: { isActive: boolean }) =>
    `inline-flex items-center min-h-[48px] px-3 xl:px-3.5 text-[16px] font-medium whitespace-nowrap border-b-2 transition-colors ${
      isActive
        ? "border-western-gold text-western-green-deep font-semibold"
        : "border-transparent text-western-green-deep hover:border-western-gold"
    }`;

  /* Linha do drawer — 56px de alvo, hairline, chevron. */
  const rowCls =
    "flex items-center justify-between gap-3 w-full min-h-[56px] py-2 text-left border-b border-western-border-soft text-[17px] font-medium text-western-green-deep hover:text-western-cta transition-colors";

  const drawerLink = (to: string, label: string, sub?: string) => (
    <Link key={`${to}-${label}`} to={to} className={rowCls} onClick={() => setMenuOpen(false)}>
      <span>
        {label}
        {sub && (
          <span className="block text-[14px] font-normal text-western-stone-warm">{sub}</span>
        )}
      </span>
      <ChevronRight className="h-5 w-5 shrink-0 text-western-border-strong" />
    </Link>
  );

  return (
    <header
      className={`sticky top-0 z-40 transition-shadow duration-300 bg-western-ivory border-b border-western-border-soft ${
        scrolled ? "shadow-[0_6px_24px_-16px_rgba(15,41,24,0.28)]" : ""
      }`}
    >
      {/* Fileira 1 — marca + ações */}
      <div className="container-western flex items-center gap-2 lg:gap-4 h-16 lg:h-20">
        <button
          onClick={() => setMenuOpen(true)}
          aria-label="Abrir menu"
          className={`lg:hidden -ml-2 ${actionCls}`}
        >
          <Menu className="h-6 w-6" strokeWidth={1.75} />
          Menu
        </button>

        <Link to="/" aria-label="Western — Início" className="flex-shrink-0">
          <img src={logoVerde} alt="Western" className="h-9 lg:h-12 w-auto" />
        </Link>

        <div className="ml-auto flex items-center gap-1 lg:gap-2">
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            aria-label="Buscar no catálogo"
            className={actionCls}
          >
            <Search className="h-6 w-6" strokeWidth={1.75} />
            Buscar
          </button>

          {session ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button aria-label="Minha conta" className={`hidden lg:inline-flex ${actionCls}`}>
                  <User className="h-6 w-6" strokeWidth={1.75} />
                  <span className="max-w-[130px] truncate">{empresa || user?.email?.split("@")[0] || "Conta"}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60">
                <DropdownMenuItem className="text-[16px] py-2.5" onClick={() => navigate("/minha-conta")}>
                  <User className="h-4 w-4 mr-2" /> Minha conta
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-[16px] py-2.5"
                  onClick={() => navigate("/minha-conta/favoritos")}
                >
                  <Heart className="h-4 w-4 mr-2" /> Favoritos
                  {wishCount > 0 && (
                    <span className="ml-auto text-[14px] tabular-nums text-western-cream-muted">
                      {wishCount}
                    </span>
                  )}
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem className="text-[16px] py-2.5" onClick={() => navigate("/admin")}>
                    <ShieldCheck className="h-4 w-4 mr-2" /> Painel admin
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-[16px] py-2.5"
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
            <Link to="/parceiro/login" aria-label="Entrar" className={`hidden lg:inline-flex ${actionCls}`}>
              <User className="h-6 w-6" strokeWidth={1.75} />
              Entrar
            </Link>
          )}

          <button
            onClick={onCartOpen}
            aria-label="Abrir orçamento"
            className={`${actionCls} -mr-2 ${pulse ? "anim-settle" : ""}`}
          >
            <ShoppingBag className="h-6 w-6" strokeWidth={1.75} />
            Orçamento
            {totalItems > 0 && (
              <span
                className={`absolute top-0 right-0 min-w-[22px] h-[22px] px-1 inline-flex items-center justify-center rounded-full bg-western-cta text-western-cream text-[14px] font-bold leading-none tabular-nums transition-shadow ${
                  pulse ? "ring-2 ring-western-gold/60 ring-offset-1 ring-offset-western-ivory" : ""
                }`}
              >
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Fileira 2 — menu enxuto de intenções (desktop).
          Nav em linha própria = nada disputa largura com a busca e os ícones. */}
      <nav
        aria-label="Navegação principal"
        className="hidden lg:block border-t border-western-border-soft"
      >
        <div className="container-western flex items-center gap-1 xl:gap-2">
          {NAV_INTENTS.map((item) => (
            <NavLink key={item.to} to={item.to} className={navLinkCls}>
              {item.label}
            </NavLink>
          ))}
          {!session && (
            <NavLink
              to={PARTNER_INTENT.to}
              className={({ isActive }) =>
                `inline-flex items-center min-h-[48px] px-3 xl:px-3.5 text-[16px] font-semibold whitespace-nowrap text-western-bronze border-b-2 transition-colors ${
                  isActive ? "border-western-gold" : "border-transparent hover:border-western-gold"
                }`
              }
            >
              {PARTNER_INTENT.label}
            </NavLink>
          )}
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="ml-auto inline-flex items-center gap-2 min-h-[48px] px-3 text-[16px] font-medium text-western-green-deep border-b-2 border-transparent hover:border-western-gold transition-colors"
          >
            <Menu className="h-5 w-5" strokeWidth={1.75} />
            Menu
          </button>
        </div>
      </nav>

      {/* Drawer — tudo que não é intenção de compra mora aqui (mobile e desktop) */}
      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent
          side="left"
          className="w-full max-w-[440px] sm:max-w-[440px] p-0 bg-western-ivory border-r border-western-border-soft [&>button]:hidden"
        >
          <SheetTitle className="sr-only">Menu de navegação</SheetTitle>
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between px-6 py-3 border-b border-western-border-soft">
              <img src={logoVerde} alt="Western" className="h-9 w-auto" />
              <button
                onClick={() => setMenuOpen(false)}
                aria-label="Fechar menu"
                className="-mr-2 inline-flex flex-col items-center justify-center gap-0.5 min-w-[56px] min-h-[48px] rounded-[6px] text-[14px] font-semibold text-western-green-deep hover:bg-western-paper transition-colors"
              >
                <X className="h-6 w-6" strokeWidth={1.75} />
                Fechar
              </button>
            </div>

            <nav className="flex-1 min-h-0 overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch] px-6 pb-[max(2.5rem,env(safe-area-inset-bottom))]">
              <p className="text-eyebrow mt-6 mb-1">Comprar</p>
              {drawerLink("/linhas", "Todas as linhas", "O catálogo por coleção")}
              {drawerLink("/produtos", "Catálogo completo", "Todas as peças, com filtros")}
              {drawerLink("/conjuntos", "Conjuntos", "Kits prontos por tipo de projeto")}
              {drawerLink("/western-box", "Western Box", "Amostras dos acabamentos")}
              {drawerLink("/como-comprar", "Como comprar", "Preço de parceiro em 4 passos")}
              {drawerLink(
                "/carrinho",
                "Meu orçamento",
                totalItems > 0
                  ? `${totalItems} ${totalItems === 1 ? "peça" : "peças"}`
                  : "Nenhuma peça ainda",
              )}

              <p className="text-eyebrow mt-7 mb-1">Descobrir</p>
              {drawerLink("/guia-de-composicao", "Guia de composição", "Monte seu projeto em 3 passos")}
              {drawerLink("/inspiracoes", "Inspirações", "Obras e projetos reais")}
              {drawerLink("/para-sua-casa", "Para sua casa", "Sem CNPJ? A Western executa pra você")}
              {drawerLink("/contrate-a-western", "Contrate a Western", "Consultoria, projeto 3D e instalação")}
              {drawerLink("/por-que-western", "Por que Western", "A pedra com ~10% do peso")}
              {drawerLink("/sobre", "Sobre o ateliê", `Cajamar/SP · desde ${BUSINESS.fundadaEm}`)}

              <p className="text-eyebrow mt-7 mb-1">Parceria</p>
              {session ? (
                <>
                  {drawerLink("/minha-conta", "Minha conta")}
                  {drawerLink(
                    "/minha-conta/favoritos",
                    "Favoritos",
                    wishCount > 0 ? `${wishCount} ${wishCount === 1 ? "peça salva" : "peças salvas"}` : undefined,
                  )}
                  {isAdmin && drawerLink("/admin", "Painel admin")}
                  <button
                    type="button"
                    onClick={async () => {
                      setMenuOpen(false);
                      await signOut();
                      navigate("/", { replace: true });
                    }}
                    className={rowCls}
                  >
                    <span>Sair</span>
                    <LogOut className="h-5 w-5 shrink-0 text-western-border-strong" />
                  </button>
                </>
              ) : (
                <>
                  {drawerLink("/parceiro/login", "Acessar conta", "Já sou parceiro")}
                  {drawerLink("/parceiro/cadastro", "Seja parceiro", "Cadastro com CNPJ · libera o preço de parceiro")}
                </>
              )}
              {drawerLink("/contrate-a-western", "Contrate a Western", "Produção, execução e projeto 3D")}

              <p className="text-eyebrow mt-7 mb-1">Ajuda</p>
              <a
                href={`https://wa.me/${BUSINESS.whatsappFabrica}`}
                target="_blank"
                rel="noopener noreferrer"
                className={rowCls}
                onClick={() => setMenuOpen(false)}
              >
                <span>
                  Falar com o ateliê
                  <span className="block text-[14px] font-normal text-western-stone-warm">
                    WhatsApp {BUSINESS.whatsappLabel}
                  </span>
                </span>
                <MessageCircle className="h-5 w-5 shrink-0 text-western-cta" strokeWidth={1.75} />
              </a>
              {drawerLink("/faq", "Perguntas frequentes")}
              {drawerLink("/contato", "Contato")}
              {drawerLink("/politica-comercial", "Política comercial")}

              {!session && (
                <Link
                  to="/parceiro/cadastro"
                  onClick={() => setMenuOpen(false)}
                  className="btn-primary w-full mt-8"
                >
                  Solicitar acesso de parceiro
                </Link>
              )}
            </nav>
          </div>
        </SheetContent>
      </Sheet>

      {/* Busca — painel superior (mesma UX em qualquer largura) */}
      <Sheet open={searchOpen} onOpenChange={setSearchOpen}>
        <SheetContent
          side="top"
          className="bg-western-ivory border-b border-western-border-soft pt-8 pb-7"
        >
          <SheetTitle className="text-eyebrow mb-3">Buscar no catálogo</SheetTitle>
          <form
            onSubmit={handleSearch}
            className="flex items-center gap-3 px-4 h-[52px] rounded-[10px] border-[1.5px] border-western-border-strong bg-white focus-within:border-western-cta transition-colors"
          >
            <Search className="h-5 w-5 text-western-stone-warm flex-shrink-0" strokeWidth={1.75} />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={handleSuggestFocus}
              onBlur={handleSuggestBlur}
              onKeyDown={handleSearchKeyDown}
              type="search"
              placeholder="Buscar linha, peça, código…"
              className="flex-1 min-w-0 bg-transparent outline-none text-[16px] text-western-green-deep placeholder:text-western-stone-warm/70"
              role="combobox"
              aria-expanded={suggestOpen}
              aria-controls="m-search-suggestions"
              aria-autocomplete="list"
              aria-activedescendant={activeIndex >= 0 ? `m-search-opt-${activeIndex}` : undefined}
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Limpar busca"
                className="tap-target -mr-2 inline-flex items-center justify-center text-western-stone-warm hover:text-western-green-deep transition-colors"
              >
                <X className="h-5 w-5" strokeWidth={1.75} />
              </button>
            )}
          </form>
          <div className="mt-3">{renderSuggestions("m-")}</div>
          <p className="text-meta mt-3">Pressione Enter para buscar em todo o catálogo.</p>
        </SheetContent>
      </Sheet>
    </header>
  );
}
