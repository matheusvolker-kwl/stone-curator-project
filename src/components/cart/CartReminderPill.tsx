import { useEffect, useRef, useState } from "react";
import { ShoppingBag, X } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";

/**
 * Pílula fina fixa no rodapé (mobile), lembrando que há um orçamento aberto.
 * - Só aparece quando há itens no carrinho e o drawer está fechado.
 * - Some ao rolar pra baixo, volta ao rolar pra cima (mesma UX da StickyBuyBar).
 * - Botão X descarta a sessão; reaparece quando o total de itens sobe.
 * - Empilha acima da StickyBuyBarLab usando --sticky-buy-bar-h.
 * - Escondida em ≥ md (desktop tem "Orçamento (N)" no header).
 */
export default function CartReminderPill({ cartOpen }: { cartOpen: boolean }) {
  const items = useCartStore((s) => s.items);
  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);

  const [visible, setVisible] = useState(true);
  const [dismissedAt, setDismissedAt] = useState(0);
  const lastY = useRef(0);

  // Reaparece quando o cliente adiciona mais peças (total sobe acima do dismiss).
  useEffect(() => {
    if (totalItems > dismissedAt) setDismissedAt(0);
  }, [totalItems, dismissedAt]);

  useEffect(() => {
    lastY.current = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      const goingDown = y > lastY.current + 4;
      const goingUp = y < lastY.current - 4;
      if (goingDown && y > 80) setVisible(false);
      else if (goingUp) setVisible(true);
      lastY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const shouldRender = totalItems > 0 && !cartOpen && dismissedAt < totalItems;
  if (!shouldRender) return null;

  return (
    <div
      className={`md:hidden fixed left-0 right-0 z-30 pointer-events-none transition-all duration-300 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
      }`}
      style={{
        bottom: "calc(0.75rem + var(--sticky-buy-bar-h, 0px) + env(safe-area-inset-bottom, 0px))",
      }}
      aria-hidden={!visible}
    >
      <div className="pointer-events-auto mx-auto max-w-[92%] w-fit">
        <div className="flex items-center gap-2 pl-3 pr-1 py-1.5 bg-western-green-deep text-western-cream shadow-[0_10px_30px_-12px_rgba(15,40,24,0.6)] border border-western-gold/25">
          <ShoppingBag className="h-3.5 w-3.5 text-western-gold-soft" />
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent("western:open-cart"))}
            className="font-mono text-[11px] uppercase tracking-[0.18em] py-1 pr-2"
          >
            {totalItems} no orçamento
            <span className="mx-2 text-western-gold-soft/60">·</span>
            <span className="text-western-gold-soft">Ver</span>
          </button>
          <button
            type="button"
            onClick={() => setDismissedAt(totalItems)}
            aria-label="Dispensar lembrete"
            className="p-1.5 text-western-cream/60 hover:text-western-cream transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
