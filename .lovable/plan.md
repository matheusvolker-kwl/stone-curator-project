# Citação em 2 linhas e logos parceiros equilibrados

## 1. Citação "Cada peça da Western nasce duas vezes…" em 2 linhas

Em `src/components/home/ArtistaSection.tsx`, forçar quebra exata após "duas vezes:" e limpar o espaço duplo. Resultado:

- Linha 1: `"Cada peça da Western nasce duas vezes:`
- Linha 2: `uma na natureza, outra no traço."` (em itálico/dourado)

Implementação: substituir o trecho da `<blockquote>` por dois trechos separados por `<br />`, sem o espaço extra antes da quebra. Mantém tipografia, cor e tamanhos atuais (apenas reorganiza layout).

## 2. Diagnóstico do problema dos logos

Tirei screenshots e medi os PNGs reais (`PIL` no sandbox). Os arquivos têm a mesma "moldura" (1200×600), mas a área visível é muito diferente:

| Logo        | Canvas    | Área visível | % preenchimento |
|-------------|-----------|--------------|-----------------|
| Biopet      | 1200×600  | 552×450      | 46% horizontal  |
| Cristal Pool| SVG (wide)| ~banner       | ~85% horizontal |
| Genesis     | 1200×600  | 450×450      | 38% horizontal  |
| Cobasi      | 1200×600  | 1020×243     | 85% horizontal  |

**Por isso a Cobasi parece "grande":** o PNG dela é praticamente todo logo, enquanto Biopet/Genesis têm muito espaço vazio em volta. O `larguraMax` mede o canvas, não o logo visível.

**Por isso ela quebra de linha:** a faixa está dentro de `max-w-4xl` (~896 px). Soma das larguras (200+260+180+200) + gaps (3×80) = ~1080 px → estoura o container e a Cobasi vai pra linha de baixo.

## 3. Correções dos logos

**a) Aparar (trim) o whitespace dos PNGs cream** — script Python (Pillow) recorta cada arquivo na bbox real e sobrescreve. Faz com que `larguraMax` passe a refletir o logo visível:
   - `biopet-cream.png`: 1200×600 → 552×450
   - `cobasi-cream.png`: 1200×600 → 1020×243
   - `genesis-cream.png`: 1200×600 → 450×450

**b) Em `src/components/shared/MarcasInstitucionais.tsx`, na variante `semBordas`:**
   - Recalibrar `larguraMax` para que todos fiquem com presença visual semelhante:
     - Biopet `larguraMax: 130`
     - Cristal Pool `larguraMax: 170` (banner horizontal precisa de mais largura)
     - Genesis `larguraMax: 110` (logo quadrado)
     - Cobasi `larguraMax: 170` (banner horizontal)
   - Aumentar `max-h` (`max-h-12 md:max-h-14`) para dar respiro vertical balanceado entre quadrados e banners.
   - Reduzir gap (`gap-x-8 md:gap-x-12`) para garantir que tudo caiba em uma linha no container `max-w-4xl` da home.
   - Manter `flex-wrap` como fallback de segurança (apenas em viewports muito estreitos).

**c) Validação obrigatória com prints:**
   - Após cada ajuste, screenshot da home na seção "Prova de procedência".
   - Comparar visualmente os 4 logos lado a lado; se algum ainda parecer 30%+ maior/menor, ajustar `larguraMax` daquele item específico e tirar print de novo.
   - Confirmar com print final: 4 logos em uma linha, tamanhos visualmente equivalentes, Cobasi sem quebra.

## Detalhes técnicos

- Trim feito por script Python no sandbox (`PIL.Image.crop(bbox)`); sobrescreve os PNGs cream. Originais ficam versionados pelo git.
- Cristal Pool continua sendo o SVG verde com filtro `brightness(0) invert(1)` (não tem PNG cream válido — bug já tratado).
- Sem mudanças em tokens, rotas ou outras seções do site.
- Iteração visual: caso o trim altere o aspecto a ponto de algum logo precisar de ajuste fino, refazer só o `larguraMax` daquele item.
