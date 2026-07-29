import { useEffect, useRef, useState, type ReactNode, type CSSProperties } from "react";

type Variant = "fade-up" | "fade" | "fade-right" | "fade-left" | "scale";

interface RevealProps {
  children: ReactNode;
  /** Tipo de animação na entrada. Default: fade-up */
  variant?: Variant;
  /** Delay em ms */
  delay?: number;
  /** Duração em ms. Default: 700 */
  duration?: number;
  /** Distância em px do deslocamento inicial. Default: 28 */
  distance?: number;
  /** Fração de visibilidade pra disparar (0–1). Default: 0.15 */
  threshold?: number;
  /** Repetir a animação ao reentrar na viewport. Default: false */
  repeat?: boolean;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}

const initialTransform = (variant: Variant, distance: number): string => {
  switch (variant) {
    case "fade":
      return "none";
    case "fade-up":
      return `translate3d(0, ${distance}px, 0)`;
    case "fade-right":
      return `translate3d(-${distance}px, 0, 0)`;
    case "fade-left":
      return `translate3d(${distance}px, 0, 0)`;
    case "scale":
      return "scale(0.96)";
  }
};

/**
 * Wrapper que aplica fade/slide quando o elemento entra na viewport.
 * Respeita prefers-reduced-motion automaticamente.
 */
export default function Reveal({
  children,
  variant = "fade-up",
  delay = 0,
  duration = 700,
  distance = 28,
  threshold = 0.15,
  repeat = false,
  className,
  as: Tag = "div",
}: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setVisible(true);
      return;
    }

    const node = ref.current;
    if (!node) return;

    // Rede de segurança contra "vazios de scroll": se o observer não disparar
    // (crawler, captura full-page/preview, scroll muito rápido), revela mesmo
    // assim — nada de conteúdo permanentemente invisível. O scroll normal
    // dispara o IO bem antes disso, preservando a animação.
    const fallback = window.setTimeout(() => setVisible(true), 1600);

    const obs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            window.clearTimeout(fallback);
            if (!repeat) obs.unobserve(entry.target);
          } else if (repeat) {
            setVisible(false);
          }
        }
      },
      { threshold, rootMargin: "0px 0px -8% 0px" }
    );

    obs.observe(node);
    return () => {
      obs.disconnect();
      window.clearTimeout(fallback);
    };
  }, [threshold, repeat]);

  const style: CSSProperties = {
    opacity: visible ? 1 : 0,
    transform: visible ? "none" : initialTransform(variant, distance),
    transition: `opacity ${duration}ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms, transform ${duration}ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms`,
    willChange: "opacity, transform",
  };

  // @ts-expect-error — ref typing across polymorphic Tag
  return <Tag ref={ref} style={style} className={className}>{children}</Tag>;
}
