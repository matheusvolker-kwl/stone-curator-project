## PDP enxuta — referência SilkSkin

A referência mostra **uma coluna direita curta e densa** (título, preço, opções, CTA) com **todo o conteúdo longo em abas abaixo do hero**. Hoje a coluna direita continua um "scroll infinito" — descrição, aplicações, ficha, kit, 6 accordions. Isso é o "muito texto sem utilidade" no lugar errado.

A solução não é apagar conteúdo — é **mover** o que é "leitura" para abaixo do hero, deixando a coluna direita só com **decisão de compra**.

## 1. Diagnóstico do que ainda sobra na coluna direita

| Bloco atual (col. direita) | Problema |
|---|---|
| Lead `mt-10` (parágrafo descritivo) | É leitura, não decisão. Empurra CTA pra cima e some no scroll. |
| "Aplicações · Spa · Borda…" | Idem: informativo, não decisivo. |
| `HardFactsCard strip` (peso/dim/var) | Informativo. Cabe na aba "Especificações". |
| `WhatsInTheBox` (3 ícones) | Útil, mas longo. Cabe melhor numa aba "O que vem na caixa" + 1 linha curta no hero. |
| `CustomPaintNote` | Idem — vai pra aba ou vira link discreto. |
| 6 accordions (Ficha, Composição, Observações, 3D, Entrega, Cuidados) | É exatamente o que vira **abas** abaixo do hero. |
| "Acabamento · obrigatório" + frase "Cada peça é produzida sob demanda…" | Frase redundante (já está nas signals e na aba entrega). Remover. |
| "mesmo preço" no header do acabamento | Microcópia desnecessária. Remover. |
| Linha "Adicionado por X estúdios · 30 dias" | Prova social fraca, sem dados reais. Remover do hero. |

## 2. Nova coluna direita (curta, igual ao reference)

```text
[eyebrow] PEDRAS GRANDES > LINHA RIO
Cascata Sabino                    ← H1 display
SKU · WEST-CS-1

Pedra de aparência natural, 10× mais leve.   ← 1 linha curta, sans 14px
Ideal para spas e bordas de piscina.

ACABAMENTO · obrigatório
[Quartzo] [Arenito] [Moledo] [Granito]

R$ 1.240,00                       ← preço grande sans
À vista · condição parceiro

[ - 1 + ]   [══ ADICIONAR AO PEDIDO ══]   [♡]

⏱ 15 dias  ·  📍 Cajamar  ·  🚚 frete calculado

— pintura personalizada? falar com consultor →   ← link discreto
```

Acaba aí. Sem `HardFactsCard`, sem `WhatsInTheBox`, sem accordions na coluna direita, sem lead longo, sem aplicações chip.

## 3. Abas abaixo do hero (full-width, container centralizado)

Inspirado no reference (Description / Additional Information / Review), mas adequado ao produto:

```text
┌──────────────────────────────────────────────────────────┐
│  Descrição  |  Especificações  |  Entrega & instalação  │
└──────────────────────────────────────────────────────────┘
```

**Aba 1 · Descrição** (default ativa)
- Lead atual (parágrafo) + intro (parágrafo `parsed.intro` se existir)
- Aplicações (linha única horizontal `Spa · Borda · Jardim · Painel`)
- Bloco "Composição & material" (4 itens atuais, layout horizontal em 2 colunas no desktop)

**Aba 2 · Especificações**
- `HardFactsCard` em modo "card" (volta a ser destaque, não strip)
- Tabela de Ficha técnica completa (todos `fichaRows`)
- Grid de dimensões C/L/A (atual)
- Observações (lista, se houver)
- Modelo 3D (botão + descrição) — vira sub-bloco aqui

**Aba 3 · Entrega & instalação**
- Bloco "O que vem na caixa" (3 ícones existentes — reaproveitar componente)
- Produção / Entrega / Instalação (dl atual)
- Cuidados (parágrafo atual)

Resultado: **0 accordions**. Tudo navegável por aba. Cliente que quer comprar não rola — bate o olho no preço, escolhe acabamento, clica. Cliente que quer aprofundar tem 3 abas claras.

## 4. Tipografia — eliminar resíduos "luxo"

- Frase "Cada peça é produzida sob demanda no acabamento escolhido." → **remover** (redundante com signals + aba entrega).
- Tag "mesmo preço" no header do acabamento → **remover** (preço único é óbvio quando não há diferença).
- Linha "Adicionado por N estúdios · 30 dias" → **remover** do hero (prova social vai para `SocialProofBand` que já existe abaixo).
- Roman numerals (I., II., III.) dos accordions → desaparecem junto com os accordions.
- Manter no hero: **só** `text-eyebrow` (acabamento), `text-price`, `text-meta` (condição), e os ícones de signals.

## 5. Estrutura técnica

- `src/pages/ProductPage.tsx`:
  - Coluna direita: deletar blocos 3 (lead), 4 (aplicações), 5 (HardFacts strip), 5.1 (WhatsInTheBox), 6 (CustomPaintNote), e o `<Accordion>` inteiro.
  - Adicionar 1 parágrafo curto (≤2 linhas) entre SKU e o seletor de acabamento, derivado de `parsed.lead` truncado por `.slice(0, ~120)` ou primeira frase.
  - Remover frase "Cada peça é produzida sob demanda…" e tag "mesmo preço" e linha "estúdios + consultor".
  - Mover link "pintura personalizada" para abaixo dos signals como link sutil (não card).
  - Logo abaixo do `</div>` que fecha o grid hero (linha ~664), inserir novo componente `<ProductTabs />` com as 3 abas, antes de `<ProductInUse />`.

- **Novo**: `src/components/product/ProductTabs.tsx` — usa `<Tabs>` do shadcn (`src/components/ui/tabs.tsx`), recebe props `parsed`, `pesoKg`, `dimsStr`, `dims`, `fichaRows`, `product` e renderiza as 3 abas. Reaproveita `HardFactsCard variant="card"`, `WhatsInTheBox`, e o conteúdo dos accordions atuais (Composição, Modelo 3D, Cuidados).

- **Manter intacto**: galeria, breadcrumb, `FinishSelector`, preço/stepper/CTA, `DeliverySignals`, `StickyBuyBar`, todas as seções full-width abaixo (`ProductInUse`, `Comparison`, `Related`, `WhyWesternStrip`, `SocialProofBand`, `ProductPagination`).

- **Não** mexer em: queries Shopify, lógica de variantes/cart, tokens de cor, `index.css`.

## 6. Fora de escopo

- Tabs animadas / underline animado (usar shadcn padrão, ajustando só visual).
- Refazer `HardFactsCard` ou `WhatsInTheBox` (reaproveitar como estão).
- Outras páginas.

## 7. Pergunta antes de implementar

A divisão das abas faz sentido pra você (Descrição / Especificações / Entrega & instalação)? Ou prefere:
- **(a)** Manter como proposto: 3 abas claras, defaultando em "Descrição".
- **(b)** 4 abas separando Composição da Descrição: `Sobre · Composição · Especificações · Entrega`.
- **(c)** 2 abas só: `Descrição & material · Especificações & entrega` (mais enxuto, mais perto do reference).

Recomendo **(a)** — equilíbrio entre o reference (3 abas) e a quantidade de info que a Western tem.
