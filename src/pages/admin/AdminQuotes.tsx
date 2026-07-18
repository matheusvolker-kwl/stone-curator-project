import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Archive, Loader2, Search, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  DataTable, type Coluna,
  StatusBadge, Tabs, type Aba,
  PageHeader, CelulaData,
} from "@/components/backoffice";
import { type Lead } from "@/components/admin/adminUtils";
import {
  QUOTE_STATUS_LABEL,
  type QuoteStatus,
  type QuoteThread,
  type QuotePayload,
} from "@/components/admin/quoteTypes";
import { cdnImg, formatBRL } from "@/lib/catalog/client";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { toast } from "sonner";

const STATUS: QuoteStatus[] = [
  "novo", "em_atendimento", "proposta_enviada", "fechado", "perdido", "arquivado",
];

interface Orcamento {
  lead: Lead;
  thread: QuoteThread;
  payload: QuotePayload;
}

/** Status aceitos vindos da URL (os tiles-fila do dashboard fazem deep link).
 * BUG corrigido (2026-07-18): a lista antiga usava "em_andamento"/"respondido",
 * que NÃO existem no enum — o deep link abria a fila filtrada por um status
 * impossível e a tela entregava lista vazia. Aliases antigos seguem mapeados. */
const STATUS_DA_URL: readonly QuoteStatus[] = [
  "novo",
  "em_atendimento",
  "proposta_enviada",
  "fechado",
] as const;

const ALIAS_STATUS_LEGADO: Record<string, QuoteStatus> = {
  em_andamento: "em_atendimento",
  respondido: "proposta_enviada",
};

function statusInicialDaUrl(params: URLSearchParams): "all" | QuoteStatus {
  const s = params.get("status");
  if (!s) return "all";
  if ((STATUS_DA_URL as readonly string[]).includes(s)) return s as QuoteStatus;
  return ALIAS_STATUS_LEGADO[s] ?? "all";
}

