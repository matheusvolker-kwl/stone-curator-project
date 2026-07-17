import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Download, FileStack, Loader2 } from "lucide-react";
import { formatBRL } from "@/lib/catalog/client";
import { CelulaData, DataTable, PageHeader, type Coluna } from "@/components/backoffice";

/**
 * Orçamentos — os PDFs de composição que o parceiro já solicitou.
 *
 * `quote_pdfs` guarda só o PDF (caminho no storage + subtotal + nº de peças).
 * NÃO há itens estruturados aqui, então NÃO existe "pedir de novo" nesta tela:
 * remontar o carrinho a partir daqui produziria itens sem os metadados Woo
 * (wooParentProductId/wooKind) e o `toLine()` do checkout os DESCARTA em
 * silêncio. A recompra fica em Pedidos, onde `production_orders.itens` carrega
 * os metadados de verdade.
 */

interface QuotePdf {
  id: string;
  storage_path: string;
  subtotal: number;
  items_count: number;
  created_at: string;
  lead_id: string | null;
}

export default function AccountQuotes() {
  const { user } = useAuth();
  const [pdfs, setPdfs] = useState<QuotePdf[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<unknown>(null);
  const [baixando, setBaixando] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    if (!user) return;
    setCarregando(true);
    setErro(null);

    // O `error` é capturado de propósito: antes era `const { data } = …` e um
    // 403 virava lista vazia — a tela mentia dizendo "nenhum orçamento".
    const { data, error } = await supabase
      .from("quote_pdfs")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) setErro(error);
    else setPdfs((data as QuotePdf[]) ?? []);
    setCarregando(false);
  }, [user]);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  const baixarPdf = async (pdf: QuotePdf) => {
    setBaixando(pdf.id);
    try {
      const { data, error } = await supabase.storage
        .from("orcamentos")
        .createSignedUrl(pdf.storage_path, 3600);

      if (error || !data) {
        toast.error("Não consegui abrir o PDF. Tente de novo em instantes.");
        return;
      }

      try {
        const response = await fetch(data.signedUrl);
        if (!response.ok) throw new Error("Download failed");
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `western-composicao-${new Date(pdf.created_at).toISOString().slice(0, 10)}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.setTimeout(() => URL.revokeObjectURL(url), 30000);
      } catch {
        window.open(data.signedUrl, "_blank", "noopener,noreferrer");
      }
    } finally {
      setBaixando(null);
    }
  };

  const colunas: ReadonlyArray<Coluna<QuotePdf>> = [
    {
      key: "composicao",
      header: "Composição",
      principalNoMobile: true,
      render: (p) => (
        <span className="font-semibold">
          {p.items_count} {p.items_count === 1 ? "peça" : "peças"}
        </span>
      ),
      sortable: true,
      sortValue: (p) => p.items_count,
    },
    {
      key: "subtotal",
      header: "Valor",
      align: "right",
      numerica: true,
      sortable: true,
      sortValue: (p) => p.subtotal,
      render: (p) =>
        p.subtotal > 0 ? (
          formatBRL(p.subtotal, "BRL")
        ) : (
          <span className="text-western-stone-warm">Valores em análise</span>
        ),
    },
    {
      key: "created_at",
      header: "Solicitado",
      align: "right",
      sortable: true,
      sortValue: (p) => p.created_at,
      render: (p) => <CelulaData valor={p.created_at} className="text-western-stone-warm" />,
    },
    {
      key: "acao",
      header: "PDF",
      align: "right",
      width: "160px",
      render: (p) => (
        <button
          type="button"
          onClick={() => void baixarPdf(p)}
          disabled={baixando === p.id}
          className="tap-target inline-flex items-center justify-center gap-2 rounded-lg border border-western-green-deep/25 px-4 text-[16px] font-semibold text-western-green-deep transition-colors hover:bg-western-paper disabled:opacity-50"
        >
          {baixando === p.id ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <Download className="h-4 w-4" aria-hidden="true" />
          )}
          Baixar
        </button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        eyebrow="Orçamentos"
        titulo="Suas composições solicitadas"
        subtitulo="Toda vez que você pede atendimento pelo carrinho, o PDF da composição fica guardado aqui — para consultar, reaproveitar e mandar para o cliente."
      />

      <DataTable
        linhas={pdfs}
        colunas={colunas}
        getId={(p) => p.id}
        isLoading={carregando}
        error={erro}
        onRetry={() => void carregar()}
        vazio={{
          titulo: "Nenhum orçamento solicitado ainda",
          mensagem:
            "Monte seu carrinho e peça o orçamento — o PDF da composição aparece aqui automaticamente.",
          acao: (
            <Link to="/produtos" className="btn-primary tap-target inline-flex items-center px-6">
              Montar uma composição
            </Link>
          ),
        }}
      />

      {pdfs.length > 0 && !carregando && !erro && (
        <p className="text-meta mt-6 inline-flex items-center gap-2">
          <FileStack className="h-4 w-4" aria-hidden="true" />
          Precisa de outra composição? Monte no{" "}
          <Link to="/produtos" className="font-semibold text-western-green-deep underline underline-offset-2">
            catálogo
          </Link>{" "}
          ou no{" "}
          <Link
            to="/guia-de-composicao"
            className="font-semibold text-western-green-deep underline underline-offset-2"
          >
            guia de composição
          </Link>
          .
        </p>
      )}
    </div>
  );
}
