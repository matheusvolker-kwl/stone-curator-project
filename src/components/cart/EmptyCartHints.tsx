import { Link } from "react-router-dom";
import { useState } from "react";
import { Heart, ArrowRight, Loader2 } from "lucide-react";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import { useWishlist } from "@/hooks/useWishlist";
import { useAuth } from "@/hooks/useAuth";
import { buildCartItem, useCartStore } from "@/stores/cartStore";
import { fetchProduct } from "@/lib/datasource";
import { cdnImg } from "@/lib/catalog/client";
import { toast } from "sonner";

interface Props {
  onNavigate: () => void;
}

export default function EmptyCartHints({ onNavigate }: Props) {
  const { session } = useAuth();
  const { items: recents } = useRecentlyViewed();
  const { items: wishItems } = useWishlist();
  const addItem = useCartStore((s) => s.addItem);
  const [loadingAll, setLoadingAll] = useState(false);

  const handleAddAllFavorites = async () => {
    if (!wishItems.length) return;
    setLoadingAll(true);
    try {
      let added = 0;
      for (const w of wishItems) {
        // eslint-disable-next-line no-await-in-loop
        const product = await fetchProduct(w.product_handle);
        if (!product) continue;
        const variant =
          product.variants.edges.find((e) => e.node.availableForSale)?.node ??
          product.variants.edges[0]?.node;
        if (!variant) continue;
        const item = buildCartItem(product, variant.id, 1);
        if (!item) continue;
        // Lote silencioso: sem toast por item — só o toast-resumo abaixo (antes
        // 5 favoritos geravam 6 toasts empilhados).
        addItem(item, { silent: true });
        added += 1;
      }
      if (added > 0) {
        toast.success(
          added === 1 ? "Favorito adicionado" : `${added} favoritos adicionados`,
          { position: "top-right" }
        );
      }
    } finally {
      setLoadingAll(false);
    }
  };

  const showWishlist = session && wishItems.length > 0;
  const showRecents = recents.length > 0;

  if (!showWishlist && !showRecents) {
    const hints = [
      { to: "/guia-de-composicao", label: "Guia de composição", desc: "Monte seu conjunto passo a passo" },
      { to: "/conjuntos", label: "Conjuntos prontos", desc: "Combinações já pensadas para começar" },
      { to: "/para-sua-casa", label: "Pedir um orçamento", desc: "Projeto residencial ou sem CNPJ" },
    ];
    return (
      <div className="mt-10">
        <p className="text-eyebrow mb-3">Por onde começar</p>
        <ul className="space-y-2.5">
          {hints.map((h) => (
            <li key={h.to}>
              <Link
                to={h.to}
                onClick={onNavigate}
                className="group flex items-center justify-between gap-3 min-h-[64px] p-4 rounded-lg border border-western-border-soft bg-white hover:border-western-border-strong transition-colors"
              >
                <span className="min-w-0">
                  <span className="block font-sans text-[16px] font-semibold leading-snug text-western-green-deep group-hover:text-western-cta transition-colors">
                    {h.label}
                  </span>
                  <span className="block font-sans text-[14px] text-western-stone-warm truncate mt-0.5">
                    {h.desc}
                  </span>
                </span>
                <ArrowRight className="h-5 w-5 text-western-bronze shrink-0" />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className="mt-10 space-y-8">
      {showWishlist && (
        <section>
          <p className="text-eyebrow mb-3">Seus favoritos</p>
          <div className="rounded-lg border border-western-border-soft bg-western-paper p-4 flex flex-wrap items-center justify-between gap-3">
            <p className="flex-1 min-w-[180px] font-sans text-[15px] leading-normal text-western-stone-warm">
              Você tem{" "}
              <span className="font-semibold text-western-green-deep">{wishItems.length}</span>{" "}
              {wishItems.length === 1 ? "peça favorita" : "peças favoritas"}. Trazer para a composição?
            </p>
            <button
              type="button"
              onClick={handleAddAllFavorites}
              disabled={loadingAll}
              className="flex-shrink-0 min-h-tap px-4 inline-flex items-center justify-center gap-2 rounded-lg bg-western-cta text-western-cream hover:bg-western-green-deep font-sans text-[15px] font-semibold transition-colors disabled:opacity-45"
            >
              {loadingAll ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <Heart className="h-5 w-5" /> Adicionar todos
                </>
              )}
            </button>
          </div>
        </section>
      )}

      {showRecents && (
        <section>
          <p className="text-eyebrow mb-3">Você viu recentemente</p>
          <ul className="space-y-2.5">
            {recents.slice(0, 4).map((r) => (
              <li
                key={r.handle}
                className="flex items-center gap-3 p-3 rounded-lg border border-western-border-soft bg-white hover:border-western-border-strong transition-colors"
              >
                <Link
                  to={`/produtos/${r.handle}`}
                  onClick={onNavigate}
                  className="w-14 h-14 flex-shrink-0 overflow-hidden rounded-sm bg-western-paper border border-western-border-soft"
                >
                  {r.image && (
                    <img
                      src={cdnImg(r.image, 160)}
                      alt={r.title}
                      loading="lazy"
                      className="w-full h-full object-contain p-1"
                    />
                  )}
                </Link>
                <Link
                  to={`/produtos/${r.handle}`}
                  onClick={onNavigate}
                  className="flex-1 min-w-0 truncate font-sans text-[16px] font-semibold leading-snug text-western-green-deep hover:text-western-cta transition-colors"
                >
                  {r.title}
                </Link>
                <Link
                  to={`/produtos/${r.handle}`}
                  onClick={onNavigate}
                  className="tap-target flex-shrink-0 inline-flex items-center justify-center rounded-lg text-western-bronze hover:text-western-cta hover:bg-western-paper transition-colors"
                  aria-label={`Ver ${r.title}`}
                >
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
