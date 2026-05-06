## Mover "04 Acabamentos" para a PDP como seletor interativo

### 1. Remover da home

**`src/pages/Index.tsx`**
- Remover a seção `FAMÍLIAS DE ACABAMENTO` inteira (incluindo o array `FAMILIES` no topo do arquivo).
- O ritmo da home passa a ser: Hero → Linhas → Sobre → Projetos → Destaques → B2B.

### 2. Novo componente `FinishSelector` na PDP

**Novo arquivo `src/components/product/FinishSelector.tsx`**

Props:
```ts
{
  values: string[];                  // valores Shopify da option "Acabamento"
  selected: string | null;
  onSelect: (val: string) => void;
}
```

Mapa interno (constante no componente) que casa cada valor com `{ num, swatch, hint }`:

| Valor | num | swatch HSL | hint |
|---|---|---|---|
| Quartzo | 01 | `38 35% 86%` | Para composições que pedem luz e contraste com folhagem densa. |
| Arenito | 02 | `32 36% 65%` | Conversa com madeiras claras, palhas e paisagismo tropical. |
| Moledo | 03 | `20 30% 45%` | Acabamento rústico nobre — referência direta à pedra brasileira. |
| Granito | 04 | `140 8% 22%` | Profundidade e ancoragem para projetos contemporâneos e minerais. |

Match case-insensitive; se o valor não bater no mapa, gera fallback (num pelo índice, swatch neutro `var(--western-stone-warm)`, sem hint) — assim funciona mesmo se o Shopify tiver "Quartzo Polido" etc.

**Layout** (desktop): grid `md:grid-cols-4 gap-5`. Cada card é `<button>`:
- Fundo: cream sutil (`bg-western-cream/60` quando na PDP — superfície clara) com borda `border-western-stone-warm/20`
- Número `01-04` em mono, opacidade 50% por padrão → 100% no hover/selected
- Círculo de cor 40px (canto superior direito)
- Título serifado (nome do acabamento)
- Hint em texto pequeno
- Selecionado: borda `border-western-gold` + leve `bg-western-gold/5`

**Mobile**: `flex overflow-x-auto snap-x snap-mandatory` com `min-w-[78%]` por card; barra de progresso 01·02·03·04 acima (4 traços, o ativo em bege).

### 3. Animações (Tailwind keyframes em `tailwind.config.ts`)

Adicionar:
- `swatch-fill`: animação de preenchimento do círculo via `clip-path: circle(0% → 60%)` em 400ms ease-out — disparada por `IntersectionObserver` (toggle de classe).
- `swatch-breathe`: `scale(1) → scale(1.04) → scale(1)` em 2.5s, `infinite`, aplicada ao círculo no hover do card.
- `swatch-splash`: `scale(1) → 1.15 → 1` em 350ms `cubic-bezier(0.34,1.56,0.64,1)`, disparada via key change quando o valor selecionado muda.
- `gallery-crossfade`: opacidade 0 → 1 em 600ms — aplicada na imagem da galeria via `key={activeImage}` com classe de fade.

Stagger via `style={{ animationDelay: `${idx * 80}ms` }}` no swatch-fill.

Hook utilitário inline no `FinishSelector` com `useRef + useEffect` para `IntersectionObserver` (single-shot: adiciona classe `is-visible` quando entra; remove o observer).

### 4. Integração no `ProductPage.tsx`

- Detectar a opção `Acabamento` (case-insensitive) em `visibleOptions`.
- Renderizar `<FinishSelector />` para essa opção em vez dos chips. As demais opções (tamanho, etc.) continuam com os chips existentes.
- Posicionamento: a seção do FinishSelector entra em **bloco próprio** logo abaixo da grade galeria/ficha — fora da coluna de detalhes — full width do `container-western`, com header próprio:
  - Eyebrow `ACABAMENTO`
  - Filete dourado
  - Título serifado `Escolha o tom da peça.`
  - Linha mono `4 acabamentos · mesmo preço · sob encomenda`
- `onSelect` → `setActiveOptions(prev => ({ ...prev, [optionName]: val }))` (mesma assinatura do estado já existente). O resto do fluxo (imagem trocando via `useEffect` em `variant.image.url`, preço, botão CTA) continua funcionando intacto.
- Para o crossfade da galeria: adicionar `key={activeImage}` + classe `animate-fade-in` (já existe no projeto) na `<img>` ativa.

### 5. Estrutura final do JSX da PDP

```
<container>
  <breadcrumb />
  <grid 2-col>
    <gallery />
    <details (sem chips de acabamento, mantém demais opções, preço, CTA, accordions)>
  </grid>

  {hasAcabamento && (
    <section class="mt-20 md:mt-28 border-t border-western-stone-warm/20 pt-16">
      <header>ACABAMENTO / título / subtítulo</header>
      <FinishSelector ... />
    </section>
  )}
</container>
```

### 6. Detalhes técnicos resumidos

```text
src/pages/Index.tsx                       : remove seção FAMÍLIAS + array FAMILIES
src/components/product/FinishSelector.tsx : novo, recebe values + selected + onSelect
src/pages/ProductPage.tsx                 : extrai option Acabamento, renderiza FinishSelector full-width abaixo da grid
                                          : key={activeImage} + animate-fade-in na <img> da galeria
tailwind.config.ts                        : keyframes swatch-fill, swatch-breathe, swatch-splash
```

Sem novas dependências. Sem mudanças no Shopify ou no carrinho.
