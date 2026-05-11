import { storefrontApiRequest } from "./client";
import type { ShopifyCollection, ShopifyProduct, ShopifyProductNode } from "./types";

const PRODUCT_FIELDS = `
  id
  handle
  title
  description
  descriptionHtml
  vendor
  productType
  tags
  priceRange { minVariantPrice { amount currencyCode } }
  images(first: 50) { edges { node { url altText width height } } }
  variants(first: 20) {
    edges {
      node {
        id
        title
        sku
        availableForSale
        price { amount currencyCode }
        selectedOptions { name value }
        image { url altText }
      }
    }
  }
  options { name values }
  modelo3d: metafield(namespace: "custom", key: "modelo_3d_url") { key value namespace }
`;

const COLLECTIONS_QUERY = `
  query Collections($first: Int!) {
    collections(first: $first) {
      edges {
        node {
          id
          handle
          title
          description
          image { url altText }
        }
      }
    }
  }
`;

const COLLECTION_BY_HANDLE_QUERY = `
  query CollectionByHandle($handle: String!, $first: Int!) {
    collection(handle: $handle) {
      id
      handle
      title
      description
      image { url altText }
      products(first: $first) {
        edges {
          node {
            ${PRODUCT_FIELDS}
          }
        }
      }
    }
  }
`;

const PRODUCT_BY_HANDLE_QUERY = `
  query ProductByHandle($handle: String!) {
    product(handle: $handle) {
      ${PRODUCT_FIELDS}
      collections(first: 5) { edges { node { handle title } } }
    }
  }
`;

const PRODUCTS_QUERY = `
  query Products($first: Int!, $query: String) {
    products(first: $first, query: $query) {
      edges { node { ${PRODUCT_FIELDS} } }
    }
  }
`;

export async function fetchCollections(first = 20): Promise<ShopifyCollection[]> {
  const res = await storefrontApiRequest<{ collections: { edges: Array<{ node: ShopifyCollection }> } }>(
    COLLECTIONS_QUERY,
    { first }
  );
  return res?.data?.collections?.edges.map((e) => e.node) ?? [];
}

export async function fetchCollection(handle: string, first = 50) {
  const res = await storefrontApiRequest<{
    collection: (ShopifyCollection & { products: { edges: ShopifyProduct[] } }) | null;
  }>(COLLECTION_BY_HANDLE_QUERY, { handle, first });
  return res?.data?.collection ?? null;
}

export async function fetchProduct(handle: string): Promise<ShopifyProductNode | null> {
  const res = await storefrontApiRequest<{ product: ShopifyProductNode | null }>(
    PRODUCT_BY_HANDLE_QUERY,
    { handle }
  );
  return res?.data?.product ?? null;
}

export async function fetchProducts(first = 50, query?: string): Promise<ShopifyProduct[]> {
  const res = await storefrontApiRequest<{ products: { edges: ShopifyProduct[] } }>(
    PRODUCTS_QUERY,
    { first, query: query ?? null }
  );
  return res?.data?.products?.edges ?? [];
}

export async function fetchProductsByHandles(handles: string[]): Promise<ShopifyProductNode[]> {
  if (handles.length === 0) return [];
  const results = await Promise.all(handles.map((h) => fetchProduct(h)));
  return results.filter((p): p is ShopifyProductNode => !!p);
}

// Coleções sazonais: filtramos client-side por tag/handle.
// Heurística: collection com tag "sazonal" OU handle começando com "colecao-".
export function isSeasonal(c: { handle: string; description?: string }) {
  return (
    c.handle.startsWith("colecao-") ||
    /sazonal|temporada|edicao|edição/i.test(c.description ?? "")
  );
}
