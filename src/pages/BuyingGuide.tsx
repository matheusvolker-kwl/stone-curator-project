import { ArrowRight, Sparkles, Layers, RotateCcw, PlayCircle } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import StepOnde from "@/components/guide/StepOnde";
import GuideAssemblySummary from "@/components/guide/GuideAssemblySummary";
import StepArea from "@/components/guide/StepArea";
import StepProtagonismo from "@/components/guide/StepProtagonismo";
import StepComposicao from "@/components/guide/StepComposicao";
import GuideConfigurator from "@/components/guide/GuideConfigurator";
import GuideProgress from "@/components/guide/GuideProgress";
import GuideConsultor from "@/components/guide/GuideConsultor";
import GuideEspecial from "@/components/guide/GuideEspecial";
import {
  useGuideStore,
  getProgressSteps,
  type GuideStep,
} from "@/stores/guideStore";
import {
  m2ToTamanhoId,
  nivelMeta,
  resolveConjunto,
  tipoLabels,
  type GuideAnswers,
} from "@/data/guideMap";

const VALID_STEPS: GuideStep[] = [
  "intro", "tipo", "area", "protagonismo", "composicao",
  "configurar", "especial",
];

const DISCOVERY_STEPS: GuideStep[] = ["tipo", "area", "protagonismo", "composicao"];

function isValidStep(s: string | null): s is GuideStep {
  return !!s && (VALID_STEPS as string[]).includes(s);
}

