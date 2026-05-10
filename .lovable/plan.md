## Objetivo

Elevar a PDP atual (`src/pages/ProductPage.tsx`) ao padrão editorial descrito no briefing — Aesop / Norse Projects — sem quebrar integração Shopify, carrinho, gating de preço por parceiro, ou roteamento.

A PDP de hoje já tem: breadcrumb-linha, galeria + thumbs, descrição editorial, aplicações, FinishSelector, PriceGate, stepper + CTA, accordions I–VI e CTA SketchUp. Vamos **reorganizar, refinar e adicionar as seções faltantes**.

---

## Estrutura final da página

```
01. Header (existente)
02. Breadcrumb refinado (Catálogo › Coleção › Produto)
03. Hero (galeria 60% / ficha 40% sticky)
    └─ Eyebrow • H1 • SKU • Bloco de dados duros (peso + dimensões + comparativo) • Lead • Intro
04. Aplicações (na coluna direita)
05. Seletor de Acabamento (FinishSelector já existente, com header "ACABAMENTO · MESMO PREÇO")
    └─ Bloco "pintura personalizada" tracejado
06. Box Condição parceiro (PriceGate block) + CTAs (stepper, adicionar, SketchUp, Falar com consultor)
07. Microcopy comercial (3 linhas mono)
08. Accordions I–VI (mantém estrutura atual, ajustes de copy onde necessário)
─── full-width abaixo do hero ───
09. EM OBRA — grid 3×2 de imagens com hover overlay  [novo]
10. COMPARATIVO Western × Pedra Natural — tabela 3 colunas  [novo]
11. CROSS-SELL "Compõe bem com" — carrossel + Conjuntos prontos  [novo, usa coleção Shopify]
12. POR QUE WESTERN — faixa escura accent-dark, 4 cards  [novo]
13. PROVA SOCIAL — faixa contida com nomes  [novo]
14. NAVEGAÇÃO ANTERIOR/PRÓXIMA peça da mesma coleção  [novo]
15. Footer (existente)
```

---

## Mudanças por seção

### Seção 02 — Breadcrumb
- Substituir o atual `<Link>` único por trilha completa: `Catálogo › {Coleção} › {Produto}`.
- Mono 11px, uppercase, `--text-tertiary`, separador `ChevronRight` 10px. Atual em `--text-primary`.

### Seção 03 — Hero · bloco de dados duros
- Novo card branco (`bg-western-cream`/tertiary equivalente) com borda `--border` abaixo do SKU, antes do lead:
  - **Peso** (grande, serif H1 36px) + comparativo "Uma pedra natural com volume equivalente passaria de ~10× isso."
  - **Dimensões** "108 × 76 × 52 cm · Base plana · argamassa C3"
  - **"Variação artesanal de até ±3 cm"**
- Fonte: `extractDimensions(parsed.ficha)` (já existe) + parsing de `Peso líquido` em `fichaRows`. Quando ausente, esconder a linha (sem placeholders falsos).

### Seção 05 — Acabamento
- Adicionar bloco tracejado abaixo do FinishSelector:
  - "Não encontra a tonalidade ideal? Fazemos pintura personalizada sob demanda."
  - Link `→ Falar com consultor` (abre WhatsApp com mensagem pré-preenchida — mesma lógica já usada).

### Seção 06 — CTAs
- Manter stepper, "Adicionar ao pedido", "Falar com consultor" e "SketchUp" como hoje.
- Confirmar que **nenhum FAB verde** aparece na PDP (verificar `WhatsAppFAB` — esconder na rota `/produtos/*` se necessário).

### Seção 07 — Microcopy comercial
- Reformatar em 3 linhas exatas (já existem dados em `BUSINESS`):
  ```
  PRODUÇÃO SOB DEMANDA · 15 DIAS ÚTEIS APÓS PAGAMENTO
  PEDIDO MÍNIMO R$ 700 · PAGAMENTO ANTECIPADO (PIX, TED, BOLETO)
  RETIRADA GRATUITA EM CAJAMAR/SP · FRETE COTADO POR REGIÃO
  ```

### Seção 08 — Accordions
- Validar copy de **Garantia = 5 anos** (já está correto no fonte) e ajustar onde houver "1 ano".
- Manter I–VI; ajustar header da seção II conforme briefing (já alinhado).

### Seção 09 — Em obra  [novo componente `<ProductInProjects />`]
- Full-width, fundo `bg-western-cream` mais escuro (criar token `--bg-secondary` se preciso).
- Header centralizado (eyebrow + H2 + subtítulo italic).
- Grid 3×2 de imagens (4:3) com hover overlay gradiente + legenda.
- **Fonte de dados:** filtrar `src/data/projetos.ts` por tag/produto-handle; quando vazio, esconder a seção inteira (não mostrar com placeholders).
- Link inferior `→ Ver mais projetos com esta peça` → `/projetos?peca={handle}` (rota existe? se não, link para `/`).

