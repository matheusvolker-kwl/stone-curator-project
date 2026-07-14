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
 * DS V3 — SHELL / HEADER.
 *
 * Header de duas fileiras (como o kit `loja-a-vitrine/shell.jsx`):
 *   fileira 1 = marca + busca + ações (Buscar / Minha conta / Meu carrinho)
 *   fileira 2 = "menu enxuto de 6 entradas de intenção" (só ≥lg)
 * Foi assim que o estouro de 1280px morreu: nav, busca e ícones não disputam
 * mais a mesma linha. Tudo o que não é intenção de compra vive no drawer "Menu".
 *
 * ---------------------------------------------------------------------------
 * REGRA DE PRIORIDADE DO NAV — do mais importante ao menos (esq. → dir.)
 * ---------------------------------------------------------------------------
 *   1. VENDER  — leva à peça e ao carrinho ....... Catálogo · Conjuntos · Guia
 *   2. CONFIAR — prova que a Western entrega ..... Inspirações
 *   3. CAPTAR  — vira lead quando não há CNPJ .... Para sua casa
 *   4. AGIR    — a ação primária, isolada à dir .. Seja parceiro (verde)
 *
 *   Regra de corte: se uma entrada não serve a 1–4, ela NÃO fica no topo —
 *   vive no drawer. É o que mantém o nav em 5 links + 1 ação.
 *
 *   Regra da PORTA ÚNICA: dois caminhos que resolvem a MESMA intenção nunca
 *   disputam o topo. O mais forte fica; o outro vira entrada interna.
 *
 * ---------------------------------------------------------------------------
 * DECISÃO: "Linhas" e "Catálogo" eram a MESMA porta com dois nomes.
 * ---------------------------------------------------------------------------
 * O próprio conteúdo do site já resolvia isso — só o nav é que não tinha
 * percebido:
 *   · /linhas   → o eyebrow da própria página já diz "Catálogo", e ela tem um
 *                 btn-primary para /produtos ("ver todas as peças").
 *   · /produtos → o H1 é "Todas as peças", o eyebrow é "Catálogo completo",
 *                 e ela tem um back-link "‹ Linhas".
 * Ou seja: /linhas é o HUB e /produtos é a vista plana DENTRO dele. Elas já se
 * tratam como pai e filho. O nav é que as colocava lado a lado como iguais —
 * e ainda por cima com o rótulo trocado: a palavra que o leigo entende
 * ("Catálogo") apontava para o grid cru, e a palavra de jargão ("Linhas")
 * apontava para o hub bom.
 *
 * Então: UMA porta no topo — "Catálogo" → /linhas (rótulo e destino agora
 * concordam com o eyebrow da própria página). O grid plano continua a um
 * clique, por onde já era alcançado: o botão na /linhas, o drawer
 * ("Todas as peças"), a busca, o rodapé, a home e a conta (16 links de entrada
 * no app — nada fica órfão).
 *
 * A palavra "linha" NÃO morre: ela é vocabulário da marca e continua no H1 da
 * página, nas specs e no sublabel do drawer. O que muda é só o rótulo de
 * NAVEGAÇÃO — nav fala a língua do visitante; o conteúdo ensina a da casa.
 */
const NAV_INTENTS = [
  // 1. VENDER
  { to: "/linhas", label: "Catálogo" },
  { to: "/conjuntos", label: "Conjuntos" },
  { to: "/guia-de-composicao", label: "Guia de composição" },
  // 2. CONFIAR
  { to: "/inspiracoes", label: "Inspirações" },
  // 3. CAPTAR — hub B2C: sem CNPJ, a Western executa (vira lead turnkey).
  //    (Não confundir com /contrate-a-western, que é a página com formulário.)
  { to: "/para-sua-casa", label: "Para sua casa" },
];

