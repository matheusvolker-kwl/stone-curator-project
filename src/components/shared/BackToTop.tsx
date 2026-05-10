import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

/**
 * Botão flutuante "voltar ao topo" que aparece após 800px de scroll.
 */
export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 800);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Voltar ao topo"
      className="fixed bottom-6 right-6 z-50 h-11 w-11 flex items-center justify-center bg-western-green-deep text-western-cream hover:bg-western-gold hover:text-western-green-deep transition-colors shadow-lg opacity-90 hover:opacity-100"
    >
      <ArrowUp className="h-5 w-5" />
    </button>
  );
}
