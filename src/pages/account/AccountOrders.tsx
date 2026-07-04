import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  ShoppingBag,
  Package,
  Truck,
  Factory,
  CheckCircle2,
  Clock,
  XCircle,
  ChevronRight,
  ArrowLeft,
  Copy,
  ExternalLink,
  FileDown,
} from "lucide-react";
import { toast } from "sonner";
import { formatBRL } from "@/lib/catalog/client";
import { downloadPedidoPdf } from "@/lib/pdf/pedidoPdf";
import { useCartStore, type CartItem } from "@/stores/cartStore";

function mapOrderItensToCart(itens: unknown): CartItem[] {
  if (!Array.isArray(itens)) return [];
  const out: CartItem[] = [];
  for (const rawIt of itens) {
    if (!rawIt || typeof rawIt !== "object") continue;
    const raw = rawIt as Record<string, unknown>;
    const variantId =
      (typeof raw.variantId === "string" && raw.variantId) ||
      (typeof raw.variant_id === "string" && raw.variant_id) ||
      (typeof raw.id === "string" && raw.id) ||
      "";
    if (!variantId) continue;
    const priceRaw = raw.price as Record<string, unknown> | undefined;
    const amount =
      priceRaw && typeof priceRaw.amount === "string"
        ? priceRaw.amount
        : priceRaw && typeof priceRaw.amount === "number"
        ? String(priceRaw.amount)
        : typeof raw.price === "number"
        ? String(raw.price)
        : "0";
    const currencyCode =
      priceRaw && typeof priceRaw.currencyCode === "string" ? priceRaw.currencyCode : "BRL";
    const options = (raw.selectedOptions ?? raw.options) as unknown;
    const selectedOptions = Array.isArray(options)
      ? options.filter(
          (o): o is { name: string; value: string } =>
            !!o && typeof o === "object" && typeof (o as { name?: unknown }).name === "string" &&
            typeof (o as { value?: unknown }).value === "string",
        )
      : [];
    const wooAttrs = raw.wooAttributes;
    out.push({
      productHandle:
        typeof raw.productHandle === "string" ? raw.productHandle : String(raw.handle ?? variantId),
      productTitle:
        typeof raw.productTitle === "string"
          ? raw.productTitle
          : typeof raw.title === "string"
          ? raw.title
          : "Item",
      productImage:
        typeof raw.productImage === "string"
          ? raw.productImage
          : typeof raw.image === "string"
          ? raw.image
          : null,
      variantId,
      variantTitle:
        typeof raw.variantTitle === "string" ? raw.variantTitle : "",
      price: { amount, currencyCode },
      quantity: typeof raw.qty === "number" ? raw.qty : typeof raw.quantity === "number" ? raw.quantity : 1,
      selectedOptions,
      wooParentProductId:
        typeof raw.wooParentProductId === "number" ? raw.wooParentProductId : undefined,
      wooVariationId:
        typeof raw.wooVariationId === "number" ? raw.wooVariationId : null,
      wooKind:
        raw.wooKind === "simple" || raw.wooKind === "variation" || raw.wooKind === "bundle"
          ? raw.wooKind
          : undefined,
      wooAttributes: Array.isArray(wooAttrs)
        ? wooAttrs.filter(
            (a): a is { slug: string; value: string } =>
              !!a && typeof a === "object" && typeof (a as { slug?: unknown }).slug === "string" &&
              typeof (a as { value?: unknown }).value === "string",
          )
        : [],
    });
  }
  return out;
}


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
  status: Status;
  modo_entrega: Modo;
  prazo_dias_uteis: number;
  produzir_ate: string | null;
  previsao_entrega: string | null;
  tracking_code: string | null;
  transportadora: string | null;
  endereco_entrega: string | null;
  valor_total: number | null;
  observacoes_cliente: string | null;
  itens?: unknown;
  created_at: string;
  updated_at: string;
}


interface OrderEvent {
  id: string;
  status: Status | null;
  note: string | null;
  created_at: string;
}