/* 4. AGIR — ação primária do B2B: o cadastro é o que libera o preço de parceiro.
 * Isolada à direita e em VERDE (CTA primário do DS V3). O bronze/dourado é
 * acento — só sobre foto ou verde —, por isso não serve para o botão em si. */
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

  const contaLabel = empresa || user?.email?.split("@")[0] || "Minha conta";

  return (
    <header
      className={`sticky top-0 z-40 transition-shadow duration-300 bg-western-ivory border-b border-western-border-soft ${
        scrolled ? "shadow-[0_6px_24px_-16px_rgba(15,41,24,0.28)]" : ""
      }`}
    >
      {/* ===================================================================
          Fileira 1 — marca · busca · ações
          Encaixe: no mobile cabem 3 ações + logo (312px úteis em 360px de tela:
          Menu 56 + logo ~96 + Buscar 56 + Carrinho 62 + gaps ≈ 282). Uma 4ª ação
          ("Minha conta") estouraria — por isso a conta, no mobile, é o PRIMEIRO
          bloco do drawer, que fica a um toque do botão Menu ao lado.
          No desktop o miolo vazio da fileira 1 vira o campo de busca: espaço
          morto vira a alavanca de conversão mais barata da loja.
          =================================================================== */}
      <div className="container-western flex items-center gap-1 sm:gap-2 lg:gap-6 h-16 lg:h-20">
        <button
          onClick={() => setMenuOpen(true)}
          aria-label="Abrir menu"
          className={`lg:hidden -ml-2 ${actionCls}`}
        >
          <Menu className="h-6 w-6" strokeWidth={1.75} />
          Menu
        </button>

        {/* O alvo de toque é o LINK (≥48px), não a imagem: a logo pode encolher
            para caber em 360px sem quebrar a regra de toque do DS. */}
        <Link
          to="/"
          aria-label="Western — Início"
          className="flex-shrink-0 inline-flex items-center min-h-[48px]"
        >
          <img src={logoVerde} alt="Western" className="h-8 sm:h-9 lg:h-12 w-auto" />
        </Link>

        {/* Busca persistente (desktop). Mesmo motor de sugestões do painel mobile. */}
        <div className="hidden lg:block relative flex-1 max-w-[420px]">
          <form
            onSubmit={handleSearch}
            className="flex items-center gap-3 px-4 h-[52px] rounded-[10px] border-[1.5px] border-western-border-strong bg-white focus-within:border-western-cta transition-colors"
          >
            <Search className="h-5 w-5 text-western-stone-warm flex-shrink-0" strokeWidth={1.75} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={handleSuggestFocus}
              onBlur={handleSuggestBlur}
              onKeyDown={handleSearchKeyDown}
              type="search"
              placeholder="Buscar linha, peça, código…"
              aria-label="Buscar no catálogo"
              className="flex-1 min-w-0 bg-transparent outline-none text-[16px] text-western-green-deep placeholder:text-western-stone-warm/70"
              role="combobox"
              aria-expanded={suggestOpen}
              aria-controls="d-search-suggestions"
              aria-autocomplete="list"
              aria-activedescendant={activeIndex >= 0 ? `d-search-opt-${activeIndex}` : undefined}
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Limpar busca"
                className="inline-flex items-center justify-center h-9 w-9 -mr-2 rounded-[6px] text-western-stone-warm hover:text-western-green-deep transition-colors"
              >
                <X className="h-5 w-5" strokeWidth={1.75} />
              </button>
            )}
          </form>
          <div className="absolute top-[calc(100%+8px)] left-0 right-0 z-50">
            {renderSuggestions("d-")}
          </div>
        </div>

        <div className="ml-auto flex items-center gap-1 lg:gap-2">
          {/* Busca no mobile = painel superior (não há largura para um campo fixo). */}
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            aria-label="Buscar no catálogo"
            className={`lg:hidden ${actionCls}`}
          >
            <Search className="h-6 w-6" strokeWidth={1.75} />
            Buscar
          </button>

          {/* MINHA CONTA — entrada visível (pedido do dono). Logado: "Minha conta"
              (a empresa passa a ser o cabeçalho de dentro do menu, onde ela
              informa sem roubar o rótulo). Deslogado: "Entrar". */}
          {session ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button aria-label="Minha conta" className={`hidden lg:inline-flex ${actionCls}`}>
                  <User className="h-6 w-6" strokeWidth={1.75} />
                  Minha conta
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <div className="px-2 py-2">
                  <p className="text-[16px] font-semibold text-western-green-deep truncate">
                    {contaLabel}
                  </p>
                  <p className="text-[14px] text-western-stone-warm">
                    {isApproved ? "Parceiro credenciado" : "Credenciamento em análise"}
                  </p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-[16px] py-2.5" onClick={() => navigate("/minha-conta")}>
                  <User className="h-4 w-4 mr-2" /> Minha conta
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-[16px] py-2.5"
                  onClick={() => navigate("/minha-conta/favoritos")}
                >
                  <Heart className="h-4 w-4 mr-2" /> Favoritos
                  {wishCount > 0 && (
                    <span className="ml-auto text-[14px] tabular-nums text-western-stone-warm">
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

          {/* MEU CARRINHO — era "Orçamento". O dono foi explícito: o topo fala a
              língua de quem compra. "Orçamento" continua sendo o DOCUMENTO que
              sai daqui, mas o objeto que se enche de peças é o carrinho. */}
          <button
            onClick={onCartOpen}
            aria-label={
              totalItems > 0
                ? `Abrir meu carrinho — ${totalItems} ${totalItems === 1 ? "peça" : "peças"}`
                : "Abrir meu carrinho"
            }
            className={`${actionCls} -mr-2 ${pulse ? "anim-settle" : ""}`}
          >
            <ShoppingBag className="h-6 w-6" strokeWidth={1.75} />
            {/* Em 360px o rótulo cheio estouraria a fileira — abaixo de sm, "Carrinho". */}
            <span className="sm:hidden">Carrinho</span>
            <span className="hidden sm:inline">Meu carrinho</span>
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

      {/* ===================================================================
          Fileira 2 — nav de intenções (desktop), na ordem da REGRA DE
          PRIORIDADE do topo do arquivo: VENDER → CONFIAR → CAPTAR → AGIR.
          =================================================================== */}
      <nav
        aria-label="Navegação principal"
        className="hidden lg:block border-t border-western-border-soft"
      >
        <div className="container-western flex items-center gap-1 xl:gap-2 py-1">
          {NAV_INTENTS.map((item) => (
            <NavLink key={item.to} to={item.to} className={navLinkCls}>
              {item.label}
            </NavLink>
          ))}

          {/* Bloco direito: o "resto" (drawer) e, isolada, a ação primária. */}
          <div className="ml-auto flex items-center gap-2 xl:gap-3">
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Abrir menu completo"
              className="inline-flex items-center gap-2 min-h-[48px] px-3 text-[16px] font-medium text-western-green-deep border-b-2 border-transparent hover:border-western-gold transition-colors"
            >
              <Menu className="h-5 w-5" strokeWidth={1.75} />
              Menu
            </button>

            {!session && (
              <>
                <span aria-hidden="true" className="h-6 w-px bg-western-border-soft" />
                <Link
                  to={PARTNER_INTENT.to}
                  className="inline-flex items-center justify-center min-h-[48px] px-5 rounded-[10px] bg-western-cta text-western-cream text-[16px] font-semibold whitespace-nowrap hover:bg-western-green-deep transition-colors"
                >
                  {PARTNER_INTENT.label}
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ===================================================================
          Drawer — o lugar de TUDO que não cabe (ou não merece) o topo.
          Ordem dos grupos = a mesma regra de prioridade:
            [conta] → Comprar → Decidir → Sem CNPJ → Ateliê → Políticas
          =================================================================== */}
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
              {/* CONTA — primeiro bloco, sem eyebrow. No mobile este é o "botão
                  Minha conta" que não cabe na fileira 1. Deslogado, é o cadastro
                  que libera o preço de parceiro: a ação mais valiosa da loja. */}
              <div className="mt-6">
                {session ? (
                  <>
                    <Link
                      to="/minha-conta"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 w-full min-h-[64px] px-4 rounded-[10px] bg-western-paper border border-western-border-soft hover:border-western-cta transition-colors"
                    >
                      <User className="h-6 w-6 shrink-0 text-western-cta" strokeWidth={1.75} />
                      <span className="min-w-0 flex-1">
                        <span className="block text-[17px] font-semibold text-western-green-deep">
                          Minha conta
                        </span>
                        <span className="block text-[14px] font-normal text-western-stone-warm truncate">
                          {contaLabel}
                        </span>
                      </span>
                      <ChevronRight className="h-5 w-5 shrink-0 text-western-border-strong" />
                    </Link>
                    <div className="mt-2">
                      {drawerLink(
                        "/minha-conta/favoritos",
                        "Favoritos",
                        wishCount > 0
                          ? `${wishCount} ${wishCount === 1 ? "peça salva" : "peças salvas"}`
                          : undefined,
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
                    </div>
                  </>
                ) : (
                  <>
                    <Link
                      to="/parceiro/cadastro"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center justify-center w-full min-h-[52px] px-5 rounded-[10px] bg-western-cta text-western-cream text-[17px] font-semibold hover:bg-western-green-deep transition-colors"
                    >
                      Seja parceiro
                    </Link>
                    <p className="mt-2 text-[14px] text-western-stone-warm">
                      Cadastro com CNPJ · libera o preço de parceiro.
                    </p>
                    <div className="mt-2">
                      {drawerLink("/parceiro/login", "Entrar", "Já sou parceiro")}
                    </div>
                  </>
                )}
              </div>

              {/* 1. VENDER */}
              <p className="text-eyebrow mt-7 mb-1">Comprar</p>
              {drawerLink("/linhas", "Catálogo", "As 11 linhas do ateliê")}
              {drawerLink("/produtos", "Todas as peças", "A coleção inteira, com filtros")}
              {drawerLink("/conjuntos", "Conjuntos", "Kits prontos por tipo de projeto")}
              {drawerLink("/western-box", "Western Box", "Amostras dos acabamentos")}
              {drawerLink(
                "/carrinho",
                "Meu carrinho",
                totalItems > 0
                  ? `${totalItems} ${totalItems === 1 ? "peça" : "peças"}`
                  : "Nenhuma peça ainda",
              )}
              {drawerLink("/como-comprar", "Como comprar", "Preço de parceiro em 4 passos")}

              {/* 2. CONFIAR */}
              <p className="text-eyebrow mt-7 mb-1">Decidir</p>
              {drawerLink("/guia-de-composicao", "Guia de composição", "Monte seu projeto em 3 passos")}
              {drawerLink("/inspiracoes", "Inspirações", "Obras e projetos reais")}
              {drawerLink("/por-que-western", "Por que Western", "A pedra com ~10% do peso")}

              {/* 3. CAPTAR — a rampa B2C. Agrupada e rotulada pela PERGUNTA do
                  visitante ("não tenho CNPJ"), para o B2B pular e o B2C achar. */}
              <p className="text-eyebrow mt-7 mb-1">Sem CNPJ?</p>
              {drawerLink("/para-sua-casa", "Para sua casa", "A Western executa pra você")}
              {drawerLink("/contrate-a-western", "Contrate a Western", "Consultoria, projeto 3D e instalação")}

              <p className="text-eyebrow mt-7 mb-1">Ateliê</p>
              {drawerLink("/sobre", "Sobre o ateliê", `Cajamar/SP · desde ${BUSINESS.fundadaEm}`)}
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
              {drawerLink("/contato", "Contato")}
              {drawerLink("/faq", "Perguntas frequentes")}

              <p className="text-eyebrow mt-7 mb-1">Políticas</p>
              {drawerLink("/politica-comercial", "Política comercial")}
              {drawerLink("/politica-de-entrega", "Política de entrega")}
              {drawerLink("/trocas-e-avarias", "Trocas e avarias")}
              {drawerLink("/privacidade", "Privacidade")}
            </nav>
          </div>
        </SheetContent>
      </Sheet>

      {/* Busca — painel superior (mobile; no desktop o campo vive na fileira 1) */}
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
