## O problema hoje

Quando o cliente chega em "configurar", a tela atual entrega:

1. Um **hero gigante** do conjunto base ocupando quase toda a primeira dobra.
2. Um **card minúsculo de upgrade** preso na coluna direita — sem peso visual, parece um adendo.
3. **Complementos e itens autorais ficam escondidos** lá embaixo. Para ver "o que mais posso somar", precisa rolar muito.
4. O **mini-índice (Conjunto · Complementos · Autorais)** é sticky, mas os elementos que importam para decisão (imagem do conjunto, acabamento, preço, CTA) **somem ao rolar**.

Resultado: o cliente perde o fio. Não sente vontade de subir de patamar e tem que "caçar" os add-ons.

## A nova lógica (visão)

Tratar o configurador como **cockpit**, não como página longa:

- **Lado esquerdo (sticky):** o "produto" — imagem do conjunto, acabamento, preço, CTA principal. **Sempre visível** enquanto o cliente passeia pelos add-ons.
- **Lado direito (rolável):** o "menu de composição" — começa pelo **upgrade em destaque** (banner largo, lado a lado com o base, igual a "compare planos"), depois complementos, depois autorais.
- **Mini-índice** continua sticky no topo, mas agora dispara scroll **dentro da coluna direita**, sem mexer no painel esquerdo.
- **Resumo do projeto** (rail de 320px da direita) permanece sticky como já está.

```text
┌────────────────────────────────────────────────────────────────┐
│  [ chips de descoberta ]              índice ·  ·  · finalizar │
├──────────────────┬───────────────────────────┬─────────────────┤
│                  │  ┌─ UPGRADE ─────────┐    │                 │
│   HERO conjunto  │  │ base × completa   │    │   Resumo do     │
│   (sticky)       │  │ comparativo lado  │    │   projeto       │
│                  │  │ a lado, CTA forte │    │   (sticky)      │
│   Acabamento     │  └───────────────────┘    │                 │
│   ▢ ▢ ▢ ▢        │                           │   itens…        │
│                  │  ─── Complementos ───     │                 │
│   R$ XX.XXX      │  [grid 2 col cards]       │   total         │
│   [+ adicionar]  │                           │   [orçamento]   │
│   ver detalhes   │  ─── Autorais ───         │                 │
│                  │  [grid 2 col cards]       │                 │
└──────────────────┴───────────────────────────┴─────────────────┘
```

No mobile/tablet a coluna esquerda vira um **bloco compacto sticky no topo** (mini-hero + acabamento + preço + CTA em ~140px de altura), e o conteúdo rola embaixo normalmente.

## Mudanças por arquivo

**`src/components/guide/sections/SectionConjunto.tsx`** — refatoração principal.
- Quebrar em duas peças internas: `<ConjuntoHero />` (visual + acabamento + preço + CTA + chips + ver detalhes) e `<ConjuntoUpgrade />` (banner do patamar acima).
- Hero passa a renderizar num wrapper `lg:sticky lg:top-32 self-start`, com aspecto vertical (`aspect-[4/5]` no desktop em vez de `21/9` horizontal) — encaixa melhor numa coluna estreita.
- Lista de "peças incluídas" some do hero e vai para um accordion compacto dentro do upgrade/abaixo.
- Upgrade vira um **bloco largo** estilo "vale a pena subir?": imagem lado-a-lado base × completa, lista do que muda, delta de preço destacado, CTA primário "Aplicar upgrade" + secundário "Manter base".

**`src/components/guide/GuideConfigurator.tsx`** — reestruturar layout.
- Trocar `space-y-12` por `grid lg:grid-cols-[minmax(0,360px)_1fr] gap-10 items-start`.
- Coluna esquerda: `<ConjuntoHero />` sticky.
- Coluna direita: `<ConjuntoUpgrade />` → `<SectionComplementos />` → `<SectionAutorais />` → CTA final.
- Mini-índice sticky continua acima do grid; ao clicar, scrolla os anchors `#upgrade`, `#complementos`, `#autorais` (não mais `#conjunto` — o conjunto está sempre visível). Se for piscina (sem complementos), índice fica `Upgrade · Autorais`.
- Mobile (`<lg`): hero vira compacto sticky no topo (`sticky top-16`), fundo `bg-white/95 backdrop-blur`, com thumb 64x64 + nome + preço + CTA. Upgrade e seções rolam abaixo normalmente.

**`src/components/guide/sections/SectionComplementos.tsx`** e **`SectionAutorais.tsx`** — ajustes finos.
- Como agora vivem em coluna estreita (~700px no desktop), grid passa de `lg:grid-cols-3` para `lg:grid-cols-2` para os cards respirarem.
- Cabeçalhos das seções ficam mais compactos (sem o parágrafo descritivo longo — vira um eyebrow + título).

**`src/pages/BuyingGuide.tsx`** — sem mudanças estruturais; o grid externo `xl:grid-cols-[1fr_320px]` continua igual. Só garantir que o padding interno do card (`p-6 md:p-12`) seja reduzido em `configurar` para `p-6 md:p-8` — precisamos do espaço horizontal.

## Fora do escopo

- Etapas de descoberta (tipo, área, protagonismo, composição) continuam exatamente como estão.
- Resumo do projeto (`GuideAssemblySummary`) permanece sem mudanças.
- Lógica de carrinho, upgrade swap, PDF, drawer de finalizar — tudo intocado, só reorganização visual.
- Admin, orçamentos, página de quotes — fora.

## Resultado esperado

- Cliente chega em "configurar" e **vê de cara**: o conjunto à esquerda (sempre presente) e o upgrade à direita pedindo atenção.
- Para olhar complementos/autorais, basta passar o olho à direita — sem perder a referência do que está comprando.
- Decisão de subir de patamar acontece **lado a lado**, com peso visual proporcional à importância da decisão.
- O cockpit não vira "página longa de checkout" — vira "configurador de carro".
