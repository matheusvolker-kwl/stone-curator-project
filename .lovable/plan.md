
# Credenciamento automático de parceiros por CNPJ/CNAE

Sistema que, a partir do CNPJ informado no cadastro, consulta uma cascata de fontes oficiais, classifica os CNAEs contra uma whitelist e decide automaticamente entre **aprovado**, **análise manual** ou **reprovado** — com fallback de upload do Cartão CNPJ quando todas as fontes públicas falham.

---

## 1) Migrações (schema + RLS + grants)

### 1.1 Tabela `public.cnae_whitelist`
Lista de CNAEs autorizados, editável sem redeploy.

Colunas:
- `codigo text primary key` — CNAE 2.3 sem máscara, 7 dígitos.
- `tier text not null check (tier in ('verde','amarela','laranja'))`.
- `descricao text` (opcional, para a UI admin).
- `created_at`, `updated_at`.

Grants/RLS:
- `grant select on public.cnae_whitelist to authenticated, anon;` (leitura pública — não é dado sensível).
- `grant all to service_role`.
- RLS habilitado; policy `select` para qualquer um; escrita só via `has_role(auth.uid(),'admin')`.
- Seed inicial via migration `INSERT ... ON CONFLICT DO NOTHING` com as listas VERDE/AMARELA/LARANJA fornecidas.

### 1.2 Tabela `public.credenciamentos` (auditoria + fila manual)
Colunas:
- `id uuid pk default gen_random_uuid()`
- `created_at timestamptz default now()`
- `user_id uuid references auth.users(id) on delete set null`
- `cnpj text not null` (14 dígitos)
- `nome text`, `email text`, `empresa text`
- `decisao text not null check (decisao in ('aprovado','analise','reprovado','solicitar_cartao'))`
- `motivo text` — humano-legível ("CNAE 4322-3/01 em faixa verde", "Situação BAIXADA", "todas as fontes falharam")
- `fonte text` — `receitaws | brasilapi | cnpja | cartao | nenhuma`
- `cnae_principal text`, `cnaes_secundarios text[]`
- `cnae_match text`, `cnae_match_tier text`
- `situacao text` — normalizada (`ATIVA`, `BAIXADA`, etc.)
- `tier text` — tier B2B atribuído quando aprovado
- `protocolo text unique` — `CRD-YYYYMMDD-XXXX` para suporte
- `card_path text` — caminho no bucket `cartoes-cnpj`
- `status_manual text default 'pendente' check (status_manual in ('pendente','aprovado','recusado','na'))` — `na` quando decisao=aprovado/reprovado automático
- `reviewed_by uuid references auth.users(id)`, `reviewed_at timestamptz`, `review_note text`
- `raw_response jsonb` — resposta crua da fonte que decidiu (debug/auditoria)

Index: `(status_manual, created_at desc)`, `(user_id)`, `(cnpj)`.

Grants/RLS:
- `grant select, insert on public.credenciamentos to authenticated;`
- `grant all to service_role;`
- RLS: usuário lê apenas `user_id = auth.uid()`; admin lê/edita tudo via `has_role(auth.uid(),'admin')`. Insert pela edge (service role) — não exposto direto ao cliente.

### 1.3 `partner_profiles` (alteração leve)
Adicionar (se ainda não existirem):
- `credenciamento_id uuid references public.credenciamentos(id)`
- `credenciado_em timestamptz`
- `credenciado_fonte text`

Nenhuma policy nova — já é tabela do parceiro.

### 1.4 Storage bucket `cartoes-cnpj` (privado)
- `public = false`.
- Policy `storage.objects`:
  - INSERT: `authenticated` pode subir somente em `cartoes-cnpj/{auth.uid()}/...`
  - SELECT: somente `has_role(auth.uid(),'admin')` OU dono do arquivo (path prefix com `auth.uid()`).
- Retenção LGPD: job `pg_cron` semanal apagando objetos > 180 dias (decisão sua: 90/180/365 — sugestão **180**).

---

## 2) Edge Function `credenciar`

Arquivo: `supabase/functions/credenciar/index.ts` (`verify_jwt = false` — proteção via header próprio).

### Entrada
```
POST /credenciar
Headers: x-western-key: <WESTERN_CREDENCIAR_KEY>
Body: { cnpj, nome?, email?, user_id?, sem_cartao? }
```

Validação com Zod: CNPJ 14 dígitos + dígitos verificadores (reaproveitar `isValidCNPJ` portado).

