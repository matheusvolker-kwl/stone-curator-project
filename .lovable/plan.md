
## Diagnóstico — por que parou de funcionar no Guia

O fluxo de orçamento + PDF foi construído em torno do **carrinho** (`CartDrawer` → `QuoteRequestModal` → `submitQuoteLead` em `src/lib/leads.ts`), e ainda funciona lá:

- Cria um `lead` (tipo `orcamento`) que aparece no painel admin.
- Se o usuário estiver logado, gera o PDF, sobe pro Storage (`orcamentos`) e registra em `quote_pdfs` → aparece em **Minha conta › Orçamentos** (`/minha-conta/orcamentos`).

No **Guia de Composição** isso nunca foi conectado:

- O botão "Revisar e finalizar" em `ProjetoSidebar` chama `onFinalizar()` em `src/pages/guia/Refinar.tsx`, que apenas navega para `/guia-de-composicao/finalizar`.
- Essa página (`src/pages/guia/Finalizar.tsx`) é hoje um **stub** com texto "Esta etapa de checkout completo será conectada ao fluxo comercial". Não dispara lead, não gera PDF, não salva nada.
- Além disso, a composição do Guia (peças base + extras autorais) **não vive no `cartStore`** — então não dá pra reaproveitar `QuoteRequestModal` direto.

Resultado: hoje o Guia "trava" no botão final. Toda a lógica de PDF/lead que já existe está sendo desperdiçada.

Outro ponto: no `QuoteRequestModal` do carrinho, o botão "Baixar PDF agora" aparece **antes** do envio do formulário — ou seja, qualquer um baixa sem deixar contato. Você pediu que o PDF só saia mediante formulário.

---

## O que vou construir

### 1. Modal único de "Solicitar orçamento" reaproveitável

Criar `src/components/quote/QuoteLeadModal.tsx` (genérico), recebendo:

- `items` (já no formato esperado por `submitQuoteLead`)
- `origem` (`"cart_drawer"` | `"guia_composicao"`)
- `payloadExtra` (no Guia: conjunto, acabamento, tipoVisual, área, modo curado/sob-consulta)
- `subtotal`, `currency`, `showPrices`

Refatorar `QuoteRequestModal` (carrinho) para ser apenas um wrapper que monta esses props a partir do `cartStore`. Assim cart e guia compartilham 1 componente só.

### 2. Formulário diferente para logado vs. não logado

**Não logado** (formulário curto e direto):
- Nome *
- E-mail *
- WhatsApp *
- Cidade (opcional)
- Mensagem (opcional)
- Checkbox: "Quero receber novidades" (opt-in)
- CTA secundário discreto: "Já tem conta? Entrar" (link para `/parceiro/login` mantendo o estado)

**Logado** (rápido, prefilled, sem fricção):
- Mostra cartão "Enviando como **{nome}** · {empresa}" com link "trocar"
- Pré-carrega nome/email/telefone/cidade do `partner_profiles`
- Só pede o que estiver faltando
- Campo único editável: **Mensagem para o vendedor**
- Indica: "Esta composição vai ficar salva em **Minha conta › Orçamentos**"

### 3. PDF só após formulário

Remover o botão "Baixar PDF agora" da tela pré-envio. O download passa a ser **exclusivamente** na tela de sucesso (após `submitQuoteLead`), igual já acontece com "Falar com vendedor". Isso vale para carrinho e guia.

### 4. Conectar o Guia ao fluxo

Em `src/pages/guia/Refinar.tsx`:
- Trocar `onFinalizar` (que navega) por abrir `<QuoteLeadModal>` com:
  - `items` montados a partir de `pecas` + `extras` (mapeando para o shape do `CartItem`/`submitQuoteLead`)
  - `origem: "guia_composicao"`
  - `payloadExtra`: `{ conjuntoHandle, conjuntoNome, acabamento, tipoVisual, areaM2, isCustomizado, modo: isCustomizado ? "consulta" : "curado" }`
- Texto do CTA muda conforme `isCustomizado` (já está hoje: "Solicitar orçamento sob consulta" vs "Revisar e finalizar").
- Aposentar a página stub `/guia-de-composicao/finalizar` (deletar rota e arquivo, ou redirecionar para o Guia).

### 5. Persistência para o cliente logado

`submitQuoteLead` já faz tudo: cria `lead`, gera PDF, salva no bucket `orcamentos`, registra em `quote_pdfs`. Vou apenas:
- Adicionar `origem` e `payloadExtra` ao `lead.payload` (campos do guia ficam visíveis pra você no admin).
- Garantir que o PDF do Guia mostre conjunto/acabamento/contexto (estender `orcamentoPdfBlob` com seção opcional "Projeto do Guia").

A página **Minha conta › Orçamentos** (`/minha-conta/orcamentos`, já existente) continua sendo o ponto único onde o cliente reencontra e baixa todos os PDFs — tanto os vindos do carrinho quanto os do Guia.

### 6. Painel admin

`leads` com `type = 'orcamento'` já caem no admin. Vou só:
- Garantir que `origem` apareça na listagem (`cart_drawer` vs `guia_composicao`) para você diferenciar.
- Mostrar `payload.summary` + (quando vier do guia) o nome do conjunto/acabamento.

### 7. PDF para visitante não logado

Hoje: se não tem `userId`, o PDF **não é salvo no storage** (não tem onde guardar com RLS). Vou manter assim, mas no momento do "sucesso" gerar o blob no client e oferecer download direto. O lead com todos os dados continua chegando pra você — então mesmo sem PDF salvo, você tem o contato + a composição (em `payload.items`) pra responder.

---

## Arquivos afetados

- **Novo**: `src/components/quote/QuoteLeadModal.tsx` (componente compartilhado)
- **Editar**:
  - `src/components/cart/QuoteRequestModal.tsx` (vira wrapper magrinho)
  - `src/pages/guia/Refinar.tsx` (abre modal em vez de navegar)
  - `src/components/guide-v2/ProjetoSidebar.tsx` (sem mudança de API; só passa `onFinalizar` que abre modal)
  - `src/lib/leads.ts` (aceitar `origem` e `payloadExtra`)
  - `src/lib/pdf/orcamentoPdf.ts` (seção opcional de contexto do Guia)
  - `src/App.tsx` (remover rota `/guia-de-composicao/finalizar`)
- **Deletar**: `src/pages/guia/Finalizar.tsx`

---

## Resposta direta às suas perguntas

> Por que não está dentro do motor do guia?
Porque o botão "Finalizar" do Guia nunca foi ligado ao `submitQuoteLead`. Ele só navegava para uma página de placeholder. Ficou só no carrinho.

> Isso está funcionando?
**Carrinho:** sim — gera lead, PDF, salva em conta logada e aparece em "Minha conta › Orçamentos".
**Guia:** não — o botão final é decorativo.

Depois deste plano, o mesmo fluxo de lead + PDF + salvar-na-conta passa a rodar nos dois lugares, com formulários diferentes para visitante e cliente logado, e o PDF só é entregue após o formulário.
