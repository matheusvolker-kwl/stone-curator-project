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
  | "configurar"
  | "especial";

export interface GuideState {
  step: GuideStep;
  tipo?: Tipo;
  areaM2?: number;
  nivel?: Nivel;
  composicao?: Composicao;
  jardim?: Jardim;
  nome?: string;
  savedAt?: number;

  start: () => void;
  setTipo: (t: Tipo | "especial") => void;
  setArea: (m2: number) => void;
  setNivel: (n: Nivel) => void;
  setComposicao: (c: Composicao) => void;
  setJardim: (j: Jardim) => void;
  setNome: (n: string) => void;
  goto: (s: GuideStep) => void;
  back: () => void;
  reset: () => void;
}

function nextAfterProtagonismo(tipo?: Tipo): GuideStep {
  // Piscina pula composicao e vai direto pro configurador
  return tipo === "piscina" ? "configurar" : "composicao";
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

      setComposicao: (c) => set({ composicao: c, step: "configurar", savedAt: Date.now() }),

      setJardim: (j) => set({ jardim: j, step: "configurar", savedAt: Date.now() }),

      setNome: (n) => set({ nome: n.trim() || undefined, savedAt: Date.now() }),

      goto: (s) => set({ step: s, savedAt: Date.now() }),

      back: () => {
        const { step, tipo } = get();
        const map: Record<GuideStep, GuideStep> = {
          intro: "intro",
          tipo: "intro",
          area: "tipo",
          protagonismo: "area",
          composicao: "protagonismo",
          configurar: tipo === "piscina" ? "protagonismo" : "composicao",
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
          nome: undefined,
          savedAt: undefined,
        }),
    }),
    {
      name: "western-guide-v4",
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

// Lista completa para o GuideProgress: descoberta + configurar
export function getProgressSteps(
  tipo?: Tipo
): Array<{ key: GuideStep; label: string }> {
  return [...getDiscoverySteps(tipo), { key: "configurar", label: "Configurar" }];
}
