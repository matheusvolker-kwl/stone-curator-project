import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Check, Copy, ExternalLink, FileDown, Loader2, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { formatBRL } from "@/lib/catalog/client";
import { downloadPedidoPdf } from "@/lib/pdf/pedidoPdf";
import { useCartStore, type CartItem } from "@/stores/cartStore";
import {
  CelulaData,
  DataTable,
  EstadoCarregando,
  EstadoErro,
  PageHeader,
  StatusBadge,
  Tabs,
  dataCurta,
  rotuloStatus,
  type Coluna,
} from "@/components/backoffice";

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

const CONCLUIDOS: Status[] = ["entregue", "retirado", "cancelado"];

const TIMELINE_FRETE: Status[] = [
  "aguardando",
  "em_producao",
  "controle_qualidade",
  "pronto",
  "em_transporte",
  "entregue",
];
const TIMELINE_RETIRADA: Status[] = [
  "aguardando",
  "em_producao",
  "controle_qualidade",
  "pronto",
  "retirado",
];

/** O próximo passo em português — o parceiro lê o que ACONTECE, não o código do status. */
function proximoPasso(order: ProductionOrder): string {
  switch (order.status) {
    case "aguardando":
      return `Seu pedido entrou na fila do ateliê. A produção leva ${order.prazo_dias_uteis} dias úteis a partir do início.`;
    case "em_producao":
      return "As peças estão sendo produzidas à mão no ateliê. Avisamos aqui quando forem para a conferência.";
    case "controle_qualidade":
      return "As peças estão na conferência final. É a última etapa antes da liberação.";
    case "pronto":
      return order.modo_entrega === "retirada"
        ? "Pronto para retirada na fábrica. Combine o horário com o time antes de ir."
        : "Pronto e embalado. Aguardando a coleta da transportadora.";
    case "em_transporte":
      return "A caminho. Acompanhe pelo código de rastreio abaixo.";
    case "entregue":
      return "Entregue. Se algo chegou avariado, fale com o time em até 7 dias.";
    case "retirado":
      return "Retirado na fábrica. Pedido concluído.";
    case "cancelado":
      return "Pedido cancelado. Fale com o time se isso não estiver certo.";
    default:
      return "Acompanhe as atualizações abaixo.";
  }
}

async function copiar(texto: string) {
  try {
    await navigator.clipboard.writeText(texto);
    toast.success("Código copiado");
  } catch {
    // Contexto não-seguro ou permissão negada: antes isso falhava calado.
    toast.error("Não consegui copiar. Selecione o código e copie manualmente.");
  }
}

/* ─────────────────────────────────────────────────────────────
 * Detalhe
 * ───────────────────────────────────────────────────────────── */

