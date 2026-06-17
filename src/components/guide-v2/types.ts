import type { Tipo, Nivel } from "@/data/guideMap";

// Alias: a categoria visual no guia É o tipo do guideMap (achatado em 5 categorias).
export type TipoVisual = Tipo;

export const tipoVisualMap: Record<
  TipoVisual,
  { tipo: Tipo; label: string; copy: string; descricao: string }
> = {
  piscina:        { tipo: "piscina",        label: "Piscina",          copy: "uma piscina",                  descricao: "Praias e baías brasileiras" },
  lago:           { tipo: "lago",           label: "Lago",             copy: "um lago",                      descricao: "Lagoas brasileiras · 100% Western" },
  "lago-hibrido": { tipo: "lago-hibrido",   label: "Lago Híbrido",     copy: "um lago híbrido",              descricao: "Estrutura Western + pedra natural do parceiro" },
  "jardim-seco":  { tipo: "jardim-seco",    label: "Jardim Seco",      copy: "um jardim seco",               descricao: "Serras, chapadas e cerrado" },
  "jardim-fonte": { tipo: "jardim-fonte",   label: "Jardim com Fonte", copy: "um jardim com fonte",          descricao: "Cachoeiras e nascentes brasileiras" },
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
