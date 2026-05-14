## Diagnóstico

Os logs da edge function mostram a causa raiz real (não é "api_indisponivel" genérico — é o nosso código retornando isso por cima do erro verdadeiro):

```
yampi shipping-costs error 422 {
  "message":"422 Unprocessable Entity",
  "errors":{"order_id":["Esse order id não está cadastrado.",
                        "Pedido inválido para realizar nova cotação de frete"]},
  "status_code":422
}
```

O endpoint `POST /v2/western3/logistics/shipping-costs` da Yampi **não aceita `order_id: 0`** — ele exige um pedido já criado (fluxo de re-cotação) ou que o campo seja omitido para cotação de carrinho. Hoje `supabase/functions/yampi-calc-frete/index.ts` envia `order_id: 0` fixo, e por isso 100% das cotações falham com 422 → o catch devolve `{opcoes:[], erro:"api_indisponivel"}` e o carrinho cai no fallback.

Secrets já estão todas configuradas (`YAMPI_ALIAS`, `YAMPI_USER_TOKEN`, `YAMPI_SECRET_KEY`, `CEP_ORIGEM`), então não é problema de env.

## O que vou alterar

**Arquivo único:** `supabase/functions/yampi-calc-frete/index.ts`

### 1. Corrigir o payload enviado à Yampi
- Remover `order_id: 0` do payload (e tentar primeiro sem o campo).
- Se a Yampi continuar exigindo, fazer fallback usando o endpoint de cotação de carrinho (`/v2/{alias}/carts/shipping-quotation` ou equivalente documentado) — descoberto na hora a partir do erro real.
- Manter `zipcode`, `total`, `skus_ids`, `quantities`, e usar `origin` corretamente. Hoje `origin: "cart_page"` é uma string descritiva, mas a doc Yampi/GoFretes espera o **CEP da fábrica** nesse campo. Vou passar `Deno.env.get("CEP_ORIGEM")` (já existe nos secrets) como `origin` (8 dígitos, sem hífen). Se a API quiser outro nome (`zipcode_origin`), ajusto após ver o retorno.
- `total`: a doc Yampi aceita BRL como número decimal (não centavos). Manter como está hoje (`Number(body.total)`), mas logar o valor bruto pra confirmar.

### 2. Adicionar logs detalhados (sem expor valores de secrets)
```
console.log("calc-frete payload in", { cep, total, items: body.items.length });
console.log("env check", {
  alias: !!Deno.env.get("YAMPI_ALIAS"),
  userToken: !!Deno.env.get("YAMPI_USER_TOKEN"),
  secretKey: !!Deno.env.get("YAMPI_SECRET_KEY"),
  cepOrigem: !!Deno.env.get("CEP_ORIGEM"),
});
console.log("yampi url", url);
console.log("yampi payload", JSON.stringify(payload));
console.log("yampi response", res.status, bodyText.slice(0, 2000));
```

### 3. Propagar erro real ao front
Em vez de sempre devolver `{erro:"api_indisponivel"}`, retornar:
```json
{ "opcoes": [], "erro": "api_indisponivel",
  "debug": { "yampi_status": 422, "yampi_body": {...} } }
```
O campo `debug` é opcional e só preenchido quando a Yampi falhar. O front (CalcFrete.tsx) **não muda** — continua tratando `erro` igual hoje. Assim você vê via DevTools/Network o motivo real sem mexer em UX.

### 4. Mapeamento de SKU → ID Yampi
Já está correto via `getSkuMapping()` no `_shared/yampi.ts` (cache 6h, paginado). Vou só logar `ids` resolvidos pra confirmar que estão chegando como números.

## O que NÃO vou mexer

- `CalcFrete.tsx`, layout, UX, outros componentes.
- `yampi-criar-checkout` (checkout segue funcionando).
- `_shared/yampi.ts` (a menos que precise expor `CEP_ORIGEM` via helper — provavelmente não).

## Validação

1. Deploy da function.
2. `curl_edge_functions` com payload real (CEP 01310100, 1 item conhecido) e leitura dos logs novos.
3. Confirmar status 200 com `opcoes` populadas. Se vier 422 de novo, o log da resposta Yampi vai dizer exatamente qual campo falta — ajusto e redeploy.