export default function BuyingGuide() {
  const state = useGuideStore();
  const { step, tipo, areaM2, nivel, composicao, jardim, savedAt, start, goto, reset } = state;
  const containerRef = useRef<HTMLDivElement>(null);
  const [acabamentoAtual, setAcabamentoAtual] = useState("Quartzo");
  const [searchParams, setSearchParams] = useSearchParams();
  const initialMount = useRef(true);

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

  // === URL <-> step sync ===
  useEffect(() => {
    const urlStep = searchParams.get("step");
    if (!isValidStep(urlStep)) {
      if (urlStep) {
        const next = new URLSearchParams(searchParams);
        next.delete("step");
        setSearchParams(next, { replace: true });
      }
      initialMount.current = false;
      return;
    }
    if (urlStep !== step) {
      const requiresTipo: GuideStep[] = ["area", "protagonismo", "composicao", "configurar"];
      const requiresArea: GuideStep[] = ["protagonismo", "composicao", "configurar"];
      const requiresNivel: GuideStep[] = ["configurar"];
      if (requiresTipo.includes(urlStep) && !tipo) {
        goto("tipo");
        return;
      }
      if (requiresArea.includes(urlStep) && !areaM2) {
        goto("area");
        return;
      }
      if (requiresNivel.includes(urlStep) && !nivel) {
        goto("protagonismo");
        return;
      }
      goto(urlStep);
    }
    initialMount.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    const desired = step === "intro" ? "" : step;
    const current = searchParams.get("step") ?? "";
    if (desired === current) return;
    const next = new URLSearchParams(searchParams);
    if (desired) next.set("step", desired);
    else next.delete("step");
    setSearchParams(next, { replace: initialMount.current });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  // Progress bar (descoberta + configurar)
  const progressSteps = useMemo(() => {
    if (!tipo || step === "intro" || step === "especial") return [];
    const items = getProgressSteps(tipo);

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
  }, [step, tipo, areaM2, nivel, composicao, jardim, goto]);

  // Scroll to top of wizard on step change
  useEffect(() => {
    if (containerRef.current && step === "configurar") {
      containerRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [step]);

  // Atalhos de teclado: ← volta nas etapas de descoberta
  useEffect(() => {
    const isDiscovery = DISCOVERY_STEPS.includes(step as GuideStep);
    if (!isDiscovery) return;
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "SELECT" || target.isContentEditable)) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        state.back();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const isConfigurar = step === "configurar";
  const showResume =
    step === "intro" && !!savedAt && (!!tipo || !!areaM2 || !!nivel);
  const stepLabel = isConfigurar ? "Configurador · seu projeto" : "Seu projeto";

  return (
    <div className="surface-ivory min-h-screen">
      <div className={`container-western py-12 md:py-20 pb-44 xl:pb-20 ${isConfigurar ? "max-w-7xl" : "max-w-5xl"}`}>
        {step === "intro" ? (
          <Intro
            onStart={() => { if (showResume) reset(); start(); }}
            onResume={showResume ? () => {
              const target: GuideStep = nivel ? "configurar" : tipo ? (areaM2 ? "protagonismo" : "area") : "tipo";
              goto(target);
            } : undefined}
            onReset={reset}
            hasProgress={showResume}
            answers={{ tipo, areaM2, nivel, composicao, jardim }}
            goto={goto}
          />
        ) : step === "especial" ? (
          <div className="border border-western-stone-warm/20 bg-white p-6 md:p-12">
            <GuideEspecial />
          </div>
        ) : (
          <div className="space-y-8" ref={containerRef}>
            {progressSteps.length > 0 && <GuideProgress steps={progressSteps} />}
            <div className={isConfigurar ? "grid xl:grid-cols-[1fr_320px] gap-8 items-start" : ""}>
              <div className="border border-western-stone-warm/20 bg-white p-6 md:p-12 min-w-0">
                {step === "tipo" && <StepOnde />}
                {step === "area" && <StepArea />}
                {step === "protagonismo" && <StepProtagonismo />}
                {step === "composicao" && <StepComposicao />}

                {step === "configurar" && (
                  <>
                    {isAreaConsultor && tipo && areaM2 ? (
                      <GuideConsultor tipo={tipo} tamanho={`${areaM2} m²`} onReset={reset} />
                    ) : resolved && resolved !== "consultor" ? (
                      <GuideConfigurator
                        conjunto={resolved}
                        answers={answers}
                        acabamento={acabamentoAtual}
                        onAcabamentoChange={setAcabamentoAtual}
                      />
                    ) : (
                      <NoResolution onReset={reset} />
                    )}
                  </>
                )}
              </div>

              {isConfigurar && <GuideAssemblySummary stepLabel={stepLabel} />}
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

interface IntroAnswers {
  tipo?: string;
  areaM2?: number;
  nivel?: string;
  composicao?: string;
  jardim?: string;
}

function Intro({
  onStart,
  onResume,
  onReset,
  hasProgress,
  answers,
  goto,
}: {
  onStart: () => void;
  onResume?: () => void;
  onReset: () => void;
  hasProgress?: boolean;
  answers: IntroAnswers;
  goto: (s: GuideStep) => void;
}) {
  const chips: Array<{ label: string; step: GuideStep }> = [];
  if (answers.tipo) chips.push({ label: tipoLabels[answers.tipo as keyof typeof tipoLabels] ?? answers.tipo, step: "tipo" });
  if (answers.areaM2) chips.push({ label: `${answers.areaM2} m²`, step: "area" });
  if (answers.nivel && answers.tipo) {
    const meta = nivelMeta[answers.tipo as keyof typeof nivelMeta]?.[answers.nivel as "essencial" | "equilibrada" | "completa"];
    if (meta) chips.push({ label: meta.label, step: "protagonismo" });
  }
  if (answers.composicao) chips.push({ label: answers.composicao === "somenteWestern" ? "Só Western" : "Western + naturais", step: "composicao" });
  if (answers.jardim) chips.push({ label: answers.jardim === "seco" ? "Jardim seco" : "Com fonte", step: "composicao" });

  return (
    <div className="grid md:grid-cols-[3fr_2fr] gap-12 lg:gap-20 items-center">
      <div>
        <p className="text-eyebrow mb-5">Guia de Composição Western</p>
        <div className="w-12 h-px bg-western-gold mb-8" />
        <h1 className="font-display text-4xl md:text-6xl text-western-green-deep leading-[1.05] mb-6">
          O conjunto certo,<br />em poucos passos.
        </h1>
        <p className="text-western-stone-warm text-lg leading-relaxed mb-4 max-w-2xl">
          Escolha o ambiente, dimensione a área e configure tudo numa tela só —
          conjunto, complementos e itens autorais com prancha técnica para download.
        </p>
        <p className="text-sm text-western-stone-warm/80 leading-relaxed mb-10 max-w-2xl">
          Atendimento dedicado a parceiros B2B: arquitetos, paisagistas, construtoras
          e revendas.
        </p>
        <div className="flex flex-wrap gap-6 items-center mb-10 text-sm text-western-stone-warm">
          <span className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-western-gold" /> ~60 segundos</span>
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
            {chips.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {chips.map((c, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => goto(c.step)}
                    className="font-mono text-[10px] uppercase tracking-[0.18em] px-2.5 py-1 border border-western-stone-warm/25 text-western-stone-warm hover:text-western-green-deep hover:border-western-gold transition-colors"
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            )}
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
        </svg>
      </div>
    </div>
  );
}
