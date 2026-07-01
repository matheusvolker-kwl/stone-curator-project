// Decision tree do Guia de Composição Western.
// 5 categorias × 3 tamanhos × 3 níveis = 45 nós-folha.
// Shopify é a FONTE DE VERDADE de preço e composição — o `preco` aqui é
// apenas fallback caso a Storefront API falhe. Os handles devem casar
// exatamente com os produtos da loja Western.

import { STORE_PUBLIC_URL } from "@/lib/catalog/client";

// 5 categorias (achatadas — sem sub-variantes internas)
export type Tipo =
  | "piscina"
  | "lago"
  | "lago-hibrido"
  | "jardim-seco"
  | "jardim-fonte";

export type Nivel = "essencial" | "equilibrada" | "completa";
export type Tamanho = "pequeno" | "medio" | "grande";

export interface ConjuntoLeaf {
  handle: string;
  nome: string;
  subtitulo: string;
  /** Preço de atacado do brief — usado como FALLBACK; o valor exibido vem do Shopify. */
  preco: number;
}

type Consultor = "consultor";

type NivelMap = Record<Nivel, ConjuntoLeaf>;
type SizeMap = Record<Tamanho, NivelMap>;

// === 45 conjuntos — alinhados ao catálogo Shopify (handles oficiais) ===
export const guideMap: Record<Tipo, SizeMap> = {
  piscina: {
    pequeno: {
      // ATENÇÃO: handle Caiobá foi truncado pelo Shopify para "caio"
      essencial:   { handle: "conjunto-piscina-caio-essencial",        nome: "Caiobá",   subtitulo: "Composição essencial",   preco: 2250 },
      equilibrada: { handle: "conjunto-piscina-itacare-equilibrado",   nome: "Itacaré",  subtitulo: "Composição equilibrada", preco: 2800 },
      completa:    { handle: "conjunto-piscina-trancoso-completo",     nome: "Trancoso", subtitulo: "Composição completa",    preco: 3120 },
    },
    medio: {
      essencial:   { handle: "conjunto-piscina-buzios-essencial",      nome: "Búzios",   subtitulo: "Composição essencial",   preco: 3585 },
      equilibrada: { handle: "conjunto-piscina-maresias-equilibrado",  nome: "Maresias", subtitulo: "Composição equilibrada", preco: 4750 },
      completa:    { handle: "conjunto-piscina-pipa-completo",         nome: "Pipa",     subtitulo: "Composição completa",    preco: 5195 },
    },
    grande: {
      essencial:   { handle: "conjunto-piscina-maragogi-essencial",      nome: "Maragogi",     subtitulo: "Composição essencial",   preco: 6410 },
      equilibrada: { handle: "conjunto-piscina-jericoacoara-equilibrado", nome: "Jericoacoara", subtitulo: "Composição equilibrada", preco: 8050 },
      completa:    { handle: "conjunto-piscina-noronha-completo",         nome: "Noronha",      subtitulo: "Composição completa",    preco: 9420 },
    },
  },
  lago: {
    pequeno: {
      essencial:   { handle: "conjunto-lago-abaete-essencial",     nome: "Abaeté",   subtitulo: "Composição essencial",   preco: 1870 },
      equilibrada: { handle: "conjunto-lago-juparana-equilibrado", nome: "Juparanã", subtitulo: "Composição equilibrada", preco: 3170 },
      completa:    { handle: "conjunto-lago-cabiunas-completo",    nome: "Cabiúnas", subtitulo: "Composição completa",    preco: 3720 },
    },
    medio: {
      essencial:   { handle: "conjunto-lago-saquarema-essencial",   nome: "Saquarema", subtitulo: "Composição essencial",   preco: 3520 },
      equilibrada: { handle: "conjunto-lago-araruama-equilibrado",  nome: "Araruama",  subtitulo: "Composição equilibrada", preco: 4820 },
      completa:    { handle: "conjunto-lago-mundau-completo",       nome: "Mundaú",    subtitulo: "Composição completa",    preco: 8580 },
    },
    grande: {
      essencial:   { handle: "conjunto-lago-manguaba-essencial",   nome: "Manguaba", subtitulo: "Composição essencial",   preco: 10835 },
      equilibrada: { handle: "conjunto-lago-marau-equilibrado",    nome: "Maraú",    subtitulo: "Composição equilibrada", preco: 13085 },
      completa:    { handle: "conjunto-lago-amazonas-completo",    nome: "Amazonas", subtitulo: "Composição completa",    preco: 16325 },
    },
  },
  "lago-hibrido": {
    pequeno: {
      essencial:   { handle: "conjunto-lago-hibrido-vereda-essencial",     nome: "Vereda",   subtitulo: "Composição essencial",   preco: 525 },
      equilibrada: { handle: "conjunto-lago-hibrido-igarape-equilibrado",  nome: "Igarapé",  subtitulo: "Composição equilibrada", preco: 2395 },
      completa:    { handle: "conjunto-lago-hibrido-pororoca-completo",    nome: "Pororoca", subtitulo: "Composição completa",    preco: 2945 },
    },
    medio: {
      essencial:   { handle: "conjunto-lago-hibrido-igapo-essencial",      nome: "Igapó",    subtitulo: "Composição essencial",   preco: 1625 },
      equilibrada: { handle: "conjunto-lago-hibrido-apicum-equilibrado",   nome: "Apicum",   subtitulo: "Composição equilibrada", preco: 3495 },
      completa:    { handle: "conjunto-lago-hibrido-sambaqui-completo",    nome: "Sambaqui", subtitulo: "Composição completa",    preco: 3645 },
    },
    grande: {
      essencial:   { handle: "conjunto-lago-hibrido-ipueira-essencial",    nome: "Ipueira",  subtitulo: "Composição essencial",   preco: 3210 },
      equilibrada: { handle: "conjunto-lago-hibrido-marajo-equilibrado",   nome: "Marajó",   subtitulo: "Composição equilibrada", preco: 5230 },
      completa:    { handle: "conjunto-lago-hibrido-pantanal-completo",    nome: "Pantanal", subtitulo: "Composição completa",    preco: 6395 },
    },
  },
  "jardim-seco": {
    pequeno: {
      essencial:   { handle: "conjunto-jardim-seco-carcara-essencial",     nome: "Carcará",   subtitulo: "Composição essencial",   preco: 495 },
      equilibrada: { handle: "conjunto-jardim-seco-ibitipoca-equilibrado", nome: "Ibitipoca", subtitulo: "Composição equilibrada", preco: 670 },
      completa:    { handle: "conjunto-jardim-seco-itacolomi-completo",    nome: "Itacolomi", subtitulo: "Composição completa",    preco: 1095 },
    },
    medio: {
      essencial:   { handle: "conjunto-jardim-seco-cipo-essencial",        nome: "Cipó",     subtitulo: "Composição essencial",   preco: 870 },
      equilibrada: { handle: "conjunto-jardim-seco-canastra-equilibrado",  nome: "Canastra", subtitulo: "Composição equilibrada", preco: 1045 },
      completa:    { handle: "conjunto-jardim-seco-itatiaia-completo",     nome: "Itatiaia", subtitulo: "Composição completa",    preco: 1595 },
    },
    grande: {
      essencial:   { handle: "conjunto-jardim-seco-araripe-essencial",     nome: "Araripe",    subtitulo: "Composição essencial",   preco: 1610 },
      equilibrada: { handle: "conjunto-jardim-seco-guimaraes-equilibrado", nome: "Guimarães",  subtitulo: "Composição equilibrada", preco: 2825 },
      completa:    { handle: "conjunto-jardim-seco-diamantina-completo",   nome: "Diamantina", subtitulo: "Composição completa",    preco: 4710 },
    },
  },
  "jardim-fonte": {
    pequeno: {
      essencial:   { handle: "conjunto-jardim-fonte-esmeralda-essencial",   nome: "Esmeralda", subtitulo: "Composição essencial",   preco: 640 },
      equilibrada: { handle: "conjunto-jardim-fonte-pratinha-equilibrado",  nome: "Pratinha",  subtitulo: "Composição equilibrada", preco: 995 },
      completa:    { handle: "conjunto-jardim-fonte-bonito-completo",       nome: "Bonito",    subtitulo: "Composição completa",    preco: 1170 },
    },
    medio: {
      essencial:   { handle: "conjunto-jardim-fonte-aurora-essencial",      nome: "Aurora",      subtitulo: "Composição essencial",   preco: 995 },
      equilibrada: { handle: "conjunto-jardim-fonte-andorinhas-equilibrado", nome: "Andorinhas", subtitulo: "Composição equilibrada", preco: 2125 },
      completa:    { handle: "conjunto-jardim-fonte-veu-completo",          nome: "Véu",        subtitulo: "Composição completa",    preco: 2475 },
    },
    grande: {
      essencial:   { handle: "conjunto-jardim-fonte-tabocas-essencial",     nome: "Tabocas", subtitulo: "Composição essencial",   preco: 4235 },
      equilibrada: { handle: "conjunto-jardim-fonte-iguacu-equilibrado",    nome: "Iguaçu",  subtitulo: "Composição equilibrada", preco: 5335 },
      completa:    { handle: "conjunto-jardim-fonte-itambe-completo",       nome: "Itambé",  subtitulo: "Composição completa",    preco: 7815 },
    },
  },
};

