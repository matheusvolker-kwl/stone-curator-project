
# PDP — virar e-commerce funcional, parar de "luxo desnecessário"

Objetivo: a PDP precisa **informar com clareza e vender**. Hoje está bonita mas trabalha contra a conversão — preço escondido, descrição em itálico cursivo difícil de bater o olho, blocos de texto enormes com redundâncias, e informações operacionais (argamassa C3, kit de retoque) jogadas como nota de rodapé.

## 1. Diagnóstico do que está quebrado

| Problema | Onde | Impacto |
|---|---|---|
| Preço pequeno (`text-3xl md:text-4xl` em `font-display` serifada) | bloco 2.3 | não compete com o resto da página, parece mais "label" do que "preço" |
| Lead editorial em `font-display italic` 1.2–1.45rem com **drop cap dourado gigante** | bloco 3 | bonito em revista, péssimo para escanear; o cliente quer specs, não prosa |
| Aplicações = chips com padding `px-3 py-1.5` em borda e fundo cream, ocupam 2-3 linhas | bloco 4 | rouba o espaço onde o cliente decidiria comprar |
| "Composição & material" = 6 itens × 2-3 linhas cada = parágrafo gigante | accordion II | redundância com Ficha técnica (garantia, peso, resistência) e com a frase introdutória |
| `"Instalação simples com argamassa C3 (loja de bairro). Kit de pintura para retoque incluso."` enfiada num parágrafo de "Produção & entrega" | accordion V | informação **crítica de pós-compra** disfarçada de nota; "loja de bairro" parece piada |
| `"Base plana argamassa C3"` aparece solto no `HardFactsCard` strip | bloco 5 | sem contexto, ninguém entende o que é |
| 9 variações de `font-mono uppercase tracking-[0.xxem]` em tamanhos 10/10.5/11/12px | toda PDP | ruído tipográfico, parece "etiqueta de etiqueta" |
| Itálico serifado em texto corrido + `font-display` em qualquer coisa que precise de peso | toda PDP | identidade "luxo" mata a leitura funcional |

## 2. Princípios da nova PDP

1. **Preço é o herói da decisão.** Grande, sans-serif, tabular, alinhado à esquerda, com hierarquia clara entre valor e condição.
2. **Texto longo só nos accordions.** Acima da dobra, só specs e dados objetivos.
3. **Cada informação operacional tem seu próprio bloco visual.** Instalação, kit, garantia, prazo — não enfiar em parágrafo.
4. **Sans-serif para tudo que é funcional** (preço, specs, aplicações, ficha). **Serifa só em**: H1 do produto, títulos de accordion, e UM parágrafo curto de "lead" se realmente fizer sentido.
5. **Itálico nunca em bloco de texto.** Só em ênfase pontual.

## 3. Mudanças concretas

### 3.1 Preço — bloco 2.3

**Antes:**
```text
Condição parceiro
R$ 1.240,00     [- 1 +]
  ↑ font-display 3xl/4xl
```

**Depois:**
```text
R$ 1.240,00      [ - 1 + ]
  ↑ sans 5xl bold tabular, "1.240" preto, ",00" stone-warm 60%
À vista · condição parceiro       ← linha discreta abaixo
```

- Trocar `font-display` por `font-sans font-semibold` no preço.
- Tamanho: `text-4xl md:text-5xl` com `tabular-nums tracking-tight`.
- "R$" em tamanho 60% do número, alinhado ao topo.
- Centavos em opacidade reduzida.
- Label "Condição parceiro" vira **abaixo** do preço, não acima — preço é o que importa.
- Stepper sobe para alinhar com o preço, mantém a altura `h-12`.

### 3.2 Lead editorial — bloco 3

- Remover `product-lead` (italic + drop cap dourado).
- Virar parágrafo objetivo curto: `font-sans text-base leading-relaxed text-western-stone-warm`.
- Limite visual de 3 linhas; resto vai pro accordion "Sobre a peça" (novo, opcional).
- Remover capitular dourado: nada de letra capitular numa PDP de e-commerce.

### 3.3 Aplicações — bloco 4

