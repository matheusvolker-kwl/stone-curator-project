## Próximos passos — finalização da camada de formulários e admin

### 1. Newsletter do rodapé (fechar pendência)
- Concluir `handleNewsletter` em `src/components/layout/Footer.tsx`:
  - Validação `zod` (email + honeypot).
  - `UPSERT` em `leads` com `type = 'newsletter'`, `origem = 'footer'`.
  - Estados de loading/sucesso/erro com `toast`.
  - Mensagem de sucesso preparando terreno para double opt-in futuro ("confirme no seu e-mail" — flag desativada por enquanto).

### 2. Painel admin expandido (`/admin`)
Reorganizar em abas usando `Tabs` do shadcn:

**Aba Parceiros**
- Listagem com novos campos: `cargo`, `segmento`, `cidade/UF`, `cnpj`, `cep`, endereço completo, instagram.
- Filtros: status (pending/approved/rejected), segmento, UF, busca por nome/empresa/CNPJ.
- Ações por linha: Aprovar, Rejeitar, Ver detalhes (drawer com tudo).
- Botão "Aprovar e notificar" (preparado para edge function de e-mail — ver item 4).
- Export CSV.

**Aba Leads**
- Filtros por `type` (contato, agendar-visita, trocas, newsletter, amostras), origem, intervalo de datas.
- Cards de contagem no topo (total por tipo nos últimos 7/30 dias).
- Drawer com `payload` formatado (legível, não JSON cru).
- Export CSV.

**Aba Amostras** (subset de leads onde `type = 'amostras'`)
- Workflow visual: Pendente → Aprovado → Enviado → Entregue.
- Coluna de status no `payload.aprovacao_status`.
- Ação "Aprovar (2 dias úteis cumpridos)" muda status e dispara e-mail.
- Endereço de envio destacado, com botão copiar.

**Aba Configurações**
- Lista de admins (`user_roles` onde `role = 'admin'`), com adicionar/remover por e-mail.
- Botão "Reivindicar admin" mantido para o primeiro acesso.

### 3. Decisões pendentes (perguntar antes de implementar)
- E-mail automático ao aprovar parceiro? (sim → criar edge function `send-partner-approved`)
- E-mail automático ao aprovar amostra? (sim → `send-amostra-status`)
- Wishlist real no lugar do antigo coração, ou manter removido?
- Confirmar `suporte@westernpools.com.br` como caixa oficial.

### 4. E-mails transacionais (condicional às respostas acima)
Se o usuário aprovar envio de e-mails:
- Verificar/configurar domínio de e-mail (`email_domain--setup_email_infra`).
- Scaffold de templates transacionais.
- Edge functions: `send-partner-approved`, `send-amostra-status`, `send-lead-internal-notification` (notifica time comercial em novos leads).

### Detalhes técnicos
- Sem mudança de schema necessária para itens 1 e 2 — colunas já existem.
- Item 4 dispara migração só se for preciso registrar logs de envio (a infra de e-mail cria suas próprias tabelas).
- Nenhuma alteração em `partner_profiles` ou `leads` neste ciclo.

### Fora de escopo deste ciclo
- Wishlist real (decidir antes).
- Double opt-in real do newsletter (preparar UI, ativar depois com domínio verificado).
