## Varredura UX/Navegação — 4 ondas

Vou rodar uma auditoria completa de navegação, usabilidade e fricção, dividida em ondas. Cada onda termina com correções aplicadas + relatório curto do que foi achado.

---

### 🌊 Onda 1 — Navegação global & arquitetura
Foco: header, footer, breadcrumbs, rotas, redirects, 404, links quebrados, mobile menu, busca.
- Conferir todas as rotas em `App.tsx` x links reais usados (links órfãos, links para páginas inexistentes)
- Header: hierarquia, mobile drawer, busca (hoje só redireciona p/ `/linhas?q=`, mas `/linhas` precisa ler `q`), conta logada vs deslogada
- Footer: consistência de links, coleções vs `Linhas.tsx` reais
- Breadcrumbs ausentes em páginas profundas (ProductPage, LinhaPage, guia, conta, admin)
- 404 amigável com sugestões + atalhos
- "Skip to content" / acessibilidade de teclado no header
- ScrollToTop x rotas com hash

### 🌊 Onda 2 — Fluxo do parceiro (auth + conta + carrinho/orçamento)
Foco: cadastro/login/recuperação, RequireAuth, conta, orçamentos, pedidos, favoritos, amostras.
- Fluxo signup → login → aprovação → primeira compra (estados intermediários, mensagens claras)
- RequireAuth: redirect com `from` para voltar ao destino
- Carrinho/Drawer: estados vazios, validações de mínimo, micro-feedbacks, persistência
- "Minha conta" navegação (sidebar, abas, mobile), copy ambígua
- Favoritos: feedback ao adicionar (toast), página com ações em massa

### 🌊 Onda 3 — Guia de composição, catálogo & páginas comerciais
Foco: jornada principal de compra (Contexto → Composições → Refinar → Carrinho).
- Guia: pode voltar etapas? estado preservado? loading states? botão Finalizar tem disabled state correto?
- LinhaPage / ProductPage: filtros, ordenação, "carregando", imagens ausentes, CTAs duplicados
- Conjuntos: fricção até adicionar
- Páginas institucionais (Sobre, PorQueWestern, FAQ, AgendarVisita, PedirAmostras): CTAs fim-de-página, links contextuais
- Formulários: máscaras (CNPJ, telefone, CEP), erros inline, autocomplete, mobile keyboard hints

### 🌊 Onda 4 — Microinterações, feedback, mobile & polish
Foco: estados de carregamento, vazios, erros, toasts, motion, responsividade, performance percebida.
- Estados vazios (carrinho, favoritos, orçamentos, pedidos, amostras) com CTA pra próxima ação
- Skeletons consistentes em listas
- Toasts duplicados / posição / linguagem
- WhatsApp FAB: posição em mobile com cart drawer / menu
- Touch targets ≥ 44px, espaçamento mobile, menu fechando ao navegar
- Foco visível em todos botões/links, aria-labels faltando
- TopBar: utilidade real, dismissível?

---

Vou começar pela **Onda 1** após sua aprovação e seguir sequencialmente. Em cada onda, primeiro mapeio os achados, depois aplico as correções, depois reporto.
