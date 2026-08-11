# E-mails de auth com a marca — runbook do painel

Conserta os 3 problemas do print de 11/08: spam, remetente
"Western-Stone-Gallery via no-reply@auth.lovable.cloud" e template genérico
em inglês. Tudo no painel do Supabase de produção (via Lovable) + Resend.
Tempo total: ~15 min.

## Passo 0 — Resend (JÁ EXISTE, confirmado 11/08)

O canal já funciona: os e-mails de orçamento do app saem como
`Western <no-reply@westernstore.com.br>` via Resend e chegam na inbox
(print do dono, e-mail de 18/07). Então:

1. **Não precisa criar nada.** A senha do SMTP é a MESMA chave que já está
   nos secrets do projeto (painel → Edge Functions → Secrets →
   `RESEND_API_KEY`). Copiar o valor de lá — **não colar no chat**.
2. Única conferência no resend.com: no domínio, **click tracking e open
   tracking desligados** — tracking reescreve o link do e-mail e QUEBRA o
   fluxo de auth (aviso da doc do Supabase). Se nunca foi ligado, nada a
   fazer.

## Passo 1 — SMTP (Supabase → Authentication → Emails → SMTP Settings)

Ativar **Enable Custom SMTP** e preencher:

| Campo | Valor |
|---|---|
| Sender email | `no-reply@westernstore.com.br` (o mesmo remetente já usado nos orçamentos) |
| Sender name | `Western` |
| Host | `smtp.resend.com` |
| Port | `465` |
| Username | `resend` (literal) |
| Password | o valor de `RESEND_API_KEY` (Passo 0) |
| Minimum interval | manter o padrão |

## Passo 2 — Rate limit (Authentication → Rate Limits)

Ao ativar SMTP próprio o limite CAI para **30 e-mails/hora**. Subir para o
volume esperado (ex.: 200/h). Sem isso, os cadastros da feira travam.

## Passo 3 — Templates (Authentication → Emails → Templates)

Colar o HTML de cada arquivo desta pasta no template correspondente, com o
assunto:

| Template do painel | Arquivo | Assunto |
|---|---|---|
| Reset Password | `reset-password.html` | Redefinir sua senha — Western |
| Confirm sign up | `confirm-signup.html` | Confirme seu cadastro — Western |
| Invite user | `invite.html` | Seu convite de acesso — Western |
| Magic Link | `magic-link.html` | Seu link de acesso — Western |

## Passo 4 — URL Configuration (Authentication → URL Configuration)

Conferir: **Site URL** = `https://westernstore.com.br` e a allowlist de
Redirect URLs contém `https://westernstore.com.br/parceiro/redefinir-senha`.

## Passo 5 — Teste real

"Esqueci a senha" no site → conferir: chegou na **inbox** (não spam),
remetente **Western <atendimento@westernstore.com.br>**, visual da marca,
link funciona.

## Riscos aceitos e fila futura

- O link do botão continua sendo o `{{ .ConfirmationURL }}` do Supabase
  (domínio `*.supabase.co`). Scanners corporativos (Microsoft Defender Safe
  Links) podem consumir o link de uso único antes do clique. A correção
  definitiva é uma rota `/auth/confirm` no site usando `{{ .TokenHash }}`
  (link no próprio domínio) — está na fila, não é coisa de dia de
  lançamento.
- O logo dos e-mails aponta para `westernstore.com.br/img/email/logo-verde-h.png`
  (caminho permanente criado em 11/08, fora da pasta da campanha Expolazer).
  O commit no repo do site precisa estar deployado antes do teste.
- Os 4 templates passaram por revisão adversarial (Outlook/Gmail, variáveis
  do Go template, anti-spam, PT-BR) em 11/08 — correções aplicadas.
