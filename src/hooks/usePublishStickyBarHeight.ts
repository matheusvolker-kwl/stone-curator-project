import { useEffect, type RefObject } from "react";

/**
 * Publica a altura de uma barra fixa inferior na CSS var --sticky-buy-bar-h.
 *
 * Overlays de rodapé (FAB do WhatsApp, pílula de lembrete) leem essa var para
 * subir ACIMA da barra em vez de cobrir o CTA. Antes só a StickyBuyBarLab (PDP)
 * publicava — por isso o FAB cobria o botão nas barras fixas de Carrinho,
 * ConjuntoPage e Western Box. Zera na desmontagem.
 *
 * Em `display:none` (ex.: barra `lg:hidden` no desktop) o offsetHeight é 0, então
 * a var some sozinha no viewport onde a barra não existe — sem precisar de flag.
 */
export function usePublishStickyBarHeight(
  ref: RefObject<HTMLElement>,
  active = true,
) {
  useEffect(() => {
    const root = document.documentElement;
    const update = () => {
      const el = ref.current;
      const h = active && el ? el.offsetHeight : 0;
      root.style.setProperty("--sticky-buy-bar-h", `${h}px`);
    };
    update();
    const ro = ref.current ? new ResizeObserver(update) : null;
    if (ro && ref.current) ro.observe(ref.current);
    window.addEventListener("resize", update);
    return () => {
      ro?.disconnect();
      window.removeEventListener("resize", update);
      root.style.setProperty("--sticky-buy-bar-h", "0px");
    };
  }, [ref, active]);
}
