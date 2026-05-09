Vou refazer três áreas com tratamento visual coerente com o resto do site (editorial, sóbrio, dourado discreto), padronizar logos e propagar para a home.

## 1. Logo Genesis (novo upload)

- Copiar `user-uploads://image-33.png` → `src/assets/parceiros/genesis.png` (sobrescrever o branco anterior).
- Como é branco-sobre-preto, vai precisar de placa escura (ver item 2).

## 2. Marcas institucionais — `src/pages/About.tsx` + nova seção compartilhada

Hoje: grid de 5 caixas creme, logos com alturas/proporções diferentes, Genesis em wordmark, Cobasi (vermelho), Unique (escuro), Biopet (colorido), Cristal — visualmente bagunçado.

Refazer como **faixa institucional editorial**:

- Criar componente reutilizável `src/components/shared/MarcasInstitucionais.tsx` para ser usado em About **e** na Home (consistência total).
- Layout: grid `grid-cols-2 sm:grid-cols-3 md:grid-cols-5`, cada célula com:
  - Fundo escuro `surface-forest` (verde profundo) — neutraliza diferenças de cor entre logos coloridos.
  - Cada logo recebe filtro CSS para virar branco/cream uniforme: `filter: brightness(0) invert(1) opacity(0.78)` + `hover:opacity-100`. Isso força paleta única e resolve o problema das 5 cores diferentes.
  - Altura travada (`h-10 md:h-12`), `w-auto`, `object-contain`, centralizado.
  - Borda fina dourada entre células (`gap-px bg-western-gold/15`).
  - Hover: levanta opacidade + sublinha o nome (caption mono pequena abaixo, oculta por padrão? — não, manter visível e discreta para acessibilidade/SEO).
- Genesis (logo já branco): aplicar `mix-blend-mode: screen` ou simplesmente não aplicar o filtro invert, condicional via prop `jaEhBranco: true`.
- Eyebrow + título acima permanecem; ajustar copy se necessário.
- Variante prop `tom: "claro" | "escuro"` para usar tanto sobre `surface-ivory` (About) quanto sobre `surface-paper` (Home) — internamente o componente sempre usa placas escuras para uniformizar logos, então funciona em qualquer fundo.

## 3. Cards dos arquitetos — `src/pages/ParceirosArquitetos.tsx`

Hoje: foto solta num `aspect-[4/5]` com borda fina dourada, texto solto ao lado, sem nenhum tratamento de superfície, sem shadow, sem hierarquia visual. Parece wireframe.

Refazer cada card como **artigo editorial encaixado em superfície**:

- Container externo do artigo: `surface-paper` (creme escuro sutil) ou `bg-western-cream` com:
  - Borda `border border-western-stone-warm/15`
  - Sombra discreta `shadow-[0_24px_60px_-30px_rgba(0,0,0,0.25)]`
  - Padding interno generoso `p-8 md:p-12`
  - Hover sutil: sombra cresce, borda dourada aparece (`hover:border-western-gold/40 transition`)
- Foto:
  - Continua `aspect-[4/5]`, mas dentro de uma moldura: borda dourada dupla fina (`ring-1 ring-western-gold/30 ring-offset-2 ring-offset-western-cream`) e leve `shadow-xl`.
  - Filtro `grayscale-[15%]` para harmonia cromática (sutil, não preto-e-branco), some no hover.
  - Tag dourada flutuante no canto superior: pequena placa `font-mono text-[10px] tracking-[0.22em]` com a cidade (ex.: `SÃO PAULO · SP`), substituindo o texto solto que está hoje acima do nome.
- Bloco de texto:
  - Eyebrow `Arquiteto parceiro · 0X` numerado (01, 02, 03) em mono dourado.
  - Filete dourado `w-10 h-px` mantém-se.
  - Nome em display, mantém tamanho.
  - Parágrafo em `text-western-stone-warm`.
  - Linha técnica abaixo: três pequenas chips mono separadas por `·` (ex.: `RESIDENCIAL ALTO PADRÃO · CASCATAS · PISCINAS`) — dá densidade editorial sem inventar dados.
- Alternância par/ímpar mantida (foto à esquerda/direita).
- Espaçamento entre artigos um pouco menor (`space-y-16` em vez de `space-y-28`) já que cada card agora tem peso visual próprio.

## 4. Home — `src/pages/Index.tsx`

Hoje a faixa institucional é só texto pequeno em mono. Substituir por:

- Manter o eyebrow textual "Especificada por … " (pequeno, acima).
- Logo abaixo, instanciar `<MarcasInstitucionais variante="compacta" />` — mesma faixa de logos da About, versão sem o grande título acima.
- Manter o link para `/parceiros-arquitetos` e `/sobre` no rodapé da seção.
- Resultado: a home passa a mostrar visualmente as 5 marcas, não só o nome em texto corrido.

## 5. Detalhes técnicos

- Tudo em tokens semânticos do `index.css` (`western-gold`, `western-green-deep`, `western-cream`, `western-stone-warm`). Nenhuma cor hardcoded.
- Filtro de uniformização de logos via classe Tailwind arbitrária `[filter:brightness(0)_invert(1)]` ou utility no `index.css` — vou criar `.logo-mono` no `index.css` para reutilização.
- Todas as imagens com `loading="lazy"` (já estão).
- Sem mexer em rotas, dados ou backend. Mudança puramente de UI/presentation.

## Arquivos tocados

Novo:
- `src/components/shared/MarcasInstitucionais.tsx`

Editados:
- `src/assets/parceiros/genesis.png` (sobrescrever)
- `src/index.css` (adicionar `.logo-mono`)
- `src/pages/About.tsx` (consumir componente)
- `src/pages/Index.tsx` (consumir componente)
- `src/pages/ParceirosArquitetos.tsx` (redesign cards)

## Pergunta antes de implementar

Sobre o tom da faixa de logos: prefere **placa escura** (`surface-forest`, logos branco-cream uniformes — mais editorial e "marca que respeita marca", esconde diferença de cor) ou **placa clara** (fundo creme, logos em cinza/preto uniformes — mais B2B clássico, tipo página de "clientes" de agência)? Vou seguir com **escura** por padrão se você não responder, porque combina com a lógica do site (verde profundo + dourado) e resolve melhor o problema do Genesis branco.
