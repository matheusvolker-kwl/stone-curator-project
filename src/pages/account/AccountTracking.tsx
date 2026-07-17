import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Copy, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { DataTable, PageHeader, StatusBadge, Tabs, dataCurta, type Coluna } from "@/components/backoffice";

/**
 * Rastreio — o recorte "já saiu da produção" dos pedidos.
 *
 * A query é a mesma de antes (production_orders com status pronto/em_transporte/
 * entregue/retirado). O que mudou: os 4 estados de verdade, abas para separar o
 * que ainda está em rota do que já chegou, e o link de detalhe agora aponta para
 * o pedido específico (?pedido=id).
 */

type Status = "pronto" | "em_transporte" | "entregue" | "retirado";

const EM_ROTA: Status[] = ["pronto", "em_transporte"];

interface Row {
  id: string;
  numero: string;
  titulo: string;
  status: Status;
  modo_entrega: "frete" | "retirada";
  tracking_code: string | null;
  transportadora: string | null;
  previsao_entrega: string | null;
}

async function copiar(texto: string) {
  try {
    await navigator.clipboard.writeText(texto);
    toast.success("Código copiado");
  } catch {
    toast.error("Não consegui copiar. Selecione o código e copie manualmente.");
  }
}

type Aba = "em_rota" | "concluidos" | "todos";

export default function AccountTracking() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [rows, setRows] = useState<Row[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<unknown>(null);
  const [aba, setAba] = useState<Aba>("em_rota");

  const carregar = useCallback(async () => {
    if (!user) return;
    setCarregando(true);
    setErro(null);

    // `error` capturado: antes era `const { data } = …` e uma falha de RLS
    // aparecia como "nenhum pedido em transporte" — a tela mentia.
    const { data, error } = await supabase
      .from("production_orders")
      .select("id, numero, titulo, status, modo_entrega, tracking_code, transportadora, previsao_entrega")
      .eq("user_id", user.id)
      .in("status", ["pronto", "em_transporte", "entregue", "retirado"])
      .order("created_at", { ascending: false });

    if (error) setErro(error);
    else setRows((data as Row[]) ?? []);
    setCarregando(false);
  }, [user]);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  const emRota = useMemo(() => rows.filter((r) => EM_ROTA.includes(r.status)), [rows]);
  const concluidos = useMemo(() => rows.filter((r) => !EM_ROTA.includes(r.status)), [rows]);

  const visiveis = aba === "todos" ? rows : aba === "em_rota" ? emRota : concluidos;

  const colunas: ReadonlyArray<Coluna<Row>> = [
    {
      key: "titulo",
      header: "Pedido",
      principalNoMobile: true,
      sortable: true,
      render: (r) => (
        <div className="min-w-0">
          <p className="truncate font-semibold text-western-green-deep">{r.titulo}</p>
          <p className="text-meta tabular-nums">nº {r.numero}</p>
        </div>
      ),
    },
    {
      key: "status",
      header: "Situação",
      sortable: true,
      render: (r) => <StatusBadge status={r.status} />,
    },
    {
      key: "rastreio",
      header: "Rastreio",
      width: "280px",
      render: (r) => {
        if (r.modo_entrega === "retirada") {
          return <span className="text-western-stone-warm">Retirada na fábrica</span>;
        }
        if (!r.tracking_code) {
          return <span className="text-western-stone-warm">Aguardando o código</span>;
        }
        const correios = r.transportadora?.toLowerCase().includes("correios");
        return (
          <div className="flex flex-wrap items-center gap-2">
            {r.transportadora && (
              <span className="text-[16px] font-semibold text-western-green-deep">
                {r.transportadora}
              </span>
            )}
            <span className="rounded-sm bg-western-paper px-2 py-1 text-[16px] font-semibold tabular-nums text-western-green-deep">
              {r.tracking_code}
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                void copiar(r.tracking_code as string);
              }}
              className="tap-target inline-flex items-center gap-1.5 rounded-lg px-2 text-[16px] font-semibold text-western-stone-warm transition-colors hover:text-western-green-deep"
              aria-label={`Copiar código de rastreio do pedido ${r.numero}`}
            >
              <Copy className="h-4 w-4" aria-hidden="true" />
              Copiar
            </button>
            {correios && (
              <a
                href={`https://rastreamento.correios.com.br/app/index.php?objeto=${r.tracking_code}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="tap-target inline-flex items-center gap-1.5 rounded-lg px-2 text-[16px] font-semibold text-western-bronze transition-colors hover:text-western-green-deep"
              >
                Acompanhar
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
              </a>
            )}
          </div>
        );
      },
    },
    {
      key: "previsao_entrega",
      header: "Previsão",
      align: "right",
      sortable: true,
      sortValue: (r) => r.previsao_entrega,
      render: (r) => (
        <span className="text-western-green-deep">{dataCurta(r.previsao_entrega)}</span>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        eyebrow="Rastreio"
        titulo="Pedidos a caminho"
        subtitulo="Códigos de rastreio e prazos dos pedidos que já saíram da produção — prontos para retirada, em rota ou entregues."
      />

      <Tabs
        className="mb-6"
        abas={[
          { key: "em_rota", label: "Em rota", count: carregando ? undefined : emRota.length },
          { key: "concluidos", label: "Entregues", count: carregando ? undefined : concluidos.length },
          { key: "todos", label: "Todos", count: carregando ? undefined : rows.length },
        ]}
        ativa={aba}
        onChange={setAba}
      />

      <DataTable
        linhas={visiveis}
        colunas={colunas}
        getId={(r) => r.id}
        isLoading={carregando}
        error={erro}
        onRetry={() => void carregar()}
        onRowClick={(r) => navigate(`/minha-conta/pedidos?pedido=${r.id}`)}
        vazio={{
          titulo:
            aba === "em_rota"
              ? "Nenhum pedido em rota"
              : aba === "concluidos"
              ? "Nenhum pedido entregue ainda"
              : "Nada em transporte no momento",
          mensagem:
            aba === "em_rota"
              ? "Assim que um pedido sair da conferência, ele aparece aqui com o código de rastreio."
              : "Pedidos entregues ou retirados ficam guardados aqui.",
          acao: (
            <Link
              to="/minha-conta/pedidos"
              className="btn-outline-forest tap-target inline-flex items-center px-6"
            >
              Ver todos os pedidos
            </Link>
          ),
        }}
      />
    </div>
  );
}
