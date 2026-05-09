## Status do Guia

A jornada de 9 etapas está **funcionalmente completa** no frontend (Ondas A + B + C entregues). O que falta para sair do "demo encantador" e virar **produção** mora **fora do código**: catálogo Shopify alinhado e migração de conteúdo editorial para metafields.

---

## 1. O que ainda falta no código (pequenos polimentos opcionais)

Não é bloqueador, mas vale entrar numa próxima onda:

- **Captura de nome no SketchLeadModal** e reuso no Headline da Etapa 09 (*"Pronto, [Nome]"*) — hoje o nome ainda não é puxado.
- **Animação fly-to-cart com `layoutId`** — implementamos pulse + slide-in, mas o arco da miniatura voando para o painel ainda não.
- **`react-countup`** no total do painel lateral (hoje muda direto, sem contagem animada).
- **Cálculo real de economia vs. pedra natural** na Etapa 09 — hoje usa multiplicador fixo (~1.7x). Idealmente vira metafield por conjunto.
- **Testes E2E** do fluxo completo (Playwright) — útil antes de divulgar para a rede de arquitetos.

---

## 2. O que fazer DENTRO do Shopify (catálogo)

Esta é a parte crítica. O `guideMap.ts` referencia **45 handles de conjunto** + complementos + itens autorais. Cada um precisa existir como produto real.

### 2.1. Conjuntos (45 produtos)

Para cada combinação Tipo × Tamanho × Composição × Nível, criar um produto:

```
Lago: 3 tamanhos × 2 composições × 3 níveis = 18 conjuntos
Piscina: 3 tamanhos × 3 níveis = 9 conjuntos
Jardim: 3 tamanhos × 2 jardins × 3 níveis = 18 conjuntos
```

**Handle obrigatório:** exatamente como em `guideMap.ts` (ex.: `conjunto-lago-itacare-equilibrado`). Se um handle não bater, o Step 05 quebra.

**Campos por produto:**
- Title, Description (HTML editorial)
- Pelo menos 4 imagens (1 hero 21:9 + 3 ambientações para o carrossel)
- Variantes por **acabamento** (Quartzo, Arenito, Calcário, Basalto) — opção `Acabamento`
- Preço base (= valor em `guideMap.preco`)
- Tags: `conjunto`, `tipo:lago|piscina|jardim`, `nivel:essencial|equilibrada|completa`

### 2.2. Complementos e itens autorais

Já referenciados por handle:
- `pedra-led`, `pedra-sonora`, `pisada`, `cascata-pequena`
- `pedra-champanheira`, `pedra-torneira`, `pedra-sonora`

Garantir que existem com imagens, preço, descrição e estoque.

### 2.3. Coleções para o Upsell (Step Complementos)

O `upsellMap` aponta para handles de coleção:
`pedras-pequenas`, `pedras-medias`, `cascatas`, `pedra-led`, `acessorios`, `fontes-para-jardim`, `pedras-de-borda`, `pisadas`.

Criar/conferir cada coleção com produtos atribuídos.

---

## 3. Migração para Metafields (a parte estratégica)

Hoje muito conteúdo editorial vive **hardcoded** em `guideMap.ts` e nos componentes. Para a Western editar sem mexer em código, migrar para metafields Shopify.

### 3.1. Metafields por **produto-conjunto**

Criar definições no Shopify Admin (Settings → Custom data → Products):

| Namespace.key | Tipo | Uso na UI |
|---|---|---|
| `guide.subtitulo` | single_line | Subtítulo do conjunto (Step 05) |
| `guide.pecas_incluidas` | json (lista de `{nome, qtd, dimensao}`) | Lista numerada com tooltip |
| `guide.indicado_para` | json (lista de strings) | Chip-strip "Lago · 8m² · Marcante" |
| `guide.assinatura_faisal` | multi_line | Linha em itálico "Faisal recomenda..." |
| `guide.hero_image` | file_reference | Imagem hero 21:9 do Step 05 |
| `guide.economia_pedra_natural` | money | Valor real de economia (substitui multiplicador 1.7x) |
| `guide.prazo_dias` | number_integer | Prazo de produção exibido no fechamento |
| `guide.sketch_pdf` | file_reference | PDF do sketch (lead magnet) |
| `guide.sketch_skp` | file_reference | Arquivo SketchUp |

### 3.2. Metafields por **variante** (acabamento)

| Namespace.key | Tipo | Uso |
|---|---|---|
| `acabamento.cor_hsl` | single_line (`"34 28% 62%"`) | Tinta no hero do Step 05 (substitui `tintFor()` hardcoded) |
| `acabamento.descricao_curta` | single_line | "textura suave, tom areia" |
| `acabamento.imagem_swatch` | file_reference | Swatch 96×96 |

### 3.3. Metafields por **coleção** (Upsell)

| Namespace.key | Tipo | Uso |
|---|---|---|
| `upsell.eyebrow` | single_line | Texto curto acima do título |
| `upsell.imagem_capa` | file_reference | Hero da seção no Step 06 |

### 3.4. Refactor no código (depois que os metafields estiverem populados)

- Atualizar `PRODUCT_FIELDS` em `src/lib/shopify/queries.ts` para puxar os novos metafields.
- Migrar `tintFor()` (hoje em `StepBase.tsx`) para ler de `variant.acabamento.cor_hsl`.
- Migrar `sketchAssetsFor()` em `guideMap.ts` para ler `guide.sketch_pdf/skp` do produto.
- Migrar economia da Etapa 09 para ler `guide.economia_pedra_natural` por conjunto.
- Migrar `nivelMeta` (descrições, faixa de preço, peças) — opcional, pode ficar no código já que é padrão por nível.

---

## 4. Ordem recomendada de execução

1. **Você (Western no Shopify):** criar os 45 produtos-conjunto com handles exatos + imagens + variantes de acabamento.
2. **Você:** criar/revisar coleções do upsell e produtos de complemento.
3. **Você:** definir os metafields no Shopify Admin (sem precisar populá-los todos de imediato).
4. **Eu (Lovable):** atualizar a query GraphQL para incluir os metafields novos.
5. **Eu:** refatorar componentes (`StepBase`, `StepFechamento`, `sketchAssetsFor`) para consumir metafields com fallback nos valores atuais — assim nada quebra durante a migração gradual.
6. **Você:** popular metafields produto a produto, no seu ritmo. A UI vai trocando automaticamente conforme cada produto recebe seus dados.

---

## 5. Resposta direta às suas perguntas

- **Finalizamos 100% do guia?** O **frontend** sim, no nível de UX. Falta o **catálogo real** e a **camada de conteúdo editável** (metafields) para virar produção.
- **O que fazer no Shopify?** Criar os 45 conjuntos com os handles do `guideMap.ts`, complementos, coleções de upsell e definir os metafields da seção 3.
- **Migração para metafields?** Faço em duas etapas: primeiro atualizo a query e os componentes para *ler* metafields com fallback (não quebra nada), depois vocês populam no Shopify no ritmo de vocês.

Posso já preparar a **lista CSV dos 45 handles + nomes + preços** para vocês importarem no Shopify de uma vez, e na sequência fazer o refactor da query para metafields. Quer que eu siga por aí?