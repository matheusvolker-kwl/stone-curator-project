## A) Garantia: 5 → 1 ano (P0)

Trocar `garantiaAnos: 5` → `1` em `src/config/business.ts` e atualizar todas as cópias hard-coded com "5 anos":

- `src/config/business.ts` — `garantiaAnos: 1`
- `src/pages/ProductPage.tsx` — corrigir comentário (linha 166): "filtra garantia legacy do Woo; usamos `BUSINESS.garantiaAnos` (1 ano)"; trocar `${...} anos` → `${...} ano` (singular quando = 1, via `BUSINESS.garantiaAnos === 1 ? "ano" : "anos"`)
- `src/components/product/DeliverySignals.tsx` — mesmo tratamento singular/plural
- `src/components/product/PurchaseProof.tsx` — "5 anos" → usar `BUSINESS.garantiaAnos` com sufixo correto
- `src/pages/legal/TrocasAvarias.tsx` — "5 anos contra defeitos" → "1 ano contra defeitos" (texto fixo)
- `src/pages/PorQueWestern.tsx` — duas ocorrências ("Garantia formal de 5 anos…", "5 anos formais contra defeito…") → "1 ano"
- `src/pages/FAQ.tsx` — já usa `BUSINESS.garantiaAnos`; só aplicar plural correto
- `src/pages/Index.tsx` — já usa `BUSINESS.garantiaAnos`; plural correto
- `src/lib/pdf/orcamentoPdf.ts` e `src/lib/pdf/propostaPdf.ts` — `${BUSINESS.garantiaAnos} anos` → forma com singular condicional

## B) Performance: parar de buscar variações em listagens (P0)

Em `src/lib/woocommerce/queries.ts`:

1. Criar `buildListingCatalog()` que adapta o catálogo SEM chamar `getVariationsFor`:
   - `adaptProduct(p)` sem variações (já gera synthetic variant a partir do preço resolvido)
   - `adaptAcabamentoGroup` já não precisa de variações
   - Memoizado em paralelo a `catalogPromise` (TTL 60 s)
2. Trocar consumidores de listagem para a versão sem variações:
   - `fetchCollections` — já usa só categorias, mantém
   - `fetchCollection` → usar `buildListingCatalog()`
   - `fetchProducts` → usar `buildListingCatalog()`
   - `fetchProductsByHandles` → usar `buildListingCatalog()`
3. `fetchProduct(handle)` (caminho PDP):
   - Achar o nó na listagem cacheada para descobrir se é simple, variável ou bundle group
   - Se for variável: localizar o `WooProduct` cru correspondente e buscar `/products/{id}/variations` APENAS desse — chamar `adaptProduct(p, variations)` para mesclar `variant.image`
   - Se for bundle group ou simple: retornar o nó já adaptado da listagem
4. Renomear `buildAdaptedCatalog` (ou manter como wrapper) para deixar claro o uso PDP vs listagem.

Resultado esperado: navegação de listagens = 1 request (cacheada). PDP variável = +1 request.

## C) Galeria troca ao mudar acabamento (P1)

A imagem da variação não está em `images.edges` do pai → `findIndex` da linha 94 de `ProductPage.tsx` nunca acha. Correção mínima e segura:

- Em `src/lib/woocommerce/adapter.ts`, dentro de `adaptProduct`, quando `variations` for fornecido: construir `images.edges` mesclando as `p.images` + `variations[].image`, deduplicando por `url`. Isso preserva o comportamento atual do `findIndex` e a galeria troca ao selecionar Quartzo/Arenito/Moledo/Granito.
- Para os grupos de bundle (`adaptAcabamentoGroup`): cada `member.product.images[0]` já é a foto da variação canônica do acabamento; mesclar também essas no `images.edges` (dedup por URL) para que o `findIndex` resolva a foto da variante de bundle selecionada.
- Confirmar que `supabase/functions/woo-proxy/index.ts` não filtra o campo `image` das `/variations` (passthrough JSON cru — checar e ajustar se houver mapeamento custom).

Nenhuma mudança em `ProductGallery.tsx` é necessária — só dados.

## Validação

- `bunx tsgo --noEmit` (verde)
- Reporte item a item (arquivos tocados em A, B, C)
- Não publicar, não tocar checkout/cartStore