export default function AdminQuotes() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [linhas, setLinhas] = useState<Orcamento[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<unknown>(null);

  // O tile "Orçamentos a responder" manda /admin/orcamentos?status=novo — a lista
  // TEM que abrir já filtrada, senão o cockpit promete uma fila e entrega outra.
  const [statusFiltro, setStatusFiltro] = useState<"all" | QuoteStatus>(() =>
    statusInicialDaUrl(searchParams),
  );
  const [q, setQ] = useState("");

  const [selecionados, setSelecionados] = useState<Set<string>>(new Set());
  const [confirmarArquivo, setConfirmarArquivo] = useState(false);
  const [confirmarExclusao, setConfirmarExclusao] = useState(false);
  const [arquivando, setArquivando] = useState(false);
  const [excluindo, setExcluindo] = useState(false);

  /* ── Carga: leads do tipo "orcamento" + a thread de cada um ── */
  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);

    const [leadsRes, threadsRes] = await Promise.all([
      supabase
        .from("leads")
        .select("*")
        .eq("type", "orcamento")
        .order("created_at", { ascending: false })
        .limit(2000),
      supabase.from("quote_threads").select("*"),
    ]);

    // O erro REAL é guardado (antes virava um booleano e a tela perdia o motivo).
    const falha = leadsRes.error ?? threadsRes.error;
    if (falha) {
      console.error(falha);
      setErro(falha);
      setLinhas([]);
      setCarregando(false);
      return;
    }

    const threadPorLead = new Map<string, QuoteThread>();
    ((threadsRes.data as QuoteThread[]) ?? []).forEach((t) => threadPorLead.set(t.lead_id, t));

    const montadas: Orcamento[] = ((leadsRes.data as Lead[]) ?? []).map((lead) => ({
      lead,
      thread:
        threadPorLead.get(lead.id) ??
        // Lead antigo sem thread persistida: representa como "novo" até o detalhe criar.
        ({
          id: "",
          lead_id: lead.id,
          status: "novo",
          notas: null,
          pago_em: null,
          forma_pagamento: null,
          parcelas: null,
          valor_final: null,
          observacoes_venda: null,
          archived_at: null,
          created_at: lead.created_at,
          updated_at: lead.created_at,
        } as QuoteThread),
      payload: (lead.payload as unknown as QuotePayload) ?? { items: [], subtotal: 0, currency: "BRL" },
    }));

    setLinhas(montadas);
    setCarregando(false);
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  const contagens = useMemo(() => {
    const c: Record<string, number> = { all: linhas.length };
    STATUS.forEach((s) => { c[s] = 0; });
    linhas.forEach((r) => { c[r.thread.status] = (c[r.thread.status] ?? 0) + 1; });
    return c;
  }, [linhas]);

  const filtradas = useMemo(
    () =>
      linhas.filter((r) => {
        if (statusFiltro !== "all" && r.thread.status !== statusFiltro) return false;
        if (q) {
          const alvo = [
            r.lead.nome, r.lead.empresa, r.lead.email, r.lead.telefone, r.lead.cidade,
            r.payload.numero, r.payload.summary,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();
          if (!alvo.includes(q.toLowerCase())) return false;
        }
        return true;
      }),
    [linhas, statusFiltro, q],
  );

  /* Contexto mudou → seleção antiga não vale mais */
  useEffect(() => { setSelecionados(new Set()); }, [statusFiltro, q]);

  const abas: Aba[] = useMemo(
    () => [
      { key: "all", label: "Todos", count: carregando ? undefined : contagens.all },
      ...STATUS.map((s) => ({
        key: s,
        label: QUOTE_STATUS_LABEL[s],
        count: carregando ? undefined : contagens[s],
      })),
    ],
    [contagens, carregando],
  );

  const numeroDe = (r: Orcamento) => r.payload.numero ?? r.lead.id.slice(0, 5).toUpperCase();
  const valorDe = (r: Orcamento) => r.payload.subtotal ?? 0;

  /* ── Ações em massa ── */
  const arquivarSelecionados = async () => {
    const alvos = linhas.filter(
      (r) => selecionados.has(r.lead.id) && r.thread.status !== "arquivado",
    );
    if (alvos.length === 0) {
      setConfirmarArquivo(false);
      toast.info("Nada para arquivar — os selecionados já estão arquivados.");
      return;
    }

    setArquivando(true);
    const agora = new Date().toISOString();
    try {
      const resultados = await Promise.allSettled(
        alvos.map((r) =>
          r.thread.id
            ? supabase
                .from("quote_threads")
                .update({ status: "arquivado", archived_at: agora })
                .eq("id", r.thread.id)
            : supabase
                .from("quote_threads")
                .upsert(
                  { lead_id: r.lead.id, status: "arquivado", archived_at: agora },
                  { onConflict: "lead_id" },
                ),
        ),
      );
      let ok = 0;
      let falhou = 0;
      resultados.forEach((res) => {
        if (res.status === "fulfilled" && !res.value.error) ok++;
        else falhou++;
      });
      if (falhou === 0) toast.success(`${ok} orçamento(s) arquivado(s).`);
      else if (ok === 0) toast.error(`Falha ao arquivar ${falhou} orçamento(s).`);
      else toast.warning(`${ok} arquivado(s), ${falhou} falharam.`);
    } catch (e) {
      console.error(e);
      toast.error("Erro ao arquivar orçamentos.");
    } finally {
      setArquivando(false);
      setConfirmarArquivo(false);
      setSelecionados(new Set());
      carregar();
    }
  };

  const excluirSelecionados = async () => {
    const ids = Array.from(selecionados);
    if (ids.length === 0) return;
    setExcluindo(true);
    try {
      const resultados = await Promise.allSettled(
        ids.map((id) => supabase.from("leads").delete().eq("id", id)),
      );
      let ok = 0;
      let falhou = 0;
      resultados.forEach((res) => {
        if (res.status === "fulfilled" && !res.value.error) ok++;
        else falhou++;
      });
      if (falhou === 0) toast.success(`${ok} orçamento(s) excluído(s).`);
      else if (ok === 0) toast.error(`Falha ao excluir ${falhou} orçamento(s).`);
      else toast.warning(`${ok} excluído(s), ${falhou} falharam.`);
    } catch (e) {
      console.error(e);
      toast.error("Erro ao excluir orçamentos.");
    } finally {
      setExcluindo(false);
      setConfirmarExclusao(false);
      setSelecionados(new Set());
      carregar();
    }
  };

  /* ── Colunas ── */
  const colunas: Coluna<Orcamento>[] = useMemo(
    () => [
      {
        key: "status",
        header: "Status",
        width: "170px",
        sortable: true,
        sortValue: (r) => QUOTE_STATUS_LABEL[r.thread.status],
        render: (r) => <StatusBadge status={r.thread.status} />,
      },
      {
        key: "numero",
        header: "Nº",
        width: "110px",
        numerica: true,
        sortable: true,
        sortValue: (r) => numeroDe(r),
        render: (r) => <span className="text-[16px] font-semibold tabular-nums">{numeroDe(r)}</span>,
      },
      {
        key: "cliente",
        header: "Cliente",
        sortable: true,
        principalNoMobile: true,
        sortValue: (r) => r.lead.nome ?? r.lead.empresa ?? r.lead.email ?? "",
        render: (r) => {
          const secundaria = [r.lead.empresa, r.lead.cidade, r.lead.email]
            .filter(Boolean)
            .join(" · ");
          return (
            <div className="min-w-0">
              <p className="font-semibold text-western-green-deep break-words">
                {r.lead.nome || r.lead.empresa || r.lead.email || "(sem nome)"}
              </p>
              {secundaria && <p className="text-meta mt-0.5 break-words">{secundaria}</p>}
            </div>
          );
        },
      },
      {
        key: "itens",
        header: "Peças",
        width: "150px",
        sortable: true,
        ocultarNoMobile: true,
        sortValue: (r) => r.payload.items?.length ?? 0,
        /* Miniaturas (pedido do dono, 18/07): o atendente reconhece o orçamento
         * pela FOTO das peças, não pela contagem. Até 3 thumbs + contador. */
        render: (r) => {
          const itens = r.payload.items ?? [];
          const fotos = itens.filter((i) => Boolean(i.image)).slice(0, 3);
          return (
            <span className="inline-flex items-center gap-1.5">
              {fotos.map((i, idx) => (
                <img
                  key={idx}
                  src={cdnImg(i.image ?? "", 96)}
                  alt=""
                  loading="lazy"
                  className="h-8 w-8 rounded-md border border-western-border-soft bg-western-paper object-contain"
                />
              ))}
              <span className="tabular-nums text-[15px] font-semibold">
                {itens.length}
              </span>
            </span>
          );
        },
      },
      {
        key: "valor",
        header: "Valor",
        align: "right",
        width: "150px",
        sortable: true,
        sortValue: (r) => valorDe(r),
        render: (r) => {
          const v = valorDe(r);
          return v > 0 ? (
            <span className="font-semibold">{formatBRL(v, r.payload.currency || "BRL")}</span>
          ) : (
            <span className="text-meta">—</span>
          );
        },
      },
      {
        key: "recebido",
        header: "Recebido",
        align: "right",
        width: "140px",
        sortable: true,
        sortValue: (r) => r.lead.created_at,
        render: (r) => <CelulaData valor={r.lead.created_at} className="text-meta" />,
      },
    ],
    [],
  );

  return (
    <div>
      <PageHeader
        eyebrow="Comercial"
        titulo="Orçamentos"
        subtitulo="Pedidos de orçamento recebidos pelo carrinho. Abra um para montar a proposta, aplicar desconto e fechar a venda."
      />

      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <Tabs
          abas={abas}
          ativa={statusFiltro}
          onChange={(k) => {
            const proximo = k as "all" | QuoteStatus;
            setStatusFiltro(proximo);
            // Espelha na URL: F5, voltar e compartilhar o link mantêm a fila.
            const p = new URLSearchParams(searchParams);
            if (proximo === "all") p.delete("status");
            else p.set("status", proximo);
            setSearchParams(p, { replace: true });
          }}
        />

        <div className="relative w-full lg:max-w-sm">
          <Search
            className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-western-stone-warm"
            aria-hidden="true"
          />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar nome, empresa, e-mail, nº…"
            aria-label="Buscar orçamentos"
            className="h-control rounded-sm border-western-border-strong bg-white pl-11 text-[16px] placeholder:text-western-stone-warm/70"
          />
        </div>
      </div>

      <DataTable
        linhas={filtradas}
        colunas={colunas}
        getId={(r) => r.lead.id}
        isLoading={carregando}
        error={erro}
        onRetry={carregar}
        onRowClick={(r) => navigate(`/admin/orcamentos/${r.lead.id}`)}
        vazio={{
          titulo:
            q || statusFiltro !== "all" ? "Nenhum orçamento neste filtro" : "Nenhum orçamento ainda",
          mensagem:
            q || statusFiltro !== "all"
              ? "Tente outro status ou limpe a busca."
              : "Quando alguém pedir orçamento pelo carrinho, ele cai aqui.",
        }}
        selecao={{
          selecionados,
          onChange: setSelecionados,
          barra: () => (
            <>
              <button
                type="button"
                onClick={() => setConfirmarArquivo(true)}
                disabled={arquivando || excluindo}
                className="btn-primary tap-target px-4"
              >
                {arquivando ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Archive className="h-4 w-4" aria-hidden="true" />
                )}
                Arquivar
              </button>
              <button
                type="button"
                onClick={() => setConfirmarExclusao(true)}
                disabled={arquivando || excluindo}
                className="tap-target inline-flex items-center justify-center gap-2 rounded-lg border border-status-error/50 px-4 text-[16px] font-semibold text-status-error transition-colors hover:bg-status-error/10 disabled:opacity-45"
              >
                {excluindo ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                )}
                Excluir
              </button>
            </>
          ),
        }}
      />

      <ConfirmDialog
        open={confirmarArquivo}
        onOpenChange={setConfirmarArquivo}
        title={`Arquivar ${selecionados.size} orçamento(s)?`}
        description="Eles saem do fluxo de atendimento e passam a viver na aba Arquivado. Nada é apagado."
        confirmLabel={arquivando ? "Arquivando…" : "Arquivar"}
        onConfirm={arquivarSelecionados}
      />

      <ConfirmDialog
        open={confirmarExclusao}
        onOpenChange={setConfirmarExclusao}
        title={`Excluir ${selecionados.size} orçamento(s) e todo o histórico?`}
        description="Não tem volta. Os orçamentos selecionados, propostas, mensagens e PDFs vinculados serão apagados."
        confirmLabel={excluindo ? "Excluindo…" : "Excluir"}
        danger
        onConfirm={excluirSelecionados}
      />
    </div>
  );
}
