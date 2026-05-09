## Problema

Hoje a navegação termina em "Resultado" e o `UpsellGrid` aparece empilhado abaixo. O cliente precisa rolar a página para descobrir e adicionar complementos, upgrade e itens autorais — boa parte simplesmente não vê. O upsell não está integrado ao passo a passo.

## Decisão

Tratar a montagem do carrinho como **continuação do guia**, não como página final. Cada camada de upsell vira uma "etapa de fechamento" dentro do mesmo wizard, com a `GuideProgress` acompanhando e CTAs explícitos de "Avançar".

## Novo fluxo de etapas

Atual (4–5 etapas, depois resultado solto):
```
Onde → Área → Protagonismo → [Composição] → Resultado (rolagem livre)
```

Proposto:
```
Onde → Área → Protagonismo → [Composição]
  → 05 Conjunto base       (escolher acabamento + adicionar)
  → 06 Complementos        (Camada 01)
  → 07 Upgrade             (Camada 02 — pula se não houver upgrade aplicável)
  → 08 Assinatura da casa  (Camada 03)
  → 09 Fechamento          (resumo do orçamento + CTAs finais)
```

A `GuideProgress` passa a mostrar essas etapas extras com check verde conforme o cliente avança. Cada etapa cabe em uma tela (sem precisar rolar para encontrar o próximo passo).

## Comportamento de navegação

- Cada etapa tem rodapé fixo com **"Pular"** (link discreto) e **"Avançar"** (botão dourado). Adicionar um item NÃO avança automaticamente — o cliente decide.
- Botão "Avançar" muda de copy conforme há ou não item adicionado naquela camada: *"Avançar sem complementos"* vs *"Avançar com 3 complementos"*.
- Trocar de etapa faz `scrollIntoView({ block: 'start' })` no container do wizard, garantindo que o topo da nova etapa fique sempre no viewport.
- Barra de progresso continua clicável para voltar a qualquer etapa anterior já preenchida (já existe esse padrão).
- Resumo persistente do carrinho: chip flutuante no topo da etapa mostrando "Orçamento parcial: R$ X · N itens" com link para abrir o drawer — assim o cliente sente o carrinho crescendo sem perder o lugar no fluxo.

## Etapa 09 — Fechamento

Tela única com:
- Resumo enxuto do orçamento (lista de itens + total).
- Botões: **Baixar prancha técnica (PDF + .skp)**, **Falar com consultor (WhatsApp)**, **Abrir orçamento completo**.
- "Refazer guia" como link secundário.

Isso resolve o problema de o lead-magnet e o WhatsApp ficarem escondidos no meio da página de resultado.

## Lógica de "skip" inteligente

- **06 Complementos**: pula se `complementosPorTipo[tipo]` estiver vazio.
- **07 Upgrade**: pula se `resolveUpgrade(answers)` retornar null OU se o cliente já está no nível `completa`.
- **08 Casa**: sempre mostra (catálogo fixo).

A `GuideProgress` só renderiza as etapas efetivamente aplicáveis para aquele cliente, evitando barra com etapas "fantasma".

## Mudanças técnicas

1. **`src/stores/guideStore.ts`**: estender o tipo `GuideStep` com `'base' | 'complementos' | 'upgrade' | 'casa' | 'fechamento'`. Adicionar helpers `nextStep(state)` e `prevStep(state)` que respeitam os skips. Atualizar `getProgressSteps(tipo)` para retornar as etapas extras.

2. **`src/pages/BuyingGuide.tsx`**: substituir o bloco único `step === "resultado"` por um switch sobre as novas etapas. Cada etapa renderiza um componente dedicado dentro do mesmo `StepShell`.

3. **Refatorar `UpsellGrid.tsx`**: quebrar em 3 componentes-step independentes:
   - `StepBase.tsx` (extrai a coluna direita do `GuideResultado` atual: galeria + acabamento + CTA "adicionar conjunto")
   - `StepComplementos.tsx` (Layer A atual, em página inteira)
   - `StepUpgrade.tsx` (Layer B atual, em página inteira)
   - `StepCasa.tsx` (Layer C atual, em página inteira)
   - `StepFechamento.tsx` (resumo + lead-magnet + WhatsApp)

   `UpsellGrid.tsx` é deletado (sua lógica vira essas steps).

4. **Novo `GuideStepFooter.tsx`**: componente reutilizável com botões "Voltar / Pular / Avançar", contagem dinâmica de itens da etapa atual e total parcial do carrinho (lê de `useCartStore`).

5. **`GuideResultado.tsx`**: deixa de ser tela única; vira o conteúdo de `StepBase` + recebe redirecionamento para `StepFechamento` na conclusão.

6. **`GuideProgress.tsx`**: já suporta a lista dinâmica — só precisa receber as novas etapas via `getProgressSteps`. Em mobile, mostrar barra horizontal scrollável quando passar de 6 etapas.

## Fora do escopo deste sprint

- Migração para Shopify Metafields (continua adiada).
- Salvamento do orçamento parcial no backend (Cloud).
- Personalização do upgrade por nível atual (já existe lógica simples; refinar depois).

## Resultado esperado

O cliente nunca precisa "descobrir" o upsell. Cada camada é uma decisão explícita com Avançar/Pular, a barra superior mostra o progresso da montagem do carrinho, e o orçamento parcial fica visível o tempo todo. A conversão de complementos e upgrade deve subir porque o caminho passa obrigatoriamente por cada oferta.