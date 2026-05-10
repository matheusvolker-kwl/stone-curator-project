# Refatorar Guia de Composição em 3 telas roteadas

Substitui completamente o wizard atual (`StepShell`, `GuideConfigurator`, `ConjuntoHero`, `ConjuntoUpgrade`, `SectionComplementos`, `SectionAutorais`, `GuideAssemblySummary`, `FinalizarDrawer`, `StepArea`, `StepOnde`, `StepProtagonismo`, `StepComposicao`) por uma experiência de 3 rotas próprias, mantendo o mapa de produtos (`src/data/guideMap.ts`) e o `cartStore`.

## Rotas

```text
/guia-de-composicao                                → Tela 1 (contexto)
/guia-de-composicao/composicoes                    → Tela 2 (3 caminhos)
   ?tipo=lago&area=8&acabamento=moledo&variante=somenteWestern
/guia-de-composicao/refinar/[handle]               → Tela 3 (builder)
   ?acabamento=moledo
/guia-de-composicao/finalizar                      → revisão (já existe FinalizarDrawer; vira página simples)
```

Estado **somente em query params** — sem persistência local. Voltar pelo browser preserva contexto. A rota antiga `/guia-de-compra` redireciona para `/guia-de-composicao`.

## Mapeamento dos 5 tipos do prompt → dados existentes

O prompt pede 5 tipos visuais, mas o `guideMap` tem 3. Mapeamos assim **sem mexer nos dados**:

| Card visual          | tipo (data) | variante              |
|----------------------|-------------|-----------------------|
| Piscina              | piscina     | —                     |
| Lago                 | lago        | somenteWestern        |
| Lago Reduzido        | lago        | comNaturais           |
| Jardim com Fonte     | jardim      | comFonte              |
| Jardim Seco          | jardim      | seco                  |

## Telas

### Tela 1 — `pages/guia/Contexto.tsx`
- Header minimalista próprio (logo Western + link "Sair do guia") — não usa `SiteLayout`.
- Hero editorial + 3 perguntas verticais (sem stepper):
  1. **Tipo de ambiente** — grid 5 cards (mobile 2col + último full).
  2. **Área aproximada** — input numérico grande underline-only, sufixo `m²`, validação 1–200.
  3. **Acabamento dominante** — grid 4 cards com chip de cor (Quartzo `#E8DFC8`, Arenito `#C9A57B`, Moledo `#8B5E3C` + tag "+ VENDIDO", Granito `#2D332E`).
- CTA "Ver composições" alinhado à esquerda; disabled até as 3 estarem respondidas; ao tentar avançar incompleto, scroll + highlight da pergunta pendente.
- Microcopy "Falar com consultor" → WhatsApp (`whatsappConsultor`).

### Tela 2 — `pages/guia/Composicoes.tsx`
- Lê query params; deriva `tamanhoId` via `m2ToTamanhoId`. Se `consultor`, mostra bloco "Acima de 200 m² / fora da faixa → Falar com consultor".
- Título dinâmico: "Para um lago de 8 m² no Moledo, três caminhos." (mapa de copy por tipo).
- Grid 3 colunas dos 3 níveis (Essencial / Equilibrado ⭐ / Completo). Cards com imagem placeholder, eyebrow `NÍVEL · N PEÇAS`, nome, microcopy, lista de peças (placeholder de composição genérica baseada no nível), preço (já com 3% off no `guideMap`), microcopy de economia calculada (`preco/0.97 - preco`, oculta se < R$ 50), CTA "Personalizar esta composição →".
- Card central com borda 2px `--accent-dark` + tag "MAIS ESPECIFICADO".
- Bloco rodapé: "começar do zero" (link para Tela 3 com handle `null`) + "falar com consultor".
- Breadcrumb "← Voltar · Contexto do projeto".

### Tela 3 — `pages/guia/Refinar.tsx`
Substitui `GuideConfigurator` inteiro. Layout grid `1fr 380px` desktop; coluna única + drawer-rodapé sticky em mobile.

**Coluna esquerda:**
1. **Cabeçalho** — eyebrow + nome do conjunto + tags (tipo, faixa m², nível, acabamento) + subtítulo + link discreto "↗ Trocar de composição" (volta Tela 2).
2. **Peças desta composição** — lista linha-por-linha com imagem 80×80, nome, microcopy técnica, preço, stepper `− qty +`, link "REMOVER ×" com confirmação inline. Inicializa com peças sintéticas derivadas do nível (Essencial: 4–6, Equilibrado: 7–11, Completo: 12+) — placeholder consistente até peças reais virem do Shopify.
3. **Adicionar itens autorais** — grid 2 col de cards, filtrado por contexto:
   - Lago / Lago Reduzido: LED, Sonora, Champanheira
   - Piscina: LED, Sonora, Champanheira, Torneira
   - Jardim com Fonte: LED, Champanheira, Torneira, Pisadas
   - Jardim Seco: Pisadas, Fósseis, Painel, LED
   - Botão alterna "+ ADICIONAR AO PROJETO" / "✓ NO PROJETO ×".
