// Decision tree única do Guia de Composição Western.
// 45 nós-folha + 3 caminhos consultivos.

import { SHOPIFY_STORE_PERMANENT_DOMAIN } from "@/lib/shopify/client";

export type Tipo = "lago" | "piscina" | "jardim";
export type Nivel = "essencial" | "equilibrada" | "completa";
export type Composicao = "somenteWestern" | "comNaturais";
export type Jardim = "seco" | "comFonte";

export interface ConjuntoLeaf {
  handle: string;
  nome: string;
  subtitulo: string;
  preco: number;
}

type Consultor = "consultor";

export const guideMap = {
  lago: {
    "ate-4": {
      somenteWestern: {
        essencial: { handle: "conjunto-lago-caiapo-essencial", nome: "Conjunto Lago Caiapó", subtitulo: "Composição essencial", preco: 2500 },
        equilibrada: { handle: "conjunto-lago-itacare-equilibrado", nome: "Conjunto Lago Itacaré", subtitulo: "Composição equilibrada", preco: 4500 },
        completa: { handle: "conjunto-lago-guarairas-completo", nome: "Conjunto Lago Guarairas", subtitulo: "Composição completa", preco: 7500 },
      },
      comNaturais: {
        essencial: { handle: "conjunto-lago-caiapo-reduzido-essencial", nome: "Conjunto Lago Caiapó Reduzido", subtitulo: "Composição essencial", preco: 2000 },
        equilibrada: { handle: "conjunto-lago-itacare-reduzido-equilibrado", nome: "Conjunto Lago Itacaré Reduzido", subtitulo: "Composição equilibrada", preco: 3200 },
        completa: { handle: "conjunto-lago-guarairas-reduzido-completo", nome: "Conjunto Lago Guarairas Reduzido", subtitulo: "Composição completa", preco: 5500 },
      },
    },
    "4-a-10": {
      somenteWestern: {
        essencial: { handle: "conjunto-lago-carcara-essencial", nome: "Conjunto Lago Carcará", subtitulo: "Composição essencial", preco: 5500 },
        equilibrada: { handle: "conjunto-lago-moema-equilibrado", nome: "Conjunto Lago Moema", subtitulo: "Composição equilibrada", preco: 9800 },
        completa: { handle: "conjunto-lago-paranoa-completo", nome: "Conjunto Lago Paranoá", subtitulo: "Composição completa", preco: 15500 },
      },
      comNaturais: {
        essencial: { handle: "conjunto-lago-carcara-reduzido-essencial", nome: "Conjunto Lago Carcará Reduzido", subtitulo: "Composição essencial", preco: 4000 },
        equilibrada: { handle: "conjunto-lago-moema-reduzido-equilibrado", nome: "Conjunto Lago Moema Reduzido", subtitulo: "Composição equilibrada", preco: 7000 },
        completa: { handle: "conjunto-lago-paranoa-reduzido-completo", nome: "Conjunto Lago Paranoá Reduzido", subtitulo: "Composição completa", preco: 11000 },
      },
    },
    "10-a-20": {
      somenteWestern: {
        essencial: { handle: "conjunto-lago-maragogi-essencial", nome: "Conjunto Lago Maragogi", subtitulo: "Composição essencial", preco: 11500 },
        equilibrada: { handle: "conjunto-lago-paineira-equilibrado", nome: "Conjunto Lago Paineira", subtitulo: "Composição equilibrada", preco: 18500 },
        completa: { handle: "conjunto-lago-cambara-completo", nome: "Conjunto Lago Cambará", subtitulo: "Composição completa", preco: 26500 },
      },
      comNaturais: {
        essencial: { handle: "conjunto-lago-maragogi-reduzido-essencial", nome: "Conjunto Lago Maragogi Reduzido", subtitulo: "Composição essencial", preco: 8000 },
        equilibrada: { handle: "conjunto-lago-paineira-reduzido-equilibrado", nome: "Conjunto Lago Paineira Reduzido", subtitulo: "Composição equilibrada", preco: 13000 },
        completa: { handle: "conjunto-lago-cambara-reduzido-completo", nome: "Conjunto Lago Cambará Reduzido", subtitulo: "Composição completa", preco: 18500 },
      },
    },
    "acima-20": "consultor" as Consultor,
  },
  piscina: {
    "ate-12": {
      essencial: { handle: "conjunto-piscina-caiapo-essencial", nome: "Conjunto Piscina Caiapó", subtitulo: "Composição essencial", preco: 2800 },
      equilibrada: { handle: "conjunto-piscina-itacare-equilibrado", nome: "Conjunto Piscina Itacaré", subtitulo: "Composição equilibrada", preco: 5200 },
      completa: { handle: "conjunto-piscina-guarairas-completo", nome: "Conjunto Piscina Guarairas", subtitulo: "Composição completa", preco: 8500 },
    },
    "12-a-32": {
      essencial: { handle: "conjunto-piscina-carcara-essencial", nome: "Conjunto Piscina Carcará", subtitulo: "Composição essencial", preco: 6500 },
      equilibrada: { handle: "conjunto-piscina-moema-equilibrado", nome: "Conjunto Piscina Moema", subtitulo: "Composição equilibrada", preco: 10800 },
      completa: { handle: "conjunto-piscina-paranoa-completo", nome: "Conjunto Piscina Paranoá", subtitulo: "Composição completa", preco: 16500 },
    },
    "32-a-60": {
      essencial: { handle: "conjunto-piscina-maragogi-essencial", nome: "Conjunto Piscina Maragogi", subtitulo: "Composição essencial", preco: 12500 },
      equilibrada: { handle: "conjunto-piscina-paineira-equilibrado", nome: "Conjunto Piscina Paineira", subtitulo: "Composição equilibrada", preco: 19500 },
      completa: { handle: "conjunto-piscina-cambara-completo", nome: "Conjunto Piscina Cambará", subtitulo: "Composição completa", preco: 28500 },
    },
    "acima-60": "consultor" as Consultor,
  },
  jardim: {
    "ate-2": {
      seco: {
        essencial: { handle: "conjunto-jardim-caiapo-essencial", nome: "Conjunto Jardim Caiapó", subtitulo: "Composição essencial", preco: 2000 },
        equilibrada: { handle: "conjunto-jardim-itacare-equilibrado", nome: "Conjunto Jardim Itacaré", subtitulo: "Composição equilibrada", preco: 3500 },
        completa: { handle: "conjunto-jardim-guarairas-completo", nome: "Conjunto Jardim Guarairas", subtitulo: "Composição completa", preco: 5500 },
      },
      comFonte: {
        essencial: { handle: "conjunto-jardim-caiapo-com-fonte-essencial", nome: "Conjunto Jardim Caiapó com Fonte", subtitulo: "Composição essencial", preco: 3800 },
        equilibrada: { handle: "conjunto-jardim-itacare-com-fonte-equilibrado", nome: "Conjunto Jardim Itacaré com Fonte", subtitulo: "Composição equilibrada", preco: 5300 },
        completa: { handle: "conjunto-jardim-guarairas-com-fonte-completo", nome: "Conjunto Jardim Guarairas com Fonte", subtitulo: "Composição completa", preco: 7300 },
      },
    },
    "2-a-10": {
      seco: {
        essencial: { handle: "conjunto-jardim-carcara-essencial", nome: "Conjunto Jardim Carcará", subtitulo: "Composição essencial", preco: 4500 },
        equilibrada: { handle: "conjunto-jardim-moema-equilibrado", nome: "Conjunto Jardim Moema", subtitulo: "Composição equilibrada", preco: 7500 },
        completa: { handle: "conjunto-jardim-paranoa-completo", nome: "Conjunto Jardim Paranoá", subtitulo: "Composição completa", preco: 11500 },
      },
      comFonte: {
        essencial: { handle: "conjunto-jardim-carcara-com-fonte-essencial", nome: "Conjunto Jardim Carcará com Fonte", subtitulo: "Composição essencial", preco: 6300 },
        equilibrada: { handle: "conjunto-jardim-moema-com-fonte-equilibrado", nome: "Conjunto Jardim Moema com Fonte", subtitulo: "Composição equilibrada", preco: 9300 },
        completa: { handle: "conjunto-jardim-paranoa-com-fonte-completo", nome: "Conjunto Jardim Paranoá com Fonte", subtitulo: "Composição completa", preco: 13300 },
      },
    },
    "10-a-20": {
      seco: {
        essencial: { handle: "conjunto-jardim-maragogi-essencial", nome: "Conjunto Jardim Maragogi", subtitulo: "Composição essencial", preco: 9500 },
        equilibrada: { handle: "conjunto-jardim-paineira-equilibrado", nome: "Conjunto Jardim Paineira", subtitulo: "Composição equilibrada", preco: 15500 },
        completa: { handle: "conjunto-jardim-cambara-completo", nome: "Conjunto Jardim Cambará", subtitulo: "Composição completa", preco: 22500 },
      },
      comFonte: {
        essencial: { handle: "conjunto-jardim-maragogi-com-fonte-essencial", nome: "Conjunto Jardim Maragogi com Fonte", subtitulo: "Composição essencial", preco: 11300 },
        equilibrada: { handle: "conjunto-jardim-paineira-com-fonte-equilibrado", nome: "Conjunto Jardim Paineira com Fonte", subtitulo: "Composição equilibrada", preco: 17300 },
        completa: { handle: "conjunto-jardim-cambara-com-fonte-completo", nome: "Conjunto Jardim Cambará com Fonte", subtitulo: "Composição completa", preco: 24300 },
      },
    },
    "acima-20": "consultor" as Consultor,
  },
} as const;

