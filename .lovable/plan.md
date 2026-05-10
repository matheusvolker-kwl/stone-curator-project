## O problema

**Cards "Peças que somam ao projeto" gigantes:** grid `md:grid-cols-2` na coluna principal (≈800px), cada card com `aspect-[4/3]` + padding `p-6` + altura de 700+ px. Imagens grandes do CDN cropam mal.

**Modal confuso:** muito texto (descrição longa Shopify), peso/dimensões pouco úteis primeiro, hierarquia plana, CTA pequeno no final.

---

## Plano de redesign

### 1. Grid de autorais mais denso e elegante
`Refinar.tsx` linha 231: trocar para `grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4` (4 colunas em desktop wide, 3 em md). Cards menores e escaneáveis.

### 2. `AutoralCard.tsx` — versão compacta
- Imagem `aspect-square` (não 4/3) com `object-contain` em fundo `western-paper` (produtos têm fundo branco do Shopify, não devem ser cropados — mostrar peça inteira).
- Padding `p-3.5` (era `p-6`).
- Nome `text-[14px]` (era 20px), código `text-[9px]`, preço `text-[16px]`.
- Botão compacto: ícone `+` circular no canto da imagem (overlay) ou mini-pill `h-8` no rodapé. Estado selecionado = check dourado no canto.
- Hover: leve elevação + zoom sutil. Nada agressivo.

### 3. `AutoralProductModal.tsx` — design "ficha de produto"
Estrutura mais inteligente, escaneável em 3s:

```
┌──────────────────────────────────────────┐
│ [imagem peça]   │  CÓDIGO · AUTORAL  ✕  │
│  fundo paper    │  Pedra LED             │
│  object-contain │  ─────                 │
│  aspect-square  │  R$ 85                 │
│                 │                        │
│                 │  Subtítulo curto       │
│                 │  (1ª frase da desc.)   │
│                 │                        │
│                 │  3 kg · 20 × 18 cm     │
│                 │                        │
│                 │  [+ Adicionar projeto] │
│                 │                        │
│                 │  ▾ Mais detalhes       │
└──────────────────────────────────────────┘
```

Mudanças:
- Imagem com `object-contain` + fundo `western-paper`.
- Hierarquia: código → nome → preço imediato (no topo, não no final).
- Subtítulo = 1ª frase da descrição (split por `. `). Resto colapsado em accordion "Mais detalhes" fechado por padrão.
- Specs em linha única compacta (`peso · dim`), não dl gigante.
- CTA primário grande logo após specs.
- Modal `max-w-[560px]` (era 640), `aspect-square` na imagem.
- Botão fechar `✕` visível no topo direito.

### 4. ASMR e UX — micro-detalhes
- Transição da abertura do modal: fade + scale sutil (já é shadcn default, ok).
- Hover no card: cursor-zoom-in sobre imagem para sinalizar que abre detalhe.
- Botão "+ Adicionar" no card: animação check verde quando seleciona, com leve "settle" (já temos `anim-settle` no CSS).
- Skeleton enquanto Shopify carrega imagem (evita pop-in feio).
- Imagens: `loading="lazy"` + `decoding="async"` (já existem) + dimensões fixas do CDN para evitar reflow.

### 5. Linha do conjunto base (`PecaRow.tsx`)
Verificar se também sofre do mesmo problema de cards grandes. Se sim, aplicar mesma lógica de `object-contain` em fundo paper.

---

## Arquivos afetados

- `src/components/guide-v2/AutoralCard.tsx` — redesign compacto
- `src/components/guide-v2/AutoralProductModal.tsx` — redesign hierárquico com accordion
- `src/pages/guia/Refinar.tsx` — grid 3-4 colunas
- `src/components/guide-v2/PecaRow.tsx` — possível ajuste de imagem (verificar)

Sem mudanças em DB, rotas ou lógica de negócio. Apenas frontend/UX.