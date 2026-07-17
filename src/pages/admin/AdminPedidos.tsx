import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Plus,
  Search,
  Save,
  Trash2,
  Send,
  ChevronLeft,
  ChevronRight,
  FileDown,
  Loader2,
} from "lucide-react";
import { downloadPedidoPdf } from "@/lib/pdf/pedidoPdf";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import {
  DataTable, type Coluna,
  EstadoCarregando, EstadoErro,
  StatusBadge, rotuloStatus,
  Tabs,
  PageHeader,
  CelulaData,
  dataCurta,
} from "@/components/backoffice";

/**
 * Pedidos — produção e logística.
 *
 * Consertado nesta passada:
 *  - a carga inicial fazia `Promise.all([...])` e jogava `res.data ?? []` na
 *    tela: qualquer erro (403/RLS/rede) virava "nenhum pedido". Agora o erro é
 *    estado e a tela mostra EstadoErro com "Tentar de novo".
 *  - o histórico do pedido (production_order_events) engolia o erro do mesmo
 *    jeito — o dono via "Nenhuma atualização registrada" quando na verdade a
 *    query tinha falhado. Idem: erro é erro, vazio é vazio.
 */

type Status =
  | "aguardando"
  | "em_producao"
  | "controle_qualidade"
  | "pronto"
  | "em_transporte"
  | "entregue"
  | "retirado"
  | "cancelado";

type Modo = "retirada" | "frete";

interface ProductionOrder {
  id: string;
  numero: string;
  titulo: string;
  user_id: string;
  lead_id: string | null;
  status: Status;
  modo_entrega: Modo;
  prazo_dias_uteis: number;
  produzir_ate: string | null;
  previsao_entrega: string | null;
  tracking_code: string | null;
  transportadora: string | null;
  endereco_entrega: string | null;
  valor_total: number | null;
  observacoes_admin: string | null;
  observacoes_cliente: string | null;
  created_at: string;
  updated_at: string;
}

interface OrderEvent {
  id: string;
  status: Status | null;
  note: string | null;
  created_at: string;
}

interface Partner {
  user_id: string;
  nome: string | null;
  empresa: string | null;
  cidade: string | null;
}

const STATUS_OPTIONS: Status[] = [
  "aguardando",
  "em_producao",
  "controle_qualidade",
  "pronto",
  "em_transporte",
  "entregue",
  "retirado",
  "cancelado",
];

const CONCLUIDOS: Status[] = ["entregue", "retirado", "cancelado"];

/** Copy de apoio: o que o dono normalmente faz a seguir em cada status. */
const PROXIMO_PASSO: Record<Status, string> = {
  aguardando: "Confirme o escopo e mande para produção.",
  em_producao: "Quando as peças saírem do molde, passe para controle de qualidade.",
  controle_qualidade: "Aprovada a conferência, marque como pronto.",
  pronto: "Combine a retirada ou despache com transportadora.",
  em_transporte: "Assim que chegar, marque como entregue.",
  entregue: "Pedido concluído. Nada pendente.",
  retirado: "Pedido concluído. Nada pendente.",
  cancelado: "Pedido cancelado. Nada pendente.",
};

/* Duas classes de propósito, e não uma com override em cima: numa string comum
 * (sem tailwind-merge) `h-control … h-tap` deixa AS DUAS no DOM, e quem decide
 * é a ordem do CSS gerado — não a ordem no atributo. Então nada de sobrescrever. */
const campoCls =
  "h-control w-full rounded-sm border border-western-border-strong bg-white px-3 text-[16px] text-western-green-deep placeholder:text-western-stone-warm/70 transition-colors focus:border-western-cta focus:outline-none focus:ring-2 focus:ring-western-cta/20";
/** Controles de filtro/lote: 48px (toque mínimo), largura definida no uso. */
const filtroCls =
  "h-tap rounded-sm border border-western-border-strong bg-white px-3 text-[16px] text-western-green-deep placeholder:text-western-stone-warm/70 transition-colors focus:border-western-cta focus:outline-none focus:ring-2 focus:ring-western-cta/20";
const areaCls =
  "w-full rounded-sm border border-western-border-strong bg-white px-3 py-2.5 text-[16px] leading-[1.5] text-western-green-deep placeholder:text-western-stone-warm/70 transition-colors focus:border-western-cta focus:outline-none focus:ring-2 focus:ring-western-cta/20";

