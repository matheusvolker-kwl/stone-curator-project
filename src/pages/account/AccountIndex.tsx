import { Link, useNavigate } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Boxes,
  ClipboardList,
  Clock,
  FileText,
  LifeBuoy,
  PackageCheck,
  ShieldCheck,
  ShoppingBag,
  Settings,
  Truck,
  XCircle,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { usePartnerPricing } from "@/hooks/usePartnerPricing";
import { TIER_LABEL, type Tier } from "@/components/admin/adminUtils";
import { supabase } from "@/integrations/supabase/client";
import {
  CelulaData,
  DataTable,
  PageHeader,
  StatusBadge,
  type Coluna,
} from "@/components/backoffice";

/**
 * COCKPIT DO COMPRADOR B2B — não é "perfil de varejo".
 *
 * A ordem responde ao que o parceiro pergunta, nesta sequência:
 *   1. HERÓI: em que pé está meu credenciamento? (pendente = sala de espera com o
 *      próximo passo explícito · aprovado = preço liberado, com tier e % reais)
 *   2. Minhas filas: pedidos, rastreio, composições, orçamentos salvos.
 *   3. Repetir compra: reduzir fricção para o próximo pedido.
 *
 * OS 4 ESTADOS: carregando · vazio · ERRO · sucesso.
 * A query guarda o `error` e o entrega ao <DataTable/>. Os tiles NUNCA mostram
 * "0" quando a busca falhou ou ainda está carregando — mostram "—". Um zero
 * inventado é pior que nenhum número: faz o parceiro achar que não tem nada.
 */

interface OrderRow {
  id: string;
  numero: string;
  titulo: string;
  status: string;
  previsao_entrega: string | null;
}

/** Status de pedido que ainda exigem acompanhamento. */
const ACTIVE_STATUS = ["aguardando", "em_producao", "controle_qualidade", "pronto", "em_transporte"];
/** Já saiu do ateliê / está a caminho — é o que o rastreio mostra. */
const A_CAMINHO_STATUS = ["pronto", "em_transporte"];

interface Contagens {
  ativos: number;
  aCaminho: number;
  composicoes: number;
  orcamentos: number;
}

