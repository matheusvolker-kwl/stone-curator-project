// Texto da busca — normalização, palavras, radical e erro de digitação.
// Tudo puro e sem dependência: é a base do motor (engine.ts) e do vocabulário.

/** Minúsculo, sem acento e sem apóstrofo — base de todo match. */
export function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/['´`’]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Quebra em palavras: sem acento, e toda pontuação vira espaço ("WEST-PG3" → west, pg3). */
export function words(s: string): string[] {
  const n = normalize(s).replace(/[^a-z0-9]+/g, " ").trim();
  return n ? n.split(" ") : [];
}

/** Palavras que não carregam informação ("pedra DE borda", "fonte PARA jardim"). */
export const STOPWORDS = new Set([
  "a", "o", "as", "os", "e", "de", "da", "do", "das", "dos", "d",
  "em", "no", "na", "nos", "nas", "um", "uma", "para", "pra", "pro", "com",
]);

export function temNumero(w: string): boolean {
  return /\d/.test(w);
}

/**
 * Radical leve do português — plural vira singular e o gênero dobra
 * ("pedras" = "pedra", "médio" = "média", "fósseis" = "fóssil", "painéis" = "painel").
 * Aplicado dos DOIS lados (busca e catálogo), então só precisa ser consistente.
 */
export function stem(w: string): string {
  if (w.length <= 3 || temNumero(w)) return w;
  let s = w;
  if (/(oes|aes|aos)$/.test(s)) s = s.slice(0, -3) + "ao";
  else if (/eis$/.test(s)) s = s.slice(0, -3) + "el";
  else if (/ns$/.test(s)) s = s.slice(0, -2) + "m";
  else if (/[rz]es$/.test(s)) s = s.slice(0, -2);
  else if (/[^s]s$/.test(s)) s = s.slice(0, -1);
  if (/il$/.test(s)) s = s.slice(0, -2) + "el";
  if (s.length > 4 && /[ao]$/.test(s)) s = s.slice(0, -1);
  return s;
}

/** Quantos erros de digitação a palavra aguenta: 0 até 3 letras, 1 até 7, 2 daí pra cima. */
export function typoBudget(len: number): number {
  return len >= 8 ? 2 : len >= 4 ? 1 : 0;
}

/**
 * Distância de digitação (Damerau restrita: troca, falta, sobra e letras
 * invertidas contam 1). Sai cedo quando passa do teto — só interessa "≤ teto".
 */
export function typoDistance(a: string, b: string, max: number): number {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  let antes: number[] = [];
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    let menor = i;
    for (let j = 1; j <= b.length; j++) {
      const custo = a[i - 1] === b[j - 1] ? 0 : 1;
      let v = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + custo);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        v = Math.min(v, antes[j - 2] + 1);
      }
      cur[j] = v;
      if (v < menor) menor = v;
    }
    if (menor > max) return max + 1;
    antes = prev;
    prev = cur;
  }
  return prev[b.length];
}

/** Posição da frase (lista de palavras) dentro da busca, comparando por radical. -1 se não está. */
export function indexOfPhrase(hay: string[], frase: string[]): number {
  if (frase.length === 0 || frase.length > hay.length) return -1;
  const h = hay.map(stem);
  const f = frase.map(stem);
  for (let i = 0; i + f.length <= h.length; i++) {
    if (f.every((w, k) => h[i + k] === w)) return i;
  }
  return -1;
}
