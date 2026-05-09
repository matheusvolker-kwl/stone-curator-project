import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Composicao, Jardim, Nivel, Tipo } from "@/data/guideMap";

const TTL_MS = 72 * 60 * 60 * 1000; // 72h

export type GuideStep =
  | "intro"
  | "tipo"
  | "area"
  | "protagonismo"
  | "composicao"
  | "base"
  | "complementos"
  | "upgrade"
  | "casa"
  | "fechamento"
  | "especial";

export interface GuideState {
  step: GuideStep;
  tipo?: Tipo;
  areaM2?: number;
  nivel?: Nivel;
  composicao?: Composicao;
  jardim?: Jardim;
  savedAt?: number;

  start: () => void;
  setTipo: (t: Tipo | "especial") => void;
  setArea: (m2: number) => void;
  setNivel: (n: Nivel) => void;
  setComposicao: (c: Composicao) => void;
  setJardim: (j: Jardim) => void;
  goto: (s: GuideStep) => void;
  back: () => void;
  reset: () => void;
}

function nextAfterProtagonismo(tipo?: Tipo): GuideStep {
  // Piscina pula composicao; jardim e lago seguem para composição
  return tipo === "piscina" ? "base" : "composicao";
}

export const useGuideStore = create<GuideState>()(
  persist(
    (set, get) => ({
      step: "intro",

      start: () => set({ step: "tipo", savedAt: Date.now() }),

      setTipo: (t) => {
        if (t === "especial") {
          set({ step: "especial", savedAt: Date.now() });
          return;
        }
        set({ tipo: t, step: "area", savedAt: Date.now() });
      },

      setArea: (m2) => set({ areaM2: m2, step: "protagonismo", savedAt: Date.now() }),

      setNivel: (n) => {
        const tipo = get().tipo;
        set({ nivel: n, step: nextAfterProtagonismo(tipo), savedAt: Date.now() });
      },

      setComposicao: (c) => set({ composicao: c, step: "base", savedAt: Date.now() }),

      setJardim: (j) => set({ jardim: j, step: "base", savedAt: Date.now() }),

      goto: (s) => set({ step: s, savedAt: Date.now() }),

      back: () => {
        const { step, tipo } = get();
        const map: Record<GuideStep, GuideStep> = {
          intro: "intro",
          tipo: "intro",
          area: "tipo",
          protagonismo: "area",
          composicao: "protagonismo",
          base: tipo === "piscina" ? "protagonismo" : "composicao",
          complementos: "base",
          upgrade: "complementos",
          casa: "upgrade",
          fechamento: "casa",
          especial: "tipo",
        };
        set({ step: map[step] });
      },

      reset: () =>
        set({
          step: "intro",
          tipo: undefined,
          areaM2: undefined,
          nivel: undefined,
          composicao: undefined,
          jardim: undefined,
          savedAt: undefined,
        }),
    }),
    {
      name: "western-guide-v3",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (!state?.savedAt) return;
        if (Date.now() - state.savedAt > TTL_MS) {
          state.reset();
        }
      },
    }
  )
);

// Etapas de descoberta (Onde → Composição)
export function getDiscoverySteps(tipo?: Tipo): Array<{ key: GuideStep; label: string }> {
  const base: Array<{ key: GuideStep; label: string }> = [
    { key: "tipo", label: "Onde" },
    { key: "area", label: "Tamanho" },
    { key: "protagonismo", label: "Protagonismo" },
  ];
  if (tipo && tipo !== "piscina") {
    base.push({ key: "composicao", label: "Composição" });
  }
  return base;
}

// Etapas de montagem do orçamento (Conjunto → Fechamento)
export interface AssemblySkips {
  skipComplementos?: boolean;
  skipUpgrade?: boolean;
  skipCasa?: boolean;
}
export function getAssemblySteps(
  skips: AssemblySkips = {}
): Array<{ key: GuideStep; label: string }> {
  const out: Array<{ key: GuideStep; label: string }> = [
    { key: "base", label: "Conjunto" },
  ];
  if (!skips.skipComplementos) out.push({ key: "complementos", label: "Complementos" });
  if (!skips.skipUpgrade) out.push({ key: "upgrade", label: "Upgrade" });
  if (!skips.skipCasa) out.push({ key: "casa", label: "Assinatura" });
  out.push({ key: "fechamento", label: "Fechamento" });
  return out;
}

// Lista completa para o GuideProgress
export function getProgressSteps(
  tipo?: Tipo,
  skips?: AssemblySkips
): Array<{ key: GuideStep; label: string }> {
  return [...getDiscoverySteps(tipo), ...getAssemblySteps(skips)];
}

// Helpers de navegação que respeitam skips
export function nextAssemblyStep(current: GuideStep, skips: AssemblySkips): GuideStep {
  const order = getAssemblySteps(skips).map((s) => s.key);
  const idx = order.indexOf(current);
  if (idx < 0 || idx === order.length - 1) return current;
  return order[idx + 1];
}
export function prevAssemblyStep(
  current: GuideStep,
  skips: AssemblySkips,
  fallback: GuideStep
): GuideStep {
  const order = getAssemblySteps(skips).map((s) => s.key);
  const idx = order.indexOf(current);
  if (idx <= 0) return fallback;
  return order[idx - 1];
}
