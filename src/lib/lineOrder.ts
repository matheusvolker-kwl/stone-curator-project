/**
 * Ordem curada das linhas (carro-chefe primeiro — não alfabética do Woo).
 * Espelha a hierarquia do footer. Usada no índice de Linhas e como ordenação
 * padrão do catálogo. Linhas fora da lista caem para o fim.
 */
export const LINHA_ORDER = [
  "cascatas",
  "fontes-para-jardim",
  "pedras-grandes",
  "pedras-medias",
  "pedras-pequenas",
  "pedras-de-borda",
  "revestimentos",
  "pisadas",
  "acessorios",
  "fosseis-decorativos",
  "amostras",
];

export function linhaRank(handle?: string | null): number {
  if (!handle) return LINHA_ORDER.length;
  const i = LINHA_ORDER.indexOf(handle);
  return i === -1 ? LINHA_ORDER.length : i;
}

/** Comparação natural de título ("Pedra Grande 2" antes de "Pedra Grande 10"). */
export function naturalTitleCompare(a: string, b: string): number {
  return a.localeCompare(b, "pt-BR", { numeric: true, sensitivity: "base" });
}
