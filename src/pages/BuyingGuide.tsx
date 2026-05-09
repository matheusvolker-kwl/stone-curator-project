import { ArrowRight, Sparkles, Layers, RotateCcw, PlayCircle } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import StepOnde from "@/components/guide/StepOnde";
import GuideAssemblySummary from "@/components/guide/GuideAssemblySummary";
import StepArea from "@/components/guide/StepArea";
import StepProtagonismo from "@/components/guide/StepProtagonismo";
import StepComposicao from "@/components/guide/StepComposicao";
import StepBase from "@/components/guide/StepBase";
import StepComplementos from "@/components/guide/StepComplementos";
import StepUpgrade from "@/components/guide/StepUpgrade";
import StepCasa from "@/components/guide/StepCasa";
import StepFechamento from "@/components/guide/StepFechamento";
import GuideProgress from "@/components/guide/GuideProgress";
import GuideConsultor from "@/components/guide/GuideConsultor";
import GuideEspecial from "@/components/guide/GuideEspecial";
import {
  useGuideStore,
  getProgressSteps,
  nextAssemblyStep,
  prevAssemblyStep,
  type GuideStep,
  type AssemblySkips,
} from "@/stores/guideStore";
import {
  complementosPorTipo,
  m2ToTamanhoId,
  nivelMeta,
  resolveConjunto,
  resolveUpgrade,
  tipoLabels,
  type GuideAnswers,
} from "@/data/guideMap";

const ASSEMBLY_STEPS: GuideStep[] = ["base", "complementos", "upgrade", "casa", "fechamento"];

const ASSEMBLY_LABELS: Record<string, string> = {
  base: "Etapa 05 · Conjunto",
  complementos: "Etapa 06 · Complementos",
  upgrade: "Etapa 07 · Upgrade",
  casa: "Etapa 08 · Assinatura",
  fechamento: "Etapa 09 · Fechamento",
};

