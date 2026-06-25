// WooCommerce Store API checkout client (browser-side, multi-item).
//
// Strategy: chamadas diretas ao Store API do Woo a partir do navegador, com
// `credentials: "include"`. Os cookies de sessão setados em westernstore.com.br
// passam a ser first-party quando o usuário é redirecionado para /checkout/,
// carregando a sessão sem precisar transferir nada server-side.
//
// Fluxo:
//   1. GET /cart  → captura Nonce + Cart-Token (necessários no add-item).
//   2. POST /cart/add-item para cada linha, reusando Nonce + Cart-Token, e
//      refresca Nonce a partir de cada resposta (rotaciona em alguns hosts).
//   3. Redireciona para {WOO}/checkout/. Os cookies (e/ou Cart-Token via
//      cookie wc_cart_hash) carregam a sessão.
//
// Por que não edge function: o connector gateway é v3-only (REST admin), e a
// Store API é namespace separado e público. Server-side teria o problema de
// não poder setar cookies no domínio do Woo a partir do nosso servidor — só
// o próprio Woo pode. Browser-side resolve isso naturalmente.
//
// Por que não add-to-cart por query string: quebra com múltiplas linhas, não
// suporta variações/bundles corretamente. Decisão explícita do produto.

import { WOO_STORE_ORIGIN } from "@/lib/catalog/config";
import type { CartItem } from "@/stores/cartStore";

const STORE_API_BASE = `${WOO_STORE_ORIGIN}/wp-json/wc/store/v1`;

export interface CheckoutLineResult {
  variantId: string;
  productTitle: string;
  ok: boolean;
  error?: string;
}

export interface CheckoutResult {
  checkoutUrl: string;
  results: CheckoutLineResult[];
  skipped: CheckoutLineResult[];
}

interface SessionHeaders {
  nonce: string | null;
  cartToken: string | null;
}

async function fetchInitialSession(): Promise<SessionHeaders> {
  const res = await fetch(`${STORE_API_BASE}/cart`, {
    method: "GET",
    credentials: "include",
    headers: { Accept: "application/json" },
  });
  return {
    nonce: res.headers.get("Nonce"),
    cartToken: res.headers.get("Cart-Token"),
  };
}

function buildAddItemPayload(item: CartItem): Record<string, unknown> {
  const id = item.wooParentProductId;
  if (!id) {
    throw new Error(`Item ${item.productTitle} sem wooParentProductId`);
  }
  const payload: Record<string, unknown> = {
    id,
    quantity: item.quantity,
  };
  // Variable product → precisa de variation[]
  if (item.wooKind === "variation" && item.wooAttributes && item.wooAttributes.length > 0) {
    payload.variation = item.wooAttributes.map((a) => ({
      attribute: a.slug,
      value: a.value,
    }));
  }
  return payload;
}

async function addOneItem(
  item: CartItem,
  session: SessionHeaders,
): Promise<{ ok: boolean; error?: string; session: SessionHeaders }> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  if (session.nonce) headers["Nonce"] = session.nonce;
  if (session.cartToken) headers["Cart-Token"] = session.cartToken;

  let payload: Record<string, unknown>;
  try {
    payload = buildAddItemPayload(item);
  } catch (e) {
    return { ok: false, error: (e as Error).message, session };
  }

  const res = await fetch(`${STORE_API_BASE}/cart/add-item`, {
    method: "POST",
    credentials: "include",
    headers,
    body: JSON.stringify(payload),
  });

  // Refresca Nonce + Cart-Token a partir da resposta (rotacionam em alguns hosts).
  const next: SessionHeaders = {
    nonce: res.headers.get("Nonce") ?? session.nonce,
    cartToken: res.headers.get("Cart-Token") ?? session.cartToken,
  };

  if (!res.ok) {
    let error = `HTTP ${res.status}`;
    try {
      const body = await res.json();
      if (body?.message) error = body.message;
    } catch {
      /* ignore parse errors */
    }
    return { ok: false, error, session: next };
  }

  return { ok: true, session: next };
}

/**
 * Monta o carrinho Woo via Store API e devolve a URL final de checkout.
 *
 * Não lança em falha parcial: linhas que falharem entram em `skipped` com o
 * motivo retornado pelo Woo. O front decide o que mostrar ao usuário.
 */
export async function buildWooCheckoutSession(items: CartItem[]): Promise<CheckoutResult> {
  const checkoutUrl = `${WOO_STORE_ORIGIN}/checkout/`;
  if (items.length === 0) {
    return { checkoutUrl, results: [], skipped: [] };
  }

  let session = await fetchInitialSession();
  const results: CheckoutLineResult[] = [];

  for (const item of items) {
    // eslint-disable-next-line no-await-in-loop
    const r = await addOneItem(item, session);
    session = r.session;
    results.push({
      variantId: item.variantId,
      productTitle: item.productTitle,
      ok: r.ok,
      error: r.error,
    });
  }

  return {
    checkoutUrl,
    results,
    skipped: results.filter((r) => !r.ok),
  };
}