export const PRODUCT_BASE_URL = `${STORE_PUBLIC_URL}/produto`;
export const COLLECTION_BASE_URL = `${STORE_PUBLIC_URL}/categoria-produto`;
export const WHATSAPP_NUMBER = "5511958967088";
/** Pedido mínimo da loja Western (não por conjunto). */
export const PEDIDO_MINIMO = 700;

export function formatPreco(valor: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
  }).format(valor);
}

export const tipoLabels: Record<Tipo, string> = {
  piscina: "Piscina",
  lago: "Lago",
  "lago-hibrido": "Lago Híbrido",
  "jardim-seco": "Jardim Seco",
  "jardim-fonte": "Jardim com Fonte",
};

/** Faixas de área legíveis por (tipo, tamanho). */
export const faixaArea: Record<Tipo, Record<Tamanho, string>> = {
  piscina: {
    pequeno: "Até 12 m²",
    medio: "De 12 m² a 32 m²",
    grande: "De 32 m² a 60 m²",
  },
  lago: {
    pequeno: "De 2 m² a 4 m²",
    medio: "De 4 m² a 10 m²",
    grande: "De 10 m² a 20 m²",
  },
  "lago-hibrido": {
    pequeno: "De 2 m² a 4 m²",
    medio: "De 4 m² a 10 m²",
    grande: "De 10 m² a 20 m²",
  },
  "jardim-seco": {
    pequeno: "Até 2 m²",
    medio: "De 2 m² a 4 m²",
    grande: "De 4 m² a 20 m²",
  },
  "jardim-fonte": {
    pequeno: "Até 2 m²",
    medio: "De 2 m² a 4 m²",
    grande: "De 4 m² a 20 m²",
  },
};

