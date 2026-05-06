## O que vamos ajustar

### 1. Header — logo maior + item "Início"
**`src/components/layout/Header.tsx`**
- Adicionar `{ to: "/", label: "Início" }` como primeiro item do array `nav` (com `end` no NavLink para não ficar sempre ativo).
- Aumentar o logo de `h-12 lg:h-14` para **`h-16 lg:h-20`** (≈64px / 80px) — visivelmente dominante.
- Reduzir `py` para `py-2 lg:py-3` para compensar a altura.
- Mobile drawer: logo de `h-10` → `h-14`.
- Manter `whitespace-nowrap` e `gap-7 xl:gap-9` para caber Início + Linhas + Conjuntos + Guia de Compra + Sobre + B2B sem quebrar a 1024px+.
- Validar visualmente nos breakpoints 1280, 1024, 768, 390 com o navegador.

### 2. Hero da home — mais "ASMR" / textura
**`src/pages/Index.tsx`** (seção hero)
- Adicionar camadas sobrepostas ao fundo verde:
  - Grão sutil (SVG noise inline, opacidade ~6%).
  - Vinheta radial suave nos cantos (`bg-[radial-gradient(...)]`) para profundidade.
  - Linha fina dourada animada (shimmer lento ~8s) acima do título — referência editorial.
  - Cristal/wireframe da direita: leve pulse de opacidade (3–5%) + drift vertical lento (12s ease-in-out infinite).
- Adicionar textura de "papel mineral" muito sutil (overlay PNG já existente em `/assets` ou gerada via SVG turbulence) com `mix-blend-overlay` em ~8%.
- Tudo CSS/SVG — sem imagens novas, sem custo de assets.

### 3. Galeria do produto — sem limite artificial
**`src/lib/shopify/queries.ts`**
- Trocar `images(first: 8)` por **`images(first: 50)`** dentro de `PRODUCT_FIELDS` (Shopify aceita até 250; 50 cobre qualquer cenário real).

### 4. Imagem da galeria seguir a variante selecionada
**`src/lib/shopify/queries.ts`**
- Já buscamos `variant.image { url altText }` — só falta usar.

**`src/pages/ProductPage.tsx`**
- Quando o usuário seleciona uma opção (acabamento, tamanho), procurar `variant.image.url` e:
  - encontrar o índice correspondente em `images` (match por `url`);
  - se existir, fazer `setActiveImage(idx)` automaticamente via `useEffect([variant?.image?.url])`.
- Isso respeita a vinculação feita no Shopify (cada variante → sua foto).

### 5. Variante padrão NÃO pré-selecionada + lembrete de acabamento
**`src/pages/ProductPage.tsx`**
- Mudar `variant` para retornar `null` enquanto **todas** as opções visíveis não estiverem escolhidas (em vez de cair no `variants[0]`).
- Preço: mostrar o range (`priceRange.minVariantPrice` formatado com prefixo "a partir de") até o cliente selecionar.
- Botão "Adicionar ao pedido": ficar desabilitado com texto **"Selecione o acabamento"** (ou o nome da primeira opção pendente) até todas as opções estarem definidas.
- Acima do botão, quando faltar seleção, mostrar um aviso discreto:
  > `· Escolha o acabamento para ver o preço final e adicionar ao pedido`
  com cor `text-western-gold` e ícone pequeno.
- Os chips de opção começam todos sem `selected` (já é o caso quando `activeOptions` está vazio — mas hoje o fallback marca o primeiro; remover esse fallback).
- Toast existente de "adicionado" se mantém.

### Detalhes técnicos resumidos

```text
Header.nav  = [Início, Linhas, Conjuntos, Guia de Compra, Sobre, B2B]
Logo height = h-16 lg:h-20  (mobile drawer h-14)
Header py   = py-2 lg:py-3

queries.ts  : images(first: 50)
ProductPage : variant = null até todas opções escolhidas
            : useEffect troca activeImage quando variant.image muda
            : CTA dinâmico "Selecione {opção pendente}"
Hero        : noise SVG + vinheta radial + shimmer dourado + drift do cristal
```

Nada altera schema do Shopify nem stores; é tudo frontend.