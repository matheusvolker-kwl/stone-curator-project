import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { FileText, Download, FileStack } from "lucide-react";
import { formatBRL } from "@/lib/catalog/client";

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("quote_pdfs")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setPdfs((data as QuotePdf[]) ?? []);
      setLoading(false);
    })();
  }, [user]);

  const downloadPdf = async (path: string) => {
    const { data, error } = await supabase.storage
      .from("orcamentos")
      .createSignedUrl(path, 3600);
    if (error || !data) return toast.error("Não foi possível abrir o PDF.");
    try {
      const response = await fetch(data.signedUrl);
      if (!response.ok) throw new Error("Download failed");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `western-composicao-${new Date().toISOString().slice(0, 10)}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.setTimeout(() => URL.revokeObjectURL(url), 30000);
    } catch {
      window.open(data.signedUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div>
      <header className="mb-8">
        <p className="text-eyebrow mb-3">Orçamentos</p>
        <h2 className="font-display text-3xl text-western-green-deep">
          Suas composições solicitadas
        </h2>
        <p className="text-sm text-western-stone-warm mt-2 max-w-xl">
          Toda vez que você solicita atendimento pelo carrinho, salvamos o{" "}
          <strong className="text-western-green-deep">PDF da composição</strong> aqui
          para você consultar e reaproveitar quando quiser.
        </p>
      </header>

      {loading ? (
        <div className="border border-dashed border-western-stone-warm/30 p-6 text-center bg-white">
          <p className="text-sm text-western-stone-warm">Carregando…</p>
        </div>
      ) : pdfs.length === 0 ? (
        <div className="border border-dashed border-western-stone-warm/30 p-10 text-center bg-white">
          <FileStack className="h-8 w-8 text-western-stone-warm/40 mx-auto mb-4" />
          <p className="text-western-stone-warm max-w-md mx-auto">
            Nenhum orçamento solicitado ainda. Monte seu carrinho e clique em{" "}
            <em>Solicitar orçamento</em> — o PDF aparece aqui automaticamente.
          </p>
        </div>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {pdfs.map((p) => (
            <li
              key={p.id}
              className="border border-western-stone-warm/15 bg-white p-4 flex items-start justify-between gap-4"
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className="h-10 w-10 flex items-center justify-center bg-western-gold/10 border border-western-gold/30 flex-shrink-0">
                  <FileText className="h-4 w-4 text-western-gold" />
                </div>
                <div className="min-w-0">
                  <p className="font-display text-western-green-deep">
                    Composição · {p.items_count}{" "}
                    {p.items_count === 1 ? "item" : "itens"}
                  </p>
                  <p className="text-xs text-western-stone-warm font-mono mt-1">
                    {new Date(p.created_at).toLocaleDateString("pt-BR")} ·{" "}
                    {p.subtotal > 0
                      ? formatBRL(p.subtotal, "BRL")
                      : "valores em análise"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => downloadPdf(p.storage_path)}
                className="inline-flex items-center gap-2 text-western-green-deep hover:text-western-gold font-mono text-[10px] uppercase tracking-[0.2em] flex-shrink-0"
                title="Baixar PDF"
              >
                <Download className="h-4 w-4" /> PDF
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
