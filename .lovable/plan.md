## Objetivo

Remover a Yampi do fluxo de "Finalizar compra" e redirecionar direto para o checkout nativo do Shopify (que já tem Appmax como gateway). O carrinho já usa `cartCreate` da Storefront API e armazena `checkoutUrl` — basta consumir esse URL.

## Confirmações técnicas

- **Token da Storefront API**: o token público já em uso (`VITE_SHOPIFY_STOREFRONT_TOKEN`) é o que executa `cartCreate` hoje no `cartStore` — ou seja, já tem o escopo `unauthenticated_write_checkouts`. Nenhum token novo precisa ser criado.
- **Variant IDs**: os itens do carrinho guardam `variantId` no formato `gid://shopify/ProductVariant/...` (vêm direto da Storefront API via `buildCartItem`). Compatíveis com `merchandiseId` — nada a converter.
- **`checkoutUrl`**: já é persistido no `useCartStore` (`state.checkoutUrl`) e já passa por `formatCheckoutUrl` (adiciona `channel=online_store`).

## Mudanças

### 1. `src/components/layout/CartDrawer.tsx` — `handleCheckout`

Substituir toda a lógica Yampi por:

```ts
const handleCheckout = async () => {
  if (checkoutLoading) return;
  setCheckoutLoading(true);

  // Fire-and-forget: registra lead antes do redirect (mantém)
  void (async () => { /* registerPedidoNovoLead, igual hoje */ })();

  try {
    // Garante cart sincronizado com Shopify e pega URL
    await syncCart();
    let checkoutUrl = useCartStore.getState().checkoutUrl;

    // Fallback: se por algum motivo não houver checkoutUrl, recria o cart
    if (!checkoutUrl) {
      // força recriação tentando re-adicionar primeiro item — ou exibe erro
      toast.error("Não foi possível abrir o checkout", {
        description: "Atualize a página e tente novamente, ou fale conosco no WhatsApp.",
      });
      return;
    }

    onOpenChange(false);
    window.location.href = checkoutUrl; // MESMA ABA — não usar window.open
  } catch (e) {
    console.error(e);
    toast.error("Instabilidade no checkout", {
      description: "Tente novamente ou fale conosco no WhatsApp.",
    });
  } finally {
    setCheckoutLoading(false);
  }
};
```

- Remove import `criarCheckout` de `@/lib/yampi/client`.
- Remove validação "itens sem SKU" (Yampi-only — Shopify usa variantId).
- Mantém validação de pedido mínimo via `meetsMinimum` (já desabilita o botão).
- Mantém `registerPedidoNovoLead`.

### 2. Desativar edge functions Yampi (mantém código como backup)

Adicionar no topo dos handlers `Deno.serve`, antes de qualquer lógica:

- `supabase/functions/yampi-criar-checkout/index.ts`
- `supabase/functions/yampi-calc-frete/index.ts`

```ts
// DESATIVADA em 2026-06-16 — checkout migrado para Shopify nativo.
// Mantida por 1 semana como backup. Após 2026-06-23, remover.
return json(410, { erro: "desativada", motivo: "checkout_migrado_shopify" });
```

Não deletar arquivos.

### 3. Limpeza leve em `src/lib/yampi/client.ts`

Manter o arquivo (backup), mas adicionar comentário no topo:
```ts
// DEPRECATED 2026-06-16: checkout migrado para Shopify nativo. Não usar.
```

## Fora de escopo (NÃO MEXER)

- Layout do `CartDrawer` (header, lista, subtotal, bloco de Frete com ícone de caminhão, selo de pagamento, CTAs)
- Componente WhatsApp para peças >100kg
- Visual do botão "Finalizar compra"
- Páginas de produto, catálogo, demais componentes
- `cartStore.ts` (já está correto)
- `config/business.ts`, `shopify/client.ts`

## Validação pós-implementação

1. Adicionar item → abrir drawer → clicar "Finalizar compra" → deve redirecionar para `*.myshopify.com/checkouts/...` na mesma aba.
2. Console sem erros de `userErrors` da Storefront API.
3. Edge function `yampi-criar-checkout` retorna 410 se chamada (não é mais chamada pelo front).
