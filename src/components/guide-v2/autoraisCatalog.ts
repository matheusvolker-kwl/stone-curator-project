import type { TipoVisual, ProjetoExtra } from "./types";

// Item autoral baseado em produto REAL do Shopify.
export interface AutoralItem {
  id: string;          // = handle Shopify
  handle: string;
  nome: string;
  codigo: string;      // SKU ou abreviação
  pesoKg: number;
  preco: number;
  descricao: string;
  dim: string;
  imageUrl?: string;
}

// Handles dos produtos autorais reais por tipo de ambiente.
// Todos existem na loja Shopify Western (vendor: Western).
const FILTERS: Record<TipoVisual, string[]> = {
  piscina: [
    "pedra-led",
    "pedra-sonora",
    "fossil-coelphisys",
    "pedra-champanheira",
    "pedra-torneira",
    "pisada-pedra-grande",
    "pisada-pedra-media",
    "pisada-dormente",
  ],
  lago: [
    "fossil-coelphisys",
    "fossil-seymouria",
    "pedra-led",
    "pedra-sonora",
    "pedra-torneira",
    "pedra-champanheira",
    "pisada-pedra-grande",
    "pisada-pedra-media",
  ],
  "jardim-fonte": [
    "fossil-seymouria",
    "pedra-torneira",
    "pedra-led",
    "pedra-sonora",
    "pisada-pedra-pequena",
    "pisada-pedra-media",
    "pisada-eucalipto",
    "pisada-dormente",
  ],
  "jardim-seco": [
    "fossil-coelphisys",
    "fossil-seymouria",
    "pisada-eucalipto",
    "pisada-dormente",
    "pisada-pedra-pequena",
    "painel-bruto-amalfi",
  ],
};

export function getAutoralHandlesFor(tipoVisual: TipoVisual): string[] {
  return FILTERS[tipoVisual] ?? [];
}

export function autoralToExtra(item: AutoralItem): ProjetoExtra {
  return { id: item.id, nome: item.nome, codigo: item.codigo, preco: item.preco, qty: 1 };
}
