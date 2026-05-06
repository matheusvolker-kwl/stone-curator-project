## Objetivo
1. Remover do projeto a área de **Coleções Sazonais** (sem deletar produtos no Shopify).
2. Renomear o item de menu **"Guia"** para **"Guia de Compra"**.
3. Criar nova página **Conjuntos** (`/conjuntos`) que lista produtos-kit cadastrados no Shopify.

---

## 1. Remover Coleções Sazonais

- **`src/App.tsx`**: remover imports e rotas de `ColecoesSazonais` e `ColecaoSazonalPage` (`/colecoes` e `/colecoes/:handle`).
- **`src/components/layout/Header.tsx`**: remover o item `{ to: "/colecoes", label: "Coleções" }` do array `nav`.
- **`src/components/layout/Footer.tsx`**: remover o link "Coleções".
- **`src/pages/Index.tsx`**: remover a seção "COLEÇÕES SAZONAIS" inteira (linhas ~212-272) e a query/variável `sazonais` relacionada.
- **`src/pages/ProductPage.tsx`**: ajustar o breadcrumb que aponta para `/colecoes/...` para apontar apenas para `/linhas/...` (ou ocultar quando a coleção for sazonal).
- **`src/lib/shopify/queries.ts`**: manter `isSeasonal` (ainda útil para filtrar). Sem deleção.
- **Arquivos a deletar**: `src/pages/ColecoesSazonais.tsx`, `src/pages/ColecaoSazonalPage.tsx`.

> Nada será apagado no Shopify. Apenas a navegação e páginas no front-end.

---

## 2. Renomear "Guia" → "Guia de Compra"

- **`src/components/layout/Header.tsx`**: alterar label do item `/guia-de-compra` de `"Guia"` para `"Guia de Compra"`.
- **`src/components/layout/Footer.tsx`**: garantir mesmo texto.
- Drawer mobile herda do mesmo array `nav`, sem mudanças extras.

> A rota continua `/guia-de-compra` para não quebrar links.

---

## 3. Nova página: Conjuntos

### Conceito
"Conjuntos" são kits curados (produtos no Shopify) — cada conjunto é **um produto Shopify** com sua imagem, descrição, preço e botão de compra. A página será uma vitrine grid no mesmo padrão visual de `Linhas.tsx` / `LinhaPage.tsx`.

### Fonte de dados
- Os conjuntos serão organizados no Shopify como uma **coleção** com handle `conjuntos`.
- A página busca via `fetchCollection("conjuntos", 50)` (já existe em `src/lib/shopify/queries.ts`).
- Cada produto-conjunto é renderizado com o `ProductCard` existente; o clique vai para `/produtos/:handle` (página de produto padrão, com Add to Cart real via Storefront API).

### Implementação
- **Nova página** `src/pages/Conjuntos.tsx`:
  - Hero curto (eyebrow "Curadoria · Conjuntos", título "Kits para começar com confiança.", lead explicando que cada conjunto é uma composição pronta para um ambiente).
  - Grid de produtos da coleção `conjuntos` (mesmo layout de `Linhas.tsx`).
  - Estado vazio: "Nenhum conjunto cadastrado ainda" + dica para criar produtos com tag/coleção `conjuntos` no Shopify admin.
- **Rota** em `src/App.tsx`: `<Route path="/conjuntos" element={<Conjuntos />} />`.
- **Menu** (`Header.tsx` e drawer mobile): adicionar `{ to: "/conjuntos", label: "Conjuntos" }` entre "Linhas" e "Guia de Compra".
- **Footer**: adicionar link "Conjuntos".

### Sobre o `BuyingGuide` atual
- O `BuyingGuide.tsx` usa `src/data/conjuntos.ts` (mapa estático local) para sugerir kits ao final do quiz. Isso continua funcionando como está — não é afetado por essa mudança. O quiz pode, no futuro, ser migrado para apontar para os produtos-conjunto reais do Shopify, mas isso fica fora do escopo agora.

---

## Próximo passo após implementação
No Shopify admin, você precisará:
1. Criar uma **coleção** com handle `conjuntos`.
2. Cadastrar cada kit como um **produto** (com imagem, descrição do ambiente sugerido, preço total) e adicioná-lo a essa coleção.

Assim que existirem produtos na coleção, a página `/conjuntos` os exibirá automaticamente.
