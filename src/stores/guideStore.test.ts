import { describe, it, expect, beforeEach } from "vitest";
import {
  useGuideStore,
  getDiscoverySteps,
  getAssemblySteps,
  nextAssemblyStep,
  prevAssemblyStep,
} from "./guideStore";

beforeEach(() => {
  localStorage.clear();
  useGuideStore.getState().reset();
});

describe("guideStore — state machine", () => {
  it("starts at intro and advances to tipo", () => {
    expect(useGuideStore.getState().step).toBe("intro");
    useGuideStore.getState().start();
    expect(useGuideStore.getState().step).toBe("tipo");
  });

  it("setTipo lago → area, setArea → protagonismo, setNivel → composicao (lago)", () => {
    const s = useGuideStore.getState();
    s.setTipo("lago");
    expect(useGuideStore.getState().step).toBe("area");
    useGuideStore.getState().setArea(20);
    expect(useGuideStore.getState().step).toBe("protagonismo");
    useGuideStore.getState().setNivel("essencial");
    expect(useGuideStore.getState().step).toBe("composicao");
  });

  it("piscina pula composicao e vai direto para base", () => {
    const s = useGuideStore.getState();
    s.setTipo("piscina");
    useGuideStore.getState().setArea(40);
    useGuideStore.getState().setNivel("essencial");
    expect(useGuideStore.getState().step).toBe("base");
  });

  it("setTipo especial vai para a etapa especial", () => {
    useGuideStore.getState().setTipo("especial" as any);
    expect(useGuideStore.getState().step).toBe("especial");
  });

  it("back() respeita o salto da piscina", () => {
    const s = useGuideStore.getState();
    s.setTipo("piscina");
    useGuideStore.getState().setArea(40);
    useGuideStore.getState().setNivel("essencial");
    // step = base
    useGuideStore.getState().back();
    expect(useGuideStore.getState().step).toBe("protagonismo");
  });

  it("reset zera todos os campos", () => {
    const s = useGuideStore.getState();
    s.setTipo("lago");
    useGuideStore.getState().setArea(10);
    useGuideStore.getState().setNome("Ana");
    useGuideStore.getState().reset();
    const after = useGuideStore.getState();
    expect(after.step).toBe("intro");
    expect(after.tipo).toBeUndefined();
    expect(after.areaM2).toBeUndefined();
    expect(after.nome).toBeUndefined();
  });
});

describe("guideStore — derivações de etapas", () => {
  it("getDiscoverySteps inclui composicao para lago/jardim e exclui para piscina", () => {
    expect(getDiscoverySteps("lago").map((s) => s.key)).toContain("composicao");
    expect(getDiscoverySteps("jardim").map((s) => s.key)).toContain("composicao");
    expect(getDiscoverySteps("piscina").map((s) => s.key)).not.toContain("composicao");
  });

  it("getAssemblySteps respeita os skips", () => {
    const full = getAssemblySteps();
    expect(full.map((s) => s.key)).toEqual(["base", "complementos", "upgrade", "casa", "fechamento"]);
    const skipped = getAssemblySteps({ skipComplementos: true, skipCasa: true });
    expect(skipped.map((s) => s.key)).toEqual(["base", "upgrade", "fechamento"]);
  });

  it("nextAssemblyStep e prevAssemblyStep navegam respeitando skips", () => {
    const skips = { skipComplementos: true } as const;
    expect(nextAssemblyStep("base", skips)).toBe("upgrade");
    expect(prevAssemblyStep("upgrade", skips, "composicao")).toBe("base");
    expect(prevAssemblyStep("base", skips, "composicao")).toBe("composicao");
  });
});
