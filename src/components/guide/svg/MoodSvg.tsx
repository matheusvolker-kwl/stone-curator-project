// Placeholders SVG estilizados — verde profundo + dourado.
// Usados nos cards de etapa enquanto a Western não fornece fotos/renders curados.
import type { Tipo } from "@/data/guideMap";

export function MoodLago({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 280" className={`w-full h-full ${className}`} aria-hidden="true" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="mlg-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="hsl(140 47% 11%)" />
          <stop offset="1" stopColor="hsl(140 38% 17%)" />
        </linearGradient>
        <linearGradient id="mlg-water" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="hsl(140 22% 28%)" />
          <stop offset="1" stopColor="hsl(140 38% 17%)" />
        </linearGradient>
      </defs>
      <rect width="400" height="280" fill="url(#mlg-sky)" />
      {/* horizonte */}
      <line x1="0" y1="150" x2="400" y2="150" stroke="hsl(32 27% 52% / 0.3)" strokeWidth="1" />
      {/* lago */}
      <ellipse cx="200" cy="220" rx="220" ry="60" fill="url(#mlg-water)" />
      {/* pedras */}
      <g fill="hsl(32 27% 52% / 0.7)">
        <ellipse cx="120" cy="200" rx="38" ry="14" />
        <ellipse cx="180" cy="195" rx="48" ry="18" />
        <ellipse cx="260" cy="200" rx="42" ry="16" />
        <ellipse cx="320" cy="205" rx="28" ry="12" />
      </g>
      {/* reflexo dourado */}
      <ellipse cx="200" cy="225" rx="120" ry="3" fill="hsl(32 36% 65% / 0.4)" />
    </svg>
  );
}

export function MoodPiscina({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 280" className={`w-full h-full ${className}`} aria-hidden="true" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="mp-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="hsl(140 47% 11%)" />
          <stop offset="1" stopColor="hsl(140 22% 28%)" />
        </linearGradient>
        <linearGradient id="mp-water" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="hsl(195 35% 35%)" />
          <stop offset="1" stopColor="hsl(195 40% 25%)" />
        </linearGradient>
      </defs>
      <rect width="400" height="280" fill="url(#mp-bg)" />
      {/* deck */}
      <rect x="0" y="180" width="400" height="100" fill="hsl(32 27% 52% / 0.18)" />
      {/* piscina (retângulo perspectiva) */}
      <polygon points="60,200 340,200 360,260 40,260" fill="url(#mp-water)" />
      {/* borda de pedras */}
      <g fill="hsl(32 27% 52% / 0.75)">
        <rect x="40" y="190" width="50" height="14" />
        <rect x="110" y="188" width="60" height="14" />
        <rect x="190" y="190" width="55" height="14" />
        <rect x="265" y="188" width="55" height="14" />
        <rect x="340" y="190" width="35" height="14" />
      </g>
      {/* cascata sutil */}
      <line x1="200" y1="200" x2="200" y2="240" stroke="hsl(32 36% 65% / 0.5)" strokeWidth="2" />
      <line x1="208" y1="200" x2="208" y2="245" stroke="hsl(32 36% 65% / 0.35)" strokeWidth="1" />
    </svg>
  );
}

export function MoodJardim({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 280" className={`w-full h-full ${className}`} aria-hidden="true" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="mj-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="hsl(140 47% 11%)" />
          <stop offset="1" stopColor="hsl(140 38% 17%)" />
        </linearGradient>
      </defs>
      <rect width="400" height="280" fill="url(#mj-bg)" />
      {/* terreno */}
      <path d="M 0 220 Q 200 200 400 220 L 400 280 L 0 280 Z" fill="hsl(140 22% 22%)" />
      {/* vegetação (arbustos) */}
      <g fill="hsl(140 30% 35%)">
        <ellipse cx="60" cy="200" rx="30" ry="40" />
        <ellipse cx="340" cy="195" rx="35" ry="45" />
      </g>
      {/* pedras Western */}
      <g fill="hsl(32 27% 52% / 0.85)">
        <ellipse cx="160" cy="240" rx="38" ry="16" />
        <ellipse cx="220" cy="245" rx="32" ry="14" />
        <ellipse cx="280" cy="240" rx="26" ry="12" />
        <ellipse cx="190" cy="225" rx="22" ry="10" />
      </g>
      {/* fonte sugerida */}
      <line x1="190" y1="210" x2="190" y2="225" stroke="hsl(32 36% 65% / 0.6)" strokeWidth="2" />
    </svg>
  );
}

