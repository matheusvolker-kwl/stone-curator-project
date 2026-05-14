# Remover cotação de frete do carrinho

Decisão: a Yampi não expõe endpoint público de cotação pré-pedido. Frete passa a ser calculado no checkout Yampi (que já funciona). No carrinho, mostramos só as informações de entrega essenciais.

## Escopo (somente UI do carrinho)

**Arquivos tocados:**
- `src/components/layout/CartDrawer.tsx` — trocar `<CalcFrete />` por `<DeliveryInfo />`
- `src/components/cart/DeliveryInfo.tsx` — **novo** componente, leve, sem estado, sem chamadas de rede

**Não tocar:**
- `supabase/functions/yampi-calc-frete/` — fica inativa (reativável no futuro)
- `src/components/cart/CalcFrete.tsx` — fica no repo, não é mais importado (podemos remover depois se quiser)
- `src/lib/yampi/client.ts`, checkout, paleta, tipografia, ícones, espaçamentos

## Bloco "Entrega" — proposta visual

Mantém a mesma moldura do `CalcFrete` atual (`border border-western-gold/25 bg-western-green-deep/40 p-4 md:p-5`), mas com hierarquia mais calma e sem CTA pesado. Três blocos discretos separados por divisória fina dourada.

```text
┌─────────────────────────────────────────────────────┐
│ 🚚  ENTREGA                                         │
│                                                     │
│ ✓  Retirada gratuita no ateliê                      │
│    Rua Colina, 38 · Jardim Paraíso · Cajamar/SP     │
│    Seg–Sex 9h–17h · mediante agendamento            │
│ ─────────────────────────────────────────────────── │
│ ✓  Envio para todo o Brasil                         │
│    Frete e prazo calculados no checkout.            │
│ ─────────────────────────────────────────────────── │
│    Peças acima de 100 kg? Cotação dedicada,         │
│    com transportadora especializada.                │
│    [ Falar com especialista no WhatsApp → ]         │
└─────────────────────────────────────────────────────┘
```

Notas de execução:
- Cabeçalho idêntico ao atual (`Truck` 3.5, label mono `[10px] uppercase tracking-[0.25em]`).
- Itens com check (`Check` do lucide, mesmo tamanho/cor do ícone `Truck`) para criar ritmo visual e reforçar "incluso/garantido".
- Endereço e horário em `text-spec text-western-cream-muted text-xs leading-relaxed` (mesmo estilo que já usávamos no bloco de retirada).
- Linha de envio: uma frase só. Sem CEP, sem botão. A promessa é "calculado no checkout".
- Bloco pesado (>100 kg) **só aparece se houver item com `pesoKg > 100` no carrinho** — mesma regra que `CalcFrete` já usava, então mantém a UX para B2B com peças grandes sem aparecer ruído pra quem não precisa.
- CTA WhatsApp com o estilo secundário existente (`h-10 border border-western-gold/40 ... font-mono text-[10px] uppercase tracking-[0.22em]`), nunca com peso de CTA primário — `Finalizar compra` continua sendo o herói.
- Divisórias `border-t border-western-gold/15` (já é o padrão do componente).

## Por que essa forma

- Três linhas curtas > parágrafo. Cada linha responde uma dúvida típica (retirada, envio nacional, peça pesada).
- Os checks comunicam "está resolvido" sem precisar de copy defensiva tipo "não se preocupe".
- O bloco condicional de >100 kg preserva a captura de lead B2B que o `CalcFrete` fazia, sem precisar de input.
- Zero estado, zero loading, zero erro — sem chance de "instabilidade na cotação" derrubar conversão.

## Detalhes técnicos

- `DeliveryInfo` lê `useCartStore` só para `items.some(i => (i.pesoKg ?? 0) > 100)` e para montar a mensagem do WhatsApp (mesma função `whatsappPesadoUrl` que já existe — mover pra `src/lib/whatsapp.ts` ou duplicar inline; proposta: inline, é trivial e evita refator).
- `BUSINESS.enderecoAtelieRua`, `BUSINESS.cidadeAtelie`, `BUSINESS.ufAtelie`, `BUSINESS.horarioAtelie`, `BUSINESS.whatsappFabrica` — todos já existem em `src/config/business.ts`.
- `CartDrawer.tsx`: trocar `import CalcFrete` por `import DeliveryInfo` e a tag `<CalcFrete />` por `<DeliveryInfo />`. Continua dentro do mesmo `isApproved && meetsMinimum` (ou removemos o `meetsMinimum` daqui, já que info de entrega é útil mesmo abaixo do mínimo — **decisão sugerida: mostrar para todo carrinho com itens, removendo a condição `meetsMinimum`**, mantendo só `isApproved` se quiser preservar o gate B2B; me confirma se prefere assim).

## Fora de escopo

Layout, fontes, paleta, header, checkout, edge functions, outros componentes.
