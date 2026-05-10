// Hash determinístico (FNV-1a) para gerar números pseudo-aleatórios
// estáveis a partir de uma string. Usado para prova social e variações
// que precisam ser consistentes entre sessões sem armazenar nada.

export function hashSeed(seed: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** Inteiro determinístico no intervalo [min, max] inclusivo. */
export function inRange(seed: string, min: number, max: number): number {
  const span = max - min + 1;
  return min + (hashSeed(seed) % span);
}