export function MoodEspecial({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 280" className={`w-full h-full ${className}`} aria-hidden="true" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="me-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="hsl(140 47% 11%)" />
          <stop offset="1" stopColor="hsl(30 13% 14%)" />
        </linearGradient>
      </defs>
      <rect width="400" height="280" fill="url(#me-bg)" />
      {/* parede arquitetônica */}
      <rect x="50" y="40" width="300" height="200" fill="hsl(30 13% 18%)" />
      {/* peças aplicadas em parede */}
      <g fill="hsl(32 27% 52% / 0.75)">
        <rect x="80" y="70" width="60" height="40" />
        <rect x="160" y="70" width="80" height="40" />
        <rect x="260" y="70" width="60" height="40" />
        <rect x="80" y="130" width="100" height="50" />
        <rect x="200" y="130" width="120" height="50" />
        <rect x="80" y="200" width="80" height="30" />
        <rect x="180" y="200" width="60" height="30" />
        <rect x="260" y="200" width="60" height="30" />
      </g>
      {/* iluminação dourada lateral */}
      <line x1="50" y1="40" x2="50" y2="240" stroke="hsl(32 36% 65%)" strokeWidth="1.5" />
    </svg>
  );
}

export function MoodFor({ tipo, className = "" }: { tipo: Tipo; className?: string }) {
  if (tipo === "lago") return <MoodLago className={className} />;
  if (tipo === "piscina") return <MoodPiscina className={className} />;
  return <MoodJardim className={className} />;
}

// --- Variações por nível de protagonismo (densidade de pedras) ---
function ProtagonismoLago({ nivel }: { nivel: "essencial" | "equilibrada" | "completa" }) {
  const counts = { essencial: 3, equilibrada: 6, completa: 10 };
  const n = counts[nivel];
  return (
    <svg viewBox="0 0 400 280" className="w-full h-full" aria-hidden="true" preserveAspectRatio="xMidYMid slice">
      <rect width="400" height="280" fill="hsl(140 47% 11%)" />
      <line x1="0" y1="150" x2="400" y2="150" stroke="hsl(32 27% 52% / 0.25)" strokeWidth="1" />
      <ellipse cx="200" cy="220" rx="220" ry="60" fill="hsl(140 38% 17%)" />
      <g fill="hsl(32 27% 52% / 0.85)">
        {Array.from({ length: n }).map((_, i) => {
          const x = 60 + (i * (280 / Math.max(n - 1, 1)));
          const y = 195 + ((i % 2) * 8);
          const r = 14 + ((i * 3) % 12);
          return <ellipse key={i} cx={x} cy={y} rx={r + 12} ry={r * 0.45} />;
        })}
      </g>
      <ellipse cx="200" cy="232" rx="120" ry="2" fill="hsl(32 36% 65% / 0.35)" />
    </svg>
  );
}

