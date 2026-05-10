## Diagnóstico

O guia hoje funciona, mas é "limpo demais" — fundo ivory uniforme, cards brancos com o mesmo ícone-pedra repetido em todos os slots. Sem fotografia real, sem profundidade, sem ritmo de superfícies. Falta o que faz o site Western Pools ser desejável: **a pedra**.

Nas referências ASMR (app Florest, hero das folhas) o que prende é:
- **Materialidade fotográfica** (pedras/folhas reais, não ícones)
- **Camadas que se sobrepõem** (foto que escapa do card, sombras longas)
- **Bloco de cor profundo** ancorando a composição (verde escuro)
- **Ritmo lento** — uma decisão de cada vez, com confirmação tátil

## O que vou mudar

### 1. Fotografia real substitui o ícone-pedra repetido

Já existem 6 fotos editoriais em `src/assets/about-projetos/` e 6 covers de projeto em `src/assets/projetos/`. Vou mapear:

```text
TipoCard (5 ambientes):
  piscina        → cover-piscina.avif
  lago           → cover-lago.webp
  lago-reduzido  → cover-cascata.webp
  jardim-fonte   → cover-caito-maia.webp
  jardim-seco    → cover-casa-praia.webp

ComposicaoCard (3 níveis, mesma família visual):
  essencial   → cascata-escalonada.jpg
  equilibrada → cascata-mirante.jpg     (destaque)
  completa    → cascata-tropical.jpg

PecaRow / AutoralCard placeholder:
  detalhe-matriz.jpg / borda-pedra.jpg em crop quadrado
```

O ícone-pedra fica apenas como **marca-d'água sutil** atrás do header (referência ao homepage).

### 2. Profundidade em camadas (referência app Florest)

Cards passam a ter:
- Foto **ocupando 60% da altura**, não mais aspect-ratio fechado
- **Sombra longa** (`0 40px 60px -30px`) que cresce no hover
- Borda gold de 1px nos selecionados (substitui borda preta de 2px que pesa)
- Pequeno **ribbon dourado vertical** ancorado fora do card no "Mais especificado" (escapa do frame, dá profundidade)

### 3. Ritmo de superfícies através das 3 telas

Hoje é tudo `surface-ivory` flat. Passa a alternar como na home:

```text
Etapa 01 — Contexto    : surface-ivory  (claro, convidativo)
                         + faixa fotográfica de respiro-pedra.webp
                           no topo (80px de altura, parallax leve)

Etapa 02 — Composições : surface-paper  (mais quente)
                         + 1 banda surface-forest atrás do card "Equilibrado"
                           (verde escuro emoldura o destaque)

Etapa 03 — Refinar     : surface-ivory + sidebar surface-forest
                         (sidebar deixa de ser branca, vira verde profundo
                          com tipografia em creme — peso institucional Western)
```

### 4. Fio de contexto pegajoso (sticky thread)

Logo abaixo do header, uma **barra horizontal slim** (44px) que aparece a partir da Etapa 02 mostrando as escolhas acumuladas como respiração tátil:

```text
PISCINA  ·  15 m²  ·  MOLEDO          [editar contexto →]
```

Cada chip é clicável e leva de volta à etapa correspondente. Visualmente: fundo `western-cream-muted/20`, hairline ouro embaixo, fonte mono pequena. Dá o "follow" que falta — o usuário sente o projeto se construindo.

### 5. Microinterações de confirmação (ASMR)

- **Selecionar TipoCard**: scale `1.02` + sombra cresce + um pequeno marcador dourado desliza no canto superior (300ms ease-out)
- **Selecionar AcabamentoCard**: o disco do acabamento gira sutilmente 8° + cresce 5%
- **Adicionar peça no Refinar**: PecaRow incrementa com fade do número novo (não troca seco)
- **Reveal cascata**: stagger de 140ms (hoje 100), com `cubic-bezier(0.22, 1, 0.36, 1)` — sensação de "settle"

### 6. Momentos editoriais entre seções

Entre Etapa 01 → 02 → 03, no topo de cada tela, uma única linha em `font-display italic` grande que ancora emocionalmente:

```text
Etapa 02:  "Três caminhos. Mesma alma."
Etapa 03:  "O conjunto se ajusta a você."
```

Aparece com Reveal lento (800ms), em verde-deep, antes do H1. Substitui o "Etapa 02 · Resultado" frio.

### 7. Detalhes Western reforçados

- **Brasão Western** (já em `src/assets/brasao.png`) como marca-d'água ultra-sutil (opacity 0.04) no canto inferior direito de cada tela do guia
- **Eyebrows numerados** com filete vertical dourado de 1px à esquerda em vez de só "·" (`01 │ TIPO DE AMBIENTE`)
- Substituir as **divider-hairline** retas por divisores com pequeno losango dourado central (`◇`) — assinatura visual Western de seção

## Arquivos afetados

```text
src/components/guide-v2/
  TipoCard.tsx          → recebe prop `image`, foto ocupa 60% altura
  ComposicaoCard.tsx    → recebe prop `image`, ribbon escapa do frame
  AutoralCard.tsx       → crop de pedra real
  PecaRow.tsx           → thumbnail com foto crop
  AcabamentoCard.tsx    → microinteração no chip
  ProjetoSidebar.tsx    → muda para surface-forest (verde profundo)
  GuideHeader.tsx       → adiciona brasão watermark + faixa fotográfica fina
  ContextoChips.tsx     → NOVO — barra sticky com escolhas acumuladas
  SectionDivider.tsx    → NOVO — hairline com losango central

src/pages/guia/
  Contexto.tsx     → faixa de hero photo + frase editorial
  Composicoes.tsx  → surface-paper + banda forest no destaque + ContextoChips
  Refinar.tsx      → ContextoChips + frase editorial + sidebar verde

src/index.css
  + .surface-stone (textura sutil de papel pedra para o guia)
  + .divider-diamond (substitui divider-hairline nas seções do guia)
  + keyframes para o "settle" das seleções
```

## O que NÃO muda

- Estrutura de rotas e estado (URL params)
- Lógica de `guideMap`, cálculo de preço, descontos
- Fluxo das 3 telas
- Componentes fora do guia

Mudança puramente visual e de microinteração — não toca a lógica de negócio.

## Resultado esperado

O parceiro abre o guia e a primeira coisa que vê é **uma faixa de pedra real** respirando atrás do header. Cada escolha gruda numa barra que segue ele através das telas. Os cards são fotografias com sombra, não ícones genéricos. O destaque "Equilibrado" está emoldurado por verde-deep como uma vitrine de joalheria. A sidebar verde escuro pesa o projeto, dá institucionalidade. Cada seleção tem um pequeno "click" visual. A divisão entre seções é assinada com um losango dourado.

A tela continua sóbria e editorial — mas agora **cheira a pedra**.
