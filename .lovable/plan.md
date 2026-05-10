## Separação de painéis + Western Pro tiers + perfil completo

Hoje o `/admin` e o `/parceiro/conta` compartilham layout, hooks e até botões ("Reivindicar admin" no perfil do parceiro). Vamos separar de verdade: dois mundos, dois layouts, duas permissões.

---

### 1. Arquitetura de URLs e permissões

```text
STAFF (Western)                       CLIENTE (parceiro B2B)
─────────────────                     ──────────────────────
/admin                  ← dashboard   /minha-conta            ← visão geral
/admin/parceiros        ← aprovar     /minha-conta/perfil     ← dados + endereços
/admin/leads            ← CRM         /minha-conta/projetos   ← lista de projetos
/admin/amostras         ← workflow    /minha-conta/pedidos    ← últimos pedidos
/admin/usuarios         ← tiers+roles /minha-conta/carrinho   ← carrinho salvo
/admin/configuracoes                  /minha-conta/sketches   ← últimas 5 exportações
                                      /minha-conta/favoritos  ← wishlist
                                      /minha-conta/amostras   ← status do kit
                                      /minha-conta/preferencias ← newsletter, senha, cancelar
```

Regras de acesso:
- `/admin/*` → exige `role = 'admin'` (via `has_role`). Se não for admin, 404 (não redireciona para conta de cliente — não vaza a existência do painel).
- `/minha-conta/*` → exige login + `partner_profiles.status = 'approved'`. Pendente cai em uma tela "Em análise". Cancelado cai em "Conta cancelada".
- Admin **não usa** `/minha-conta`. Tem perfil próprio em `/admin/configuracoes/meu-perfil`.
- `/parceiro/conta`, `/parceiro/favoritos` viram redirects 301 para `/minha-conta/*` (preservar links antigos).
- `/parceiro/login`, `/parceiro/cadastro`, `/parceiro/redefinir-senha` permanecem (são públicos).
- Header: menu do admin é diferente (link "Painel Western" em destaque, sem "Favoritos"/"Amostras"). Menu do cliente mostra os 8 itens da conta.

---

### 2. Painel Cliente — `/minha-conta`

Layout próprio com sidebar vertical (navegação entre as abas), header simples com nome da empresa e tier badge.

**Visão geral (dashboard)**
- Cards: pedidos no mês, projetos ativos, status do kit de amostras, % de desconto vigente.
- Atalhos: continuar carrinho salvo, baixar último sketch.

**Meu perfil**
- Aba "Empresa": razão social, CNPJ, segmento, site, instagram.
- Aba "Endereços": cobrança + entrega (múltiplos, marca padrão).
- Aba "Responsável": nome, cargo, telefone celular, e-mail.
- Botão "Salvar" por aba.

**Projetos** — lista de projetos do cliente (nome, cidade, status, data). CRUD básico.

**Últimos pedidos** — puxa do Shopify via `customerOrders` (mostra nº, data, total, status, link p/ rastreio). Cache local 10 min.

**Carrinho salvo** — usa o `cartStore` atual + persiste em tabela `saved_carts` por user_id. Ao logar, restaura. Mostra itens, total estimado e botão "Retomar".

**Sketches do guia de compras** — últimas 5 exportações PDF do `BuyingGuide`. Já temos o guide store; criar tabela `guide_exports` que grava `{user_id, payload, pdf_url, created_at}` a cada export. Lista com download.

**Favoritos** — página `/parceiro/favoritos` atual movida para cá.

**Amostras** — status do último kit + botão para novo pedido (respeita tier: Light/Gold pagam, Platinum/Partner ganham).

**Preferências**
- Toggle "Receber newsletter" → grava `partner_profiles.newsletter_opt_in`.
- Trocar senha (já existe).
- **Cancelar conta**:
  1. Botão vermelho discreto → abre modal.
  2. Textarea obrigatório "Por que está cancelando?" (mín. 10 chars).
  3. Campo senha (revalida via `signInWithPassword` silencioso).
  4. Checkbox "Entendo que perderei acesso ao catálogo B2B e preços".
  5. Botão "Confirmar cancelamento" → segundo confirm "Tem certeza? Esta ação leva 24h para ser efetivada." → grava `status='cancelled'`, `cancellation_reason`, `cancelled_at`, faz signOut.
  6. Conta aparece em `/admin/usuarios` na aba "Canceladas" com motivo.

---

### 3. Painel Admin — `/admin`

Layout dedicado: header escuro Western, sidebar fixa, sem footer público. Visualmente claro que "isto não é o site".

**Dashboard** (`/admin`)
- KPIs: parceiros pendentes, amostras a aprovar, leads 7d, contas canceladas no mês.
- Feed de atividade recente.

**Parceiros** (`/admin/parceiros`)
- O que já existe na aba atual, com filtros status/segmento/UF/tier.
- Drawer de detalhe ganha: histórico de pedidos (Shopify), tier atual, ações rápidas.

**Leads** (`/admin/leads`) — igual ao atual + export CSV.

**Amostras** (`/admin/amostras`) — workflow atual.

