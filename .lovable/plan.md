## Objetivo

Eliminar a ambiguidade do "a partir de", consolidar tipografia/posicionamento do bloco de compra (preço, CTA, sinais de entrega, link de pintura personalizada, seletor de acabamento) e aproximar a PDP de um padrão e-commerce funcional.

## Diagnóstico (com base nas imagens)

1. **Preço** mostra "a partir de R$ 1.235,00" antes da escolha de acabamento — confunde, parece que o preço pode subir, e o estilo (cents/currency reduzidos) destoa do resto.
2. **CTA "Adicionar ao pedido"** é o elemento mais importante da página, mas usa fonte mono pequena (text-xs) e o texto fica diluído pelo tracking enorme.
3. **DeliverySignals** e **link de pintura personalizada** competem com o CTA: ambos em mono uppercase com pesos visuais parecidos.
4. **Acabamento card "+ vendido"** funciona bem — manter.

## Mudanças

### 1. Preço cheio sempre (sem "a partir de")

`src/pages/ProductPage.tsx` — bloco do preço:
- Remover o fallback `a partir de ...` e a renderização condicional de `<PriceDisplay>` vs `<p>`.
- Mostrar **sempre** o preço da variante atual; quando nenhuma variante estiver selecionada, usar `product.priceRange.minVariantPrice` (mesmo valor, mas sem o prefixo "a partir de").
- Tipografia: usar a mesma fonte/peso do resto da PDP. Substituir `text-price` (que tem cents/currency reduzidos) por uma renderização única, plana:
  - `font-sans font-semibold tabular-nums text-[2rem] md:text-[2.25rem] leading-none text-western-green-deep`
  - "R$" no mesmo tamanho do número, sem opacity nem vertical-align.
  - Centavos no mesmo tamanho (sem reduzir).
- Remover a função `PriceDisplay` interna.
- Linha de apoio: substituir "À vista · condição parceiro" por algo mais funcional/curto: **"Preço parceiro · à vista"** em `text-meta`.

### 2. CTA "Adicionar ao pedido" otimizado

`src/pages/ProductPage.tsx` (botão principal) e `src/index.css` (utilitário novo se útil):
- Aumentar peso visual: `h-14` (era h-12), `font-sans font-medium text-sm tracking-[0.05em]` (não-uppercase) — padrão e-commerce.
- Texto: **"Adicionar ao pedido"** em case normal (não uppercase), mais legível.
- Cor: manter dourado, mas com sombra sutil no hover (`hover:shadow-md`) para reforçar affordance.
- Estado pendente: manter cinza, mesmo tipo, texto "Selecione o acabamento".
- Stepper de quantidade: alinhar a `h-14` para ficar do mesmo tamanho do botão.

### 3. Hierarquia/posicionamento do bloco de compra

Nova ordem (mais e-commerce, menos editorial):

```text
Eyebrow coleção
H1 Título
SKU
Blurb curto

────────────────────────
PREÇO grande (sempre cheio)
linha de apoio
────────────────────────
Acabamento (obrigatório)
Outras opções
────────────────────────
[Stepper] [Adicionar ao pedido] [♡]
DeliverySignals (compactos, abaixo do CTA)
Link discreto: pintura personalizada
```

Justificativas:
- **Preço acima das opções**: usuário decide se vale o ticket antes de escolher acabamento (padrão Shopify/Amazon/IKEA).
- **CTA logo após as opções**: fluxo de decisão linear.
- **Sinais de entrega abaixo do CTA**: reforço pós-decisão, não distração.
- **Pintura personalizada**: rodapé do bloco, nunca compete com CTA.

### 4. Tipografia dos elementos auxiliares

- **DeliverySignals** (`src/components/product/DeliverySignals.tsx`): reduzir peso visual — manter mono, mas trocar uppercase + tracking grande por **case normal**, `text-[11px] tracking-normal text-western-stone-warm/80`. Ícones em `text-western-stone-warm/60` (não dourado, para não competir com CTA).
- **Link "Pintura personalizada"**: manter mono pequeno, mas alinhar à esquerda e adicionar separador `·` discreto antes do "falar com consultor". Já está bom — apenas verificar contraste.
- **Eyebrow "Acabamento · obrigatório"**: manter como está (funciona).

### 5. Remoções

- Função `PriceDisplay` em `ProductPage.tsx` (não mais necessária).
- Classes `.text-price-cents` e `.text-price-currency` em `index.css` (não usadas após a mudança).

## Fora de escopo

- StickyBuyBar (mantém preço atual; revisar em próxima iteração se necessário).
- Cores do design system.
- Outras páginas/componentes.
- Lógica de variantes/queries.

## Arquivos afetados

- `src/pages/ProductPage.tsx` (preço, CTA, ordem do bloco, remover `PriceDisplay`)
- `src/components/product/DeliverySignals.tsx` (tipografia mais discreta)
- `src/index.css` (limpar tokens de preço não usados)
