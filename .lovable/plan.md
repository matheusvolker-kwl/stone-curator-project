# Reformulação do Guia — De 9 etapas para 2 fases

## Diagnóstico
Hoje o guia tem 9 etapas em fluxo linear. As 3 etapas finais de "adicionar peças" (Complementos / Upgrade / Assinatura) são percebidas como repetitivas e sem contexto: o usuário decide cada peça isolada, sem ver o conjunto montado nem o impacto no total.

## Nova estrutura

```
FASE 1 — Descoberta (rápida, 4 cliques)         FASE 2 — Configurador (tela única)
┌──────────────────────────────────┐            ┌────────────────────────────┬──────────────┐
│ Onde → Tamanho → Protagonismo →  │   ──>      │  CONJUNTO BASE (hero)      │              │
│ Composição                       │            │   - acabamento inline      │              │
│                                  │            │   - botão "Trocar por      │  PROJETO     │
│ (mantém o atual, sem mudanças)   │            │     versão maior" (upgrade)│  EM TEMPO    │
└──────────────────────────────────┘            ├────────────────────────────┤  REAL        │
                                                │ § COMPLEMENTOS (cards)     │              │
                                                │   ajusta qtd/adiciona      │  + sticky    │
                                                ├────────────────────────────┤  + clicável  │
                                                │ § ITENS AUTORAIS (cards)   │    p/ rolar  │
                                                ├────────────────────────────┤    p/ seção  │
                                                │ [ FINALIZAR ORÇAMENTO ]    │              │
                                                └────────────────────────────┴──────────────┘
```

## Mudanças concretas

**Fase 1 — Descoberta**: mantém igual. 4 perguntas curtas com `goto` automático entre elas. Já funciona bem.

**Fase 2 — `BuyingGuide` rota `?step=configurar`** (substitui base/complementos/upgrade/casa/fechamento):
- Página única com seções verticais e rail direito (atual `GuideAssemblySummary`).
- Navegação interna por âncoras (índice no topo do rail: "Conjunto · Complementos · Itens autorais") + scroll suave + destaque da seção visível (IntersectionObserver).
- Header da página mostra os chips de descoberta clicáveis (já implementado) para refazer escolhas sem perder o resto.

**Seção 1 — Conjunto base**:
- Hero editorial atual (`StepBase`) + seletor de acabamento inline.
- Card lateral de upgrade (se existir) integrado como **alternativa visual lado a lado** ao invés de etapa separada — o usuário vê "Sua escolha vs. Versão maior" e troca com um clique. Mata a etapa Upgrade.

**Seção 2 — Complementos** (`StepComplementos` simplificado):
- Mesma grid de cards atual, mas dentro de `<section id="complementos">`.
- Sem header de "Etapa 06" — vira `<h3>` "Complementos · peças que somam ao conjunto".
- Sem `GuideStepFooter` (não navega mais).

**Seção 3 — Itens autorais** (`StepCasa` simplificado):
- Mesma grid de cards atual, dentro de `<section id="autorais">`.
- Mesmo tratamento: vira `<h3>`, sem footer.

**Fechamento**:
- CTA grande "Finalizar orçamento" no fim da página E no rail direito (já existe "Ver orçamento completo").
- Conteúdo do `StepFechamento` (próximos passos, gerar PDF) vira modal/drawer disparado pelo CTA, não etapa separada.

**Rail direito (`GuideAssemblySummary`)**:
- Adiciona índice de seções no topo (3 links âncora com check quando a seção tem item adicionado).
- Mantém lista de itens, total e CTA.

## Mudanças técnicas

- `guideStore.ts`: `GuideStep` reduzido para `intro | tipo | area | protagonismo | composicao | configurar | especial`. Adapta `back()`, `getProgressSteps()` para mostrar 5 bolinhas (4 descoberta + 1 configurar).
- `BuyingGuide.tsx`: novo branch `step === "configurar"` que renderiza `<GuideConfigurator />` no lugar dos 5 branches atuais. Validação de URL atualizada.
- Novo componente `src/components/guide/GuideConfigurator.tsx`: orquestra as 3 seções + IntersectionObserver para destacar a ativa no rail.
- Novo `src/components/guide/sections/SectionConjunto.tsx`, `SectionComplementos.tsx`, `SectionAutorais.tsx`: refatoração de `StepBase`, `StepComplementos`, `StepCasa` removendo headers de etapa e footers de navegação. Lógica de upgrade absorvida no `SectionConjunto` (cartão lateral).
- Novo `src/components/guide/FinalizarDrawer.tsx`: extrai conteúdo de `StepFechamento` para drawer.
- `GuideAssemblySummary.tsx`: adiciona `<SectionIndex />` no topo (3 âncoras com badge de contagem).
- `GuideProgress.tsx`: continua funcionando com a lista reduzida (5 itens).
- Remove arquivos: `StepUpgrade.tsx` (lógica migra), `StepFechamento.tsx` (lógica migra para drawer). `StepBase`/`StepComplementos`/`StepCasa` ficam até a refatoração e depois são removidos quando substituídos pelas Sections.

## Fora do escopo
- Mudanças nas 4 etapas de descoberta (Onde/Tamanho/Protagonismo/Composição) — já funcionam.
- Mudanças no carrinho, checkout, painel admin, PDF.
- Mudanças no `guideMap.ts` (dados dos conjuntos).
