## Nova seção: "O artista por trás da Western"

Adicionar uma seção institucional na home apresentando Ricardo Botelho, com o retrato enviado.

### Onde entra na home

Entre **SOBRE · A Western** e **PROJETOS** — sequência narrativa:
1. Sobre (a marca) → 2. **Artista** (a mão por trás) → 3. Projetos (as obras realizadas)

Faz sentido porque o "Sobre" termina falando de procedência/curadoria, e a seção do artista aprofunda o "quem faz a curadoria". Em seguida os projetos mostram o resultado.

### Anatomia visual

Mesma gramática das outras seções verde-escuras (surface-forest):

- **Surface**: `surface-forest` (não cria duas seções verdes consecutivas, mas o "Sobre" já é verde — para evitar parede verde, esta seção do artista será **surface-ivory** (creme), criando respiro entre dois blocos verdes e dando destaque ao retrato).
- **Layout**: `grid md:grid-cols-12` — retrato à esquerda (col-span-5), texto à direita (col-span-6, offset 1).
- **Retrato**: enquadrado em `frame-gallery` com `aspect-[4/5]`, borda sutil `western-gold/30`. Sem filtros — cor natural.
- **Eyebrow**: `AUTORIA · RICARDO BOTELHO` (bege/dourado, mono, letterspacing).
- **Régua dourada** de 12px abaixo do eyebrow (padrão da home).
- **Título serifado**: "O artista por trás da Western." — `font-display`, com "Western" em itálico dourado-suave para combinar com os outros títulos ("contempla", "tempo", "o projeto").
- **Parágrafos**: dois blocos de texto exatamente como fornecidos pelo usuário, em `text-western-stone-warm` / leading-relaxed, max-width controlado (~prose-sm).
- **Assinatura/caption discreta** abaixo do retrato: `Ricardo Botelho · Desenhista e escultor` em mono pequeno.
- **Sem CTA** — é uma seção de presença, não de conversão. (Coerente com o tom contemplativo.)

### Detalhes técnicos

- **Asset**: copiar `user-uploads://image-21.png` para `src/assets/ricardo-botelho.webp` (ou `.jpg` mantendo extensão original do upload). Importar como módulo ES6.
- **Componente novo**: `src/components/home/ArtistaSection.tsx` — mantém a home limpa e segue o padrão de `ProjetosSection.tsx`.
- **Index.tsx**: importar e inserir `<ArtistaSection />` entre o bloco "SOBRE" e `<ProjetosSection />`.
- **Responsivo**: em mobile, retrato acima do texto, ambos full-width com padding container padrão.
- **Sem novas dependências, sem mudanças no Tailwind config.**

### Texto (exato como enviado)

Título: **O artista por trás da Western.**

Parágrafo 1: "A Western começa antes da fábrica. Começa no traço de Ricardo Botelho — desenhista, escultor e o autor dos projetos de cada peça do nosso catálogo. É dele a observação paciente da pedra natural que se traduz em forma, em proporção, em textura. É dele a decisão sobre como uma cascata vai escorrer, como um fóssil vai se revelar, como uma pedra de borda vai conversar com a água."

Parágrafo 2: "Cada peça que sai da Western nasce de um desenho seu, passa por um modelo e curadoria, e só depois entra em produção em um composto mineral de alta resistência. Esse é o motivo de o nosso catálogo ter coerência visual com a natureza: existe um olhar único organizando o conjunto."
