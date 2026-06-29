import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Truck, Copy, ExternalLink, Package } from "lucide-react";
import { toast } from "sonner";

interface Row {
  id: string;
  numero: string;
  titulo: string;
  status: string;
  modo_entrega: "frete" | "retirada";
  tracking_code: string | null;
  transportadora: string | null;
  previsao_entrega: string | null;
}

function fmtDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

export default function AccountTracking() {
  const { user } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("production_orders")
        .select("id, numero, titulo, status, modo_entrega, tracking_code, transportadora, previsao_entrega")
        .eq("user_id", user.id)
        .in("status", ["pronto", "em_transporte", "entregue", "retirado"])
        .order("created_at", { ascending: false });
      setRows((data as Row[]) ?? []);
      setLoading(false);
    })();
  }, [user]);

  const copy = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Código copiado");
  };

  return (
    <div>
      <p className="text-eyebrow mb-3">Rastreio</p>
      <h2 className="font-display text-3xl text-western-green-deep mb-2">Pedidos em transporte</h2>
      <p className="text-western-stone-warm mb-8 max-w-2xl">
        Acompanhe códigos de rastreio e prazos dos pedidos prontos para envio ou já em rota.
      </p>

      {loading ? (
        <p className="text-sm text-western-stone-warm">Carregando…</p>
      ) : rows.length === 0 ? (
        <div className="border border-dashed border-western-stone-warm/30 p-10 text-center">
          <Truck className="h-8 w-8 text-western-stone-warm/40 mx-auto mb-3" />
          <p className="text-spec text-western-stone-warm">Nenhum pedido em transporte no momento.</p>
          <Link to="/minha-conta/pedidos" className="inline-block mt-4 font-mono text-[10px] uppercase tracking-[0.22em] text-western-gold hover:underline">
            Ver todos os pedidos
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {rows.map((r) => (
            <li key={r.id} className="border border-western-stone-warm/15 bg-white p-5">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="min-w-0">
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-western-stone-warm">Nº {r.numero}</p>
                  <h3 className="font-display text-lg text-western-green-deep mt-1">{r.titulo}</h3>
                  <p className="text-xs text-western-stone-warm mt-1">
                    {r.modo_entrega === "retirada" ? "Retirada na fábrica" : "Frete"} ·
                    {" "}Previsão <span className="text-western-green-deep font-medium">{fmtDate(r.previsao_entrega)}</span>
                  </p>
                </div>
                <Link
                  to="/minha-conta/pedidos"
                  className="font-mono text-[10px] uppercase tracking-[0.22em] text-western-gold hover:underline"
                >
                  Detalhes
                </Link>
              </div>
              {r.tracking_code && (
                <div className="mt-4 pt-4 border-t border-western-stone-warm/10 flex items-center gap-3 flex-wrap">
                  {r.transportadora && (
                    <span className="font-display text-sm text-western-green-deep">{r.transportadora}</span>
                  )}
                  <code className="font-mono text-sm bg-western-stone-warm/10 px-2 py-1 text-western-green-deep">
                    {r.tracking_code}
                  </code>
                  <button
                    onClick={() => copy(r.tracking_code!)}
                    className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.2em] text-western-stone-warm hover:text-western-green-deep"
                  >
                    <Copy className="h-3 w-3" /> Copiar
                  </button>
                  {r.transportadora?.toLowerCase().includes("correios") && (
                    <a
                      href={`https://rastreamento.correios.com.br/app/index.php?objeto=${r.tracking_code}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.2em] text-western-gold hover:underline"
                    >
                      Acompanhar <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              )}
              {!r.tracking_code && r.modo_entrega === "frete" && (
                <p className="mt-3 text-xs text-western-stone-warm inline-flex items-center gap-1.5">
                  <Package className="h-3 w-3" /> Aguardando código de rastreio.
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