function ProtagonismoPiscina({ nivel }: { nivel: "essencial" | "equilibrada" | "completa" }) {
  return (
    <svg viewBox="0 0 400 280" className="w-full h-full" aria-hidden="true" preserveAspectRatio="xMidYMid slice">
      <rect width="400" height="280" fill="hsl(140 47% 11%)" />
      <rect x="0" y="180" width="400" height="100" fill="hsl(32 27% 52% / 0.15)" />
      <polygon points="60,200 340,200 360,260 40,260" fill="hsl(195 40% 28%)" />
      <g fill="hsl(32 27% 52% / 0.8)">
        {nivel === "essencial" && (
          <>
            <rect x="80" y="190" width="50" height="14" />
            <rect x="270" y="190" width="50" height="14" />
          </>
        )}
        {nivel === "equilibrada" && (
          <>
            <rect x="50" y="190" width="55" height="14" />
            <rect x="120" y="188" width="60" height="14" />
            <rect x="200" y="190" width="55" height="14" />
            <rect x="275" y="188" width="60" height="14" />
            {/* cascata */}
            <line x1="200" y1="200" x2="200" y2="240" stroke="hsl(32 36% 65% / 0.6)" strokeWidth="2" />
          </>
        )}
        {nivel === "completa" && (
          <>
            <rect x="40" y="188" width="55" height="14" />
            <rect x="105" y="190" width="55" height="14" />
            <rect x="170" y="188" width="55" height="14" />
            <rect x="235" y="190" width="55" height="14" />
            <rect x="300" y="188" width="60" height="14" />
            {/* cascata grande */}
            <rect x="180" y="160" width="40" height="40" fill="hsl(32 27% 52% / 0.9)" />
            <line x1="190" y1="200" x2="190" y2="250" stroke="hsl(32 36% 65% / 0.7)" strokeWidth="2" />
            <line x1="200" y1="200" x2="200" y2="255" stroke="hsl(32 36% 65% / 0.5)" strokeWidth="2" />
            <line x1="210" y1="200" x2="210" y2="252" stroke="hsl(32 36% 65% / 0.6)" strokeWidth="2" />
          </>
        )}
      </g>
    </svg>
  );
}

function ProtagonismoJardim({ nivel }: { nivel: "essencial" | "equilibrada" | "completa" }) {
  const counts = { essencial: 2, equilibrada: 5, completa: 9 };
  const n = counts[nivel];
  return (
    <svg viewBox="0 0 400 280" className="w-full h-full" aria-hidden="true" preserveAspectRatio="xMidYMid slice">
      <rect width="400" height="280" fill="hsl(140 47% 11%)" />
      <path d="M 0 220 Q 200 200 400 220 L 400 280 L 0 280 Z" fill="hsl(140 22% 22%)" />
      <ellipse cx="60" cy="200" rx="30" ry="40" fill="hsl(140 30% 35%)" />
      <ellipse cx="340" cy="195" rx="35" ry="45" fill="hsl(140 30% 35%)" />
      <g fill="hsl(32 27% 52% / 0.85)">
        {Array.from({ length: n }).map((_, i) => {
          const x = 130 + (i * (160 / Math.max(n - 1, 1)));
          const y = 235 + ((i % 2) * 6);
          return <ellipse key={i} cx={x} cy={y} rx={18 + (i * 2) % 10} ry={10} />;
        })}
      </g>
    </svg>
  );
}

export function ProtagonismoMood({
  tipo,
  nivel,
}: {
  tipo: Tipo;
  nivel: "essencial" | "equilibrada" | "completa";
}) {
  if (tipo === "lago") return <ProtagonismoLago nivel={nivel} />;
  if (tipo === "piscina") return <ProtagonismoPiscina nivel={nivel} />;
  return <ProtagonismoJardim nivel={nivel} />;
}

// --- Comparativo de composição (lago / jardim) ---
export function ComposicaoSoWestern() {
  return (
    <svg viewBox="0 0 400 220" className="w-full h-full" aria-hidden="true" preserveAspectRatio="xMidYMid slice">
      <rect width="400" height="220" fill="hsl(140 47% 11%)" />
      <ellipse cx="200" cy="170" rx="220" ry="50" fill="hsl(140 38% 17%)" />
      <g fill="hsl(32 27% 52% / 0.85)">
        <ellipse cx="80" cy="155" rx="34" ry="14" />
        <ellipse cx="140" cy="148" rx="42" ry="16" />
        <ellipse cx="200" cy="152" rx="48" ry="18" />
        <ellipse cx="260" cy="148" rx="40" ry="16" />
        <ellipse cx="320" cy="155" rx="32" ry="14" />
        <ellipse cx="170" cy="135" rx="24" ry="10" />
        <ellipse cx="230" cy="135" rx="22" ry="10" />
      </g>
    </svg>
  );
}

