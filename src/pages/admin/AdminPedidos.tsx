import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Truck,
  Factory,
  CheckCircle2,
  Clock,
  XCircle,
  Package,
  Plus,
  Search,
  ArrowLeft,
  Save,
  Trash2,
  Send,
  X,
  Layers,
  FileDown,
} from "lucide-react";
import { downloadPedidoPdf } from "@/lib/pdf/pedidoPdf";

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

const STATUS_META: Record<Status, { label: string; tone: string; icon: typeof Clock }> = {
  aguardando: { label: "Aguardando", tone: "text-western-stone-warm border-western-stone-warm/30 bg-western-stone-warm/10", icon: Clock },
  em_producao: { label: "Em produção", tone: "text-western-gold border-western-gold/40 bg-western-gold/10", icon: Factory },
  controle_qualidade: { label: "Controle qualidade", tone: "text-western-gold border-western-gold/40 bg-western-gold/10", icon: CheckCircle2 },
  pronto: { label: "Pronto", tone: "text-emerald-700 border-emerald-600/40 bg-emerald-50", icon: Package },
  em_transporte: { label: "Em transporte", tone: "text-blue-700 border-blue-600/40 bg-blue-50", icon: Truck },
  entregue: { label: "Entregue", tone: "text-emerald-700 border-emerald-600/40 bg-emerald-50", icon: CheckCircle2 },
  retirado: { label: "Retirado", tone: "text-emerald-700 border-emerald-600/40 bg-emerald-50", icon: CheckCircle2 },
  cancelado: { label: "Cancelado", tone: "text-red-700 border-red-600/40 bg-red-50", icon: XCircle },
};

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

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("pt-BR");
}