function LinhaDeProducao({ order }: { order: ProductionOrder }) {
  const etapas = order.modo_entrega === "retirada" ? TIMELINE_RETIRADA : TIMELINE_FRETE;
  const atual = etapas.indexOf(order.status);

  if (order.status === "cancelado") {
    return (
      <div className="rounded-xl border border-status-error/35 bg-status-error/[0.06] p-5">
        <p className="text-eyebrow mb-2">Linha de produção</p>
        <p className="text-[16px] font-semibold text-status-error">Pedido cancelado</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-western-border-soft bg-white p-5 md:p-6">
      <p className="text-eyebrow mb-5">Linha de produção</p>
      <ol className="space-y-0">
        {etapas.map((etapa, i) => {
          const alcancada = i <= atual;
          const ativa = i === atual;
          const ultima = i === etapas.length - 1;
          return (
            <li key={etapa} className="flex gap-4">
              <div className="flex flex-col items-center">
                <span
                  className={
                    alcancada
                      ? "flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-western-cta text-western-cream"
                      : "flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border-2 border-western-border-strong bg-white"
                  }
                >
                  {alcancada && <Check className="h-3.5 w-3.5" aria-hidden="true" />}
                </span>
                {!ultima && (
                  <span
                    className={
                      i < atual
                        ? "w-0.5 flex-1 bg-western-cta"
                        : "w-0.5 flex-1 bg-western-border-soft"
                    }
                    style={{ minHeight: "28px" }}
                  />
                )}
              </div>

              <div className={ultima ? "pb-0 pt-0.5" : "pb-5 pt-0.5"}>
                <p
                  className={
                    ativa
                      ? "text-[16px] font-semibold text-western-green-deep"
                      : alcancada
                      ? "text-[15px] font-semibold text-western-green-deep/75"
                      : "text-[15px] text-western-stone-warm"
                  }
                >
                  {rotuloStatus(etapa)}
                </p>
                {ativa && <p className="text-meta mt-1">Etapa atual</p>}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function CardAcao({
  order,
  onRepetir,
  onBaixarPdf,
  baixando,
}: {
  order: ProductionOrder;
  onRepetir: () => void;
  onBaixarPdf: () => void;
  baixando: boolean;
}) {
  const podeRepetir = Array.isArray(order.itens) && order.itens.length > 0;
  const rastreavel =
    order.modo_entrega === "frete" && Boolean(order.tracking_code || order.transportadora);

  return (
    <div className="rounded-xl border border-western-border-soft bg-western-paper p-5 md:sticky md:top-6">
      <p className="text-eyebrow mb-3">Situação</p>
      <StatusBadge status={order.status} />
      <p className="text-body mt-3">{proximoPasso(order)}</p>

      <dl className="mt-5 space-y-2 border-t border-western-border-soft pt-5">
        <div className="flex items-baseline justify-between gap-4">
          <dt className="text-meta">Entrega</dt>
          <dd className="text-[15px] font-semibold text-western-green-deep">
            {order.modo_entrega === "retirada" ? "Retirada na fábrica" : "Frete"}
          </dd>
        </div>
        <div className="flex items-baseline justify-between gap-4">
          <dt className="text-meta">
            {order.modo_entrega === "retirada" ? "Disponível em" : "Previsão"}
          </dt>
          <dd className="text-[15px] font-semibold tabular-nums text-western-green-deep">
            {dataCurta(order.previsao_entrega)}
          </dd>
        </div>
        {order.valor_total != null && (
          <div className="flex items-baseline justify-between gap-4">
            <dt className="text-meta">Total</dt>
            <dd className="text-[16px] font-semibold tabular-nums text-western-green-deep">
              {formatBRL(order.valor_total, "BRL")}
            </dd>
          </div>
        )}
      </dl>

      {rastreavel && (
        <div className="mt-5 border-t border-western-border-soft pt-5">
          <p className="text-eyebrow mb-2">Rastreio</p>
          {order.transportadora && (
            <p className="text-[15px] font-semibold text-western-green-deep">{order.transportadora}</p>
          )}
          {order.tracking_code ? (
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="rounded-sm bg-white px-2.5 py-1.5 text-[15px] font-semibold tabular-nums text-western-green-deep">
                {order.tracking_code}
              </span>
              <button
                type="button"
                onClick={() => void copiar(order.tracking_code as string)}
                className="tap-target inline-flex items-center gap-1.5 rounded-lg px-2 text-[15px] font-semibold text-western-stone-warm transition-colors hover:text-western-green-deep"
              >
                <Copy className="h-4 w-4" aria-hidden="true" />
                Copiar
              </button>
              {order.transportadora?.toLowerCase().includes("correios") && (
                <a
                  href={`https://rastreamento.correios.com.br/app/index.php?objeto=${order.tracking_code}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="tap-target inline-flex items-center gap-1.5 rounded-lg px-2 text-[15px] font-semibold text-western-bronze transition-colors hover:text-western-green-deep"
                >
                  Acompanhar
                  <ExternalLink className="h-4 w-4" aria-hidden="true" />
                </a>
              )}
            </div>
          ) : (
            <p className="text-meta mt-1">Aguardando o código da transportadora.</p>
          )}
        </div>
      )}

      <div className="mt-6 space-y-3 border-t border-western-border-soft pt-5">
        {podeRepetir && (
          <button type="button" onClick={onRepetir} className="btn-primary tap-target w-full">
            <RotateCcw className="mr-2 inline h-4 w-4" aria-hidden="true" />
            Pedir de novo
          </button>
        )}
        <button
          type="button"
          onClick={onBaixarPdf}
          disabled={baixando}
          className="btn-outline-forest tap-target w-full disabled:opacity-50"
        >
          {baixando ? (
            <Loader2 className="mr-2 inline h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <FileDown className="mr-2 inline h-4 w-4" aria-hidden="true" />
          )}
          Baixar PDF do pedido
        </button>
        {podeRepetir && (
          <p className="text-meta">
            "Pedir de novo" recoloca as mesmas peças no carrinho — você ajusta quantidades antes de
            fechar.
          </p>
        )}
      </div>
    </div>
  );
}

function OrderDetail({
  order,
  onRepetir,
}: {
  order: ProductionOrder;
  onRepetir: (order: ProductionOrder) => void;
}) {
  const [events, setEvents] = useState<OrderEvent[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<unknown>(null);
  const [baixando, setBaixando] = useState(false);

  /**
   * Guarda de corrida: trocar de pedido dispara uma nova busca, e a resposta
   * lenta do pedido ANTERIOR não pode sobrescrever a do atual (o parceiro veria
   * o histórico do pedido errado). Só a última requisição pode escrever no estado.
   */
  const reqRef = useRef(0);

  const carregarEventos = useCallback(async () => {
    const req = ++reqRef.current;
    setCarregando(true);
    setErro(null);

    const { data, error } = await supabase
      .from("production_order_events")
      .select("id,status,note,created_at")
      .eq("order_id", order.id)
      .order("created_at", { ascending: false });

    if (req !== reqRef.current) return; // resposta obsoleta — descarta.

    if (error) setErro(error);
    else setEvents((data as OrderEvent[]) ?? []);
    setCarregando(false);
  }, [order.id]);

  useEffect(() => {
    setEvents([]); // não mostrar o histórico do pedido anterior enquanto carrega.
    void carregarEventos();

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
          if (payload.eventType !== "INSERT") return;
          const novo = payload.new as OrderEvent;
          setEvents((prev) => (prev.some((e) => e.id === novo.id) ? prev : [novo, ...prev]));
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [order.id, carregarEventos]);

  const baixarPdf = async () => {
    setBaixando(true);
    try {
      const filename = await downloadPedidoPdf({ order, events, scenario: "cliente" });
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
      toast.error("Falha ao gerar o PDF: " + msg);
    } finally {
      setBaixando(false);
    }
  };

  return (
    <div>
      <PageHeader
        voltar={{ to: "/minha-conta/pedidos", label: "Pedidos" }}
        eyebrow={`Pedido nº ${order.numero} · atualizado ${dataCurta(order.updated_at)}`}
        titulo={order.titulo}
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_340px]">
        {/* Coluna de dados */}
        <div className="order-2 space-y-5 lg:order-1">
          <LinhaDeProducao order={order} />

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="rounded-xl border border-western-border-soft bg-white p-5">
              <p className="text-eyebrow mb-3">Prazos</p>
              <dl className="space-y-2">
                <div className="flex items-baseline justify-between gap-4">
                  <dt className="text-meta">Produção</dt>
                  <dd className="text-[15px] font-semibold tabular-nums text-western-green-deep">
                    {order.prazo_dias_uteis} dias úteis
                  </dd>
                </div>
                <div className="flex items-baseline justify-between gap-4">
                  <dt className="text-meta">Pronto até</dt>
                  <dd className="text-[15px] font-semibold tabular-nums text-western-green-deep">
                    {dataCurta(order.produzir_ate)}
                  </dd>
                </div>
                <div className="flex items-baseline justify-between gap-4">
                  <dt className="text-meta">Pedido feito</dt>
                  <dd className="text-[15px] font-semibold text-western-green-deep">
                    <CelulaData valor={order.created_at} />
                  </dd>
                </div>
              </dl>
            </div>

            <div className="rounded-xl border border-western-border-soft bg-white p-5">
              <p className="text-eyebrow mb-3">
                {order.modo_entrega === "retirada" ? "Retirada" : "Endereço de entrega"}
              </p>
              {order.modo_entrega === "retirada" ? (
                <p className="text-body">
                  Retirada na fábrica. Combine o horário com o time antes de ir.
                </p>
              ) : order.endereco_entrega ? (
                <p className="text-body whitespace-pre-line">{order.endereco_entrega}</p>
              ) : (
                <p className="text-meta">Endereço ainda não informado.</p>
              )}
            </div>
          </div>

          {order.observacoes_cliente && (
            <div className="rounded-xl border border-western-border-soft bg-white p-5">
              <p className="text-eyebrow mb-3">Observações</p>
              <p className="text-body whitespace-pre-line">{order.observacoes_cliente}</p>
            </div>
          )}

          <div className="rounded-xl border border-western-border-soft bg-white p-5 md:p-6">
            <p className="text-eyebrow mb-4">Histórico (tempo real)</p>

            {erro ? (
              <EstadoErro
                erro={erro}
                onRetry={() => void carregarEventos()}
                titulo="Não consegui carregar o histórico"
                compacto
              />
            ) : carregando ? (
              <EstadoCarregando linhas={3} />
            ) : events.length === 0 ? (
              <p className="text-body">
                Nenhuma atualização registrada ainda. Assim que o ateliê mexer no pedido, aparece
                aqui na hora.
              </p>
            ) : (
              <ul className="space-y-4">
                {events.map((ev) => (
                  <li key={ev.id} className="flex gap-3">
                    <span
                      className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-western-gold"
                      aria-hidden="true"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {ev.status && <StatusBadge status={ev.status} />}
                        <CelulaData valor={ev.created_at} className="text-meta" />
                      </div>
                      {ev.note && <p className="text-body mt-1.5">{ev.note}</p>}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Card de ação */}
        <div className="order-1 lg:order-2">
          <CardAcao
            order={order}
            onRepetir={() => onRepetir(order)}
            onBaixarPdf={() => void baixarPdf()}
            baixando={baixando}
          />
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
 * Lista
 * ───────────────────────────────────────────────────────────── */

type Aba = "ativos" | "concluidos" | "todos";

export default function AccountOrders() {
  const { user } = useAuth();
  const { addBundle } = useCartStore();
  const [params, setParams] = useSearchParams();
  const [orders, setOrders] = useState<ProductionOrder[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<unknown>(null);
  const [aba, setAba] = useState<Aba>("ativos");

  const selectedId = params.get("pedido");

  const abrirPedido = (id: string) => {
    setParams(
      (atual) => {
        const proximo = new URLSearchParams(atual);
        proximo.set("pedido", id);
        return proximo;
      },
      { preventScrollReset: false },
    );
  };

  const handleRepetir = (order: ProductionOrder) => {
    const brutos = Array.isArray(order.itens) ? order.itens.length : 0;
    const cartItems = mapOrderItensToCart(order.itens);

    if (cartItems.length === 0) {
      toast.error("Este pedido não tem peças que possam ser recolocadas no carrinho.");
      return;
    }

    // addBundle já dispara o toast de sucesso — não duplicamos.
    addBundle(cartItems);

    // Item que não mapeou é item que some. Antes isso passava calado.
    if (cartItems.length < brutos) {
      toast.warning(
        `${brutos - cartItems.length} peça(s) deste pedido não puderam ser recriadas. Confira o carrinho antes de fechar.`,
      );
    }
  };

  const carregar = useCallback(async () => {
    if (!user) return;
    setCarregando(true);
    setErro(null);

    const { data, error } = await supabase
      .from("production_orders")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) setErro(error);
    else setOrders((data as ProductionOrder[]) ?? []);
    setCarregando(false);
  }, [user]);

  useEffect(() => {
    if (!user) return;
    void carregar();

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
              toast.success(`Novo pedido nº ${next.numero}`);
              return [next, ...prev.filter((o) => o.id !== next.id)];
            }
            if (payload.eventType === "UPDATE") {
              const next = payload.new as ProductionOrder;
              const old = prev.find((o) => o.id === next.id);
              if (old && old.status !== next.status) {
                // rotuloStatus não quebra em status desconhecido (STATUS_META[x].label quebrava).
                toast.success(`Pedido nº ${next.numero}: ${rotuloStatus(next.status)}`);
              }
              return old ? prev.map((o) => (o.id === next.id ? next : o)) : [next, ...prev];
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
      supabase.removeChannel(channel);
    };
  }, [user, carregar]);

  const selected = useMemo(
    () => orders.find((o) => o.id === selectedId) ?? null,
    [orders, selectedId],
  );

  const ativos = useMemo(() => orders.filter((o) => !CONCLUIDOS.includes(o.status)), [orders]);
  const concluidos = useMemo(() => orders.filter((o) => CONCLUIDOS.includes(o.status)), [orders]);

  const visiveis = aba === "todos" ? orders : aba === "ativos" ? ativos : concluidos;

  const colunas: ReadonlyArray<Coluna<ProductionOrder>> = [
    {
      key: "titulo",
      header: "Pedido",
      principalNoMobile: true,
      sortable: true,
      render: (o) => (
        <div className="min-w-0">
          <p className="truncate font-semibold text-western-green-deep">{o.titulo}</p>
          <p className="text-meta tabular-nums">nº {o.numero}</p>
        </div>
      ),
    },
    {
      key: "status",
      header: "Situação",
      sortable: true,
      render: (o) => <StatusBadge status={o.status} />,
    },
    {
      key: "modo_entrega",
      header: "Entrega",
      sortable: true,
      ocultarNoMobile: true,
      render: (o) => (
        <span className="text-western-stone-warm">
          {o.modo_entrega === "retirada" ? "Retirada" : "Frete"}
        </span>
      ),
    },
    {
      key: "previsao_entrega",
      header: "Previsão",
      align: "right",
      sortable: true,
      sortValue: (o) => o.previsao_entrega,
      render: (o) => (
        <span className="text-western-green-deep">{dataCurta(o.previsao_entrega)}</span>
      ),
    },
    {
      key: "valor_total",
      header: "Total",
      align: "right",
      numerica: true,
      sortable: true,
      sortValue: (o) => o.valor_total,
      render: (o) =>
        o.valor_total != null ? (
          <span className="font-semibold">{formatBRL(o.valor_total, "BRL")}</span>
        ) : (
          <span className="text-western-stone-warm">—</span>
        ),
    },
    {
      key: "acao",
      header: "Recompra",
      align: "right",
      width: "150px",
      render: (o) =>
        Array.isArray(o.itens) && o.itens.length > 0 ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation(); // a linha inteira é clicável — não abrir o detalhe aqui.
              handleRepetir(o);
            }}
            className="tap-target inline-flex items-center justify-center gap-2 rounded-lg border border-western-green-deep/25 px-3 text-[15px] font-semibold text-western-green-deep transition-colors hover:bg-western-paper"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Pedir de novo
          </button>
        ) : (
          <span className="text-meta">—</span>
        ),
    },
  ];

  /* Detalhe. Enquanto a lista carrega não dá para saber se o id existe — segura o skeleton. */
  if (selectedId && selected) {
    return <OrderDetail order={selected} onRepetir={handleRepetir} />;
  }
  if (selectedId && carregando) {
    return (
      <div>
        <PageHeader voltar={{ to: "/minha-conta/pedidos", label: "Pedidos" }} titulo="Carregando pedido…" />
        <EstadoCarregando linhas={4} />
      </div>
    );
  }
  if (selectedId && erro) {
    return (
      <div>
        <PageHeader voltar={{ to: "/minha-conta/pedidos", label: "Pedidos" }} titulo="Pedido" />
        <EstadoErro erro={erro} onRetry={() => void carregar()} />
      </div>
    );
  }
  if (selectedId && !selected) {
    return (
      <div>
        <PageHeader voltar={{ to: "/minha-conta/pedidos", label: "Pedidos" }} titulo="Pedido não encontrado" />
        <p className="text-body">
          Este pedido não existe ou não está na sua conta.{" "}
          <Link
            to="/minha-conta/pedidos"
            className="font-semibold text-western-green-deep underline underline-offset-2"
          >
            Ver todos os pedidos
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        eyebrow="Meus pedidos"
        titulo="Produção e entrega"
        subtitulo="Acompanhe cada pedido em tempo real — fila do ateliê, produção, conferência e liberação para retirada ou envio."
        /* Rastreio saiu do menu (arquitetura 2026-07-18) e virou sub-destino
           daqui — códigos e transportadora a um clique de quem acompanha. */
        acao={
          <Link to="/minha-conta/rastreio" className="btn-outline-forest tap-target">
            Rastreio e códigos
          </Link>
        }
      />

      <Tabs
        className="mb-6"
        abas={[
          { key: "ativos", label: "Em andamento", count: carregando ? undefined : ativos.length },
          { key: "concluidos", label: "Concluídos", count: carregando ? undefined : concluidos.length },
          { key: "todos", label: "Todos", count: carregando ? undefined : orders.length },
        ]}
        ativa={aba}
        onChange={(k) => setAba(k as Aba)}
      />

      <DataTable
        linhas={visiveis}
        colunas={colunas}
        getId={(o) => o.id}
        isLoading={carregando}
        error={erro}
        onRetry={() => void carregar()}
        onRowClick={(o) => abrirPedido(o.id)}
        vazio={{
          titulo:
            aba === "ativos"
              ? "Nenhum pedido em produção"
              : aba === "concluidos"
              ? "Nenhum pedido concluído ainda"
              : "Nenhum pedido ainda",
          mensagem:
            aba === "ativos"
              ? "Quando seu próximo pedido for confirmado, ele aparece aqui com atualizações em tempo real."
              : "Assim que um pedido for entregue ou retirado, ele fica guardado aqui.",
          acao:
            aba !== "concluidos" ? (
              <Link to="/produtos" className="btn-primary tap-target inline-flex items-center px-6">
                Montar uma composição
              </Link>
            ) : undefined,
        }}
      />
    </div>
  );
}
