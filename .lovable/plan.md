## Objetivo
Pequenos ajustes visuais no `CartDrawer` e `DeliveryInfo` — sem mexer em lógica, paleta ou tipografia base.

## Mudanças

### 1. Mais espaço para os produtos
`src/components/layout/CartDrawer.tsx`
- Reduzir padding vertical do header (`pt-6 md:pt-8 pb-5 md:pb-6` → `pt-5 md:pt-6 pb-4`).
- Reduzir padding do bloco de totais (`py-6` → `py-5`) e `space-y-4` → `space-y-3`.
- Lista de itens: `space-y-6` → `space-y-5` e `py-6` → `py-5` no scroll container.
- Resultado: ~40–60px a mais visíveis para os cards de produto sem reflow.

### 2. Subtotal com mais presença
- Trocar a linha do subtotal por um bloco com hierarquia melhor:
  - Label "Subtotal" continua em mono uppercase pequeno.
  - Valor passa de `font-display text-2xl` → `font-display text-3xl md:text-[2rem] tracking-wide tabular-nums text-western-gold-soft`.
  - Adicionar abaixo, em `text-[11px] text-western-cream-muted`: "Frete e impostos calculados no checkout".

### 3. Métodos de pagamento (Pix, Boleto, Cartão)
- Logo abaixo do subtotal, antes do bloco Entrega, adicionar uma linha discreta:
  - Texto em mono `[10px]` uppercase: "Pagamento" + 3 pílulas finas (`border border-western-gold/25 px-2 py-1 text-[11px]`): **Pix**, **Boleto**, **Cartão até 12x**.
  - Sem ícones de bandeiras (mantém o tom artesanal). Cor `text-western-cream/85`.

### 4. Bloco Entrega mais compacto
`src/components/cart/DeliveryInfo.tsx`
- Reduzir padding (`p-4 md:p-5` → `p-3.5 md:p-4`) e `space-y-4` → `space-y-2.5`.
- `space-y-3` interno → `space-y-2.5`, `pt-3` dos divisores → `pt-2.5`.
- Encurtar copy:
  - "Retirada gratuita no ateliê" — manter; subtítulo em **uma linha só**: `endereço · cidade/UF · horário (agendamento)`.
  - "Envio para todo o Brasil" — subtítulo: "Frete calculado no checkout."
- Bloco de peças >100 kg: mantém condicional, mas com `pt-2.5` e copy enxuta.

## Fora de escopo
- Edge function `yampi-calc-frete` (segue inativa).
- Lógica de checkout, auth, mínimos.
- Cores, fontes globais, ícones novos.
