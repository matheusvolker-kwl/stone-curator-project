# Sprint 1 — Finalização + Sprint 2 — Prova social completa

## Parte A — Fechar Sprint 1

Atualizar `src/config/business.ts` com os valores definitivos:

- `enderecoAtelieCompleto`: "Rua Colina, 38 — Jardim Paraíso, Cajamar/SP · CEP 07794-075"
- `horarioAtelie`: "Seg–Sex · 9h às 17h"
- Remover os `// TODO confirmar` correspondentes

Esses dois campos já são consumidos por `Footer.tsx` e `Contact.tsx` — nenhuma outra mudança necessária.

---

## Parte B — Sprint 2

### B.1 Camada 1 — adicionar Diogo Nogueira e Caito Maia em `src/data/projetos.ts`

Duas novas entradas (`PROJETOS` array). Como não há fotos liberadas:

- Gerar 2 covers cinematográficos via `imagegen` salvos em `src/assets/projetos/cover-diogo-nogueira.webp` e `cover-caito-maia.webp`. Cenas neutras de Western (composição mineral em jardim seco / cascata em área de lazer), sem rostos, sem placas identificáveis.
- Snippet curto + texto com tom de "projeto sob acordo de confidencialidade — detalhes mediante consulta".
- Sem campo `video` próprio (atualizar interface `Projeto` para `video?: string` opcional, e o `ProjetoModal` para esconder o player quando ausente).

### B.2 Camada 2 — nova página `/parceiros-arquitetos`

**Novo arquivo**: `src/pages/ParceirosArquitetos.tsx` em estilo editorial coerente com `About.tsx`:

- Hero: eyebrow "Especificada por", H1 "Arquitetos que confiam na Western.", regra dourada, parágrafo introdutório curto.
- 3 cards horizontais empilhados (alterna lado da foto: esq / dir / esq) — cada um:
  - Foto profissional do arquiteto (carrego via web search/fontes oficiais e salvo em `src/assets/arquitetos/eduardo-faisal.webp`, `fabiano-hayasaki.webp`, `ronaldo-luidi.webp`)
  - Nome em `font-display` grande
  - Cidade em mono uppercase
  - Parágrafo descritivo (texto rascunho do briefing — Western valida depois)
  - Citação curta entre aspas em itálico (placeholder marcado `// TODO citação` enquanto Western não fornece)
- Bloco CTA final remetendo a `/parceiro/cadastro`

**Fonte das fotos**: usar `websearch--web_search` para localizar retratos oficiais de cada arquiteto em sites/perfis públicos; baixar com `curl` e salvar em `src/assets/arquitetos/`. Se não achar foto adequada para algum dos três, gerar avatar tipográfico (iniciais em frame dourado) como fallback temporário marcado `// TODO substituir`.

**Roteamento**: adicionar `<Route path="/parceiros-arquitetos" element={<ParceirosArquitetos />} />` em `App.tsx`.

**Navegação**: adicionar item "Arquitetos parceiros" em `Footer.tsx` na coluna "Western" e considerar item no `Header.tsx` (decidir caso o menu fique pesado — se sim, deixar só no footer).

### B.3 Camada 3 — seção institucional dentro de `/sobre`

Editar `src/pages/About.tsx` adicionando uma seção depois do bloco de texto e antes do CTA:

- Eyebrow: "Atendemos há mais de uma década"
- H2: "Marcas que escolheram repetir a Western"
- Parágrafo introdutório do briefing (Cobasi não fica anos com fornecedor que falha…)
- Grid responsivo de 5 logos (`grid-cols-2 sm:grid-cols-3 md:grid-cols-5`)
- Cada item: frame neutro com logo oficial centralizado + nome em texto pequeno abaixo (acessibilidade/SEO)

**Fonte dos logos**: para cada uma das 5 marcas (Cristal Pool, Genesis Ecossistemas, Biopet Lagos, Cobasi, Unique Garden) usar `websearch--web_search` (`site:` da marca, ou "logo png/svg") e baixar versões oficiais — preferir SVG quando disponível. Salvar em `src/assets/parceiros/cristal-pool.svg`, `genesis-ecossistemas.svg`, `biopet-lagos.svg`, `cobasi.svg`, `unique-garden.svg`. Se algum não tiver SVG público, usar PNG transparente. Fallback: gerar wordmark tipográfico marcado `// TODO substituir`.

Renderizar com `filter` neutro (sem dessaturar) já que temos autorização de uso.

### B.4 Menção textual na Home

Adicionar uma faixa discreta em `src/pages/Index.tsx` entre `<ProjetosSection />` e `<ArtistaSection />`:

```
Especificada por Eduardo Faisal, Fabiano Hayasaki, Ronaldo Luidi e outros estúdios.
Atende Cobasi, Unique Garden, Cristal Pool, Genesis Ecossistemas e Biopet Lagos.
```

Em uma única faixa horizontal, fundo `surface-paper` ou `surface-ivory`, font mono uppercase tracked, cor `text-western-stone-warm`, padding generoso. Sem ícones gritantes. Centralizado, max-w-4xl. Os nomes dos arquitetos viram links para `/parceiros-arquitetos`.

### B.5 Acertos pequenos

- Atualizar `src/data/projetos.ts` interface: `video?: string` (opcional).
- `ProjetoModal.tsx`: renderizar player apenas se `projeto.video` existir; caso contrário, mostrar imagem cover em destaque + texto.

---

## Arquivos tocados

Novos:
- `src/pages/ParceirosArquitetos.tsx`
- `src/assets/arquitetos/{eduardo-faisal, fabiano-hayasaki, ronaldo-luidi}.webp` (ou .jpg)
- `src/assets/parceiros/{cristal-pool, genesis-ecossistemas, biopet-lagos, cobasi, unique-garden}.svg` (ou .png)
- `src/assets/projetos/cover-{diogo-nogueira,caito-maia}.webp`

Editados:
- `src/config/business.ts` (endereço/horário definitivos)
- `src/data/projetos.ts` (+ 2 entradas, video opcional)
- `src/components/home/ProjetoModal.tsx` (suporte a video opcional)
- `src/pages/Index.tsx` (faixa de prova social)
- `src/pages/About.tsx` (seção Camada 3)
- `src/App.tsx` (rota nova)
- `src/components/layout/Footer.tsx` (link "Arquitetos parceiros")

## Riscos e ressalvas

- **Direitos de imagem**: você confirmou autorização. Mesmo assim, vou usar fontes públicas oficiais (sites pessoais, Instagram verificado, imprensa) e registrar a origem em comentário ao lado de cada `import` para auditoria futura.
- **Citações dos arquitetos**: ficam como `// TODO` até Western enviar — não invento aspas atribuídas a pessoas reais.
- **Números aproximados de projetos especificados** ("há mais de uma década", "X projetos"): omito se não tivermos a fonte; mantenho linguagem qualitativa segura.
- **Logos não encontrados em SVG/PNG limpo**: caem para wordmark tipográfico marcado para substituição, sem bloquear o sprint.

## Fora de escopo

Sprint 3 (leads), 4 (institucional), 5 (SEO/perf), 6 (carrinho).
