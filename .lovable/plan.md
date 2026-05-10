## Reordenar a PDP: comércio em primeiro lugar

Hoje a coluna direita prioriza identidade da peça (nome + dados duros de peso/dimensões). Preço, frete, gatilho social e CTA aparecem só depois do scroll. Vamos inverter: tudo que decide compra sobe pro topo, e o detalhamento técnico fica como suporte abaixo.

### Sobre sticky: minha recomendação

**Sim, mas com nuance.** Já existe um `StickyBuyBar` (footer fixo) que aparece quando o CTA inline sai da tela — ele resolve o caso "rolei pra ler ficha técnica e quero comprar". Isso continua.

O que **não** recomendo é deixar o bloco inteiro de compra sticky no topo enquanto o usuário lê — vira ruído visual numa PDP editorial. A combinação que funciona melhor:

1. **Bloco de compra ancorado no topo da coluna direita** (sempre visível ao abrir a página, sem precisar rolar).
2. **Sticky buy bar no rodapé** já existente, dispara quando o bloco do topo sai do viewport.

Assim o usuário tem CTA visível em 100% do tempo, sem poluir a leitura.

### Nova ordem da coluna direita

```text
1. Eyebrow (categoria) + H1 nome do produto + SKU
2. ┌─ BLOCO DE COMPRA (novo, destacado) ──────────────┐
   │ Preço grande (ou PriceGate se deslogado)         │
   │ Linha de entrega: "Frete cotado · Pronto em Xd"  │
   │ Gatilho social: "Adicionado por N estúdios..."   │
   │ Seletor de acabamento (compacto)                 │
   │ Stepper + CTA "Adicionar ao pedido" (cor nova)   │
   │ Link discreto: Falar com consultor               │
   └──────────────────────────────────────────────────┘
3. HardFacts (peso & dimensões)
4. Lead editorial + aplicações
5. Pintura personalizada + SketchUp
6. Regras comerciais (lista resumida)
7. Accordions (ficha técnica, composição, etc.)
```

### CTA com cor diferenciada

Hoje o botão usa `bg-western-green-deep` — a mesma cor do header e de vários elementos secundários, então some. Vamos diferenciar:

- **Cor primária do CTA**: `western-gold` sólido com texto `western-green-deep`. Ouro é a cor de marca menos usada em ações — vira sinal claro de "ação principal".
- **Hover**: escurece levemente (`hover:bg-western-gold/90`) + leve `translate-y-[-1px]`.
- **Aplica nos dois lugares**: CTA inline + botão do `StickyBuyBar` (consistência).
- **Estado deslogado** (`PriceGate`): também ganha tratamento dourado no botão de "Login parceiro" pra manter coerência visual da ação principal.
- Stepper continua neutro (borda) pra não competir.

### Bloco de entrega (novo, dentro do bloco de compra)

Linha condensada com 2-3 sinais, em mono pequeno:

```text
🚚 Frete cotado por região    ⏱ Pronto em 25 dias úteis    📍 Retira grátis em [cidade]
```

Ícones lucide (`Truck`, `Clock`, `MapPin`) em ouro, texto em stone-warm. Quando o plugin de frete chegar, esse slot recebe o componente real (cep + cálculo) sem mudar a estrutura.

### Gatilho social subindo

O "Adicionado por N estúdios em projetos nos últimos 30 dias" sai de baixo do SketchUp e entra no bloco de compra, logo abaixo do preço — é onde gera mais impacto na decisão.

### Ajustes técnicos pontuais

1. **`src/pages/ProductPage.tsx`** — reordenar JSX da coluna direita conforme acima. Extrair o bloco de compra em uma seção visualmente delimitada (fundo `western-cream` levemente mais claro + borda fina ouro à esquerda, ou card com sombra sutil — fica editorial, não shopping).
2. **CTA cor dourada** — atualizar classes em ProductPage e em `src/components/product/StickyBuyBar.tsx`.
3. **Novo subcomponente** `src/components/product/DeliverySignals.tsx` — encapsula a linha de frete/prazo/retirada. Lê de `BUSINESS`. Pronto pra receber o plugin de frete depois.
4. **PriceGate** — confirmar que o botão também adota a cor dourada quando renderizado dentro do bloco de compra (variant prop ou classe via `cn`).
5. **HardFactsCard** — sem mudar o componente, apenas reposicionar abaixo do bloco de compra com um separador discreto.

Sem mudanças em backend, dados ou rotas. Tudo presentation.