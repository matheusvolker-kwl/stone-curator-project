## Objetivo

Limpar o painel da conta tirando duas funcionalidades que não fazem sentido (**Projetos** e **Carrinho salvo**), criar uma área dedicada **Orçamentos** para os PDFs das composições solicitadas, e investigar por que os PDFs não estão aparecendo (a tela mostra "Nenhuma composição salva ainda" mesmo após pedidos de orçamento).

---

## 1. Nova página: Orçamentos

**Criar** `src/pages/account/AccountQuotes.tsx`:
- Lista os registros de `quote_pdfs` do usuário (mesma query que existia em Projetos).
- Para cada item: número curto, data, contagem de itens, subtotal e botão "Baixar PDF" (signed URL do bucket `orcamentos`, 1h).
- Estado vazio elegante: ícone + texto "Nenhum orçamento solicitado ainda. Monte seu carrinho e clique em *Solicitar orçamento* — o PDF aparece aqui."
- Header padrão: eyebrow "Orçamentos", título "Suas composições solicitadas", subtítulo curto explicando o que é.

## 2. Remover Projetos

- Apagar `src/pages/account/AccountProjects.tsx`.
- Em `src/App.tsx`: remover import e rota `projetos`.
- Em `src/components/account/AccountLayout.tsx`: remover item "Projetos" do menu, adicionar **Orçamentos** (ícone `FileStack`) no lugar.
- Em `src/pages/account/AccountIndex.tsx`: remover o KPI/contagem de projetos da query e o `Card to="/minha-conta/projetos"`. Substituir por contagem e card de **Orçamentos** apontando para `/minha-conta/orcamentos`.
- A tabela `projects` no banco fica como está (sem migration de drop) — sem custo e dá margem pra reintroduzir no futuro se mudar de ideia.

## 3. Remover Carrinho Salvo

- Apagar `src/pages/account/AccountSavedCart.tsx`.
- Em `src/App.tsx`: remover import e rota `carrinho`.
- Em `src/components/account/AccountLayout.tsx`: remover o item "Carrinho salvo".
- Tabela `saved_carts` fica como está (continua sendo usada internamente pelo `cartStore` para sincronização do estado entre dispositivos — só a tela do painel some).

## 4. Investigar por que PDFs não aparecem

A tela vazia indica que ou (a) o upload do PDF falhou silenciosamente, ou (b) o `INSERT` em `quote_pdfs` não está acontecendo. Vou inspecionar o fluxo em `src/lib/leads.ts` (a parte que gera `await orcamentoPdfBlob`, faz upload no bucket `orcamentos` e insere em `quote_pdfs`) e checar:
- Se o caminho do upload está correto (RLS do bucket exige `auth.uid()::text` como primeira pasta? Verificar políticas atuais).
- Se erros estão sendo swallowed (try/catch sem toast) — adicionar log/toast discreto em caso de falha.
- Se a função `orcamentoPdfBlob` agora `async` está sendo realmente aguardada em todos os call sites.

Se identificar bug, corrigir junto. Se a causa for RLS do bucket, criar migration adicionando policies de INSERT/SELECT por usuário.

## 5. Resultado final do menu lateral

```
Visão geral
Meu perfil
Pedidos
Orçamentos        ← novo
Sketches
Favoritos
Amostras
Preferências
Sair
```

---

## Arquivos afetados

**Criar:** `src/pages/account/AccountQuotes.tsx`
**Apagar:** `src/pages/account/AccountProjects.tsx`, `src/pages/account/AccountSavedCart.tsx`
**Editar:** `src/App.tsx`, `src/components/account/AccountLayout.tsx`, `src/pages/account/AccountIndex.tsx`, possivelmente `src/lib/leads.ts` (se houver bug no salvamento)
**Possível migration:** apenas se RLS do bucket `orcamentos` estiver bloqueando — não mexe em `projects` nem `saved_carts`.

Sem mudanças em produtos, carrinho, checkout ou geração de PDF — só painel da conta.