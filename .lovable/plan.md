
# Pivot: Western como Showroom B2B Premium

## Sobre a dúvida do verde (resposta direta)

**Recomendação: inverter a hierarquia cromática.**

Hoje o verde profundo é "fundo padrão" do site — isso empurra a estética para "marca de luxo / restaurante", não para e-commerce. Lojas premium funcionais (Salvatori, Vasap, Kallina, B&B Italia, Minotti shop) usam **base clara neutra** justamente porque:

- Foto de produto sobre fundo claro lê melhor (e a pedra é o herói).
- Densidade de informação (preço, código, specs, filtros, badges) cansa em fundo escuro.
- Fundo escuro vira "wow inicial" mas vira ruído depois do 3º scroll — ruim para sessão longa de catálogo.

**Nova regra cromática:**
- **Off-white / ivory (#F5F1E8 e #FAFAF7)** = base de toda página de catálogo, PDP, filtros, cards. ~80% da superfície do site.
- **Verde profundo #0F2818** = chrome (topbar de benefícios, header, footer, hero overlay, drawer do carrinho, CTAs secundários sólidos). ~15%.
- **Bege #A78862** = CTAs primários, números, swatches, acentos, código de produto. ~5%.
- **Verde mid** desaparece quase por completo — vira só estado hover/borda.

O verde permanece como **assinatura da marca** (header sempre verde, footer verde, hero com overlay verde), mas o **corpo do site é claro**. É o mesmo movimento que Hermès faz: chrome escuro, conteúdo branco.

---

## Escopo da refatoração

### Fase 1 — Chrome global (fundação)

**1.1 TopBar de benefícios** (`src/components/layout/TopBar.tsx`, novo)
- Faixa fina (h-9), `bg-western-green-deep`, texto bege, ícones lucide line.
- 4 itens estáticos em desktop, carrossel auto em mobile.
- Itens: pedido mínimo R$ 2.000 · produção 15 dias · pagamento antecipado · 3D SketchUp.

**1.2 Header refatorado** (`src/components/layout/Header.tsx`)
- Sempre **fundo claro (ivory)** com logo verde, exceto na home onde fica transparente sobre o hero e vira sólido no scroll.
- Mega menu central: hover em "Linhas" abre painel full-width com 3 colunas (Estrutura / Composição / Especiais), cada link com mini-thumbnail e contador de produtos (puxado do Shopify via `fetchCollections`).
- **Search persistente** ao lado do menu (input com placeholder "Buscar pedra, código, acabamento…"), submit → `/linhas?q=`.
- Direita: Parceiro (User) · Wishlist (Heart) · Carrinho (ShoppingBag com badge).

**1.3 WhatsApp flutuante** (`src/components/layout/WhatsAppFAB.tsx`, novo)
- Botão fixo bottom-right, ícone WhatsApp, link `wa.me/5511993403485`, com microcópia "Falar com consultor" no hover.

**1.4 SiteLayout** — injetar TopBar acima do Header e FAB no final.

**1.5 Tokens CSS** (`src/index.css`)
- Trocar `--background` default de `green-deep` para `ivory`. Conseqüência: paginação inteira fica clara por padrão; só `surface-forest` explícito vira verde.
- Adicionar utilities: `.chip-finish` (4 swatches Quartzo/Arenito/Moledo/Granito), `.badge-code` (mono bege), `.btn-cta-primary` (bege sólido), `.btn-cta-secondary` (outline verde), `.card-product-b2b`.

### Fase 2 — Home transacional

**2.1 Hero reformulado** (`src/pages/Index.tsx`)
- Altura **70vh** (não 92).
- Mantém a foto da cascata, mas overlay verde só do lado esquerdo (gradiente lateral) para sustentar o bloco de texto.
- Conteúdo:
  - H1 sans/serif curto: "Pedras decorativas para projetos profissionais."
  - Sub: "200 SKUs · 50 modelos · 4 acabamentos minerais."
  - Dois CTAs: **Ver catálogo** (bege sólido) + **Seja parceiro** (outline cream).
  - Cápsula inferior: "Atendemos arquitetos · paisagistas · construtoras · garden centers."
- Remove: animação de drift, shimmer dourado, frase poética "A pedra contempla".

**2.2 Faixa "Destaques de Coleção"** (nova seção, `src/components/home/ColecoesGrid.tsx`)
- Fundo ivory.
- Grid responsivo das 11 coleções (3+4+4 desktop, scroll-snap horizontal mobile).
- Card: imagem 4:3 + nome serif + contador "10 modelos" + linha descritor + hover com CTA "Explorar coleção".

**2.3 "Mais especificados"** (nova seção, reaproveita ProductCard refatorado)
- Grid 4×2, fundo ivory, query `fetchProducts(8)`.
- Cards no novo padrão B2B (ver 2.5).

**2.4 Seções a manter (compactadas)**
- ArtistaSection (Ricardo) — manter, encolher para 1 viewport, virar "Por trás da curadoria" com link para /sobre.
- ProjetosSection — manter como prova social ("Projetos especificados com Western"), virar carrossel mais denso.
- RespiroSection cinematográfico — **remover da home**. Sobra muito espaço sem função comercial. Pode migrar para /sobre.
- Seção B2B (pedido mínimo / prazo / pagamento) — manter no fim, agora como **CTA de credenciamento** com formulário inline (nome, e-mail, CNPJ, "Solicitar acesso").

**2.5 ProductCard B2B** (`src/components/product/ProductCard.tsx`, refatorar)
- Fundo card claro (ivory/white), borda hairline em hover.
- Layout vertical: imagem `aspect-square` com `object-contain` e padding → nome **sans-serif** (não display) → linha de specs `text-spec` ("100×80×29 cm · 75 kg") puxada de metafields/variant title → 4 chips de acabamento (círculos coloridos pequenos com tooltip) → botão outline "Ver produto".
- **Sem preço visível**. Microcópia: "Acesse para ver condições".
- Código (CS, PG3) em mono bege no canto superior direito do card.

### Fase 3 — Catálogo (`src/pages/Linhas.tsx` + nova `LinhaPage`)

**3.1 Layout 2 colunas**
- Esquerda (`w-72`, sticky): card ivory com filtros.
  - Categoria (11 checkboxes, agrupados em 3 seções colapsáveis Estrutura/Composição/Especiais).
  - Acabamento (4 swatches clicáveis Quartzo/Arenito/Moledo/Granito).
  - Aplicação (Piscina, Lago, Jardim seco, Caminho, Parede, Fonte) — multi-checkbox.
  - Comprimento (Slider radix, 0–300 cm).
  - Peso (radio group: até 20kg / 20–50 / 50–100 / +100).
  - Sistema hidráulico (toggle).
  - Antiderrapante (toggle).
  - Botão "Limpar filtros".
- Direita: header com **ordenação** (Select: Mais especificados / A–Z / Maior / Menor / Mais recentes) + contador "Exibindo 24 de 50" + grid 3 col desktop / 2 mobile.
- Paginação ou "Carregar mais" (cursor do Shopify).

**3.2 Lógica**
- Estado dos filtros via URL (`useSearchParams`) para shareability.
- Mapeamento dos filtros → queryString do Shopify Storefront ou client-side filter (escolha pragmática: client-side em cima de `fetchProducts(50)` por linha; suficiente para 200 SKUs).

### Fase 4 — PDP (`src/pages/ProductPage.tsx`)

**4.1 Layout 60/40**
- Esquerda: galeria (imagem grande + 4 thumbs verticais à esquerda) + botão "Ver em 3D no SketchUp" abaixo.
- Direita comercial:
  - Código mono bege (`CÓD. CS`).
  - Nome serif grande.
  - Status: "Produção sob demanda · 15 dias úteis".
  - **FinishSelector** com 4 swatches grandes (refatorar componente já existente para visual de botão, não dropdown).
  - Quantidade (input numérico com +/-).
  - CTA primário grande "Adicionar ao orçamento" (logged → "Adicionar ao pedido").
  - CTA secundário outline "Falar com consultor" → WhatsApp com mensagem pré-preenchida (`Olá, gostaria de falar sobre {produto} código {sku}`).
  - Microcópia: pedido mínimo / pagamento antecipado / frete.

**4.2 Abaixo da dobra**
- Tabs (Radix Tabs já tem): Descrição · Ficha Técnica · Aplicações · Modelo 3D · Garantia.
- Conteúdo: HTML do `descriptionHtml` parseado por seções (`parseDescription.ts` já existe).
- "Combina com" — 4 produtos relacionados (mesma collection ou complementares hard-coded).

### Fase 5 — Carrinho B2B (`src/components/layout/CartDrawer.tsx`)

- Renomear título para "Seu orçamento".
- Para cada item: thumb + nome + código + acabamento + dimensão + qtd + subtotal **por item**.
- Manter a barra de progresso (já existe), trocar valor para R$ 2.000 e copy: "R$ X de R$ 2.000 — faltam R$ Y para fechar pedido".
- CTA final: **"Solicitar orçamento"** → abre WhatsApp com payload do carrinho serializado (lista de itens), em vez de redirect Shopify checkout. Manter o checkout Shopify como fallback secundário "Pagar online".

### Fase 6 — Áreas auxiliares

**6.1 Footer** (`src/components/layout/Footer.tsx`)
- 5 colunas: Coleções (11 links) · Para parceiros · Western · Atendimento · Newsletter (input + botão).
- Faixa final: CNPJ, endereço da fábrica, redes.

**6.2 Parceiro** (`/parceiro/login` e `/parceiro/cadastro`)
- Login: e-mail + senha + link "Solicitar acesso".
- Cadastro: nome, CNPJ, segmento (select), volume estimado, e-mail, telefone — armazenar via Lovable Cloud (Supabase) — **decisão de auth para depois**, neste plano só preparamos a UI.

---

## Arquivos afetados (resumo)

| Arquivo | Ação |
|---|---|
| `src/components/layout/TopBar.tsx` | criar |
| `src/components/layout/WhatsAppFAB.tsx` | criar |
| `src/components/layout/MegaMenu.tsx` | criar |
| `src/components/layout/Header.tsx` | refatorar (claro por padrão, mega menu, search) |
| `src/components/layout/SiteLayout.tsx` | injetar TopBar + FAB |
| `src/components/layout/Footer.tsx` | refatorar 5 colunas + newsletter |
| `src/components/layout/CartDrawer.tsx` | renomear copy, ajustar mínimo, CTA WhatsApp |
| `src/components/home/ColecoesGrid.tsx` | criar |
| `src/components/home/RespiroSection.tsx` | remover da home (manter arquivo p/ /sobre) |
| `src/components/product/ProductCard.tsx` | refatorar (B2B card, swatches, sem preço) |
| `src/components/product/FinishSelector.tsx` | refatorar p/ swatches grandes |
| `src/pages/Index.tsx` | hero novo + nova ordem de seções |
| `src/pages/Linhas.tsx` | layout 2 colunas + filtros + ordenação |
| `src/pages/LinhaPage.tsx` | mesmo padrão de Linhas |
| `src/pages/ProductPage.tsx` | layout 60/40 + tabs + relacionados |
| `src/pages/PartnerLogin.tsx` / `PartnerSignup.tsx` | reformatar UI |
| `src/index.css` | inverter `--background`, novos utilities |
| `tailwind.config.ts` | possíveis tokens novos (ivory exato pedido) |

---

## Execução em ondas

Pra não quebrar tudo de uma vez, sugiro implementar em 3 PRs lógicos dentro do build mode:

1. **Onda 1 — Fundação clara**: tokens CSS invertidos, TopBar, Header refatorado com mega menu + search, Footer 5 colunas, FAB WhatsApp. (Já transforma o "feel" do site.)
2. **Onda 2 — Home transacional**: hero novo, ColecoesGrid, ProductCard B2B, "Mais especificados", remover Respiro/encolher Artista.
3. **Onda 3 — Catálogo + PDP + Carrinho**: filtros laterais, PDP 60/40 com tabs, drawer "orçamento" com WhatsApp.

Posso fazer as 3 ondas de uma vez se preferir, mas separar dá ponto de checagem visual entre cada fase.

---

## Confirmações antes de implementar

1. **Verde como chrome, ivory como base** — confirmo a inversão proposta?
2. **Search no header** — busca client-side em cima do catálogo carregado, ou implementa busca real do Shopify Storefront (mais robusta, mas pede `fetchSearch`)?
3. **"Solicitar orçamento" via WhatsApp** vs manter checkout Shopify — qual prevalece como CTA primário do drawer?
4. **Onda única ou 3 PRs sequenciais?**
