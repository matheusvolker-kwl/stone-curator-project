import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  ExternalLink,
  FileSignature,
  Inbox,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Menu,
  Settings,
  ShieldCheck,
  Truck,
  Users,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { mensagemDeErro } from "@/components/backoffice";
import { EVENTO_SECAO_VISTA, ultimaVisita } from "@/components/admin/adminSeen";
import { cn } from "@/lib/utils";
import logoVerde from "@/assets/logo-horizontal-verde.png";

/**
 * SHELL DO ADMIN — 2 zonas: sidebar de navegação + workspace.
 *
 * Sidebar de 240px com TRÊS GRUPOS (Operação / Parceiros / Configuração), não
 * uma lista plana de itens iguais. No mobile ela vira drawer.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * O BUG QUE ESTA TELA MATOU: o "0 silencioso"
 * ─────────────────────────────────────────────────────────────────────────
 * A versão anterior fazia:
 *
 *   const [qt, cred] = await Promise.all([...]);
 *   setCounts({ orcamentos: qt.count ?? 0, credenciamentos: cred.count ?? 0 });
 *
 * `error` era ignorado. Um 403 (RLS) vira `count: null` → `?? 0` → o badge some
 * e o dono lê "não tem nada pendente" quando na verdade a consulta FALHOU.
 * Foi assim que um parceiro pendente sumiu do painel antigo.
 *
 * Agora cada contagem é uma máquina de estados — carregando | ok | ERRO — e o
 * erro aparece como um triângulo âmbar/vermelho com a mensagem real, além de um
 * "tentar de novo" no rodapé da sidebar. Zero nunca é inventado.
 */

/* ─────────────────────────────────────────────────────────────
 * Contagens (badges)
 * ───────────────────────────────────────────────────────────── */

type ChaveContagem = "leads" | "orcamentos" | "credenciamentos" | "parceiros";

type Contagem =
  | { estado: "carregando" }
  | { estado: "ok"; valor: number }
  | { estado: "erro"; mensagem: string };

const CONTAGEM_INICIAL: Record<ChaveContagem, Contagem> = {
  leads: { estado: "carregando" },
  orcamentos: { estado: "carregando" },
  credenciamentos: { estado: "carregando" },
  parceiros: { estado: "carregando" },
};

/** O que o número quer dizer — aparece no tooltip. */
const DICA: Record<ChaveContagem, string> = {
  leads: "novos desde a sua última visita à Caixa de entrada",
  orcamentos: "orçamentos em aberto",
  credenciamentos: "cadastros aguardando análise",
  parceiros: "parceiros aguardando aprovação",
};

/**
 * Converte uma resposta do Supabase em contagem.
 * Se houve erro — ou se a consulta voltou sem contagem — o resultado é ERRO,
 * nunca 0. É este `if` que impede o painel de mentir.
 */
function paraContagem(resposta: { count: number | null; error: unknown }): Contagem {
  if (resposta.error) return { estado: "erro", mensagem: mensagemDeErro(resposta.error) };
  if (resposta.count == null) return { estado: "erro", mensagem: "A consulta não devolveu contagem." };
  return { estado: "ok", valor: resposta.count };
}

/* ─────────────────────────────────────────────────────────────
 * Mapa de navegação — 3 grupos, rotas reais
 * ───────────────────────────────────────────────────────────── */

interface ItemNav {
  to: string;
  rotulo: string;
  icone: React.ElementType;
  contagem?: ChaveContagem;
  /** "acento" = dourado (só onde dói: credenciamento parado). "neutro" = chip discreto. */
  tomBadge?: "acento" | "neutro";
  /** As rotas com abas moram na mesma URL — o ativo depende do ?tab=. */
  ativo: (pathname: string, tab: string | null) => boolean;
}

interface GrupoNav {
  titulo: string;
  itens: ItemNav[];
}