export const tamanhoLabels: Record<Tamanho, string> = {
  pequeno: "Pequeno",
  medio: "Médio",
  grande: "Grande",
};

export const nivelLabels: Record<Nivel, string> = {
  essencial: "Essencial",
  equilibrada: "Equilibrado",
  completa: "Completo",
};

// Rótulos editoriais por nível (usado nas etapas 02/03)
export interface NivelMeta {
  label: string;
  tagline: string;
  detalhe: string;
}

export const nivelMeta: Record<Nivel, NivelMeta> = {
  essencial: {
    label: "Essencial",
    tagline: "Composição enxuta, leitura clean",
    detalhe: "Poucas peças, foco no destaque. Ideal para projetos com paisagismo abundante.",
  },
  equilibrada: {
    label: "Equilibrado",
    tagline: "Equilíbrio entre presença e investimento",
    detalhe: "A escolha mais pedida — composição com volume e acabamento de destaque.",
  },
  completa: {
    label: "Completo",
    tagline: "Alto impacto, leitura imersiva",
    detalhe: "Composição mais robusta, pensada para projetos cenográficos e áreas amplas.",
  },
};

export const nivelDescricoes: Record<Nivel, string> = {
  essencial: "Composição mais objetiva, indicada para começar com elegância.",
  equilibrada: "Equilíbrio entre estética, volume e investimento.",
  completa: "Composição mais marcante, com maior presença visual e acabamento premium.",
};

export interface UpsellItem {
  nome: string;
  url: string;
}

