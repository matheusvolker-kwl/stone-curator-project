import { useState, useMemo, useEffect } from "react";
import { Slider } from "@/components/ui/slider";
import { ArrowRight, Lock } from "lucide-react";
import StepShell from "./StepShell";
import { useGuideStore } from "@/stores/guideStore";
import { useAuth } from "@/hooks/useAuth";
import {
  areaRangePorTipo,
  m2ToTamanhoId,
  precoEstimadoPorArea,
  formatPreco,
  type Tipo,
} from "@/data/guideMap";

interface IsoSceneProps {
  tipo: Tipo;
  m2: number;
  maxM2: number;
}

// Vista isométrica simulada — retângulo proporcional + silhueta humana 1,75 m
function IsoScene({ tipo, m2, maxM2 }: IsoSceneProps) {
  // Escala: o lado do "tapete" cresce com sqrt(m2 / maxM2)
  const ratio = Math.sqrt(m2 / maxM2);
  // Limites visuais: largura mínima 60, máxima 320
  const w = 60 + (260 * ratio);
  const h = w * 0.55; // perspectiva isométrica (achatado)

  // Cor por tipo
  const fillByTipo: Record<Tipo, string> = {
    lago: "hsl(140 38% 17%)",
    piscina: "hsl(195 40% 28%)",
    jardim: "hsl(140 22% 22%)",
  };
  const accentByTipo: Record<Tipo, string> = {
    lago: "hsl(32 27% 52% / 0.7)",
    piscina: "hsl(32 27% 52% / 0.6)",
    jardim: "hsl(140 30% 35%)",
  };

  const cx = 200;
  const cy = 170;

  return (
    <svg
      viewBox="0 0 400 280"
      className="w-full h-full"
      aria-label={`Área aproximada de ${m2} metros quadrados`}
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <linearGradient id="iso-floor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="hsl(38 35% 95%)" />
          <stop offset="1" stopColor="hsl(38 35% 86%)" />
        </linearGradient>
      </defs>
      <rect width="400" height="280" fill="url(#iso-floor)" />
      {/* grid sutil */}
      <g stroke="hsl(140 47% 11% / 0.05)" strokeWidth="1">
        {Array.from({ length: 9 }).map((_, i) => (
          <line key={`v${i}`} x1={i * 50} y1={0} x2={i * 50} y2={280} />
        ))}
        {Array.from({ length: 7 }).map((_, i) => (
          <line key={`h${i}`} x1={0} y1={i * 40} x2={400} y2={i * 40} />
        ))}
      </g>

      {/* Tapete isométrico (losango achatado) */}
      <g transform={`translate(${cx}, ${cy})`} style={{ transition: "all 300ms cubic-bezier(0.4,0,0.2,1)" }}>
        <polygon
          points={`0,${-h / 2} ${w / 2},0 0,${h / 2} ${-w / 2},0`}
          fill={fillByTipo[tipo]}
          stroke="hsl(140 47% 11% / 0.4)"
          strokeWidth="1"
        />
        {/* "pedras" decorativas dentro */}
        <g fill={accentByTipo[tipo]} opacity={Math.min(1, m2 / 20)}>
          <ellipse cx={0} cy={0} rx={Math.min(w * 0.18, 30)} ry={Math.min(h * 0.18, 14)} />
          <ellipse cx={-w * 0.22} cy={h * 0.05} rx={Math.min(w * 0.12, 20)} ry={Math.min(h * 0.12, 9)} />
          <ellipse cx={w * 0.22} cy={-h * 0.05} rx={Math.min(w * 0.12, 20)} ry={Math.min(h * 0.12, 9)} />
        </g>
      </g>

      {/* Silhueta humana 1,75 m fixa para escala (canto inferior direito) */}
      {/* Escala: 1m no tapete ≈ 18px na base atual quando tapete tem largura w */}
      <g transform="translate(370, 240)" fill="hsl(140 47% 11% / 0.55)">
        <ellipse cx="0" cy="-32" rx="3.5" ry="3.5" />
        <rect x="-3" y="-29" width="6" height="20" rx="1" />
        <rect x="-3" y="-9" width="2.5" height="9" />
        <rect x="0.5" y="-9" width="2.5" height="9" />
        <text x="-32" y="6" fontFamily="monospace" fontSize="7" fill="hsl(140 47% 11% / 0.6)" letterSpacing="1">
          1,75 m
        </text>
      </g>
    </svg>
  );
}

