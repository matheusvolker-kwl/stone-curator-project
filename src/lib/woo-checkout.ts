// WooCommerce checkout hand-off (top-level navigation, first-party).
//
// Por que navegação top-level (form.submit) e não fetch:
//   o checkout do Woo depende de cookie de sessão setado em westernstore.com.br.
//   Em fetch cross-origin com credentials:include o navegador trata como
//   third-party cookie e bloqueia silenciosamente (Safari/Brave por padrão,
//   Chrome em modo restrito). Submetendo um <form> a navegação se torna
//   first-party no domínio do Woo, o cookie é aceito e a sessão sobrevive.
//
// Endpoint no Woo (já existe — mu-plugin western-checkout-handoff):
//   POST https://westernstore.com.br/?western-checkout-handoff=1
//   campo "lines" (JSON string): [{ product_id, variation_id, attributes, quantity, kind }]
//   campo "token" (opcional): segredo compartilhado.

import { WOO_STORE_ORIGIN } from "@/lib/catalog/config";
import type { CartItem } from "@/stores/cartStore";

interface HandoffLine {
  product_id: number;
  variation_id: number | null;
  attributes: Array<{ slug: string; value: string }>;
  quantity: number;
  kind: "simple" | "variation" | "bundle";
  conjunto?: string;
}

function toLine(item: CartItem): HandoffLine | null {
  if (!item.wooParentProductId || !item.wooKind) return null;
  const line: HandoffLine = {
    product_id: item.wooParentProductId,
    variation_id: item.wooVariationId ?? null,
    attributes: item.wooAttributes ?? [],
    quantity: item.quantity,
    kind: item.wooKind,
  };
  if (item.conjuntoRef) line.conjunto = item.conjuntoRef;
  return line;
}

/**
 * Ticket opaco emitido pela edge function `checkout-ticket-create` para
 * parceiros aprovados. É apenas uma string (>=32 bytes de entropia, base64url).
 * Nenhum dado sensível trafega pelo browser — só o ticket. O mu-plugin do Woo
 * troca o ticket pelo payload de billing chamando `checkout-ticket-redeem`
 * com o segredo compartilhado (server-to-server).
 */
export type CheckoutTicket = string;

/**
 * Submete o carrinho ao endpoint de hand-off do Woo via navegação top-level.
 * Cria um <form> POST e dispara form.submit() — o navegador sai do app e
 * passa a ser first-party no domínio westernstore.com.br.
 *
 * Se `ticket` for fornecido (parceiro logado + aprovado), inclui o campo
 * `identity_ticket` no POST. O mu-plugin troca o ticket pelo payload PJ.
 */
export function submitCheckoutHandoff(
  items: CartItem[],
  ticket?: CheckoutTicket | null,
): { submitted: number; skipped: number } {
  if (!items || items.length === 0) return { submitted: 0, skipped: 0 };

  const lines: HandoffLine[] = [];
  let skipped = 0;
  for (const item of items) {
    const line = toLine(item);
    if (line) lines.push(line);
    else skipped += 1;
  }
  if (lines.length === 0) return { submitted: 0, skipped };

  const form = document.createElement("form");
  form.method = "POST";
  form.action = `${WOO_STORE_ORIGIN}/?western-checkout-handoff=1`;
  form.style.display = "none";
  // sem target → top-level navigation no tab atual.

  appendHidden(form, "lines", JSON.stringify(lines));

  const token = import.meta.env.VITE_WESTERN_HANDOFF_SECRET as string | undefined;
  if (token && token.length > 0) appendHidden(form, "token", token);

  if (ticket && ticket.length >= 16) {
    appendHidden(form, "identity_ticket", ticket);
  }

  document.body.appendChild(form);
  form.submit();

  return { submitted: lines.length, skipped };
}

function appendHidden(form: HTMLFormElement, name: string, value: string) {
  const input = document.createElement("input");
  input.type = "hidden";
  input.name = name;
  input.value = value;
  form.appendChild(input);
}

