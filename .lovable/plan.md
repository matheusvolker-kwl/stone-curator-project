## Diagnóstico

Três classes de bug aparecem nos prints e se repetem em outras telas:

**1. Overflow horizontal global**  
`html`/`body` em `src/index.css` não têm `overflow-x: hidden` nem `max-width: 100vw`. Qualquer filho que estoure 390px (decorações, `whitespace-nowrap` longo, grids fixos, sombras absolutas) faz a página inteira rolar lateralmente — é o que vemos nas imagens 23–25 (PDP) e por que aparece scrollbar horizontal no print.

Suspeitos já mapeados:
- `TopBar.tsx`: faixa `animate-[shimmer]` em `whitespace-nowrap`, ok porque o pai tem `overflow-hidden`, mas vale revalidar.
- `ProductPage.tsx`: linha de thumbs já tem `overflow-x-auto`, mas a coluna de acabamentos / botão "Adicionar" / linha "Produção sob demanda · …" usa `whitespace-nowrap` ou texto largo sem `min-w-0` no flex pai → empurra a coluna.
- `StepFechamento.tsx:171`: `whitespace-nowrap` em parágrafo dentro de coluna estreita.
- `Header.tsx`: navegação com `whitespace-nowrap` em flex sem `min-w-0`.

**2. Badge "ACABAMENTO QUARTZO" cobrindo o eyebrow do card no Step 5** (img 26)  
`StepBase.tsx:185` posiciona o badge em `absolute top-5 right-5` sobre o card hero. No mobile o pill (com label "Acabamento Quartzo" + tracking 0.2em) ocupa metade da largura do card e cobre o eyebrow "COMPOSIÇÃO EQUILIBRADA" e parte do título. Decisão do usuário: manter no canto, só caber.

**3. Footer sticky escondendo conteúdo no fim das etapas** (img 27)  
`GuideStepFooter.tsx` renderiza CTA sticky em `fixed bottom: 76px` (acima da barra mobile do carrinho de 76px). Total ~140px ocupados, mas o `<main>` do guia não tem `padding-bottom` mobile equivalente — a última linha do conteúdo fica oculta. Decisão: adicionar `padding-bottom` no container do passo apenas no mobile.

## Plano de execução

### A. Blindar overflow global
1. Em `src/index.css`, adicionar a `html, body`:
   ```css
   overflow-x: hidden;
   max-width: 100vw;
   ```
   (correção defensiva — não substitui consertar a causa, mas evita que qualquer regressão futura quebre o layout inteiro).

### B. Auditar e consertar elementos que estouram no mobile
Varredura por `whitespace-nowrap`, grids `grid-cols-[Npx_…]` fixos e `flex` sem `min-w-0`. Correções pontuais previstas:

1. **`ProductPage.tsx`** (causa imagens 23–25):
   - Coluna de detalhes: garantir `min-w-0` no item flex pai e remover/condicionar `whitespace-nowrap` da linha de meta ("Produção sob demanda · 15 dias úteis · …") — quebrar em 2 linhas no mobile.
   - Bloco "Acabamentos disponíveis" (chips): trocar por `flex-wrap` + chips com `whitespace-nowrap` individual (chips podem ficar nowrap, o container envolve).
   - Botão "ADICIONAR" e "FALAR": garantir que o container do CTA não ultrapasse `w-full` (verificar se algum pai tem `min-w` indevido).
   - Hero da imagem do produto: confirmar `overflow-hidden` na moldura e `max-w-full` na `<img>`.

2. **`StepFechamento.tsx:171`**: remover `whitespace-nowrap` do parágrafo (deixar quebrar) ou trocar por `truncate` se for um único item visual.

3. **`Header.tsx` / `TopBar.tsx`**: adicionar `min-w-0` nos containers flex do header desktop e confirmar `overflow-hidden` da faixa de marquee.

4. Outras telas (`Linhas`, `LinhaPage`, `Sobre`, `Index`): rodar checagem rápida do mesmo padrão e aplicar `min-w-0` / `flex-wrap` onde necessário.

### C. Badge de acabamento no Step 5
Em `StepBase.tsx:185`:
- Reduzir o badge no mobile: esconder a palavra "Acabamento" (manter só o nome do acabamento) ou diminuir tracking + padding em telas `<sm`.
- Usar `max-w-[60%]` + `truncate` para garantir que nunca cubra mais da metade do card.
- Mantém `absolute top-5 right-5` no canto superior direito do hero, conforme escolhido.

### D. Padding-bottom no conteúdo do Guia
Em `BuyingGuide.tsx`, no container do passo (próximo à linha 179):
- Adicionar `pb-44 xl:pb-0` (≈ 176px) para reservar espaço do footer sticky (≈ 60px) + margem + barra do carrinho mobile (76px). Valor exato calibrado contra `bottom: 76px` do footer.
- Validar que o `<main>` por trás do `GuideAssemblySummary` mobile (Sheet) não fica com gap.

### E. Validação visual
Com viewport 390×844 (mobile), navegar e revisar:
- `/` (home), `/sobre`, `/linhas`, `/linhas/:slug`, `/produto/:handle` (com 23/24/25 como referência), `/guia` percorrendo as 9 etapas (focar 5, 6 e 9).
- Confirmar ausência de scrollbar horizontal e ausência de conteúdo coberto pelo footer.

## Detalhes técnicos

- **Padrão `min-w-0`**: itens de flexbox em coluna/row têm `min-width: auto` por padrão, o que impede o filho de encolher abaixo do conteúdo intrínseco. `min-w-0` no item flex (não no pai) libera a redução e evita estouro lateral.
- **`overflow-x: hidden` no body**: aceita-se trade-off de bloquear scroll horizontal intencional (não há nenhum no app). Não afeta `position: sticky`.
- **Padding bottom do guia**: usar Tailwind arbitrário se necessário (`pb-[180px] xl:pb-0`). Se um passo já tem `GuideStepFooter` in-flow, o sticky só aparece quando o footer in-flow sai da viewport (controlado por IntersectionObserver), então o padding extra só é "desperdiçado" quando o footer in-flow está visível — aceitável.
- **Badge mobile-first**: classes propostas — `text-[9px] sm:text-[10px] px-2 py-1 max-w-[60%] truncate`, com `<span className="hidden sm:inline">Acabamento </span>` antes do nome.

## Arquivos previstos para edição

- `src/index.css` — overflow-x + max-width
- `src/pages/ProductPage.tsx` — `min-w-0`, `flex-wrap`, remoção de `whitespace-nowrap` da linha meta
- `src/pages/BuyingGuide.tsx` — padding-bottom mobile no container do passo
- `src/components/guide/StepBase.tsx` — badge responsivo
- `src/components/guide/StepFechamento.tsx` — remover `whitespace-nowrap` da linha 171
- `src/components/layout/Header.tsx` / `TopBar.tsx` — `min-w-0` defensivo (se necessário)

Sem mudanças de lógica de negócio, dados ou store. Apenas CSS/markup de apresentação.