### Fluxo
1. Compara header com `Deno.env.get("WESTERN_CREDENCIAR_KEY")`. Falha → 401.
2. Rate-limit leve por IP+CNPJ (memória + tabela) — 5 req/min.
3. **Cascata** (ordem fixa, stop no primeiro sucesso):
   - **ReceitaWS** — só se `RECEITAWS_TOKEN` existe. `GET https://receitaws.com.br/v1/cnpj/{cnpj}` com `Authorization: Bearer <token>`. 5s timeout.
   - **BrasilAPI** — `GET https://brasilapi.com.br/api/cnpj/v1/{cnpj}`. 5s timeout.
   - **CNPJá Open** — `GET https://open.cnpja.com/office/{cnpj}`. 5s timeout.
   - Cada chamada retorna `{ situacao, cnaePrincipal, cnaesSecundarios[], razaoSocial, fonte }` após normalização.
4. **Normalizadores** (um por fonte, formato comum):
   | Campo          | ReceitaWS                          | BrasilAPI                                                | CNPJá Open                                |
   |----------------|------------------------------------|----------------------------------------------------------|-------------------------------------------|
   | situacao       | `situacao` (uppercase)             | `descricao_situacao_cadastral`                           | `status.text`                             |
   | razao          | `nome`                             | `razao_social`                                           | `company.name`                            |
   | principal      | `atividade_principal[0].code`      | `cnae_fiscal` (formatado)                                | `mainActivity.id`                         |
   | secundários    | `atividades_secundarias[].code`    | `cnaes_secundarios[].codigo`                             | `sideActivities[].id`                     |

   Limpar máscara → 7 dígitos numéricos.
5. **Decisão**:
   - Se `situacao` normalizada != `ATIVA` → `reprovado` (motivo = situação).
   - Senão, busca match em `cnae_whitelist`:
     - tier `verde` em principal ou qualquer secundário → `aprovado`, `tier = 'verde'` (mapeia para tier B2B base).
     - tier `amarela`/`laranja` → `analise`.
     - nenhum match → `analise` (motivo "CNAE fora da whitelist").
6. Se todas as fontes falharem:
   - Se `sem_cartao = true` → grava `analise` com `fonte='nenhuma'`, motivo "todas as fontes falharam, cliente seguiu sem cartão".
   - Senão → retorna `solicitar_cartao` (não persiste decisão final ainda — o frontend pede o upload e reenvia).
7. Persistência: insere em `credenciamentos`, gera `protocolo`.
8. Se `aprovado` e `user_id` presente: `update partner_profiles set status='approved', tier=<tier>, credenciamento_id=..., credenciado_em=now()`.
9. Enfileira notificações (item 5).

### Saída
```
{ decisao, motivo, fonte, cnae_match, cnae_match_tier, tier, empresa, situacao, protocolo }
```

### Config
- `supabase/config.toml` recebe bloco `[functions.credenciar]` com `verify_jwt = false`.

---

## 3) Frontend — cadastro do parceiro

### 3.1 `src/pages/PartnerSignup.tsx` (alterar)
Após o `signUp` bem-sucedido (hoje cria `partner_profiles` via trigger `handle_new_user`):
1. Chamar `supabase.functions.invoke('credenciar', { body: { cnpj, nome, email, user_id, sem_cartao:false }, headers:{ 'x-western-key': import.meta.env.VITE_WESTERN_CREDENCIAR_KEY }})`.
   - **Decisão**: chave pública no client é aceitável (não é segredo de aprovação — só blinda a função de spam público). Alternativa mais segura: roteador via outra função autenticada que assina internamente. Confirmar comigo se quer ir pela rota mais segura — recomendo a simples agora.
2. Tratar resposta:
   - `aprovado` → toast verde + redireciona para `/conta` (sessão já libera B2B).
   - `analise` → tela "Recebemos seu cadastro — retorno em até 2 dias úteis. Protocolo: XXXX".
   - `reprovado` → mensagem educada referenciando a situação cadastral.
   - `solicitar_cartao` → step novo `CartaoCnpjStep` com `<input type=file accept="image/*,application/pdf">`. Upload para `cartoes-cnpj/{user_id}/{timestamp}.{ext}`, depois reinvoca `credenciar` com `sem_cartao=true` e `card_path` (a função apenas registra fila + path).
   - Botão "Seguir sem enviar agora" → reinvoca com `sem_cartao=true`.

### 3.2 Novo componente `src/components/forms/CartaoCnpjUpload.tsx`
- Validação client-side (tamanho ≤ 5MB, tipos permitidos).
- Estado de upload + erros inline (segue o padrão dos forms já consolidados).

### 3.3 `src/components/forms/CnpjInput.tsx`
Sem mudança — já valida dígitos verificadores.

---

## 4) Frontend — Admin

