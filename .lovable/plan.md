## Plano de melhorias

### 1. PDF do orçamento — identidade visual Western

Refazer `src/lib/pdf/orcamentoPdf.ts` com tipografia, paleta e ritmo da marca:

- **Capa/header alta (160pt)** verde profundo `#1B3229` com a wordmark "WESTERN" em letterspacing largo, fio dourado horizontal abaixo, eyebrow dourado `COMPOSIÇÃO DE ORÇAMENTO · Nº 0000` e data alinhada à direita em fonte mono.
- **Bloco do cliente** em card creme `#E8E0CF` com borda fina dourada, eyebrow `CLIENTE` e dados em duas colunas (Nome/Empresa + Contato/Cidade).
- **Tabela**: header verde com texto creme, linhas alternadas (branco / creme 30%), bordas finas em `#DDD6C8`, coluna "Qtd" centralizada com fundo dourado leve, valores monetários alinhados à direita em mono.
- **Bloco totais** com fio dourado, "SUBTOTAL" em eyebrow + valor grande em display.
- **Mensagem do cliente** em card lateral com barra dourada à esquerda.
- **Rodapé fixo** verde com endereço do ateliê (`BUSINESS.enderecoAtelieCompleto`), WhatsApp e site, paginação `Página X de Y`.
- Carregar uma fonte serif (via `jspdf` standard `times`) para títulos display + `helvetica` para corpo, garantindo contraste com a versão atual chapada.
- Incluir miniatura da peça (quando `productImage` disponível) na primeira coluna usando `addImage` com fallback silencioso.

### 2. Salvar o PDF no espaço do cliente (Projetos vira hub)

- Renomear visualmente a aba **Projetos** para deixar claro que ali ficam **projetos + orçamentos salvos**:
  - Subtítulo: "Seus projetos e composições salvas em PDF."
  - Empty state novo: "Aqui ficam seus projetos e os PDFs das composições que você pediu orçamento. Toda vez que solicitar um atendimento, salvamos o PDF aqui."
- Criar bucket `orcamentos` (privado) no storage e tabela `quote_pdfs`:

```text
quote_pdfs
  id uuid pk
  user_id uuid (RLS: dono vê, admin vê tudo)
  lead_id uuid → leads.id
  storage_path text
  subtotal numeric
  items_count int
  created_at timestamptz
```

- No `submitQuoteLead` (somente quando `userId` presente):
  1. Gerar o PDF via `gerarOrcamentoPdf` → `doc.output("blob")`.
  2. Upload em `orcamentos/{user_id}/{lead_id}.pdf` via `supabase.storage`.
  3. Inserir row em `quote_pdfs`.
- Em `AccountProjects.tsx`, listar acima dos projetos uma seção **"Composições salvas"** com cards: data, nº de itens, subtotal, botão "Baixar PDF" (signed URL 1h) e "Reabrir composição" (carrega itens no carrinho via `cartStore`).

### 3. Modal de sucesso do orçamento — CTA WhatsApp

Em `QuoteRequestModal.tsx`, na tela de sucesso, adicionar botão dourado primário:

- "Falar com vendedor agora" → abre `https://wa.me/{BUSINESS.whatsappFabrica}` com mensagem pré-pronta:
  `"Olá! Acabei de enviar o orçamento #<id curto> com X itens (subtotal R$ ...). Gostaria de falar com um vendedor."`
- Manter "Baixar PDF" como secundário e "Fechar" como terciário. Hierarquia: WhatsApp → PDF → Fechar.

### 4. Formulário de amostras — atrelar ao perfil logado

Em `src/pages/PedirAmostras.tsx`:

- Detectar `useAuth()`. Se logado:
  - Carregar `partner_profiles` e pré-preencher **todos os campos** (nome, email, telefone, empresa, cep, endereço, número, complemento, bairro, cidade, estado).
  - Travar (readonly + tooltip "Editar em Meu Perfil") os campos pessoais (nome, email, telefone, empresa).
  - Endereço continua editável (cliente pode pedir entrega em outro lugar) mas com aviso "usando endereço do cadastro — altere se necessário".
  - No insert do lead, enviar `user_id: user.id` para vincular ao perfil e aparecer em **Amostras** automaticamente.
- Se anônimo: comportamento atual + um banner discreto sugerindo entrar/cadastrar para acompanhar o status.
- Confirmar que o lead já dispara no admin (`AdminLeads` filtra por `type=amostras`) — sem alteração necessária no painel.

### Detalhes técnicos

**Arquivos a editar:**
- `src/lib/pdf/orcamentoPdf.ts` — redesign completo
- `src/components/cart/QuoteRequestModal.tsx` — CTA WhatsApp + retornar `lead_id`
- `src/lib/leads.ts` — `submitQuoteLead` retorna `{ lead_id }` e dispara upload do PDF quando logado
- `src/pages/account/AccountProjects.tsx` — seção "Composições salvas" + texto explicativo
- `src/pages/PedirAmostras.tsx` — prefill + lock + `user_id` no lead

**Migração Supabase:**
- bucket `orcamentos` (privado) com policies (dono lê/escreve, admin lê tudo)
- tabela `quote_pdfs` com RLS análoga

**Sem alteração:** painel admin de leads, fluxo de carrinho, Shopify checkout.
