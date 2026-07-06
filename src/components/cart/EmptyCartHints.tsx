import { Link } from "react-router-dom";
import { useState } from "react";
import { Heart, ArrowRight, Loader2, Plus } from "lucide-react";
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
        // eslint-disable-next-line no-await-in-loop
        await addItem(item);
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
      { to: "/contrate-a-western", label: "Pedir um orçamento", desc: "Projeto residencial ou sem CNPJ" },
    ];
    return (
      <div className="mt-10">
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-western-gold-soft mb-3">Por onde começar</p>
        <ul className="space-y-2">
          {hints.map((h) => (
            <li key={h.to}>
              <Link to={h.to} onClick={onNavigate} className="group flex items-center justify-between gap-3 p-3 border border-western-gold/15 hover:border-western-gold/40 transition-colors bg-western-green-deep/30">
                <span className="min-w-0">
                  <span className="block font-display text-sm text-western-cream group-hover:text-western-gold-soft transition-colors">{h.label}</span>
                  <span className="block text-[12px] text-western-cream-muted truncate">{h.desc}</span>
                </span>
                <ArrowRight className="h-4 w-4 text-western-cream-muted group-hover:text-western-gold-soft transition-colors shrink-0" />
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
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-western-gold-soft mb-3">
            Seus favoritos
          </p>
          <div className="border border-western-gold/20 bg-western-green-deep/30 p-4 flex items-center justify-between gap-3">
            <p className="text-sm text-western-cream-muted leading-relaxed">
              Você tem{" "}
              <span className="text-western-cream font-medium">{wishItems.length}</span>{" "}
              {wishItems.length === 1 ? "peça favorita" : "peças favoritas"}. Trazer para a composição?
            </p>
            <button
              type="button"
              onClick={handleAddAllFavorites}
              disabled={loadingAll}
              className="flex-shrink-0 h-10 px-3 inline-flex items-center gap-1.5 border border-western-gold/40 text-western-cream hover:bg-western-gold hover:text-western-green-deep hover:border-western-gold font-mono text-[10px] uppercase tracking-[0.22em] transition-colors disabled:opacity-50"
            >
              {loadingAll ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <>
                  <Heart className="h-3 w-3" /> Adicionar todos
                </>
              )}
            </button>
          </div>
        </section>
      )}

      {showRecents && (
        <section>
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-western-gold-soft mb-3">
            Você viu recentemente
          </p>
          <ul className="space-y-2">
            {recents.slice(0, 4).map((r) => (
              <li
                key={r.handle}
                className="flex items-center gap-3 p-2 border border-western-gold/15 hover:border-western-gold/40 transition-colors bg-western-green-deep/30"
              >
                <Link
                  to={`/produtos/${r.handle}`}
                  onClick={onNavigate}
                  className="frame-gallery w-12 h-12 flex-shrink-0 bg-western-paper"
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
                  className="flex-1 min-w-0 font-display text-sm text-western-cream hover:text-western-gold-soft transition-colors truncate"
                >
                  {r.title}
                </Link>
                <Link
                  to={`/produtos/${r.handle}`}
                  onClick={onNavigate}
                  className="text-western-cream-muted hover:text-western-gold-soft transition-colors"
                  aria-label={`Ver ${r.title}`}
                >
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
