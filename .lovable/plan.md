# Otimização de Imagens — Western

## Diagnóstico

Hoje os assets locais somam ~4.5MB. Os vilões do carregamento:

| Arquivo | Tamanho atual | Uso |
|---|---|---|
| `ricardo-botelho.png` | **2.4 MB** | seção Artista |
| `respiro-pedra.jpg` | **997 KB** | seção Respiro full-bleed |
| `hero-cascata.jpg` | **890 KB** | Hero LCP |
| `logo-vertical-verde.png` | 113 KB | logo |
| `cover-lago.jpg` | 160 KB | projeto |

Imagens das **linhas, produtos e coleções vêm do Shopify CDN** (`cdn.shopify.com`) — ali a otimização é diferente (parâmetros de URL).

## O que fazer onde

**Aqui no projeto (Lovable):** otimizar os assets em `src/assets/` (hero, respiro, retrato, logos, capas de projeto). Esses são os mais pesados e não passam por Shopify.

**No Shopify:** as imagens já são servidas otimizadas pelo CDN, mas podemos pedir tamanhos menores via parâmetros (`?width=800&format=webp`) na hora de montar o `<img>`.

## Plano de execução

### 1. Converter assets locais para WebP otimizado

Rodar um script (sharp via npx) que:
- Converte PNG/JPG → WebP com qualidade 78–82
- Gera 2 tamanhos para os heros: `1600w` (desktop) e `900w` (mobile)
- Mantém PNG só para logos com transparência (mas re-otimizados via `pngquant`)

Resultado esperado:
- `ricardo-botelho.png` 2.4MB → `ricardo-botelho.webp` ~120KB
- `respiro-pedra.jpg` 997KB → `respiro-pedra.webp` ~140KB + versão `-sm.webp` ~60KB
- `hero-cascata.jpg` 890KB → `hero-cascata.webp` ~150KB + `-sm.webp` ~70KB
- Logos PNG: -60% em média

**Total esperado: ~4.5MB → ~600KB** (≈87% de redução).

### 2. Servir imagens responsivas

Trocar `<img src=...>` por `<img>` com `srcset` + `sizes` nos heros:

```tsx
<img
  src={heroCascataLg}
  srcSet={`${heroCascataSm} 900w, ${heroCascataLg} 1600w`}
  sizes="100vw"
  ...
/>
```

Faz com que mobile baixe a versão pequena (~70KB) e desktop a grande.

### 3. Otimizar imagens vindas do Shopify

No `ProductCard`, `Linhas`, `LinhaPage` e nas collections da Home, anexar parâmetros à URL do CDN:

```ts
const cdn = (url: string, w = 800) =>
  `${url}${url.includes("?") ? "&" : "?"}width=${w}&format=webp`;
```

E aplicar em `<img src={cdn(c.image.url, 600)} />` conforme o tamanho real do card. Isso evita baixar a imagem original (geralmente 2000–3000px de largura) para um card de 400px.

### 4. Atributos de carregamento

- Hero e respiro: `loading="eager"` + `fetchPriority="high"` no LCP, `low` nos demais.
- Demais imagens: `loading="lazy"` + `decoding="async"` (já está em parte do código, padronizar).
- Adicionar `width` e `height` em todas para evitar CLS.

### 5. Resposta à pergunta direta

> "fazemos isso por aqui ou no shopify?"

**Os dois lados, mas o ganho maior é aqui.** As imagens estáticas (hero, retrato do Ricardo, respiro, logos, capas de projeto) só dá pra otimizar neste repositório — é onde está o peso real hoje. As imagens de produto/coleção do Shopify já vêm de um CDN, então basta pedir o tamanho certo via URL no front — não precisa reupload.

## Detalhes técnicos

- Ferramenta: `sharp` rodado em script Node único em `/tmp` (não fica no repo).
- Logos PNG mantém PNG (transparência), mas re-comprimidos.
- Os imports atuais (`import heroCascata from "@/assets/hero-cascata.jpg"`) viram `.webp` — Vite resolve normalmente.
- Helper `cdn()` fica em `src/lib/shopify/client.ts` para reuso.
- Sem mudança de layout visual; apenas peso e tempo de carregamento.

## Arquivos a editar

- `src/assets/*` — substituir originais pelas versões `.webp` (e remover os `.jpg`/`.png` pesados)
- `src/pages/Index.tsx` — srcset no hero, imports atualizados
- `src/components/home/RespiroSection.tsx` — srcset
- `src/components/home/ArtistaSection.tsx` — novo `.webp`
- `src/components/product/ProductCard.tsx` — usar `cdn()`
- `src/pages/Linhas.tsx`, `LinhaPage.tsx`, `ProductPage.tsx` — usar `cdn()`
- `src/lib/shopify/client.ts` — adicionar helper `cdn()`
