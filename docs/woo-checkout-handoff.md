# Checkout Hand-off PJ — Contrato para o mu-plugin Woo

Fluxo de "guest checkout PJ pré-preenchido" usando **ticket opaco de uso único**.
O parceiro aprovado clica em "Finalizar compra" no app; o app pede um ticket ao
backend; o form POST top-level para o Woo leva apenas o carrinho **+ o ticket**;
o mu-plugin troca o ticket pelo payload de billing via chamada server-to-server.

Nenhum dado sensível trafega pelo navegador. Nenhum segredo compartilhado do
lado cliente. Sem HMAC no PHP — o mu-plugin só faz uma requisição HTTPS
autenticada por Bearer.

---

## 1. O que chega no endpoint de hand-off (POST no Woo)

Endpoint (já existe): `POST https://checkout.westernstore.com.br/?western-checkout-handoff=1`

Campos (form-urlencoded / multipart):

| Campo             | Sempre presente | Descrição                                                        |
| ----------------- | --------------- | ---------------------------------------------------------------- |
| `lines`           | Sim             | JSON string com as linhas do carrinho (contrato atual, inalterado). |
| `token`           | Opcional        | Segredo compartilhado do hand-off (contrato atual, inalterado).  |
| `identity_ticket` | **Apenas** parceiro logado + aprovado | String opaca base64url, 32 bytes de entropia (~43 chars). |

Se `identity_ticket` estiver **ausente** → fluxo de visitante atual, sem
mudanças. Se estiver **presente** → trocar por payload de billing antes de
iniciar a sessão do WooCommerce.

---

## 2. Trocando o ticket pelo payload (server-to-server)

**URL:**
`POST https://zibtysewpbeycngtbjjk.supabase.co/functions/v1/checkout-ticket-redeem`

**Headers:**
```
Authorization: Bearer <WESTERN_CHECKOUT_EXCHANGE_KEY>
Content-Type: application/json
```

O `WESTERN_CHECKOUT_EXCHANGE_KEY` é um segredo compartilhado. Ele NUNCA
aparece no frontend nem no HTML — só está nos secrets do Supabase e deve ser
adicionado como constante PHP no mu-plugin (`define('WESTERN_CHECKOUT_EXCHANGE_KEY', '...')`
em `wp-config.php` ou variável de ambiente do servidor Woo). Peça o valor ao
mantenedor do projeto Lovable; não o commite em repositório.

**Body:**
```json
{ "ticket": "<valor exato de identity_ticket>" }
```

**Timeout sugerido:** 5 segundos. Se falhar, tratar como guest checkout normal
(não bloquear a compra — só deixar de pré-preencher).

---

## 3. Respostas

### 3.1 Sucesso — HTTP 200

```json
{
  "ok": true,
  "payload": {
    "v": 1,
    "user_id": "uuid-do-usuário",
    "email": "cliente@empresa.com.br",
    "billing": {
      "first_name": "Fulano",
      "last_name": "de Tal",
      "company": "Empresa LTDA",
      "cnpj": "12345678000199",
      "phone": "11999999999",
      "email": "cliente@empresa.com.br",
      "address_1": "Rua das Flores, 123",
      "address_2": "Sala 4",
      "neighborhood": "Centro",
      "city": "São Paulo",
      "state": "SP",
      "postcode": "01001000",
      "country": "BR",
      "persontype": 2
    }
  }
}
```

Observações sobre os campos de `billing` (todos strings, exceto `persontype`):

- `cnpj`, `phone`, `postcode` — **apenas dígitos**, sem máscara (Brazilian Market
  on WooCommerce espera assim).
- `state` — sigla UF em maiúsculo (2 chars).
- `country` — sempre `"BR"`.
- `persontype` — inteiro `2` (Pessoa Jurídica). Se um dia emitirmos ticket para
  PF, virá `1`; hoje só emitimos para PJ aprovado.
