
# Rebalanceamento Western — luxo, ASMR, nomenclatura

## 1. Nome da marca

Substituir todas as ocorrências de "Western Pools" por "Western" em:
- `src/components/layout/Header.tsx`, `Footer.tsx`
- `src/pages/About.tsx`, `Contact.tsx`, `Index.tsx`, `PartnerSignup.tsx`, `PartnerLogin.tsx`
- `index.html` (title, meta description, OG tags)
- Textos institucionais e copy do hero

Manter referência ao domínio `westernpools.com.br` apenas em e-mail/contato/legal.

## 2. Nova taxonomia

Hoje "Coleções" agrupa tipos de produto. Reorganizar assim:

| Termo novo | O que é | Origem dos dados |
|---|---|---|
| **Linhas** (de produto) | Categorias permanentes: Cascatas, Pedras Grandes, Fósseis Decorativos, Pisadas, Bordas, Fontes… | Shopify Collections atuais |
| **Coleções** (sazonais) | Curadorias temporais: "Coleção Verão 26", "Edição Mata Atlântica" | Shopify Collections marcadas com tag `sazonal` ou metafield `custom.tipo_colecao = "sazonal"` |
| **Conjuntos** | Resultado do Guia de Compra: kit a+b+c sugerido para um cenário | Definidos no front (curadoria), com lista de handles de produto, ou via metafield `custom.conjuntos` numa página/coleção dedicada |

Mudanças de rotas:
- `/colecoes` → `/linhas` (lista de Linhas de produto)
- `/colecoes/:handle` → `/linhas/:handle`
- Nova: `/colecoes` (sazonais) e `/colecoes/:handle`
- `/guia-de-compra` passa a entregar um **Conjunto** ao final (nome + lista de produtos + CTA "Adicionar conjunto ao carrinho")

Atualizar `App.tsx`, Header (menu: Início · Linhas · Coleções · Guia · Sobre · B2B), breadcrumbs e copy.

## 3. Rebalanceamento visual (creme + verde + branco)

Problema: produtos têm fundo branco e o site é 100% verde escuro → cards "flutuam" e quebram o ASMR. Solução: alternar superfícies por seção, deixando o creme/branco respirar onde mora o produto.

Sistema de superfícies (em `src/index.css`):

```text
--surface-forest   = verde profundo   → hero, institucional, footer
--surface-cream    = #E8DFD0           → grids de produto, linhas, ficha técnica
--surface-ivory    = #F5F0E6 / branco quase puro → detalhe de produto, gallery
--surface-stone    = verde médio       → seções de transição
```

Padrão de alternância vertical (estilo editorial):
```text
[Hero verde] → [Linhas creme] → [Sobre verde] → [Coleção sazonal ivory]
            → [Guia verde]   → [Parceiros creme] → [Footer verde]
```

Componentes a ajustar:
- `ProductCard`: remover frame dourado pesado; em superfície creme o card vira card branco com hairline cinza-quente, tipografia em verde profundo. Em superfície verde, manter "moldura galeria" mas com creme suave, não branco puro.
- `Collections` (agora `Linhas`): mover para fundo creme, hero da página em verde curto no topo, grid em creme.
- `BuyingGuide`: caixa em creme/ivory, etapas com hairlines douradas finas; resultado final é um **Conjunto** apresentado como "ficha de obra".
- `Footer`: manter verde profundo (âncora visual).
- `Header`: ganha variante "sobre creme" (texto verde) detectada por rota, ou usar `mix-blend-mode` discreto.

Tokens novos no Tailwind: `bg-surface-cream`, `bg-surface-ivory`, `text-on-cream` (verde profundo).

## 4. Novo componente: Conjunto (resultado do Guia)

Estrutura:
```text
[ Eyebrow: CONJUNTO SUGERIDO ]
[ Nome: "Conjunto Lago Contemplativo" ]
[ 3–5 produtos em linha, com qty sugerida ]
[ Preço total estimado · Prazo · CTA: Adicionar conjunto ao carrinho ]
[ Link: ajustar quantidades ]
```

Mapa inicial (location × size × finish → conjunto), curadoria fixa no front em `src/data/conjuntos.ts`, cada conjunto referenciando handles de produto Shopify. Quando o cliente clica "Adicionar", iteramos `addItem` para cada handle/variante.

## 5. Coleções sazonais (estrutura)

- Página `/colecoes`: lista as collections do Shopify com tag `sazonal` (filtro client-side em `fetchCollections`).
- Página `/colecoes/:handle`: hero editorial grande (imagem da estação), parágrafo curatorial, grid em fundo ivory.
- Se nenhuma coleção sazonal existir ainda, mostrar estado vazio elegante: "Próxima coleção: Verão 26 · em breve".

## 6. Microcópia / ASMR

- Substituir labels: "Coleções" → "Linhas" no menu; criar item novo "Coleções" (sazonal).
- Hero pode virar mais quieto: tipografia maior, menos elementos, respiro vertical +20%.
- Adicionar separadores hairline dourados de 1px entre seções com `opacity 0.3`.
- Reduzir uso do dourado a acentos pontuais (eyebrow, hover, hairlines) — não em bordas de cards na superfície creme.

## Detalhes técnicos

- Rotas: adicionar `/linhas`, `/linhas/:handle`; manter `/colecoes`, `/colecoes/:handle` apontando para a nova lógica sazonal; redirect 301 client-side de antigas URLs.
- `fetchCollections` ganha parâmetro `{ sazonal?: boolean }` filtrando por tag/metafield.
- Tokens CSS novos em `:root` e classes utilitárias em `@layer components`.
- Header detecta superfície via `useLocation` + mapa rota→tema; aplica `data-theme="cream"` no `<header>`.
- Conjuntos: `src/data/conjuntos.ts` com tipos `{ id, nome, descricao, items: { handle, qty }[] }`; lookup no fim do wizard.
- Adicionar handler "Adicionar conjunto" no cartStore: `addBundle(items)` que chama `addItem` em sequência.
- Refatorar `ProductCard` com prop `surface: "forest" | "cream"` para alternar estilos.

## Arquivos impactados (resumo)

- Editar: `App.tsx`, `index.css`, `tailwind.config.ts`, `Header.tsx`, `Footer.tsx`, `Index.tsx`, `Collections.tsx`→renomear conceitualmente, `CollectionPage.tsx`, `ProductCard.tsx`, `BuyingGuide.tsx`, `About.tsx`, `Contact.tsx`, `PartnerSignup.tsx`, `PartnerLogin.tsx`, `index.html`, `cartStore.ts`, `lib/shopify/queries.ts`
- Criar: `src/pages/Linhas.tsx`, `src/pages/LinhaPage.tsx`, `src/pages/ColecoesSazonais.tsx`, `src/pages/ColecaoSazonalPage.tsx`, `src/data/conjuntos.ts`, `src/components/product/BundleCard.tsx`
