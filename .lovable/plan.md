## Diagnóstico do que está fraco hoje

1. **Perguntas pedem ao cliente o que ele não sabe.** "Nível de composição: Essencial / Equilibrada / Completa" é jargão interno. O parceiro B2B pensa em **estilo**, **uso**, **orçamento**, **quantidade de pedras** — não em "nível".
2. **Cards de opção são texto puro.** Sem imagem, sem referência visual, sem sensação de curadoria. Para uma marca que vende composição estética, isto é fatal.
3. **Sem progresso visual real.** "Etapa 2 de 3" é correto mas frio — não dá sensação de jornada.
4. **O resultado é uma página parada.** Mostra um único produto/imagem e joga para fora (Shopify externo). Não revela o que compõe o conjunto, não permite comprar dali, não sugere acabamento.
5. **Upsell desconectado.** Hoje são links para coleções externas. Deveria ser "complete o conjunto" — produtos avulsos que somam ao mesmo carrinho.
6. **Sem ação de venda.** O CTA principal (`Ver conjunto completo`) abre Shopify em outra aba. Quebra a operação B2B; o parceiro perde o contexto e o carrinho local.

## Visão da nova experiência

Wizard com três pilares:
- **Linguagem por intenção.** Substituir "nível de composição" por perguntas concretas sobre uso, estilo e densidade visual. Mapear internamente para `essencial | equilibrada | completa`.
- **Cards visuais.** Cada opção tem miniatura (foto/ilustração) + título + 1 frase. Hover revela detalhe.
- **Resultado que vende.** Galeria do conjunto, lista das peças que o compõem (cada uma com preço e quantidade), seletor de acabamento global, **"Adicionar conjunto ao carrinho"** que despeja todos os itens no carrinho local (já temos `addBundle` no `cartStore`), e upsell logo abaixo com "+" para adicionar ao mesmo carrinho.

## Fluxo revisado

```text
Intro (hero forte, foto de referência, 1 CTA "Compor meu projeto")
  │
  ▼
1. Para qual ambiente? ........... Lago • Piscina • Jardim   (cards com foto)
  │
  ▼
2. Qual o tamanho da área? ....... faixas com ícone de escala
  │
  ▼
3a. (Lago) Vai usar pedras naturais junto?      Sim, complemento • Não, só Western
3b. (Jardim) O jardim terá água?                Seco • Com fonte
  │
  ▼
4. Qual o estilo do projeto? ..... cards visuais — mapeia para "nivel"
     • "Clean e econômico"          → essencial
     • "Equilibrado e marcante"     → equilibrada
     • "Cenográfico, alto impacto"  → completa
   (cada card tem foto-mood + faixa de orçamento estimada para ancorar)
  │
  ▼
5. Resumo + Resultado
     [Galeria do conjunto]   [Card de venda]
                              - Eyebrow + nome + subtítulo
                              - Preço total do conjunto
                              - Seletor de acabamento (Quartzo/Arenito/Moledo/Granito)
                              - "Peças incluídas" (lista com qty + preço)
                              - [ Adicionar conjunto ao carrinho ]  (primário)
                              - [ Falar com consultor ]              (secundário)
                              - Política B2B (pedido min, prazo, frete)

     ── Complete sua composição ──
     Grid de produtos avulsos contextuais, cada card com "+ Adicionar"
     (vai pro mesmo carrinho)

     [ Refazer guia ]   [ Salvar / compartilhar link ]
```

## Mudanças concretas

### Conteúdo / linguagem
- `nivelLabels` ganham **rótulos voltados ao usuário**: "Clean", "Equilibrado", "Cenográfico" + 1 frase + faixa de preço de referência ("a partir de R$ X").
- Texto da pergunta de tamanho ganha referência de uso ("Equivale a uma área aprox. de uma vaga de garagem", etc.).

### Cards visuais
- `OptionCard` reformulado com slot para `image` (string URL) e badge opcional (preço estimado, ícone). Mantém variante texto-puro para perguntas binárias.
- Imagens iniciais: usar fotos já existentes em `src/assets` ou da Shopify (queremos o handle do produto-âncora de cada opção para puxar a imagem via Storefront).

### Progresso
- Substituir "Etapa 2 de 3" por uma **trilha horizontal** com 4–5 pontos, marcando concluídos (preenchidos), atual (com anel dourado) e futuros (vazios). Mobile colapsa para "2 / 5".
- Mostrar **breadcrumb das respostas anteriores** no topo (ex.: "Lago · 4–10 m² · Western + naturais"), clicável para voltar a qualquer etapa.

### Resultado — peça central
- Adicionar ao `guideMap` o array `composto: Array<{ handle, qty }>` em cada `ConjuntoLeaf` (handles dos produtos individuais que formam o kit).
- Buscar via `fetchProductsByHandles` (já existe) → renderizar:
  - **Galeria** (até 4 imagens, mosaico).
  - **Lista de peças** com thumb, nome, qty, preço unitário, subtotal.
  - **Total recalculado** a partir dos preços reais (fallback no `preco` do guideMap).
- **Seletor de acabamento** global: ao trocar, troca a `variantId` selecionada de cada peça (todas as peças da Western têm a mesma opção "Acabamento").
- **CTA primário "Adicionar conjunto ao carrinho"**: chama `useCartStore.addBundle(items)` com cada peça. Toast de sucesso + abre `CartDrawer`.
- CTA secundário "Falar com consultor" (WhatsApp já com o nome do conjunto e acabamento escolhido).
- Texto pequeno: "Você poderá ajustar quantidades no carrinho."

