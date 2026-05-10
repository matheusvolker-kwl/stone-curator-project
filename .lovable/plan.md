# Varredura Completa do Sistema — Plano em 4 Ondas

Vou executar uma auditoria sistemática do projeto em ondas, reportando achados ao final de cada uma e corrigindo conforme prioridade. Não vou alterar código nesta etapa — primeiro mapeio tudo, depois corrijo com sua aprovação por bloco.

## Onda 1 — Backend, Segurança & Dados
- **Supabase linter**: rodar e listar warnings (RLS, search_path, índices, etc.)
- **Security scan**: verificar PII exposta, policies frouxas, bucket `orcamentos`
- **RLS audit manual**: revisar cada tabela (`leads`, `quote_pdfs`, `partner_profiles`, `wishlists`, `saved_carts`, `projects`, `guide_exports`) — confirmar que admin/usuário enxergam apenas o que devem
- **Edge functions**: revisar `save-quote-pdf` e `admin-bootstrap` (CORS, validação de input, tratamento de erro, JWT)
- **Migrations recentes**: validar consistência das últimas migrations de storage/quote_pdfs
- **Secrets**: confirmar que nenhum secret vaza pro client

## Onda 2 — Fluxos Críticos de Negócio
- **Carrinho Shopify**: addItem/addBundle/syncCart, race conditions, perda de `lineId`, recuperação de `cart not found`
- **Geração e download de PDF** (guia + carrinho, logado e não logado): validar fluxo end-to-end agora que mudamos para edge function
- **Conta do cliente** (`/minha-conta/orcamentos`, sketches, favoritos, amostras): listagem, signed URLs, download
- **Lead/orçamento**: validação de payload, `Public can submit leads` policy (regex de email/telefone), idempotência
- **Auth**: signup parceiro, login, `RequireAuth`, `approvedOnly`, reset senha, redirects
- **Guia de Composição** (`/guia/*`): contexto → composições → refinar → finalizar compra / baixar PDF / solicitar orçamento

## Onda 3 — Frontend, UX & Performance
- **Erros de runtime e console**: rodar app, capturar warnings React (keys, hooks condicionais, memory leaks)
- **TypeScript**: tipos `any`, casts perigosos, props opcionais sem fallback
- **Responsividade**: viewport mobile (402px) — header, drawers, modais, sidebar do guia, tabelas admin
- **Acessibilidade**: alts faltando, labels de form, contraste, focus rings
- **SEO**: title/meta/H1 por rota, canonical, JSON-LD
- **Imagens Shopify**: uso correto do CDN com tamanhos, lazy loading, fallbacks
- **Estados vazios e loading**: skeletons, empty states, mensagens de erro amigáveis

## Onda 4 — Admin, Relatórios & Polimento
- **Painel admin**: leads, quotes, partners, samples, settings, users — permissões e ações destrutivas
- **PartnerPricing/GatedPrice**: regras de exibição de preço por tier
- **Wishlist/Recently viewed**: sincronização logado vs anônimo
- **Dependências**: scan de vulnerabilidades npm
- **Build/typecheck**: erros pendentes
- **Code smells**: arquivos duplicados (`QuoteRequestModal` vs `QuoteLeadModal`, `propostaPdf` vs `orcamentoPdf`), código morto

## Entrega
Após cada onda, te mando um relatório estruturado:
- 🔴 **Crítico** (quebra funcionalidade ou risco de segurança) — corrijo na hora
- 🟡 **Importante** (inconsistência ou UX ruim) — corrijo se aprovar
- 🔵 **Sugestão** (melhoria ou refactor) — agrupo no fim

Começo pela Onda 1 assim que aprovar.