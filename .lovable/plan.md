## Problemas

1. **Sidebar com scroll interno** — `max-h-[calc(100vh-9rem)] overflow-y-auto` cria rolagem dentro do card quando o conteúdo não cabe. O CTA "Revisar e finalizar" fica escondido.
2. **Sem fóssil em piscina** — só lago/jardim-seco têm `fossil-coelphisys`.
3. **Modal de produto autoral**:
   - Botão `×` recortado pela faixa dourada do topo
   - Não permite quantidade > 1
   - Layout ainda visualmente fraco

---

## Plano

### 1. Sidebar verdadeiramente sticky, sem scroll interno
`ProjetoSidebar.tsx` linha 195: remover `max-h-[calc(100vh-9rem)] overflow-y-auto scrollbar-hide`. Manter só `sticky top-32 self-start`. Se o conteúdo for maior que a viewport, ele rola com a página normalmente (comportamento que o usuário quer).

Para garantir que o resumo + CTA caibam em viewports comuns (854px+), **compactar o panel**:
- Reduzir padding `p-7 md:p-8` → `p-6`
- Reduzir gap `gap-6` → `gap-5`
- Total: `text-[36px]` → `text-[32px]`
- Reduzir espaçamentos verticais entre seções (`pt-5` → `pt-4`)
- Lista de peças com `text-[12.5px]`, `space-y-1`
- CTA principal `h-[54px]` → `h-12`, secundário `h-11` → `h-10`
- Lock state mais compacto

### 2. Adicionar fóssil em piscina + jardim-fonte
`autoraisCatalog.ts` FILTERS:
- `piscina`: adicionar `fossil-coelphisys` no array
- `jardim-fonte`: adicionar `fossil-seymouria`
Reordenar para fósseis aparecerem entre as primeiras peças (mais visibilidade).

### 3. Modal autoral — refinar e corrigir bug
`AutoralProductModal.tsx`:

**Bug do `×`:** atualmente `absolute top-3 right-3` no painel direito, mas a faixa `h-[3px] bg-western-gold` no topo do `DialogContent` está acima e o canto fica visualmente quebrado. Solução:
- Mover o `×` para `position: absolute` no nível do `DialogContent` (não dentro do grid), `top-2.5 right-2.5`, com `z-10` e fundo `bg-western-cream/90 backdrop-blur` em círculo `w-8 h-8 rounded-full`. Fica acima da faixa e da imagem.

**Quantidade > 1:** quando já está selecionado, em vez de mostrar só "Remover do projeto", mostrar **stepper de quantidade** + ação remover ao lado. Stepper: `−  [ qty ]  +` no mesmo padrão do `PecaRow`. Vai exigir ler/atualizar `qty` do extra, então:
- Adicionar prop `currentQty: number` ao modal
- Adicionar prop `onQtyChange: (delta: number) => void` ou `onSetQty: (qty: number) => void`
- No `Refinar.tsx`, passar handlers que façam `setExtras` aumentando/diminuindo qty. Já existe `addExtraQty`/`setExtras` lógica para extras — verificar e reaproveitar.

**Refinamento visual:**
- Remover a faixa dourada do topo (poluição visual) — substituir por um detalhe gold mais sutil só na lateral/canto da seção de info, ou simplesmente um `border-t-2 border-western-gold` na seção do conteúdo
- Aumentar respiro: `p-6 md:p-7` continua, mas reorganizar hierarquia
- Fundo da imagem `bg-western-paper` mantém, mas com sombra interna sutil para a peça "flutuar"
- Tipografia: nome `text-[24px]` (era 22px), preço `text-[28px]` (era 26px), código `text-[10px]`
- CTA principal: full-width, `h-12`, com hover state mais marcado
- Reordenar: `código → nome → divisor → preço → resumo curto → specs → stepper/CTA → mais detalhes`

### 4. Mini-quantidade no AutoralCard também
No card do grid (`AutoralCard.tsx`), quando já selecionado e `qty > 1`, mostrar o número no badge do canto superior direito (`bg-western-green-deep` com `qty×`) em vez de só o check. Ajuda o usuário a ver quantos já adicionou sem abrir o modal.

---

## Arquivos afetados

- `src/components/guide-v2/ProjetoSidebar.tsx` — remover scroll interno + compactar
- `src/components/guide-v2/autoraisCatalog.ts` — adicionar fósseis em piscina e jardim-fonte
- `src/components/guide-v2/AutoralProductModal.tsx` — fix botão `×`, stepper de quantidade, refinar visual
- `src/components/guide-v2/AutoralCard.tsx` — badge de quantidade quando >1
- `src/pages/guia/Refinar.tsx` — passar `currentQty` + handler de qty pro modal (verificar lógica de extras existente)

Sem mudanças em DB, rotas ou regras de negócio.