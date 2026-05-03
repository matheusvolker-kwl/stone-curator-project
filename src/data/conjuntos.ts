// Conjuntos = kits curados oferecidos no Guia de Compra.
// Cada conjunto referencia handles do Shopify. Quantidades sugeridas.

export interface ConjuntoItem {
  handle: string;
  qty: number;
  notaRapida?: string;
}

export interface Conjunto {
  id: string;
  nome: string;
  descricao: string;
  ambiente: string; // ex.: "Lago contemplativo · jardim residencial"
  items: ConjuntoItem[];
}

// Mapa simples de chave (location-size-finish) → conjuntoId.
// Conjuntos são curadoria; faltando match, devolvemos o "default" do tamanho.
export const conjuntoMap: Record<string, string> = {
  "garden-small-Quartzo": "jardim-detalhe-quartzo",
  "garden-medium-Quartzo": "lago-contemplativo-quartzo",
  "garden-large-Granito": "cascata-mata-granito",
  "garden-large-Moledo": "cascata-mata-moledo",
  "pool-medium-Arenito": "borda-praia-arenito",
  "pool-large-Arenito": "praia-completa-arenito",
  "pool-large-Granito": "borda-piscina-granito",
  "indoor-small-Quartzo": "fonte-zen-quartzo",
  "indoor-medium-Moledo": "parede-mineral-moledo",
};

export const conjuntos: Record<string, Conjunto> = {
  "jardim-detalhe-quartzo": {
    id: "jardim-detalhe-quartzo",
    nome: "Conjunto Jardim Detalhe",
    ambiente: "Detalhes em jardim residencial · acabamento Quartzo",
    descricao:
      "Composição leve para canteiros, recantos e bordaduras de canteiro. Pedras pequenas e pisadas para um caminho discreto.",
    items: [
      { handle: "pedra-pequena-quartzo", qty: 12, notaRapida: "Pontuações de luz" },
      { handle: "pisada-quartzo", qty: 6, notaRapida: "Caminho curto" },
      { handle: "seixo-quartzo", qty: 1, notaRapida: "Saco 20kg de preenchimento" },
    ],
  },
  "lago-contemplativo-quartzo": {
    id: "lago-contemplativo-quartzo",
    nome: "Conjunto Lago Contemplativo",
    ambiente: "Lago seco ou espelho d'água · acabamento Quartzo",
    descricao:
      "Curadoria para um canto contemplativo: pedra média protagonista, pedras de apoio e pisadas para acesso.",
    items: [
      { handle: "pedra-media-quartzo", qty: 3, notaRapida: "Protagonistas" },
      { handle: "pedra-pequena-quartzo", qty: 8, notaRapida: "Coadjuvantes" },
      { handle: "pisada-quartzo", qty: 4, notaRapida: "Acesso" },
    ],
  },
  "cascata-mata-granito": {
    id: "cascata-mata-granito",
    nome: "Conjunto Cascata Mata",
    ambiente: "Cascata de jardim · acabamento Granito",
    descricao:
      "Estrutura completa para cascata de impacto: peças grandes para a base, médias para os patamares e fósseis decorativos para detalhe.",
    items: [
      { handle: "pedra-grande-granito", qty: 4, notaRapida: "Base" },
      { handle: "cascata-granito", qty: 1, notaRapida: "Conjunto cascata" },
      { handle: "fossil-decorativo-granito", qty: 2, notaRapida: "Detalhe nobre" },
    ],
  },
  "cascata-mata-moledo": {
    id: "cascata-mata-moledo",
    nome: "Conjunto Cascata Mata Atlântica",
    ambiente: "Cascata de jardim · acabamento Moledo",
    descricao:
      "Cascata com volume médio, textura rústica e calor terroso. Ideal para projetos com vegetação densa.",
    items: [
      { handle: "pedra-grande-moledo", qty: 3, notaRapida: "Base" },
      { handle: "cascata-moledo", qty: 1, notaRapida: "Conjunto cascata" },
      { handle: "pedra-media-moledo", qty: 5, notaRapida: "Patamares" },
    ],
  },
  "borda-praia-arenito": {
    id: "borda-praia-arenito",
    nome: "Conjunto Borda Praia",
    ambiente: "Borda de piscina praia · acabamento Arenito",
    descricao:
      "Composição para a borda de uma piscina praia, com pedras de borda e seixos de transição para a água.",
    items: [
      { handle: "pedra-de-borda-arenito", qty: 12, notaRapida: "Perímetro 6m" },
      { handle: "seixo-arenito", qty: 4, notaRapida: "Saco 20kg" },
    ],
  },
  "praia-completa-arenito": {
    id: "praia-completa-arenito",
    nome: "Conjunto Praia Completa",
    ambiente: "Piscina praia · acabamento Arenito",
    descricao:
      "Conjunto completo para o ambiente piscina praia: bordas, pedras grandes para composição e seixos para o tapete da prainha.",
    items: [
      { handle: "pedra-de-borda-arenito", qty: 18 },
      { handle: "pedra-grande-arenito", qty: 4, notaRapida: "Composição" },
      { handle: "seixo-arenito", qty: 8, notaRapida: "Saco 20kg" },
    ],
  },
  "borda-piscina-granito": {
    id: "borda-piscina-granito",
    nome: "Conjunto Borda Piscina",
    ambiente: "Borda de piscina · acabamento Granito",
    descricao:
      "Bordas escuras e densas, ancoram visualmente a lâmina d'água em projetos de jardim mineral.",
    items: [
      { handle: "pedra-de-borda-granito", qty: 14 },
      { handle: "pedra-media-granito", qty: 3, notaRapida: "Composição" },
    ],
  },
  "fonte-zen-quartzo": {
    id: "fonte-zen-quartzo",
    nome: "Conjunto Fonte Zen",
    ambiente: "Fonte interna · acabamento Quartzo",
    descricao:
      "Pequena fonte para área interna ou varanda. Ideal para hall, escritório ou recanto de leitura.",
    items: [
      { handle: "fonte-pequena-quartzo", qty: 1 },
      { handle: "seixo-quartzo", qty: 2, notaRapida: "Preenchimento" },
    ],
  },
  "parede-mineral-moledo": {
    id: "parede-mineral-moledo",
    nome: "Conjunto Parede Mineral",
    ambiente: "Revestimento de parede interna · acabamento Moledo",
    descricao:
      "Revestimento mineral para painel de destaque, lareira ou hall — calor textural sem peso visual.",
    items: [
      { handle: "revestimento-moledo", qty: 6, notaRapida: "Cobre ~3m²" },
      { handle: "pedra-pequena-moledo", qty: 4, notaRapida: "Detalhe" },
    ],
  },
};

export function resolveConjunto(
  location: string,
  size: string,
  finish: string
): Conjunto | null {
  const key = `${location}-${size}-${finish}`;
  const id = conjuntoMap[key];
  if (id && conjuntos[id]) return conjuntos[id];
  // Fallback simples: primeira chave pelo tamanho
  const fallback = Object.entries(conjuntoMap).find(([k]) =>
    k.startsWith(`${location}-${size}-`)
  );
  if (fallback && conjuntos[fallback[1]]) return conjuntos[fallback[1]];
  return null;
}
