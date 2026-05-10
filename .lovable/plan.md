
## Visão geral

Padronizar a camada de formulários do site com validações de mercado (zod + máscaras + react-hook-form), reescrever os principais (cadastro parceiro, agendar visita, pedir amostras), atualizar a página de trocas/avarias com bloco de contato real, validar newsletter, decidir o destino do ícone de coração, e organizar o painel admin que já existe em `/admin`.

---

## 1. Camada base de inputs (reaproveitável)

Criar um conjunto de componentes em `src/components/forms/`:

- **`PhoneInput.tsx`** — prefixo fixo `+55` visual, máscara `(11) 95896-7088`, valida 10 ou 11 dígitos, retorna `5511993403485` (E.164) no `onChange`.
- **`CnpjInput.tsx`** — máscara `00.000.000/0000-00`, valida dígitos verificadores reais (algoritmo, não só comprimento), placeholder `00.000.000/0000-00`.
- **`CepInput.tsx`** — máscara `00000-000`, no blur consulta ViaCEP e auto-preenche `endereço`, `bairro`, `cidade`, `uf` (campos vizinhos via callback).
- **`EmailInput.tsx`** — type=email, validação regex sólida + sugestão de typo comum (ex.: "voce quis dizer @gmail.com?" para `gmal.com`).
- **`PasswordField.tsx`** — toggle mostrar/ocultar, indicador de força (fraca/média/forte) + lista de regras (8+ caracteres, número, símbolo) que vão marcando.
- **`SegmentoSelect.tsx`** — combobox shadcn com lista curada Western:
  - Arquitetura · Paisagismo · Construtora · Garden Center · Piscinas e Spas · Hotelaria/Resort · Loja de jardinagem · Decoração · Cliente final · **Outro (especificar)** — quando "Outro", abre um campo de texto livre.

Todas usam `react-hook-form` + `zod` (já recomendado pelo guia de segurança do projeto). Erros aparecem inline em mono pequeno abaixo do campo, em `text-red-700/80`.

Bibliotecas a instalar: `react-hook-form`, `@hookform/resolvers`, `zod` (pode já estar), `react-imask` (para máscaras estáveis).

---

## 2. Cadastro de Parceiro (`/parceiro/cadastro`)

Refatorar `src/pages/PartnerSignup.tsx` em **2 etapas** (stepper visual no topo) para diluir o tamanho do form sem sacrificar dados:

**Etapa 1 — Empresa**
- Razão social *
- CNPJ * (CnpjInput)
- Segmento * (SegmentoSelect)
- Site (opcional)
- Instagram (opcional, com `@` fixo no prefix)
- CEP * (CepInput → preenche os de baixo)
- Endereço * · Número * · Complemento
- Bairro · Cidade * · UF * (UF select com 27 estados)

**Etapa 2 — Responsável & acesso**
- Nome do responsável *
- Cargo * (Diretor, Arquiteto responsável, Comprador, Sócio, Outro)
- Telefone celular do responsável * (PhoneInput, com WhatsApp toggle)
- E-mail corporativo * (EmailInput)
- Senha * (PasswordField)
- Confirmar senha * (precisa bater)
- Checkbox aceite LGPD/política comercial *

Botão "Voltar / Avançar / Enviar". Mostrar resumo antes do submit.

**Mudanças de schema** (migration):
- Adicionar em `partner_profiles`: `estado` (uf), `endereco`, `numero`, `complemento`, `bairro`, `cep`, `cargo`, `instagram`. Manter `cidade` que já existe.
- Atualizar trigger `handle_new_user()` para gravar os novos campos do `raw_user_meta_data`.

---

## 3. Agendar Visita (`/visitar`)

Refatorar `src/pages/AgendarVisita.tsx`:

- Nome *, Telefone (PhoneInput) *, E-mail (EmailInput) *
- **Perfil** (select): Arquiteto · Paisagista · Cliente final · Lojista · Outro
- **Empresa / estúdio** (opcional)
- **Cidade/UF** (de onde vem)
- **Quantidade de pessoas** (number 1–10)
- **3 datas/horários** com `shadcn Calendar` + `Select` de horário (9h–17h, slots de 1h) — em vez de textarea. Renderiza 3 slots, todos obrigatórios. Bloqueia fim de semana e datas passadas; só permite Seg–Sex (horário do ateliê).
- **Tipo de projeto** (textarea, opcional)
- Aceite LGPD

Mantém o salvamento em `leads` com `type: "visita"` e `payload` rico.

---

## 4. Trocas e Avarias (`/trocas-e-avarias`)

A página é atualmente puro texto. Adicionar **acima do conteúdo legal** um bloco de contato direto:

