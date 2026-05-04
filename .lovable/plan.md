## Padrão encontrado nos 4 produtos

Todos os produtos seguem exatamente a mesma estrutura HTML no `descriptionHtml` do Shopify:

```text
<p>Lead com <strong>nome do produto</strong>... presença cênica.</p>
<p>Parágrafo sobre material e durabilidade.</p>
<h3>Aplicações recomendadas</h3>
<ul><li>...</li>...</ul>
<h3>Ficha técnica</h3>
<table><tr><td><strong>label</strong></td><td>valor</td></tr>...</table>
<h3>Observações</h3>
<ul><li><strong>Label:</strong> texto</li>...</ul>
<h3>Modelo 3D para especificação</h3>
<p>...com link para 3D Warehouse...</p>
```

Isso permite um parser confiável e um layout editorial dedicado pra cada bloco — sem reescrever nada no Shopify.

## O que vou construir

### 1. Parser `src/lib/shopify/parseDescription.ts` (novo)

Função pura que recebe `descriptionHtml` e devolve:

```ts
{
  lead: string;          // 1º <p>
  intro: string;         // 2º <p>
  aplicacoes: string[];  // <ul> da seção
  ficha: { label, value }[];  // linhas da <table>
  observacoes: { label?, text }[];
  modelo3dHtml?: string; // preserva o link
  rawHtml?: string;      // fallback se padrão não bater
}
```

Robusto a variações leves (case-insensitive nos títulos, tolera tags extras, fallback pro HTML cru se não reconhecer).

### 2. Refactor `src/pages/ProductPage.tsx`

Substituo o parágrafo único atual por blocos diagramados:

```text
┌──────────────┬──────────────────────────────────┐
│              │  COLEÇÃO                         │
│              │  ─                               │
│              │  Cascata Sabino                  │
│   GALERIA    │  SKU · WEST-CS-QUARTZO           │
│   (sticky)   │                                  │
│              │  ▍ Lead em display serif itálico │
│              │    drop-cap + leading 1.7        │
│              │                                  │
│              │  Intro (parágrafo secundário)    │
│              │                                  │
│              │  ── APLICAÇÕES ──                │
│              │  · Piscinas naturais             │
│              │  · Lagos ornamentais             │
│              │  · Áreas gourmet                 │
│              │                                  │
│              │  [Acabamento: chips]             │
│              │  [Preço · Qty · CTA]             │
│              │                                  │
│              │  I.   Ficha técnica       [+]    │
│              │  II.  Observações         [+]    │
│              │  III. Modelo 3D           [+]    │
│              │  IV.  Produção & entrega  [+]    │
│              │  V.   Cuidados            [+]    │
└──────────────┴──────────────────────────────────┘
```

**Tratamento de cada bloco:**

- **Lead** — `font-display`, ~`text-xl`, italic sutil, leading 1.7, primeira letra com drop-cap dourado discreto (3 linhas, `font-display`). Usa `dangerouslySetInnerHTML` só pra preservar `<strong>` (sanitizado pelo parser).
- **Intro** — parágrafo regular, `text-stone-warm`, leading 1.8, max-w 58ch.
- **Aplicações** — vira `<ul>` com bullet dourado quadrado em vez de bola, label "Aplicações" como eyebrow + hairline.
- **Ficha técnica** — entra no accordion `I.` populado dinamicamente do array `ficha[]` (substitui os specs hardcoded atuais). Mostra Código, Dimensões agrupadas (`100 × 100 × 58 cm`), Peso, Material, Acabamentos como chips, Garantia.
- **Observações** — accordion `II.` com lista; quando há `label`, label fica em mono dourado uppercase acima do texto.
- **Modelo 3D** — accordion `III.` renderizando o `modelo3dHtml` (com classes globais p/ link `<a>` virar link-underline dourado).
- **Produção & entrega** + **Cuidados** — continuam como conteúdo institucional fixo (não vem do Shopify), accordions `IV.` e `V.`.

### 3. Estilos pequenos em `src/index.css`

- `.product-lead` — drop-cap + tipografia editorial
- `.product-list` — bullets quadrados dourados
- `.product-prose a` — herda `link-underline`
- `.spec-chip` — tag para acabamentos da ficha

## Arquivos modificados

- **novo**: `src/lib/shopify/parseDescription.ts`
- **edit**: `src/pages/ProductPage.tsx` — usa parser, renderiza blocos
- **edit**: `src/index.css` — classes utilitárias dos blocos

## Resultado

Mesmo conteúdo do Shopify, mas em vez de um muralhão de texto: lead editorial respirado, lista escaneável de aplicações, ficha técnica organizada em accordion populado automaticamente, observações destacadas. Tudo dirigido pelos dados que já existem — não precisa reeditar nenhum produto.
