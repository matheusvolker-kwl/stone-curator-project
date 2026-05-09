# Sprint 1 — Integridade comercial

Trabalho mecânico de unificação de constantes, correção de localização (Cajamar/SP), terminologia (Conjuntos), CNPJ, token via env e links do footer. Sem mudança de lógica de negócio — apenas fonte única de verdade e textos.

## Pré-requisitos (precisamos confirmar antes de começar)

Pergunto antes de implementar para evitar deixar `[CONFIRMAR: ...]` no código:

1. **Pedido mínimo** — confirmar R$ 2.000 (valor que aparece em 5 dos 6 lugares; o R$ 1.000 em `LinhaPage.tsx` parece bug)?
2. **Endereço completo do ateliê em Cajamar** (rua, número, bairro, CEP)?
3. **Horário de atendimento do ateliê**?
4. **WhatsApp** — manter `+55 11 99340-3485` (já no código) ou outro número?
5. **E-mail comercial e newsletter** — manter `comercial@westernpools.com.br` / `contato@westernpools.com.br`?
6. **CNPJ real** — informar para exibir, ou esconder a linha por enquanto?
7. **Desconto de conjuntos** — 3% confirmado?

Posso iniciar com placeholders sensatos e marcar `// TODO confirmar` se preferir não esperar — basta avisar.

## Etapas

### 1. Criar fonte única — `src/config/business.ts`
Constante `BUSINESS` com pedido mínimo, prazo, garantia, ateliê, contatos, formas de pagamento, acabamentos, link SketchUp Warehouse. Tipado `as const`.

### 2. Refatorar para usar `BUSINESS`
Substituir literais em:
- `src/components/layout/CartDrawer.tsx` (`MIN_ORDER = 2000`)
- `src/components/layout/TopBar.tsx` (texto "R$ 2.000")
- `src/components/guide/GuideResultado.tsx` (R$ 2.000 + "São Paulo" da retirada)
- `src/pages/LinhaPage.tsx` (R$ 1.000 → corrigir)
- `src/pages/Index.tsx` (duas ocorrências)
- `src/pages/ProductPage.tsx` (R$ 2.000 e referência São Paulo)

Validação: `grep -rn "R\$ 1.000\|R\$ 2.000" src` retorna vazio.

### 3. Localização Cajamar/SP
- `Footer.tsx`: trocar "Fábrica em São Paulo · Brasil" por endereço do ateliê em Cajamar.
- `Contact.tsx`: bloco "Fábrica" → Cajamar, SP + endereço + horário + "Retirada gratuita mediante agendamento".
- `ProductPage.tsx` e `GuideResultado.tsx`: "retirada gratuita em São Paulo" → "retirada gratuita em Cajamar/SP".
- Manter "fabricado em São Paulo" se aparecer em contexto institucional amplo.

### 4. Terminologia "Conjuntos"
- `Conjuntos.tsx`: H1 "Kits prontos para começar com confiança" → "Conjuntos para começar com confiança". Revisar copy do parágrafo.
- `grep -rin "\bkit" src` e julgar caso a caso, preservando "kit de amostras".

### 5. CNPJ
- `Footer.tsx`: substituir `00.000.000/0001-00` por `BUSINESS.cnpj` ou esconder a linha conforme decisão acima.

### 6. Token Shopify via env
- `src/lib/shopify/client.ts`: trocar token hardcoded por `import.meta.env.VITE_SHOPIFY_STOREFRONT_TOKEN` com guard.
- Criar `.env.example` com `VITE_SHOPIFY_STOREFRONT_TOKEN` e `VITE_SHOPIFY_DOMAIN`.
- Verificar `.gitignore` (provavelmente já cobre `.env`).
- **Risco**: o token publishable hoje funciona em qualquer browser; mover para env não muda postura de segurança real (continua público no bundle), só facilita rotação. Confirmar se quer mesmo migrar ou se prefere deixar como está e tratar no Sprint 5.

### 7. Footer — links de coleção e remoção de links falsos
- Mapear cada item de "Coleções" para `/linhas/{handle}` (cascatas, fontes, pedra-led, pedras-grandes, pedras-medias, pedras-pequenas, pedras-de-borda, revestimentos, pisadas, acessorios, fosseis-decorativos).
- Antes de hardcodar: validar handles reais via Shopify (preciso autenticar a conexão Shopify quando começarmos).
- Comentar no JSX com `// TODO Sprint 4` os links que hoje apontam falsamente para `/guia-de-compra` (Política comercial, Política de entrega, Trocas e avarias, FAQ, Guias técnicos).

### 8. Validação final
- `grep` checks listados nos critérios.
- Build/TS limpo.
- Smoke visual: `/`, `/conjuntos`, `/linhas/cascatas`, `/contato`, footer, abrir CartDrawer.

## Arquivos tocados

Novos: `src/config/business.ts`, `.env.example`
Editados: `CartDrawer.tsx`, `TopBar.tsx`, `Footer.tsx`, `Contact.tsx`, `Conjuntos.tsx`, `Index.tsx`, `ProductPage.tsx`, `LinhaPage.tsx`, `GuideResultado.tsx`, `lib/shopify/client.ts`, possivelmente `.gitignore`.

## Fora de escopo

Sprints 2–6 (prova social, leads, conteúdo institucional, SEO/perf, refino de carrinho).
