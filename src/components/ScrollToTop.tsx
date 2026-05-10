import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Reseta o scroll para o topo a cada mudança de rota.
 * Ignora mudanças apenas de querystring (ex: ?step=... no guia)
 * para não interromper fluxos internos com URL sincronizada.
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname]);

  return null;
}
