import { supabase } from "@/integrations/supabase/client";
import type { CartItem } from "@/stores/cartStore";
import { computeItemsHash } from "@/lib/leads/itemsHash";
import { reportError } from "@/lib/telemetry";

interface RegisterPedidoNovoArgs {
  items: CartItem[];
  subtotal: number;
  currency: string;
  contact: {
    nome?: string | null;
    email?: string | null;
    telefone?: string | null;
    empresa?: string | null;
    cidade?: string | null;
  };
  origem: string;
  userId?: string | null;
  payloadExtra?: Record<string, unknown>;
}

/**
 * Registra lead de venda direta (carrinho/guia → checkout).
 * Idempotente por 5 min para não duplicar em duplo clique.
 * Falha silenciosamente — nunca bloqueia o checkout do cliente.
 */
export async function registerPedidoNovoLead(args: RegisterPedidoNovoArgs): Promise<void> {
  const { items, subtotal, currency, contact, origem, userId, payloadExtra } = args;
  if (items.length === 0) return;
  if (!contact.email && !contact.telefone) return;

  try {
    const itemsHash = await computeItemsHash(items);
    const { error } = await supabase.rpc("register_pedido_novo_lead", {
      _items_hash: itemsHash,
      _nome: contact.nome ?? null,
      _email: contact.email ?? null,
      _telefone: contact.telefone ?? null,
      _empresa: contact.empresa ?? null,
      _cidade: contact.cidade ?? null,
      _mensagem: null,
      _origem: origem,
      _payload: {
        items: items.map((i) => ({
          handle: i.productHandle,
          title: i.productTitle,
          variantId: i.variantId,
          variantTitle: i.variantTitle,
          quantity: i.quantity,
          unitPrice: parseFloat(i.price.amount),
        })),
        subtotal,
        currency,
        clicked_at: new Date().toISOString(),
        extra: payloadExtra ?? null,
      } as never,
    });
    if (error) {
      void reportError({
        source: "registerPedidoNovoLead.rpc",
        message: "Falha ao registrar pedido_novo",
        error,
        context: { origem, userId, itemsCount: items.length, subtotal },
      });
    }
  } catch (e) {
    void reportError({
      source: "registerPedidoNovoLead.exception",
      message: "Exceção ao registrar pedido_novo",
      error: e,
      context: { origem, userId, itemsCount: items.length, subtotal },
    });
  }
}
