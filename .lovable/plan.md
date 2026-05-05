## Revisão completa mobile-first

Após auditar Header, Index (home), ProductPage, CartDrawer, Footer e páginas de listagem (Linha, Coleção), encontrei um **bug crítico** e várias oportunidades de refino. Plano organizado por prioridade.

---

### 🔴 P0 — Bugs críticos

**1. Header sem menu mobile (bloqueador de navegação)**
A nav principal está `hidden md:flex` e não existe nenhum botão hamburger. No mobile o usuário só vê logo e carrinho — não consegue navegar para Linhas, Coleções, Guia, Sobre, B2B nem Parceiro.

Solução:
- Adicionar botão hamburger (ícone `Menu` da lucide) visível só em mobile (`md:hidden`).
- Abrir um `Sheet` lateral (left ou full-screen) com a navegação completa, links para Parceiro e contatos (WhatsApp/Instagram).
- Animação suave, fechar ao clicar em link, lock de scroll do body.
- Estado controlado local no Header.

---

### 🟠 P1 — Layout & densidade mobile

**2. Hero da Home (Index)**
- Título `text-5xl` (≈48px) em viewport de 390px fica apertado e quebra mal — reduzir para `text-4xl` no mobile, manter `md:text-7xl`.
- Padding `pt-16 pb-32` excessivo no mobile → `pt-10 pb-20 md:pt-16 md:pb-32`.
- `gap-8` entre CTA e link "Sobre a curadoria" → empilhar em coluna no mobile (`flex-col items-start gap-5 md:flex-row md:items-center md:gap-8`).
- Eyebrow "Pedras · Cascatas · Paisagismo" pode quebrar — `text-[10px]` no mobile.
- O brasão decorativo está `hidden md:flex` (ok), mas considerar mostrar versão menor abaixo do título no mobile para ancoragem visual.

**3. Seções `py-32` em todo lugar**
Todas as seções da home usam `py-32` (128px) também no mobile — gera scroll cansativo. Padronizar para `py-20 md:py-32`.

**4. Títulos de seção (h2)**
`text-4xl md:text-5xl` está bom, mas as quebras forçadas com `<br />` ("Quatro famílias de pedra,\<br/\>uma única exigência") quebram esquisito no mobile. Remover `<br />` no mobile (substituir por `<br className="hidden md:inline" />` ou reescrever sem br).

**5. Grids de Linhas / Coleções / Destaques**
- Cards usam `gap-x-8 gap-y-14` — no mobile o gap-y de 56px é excessivo entre cards full-width. Usar `gap-y-10 md:gap-y-14`.
- Aspect ratio dos cards de linhas (`aspect-[4/3]`) ok, mas títulos `text-2xl` + descrição podem ficar densos — adicionar `line-clamp-2` na descrição (já existe ✓).

**6. Família de acabamentos (4 cards verde)**
- Padding interno `p-8` → `p-6 md:p-8`.
- `mb-12` entre header do card e título é demais no mobile → `mb-8 md:mb-12`.
- Em telas pequenas, o swatch de 40px + numeração ficam descolados — ok mantém.

**7. Bloco B2B (3 colunas com border-left dourada)**
- No mobile vira coluna única; o `border-l` perde sentido — trocar para `border-t md:border-t-0 md:border-l` no mobile, ou manter border-l mas com mais respiro (`gap-10 md:gap-12`).
- Padding `pl-8` no mobile pode ficar deslocado — `pl-6 md:pl-8`.

---

### 🟡 P2 — ProductPage (refinos finais)

**8. Botão de quantidade + CTA**
Hoje: `flex items-stretch gap-3` com quantidade + botão. No mobile de 390px com padding do container, o botão "Adicionar ao pedido" comprime muito.
- Empilhar: quantidade em linha cheia acima do CTA no mobile (`flex-col gap-3 md:flex-row`), ou diminuir a largura do quantity stepper.
- Aumentar a área de toque dos botões `−` e `+` (hoje `px-4` sem altura definida) → `h-12 w-12` mínimo (Apple HIG: 44px).

**9. Sticky sidebar de imagens no mobile**
A galeria tem `md:sticky md:top-24` (correto, só desktop ✓). Verificar se no mobile a thumbnail row tem scroll horizontal funcional (já tem `overflow-x-auto`). Adicionar `scrollbar-hide` para limpeza.

**10. Lead com drop-cap**
Já ajustado para 2.8em mobile. Verificar quebra com títulos longos — adicionar `hyphens: auto` no `.product-lead` para evitar overflow horizontal em palavras longas tipo "paisagismo".

