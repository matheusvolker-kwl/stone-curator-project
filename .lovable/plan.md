## Objetivo

Reduzir atrito no checkout renomeando os dois CTAs principais do guia de composição e do carrinho, mantendo a captura de lead via formulário antes do download do PDF.

## Mudanças

### 1. `src/components/guide-v2/ProjetoSidebar.tsx`
- Botão dourado primário: **"Pagar online"** → **"Finalizar compra"** (mantém ícone `ExternalLink`).
- Botão secundário outline: **"Solicitar orçamento"** → **"Baixar composição (PDF)"** (trocar ícone `MessageCircle` por `Download`).

### 2. `src/components/layout/CartDrawer.tsx`
- Mesma renomeação para consistência:
  - "Pagar online" / "Checkout" → **"Finalizar compra"**.
  - "Solicitar orçamento" → **"Baixar composição (PDF)"** com ícone `Download`.

### 3. `src/components/quote/QuoteLeadModal.tsx`
Reposicionar a comunicação do modal como "liberação de PDF" em vez de "solicitação de orçamento":
- Título: **"Baixe sua composição"**.
- Subtítulo (logado): "Confirme seus dados e libere o PDF — também salvamos na sua conta."
- Subtítulo (sem login): "Preencha rapidinho para liberar o PDF da sua composição."
- CTA do form: **"Liberar PDF"**.
- Tela de sucesso: título **"Pronto! Seu PDF está liberado."** + botão **"Baixar PDF"** (já existente).
- Manter aviso opcional/sutil de que o time pode entrar em contato (continua capturando lead no painel admin, sem assustar o cliente).

### 4. `src/components/cart/QuoteRequestModal.tsx` (wrapper)
- Se este wrapper ainda exibir copy próprio, alinhar com os mesmos textos do `QuoteLeadModal`.

## Fora de escopo
- Nenhuma alteração em `leads.ts`, `orcamentoPdf.ts` ou tabelas — backend e PDF continuam idênticos. Apenas copy e ícones.
- Sem mudança no fluxo: cliente continua preenchendo formulário antes de receber o PDF (garante o lead no admin).
