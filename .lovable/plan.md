## Revisão completa do Guia de Composição

Li ponta a ponta os 9 steps + painel de orçamento + footer + progress + store. Abaixo o que está sólido, o que tem **bug real** e o que merece polimento — em ordem de prioridade.

---

## Bugs e inconsistências reais (corrigir)

### B1. `StepUpgrade` chama `onNext()` durante o render
Em `StepUpgrade.tsx:64-67`, quando não há upgrade disponível, o componente chama `onNext()` no corpo do render e retorna `null`. Isso dispara `setState` em outro componente durante a renderização → warning do React + risco de loop infinito de navegação. Além disso, o `skips.skipUpgrade` em `BuyingGuide.tsx:69` já filtra esse caso via `upgradeAvailable`, então o `early return` é redundante e perigoso.
**Fix:** trocar por `useEffect(() => { if (!upgrade) onNext(); }, [upgrade])` ou simplesmente confiar no skip e renderizar fallback.

### B2. `StepUpgrade.tsx:67` retorna sem renderizar `GuideStepFooter`
Quando o early return acontece numa transição rápida, o usuário vê uma tela em branco por um frame.

### B3. `StepFechamento` ignora a área do projeto no contexto do SketchLeadModal
`StepFechamento.tsx:244` passa `areaM2: undefined` mesmo tendo a info no `useGuideStore`. Lead chega no CRM sem o m² — perda de qualificação.
**Fix:** ler `areaM2` da store e passar.

### B4. Persistência: `useGuideStore` salva mas o **carrinho** não rehidrata na mesma janela
O `cartStore` (não vi o conteúdo, mas pelo comportamento) provavelmente persiste em paralelo. Confirmar: ao "Continuar projeto" do banner do Intro, o carrinho parcial reaparece? Se não, o "vivo" do painel lateral some.

### B5. Atalhos de teclado podem disparar em `Intro` se o foco estiver no botão
`BuyingGuide.tsx:134` filtra apenas inputs/textareas. Se o usuário pressionar ← na intro, dispara `back()` indevidamente. O guard `ASSEMBLY_STEPS.includes(step)` previne, mas vale revisar — está ok.

### B6. Tint do acabamento usa keys que podem não bater
`StepBase.tsx:30-39` mapeia `quartzo|arenito|moledo|granito`. Se o produto Shopify tiver "Quartzo Branco" ou "Arenito Texturizado", o split pega só a primeira palavra — funciona, mas se vier "Pedra Quartzo" o key fica `pedra` → cai no fallback cinza. Risco baixo, vale documentar.

### B7. `GuideAssemblySummary` reserva 320px de coluna, mas só aparece em xl (≥1280)
`BuyingGuide.tsx:179` usa `xl:grid-cols-[1fr_320px]`. Em telas 1280-1366 (laptops), o card central fica apertado e o hero do StepBase (21:9) compete por espaço. Vale conferir visualmente — pode ficar feio em 1280.

### B8. Mobile sticky cart bar (76px) + sticky CTA do footer (bottom: 76px)
`GuideStepFooter.tsx:101` posiciona o CTA acima da barra mobile. Confirma-se visualmente que não há sobreposição em telas pequenas (320px). O `pb-44` do container (`BuyingGuide.tsx:160`) cobre, mas vale validar.

---

## Inconsistências de conteúdo / UX

### C1. Footer "Voltar" duplicado em StepFechamento
A Etapa 09 já tem "Voltar" + "Refazer guia" no rodapé próprio (`StepFechamento.tsx:221-236`), mas **não usa** `GuideStepFooter`. Ok funcionalmente, mas o sticky mobile CTA não aparece nessa etapa — pode confundir quem aprendeu o padrão nas etapas 5-8.

### C2. Headline genérica na Etapa 09
`"Pronto. Seu projeto está montado."` — o plano original previa **capturar nome no SketchLeadModal e reusar** ("Pronto, [Nome]."). Hoje o nome só é coletado quando o usuário clica em baixar prancha — tarde demais.
**Fix sugerido:** mover a captura de nome (apenas first name) para a entrada da Etapa 05 ou 09, opcional, num input inline discreto.

### C3. Economia hardcoded (1.7x) na Etapa 09
`StepFechamento.tsx:67`. Já listado no plano de metafields. Fica como TODO conhecido.

### C4. "45 conjuntos curados" no Intro
`BuyingGuide.tsx:291` — número correto (validei pelo guideMap), mas se a Western adicionar/remover conjuntos no futuro, vai dessincronizar. Pode virar `Object.keys()` derivado.