**Usuários** (`/admin/usuarios`) — **novo, central para tiers**
- Lista todos parceiros aprovados com colunas: empresa, tier, desconto%, métodos de pagamento liberados, ações.
- Editar usuário abre drawer com:
  - Select "Tier": Light / Gold / Platinum / Partner.
  - Override manual: desconto% (sobrescreve o do tier), boleto sim/não, parcelas máx, kit grátis sim/não.
  - Promover/remover admin.
- Aba "Canceladas" mostra contas com motivo.

**Configurações** (`/admin/configuracoes`)
- Definir os defaults de cada tier (desconto%, boleto, parcelas, kit grátis).
- Lista de admins.
- Meu perfil do admin (nome, e-mail, senha).

---

### 4. Western Pro — Tiers e descontos

**Onde aplicar:** tudo no Lovable Cloud (sua escolha).

Schema:
```text
ALTER TABLE partner_profiles ADD COLUMN tier text DEFAULT 'light';
                                      -- 'light' | 'gold' | 'platinum' | 'partner'
ALTER TABLE partner_profiles ADD COLUMN discount_override numeric;
ALTER TABLE partner_profiles ADD COLUMN payment_methods jsonb DEFAULT '{}';
                                      -- {boleto:bool, parcelas_max:int, kit_gratis:bool}
ALTER TABLE partner_profiles ADD COLUMN newsletter_opt_in bool DEFAULT true;
ALTER TABLE partner_profiles ADD COLUMN cancellation_reason text;
ALTER TABLE partner_profiles ADD COLUMN cancelled_at timestamptz;

CREATE TABLE tier_defaults (
  tier text PRIMARY KEY,            -- light/gold/platinum/partner
  discount_pct numeric NOT NULL,    -- 5, 10, 15, 20 (editável no admin)
  boleto bool, parcelas_max int, kit_gratis bool
);
```

Status `partner_status` ganha valor `'cancelled'`.

**Como o desconto chega no preço exibido:**
- Hook `usePartnerPricing()` lê tier/override do contexto auth.
- `GatedPrice` aplica `preco_base * (1 - desconto)` quando logado e aprovado.
- Mostra "de R$ X por R$ Y (-N% Western Pro Gold)" no card e PDP.

**Checkout (Shopify):**
- Geramos um discount code one-shot no Lovable na criação do checkout, baseado no tier do cliente (edge function `create-tier-discount` que usa Shopify Admin API). Funciona em qualquer plano Shopify.
- Métodos de pagamento (boleto, parcelas) ficam controlados por gate na nossa UI: se tier não permite, opção some no checkout. Boleto bancário propriamente dito depende do app de pagamento ativo na sua loja Shopify (assunto separado).

---

### 5. Tabelas novas

```text
saved_carts        (user_id PK, items jsonb, updated_at)
guide_exports      (id, user_id, payload jsonb, pdf_url, created_at)
projects           (id, user_id, nome, cidade, status, notas, created_at)
tier_defaults      (ver acima)
```

RLS: cada user vê só os seus; admin vê tudo.

---

### 6. Usuário master (você)

Edge function one-shot `admin-bootstrap`:
- Recebe `{email, password, token}`.
- Token = secret `ADMIN_BOOTSTRAP_TOKEN` (eu gero, te mostro 1x).
- Cria user no auth (admin API), confirma e-mail, insere `user_roles(admin)`, cria `partner_profiles` aprovado e tier `partner`.
- Após uso bem-sucedido, a function se auto-desabilita (flag em tabela `system_flags`).

Você roda 1 curl que eu te entrego pronto. Depois disso, login normal em `/parceiro/login` e cai direto em `/admin`.

---

### 7. Migrações de dados / breaking changes

- `partner_status` ganha `'cancelled'` (enum alter).
- Rotas `/parceiro/conta`, `/parceiro/favoritos` viram redirects para `/minha-conta/*`.
- `RequireAuth` ganha modo `staffOnly` (admin) e `customerOnly` (não-admin aprovado), usados nas duas árvores.
- O botão "Reivindicar admin" sai do perfil do cliente (some pra todo mundo; já temos a function `claim_first_admin` se precisar emergência).

---

### 8. Detalhes técnicos

- Layouts separados: `<AdminLayout>` (sidebar dark + header staff) e `<AccountLayout>` (sidebar clara, dentro de `SiteLayout`).
- Roteamento aninhado React Router: `/admin/*` com `<Outlet/>`, idem `/minha-conta/*`.
- `usePartnerPricing()` e `useTierConfig()` ficam em `src/hooks/`.
- Edge functions novas: `admin-bootstrap`, `create-tier-discount`, `cancel-account` (faz o soft-delete + signOut em transação).
- Shopify "últimos pedidos" usa Storefront API com customer access token — exige fluxo de associar e-mail Shopify. Se você não tem customer accounts ativados no Shopify, na primeira versão mostramos pedidos gravados localmente (tabela `orders_log` populada via webhook do Shopify). Posso confirmar qual caminho tomar quando começar a implementação.

### 9. Fora de escopo deste ciclo

- Boleto bancário real no Shopify (depende de gateway no Shopify).
- E-mails transacionais (você optou por "nenhum agora").
- Programa Western Pro detalhado (regras de evolução de tier, pontos, etc.) — só a infra de tier+desconto.
