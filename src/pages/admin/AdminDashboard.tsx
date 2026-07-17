import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  AlertTriangle, ArrowRight, Factory, MessageSquare, RefreshCw,
  ShieldCheck, ShoppingBag, UserPlus,
} from "lucide-react";
import {
  DataTable, type Coluna, EstadoErro, StatusBadge, PageHeader, CelulaData,
  mensagemDeErro, dataCurta,
} from "@/components/backoffice";
import { cn } from "@/lib/utils";

/**
 * COCKPIT — não é um painel de KPIs decorativos.
 *
 * A tela responde UMA pergunta: "o que precisa de mim agora?". Por isso o topo
 * são FILAS DE TRABALHO clicáveis (cada tile leva à lista já filtrada), e os
 * números do mês ficam embaixo, subordinados.
 *
 * A invariante: se a query de um tile falhar, o tile mostra ERRO com a mensagem
 * real — NUNCA "0". Um 403 virando "0 pendências" já cegou o dono uma vez.
 */

interface FunnelRow {
  semana: string;
  orcamentos: number;
  pedidos: number;
  promovidos: number;
  pdf_redownloads: number;
  taxa_conversao_pct: number | null;
  horas_medias_ate_promocao: number | null;
}

interface RecentOrder {
  id: string;
  numero: string;
  titulo: string;
  status: string;
  created_at: string;
}

function fmtBRL(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}

function startOfMonthISO() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString();
}

function sevenDaysAgoISO() {
  return new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
}

/** Cada chave é uma query independente — o erro de uma nunca contamina as outras. */
type ChaveErro =
  | "orcamentosNovos" | "credPendentes" | "pedidosAbertos" | "checkout7d" | "cadastros7d"
  | "inboxTotal" | "leadsMes" | "orcamentosAbertos" | "orcamentosMes" | "vendasMes"
  | "pedidosRecentes" | "funil";

type MapaErros = Partial<Record<ChaveErro, unknown>>;

interface Numeros {
  orcamentosNovos: number;
  credPendentes: number;
  pedidosAbertos: number;
  checkout7d: number;
  cadastros7d: number;
  inboxTotal: number;
  leadsMes: number;
  orcamentosAbertos: number;
  orcamentosMes: number;
  vendasMes: number;
  fechadosMes: number;
}

