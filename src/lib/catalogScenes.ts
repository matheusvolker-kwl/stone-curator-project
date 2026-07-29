/**
 * Taxonomia por CENA (auditoria 2026-07).
 * ----------------------------------------------------------------------------
 * O cliente navega por "o que vou construir" (cena/aplicação), não pela lógica
 * interna de SKU (tamanho/formato). As categorias do Woo continuam as mesmas —
 * aqui é só a camada de AGRUPAMENTO de apresentação do índice do catálogo.
 *
 * As 3 categorias de pedra (grandes/médias/pequenas) viram UMA "Pedras
 * decorativas": tamanho passa a ser FILTRO, não categoria. O ProductGrid já
 * filtra por tamanho a partir das dimensões reais da peça, então a página
 * combinada reaproveita esse filtro (ver LinhaPage → handle virtual).
 */

/** Handles das 3 categorias de pedra que se fundem em "Pedras decorativas". */
export const PEDRAS_HANDLES = ["pedras-grandes", "pedras-medias", "pedras-pequenas"];

/** Handle virtual da linha combinada (não existe no Woo; resolvido no app). */
export const PEDRAS_VIRTUAL_HANDLE = "pedras-decorativas";

export const PEDRAS_VIRTUAL = {
  handle: PEDRAS_VIRTUAL_HANDLE,
  title: "Pedras decorativas",
  description:
    "Pedras soltas para compor volume — do detalhe ao ponto focal. Filtre por tamanho.",
  /** categoria cuja capa representa o card combinado */
  coverFrom: "pedras-grandes",
};

export interface CatalogScene {
  key: string;
  titulo: string;
  descricao: string;
  /** handles de categoria do Woo na ordem; PEDRAS_VIRTUAL_HANDLE = card fundido */
  handles: string[];
}

/** Ordem das cenas = do carro-chefe (água) ao arremate (detalhes). */
export const CATALOG_SCENES: CatalogScene[] = [
  {
    key: "agua",
    titulo: "Água",
    descricao: "Cascatas, fontes e bordas — para piscina, lago e espelho d'água.",
    handles: ["cascatas", "fontes-para-jardim", "pedras-de-borda"],
  },
  {
    key: "superficies",
    titulo: "Superfícies",
    descricao: "Revestimentos para parede e pisadas para o piso.",
    handles: ["revestimentos", "pisadas"],
  },
  {
    key: "volumes",
    titulo: "Volumes",
    descricao: "Pedras decorativas soltas, em qualquer tamanho.",
    handles: [PEDRAS_VIRTUAL_HANDLE],
  },
  {
    key: "detalhes",
    titulo: "Detalhes",
    // "pedra-led" saiu do índice de categorias (dono, 2026-07-18): é um PRODUTO,
    // não uma categoria — continua acessível pela peça/busca, não como card aqui.
    descricao: "Acessórios e fósseis para o arremate.",
    handles: ["acessorios", "fosseis-decorativos"],
  },
];

export function isPedraHandle(h?: string | null): boolean {
  return !!h && PEDRAS_HANDLES.includes(h);
}

/**
 * CATEGORIAS DE FILTRO (dono, 2026-07-18) — os chips do /produtos.
 * O produto já chega com as coleções dele (`node.collections.edges`), então o
 * filtro casa por handle; não precisa de camada de dados extra.
 * As 3 categorias de pedra viram UM chip "Pedras" (tamanho continua sendo a
 * régua, como manda a taxonomia acima).
 */
export interface ProductCategory {
  key: string;
  label: string;
  /** handles de coleção do Woo que este chip representa */
  handles: string[];
}

export const PRODUCT_CATEGORIES: ProductCategory[] = [
  { key: "cascatas", label: "Cascatas", handles: ["cascatas"] },
  { key: "fontes", label: "Fontes", handles: ["fontes-para-jardim"] },
  { key: "bordas", label: "Pedras de borda", handles: ["pedras-de-borda"] },
  { key: "pedras", label: "Pedras", handles: PEDRAS_HANDLES },
  { key: "revestimentos", label: "Revestimentos", handles: ["revestimentos"] },
  { key: "pisadas", label: "Pisadas", handles: ["pisadas"] },
  { key: "acessorios", label: "Acessórios", handles: ["acessorios"] },
  { key: "fosseis", label: "Fósseis", handles: ["fosseis-decorativos"] },
];
