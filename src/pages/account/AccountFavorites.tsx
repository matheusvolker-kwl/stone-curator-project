import { Link } from "react-router-dom";
import { Heart, Trash2, ArrowRight, Share2 } from "lucide-react";
import { useWishlist } from "@/hooks/useWishlist";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cdnImg } from "@/lib/catalog/client";

export default function AccountFavorites() {
  const { items, loading, remove } = useWishlist();

  const handleRemove = async (handle: string, title?: string | null) => {
    await remove(handle);
    toast("Removido dos favoritos.", {
      description: title ?? undefined,
    });
  };

  const handleShare = async () => {
    const handles = items.map((i) => i.product_handle).join(",");
    const url = `${window.location.origin}/favoritos-compartilhados?itens=${encodeURIComponent(handles)}`;
    try {
      const nav = typeof navigator !== "undefined" ? navigator : null;
      if (nav && "share" in nav) {
        await nav.share({ title: "Seleção Western", url });
      } else if (nav?.clipboard) {
        await nav.clipboard.writeText(url);
        toast.success("Link copiado");
      }
    } catch {
      /* cancelamento silencioso */
    }
  };

  return (
    <div>
      <div className="flex items-start justify-between gap-4 mb-3">
        <p className="text-eyebrow">Favoritos</p>
        {items.length > 0 && (
          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] text-western-green-deep hover:text-western-gold transition-colors"
          >
            <Share2 className="h-4 w-4" /> Compartilhar lista
          </button>
        )}
      </div>
      <h2 className="font-display text-3xl text-western-green-deep mb-2">Pedras salvas</h2>
      <p className="text-western-stone-warm mb-8 max-w-prose">
        Salve pedras para revisitar antes de fechar pedido ou montar moodboards.
      </p>

      {loading ? (
        <p className="text-western-stone-warm">Carregando…</p>
      ) : items.length === 0 ? (
        <div className="border border-dashed border-western-stone-warm/30 p-10 text-center bg-white">
          <Heart className="h-8 w-8 text-western-stone-warm/40 mx-auto mb-4" />
          <p className="text-western-stone-warm mb-6">Nenhuma pedra salva ainda.</p>
          <Link to="/linhas">
            <Button className="rounded-none bg-western-green-deep hover:bg-western-green-mid text-western-cream font-mono text-[11px] uppercase tracking-[0.22em] h-11 px-6">
              Explorar catálogo <ArrowRight className="h-3.5 w-3.5 ml-2" />
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {items.map((it) => (
            <div key={it.id} className="group bg-white border border-western-stone-warm/15 hover:border-western-gold/60 transition-colors flex flex-col">
              <Link to={`/produtos/${it.product_handle}`} className="block aspect-square bg-western-paper overflow-hidden">
                {it.product_image ? (
                  <img src={cdnImg(it.product_image, 400)} alt={it.product_title ?? it.product_handle} className="w-full h-full object-contain p-4 transition-transform duration-500 group-hover:scale-[1.04]" loading="lazy" />
                ) : (
                  <div className="w-full h-full grid place-items-center text-western-stone-warm/40"><Heart className="h-8 w-8" /></div>
                )}
              </Link>
              <div className="p-3 flex flex-col gap-2">
                <Link to={`/produtos/${it.product_handle}`} className="text-sm text-western-green-deep hover:text-western-gold line-clamp-2">
                  {it.product_title ?? it.product_handle}
                </Link>
                <button onClick={() => handleRemove(it.product_handle, it.product_title)} className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-[0.18em] text-western-stone-warm hover:text-red-700 self-start">
                  <Trash2 className="h-3 w-3" /> Remover
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
