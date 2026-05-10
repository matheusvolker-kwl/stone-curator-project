# 3 melhorias de conversão na PDP + carrinho

## 1. Sticky buy bar — mobile e desktop

Barra fixa no rodapé da viewport, aparece quando o CTA inline da coluna direita sai de tela e some quando ele volta.

**Estrutura (esquerda → direita):**

```text
[thumb 44×44] Pedra Grande 1            R$ 1.890         [−] 1 [+]   [Adicionar ao pedido]
              MOLEDO · WEST-PG1-MOLEDO
```

**Comportamento:**

- Detecção: `IntersectionObserver` no bloco "CTAs primários". Quando ele sai (`isIntersecting === false` e o usuário rolou para baixo), a barra aparece com fade+slide-up de 200ms.
- Some quando volta a ficar visível.
- Some também na área do footer (observer no footer, `bottom: 0`).
- z-index abaixo do drawer/modal mas acima do conteúdo (z-40).
- Mobile: barra full-width, layout colapsado — esconde título secundário, mostra só thumb + nome + preço numa linha e o botão "Adicionar" full-width abaixo. Stepper compacto.
- Desktop: barra full-width centralizada com `container-western`, layout horizontal completo.

**Estados:**

- **Visitante / parceiro pendente**: barra mostra thumb + nome + chip "Login para preço" + botão "Acessar minha conta" (preenchido, dourado). Sem stepper.
- **Parceiro aprovado, sem variante completa**: botão desabilitado com label "Selecione acabamento".
- **Parceiro aprovado, pronto**: stepper + "Adicionar ao pedido" verde escuro.
- **Indisponível**: botão desabilitado "Indisponível".

**Acessibilidade:** `role="region"` com `aria-label="Barra de compra"`, foco gerenciado, respeita `prefers-reduced-motion`.

**Arquivos:**

- novo `src/components/product/StickyBuyBar.tsx`
- editar `src/pages/ProductPage.tsx` — montar a barra, passar refs para detectar visibilidade do CTA inline; ações (qty, addItem) compartilhadas via props/callbacks ou levantadas pra o nível da página

---

## 2. Prova social — "Adicionado por X estúdios"

Microcopy discreta na coluna direita, logo acima da faixa de regras comerciais.

**Texto:**

> Adicionado por **23 estúdios** em projetos nos últimos 30 dias.

Tipografia: `text-spec text-western-stone-warm` com o número em `text-western-green-deep font-medium`. Pequeno ícone de pasta/projeto à esquerda (`Folder` lucide) em dourado.

**Geração do número (determinística por produto):**

- Range: 14 a 29 (inclusive).
- Seed: hash do `product.handle` (FNV-1a simples, 5 linhas), módulo 16, + 14.
- Mesmo produto → sempre o mesmo número, sem necessidade de armazenar nada.
- Variação por produto natural sem servidor, sem fake updates a cada refresh.

**Por que esse range:** parece plausível pra um nicho B2B de arquitetura (não absurdo nem irrelevante), e dá variação sensível entre produtos.

**Não exibir:**

- Nada que pareça em tempo real ("agora", "online"), nada que indique compras concluídas (seria fake).
- Apenas "adicionado a projetos" (compatível com o fluxo de orçamento/wishlist do site).

**Arquivos:**

- novo `src/lib/seededRandom.ts` — função `hashSeed(seed: string)` e `inRange(seed, min, max)`
- editar `src/pages/ProductPage.tsx` — renderizar a linha entre os CTAs e a faixa de regras

---

## 3. Cross-sell contextual no carrinho

Bloco "Combina com sua composição" dentro do `CartDrawer`, posicionado entre a lista de itens e o resumo (ou logo abaixo da lista quando ela rola).

**Layout (3 sugestões em coluna):**

```text
COMBINA COM SUA COMPOSIÇÃO

[thumb 56] Pedra Pequena 03        + Adicionar
           MOLEDO · a partir de R$ 480

[thumb 56] Pedra Média 02          + Adicionar
           MOLEDO · a partir de R$ 920

[thumb 56] Conjunto Mineral 04     Ver peça →
           A partir de R$ 3.200
```

**Lógica de seleção:**

- Pega o `collectionHandle` do primeiro item do carrinho.
- `fetchCollection(handle, 8)` (já existe em `src/lib/shopify/queries.ts`).
- Filtra produtos que já estão no carrinho.
- Pega os 3 primeiros restantes.
- Fallback: se não houver coleção (item órfão) ou retornar vazio, busca da coleção `"conjuntos"` (mesma estratégia já usada em `RelatedProducts`).

**Comportamento dos botões:**

- **Parceiro aprovado**: botão `+ Adicionar` adiciona com qty=1 usando o variante padrão (primeira variante disponível). Toast "Peça adicionada à composição".
- **Visitante / pendente**: link "Ver peça →" leva pra PDP em vez de adicionar direto (não dá pra adicionar sem preço/aprovação).

**Quando esconder:**

- Carrinho vazio.
- Loading da coleção.
- Nenhum produto restante depois de filtrar.

**Arquivos:**

- novo `src/components/cart/CartCrossSell.tsx`
- editar `src/components/layout/CartDrawer.tsx` — montar o componente entre `</ul>` da lista e o bloco de totais (ou no final do `overflow-y-auto`, antes do footer)

---

## Resumo de arquivos

**Novos:**
- `src/components/product/StickyBuyBar.tsx`
- `src/components/cart/CartCrossSell.tsx`
- `src/lib/seededRandom.ts`

**Editados:**
- `src/pages/ProductPage.tsx` — integra StickyBuyBar + linha de prova social
- `src/components/layout/CartDrawer.tsx` — integra CartCrossSell

Sem mudanças em config, store ou backend. Tudo client-side.