function fmtDateTime(iso: string): string {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function StatusBadge({ status }: { status: Status }) {
  const meta = STATUS_META[status];
  const Icon = meta.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 border font-mono text-[10px] uppercase tracking-[0.2em] ${meta.tone}`}>
      <Icon className="h-3 w-3" /> {meta.label}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────
// Detalhe + edição
// ─────────────────────────────────────────────────────────────
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
  const [newNote, setNewNote] = useState("");
  const [postingNote, setPostingNote] = useState(false);

  useEffect(() => setDraft(order), [order.id]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await supabase
        .from("production_order_events")
        .select("id,status,note,created_at")
        .eq("order_id", order.id)
        .order("created_at", { ascending: false });
      if (!mounted) return;
      setEvents((data as OrderEvent[]) ?? []);
    })();
    const channel = supabase
      .channel(`admin-order-events-${order.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "production_order_events", filter: `order_id=eq.${order.id}` },
        (payload) => setEvents((prev) => [payload.new as OrderEvent, ...prev]),
      )
      .subscribe();
    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, [order.id]);

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
      toast.error("Erro ao salvar: " + error.message);
      return;
    }
    toast.success("Pedido atualizado · cliente já vê em tempo real");
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
      toast.error("Erro ao publicar nota: " + error.message);
      return;
    }
    setNewNote("");
    toast.success("Nota publicada para o cliente");
  };

  const remove = async () => {
    if (!confirm(`Excluir pedido Nº ${order.numero}? Esta ação é irreversível.`)) return;
    const { error } = await supabase.from("production_orders").delete().eq("id", order.id);
    if (error) {
      toast.error("Erro: " + error.message);
      return;
    }
    toast.success("Pedido excluído");
    onDeleted(order.id);
  };

  const set = <K extends keyof ProductionOrder>(k: K, v: ProductionOrder[K]) =>
    setDraft((d) => ({ ...d, [k]: v }));

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-western-stone-warm hover:text-western-green-deep"
      >
        <ArrowLeft className="h-3 w-3" /> Voltar
      </button>

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-eyebrow mb-1">
            Nº {order.numero} · {partner?.empresa || partner?.nome || order.user_id.slice(0, 8)}
          </p>
          <h2 className="font-display text-2xl text-western-green-deep">{draft.titulo}</h2>
          <p className="text-xs text-western-stone-warm mt-1">
            Criado em {fmtDateTime(order.created_at)} · atualizado {fmtDateTime(order.updated_at)}
          </p>
        </div>
        <StatusBadge status={draft.status} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Título">
          <input
            value={draft.titulo}
            onChange={(e) => set("titulo", e.target.value)}
            className="ui-input"
          />
        </Field>

        <Field label="Status">
          <select
            value={draft.status}
            onChange={(e) => set("status", e.target.value as Status)}
            className="ui-input"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{STATUS_META[s].label}</option>
            ))}
          </select>
        </Field>

        <Field label="Modo de entrega">
          <select
            value={draft.modo_entrega}
            onChange={(e) => set("modo_entrega", e.target.value as Modo)}
            className="ui-input"
          >
            <option value="frete">Frete</option>
            <option value="retirada">Retirada na fábrica</option>
          </select>
        </Field>

        <Field label="Prazo (dias úteis)">
          <input
            type="number"
            min={1}
            value={draft.prazo_dias_uteis}
            onChange={(e) => set("prazo_dias_uteis", Number(e.target.value))}
            className="ui-input"
          />
        </Field>

        <Field label="Prazo interno de produção">
          <input
            type="date"
            value={draft.produzir_ate ?? ""}
            onChange={(e) => set("produzir_ate", e.target.value || null)}
            className="ui-input"
          />
        </Field>

        <Field label={draft.modo_entrega === "retirada" ? "Disponível em" : "Previsão de entrega"}>
          <input
            type="date"
            value={draft.previsao_entrega ?? ""}
            onChange={(e) => set("previsao_entrega", e.target.value || null)}
            className="ui-input"
          />
        </Field>

        {draft.modo_entrega === "frete" && (
          <>
            <Field label="Transportadora">
              <input
                value={draft.transportadora ?? ""}
                onChange={(e) => set("transportadora", e.target.value || null)}
                className="ui-input"
                placeholder="Ex.: Correios, Jamef…"
              />
            </Field>
            <Field label="Código de rastreio">
              <input
                value={draft.tracking_code ?? ""}
                onChange={(e) => set("tracking_code", e.target.value || null)}
                className="ui-input"
                placeholder="Ex.: BR123456789"
              />
            </Field>
            <Field label="Endereço de entrega" full>
              <textarea
                value={draft.endereco_entrega ?? ""}
                onChange={(e) => set("endereco_entrega", e.target.value || null)}
                className="ui-input min-h-[60px]"
              />
            </Field>
          </>
        )}

        <Field label="Valor total (R$)">
          <input
            type="number"
            step="0.01"
            value={draft.valor_total ?? ""}
            onChange={(e) => set("valor_total", e.target.value === "" ? null : Number(e.target.value))}
            className="ui-input"
          />
        </Field>

        <Field label="Observações do cliente (visível ao parceiro)" full>
          <textarea
            value={draft.observacoes_cliente ?? ""}
            onChange={(e) => set("observacoes_cliente", e.target.value || null)}
            className="ui-input min-h-[70px]"
          />
        </Field>

        <Field label="Notas internas (admin)" full>
          <textarea
            value={draft.observacoes_admin ?? ""}
            onChange={(e) => set("observacoes_admin", e.target.value || null)}
            className="ui-input min-h-[70px]"
          />
        </Field>
      </div>

      <div className="flex items-center justify-between gap-3 flex-wrap pt-2 border-t border-western-stone-warm/15">
        <button
          onClick={remove}
          className="inline-flex items-center gap-2 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.22em] text-red-700 border border-red-300 hover:bg-red-50"
        >
          <Trash2 className="h-3 w-3" /> Excluir pedido
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={async () => {
              try {
                const filename = await downloadPedidoPdf({
                  order: { ...draft, observacoes_admin: draft.observacoes_admin },
                  events,
                  partner: partner
                    ? { nome: partner.nome, empresa: partner.empresa, cidade: partner.cidade }
                    : undefined,
                  scenario: "admin",
                });
                toast.success(`PDF gerado: ${filename}`);
              } catch (err) {
                const msg = err instanceof Error ? err.message : "erro desconhecido";
                toast.error("Falha ao gerar PDF: " + msg);
              }
            }}
            className="inline-flex items-center gap-2 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.22em] text-western-green-deep border border-western-green-deep/40 hover:bg-western-cream"
          >
            <FileDown className="h-3 w-3" /> Baixar PDF (admin)
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 font-mono text-[10px] uppercase tracking-[0.22em] bg-western-green-deep text-western-cream hover:bg-western-green-deep/90 disabled:opacity-50"
          >
            <Save className="h-3 w-3" /> {saving ? "Salvando…" : "Salvar e sincronizar"}
          </button>
        </div>
      </div>

      {/* Histórico + nota manual */}
      <div className="border border-western-stone-warm/15 bg-white p-5">
        <p className="text-eyebrow mb-3">Histórico (sincronizado em tempo real com o cliente)</p>

        <div className="flex gap-2 mb-4">
          <input
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Publicar uma nota visível ao parceiro (sem mudar status)…"
            className="ui-input flex-1"
            onKeyDown={(e) => e.key === "Enter" && postNote()}
          />
          <button
            onClick={postNote}
            disabled={postingNote || !newNote.trim()}
            className="inline-flex items-center gap-1.5 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.22em] bg-western-gold text-western-green-deep hover:bg-western-gold/90 disabled:opacity-40"
          >
            <Send className="h-3 w-3" /> Publicar
          </button>
        </div>

        {events.length === 0 ? (
          <p className="text-sm text-western-stone-warm">Nenhuma atualização registrada.</p>
        ) : (
          <ul className="space-y-3">
            {events.map((ev) => (
              <li key={ev.id} className="flex gap-3 text-sm">
                <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-western-gold mt-2" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    {ev.status && <StatusBadge status={ev.status} />}
                    <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-western-stone-warm">
                      {fmtDateTime(ev.created_at)}
                    </span>
                  </div>
                  {ev.note && (
                    <p className="text-western-green-deep mt-1.5 leading-relaxed whitespace-pre-line">
                      {ev.note}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className="text-xs text-western-stone-warm">
        ✉️ Notificações por e-mail ao cliente serão adicionadas em breve. Por enquanto, toda alteração
        já aparece em tempo real na conta do parceiro.
      </p>
    </div>
  );
}

function Field({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <label className={`block ${full ? "md:col-span-2" : ""}`}>
      <span className="block font-mono text-[10px] uppercase tracking-[0.22em] text-western-stone-warm mb-1.5">
        {label}
      </span>
      {children}
    </label>
  );
}

// ─────────────────────────────────────────────────────────────
// Modal de criação
// ─────────────────────────────────────────────────────────────
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

  const create = async () => {
    if (!form.user_id || !form.numero.trim() || !form.titulo.trim()) {
      toast.error("Preencha parceiro, número e título");
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
      toast.error("Erro ao criar: " + error.message);
      return;
    }
    toast.success("Pedido criado · sincronizado com a conta do parceiro");
    onCreated(data as ProductionOrder);
  };

  return (
    <div className="fixed inset-0 z-50 bg-western-green-deep/60 flex items-center justify-center p-4">
      <div className="bg-white max-w-lg w-full p-6 border border-western-stone-warm/30 max-h-[90vh] overflow-y-auto">
        <p className="text-eyebrow mb-1">Novo pedido</p>
        <h3 className="font-display text-xl text-western-green-deep mb-4">Criar pedido de produção</h3>

        <div className="space-y-3">
          <Field label="Parceiro">
            <select
              value={form.user_id}
              onChange={(e) => setForm({ ...form, user_id: e.target.value })}
              className="ui-input"
            >
              {partners.map((p) => (
                <option key={p.user_id} value={p.user_id}>
                  {p.empresa || p.nome || p.user_id.slice(0, 8)}{p.cidade ? ` · ${p.cidade}` : ""}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Número do pedido">
            <input
              value={form.numero}
              onChange={(e) => setForm({ ...form, numero: e.target.value })}
              className="ui-input"
              placeholder="Ex.: 2026-001"
            />
          </Field>

          <Field label="Título / descrição curta">
            <input
              value={form.titulo}
              onChange={(e) => setForm({ ...form, titulo: e.target.value })}
              className="ui-input"
              placeholder="Ex.: Composição Atelier Jardim"
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Modo">
              <select
                value={form.modo_entrega}
                onChange={(e) => setForm({ ...form, modo_entrega: e.target.value as Modo })}
                className="ui-input"
              >
                <option value="frete">Frete</option>
                <option value="retirada">Retirada</option>
              </select>
            </Field>
            <Field label="Prazo (dias úteis)">
              <input
                type="number"
                min={1}
                value={form.prazo_dias_uteis}
                onChange={(e) => setForm({ ...form, prazo_dias_uteis: Number(e.target.value) })}
                className="ui-input"
              />
            </Field>
          </div>

          <Field label="Valor total (R$) — opcional">
            <input
              type="number"
              step="0.01"
              value={form.valor_total}
              onChange={(e) => setForm({ ...form, valor_total: e.target.value })}
              className="ui-input"
            />
          </Field>
        </div>

        <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-western-stone-warm/15">
          <button
            onClick={onClose}
            className="px-4 py-2 font-mono text-[10px] uppercase tracking-[0.22em] text-western-stone-warm hover:text-western-green-deep"
          >
            Cancelar
          </button>
          <button
            onClick={create}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2 font-mono text-[10px] uppercase tracking-[0.22em] bg-western-green-deep text-western-cream hover:bg-western-green-deep/90 disabled:opacity-50"
          >
            <Plus className="h-3 w-3" /> {saving ? "Criando…" : "Criar pedido"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Página principal
// ─────────────────────────────────────────────────────────────
export default function AdminPedidos() {
  const [orders, setOrders] = useState<ProductionOrder[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"todos" | "ativos" | "concluidos">("ativos");
  const [search, setSearch] = useState("");
  const [creating, setCreating] = useState(false);
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [bulkStatus, setBulkStatus] = useState<Status | "">("");
  const [bulkModo, setBulkModo] = useState<Modo | "">("");
  const [bulkNote, setBulkNote] = useState("");
  const [bulkApplying, setBulkApplying] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const [ordersRes, partnersRes] = await Promise.all([
        supabase.from("production_orders").select("*").order("created_at", { ascending: false }),
        supabase
          .from("partner_profiles")
          .select("user_id,nome,empresa,cidade")
          .eq("status", "approved")
          .order("empresa"),
      ]);
      if (!mounted) return;
      setOrders((ordersRes.data as ProductionOrder[]) ?? []);
      setPartners((partnersRes.data as Partner[]) ?? []);
      setLoading(false);
    })();

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

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  const partnerById = useMemo(() => {
    const map = new Map<string, Partner>();
    partners.forEach((p) => map.set(p.user_id, p));
    return map;
  }, [partners]);

  const visible = useMemo(() => {
    const concluidos: Status[] = ["entregue", "retirado", "cancelado"];
    let list = orders;
    if (filter === "ativos") list = list.filter((o) => !concluidos.includes(o.status));
    if (filter === "concluidos") list = list.filter((o) => concluidos.includes(o.status));
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter((o) => {
        const p = partnerById.get(o.user_id);
        return (
          o.numero.toLowerCase().includes(q) ||
          o.titulo.toLowerCase().includes(q) ||
          (p?.empresa ?? "").toLowerCase().includes(q) ||
          (p?.nome ?? "").toLowerCase().includes(q)
        );
      });
    }
    return list;
  }, [orders, filter, search, partnerById]);

  const visibleIds = useMemo(() => visible.map((o) => o.id), [visible]);
  const checkedVisible = useMemo(
    () => visibleIds.filter((id) => checked.has(id)),
    [visibleIds, checked],
  );
  const allVisibleChecked = visibleIds.length > 0 && checkedVisible.length === visibleIds.length;

  const toggleOne = (id: string) =>
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  const toggleAllVisible = () =>
    setChecked((prev) => {
      const next = new Set(prev);
      if (allVisibleChecked) visibleIds.forEach((id) => next.delete(id));
      else visibleIds.forEach((id) => next.add(id));
      return next;
    });
  const clearChecked = () => setChecked(new Set());

  const applyBulk = async () => {
    const ids = Array.from(checked);
    if (ids.length === 0) return;
    const note = bulkNote.trim();
    if (!bulkStatus && !bulkModo && !note) {
      toast.error("Escolha ao menos uma alteração");
      return;
    }
    setBulkApplying(true);
    try {
      // 1. Atualização de campos (status / modo)
      if (bulkStatus || bulkModo) {
        const patch: { status?: Status; modo_entrega?: Modo } = {};
        if (bulkStatus) patch.status = bulkStatus;
        if (bulkModo) patch.modo_entrega = bulkModo;
        const { error } = await supabase
          .from("production_orders")
          .update(patch)
          .in("id", ids);
        if (error) throw error;
      }
      // 2. Observação anexada como evento (visível ao parceiro)
      if (note) {
        const events = ids.map((order_id) => ({
          order_id,
          status: bulkStatus || null,
          note,
        }));
        const { error } = await supabase.from("production_order_events").insert(events);
        if (error) throw error;
      }
      toast.success(`${ids.length} pedido(s) atualizado(s) e sincronizado(s)`);
      setBulkStatus("");
      setBulkModo("");
      setBulkNote("");
      clearChecked();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro desconhecido";
      toast.error("Falha em lote: " + msg);
    } finally {
      setBulkApplying(false);
    }
  };

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
          setChecked((prev) => {
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
      <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
        <div>
          <p className="text-eyebrow mb-2">Pedidos · produção e logística</p>
          <h1 className="font-display text-3xl text-western-green-deep">Status dos pedidos</h1>
          <p className="text-sm text-western-stone-warm mt-1 max-w-2xl">
            Atualize status, prazos, rastreio e observações. Tudo é sincronizado em tempo real com a
            conta do parceiro.
          </p>
        </div>
        <button
          onClick={() => setCreating(true)}
          disabled={partners.length === 0}
          className="inline-flex items-center gap-2 px-5 py-2.5 font-mono text-[10px] uppercase tracking-[0.22em] bg-western-green-deep text-western-cream hover:bg-western-green-deep/90 disabled:opacity-40"
        >
          <Plus className="h-4 w-4" /> Novo pedido
        </button>
      </div>

      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="flex items-center gap-2 border-b border-western-stone-warm/15">
          {(["ativos", "concluidos", "todos"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 font-mono text-[10px] uppercase tracking-[0.22em] border-b-2 -mb-px transition-colors ${
                filter === f
                  ? "border-western-gold text-western-green-deep"
                  : "border-transparent text-western-stone-warm hover:text-western-green-deep"
              }`}
            >
              {f === "ativos" ? "Ativos" : f === "concluidos" ? "Concluídos" : "Todos"}
            </button>
          ))}
        </div>
        <div className="relative ml-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-western-stone-warm" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar nº, título ou parceiro…"
            className="ui-input pl-9 w-72 max-w-full"
          />
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-western-stone-warm">Carregando…</p>
      ) : visible.length === 0 ? (
        <div className="border border-dashed border-western-stone-warm/30 bg-white p-10 text-center">
          <p className="text-western-stone-warm mb-3">
            {orders.length === 0
              ? "Nenhum pedido de produção ainda — crie o primeiro."
              : "Nenhum pedido encontrado com esses filtros."}
          </p>
          {partners.length === 0 ? (
            <p className="text-xs text-western-stone-warm">
              Aprove parceiros primeiro para poder criar pedidos.
            </p>
          ) : (
            <button
              onClick={() => setCreating(true)}
              className="inline-flex items-center gap-2 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.22em] bg-western-green-deep text-western-cream hover:bg-western-green-deep/90"
            >
              <Plus className="h-3 w-3" /> Criar primeiro pedido
            </button>
          )}
        </div>
      ) : (
        <div className="border border-western-stone-warm/15 bg-white">
          {/* Cabeçalho com seleção em lote */}
          <div className="flex items-center gap-3 px-4 py-2.5 border-b border-western-stone-warm/15 bg-western-cream/30">
            <input
              type="checkbox"
              checked={allVisibleChecked}
              ref={(el) => {
                if (el) el.indeterminate = checkedVisible.length > 0 && !allVisibleChecked;
              }}
              onChange={toggleAllVisible}
              className="h-4 w-4 accent-western-gold cursor-pointer"
              aria-label="Selecionar todos"
            />
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-western-stone-warm">
              {checked.size > 0
                ? `${checked.size} selecionado(s)`
                : `${visible.length} pedido(s)`}
            </span>
          </div>

          <div className="divide-y divide-western-stone-warm/10">
            {visible.map((o) => {
              const p = partnerById.get(o.user_id);
              const isChecked = checked.has(o.id);
              return (
                <div
                  key={o.id}
                  className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                    isChecked ? "bg-western-gold/5" : "hover:bg-western-cream/40"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleOne(o.id)}
                    onClick={(e) => e.stopPropagation()}
                    className="h-4 w-4 accent-western-gold cursor-pointer flex-shrink-0"
                    aria-label={`Selecionar pedido ${o.numero}`}
                  />
                  <button
                    type="button"
                    onClick={() => setSelectedId(o.id)}
                    className="flex-1 min-w-0 text-left flex items-center gap-4"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-western-stone-warm">
                          Nº {o.numero}
                        </span>
                        <StatusBadge status={o.status} />
                        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-western-stone-warm">
                          {o.modo_entrega === "retirada" ? "Retirada" : "Frete"}
                        </span>
                      </div>
                      <p className="font-display text-base text-western-green-deep truncate mt-1">
                        {o.titulo}
                      </p>
                      <p className="text-xs text-western-stone-warm mt-0.5 truncate">
                        {p?.empresa || p?.nome || o.user_id.slice(0, 8)}
                        {p?.cidade ? ` · ${p.cidade}` : ""}
                      </p>
                    </div>
                    <div className="text-right hidden sm:block">
                      <p className="text-xs text-western-stone-warm">
                        {o.modo_entrega === "retirada" ? "Disponível" : "Previsão"}
                      </p>
                      <p className="font-mono text-xs text-western-green-deep">
                        {fmtDate(o.previsao_entrega)}
                      </p>
                    </div>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Barra flutuante de ações em lote */}
      {checked.size > 0 && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[min(960px,calc(100vw-2rem))] bg-western-green-deep text-western-cream border border-western-gold/30 shadow-2xl">
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-western-gold/20">
            <Layers className="h-4 w-4 text-western-gold-soft" />
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-western-gold-soft">
              Ações em lote · {checked.size} pedido(s)
            </p>
            <button
              onClick={clearChecked}
              className="ml-auto inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.2em] text-western-cream/70 hover:text-western-cream"
            >
              <X className="h-3 w-3" /> Limpar
            </button>
          </div>
          <div className="p-4 grid grid-cols-1 md:grid-cols-[170px_140px_1fr_auto] gap-2 items-start">
            <select
              value={bulkStatus}
              onChange={(e) => setBulkStatus(e.target.value as Status | "")}
              className="ui-input text-western-green-deep"
              aria-label="Novo status"
            >
              <option value="">— Manter status —</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{STATUS_META[s].label}</option>
              ))}
            </select>
            <select
              value={bulkModo}
              onChange={(e) => setBulkModo(e.target.value as Modo | "")}
              className="ui-input text-western-green-deep"
              aria-label="Modo de entrega"
            >
              <option value="">— Manter modo —</option>
              <option value="frete">Frete</option>
              <option value="retirada">Retirada</option>
            </select>
            <textarea
              value={bulkNote}
              onChange={(e) => setBulkNote(e.target.value)}
              placeholder="Observação anexada como evento (opcional, visível ao parceiro)…"
              className="ui-input text-western-green-deep min-h-[42px] max-h-32"
              rows={1}
            />
            <button
              onClick={applyBulk}
              disabled={bulkApplying}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 font-mono text-[10px] uppercase tracking-[0.22em] bg-western-gold text-western-green-deep hover:bg-western-gold/90 disabled:opacity-50 whitespace-nowrap h-[42px]"
            >
              <Save className="h-3 w-3" /> {bulkApplying ? "Aplicando…" : "Aplicar"}
            </button>
          </div>
        </div>
      )}

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
