# PDP — Reorganização e clareza visual

Objetivo: manter 100% da informação, mas tirar a sensação de "muito" e "monocromático". Foco em **hierarquia tipográfica**, **eliminação de duplicatas** e **um único caminho claro de leitura**.

## 1. Diagnóstico — o que está poluindo

**Redundâncias reais identificadas no código atual:**

| Informação | Aparece em |
|---|---|
| Prazo 15 dias úteis | `DeliverySignals` + lista "Regras comerciais" + accordion "Produção & entrega" |
| Pedido mínimo R$ 700 | Lista "Regras comerciais" + `PriceGate` (visitante) |
| Retira em Cajamar | `DeliverySignals` + lista "Regras comerciais" + accordion "Produção & entrega" |
| Garantia 5 anos | Lista "Regras comerciais" + Ficha técnica + Composição |
| Dimensões C×L×A | `HardFactsCard` (inline) + Ficha técnica (grid) |
| Acabamentos | `FinishSelector` (topo) + Ficha "Acabamentos disponíveis" |
| Modelo 3D | Botão dourado grande + accordion "Modelo 3D · SketchUp" |
| "Adicionado por N estúdios · 30 dias" | Renderizado 2× (logado / visitante) |
| Pintura personalizada | `CustomPaintNote` + "Falar com consultor" no CTA |
| Variação ±3 cm | `HardFactsCard` + Ficha técnica |

**Cromático:** tudo é `western-green-deep` + `western-gold` + `western-stone-warm` sobre `paper/ivory`. Não falta cor — falta **respiro** (mais branco/cream puro) e **um único uso intencional do dourado** (CTA + 1 acento), em vez de dourado em ~12 lugares (eyebrow, divider, ícone, badge, hover, link, número romano, etc.).

**Tipografia:** boa base (`font-display` + `font-mono`), mas o `font-mono uppercase tracking-[0.22em]` aparece em **9 tamanhos diferentes** (10, 10.5, 11, 12px com tracking variando 0.15–0.30em). Vira ruído.

## 2. Princípios da reorganização

1. **Cada informação aparece 1 vez**, no lugar mais natural para a decisão do cliente.
2. **3 zonas claras**, com separação visual forte (não só linhas finas):
   - **Zona Decisão** (acima da dobra): nome + acabamento + preço + qtd + CTA + entrega.
   - **Zona Confiança** (logo abaixo): lead editorial + aplicações + dados duros + 1 prova social.
   - **Zona Profundidade** (accordions): toda a ficha completa para quem quer ler tudo.
3. **Tipografia em escala fixa**: 3 tamanhos de eyebrow (não 9), 2 pesos de body, 1 escala display.
4. **Dourado só em 2 lugares**: CTA principal e o acento que marca "obrigatório / ação". Resto migra para verde-deep ou stone-warm.
5. **Próximo passo sempre visível**: o cliente nunca deve perguntar "e agora?".

## 3. Nova estrutura da coluna direita (Decisão)

```text
┌─ Breadcrumb (mantém)
│
│  PEDRAS GRANDES                           ← eyebrow único (10px)
│  ─                                         ← removido (divider gold)
│  Pedra Grande 1                           ← display 48px
│  SKU · WEST-PG-1                          ← spec, sem destaque
│
├─ ACABAMENTO · obrigatório    mesmo preço  ← bloco mantido
│  [ Quartzo ] [ Arenito ] [ Moledo ] [ Granito ]
│
├─ R$ 1.240,00            [ − 1 + ]         ← preço grande à esq, stepper à dir
│  condição parceiro · à vista                 (ou PriceGate block para visitante)
│
├─ [══ ADICIONAR AO PEDIDO ══] [♡]         ← CTA dourado, único botão dourado da página
│
│  ⏱ 15 dias úteis  ·  📍 retira Cajamar  ·  🚚 frete por região
│                                              ← DeliverySignals UNIFICADO
│                                                (absorve a lista "Regras comerciais")
│
│  ✦ Pedido mínimo R$ 700  ·  Garantia 5 anos
│                                              ← linha discreta abaixo
│
│  Adicionado por 28 estúdios nos últimos 30 dias
│  Falar com consultor →                    ← agrupado em uma linha sutil
└─
```

**Removido desta zona:**
- O bloco grande "74 kg + comparativo" (`HardFactsCard`) → desce para Zona Confiança.
- Lista `Regras comerciais` (4 bullets) → fundida em `DeliverySignals` + linha discreta.
- Renderização duplicada do "estúdios · 30 dias".
- Botão dourado gigante do SketchUp → vira link discreto dentro do accordion "Modelo 3D" (que já existe).

## 4. Nova Zona Confiança (logo abaixo do CTA, full width da coluna direita ou em faixa)

Ordem reescrita para um único fluxo de leitura, sem repetir blocos:

