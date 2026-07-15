import { Link } from "react-router-dom";
import { Heart, Trash2, ArrowRight } from "lucide-react";
import { useWishlist } from "@/hooks/useWishlist";
import { Button } from "@/components/ui/button";

export default function Favoritos() {
  const { items, loading, remove } = useWishlist();

  return (
    <div className="surface-ivory min-h-screen">
      <div className="container-western py-12 md:py-16">
        <div className="max-w-5xl">
        <header className="mb-10 max-w-2xl md:mb-12">
          <p className="text-eyebrow mb-4">Área do parceiro</p>
          <h1 className="display-lg text-western-green-deep">Favoritos</h1>
          <p className="text-body mt-5 max-w-[52ch]">
            Peças salvas para consultar depois. Útil para montar moodboards e
            revisitar referências antes de fechar pedido.
          </p>
        </header>

        {loading ? (
          <div
            className="grid grid-cols-2 gap-3 sm:gap-6 md:grid-cols-3 lg:grid-cols-4"
            aria-hidden="true"
          >
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="aspect-square animate-pulse rounded-[10px] bg-western-stone-warm/10"
              />
            ))}
          </div>
        ) : items.length === 0 ? (
          /* Vazio: cartão branco com raio do sistema + CTA verde (full-width no mobile) */
          <div className="rounded-2xl border border-western-border-soft bg-white p-8 text-center md:p-12">
            <Heart
              className="mx-auto mb-4 h-8 w-8 text-western-stone-warm/50"
              aria-hidden="true"
            />
            <p className="text-body mb-6">Você ainda não salvou nenhuma peça.</p>
            <Button asChild className="w-full sm:w-auto">
              <Link to="/linhas">
                Explorar catálogo
                <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
            {items.map((it) => (
              <div
                key={it.id}
                className="group flex flex-col overflow-hidden rounded-[10px] border border-western-border-soft bg-white shadow-[0_2px_10px_-6px_hsl(var(--western-stone-dark)/0.25)] transition-shadow duration-200 hover:shadow-[0_14px_30px_-16px_hsl(var(--western-stone-dark)/0.35)]"
              >
                <Link
                  to={`/produtos/${it.product_handle}`}
                  className="block aspect-square overflow-hidden bg-western-paper"
                >
                  {it.product_image ? (
                    <img
                      src={it.product_image}
                      alt={it.product_title ?? it.product_handle}
                      className="h-full w-full object-contain p-4 transition-transform duration-500 group-hover:scale-[1.04]"
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <div className="grid h-full w-full place-items-center text-western-stone-warm/50">
                      <Heart className="h-8 w-8" aria-hidden="true" />
                    </div>
                  )}
                </Link>

                <div className="flex flex-1 flex-col gap-2 p-4">
                  {/* Título de card: 20px sans semibold (o V3 não usa display abaixo de 22px) */}
                  <Link
                    to={`/produtos/${it.product_handle}`}
                    className="line-clamp-2 font-sans text-[20px] font-semibold leading-[1.25] text-western-green-deep transition-colors hover:text-western-bronze"
                  >
                    {it.product_title ?? it.product_handle}
                  </Link>

                  <button
                    type="button"
                    onClick={() => remove(it.product_handle)}
                    className="tap-target -ml-1 mt-auto inline-flex items-center gap-2 self-start px-1 font-sans text-[16px] font-semibold text-western-stone-warm transition-colors hover:text-destructive"
                  >
                    <Trash2 className="h-5 w-5" aria-hidden="true" />
                    Remover
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