export default function AccountIndex() {
  const { user, partnerStatus, isAdmin, empresa } = useAuth();
  const navigate = useNavigate();

  const [pedidosAtivos, setPedidosAtivos] = useState<OrderRow[]>([]);
  const [totalPedidos, setTotalPedidos] = useState(0);
  const [contagens, setContagens] = useState<Contagens | null>(null);
  const [pendingReason, setPendingReason] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<unknown>(null);

  const carregar = useCallback(async () => {
    if (!user) return;
    setCarregando(true);
    setErro(null);

    const [pedidosRes, composicoesRes, orcamentosRes, perfilRes] = await Promise.all([
      supabase
        .from("production_orders")
        .select("id, numero, titulo, status, previsao_entrega")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("leads")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("type", "orcamento"),
      supabase
        .from("quote_pdfs")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id),
      supabase.from("partner_profiles").select("pending_reason").eq("user_id", user.id).maybeSingle(),
    ]);

    // Guardamos o PRIMEIRO erro real. Sem isto, um 403 de RLS viraria uma tela
    // "você não tem nenhum pedido" — e o parceiro fica cego achando que sumiu tudo.
    const falha =
      pedidosRes.error ?? composicoesRes.error ?? orcamentosRes.error ?? perfilRes.error ?? null;

    if (falha) {
      setErro(falha);
      setContagens(null);
      setPedidosAtivos([]);
      setCarregando(false);
      return;
    }

    const todos = (pedidosRes.data as OrderRow[] | null) ?? [];
    const ativos = todos.filter((p) => ACTIVE_STATUS.includes(p.status));

    setTotalPedidos(todos.length);
    setPedidosAtivos(ativos.slice(0, 5));
    setContagens({
      ativos: ativos.length,
      aCaminho: todos.filter((p) => A_CAMINHO_STATUS.includes(p.status)).length,
      composicoes: composicoesRes.count ?? 0,
      orcamentos: orcamentosRes.count ?? 0,
    });
    setPendingReason(
      (perfilRes.data as { pending_reason: string | null } | null)?.pending_reason ?? null,
    );
    setCarregando(false);
  }, [user]);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  const colunas: ReadonlyArray<Coluna<OrderRow>> = [
    {
      key: "numero",
      header: "Pedido",
      render: (p) => <span className="font-semibold text-western-green-deep">Nº {p.numero}</span>,
      numerica: true,
      sortable: true,
      width: "140px",
    },
    {
      key: "titulo",
      header: "Descrição",
      render: (p) => p.titulo,
      sortable: true,
      principalNoMobile: true,
    },
    {
      key: "status",
      header: "Etapa",
      render: (p) => <StatusBadge status={p.status} />,
      sortable: true,
      width: "200px",
    },
    {
      key: "previsao_entrega",
      header: "Previsão",
      render: (p) => <CelulaData valor={p.previsao_entrega} />,
      align: "right",
      sortable: true,
      sortValue: (p) => p.previsao_entrega,
      width: "160px",
    },
  ];

  const primeiroNome = empresa?.split(" ")[0] ?? user?.email?.split("@")[0] ?? "parceiro";
  const numeroOuTraco = (n: number | undefined) =>
    contagens && !carregando && !erro && n !== undefined ? String(n) : "—";

  return (
    <div className="space-y-10">
      <PageHeader eyebrow="Visão geral" titulo={`Olá, ${primeiroNome}.`} className="mb-0" />

      {/* O HERÓI DO CREDENCIAMENTO VIVE NO SHELL (AccountLayout), não aqui:
          ele precisa aparecer em TODA tela da conta (cheio na visão geral,
          faixa fina nas outras). Renderizá-lo aqui também mostrava a mesma
          informação duas vezes em /minha-conta. */}

      {/* ── Minhas filas ─────────────────────────────────────────────── */}
      <section aria-labelledby="filas-titulo">
        <h2 id="filas-titulo" className="text-eyebrow mb-4">
          Onde estão minhas coisas
        </h2>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
          <Tile
            to="/minha-conta/pedidos"
            icone={ShoppingBag}
            rotulo="Pedidos em andamento"
            valor={numeroOuTraco(contagens?.ativos)}
          />
          <Tile
            to="/minha-conta/rastreio"
            icone={Truck}
            rotulo="Prontos e a caminho"
            valor={numeroOuTraco(contagens?.aCaminho)}
          />
          <Tile
            to="/minha-conta/orcamentos"
            icone={FileText}
            rotulo="Meus orçamentos"
            valor={numeroOuTraco(contagens?.composicoes)}
          />
        </div>
      </section>

      {/* ── 3. Pedidos em produção (a mesma tabela do admin, os mesmos 4 estados) ── */}
      <section aria-labelledby="pedidos-titulo">
        <div className="mb-4 flex items-baseline justify-between gap-4">
          <h2 id="pedidos-titulo" className="text-eyebrow">
            Pedidos em produção
          </h2>
          {totalPedidos > 0 && !erro && (
            <Link
              to="/minha-conta/pedidos"
              className="inline-flex items-center gap-1 text-[15px] font-semibold text-western-green-deep hover:text-western-cta transition-colors"
            >
              Ver todos
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          )}
        </div>

        <DataTable
          linhas={pedidosAtivos}
          colunas={colunas}
          getId={(p) => p.id}
          isLoading={carregando}
          error={erro}
          onRetry={carregar}
          onRowClick={() => navigate("/minha-conta/pedidos")}
          vazio={{
            titulo: totalPedidos > 0 ? "Nenhum pedido em produção agora" : "Você ainda não tem pedidos",
            mensagem:
              totalPedidos > 0
                ? "Todos os seus pedidos já foram concluídos. O histórico completo fica em Meus pedidos."
                : "Monte uma composição e envie para orçamento — o pedido aparece aqui assim que entrar na produção.",
            acao:
              totalPedidos > 0 ? (
                <Link to="/minha-conta/pedidos" className="btn-outline-forest">
                  Ver histórico
                </Link>
              ) : (
                <Link to="/guia-de-composicao" className="btn-outline-forest">
                  Abrir o guia de composição
                </Link>
              ),
          }}
        />
      </section>

      {/* ── 4. Repetir compra: tirar fricção do próximo pedido ───────── */}
      <section aria-labelledby="atalhos-titulo">
        <h2 id="atalhos-titulo" className="text-eyebrow mb-4">
          Fazer um novo pedido
        </h2>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <Atalho
            to="/produtos"
            icone={Boxes}
            titulo="Catálogo de peças"
            descricao="Escolher peças e conjuntos, com o seu preço já aplicado."
          />
          <Atalho
            to="/guia-de-composicao"
            icone={ClipboardList}
            titulo="Guia de composição"
            descricao="Montar uma composição do zero e enviar para orçamento."
          />
          <Atalho
            to="/minha-conta/orcamentos"
            icone={FileText}
            titulo="Reaproveitar um orçamento"
            descricao="Baixar o PDF de uma composição anterior e pedir de novo."
          />
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2">
          <Link
            to="/minha-conta/perfil"
            className="tap-target inline-flex items-center gap-2 text-[15px] font-semibold text-western-stone-warm hover:text-western-green-deep transition-colors"
          >
            <ClipboardList className="h-4 w-4" aria-hidden="true" />
            Dados da empresa
          </Link>
          <Link
            to="/minha-conta/preferencias"
            className="tap-target inline-flex items-center gap-2 text-[15px] font-semibold text-western-stone-warm hover:text-western-green-deep transition-colors"
          >
            <Settings className="h-4 w-4" aria-hidden="true" />
            Configurações da conta
          </Link>
          <Link
            to="/contato"
            className="tap-target inline-flex items-center gap-2 text-[15px] font-semibold text-western-stone-warm hover:text-western-green-deep transition-colors"
          >
            <LifeBuoy className="h-4 w-4" aria-hidden="true" />
            Falar com a equipe
          </Link>
        </div>
      </section>
    </div>
  );
}

