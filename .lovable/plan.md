# Migração Shopify → WooCommerce (2 fases)

Plano revisado com as travas pedidas: checkout via Store API server-side, faseamento com validação real antes de qualquer deleção, e tipos `Catalog*` como aliases p/ preservar rollback.

---

## FASE 1 — Refactor + checkout funcional (esta entrega)

Nada é deletado nesta fase. Shopify, flag de datasource e segredos permanecem.

### 1.1 Descobrir a URL pública do Woo

Chamar `standard_connectors--get_connection_configuration` na conexão WooCommerce p/ ler o `store_url` real. **Se não vier explícito, paro e pergunto** — não chuto fallback. URL vira `VITE_WOO_STORE_URL` no `.env` + export em `@/lib/catalog/config.ts`.

### 1.2 Pasta `@/lib/catalog/` (aliases, não substituição)

Para preservar rollback enquanto `@/lib/shopify/` existe:

- `catalog/types.ts` — `export type CatalogProduct = ShopifyProduct` (alias dos tipos existentes). Quando deletarmos a Shopify na Fase 2, viramos: a definição real migra pra `catalog/types.ts` e os `Shopify*` somem.
- `catalog/format.ts` — `formatBRL` (cópia).
- `catalog/image.ts` — `cdnImg`/`cdnSrcSet` passthrough p/ URLs Woo (sem `?width=` da Shopify CDN).
- `catalog/parseDescription.ts`, `catalog/sizeWeight.ts` — cópias (HTML parsing genérico).
- `catalog/config.ts` — `WOO_STORE_URL`.

### 1.3 Adapter Woo enriquecido

`src/lib/woocommerce/adapter.ts` + `bundles.ts` passam a anexar metadados Woo na variante (campos novos no `ShopifyVariantNode` ou via mapa paralelo no adapter — preferência: estender o tipo interno do Woo, não vazar pra Catalog/Shopify):

- `wooParentProductId: number` — id numérico do produto pai
- `wooVariationId: number | null` — id numérico da variação (null em simples/bundle)
- `wooKind: "simple" | "variation" | "bundle"`
- `wooAttributes: Array<{ slug: string; value: string }>` — ex.: `{ slug: "pa_acabamento", value: "quartzo" }`, lowercase

Hoje o adapter já tem o nome do atributo e o valor — só faltava normalizar p/ slug e preservar separado dos `selectedOptions` de exibição.

### 1.4 Swap mecânico (31 arquivos)

| antes | depois |
|---|---|
| `@/lib/shopify/client` (formatBRL) | `@/lib/catalog/format` |
| `@/lib/shopify/client` (cdnImg/cdnSrcSet) | `@/lib/catalog/image` |
| `@/lib/shopify/client` (SHOPIFY_STORE_PERMANENT_DOMAIN) | `@/lib/catalog/config` (WOO_STORE_URL) |
| `@/lib/shopify/types` | `@/lib/catalog/types` |
| `@/lib/shopify/parseDescription` | `@/lib/catalog/parseDescription` |
| `@/lib/shopify/sizeWeight` | `@/lib/catalog/sizeWeight` |
| `@/lib/shopify/queries` | `@/lib/datasource` (sem mudança) |

Renomes: `ShopifyProduct→CatalogProduct`, `ShopifyProductNode→CatalogProductNode`, `ShopifyMoney→CatalogMoney`, `ShopifyCollection→CatalogCollection`. Aliases no `catalog/types.ts` mantêm tudo type-compatible — `bunx tsgo --noEmit` precisa ficar verde.

### 1.5 Endpoint `cart-session` na edge function `woo-proxy`

Novo handler (`POST /cart-session`) que:

