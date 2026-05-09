## Atualizar bloco de números da página Sobre

Trocar a faixa atual de 5 métricas por **4 cards em arco narrativo**: tempo → repertório → curadoria → entrega.

### Mudança em `src/pages/About.tsx` (linhas 100-120)

**Antes** (5 cards, grid `md:grid-cols-5`):
- 33 — anos de operação ininterrupta
- 50 — modelos catalogados
- 11 — coleções
- 200 — SKUs com 4 acabamentos
- 5 — anos de garantia formal

**Depois** (4 cards, grid `md:grid-cols-4`):
- **33** — anos de operação ininterrupta
- **+400** — modelos fabricados em ateliê
- **50** — selecionados no catálogo atual
- **+300** — projetos entregues pelo Brasil

### Detalhes
- Atualizar `grid-cols-5` → `grid-cols-4`.
- Mobile permanece `grid-cols-2` (2×2 fica equilibrado com 4 itens).
- Manter componente `Reveal`, tipografia, espaçamento e cores.
- Os "5 anos de garantia formal" saem deste bloco (podem ser realocados depois no bloco B2B/comercial, mas isso não faz parte desta mudança).
