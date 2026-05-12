# Filtros inteligentes + página "Todos os produtos"

## Por que mudar

O filtro de acabamento na página de linha tem pouco valor prático: todas as peças são oferecidas nos 4 acabamentos (Quartzo, Arenito, Moledo, Granito), então marcar "Moledo" não filtra quase nada. O cliente decidindo entre peças de uma linha precisa, na verdade, escolher por **escala** (cabe no projeto?) e **logística** (consigo movimentar / preciso de equipamento?). Tamanho e peso resolvem isso.

## O que muda

### 1. Filtro de Tamanho e Peso (substitui Acabamento)

**Fonte dos dados:** já existe `parseProductDescription` + `extractDimensions` em `src/lib/shopify/parseDescription.ts` lendo a "Ficha técnica" do Shopify (Comprimento, Largura, Altura, Peso). Vamos criar `extractSizeWeight(product)` em um novo `src/lib/shopify/sizeWeight.ts` que devolve:
- `maiorDimensaoCm` (max entre C/L/A)
- `pesoKg` (parse do campo "Peso")
- `tamanhoBucket`: `pequeno` (≤30 cm), `medio` (31–60), `grande` (61–100), `enorme` (>100)
- `pesoBucket`: `leve` (≤10 kg), `medio` (11–40), `pesado` (41–100), `muitoPesado` (>100)

Os limites são uma primeira proposta — fáceis de calibrar depois quando vermos a distribuição real do catálogo.

**UI dos filtros (chips, não checkbox):**

```text
TAMANHO (maior dimensão)
[ Pequeno ]  [ Médio ]  [ Grande ]  [ Enorme ]
  até 30      31–60      61–100      100+ cm

PESO
[ Leve ]  [ Médio ]  [ Pesado ]  [ Muito pesado ]
 até 10    11–40      41–100      100+ kg
```

Cada chip é toggle (multi-select dentro da mesma categoria = OR; entre categorias = AND). Mantém o estado na URL (`tamanho=pequeno,medio&peso=leve`). Mantém o campo de busca por nome/SKU. Remove a seção "Acabamento". Mantém o rodapé "Pedido mínimo R$ 700 · produção 15 dias úteis".

Por que chips e não slider duplo:
- Decisão é categórica ("preciso de algo manuseável") — não milimétrica
- Funciona bem em mobile sem `<input type=range>` complicado
- Linguagem natural ("pequeno", "leve") em vez de números abstratos
- Compatível com o resto do design system (chips já existem em `ContextoChips`)

Quando uma peça não tem peso/dimensão na ficha, ela é incluída em qualquer filtro (não escondemos por dado faltante) mas marcamos com um aviso discreto no card opcionalmente — fora do escopo desta tarefa.

### 2. Nova página `/produtos` — "Todos os produtos"

Rota nova. Reaproveita 100% do componente de lista/filtros da `LinhaPage` extraindo um componente `ProductGrid` em `src/components/product/ProductGrid.tsx` que recebe `products[]` + props de filtro. A diferença é só a fonte dos dados:
- `LinhaPage`: `fetchCollection(handle)`
- `Todos`: `fetchProducts(250)` (sem query)

Header da página usa o mesmo padrão visual de `Linhas.tsx` (eyebrow + filete dourado + h1).

### 3. Acesso à nova página

Na página `/linhas` (`src/pages/Linhas.tsx`), adicionar um card destacado no topo da grade (antes das linhas) ou um link inline abaixo do parágrafo de intro:

> "Procurando algo específico? **Ver todos os produtos** → ordenar por preço, tamanho e peso."

Card é mais visível; vou implementar como card primeiro item da grade com tratamento visual diferente (sem imagem, fundo `western-green-deep`, texto cream) — fácil de reverter para link se preferir.

### 4. Renomear ordenação

No `<SelectTrigger>` da `LinhaPage` (e na nova página), o placeholder/label visual passa a ser **"ORDENE"** em vez de "Mais…". A primeira opção (`featured`) continua sendo "Mais especificados" no menu aberto, mas o trigger fechado mostra "ORDENE" quando nenhuma ordenação foi escolhida explicitamente.

Implementação: `SelectValue placeholder="Ordene"` e setar valor inicial como `undefined` em vez de `"featured"` — quando não há sort, usa ordem natural do Shopify e mostra placeholder.

## Arquivos afetados

**Novos:**
- `src/lib/shopify/sizeWeight.ts` — parser + buckets
- `src/components/product/ProductGrid.tsx` — grid + sidebar de filtros (extraído de LinhaPage)
- `src/pages/Produtos.tsx` — página "todos os produtos"

**Editados:**
- `src/pages/LinhaPage.tsx` — usa `ProductGrid`, remove FINISHES local
- `src/pages/Linhas.tsx` — adiciona card/link "Ver todos"
- `src/App.tsx` — registra rota `/produtos`

**Não muda:** Shopify schema, types, queries (toda info já vem em `descriptionHtml`), nem lógica de busca/ordenação atual.

## Fora de escopo

- Calibrar os limites dos buckets com dados reais (deixo TODO no código)
- Filtros adicionais (linha, aplicação) na página /produtos — pode vir num segundo passo
- Indicador visual de "sem ficha técnica" no card