export const upsellMap: Record<Tipo, UpsellItem[]> = {
  piscina: [
    { nome: "Cascatas", url: `${COLLECTION_BASE_URL}/cascatas` },
    { nome: "Pedra LED", url: `${COLLECTION_BASE_URL}/pedra-led` },
    { nome: "Pedras de borda", url: `${COLLECTION_BASE_URL}/pedras-de-borda` },
    { nome: "Acessórios decorativos", url: `${COLLECTION_BASE_URL}/acessorios` },
  ],
  lago: [
    { nome: "Pedras pequenas", url: `${COLLECTION_BASE_URL}/pedras-pequenas` },
    { nome: "Pedras médias", url: `${COLLECTION_BASE_URL}/pedras-medias` },
    { nome: "Cascatas", url: `${COLLECTION_BASE_URL}/cascatas` },
    { nome: "Pedra LED", url: `${COLLECTION_BASE_URL}/pedra-led` },
    { nome: "Fontes para jardim", url: `${COLLECTION_BASE_URL}/fontes-para-jardim` },
  ],
  "lago-hibrido": [
    { nome: "Pedras pequenas", url: `${COLLECTION_BASE_URL}/pedras-pequenas` },
    { nome: "Cascatas", url: `${COLLECTION_BASE_URL}/cascatas` },
    { nome: "Pedra LED", url: `${COLLECTION_BASE_URL}/pedra-led` },
    { nome: "Acessórios", url: `${COLLECTION_BASE_URL}/acessorios` },
  ],
  "jardim-seco": [
    { nome: "Pisadas", url: `${COLLECTION_BASE_URL}/pisadas` },
    { nome: "Pedra Sonora", url: `${PRODUCT_BASE_URL}/pedra-sonora` },
    { nome: "Acessórios", url: `${COLLECTION_BASE_URL}/acessorios` },
  ],
  "jardim-fonte": [
    { nome: "Fontes para jardim", url: `${COLLECTION_BASE_URL}/fontes-para-jardim` },
    { nome: "Pisadas", url: `${COLLECTION_BASE_URL}/pisadas` },
    { nome: "Pedra Sonora", url: `${PRODUCT_BASE_URL}/pedra-sonora` },
    { nome: "Pedra Champanheira", url: `${PRODUCT_BASE_URL}/pedra-champanheira` },
    { nome: "Acessórios", url: `${COLLECTION_BASE_URL}/acessorios` },
  ],
};

export function whatsappConsultor(tipo: Tipo, faixa: string): string {
  const text = `Olá, vim pelo Guia de Composição Western. Tenho um projeto de ${tipoLabels[tipo].toLowerCase()} com área ${faixa.toLowerCase()} e gostaria de atendimento consultivo.`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}

export function whatsappConjunto(nome: string): string {
  const text = `Olá, vim pelo Guia de Composição Western e gostaria de mais informações sobre o conjunto ${nome}.`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}

export type GuideAnswers = {
  tipo?: Tipo;
  tamanho?: Tamanho;
  nivel?: Nivel;
};

// === Ranges do slider de área por tipo ===
export const areaRangePorTipo: Record<Tipo, { min: number; max: number; default: number; snap: number[] }> = {
  piscina:        { min: 4, max: 80, default: 20, snap: [12, 32, 60] },
  lago:           { min: 2, max: 25, default: 6,  snap: [4, 10, 20] },
  "lago-hibrido": { min: 2, max: 25, default: 6,  snap: [4, 10, 20] },
  "jardim-seco":  { min: 1, max: 25, default: 5,  snap: [2, 4, 20] },
  "jardim-fonte": { min: 1, max: 25, default: 5,  snap: [2, 4, 20] },
};

/**
 * Mapeia área (m²) para o tamanho do conjunto.
 * Em jardim, a faixa "4–10 m²" cai em "grande" (decisão de produto).
 */
export function m2ToTamanhoId(tipo: Tipo, m2: number): Tamanho | "consultor" {
  if (tipo === "piscina") {
    if (m2 <= 12) return "pequeno";
    if (m2 <= 32) return "medio";
    if (m2 <= 60) return "grande";
    return "consultor";
  }
  if (tipo === "lago" || tipo === "lago-hibrido") {
    if (m2 <= 4) return "pequeno";
    if (m2 <= 10) return "medio";
    if (m2 <= 20) return "grande";
    return "consultor";
  }
  // jardim-seco | jardim-fonte
  if (m2 <= 2) return "pequeno";
  if (m2 <= 4) return "medio";
  if (m2 <= 20) return "grande"; // inclui o gap 4–10
  return "consultor";
}

// === Faixas de preço (apenas fallback estatístico) ===
function collectPrecos(node: unknown, filterNivel?: Nivel): number[] {
  const precos: number[] = [];
  const walk = (n: unknown, currentKey?: string) => {
    if (!n || typeof n !== "object") return;
    if ("preco" in (n as object) && "handle" in (n as object)) {
      if (!filterNivel || currentKey === filterNivel) {
        precos.push((n as ConjuntoLeaf).preco);
      }
      return;
    }
    Object.entries(n as Record<string, unknown>).forEach(([k, v]) => walk(v, k));
  };
  walk(node);
  return precos;
}

export function precoEstimadoPorArea(tipo: Tipo, m2: number): { min: number; max: number } | null {
  const tamanhoId = m2ToTamanhoId(tipo, m2);
  if (tamanhoId === "consultor") return null;
  const sizeNode = guideMap[tipo][tamanhoId];
  const precos = collectPrecos(sizeNode);
  if (precos.length === 0) return null;
  return { min: Math.min(...precos), max: Math.max(...precos) };
}

