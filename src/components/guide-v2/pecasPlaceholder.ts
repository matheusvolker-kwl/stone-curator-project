import type { Nivel } from "@/data/guideMap";
import type { ProjetoPeca } from "./types";

// Gera lista sintética e estável de peças por nível.
// Placeholder até integração com Shopify trazer composição real do conjunto.
const POOL = [
  { codigo: "CSB", nome: "Cascata Santa Bárbara", peso: 215, dim: "140 × 95 × 80 cm", preco: 2840 },
  { codigo: "PG5", nome: "Pedra Grande 5", peso: 95, dim: "70 × 55 × 50 cm", preco: 1280 },
  { codigo: "PM2", nome: "Pedra Média 2", peso: 32, dim: "45 × 35 × 30 cm", preco: 420 },
  { codigo: "PM4", nome: "Pedra Média 4", peso: 38, dim: "50 × 38 × 32 cm", preco: 460 },
  { codigo: "PP3", nome: "Pedra Pequena 3", peso: 12, dim: "28 × 22 × 18 cm", preco: 180 },
  { codigo: "PP1", nome: "Pedra Pequena 1", peso: 9, dim: "22 × 18 × 14 cm", preco: 160 },
  { codigo: "PB", nome: "Pedra de Borda", peso: 28, dim: "60 × 25 × 8 cm", preco: 380 },
  { codigo: "CMD", nome: "Cascata Média", peso: 145, dim: "100 × 70 × 55 cm", preco: 1840 },
  { codigo: "PG3", nome: "Pedra Grande 3", peso: 78, dim: "65 × 48 × 42 cm", preco: 1080 },
  { codigo: "PSC", nome: "Pedra Suporte Cascata", peso: 55, dim: "55 × 40 × 35 cm", preco: 720 },
  { codigo: "PXP", nome: "Pedra Extra-Pequena", peso: 5, dim: "16 × 12 × 10 cm", preco: 110 },
  { codigo: "PMG", nome: "Pedra Média Grande", peso: 48, dim: "55 × 42 × 36 cm", preco: 580 },
];

const COMPOSICOES: Record<Nivel, Array<[number, number]>> = {
  // [poolIndex, qty]
  essencial: [[0, 1], [1, 1], [2, 4], [4, 5]],
  equilibrada: [[0, 1], [1, 1], [3, 2], [2, 4], [4, 4], [6, 2]],
  completa: [[0, 1], [7, 1], [1, 2], [8, 2], [3, 3], [9, 2], [4, 6], [5, 4], [10, 4], [11, 2]],
};

export function getPecasPlaceholder(nivel: Nivel): ProjetoPeca[] {
  return COMPOSICOES[nivel].map(([idx, qty], i) => {
    const p = POOL[idx];
    return {
      id: `${p.codigo}-${i}`,
      nome: p.nome,
      codigo: p.codigo,
      pesoKg: p.peso,
      dim: p.dim,
      preco: p.preco,
      qty,
    };
  });
}

export function getPecaCount(nivel: Nivel): number {
  return COMPOSICOES[nivel].reduce((acc, [, q]) => acc + q, 0);
}