1. **Lead editorial** (parágrafo grande com capitular `É`) — mantém.
2. **Aplicações** (chips) — mantém, mas usa borda cream em vez de stone-warm para suavizar.
3. **Dados duros** — `HardFactsCard` realocado aqui, com novo layout horizontal:
   `74 kg | 108 × 76 × 52 cm | base argamassa C3 | variação ±3 cm`
   (uma faixa só, não dois blocos).
4. **CustomPaintNote** — mantém, mas remove o "Falar com consultor" duplicado (já está na zona de decisão).

## 5. Accordions (Zona Profundidade)

Mantém os 6 accordions, mas:

- **Ficha técnica**: remove o sub-bloco "Acabamentos disponíveis" (já está como FinishSelector visual no topo). Remove "Garantia" da tabela (vira linha única discreta na zona decisão). Mantém grid de dimensões — agora **único** lugar com a tabela 3-colunas detalhada.
- **Modelo 3D · SketchUp**: absorve o botão de download que estava solto fora.
- **Produção & entrega**: mantém texto, remove menção redundante a "frete por região / retira" (já em DeliverySignals).
- Numerais romanos ficam, mas em **stone-warm** (não dourado) para reservar o ouro ao CTA.

## 6. Padronização tipográfica

Criar tokens semânticos no `index.css` e aplicar em toda a PDP:

```text
.text-eyebrow-sm   → mono 10px / tracking 0.22em / stone-warm   (chips, meta)
.text-eyebrow      → mono 11px / tracking 0.25em / green-deep   (títulos de bloco)
.text-eyebrow-lg   → mono 12px / tracking 0.28em / gold         (só "obrigatório", CTA)

.text-body         → serif 16px / 1.7 / stone-warm              (parágrafos)
.text-body-lead    → serif 18px / 1.7 / green-deep              (lead editorial)
.text-spec         → sans 13px / 1.6 / green-deep               (specs, ficha)
```

Substituir os ~30 usos de `font-mono text-[10px] uppercase tracking-[0.22em]` espalhados por essas 3 classes. Resultado: ritmo visual previsível.

## 7. Paleta — respiro sem perder identidade

- **Fundo da Zona Decisão**: `surface-paper` (atual) — mantém.
- **Fundo da Zona Confiança**: `surface-cream` (1 tom mais claro) — cria respiro entre seções.
- **Fundo dos Accordions**: `surface-ivory` puro — terceira camada, ainda mais leve.
- **Dourado** reduzido para: CTA, "obrigatório", divider do título, hover de link. Resto vira `green-deep` ou `stone-warm`.
- **Verde-deep** ganha um secundário `green-deep/85` para subtítulos (não tudo no mesmo tom forte).

Sem cores novas — só hierarquia mais clara das que já existem.

## 8. Próximos passos visíveis

Adicionar ao final da Zona Decisão (logo após o CTA) uma linha curta de "next steps" contextual:

```text
Ainda decidindo?  → Ver peças semelhantes  ·  Pedir amostra  ·  Falar com consultor
```

Os 3 links já existem em outras seções — só consolidar em uma linha sutil no momento de decisão.

## 9. Detalhes técnicos da implementação

- Refatorar `ProductPage.tsx` em sub-componentes: `<PdpDecisionColumn />`, `<PdpTrustBlock />`, `<PdpDeepDive />` (accordions). Reduz o arquivo de 781 para ~200 linhas no shell.
- Criar `src/components/product/PdpDataStrip.tsx` (faixa horizontal peso/dim/base/variação) — substitui o uso atual de `HardFactsCard` em modo "card vertical".
- Estender `DeliverySignals` para aceitar `variant: "full" | "minimal"` para incluir pedido mínimo + garantia em uma linha extra.
- Adicionar tokens `.text-eyebrow-sm/.text-eyebrow/.text-eyebrow-lg` em `index.css`.
- Adicionar `surface-cream` no `tailwind.config.ts` se ainda não existir.
- Nada muda nas queries do Shopify, no carrinho, nem na lógica de variantes — só estrutura visual.

## 10. Fora de escopo

- Não mexer nas seções full-width abaixo (`ProductInUse`, `ProductComparison`, `RelatedProducts`, etc.) — outra rodada.
- Não mexer no `StickyBuyBar` nem na galeria.
- Não alterar o conteúdo dos textos da Composição/Observações/Cuidados.

## Pergunta para você antes de eu implementar

Quero confirmar 2 coisas:

1. **Pode mover** o bloco grande "74 kg + comparativo com pedra natural" de cima do lead editorial **para depois** dele (junto com aplicações)? Visualmente fica menos pesado logo após o CTA, mas você perde o impacto do "10× mais leve" ser a primeira coisa após preço. Alternativa: manter no topo mas em formato de faixa horizontal compacta (não card vertical).

2. **Pode reduzir o botão dourado do SketchUp** (hoje destacado fora de qualquer accordion) para um link discreto dentro do accordion "Modelo 3D"? Ou esse acesso precisa ficar em destaque acima da dobra dos accordions porque arquitetos usam muito?