export function precoEstimadoPorAreaENivel(
  tipo: Tipo,
  m2: number,
  nivel: Nivel,
): { min: number; max: number } | null {
  const tamanhoId = m2ToTamanhoId(tipo, m2);
  if (tamanhoId === "consultor") return null;
  const sizeNode = guideMap[tipo][tamanhoId];
  const precos = collectPrecos(sizeNode, nivel);
  if (precos.length === 0) return null;
  return { min: Math.min(...precos), max: Math.max(...precos) };
}

export function precoRangePorTipo(tipo: Tipo): { min: number; max: number } | null {
  const precos = collectPrecos(guideMap[tipo]);
  if (precos.length === 0) return null;
  return { min: Math.min(...precos), max: Math.max(...precos) };
}

export function formatPrecoRangeMil({ min, max }: { min: number; max: number }): string {
  const fmt = (v: number) => {
    const mil = v / 1000;
    return Number.isInteger(mil) ? `${mil}` : mil.toFixed(1).replace(".", ",");
  };
  return `R$ ${fmt(min)} – ${fmt(max)} mil`;
}

// === Upsell por tipo+nível (handles complementares) ===
export const complementosPorTipo: Record<Tipo, string[]> = {
  piscina:        ["pedra-led", "cascata-pequena", "pedra-sonora"],
  lago:           ["pedra-led", "pedra-sonora", "pisada-pedra-grande"],
  "lago-hibrido": ["pedra-led", "pedra-sonora", "pisada-pedra-grande"],
  "jardim-seco":  ["pedra-sonora", "pedra-champanheira", "pedra-torneira"],
  "jardim-fonte": ["pedra-sonora", "pedra-champanheira", "pedra-torneira"],
};

export const itensCasaHandles: string[] = [
  "pedra-champanheira",
  "pedra-torneira",
  "pedra-sonora",
];

const upgradePath: Record<Nivel, Nivel | null> = {
  essencial: "equilibrada",
  equilibrada: "completa",
  completa: null,
};

export function resolveUpgrade(a: GuideAnswers): ConjuntoLeaf | null {
  if (!a.nivel) return null;
  const nextNivel = upgradePath[a.nivel];
  if (!nextNivel) return null;
  const result = resolveConjunto({ ...a, nivel: nextNivel });
  if (!result || result === "consultor") return null;
  return result;
}

export interface SketchAssets {
  pdfUrl: string;
  skpUrl: string;
}
export function sketchAssetsFor(handle: string): SketchAssets {
  return {
    pdfUrl: `${STORE_PUBLIC_URL}/wp-content/uploads/sketches/${handle}.pdf`,
    skpUrl: `${STORE_PUBLIC_URL}/wp-content/uploads/sketches/${handle}.skp`,
  };
}

export function resolveConjunto(a: GuideAnswers): ConjuntoLeaf | Consultor | null {
  if (!a.tipo || !a.tamanho || !a.nivel) return null;
  const sizeNode = guideMap[a.tipo]?.[a.tamanho];
  if (!sizeNode) return null;
  return sizeNode[a.nivel] ?? null;
}

// === Pecas (range estatístico para a UI; composição real vem do Shopify) ===
export const pecasPorTipoNivel: Record<Nivel, string> = {
  essencial:   "4–6 peças",
  equilibrada: "7–11 peças",
  completa:    "12+ peças",
};

export const pecasRangePorTipo: Record<Tipo, string> = {
  piscina:        "4 a 12+ peças",
  lago:           "4 a 12+ peças",
  "lago-hibrido": "4 a 12+ peças",
  "jardim-seco":  "3 a 10+ peças",
  "jardim-fonte": "3 a 10+ peças",
};

// === Prova social nominal por tipo ===
export const provaSocialPorTipo: Record<Tipo, { autor: string; frase: string }> = {
  piscina: {
    autor: "Hayasaki Arquitetura",
    frase: "escolhe a borda imersiva quando o projeto pede protagonismo.",
  },
  lago: {
    autor: "Eduardo Faisal",
    frase: "especifica a composição marcante em 4 de 5 projetos de lago.",
  },
  "lago-hibrido": {
    autor: "Eduardo Faisal",
    frase: "combina estrutura Western com pedra natural para um resultado autoral.",
  },
  "jardim-seco": {
    autor: "Luidi Paisagismo",
    frase: "especifica composições secas para jardins contemplativos.",
  },
  "jardim-fonte": {
    autor: "Luidi Paisagismo",
    frase: "especifica fontes Western para jardins residenciais.",
  },
};

export const totalEtapasPorTipo: Record<Tipo, number> = {
  piscina: 3,
  lago: 3,
  "lago-hibrido": 3,
  "jardim-seco": 3,
  "jardim-fonte": 3,
};
