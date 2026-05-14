## Bloco de Frete no rodapé do carrinho

Hoje só temos `Frete calculado no checkout` em itálico minúsculo abaixo do subtotal — comunica pouco e some visualmente. Vamos transformar em um micro-bloco com ícone, hierarquia clara e duas linhas de informação, mantendo o subtotal como protagonista.

### Onde
`src/components/layout/CartDrawer.tsx` — substituir apenas o `<p className="text-right text-[11.5px] italic ...">Frete calculado no checkout</p>` que fica logo abaixo do subtotal (bloco do `isApproved`).

### Estrutura proposta

```text
┌───────────────────────────────────────────────────┐
│  🚚  FRETE                       Calculado no checkout │
│      Todo o Brasil · Retirada grátis em Cajamar/SP │
└───────────────────────────────────────────────────┘
```

- **Container:** linha sutil — `border border-western-gold/15 bg-western-green-deep/30 px-3 py-2.5`, sem ocupar muito espaço vertical (~52px).
- **Coluna esquerda:** ícone `Truck` (lucide, `h-4 w-4 text-western-gold-soft`) + label `FRETE` em `font-mono text-[10px] uppercase tracking-[0.22em] text-western-gold-soft/90`.
- **Coluna direita (alinhada ao topo):** `Calculado no checkout` em `font-sans text-[12px] text-western-cream`.
- **Linha inferior (full width, abaixo das duas colunas):** `Todo o Brasil · Retirada grátis em Cajamar/SP` em `text-[11px] text-western-cream/65`.
- Quando houver peça >100kg, troca a 2ª linha por `Peça grande? Cotação dedicada via WhatsApp →` (link discreto, mantém o link WhatsApp existente lá embaixo ou consolida aqui — proposta: **consolidar aqui** e remover o link solto no fim do footer).

### Por que essa forma

- Ícone `Truck` dá reconhecimento instantâneo (UX padrão de checkout).
- Label `FRETE` em mono caps amarra com o `SUBTOTAL` logo acima (mesma família tipográfica) → vira um par visual coeso.
- Duas linhas de informação respondem as duas perguntas do cliente: *"quanto custa?"* (calculado no checkout) e *"vocês entregam onde?"* (Brasil todo + retirada).
- Card sutil (`bg-western-green-deep/30`) cria contraste com o subtotal sem competir com ele.

### Fora de escopo

- Não mexer no subtotal, CTAs, selo de pagamento, cross-sell, header.
- Não adicionar calculadora de CEP no rodapé (já existe `CalcFrete.tsx` para outro contexto; aqui o frete fica para o checkout mesmo).
- Não tocar em `business.ts` nem em edge functions.

Após aprovação, implemento direto neste único arquivo.