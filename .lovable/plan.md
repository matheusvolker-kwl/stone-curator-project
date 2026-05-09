## Ajuste no bloco "Coleções" da home

Reduzir o bloco para mostrar apenas **2 linhas** (8 cards no desktop em grid de 4 colunas), com a substituição de "Fontes para Jardim" por "Pisadas".

### Mudanças

**1. `src/pages/Index.tsx`**
- Antes de passar `linhas` para `<ColecoesGrid />`, aplicar:
  - Filtro/reordenação para garantir que **"Pisadas"** entre na lista e **"Fontes para Jardim"** saia.
  - Slice para no máximo 8 coleções (2 linhas × 4 colunas no desktop).
- Lógica: começar pela ordem atual de `linhas`, remover o handle `fontes-para-jardim`, garantir que `pisadas` esteja na lista (move para a posição da removida se já existir; se não, adiciona), e cortar com `.slice(0, 8)`.

**2. `src/components/home/ColecoesGrid.tsx`**
- Nenhuma mudança estrutural necessária — o componente já renderiza o que recebe e já tem o link "Ver todas as coleções →" no header, que serve como o botão pedido.
- Opcional: reforçar visualmente o CTA "Ver todas as coleções" (manter como link discreto no topo, como está hoje, ou duplicar como botão abaixo do grid). Sugiro **manter apenas o link no topo** para não poluir — já é claro e bem posicionado.

### Resultado esperado
- Desktop: grid 4×2 = 8 cards, sem "Fontes para Jardim", com "Pisadas".
- Mobile/tablet: mesma lista, layout responsivo já existente (2 ou 3 colunas).
- CTA "Ver todas as coleções →" continua no canto superior direito do bloco, levando para `/linhas`.