1. Recebe `{ lines: [{ wooParentProductId, wooVariationId, wooAttributes, quantity }, ...] }` validado com zod.
2. Faz **uma única** chamada inicial `POST {WOO}/wp-json/wc/store/v1/cart/add-item` p/ a primeira linha — captura o header `Cart-Token` retornado pelo Woo.
3. Reusa esse `Cart-Token` (header `Cart-Token: <token>`) p/ adicionar o restante das linhas sequencialmente. Para variação: passa `id: parent`, `quantity`, e `variation: [{ attribute: "pa_acabamento", value: "quartzo" }]`. Para bundle: `id: bundleId`, `quantity` (Woo Product Bundles aceita via Store API).
4. (Opcional, best-effort) `POST /cart/update-customer` com billing pré-preenchido do `partner_profiles` se houver `Authorization` do parceiro logado. Se a Store API recusar (algumas instalações exigem nonce de sessão WP separado), deixa TODO e segue.
5. Retorna `{ checkoutUrl: "{WOO}/checkout/?cart-token=<token>", lineResults: [...], skipped: [...] }`.

Erros: cada linha que falhar entra em `skipped` com motivo; o endpoint **não** aborta tudo numa falha parcial — front decide.

### 1.6 cartStore reescrito

- Estado 100% local (Zustand + persist). Sai `cartId`, `checkoutUrl` persistido, `lineId`, `isSyncing`, `syncCart`, todos os imports do `storefrontApiRequest`.
- `CartItem` ganha `wooParentProductId`, `wooVariationId`, `wooAttributes`, `wooKind` — vindos do `buildCartItem` que agora lê do adapter enriquecido.
- `addItem`/`updateQuantity`/`removeItem`/`addBundle` mexem só no array (instantâneo, sem rede). `useCartSync` vira no-op.
- `getCheckoutUrl()` vira **async**: chama `supabase.functions.invoke("woo-proxy", { body: { path: "cart-session", lines } })` e retorna a URL final.

### 1.7 CartDrawer

`handleCheckout` async com `isLoading`. Mostra toast se `skipped.length > 0` listando o que ficou de fora. Mantém gating B2B.

### 1.8 Validação obrigatória antes de fechar a fase

`bunx tsgo --noEmit` verde + smoke test no preview:

- Carrinho com **3 linhas reais**: 2 avulsos com acabamentos diferentes + 1 bundle.
- Clicar "Finalizar compra" → endpoint monta sessão Woo → redirect.
- **Reportar**: URL pública Woo, status do POST Store API por linha, conteúdo final do cart (itens/qtd/preços vindos do Woo), URL final de checkout, e se o checkout Woo **aceita convidado** ou exige login. Listar qualquer linha em `skipped`.

---

## FASE 2 — Cleanup (só após você validar a Fase 1)

Bloqueada até o report da 1.8 passar. Quando liberar:

1. Deletar `src/lib/shopify/` inteiro.
2. Inverter os aliases em `catalog/types.ts` — a definição real vive lá, sem referência a `Shopify*`.
3. Remover `src/lib/datasource/` (vira re-export trivial ou some) e a flag `VITE_DATA_SOURCE`.
4. Deletar `src/pages/__WooDebug.tsx`.
5. Listar segredos Shopify órfãos (`SHOPIFY_ACCESS_TOKEN`, `SHOPIFY_STOREFRONT_ACCESS_TOKEN`, `SHOPIFY_ONLINE_ACCESS_TOKEN:*`) e te avisar pra apagar via Settings — não removo automaticamente.
6. Publicar.

---

## Riscos conhecidos / decisões pendentes

- **URL pública do Woo**: vou tentar via `get_connection_configuration`. Se não vier, paro e pergunto.
- **Checkout Woo aceita convidado?**: descobrirei no smoke da 1.8. Se exigir login, é decisão sua de UX (parceiro está logado na vitrine, não no Woo) — vou só reportar, não decidir.
- **Pré-preenchimento de billing**: best-effort na Store API. Se falhar, vira TODO da Fase 2.
- **Erros transientes S3 do turno anterior**: irrelevante, é falha de upload do preview, não código.

## O que NÃO muda

PriceGate B2B, auth, RLS, partner_profiles, leads, orders, PDFs, /conjuntos estático, capas das linhas, parceiros, woo-proxy existente (cache/retry/dedupe).
