import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface WishlistItem {
  id: string;
  product_handle: string;
  product_title: string | null;
  product_image: string | null;
  created_at: string;
}

interface Ctx {
  items: WishlistItem[];
  loading: boolean;
  /**
   * Mensagem de erro da última leitura, ou null.
   * Existe para que a tela distinga "não tem nada salvo" de "não consegui
   * carregar". Antes o erro era engolido e uma falha de RLS aparecia como
   * "nenhuma peça salva" — o parceiro achava que tinha perdido a seleção.
   */
  error: string | null;
  has: (handle: string) => boolean;
  /** "erro" = a operação NÃO aconteceu no banco. Nunca minta dizendo que aconteceu. */
  toggle: (p: { handle: string; title?: string | null; image?: string | null }) => Promise<"added" | "removed" | "auth-required" | "erro">;
  remove: (handle: string) => Promise<void>;
  refresh: () => Promise<void>;
}

const WishlistCtx = createContext<Ctx | null>(null);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<WishlistItem[]>([]);
  // Começa carregando: se inicializasse em false, a tela pintava o estado
  // vazio por um instante antes dos dados chegarem.
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!user) {
      setItems([]);
      setError(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error: err } = await supabase
      .from("wishlists")
      .select("id, product_handle, product_title, product_image, created_at")
      .order("created_at", { ascending: false });
    if (err) {
      // NUNCA cair para lista vazia: vazio é uma afirmação, e aqui não sabemos.
      setError(err.message);
    } else {
      setError(null);
      setItems((data as WishlistItem[]) ?? []);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const has = useCallback(
    (handle: string) => items.some((i) => i.product_handle === handle),
    [items]
  );

  const toggle: Ctx["toggle"] = async ({ handle, title, image }) => {
    if (!user) return "auth-required";
    const existing = items.find((i) => i.product_handle === handle);
    if (existing) {
      const { error: delErr } = await supabase
        .from("wishlists")
        .delete()
        .eq("id", existing.id);
      // Se o banco recusou, a peça CONTINUA salva — não some da tela.
      if (delErr) return "erro";
      setItems((prev) => prev.filter((i) => i.id !== existing.id));
      return "removed";
    }
    const { data, error } = await supabase
      .from("wishlists")
      .insert({
        user_id: user.id,
        product_handle: handle,
        product_title: title ?? null,
        product_image: image ?? null,
      })
      .select()
      .maybeSingle();
    // Antes isto retornava "removed" quando o INSERT falhava: a tela cantava
    // "Removido dos favoritos" para uma peça que nunca foi salva.
    if (error || !data) return "erro";
    setItems((prev) => [data as WishlistItem, ...prev]);
    return "added";
  };

  const remove = async (handle: string) => {
    const existing = items.find((i) => i.product_handle === handle);
    if (!existing) return;
    const { error: delErr } = await supabase
      .from("wishlists")
      .delete()
      .eq("id", existing.id);
    if (delErr) {
      // Não sumir da tela o que não sumiu do banco.
      setError(delErr.message);
      return;
    }
    setItems((prev) => prev.filter((i) => i.id !== existing.id));
  };

  return (
    <WishlistCtx.Provider value={{ items, loading, error, has, toggle, remove, refresh }}>
      {children}
    </WishlistCtx.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistCtx);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}
