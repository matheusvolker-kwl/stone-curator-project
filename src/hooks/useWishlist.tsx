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
  has: (handle: string) => boolean;
  toggle: (p: { handle: string; title?: string | null; image?: string | null }) => Promise<"added" | "removed" | "auth-required">;
  remove: (handle: string) => Promise<void>;
  refresh: () => Promise<void>;
}

const WishlistCtx = createContext<Ctx | null>(null);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) {
      setItems([]);
      return;
    }
    setLoading(true);
    const { data } = await supabase
      .from("wishlists")
      .select("id, product_handle, product_title, product_image, created_at")
      .order("created_at", { ascending: false });
    setItems((data as WishlistItem[]) ?? []);
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
      await supabase.from("wishlists").delete().eq("id", existing.id);
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
    if (error || !data) return "removed";
    setItems((prev) => [data as WishlistItem, ...prev]);
    return "added";
  };

  const remove = async (handle: string) => {
    const existing = items.find((i) => i.product_handle === handle);
    if (!existing) return;
    await supabase.from("wishlists").delete().eq("id", existing.id);
    setItems((prev) => prev.filter((i) => i.id !== existing.id));
  };

  return (
    <WishlistCtx.Provider value={{ items, loading, has, toggle, remove, refresh }}>
      {children}
    </WishlistCtx.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistCtx);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}