export const PRODUCT_BASE_URL = `https://${SHOPIFY_STORE_PERMANENT_DOMAIN}/products`;
export const COLLECTION_BASE_URL = `https://${SHOPIFY_STORE_PERMANENT_DOMAIN}/collections`;
export const WHATSAPP_NUMBER = "5511993403485";

export function formatPreco(valor: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
  }).format(valor);
}

export const tipoLabels: Record<Tipo, string> = {
  lago: "Lago",
  piscina: "Piscina",
  jardim: "Jardim",
};

export const tamanhoLabels: Record<string, string> = {
  "ate-4": "Até 4 m²",
  "4-a-10": "De 4 m² a 10 m²",
  "10-a-20": "De 10 m² a 20 m²",
  "acima-20": "Acima de 20 m²",
  "ate-12": "Até 12 m²",
  "12-a-32": "De 12 m² a 32 m²",
  "32-a-60": "De 32 m² a 60 m²",
  "acima-60": "Acima de 60 m²",
  "ate-2": "Até 2 m²",
  "2-a-10": "De 2 m² a 10 m²",
};

export const nivelLabels: Record<Nivel, string> = {
  essencial: "Essencial",
  equilibrada: "Equilibrada",
  completa: "Completa",
};

// Rótulos voltados ao usuário B2B — substitui o jargão "nível"
export interface NivelMeta {
  label: string;
  tagline: string;
  detalhe: string;
  faixaPreco: string;
  pecas: string;
}

