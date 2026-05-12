# Corrigir overflow horizontal na PDP mobile

## Diagnóstico

A causa raiz dos 3 sintomas visíveis (blurb cortado, botão "Solicitar cadastro" cortado, imagem da galeria deslocada para direita) é uma única: o componente `PriceGate` (variant `block`) está overflowando horizontalmente em viewports estreitos (~390px) e empurrando a coluna de detalhes da PDP, que por sua vez empurra o grid pai e a galeria.

Por que overflowa:
- Os dois CTAs (`Acessar para ver preço` + `Solicitar cadastro`) são `inline-flex` com tracking alto (`0.22em`). Texto dentro de `inline-flex` não quebra por padrão, então cada âncora exige sua largura intrínseca.
- O wrapper externo `border bg-western-gold/5 px-5 py-6` não tem `min-w-0`.
- Mesmo com `flex-wrap`, em telas muito estreitas a soma de paddings + largura mínima dos botões ultrapassa o container.

O `overflow-x: clip` global apenas esconde a barra de scroll mas não impede o conteúdo de aparecer cortado.

## Mudanças

### 1. `src/components/shared/PriceGate.tsx`
- Adicionar `min-w-0` ao container externo do variant block.
- Trocar os CTAs `inline-flex` por `flex` com `w-full sm:w-auto` para empilharem verticalmente em mobile e ficarem lado a lado em ≥ sm.
- Adicionar `text-center` e permitir quebra natural do label (`whitespace-normal` se necessário).
- Garantir `flex-col sm:flex-row` no wrapper dos botões.

### 2. `src/pages/ProductPage.tsx`
- Adicionar `min-w-0` na coluna da galeria (`md:sticky md:top-24`) — espelha o `min-w-0` que já existe na coluna de detalhes para evitar que qualquer filho intrínseco empurre o grid.
- Verificar se o blurb `<p className="... max-w-[48ch]">` precisa de `break-words` (provavelmente não, mas adicionar como cinto-e-suspensório).

### 3. Validação
- Browser: navegar para `/produtos/cascata-sabino` (ou outro produto) em viewport 390x844 sem login.
- Verificar:
  - Blurb completo, sem corte.
  - Bloco "Condição parceiro" inteiro dentro da viewport, com botões empilhados.
  - Galeria centralizada, imagem não cortada à direita.
  - `document.documentElement.scrollWidth === clientWidth`.

## Não fazer
- Não mexer em lógica de negócio, autenticação ou queries.
- Não alterar o lightbox da galeria (já corrigido no ciclo anterior).
- Não introduzir novos tokens de cor — apenas classes utilitárias de layout.