export default function StepArea() {
  const tipo = useGuideStore((s) => s.tipo);
  const areaSaved = useGuideStore((s) => s.areaM2);
  const setArea = useGuideStore((s) => s.setArea);
  const back = useGuideStore((s) => s.back);
  const reset = useGuideStore((s) => s.reset);
  const { isApproved } = useAuth();

  const range = tipo ? areaRangePorTipo[tipo] : { min: 1, max: 30, default: 5, snap: [] };
  const [m2, setM2] = useState<number>(areaSaved ?? range.default);

  useEffect(() => {
    if (tipo && areaSaved == null) setM2(range.default);
  }, [tipo, areaSaved, range.default]);

  const preco = useMemo(() => (tipo ? precoEstimadoPorArea(tipo, m2) : null), [tipo, m2]);
  const tamanhoId = tipo ? m2ToTamanhoId(tipo, m2) : null;
  const isConsultor = tamanhoId === "consultor";

  if (!tipo) return null;

  // Snap magnético leve: se ao soltar estiver a ≤1 unidade de um marker, encaixa
  const handleCommit = (value: number[]) => {
    let v = value[0];
    for (const s of range.snap) {
      if (Math.abs(v - s) <= 1) { v = s; break; }
    }
    setM2(v);
  };

  const pergunta =
    tipo === "lago"
      ? "Qual a área do espelho d'água?"
      : tipo === "piscina"
        ? "Qual a área da piscina?"
        : "Qual a área do jardim?";

  return (
    <StepShell
      stepKey="area"
      pergunta={pergunta}
      subtitulo="Arraste para dimensionar. A faixa de investimento atualiza em tempo real — você poderá revisar na próxima etapa."
      onBack={back}
      onReset={reset}
    >
      <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-10 items-start">
        {/* Vista isométrica */}
        <div className="bg-white border border-western-stone-warm/15 aspect-[4/3] overflow-hidden">
          <IsoScene tipo={tipo} m2={m2} maxM2={range.max} />
        </div>

        {/* Controle + leitura */}
        <div className="space-y-8">
          <div>
            <p className="text-eyebrow mb-3">Área aproximada</p>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="font-display text-6xl md:text-7xl text-western-green-deep leading-none transition-colors">
                {m2}
              </span>
              <span className="font-mono text-lg text-western-stone-warm">m²</span>
            </div>
            {isConsultor ? (
              <p className="text-sm text-western-gold mt-3 leading-relaxed">
                Projetos acima do nosso range padrão recebem atendimento consultivo
                — composição autoral conforme briefing.
              </p>
            ) : preco ? (
              <p className="text-sm text-western-stone-warm mt-3">
                Investimento estimado:{" "}
                <span className="text-western-green-deep font-medium">
                  {formatPreco(preco.min)} – {formatPreco(preco.max)}
                </span>
              </p>
            ) : null}
          </div>

          <div>
            <Slider
              value={[m2]}
              min={range.min}
              max={range.max}
              step={1}
              onValueChange={(v) => setM2(v[0])}
              onValueCommit={handleCommit}
              aria-label="Área em metros quadrados"
            />
            {/* Marcadores */}
            <div className="relative mt-3 h-4 text-[10px] font-mono text-western-stone-warm/60">
              {range.snap.map((s) => {
                const pct = ((s - range.min) / (range.max - range.min)) * 100;
                return (
                  <span
                    key={s}
                    className="absolute -translate-x-1/2"
                    style={{ left: `${pct}%` }}
                  >
                    {s} m²
                  </span>
                );
              })}
            </div>
          </div>

          {/* Input numérico paralelo */}
          <div className="flex items-center gap-3">
            <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-western-stone-warm">
              Ou digite o valor exato
            </label>
            <input
              type="number"
              min={range.min}
              max={range.max}
              value={m2}
              onChange={(e) => {
                const v = Number(e.target.value);
                if (!Number.isNaN(v)) setM2(Math.max(range.min, Math.min(range.max, v)));
              }}
              className="w-20 px-3 py-2 bg-white border border-western-stone-warm/30 font-mono text-sm text-western-green-deep focus:outline-none focus:border-western-gold"
            />
            <span className="text-sm text-western-stone-warm">m²</span>
          </div>

          <button
            type="button"
            onClick={() => setArea(m2)}
            className="btn-gold w-full justify-center"
          >
            {isConsultor ? "Falar com consultor" : "Continuar"}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </StepShell>
  );
}
