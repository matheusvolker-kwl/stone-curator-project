import { describe, it, expect, beforeEach } from "vitest";
import {
  useGuideStore,
  getDiscoverySteps,
  getProgressSteps,
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

  it("lago: tipo → area → protagonismo → composicao → configurar", () => {
    const s = useGuideStore.getState();
    s.setTipo("lago");
    expect(useGuideStore.getState().step).toBe("area");
    useGuideStore.getState().setArea(20);
    expect(useGuideStore.getState().step).toBe("protagonismo");
    useGuideStore.getState().setNivel("essencial");
    expect(useGuideStore.getState().step).toBe("composicao");
    useGuideStore.getState().setComposicao("somenteWestern");
    expect(useGuideStore.getState().step).toBe("configurar");
  });

  it("piscina pula composicao e vai direto para configurar", () => {
    const s = useGuideStore.getState();
    s.setTipo("piscina");
    useGuideStore.getState().setArea(40);
    useGuideStore.getState().setNivel("essencial");
    expect(useGuideStore.getState().step).toBe("configurar");
  });

  it("setTipo especial vai para a etapa especial", () => {
    useGuideStore.getState().setTipo("especial" as never);
    expect(useGuideStore.getState().step).toBe("especial");
  });

  it("back() do configurar respeita o salto da piscina", () => {
    const s = useGuideStore.getState();
    s.setTipo("piscina");
    useGuideStore.getState().setArea(40);
    useGuideStore.getState().setNivel("essencial");
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

  it("getProgressSteps termina sempre com 'configurar'", () => {
    const lago = getProgressSteps("lago").map((s) => s.key);
    expect(lago[lago.length - 1]).toBe("configurar");
    const piscina = getProgressSteps("piscina").map((s) => s.key);
    expect(piscina).toEqual(["tipo", "area", "protagonismo", "configurar"]);
  });
});
