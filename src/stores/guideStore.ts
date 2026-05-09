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
  | "resultado"
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

const stepOrder: GuideStep[] = ["intro", "tipo", "area", "protagonismo", "composicao", "resultado"];

function nextAfterProtagonismo(tipo?: Tipo): GuideStep {
  // Piscina pula composicao
  return tipo === "piscina" ? "resultado" : "composicao";
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

      setComposicao: (c) => set({ composicao: c, step: "resultado", savedAt: Date.now() }),

      setJardim: (j) => set({ jardim: j, step: "resultado", savedAt: Date.now() }),

      goto: (s) => set({ step: s, savedAt: Date.now() }),

      back: () => {
        const { step, tipo } = get();
        const map: Record<GuideStep, GuideStep> = {
          intro: "intro",
          tipo: "intro",
          area: "tipo",
          protagonismo: "area",
          composicao: "protagonismo",
          resultado: tipo === "piscina" ? "protagonismo" : "composicao",
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
      name: "western-guide-v2",
      storage: createJSONStorage(() => localStorage),
      // Custom rehydration: descarta estado expirado (>72h)
      onRehydrateStorage: () => (state) => {
        if (!state?.savedAt) return;
        if (Date.now() - state.savedAt > TTL_MS) {
          state.reset();
        }
      },
    }
  )
);

// Util: lista as etapas visíveis (depende do tipo) para o GuideProgress
export function getProgressSteps(tipo?: Tipo) {
  const base = [
    { key: "tipo" as const, label: "Onde" },
    { key: "area" as const, label: "Tamanho" },
    { key: "protagonismo" as const, label: "Protagonismo" },
  ];
  if (tipo && tipo !== "piscina") {
    base.push({ key: "composicao" as const, label: "Composição" });
  }
  return base;
}
