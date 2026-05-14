## Diagnóstico
Hoje no rodapé do drawer competem por espaço: Subtotal, Pagamento (3 pílulas), bloco Entrega (caixa com borda + 2 linhas + endereço completo), linha Produção/+30 anos, e os 2 CTAs. Isso empurra a lista de produtos pra cima e some no scroll.

## Princípio
Comprimir tudo que **não é** lista de produtos / botão / preço para o mínimo legível. Frete e pagamento viram **microcopy de uma linha**, não bloco visual.

## Mudanças

### 1. `DeliveryInfo` → some como bloco
- Remover a caixa com borda inteira.
- Substituir por **uma linha única** logo abaixo do subtotal (sem ícone Truck grande, sem título "ENTREGA"):
  - `text-[11px] text-western-cream-muted`: 
    `Retirada grátis no ateliê (Cajamar/SP) · Envio para todo o Brasil · Frete no checkout`
- Bloco de peças >100kg: vira **link inline discreto** ("Peça pesada? Falar no WhatsApp") em vez de caixa.

### 2. Pagamento → uma linha, sem pílulas
- Remover as 3 pílulas com borda.
- Substituir por linha única em `text-[11px] text-western-cream-muted`:
  `Pagamento: Pix · Boleto · Cartão até 12x`
- Pode ficar na **mesma linha** da entrega, separadas por `·`, se couber. Plano: duas linhas empilhadas, sem espaçamento extra.

### 3. Linha "Produção 15 dias / +30 anos no atelier"
- Remover do rodapé. Esses sinais de confiança já aparecem em outros pontos do site e estão competindo com o CTA. Se quiser manter um, fica só "Produção 15 dias" como microcopy abaixo do botão.

### 4. CTA secundário "Baixar composição (PDF)"
- Manter, mas reduzir altura `h-11` → `h-10` e `text-[13px]` → `text-[12px]`.

### 5. Espaçamentos do rodapé
- `space-y-3` → `space-y-2.5`.
- `py-5` → `py-4`.

## Resultado esperado
Rodapé do drawer cai de ~6 blocos para 4: **Subtotal grande → microcopy frete+pagamento (2 linhas) → Finalizar compra → Baixar PDF**. Lista de produtos ganha ~80–100px.

## Fora de escopo
- Header, lista de itens, cross-sell, lógica de checkout, paleta, fontes.
- `DeliveryInfo.tsx` continua existindo (caso queira reaproveitar fora do drawer), mas não será mais importado no `CartDrawer`.