**Antes:** chips grandes em flex-wrap ocupando 3 linhas.
**Depois:** linha única horizontal com separador `·`:

```text
APLICAÇÕES   Spa  ·  Borda de piscina  ·  Jardim seco  ·  Painel d'água
```

- `font-mono text-[11px] uppercase tracking-wide text-western-stone-warm`
- Sem bordas, sem fundos, sem padding.
- Se passar de 1 linha → quebra normal, mas sem "chips".

### 3.4 Novo bloco: "O que vem com a peça" — substitui o `HardFactsCard` strip e a menção solta a "Base argamassa C3"

Inserir entre Aplicações e CustomPaintNote, como **uma faixa visual com 3 ícones**:

```text
┌─────────────────────────────────────────────────────────────┐
│  📦 O que vem na caixa                                      │
│                                                             │
│  🪨 1 peça pronta    🎨 Kit de retoque    📋 Manual de      │
│  para instalar       de pintura mineral   fixação com       │
│                      (mesma cor)          argamassa C3       │
└─────────────────────────────────────────────────────────────┘
```

- Background `surface-cream`, padding generoso.
- Ícones de `lucide-react` (Package, Paintbrush, FileText).
- Textos curtos, sans-serif 13px.
- **Resolve duas dores de uma vez**: explica o kit de retoque e a fixação com argamassa C3 num lugar onde faz sentido (junto da peça), não enterrado em "Produção & entrega".

### 3.5 HardFactsCard strip — simplificar

- Remover a coluna "Base argamassa C3" (já está no bloco novo acima).
- Manter só: **Peso · Dimensões · Variação ±3 cm**.
- Trocar números de `font-display` para `font-sans font-semibold tabular-nums`.

### 3.6 Composição & material — accordion II

Reduzir de 6 itens × 3 linhas para **4 itens × 1-2 linhas**, removendo redundâncias com Ficha técnica:

| Item atual | Decisão |
|---|---|
| Estrutura | **Mantém**, encurtar para 1 linha |
| Interior oco | **Mantém** (é o diferencial) |
| Pintura mineral | **Mantém**, encurtar |
| Resistência mecânica | **Funde** com Estrutura |
| Sustentabilidade | **Mantém** (diferencial de marca) |
| Garantia | **Remove** (já está em Ficha técnica + bloco "vem na caixa") |

Parágrafo introdutório: cortar pela metade. Hoje: "Toda peça Western é fabricada artesanalmente em composto mineral proprietário, desenvolvido há 33 anos no nosso ateliê. Reproduz fielmente a estética da pedra natural — sem nenhuma extração ambiental." → "Composto mineral proprietário, desenvolvido há 33 anos. Estética de pedra natural, sem extração ambiental."

### 3.7 Produção & entrega — accordion V

**Antes:** parágrafo único com instalação + kit + frete misturados.
**Depois:** 3 linhas curtas, uma por tópico:

```text
PRODUÇÃO    Sob encomenda em Cajamar/SP. 15 dias úteis após confirmação.
ENTREGA     Frete calculado por destino e dimensões. Retira em fábrica disponível.
INSTALAÇÃO  Veja "O que vem na caixa" acima — kit completo incluso.
```

Remover a frase "argamassa C3 (loja de bairro)" — migra para o bloco novo com contexto adequado.

### 3.8 Tipografia — tokens novos no `index.css`

Adicionar 6 classes utilitárias e usar consistentemente:

```css
.text-price        → sans 4xl/5xl, font-semibold, tabular-nums, tracking-tight
.text-price-cents  → 60% size, opacity-60, tabular-nums
.text-meta         → mono 11px, tracking-[0.18em], stone-warm/80, uppercase
.text-eyebrow      → mono 12px, tracking-[0.22em], green-deep/90, uppercase, font-medium
.text-spec         → JÁ EXISTE — manter, mas trocar font-mono por font-sans nos usos de body
.text-body         → sans 15px, leading-relaxed, stone-warm
```

Substituir os ~30 usos de `font-mono text-[10px] uppercase tracking-[0.22em]` por `.text-meta` e `.text-eyebrow`.

### 3.9 Cores — respiro real entre seções