const moeda = (v: number | null) =>
  v == null ? "—" : v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const nomeParceiro = (p: Partner | undefined, userId: string) =>
  p?.empresa || p?.nome || userId.slice(0, 8);

function Campo({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <label className={`block ${full ? "md:col-span-2" : ""}`}>
      <span className="text-eyebrow mb-1.5 block">{label}</span>
      {children}
    </label>
  );
}

/* ─────────────────────────────────────────────────────────────
 * Detalhe — dados à esquerda, card de ação à direita
 * ───────────────────────────────────────────────────────────── */

function OrderEditor({
  order,
  partners,
  onBack,
  onChanged,
  onDeleted,
}: {
  order: ProductionOrder;
  partners: Partner[];
  onBack: () => void;
  onChanged: (next: ProductionOrder) => void;
  onDeleted: (id: string) => void;
}) {
  const [draft, setDraft] = useState<ProductionOrder>(order);
  const [saving, setSaving] = useState(false);
  const [events, setEvents] = useState<OrderEvent[]>([]);
  const [eventosCarregando, setEventosCarregando] = useState(true);
  const [eventosErro, setEventosErro] = useState<unknown>(null);
  const [newNote, setNewNote] = useState("");
  const [postingNote, setPostingNote] = useState(false);
  const [removeOpen, setRemoveOpen] = useState(false);
  const [gerandoPdf, setGerandoPdf] = useState(false);

  useEffect(() => setDraft(order), [order.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const carregarEventos = useCallback(async () => {
    setEventosCarregando(true);
    setEventosErro(null);
    const { data, error } = await supabase
      .from("production_order_events")
      .select("id,status,note,created_at")
      .eq("order_id", order.id)
      .order("created_at", { ascending: false });
    // "Nenhuma atualização" e "não consegui carregar" NÃO são a mesma tela.
    if (error) setEventosErro(error);
    else setEvents((data as OrderEvent[]) ?? []);
    setEventosCarregando(false);
  }, [order.id]);

  useEffect(() => {
    void carregarEventos();

    const channel = supabase
      .channel(`admin-order-events-${order.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "production_order_events", filter: `order_id=eq.${order.id}` },
        (payload) => setEvents((prev) => [payload.new as OrderEvent, ...prev]),
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [order.id, carregarEventos]);

  const partner = partners.find((p) => p.user_id === draft.user_id);

  const save = async () => {
    setSaving(true);
    const { data, error } = await supabase
      .from("production_orders")
      .update({
        titulo: draft.titulo,
        status: draft.status,
        modo_entrega: draft.modo_entrega,
        prazo_dias_uteis: draft.prazo_dias_uteis,
        produzir_ate: draft.produzir_ate,
        previsao_entrega: draft.previsao_entrega,
        tracking_code: draft.tracking_code,
        transportadora: draft.transportadora,
        endereco_entrega: draft.endereco_entrega,
        valor_total: draft.valor_total,
        observacoes_admin: draft.observacoes_admin,
        observacoes_cliente: draft.observacoes_cliente,
      })
      .eq("id", order.id)
      .select()
      .single();
    setSaving(false);
    if (error) {
      toast.error("Não consegui salvar.", { description: error.message });
      return;
    }
    toast.success("Pedido atualizado. O parceiro já vê a mudança.");
    onChanged(data as ProductionOrder);
  };

  const postNote = async () => {
    const note = newNote.trim();
    if (!note) return;
    setPostingNote(true);
    const { error } = await supabase
      .from("production_order_events")
      .insert({ order_id: order.id, status: draft.status, note });
    setPostingNote(false);
    if (error) {
      toast.error("Não consegui publicar a nota.", { description: error.message });
      return;
    }
    setNewNote("");
    toast.success("Nota publicada para o parceiro.");
  };

  const remove = async () => {
    const { error } = await supabase.from("production_orders").delete().eq("id", order.id);
    if (error) {
      toast.error("Não consegui excluir.", { description: error.message });
      return;
    }
    toast.success("Pedido excluído.");
    onDeleted(order.id);
  };

  const baixarPdf = async () => {
    setGerandoPdf(true);
    try {
      const filename = await downloadPedidoPdf({
        order: { ...draft, observacoes_admin: draft.observacoes_admin },
        events,
        partner: partner ? { nome: partner.nome, empresa: partner.empresa, cidade: partner.cidade } : undefined,
        scenario: "admin",
      });
      toast.success(`PDF gerado: ${filename}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "erro desconhecido";
      toast.error("Falha ao gerar o PDF.", { description: msg });
    } finally {
      setGerandoPdf(false);
    }
  };

  const set = <K extends keyof ProductionOrder>(k: K, v: ProductionOrder[K]) =>
    setDraft((d) => ({ ...d, [k]: v }));

  return (
    <div>
      {/* O "voltar" daqui é estado local (não é rota), por isso é um <button> de
          verdade e não o slot `voltar` do PageHeader, que renderiza um <Link>. */}
      <button
        type="button"
        onClick={onBack}
        className="-ml-1 mb-3 inline-flex items-center gap-1 text-[16px] font-semibold text-western-stone-warm transition-colors hover:text-western-green-deep"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        Pedidos
      </button>

      <PageHeader
        eyebrow={`Nº ${order.numero} · ${nomeParceiro(partner, order.user_id)}`}
        titulo={draft.titulo || "Pedido sem título"}
        subtitulo={`Criado ${dataCurta(order.created_at)} · atualizado ${dataCurta(order.updated_at)}`}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        {/* ── Coluna esquerda: os dados ── */}
        <div className="space-y-6">
          <section className="rounded-2xl border border-western-border-soft bg-white p-5">
            <p className="text-eyebrow mb-4">Dados do pedido</p>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Campo label="Título">
                <input value={draft.titulo} onChange={(e) => set("titulo", e.target.value)} className={campoCls} />
              </Campo>

              <Campo label="Status">
                <select
                  value={draft.status}
                  onChange={(e) => set("status", e.target.value as Status)}
                  className={campoCls}
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>{rotuloStatus(s)}</option>
                  ))}
                </select>
              </Campo>

              <Campo label="Modo de entrega">
                <select
                  value={draft.modo_entrega}
                  onChange={(e) => set("modo_entrega", e.target.value as Modo)}
                  className={campoCls}
                >
                  <option value="frete">Frete</option>
                  <option value="retirada">Retirada no ateliê</option>
                </select>
              </Campo>

              <Campo label="Prazo (dias úteis)">
                <input
                  type="number"
                  min={1}
                  value={draft.prazo_dias_uteis}
                  onChange={(e) => set("prazo_dias_uteis", Number(e.target.value))}
                  className={`${campoCls} tabular-nums`}
                />
              </Campo>

              <Campo label="Prazo interno de produção">
                <input
                  type="date"
                  value={draft.produzir_ate ?? ""}
                  onChange={(e) => set("produzir_ate", e.target.value || null)}
                  className={`${campoCls} tabular-nums`}
                />
              </Campo>

              <Campo label={draft.modo_entrega === "retirada" ? "Disponível em" : "Previsão de entrega"}>
                <input
                  type="date"
                  value={draft.previsao_entrega ?? ""}
                  onChange={(e) => set("previsao_entrega", e.target.value || null)}
                  className={`${campoCls} tabular-nums`}
                />
              </Campo>

              {draft.modo_entrega === "frete" && (
                <>
                  <Campo label="Transportadora">
                    <input
                      value={draft.transportadora ?? ""}
                      onChange={(e) => set("transportadora", e.target.value || null)}
                      className={campoCls}
                      placeholder="Ex.: Correios, Jamef…"
                    />
                  </Campo>
                  <Campo label="Código de rastreio">
                    <input
                      value={draft.tracking_code ?? ""}
                      onChange={(e) => set("tracking_code", e.target.value || null)}
                      className={`${campoCls} tabular-nums`}
                      placeholder="Ex.: BR123456789"
                    />
                  </Campo>
                  <Campo label="Endereço de entrega" full>
                    <textarea
                      value={draft.endereco_entrega ?? ""}
                      onChange={(e) => set("endereco_entrega", e.target.value || null)}
                      className={`${areaCls} min-h-[72px]`}
                    />
                  </Campo>
                </>
              )}

              <Campo label="Valor total (R$)">
                <input
                  type="number"
                  step="0.01"
                  value={draft.valor_total ?? ""}
                  onChange={(e) => set("valor_total", e.target.value === "" ? null : Number(e.target.value))}
                  className={`${campoCls} tabular-nums`}
                />
              </Campo>
            </div>
          </section>

          <section className="rounded-2xl border border-western-border-soft bg-white p-5">
            <p className="text-eyebrow mb-4">Recados</p>
            <div className="grid grid-cols-1 gap-4">
              <Campo label="Recado para o parceiro (aparece na conta dele)">
                <textarea
                  value={draft.observacoes_cliente ?? ""}
                  onChange={(e) => set("observacoes_cliente", e.target.value || null)}
                  className={`${areaCls} min-h-[84px]`}
                />
              </Campo>
              <Campo label="Nota interna (só o ateliê vê)">
                <textarea
                  value={draft.observacoes_admin ?? ""}
                  onChange={(e) => set("observacoes_admin", e.target.value || null)}
                  className={`${areaCls} min-h-[84px]`}
                />
              </Campo>
            </div>
          </section>

          {/* Histórico */}
          <section className="rounded-2xl border border-western-border-soft bg-white p-5">
            <p className="text-eyebrow mb-1">Histórico</p>
            <p className="text-meta mb-4">Sincronizado em tempo real com a conta do parceiro.</p>

            <div className="mb-5 flex flex-col gap-2 sm:flex-row">
              <input
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Publicar uma nota visível ao parceiro (sem mudar o status)…"
                className={`${campoCls} flex-1`}
                onKeyDown={(e) => { if (e.key === "Enter") void postNote(); }}
              />
              <button
                type="button"
                onClick={postNote}
                disabled={postingNote || !newNote.trim()}
                className="tap-target inline-flex h-control flex-shrink-0 items-center justify-center gap-2 rounded-lg border border-western-border-strong px-5 text-[16px] font-semibold text-western-green-deep transition-colors hover:border-western-green-deep hover:bg-western-paper disabled:opacity-45"
              >
                <Send className="h-4 w-4" aria-hidden="true" />
                Publicar
              </button>
            </div>

            {eventosErro ? (
              <EstadoErro erro={eventosErro} onRetry={carregarEventos} titulo="Não consegui carregar o histórico" compacto />
            ) : eventosCarregando ? (
              <EstadoCarregando linhas={3} />
            ) : events.length === 0 ? (
              <p className="text-body">Nenhuma atualização registrada até agora.</p>
            ) : (
              <ul className="space-y-4">
                {events.map((ev) => (
                  <li key={ev.id} className="flex gap-3">
                    <span className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-western-gold" aria-hidden="true" />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {ev.status && <StatusBadge status={ev.status} />}
                        <CelulaData valor={ev.created_at} className="text-meta" />
                      </div>
                      {ev.note && (
                        <p className="mt-1.5 whitespace-pre-line text-[16px] leading-[1.5] text-western-green-deep">
                          {ev.note}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        {/* ── Coluna direita: card de ação ── */}
        <aside className="lg:sticky lg:top-6 lg:self-start">
          <div className="rounded-2xl border border-western-border-soft bg-white p-5">
            <p className="text-eyebrow mb-3">Situação</p>
            <StatusBadge status={draft.status} />
            <p className="text-body mt-3 text-[16px]">{PROXIMO_PASSO[draft.status]}</p>

            <dl className="mt-5 space-y-2.5 border-t border-western-border-soft pt-5">
              <ItemResumo k="Parceiro" v={nomeParceiro(partner, draft.user_id)} />
              {partner?.cidade && <ItemResumo k="Cidade" v={partner.cidade} />}
              <ItemResumo k="Entrega" v={draft.modo_entrega === "retirada" ? "Retirada" : "Frete"} />
              <ItemResumo
                k={draft.modo_entrega === "retirada" ? "Disponível" : "Previsão"}
                v={draft.previsao_entrega ? dataCurta(draft.previsao_entrega) : "—"}
              />
              <ItemResumo k="Valor" v={moeda(draft.valor_total)} />
            </dl>

            <button type="button" onClick={save} disabled={saving} className="btn-primary mt-5 w-full">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Save className="h-4 w-4" aria-hidden="true" />}
              {saving ? "Salvando…" : "Salvar e sincronizar"}
            </button>

            <button
              type="button"
              onClick={baixarPdf}
              disabled={gerandoPdf}
              className="tap-target mt-2 inline-flex h-control w-full items-center justify-center gap-2 rounded-lg border border-western-border-strong px-5 text-[16px] font-semibold text-western-green-deep transition-colors hover:border-western-green-deep hover:bg-western-paper disabled:opacity-45"
            >
              <FileDown className="h-4 w-4" aria-hidden="true" />
              {gerandoPdf ? "Gerando…" : "Baixar PDF"}
            </button>

            <div className="mt-5 border-t border-western-border-soft pt-4">
              <button
                type="button"
                onClick={() => setRemoveOpen(true)}
                className="tap-target inline-flex items-center gap-2 text-[16px] font-semibold text-status-error transition-colors hover:underline"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                Excluir pedido
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={onBack}
            className="tap-target mt-3 w-full rounded-lg px-5 text-[16px] font-semibold text-western-stone-warm transition-colors hover:text-western-green-deep"
          >
            Voltar para a lista
          </button>
        </aside>
      </div>

      <ConfirmDialog
        open={removeOpen}
        onOpenChange={setRemoveOpen}
        title={`Excluir o pedido Nº ${order.numero}?`}
        description="Esta ação é irreversível. Todo o histórico do pedido é apagado."
        confirmLabel="Excluir definitivamente"
        danger
        requireText="EXCLUIR"
        onConfirm={() => { setRemoveOpen(false); void remove(); }}
      />
    </div>
  );
}

function ItemResumo({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-[14px] font-semibold uppercase tracking-[0.06em] text-western-bronze">{k}</dt>
      <dd className="min-w-0 break-words text-right text-[16px] tabular-nums text-western-green-deep">{v}</dd>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
 * Criação
 * ───────────────────────────────────────────────────────────── */

function CreateOrderModal({
  partners,
  onClose,
  onCreated,
}: {
  partners: Partner[];
  onClose: () => void;
  onCreated: (o: ProductionOrder) => void;
}) {
  const [form, setForm] = useState({
    user_id: partners[0]?.user_id ?? "",
    numero: "",
    titulo: "",
    modo_entrega: "frete" as Modo,
    prazo_dias_uteis: 15,
    valor_total: "",
  });
  const [saving, setSaving] = useState(false);

  // A11y do modal manual: esc fecha, trava o scroll do fundo, restaura ao sair.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const create = async () => {
    if (!form.user_id || !form.numero.trim() || !form.titulo.trim()) {
      toast.error("Preencha parceiro, número e título.");
      return;
    }
    setSaving(true);
    const { data, error } = await supabase
      .from("production_orders")
      .insert({
        user_id: form.user_id,
        numero: form.numero.trim(),
        titulo: form.titulo.trim(),
        modo_entrega: form.modo_entrega,
        prazo_dias_uteis: form.prazo_dias_uteis,
        valor_total: form.valor_total === "" ? null : Number(form.valor_total),
      })
      .select()
      .single();
    setSaving(false);
    if (error) {
      toast.error("Não consegui criar o pedido.", { description: error.message });
      return;
    }
    toast.success("Pedido criado e sincronizado com a conta do parceiro.");
    onCreated(data as ProductionOrder);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-western-green-deep/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Criar pedido de produção"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-western-border-soft bg-white p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-eyebrow mb-2">Novo pedido</p>
        <h2 className="display-md mb-5 text-western-green-deep">Criar pedido de produção</h2>

        <div className="space-y-4">
          <Campo label="Parceiro">
            <select
              value={form.user_id}
              onChange={(e) => setForm({ ...form, user_id: e.target.value })}
              className={campoCls}
            >
              {partners.map((p) => (
                <option key={p.user_id} value={p.user_id}>
                  {nomeParceiro(p, p.user_id)}{p.cidade ? ` · ${p.cidade}` : ""}
                </option>
              ))}
            </select>
          </Campo>

          <Campo label="Número do pedido">
            <input
              value={form.numero}
              onChange={(e) => setForm({ ...form, numero: e.target.value })}
              className={`${campoCls} tabular-nums`}
              placeholder="Ex.: 2026-001"
            />
          </Campo>

          <Campo label="Título (descrição curta)">
            <input
              value={form.titulo}
              onChange={(e) => setForm({ ...form, titulo: e.target.value })}
              className={campoCls}
              placeholder="Ex.: Composição Ateliê Jardim"
            />
          </Campo>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Campo label="Modo de entrega">
              <select
                value={form.modo_entrega}
                onChange={(e) => setForm({ ...form, modo_entrega: e.target.value as Modo })}
                className={campoCls}
              >
                <option value="frete">Frete</option>
                <option value="retirada">Retirada</option>
              </select>
            </Campo>
            <Campo label="Prazo (dias úteis)">
              <input
                type="number"
                min={1}
                value={form.prazo_dias_uteis}
                onChange={(e) => setForm({ ...form, prazo_dias_uteis: Number(e.target.value) })}
                className={`${campoCls} tabular-nums`}
              />
            </Campo>
          </div>

          <Campo label="Valor total (R$) — opcional">
            <input
              type="number"
              step="0.01"
              value={form.valor_total}
              onChange={(e) => setForm({ ...form, valor_total: e.target.value })}
              className={`${campoCls} tabular-nums`}
            />
          </Campo>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 border-t border-western-border-soft pt-5 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="tap-target rounded-lg px-5 text-[16px] font-semibold text-western-stone-warm transition-colors hover:text-western-green-deep"
          >
            Cancelar
          </button>
          <button type="button" onClick={create} disabled={saving} className="btn-primary">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Plus className="h-4 w-4" aria-hidden="true" />}
            {saving ? "Criando…" : "Criar pedido"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
 * Lista
 * ───────────────────────────────────────────────────────────── */

export default function AdminPedidos() {
  const [orders, setOrders] = useState<ProductionOrder[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<unknown>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [aba, setAba] = useState<"ativos" | "concluidos" | "todos">("ativos");
  const [search, setSearch] = useState("");
  const [creating, setCreating] = useState(false);
  const [selecionados, setSelecionados] = useState<Set<string>>(new Set());
  const [bulkStatus, setBulkStatus] = useState<Status | "">("");
  const [bulkModo, setBulkModo] = useState<Modo | "">("");
  const [bulkNote, setBulkNote] = useState("");
  const [bulkApplying, setBulkApplying] = useState(false);
  const [bulkConfirmOpen, setBulkConfirmOpen] = useState(false);

  const load = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    const [ordersRes, partnersRes] = await Promise.all([
      supabase.from("production_orders").select("*").order("created_at", { ascending: false }),
      supabase
        .from("partner_profiles")
        .select("user_id,nome,empresa,cidade")
        .eq("status", "approved")
        .order("empresa"),
    ]);

    // O erro dos PEDIDOS derruba a tela (é a lista). O erro dos PARCEIROS só
    // degrada o nome exibido — não vale esconder os pedidos por causa disso —
    // mas ele aparece como aviso, nunca em silêncio.
    if (ordersRes.error) {
      setErro(ordersRes.error);
      setCarregando(false);
      return;
    }
    setOrders((ordersRes.data as ProductionOrder[]) ?? []);

    if (partnersRes.error) {
      toast.error("Não consegui carregar os parceiros.", {
        description: `${partnersRes.error.message} — os pedidos aparecem, mas sem o nome do parceiro.`,
      });
      setPartners([]);
    } else {
      setPartners((partnersRes.data as Partner[]) ?? []);
    }

    setCarregando(false);
  }, []);

  useEffect(() => {
    void load();

    const channel = supabase
      .channel("admin-orders")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "production_orders" },
        (payload) => {
          setOrders((prev) => {
            if (payload.eventType === "INSERT") {
              const next = payload.new as ProductionOrder;
              return [next, ...prev.filter((o) => o.id !== next.id)];
            }
            if (payload.eventType === "UPDATE") {
              const next = payload.new as ProductionOrder;
              return prev.map((o) => (o.id === next.id ? next : o));
            }
            if (payload.eventType === "DELETE") {
              return prev.filter((o) => o.id !== (payload.old as { id: string }).id);
            }
            return prev;
          });
        },
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [load]);

  const partnerById = useMemo(() => {
    const map = new Map<string, Partner>();
    partners.forEach((p) => map.set(p.user_id, p));
    return map;
  }, [partners]);

  const contagens = useMemo(() => ({
    ativos: orders.filter((o) => !CONCLUIDOS.includes(o.status)).length,
    concluidos: orders.filter((o) => CONCLUIDOS.includes(o.status)).length,
    todos: orders.length,
  }), [orders]);

  const visible = useMemo(() => {
    let list = orders;
    if (aba === "ativos") list = list.filter((o) => !CONCLUIDOS.includes(o.status));
    if (aba === "concluidos") list = list.filter((o) => CONCLUIDOS.includes(o.status));

    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter((o) => {
      const p = partnerById.get(o.user_id);
      return (
        o.numero.toLowerCase().includes(q) ||
        o.titulo.toLowerCase().includes(q) ||
        (p?.empresa ?? "").toLowerCase().includes(q) ||
        (p?.nome ?? "").toLowerCase().includes(q)
      );
    });
  }, [orders, aba, search, partnerById]);

  // Sair da aba/busca não pode deixar seleção invisível pendurada.
  useEffect(() => { setSelecionados(new Set()); }, [aba, search]);

  const applyBulk = async () => {
    const ids = Array.from(selecionados);
    if (ids.length === 0) return;
    const note = bulkNote.trim();
    if (!bulkStatus && !bulkModo && !note) {
      toast.error("Escolha ao menos uma alteração.");
      return;
    }
    setBulkApplying(true);
    try {
      if (bulkStatus || bulkModo) {
        const patch: { status?: Status; modo_entrega?: Modo } = {};
        if (bulkStatus) patch.status = bulkStatus;
        if (bulkModo) patch.modo_entrega = bulkModo;
        const { error } = await supabase.from("production_orders").update(patch).in("id", ids);
        if (error) throw error;
      }
      if (note) {
        const eventos = ids.map((order_id) => ({ order_id, status: bulkStatus || null, note }));
        const { error } = await supabase.from("production_order_events").insert(eventos);
        if (error) throw error;
      }
      toast.success(`${ids.length} pedido(s) atualizado(s) e sincronizado(s).`);
      setBulkStatus("");
      setBulkModo("");
      setBulkNote("");
      setSelecionados(new Set());
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro desconhecido";
      toast.error("Falha ao aplicar em lote.", { description: msg });
    } finally {
      setBulkApplying(false);
    }
  };

  const colunas: ReadonlyArray<Coluna<ProductionOrder>> = useMemo(() => [
    {
      key: "numero",
      header: "Nº",
      width: "110px",
      numerica: true,
      sortable: true,
      render: (o) => <span className="font-semibold text-western-green-deep">{o.numero}</span>,
    },
    {
      key: "titulo",
      header: "Pedido",
      principalNoMobile: true,
      sortable: true,
      render: (o) => {
        const p = partnerById.get(o.user_id);
        return (
          <div className="min-w-0">
            <p className="truncate font-semibold text-western-green-deep">{o.titulo}</p>
            <p className="truncate text-[14px] text-western-stone-warm">
              {nomeParceiro(p, o.user_id)}{p?.cidade ? ` · ${p.cidade}` : ""}
            </p>
          </div>
        );
      },
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (o) => <StatusBadge status={o.status} />,
    },
    {
      key: "modo_entrega",
      header: "Entrega",
      ocultarNoMobile: true,
      sortable: true,
      render: (o) => (
        <span className="text-[16px] text-western-stone-warm">
          {o.modo_entrega === "retirada" ? "Retirada" : "Frete"}
        </span>
      ),
    },
    {
      key: "valor_total",
      header: "Valor",
      align: "right",
      sortable: true,
      sortValue: (o) => o.valor_total,
      ocultarNoMobile: true,
      render: (o) => <span className="text-western-green-deep">{moeda(o.valor_total)}</span>,
    },
    {
      key: "previsao_entrega",
      header: "Previsão",
      align: "right",
      sortable: true,
      sortValue: (o) => o.previsao_entrega,
      render: (o) => (
        <span className="text-western-green-deep">
          {o.previsao_entrega ? dataCurta(o.previsao_entrega) : "—"}
        </span>
      ),
    },
    {
      key: "acao",
      header: "",
      align: "right",
      width: "56px",
      ocultarNoMobile: true,
      render: () => <ChevronRight className="ml-auto h-4 w-4 text-western-stone-warm/45" aria-hidden="true" />,
    },
  ], [partnerById]);

  const selected = orders.find((o) => o.id === selectedId) ?? null;

  if (selected) {
    return (
      <OrderEditor
        order={selected}
        partners={partners}
        onBack={() => setSelectedId(null)}
        onChanged={(next) => setOrders((prev) => prev.map((o) => (o.id === next.id ? next : o)))}
        onDeleted={(id) => {
          setOrders((prev) => prev.filter((o) => o.id !== id));
          setSelectedId(null);
          setSelecionados((prev) => {
            const next = new Set(prev);
            next.delete(id);
            return next;
          });
        }}
      />
    );
  }

  return (
    <div>
      <PageHeader
        eyebrow="Produção e logística"
        titulo="Pedidos"
        subtitulo="Status, prazos, rastreio e recados. Tudo sincroniza em tempo real com a conta do parceiro."
        acao={
          <button
            type="button"
            onClick={() => setCreating(true)}
            disabled={partners.length === 0}
            className="btn-primary"
            title={partners.length === 0 ? "Aprove um parceiro antes de criar pedidos." : undefined}
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Novo pedido
          </button>
        }
      />

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Tabs
          abas={[
            { key: "ativos", label: "Ativos", count: carregando || erro ? undefined : contagens.ativos },
            { key: "concluidos", label: "Concluídos", count: carregando || erro ? undefined : contagens.concluidos },
            { key: "todos", label: "Todos", count: carregando || erro ? undefined : contagens.todos },
          ]}
          ativa={aba}
          onChange={setAba}
        />

        <div className="relative ml-auto min-w-[240px] flex-1 md:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-western-stone-warm" aria-hidden="true" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar nº, título ou parceiro…"
            aria-label="Buscar pedido"
            className={`${filtroCls} w-full pl-10`}
          />
        </div>
      </div>

      <DataTable
        linhas={visible}
        colunas={colunas}
        getId={(o) => o.id}
        isLoading={carregando}
        error={erro}
        onRetry={load}
        onRowClick={(o) => setSelectedId(o.id)}
        vazio={{
          titulo:
            orders.length === 0
              ? "Nenhum pedido de produção ainda"
              : "Nenhum pedido com esses filtros",
          mensagem:
            orders.length === 0
              ? partners.length === 0
                ? "Aprove um parceiro antes de criar o primeiro pedido."
                : "Crie o primeiro pedido para acompanhar a produção por aqui."
              : "Troque de aba ou limpe a busca.",
          acao:
            orders.length === 0 && partners.length > 0 ? (
              <button type="button" onClick={() => setCreating(true)} className="btn-primary">
                <Plus className="h-4 w-4" aria-hidden="true" />
                Criar primeiro pedido
              </button>
            ) : undefined,
        }}
        selecao={{
          selecionados,
          onChange: setSelecionados,
          barra: (ids) => (
            <>
              <select
                value={bulkStatus}
                onChange={(e) => setBulkStatus(e.target.value as Status | "")}
                className={`${filtroCls} w-[190px]`}
                aria-label="Novo status"
              >
                <option value="">Manter status</option>
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{rotuloStatus(s)}</option>
                ))}
              </select>

              <select
                value={bulkModo}
                onChange={(e) => setBulkModo(e.target.value as Modo | "")}
                className={`${filtroCls} w-[150px]`}
                aria-label="Modo de entrega"
              >
                <option value="">Manter entrega</option>
                <option value="frete">Frete</option>
                <option value="retirada">Retirada</option>
              </select>

              <input
                value={bulkNote}
                onChange={(e) => setBulkNote(e.target.value)}
                placeholder="Nota para o parceiro (opcional)"
                aria-label="Nota anexada ao lote"
                className={`${filtroCls} w-[240px]`}
              />

              <button
                type="button"
                onClick={() => {
                  if (!bulkStatus && !bulkModo && !bulkNote.trim()) {
                    toast.error("Escolha ao menos uma alteração.");
                    return;
                  }
                  setBulkConfirmOpen(true);
                }}
                disabled={bulkApplying || ids.length === 0}
                className="btn-primary"
              >
                <Save className="h-4 w-4" aria-hidden="true" />
                {bulkApplying ? "Aplicando…" : "Aplicar"}
              </button>
            </>
          ),
        }}
      />

      <ConfirmDialog
        open={bulkConfirmOpen}
        onOpenChange={setBulkConfirmOpen}
        title="Aplicar alterações em lote?"
        description={`Você vai mudar ${selecionados.size} pedido(s)${
          bulkStatus ? ` para "${rotuloStatus(bulkStatus)}"` : ""
        }${bulkModo ? ` · entrega por ${bulkModo === "frete" ? "frete" : "retirada"}` : ""}. O parceiro vê a mudança na hora.`}
        confirmLabel="Aplicar"
        danger
        onConfirm={() => { setBulkConfirmOpen(false); void applyBulk(); }}
      />

      {creating && (
        <CreateOrderModal
          partners={partners}
          onClose={() => setCreating(false)}
          onCreated={(o) => {
            setCreating(false);
            setOrders((prev) => [o, ...prev.filter((x) => x.id !== o.id)]);
            setSelectedId(o.id);
          }}
        />
      )}
    </div>
  );
}
