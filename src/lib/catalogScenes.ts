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

import type { CatalogCollection } from "@/lib/catalog/types";

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
  /** handles de coleção do Woo que este filtro representa */
  handles: string[];
  /** subdivisões — só Pedras decorativas: pequenas, médias e grandes */
  children?: ProductCategory[];
  /** rótulo fora do contexto do pai ("Grandes" → "Pedras grandes") */
  fullLabel?: string;
}

export const PRODUCT_CATEGORIES: ProductCategory[] = [
  { key: "cascatas", label: "Cascatas", handles: ["cascatas"] },
  { key: "fontes", label: "Fontes", handles: ["fontes-para-jardim"] },
  { key: "bordas", label: "Pedras de borda", handles: ["pedras-de-borda"] },
  {
    key: "pedras",
    label: "Pedras decorativas",
    handles: PEDRAS_HANDLES,
    // Mesma ordem dos blocos do carrinho (dono, 2026-09-11).
    children: [
      { key: "pedras-pequenas", label: "Pequenas", fullLabel: "Pedras pequenas", handles: ["pedras-pequenas"] },
      { key: "pedras-medias", label: "Médias", fullLabel: "Pedras médias", handles: ["pedras-medias"] },
      { key: "pedras-grandes", label: "Grandes", fullLabel: "Pedras grandes", handles: ["pedras-grandes"] },
    ],
  },
  { key: "revestimentos", label: "Revestimentos", handles: ["revestimentos"] },
  { key: "pisadas", label: "Pisadas", handles: ["pisadas"] },
  { key: "acessorios", label: "Acessórios", handles: ["acessorios"] },
  { key: "fosseis", label: "Fósseis", handles: ["fosseis-decorativos"] },
];

/** Categoria ou subcategoria pela chave da URL (`?cat=`). */
export function findCategory(key: string): ProductCategory | undefined {
  for (const c of PRODUCT_CATEGORIES) {
    if (c.key === key) return c;
    const filho = c.children?.find((f) => f.key === key);
    if (filho) return filho;
  }
  return undefined;
}

/** A mãe de uma subcategoria ("pedras-grandes" → Pedras decorativas). */
export function parentCategory(key: string): ProductCategory | undefined {
  return PRODUCT_CATEGORIES.find((c) => c.children?.some((f) => f.key === key));
}

/**
 * Coleções + a linha virtual "Pedras decorativas" (capa e contagem das 3 de
 * pedra), pra busca achar a linha combinada — é por ela que se navega.
 * Chame dentro de useMemo: a busca guarda o índice pela identidade do objeto.
 */
export function withPedrasVirtual(collections: CatalogCollection[]): CatalogCollection[] {
  const pedras = collections.filter((c) => PEDRAS_HANDLES.includes(c.handle));
  if (!pedras.length || collections.some((c) => c.handle === PEDRAS_VIRTUAL_HANDLE)) {
    return collections;
  }
  const capa = collections.find((c) => c.handle === PEDRAS_VIRTUAL.coverFrom);
  return [
    {
      id: `virtual:${PEDRAS_VIRTUAL_HANDLE}`,
      handle: PEDRAS_VIRTUAL_HANDLE,
      title: PEDRAS_VIRTUAL.title,
      description: PEDRAS_VIRTUAL.description,
      image: capa?.image ?? null,
      productsCount: pedras.reduce((s, c) => s + (c.productsCount ?? 0), 0),
    },
    ...collections,
  ];
}
