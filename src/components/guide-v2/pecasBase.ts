import type { Nivel } from "@/data/guideMap";

// Mapeamento nivel → handles REAIS de produtos Shopify (Pedra Grande/Média/Pequena, Borda).
// Cada entrada é [handle, qty]. Os dados de cada peça (nome, preço, foto, peso, dim)
// vêm do Shopify Storefront em runtime via useGuideProducts.
export const PECAS_BASE: Record<Nivel, Array<[handle: string, qty: number]>> = {
  essencial: [
    ["pedra-grande-5", 1],
    ["pedra-grande-3", 1],
    ["pedra-media-2", 4],
    ["pedra-pequena-3", 5],
  ],
  equilibrada: [
    ["pedra-grande-5", 1],
    ["pedra-grande-3", 1],
    ["pedra-media-4", 2],
    ["pedra-media-2", 4],
    ["pedra-pequena-3", 4],
    ["pedra-de-borda-1", 2],
  ],
  completa: [
    ["pedra-grande-5", 1],
    ["pedra-grande-7", 1],
    ["pedra-grande-3", 2],
    ["pedra-media-6", 2],
    ["pedra-media-4", 3],
    ["pedra-media-2", 4],
    ["pedra-pequena-3", 6],
    ["pedra-pequena-1", 4],
    ["pedra-de-borda-2", 4],
    ["pedra-de-borda-1", 2],
  ],
};

export function getPecasHandles(nivel: Nivel): string[] {
  return PECAS_BASE[nivel].map(([h]) => h);
}
