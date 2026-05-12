## Reformular faixa de atalhos da Home (B2B + Guia)

Aplicar a direção escolhida — **Split: verde profundo + cream** — na seção "AVISO B2B + GUIA" do `src/pages/Index.tsx` (linhas 125–172). Os atalhos ganham peso visual real (cor de fundo, padding generoso, tipografia maior) sem perder elegância editorial.

### Mudanças no `src/pages/Index.tsx`

Substituir o bloco atual da `<section>` por uma faixa em 2 colunas com fundos contrastantes:

- **Coluna 01 / B2B** — fundo `bg-western-green-deep`, texto cream, número e CTA em `text-western-gold`. Hover suave clareia o verde.
- **Coluna 02 / GUIA** — fundo `bg-western-cream` (ou ivory equivalente), texto `text-western-green-deep`, número em mono uppercase com opacidade. Hover escurece levemente o cream.
- **Divisor central dourado** sutil (`bg-western-gold/20`) só em md+.
- **Tipografia da frase principal** sobe para `text-2xl md:text-3xl lg:text-[2.25rem]` usando a font-display do projeto (já é serif), mantendo `leading-tight`.
- **CTAs** com underline dourado/verde animado (`border-b` + transição) e seta `ArrowRight` com `translate-x-1` no hover (mantém o padrão atual).
- **Padding** generoso: `p-10 md:p-14` em cada coluna.
- **Texto** preservado exatamente como está hoje:
  - "Site exclusivo para empresas parceiras." + "Ainda não é parceiro?" → reorganizar como título + apoio italic, mantendo o sentido.
  - "Dúvidas para montar sua composição?" + "Use nosso guia interativo." → mesmo tratamento.
- **Links** continuam para `/parceiro/cadastro` e `/guia-de-composicao`.
- **Reveal/animação** de entrada mantida (envolver com `<Reveal variant="fade-up">` se ainda não estiver).

### Regras de design system (importante)

- **Não usar cores hardcoded** dos protótipos (`#2c3a2e`, `#c5a059`, `#f5f5f0`). Usar tokens já existentes: `western-green-deep`, `western-gold`, `western-cream`, `western-stone-warm`, `western-ivory`.
- **Não trocar fontes**: manter `font-display` (serif do projeto) e `font-mono` para labels/CTAs — não importar Cormorant/Space Mono do protótipo.
- Mobile: colunas empilhadas, divisor vira borda horizontal.

### Validação

1. Tirar screenshot da home no viewport atual (1442px) para confirmar contraste, alinhamento e que o bloco não fica pesado demais sob a hero.
2. Verificar mobile (~375px) — colunas empilhadas, padding adequado, CTAs legíveis.
3. Conferir hover dos dois cards.

### Arquivos afetados

- `src/pages/Index.tsx` (apenas a seção de atalhos, linhas ~125–172)

Nenhuma alteração em rotas, dados ou lógica.