### Upsell consultivo
- Trocar `upsellMap` (que aponta para coleções externas) por **lista curada de produtos por tipo+nível** com handles reais. Cada card:
  - Imagem + nome + preço (Storefront).
  - Botão "+ Adicionar" → entra no mesmo carrinho.
  - Link discreto "Ver detalhes" → PDP interna (`/produto/[handle]`, já existe).

### Persistência e compartilhamento
- Serializar respostas em querystring (`?t=lago&s=4-a-10&c=somenteWestern&n=equilibrada`) para o resultado ser compartilhável e o "Voltar do navegador" funcionar.
- Ler querystring no mount → pular direto para o resultado se completo.

### Componentes (estrutura)

```text
src/pages/BuyingGuide.tsx                (rewrite leve: roteia querystring → wizard ou resultado)
src/components/guide/
  GuideIntro.tsx                          (hero + CTA, NEW)
  GuideProgress.tsx                       (trilha + breadcrumb, NEW)
  GuideWizard.tsx                         (extraído de BuyingGuide, controla steps)
  StepShell.tsx                           (atualizado: usa GuideProgress, remove "Etapa X de Y" textual)
  OptionCard.tsx                          (atualizado: image, badge, layout vertical)
  steps/
    StepAmbiente.tsx                      (NEW; cards visuais Lago/Piscina/Jardim)
    StepTamanho.tsx                       (NEW; cards com ícone de escala)
    StepComposicao.tsx                    (NEW; lago)
    StepJardim.tsx                        (NEW; jardim)
    StepEstilo.tsx                        (NEW; substitui StepNivel; intent-based)
  GuideResultado.tsx                      (rewrite: galeria + peças + acabamento + add bundle)
  ConjuntoPecasList.tsx                   (NEW; lista de itens com qty/preço)
  AcabamentoSelector.tsx                  (NEW; reusa lógica de FinishSelector se aplicável)
  UpsellGrid.tsx                          (rewrite: produtos reais com Add to cart)
  GuideConsultor.tsx                      (mantém, ganha mock de "o que esperar")
```

### Dados (`src/data/guideMap.ts`)
- Adicionar campos:
  - `image?: string` (mood/foto da opção, para os cards de etapa)
  - `composto: Array<{ handle: string; qty: number }>` em cada `ConjuntoLeaf`
  - `nivelMeta: { label: string; tagline: string; faixaPreco: string; image: string }` por tipo
- Adicionar helper `buildBundleItems(conjunto, products, acabamento)` → retorna array pronto pro `addBundle`.

### Carrinho
- `useCartStore.addBundle` já existe — usar.
- Após adicionar bundle: `toast.success("Conjunto adicionado ao carrinho")` + abrir CartDrawer (expor `setOpen` global ou usar evento custom — checar `CartDrawer.tsx` na implementação).

### Acessibilidade / responsivo
- Cards visuais com `aria-label` descritivo, foco visível dourado, navegação por teclado.
- Mobile: cards 1 coluna, galeria do resultado vira carrossel simples, peças em lista vertical.
- Trilha de progresso colapsa para "Etapa N de Total" + chevrons.

### Não-objetivos / o que NÃO muda
- Decision tree (handles dos conjuntos) e WhatsApp permanecem.
- Caminho consultivo (`acima-20`/`acima-60`) continua, só ganha visual mais consultivo (foto + bullets do que o cliente recebe).
- `Conjuntos.tsx` continua como está.

## Riscos e validações antes de codar
- Confirmar que cada `handle` de produto-peça citado em `composto` realmente existe no Shopify. Plano: na implementação, listar handles distintos e rodar `shopify--list_products` ou `fetchProductsByHandles` para validar; se algum não existir, esconder a peça com fallback "consultar disponibilidade" (sem quebrar UX).
- Imagens das opções: na primeira passada usar **placeholders SVG estilizados** (mesmo padrão verde+dourado do `PlaceholderImg` atual), com hook claro para trocar por foto real depois. Evita parecer "vazio" sem inventar fotos.

## Entrega em ondas

**Onda 1 — Linguagem + visual do wizard (alto impacto, baixo risco)**
- Reescrever rótulos de "nível" → estilo + tagline + faixa de preço.
- `OptionCard` com imagem/placeholder + badge.
- `GuideProgress` com trilha + breadcrumb clicável.
- Steps refatorados para os novos rótulos.

**Onda 2 — Resultado que vende**
- Adicionar `composto` ao `guideMap`.
- `ConjuntoPecasList`, `AcabamentoSelector`, novo `GuideResultado` com galeria, total real e **Adicionar conjunto ao carrinho** (`addBundle` + toast + abrir drawer).

**Onda 3 — Upsell + persistência**
- `UpsellGrid` com produtos reais e botão "+ Adicionar".
- Querystring persistente / compartilhável.
- Polimento mobile e microcopy B2B.

Aprovação para seguir nesta direção? Se quiser, posso ajustar os rótulos da Etapa 4 (estilo) antes de implementar — me diz se prefere "Clean / Equilibrado / Cenográfico", ou algo como "Discreto / Marcante / Imponente", ou outra dupla de palavras.