4. **Trocar acabamento** (collapsible) — mesmo grid 2×2, aviso "TROCAR O ACABAMENTO RECALCULA O PROJETO INTEIRO."

**Coluna direita — painel sticky `top-32`:**
- Eyebrow + nome + acabamento.
- Lista compacta "COMPOSIÇÃO BASE" e "PEÇAS ADICIONADAS".
- Subtotais (composição, adicionais, desconto 3%).
- Total em serif 28px.
- Microcopy "PEDIDO ÚNICO · FRETE OTIMIZADO".
- CTA primário "REVISAR E FINALIZAR PROJETO →" (height 52).
- Secundário "↓ BAIXAR PRÉVIA EM SKETCHUP" (placeholder; gera arquivo vazio ou abre toast).
- Link "Salvar projeto e decidir depois" (logado → toast/save futuro; deslogado → modal login).
- **Estado deslogado**: usa `<PriceGate>` para esconder preços; mantém estrutura visível e botão "ACESSAR PARA VER PREÇO" / "SOLICITAR CADASTRO B2B".

**Mobile:** painel vira barra fixa `bottom-0 h-20` com nome + total + "VER PROJETO (X)"; tap abre `Sheet` full-screen.

## Componentes novos

```text
src/components/guide-v2/
  GuideHeader.tsx              # logo + "Sair do guia" + breadcrumb opcional
  TipoCard.tsx                 # card de ambiente (Tela 1)
  AreaInput.tsx                # input underline com sufixo m²
  AcabamentoCard.tsx           # card de acabamento com chip de cor
  ComposicaoCard.tsx           # card grande dos 3 caminhos (Tela 2)
  PecaRow.tsx                  # linha de peça com stepper (Tela 3)
  AutoralCard.tsx              # card de item autoral (Tela 3)
  ProjetoSidebar.tsx           # painel sticky / drawer mobile
  useGuideQuery.ts             # hook para ler/escrever query params tipados
  pecasPlaceholder.ts          # gera lista sintética de peças por nível
  autoraisCatalog.ts           # catálogo dos 15 itens autorais + filtro por tipo
```

## Páginas

```text
src/pages/guia/
  Contexto.tsx
  Composicoes.tsx
  Refinar.tsx
  Finalizar.tsx     # revisão simples reutilizando o conteúdo do FinalizarDrawer atual
```

`App.tsx`:
- Adicionar 4 rotas novas **fora** do `<SiteLayout>` (header próprio).
- `/guia-de-compra` → `<Navigate to="/guia-de-composicao" replace />`.
- Atualizar todos os links internos para `/guia-de-composicao`.

## Design system

Tokens já existem em `index.css` / `tailwind.config.ts` (western-cream, western-green-deep, western-gold, western-stone-warm, etc.). Mapear o vocabulário do prompt:
- `--bg-primary` → `western-cream`
- `--accent-dark` → `western-green-deep`
- `--accent-warm` → `western-gold`
- `--text-primary` → `western-ink`/`foreground`
- Eyebrows continuam usando `text-eyebrow` (JetBrains Mono).
- Botões: `btn-gold` para CTAs primários, novo helper `btn-dark` (verde-musgo) para o "Ver composições" e "Personalizar".

## Limpeza

Após a nova `/guia-de-composicao` funcionar, **remover**:
- `src/pages/BuyingGuide.tsx`
- `src/components/guide/` inteiro (Step*, GuideConfigurator, ConjuntoHero, ConjuntoUpgrade, SectionComplementos, SectionAutorais, GuideAssemblySummary, FinalizarDrawer, StepShell, GuideProgress, OptionCard, GuideConsultor, GuideEspecial, SketchLeadModal, GuideProductQuickView, svg/MoodSvg).
- `src/stores/guideStore.ts` + `guideStore.test.ts` (estado migra para query params).
- `MoodSvg` e assets só usados pelo guia velho.

Mantidos: `src/data/guideMap.ts` (fonte de verdade dos 45 conjuntos), `src/components/product/FinishSelector.tsx`, `cartStore`, `PriceGate`.

## Fora de escopo

- Integração real com peças do Shopify para a lista da composição (usamos placeholder estruturado).
- Geração real do SketchUp (botão visual + toast "em breve").
- Página `/finalizar` rica — entrega versão mínima reusando lógica do `FinalizarDrawer` atual.
- Salvamento de projetos no backend (apenas hook do botão).
