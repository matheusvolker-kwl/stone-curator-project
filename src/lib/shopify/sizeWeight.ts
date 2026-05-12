// Extrai tamanho (maior dimensão em cm) e peso (kg) da ficha técnica
// presente no descriptionHtml dos produtos Shopify, e classifica em buckets.
// TODO: calibrar limites quando tivermos a distribuição real do catálogo.

import { parseProductDescription } from "./parseDescription";
import type { ShopifyProductNode } from "./types";

export type TamanhoBucket = "pequeno" | "medio" | "grande" | "enorme";
export type PesoBucket = "leve" | "medio" | "pesado" | "muito-pesado";

export interface SizeWeight {
  maiorDimensaoCm: number | null;
  pesoKg: number | null;
  tamanho: TamanhoBucket | null;
  peso: PesoBucket | null;
}

const TAMANHO_LIMITES: Array<[TamanhoBucket, number]> = [
  ["pequeno", 30],
  ["medio", 60],
  ["grande", 100],
];

const PESO_LIMITES: Array<[PesoBucket, number]> = [
  ["leve", 10],
  ["medio", 40],
  ["pesado", 100],
];

export const TAMANHO_META: Record<TamanhoBucket, { label: string; hint: string }> = {
  pequeno: { label: "Pequeno", hint: "até 30 cm" },
  medio: { label: "Médio", hint: "31–60 cm" },
  grande: { label: "Grande", hint: "61–100 cm" },
  enorme: { label: "Enorme", hint: "100 cm+" },
};

export const PESO_META: Record<PesoBucket, { label: string; hint: string }> = {
  leve: { label: "Leve", hint: "até 10 kg" },
  medio: { label: "Médio", hint: "11–40 kg" },
  pesado: { label: "Pesado", hint: "41–100 kg" },
  "muito-pesado": { label: "Muito pesado", hint: "100 kg+" },
};

function parseNumberBR(raw?: string): number | null {
  if (!raw) return null;
  // pega o primeiro número (aceita "12,5", "1.250", "12.5 kg", "Ø 30")
  const m = raw.replace(/\./g, "").match(/(-?\d+(?:,\d+)?)/);
  if (!m) return null;
  const n = parseFloat(m[1].replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

function tamanhoBucketOf(cm: number | null): TamanhoBucket | null {
  if (cm == null) return null;
  for (const [bucket, max] of TAMANHO_LIMITES) {
    if (cm <= max) return bucket;
  }
  return "enorme";
}

function pesoBucketOf(kg: number | null): PesoBucket | null {
  if (kg == null) return null;
  for (const [bucket, max] of PESO_LIMITES) {
    if (kg <= max) return bucket;
  }
  return "muito-pesado";
}

export function extractSizeWeight(product: ShopifyProductNode): SizeWeight {
  const ficha = parseProductDescription(product.descriptionHtml).ficha;
  const findValue = (re: RegExp) =>
    ficha.find((f) => re.test(f.label.toLowerCase()))?.value;

  const c = parseNumberBR(findValue(/comprim/));
  const l = parseNumberBR(findValue(/largura|diam|diâm/));
  const a = parseNumberBR(findValue(/altura/));
  const dims = [c, l, a].filter((v): v is number => v != null);
  const maior = dims.length ? Math.max(...dims) : null;

  const peso = parseNumberBR(findValue(/peso/));

  return {
    maiorDimensaoCm: maior,
    pesoKg: peso,
    tamanho: tamanhoBucketOf(maior),
    peso: pesoBucketOf(peso),
  };
}
