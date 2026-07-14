import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { usePartnerPricing } from "@/hooks/usePartnerPricing";
import { DataTable, type Coluna, CelulaData, PageHeader, StatusBadge } from "@/components/backoffice";

/**
 * Amostras = os pedidos de kit do parceiro (leads com type="amostras").
 * Lista simples: quando pediu, em que pé está, quando o time mexeu por último.
 *
 * ── BUG CORRIGIDO (o status estava CONGELADO) ──
 * Esta tela lia `payload.status`. O admin (AdminSamples) grava
 * `payload.aprovacao_status` (pending → approved → shipped → delivered) e
 * `payload.ultima_atualizacao`. Como `payload.status` nunca existiu, TODO pedido
 * aparecia como "Em análise" para sempre — mesmo já enviado ou entregue. O
 * parceiro não tinha como saber que o kit estava a caminho.
 * Agora lemos `aprovacao_status` (com `status` como fallback legado).
 *
 * ── 4 ESTADOS ──
 * O `error` da query passou a ser capturado. Antes, `.then(({ data }) => …)`
 * engolia a falha e o histórico sumia em silêncio.
 */

const STATUS_AMOSTRA = ["pending", "approved", "shipped", "delivered"] as const;
type StatusAmostra = (typeof STATUS_AMOSTRA)[number];

interface SamplePayload {
  aprovacao_status?: string;
  /** Campo legado de linhas antigas. */
  status?: string;
  ultima_atualizacao?: string;
}

interface SampleLead {
  id: string;
  payload: SamplePayload | null;
  created_at: string;
}

/** Mesmo contrato do admin: desconhecido/ausente = "pending". */
function statusDe(l: SampleLead): StatusAmostra {
  const cru = l.payload?.aprovacao_status ?? l.payload?.status;
  return cru && (STATUS_AMOSTRA as readonly string[]).includes(cru) ? (cru as StatusAmostra) : "pending";
}

/* Rótulos voltados ao PARCEIRO (o admin lê "pending"; ele precisa saber o que
 * isso significa no fluxo dele). Os tons vêm do STATUS_META do StatusBadge. */
const ROTULO_CLIENTE: Record<StatusAmostra, string> = {
  pending: "Em análise",
  approved: "Aprovado — em separação",
  shipped: "A caminho",
  delivered: "Entregue",
};

export default function AccountSamples() {
  const { user } = useAuth();
  const { paymentMethods, loading: carregandoTier } = usePartnerPricing();
  const [items, setItems] = useState<SampleLead[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<unknown>(null);

  const carregar = useCallback(async () => {
    if (!user) return;
    setCarregando(true);
    setErro(null);

    const { data, error } = await supabase
      .from("leads")
      .select("id, payload, created_at")
      .eq("user_id", user.id)
      .eq("type", "amostras")
      .order("created_at", { ascending: false });

    if (error) setErro(error); // sem isto, um 403 vira "nenhuma solicitação ainda"
    else setItems((data ?? []) as unknown as SampleLead[]);
    setCarregando(false);
  }, [user]);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  const colunas: ReadonlyArray<Coluna<SampleLead>> = [
    {
      key: "created_at",
      header: "Solicitado",
      principalNoMobile: true,
      sortable: true,
      sortValue: (l) => l.created_at,
      render: (l) => (
        <CelulaData valor={l.created_at} className="font-semibold text-western-green-deep" />
      ),
    },
    {
      key: "status",
      header: "Situação",
      sortable: true,
      sortValue: (l) => STATUS_AMOSTRA.indexOf(statusDe(l)),
      render: (l) => {
        const s = statusDe(l);
        return <StatusBadge status={s} label={ROTULO_CLIENTE[s]} />;
      },
    },
    {
      key: "ultima_atualizacao",
      header: "Última movimentação",
      align: "right",
      width: "190px",
      sortable: true,
      sortValue: (l) => l.payload?.ultima_atualizacao ?? "",
      render: (l) => <CelulaData valor={l.payload?.ultima_atualizacao ?? null} />,
    },
  ];

  return (
    <div>
      <PageHeader
        eyebrow="Amostras"
        titulo="Kit de amostras"
        subtitulo={
          carregandoTier
            ? "Conferindo as condições do seu nível…"
            : paymentMethods.kit_gratis
              ? "Seu nível inclui o kit de amostras gratuito — solicite quando quiser."
              : "O kit é cobrado simbolicamente. Parceiros Platinum e Partner recebem sem custo."
        }
        /* UMA ação primária por tela: quando o histórico está vazio, quem carrega
         * o CTA é o estado vazio — não pode haver dois botões verdes. */
        acao={
          !carregando && !erro && items.length > 0 ? (
            <Link to="/western-box" className="btn-primary tap-target">
              Solicitar novo kit
            </Link>
          ) : undefined
        }
      />

      <div className="mb-4 flex items-baseline justify-between gap-4">
        <h2 className="text-section-label">Histórico</h2>
        {!carregando && !erro && items.length > 0 && (
          <p className="text-meta tabular-nums">
            {items.length} {items.length === 1 ? "solicitação" : "solicitações"}
          </p>
        )}
      </div>

      <DataTable
        linhas={items}
        colunas={colunas}
        getId={(l) => l.id}
        isLoading={carregando}
        error={erro}
        onRetry={() => void carregar()}
        vazio={{
          titulo: "Nenhuma solicitação ainda",
          mensagem:
            "Peça a Western Box para ver e sentir os acabamentos antes de fechar o pedido. O time aprova em até 2 dias úteis.",
          acao: (
            <Link to="/western-box" className="btn-primary tap-target">
              Conhecer a Western Box
            </Link>
          ),
        }}
      />
    </div>
  );
}
