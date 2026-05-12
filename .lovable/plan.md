Três frentes coordenadas: cart, espaçamentos PDP, e guia (Refinar). Mesma lógica da PDP — sans-serif legível para preços/CTAs, peso adequado nos botões, hierarquia clara.

## 1) Carrinho (CartDrawer)

**Problemas identificados nos screenshots:**
- "PRONTO PARA FECHAR PEDIDO" e "100%" muito pequenos/baixo contraste (cream-muted em verde escuro)
- Preços por linha em `text-spec` (sans 14px) sem destaque — o usuário não vê valor da peça
- Subtotal R$ 4.980,00 em font-display, mas o resto em mono — quebra de hierarquia
- "REMOVER ×" ausente; só X no canto, pouco evidente
- Link "Já é parceiro?" e meta-info (Produção 15 dias, +30 anos) em mono 10px ilegível no dark
- CTA principal usa `font-mono text-xs uppercase tracking-[0.25em]` — mesma fonte da PDP antiga que decidimos abandonar

**Ações em `src/components/layout/CartDrawer.tsx`:**
- Preço por linha: `text-spec` → `font-sans text-[15px] tabular-nums text-western-cream font-medium`
- Subtotal label: manter eyebrow; valor mantém `font-display text-2xl`
- Stepper: aumentar contraste da borda (`border-western-gold/30` → `border-western-cream/25`), número em `font-sans tabular-nums text-base`
- Meta-info (Produção 15 dias / +30 anos): trocar `font-mono text-[10px]` → `font-sans text-[12px] text-western-cream/85`
- CTA primário (Finalizar/Baixar PDF): mesma linguagem da PDP — `font-sans font-medium text-[15px] tracking-[0.02em]`, gradiente sutil e shadow tátil; remover `tracking-[0.25em]` mono
- CTA secundário (Baixar PDF): `font-sans text-[13px]`, manter borda gold
- "Já é parceiro?" link: `font-sans text-[12px]` em vez de mono uppercase
- "Continuar comprando" topo: manter mono mas elevar contraste para `text-western-cream/80`
- FreeShippingProgress: verificar contraste da barra de progresso (provavelmente ok)

## 2) Espaçamentos PDP (página inteira)

Padronizar todas as full-width sections em `py-14 md:py-20` (era `py-20 md:py-28` ≈ 112/176px → 56/80px). Mantém respiro mas elimina vazios.

**Arquivos:**
- `ProductInUse.tsx` (l.16): `py-20 md:py-28` → `py-14 md:py-20`
- `ProductComparison.tsx` (l.26): idem
- `WhyWesternStrip.tsx` (l.34): idem
- `RelatedProducts.tsx` (l.47): idem; e `mt-16` (l.106) → `mt-10`
- `ProductInProjects.tsx` (l.31): idem
- `SocialProofBand.tsx` (l.3): `py-16 md:py-20` → `py-12 md:py-14` (já é menor, só enxugar)

## 3) Guia (Refinar) — aplicar linguagem da PDP

**Princípio:** peças, preços e CTAs ganham fonte sans legível e peso; mono fica restrito a eyebrows/SKU.

**`src/components/guide-v2/PecaRow.tsx`:**
- Preço (l.37): `font-display text-[16px]` → `font-sans text-[17px] font-medium tabular-nums text-western-green-deep` (preço é dado funcional, não título)
- Stepper número (l.51): `font-display text-[17px]` → `font-sans font-medium text-[16px] tabular-nums`
- Stepper container: aumentar altura para `h-11` (de `h-10`), botões `w-11`
- "REMOVER" (l.78): `font-mono text-[10px]` → `font-sans text-[12px] text-western-stone-warm hover:text-destructive`
- Confirm "Remover?" (l.65): mesma trocade fonte para sans 12px

**`src/components/guide-v2/AutoralCard.tsx`:**
- Preço (l.76): `font-display text-[15px]` → `font-sans text-[15px] font-semibold tabular-nums`
- Título (l.69): `font-display text-[14px]` → `font-display text-[15px]` (display fica como título; já está)
- Botão flutuante "+": aumentar de `h-8` para `h-9 w-9`, e o badge selected também `h-9`
- Stepper interno (l.81-104): trocar `font-mono text-[9px]` → `font-sans text-[12px] tabular-nums`, e altura `h-9`

**`src/components/guide-v2/ProjetoSidebar.tsx`:**
- Total (l.130): `font-display text-[30px]` → manter font-display (é o "preço hero" do projeto), mas valores intermediários em sans
- Subtotais (l.107-124): `font-mono` nos valores → `font-sans tabular-nums text-[13px]`
- Lista de peças (l.71, 85): `text-[12.5px]` mantém; quantidade `font-mono` → `font-sans tabular-nums`
- CTA "Finalizar compra" e "Baixar composição (PDF)" (l.169, 179): trocar `font-mono text-xs uppercase tracking-[0.22em]` → `font-sans font-medium text-[14px] tracking-[0.02em]`, altura `h-12` mantida; CTA primário ganha gradiente/shadow como na PDP
- CTAs secundários (h-10): `font-sans text-[12.5px]`
- Mobile sticky bar (l.236-247): preço em `font-display text-lg` mantém; "Ver projeto (N)" em `font-sans font-medium text-[13px]` em vez de mono

**`src/pages/guia/Refinar.tsx`:**
- Botões "Voltar à composição original" / "Falar com consultor" (l.314, 322): trocar mono uppercase por `font-sans text-[13px]`, altura `h-11`
- Botão "Trocar acabamento desta composição" (l.388): mesma troca
- Tag chips (Tag): manter mono — são metadata pequena, ok

**Fora de escopo:** mudanças em `Composicoes.tsx`, `Contexto.tsx`, `AcabamentoCard.tsx`, `ComposicaoCard.tsx`, `TipoCard.tsx` (entram numa próxima rodada se quiser propagar o sistema). Lógica de cart/checkout/preços/auth intacta.