const GRUPOS: GrupoNav[] = [
  {
    titulo: "Operação",
    itens: [
      {
        to: "/admin",
        rotulo: "Dashboard",
        icone: LayoutDashboard,
        ativo: (p) => p === "/admin" || p === "/admin/",
      },
      {
        to: "/admin/leads",
        rotulo: "Caixa de entrada",
        icone: Inbox,
        contagem: "leads",
        tomBadge: "neutro",
        ativo: (p) => p.startsWith("/admin/leads"),
      },
      {
        to: "/admin/orcamentos",
        rotulo: "Orçamentos",
        icone: FileSignature,
        contagem: "orcamentos",
        tomBadge: "neutro",
        ativo: (p) => p.startsWith("/admin/orcamentos"),
      },
      {
        to: "/admin/pedidos",
        rotulo: "Pedidos",
        icone: Truck,
        ativo: (p) => p.startsWith("/admin/pedidos"),
      },
    ],
  },
  {
    titulo: "Parceiros",
    itens: [
      {
        to: "/admin/parceiros?tab=credenciamento",
        rotulo: "Credenciamentos",
        icone: ShieldCheck,
        contagem: "credenciamentos",
        tomBadge: "acento",
        // /admin/parceiros sem ?tab= abre em credenciamento (ver AdminPartners).
        ativo: (p, tab) => p.startsWith("/admin/parceiros") && tab !== "ativos",
      },
      {
        to: "/admin/parceiros?tab=ativos",
        rotulo: "Parceiros",
        icone: Users,
        contagem: "parceiros",
        tomBadge: "neutro",
        ativo: (p, tab) => p.startsWith("/admin/parceiros") && tab === "ativos",
      },
    ],
  },
  {
    titulo: "Configuração",
    itens: [
      {
        to: "/admin/configuracoes",
        rotulo: "Tiers e descontos",
        icone: Settings,
        // /admin/configuracoes sem ?tab= abre em tiers (ver AdminSettings).
        ativo: (p, tab) => p.startsWith("/admin/configuracoes") && tab !== "cnae",
      },
      {
        to: "/admin/configuracoes?tab=cnae",
        rotulo: "CNAEs permitidos",
        icone: ListChecks,
        ativo: (p, tab) => p.startsWith("/admin/configuracoes") && tab === "cnae",
      },
    ],
  },
];

/* ─────────────────────────────────────────────────────────────
 * Badge
 * ───────────────────────────────────────────────────────────── */

function BadgeContagem({
  contagem,
  dica,
  tom,
}: {
  contagem: Contagem;
  dica: string;
  tom: "acento" | "neutro";
}) {
  if (contagem.estado === "carregando") {
    return (
      <span
        aria-hidden="true"
        className="h-6 w-7 flex-shrink-0 animate-pulse rounded-full bg-western-border-soft"
      />
    );
  }

  // ERRO — e este é o ponto: NÃO some, NÃO vira zero. Fica visível e explica.
  if (contagem.estado === "erro") {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className="inline-flex h-6 w-6 flex-shrink-0 cursor-help items-center justify-center rounded-full bg-status-error/10 text-status-error"
            aria-label={`Não consegui contar ${dica}. Isto é uma falha — não quer dizer zero.`}
          >
            <AlertTriangle className="h-4 w-4" aria-hidden="true" />
          </span>
        </TooltipTrigger>
        <TooltipContent side="right" className="max-w-[280px]">
          <p className="font-semibold">Não consegui contar {dica}.</p>
          <p className="mt-1 opacity-90">{contagem.mensagem}</p>
          <p className="mt-1 opacity-90">É falha de carregamento — não quer dizer que esteja zerado.</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  if (contagem.valor <= 0) return null;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          className={cn(
            "inline-flex h-6 min-w-[24px] flex-shrink-0 cursor-help items-center justify-center rounded-full px-1.5",
            "text-[14px] font-semibold tabular-nums",
            tom === "acento"
              ? "bg-western-gold text-western-green-deep"
              : "bg-western-border-soft text-western-stone-dark",
          )}
        >
          {contagem.valor > 99 ? "99+" : contagem.valor}
        </span>
      </TooltipTrigger>
      <TooltipContent side="right">{dica}</TooltipContent>
    </Tooltip>
  );
}

/* ─────────────────────────────────────────────────────────────
 * Navegação (usada na sidebar fixa E no drawer do mobile)
 * ───────────────────────────────────────────────────────────── */

