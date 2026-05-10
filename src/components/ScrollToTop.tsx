import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Reseta o scroll para o topo a cada mudança de rota.
 * Ignora mudanças apenas de querystring (ex: ?step=... no guia)
 * para não interromper fluxos internos com URL sincronizada.
 */
export default function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    // Respeita âncoras (#secao) — scrolla para o elemento, não pro topo
    if (hash) {
      const id = hash.replace("#", "");
      // pequena espera p/ o elemento existir após render
      requestAnimationFrame(() => {
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
          return;
        }
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      });
      return;
    }
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname, hash]);

  return null;
}
