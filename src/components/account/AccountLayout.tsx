import { NavLink, Outlet, useLocation, useNavigate, Link } from "react-router-dom";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  LayoutDashboard,
  User,
  ShoppingBag,
  Truck,
  FileStack,
  LogOut,
  ShieldCheck,
  Clock,
  ArrowRight,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { usePartnerPricing } from "@/hooks/usePartnerPricing";
import { supabase } from "@/integrations/supabase/client";
import { TIER_LABEL } from "@/components/admin/adminUtils";
import { EstadoErro, StatusBadge } from "@/components/backoffice";
import { BUSINESS } from "@/config/business";

/**
 * SHELL DA CONTA B2B.
 *
 * O herói NÃO é um menu de perfil: é o CARD DE STATUS DO CREDENCIAMENTO.
 *   pendente  → sala de espera com o próximo passo explícito
 *   aprovado  → cockpit: "preço de atacado liberado" + nível e desconto reais
 *
 * Os 4 estados valem aqui também: carregando · vazio · ERRO · sucesso.
 * `useAuth` engole o erro do perfil (ver relato) — então o shell relê
 * `partner_profiles` GUARDANDO O ERRO. Assim um 403 vira um card de erro com
 * "Tentar de novo", nunca um silencioso "cadastro não localizado".
 */

// Itens visíveis no menu do cliente. A lógica de tier/desconto/orçamentos/
// sketches/favoritos/amostras/preferências continua existindo (rotas ativas e
// tabelas intocadas) — apenas escondemos do menu enquanto o foco é o pedido.
const items = [
  { to: "/minha-conta", label: "Visão geral", icon: LayoutDashboard, end: true },
  { to: "/minha-conta/pedidos", label: "Meus pedidos", icon: ShoppingBag },
  { to: "/minha-conta/rastreio", label: "Rastreio", icon: Truck },
  { to: "/minha-conta/composicoes", label: "Composições", icon: FileStack },
  { to: "/minha-conta/perfil", label: "Meu perfil", icon: User },
];

interface PerfilRow {
  status: string | null;
  pending_reason: string | null;
}

type Situacao =
  | "carregando"
  | "erro"
  | "admin"
  | "aprovado"
  | "pendente"
  | "bloqueado"
  | "sem-cadastro";

const waComercial = `https://wa.me/${BUSINESS.whatsappFabrica}?text=${encodeURIComponent(
  "Olá! Quero falar sobre o meu credenciamento de parceiro na Western.",
)}`;

