## Auto-abrir carrinho + truques de e-commerce (sem item 8)

### 1. Auto-abrir o carrinho ao adicionar item

Já existe um event bus (`window.dispatchEvent("western:open-cart")`) consumido pelo `SiteLayout`. Vou centralizar o disparo no `cartStore`:

- Em `addItem` e `addBundle` (após sucesso), disparar o evento.
- Animação no badge do ícone do carrinho (pulse + ring dourado por ~600ms) escutando o mesmo evento.

Locais que chamam `addItem` (`ProductPage`, `GuideProductQuickView`, `StepBase/Casa/Complementos/Upgrade`, `CartCrossSell`, `StickyBuyBar`) deixam de precisar abrir manualmente — o store cuida.

### 2. Reforçar cross-sell dentro do drawer

`CartCrossSell.tsx` já está renderizado. Vou:

- Garantir 3 sugestões "Combina com sua composição" baseadas em linha/acabamento dos itens atuais.
- Botão "+ Adicionar" inline (não fecha o drawer; item novo entra com animação).

### 3. Barra de pedido mínimo (free-shipping bar)

Topo do drawer: barra de progresso até `BUSINESS.pedidoMinimoBRL` (R$ 700).

```text
Faltam R$ 220 para atingir o pedido mínimo  ███████░░░░  69%
```

Quando atinge: muda para verde + "Pronto para fechar pedido."

### 4. Urgência sutil + prova social

- Badge "PRODUÇÃO EM 15 DIAS" no rodapé do drawer (dado já em `BUSINESS`).
- Linha discreta: "Mais de 30 anos especificando para arquitetos."
- Sem contadores fake tipo "X pessoas vendo agora" — quebra tom premium.

### 5. Recently viewed

Hook `useRecentlyViewed` salva últimos 6 produtos visitados (`localStorage`). Slot dentro do drawer **quando vazio**: "Você viu recentemente". Aparece também numa seção pequena na home.

### 6. Salvar carrinho automático (recuperação)

`useCartSync` já existe. Adicionar:

- Quando carrinho fica idle por 5s com itens, toast pequeno "Sua composição foi salva." (1x por sessão).
- Anônimo: link discreto "entrar para guardar a composição em qualquer dispositivo" (sem modal).

### 7. "Continuar comprando" + contador

No header do drawer: `← Continuar comprando` (apenas fecha) e contador "3 itens · 2 acabamentos" para reforçar diversidade.

### 9. Wishlist no drawer vazio

Para logados com favoritos: "Você tem X favoritos. Trazer para a composição?" (1 clique adiciona todos com 1 unidade).

### 10. Sticky add-to-cart no mobile

Confirmar que `StickyBuyBar` passa pelo store — sem alteração se sim.

### Detalhes técnicos

**Arquivos a editar:**
- `src/stores/cartStore.ts` — disparar `western:open-cart` ao final de `addItem`/`addBundle` em sucesso real.
- `src/components/layout/CartDrawer.tsx` — barra de pedido mínimo, contador, "← continuar comprando", slot Recently Viewed/Wishlist (vazio), badges institucionais no rodapé.
- `src/components/layout/Header.tsx` — animação no badge do carrinho.
- **Novo** `src/hooks/useRecentlyViewed.ts` — track + read (localStorage).
- `src/pages/ProductPage.tsx` — chamar `track(handle, title, image)` no mount.
- **Novo** `src/components/cart/FreeShippingProgress.tsx` — barra de pedido mínimo.
- **Novo** `src/components/cart/EmptyCartHints.tsx` — recently viewed + favoritos.

**Sem alteração:** Shopify checkout, leads, PDF, banco de dados.

**Princípios:** zero timer fake, zero popup intrusivo, tom editorial premium preservado.
