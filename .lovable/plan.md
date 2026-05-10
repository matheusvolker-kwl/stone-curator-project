## Por que os conjuntos do guia parecem "bloqueados"

O Guia até **adiciona** as peças ao carrinho normalmente (Reservar upgrade / Adicionar). O bloqueio que você está vendo é no **CartDrawer**: quando o usuário **não é parceiro aprovado**, ele esconde preços, esconde "Solicitar orçamento" e "Pagar online", e só mostra "Acessar minha conta / Solicitar cadastro B2B".

Hoje, mesmo um arquiteto curioso (sem cadastro) que monta um orçamento bonito pelo Guia bate numa parede. Vamos abrir esse fluxo — orçamento é lead, não venda.

---

## O que vamos construir

### 1. Liberar "Solicitar orçamento" para todo mundo
- Visitante anônimo, parceiro pendente e parceiro aprovado: **todos** podem solicitar orçamento.
- Visitante anônimo continua **sem ver preço** (mantém o gating B2B), mas pode montar a composição e mandar para o vendedor.
- Apenas "Pagar online" (checkout Shopify) continua restrito a parceiro aprovado.

### 2. Inverter a hierarquia dos CTAs no carrinho
Ordem nova, do mais para o menos destacado:

```text
[ PAGAR ONLINE → ]            ← gold sólido, h-14, ícone, sombra (CTA principal)
[ Solicitar orçamento ]       ← outline cream, h-12 (secundário)
[ Baixar PDF da composição ]  ← link discreto com ícone
```

Para parceiro **não aprovado**, "Pagar online" some e "Solicitar orçamento" assume o lugar do CTA principal (gold sólido).

### 3. Modal "Solicitar orçamento" (form + lead)
Botão abre um Dialog com:

- **Se logado**: prefill com nome/empresa/telefone/email do `partner_profiles`, campos travados em readonly + textarea "Mensagem para o vendedor (opcional)".
- **Se anônimo**: campos `nome*`, `email*`, `telefone*`, `empresa`, `cidade`, `mensagem` (validação com zod, mesmas regras do PartnerSignup).
- Resumo da composição (itens, qty, subtotal — só mostra preço se aprovado).
- Botão "Enviar pedido de orçamento".

Ao enviar:
1. Insere em `leads` com `type='orcamento'`, `origem='cart_drawer'`, `payload = { items, subtotal, currency, mensagem, conjunto_origem? }`. Se logado, grava `user_id`.
2. Se logado, faz upsert em `saved_carts` (já existe) preservando o snapshot atual.
3. Toast de sucesso + fecha modal + opção de baixar o PDF na hora.
4. Não limpa o carrinho (cliente pode continuar editando).

### 4. PDF da composição
Botão "Baixar PDF" (no carrinho e dentro do modal de sucesso) gera client-side um PDF com:

- Cabeçalho Western (logo, "Composição de orçamento", data).
- Dados do cliente (se preenchidos).
- Tabela de itens: imagem miniatura, nome, acabamento, qty, preço unit., subtotal (preço só se aprovado).
- Subtotal, pedido mínimo, prazo de produção (15 dias úteis).
- Rodapé: WhatsApp do consultor + observação "Orçamento sujeito a confirmação".
- Nome do arquivo: `western-orcamento-YYYYMMDD-HHmm.pdf`.

Stack: **jsPDF + jspdf-autotable** (leve, sem servidor). Sem necessidade de edge function.

### 5. Backend — sem migration nova
- Tabela `leads` já aceita `type` e `payload jsonb`, e a RLS `Public can submit leads` permite insert anônimo desde que email ou telefone estejam preenchidos. **Compatível.**
- O `type` do enum precisa aceitar `'orcamento'`. Vou checar o enum atual antes de implementar — se faltar, abro migration de 1 linha (`ALTER TYPE`) na hora da execução.
- `saved_carts` já existe para o snapshot do parceiro logado.

### 6. Painel admin — leads de orçamento
- Em `/admin/leads`, adicionar filtro por `type` incluindo "Orçamento" e expandir o `payload` para mostrar a composição (itens + subtotal) numa drawer, com botão "Abrir WhatsApp do cliente".

---

## Detalhes técnicos

**Arquivos novos:**
- `src/components/cart/QuoteRequestModal.tsx` — Dialog com form + zod.
- `src/lib/pdf/orcamentoPdf.ts` — função `gerarOrcamentoPdf(items, cliente, subtotal)`.
- `src/lib/leads.ts` — helper `submitQuoteLead(payload)`.

**Arquivos editados:**
- `src/components/layout/CartDrawer.tsx` — nova hierarquia de CTAs, libera "Solicitar orçamento" para todos, abre modal em vez de WhatsApp direto, mostra botão de PDF.
- `src/components/guide/StepFechamento.tsx` — alinha CTA primário com a nova lógica (mantém "Solicitar proposta" mas reaproveita o mesmo modal).
- `src/pages/admin/AdminLeads.tsx` — filtro `tipo=orcamento` + drawer com itens.

**Dependências novas:** `jspdf`, `jspdf-autotable`.

**Sem mudanças** em: `cartStore`, fluxo Shopify, RLS de `leads` (já cobre o caso).