export default function AccountLayout() {
  const { empresa, user, isAdmin, partnerStatus, loading: authLoading, refresh, signOut } = useAuth();
  const pricing = usePartnerPricing();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const navRef = useRef<HTMLElement>(null);

  const [perfil, setPerfil] = useState<PerfilRow | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<unknown>(null);

  const carregarPerfil = useCallback(async () => {
    if (!user) {
      setPerfil(null);
      setCarregando(false);
      return;
    }
    setCarregando(true);
    setErro(null);
    const { data, error } = await supabase
      .from("partner_profiles")
      .select("status, pending_reason")
      .eq("user_id", user.id)
      .maybeSingle();

    // O erro é GUARDADO. Sem isto, um 403 de RLS viraria "sem cadastro" e o
    // parceiro seria mandado se cadastrar de novo por causa de uma falha nossa.
    if (error) setErro(error);
    else setPerfil((data as PerfilRow | null) ?? null);
    setCarregando(false);
  }, [user]);

  useEffect(() => {
    void carregarPerfil();
  }, [carregarPerfil]);

  const tentarDeNovo = useCallback(async () => {
    await Promise.all([carregarPerfil(), refresh()]);
  }, [carregarPerfil, refresh]);

  // Em mobile (nav horizontal), traz o item ativo para o viewport
  useEffect(() => {
    const el = navRef.current?.querySelector<HTMLAnchorElement>("a[aria-current='page']");
    el?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [pathname]);

  // Status vindo do banco; se a leitura ainda não voltou, cai no que o useAuth
  // já sabe (mesma fonte, partner_profiles.status).
  const status = perfil?.status ?? (carregando ? partnerStatus : null);

  const situacao: Situacao = (() => {
    if (erro) return "erro";
    if (authLoading || carregando) return "carregando";
    if (isAdmin) return "admin";
    if (status === "approved") return "aprovado";
    if (status === "pending") return "pendente";
    if (status === "rejected" || status === "cancelled") return "bloqueado";
    return "sem-cadastro";
  })();

  const naIndex = pathname === "/minha-conta" || pathname === "/minha-conta/";
  const nome = empresa || user?.email?.split("@")[0] || "Minha conta";

  return (
    <div className="surface-ivory min-h-[80vh]">
      <div className="container-western py-8 md:py-12">
        {/* ── Cabeçalho: quem é, em que nível está, e a saída ── */}
        <header className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            <p className="text-eyebrow mb-2">Minha conta</p>
            <h1 className="display-lg text-western-green-deep break-words">{nome}</h1>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              {situacao === "erro" ? null : situacao === "carregando" ? (
                <ChipEsqueleto />
              ) : situacao === "admin" ? (
                <StatusBadge status="admin" label="Administrador" tom="info" />
              ) : situacao === "sem-cadastro" ? (
                <StatusBadge status="sem_cadastro" label="Cadastro não localizado" tom="aviso" />
              ) : (
                <StatusBadge status={status} />
              )}

              {/* Nível e desconto só aparecem para quem está aprovado — e só
                  quando o valor REAL chegou. Nunca um número de enfeite. */}
              {situacao === "aprovado" &&
                (pricing.loading ? (
                  <ChipEsqueleto />
                ) : (
                  <>
                    <Chip>{TIER_LABEL[pricing.tier]}</Chip>
                    <Chip destaque>
                      <span className="tabular-nums">{pricing.discountPct}%</span> de desconto
                    </Chip>
                  </>
                ))}
            </div>
          </div>

          <button
            type="button"
            onClick={async () => {
              await signOut();
              navigate("/", { replace: true });
            }}
            className="tap-target inline-flex flex-shrink-0 items-center gap-2 self-start rounded-[10px] px-4 text-[16px] font-semibold text-western-stone-warm transition-colors hover:text-[#B3372E]"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" /> Sair
          </button>
        </header>

        {/* ── HERÓI: o card de credenciamento ──
            Na visão geral ele aparece inteiro. Nas telas internas ele encolhe
            para uma faixa — mas um erro ou uma pendência NUNCA somem. */}
        <div className="mt-8">
          {situacao === "erro" ? (
            <EstadoErro
              erro={erro}
              onRetry={tentarDeNovo}
              titulo="Não consegui carregar seu credenciamento"
              compacto={!naIndex}
            />
          ) : situacao === "carregando" ? (
            naIndex ? <HeroEsqueleto /> : null
          ) : naIndex ? (
            <Hero situacao={situacao} perfil={perfil} pricing={pricing} />
          ) : situacao !== "aprovado" && situacao !== "admin" ? (
            <FaixaStatus situacao={situacao} />
          ) : null}
        </div>

        {/* ── Navegação + conteúdo ── */}
        <div className="mt-10 flex flex-col gap-8 md:flex-row lg:gap-12">
          <aside className="flex-shrink-0 md:w-60">
            <nav
              ref={navRef}
              aria-label="Seções da conta"
              className="-mx-2 flex gap-2 overflow-x-auto scroll-smooth px-2 pb-2 md:mx-0 md:flex-col md:gap-1 md:overflow-visible md:px-0 md:pb-0"
            >
              {items.map((it) => (
                <NavLink
                  key={it.to}
                  to={it.to}
                  end={it.end}
                  className={({ isActive }) =>
                    `tap-target flex-shrink-0 inline-flex items-center gap-3 whitespace-nowrap rounded-[10px] border px-4 text-[16px] transition-colors md:w-full ${
                      isActive
                        ? "border-western-border-soft bg-white font-semibold text-western-green-deep"
                        : "border-transparent text-western-stone-warm hover:bg-western-paper hover:text-western-green-deep"
                    }`
                  }
                >
                  <it.icon className="h-4 w-4 flex-shrink-0" aria-hidden="true" /> {it.label}
                </NavLink>
              ))}
            </nav>
          </aside>

          <main className="min-w-0 flex-1">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
 * O herói
 * ───────────────────────────────────────────────────────────── */

interface HeroProps {
  situacao: Situacao;
  perfil: PerfilRow | null;
  pricing: ReturnType<typeof usePartnerPricing>;
}

function Hero({ situacao, perfil, pricing }: HeroProps) {
  /* APROVADO — cockpit. O que ele ganhou, quanto, e para onde ir agora. */
  if (situacao === "aprovado") {
    const { boleto, parcelas_max, kit_gratis } = pricing.paymentMethods;
    return (
      <Card tom="positivo">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <p className="inline-flex items-center gap-2 text-[14px] font-semibold text-[#2E7D4F]">
              <ShieldCheck className="h-4 w-4" aria-hidden="true" /> Credenciamento aprovado
            </p>
            <h2 className="display-md mt-2 text-western-green-deep">Preço de atacado liberado</h2>
            <p className="text-body mt-2 max-w-xl">
              Você vê o preço de parceiro em todo o catálogo, com o desconto do seu nível.
            </p>
          </div>

          <div className="flex flex-shrink-0 flex-col gap-6 sm:flex-row sm:items-end sm:gap-10">
            {pricing.loading ? (
              <div className="h-12 w-40 animate-pulse rounded-[10px] bg-western-border-soft" />
            ) : (
              <>
                <Dado rotulo="Seu nível">{TIER_LABEL[pricing.tier]}</Dado>
                <Dado rotulo="Desconto de parceiro" numerico>
                  {pricing.discountPct}%
                </Dado>
                <Dado rotulo="Pagamento">
                  <span className="tabular-nums">
                    {parcelas_max > 1 ? `Em até ${parcelas_max}x` : "À vista"}
                  </span>
                  {boleto ? " · boleto" : ""}
                  {kit_gratis ? " · kit cortesia" : ""}
                </Dado>
              </>
            )}
          </div>
        </div>

        <div className="mt-8">
          <Link to="/produtos" className="btn-primary">
            Comprar com meu preço <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </Card>
    );
  }

  /* PENDENTE — sala de espera. Um próximo passo explícito, não um "aguarde". */
  if (situacao === "pendente") {
    const motivo = perfil?.pending_reason;
    return (
      <Card tom="aviso">
        <p className="inline-flex items-center gap-2 text-[14px] font-semibold text-[#9C6812]">
          <Clock className="h-4 w-4" aria-hidden="true" />
          {motivo ? "Cadastro em reanálise" : "Credenciamento em análise"}
        </p>
        <h2 className="display-md mt-2 text-western-green-deep">
          {motivo ? "Falta um ajuste no seu cadastro" : "Seu cadastro está com o comercial"}
        </h2>

        <div className="mt-5 max-w-2xl">
          <p className="text-body font-semibold text-western-green-deep">Próximo passo</p>
          {motivo ? (
            <p className="text-body mt-1">{motivo}</p>
          ) : (
            <p className="text-body mt-1">
              Confira se seus dados estão completos — CNPJ, telefone e endereço são o que a equipe
              usa para liberar o preço de atacado. Avisamos por e-mail assim que o credenciamento
              for aprovado.
            </p>
          )}
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link to="/minha-conta/perfil" className="btn-primary">
            Revisar meus dados
          </Link>
          <a href={waComercial} target="_blank" rel="noopener noreferrer" className="btn-outline-forest">
            Falar com o comercial
          </a>
        </div>

        <p className="text-meta mt-5">
          Enquanto isso o catálogo continua aberto — só os preços de parceiro é que ficam ocultos.
        </p>
      </Card>
    );
  }

  /* RECUSADO / CANCELADO */
  if (situacao === "bloqueado") {
    return (
      <Card tom="negativo">
        <p className="text-[14px] font-semibold text-[#B3372E]">
          {perfil?.status === "cancelled" ? "Credenciamento cancelado" : "Credenciamento não aprovado"}
        </p>
        <h2 className="display-md mt-2 text-western-green-deep">
          O preço de atacado está suspenso
        </h2>
        <p className="text-body mt-3 max-w-2xl">
          {perfil?.pending_reason ||
            "A equipe comercial pode revisar essa decisão — normalmente é um dado de cadastro que não conferiu."}
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <a href={waComercial} target="_blank" rel="noopener noreferrer" className="btn-primary">
            Falar com o comercial
          </a>
          <a href={`mailto:${BUSINESS.emailComercial}`} className="btn-outline-forest">
            {BUSINESS.emailComercial}
          </a>
        </div>
      </Card>
    );
  }

  /* ADMIN — não é parceiro; não invento nível nem desconto para ele. */
  if (situacao === "admin") {
    return (
      <Card tom="neutro">
        <p className="inline-flex items-center gap-2 text-[14px] font-semibold text-western-bronze">
          <ShieldCheck className="h-4 w-4" aria-hidden="true" /> Acesso administrativo
        </p>
        <h2 className="display-md mt-2 text-western-green-deep">Você está na conta do parceiro</h2>
        <p className="text-body mt-2 max-w-2xl">
          Esta é a visão do comprador. A operação — credenciamentos, pedidos e orçamentos — fica no
          painel.
        </p>
        <div className="mt-8">
          <Link to="/admin" className="btn-primary">
            Ir para o painel <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </Card>
    );
  }

  /* SEM CADASTRO — a leitura FUNCIONOU e não há linha. Isto não é erro (o erro
     tem tela própria); é um cadastro que nunca foi enviado. */
  return (
    <Card tom="aviso">
      <p className="text-[14px] font-semibold text-[#9C6812]">Cadastro não localizado</p>
      <h2 className="display-md mt-2 text-western-green-deep">
        Falta enviar seu credenciamento B2B
      </h2>
      <p className="text-body mt-3 max-w-2xl">
        Sua conta de acesso existe, mas não encontramos um cadastro de parceiro ligado a ela. É o
        cadastro que libera o preço de atacado.
      </p>
      <div className="mt-8">
        <Link to="/parceiro/cadastro" className="btn-primary">
          Enviar cadastro de parceiro
        </Link>
      </div>
    </Card>
  );
}

/** Versão de uma linha do herói, para as telas internas. */
function FaixaStatus({ situacao }: { situacao: Situacao }) {
  const texto: Record<string, string> = {
    pendente: "Credenciamento em análise — os preços de parceiro ainda não estão liberados.",
    bloqueado: "Credenciamento suspenso — os preços de parceiro estão ocultos.",
    "sem-cadastro": "Sem cadastro de parceiro — os preços de atacado não estão liberados.",
  };
  const tom = situacao === "bloqueado" ? "#B3372E" : "#9C6812";

  return (
    <Link
      to="/minha-conta"
      className="flex items-center justify-between gap-4 rounded-[10px] border px-4 py-3 transition-colors hover:bg-western-paper"
      style={{ borderColor: `${tom}55`, backgroundColor: `${tom}0F` }}
    >
      <span className="text-[16px] font-semibold" style={{ color: tom }}>
        {texto[situacao]}
      </span>
      <ArrowRight className="h-4 w-4 flex-shrink-0" style={{ color: tom }} aria-hidden="true" />
    </Link>
  );
}

/* ─────────────────────────────────────────────────────────────
 * Peças
 * ───────────────────────────────────────────────────────────── */

const TOM_CARD: Record<string, string> = {
  positivo: "border-[#2E7D4F]/30 bg-[#2E7D4F]/[0.05]",
  aviso: "border-[#9C6812]/30 bg-[#9C6812]/[0.05]",
  negativo: "border-[#B3372E]/30 bg-[#B3372E]/[0.05]",
  neutro: "border-western-border-soft bg-white",
};

function Card({ tom, children }: { tom: keyof typeof TOM_CARD; children: React.ReactNode }) {
  return <section className={`rounded-[16px] border p-6 md:p-8 ${TOM_CARD[tom]}`}>{children}</section>;
}

function Dado({
  rotulo,
  numerico,
  children,
}: {
  rotulo: string;
  numerico?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0">
      <p className="text-eyebrow mb-1">{rotulo}</p>
      <p
        className={`text-[20px] font-semibold leading-tight text-western-green-deep ${
          numerico ? "tabular-nums" : ""
        }`}
      >
        {children}
      </p>
    </div>
  );
}

function Chip({ children, destaque }: { children: React.ReactNode; destaque?: boolean }) {
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-[6px] border px-2.5 py-1 text-[14px] font-semibold leading-none ${
        destaque
          ? "border-western-gold/50 bg-western-gold/10 text-western-green-deep"
          : "border-western-border-strong bg-western-paper text-western-stone-warm"
      }`}
    >
      {children}
    </span>
  );
}

function ChipEsqueleto() {
  return <span className="inline-block h-7 w-32 animate-pulse rounded-[6px] bg-western-border-soft" />;
}

function HeroEsqueleto() {
  return (
    <div
      className="rounded-[16px] border border-western-border-soft bg-white p-6 md:p-8"
      aria-busy="true"
      aria-live="polite"
    >
      <span className="sr-only">Carregando seu credenciamento…</span>
      <div className="h-4 w-40 animate-pulse rounded-[6px] bg-western-border-soft" />
      <div className="mt-4 h-8 w-72 max-w-full animate-pulse rounded-[6px] bg-western-border-soft/80" />
      <div className="mt-4 h-4 w-full max-w-md animate-pulse rounded-[6px] bg-western-border-soft/60" />
      <div className="mt-8 h-[52px] w-52 animate-pulse rounded-[10px] bg-western-border-soft/70" />
    </div>
  );
}
