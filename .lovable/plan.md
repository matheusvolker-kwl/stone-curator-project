# Reestruturação do Guia de Composição

Alinhar o guia ao novo brief: 5 categorias, 45 conjuntos com nomes/handles/preços corretos, faixas de área específicas por categoria, terminologia padronizada e Shopify como fonte de verdade (preço e composição vêm do produto via Storefront API, com fallback do brief).

## 1. Reescrever `src/data/guideMap.ts`

Nova árvore com 5 tipos no topo (em vez dos 3 atuais com sub-variantes):

```text
piscina       → pequeno (≤12) / medio (12–32) / grande (32–60)
lago          → pequeno (2–4)  / medio (4–10)  / grande (10–20)
lago-hibrido  → pequeno (2–4)  / medio (4–10)  / grande (10–20)
jardim-seco   → pequeno (≤2)   / medio (2–4)   / grande (10–20)   (faixa 4–10 → cai em "grande")
jardim-fonte  → pequeno (≤2)   / medio (2–4)   / grande (10–20)   (idem)
```

Cada folha vira `{ handle, nome, precoFallback }` (sem `subtitulo` redundante). Substituir os 45 nós atuais pelos exatos do brief, **incluindo o handle quebrado `conjunto-piscina-caio-essencial`** para Caiobá.

Renomear `m2ToTamanhoId` para tratar as 5 categorias e o gap 4–10 m² em jardim (cai em "grande" conforme decisão).

Reposicionar `whatsappConsultor`, `resolveConjunto`, `precoEstimadoPorArea*` para a nova estrutura achatada. Manter API pública (mesmos nomes de funções), apenas trocar implementação.

Remover `nivelMeta.faixaPreco` e `pecasPorTipoNivel`/`pecasRangePorTipo` (passam a vir do Shopify) — manter apenas `nivelMeta.label/tagline/detalhe`.

## 2. Buscar preço e composição do Shopify (fonte de verdade)

Estender `src/lib/shopify/queries.ts` com `fetchConjuntoByHandle(handle)` que retorna `{ priceRange, descriptionHtml, variants, images }` — já existe `fetchProduct`, então é só padronizar o uso.

Criar hook `useConjuntoData(handle)` em `src/components/guide-v2/useGuideProducts.ts`:
- React-Query, `staleTime: 5min`
- Retorna `{ preco, composicao[], imagem, loading, error }`
- `preco` = `priceRange.minVariantPrice.amount` do Shopify; fallback = `precoFallback` do guideMap se a API falhar
- `composicao` = parsing leve do `descriptionHtml` (lista `<ul><li>`) via `src/lib/shopify/parseDescription.ts` (já existe)

`ComposicaoCard.tsx` e `Refinar.tsx` consomem esse hook em vez do preço hardcoded.

## 3. Etapa 01 — Tipo (5 cards)

`src/pages/guia/Contexto.tsx` e `src/components/guide-v2/types.ts`:
- `TipoVisual` passa a ter 5 valores: `piscina | lago | lago-hibrido | jardim-seco | jardim-fonte`
- Grid muda de `grid-cols-4` para `grid-cols-2 md:grid-cols-3 lg:grid-cols-5`
- Labels: "Piscina", "Lago", "Lago Híbrido", "Jardim Seco", "Jardim com Fonte"
- Microcopy em cada card explica praias / lagoas / lagoas com pedra natural / serras / cachoeiras
- `imagery.ts` ganha uma imagem para `lago-hibrido` (reusar a de lago temporariamente com aviso visual de "híbrido")

## 4. Etapa 02 — Faixas de área corretas

`AreaInput` e `areaRangePorTipo`:
- Snaps específicos por tipo: piscina `[12,32,60]`, lago/lago-hibrido `[4,10,20]`, jardim-* `[2,4,20]`
- Mensagem dinâmica abaixo do slider: "Sua área cai em **Pequeno (até 4 m²)** — vamos sugerir 3 caminhos."
- Em jardim com 5–9 m², mostrar aviso: "Vamos te mostrar o conjunto Grande, melhor para projetos a partir de 4 m²."

