import { Link } from "react-router-dom";
import { Heart, Trash2, ArrowRight } from "lucide-react";
import { useWishlist } from "@/hooks/useWishlist";
import { Button } from "@/components/ui/button";

export default function Favoritos() {
  const { items, loading, remove } = useWishlist();

  return (
    <div className="surface-ivory min-h-screen">
      <div className="container-western py-12 md:py-16 max-w-5xl">
        <p className="text-eyebrow mb-4">Área do parceiro</p>
        <div className="w-12 h-px bg-western-gold mb-6" />
        <h1 className="font-display text-3xl md:text-4xl text-western-green-deep leading-[1.05] mb-3">
          Favoritos
        </h1>
        <p className="text-western-stone-warm mb-10 max-w-prose">
          Pedras salvas para consultar depois. Útil para montar moodboards e revisitar referências antes de fechar pedido.
        </p>

        {loading ? (
          <p className="text-western-stone-warm">Carregando…</p>
        ) : items.length === 0 ? (
          <div className="border border-dashed border-western-stone-warm/30 p-10 text-center bg-white">
            <Heart className="h-8 w-8 text-western-stone-warm/40 mx-auto mb-4" />
            <p className="text-western-stone-warm mb-6">Você ainda não salvou nenhuma pedra.</p>
            <Link to="/linhas">
              <Button className="rounded-none bg-western-green-deep hover:bg-western-green-mid text-western-cream font-mono text-[11px] uppercase tracking-[0.22em] h-11 px-6">
                Explorar catálogo <ArrowRight className="h-3.5 w-3.5 ml-2" />
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map((it) => (
              <div key={it.id} className="group relative bg-white border border-western-stone-warm/15 hover:border-western-gold/60 transition-colors flex flex-col">
                <Link to={`/produtos/${it.product_handle}`} className="block aspect-square bg-western-paper overflow-hidden">
                  {it.product_image ? (
                    <img
                      src={it.product_image}
                      alt={it.product_title ?? it.product_handle}
                      className="w-full h-full object-contain p-4 transition-transform duration-500 group-hover:scale-[1.04]"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full grid place-items-center text-western-stone-warm/40">
                      <Heart className="h-8 w-8" />
                    </div>
                  )}
                </Link>
                <div className="p-3 flex flex-col gap-2">
                  <Link to={`/produtos/${it.product_handle}`} className="text-sm text-western-green-deep hover:text-western-gold line-clamp-2">
                    {it.product_title ?? it.product_handle}
                  </Link>
                  <button
                    onClick={() => remove(it.product_handle)}
                    className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-[0.18em] text-western-stone-warm hover:text-red-700 transition-colors self-start"
                  >
                    <Trash2 className="h-3 w-3" /> Remover
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