export const nivelMeta: Record<Tipo, Record<Nivel, NivelMeta>> = {
  lago: {
    essencial: {
      label: "Discreto",
      tagline: "Composição enxuta, leitura clean",
      detalhe: "Poucas peças, foco no destaque. Ideal para projetos com paisagismo abundante.",
      faixaPreco: "R$ 2 mil – R$ 11 mil",
      pecas: "4–6 peças",
    },
    equilibrada: {
      label: "Marcante",
      tagline: "Equilíbrio entre presença e investimento",
      detalhe: "A escolha mais pedida — composição com volume e acabamento de destaque.",
      faixaPreco: "R$ 4 mil – R$ 19 mil",
      pecas: "7–11 peças",
    },
    completa: {
      label: "Cenográfico",
      tagline: "Alto impacto, leitura imersiva",
      detalhe: "Composição mais robusta, pensada para projetos cenográficos e áreas amplas.",
      faixaPreco: "R$ 7 mil – R$ 27 mil",
      pecas: "12+ peças",
    },
  },
  piscina: {
    essencial: {
      label: "Discreto",
      tagline: "Detalhe pontual de pedras decorativas",
      detalhe: "Conjunto enxuto para complementar a borda ou um canto da piscina.",
      faixaPreco: "R$ 2,8 mil – R$ 12,5 mil",
      pecas: "4–6 peças",
    },
    equilibrada: {
      label: "Marcante",
      tagline: "Cascata e presença visual definida",
      detalhe: "Combinação balanceada com cascata e composição lateral.",
      faixaPreco: "R$ 5 mil – R$ 20 mil",
      pecas: "7–11 peças",
    },
    completa: {
      label: "Cenográfico",
      tagline: "Borda imersiva, leitura espetacular",
      detalhe: "Para piscinas que viram peça-chave do paisagismo.",
      faixaPreco: "R$ 8,5 mil – R$ 28,5 mil",
      pecas: "12+ peças",
    },
  },
  jardim: {
    essencial: {
      label: "Discreto",
      tagline: "Pontuação leve e elegante",
      detalhe: "Composição reduzida, ideal para canteiros e jardins compactos.",
      faixaPreco: "R$ 2 mil – R$ 11,5 mil",
      pecas: "3–5 peças",
    },
    equilibrada: {
      label: "Marcante",
      tagline: "Equilíbrio estético e volume",
      detalhe: "Composição com presença visual definida e bom aproveitamento de área.",
      faixaPreco: "R$ 3,5 mil – R$ 17,3 mil",
      pecas: "6–9 peças",
    },
    completa: {
      label: "Cenográfico",
      tagline: "Acabamento premium, alto impacto",
      detalhe: "Composição mais marcante, pensada para áreas nobres do paisagismo.",
      faixaPreco: "R$ 5,5 mil – R$ 24,3 mil",
      pecas: "10+ peças",
    },
  },
};

