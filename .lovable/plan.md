## Objetivo

Quatro melhorias de UX/visual na página de produto:
1. Tabela "Western × pedra natural" mais legível, sem o botão de orçamento
2. Modelo 3D / SketchUp como aba própria
3. Hierarquia tipográfica entre labels de seção e sub-labels
4. CTA "Adicionar ao pedido" com mais presença + micro-prova social ao lado

---

### 1. ProductComparison — refinar tabela, remover CTA

`src/components/product/ProductComparison.tsx`

- **Remover** o botão "Solicitar comparativo orçamentário" e o handler `onConsultor` (e o import `BUSINESS` se ficar órfão).
- **Reestruturar a linha** para ficar mais escaneável:
  - Coluna central (label) vira **rótulo de linha à esquerda**, full-width, com peso visual maior (sans medium, não mais font-mono uppercase apertado).
  - Duas colunas de comparação à direita, com **headers fixos** "Western" (verde-deep + dourado de marca) vs "Pedra natural" (stone-warm) — visualmente desbalanceadas a favor do Western (background `bg-western-paper/60` na coluna Western, transparente na coluna natural).
  - Linhas com `divide-y` discreto, sem zebra striping pesado.
- **Tipografia das células**: Western em `text-western-green-deep font-medium`, natural em `text-western-stone-warm/85 font-normal` — leitura imediata de "qual é o ganho".
- **Mobile**: empilhar como cards por linha (label em cima, duas colunas pareadas embaixo) em vez do layout 3-grid atual quebrado.
- **Adicionar uma linha-resumo** opcional no fim ("Resultado: projeto previsível, sem surpresa de obra") em italic pequeno.

### 2. ProductTabs — nova aba "Modelo 3D"

`src/components/product/ProductTabs.tsx`

- Adicionar 4ª aba: `{ v: "modelo3d", l: "Modelo 3D" }`.
- **Mover o bloco SketchUp** que hoje está dentro de `specs` (linhas com `Modelo 3D · SketchUp`, descrição e botão de download) para um novo `<TabsContent value="modelo3d">`.
- Expandir o conteúdo dessa aba: lead curto à esquerda explicando o valor (modelar antes de comprar, evitar surpresa em obra), CTA de download mais proeminente (botão `bg-western-gold` em vez de outline `bg-western-gold/10`), e à direita um bullet list curto: "O que está incluso" (geometria, escala 1:1, materiais base) + "Compatível com SketchUp Pro/Free 2020+".
- Ajustar `TabsList` para acomodar 4 itens (mantém `overflow-x-auto` em mobile).
- Remover do bloco specs apenas a sub-seção SketchUp; dimensões + ficha + observações continuam ali.

### 3. Hierarquia de labels

Decisão: **labels de aba/seção principal** (`text-eyebrow` no topo de cada `TabsContent`) ganham peso visual; **sub-labels** dentro dela ficam mais discretas.

- `src/index.css`: 
  - Manter `.text-eyebrow` atual como **sub-label** (mono, 10px, stone-warm).
  - Criar `.text-section-label` novo: mono 11px, `tracking-[0.28em]`, **cor `text-western-green-deep`** (cor de marca, não neutro), com um `border-l-2 border-western-gold pl-3` ou um pequeno traço dourado embaixo para sinalizar "seção principal".
- `src/components/product/ProductTabs.tsx`: trocar `text-eyebrow` para `text-section-label` apenas no **primeiro label de cada coluna principal** dentro de cada aba (ex.: "Composição & material", "Dimensões", "Produção & entrega", "O que vem na caixa", "Modelo 3D · SketchUp"). Sub-labels internos (rótulos C/L/A, "Estrutura/Interior oco/Pintura", "Produção/Entrega/Instalação") ficam com `text-eyebrow` mais leve (`opacity-70`).
- Resultado: na imagem 3 (várias labels na mesma viewport), o olho diferencia "isso é a seção" de "isso é um item dentro dela".

### 4. CTA + prova social ao lado do botão

`src/pages/ProductPage.tsx` (bloco 2.4 e 2.5)

- **Botão "Adicionar ao pedido"**:
  - Adicionar contraste: trocar `bg-western-gold` (que está se fundindo) para gradiente sutil `bg-gradient-to-b from-western-gold to-western-gold/90`, com `shadow-[0_2px_0_0_hsl(var(--western-green-deep)/0.15)]` (sombra "imprensa" estilo botão tátil), e `border-b-2 border-western-green-deep/20`.
  - Texto continua `font-sans font-medium text-[15px]`, mas adicionar um ícone discreto (ex.: `ArrowRight` ou `Plus`) à direita para reforçar ação.
  - Hover: leve `translate-y-px` + remover o shadow inferior (efeito de pressionado).
- **Micro-prova social** (novo componente leve, inline, **logo abaixo do CTA, antes de DeliverySignals**):
  - Linha discreta: avatar/inicial pequeno + frase curta. Algo como:
    > ★★★★★ "Chegou perfeito, instalação em 2h" — *Marcelo F., arquiteto*
  - Ou versão multi-prova rotativa estática: 2 selos lado a lado — `"Especificado por Faisal, Hayasaki, Luidi"` + `"Em projetos de Neymar Jr., Diogo Nogueira"` — em mono 10px stone-warm, com pequeno ícone de check/estrela dourado.
  - Implementar como novo componente `src/components/product/PurchaseProof.tsx` (~30 linhas) — reutiliza dados que já estão em `SocialProofBand` mas em formato compacto. Posicionar entre o bloco do CTA (2.4) e `DeliverySignals` (2.5).

### Detalhes técnicos

- Nenhuma mudança de dados/Shopify/Yampi.
- Sem mudanças em rotas, store, auth.
- Arquivos editados: `ProductComparison.tsx`, `ProductTabs.tsx`, `ProductPage.tsx`, `index.css`.
- Arquivos criados: `src/components/product/PurchaseProof.tsx`.
- Manter classes via design tokens (`western-gold`, `western-stone-warm`, etc.) — sem cores cruas.

### Fora de escopo

- StickyBuyBar (mantém o estilo atual).
- `SocialProofBand` full-width abaixo (continua existindo).
- Texto/copy das especificações.
- Lógica de variantes, preço, carrinho.