function Navegacao({
  contagens,
  pathname,
  tab,
  temErro,
  onTentarDeNovo,
  onNavegar,
}: {
  contagens: Record<ChaveContagem, Contagem>;
  pathname: string;
  tab: string | null;
  temErro: boolean;
  onTentarDeNovo: () => void;
  onNavegar?: () => void;
}) {
  return (
    <div className="flex h-full flex-col bg-western-paper">
      <div className="border-b border-western-border-soft px-5 py-5">
        <Link to="/admin" onClick={onNavegar} className="inline-flex items-center" aria-label="Painel Western">
          <img src={logoVerde} alt="Western" className="h-8 w-auto" />
        </Link>
        <p className="text-eyebrow mt-2">Painel</p>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5" aria-label="Seções do painel">
        {GRUPOS.map((grupo) => (
          <div key={grupo.titulo}>
            <p className="text-sublabel px-3 pb-2">{grupo.titulo}</p>
            <ul className="space-y-1">
              {grupo.itens.map((item) => {
                const ativo = item.ativo(pathname, tab);
                const contagem = item.contagem ? contagens[item.contagem] : null;
                return (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      onClick={onNavegar}
                      aria-current={ativo ? "page" : undefined}
                      className={cn(
                        "tap-target relative flex items-center gap-3 rounded-lg py-2 pl-4 pr-3 text-[15px] transition-colors",
                        ativo
                          ? "bg-western-cream font-semibold text-western-green-deep"
                          : "text-western-stone-dark hover:bg-western-cream/60 hover:text-western-green-deep",
                      )}
                    >
                      {ativo && (
                        <span
                          aria-hidden="true"
                          className="absolute bottom-2 left-0 top-2 w-[3px] rounded-r-full bg-western-gold"
                        />
                      )}
                      <item.icone
                        className={cn(
                          "h-[18px] w-[18px] flex-shrink-0",
                          ativo ? "text-western-green-deep" : "text-western-stone-warm",
                        )}
                        aria-hidden="true"
                      />
                      <span className="flex-1 truncate">{item.rotulo}</span>
                      {contagem && item.contagem && (
                        <BadgeContagem
                          contagem={contagem}
                          dica={DICA[item.contagem]}
                          tom={item.tomBadge ?? "neutro"}
                        />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="space-y-1 border-t border-western-border-soft px-3 py-3">
        {temErro && (
          <button
            type="button"
            onClick={onTentarDeNovo}
            className={cn(
              "flex w-full items-start gap-2 rounded-lg px-3 py-2 text-left",
              "text-[14px] font-semibold text-status-error hover:bg-status-error/[0.08] transition-colors",
            )}
          >
            <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
            <span>Algumas contagens não carregaram. Tentar de novo</span>
          </button>
        )}
        <Link
          to="/"
          onClick={onNavegar}
          className="tap-target flex items-center gap-3 rounded-lg px-3 text-[15px] text-western-stone-dark transition-colors hover:bg-western-cream/60 hover:text-western-green-deep"
        >
          <ExternalLink className="h-[18px] w-[18px] flex-shrink-0" aria-hidden="true" />
          Ver a loja
        </Link>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
 * Shell
 * ───────────────────────────────────────────────────────────── */

export default function AdminLayout() {
  const { signOut, user, empresa } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [contagens, setContagens] = useState<Record<ChaveContagem, Contagem>>(CONTAGEM_INICIAL);
  const [drawerAberto, setDrawerAberto] = useState(false);

  const tab = useMemo(() => new URLSearchParams(location.search).get("tab"), [location.search]);

  const carregarContagens = useCallback(async () => {
    const seteDiasAtras = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    // "Novos" = criados depois da última visita à Caixa de entrada (item 5a).
    // Sem visita registrada (primeiro uso neste dispositivo), cai nos 7 dias.
    const desdeLeads = ultimaVisita(user?.id, "leads") ?? seteDiasAtras;
    try {
      const [orc, cred, part, lds] = await Promise.all([
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
          .gte("created_at", desdeLeads),
      ]);

      return {
        orcamentos: paraContagem(orc),
        credenciamentos: paraContagem(cred),
        parceiros: paraContagem(part),
        leads: paraContagem(lds),
      } satisfies Record<ChaveContagem, Contagem>;
    } catch (e) {
      // Rede caiu / sessão morreu: TUDO vira erro, nada vira zero.
      const erro: Contagem = { estado: "erro", mensagem: mensagemDeErro(e) };
      return { orcamentos: erro, credenciamentos: erro, parceiros: erro, leads: erro };
    }
  }, [user?.id]);

  const recarregar = useCallback(async () => {
    const resultado = await carregarContagens();
    setContagens(resultado);
  }, [carregarContagens]);

  useEffect(() => {
    let cancelado = false;
    (async () => {
      const resultado = await carregarContagens();
      if (!cancelado) setContagens(resultado);
    })();
    return () => {
      cancelado = true;
    };
    // Recontar a cada troca de seção (aprovou um credenciamento → o badge cai).
  }, [location.pathname, carregarContagens]);

  // A página marcou a seção como vista → reconta na hora (o badge cai a zero
  // enquanto o dono ainda está na tela, sem esperar a próxima navegação).
  useEffect(() => {
    const aoVer = () => {
      void recarregar();
    };
    window.addEventListener(EVENTO_SECAO_VISTA, aoVer);
    return () => window.removeEventListener(EVENTO_SECAO_VISTA, aoVer);
  }, [recarregar]);

  // Navegou pelo drawer → fecha.
  useEffect(() => {
    setDrawerAberto(false);
  }, [location.pathname, location.search]);

  const temErro = useMemo(
    () => Object.values(contagens).some((c) => c.estado === "erro"),
    [contagens],
  );

  const secaoAtual = useMemo(() => {
    for (const grupo of GRUPOS) {
      const achado = grupo.itens.find((i) => i.ativo(location.pathname, tab));
      if (achado) return achado.rotulo;
    }
    return "Painel";
  }, [location.pathname, tab]);

  const nome = (empresa?.trim() || user?.email?.split("@")[0] || "Administrador").trim();
  const iniciais = nome.slice(0, 2).toUpperCase();

  const sair = async () => {
    await signOut();
    navigate("/", { replace: true });
  };

  const navProps = {
    contagens,
    pathname: location.pathname,
    tab,
    temErro,
    onTentarDeNovo: recarregar,
  };

  return (
    <div className="flex min-h-screen bg-western-ivory text-western-green-deep">
      {/* Sidebar fixa (desktop) */}
      <aside className="sticky top-0 hidden h-screen w-[240px] flex-shrink-0 flex-col border-r border-western-border-soft lg:flex">
        <Navegacao {...navProps} />
      </aside>

      {/* Drawer (mobile / tablet) */}
      <Sheet open={drawerAberto} onOpenChange={setDrawerAberto}>
        <SheetContent
          side="left"
          aria-describedby={undefined}
          className="w-[280px] max-w-[85vw] border-r border-western-border-soft bg-western-paper p-0"
        >
          <SheetTitle className="sr-only">Navegação do painel</SheetTitle>
          <Navegacao {...navProps} onNavegar={() => setDrawerAberto(false)} />
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Cabeçalho do workspace */}
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-western-border-soft bg-western-ivory/95 px-4 py-2.5 backdrop-blur lg:px-8">
          <button
            type="button"
            onClick={() => setDrawerAberto(true)}
            aria-label="Abrir menu"
            className="tap-target -ml-2 inline-flex items-center justify-center rounded-lg text-western-green-deep transition-colors hover:bg-western-paper lg:hidden"
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </button>

          <img src={logoVerde} alt="Western" className="h-7 w-auto lg:hidden" />

          <p className="text-meta hidden min-w-0 truncate lg:block">
            Painel <span className="px-1 text-western-border-strong">/</span>
            <span className="font-semibold text-western-green-deep">{secaoAtual}</span>
          </p>

          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <Link
              to="/"
              className="tap-target hidden items-center gap-2 rounded-lg px-3 text-[15px] text-western-stone-dark transition-colors hover:bg-western-paper hover:text-western-green-deep sm:inline-flex"
            >
              <ExternalLink className="h-[18px] w-[18px]" aria-hidden="true" />
              Ver a loja
            </Link>

            <div
              className="flex items-center gap-2.5 border-western-border-soft pl-0 sm:border-l sm:pl-3"
              title={user?.email ?? undefined}
            >
              <span
                aria-hidden="true"
                className="inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-western-green-deep text-[14px] font-semibold text-western-cream"
              >
                {iniciais}
              </span>
              <div className="hidden min-w-0 leading-tight sm:block">
                <p className="max-w-[180px] truncate text-[15px] font-semibold text-western-green-deep">{nome}</p>
                <p className="max-w-[180px] truncate text-[14px] text-western-stone-warm">
                  {user?.email ?? "Administrador"}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={sair}
              className="tap-target inline-flex items-center justify-center gap-2 rounded-lg border border-western-border-strong px-3 text-[15px] font-semibold text-western-green-deep transition-colors hover:bg-western-paper"
            >
              <LogOut className="h-[18px] w-[18px]" aria-hidden="true" />
              <span className="hidden sm:inline">Sair</span>
              <span className="sr-only sm:hidden">Sair</span>
            </button>
          </div>
        </header>

        {/* Workspace */}
        <main className="min-w-0 flex-1">
          <div className="max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