const STATUS_META: Record<Status, { label: string; tone: string; icon: typeof Clock }> = {
  aguardando: { label: "Aguardando início", tone: "text-western-stone-warm border-western-stone-warm/30 bg-western-stone-warm/5", icon: Clock },
  em_producao: { label: "Em produção", tone: "text-western-gold border-western-gold/40 bg-western-gold/10", icon: Factory },
  controle_qualidade: { label: "Controle de qualidade", tone: "text-western-gold border-western-gold/40 bg-western-gold/10", icon: CheckCircle2 },
  pronto: { label: "Pronto para envio/retirada", tone: "text-emerald-700 border-emerald-600/40 bg-emerald-50", icon: Package },
  em_transporte: { label: "Em transporte", tone: "text-blue-700 border-blue-600/40 bg-blue-50", icon: Truck },
  entregue: { label: "Entregue", tone: "text-emerald-700 border-emerald-600/40 bg-emerald-50", icon: CheckCircle2 },
  retirado: { label: "Retirado na fábrica", tone: "text-emerald-700 border-emerald-600/40 bg-emerald-50", icon: CheckCircle2 },
  cancelado: { label: "Cancelado", tone: "text-red-700 border-red-600/40 bg-red-50", icon: XCircle },
};

const TIMELINE_STEPS_FRETE: Status[] = ["aguardando", "em_producao", "controle_qualidade", "pronto", "em_transporte", "entregue"];
const TIMELINE_STEPS_RETIRADA: Status[] = ["aguardando", "em_producao", "controle_qualidade", "pronto", "retirado"];

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
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
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 border font-mono text-[10px] uppercase tracking-[0.2em] ${meta.tone}`}>
      <Icon className="h-3 w-3" /> {meta.label}
    </span>
  );
}

function ProgressTimeline({ order }: { order: ProductionOrder }) {
  const steps = order.modo_entrega === "retirada" ? TIMELINE_STEPS_RETIRADA : TIMELINE_STEPS_FRETE;
  const currentIdx = steps.indexOf(order.status);
  const isCancelled = order.status === "cancelado";

  return (
    <div className="border border-western-stone-warm/15 bg-white p-5 md:p-6">
      <p className="text-eyebrow mb-4">Linha de produção</p>
      {isCancelled ? (
        <p className="text-red-700 font-mono text-xs uppercase tracking-[0.2em]">Pedido cancelado</p>
      ) : (
        <ol className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {steps.map((s, i) => {
            const meta = STATUS_META[s];
            const reached = i <= currentIdx;
            const active = i === currentIdx;
            return (
              <li
                key={s}
                className={`relative border-l-2 pl-3 py-1 ${
                  reached ? "border-western-gold" : "border-western-stone-warm/20"
                }`}
              >
                <p
                  className={`font-mono text-[9px] uppercase tracking-[0.2em] ${
                    active ? "text-western-gold" : reached ? "text-western-green-deep" : "text-western-stone-warm/60"
                  }`}
                >
                  Etapa {i + 1}
                </p>
                <p
                  className={`text-xs leading-tight mt-0.5 ${
                    reached ? "text-western-green-deep font-medium" : "text-western-stone-warm/60"
                  }`}
                >
                  {meta.label}
                </p>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}

function OrderDetail({ order, onBack, onRepetir }: { order: ProductionOrder; onBack: () => void; onRepetir?: (order: ProductionOrder) => void }) {
  const [events, setEvents] = useState<OrderEvent[]>([]);
  const [loading, setLoading] = useState(true);

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
      setLoading(false);
    })();

    const channel = supabase
      .channel(`order-events-${order.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "production_order_events",
          filter: `order_id=eq.${order.id}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setEvents((prev) => [payload.new as OrderEvent, ...prev]);
          }
        },
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, [order.id]);

  const copyTracking = () => {
    if (!order.tracking_code) return;
    navigator.clipboard.writeText(order.tracking_code);
    toast.success("Código copiado");
  };

  const handleDownloadPdf = async () => {
    try {
      const filename = await downloadPedidoPdf({
        order,
        events,
        scenario: "cliente",
      });
      // Registra no perfil do cliente + evento + lead admin (best-effort).
      const { error: regError } = await supabase.rpc("register_pedido_pdf_download", {
        _order_id: order.id,
        _filename: filename,
      });
      if (regError) {
        console.warn("[pedido-pdf] register_pedido_pdf_download falhou", regError);
      }
      toast.success(`PDF baixado: ${filename}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "erro desconhecido";
      toast.error("Falha ao gerar PDF: " + msg);
    }
  };

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-western-stone-warm hover:text-western-green-deep transition-colors"
      >
        <ArrowLeft className="h-3 w-3" /> Voltar para pedidos
      </button>

      <div>
        <p className="text-eyebrow mb-2">
          Pedido Nº {order.numero} · atualizado {fmtDateTime(order.updated_at)}
        </p>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <h2 className="font-display text-3xl text-western-green-deep leading-tight">{order.titulo}</h2>
          <div className="flex items-center gap-2 flex-wrap">
            <StatusBadge status={order.status} />
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-western-green-deep border border-western-green-deep/30 hover:bg-western-cream disabled:opacity-50"
            >
              <FileDown className="h-3 w-3" /> Baixar PDF
            </button>
          </div>
        </div>
      </div>

      <ProgressTimeline order={order} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border border-western-stone-warm/15 bg-white p-5">
          <p className="text-eyebrow mb-2">Modo de entrega</p>
          <p className="font-display text-lg text-western-green-deep">
            {order.modo_entrega === "retirada" ? "Retirada na fábrica" : "Frete"}
          </p>
          {order.modo_entrega === "frete" && order.endereco_entrega && (
            <p className="text-sm text-western-stone-warm leading-relaxed mt-2">{order.endereco_entrega}</p>
          )}
        </div>

        <div className="border border-western-stone-warm/15 bg-white p-5">
          <p className="text-eyebrow mb-2">Prazos</p>
          <div className="space-y-1 text-sm">
            <p>
              <span className="text-western-stone-warm">Produção:</span>{" "}
              <span className="text-western-green-deep font-medium">{order.prazo_dias_uteis} dias úteis</span>
            </p>
            <p>
              <span className="text-western-stone-warm">Pronto até:</span>{" "}
              <span className="text-western-green-deep font-medium">{fmtDate(order.produzir_ate)}</span>
            </p>
            <p>
              <span className="text-western-stone-warm">
                {order.modo_entrega === "retirada" ? "Disponível em:" : "Previsão de entrega:"}
              </span>{" "}
              <span className="text-western-green-deep font-medium">{fmtDate(order.previsao_entrega)}</span>
            </p>
          </div>
        </div>

        {order.modo_entrega === "frete" && (order.tracking_code || order.transportadora) && (
          <div className="border border-western-stone-warm/15 bg-white p-5 md:col-span-2">
            <p className="text-eyebrow mb-2">Rastreio</p>
            <div className="flex items-center gap-3 flex-wrap">
              {order.transportadora && (
                <span className="font-display text-base text-western-green-deep">{order.transportadora}</span>
              )}
              {order.tracking_code && (
                <>
                  <code className="font-mono text-sm bg-western-stone-warm/10 px-2 py-1 text-western-green-deep">
                    {order.tracking_code}
                  </code>
                  <button
                    onClick={copyTracking}
                    className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.2em] text-western-stone-warm hover:text-western-green-deep"
                  >
                    <Copy className="h-3 w-3" /> Copiar
                  </button>
                  {order.transportadora?.toLowerCase().includes("correios") && (
                    <a
                      href={`https://rastreamento.correios.com.br/app/index.php?objeto=${order.tracking_code}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.2em] text-western-gold hover:underline"
                    >
                      Acompanhar <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {order.observacoes_cliente && (
          <div className="border border-western-stone-warm/15 bg-white p-5 md:col-span-2">
            <p className="text-eyebrow mb-2">Observações</p>
            <p className="text-sm text-western-stone-warm leading-relaxed whitespace-pre-line">
              {order.observacoes_cliente}
            </p>
          </div>
        )}
      </div>

      <div className="border border-western-stone-warm/15 bg-white p-5 md:p-6">
        <p className="text-eyebrow mb-4">Histórico (tempo real)</p>
        {loading ? (
          <p className="text-sm text-western-stone-warm">Carregando…</p>
        ) : events.length === 0 ? (
          <p className="text-sm text-western-stone-warm">Nenhuma atualização ainda.</p>
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
                  {ev.note && <p className="text-western-green-deep mt-1.5 leading-relaxed">{ev.note}</p>}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function OrderCard({ order, onSelect }: { order: ProductionOrder; onSelect: () => void }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="w-full text-left border border-western-stone-warm/15 bg-white p-5 hover:border-western-gold/40 transition-colors group"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-western-stone-warm">
            Nº {order.numero} · {fmtDate(order.created_at)}
          </p>
          <h3 className="font-display text-lg text-western-green-deep mt-1 truncate">{order.titulo}</h3>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <StatusBadge status={order.status} />
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-western-stone-warm">
              {order.modo_entrega === "retirada" ? "Retirada" : "Frete"}
            </span>
          </div>
        </div>
        <ChevronRight className="h-5 w-5 text-western-stone-warm/40 group-hover:text-western-gold flex-shrink-0 mt-1" />
      </div>
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-western-stone-warm/10">
        <span className="text-xs text-western-stone-warm">
          {order.modo_entrega === "retirada" ? "Disponível em" : "Previsão"}:{" "}
          <span className="text-western-green-deep font-medium">{fmtDate(order.previsao_entrega)}</span>
        </span>
        {order.valor_total != null && (
          <span className="font-display text-base text-western-green-deep">
            {formatBRL(order.valor_total, "BRL")}
          </span>
        )}
      </div>
    </button>
  );
}

export default function AccountOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<ProductionOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"ativos" | "concluidos" | "todos">("ativos");

  useEffect(() => {
    if (!user) return;
    let mounted = true;

    (async () => {
      const { data } = await supabase
        .from("production_orders")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (!mounted) return;
      setOrders((data as ProductionOrder[]) ?? []);
      setLoading(false);
    })();

    // Realtime: atualizações nos pedidos do usuário
    const channel = supabase
      .channel(`partner-orders-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "production_orders",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          setOrders((prev) => {
            if (payload.eventType === "INSERT") {
              const next = payload.new as ProductionOrder;
              toast.success(`Novo pedido Nº ${next.numero}`);
              return [next, ...prev.filter((o) => o.id !== next.id)];
            }
            if (payload.eventType === "UPDATE") {
              const next = payload.new as ProductionOrder;
              const old = prev.find((o) => o.id === next.id);
              if (old && old.status !== next.status) {
                toast.success(`Pedido Nº ${next.numero}: ${STATUS_META[next.status].label}`);
              }
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
  }, [user]);

  const selected = useMemo(() => orders.find((o) => o.id === selectedId) ?? null, [orders, selectedId]);

  const visible = useMemo(() => {
    if (filter === "todos") return orders;
    const concluidos: Status[] = ["entregue", "retirado", "cancelado"];
    return orders.filter((o) =>
      filter === "concluidos" ? concluidos.includes(o.status) : !concluidos.includes(o.status),
    );
  }, [orders, filter]);

  if (selected) return <OrderDetail order={selected} onBack={() => setSelectedId(null)} />;

  return (
    <div>
      <p className="text-eyebrow mb-3">Pedidos</p>
      <h2 className="font-display text-3xl text-western-green-deep mb-2">Status de produção e logística</h2>
      <p className="text-western-stone-warm mb-8 max-w-2xl">
        Acompanhe em tempo real cada pedido — produção (15 dias úteis padrão), controle de qualidade,
        liberação para retirada na fábrica ou envio com transportadora.
      </p>

      <div className="flex items-center gap-2 mb-6 border-b border-western-stone-warm/15">
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
            {f === "ativos" && (
              <span className="ml-1.5 text-western-stone-warm">
                ({orders.filter((o) => !["entregue", "retirado", "cancelado"].includes(o.status)).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-western-stone-warm">Carregando pedidos…</p>
      ) : visible.length === 0 ? (
        <div className="border border-dashed border-western-stone-warm/30 p-10 text-center bg-white">
          <ShoppingBag className="h-8 w-8 text-western-stone-warm/40 mx-auto mb-4" />
          <p className="text-western-stone-warm max-w-md mx-auto">
            {filter === "ativos"
              ? "Nenhum pedido em produção no momento. Quando seu próximo pedido for confirmado, ele aparece aqui com atualizações em tempo real."
              : "Nada por aqui ainda."}
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {visible.map((o) => (
            <li key={o.id}>
              <OrderCard order={o} onSelect={() => setSelectedId(o.id)} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
