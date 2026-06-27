import { useEffect, useRef } from "react";

/**
 * Canvas full-screen com duas camadas:
 *  - AMBIENTE: ~50 motes/brasas flutuando lentamente pra cima (sempre ligado)
 *  - REATIVO: partículas quentes emitidas pelo cursor/toque
 * pointer-events-none. Respeita prefers-reduced-motion (versão estática).
 */
export default function DustCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = 0;
    let height = 0;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const palette: [number, number, number][] = [
      [201, 165, 126],
      [166, 124, 82],
      [140, 96, 58],
      [217, 184, 140],
    ];

    // ===== AMBIENTE — motes flutuando =====
    type Mote = {
      x: number; y: number; vx: number; vy: number;
      size: number; baseAlpha: number; phase: number; freq: number;
      color: [number, number, number];
    };
    const MOTES = 52;
    const motes: Mote[] = [];
    const spawnMote = (initial = false): Mote => ({
      x: Math.random() * width,
      y: initial ? Math.random() * height : height + 10 + Math.random() * 40,
      vx: (Math.random() - 0.5) * 0.08,
      vy: -(0.08 + Math.random() * 0.22),
      size: 1.1 + Math.random() * 2.4,
      baseAlpha: 0.18 + Math.random() * 0.32,
      phase: Math.random() * Math.PI * 2,
      freq: 0.6 + Math.random() * 1.4,
      color: palette[(Math.random() * palette.length) | 0],
    });
    for (let i = 0; i < MOTES; i++) motes.push(spawnMote(true));

    // ===== REATIVO — partículas do cursor =====
    type Particle = {
      x: number; y: number; vx: number; vy: number;
      life: number; max: number; size: number; color: [number, number, number];
    };
    const particles: Particle[] = [];
    const MAX = 360;
    const EMIT = 3;

    let mouseX = width / 2;
    let mouseY = height / 2;
    let lastX = mouseX;
    let lastY = mouseY;
    let active = false;
    let glowAlpha = 0;

    const emit = (x: number, y: number, count: number) => {
      for (let i = 0; i < count; i++) {
        if (particles.length >= MAX) particles.shift();
        const a = Math.random() * Math.PI * 2;
        const speed = Math.random() * 0.6 + 0.15;
        particles.push({
          x: x + (Math.random() - 0.5) * 6,
          y: y + (Math.random() - 0.5) * 6,
          vx: Math.cos(a) * speed,
          vy: Math.sin(a) * speed - 0.15,
          life: 0,
          max: 1.4 + Math.random() * 0.9,
          size: 1 + Math.random() * 2.2,
          color: palette[(Math.random() * palette.length) | 0],
        });
      }
    };

    const onMove = (x: number, y: number) => {
      mouseX = x; mouseY = y;
      const dx = x - lastX, dy = y - lastY;
      const d = Math.hypot(dx, dy);
      const n = Math.min(6, Math.max(EMIT, Math.floor(d / 6)));
      if (!reduce) emit(x, y, n);
      lastX = x; lastY = y;
      active = true;
    };
    const onMouse = (e: MouseEvent) => onMove(e.clientX, e.clientY);
    const onTouch = (e: TouchEvent) => {
      const t = e.touches[0];
      if (t) onMove(t.clientX, t.clientY);
    };
    window.addEventListener("mousemove", onMouse, { passive: true });
    window.addEventListener("touchmove", onTouch, { passive: true });

    // Versão estática quando reduzido: desenha motes uma vez e sai
    if (reduce) {
      ctx.globalCompositeOperation = "lighter";
      for (const m of motes) {
        const [r, g, b] = m.color;
        ctx.fillStyle = `rgba(${r},${g},${b},${m.baseAlpha})`;
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.size, 0, Math.PI * 2);
        ctx.fill();
      }
      return () => {
        window.removeEventListener("resize", resize);
        window.removeEventListener("mousemove", onMouse);
        window.removeEventListener("touchmove", onTouch);
      };
    }

    let raf = 0;
    let last = performance.now();
    const start = last;

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const t = (now - start) / 1000;

      // Trail fade (apaga camadas antigas suavemente)
      ctx.globalCompositeOperation = "destination-out";
      ctx.fillStyle = "rgba(0,0,0,0.10)";
      ctx.fillRect(0, 0, width, height);

      ctx.globalCompositeOperation = "lighter";

      // ----- motes ambiente -----
      for (let i = 0; i < motes.length; i++) {
        const m = motes[i];
        m.x += m.vx;
        m.y += m.vy;
        // drift horizontal sutil (vento)
        m.vx += Math.sin(t * 0.3 + m.phase) * 0.0008;
        // recicla
        if (m.y < -10 || m.x < -10 || m.x > width + 10) {
          motes[i] = spawnMote(false);
          continue;
        }
        const flick = 0.65 + 0.35 * Math.sin(t * m.freq + m.phase);
        const alpha = m.baseAlpha * flick;
        const [r, g, b] = m.color;
        // halo borrado
        ctx.fillStyle = `rgba(${r},${g},${b},${alpha * 0.35})`;
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.size * 2.4, 0, Math.PI * 2);
        ctx.fill();
        // núcleo
        ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.size, 0, Math.PI * 2);
        ctx.fill();
      }

      // soft glow at cursor
      glowAlpha += ((active ? 0.18 : 0) - glowAlpha) * 0.08;
      if (glowAlpha > 0.01) {
        const r = 90;
        const grad = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, r);
        grad.addColorStop(0, `rgba(217,184,140,${glowAlpha})`);
        grad.addColorStop(1, "rgba(217,184,140,0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(mouseX, mouseY, r, 0, Math.PI * 2);
        ctx.fill();
      }

      // ----- partículas reativas -----
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life += dt;
        if (p.life >= p.max) { particles.splice(i, 1); continue; }
        p.vy -= 0.02 * dt * 60;
        p.vx *= 0.99;
        p.vy *= 0.99;
        p.x += p.vx;
        p.y += p.vy;
        const k = p.life / p.max;
        const alpha = (1 - k) * 0.85;
        const [r, g, b] = p.color;
        ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (1 - k * 0.5), 0, Math.PI * 2);
        ctx.fill();
      }

      active = false;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouse);
      window.removeEventListener("touchmove", onTouch);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[5]"
      style={{ filter: "blur(0.4px)" }}
      aria-hidden="true"
    />
  );
}
