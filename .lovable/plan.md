## Diagnóstico
A última iteração comprimiu demais: subtotal grande convive com duas linhas de microcopy `text-[11px]` empilhadas e cinzas, virou ruído. Falta hierarquia visual entre "preço", "como recebo / como pago" e "ação". Também sobrou um detalhe no header (`3 acabamentos`) que polui o resumo.

## Princípio
Três blocos, nessa ordem de peso visual:

1. **Preço** — protagonista, respira sozinho.
2. **Ação** — botão Finalizar compra logo abaixo, sem nada competindo.
3. **Selo de confiança** — uma linha discreta, equilibrada, com frete + pagamento separados por divisor visual (não por `·` espremido).

## Mudanças

### 1. Header do drawer — remover "3 acabamentos"
Em `CartDrawer.tsx`, na `SheetDescription`:
- **Antes:** `3 peças · 2 acabamentos`
- **Depois:** `3 peças`
- Remover variável `distinctFinishes` e a concatenação condicional. Ninguém precisa contar acabamentos nessa tela.

### 2. Rodapé — nova arquitetura

```text
┌─────────────────────────────────────────┐
│ SUBTOTAL                                │
│                          R$ 1.450,00    │  ← hero, font-display 2rem
│  Frete calculado no checkout            │  ← legenda discreta logo abaixo
├─────────────────────────────────────────┤
│ [  FINALIZAR COMPRA          →  ]       │  ← CTA primário
│                                         │
│  ◇ Pix    ◇ Boleto    ◇ Cartão até 6x   │  ← linha de pagamento, centralizada
│                                         │
│ [  Baixar composição (PDF)  ]           │  ← CTA secundário
└─────────────────────────────────────────┘
```

**Detalhes de execução:**

- **Bloco subtotal:** mantém o número grande (`font-display text-[2rem]`). A legenda `Frete calculado no checkout` vira `text-[11.5px] text-western-cream/60`, alinhada à direita, **logo abaixo do número** (não em linha separada com bullets). Sem competir com o preço.
  
- **Linha de pagamento:** sai do bloco de microcopy e vira **uma linha própria entre o CTA primário e o secundário**. Formato: três itens centrados horizontalmente, separados por espaço generoso, cada um precedido por um glifo discreto (◇ ou ponto sutil em `western-gold-soft/40`). Tipografia: `font-mono text-[10.5px] uppercase tracking-[0.18em] text-western-cream/70`. Texto: `Pix · Boleto · Cartão até 6x` (atualizado de 12x).

- **WhatsApp >100kg:** mantém como link discreto, mas só aparece quando relevante. Move para **abaixo** do CTA secundário, em `text-[11px] text-center text-western-cream/55`, sem destaque.

- **Espaçamento:** `py-5` no rodapé, `space-y-4` entre blocos (mais generoso que `space-y-2.5`). Divisor sutil (`border-t border-western-gold/10`) entre subtotal e CTA, e entre pagamento e CTA secundário — dá ritmo sem peso.

### 3. Tipografia e peso
- Subtotal: protagonista (já está bom).
- Pagamento: `font-mono` uppercase pequena, lê como "selo", não como informação operacional.
- Frete: itálico-leve em `text-western-cream/60`, lê como nota de rodapé do preço.

## Resultado esperado
Footer tem 4 elementos com hierarquia clara: **preço grande → CTA → selo de pagamento → CTA secundário**. A leitura é diagonal e óbvia. Microcopy não compete com preço. "3 acabamentos" some do header.

## Fora de escopo
Header (exceto remover acabamentos), lista de itens, cross-sell, lógica de checkout, paleta, fontes, edge functions.
