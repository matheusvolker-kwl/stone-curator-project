# Integração Yampi — Frete + Checkout (Onda 4)

Implementação headless: Lovable consome Shopify (catálogo) + Yampi (cotação de frete via GoFretes app + Payment Link de checkout). Nenhuma chamada direta à GoFretes.

## 1. Variáveis / Secrets

Já configurados no backend: `YAMPI_ALIAS`, `YAMPI_USER_TOKEN`, `YAMPI_SECRET_KEY`, `WHATSAPP_FALLBACK_NUMBER`, `CEP_ORIGEM`. Falta adicionar:
- `YAMPI_API_BASE` = `https://api.dooki.com.br/v2`

(Token GoFretes vive dentro da Yampi — nada no Lovable.)

## 2. Edge Functions (Supabase)

Criar 3 funções em `supabase/functions/`:

### a) `yampi-sku-mapping/index.ts` (utilitária interna)
- GET `${BASE}/${ALIAS}/catalog/skus` paginado (limit=100)
- Cache em memória da function (TTL 6h) → `{ "WEST-CS-QUARTZO": 1234, ... }`
- Reutilizada pelas outras 2 functions (import direto, não HTTP)

### b) `yampi-calc-frete/index.ts`
- Input: `{ cep_destino, items: [{sku, quantidade}], total }`
- Validação: CEP 8 dígitos
- Resolve SKUs via mapping → ids Yampi
- POST `${BASE}/${ALIAS}/logistics/shipping-costs` com `{ order_id: 0, zipcode, total, origin: "cart_page", skus_ids, quantities }`
- Soma `DIAS_EXTRAS = 15` em cada prazo
- Output normalizado: `{ opcoes: [{id, transportadora, valor, prazo_min_dias, prazo_max_dias}], erro: null }`
- Erros: `sem_cobertura`, `api_indisponivel`, `cep_invalido`, `sku_nao_encontrado`

### c) `yampi-criar-checkout/index.ts`
- Input: `{ items, tracking? }`
- Valida pedido mínimo R$ 2.000 (busca preços via Shopify Storefront server-side para evitar adulteração de client)
- Resolve SKUs → ids Yampi
- POST `${BASE}/${ALIAS}/checkout/payment-link` com `{ name: "Pedido Lovable {ts}", active: true, skus: [{id, quantity}] }`
- Output: `{ checkout_url, payment_link_id }`
- Erros: `abaixo_minimo`, `sku_nao_encontrado`, `yampi_indisponivel`

CORS habilitado em todas, headers Yampi (`User-Token`, `User-Secret-Key`, `Content-Type`) montados server-side.

## 3. Frontend

### `src/components/cart/CalcFrete.tsx` (novo)
Renderizado dentro de `CartDrawer.tsx` (acima do CTA "Finalizar compra") e/ou em página de carrinho dedicada.

Estado: `cep`, `loading`, `opcoes`, `erro`, `temPesado` (memo: `items.some(i => i.peso_kg > 100)`).

Layout (3 blocos após cálculo):
- **Bloco A** (condicional `temPesado`): aviso peças >100kg + CTA WhatsApp pré-preenchido com SKUs e CEP
- **Bloco B**: opção "Retirada gratuita na fábrica" (sempre, primeira) — endereço/horário em `src/config/business.ts`
- **Bloco C**: loop de `opcoes` da Yampi
- Rodapé: "Valor estimado. Frete definitivo no checkout. Prazo já inclui 15 dias úteis de produção."

Estados: inicial / `COTANDO…` / `RECALCULAR`. Erros `sem_cobertura` e `api_indisponivel` escondem Bloco C, mantém A+B + WhatsApp.

Peso virá de Shopify metafield `custom.peso_kg` (assumindo existência — confirmar na Onda 5; placeholder com fallback 0 caso ausente).

### Botão "Finalizar compra" (CartDrawer)
Substituir o atual `handleCheckout` (que usa Storefront cart Shopify) por:
1. Validar subtotal ≥ R$ 2.000 (já existe `meetsMinimum`)
2. `supabase.functions.invoke("yampi-criar-checkout", { body: { items, tracking } })`
3. `window.location.href = checkout_url` (ou `window.open` em nova aba conforme padrão atual)
4. Tratamento de erros com toast + botão WhatsApp fallback

Manter `registerPedidoNovoLead` (já existe) antes do redirect.

### `src/lib/yampi/client.ts` (novo)
Helpers tipados que chamam as 3 edge functions via `supabase.functions.invoke`.

## 4. Identidade visual
Reutilizar tokens existentes (`western-green-deep`, `western-gold`, `western-cream`) — já alinhados ao spec. Nenhum token novo necessário.

## 5. Critérios de aceitação
Cobrir todos os 12 itens da seção 9 do spec via testes manuais + 2 specs Playwright em `tests/e2e/`:
- `cart-frete-leve.spec.ts` — carrinho R$ 2.500 SP, valida opções
- `cart-frete-pesado.spec.ts` — carrinho com item >100kg, valida CTA WhatsApp

## 6. Fora de escopo desta onda
- Sincronia de peso/dimensões nos SKUs Shopify (Onda 5)
- Configuração B2B no painel Yampi (paralela, manual)
- Persistência do mapping em tabela (Opção B do spec) — usar cache em memória

## Ordem de execução
1. Adicionar secret `YAMPI_API_BASE`
2. Edge function `yampi-sku-mapping` + teste curl
3. Edge function `yampi-calc-frete` + teste curl (CEP SP real)
4. Edge function `yampi-criar-checkout` + teste curl (gerar URL clicável)
5. `CalcFrete.tsx` + integração no `CartDrawer`
6. Trocar fluxo de checkout para Yampi
7. Specs Playwright
8. QA end-to-end com pedido teste PIX

## Pergunta antes de implementar
- O `peso_kg` por variante já existe em metafield Shopify? Se não, definir nome do metafield ou usar tabela auxiliar no Supabase para o threshold de 100kg.
- Endereço/horário exato da retirada na fábrica para o Bloco B (Cajamar/SP — confirmar)?
- O fluxo atual usa cart Shopify nativo (`getCheckoutUrl`); ao migrar para Yampi, mantemos o cart Shopify só como estado local ou removemos as mutations `cartCreate`/`cartLinesAdd`?
