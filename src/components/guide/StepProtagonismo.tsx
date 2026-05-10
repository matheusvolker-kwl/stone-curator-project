import { useState } from "react";
import { Check, Lock } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import StepShell from "./StepShell";
import { useGuideStore } from "@/stores/guideStore";
import {
  nivelMeta,
  pecasPorTipoNivel,
  precoEstimadoPorAreaENivel,
  formatPrecoRangeMil,
  provaSocialPorTipo,
  type Nivel,
  type Tipo,
} from "@/data/guideMap";
import { useAuth } from "@/hooks/useAuth";
import { ProtagonismoMood } from "./svg/MoodSvg";

const NIVEIS: Nivel[] = ["essencial", "equilibrada", "completa"];

const PERFIL_POR_NIVEL: Record<Nivel, string> = {
  essencial: "Cliente que valoriza paisagismo abundante e quer um ponto de respiro.",
  equilibrada: "Cliente que quer presença Western definida sem dominar o ambiente.",
  completa: "Cliente que busca ambiente cenográfico e leitura imersiva.",
};

interface ComparativoCardProps {
  tipo: Tipo;
  nivel: Nivel;
  areaM2?: number;
  isApproved: boolean;
  selected: boolean;
  recommended: boolean;
  onClick: () => void;
  onHover: (n: Nivel | null) => void;
}

function ComparativoCard({ tipo, nivel, areaM2, isApproved, selected, recommended, onClick, onHover }: ComparativoCardProps) {
  const meta = nivelMeta[tipo][nivel];
  const pecas = pecasPorTipoNivel[tipo][nivel];
  const precoRange = areaM2 ? precoEstimadoPorAreaENivel(tipo, areaM2, nivel) : null;
  const precoLabel = precoRange ? formatPrecoRangeMil(precoRange) : meta.faixaPreco;
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => onHover(nivel)}
      onMouseLeave={() => onHover(null)}
      onFocus={() => onHover(nivel)}
      onBlur={() => onHover(null)}
      aria-pressed={selected}
      aria-label={`${meta.label} — ${meta.tagline}`}
      className={`group relative text-left flex flex-col bg-white border-2 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-western-gold focus-visible:ring-offset-2 overflow-hidden ${
        selected
          ? "border-western-gold shadow-[0_18px_40px_-18px_rgba(180,144,90,0.5)]"
          : recommended
            ? "border-western-gold/60 hover:border-western-gold hover:-translate-y-1"
            : "border-western-stone-warm/15 hover:border-western-gold/60 hover:-translate-y-1"
      }`}
    >
      {recommended && !selected && (
        <span className="absolute top-3 left-3 z-10 px-2.5 py-1 bg-western-gold text-western-green-deep font-mono text-[9px] uppercase tracking-[0.2em]">
          Mais escolhido
        </span>
      )}
      {selected && (
        <span className="absolute top-3 right-3 z-10 inline-flex items-center justify-center h-6 w-6 rounded-full bg-western-gold text-western-green-deep">
          <Check className="h-3.5 w-3.5" strokeWidth={3} />
        </span>
      )}

      <div className="aspect-[4/3] w-full overflow-hidden bg-western-green-deep">
        <div className="w-full h-full transition-transform duration-700 group-hover:scale-105">
          <ProtagonismoMood tipo={tipo} nivel={nivel} />
        </div>
      </div>

      <div className="p-5 md:p-6 flex-1 flex flex-col gap-2">
        <div className="flex items-baseline justify-between gap-3 flex-wrap">
          <h3 className="font-display text-xl md:text-2xl text-western-green-deep leading-tight">
            {meta.label}
          </h3>
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-western-stone-warm">
            {pecas}
          </span>
        </div>
        <p className="text-sm text-western-stone-warm leading-relaxed">{meta.tagline}</p>
        <p className="text-xs text-western-stone-warm/80 leading-relaxed pt-1.5 border-t border-western-stone-warm/10 mt-1">
          <span className="font-mono uppercase tracking-[0.18em] text-[9px] text-western-gold mr-1.5">
            Ideal para
          </span>
          {PERFIL_POR_NIVEL[nivel]}
        </p>
        <div className="mt-auto pt-3 text-xs font-mono uppercase tracking-[0.18em]">
          {isApproved ? (
            <span className="text-western-stone-warm/70">
              Investimento estimado · <span className="text-western-green-deep">{precoLabel}</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-western-stone-warm/70">
              <Lock className="h-3 w-3" /> Login para ver investimento
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

export default function StepProtagonismo() {
  const tipo = useGuideStore((s) => s.tipo);
  const areaM2 = useGuideStore((s) => s.areaM2);
  const nivel = useGuideStore((s) => s.nivel);
  const setNivel = useGuideStore((s) => s.setNivel);
  const back = useGuideStore((s) => s.back);
  const reset = useGuideStore((s) => s.reset);
  const [hovered, setHovered] = useState<Nivel | null>(null);
  const { isApproved } = useAuth();

  if (!tipo) return null;

  const prova = provaSocialPorTipo[tipo];
  const previewNivel = hovered;

  return (
    <div className="relative">
      {/* Hover background preview */}
      <AnimatePresence>
        {previewNivel && (
          <motion.div
            key={previewNivel}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.12 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="pointer-events-none absolute inset-0 -m-6 md:-m-12 overflow-hidden"
            aria-hidden
          >
            <div className="w-full h-full">
              <ProtagonismoMood tipo={tipo} nivel={previewNivel} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative">
        <StepShell
          stepKey="protagonismo"
          pergunta="Qual destas composições mais se aproxima do seu projeto?"
          subtitulo="Compare o mesmo ambiente em três níveis de presença Western. Passe o mouse para pré-visualizar e clique no que faz mais sentido."
          onBack={back}
          onReset={reset}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
            {NIVEIS.map((n) => (
              <ComparativoCard
                key={n}
                tipo={tipo}
                nivel={n}
                areaM2={areaM2 ?? undefined}
                isApproved={isApproved}
                selected={nivel === n}
                recommended={n === "equilibrada"}
                onClick={() => setNivel(n)}
                onHover={setHovered}
              />
            ))}
          </div>

          <p className="mt-8 text-sm text-western-stone-warm leading-relaxed text-center max-w-2xl mx-auto">
            <span className="text-western-green-deep font-medium">{prova.autor}</span>{" "}
            <span className="text-western-stone-warm">{prova.frase}</span>
          </p>
        </StepShell>
      </div>
    </div>
  );
}
