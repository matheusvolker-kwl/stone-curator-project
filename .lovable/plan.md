## Reformular a seção "Artista" na home

A seção `ArtistaSection` (renderizada no `src/pages/Index.tsx`, linha 198) hoje fala da família Botelho de forma institucional — repete o conteúdo já presente em `/sobre`. Vamos transformá-la num **respiro autoral focado no Ricardo**, ancorado na foto nova dele desenhando no ateliê e na frase:

> "Cada peça da Western nasce duas vezes: uma na natureza, outra no traço."
> — Ricardo Botelho

A seção família-completa continua existindo no `/sobre`, sem duplicação.

### O que muda

**Foto nova**
- Salvar o upload em `src/assets/ricardo-desenhando.webp`
- Importar como módulo ES6 dentro do componente

**Layout da seção (mantém `surface-ivory`, sem moldura quadrada)**

```text
[ FOTO grande, 7 colunas              ]   [ 5 colunas — texto         ]
[ aspect 4/5 ou 3/4, sem borda dura,  ]   eyebrow: "O artista"
[ sombra sutil, hover scale lento     ]   H2 display, em itálico/light:
[ legenda discreta abaixo da imagem   ]   "Cada peça da Western
                                            nasce duas vezes:
                                            uma na natureza,
                                            outra no traço."
                                          — Ricardo Botelho
                                            Diretor criativo · 2ª geração

                                          parágrafo curto (2–3 linhas)
                                          posicionando ele como autor:
                                          desenha cada matriz, define a
                                          paleta de pinturas, assina o
                                          gesto de cada peça.

                                          link sutil → /sobre
                                          ("Conhecer o ateliê →")
```

- Foto **maior** que hoje (ocupa 7/12 desktop em vez de 5/12), sem o tarja verde sobreposta atual — substituída por uma legenda fina abaixo, no estilo editorial usado no `/sobre` (borda dourada à esquerda).
- A frase é o herói visual: `font-display`, tamanho `text-3xl md:text-5xl`, com aspas tipográficas reais e uma parte em itálico dourado (padrão do projeto).
- Mobile: foto em cima, texto embaixo, frase quebra em 3–4 linhas.

### Detalhes técnicos

- Editar **apenas** `src/components/home/ArtistaSection.tsx` (reescrita do conteúdo, mantém o nome do componente e o uso em `Index.tsx`).
- Copiar `user-uploads://69b0ed73-0ebe-43d2-a42e-9009afd63af2.png` → `src/assets/ricardo-desenhando.webp` (manter `.webp` como o resto dos assets do projeto via copy direto; se o copy preservar `.png` está ok, ajusto a extensão na hora).
- Reusar `Reveal` (já envolvido em `Index.tsx`), tokens semânticos (`western-green-deep`, `western-gold`, `western-gold-soft`, `western-stone-warm`, `surface-ivory`), tipografia `font-display` / `font-mono` / `text-eyebrow`.
- Remover o import de `retrato` (foto dos dois irmãos) deste componente — segue sendo usado no `/sobre`.
- Sem alterações em `/sobre`, na seção família ou na citação atual lá.

### Fora do escopo

- Não mexer em `About.tsx` nem na citação "Não vendemos pedra…".
- Não criar componente novo nem rota nova.
- Não alterar a ordem das seções da home.
