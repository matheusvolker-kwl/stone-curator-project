import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { ShoppingCart, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

interface SavedCart {
  items: Array<{ title?: string; quantity?: number; variantId?: string }>;
  checkout_url: string | null;
  updated_at: string;
}

export default function AccountSavedCart() {
  const { user } = useAuth();
  const [cart, setCart] = useState<SavedCart | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase.from("saved_carts").select("items, checkout_url, updated_at").eq("user_id", user.id).maybeSingle()
      .then(({ data }) => { setCart(data as SavedCart | null); setLoading(false); });
  }, [user]);

  return (
    <div>
      <p className="text-eyebrow mb-3">Carrinho salvo</p>
      <h2 className="font-display text-3xl text-western-green-deep mb-8">Continue de onde parou</h2>

      {loading ? (
        <p className="text-western-stone-warm">Carregando…</p>
      ) : !cart || !cart.items?.length ? (
        <div className="border border-dashed border-western-stone-warm/30 p-10 text-center bg-white">
          <ShoppingCart className="h-8 w-8 text-western-stone-warm/40 mx-auto mb-4" />
          <p className="text-western-stone-warm mb-4">Nenhum carrinho salvo. Adicione pedras ao orçamento para guardarmos aqui.</p>
          <Link to="/linhas" className="font-mono text-[11px] uppercase tracking-[0.22em] text-western-gold hover:text-western-green-deep">Ver catálogo</Link>
        </div>
      ) : (
        <div className="border border-western-stone-warm/15 bg-white">
          <ul className="divide-y divide-western-stone-warm/10">
            {cart.items.map((it, i) => (
              <li key={i} className="p-4 flex items-center justify-between">
                <span className="text-western-green-deep">{it.title || it.variantId}</span>
                <span className="font-mono text-xs text-western-stone-warm">x{it.quantity ?? 1}</span>
              </li>
            ))}
          </ul>
          {cart.checkout_url && (
            <div className="border-t border-western-stone-warm/15 p-4">
              <a href={cart.checkout_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] text-western-gold hover:text-western-green-deep">
                Retomar checkout <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          )}
          <p className="px-4 pb-4 text-[11px] font-mono uppercase tracking-[0.18em] text-western-stone-warm">
            Atualizado em {new Date(cart.updated_at).toLocaleString("pt-BR")}
          </p>
        </div>
      )}
    </div>
  );
}