export const nivelDescricoes: Record<Tipo, Record<Nivel, string>> = {
  lago: {
    essencial: "Composição mais objetiva, indicada para projetos com menor volume de pedras ou primeiro pedido.",
    equilibrada: "Equilíbrio entre volume, estética e investimento.",
    completa: "Composição mais marcante, com maior presença visual e acabamento mais robusto.",
  },
  piscina: {
    essencial: "Composição mais simples, indicada para complementar o projeto com pedras decorativas.",
    equilibrada: "Melhor presença visual, podendo incluir cascata.",
    completa: "Maior impacto, ideal para piscina com visual mais cenográfico.",
  },
  jardim: {
    essencial: "Composição mais objetiva, ideal para pequenos espaços ou primeira compra.",
    equilibrada: "Equilíbrio entre estética, volume e investimento.",
    completa: "Composição mais marcante, com maior presença visual e acabamento premium.",
  },
};

export const totalEtapasPorTipo: Record<Tipo, number> = {
  lago: 4,
  piscina: 3,
  jardim: 4,
};

export interface UpsellItem {
  nome: string;
  url: string;
}

export const upsellMap: Record<Tipo, UpsellItem[]> = {
  lago: [
    { nome: "Pedras pequenas", url: `${COLLECTION_BASE_URL}/pedras-pequenas` },
    { nome: "Pedras médias", url: `${COLLECTION_BASE_URL}/pedras-medias` },
    { nome: "Cascatas", url: `${COLLECTION_BASE_URL}/cascatas` },
    { nome: "Pedra LED", url: `${COLLECTION_BASE_URL}/pedra-led` },
    { nome: "Acessórios", url: `${COLLECTION_BASE_URL}/acessorios` },
    { nome: "Fontes para jardim", url: `${COLLECTION_BASE_URL}/fontes-para-jardim` },
  ],
  piscina: [
    { nome: "Cascatas", url: `${COLLECTION_BASE_URL}/cascatas` },
    { nome: "Pedra LED", url: `${COLLECTION_BASE_URL}/pedra-led` },
    { nome: "Pedras de borda", url: `${COLLECTION_BASE_URL}/pedras-de-borda` },
    { nome: "Pedras pequenas", url: `${COLLECTION_BASE_URL}/pedras-pequenas` },
    { nome: "Acessórios decorativos", url: `${COLLECTION_BASE_URL}/acessorios` },
  ],
  jardim: [
    { nome: "Pisadas", url: `${COLLECTION_BASE_URL}/pisadas` },
    { nome: "Fontes para jardim", url: `${COLLECTION_BASE_URL}/fontes-para-jardim` },
    { nome: "Pedra Sonora", url: `${PRODUCT_BASE_URL}/pedra-sonora` },
    { nome: "Pedra Champanheira", url: `${PRODUCT_BASE_URL}/pedra-champanheira` },
    { nome: "Pedra Torneira", url: `${PRODUCT_BASE_URL}/pedra-torneira` },
    { nome: "Pedras pequenas", url: `${COLLECTION_BASE_URL}/pedras-pequenas` },
    { nome: "Acessórios", url: `${COLLECTION_BASE_URL}/acessorios` },
  ],
};

export function whatsappConsultor(tipo: Tipo, faixa: string): string {
  const text = `Olá, vim pelo Guia de Composição Western. Tenho um projeto de ${tipoLabels[tipo].toLowerCase()} com área ${faixa.toLowerCase()} e gostaria de atendimento consultivo.`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}

export function whatsappConjunto(nome: string): string {
  const text = `Olá, vim pelo Guia de Composição Western e gostaria de mais informações sobre o ${nome}.`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}

export type GuideAnswers = {
  tipo?: Tipo;
  tamanho?: string;
  composicao?: Composicao;
  jardim?: Jardim;
  nivel?: Nivel;
};

export function resolveConjunto(a: GuideAnswers): ConjuntoLeaf | Consultor | null {
  if (!a.tipo || !a.tamanho || !a.nivel) return null;
  const sizeNode = (guideMap[a.tipo] as Record<string, unknown>)[a.tamanho];
  if (!sizeNode) return null;
  if (sizeNode === "consultor") return "consultor";

  if (a.tipo === "lago") {
    if (!a.composicao) return null;
    const branch = (sizeNode as Record<string, Record<Nivel, ConjuntoLeaf>>)[a.composicao];
    return branch?.[a.nivel] ?? null;
  }
  if (a.tipo === "jardim") {
    if (!a.jardim) return null;
    const branch = (sizeNode as Record<string, Record<Nivel, ConjuntoLeaf>>)[a.jardim];
    return branch?.[a.nivel] ?? null;
  }
  // piscina
  return (sizeNode as Record<Nivel, ConjuntoLeaf>)[a.nivel] ?? null;
}