export default function BuyingGuide() {
  const state = useGuideStore();
  const { step, tipo, areaM2, nivel, composicao, jardim, savedAt, start, goto, reset } = state;
  const containerRef = useRef<HTMLDivElement>(null);
  const [acabamentoAtual, setAcabamentoAtual] = useState("Quartzo");

  const answers: GuideAnswers = useMemo(() => {
    const tamanho = tipo && areaM2 ? m2ToTamanhoId(tipo, areaM2) : undefined;
    return {
      tipo,
      tamanho: tamanho === "consultor" ? undefined : tamanho,
      composicao,
      jardim,
      nivel,
    };
  }, [tipo, areaM2, composicao, jardim, nivel]);

  const isAreaConsultor = tipo && areaM2 ? m2ToTamanhoId(tipo, areaM2) === "consultor" : false;
  const resolved = useMemo(() => resolveConjunto(answers), [answers]);
  const upgradeAvailable = useMemo(() => !!resolveUpgrade(answers), [answers]);

  // Skips de etapas de montagem
  const skips: AssemblySkips = useMemo(
    () => ({
      skipComplementos: !tipo || (complementosPorTipo[tipo]?.length ?? 0) === 0,
      skipUpgrade: !upgradeAvailable,
      skipCasa: false,
    }),
    [tipo, upgradeAvailable]
  );

  // Progress bar
  const progressSteps = useMemo(() => {
    if (!tipo || step === "intro" || step === "especial") return [];
    const items = getProgressSteps(tipo, skips);

    const valueByKey: Record<string, string | undefined> = {
      tipo: tipo ? tipoLabels[tipo] : undefined,
      area: areaM2 ? `${areaM2} m²` : undefined,
      protagonismo: nivel ? nivelMeta[tipo][nivel].label : undefined,
      composicao:
        tipo === "lago"
          ? composicao === "somenteWestern"
            ? "Só Western"
            : composicao === "comNaturais"
              ? "Western + naturais"
              : undefined
          : tipo === "jardim"
            ? jardim === "seco"
              ? "Seco"
              : jardim === "comFonte"
                ? "Com fonte"
                : undefined
            : undefined,
    };

    const order = items.map((i) => i.key);
    const currentIdx = order.indexOf(step as GuideStep);

    return items.map((item, idx) => {
      const value = valueByKey[item.key];
      const done = currentIdx > idx;
      const current = step === item.key;
      const canNavigate = done || (idx < currentIdx);
      return {
        key: item.key,
        label: item.label,
        value,
        done,
        current,
        onClick: canNavigate ? () => goto(item.key as GuideStep) : undefined,
      };
    });
  }, [step, tipo, areaM2, nivel, composicao, jardim, skips, goto]);

  // Scroll to top of wizard on step change
  useEffect(() => {
    if (containerRef.current && ASSEMBLY_STEPS.includes(step as GuideStep)) {
      containerRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [step]);

  const handleNext = () =>
    goto(nextAssemblyStep(step as GuideStep, skips));
  const handlePrevAssembly = (fallback: GuideStep) =>
    goto(prevAssemblyStep(step as GuideStep, skips, fallback));

  const baseFallback: GuideStep = tipo === "piscina" ? "protagonismo" : "composicao";

  // Atalhos de teclado: ←/→ para voltar/avançar nas etapas de montagem
  useEffect(() => {
    if (!ASSEMBLY_STEPS.includes(step as GuideStep)) return;
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "ArrowRight") {
        e.preventDefault();
        handleNext();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        handlePrevAssembly(baseFallback);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [step, skips, baseFallback]);


  const isAssembly = ASSEMBLY_STEPS.includes(step as GuideStep);
  const showResume =
    step === "intro" && !!savedAt && (!!tipo || !!areaM2 || !!nivel);
  const stepLabel = ASSEMBLY_LABELS[step] ?? "Seu projeto";

  return (
    <div className="surface-ivory min-h-screen">
      <div className={`container-western py-12 md:py-20 ${isAssembly ? "max-w-7xl pb-32 xl:pb-20" : "max-w-5xl"}`}>
        {step === "intro" ? (
          <Intro
            onStart={() => { if (showResume) reset(); start(); }}
            onResume={showResume ? () => {
              // Retomar: ir para a etapa mais avançada possível com as respostas
              const target: GuideStep = nivel ? "base" : tipo ? (areaM2 ? "protagonismo" : "area") : "tipo";
              goto(target);
            } : undefined}
            onReset={reset}
            hasProgress={showResume}
          />
        ) : step === "especial" ? (
          <div className="border border-western-stone-warm/20 bg-white p-6 md:p-12">
            <GuideEspecial />
          </div>
        ) : (
          <div className="space-y-8" ref={containerRef}>
            {progressSteps.length > 0 && <GuideProgress steps={progressSteps} />}
            <div className={isAssembly ? "grid xl:grid-cols-[1fr_320px] gap-8 items-start" : ""}>
              <div className="border border-western-stone-warm/20 bg-white p-6 md:p-12 min-w-0">
                {step === "tipo" && <StepOnde />}
                {step === "area" && <StepArea />}
                {step === "protagonismo" && <StepProtagonismo />}
                {step === "composicao" && <StepComposicao />}

                {step === "base" && (
                  <>
                    {isAreaConsultor && tipo && areaM2 ? (
                      <GuideConsultor tipo={tipo} tamanho={`${areaM2} m²`} onReset={reset} />
                    ) : resolved && resolved !== "consultor" ? (
                      <StepBase
                        conjunto={resolved}
                        answers={answers}
                        onBack={() => goto(baseFallback)}
                        onNext={handleNext}
                        onAcabamentoChange={setAcabamentoAtual}
                      />
                    ) : (
                      <NoResolution onReset={reset} />
                    )}
                  </>
                )}

                {step === "complementos" && tipo && (
                  <StepComplementos
                    tipo={tipo}
                    onBack={() => handlePrevAssembly(baseFallback)}
                    onNext={handleNext}
                  />
                )}

                {step === "upgrade" && resolved && resolved !== "consultor" && (
                  <StepUpgrade
                    answers={answers}
                    precoBase={resolved.preco}
                    onBack={() => handlePrevAssembly(baseFallback)}
                    onNext={handleNext}
                  />
                )}

                {step === "casa" && (
                  <StepCasa
                    onBack={() => handlePrevAssembly(baseFallback)}
                    onNext={handleNext}
                  />
                )}

                {step === "fechamento" && resolved && resolved !== "consultor" && (
                  <StepFechamento
                    conjunto={resolved}
                    answers={answers}
                    acabamento={acabamentoAtual}
                    onBack={() => handlePrevAssembly(baseFallback)}
                    onReset={reset}
                  />
                )}
              </div>

              {isAssembly && <GuideAssemblySummary stepLabel={stepLabel} />}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function NoResolution({ onReset }: { onReset: () => void }) {
  return (
    <div className="text-center py-12">
      <p className="text-western-stone-warm">
        Não foi possível resolver um conjunto com as respostas atuais.
      </p>
      <button onClick={onReset} className="btn-outline-forest mt-6">
        Refazer guia
      </button>
    </div>
  );
}

function Intro({
  onStart,
  onResume,
  onReset,
  hasProgress,
}: {
  onStart: () => void;
  onResume?: () => void;
  onReset: () => void;
  hasProgress?: boolean;
}) {
  return (
    <div className="grid md:grid-cols-[3fr_2fr] gap-12 lg:gap-20 items-center">
      <div>
        <p className="text-eyebrow mb-5">Guia de Composição Western</p>
        <div className="w-12 h-px bg-western-gold mb-8" />
        <h1 className="font-display text-4xl md:text-6xl text-western-green-deep leading-[1.05] mb-6">
          O conjunto certo,<br />em poucos passos.
        </h1>
        <p className="text-western-stone-warm text-lg leading-relaxed mb-4 max-w-2xl">
          Escolha o ambiente, dimensione a área e veja a composição autoral
          ideal — com peças, acabamento, investimento e prancha técnica para
          download.
        </p>
        <p className="text-sm text-western-stone-warm/80 leading-relaxed mb-10 max-w-2xl">
          Atendimento dedicado a parceiros B2B: arquitetos, paisagistas, construtoras
          e revendas.
        </p>
        <div className="flex flex-wrap gap-6 items-center mb-10 text-sm text-western-stone-warm">
          <span className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-western-gold" /> ~90 segundos</span>
          <span className="flex items-center gap-2"><Layers className="h-4 w-4 text-western-gold" /> 45 conjuntos curados</span>
        </div>

        {hasProgress && onResume ? (
          <div className="mb-8 p-5 border border-western-gold/40 bg-western-cream/40 max-w-2xl animate-in fade-in slide-in-from-bottom-2 duration-500">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-western-gold mb-2">
              Você tem um projeto em andamento
            </p>
            <p className="text-sm text-western-stone-warm leading-relaxed mb-4">
              Continue exatamente de onde parou — suas escolhas e o orçamento parcial estão salvos.
            </p>
            <div className="flex flex-wrap gap-3">
              <button onClick={onResume} className="btn-gold">
                <PlayCircle className="h-4 w-4" /> Continuar projeto
              </button>
              <button
                onClick={onReset}
                className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-western-stone-warm hover:text-western-green-deep transition-colors"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Recomeçar do zero
              </button>
            </div>
          </div>
        ) : null}

        <button onClick={onStart} className="btn-gold">
          {hasProgress ? "Iniciar novo projeto" : "Compor meu projeto"} <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      <div className="hidden md:block aspect-[4/5] bg-western-green-deep relative overflow-hidden">
        <svg viewBox="0 0 400 500" className="w-full h-full" aria-hidden="true">
          <rect width="400" height="500" fill="hsl(var(--western-green-deep))" />
          <g fill="hsl(var(--western-gold) / 0.18)">
            <ellipse cx="120" cy="380" rx="110" ry="48" />
            <ellipse cx="260" cy="350" rx="140" ry="62" />
            <ellipse cx="200" cy="280" rx="80" ry="34" />
            <ellipse cx="310" cy="240" rx="50" ry="22" />
          </g>
          <line x1="20" y1="430" x2="380" y2="430" stroke="hsl(var(--western-gold) / 0.4)" strokeWidth="1" />
          <text x="30" y="60" fontFamily="monospace" fontSize="10" letterSpacing="3" fill="hsl(var(--western-gold) / 0.6)">
            COMPOSIÇÃO 03
          </text>
        </svg>
      </div>
    </div>
  );
}
