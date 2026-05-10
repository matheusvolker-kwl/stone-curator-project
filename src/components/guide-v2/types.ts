import type { Tipo, Nivel } from "@/data/guideMap";

// 4 tipos visuais → mapeamento para (tipo, variante) do guideMap
export type TipoVisual = "piscina" | "lago" | "jardim-fonte" | "jardim-seco";

export const tipoVisualMap: Record<
  TipoVisual,
  { tipo: Tipo; variante?: "somenteWestern" | "comNaturais" | "seco" | "comFonte"; label: string; copy: string }
> = {
  piscina: { tipo: "piscina", label: "Piscina", copy: "uma piscina" },
  lago: { tipo: "lago", variante: "somenteWestern", label: "Lago", copy: "um lago" },
  "jardim-fonte": { tipo: "jardim", variante: "comFonte", label: "Jardim com Fonte", copy: "um jardim com fonte" },
  "jardim-seco": { tipo: "jardim", variante: "seco", label: "Jardim Seco", copy: "um jardim seco" },
};

export type Acabamento = "quartzo" | "arenito" | "moledo" | "granito";

export const acabamentoMeta: Record<Acabamento, { label: string; chip: string; tag?: string }> = {
  quartzo: { label: "Quartzo", chip: "#E8DFC8" },
  arenito: { label: "Arenito", chip: "#C9A57B" },
  moledo: { label: "Moledo", chip: "#8B5E3C", tag: "+ VENDIDO" },
  granito: { label: "Granito", chip: "#5A5D5C" },
};

export type ProjetoExtra = {
  id: string;
  nome: string;
  codigo: string;
  preco: number;
  qty: number;
  imageUrl?: string;
  productHandle?: string;
  variantId?: string;
  variantTitle?: string;
};
export type ProjetoPeca = {
  id: string;
  nome: string;
  codigo: string;
  pesoKg: number;
  dim: string;
  preco: number;
  qty: number;
  imageUrl?: string;
  productHandle?: string;
  variantId?: string;
  variantTitle?: string;
};

export const nivelLabelMap: Record<Nivel, string> = {
  essencial: "Essencial",
  equilibrada: "Equilibrado",
  completa: "Completo",
};

export const nivelMicrocopy: Record<Nivel, string> = {
  essencial: "Composição mínima, elegante e funcional.",
  equilibrada: "Harmonia entre presença e contenção.",
  completa: "Projeto autoral com elementos diversos.",
};