## 5. Etapa 03 — Resultados

`Composicoes.tsx`:
- Título dinâmico já existe — apenas trocar o copy para usar os nomes novos ("Para um lago híbrido de 6 m²…")
- `ComposicaoCard` mostra: nome do conjunto (ex.: "Caiobá"), nível ("Essencial"), preço **vindo do Shopify**, primeiras 3 peças da composição + "ver completa"
- Aviso fixo no topo quando `tipo === "lago-hibrido"`:
  > "Este conjunto fornece a estrutura principal em pedras Western. Você complementa a margem do lago com pedras naturais que já possua ou adquira localmente."
- Aviso discreto quando o conjunto resultante tem preço < R$ 700:
  > "Pedido mínimo da loja: R$ 700. Some este conjunto com itens autorais para atingir o mínimo."

## 6. Terminologia — varredura global no guia

`rg` em `src/components/guide-v2/`, `src/pages/guia/` e substituir:
- "cliente" → "parceiro"
- "kit" → "conjunto"
- "cor" / "cores" → "acabamento" / "acabamentos"
- "pisante" → "Pisada"
- "Equilibrada" → "Equilibrado" (label do nível — `nivelLabels.equilibrada` e `nivelLabelMap.equilibrada` em `types.ts`)
- Garantir uso de "composição" para lista de peças (já é o padrão)

## 7. Página Refinar — mantém ajuste local

`src/pages/guia/Refinar.tsx`: nenhuma mudança de fluxo. Apenas:
- Trocar a fonte da composição inicial: em vez de `pecasBase.ts`/`pecasPlaceholder.ts` hardcoded, ler do `useConjuntoData(handle)` e pré-popular `ProjetoSidebar`
- Manter `pecasPlaceholder.ts` como fallback se a API falhar
- Preço da linha do conjunto vem do Shopify

## Detalhes técnicos

- Sem migrations no backend. Sem mudanças no `cartStore` nem no checkout (já é Shopify-native).
- Edge functions Yampi continuam desativadas (410).
- Storefront API já configurada (`SHOPIFY_STOREFRONT_TOKEN`, escopo `unauthenticated_read_product_listings`). Verificar se os 45 handles existem em produção antes de fechar o ciclo (faço um script de check em paralelo com 45 `fetchProduct` e logo no console qualquer 404 — só dev, sem mexer no usuário).
- Os testes E2E em `tests/e2e/cart-*.spec.ts` não tocam no guia, então não quebram.
- `useGuideQuery.ts`: aceitar o novo valor `"lago-hibrido"` em `normalizeTipo` (manter o legado `"lago-reduzido"` → `"lago"`).

## Fora de escopo

- Mexer no Shopify (criar/editar produtos, descrições, variantes) — o brief diz explicitamente que o catálogo já está pronto.
- Mudar o layout visual dos cards/páginas além das renomeações.
- CartDrawer, ProductPage, Linhas, etc.

## Validação pós-implementação

1. Abrir `/guia-de-composicao` → 5 cards de tipo aparecem.
2. Selecionar **Piscina · 20 m² · Moledo** → 3 cards com Búzios / Maresias / Pipa e preços R$ 3.585 / R$ 4.750 / R$ 5.195 puxados do Shopify.
3. Selecionar **Jardim Seco · 7 m²** → cai em "Grande", mostra Araripe / Guimarães / Diamantina.
4. Selecionar **Lago Híbrido · 3 m²** → aviso da margem aparece no topo, mostra Vereda (R$ 525) com aviso de pedido mínimo.
5. Clicar "Refinar" no Caiobá → URL usa `conjunto-piscina-caio-essencial`, composição carrega do produto Shopify.
6. `rg -n "Equilibrada|\\bkit\\b|\\bcliente\\b" src/components/guide-v2 src/pages/guia` retorna 0 ocorrências.