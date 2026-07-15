import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { ShoppingBag, X } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";

/**
 * Pílula fina fixa no rodapé (mobile): lembrete de que há um orçamento aberto.
 *
 * É um LEMBRETE PERSISTENTE — NÃO uma confirmação de "adicionado". A confirmação
 * de cada add é o toast único do cartStore (+ pulso do badge no header). Por isso
 * a pílula não "pisca" a cada peça: ela aparece enquanto há orçamento, some ao
 * rolar pra baixo, é dispensável no X e fica escondida na própria /carrinho.
 * - Empilha acima da barra fixa via --sticky-buy-bar-h.
 * - Escondida em ≥ md (desktop tem "Orçamento (N)" no header).
 */
export default function CartReminderPill({ cartOpen }: { cartOpen: boolean }) {
  const items = useCartStore((s) => s.items);
  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const { pathname } = useLocation();
  const onCartPage = pathname === "/carrinho";

  const [visible, setVisible] = useState(true);
  const [dismissed, setDismissed] = useState(false);
  const lastY = useRef(0);

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

  const shouldRender = totalItems > 0 && !cartOpen && !dismissed && !onCartPage;
  if (!shouldRender) return null;

  return (
    <div
      className={`md:hidden fixed left-3 z-30 pointer-events-none transition-all duration-300 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
      }`}
      style={{
        bottom: "calc(1.25rem + var(--sticky-buy-bar-h, 0px) + env(safe-area-inset-bottom, 0px))",
      }}
      aria-hidden={!visible}
    >
      <div className="pointer-events-auto w-fit max-w-[calc(100vw-5.5rem)]">
        <div className="flex items-center gap-1 pl-4 pr-1 rounded-full bg-western-cta text-western-cream border border-western-green-deep/20 shadow-[0_12px_32px_-14px_rgba(15,40,24,0.55)]">
          <ShoppingBag className="h-5 w-5 text-western-gold-soft shrink-0" />
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent("western:open-cart"))}
            className="min-h-[48px] pl-2 pr-2 inline-flex items-center font-sans text-[16px] font-semibold whitespace-nowrap"
          >
            {totalItems} no orçamento
            <span className="mx-2 text-western-cream/50" aria-hidden="true">
              ·
            </span>
            <span className="text-western-gold-soft">Ver</span>
          </button>
          <button
            type="button"
            onClick={() => setDismissed(true)}
            aria-label="Dispensar lembrete"
            className="min-h-[48px] min-w-[48px] inline-flex items-center justify-center rounded-full text-western-cream/80 hover:text-western-cream hover:bg-western-green-deep/40 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
