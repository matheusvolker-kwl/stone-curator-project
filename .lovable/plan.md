# Auditoria Mobile Completa — 4 Ondas

Vou rodar uma varredura sistemática do site inteiro em viewport mobile (375×812), capturando screenshots, testando interações reais (toques, scroll, formulários, drawers) e corrigindo problemas à medida que aparecerem. Para manter qualidade, divido em 4 ondas independentes — cada onda termina com um relatório do que foi encontrado e corrigido.

## Critérios de verificação (aplicados em todas as páginas)

- **Imagens**: carregam, proporção correta, não estouram, lazy loading ok, alt text
- **Textos**: sem overflow, sem truncamento indevido, hierarquia legível, line-height confortável
- **Botões/CTAs**: alvo de toque ≥44px, sem sobreposição, estados visíveis, navegam corretamente
- **Layout**: sem scroll horizontal, padding consistente, safe areas respeitadas
- **Funcionalidades**: drawers, modais, menus, formulários abrem/fecham/submetem
- **Performance visual**: sem CLS gritante, sem flashes, fontes carregam

---

## Onda 1 — Navegação global + Home + Catálogo

Páginas: `/`, `/linhas`, `/linhas/:handle`, `/produtos`, `/conjuntos`, `/produtos/:handle` (PDP)

Componentes globais: `Header`, `TopBar`, `Footer`, `WhatsAppFAB`, `BackToTop`, `CartDrawer`

Foco: menu mobile (drawer), busca, hero da home, grids de produto (`ProductCard` recém-ajustado), filtros de linha, galeria do PDP, `StickyBuyBar`, abas de produto, swatches.

## Onda 2 — Guia de Composição + Conta do Cliente

Páginas: `/guia-de-composicao`, `/composicoes`, `/refinar/:handle`

Conta: `/minha-conta`, `/perfil`, `/orcamentos`, `/pedidos`, `/sketches`, `/favoritos`, `/amostras`, `/preferencias`

Foco: fluxo do guia em mobile (chips de contexto, cards de composição, sidebar de projeto que vira bottom-sheet), tabela de orçamentos (scroll horizontal vs cards), formulário de perfil (grid 2 colunas vira 1).

## Onda 3 — Formulários + Autenticação + Amostras/Visita

Páginas: `/parceiro/cadastro`, `/parceiro/login`, `/parceiro/redefinir-senha`, `/pedir-amostras`, `/visitar`, `/contato`

Foco: campos com máscara (CNPJ, CEP, telefone), teclado mobile correto (inputmode), validação inline, botão de submit fixo/visível, scroll para erros, autofocus que não quebra layout.

## Onda 4 — Páginas institucionais + Legal + Carrinho/Checkout

Páginas: `/sobre`, `/por-que-western`, `/parceiros-arquitetos`, `/aplicacoes-comerciais`, `/faq`, `/politica-comercial`, `/politica-de-entrega`, `/trocas-e-avarias`, `/privacidade`

Carrinho: `CartDrawer` completo + `CalcFrete` + `QuoteRequestModal` + fluxo Yampi

Foco: prosa longa (largura de leitura), accordions do FAQ, modal de cotação, calc de frete, botão de checkout.

---

## Como vou trabalhar cada onda

```text
1. Abrir cada rota em viewport 375×812 (browser tool)
2. Screenshot + observe + scroll completo
3. Testar interações-chave (abrir drawer, submeter form, etc.)
4. Listar problemas encontrados
5. Aplicar correções (Tailwind/responsive classes, sem mudar lógica)
6. Re-screenshot para validar
7. Reportar resumo da onda
```

## Detalhes técnicos

- Uso só classes Tailwind responsivas (`sm:`, `md:`) e tokens do design system existente (`western-*`)
- Não altero lógica de negócio, queries Shopify, RLS, hooks de pricing — só presentation
- Não mexo em arquivos auto-gerados (`supabase/client.ts`, `types.ts`)
- Se encontrar bug funcional (não-visual), reporto separado e pergunto antes de corrigir
- Cada onda é uma execução separada — você pode pausar/redirecionar entre ondas

## Pergunta única antes de começar

Confirma que posso **começar pela Onda 1** já corrigindo o que encontrar (sem pedir aprovação a cada fix individual)? Ou prefere que eu faça só a varredura primeiro, liste tudo, e você aprova as correções em lote?
