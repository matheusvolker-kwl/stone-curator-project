import { useEffect, useState } from "react";

/**
 * Retorna o offset Y atual do scroll, com throttling via requestAnimationFrame.
 * Útil para parallax sutil em hero/imagens.
 */
export function useScrollY() {
  const [y, setY] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(() => {
          setY(window.scrollY);
          ticking = false;
        });
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return y;
}
