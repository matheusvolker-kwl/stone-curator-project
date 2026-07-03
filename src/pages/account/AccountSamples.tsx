import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { usePartnerPricing } from "@/hooks/usePartnerPricing";
import { Link } from "react-router-dom";
import { Package, ArrowRight } from "lucide-react";

interface SampleLead {
  id: string;
  payload: Record<string, unknown> & { status?: string };
  created_at: string;
}

export default function AccountSamples() {
  const { user } = useAuth();
  const { paymentMethods } = usePartnerPricing();
  const [items, setItems] = useState<SampleLead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase.from("leads").select("id, payload, created_at")
      .eq("user_id", user.id).eq("type", "amostras")
      .order("created_at", { ascending: false })
      .then(({ data }) => { setItems((data as SampleLead[]) ?? []); setLoading(false); });
  }, [user]);

  return (
    <div>
      <p className="text-eyebrow mb-3">Amostras</p>
      <h2 className="font-display text-3xl text-western-green-deep mb-2">Kit de amostras</h2>
      <p className="text-western-stone-warm mb-8 max-w-prose">
        {paymentMethods.kit_gratis
          ? "Seu tier inclui kit de amostras gratuito — solicite quando quiser."
          : "O kit é cobrado simbolicamente; clientes Platinum e Partner recebem grátis."}
      </p>

      <Link to="/western-box" className="inline-flex items-center gap-2 mb-10 h-11 px-5 bg-western-green-deep text-western-cream font-mono text-[11px] uppercase tracking-[0.22em] hover:bg-western-green-mid">
        Solicitar novo kit <ArrowRight className="h-4 w-4" />
      </Link>

      <h3 className="font-mono text-xs uppercase tracking-[0.22em] text-western-stone-warm mb-4">Histórico</h3>
      {loading ? (
        <p className="text-western-stone-warm">Carregando…</p>
      ) : items.length === 0 ? (
        <div className="border border-dashed border-western-stone-warm/30 p-8 text-center bg-white">
          <Package className="h-7 w-7 text-western-stone-warm/40 mx-auto mb-3" />
          <p className="text-western-stone-warm text-sm">Nenhuma solicitação ainda.</p>
        </div>
      ) : (
        <ul className="divide-y divide-western-stone-warm/15 border border-western-stone-warm/15 bg-white">
          {items.map((l) => (
            <li key={l.id} className="p-4 flex items-center justify-between text-sm">
              <span className="text-western-green-deep">{new Date(l.created_at).toLocaleDateString("pt-BR")}</span>
              <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-western-stone-warm">
                {l.payload?.status || "Em análise"}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