### Seção 10 — Comparativo  [novo componente `<ProductComparison />`]
- Container 880px, layout 3 colunas (Western · LABEL · Pedra natural).
- Linhas estáticas conforme spec (peso/transporte/descarga/logística/tempo/base/previsibilidade/custo total). Coluna Western recebe valores "vivos" (peso e dimensões da peça atual) quando disponíveis.
- CTA outline "Solicitar comparativo orçamentário do meu projeto" → WhatsApp pré-preenchido.
- Em mobile vira lista vertical agrupada por linha.

### Seção 11 — Cross-sell  [novo componente `<RelatedProducts />`]
- Carrossel horizontal: usa `fetchCollection(collection.handle)` e remove o produto atual; pega 4 itens.
- Card: imagem 4:3 fundo creme, eyebrow, nome serif 18px, microcopy de dimensão.
- Bloco "Conjuntos prontos com esta peça": consulta `fetchCollection("conjuntos")` e filtra por `tags` que contenham o SKU/handle do produto. Se nada bater, esconder bloco.
- Microcopy `3% de desconto` (constante `BUSINESS.descontoConjuntosPercent`).

### Seção 12 — Por que Western  [novo componente `<WhyWesternStrip />`]
- Faixa full-width, fundo `western-green-deep`, texto creme.
- Grid 4 cards (10× / 6 fases / 3D / 33 anos) com links internos: `/por-que-western`, `/por-que-western#processo`, `BUSINESS.sketchupWarehouse`, `/sobre`.
- 100% estático (já temos as referências no codebase).

### Seção 13 — Prova social  [novo componente `<SocialProofBand />`]
- Faixa contida, sem fotos. Lista de profissionais (Eduardo Faisal · Fabiano Hayasaki · Ronaldo Luidi), institucional (Cristal Pool · Genesis · Biopet · Cobasi · Unique Garden), microcopy italic com celebridades.
- Reutilizar dados se já existirem em `MarcasInstitucionais` / `ArquitetosStrip`; senão estático.

### Seção 14 — Navegação anterior/próxima  [novo componente `<ProductPagination />`]
- Carrega lista da coleção atual (já temos `fetchCollection`); calcula índice do produto e monta cards Esquerda / Centro / Direita.
- Em mobile: 2 cartões empilhados (anterior + próxima), sem o "X de N".

---

## Sistema de design

- Adicionar/garantir tokens HSL em `src/index.css` correspondentes ao briefing (creme primário/secundário, terra `--accent-warm`, verde-musgo `--accent-dark` — provavelmente já mapeados como `western-cream`, `western-gold`, `western-green-deep`). Se algum estiver faltando, criar como token semântico, não cor inline.
- Tipografia: confirmar que `font-display` = Cormorant Garamond e `font-mono` = JetBrains Mono em `tailwind.config.ts`. Se não for o caso, ajustar `@import` no `index.css` e a config (a stack atual usa fontes próximas; ajustar somente se divergente). **Não trocar Inter** se já é o body.
- Animações via `framer-motion` já instalado: `whileInView` + `fade-in` + stagger 80ms para os blocos novos.

---

## Arquivos

**Novos**
- `src/components/product/HardFactsCard.tsx` — bloco de dados duros do hero
- `src/components/product/CustomPaintNote.tsx` — bloco tracejado de pintura personalizada
- `src/components/product/ProductInProjects.tsx` — seção 09
- `src/components/product/ProductComparison.tsx` — seção 10
- `src/components/product/RelatedProducts.tsx` — seção 11 (carrossel + conjuntos prontos)
- `src/components/product/WhyWesternStrip.tsx` — seção 12
- `src/components/product/SocialProofBand.tsx` — seção 13
- `src/components/product/ProductPagination.tsx` — seção 14

**Editados**
- `src/pages/ProductPage.tsx` — orquestra novas seções, refina breadcrumb, microcopy comercial, ajusta hero
- `src/components/layout/WhatsAppFAB.tsx` — esconder FAB em rotas `/produtos/*` (se aplicável)

**Sem alterações** em `cartStore`, `useAuth`, `PriceGate`, `FinishSelector`, queries Shopify (apenas reuso).

---

## Pontos a confirmar

1. **Dados de "Em obra"**: ok exibir só quando houver projeto vinculado (sem placeholder), correto?
2. **Conjuntos prontos**: posso usar `tags` Shopify para vincular conjuntos ↔ peça, ou a coleção `conjuntos` é genérica e devo apenas listar 2 conjuntos quaisquer?
3. **Comparativo**: confirmo o uso do peso real do produto na coluna Western quando disponível, e ocultar a linha quando não houver dado?

Se preferir, sigo com as suposições padrão (1 — sim; 2 — pegar 2 conjuntos da coleção `conjuntos` quando não houver vínculo; 3 — sim) ao implementar.