**11. Accordions — área de toque**
`AccordionTrigger` com `py-6` ok. O numeral roman + título empilham bem. Verificar se o ícone chevron à direita não fica escondido pela `pl-7 md:pl-11` — ok, é só no `AccordionContent`.

**12. SpecRow**
`flex justify-between` com label longa pode forçar wrap feio. Adicionar `text-right` no `dd` (já tem) e `min-w-0` no `dt` para permitir truncate gracioso.

**13. Preço + eyebrow "Condição parceiro"**
`flex items-baseline justify-between` — em mobile o preço de 3xl pode ser grande. Manter mas garantir que o eyebrow não quebre em duas linhas.

---

### 🟡 P2 — CartDrawer mobile

**14. Padding lateral**
`px-8` no header/body/footer em mobile (390px) deixa pouco espaço útil. Usar `px-5 md:px-8`.

**15. Item do carrinho**
- Layout `flex gap-4` com thumb 80x80 + conteúdo + controles → no mobile os 3 elementos competem. O título pode ser truncado.
- Sugestão: thumb `w-16 h-16 md:w-20 md:h-20`, e mover o botão remover (X) para o canto superior direito do item via `absolute`.

**16. CTA "Finalizar pedido"**
`h-12` ok. O `Sheet` no mobile já abre full-width (`w-full sm:max-w-lg`) ✓.

---

### 🟢 P3 — Footer

**17. Footer mobile**
- Grid `grid-cols-1 md:grid-cols-4` ✓ ok.
- A linha de selos `flex flex-wrap items-center gap-6` com 4 itens fica apertada — empilhar com `gap-4` e separadores visuais sutis (já não tem separador, ok).
- Padding `pt-20 pb-12` → `pt-14 pb-10 md:pt-20 md:pb-12`.

---

### 🟢 P3 — Acessibilidade & toque

**18. Tap targets**
Auditar todos os botões/links pequenos:
- Header carrinho: `h-5 w-5` ícone, área pequena. Adicionar `p-2` para 36px+ touch area.
- Quantity steppers no ProductPage e CartDrawer.
- Botão close do CartDrawer item.

**19. Eyebrows e mono text**
`text-xs tracking-[0.25em]` em mono pode ficar serrilhado no mobile. Reduzir tracking para `tracking-[0.2em]` em mobile via classe condicional ou aceitar como design decision.

**20. `container-western`**
Hoje `px-6 md:px-12 lg:px-20`. 24px no mobile é razoável; manter.

---

### Arquivos a editar

| Arquivo | Mudanças |
|---|---|
| `src/components/layout/Header.tsx` | Adicionar hamburger + Sheet mobile com nav |
| `src/pages/Index.tsx` | Hero, paddings, títulos, grids |
| `src/pages/ProductPage.tsx` | Quantity+CTA empilhamento, tap targets, hyphens |
| `src/components/layout/CartDrawer.tsx` | Paddings, item layout, tap targets |
| `src/components/layout/Footer.tsx` | Paddings, selos |
| `src/index.css` | `.product-lead { hyphens: auto }`, utilitário `.scrollbar-hide` |
| `src/pages/LinhaPage.tsx` / `ColecaoSazonalPage.tsx` | Padding seção `py-20 md:py-28`, hero title size |

---

### Detalhes técnicos do menu mobile

```text
Header (mobile)
┌─────────────────────────────────┐
│ ☰   [Logo]              🛒  (3) │
└─────────────────────────────────┘

Sheet aberto (left, ~85% width):
┌──────────────────────┐
│ ✕                    │
│                      │
│ LINHAS               │
│ COLEÇÕES             │
│ GUIA                 │
│ SOBRE                │
│ B2B                  │
│ ─────────            │
│ 👤 Área do parceiro  │
│ ─────────            │
│ WhatsApp             │
│ Instagram            │
└──────────────────────┘
```

- Componente `Sheet` do shadcn (já instalado).
- Trigger: ícone `Menu` (lucide), `aria-label="Abrir menu"`.
- Cor do trigger respeita `textColor` (verde em superfícies cream, creme em forest) — mesma lógica já aplicada ao carrinho.
- `NavLink` com underline animada ao toque.

---

### Fora de escopo (proponho como follow-up se aprovado)
- PWA / installable web app.
- Otimização de imagens (lazy + srcset responsivo).
- Páginas auxiliares: BuyingGuide, About, Contact, PartnerLogin/Signup — auditar em ciclo separado.

Aprove e implemento tudo de uma vez na ordem P0 → P1 → P2 → P3.