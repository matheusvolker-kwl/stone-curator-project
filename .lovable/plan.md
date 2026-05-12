## Reduzir o gap entre o hero da PDP e o bloco de abas

Hoje o espaço vertical entre o final do bloco de compra e o início das abas no desktop é de ~256px (py-20 do container + mt-24 + py-20 das tabs). Já existe uma `border-t` separando, então o vazio é exagerado.

### Mudanças

1. **`src/pages/ProductPage.tsx`** (linha 185)
   - `py-12 md:py-20` → `pt-12 md:pt-20 pb-8 md:pb-10`

2. **`src/components/product/ProductTabs.tsx`** (linha 55)
   - `mt-16 md:mt-24 py-14 md:py-20` → `py-12 md:py-16`

### Resultado
Gap cai de ~256px para ~104px no desktop. Separação clara mantida pela `border-t` + padding interno, sem buraco vazio.

### Fora de escopo
Espaçamentos das demais seções full-width (ProductInUse, Comparison, Related, WhyWestern, SocialProof, Pagination).