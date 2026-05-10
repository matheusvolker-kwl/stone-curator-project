
## 1. Refinar o bloco de compra (PDP)

Hoje o bloco usa `bg-western-cream/50` + borda dourada à esquerda + padding generoso, o que dá esse efeito "tijolo dourado colado". Vamos trocar a hierarquia: nada de fundo colorido, nada de borda lateral. A peça vira um bloco estrutural, separado por linhas finas, com o **acabamento subindo para o topo** porque é a decisão obrigatória.

**Nova ordem dentro do bloco (sem caixa):**
1. **Acabamento** (primeiro) — com etiqueta "Etapa 1 · obrigatório" em mono e a tag de "+ vendido" no Moledo já existente. O `FinishSelector` continua igual.
2. Linha divisória fina (`border-western-stone-warm/15`).
3. **Preço** (ou `PriceGate`) à esquerda + **stepper** à direita, alinhados na mesma baseline. Sem o eyebrow "Condição parceiro" gritado — vira um pequeno selo discreto ao lado do preço.
4. **DeliverySignals** em linha única (3 itens compactos).
5. **CTA "Adicionar ao pedido"** full-width, dourado (mantém), mas:
   - Quando `acabamento` ainda não escolhido → botão fica neutro (`bg-western-stone-warm/20 text-western-stone-warm`), label muda para **"Selecione o acabamento"** e um anel sutil no `FinishSelector` pulsa uma vez para guiar o olho.
   - Quando outras opções faltam → mantém dourado mas label "Selecione [opção]".
   - Quando tudo ok → "Adicionar ao pedido" dourado normal.
6. Gatilho "Adicionado por N estúdios..." e link "Falar com consultor" em uma linha sutil abaixo do CTA, em mono pequeno.

**O que sai:** o `div` com `border-l-2 border-western-gold bg-western-cream/50` — vira um `<section>` simples com `space-y-6 mt-8` e divisores horizontais entre os subgrupos. Visualmente: papel sobre papel, sem o efeito de "card flutuante".

**Como o "obrigatório" fica claro:**
- Label do acabamento muda de "Acabamento" para `Acabamento · obrigatório` (mono, com `· obrigatório` em `text-western-gold`).
- Acima do `FinishSelector`, um micro-hint: *"Cada peça é produzida sob demanda no acabamento escolhido."*
- Sem seleção: o stepper fica desabilitado visualmente (opacity 60) e o CTA muda como descrito.
- Já existe a pré-seleção do Moledo no `useEffect`, mas vamos **remover essa pré-seleção** — força o cliente a escolher conscientemente (era o feedback implícito do brief).

## 2. Nova seção "Aplicado em obra" por produto

Hoje existe `ProductInProjects.tsx`, que mostra os 4 projetos hero com cover. Isso é "projetos completos", não "esta peça aplicada". Vamos criar uma seção separada e específica:

**Componente novo:** `src/components/product/ProductInUse.tsx`
- Recebe `images: { src; caption?; credit? }[]` e título do produto.
- Layout: hero editorial — 1 imagem grande à esquerda (aspect 4/5 ou 3/4) + grid 2x2 de imagens menores à direita no desktop. Mobile: carrossel horizontal com snap.
- Eyebrow: "Esta peça em obra" · H2: "{produto} aplicado em projetos reais".
- Sem overlay pesado; legenda discreta abaixo de cada foto (ex: "Cascata integrada · Rio de Janeiro").
- Fundo `bg-western-paper`, sem cards — fotos respiram direto no papel.
- Posição na PDP: **logo após a galeria/bloco de compra**, antes de `ProductInProjects` (que vira "projetos do estúdio relacionados", complementar).

**Mapa de imagens por produto:** `src/data/productInUse.ts`
```ts
export const PRODUCT_IN_USE: Record<string, ProductInUseImage[]> = {
  "pedra-grande-2": [
    { src: pedraGrande2Cascata, caption: "Cascata integrada", credit: "Rio de Janeiro" },
  ],
  // outros produtos serão adicionados conforme você organizar as fotos
};
```
Componente só renderiza se houver entrada para o handle. Quando vazio, some — sem fallback genérico (queremos curadoria real).

**Para `pedra-grande-2`:** copio a foto enviada (`user-uploads://image-74.png`) para `src/assets/produtos-aplicados/pedra-grande-2-cascata.webp` (mantendo o nome semântico) e crio a primeira entrada.

## 3. Detalhes técnicos

- **Arquivos novos:**
  - `src/components/product/ProductInUse.tsx`
  - `src/data/productInUse.ts`
  - `src/assets/produtos-aplicados/pedra-grande-2-cascata.png` (copiada do upload)
- **Arquivos editados:**
  - `src/pages/ProductPage.tsx` — remove pré-seleção do Moledo, reordena o bloco de compra (acabamento topo, sem caixa dourada), adiciona `<ProductInUse />` após o grid principal.
  - Sem mudanças em `StickyBuyBar`, `PriceGate`, `FinishSelector`, `DeliverySignals` — eles ficam como estão.
- Sem alteração de dados/backend/rotas.

## 4. O que NÃO faço agora

- Não troco a paleta global (gold continua sendo o acento da marca).
- Não removo `ProductInProjects` — ele é complementar e mostra "projetos famosos do portfolio", contexto diferente.
- Não preencho `productInUse` para outros produtos — fica preparado para você ir adicionando conforme separa as fotos.
