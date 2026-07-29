// Taxonomia de USOS (cenas) das peças — fonte única, compartilhada com a busca.
//
// Ideia (insight do dono): a PDP mostra PRODUTO → todas as cenas onde a peça
// serve, do mesmo jeito que a busca traduz CENA → produto. Educa o cliente de
// que a mesma pedra vai na piscina, no lago, na parede ou dentro d'água.
//
// Regra de qualidade: honestidade. Só marco a cena onde a peça de fato serve, e
// `agua` (uso submerso) só onde a peça é ecológica/atóxica. Nada de vantagem
// inventada — a mesma disciplina que aplicamos ao tirar a "NF-e como vantagem".

import type { LucideIcon } from "lucide-react";
import { Waves, Droplets, Trees } from "lucide-react";

/** Cenas com projeto real no Inspire-se. Hoje o Inspire-se tem 3 tipos. */
export type ProjetoTipo = "piscina" | "jardim" | "lago";

export const PROJETO_SCENES: Record<ProjetoTipo, { label: string; icon: LucideIcon }> = {
  piscina: { label: "Piscinas", icon: Waves },
  lago: { label: "Lagos", icon: Droplets },
  jardim: { label: "Jardins", icon: Trees },
};

/** Ordem canônica de exibição dos chips de projeto. */
export const PROJETO_ORDER: ProjetoTipo[] = ["piscina", "lago", "jardim"];

export interface UsageProfile {
  /** Cenas com projeto real no Inspire-se — viram chips "ver projetos". */
  projetos: ProjetoTipo[];
  /** Outras cenas onde a peça também cabe — texto educativo, sem link. */
  tambem: string[];
  /** Peça é ecológica/atóxica e pode ir DENTRO d'água (lago/piscina submerso). */
  agua: boolean;
}

/**
 * Perfil de uso por categoria (handle da coleção Woo). Curado à mão.
 * `amostras` fica de fora de propósito: a Western Box é kit de samples, não tem
 * "onde usar" — o módulo simplesmente não renderiza.
 */
const BY_COLLECTION: Record<string, UsageProfile> = {
  cascatas: {
    projetos: ["piscina", "lago", "jardim"],
    tambem: ["muros e fachadas", "composições"],
    agua: true,
  },
  "pedras-grandes": {
    projetos: ["jardim", "lago", "piscina"],
    tambem: ["ambientes internos", "coberturas e terraços", "composições"],
    agua: true,
  },
  "pedras-medias": {
    projetos: ["jardim", "lago", "piscina"],
    tambem: ["ambientes internos", "coberturas e terraços", "composições"],
    agua: true,
  },
  "pedras-pequenas": {
    projetos: ["jardim", "lago", "piscina"],
    tambem: ["preenchimento e arremate", "coberturas e terraços", "composições"],
    agua: true,
  },
  "pedras-de-borda": {
    projetos: ["piscina", "lago"],
    tambem: ["piscina de praia", "canteiros e jardins"],
    agua: true,
  },
  pisadas: {
    projetos: ["jardim", "lago"],
    tambem: ["travessias e decks", "beiras de piscina"],
    agua: true,
  },
  "fontes-para-jardim": {
    projetos: ["jardim"],
    tambem: ["ambientes internos", "espelhos d'água", "varandas"],
    agua: true,
  },
  fontes: {
    projetos: ["jardim"],
    tambem: ["ambientes internos", "espelhos d'água", "varandas"],
    agua: true,
  },
  acessorios: {
    projetos: ["piscina", "lago"],
    tambem: ["jardins", "composições"],
    agua: true,
  },
  revestimentos: {
    projetos: [],
    tambem: ["fachadas e muros", "ambientes internos", "área da piscina", "coberturas"],
    agua: false,
  },
  "fosseis-decorativos": {
    projetos: [],
    tambem: ["ambientes internos", "fachadas de destaque", "halls e recepções"],
    agua: false,
  },
  fosseis: {
    projetos: [],
    tambem: ["ambientes internos", "fachadas de destaque", "halls e recepções"],
    agua: false,
  },
};

export function usageForCollection(handle?: string | null): UsageProfile | null {
  if (!handle) return null;
  return BY_COLLECTION[handle] ?? null;
}

/** Frase-reframe: a peça serve em várias cenas (leveza + água quando cabe). */
export function usageReframe(agua: boolean): string {
  const base = "A mesma peça rende em várias cenas — muda o acabamento, não a pedra.";
  const tail = agua
    ? " Ecológica e atóxica, entra na água; e tão leve (cerca de 10% do peso da pedra natural) que sobe até na cobertura sem guindaste."
    : " Tão leve (cerca de 10% do peso da pedra natural) que sobe até na cobertura sem guindaste.";
  return base + tail;
}
