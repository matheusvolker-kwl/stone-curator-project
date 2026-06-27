import { useEffect, useRef } from "react";

/**
 * Canvas full-screen que emite partículas quentes seguindo o cursor/toque.
 * pointer-events-none. Respeita prefers-reduced-motion.
 */
export default function DustCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

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
      emit(x, y, n);
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

    let raf = 0;
    let last = performance.now();

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      // Trail fade
      ctx.globalCompositeOperation = "destination-out";
      ctx.fillStyle = "rgba(0,0,0,0.12)";
      ctx.fillRect(0, 0, width, height);

      ctx.globalCompositeOperation = "lighter";

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

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life += dt;
        if (p.life >= p.max) { particles.splice(i, 1); continue; }
        p.vy -= 0.02 * dt * 60; // tiny upward drift
        p.vx *= 0.99;
        p.vy *= 0.99;
        p.x += p.vx;
        p.y += p.vy;
        const t = p.life / p.max;
        const alpha = (1 - t) * 0.85;
        const [r, g, b] = p.color;
        ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (1 - t * 0.5), 0, Math.PI * 2);
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
      aria-hidden="true"
    />
  );
}