### C5. Microcopy ainda inconsistente em alguns CTAs
- `StepUpgrade.tsx:227` "Reservar upgrade" ✓
- `StepBase.tsx:275` "Reservar este conjunto" ✓
- `StepComplementos.tsx:99` "Reservar todos" ✓
- Mas `StepCasa.tsx:42` ainda usa toast "adicionado" sem o tom premium dos outros — sem grande dano.

### C6. Sem feedback visual quando o upgrade é adicionado mas o conjunto base segue no carrinho
Etapa 07: o usuário pode acabar com **base + upgrade** no orçamento sem perceber. O `handleSwap` (`StepUpgrade.tsx:75`) só adiciona o upgrade — não remove a base. O toast menciona, mas é fácil ignorar.
**Fix sugerido:** oferecer toggle ou "trocar pelo upgrade" (remove base + adiciona upgrade) vs. "adicionar upgrade".

### C7. Painel lateral não destaca o item recém-adicionado no scroll
Quando o usuário adiciona em complementos com a página rolada, o item entra no painel desktop com animação — mas o painel mantém a posição de scroll. Se houver muitos itens, o novo pode entrar fora da viewport interna.
**Fix:** scroll automático para o item recém-entrado dentro do `flex-1 overflow-y-auto`.

### C8. Sem indicador visual de skip nas etapas
Quando `skips.skipUpgrade=true`, a etapa Upgrade some do progress — bom. Mas o usuário não sabe que isso aconteceu. Considerar tooltip "Sua escolha já é a composição mais robusta" no progress, ou nota discreta.

---

## Acessibilidade (revisão)

- ✅ `aria-current="step"` no GuideProgress
- ✅ `aria-live="polite"` no painel lateral
- ✅ `aria-label` nos cards do StepProtagonismo
- ⚠️ Confetti em `StepFechamento` não tem `prefers-reduced-motion` guard. Deveria respeitar.
- ⚠️ Atalhos ←/→ não estão documentados em lugar nenhum. Adicionar nota visual discreta nos primeiros segundos da Etapa 05 (tooltip de onboarding).
- ⚠️ Os toasts do Sonner podem ser perdidos por screen readers se a região live não estiver configurada (Sonner geralmente cuida disso, mas vale auditar).

---

## Performance

- ✅ Imagens via `cdnImg()` com width otimizado e webp.
- ✅ `lazy` loading nas imagens.
- ✅ `staleTime` configurado nos useQuery.
- ⚠️ `StepFechamento` gera 24 partículas de confete com `Math.random()` no render — recalcula em cada render. Memoizar com `useMemo`.
- ⚠️ O painel lateral usa `useCartStore` em 3 componentes filhos (`useTotals` em PanelInner + GuideAssemblySummary + ItemRow indireto). Cada subscription causa re-render. Selector único no topo evitaria.

---

## Pontos sólidos (não mexer)

- Arquitetura do `guideStore` com `persist` + TTL — limpa.
- `getProgressSteps()` derivando dos skips — ótima abstração.
- `GuideAssemblySummary` mobile/desktop com Sheet — UX correta.
- Comparativo lado a lado em StepUpgrade — visualmente forte.
- Stamp animation no GuideProgress — sutil e elegante.
- Hover preview no StepProtagonismo — diferencial real.

---

## Priorização sugerida (próxima onda de ajustes)

**Crítico (corrigir antes de divulgar):**
1. B1 — `onNext()` no render do StepUpgrade (risco de loop)
2. B3 — areaM2 ausente no SketchLeadModal (qualificação de lead)
3. C6 — base + upgrade duplicado no carrinho (confunde orçamento)

**Importante (UX/qualidade):**
4. C2 — captura de nome para personalizar Etapa 09
5. C7 — auto-scroll para item recém-adicionado no painel
6. Confetti respeitar `prefers-reduced-motion`

**Polimento:**
7. C5 — uniformizar tom dos toasts
8. C8 — informar quando uma etapa foi pulada
9. Memoizar partículas do confetti
10. Validação visual em 1280px (B7)

---

## Resposta direta

O guia está em **excelente estado** — UX coesa, animações bem dosadas, fluxo intuitivo. Os 3 bugs críticos (B1, B3, C6) são pontuais e rápidos de resolver. O resto é polimento de quem quer 10/10 em vez de 9/10.

Quer que eu execute a **lista crítica (1-3) + importante (4-6)** como próxima entrega?