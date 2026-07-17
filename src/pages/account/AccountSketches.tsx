import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Download } from "lucide-react";
import { formatBRL } from "@/lib/catalog/client";
import { DataTable, type Coluna, CelulaData, PageHeader } from "@/components/backoffice";

/**
 * Sketches = os projetos que o parceiro salvou no guia de composição
 * (tabela `guide_exports`). Lista, não grade: o que interessa aqui é conjunto,
 * acabamento, total e quando foi salvo.
 *
 * REGRA DE NEGÓCIO PRESERVADA: a query continua trazendo só os 5 mais recentes
 * (`.limit(5)`) — e agora a tela DIZ isso, em vez de sumir com o 6º em silêncio.
 *
 * BUG CORRIGIDO: a tela lia `payload.area` / `payload.protagonismo`, campos de
 * uma versão antiga do guia. O guia atual (ProjetoSidebar) grava
 * `{ conjunto, conjuntoNome, acabamento, total, pecas[], extras[], tipoVisual,
 * areaM2, nivel }` — então TODO sketch novo aparecia como "Sketch", sem nome.
 * Agora lemos os campos reais, com os antigos como fallback (linhas legadas).
 */

interface SketchPayload {
  /* guia atual (v2) */
  conjunto?: string;
  conjuntoNome?: string;
  acabamento?: string;
  tipoVisual?: string;
  areaM2?: number;
  nivel?: string;
  total?: number;
  pecas?: unknown[];
  extras?: unknown[];
  /* guia legado */
  area?: string;
  protagonismo?: string;
}

interface Sketch {
  id: string;
  payload: SketchPayload;
  pdf_url: string | null;
  created_at: string;
}

function titulo(p: SketchPayload): string {
  return p.conjuntoNome || p.conjunto || p.area || "Projeto salvo";
}

function detalhe(p: SketchPayload): string {
  const partes = [
    p.acabamento,
    p.tipoVisual,
    p.nivel || p.protagonismo,
    typeof p.areaM2 === "number" && p.areaM2 > 0 ? `${p.areaM2} m²` : null,
  ].filter(Boolean);
  return partes.length ? partes.join(" · ") : "—";
}

function qtdPecas(p: SketchPayload): number {
  const base = Array.isArray(p.pecas) ? p.pecas.length : 0;
  const extras = Array.isArray(p.extras) ? p.extras.length : 0;
  return base + extras;
}

export default function AccountSketches() {
  const { user } = useAuth();
  const [items, setItems] = useState<Sketch[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<unknown>(null);

  const carregar = useCallback(async () => {
    if (!user) return;
    setCarregando(true);
    setErro(null);

    const { data, error } = await supabase
      .from("guide_exports")
      .select("id, payload, pdf_url, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5);

    if (error) setErro(error); // sem isto, um 403 vira "nenhum sketch ainda"
    else setItems((data ?? []) as unknown as Sketch[]);
    setCarregando(false);
  }, [user]);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  const colunas: ReadonlyArray<Coluna<Sketch>> = [
    {
      key: "projeto",
      header: "Projeto",
      principalNoMobile: true,
      sortable: true,
      sortValue: (s) => titulo(s.payload),
      render: (s) => (
        <span className="font-semibold text-western-green-deep">{titulo(s.payload)}</span>
      ),
    },
    {
      key: "detalhe",
      header: "Acabamento",
      render: (s) => <span className="text-western-stone-warm">{detalhe(s.payload)}</span>,
    },
    {
      key: "pecas",
      header: "Peças",
      align: "right",
      width: "90px",
      sortable: true,
      sortValue: (s) => qtdPecas(s.payload),
      render: (s) => qtdPecas(s.payload) || "—",
    },
    {
      key: "total",
      header: "Total",
      align: "right",
      width: "140px",
      sortable: true,
      sortValue: (s) => s.payload.total ?? 0,
      render: (s) =>
        typeof s.payload.total === "number" && s.payload.total > 0 ? formatBRL(s.payload.total) : "—",
    },
    {
      key: "created_at",
      header: "Salvo",
      align: "right",
      width: "130px",
      sortable: true,
      sortValue: (s) => s.created_at,
      render: (s) => <CelulaData valor={s.created_at} />,
    },
    {
      key: "pdf",
      header: "PDF",
      align: "right",
      width: "110px",
      render: (s) =>
        s.pdf_url ? (
          <a
            href={s.pdf_url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="tap-target inline-flex items-center gap-2 rounded-lg px-3 text-[16px] font-semibold text-western-green-deep hover:text-western-cta transition-colors"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            Baixar
          </a>
        ) : (
          <span className="text-meta">—</span>
        ),
    },
  ];

  return (
    <div>
      <PageHeader
        eyebrow="Sketches"
        titulo="Projetos salvos no guia"
        subtitulo="Guardamos os 5 projetos mais recentes que você salvou no guia de composição. Ao salvar um novo, o mais antigo sai da lista."
        /* UMA ação primária por tela: no vazio, quem leva o CTA é o estado vazio. */
        acao={
          !carregando && !erro && items.length > 0 ? (
            <Link to="/guia-de-composicao" className="btn-primary tap-target">
              Abrir guia de composição
            </Link>
          ) : undefined
        }
      />

      <DataTable
        linhas={items}
        colunas={colunas}
        getId={(s) => s.id}
        isLoading={carregando}
        error={erro}
        onRetry={() => void carregar()}
        vazio={{
          titulo: "Nenhum projeto salvo ainda",
          mensagem:
            "Monte um conjunto no guia de composição e use “Salvar projeto” — ele fica guardado aqui, pronto para retomar.",
          acao: (
            <Link to="/guia-de-composicao" className="btn-primary tap-target">
              Abrir guia de composição
            </Link>
          ),
        }}
      />
    </div>
  );
}
