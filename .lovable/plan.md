## Problema

O `ProductCard` (usado na home, em `/linhas/[handle]`, `/produtos`, `/conjuntos`) tem a label **"Login para preço"** hardcoded no rodapé do card — ela aparece para todo mundo, inclusive parceiros aprovados que já estão logados. Por isso o preço nunca é revelado nos previews.

```tsx
// src/components/product/ProductCard.tsx (linha ~119)
<span className="font-mono text-[10px] ...">
  Login para preço
</span>
<span>Ver produto →</span>
```

Os dados de preço (`product.priceRange.minVariantPrice`) já chegam do Shopify — só não estão sendo usados.

## Correção

Substituir o texto fixo pelo componente `GatedPrice` (que já existe em `src/components/shared/GatedPrice.tsx` e já trata os 3 estados: visitante / pendente / aprovado, inclusive aplicando o desconto do tier do parceiro via `usePartnerPricing`).

Mudança única em **`src/components/product/ProductCard.tsx`**, no bloco do rodapé do card:

- Importar `GatedPrice`.
- Trocar o `<span>Login para preço</span>` por:
  ```tsx
  <GatedPrice
    amount={product.priceRange.minVariantPrice.amount}
    currency={product.priceRange.minVariantPrice.currencyCode}
    className="font-sans text-sm font-semibold text-western-green-deep"
  />
  ```
- Para parceiro aprovado: aparece o valor em R$ (com desconto do tier riscando o cheio, se houver).
- Para visitante/pendente: mantém o chip "Login para preço" / "Aguardando aprovação" com o mesmo visual atual (já é o fallback default do `GatedPrice`).

O `Ver produto →` à direita continua igual.

## Escopo

- 1 arquivo: `src/components/product/ProductCard.tsx`
- Sem mudanças em backend, queries ou outros componentes.
- StickyBuyBar e ProductPage já usam o gate corretamente — não mexer.

## Validação

- Logado como parceiro aprovado → cards na home, em `/linhas/pedras-pequenas`, `/produtos` e `/conjuntos` mostram o preço.
- Deslogado → continua mostrando "Login para preço".
- Logado pendente → mostra "Aguardando aprovação".
