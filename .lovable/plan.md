## Correção do paralaxe nas seções de imagem-fundo do `/sobre`

**Arquivo:** `src/pages/About.tsx`

### Problema
A seção "CITAÇÃO" usa paralaxe (`translate3d` baseado em scroll) numa `<img>` com `inset-0` + `object-cover`. Como a imagem ocupa exatamente o tamanho do container, qualquer deslocamento do paralaxe expõe a área verde sólida acima/abaixo da imagem — daí a faixa verde chapada que aparece entre seções.

O CTA final tem o mesmo padrão e o mesmo bug latente.

### Correção
Em ambas as seções (citação e CTA final):

1. Trocar `inset-0 w-full h-full` da `<img>` por algo como `top-[-10%] left-0 w-full h-[120%]`, de modo que a imagem seja ~20% maior que o container.
2. Manter o `translate3d` do paralaxe, mas com magnitude reduzida o suficiente para nunca expor as bordas (a folga de 10% em cima e embaixo absorve o deslocamento dentro de uma faixa razoável de scroll).
3. Manter `overflow-hidden` no container e o overlay/gradiente verde por cima — não mexer em legibilidade, copy ou layout.

### Fora do escopo
- Sem mudanças de copy, tipografia, alturas de seção ou ordem de blocos.
- Sem mexer no HERO (que já usa `scale` no transform e não tem o problema).