```
┌─────────────────────────────────────────────────┐
│ Falar com pós-venda                             │
│                                                 │
│ WhatsApp · +55 11 99340-3485                    │
│ Telefone do ateliê · +55 11 99340-3485          │
│ E-mail suporte · suporte@westernpools.com.br    │
│ Endereço · Rua Colina, 38 — Jd. Paraíso         │
│            Cajamar/SP · 07794-075               │
│ Atendimento · Seg–Sex · 9h às 17h               │
│                                                 │
│ [Abrir chamado no WhatsApp]                     │
└─────────────────────────────────────────────────┘
```

Adicionar `emailSuporte: "suporte@westernpools.com.br"` em `BUSINESS`. Reutilizar dados de `enderecoAtelieRua/cep/cidadeAtelie/ufAtelie`.

---

## 5. Newsletter (footer)

Validar com zod (`z.string().email().max(255)`), bloquear duplicatas (UPSERT por email no `leads` com `type=newsletter`), e adicionar honeypot `_hp` invisível para bot. Mensagem de sucesso muda para algo como *"Obrigado. Confirmaremos por e-mail."* — preparado para futuro double opt-in via Lovable Email (não implemento agora, só copy).

Sem mudança de schema.

---

## 6. Pedir Amostras (`/pedir-amostras`)

Refatorar `src/pages/PedirAmostras.tsx` com a base nova (PhoneInput, CepInput auto-preenche, EmailInput, SegmentoSelect):

- Nome *, E-mail *, Telefone *
- Perfil (já existe, vira SegmentoSelect)
- Empresa/estúdio (opcional)
- CEP * (auto-preenche endereço/cidade/uf), Endereço *, Número *, Complemento, Bairro, Cidade *, UF *
- Sobre o projeto (opcional)
- Aceite LGPD

**Política de aprovação** (mudança de copy importante — alinhada ao seu pedido):
- Antes do submit: aviso destacado *"Solicitações de kit de amostras são aprovadas pelo nosso time comercial em até 2 dias úteis. Após aprovação, o kit é enviado em 5–7 dias úteis para todo o Brasil."*
- Página de sucesso muda para: *"Recebemos sua solicitação. Em até 2 dias úteis nosso time comercial confirma o envio."* — sem prometer remessa imediata.
- Lead salvo com `type: "amostras"` e `payload.aprovacao_status: "pending"` para rastrear no admin.

---

## 7. Ícone de coração no header

Hoje o `<Heart>` no header (linha 153 de `Header.tsx`) aponta para `/parceiro/login` — sem função real, é decorativo/confuso. Duas opções (preciso da sua decisão):

1. **Remover** — limpa o header, menos um elemento sem propósito.
2. **Transformar em "Lista de projetos"** — wishlist real onde o parceiro salva peças favoritas (precisa de tabela `wishlist_items` no Supabase + UI). Mais trabalho, mas faz sentido B2B (parceiro monta caixa de seleção antes de virar pedido).

Recomendo **remover agora** e tratar wishlist como feature separada quando você quiser.

---

## 8. Painel Admin

**Já existe** em `/admin` (rota protegida por `RequireAuth role=admin`, arquivo `src/pages/Admin.tsx`). Hoje tem 2 abas: **Parceiros** (aprovar/recusar) e **Leads** (listagem genérica). Vou expandir:

- **Acesso:** continua em `/admin`. Adicionar link discreto no Header (ícone `ShieldCheck` que só aparece para admin — já tem a infra `useAuth().isAdmin`).
- **Aba Parceiros:** mostrar todos os novos campos (cargo, endereço completo, instagram), botão "Aprovar e enviar e-mail" (gera senha temporária ou só notifica), filtro por segmento.
- **Aba Leads:** subdividir por tipo com contadores (Amostras / Visita / Newsletter / Contato / Cadastro parceiro), busca por nome/email/empresa, exportar CSV, marcar como "tratado".
- **Aba Amostras (nova):** visão dedicada do `type=amostras` com workflow Pendente → Aprovado → Enviado → Entregue, atualizando `payload.aprovacao_status` e `payload.tracking`.
- **Aba Configurações (futuro):** placeholder, sem implementação agora.

Sem mudanças destrutivas — só UI mais rica em cima das mesmas tabelas.

---

## 9. Migrations necessárias

Uma migration adicionando colunas em `partner_profiles` (estado, endereco, numero, complemento, bairro, cep, cargo, instagram) e atualizando a função `handle_new_user()` para popular os novos campos. Sem alterar tipos existentes.

---

## 10. Perguntas antes de implementar

1. **Coração no header:** remover ou transformar em wishlist real?
2. **Aprovação de parceiro:** quando aprovo no admin, devo enviar e-mail automático para o parceiro avisando? (Precisaria habilitar Lovable Email nesse caso.)
3. **Aprovação de amostras:** mesma pergunta — e-mail automático ou WhatsApp manual pelo time?
4. **Suporte e-mail:** confirmo `suporte@westernpools.com.br` (foi o que você passou) e adiciono ao `BUSINESS.emailSuporte`?

Posso começar mesmo sem as respostas — uso defaults conservadores (remover coração, sem e-mail automático, suporte como informado).
