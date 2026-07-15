import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

/**
 * "Voltar ao topo" — utilitário discreto que aparece após 800px de scroll.
 *
 * Design: círculo claro com contorno fino (NÃO clona o FAB verde do WhatsApp —
 * é um controle secundário, quieto). Empilha ACIMA do FAB, no mesmo eixo à
 * direita, e sobe junto quando a barra fixa de compra aparece na PDP
 * (--sticky-buy-bar-h, o mesmo truque do WhatsAppFAB). Entra/sai com fade —
 * nada de "pop" seco.
 */
export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 800);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Voltar ao topo"
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
      // 3.75rem = altura do FAB do WhatsApp + respiro, pra empilhar acima dele.
      style={{ bottom: "calc(1.25rem + var(--sticky-buy-bar-h, 0px) + 3.75rem)" }}
      className={`fixed right-5 md:right-7 z-50 grid h-11 w-11 place-items-center rounded-full bg-white text-western-green-deep ring-1 ring-inset ring-western-border-strong shadow-[0_6px_18px_-6px_rgba(0,0,0,0.35)] transition-all duration-300 ease-out hover:bg-western-green-deep hover:text-western-cream hover:ring-western-green-deep hover:shadow-[0_10px_24px_-8px_rgba(0,0,0,0.45)] motion-reduce:transition-none ${
        visible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-2 opacity-0"
      }`}
    >
      <ArrowUp className="h-5 w-5" strokeWidth={2} aria-hidden="true" />
    </button>
  );
}
