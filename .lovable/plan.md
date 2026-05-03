
# Minha sugestão para o fundo

O incômodo vem de um conflito de temperatura: o creme atual (`#E8DFD0`, bem amarelado/quente) está muito mais escuro e mais saturado que o branco dos PNGs dos produtos. Resultado: cada foto vira um "selo" branco flutuando sobre bege — quebra o ASMR e parece adesivo.

A melhor solução, sem mexer nas fotos, é **aproximar o fundo da seção do branco da foto**, mantendo só uma leve diferença de temperatura para dar respiração. O creme quente atual passa a ser **acento pontual** (faixas finas, eyebrows, separadores), não fundo de página inteira.

## Nova hierarquia de superfícies

```text
forest    #15301E   verde profundo  → hero, institucional, footer (âncora)
ivory     #F6F2EA   marfim quase branco → grids de produto, linhas, ficha técnica  ← NOVO PADRÃO
paper     #FBF8F2   branco-quente   → detalhe de produto, gallery (quase = foto)
cream     #E8DFD0   creme quente    → faixas de transição estreitas, acentos, hover states
```

Diferença prática: hoje os grids de produto estão em `#E8DFD0`. Vão para `#F6F2EA` (muito mais próximo do branco do PNG). A foto deixa de "recortar" contra o fundo.

## Tratamento do card do produto

Como você quer **não mexer na foto agora**, a integração vem do card:
- Remover a borda/box atual (`frame-product` com hairline cinza).
- Foto fica direto sobre o ivory, com **sombra muito suave embaixo** (`0 30px 40px -30px rgba(20,30,15,.18)`), tipo "pedra apoiada na página".
- Hairline dourado de 1px aparece só no hover, vindo de baixo (continua o hairline-top já existente).
- Padding interno reduzido: a pedra respira mais, o branco da foto vira parte da página.

## Ritmo de alternância

```text
[Hero verde profundo]
   hairline dourado
[Linhas — ivory]               ← era cream
[Sobre / manifesto — verde]
[Coleções sazonais — paper]    ← ainda mais claro, editorial
[Guia de Compra — verde]
[Conjunto sugerido — ivory]
[Footer verde]
```

Faixas de `cream` (#E8DFD0) só aparecem como **separador de 80–120px** entre duas seções verdes consecutivas, ou como fundo do header quando sobre ivory. Nunca mais como fundo de grid inteiro.

## Arquivos a editar

- `src/index.css`: trocar `--western-ivory` para `38 35% 95%` (`#F6F2EA`) e `--western-cream` mantém valor mas vira acento; criar `--surface-paper` (`38 40% 97%`). Ajustar `.frame-product` (remover borda visível, adicionar `box-shadow` suave). Ajustar `.surface-cream` para virar utilitário de faixa, e promover `.surface-ivory` como padrão de grid.
- `tailwind.config.ts`: adicionar token `western.paper`.
- `src/pages/Linhas.tsx`, `LinhaPage.tsx`, `ProductPage.tsx`, `ColecoesSazonais.tsx`, `ColecaoSazonalPage.tsx`, `BuyingGuide.tsx`: trocar `surface-cream` por `surface-ivory` (ou `surface-paper` no detalhe de produto).
- `src/pages/Index.tsx`: revisar a alternância de seções conforme ritmo acima.
- `src/components/product/ProductCard.tsx`: simplificar `frame-product` (sem borda, com sombra), reduzir padding interno da imagem de `p-6` para `p-4`.
- `src/components/layout/Header.tsx`: garantir que o tema "claro" do header use ivory como referência (não cream).

## O que NÃO mexo agora

- Fotos dos produtos (mantêm fundo branco; a integração vem do fundo da página).
- Paleta de verde e dourado (intactos).
- Estrutura de rotas, conteúdo, taxonomia.

Se depois quiser dar mais um passo, dá pra testar `mix-blend-mode: multiply` leve nas fotos para "fundir" o branco no ivory — mas só faço se você pedir, porque pode escurecer demais pedras claras.
