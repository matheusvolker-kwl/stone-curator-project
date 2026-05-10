# Testes E2E (Playwright)

Cobrem os fluxos críticos pós-bug do PDF e checkout:

| Spec | Cenário |
| --- | --- |
| `cart-pdf-guest.spec.ts` | Cliente não logado preenche lead no carrinho e baixa o PDF |
| `cart-pdf-logged.spec.ts` | Parceiro aprovado gera PDF, salva via edge function, e fallback se falhar |
| `cart-checkout.spec.ts` | Botão "Finalizar compra" abre checkout em nova aba (+ regra do mínimo) |

> O fluxo do **Guia de Composição** usa o mesmo `QuoteLeadModal` + `submitQuoteLead`, então
> a cobertura do carrinho valida a mesma engine de PDF/lead. Um spec dedicado ao guia exigiria
> mockar o catálogo Shopify inteiro do `useGuideProducts`; foi deixado como follow-up.

## Como rodar local

```bash
# 1. Instalar binários do Playwright (uma vez)
bunx playwright install --with-deps chromium

# 2. Rodar (sobe o vite dev server automaticamente)
npm run test:e2e

# UI interativa
npm run test:e2e:ui
```

## Estratégia

- **Sem rede real:** `mockBackend()` intercepta todas as chamadas para
  `*.supabase.co` (auth, REST, edge `save-quote-pdf`) e para a Storefront API
  do Shopify (`/api/2025-07/graphql.json`).
- **Sessão fake:** `seedAuthSession()` injeta o token `sb-*-auth-token`
  diretamente no `localStorage` antes da página carregar — não usa login real.
- **Carrinho fake:** `seedCart()` popula o store Zustand persistido
  (`shopify-cart`) com um item válido.

## CI

Workflow em `.github/workflows/e2e.yml` roda em cada push/PR.