const ZERO: Numeros = {
  orcamentosNovos: 0, credPendentes: 0, pedidosAbertos: 0, checkout7d: 0, cadastros7d: 0,
  inboxTotal: 0, leadsMes: 0, orcamentosAbertos: 0, orcamentosMes: 0, vendasMes: 0, fechadosMes: 0,
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [n, setNumeros] = useState<Numeros>(ZERO);
  const [pedidosRecentes, setPedidosRecentes] = useState<RecentOrder[]>([]);
  const [funil, setFunil] = useState<FunnelRow[]>([]);
  const [erros, setErros] = useState<MapaErros>({});
  const [carregando, setCarregando] = useState(true);

  const carregar = useCallback(async () => {
    setCarregando(true);
    const inicioMes = startOfMonthISO();
    const seteDias = sevenDaysAgoISO();

    const [
      orcNovosRes,
      credPendRes,
      pedidosAbertosRes,
      checkout7Res,
      cadastros7Res,
      inboxRes,
      leadsMesRes,
      orcAbertosRes,
      orcMesRes,
      vendasMesRes,
      recentesRes,
      funilRes,
    ] = await Promise.all([
      supabase.from("quote_threads").select("id", { count: "exact", head: true }).eq("status", "novo"),
      supabase.from("credenciamentos").select("id", { count: "exact", head: true }).eq("status_manual", "pendente"),
      supabase.from("production_orders").select("id", { count: "exact", head: true })
        .not("status", "in", "(entregue,retirado,cancelado)"),
      supabase.from("leads").select("id", { count: "exact", head: true }).eq("type", "pedido_novo").gte("created_at", seteDias),
      supabase.from("leads").select("id", { count: "exact", head: true }).eq("type", "partner_signup").gte("created_at", seteDias),
      supabase.from("leads").select("id", { count: "exact", head: true })
        .in("type", ["pedido_novo", "contato", "visita", "partner_signup", "newsletter"]),
      supabase.from("leads").select("id", { count: "exact", head: true }).gte("created_at", inicioMes),
      supabase.from("quote_threads").select("id", { count: "exact", head: true })
        .not("status", "in", "(fechado,perdido,arquivado)"),
      supabase.from("quote_threads").select("id", { count: "exact", head: true }).gte("created_at", inicioMes),
      supabase.from("quote_threads").select("valor_final").eq("status", "fechado").gte("updated_at", inicioMes),
      supabase.from("production_orders").select("id, numero, titulo, status, created_at")
        .order("created_at", { ascending: false }).limit(5),
      supabase.from("lead_conversion_funnel" as never).select("*").limit(8),
    ]);

    /* Guardamos o ERRO CRU de cada query. Sem isto a tela mente. */
    const e: MapaErros = {};
    if (orcNovosRes.error) e.orcamentosNovos = orcNovosRes.error;
    if (credPendRes.error) e.credPendentes = credPendRes.error;
    if (pedidosAbertosRes.error) e.pedidosAbertos = pedidosAbertosRes.error;
    if (checkout7Res.error) e.checkout7d = checkout7Res.error;
    if (cadastros7Res.error) e.cadastros7d = cadastros7Res.error;
    if (inboxRes.error) e.inboxTotal = inboxRes.error;
    if (leadsMesRes.error) e.leadsMes = leadsMesRes.error;
    if (orcAbertosRes.error) e.orcamentosAbertos = orcAbertosRes.error;
    if (orcMesRes.error) e.orcamentosMes = orcMesRes.error;
    if (vendasMesRes.error) e.vendasMes = vendasMesRes.error;
    if (recentesRes.error) e.pedidosRecentes = recentesRes.error;
    if (funilRes.error) e.funil = funilRes.error;

    const vendas = vendasMesRes.error ? [] : ((vendasMesRes.data as { valor_final: number | null }[] | null) ?? []);

    setNumeros({
      orcamentosNovos: orcNovosRes.count ?? 0,
      credPendentes: credPendRes.count ?? 0,
      pedidosAbertos: pedidosAbertosRes.count ?? 0,
      checkout7d: checkout7Res.count ?? 0,
      cadastros7d: cadastros7Res.count ?? 0,
      inboxTotal: inboxRes.count ?? 0,
      leadsMes: leadsMesRes.count ?? 0,
      orcamentosAbertos: orcAbertosRes.count ?? 0,
      orcamentosMes: orcMesRes.count ?? 0,
      vendasMes: vendas.reduce((s, r) => s + (Number(r.valor_final) || 0), 0),
      fechadosMes: vendas.length,
    });
    setPedidosRecentes(recentesRes.error ? [] : ((recentesRes.data as RecentOrder[]) ?? []));
    setFunil(funilRes.error ? [] : ((funilRes.data as unknown as FunnelRow[]) ?? []));
    setErros(e);
    setCarregando(false);
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  /* ── As filas de trabalho. Cada uma leva à lista JÁ FILTRADA. ── */
  const filas: Fila[] = [
    {
      chave: "orcamentosNovos",
      rotulo: "Orçamentos a responder",
      valor: n.orcamentosNovos,
      unidade: (v) => (v === 1 ? "orçamento sem resposta" : "orçamentos sem resposta"),
      to: "/admin/orcamentos?status=novo",
      icone: MessageSquare,
    },
    {
      chave: "credPendentes",
      rotulo: "Credenciamentos",
      valor: n.credPendentes,
      unidade: () => "aguardando análise",
      to: "/admin/parceiros?tab=credenciamento",
      icone: ShieldCheck,
    },
    {
      chave: "pedidosAbertos",
      rotulo: "Pedidos em aberto",
      valor: n.pedidosAbertos,
      unidade: () => "em produção ou a caminho",
      to: "/admin/pedidos",
      icone: Factory,
    },
    {
      chave: "checkout7d",
      rotulo: "Pedidos do site (7 dias)",
      valor: n.checkout7d,
      unidade: (v) => (v === 1 ? "lead de checkout" : "leads de checkout"),
      to: "/admin/leads?type=pedido_novo",
      icone: ShoppingBag,
    },
    {
      chave: "cadastros7d",
      rotulo: "Cadastros de parceiro (7 dias)",
      valor: n.cadastros7d,
      unidade: (v) => (v === 1 ? "novo cadastro" : "novos cadastros"),
      to: "/admin/leads?type=partner_signup",
      icone: UserPlus,
    },
  ];

  const filasOk = filas.filter((f) => !erros[f.chave]);
  const totalPendente = filasOk.reduce((s, f) => s + f.valor, 0);
  const algumaFilaFalhou = filas.some((f) => erros[f.chave]);

  const ticketMedio = n.fechadosMes > 0 ? n.vendasMes / n.fechadosMes : null;
  const conversaoPct = n.orcamentosMes > 0 ? Math.round((n.fechadosMes / n.orcamentosMes) * 100) : null;

  const subtitulo = carregando
    ? "Carregando as filas…"
    : totalPendente > 0
      ? `${totalPendente} ${totalPendente === 1 ? "pendência espera" : "pendências esperam"} por você${algumaFilaFalhou ? " — e algumas filas não carregaram." : "."}`
      : algumaFilaFalhou
        ? "Algumas filas não carregaram — o número real pode ser maior."
        : "Nenhuma pendência nas filas agora.";

  return (
    <div className="space-y-12">
      <PageHeader
        eyebrow="Painel"
        titulo="Central de ação"
        subtitulo={subtitulo}
        acoesSecundarias={
          <button type="button" onClick={carregar} disabled={carregando} className="btn-outline-forest">
            <RefreshCw className={cn("h-4 w-4", carregando && "animate-spin")} aria-hidden="true" />
            Atualizar
          </button>
        }
      />

      {/* ── FILAS DE TRABALHO ───────────────────────────────────────────── */}
      <section aria-label="Filas de trabalho">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {filas.map((f) => (
            <TileFila
              key={f.chave}
              fila={f}
              erro={erros[f.chave]}
              carregando={carregando}
              onRetry={carregar}
            />
          ))}
        </div>
      </section>

      {/* ── NÚMEROS (subordinados às filas) ─────────────────────────────── */}
      <section aria-label="Números">
        <h2 className="text-eyebrow mb-4">Resumo</h2>

        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-western-border-soft bg-western-border-soft md:grid-cols-3 xl:grid-cols-6">
          <Numero
            rotulo="Caixa de entrada"
            valor={String(n.inboxTotal)}
            nota="leads acionáveis"
            erro={erros.inboxTotal}
            carregando={carregando}
            to="/admin/leads"
          />
          <Numero rotulo="Leads no mês" valor={String(n.leadsMes)} erro={erros.leadsMes} carregando={carregando} />
          <Numero
            rotulo="Orçamentos em aberto"
            valor={String(n.orcamentosAbertos)}
            erro={erros.orcamentosAbertos}
            carregando={carregando}
            to="/admin/orcamentos"
          />
          <Numero
            rotulo="Vendas fechadas (mês)"
            valor={fmtBRL(n.vendasMes)}
            nota={`${n.fechadosMes} ${n.fechadosMes === 1 ? "orçamento" : "orçamentos"}`}
            erro={erros.vendasMes}
            carregando={carregando}
          />
          <Numero
            rotulo="Ticket médio"
            valor={ticketMedio === null ? "—" : fmtBRL(ticketMedio)}
            nota="por venda fechada"
            erro={erros.vendasMes}
            carregando={carregando}
          />
          <Numero
            rotulo="Conversão"
            valor={conversaoPct === null ? "—" : `${conversaoPct}%`}
            nota="fechados ÷ abertos no mês"
            erro={erros.vendasMes ?? erros.orcamentosMes}
            carregando={carregando}
          />
        </div>

        {/* O erro do resumo aparece por extenso — a célula sozinha não conta a história. */}
        {!carregando && (erros.inboxTotal || erros.leadsMes || erros.orcamentosAbertos || erros.vendasMes || erros.orcamentosMes) && (
          <EstadoErro
            compacto
            className="mt-4"
            titulo="Parte do resumo não carregou"
            erro={erros.inboxTotal ?? erros.leadsMes ?? erros.orcamentosAbertos ?? erros.vendasMes ?? erros.orcamentosMes}
            onRetry={carregar}
          />
        )}
      </section>

      {/* ── PEDIDOS RECENTES ────────────────────────────────────────────── */}
      <section aria-label="Pedidos recentes">
        <div className="mb-4 flex items-end justify-between gap-4">
          <h2 className="text-eyebrow">Pedidos recentes</h2>
          <Link
            to="/admin/pedidos"
            className="inline-flex items-center gap-1 text-[16px] font-semibold text-western-stone-warm transition-colors hover:text-western-green-deep"
          >
            Ver todos <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        <DataTable
          linhas={pedidosRecentes}
          getId={(o) => o.id}
          colunas={COLUNAS_PEDIDOS}
          isLoading={carregando}
          error={erros.pedidosRecentes}
          onRetry={carregar}
          onRowClick={() => navigate("/admin/pedidos")}
          vazio={{
            titulo: "Nenhum pedido de produção ainda",
            mensagem: "Quando um orçamento virar pedido, ele aparece aqui.",
          }}
        />
      </section>

      {/* ── FUNIL ───────────────────────────────────────────────────────── */}
      <section aria-label="Funil de conversão">
        <h2 className="text-eyebrow mb-4">Funil de conversão (por semana)</h2>
        <DataTable
          linhas={funil}
          getId={(r) => r.semana}
          colunas={COLUNAS_FUNIL}
          isLoading={carregando}
          error={erros.funil}
          onRetry={carregar}
          vazio={{
            titulo: "Sem dados de funil",
            mensagem: "Ainda não há semanas com orçamentos e pedidos para comparar.",
          }}
        />
      </section>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
 * Tile de fila — clicável, leva à lista filtrada. Erro NUNCA vira "0".
 * ───────────────────────────────────────────────────────────────────────── */

interface Fila {
  chave: ChaveErro;
  rotulo: string;
  valor: number;
  unidade: (v: number) => string;
  to: string;
  icone: React.ElementType;
}

function TileFila({
  fila, erro, carregando, onRetry,
}: {
  fila: Fila;
  erro: unknown;
  carregando: boolean;
  onRetry: () => void;
}) {
  const Icone = fila.icone;

  if (carregando) {
    return (
      <div className="rounded-2xl border border-western-border-soft bg-white p-5" aria-busy="true">
        <div className="h-4 w-2/3 animate-pulse rounded-sm bg-western-border-soft" />
        <div className="mt-5 h-9 w-16 animate-pulse rounded-sm bg-western-border-soft" />
        <div className="mt-4 h-3 w-1/2 animate-pulse rounded-sm bg-western-border-soft/60" />
      </div>
    );
  }

  /* ERRO — parece um erro, mostra o que houve, e oferece o retry. */
  if (erro) {
    return (
      <div
        role="alert"
        className="flex flex-col rounded-2xl border border-status-error/35 bg-status-error/[0.06] p-5"
      >
        <div className="flex items-center gap-2 text-status-error">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
          <span className="text-[14px] font-semibold uppercase tracking-[0.06em]">{fila.rotulo}</span>
        </div>

        <p className="mt-3 text-[17px] font-semibold text-status-error">Não consegui carregar</p>
        <p className="mt-1 line-clamp-3 break-words text-[14px] leading-[1.5] text-western-stone-dark/85">
          {mensagemDeErro(erro)}
        </p>
        <p className="text-meta mt-2">Isto não quer dizer que a fila esteja vazia.</p>

        <button
          type="button"
          onClick={onRetry}
          className="tap-target mt-4 inline-flex items-center justify-center gap-2 self-start rounded-lg border border-status-error/50 px-4 text-[16px] font-semibold text-status-error transition-colors hover:bg-status-error/10"
        >
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          Tentar de novo
        </button>
      </div>
    );
  }

  const pendente = fila.valor > 0;

  return (
    <Link
      to={fila.to}
      className={cn(
        "group flex flex-col rounded-2xl border bg-white p-5 transition-colors",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-western-gold",
        pendente
          ? "border-western-cta/30 hover:border-western-cta"
          : "border-western-border-soft hover:border-western-border-strong",
      )}
    >
      <div className="flex items-center gap-2 text-western-bronze">
        <Icone className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
        <span className="text-[14px] font-semibold uppercase tracking-[0.06em]">{fila.rotulo}</span>
      </div>

      <p
        className={cn(
          "mt-3 font-display text-[34px] font-[650] leading-none tabular-nums",
          pendente ? "text-western-green-deep" : "text-western-stone-warm/60",
        )}
      >
        {fila.valor}
      </p>
      <p className="text-meta mt-2">{pendente ? fila.unidade(fila.valor) : "nada na fila"}</p>

      <span
        className={cn(
          "mt-4 inline-flex items-center gap-1 text-[16px] font-semibold transition-colors",
          pendente ? "text-western-cta" : "text-western-stone-warm",
        )}
      >
        {pendente ? "Abrir a fila" : "Ver lista"}
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
      </span>
    </Link>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
 * Célula de número — subordinada. Erro aqui também não vira "0".
 * ───────────────────────────────────────────────────────────────────────── */

function Numero({
  rotulo, valor, nota, erro, carregando, to,
}: {
  rotulo: string;
  valor: string;
  nota?: string;
  erro?: unknown;
  carregando: boolean;
  to?: string;
}) {
  const conteudo = (
    <>
      <p className="text-[14px] font-semibold uppercase tracking-[0.06em] text-western-bronze">{rotulo}</p>

      {carregando ? (
        <div className="mt-3 h-6 w-20 animate-pulse rounded-sm bg-western-border-soft" />
      ) : erro ? (
        <p className="mt-2 inline-flex items-center gap-1.5 text-[17px] font-semibold text-status-error">
          <AlertTriangle className="h-4 w-4" aria-hidden="true" />
          não carregou
        </p>
      ) : (
        <p className="mt-2 text-[24px] font-semibold leading-tight tabular-nums text-western-green-deep">{valor}</p>
      )}

      {!carregando && !erro && nota && <p className="text-meta mt-1">{nota}</p>}
    </>
  );

  const base = "bg-white p-5 min-h-[112px]";

  if (to && !erro && !carregando) {
    return (
      <Link
        to={to}
        className={cn(base, "block transition-colors hover:bg-western-paper focus:outline-none focus-visible:ring-2 focus-visible:ring-western-gold focus-visible:ring-inset")}
      >
        {conteudo}
      </Link>
    );
  }

  return <div className={base}>{conteudo}</div>;
}

/* ─────────────────────────────────────────────────────────────────────────
 * Colunas
 * ───────────────────────────────────────────────────────────────────────── */

const COLUNAS_PEDIDOS: ReadonlyArray<Coluna<RecentOrder>> = [
  {
    key: "titulo",
    header: "Pedido",
    principalNoMobile: true,
    sortable: true,
    render: (o) => (
      <span className="font-semibold text-western-green-deep">
        Nº {o.numero} · {o.titulo}
      </span>
    ),
  },
  {
    key: "status",
    header: "Status",
    width: "200px",
    sortable: true,
    render: (o) => <StatusBadge status={o.status} />,
  },
  {
    key: "created_at",
    header: "Criado",
    align: "right",
    width: "160px",
    sortable: true,
    render: (o) => <CelulaData valor={o.created_at} />,
  },
];

const COLUNAS_FUNIL: ReadonlyArray<Coluna<FunnelRow>> = [
  {
    key: "semana",
    header: "Semana",
    principalNoMobile: true,
    sortable: true,
    render: (r) => <span className="font-semibold">{dataCurta(r.semana)}</span>,
  },
  { key: "orcamentos", header: "Orçamentos", align: "right", sortable: true, render: (r) => r.orcamentos },
  { key: "pedidos", header: "Pedidos", align: "right", sortable: true, render: (r) => r.pedidos },
  {
    key: "taxa_conversao_pct",
    header: "Conversão",
    align: "right",
    sortable: true,
    render: (r) => (
      <span className="font-semibold text-western-green-deep">{r.taxa_conversao_pct ?? 0}%</span>
    ),
  },
];
