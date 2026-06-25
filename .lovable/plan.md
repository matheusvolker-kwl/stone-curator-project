## Fase 2 — Remover Shopify do projeto

Hoje o Woo já é a fonte padrão, mas `src/lib/shopify/` ainda existe e ~40 arquivos importam dele (direta ou indiretamente via `src/lib/catalog/` que só re-exporta). Esta fase quebra essa dependência de verdade, apaga o código morto e limpa segredos/conexão.

### Escopo

1. **Mover utilitários neutros para `@/lib/catalog/`** (donos reais, sem re-export):
   - `client.ts` → quebrar em `catalog/format.ts` (formatBRL) e `catalog/image.ts` (cdnImg, cdnSrcSet). Descartar `storefrontApiRequest`, `SHOPIFY_*` constantes e o uso do CDN do Shopify (cdnImg passa a ser passthrough — imagens do Woo já vêm com URL absoluta).
   - `parseDescription.ts` → `catalog/parseDescription.ts` (conteúdo real, não re-export).
   - `sizeWeight.ts` → `catalog/sizeWeight.ts` (conteúdo real).
   - `types.ts` → `catalog/types.ts`. Renomear símbolos: `ShopifyProduct`/`ShopifyProductNode`/`ShopifyCollection`/`ShopifyMoney`/`ShopifyVariant` → `CatalogProduct`/`CatalogProductNode`/`CatalogCollection`/`CatalogMoney`/`CatalogVariant`. Manter aliases `export type ShopifyX = CatalogX` por 1 ciclo se necessário, mas o objetivo é **trocar os usos**.

2. **Trocar imports nos ~40 arquivos** (`@/lib/shopify/*` → `@/lib/catalog/*`), incluindo o adapter Woo (`src/lib/woocommerce/adapter.ts`, `queries.ts`) que ainda importa tipos de `@/lib/shopify/types`.

3. **Apagar `src/data/guideMap.ts:7`** (uso de `SHOPIFY_STORE_PERMANENT_DOMAIN`) — substituir por constante local ou remover se não usado de fato (verificar onde aparece).

4. **Apagar arquivos órfãos**:
   - `src/lib/shopify/` inteiro.
   - `src/pages/__WooDebug.tsx` (debug temporário da etapa 4).
   - Rota correspondente em `src/App.tsx` se existir.

5. **Simplificar datasource**:
   - `src/lib/datasource/index.ts`: remover branch shopify e o flag `VITE_DATA_SOURCE`. Passa a ser `export * from "@/lib/woocommerce/queries"`.

6. **Limpar segredos e conexão Shopify**:
   - `fetch_secrets` → identificar `SHOPIFY_*` / `VITE_SHOPIFY_*` órfãos e remover via `delete_secret` (os que forem gerenciados pelo conector Shopify saem com o disconnect).
   - `shopify--disconnect_store` para soltar a conexão da loja.
   - Limpar `.env.example` de variáveis `VITE_SHOPIFY_*`.

7. **Validação**:
   - `bunx tsgo --noEmit` verde.
   - Smoke rápido no preview: Home, /linhas, uma PDP avulsa, uma PDP bundle, /conjuntos, abrir carrinho.

### Fora de escopo

- Mexer no checkout (já está na Store API do Woo).
- Apagar a edge function `yampi-*` (já retornam 410, ficam como tombstone).
- Renomear `Shopify*` em comentários/strings que não sejam código de tipo.

### Detalhes técnicos

- `cdnImg(url, w?)`/`cdnSrcSet`: hoje injetam `?width=…` no CDN do Shopify. Para Woo, retornar a URL original (sem transformação) — quem precisa de tamanhos pode usar `srcset` nativo do Woo no futuro. Sem regressão visual: o Woo já entrega imagens em resolução adequada.
- Aliases de tipo (`ShopifyProduct = CatalogProduct`) só se a substituição surfacial gerar muito ruído em PR; meta é zero referência a "Shopify" em código TS ao fim da fase.
- Rollback: a fase é destrutiva. Reverter = restaurar `src/lib/shopify/` e reinstalar a flag de datasource. Apontar isso ao usuário antes do disconnect.

### Entregáveis

- 0 imports de `@/lib/shopify` em `src/`.
- Diretório `src/lib/shopify/` removido.
- `datasource/index.ts` reduzido a um re-export.
- Conexão Shopify desconectada e segredos `VITE_SHOPIFY_*` removidos.
- Build TS verde + smoke OK.
