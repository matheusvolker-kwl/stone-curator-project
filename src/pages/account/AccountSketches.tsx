import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { FileDown, Download } from "lucide-react";

interface Sketch {
  id: string;
  payload: Record<string, unknown>;
  pdf_url: string | null;
  created_at: string;
}

export default function AccountSketches() {
  const { user } = useAuth();
  const [items, setItems] = useState<Sketch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase.from("guide_exports").select("id, payload, pdf_url, created_at")
      .eq("user_id", user.id).order("created_at", { ascending: false }).limit(5)
      .then(({ data }) => { setItems((data as Sketch[]) ?? []); setLoading(false); });
  }, [user]);

  return (
    <div>
      <p className="text-eyebrow mb-3">Sketches</p>
      <h2 className="font-display text-3xl text-western-green-deep mb-2">Últimos guias salvos</h2>
      <p className="text-western-stone-warm mb-8 max-w-prose">Os 5 últimos sketches gerados no Guia de Compra.</p>

      {loading ? (
        <p className="text-western-stone-warm">Carregando…</p>
      ) : items.length === 0 ? (
        <div className="border border-dashed border-western-stone-warm/30 p-10 text-center bg-white">
          <FileDown className="h-8 w-8 text-western-stone-warm/40 mx-auto mb-4" />
          <p className="text-western-stone-warm">Nenhum sketch ainda. Use o Guia de Compra para gerar uma proposta.</p>
        </div>
      ) : (
        <ul className="divide-y divide-western-stone-warm/15 border border-western-stone-warm/15 bg-white">
          {items.map((s) => {
            const p = s.payload as { area?: string; protagonismo?: string };
            return (
              <li key={s.id} className="p-5 flex items-center justify-between gap-4">
                <div>
                  <p className="text-western-green-deep">{p.area || "Sketch"} {p.protagonismo ? `· ${p.protagonismo}` : ""}</p>
                  <p className="text-[11px] font-mono uppercase tracking-[0.18em] text-western-stone-warm mt-1">
                    {new Date(s.created_at).toLocaleString("pt-BR")}
                  </p>
                </div>
                {s.pdf_url && (
                  <a href={s.pdf_url} target="_blank" rel="noopener noreferrer" className="text-western-gold hover:text-western-green-deep" title="Baixar PDF">
                    <Download className="h-4 w-4" />
                  </a>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