- `neighborhood` — bairro (o Brazilian Market grava em `_billing_neighborhood`).
- `first_name` / `last_name` — o nome do responsável foi partido no primeiro
  espaço; se não houver nome, `first_name` vem com o nome da empresa e
  `last_name` vazio (edge case). O plugin pode preferir usar `company` como
  identificador visual.
- `v` — versão do schema do payload. Rejeitar valores desconhecidos (hoje: `1`).

Mapeamento sugerido para `WC()->customer` / `WC()->session`:

```php
$b = $body['payload']['billing'];
WC()->customer->set_billing_first_name($b['first_name']);
WC()->customer->set_billing_last_name($b['last_name']);
WC()->customer->set_billing_company($b['company']);
WC()->customer->set_billing_email($b['email']);
WC()->customer->set_billing_phone($b['phone']);
WC()->customer->set_billing_address_1($b['address_1']);
WC()->customer->set_billing_address_2($b['address_2']);
WC()->customer->set_billing_city($b['city']);
WC()->customer->set_billing_state($b['state']);
WC()->customer->set_billing_postcode($b['postcode']);
WC()->customer->set_billing_country($b['country']);
// Brazilian Market on WooCommerce (meta):
WC()->session->set('billing_cnpj', $b['cnpj']);
WC()->session->set('billing_neighborhood', $b['neighborhood']);
WC()->session->set('billing_persontype', (string) $b['persontype']);
```

### 3.2 Erros — payloads e status

Todos retornam JSON `{ "error": "<code>" }`.

| Status | code                          | Significado / ação recomendada                                                        |
| ------ | ----------------------------- | ------------------------------------------------------------------------------------- |
| 400    | `invalid_body`                | JSON do body malformado. Bug no mu-plugin.                                            |
| 400    | `invalid_ticket`              | `ticket` ausente ou fora de 16..128 chars. Bug no mu-plugin.                          |
| 401    | `unauthorized`                | Bearer ausente ou incorreto. Verificar `WESTERN_CHECKOUT_EXCHANGE_KEY`.               |
| 404    | `ticket_invalid_or_expired`   | Ticket desconhecido, já consumido, ou expirou (>90s). **Cair pro fluxo guest normal.** |
| 405    | `method_not_allowed`          | Precisa ser POST.                                                                      |
| 429    | `rate_limited`                | >60 requisições / IP / minuto. Backoff e tentar novamente; se persistir, guest.       |
| 500    | `server_misconfigured`        | `WESTERN_CHECKOUT_EXCHANGE_KEY` não está setado no backend Lovable. Contatar suporte. |
| 500    | `redeem_failed` / `internal_error` | Falha interna. Cair pro guest checkout. Logar para investigação.                 |

**Regra de ouro:** qualquer erro na troca deve degradar graciosamente para o
checkout de visitante — nunca bloquear a compra por causa do ticket.

---

## 4. Garantias / propriedades de segurança

1. **Uso único** — o consumo é atômico (`UPDATE ... WHERE consumed_at IS NULL`),
   então duas requisições com o mesmo ticket: a primeira ganha o payload, a
   segunda recebe `ticket_invalid_or_expired`.
2. **TTL de 90 segundos** — tickets criados há mais de 90s são rejeitados na
   leitura. Limpeza periódica remove registros >5min.
3. **Payload nunca no cliente** — o browser só vê o ticket opaco.
4. **Sem crypto no PHP** — a validação é uma comparação de Bearer + 1 request.
5. **Zero confiança no cliente** — o payload é montado a partir do banco
   (`partner_profiles`) usando o JWT do usuário; o front não pode injetar CNPJ
   nem endereço.

---

## 5. Recursos do lado Lovable

- Tabela: `public.checkout_tickets`
- Função RPC atômica: `public.consume_checkout_ticket(_ticket text, _ip text)`
- Edge function (emissão, JWT obrigatório): `checkout-ticket-create`
- Edge function (troca, Bearer obrigatório): `checkout-ticket-redeem`
- Secret: `WESTERN_CHECKOUT_EXCHANGE_KEY`
