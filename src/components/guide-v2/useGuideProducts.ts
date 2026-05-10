import { useEffect, useState } from "react";
import { fetchProductsByHandles } from "@/lib/shopify/queries";
import { cdnImg } from "@/lib/shopify/client";
import type { ShopifyProductNode } from "@/lib/shopify/types";
import type { Nivel } from "@/data/guideMap";
import type { TipoVisual, ProjetoPeca } from "./types";
import type { AutoralItem } from "./autoraisCatalog";
import { PECAS_BASE } from "./pecasBase";
import { getAutoralHandlesFor } from "./autoraisCatalog";

// Cache simples em memória — handles → produto Shopify
const cache = new Map<string, ShopifyProductNode>();

async function getProducts(handles: string[]): Promise<Map<string, ShopifyProductNode>> {
  const missing = handles.filter((h) => !cache.has(h));
  if (missing.length > 0) {
    const fetched = await fetchProductsByHandles(missing);
    fetched.forEach((p) => cache.set(p.handle, p));
  }
  const out = new Map<string, ShopifyProductNode>();
  handles.forEach((h) => {
    const p = cache.get(h);
    if (p) out.set(h, p);
  });
  return out;
}

// Extrai peso e dimensões do descriptionHtml (heurística leve).
function extractMeta(p: ShopifyProductNode): { pesoKg: number; dim: string } {
  const html = p.descriptionHtml ?? p.description ?? "";
  const txt = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
  const peso = txt.match(/(\d+(?:[.,]\d+)?)\s*kg/i);
  const dim = txt.match(/(\d{1,3}\s*[×x]\s*\d{1,3}\s*[×x]\s*\d{1,3}\s*cm)/i);
  return {
    pesoKg: peso ? parseFloat(peso[1].replace(",", ".")) : 0,
    dim: dim ? dim[1].replace(/\s+/g, " ") : "—",
  };
}

function shopifyToPeca(p: ShopifyProductNode, qty: number, key: string): ProjetoPeca {
  const meta = extractMeta(p);
  const variant = p.variants.edges[0]?.node;
  const preco = variant ? parseFloat(variant.price.amount) : parseFloat(p.priceRange.minVariantPrice.amount);
  return {
    id: `${p.handle}-${key}`,
    nome: p.title,
    codigo: variant?.sku ?? p.handle.toUpperCase().slice(0, 8),
    pesoKg: meta.pesoKg,
    dim: meta.dim,
    preco: Number.isFinite(preco) ? preco : 0,
    qty,
    imageUrl: p.images.edges[0]?.node?.url ? cdnImg(p.images.edges[0].node.url, 240) : undefined,
  } as ProjetoPeca & { imageUrl?: string };
}

function shopifyToAutoral(p: ShopifyProductNode): AutoralItem {
  const meta = extractMeta(p);
  const variant = p.variants.edges[0]?.node;
  const preco = variant ? parseFloat(variant.price.amount) : parseFloat(p.priceRange.minVariantPrice.amount);
  return {
    id: p.handle,
    handle: p.handle,
    nome: p.title,
    codigo: variant?.sku ?? p.handle.toUpperCase().slice(0, 8),
    pesoKg: meta.pesoKg,
    preco: Number.isFinite(preco) ? preco : 0,
    descricao: p.description ?? "",
    dim: meta.dim,
    imageUrl: p.images.edges[0]?.node?.url ? cdnImg(p.images.edges[0].node.url, 800) : undefined,
  };
}

export function useGuideProducts(nivel: Nivel, tipoVisual: TipoVisual) {
  const [pecas, setPecas] = useState<ProjetoPeca[]>([]);
  const [autorais, setAutorais] = useState<AutoralItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    const pecaEntries = PECAS_BASE[nivel];
    const autoralHandles = getAutoralHandlesFor(tipoVisual);
    const allHandles = Array.from(
      new Set([...pecaEntries.map(([h]) => h), ...autoralHandles])
    );

    getProducts(allHandles)
      .then((map) => {
        if (cancelled) return;
        const nextPecas: ProjetoPeca[] = pecaEntries
          .map(([h, qty], i) => {
            const p = map.get(h);
            return p ? shopifyToPeca(p, qty, String(i)) : null;
          })
          .filter((x): x is ProjetoPeca => !!x);
        const nextAutorais: AutoralItem[] = autoralHandles
          .map((h) => map.get(h))
          .filter((p): p is ShopifyProductNode => !!p)
          .map(shopifyToAutoral);
        setPecas(nextPecas);
        setAutorais(nextAutorais);
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.error("[useGuideProducts] fetch error", err);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => { cancelled = true; };
  }, [nivel, tipoVisual]);

  return { pecas, autorais, isLoading };
}
