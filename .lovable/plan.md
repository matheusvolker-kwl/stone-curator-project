# Redesign do SocialProofBand

A faixa atual (`src/components/product/SocialProofBand.tsx`) destoa porque:
- Fundo `bg-western-ivory` cria um bloco "ilha" claro entre seções escuras/cremes da PDP
- Três blocos de texto centralizados empilhados parecem rodapé de imprensa, não prova social editorial
- Tipografia mono+sans+itálico em três tamanhos diferentes sem hierarquia clara
- Nomes em texto puro separados por bullets — sem peso visual nem credibilidade tátil

## Direção proposta

Transformar em **faixa editorial dark** alinhada às outras seções "premium" da PDP (mesma família visual de `WhyWesternStrip`/`ArtistaSection`), com **três colunas separadas por divisores verticais**:

```
─────────────────────────────────────────────────────────────
 ESPECIFICADA POR    │   EM PROJETOS         │   EM CASAS DE
 ARQUITETOS          │   INSTITUCIONAIS      │   CELEBRIDADES
                     │                       │
 Marcelo Faisal      │   Cristal Pool        │   Neymar Jr.
 Fabiano Hayasaki    │   Genesis             │   Diogo Nogueira
 Ronaldo Luidi       │   Biopet · Cobasi     │   Thiago Nigro
                     │   Unique Garden       │   Tato · Caito Maia
─────────────────────────────────────────────────────────────
```

### Especificações

**Container:**
- `surface-forest` (verde escuro) com borda gold sutil em cima/baixo (`border-y border-western-gold/15`)
- Padding `py-14 md:py-20` (alinhado ao novo padrão da PDP)
- Remove o `border-t border-western-stone-warm/15` atual

**Grid 3 colunas (desktop) / stack (mobile):**
- `grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-western-gold/15`
- Cada coluna com `px-6 md:px-10 py-8 md:py-0` e alinhamento `text-center`
- Mobile: empilhado com divisores horizontais

**Por coluna:**
- Eyebrow: `font-mono text-[10px] uppercase tracking-[0.28em] text-western-gold-soft/80 mb-5`
- Mini divisor gold: `w-8 h-px bg-western-gold/40 mx-auto mb-5`
- Lista de nomes: `font-sans text-[15px] text-western-cream leading-[2]` (espaçamento generoso, um por linha em vez de bullets corridos)
- Nomes ganham peso `font-medium` e cor `text-western-cream`

**Conteúdo reorganizado em 3 grupos:**
1. **Arquitetos de referência** — Marcelo Faisal · Fabiano Hayasaki · Ronaldo Luidi
2. **Projetos institucionais** — Cristal Pool · Genesis Ecossistemas · Biopet Lagos · Cobasi · Unique Garden
3. **Celebridades** — Neymar Jr. · Diogo Nogueira · Thiago Nigro · Tato (Falamansa) · Evandro Mesquita · Caito Maia

(Os "celebridades" hoje vivem num parágrafo italic solto no final — promovê-los a coluna própria dá mais força e equilibra a composição em 3.)

**Remoções:**
- Texto italic "Em projetos de Neymar Jr. ..." (vira coluna 3)
- `h-8` spacer entre blocos (substituído pelo grid)

## Arquivo afetado

- `src/components/product/SocialProofBand.tsx` — reescrita completa do JSX (componente curto, ~30 linhas)

Nada de lógica, dados externos ou outros componentes mudam. Só presentação.