Hoje toda a coluna direita é `surface-ivory` puro. Aplicar 3 fundos sutis:

- **Bloco compra (header + acabamento + preço + CTA + entrega)**: `surface-paper` (atual ivory ok).
- **Lead + aplicações + dados duros + bloco "vem na caixa"**: faixa `surface-cream` com padding interno generoso, criando claro recorte visual da zona de decisão.
- **Accordions**: voltam para `surface-ivory`.

Isso dá o respiro que falta sem inventar cor nova.

## 4. Estrutura final da coluna direita

```text
┌─ Breadcrumb
│
│  [eyebrow] PEDRAS GRANDES
│  Pedra Grande 1                        ← H1 display, mantém serifa
│  SKU · WEST-PG-1
│
├─ ZONA COMPRA (surface-paper)
│  Acabamento · obrigatório  [chips finish]
│  R$ 1.240,00              [- 1 +]      ← PREÇO GRANDE SANS
│  À vista · condição parceiro
│  [══ ADICIONAR AO PEDIDO ══] [♡]
│  ⏱ 15 dias  ·  📍 Cajamar  ·  🚚 frete
│  ✦ Mín R$ 700  ·  Garantia 5 anos
│
├─ ZONA INFO (surface-cream, faixa horizontal)
│  Pedra de aparência natural, 10× mais leve. Ideal para spas e bordas.
│
│  APLICAÇÕES  Spa · Borda · Jardim · Painel
│
│  [ Peso 74 kg | Dimensões 108×76×52 | ±3 cm ]
│
│  ┌─ O QUE VEM NA CAIXA ─────────────────┐
│  │  🪨 Peça pronta   🎨 Kit de retoque   │
│  │  📋 Manual de fixação (argamassa C3)  │
│  └────────────────────────────────────────┘
│
│  Pintura personalizada? Falar com consultor →
│
├─ ZONA PROFUNDIDADE (surface-ivory, accordions)
│  I. Ficha técnica
│  II. Composição & material  (encurtado)
│  III. Observações
│  IV. Modelo 3D
│  V. Produção & entrega  (3 linhas, não 1 parágrafo)
│  VI. Cuidados
└─
```

## 5. Arquivos afetados (técnico)

- `src/pages/ProductPage.tsx` — reorganização dos blocos 2.3, 3, 4, 5; novo bloco "O que vem na caixa"; encurtar conteúdo dos accordions II e V.
- `src/components/product/HardFactsCard.tsx` — remover coluna "Base", trocar font-display por font-sans no número.
- `src/components/product/CustomPaintNote.tsx` — manter, só ajustar tipografia.
- **Novo**: `src/components/product/WhatsInTheBox.tsx` — bloco com 3 ícones.
- `src/index.css` — adicionar `.text-price`, `.text-price-cents`, `.text-meta`, `.text-body`; ajustar `.text-spec` para usar `font-sans` por padrão.
- Não mexer em queries Shopify, carrinho, lógica de variantes, nem nas seções full-width abaixo do hero (ProductInUse, Comparison, Related, etc.).

## 6. Fora de escopo desta rodada

- Galeria, StickyBuyBar, seções full-width abaixo do hero.
- Outras páginas do site (Home, Linhas, Carrinho) — a refatoração tipográfica vai contagiar naturalmente conforme as novas classes substituírem os usos antigos, mas isso é outra rodada.
- Reescrever os textos da Composição linha por linha — vou encurtar mantendo a essência; ajustes finos de copy em iteração separada.

## 7. Antes de implementar — uma pergunta

O bloco **"O que vem na caixa"** com os 3 ícones (peça, kit de retoque, manual de fixação) é o que resolve a sua dor com a frase "argamassa C3 / loja de bairro". Quer ele:

- **(a)** Logo abaixo do CTA, dentro da zona de decisão (cliente vê antes mesmo de rolar) — recomendado, é argumento de venda.
- **(b)** Depois das aplicações, na zona info (mais discreto, mais "ficha").
- **(c)** Como accordion próprio "O que está incluso" entre Ficha técnica e Composição (esconde por padrão).

Minha recomendação é **(a)** — é o tipo de "zero atrito pós-compra" que vende.
