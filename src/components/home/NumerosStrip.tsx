import { useEffect, useRef, useState } from "react";

interface Numero {
  valor: number;
  sufixo?: string;
  prefixo?: string;
  label: string;
}

const NUMEROS: Numero[] = [
  { prefixo: "+", valor: 300, sufixo: " mil", label: "Downloads de modelos 3D" },
  { prefixo: "+", valor: 2500, label: "Projetos especificados" },
  { valor: 33, sufixo: " anos", label: "De ateliê em Cajamar/SP" },
  { valor: 4, label: "Acabamentos artesanais" },
];

function useCountUp(target: number, active: boolean, duration = 1400) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!active) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setV(target);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - p, 3);
      setV(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, active, duration]);
  return v;
}

function NumeroCell({ n, active }: { n: Numero; active: boolean }) {
  const v = useCountUp(n.valor, active);
  const formatted = v.toLocaleString("pt-BR");
  return (
    <div className="text-center px-4 py-8 md:py-10">
      <p className="font-display text-4xl md:text-5xl lg:text-6xl text-western-gold-soft leading-none tabular-nums">
        {n.prefixo}
        {formatted}
        {n.sufixo}
      </p>
      <p className="font-mono text-[10px] md:text-[11px] uppercase tracking-[0.24em] text-western-cream-muted mt-4">
        {n.label}
      </p>
    </div>
  );
}

export default function NumerosStrip() {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setActive(true);
            obs.disconnect();
          }
        }
      },
      { threshold: 0.35 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      className="surface-forest border-y border-western-gold/15"
      aria-label="Western em números"
    >
      <div className="container-western grid grid-cols-2 md:grid-cols-4 divide-x divide-western-gold/15">
        {NUMEROS.map((n) => (
          <NumeroCell key={n.label} n={n} active={active} />
        ))}
      </div>
    </section>
  );
}