export function ComposicaoComNaturais() {
  return (
    <svg viewBox="0 0 400 220" className="w-full h-full" aria-hidden="true" preserveAspectRatio="xMidYMid slice">
      <rect width="400" height="220" fill="hsl(140 47% 11%)" />
      <ellipse cx="200" cy="170" rx="220" ry="50" fill="hsl(140 38% 17%)" />
      {/* Western (dourado) intercalado com naturais (cinza esverdeado) */}
      <g>
        <ellipse cx="80" cy="155" rx="34" ry="14" fill="hsl(32 27% 52% / 0.85)" />
        <ellipse cx="140" cy="148" rx="42" ry="16" fill="hsl(140 12% 45% / 0.7)" />
        <ellipse cx="200" cy="152" rx="48" ry="18" fill="hsl(32 27% 52% / 0.85)" />
        <ellipse cx="260" cy="148" rx="40" ry="16" fill="hsl(140 12% 45% / 0.7)" />
        <ellipse cx="320" cy="155" rx="32" ry="14" fill="hsl(32 27% 52% / 0.85)" />
      </g>
    </svg>
  );
}

export function JardimSeco() {
  return (
    <svg viewBox="0 0 400 220" className="w-full h-full" aria-hidden="true" preserveAspectRatio="xMidYMid slice">
      <rect width="400" height="220" fill="hsl(140 47% 11%)" />
      <path d="M 0 160 Q 200 145 400 160 L 400 220 L 0 220 Z" fill="hsl(140 22% 22%)" />
      <ellipse cx="60" cy="150" rx="28" ry="36" fill="hsl(140 30% 35%)" />
      <ellipse cx="340" cy="145" rx="32" ry="40" fill="hsl(140 30% 35%)" />
      <g fill="hsl(32 27% 52% / 0.85)">
        <ellipse cx="160" cy="185" rx="32" ry="13" />
        <ellipse cx="220" cy="190" rx="28" ry="12" />
        <ellipse cx="270" cy="185" rx="22" ry="10" />
      </g>
    </svg>
  );
}

export function JardimComFonte() {
  return (
    <svg viewBox="0 0 400 220" className="w-full h-full" aria-hidden="true" preserveAspectRatio="xMidYMid slice">
      <rect width="400" height="220" fill="hsl(140 47% 11%)" />
      <path d="M 0 160 Q 200 145 400 160 L 400 220 L 0 220 Z" fill="hsl(140 22% 22%)" />
      <ellipse cx="60" cy="150" rx="28" ry="36" fill="hsl(140 30% 35%)" />
      <ellipse cx="340" cy="145" rx="32" ry="40" fill="hsl(140 30% 35%)" />
      <g fill="hsl(32 27% 52% / 0.85)">
        <ellipse cx="160" cy="185" rx="32" ry="13" />
        <ellipse cx="220" cy="190" rx="28" ry="12" />
        <ellipse cx="270" cy="185" rx="22" ry="10" />
      </g>
      {/* fonte */}
      <rect x="195" y="160" width="20" height="22" fill="hsl(32 27% 52%)" />
      <line x1="205" y1="160" x2="205" y2="135" stroke="hsl(32 36% 65%)" strokeWidth="2" />
      <ellipse cx="205" cy="135" rx="6" ry="2" fill="hsl(32 36% 65% / 0.5)" />
      <ellipse cx="205" cy="184" rx="40" ry="6" fill="hsl(195 40% 35% / 0.5)" />
    </svg>
  );
}