### 4.1 Nova rota `src/pages/admin/AdminCredenciamentos.tsx`
- Adicionar no `AdminLayout.tsx` o item "Credenciamentos" (icon `BadgeCheck`).
- Tabs: **Pendentes** (`status_manual='pendente'`) / **Decididos** (resto).
- Tabela: empresa, CNPJ, CNAE principal/match, fonte, situação, criado em, protocolo, link p/ cartão (signed URL).
- Drawer de detalhe com:
  - Cabeçalho com decisão automática + motivo.
  - Visualizador embed do PDF/imagem do cartão (signed URL 5min).
  - Botões **Aprovar (tier verde/azul/etc)** e **Recusar (com motivo)**.
  - Ação atualiza `credenciamentos.status_manual + reviewed_by/at + review_note`; se aprovar, atualiza `partner_profiles.status='approved'` + tier; dispara e-mail ao cliente.

### 4.2 Nova rota `src/pages/admin/AdminCnaeWhitelist.tsx`
- CRUD simples para `cnae_whitelist` (add/edit/del; filtro por tier). Permite o comercial ajustar lista sem deploy.
- Linkar em "Configurações" do AdminLayout.

---

## 5) Notificações

Hoje o projeto **não tem infra de e-mail transacional ativa** (vi `yampi-*` mas nenhum `send-transactional-email`). Plano em duas etapas:

**Agora**: a edge function `credenciar` chama uma helper `notify()` que:
- Insere registro em `leads` com `type='credenciamento'` (cliente em análise) → aparece na caixa de entrada do admin.
- Loga no `client_errors`/console como fallback.

**Próximo passo (separado, requer sua aprovação)**: configurar Lovable Emails (`email_domain--setup_email_infra`) e criar 3 templates:
- `credenciamento-aprovado` → cliente.
- `credenciamento-analise` → cliente (com protocolo + prazo 2 dias úteis).
- `credenciamento-novo-pendente` → `COMERCIAL_EMAIL`.

Sinalize se quer já incluir essa etapa nesta entrega ou tratar separado.

---

## 6) Segredos a cadastrar (Project Settings → Secrets)

| Nome                       | Obrigatório | Uso                                                                 |
|----------------------------|-------------|---------------------------------------------------------------------|
| `WESTERN_CREDENCIAR_KEY`   | Sim         | Header de acesso à edge `credenciar`. Posso gerar via `generate_secret`. |
| `RECEITAWS_TOKEN`          | Opcional    | Habilita ReceitaWS no topo da cascata.                              |
| `COMERCIAL_EMAIL`          | Sim         | Destinatário do aviso de fila.                                      |

Também adicionar `VITE_WESTERN_CREDENCIAR_KEY` no `.env` do front (mesmo valor) — chave **pública** de blindagem anti-spam, não credencial de aprovação.

---

## 7) Decisões que preciso de você

1. **Mapa CNAE.tier → tier B2B** do `partner_profiles`. Hoje os tiers são `light/...` (em `adminUtils.tsx`). Sugiro: `verde → light` por padrão; amarela/laranja não aprovam automático. Confirma?
2. **Retenção do Cartão CNPJ** no Storage: 90, 180 ou 365 dias?
3. **Etapa de e-mails**: incluir nesta entrega ou separar?
4. **Chave do header**: aceita a abordagem pragmática (`VITE_WESTERN_CREDENCIAR_KEY` no client) ou prefere proxy assinado server-side?
5. **Rate-limit**: 5 req/min por IP+CNPJ está ok?
6. **Reprovação por situação ≠ ATIVA**: bloqueia o cadastro do usuário no Supabase Auth, ou só marca `partner_profiles.status='rejected'` e mantém a conta para reaplicação futura? (sugestão: marcar rejected, conta segue).

---

## 8) Arquivos a criar / alterar (resumo)

**Migrations**
- `supabase/migrations/<ts>_cnae_whitelist.sql`
- `supabase/migrations/<ts>_credenciamentos.sql`
- `supabase/migrations/<ts>_partner_profiles_credenciamento.sql`
- `supabase/migrations/<ts>_seed_cnae_whitelist.sql`

**Storage**
- bucket `cartoes-cnpj` (via tool) + policies em migration.

**Edge**
- `supabase/functions/credenciar/index.ts`
- `supabase/config.toml` (bloco `[functions.credenciar]`)

**Front**
- `src/pages/PartnerSignup.tsx` (integrar pós-signup)
- `src/components/forms/CartaoCnpjUpload.tsx` (novo)
- `src/pages/admin/AdminCredenciamentos.tsx` (novo)
- `src/pages/admin/AdminCnaeWhitelist.tsx` (novo)
- `src/components/admin/AdminLayout.tsx` (item de menu)
- `src/App.tsx` (rotas admin)

**Sem alteração**
- `cartStore`, checkout, pricing — fora de escopo.
