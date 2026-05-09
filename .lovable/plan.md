## Objetivo

Tornar o `/guia-de-compra` 100% coerente com o catálogo B2B (preços só para parceiros), eliminar o "beco sem saída" ao clicar num produto, dar suporte real ao botão voltar do navegador e proteger o fluxo com testes automatizados.

## 1. Preços sob PriceGate em todo o guia

Hoje todos os valores aparecem em texto puro com `formatBRL`. Vai virar gated via o componente `PriceGate` já existente (mesmo padrão da PDP/cards), com fallback compacto "Login para preço".

Pontos de troca:

- **StepBase** (`a partir de R$ X` no card de compra, "Acabamento X" mantém)
- **StepComplementos** (preço por item + botão "Reservar todos (R$ X)" → vira "Reservar todos (N peças)")
- **StepUpgrade** (preço base, preço upgrade, delta `+R$`, swap)
- **StepCasa** (preço por item)
- **StepFechamento** (Total parcial, valor por linha do resumo, Economia estimada)
- **GuideStepFooter** (bloco "Orçamento parcial · N itens · R$")
- **GuideAssemblySummary** (sidebar desktop: total + valor por linha; bottom-bar mobile: total)
- **StepOnde** (a "magnitude" tipo "R$ 2–27 mil" nos cards de Lago/Piscina/Jardim — também fica oculta para visitantes)
- **Intro** (mantém — não exibe preço hoje)

Para visitantes: contadores de itens permanecem ("3 itens no projeto"), trocando o valor por um chip discreto `<Lock/> Login para ver valor`. Botões "Reservar/Adicionar" continuam funcionando (carrinho persiste, valor revela após login).

## 2. Quick View modal de produto

Hoje os clicks no card vão para `/produtos/<handle>`, perdendo a etapa, o estado de acabamento e o scroll. Vai virar um modal interno do guia.

- Novo componente `GuideProductQuickView` (Dialog do shadcn, max-w 5xl, scroll interno):
  - Hero da imagem + galeria thumbs
  - Título, subtítulo, descrição parseada (`parseProductDescription`)
  - Seletor de acabamento quando aplicável (`FinishSelector`)
  - Preço sob PriceGate
  - CTAs: "Adicionar ao orçamento" (usa `addItem` do cartStore) e "Abrir página completa" (link real para `/produtos/...` em nova aba, opcional)
- Substitui todos os `<Link to="/produtos/...">` em StepBase, StepComplementos, StepUpgrade ("Ver detalhes"), StepCasa por trigger do modal.
- Acessibilidade: focus trap do Dialog, ESC fecha, retorno de foco para o card de origem.

## 3. Sincronizar etapas com a URL

`step` do `useGuideStore` vira espelhada em `?step=base` (mantendo state como source of truth para velocidade, sincronizado via `useEffect`):

- Ao montar `BuyingGuide`: ler `searchParams.get('step')` e dar `goto()` se válido.
- Ao mudar `step`: `setSearchParams({ step }, { replace: false })` — empilha histórico, então **navegador back/forward navega entre etapas**.
- `intro` é a URL limpa (sem `step`). Reset volta para URL limpa.
- Especial vira `?step=especial`.
- Validação: se a URL pedir uma etapa para a qual o usuário ainda não respondeu pré-requisito (ex: `?step=base` sem `tipo`), redireciona para a primeira etapa pendente.

## 4. Polimentos de UX e navegação adicionais

Itens menores que apareceram na auditoria e devem entrar junto:

- **Atalhos de teclado** estendidos: ←/→ funciona em **todas** as etapas de descoberta também (hoje só nas de montagem). Bloqueio mantém-se em inputs.
- **Breadcrumb clicável** no `GuideProgress`: já existe para etapas concluídas; corrigir o caso em que o passo "atual" também deveria poder voltar (não pode pular adiante, mas pode revisitar respostas anteriores).
- **Footer do StepFechamento** ganha o mesmo padrão sticky-mobile do `GuideStepFooter` (hoje os botões de Voltar/Refazer só existem in-flow).
- **`GuideEspecial`**: garantir botão "Voltar" para `tipo` (hoje precisa do back do navegador).
- **Toast de adição** ganha ação inline "Desfazer" (chama `removeItem` da última variant adicionada).
- **Resume na intro**: além de "Continuar projeto", mostrar 1 chip por resposta já dada, com clique para editar diretamente aquela etapa.
- **Empty state** do StepUpgrade quando não há upgrade disponível: hoje faz `onNext()` num `useEffect`, ok — só garantir log mudo (sem flash visual).

## 5. Testes (Vitest + Testing Library)

Reaproveita setup existente em `src/test/setup.ts`. Mocks leves: `useCartStore` e Shopify queries via `vi.mock`.

**Store / lógica pura** (`src/stores/__tests__/guideStore.test.ts`):
- transição `setTipo('piscina')` pula composição; `setTipo('lago')` vai para composição
- `nextAssemblyStep` / `prevAssemblyStep` respeitam skips (sem complementos, sem upgrade)
- `reset` zera tudo e leva para `intro`
- TTL: rehydrate depois de 72h dispara reset
- `back()` mapeia corretamente cada etapa

**Componentes**:
- `PriceGate.test.tsx` — sem sessão renderiza chip de login; aprovado renderiza children
- `GuideProgress.test.tsx` — clica em step concluído chama `onClick`; current não é clicável adiante
- `GuideStepFooter.test.tsx` — botão next dispara, skip aparece condicional, sticky aparece quando sentinel sai (mock IntersectionObserver)
- `StepOnde.test.tsx` — clicar Lago seta tipo no store
- `BuyingGuide.test.tsx` — sincronização URL ↔ step (mount com `?step=tipo` foca etapa correta; goto atualiza `?step=`)
- `GuideProductQuickView.test.tsx` — abrir/fechar, adicionar ao carrinho, preço gated quando não-parceiro

## Detalhes técnicos

```text
Arquivos novos:
  src/components/guide/GuideProductQuickView.tsx
  src/stores/__tests__/guideStore.test.ts
  src/components/guide/__tests__/GuideProgress.test.tsx
  src/components/guide/__tests__/GuideStepFooter.test.tsx
  src/components/guide/__tests__/StepOnde.test.tsx
  src/components/guide/__tests__/GuideProductQuickView.test.tsx
  src/components/shared/__tests__/PriceGate.test.tsx
  src/pages/__tests__/BuyingGuide.test.tsx

Arquivos editados:
  src/pages/BuyingGuide.tsx        — sync URL <-> step, atalhos em todas etapas
  src/stores/guideStore.ts         — pequenos ajustes para tornar back() determinístico via skips
  src/components/guide/StepBase.tsx
  src/components/guide/StepComplementos.tsx
  src/components/guide/StepUpgrade.tsx
  src/components/guide/StepCasa.tsx
  src/components/guide/StepFechamento.tsx
  src/components/guide/StepOnde.tsx
  src/components/guide/GuideStepFooter.tsx
  src/components/guide/GuideAssemblySummary.tsx
  src/components/guide/GuideEspecial.tsx
```

`PriceGate` ganha uma variante curta opcional (`variant="badge"`) — chip ainda mais compacto para usar em listas e na sidebar sem quebrar layout.

## Fora de escopo

- Não mexer em PDPs, catálogo ou Shopify schema.
- Não mudar a copy editorial das etapas (Faisal, eyebrows, etc.).
- Não alterar o store de carrinho nem o checkout.
- Sem testes E2E (Playwright) — apenas Vitest.
