import { useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Reseta o scroll para o topo a cada mudança de rota.
 * Ignora mudanças apenas de querystring (ex: ?step=... no guia)
 * para não interromper fluxos internos com URL sincronizada.
 *
 * useLayoutEffect (não useEffect): roda ANTES da pintura, então a página nova
 * já aparece no topo. Com useEffect (pós-pintura) a página nova herdava o scroll
 * da anterior por 1 frame e só então saltava — o "buga e corre pra cima" que o
 * dono viu ao clicar em "Entrar" com a página rolada (2026-07-18).
 */
export default function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useLayoutEffect(() => {
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
