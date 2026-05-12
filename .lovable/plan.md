## Diagnóstico

Cruzando os 10 screenshots com o código, identifiquei **9 problemas reais** em mobile (391px). A maior parte é overflow horizontal causado por linhas que não quebram dentro de containers estreitos.

---

## Onda 1 — PDP (crítico)

**1. `ProductPage.tsx` — bloco preço/blurb com clipping**
- "É uma peça decorativa de uso versátil, indicada pa[ra]…" cortada (img-152): o `<p>` do blurb tem `max-w-[48ch]` mas o `<div>` pai (`md:py-2`) não tem `min-w-0` num grid; combinado com a sticky gallery do lado esquerdo, o filho herda largura intrínseca e estoura. Adicionar `min-w-0` ao container de detalhes.

**2. `PurchaseProof.tsx` — micro-prova social cortada (img-153)**
- "Especificada por Faisal, Hayasaki e Luidi[…]" cortada à direita.
- Verificar e adicionar `flex-wrap` + `min-w-0` + remover qualquer `whitespace-nowrap` na linha.

**3. `DeliverySignals.tsx` — linha de garantia cortada (img-153)**
- "5 anos de garantia · troca sem custo em caso de avari[a]" cortada.
- Mesmo padrão: trocar `whitespace-nowrap`/`inline-flex` por layout que respeite quebra; permitir `wrap` em mobile.

**4. `ProductPage.tsx` — link "pintura personalizada" cortado (img-153)**
- `inline-flex items-center gap-1.5` num span único sem wrap; o texto "PINTURA PERSONALIZADA · FALAR COM CONSULTOR" não cabe.
- Trocar para `flex flex-wrap` ou quebrar o texto em duas linhas em < sm.

**5. `ProductGallery.tsx` — lightbox abre com imagem deslocada (img-151)**
- A imagem lightbox usa `max-w-[92vw]` dentro de um `<button>` com `overflow-auto` — em mobile a imagem aparece com offset (cortada à esquerda visualmente porque o `<` está sobreposto).
- Centralizar com `mx-auto` no botão e `block` na imagem; revisar z-index do prev/next para não cobrir conteúdo.

**6. PDP — barra de compra (stepper + CTA + wishlist) (img-153)**
- Verificar se o conjunto está estourando o `min-w-0` do filho do grid; somar larguras: stepper (~96px) + CTA `flex-1` + wishlist (56px). Em teoria cabe; mas se o pai não tem `min-w-0`, o `flex-1` não shrinka. Aplicar `min-w-0` no container de detalhes resolve junto com #1.

---

## Onda 2 — Catálogo

**7. `ProductCard.tsx` — preço cortado quando há desconto (img-150)**
- Linha do preço com `<span class="line-through mr-2">R$ 550,00</span> R$ 506,00` em `text-base font-semibold` não cabe num card de ~170px.
- Soluções (combinar): empilhar verticalmente (`flex flex-col`) o "de/por" no mobile, ou reduzir tamanho do strikethrough, ou usar `flex flex-wrap`.

---

## Onda 3 — Sistema cliente / Guia

**8. `PecaRow.tsx` — coluna do meio espremida no mobile (img-158)**
- Layout `flex items-start gap-5` com [imagem 96px] + [detalhes flex-1] + [stepper 132px col + Remover] não cabe em 391px → coluna de detalhes vira ~60px e "WEST-PM4-QUARTZO-35 KG" quebra letra-por-letra.
- Reorganizar mobile: empilhar (imagem + detalhes em cima; stepper + Remover embaixo, alinhados à direita). Em `md:` mantém o layout horizontal atual.

---

## Onda 4 — Investigação adicional (preview ao vivo)

**9. Verificar overflow horizontal global**
- Vários screenshots mostram a barra de scroll vertical do iframe + clipping à direita simultaneamente. Investigar no browser (391×844) com DevTools-like inspection (`document.documentElement.scrollWidth`) qual elemento força largura > 100vw. Suspeitos: `RelatedProducts` carousel `-mx-4`, `ProductInUse` carousel, `ScrollProgress`, ou alguma seção institucional com `min-w` fixo.
- Correção: depois de identificar, aplicar `overflow-x: hidden` na seção culpada em vez de depender só do `body`.

---

## Itens verificados que NÃO precisam fix

- Footer (img-149): wrap natural OK
- Comparativo (img-154): layout dentro do container, OK
- Related products (img-155): card "espiando" é o carrossel intencional
- Stats institucional (img-156): grid 2x2 normal
- Sobre/artistas (img-157): OK

---

## Ordem de execução

Vou implementar em uma única passada (todos são edições pontuais de classes/CSS, sem mudança de lógica de negócio):

1. Investigar overflow global no browser (Onda 4) — define se precisa fixes adicionais
2. Aplicar fixes da Onda 1 (PDP) — `ProductPage.tsx`, `PurchaseProof.tsx`, `DeliverySignals.tsx`, `ProductGallery.tsx`
3. Fix Onda 2 (`ProductCard.tsx` preço)
4. Fix Onda 3 (`PecaRow.tsx` reflow mobile)
5. Validar cada um no browser a 391×844

Posso prosseguir?