/* ═════════════════════════════════════════════════════════════════════
 * HERÓI — o card de status do credenciamento
 * ═══════════════════════════════════════════════════════════════════ */

function HeroCredenciamento({
  partnerStatus,
  isAdmin,
  pendingReason,
}: {
  partnerStatus: "pending" | "approved" | "rejected" | null;
  isAdmin: boolean;
  pendingReason: string | null;
}) {
  // O enum do banco (partner_status) tem `cancelled`, que o tipo do useAuth não
  // declara. Alargamos aqui para a conta cancelada não cair, silenciosamente,
  // na tela de "em análise" — que seria uma mentira.
  const status = partnerStatus as string | null;

  if (isAdmin) return <HeroAdmin />;
  if (status === "approved") return <HeroAprovado />;
  if (status === "rejected") return <HeroRecusado />;
  if (status === "cancelled") return <HeroCancelado />;
  return <HeroPendente pendingReason={pendingReason} />;
}

/** Aprovado = cockpit. O que ele ganhou tem que estar VISÍVEL: tier e % reais. */
function HeroAprovado() {
  const { tier, discountPct, paymentMethods, loading } = usePartnerPricing();

  const vantagens = [
    paymentMethods.boleto ? "Boleto liberado" : null,
    paymentMethods.parcelas_max > 1 ? `Até ${paymentMethods.parcelas_max}x sem juros` : null,
    paymentMethods.kit_gratis ? "Kit de amostras por nossa conta" : null,
  ].filter((v): v is string => v !== null);

  return (
    <section className="surface-forest rounded-xl p-6 md:p-8">
      <p className="text-[14px] font-semibold uppercase tracking-[0.06em] text-western-gold">
        Credenciamento
      </p>

      <div className="mt-3 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <h2 className="display-md flex items-center gap-2.5 text-western-cream">
            <BadgeCheck className="h-6 w-6 flex-shrink-0 text-western-gold" aria-hidden="true" />
            Preço de parceiro liberado
          </h2>

          {loading ? (
            <div className="mt-5 h-6 w-64 animate-pulse rounded-sm bg-western-cream/15" />
          ) : (
            <div className="mt-5 flex flex-wrap items-center gap-x-8 gap-y-4">
              {/* O nivel so aparece para quem TEM um acima do basico.
                  Dizer "Parceiro Padrao" a quem esta na entrada revela que ha
                  categorias melhores que ele nao tem — informacao que nao ajuda
                  ele e enfraquece a proposta. Para Vitrine e Partner, o nome do
                  plano E o beneficio, e a condicao ja vem aplicada no preco. */}
              {tier !== "padrao" && (
                <div>
                  <p className="text-[14px] font-semibold uppercase tracking-[0.06em] text-western-cream/60">
                    Seu plano
                  </p>
                  <p className="mt-1 text-[18px] font-semibold text-western-cream">
                    {TIER_LABEL[tier as Tier] ?? tier}
                  </p>
                </div>
              )}

              <div>
                <p className="text-[14px] font-semibold uppercase tracking-[0.06em] text-western-cream/60">
                  Sua condição
                </p>
                {/* Sem percentual: a regra de 29/08 tornou os descontos nao
                    redondos, e o parceiro nao precisa da mecanica — ele precisa
                    do preco, que ja aparece descontado em toda a loja. */}
                <p className="mt-1 text-[18px] font-semibold text-western-gold">
                  {tier === "padrao"
                    ? "Preço de atacado em toda a linha"
                    : "Condição aplicada em toda a linha"}
                </p>
              </div>
            </div>
          )}

          {!loading && vantagens.length > 0 && (
            <ul className="mt-5 flex flex-wrap gap-2">
              {vantagens.map((v) => (
                <li
                  key={v}
                  className="rounded-sm border border-western-cream/25 px-2.5 py-1 text-[14px] font-semibold text-western-cream/90"
                >
                  {v}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Dourado sobre verde: é exatamente onde o acento pode virar botão. */}
        <Link to="/produtos" className="btn-gold flex-shrink-0">
          Ver catálogo com o seu preço
        </Link>
      </div>

      <p className="mt-6 border-t border-western-cream/15 pt-4 text-[15px] leading-[1.5] text-western-cream/70">
        Condições comerciais completas na{" "}
        <Link to="/politica-comercial" className="font-semibold text-western-cream underline underline-offset-4">
          política comercial
        </Link>
        .
      </p>
    </section>
  );
}

/**
 * Pendente = SALA DE ESPERA, com o próximo passo explícito.
 * Se o admin escreveu um motivo, ele vira a tarefa do parceiro — e a ação
 * primária deixa de ser "circule pelo site" e passa a ser "corrija seus dados".
 */
function HeroPendente({ pendingReason }: { pendingReason: string | null }) {
  const precisaAgir = !!pendingReason;

  return (
    <section className="rounded-xl border border-status-warning/35 bg-status-warning/[0.06] p-6 md:p-8">
      <p className="text-[14px] font-semibold uppercase tracking-[0.06em] text-status-warning">
        Credenciamento
      </p>

      <h2 className="display-md mt-3 flex items-center gap-2.5 text-western-green-deep">
        <Clock className="h-6 w-6 flex-shrink-0 text-status-warning" aria-hidden="true" />
        {precisaAgir ? "Precisamos de um ajuste no seu cadastro" : "Cadastro em análise"}
      </h2>

      {precisaAgir ? (
        <div className="mt-5 rounded-lg border border-status-warning/30 bg-white px-4 py-3">
          <p className="text-[14px] font-semibold uppercase tracking-[0.06em] text-status-warning">
            O que falta
          </p>
          <p className="mt-1.5 text-[16px] leading-[1.6] text-western-stone-dark">{pendingReason}</p>
        </div>
      ) : (
        <p className="text-body mt-3 max-w-2xl">
          Nossa equipe está conferindo os dados da sua empresa. Assim que o credenciamento sair, o
          preço de parceiro aparece automaticamente em todo o catálogo — avisamos por e-mail.
          Normalmente leva até 1 dia útil.
        </p>
      )}

      <ol className="mt-6 flex flex-col gap-3 sm:flex-row sm:gap-6">
        <PassoCredenciamento numero={1} rotulo="Cadastro enviado" estado="feito" />
        <PassoCredenciamento
          numero={2}
          rotulo={precisaAgir ? "Aguardando sua correção" : "Em análise pela equipe"}
          estado="atual"
        />
        <PassoCredenciamento numero={3} rotulo="Preço de parceiro liberado" estado="futuro" />
      </ol>

      <div className="mt-7 flex flex-wrap items-center gap-3">
        {precisaAgir ? (
          <Link to="/minha-conta/perfil" className="btn-primary">
            Revisar meus dados
          </Link>
        ) : (
          <Link to="/guia-de-composicao" className="btn-primary">
            Montar uma composição enquanto isso
          </Link>
        )}
        <Link to="/contato" className="btn-outline-forest">
          Falar com a equipe
        </Link>
      </div>

      <p className="text-meta mt-5">
        Você já pode navegar pelo catálogo e montar composições. Só os preços de atacado ficam
        reservados até a aprovação.
      </p>
    </section>
  );
}

function HeroRecusado() {
  return (
    <section className="rounded-xl border border-status-error/35 bg-status-error/[0.06] p-6 md:p-8">
      <p className="text-[14px] font-semibold uppercase tracking-[0.06em] text-status-error">
        Credenciamento
      </p>

      <h2 className="display-md mt-3 flex items-center gap-2.5 text-western-green-deep">
        <XCircle className="h-6 w-6 flex-shrink-0 text-status-error" aria-hidden="true" />
        Credenciamento não aprovado
      </h2>

      <p className="text-body mt-3 max-w-2xl">
        O credenciamento B2B é reservado a empresas do setor (paisagismo, piscinas, construção,
        arquitetura). Se houve um engano — ou se os dados da sua empresa mudaram — fale com a gente:
        revisamos caso a caso.
      </p>

      <div className="mt-7 flex flex-wrap items-center gap-3">
        <Link to="/contato" className="btn-primary">
          Pedir uma revisão
        </Link>
        <Link to="/minha-conta/perfil" className="btn-outline-forest">
          Corrigir dados da empresa
        </Link>
      </div>
    </section>
  );
}

function HeroCancelado() {
  return (
    <section className="rounded-xl border border-western-border-strong bg-western-paper p-6 md:p-8">
      <p className="text-eyebrow">Credenciamento</p>

      <h2 className="display-md mt-3 text-western-green-deep">Conta cancelada</h2>

      <p className="text-body mt-3 max-w-2xl">
        Esta conta foi cancelada a seu pedido. O histórico continua guardado, mas o preço de parceiro
        está suspenso. Para reativar, fale com a equipe.
      </p>

      <div className="mt-7">
        <Link to="/contato" className="btn-primary">
          Quero reativar minha conta
        </Link>
      </div>
    </section>
  );
}

function HeroAdmin() {
  return (
    <section className="surface-forest rounded-xl p-6 md:p-8">
      <p className="text-[14px] font-semibold uppercase tracking-[0.06em] text-western-gold">
        Acesso interno
      </p>

      <div className="mt-3 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="display-md flex items-center gap-2.5 text-western-cream">
            <ShieldCheck className="h-6 w-6 flex-shrink-0 text-western-gold" aria-hidden="true" />
            Você é administrador
          </h2>
          <p className="mt-2 text-[16px] leading-[1.6] text-western-cream/75">
            Esta é a visão do parceiro. A operação — credenciamentos, pedidos e orçamentos — fica no
            painel administrativo.
          </p>
        </div>

        <Link to="/admin" className="btn-gold flex-shrink-0">
          Abrir o painel
        </Link>
      </div>
    </section>
  );
}

function PassoCredenciamento({
  numero,
  rotulo,
  estado,
}: {
  numero: number;
  rotulo: string;
  estado: "feito" | "atual" | "futuro";
}) {
  const bolha = {
    feito: "border-status-success/40 bg-status-success/10 text-status-success",
    atual: "border-status-warning bg-status-warning text-white",
    futuro: "border-western-border-strong bg-white text-western-stone-warm",
  }[estado];

  const texto = {
    feito: "text-western-stone-warm",
    atual: "text-western-green-deep font-semibold",
    futuro: "text-western-stone-warm/70",
  }[estado];

  return (
    <li className="flex items-center gap-2.5">
      <span
        aria-hidden="true"
        className={`inline-flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border text-[14px] font-semibold tabular-nums ${bolha}`}
      >
        {estado === "feito" ? <PackageCheck className="h-4 w-4" /> : numero}
      </span>
      <span className={`text-[15px] ${texto}`}>{rotulo}</span>
    </li>
  );
}

/* ═════════════════════════════════════════════════════════════════════
 * Tiles-fila e atalhos
 * ═══════════════════════════════════════════════════════════════════ */

/**
 * Tile-FILA, não KPI decorativo: cada um é um link para a lista já certa.
 * `valor` chega como "—" quando ainda não sabemos (carregando ou erro).
 * Nunca "0" — zero é uma afirmação, e afirmar sem saber foi o que cegou o dono
 * no painel antigo.
 */
function Tile({
  to,
  icone: Icone,
  rotulo,
  valor,
}: {
  to: string;
  icone: React.ElementType;
  rotulo: string;
  valor: string;
}) {
  const desconhecido = valor === "—";

  return (
    <Link
      to={to}
      className="tap-target group flex flex-col justify-between rounded-xl border border-western-border-soft bg-white p-4 transition-colors hover:border-western-green-deep/40 md:p-5"
    >
      <div className="flex items-start justify-between gap-2">
        <Icone className="h-5 w-5 text-western-bronze" aria-hidden="true" />
        <ArrowRight
          className="h-4 w-4 text-western-stone-warm/0 transition-colors group-hover:text-western-stone-warm"
          aria-hidden="true"
        />
      </div>

      <div className="mt-4">
        <p
          className={`text-[24px] font-semibold leading-none tabular-nums ${
            desconhecido ? "text-western-stone-warm/40" : "text-western-green-deep"
          }`}
        >
          {valor}
        </p>
        <p className="text-meta mt-1.5 leading-[1.35]">{rotulo}</p>
      </div>
    </Link>
  );
}

function Atalho({
  to,
  icone: Icone,
  titulo,
  descricao,
}: {
  to: string;
  icone: React.ElementType;
  titulo: string;
  descricao: string;
}) {
  return (
    <Link
      to={to}
      className="group flex items-start gap-3.5 rounded-xl border border-western-border-soft bg-white p-5 transition-colors hover:border-western-green-deep/40"
    >
      <span className="mt-0.5 inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-western-paper">
        <Icone className="h-5 w-5 text-western-bronze" aria-hidden="true" />
      </span>

      <span className="min-w-0">
        <span className="flex items-center gap-1.5 text-[16px] font-semibold text-western-green-deep">
          {titulo}
          <ArrowRight
            className="h-4 w-4 flex-shrink-0 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100"
            aria-hidden="true"
          />
        </span>
        <span className="text-meta mt-1 block leading-[1.45]">{descricao}</span>
      </span>
    </Link>
  );
}
