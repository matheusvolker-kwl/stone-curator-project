## O que vou ajustar

### 1. Logo Western maior e em proporção certa

**Onde:** `GuideHeader.tsx`
- Aumentar o logo de `h-7 md:h-8` para `h-10 md:h-12`
- Aumentar a altura do header de `h-16` para `h-20`
- Aumentar o tamanho do "Guia de Composição" de 18px para 20px e dar mais respiro nos separadores
- O logo é horizontal — vai ficar com presença real, não decorativa

### 2. Reforçar "voltar à composição original" no aviso de projeto autoral

**Onde:** `Refinar.tsx` — bloco "Projeto autoral · sob consulta"
- Logo abaixo do texto explicativo, dois CTAs lado a lado:
  - Botão primário (gold outline): **← Voltar à composição original** (chama `setPecas(baseInicial)`)
  - Botão secundário (link com seta): **Falar com consultor →** (abre WhatsApp via `whatsappConsultor()`)
- Mantém também o link discreto que já existe na sidebar — agora há reforço duplicado, próximo de onde a dor aparece

### 3. Onboarding mais claro + sticky sidebar funcionando

**Onde:** `Contexto.tsx` e `Refinar.tsx`

**Em `Contexto.tsx` (entrada do guia):**
- Embaixo do hero, um bloco de orientação editorial:
  - Eyebrow: "Como funciona"
  - 3 mini-cards numerados horizontais: "01 Conte sobre o ambiente · 02 Veja três caminhos · 03 Refine e baixe o SketchUp"
  - Abaixo, uma seta animada para baixo (chevron pulsante) com o texto "Comece pela primeira pergunta"
- Em cada uma das 3 perguntas (`01 Tipo de ambiente`, `02 Área aproximada`, `03 Acabamento`), adicionar uma linha de instrução curta abaixo do título, ex.: "Selecione o tipo que mais se aproxima do projeto.", "Digite a metragem aproximada (entre 1 e 200 m²).", "Escolha o tom dominante das pedras."
- Após o usuário escolher cada campo, mostrar um pequeno check verde com o valor selecionado, reforçando avanço

**Por que a sidebar não está sticky em Refinar:**
- O CSS está correto (`sticky top-28`), mas há um `overflow` num ancestral que quebra sticky. Vou auditar:
  - `min-h-screen surface-ivory relative` em Refinar — sem overflow, ok
  - Provavelmente o problema é o pai do grid ter `items-start` mas o filho da esquerda crescer mais que a viewport e o `top-28` ficar referenciado errado por causa da `ContextoChips` (que também é sticky, no topo)
  - **Correção:** ajustar `top-28` para `top-[var(--sticky-top)]` calculando header (80px) + ContextoChips (~52px) ≈ `top-36`. Confirmar removendo qualquer `overflow-hidden` herdado e garantindo que o grid pai não tenha `overflow` em nenhum nível
  - Alternativa: usar `position: sticky` com `align-self: start` explícito

### 4. Substituir produtos inventados por produtos REAIS do Shopify

Esse é o ponto principal. Mapeei sua loja: 95 produtos, todos com vendor "Western". Vou trocar tudo que é placeholder por dados reais.

**Catálogo Shopify identificado (relevante para o guia):**

*Conjuntos (já são os títulos certos, com 4 variantes de acabamento cada):*
- Piscina: Caiapó, Carcará, Maragogi (Essencial) · Itacaré, Moema, Paineira (Equilibrado) · Cambará, Guarairas, Paranoá (Completo)
- Lago: mesma lista + versões "Reduzido"
- Jardim: mesma lista, com e sem Fonte
- Total: 47 conjuntos

*Peças individuais reais:*
- **Pedra Grande 1–10** (10 SKUs)
- **Pedra Média 1–8** (8 SKUs)
- **Pedra Pequena 1–5** (5 SKUs)
- **Pedra de Borda 1–3** (3 SKUs)
- **Cascatas:** Sabino, Santa Bárbara, Santa Clara, Lajedo Boreal, Lajedo Yporanga
- **Fontes:** Sabino com Lago, Santa Rita, Mini Lago, Mini Sabino

*Itens autorais reais (NÃO são "Pisada Estrela/Diamante" inventados):*
- **Pedra LED, Pedra Sonora, Pedra Torneira, Pedra Champanheira** (Acessório)
- **Pisada Pedra Pequena, Pisada Pedra Média, Pisada Pedra Grande, Pisada Dormente, Pisada Eucalipto** (Pisada)
- **Fóssil Coelphisys, Fóssil Seymouria** (Fóssil Decorativo)
- **Painel Bruto Amalfi, Mykonos, Santorini · Placa Rústica Riviera** (Revestimento)

**Como vou trocar:**

a) **`autoraisCatalog.ts`** — apaga o catálogo inventado. Cria função `getAutoraisFor(tipo)` que retorna handles reais por tipo:
   - Piscina: pedra-led, pedra-sonora, pedra-champanheira, pedra-torneira, pisada-pedra-grande, pisada-pedra-media, pisada-dormente
   - Lago: pedra-led, pedra-sonora, pedra-torneira, fossil-coelphisys, fossil-seymouria, pedra-champanheira, pisada-pedra-grande, pisada-pedra-media
   - Jardim com Fonte: pedra-torneira, pedra-led, pedra-sonora, pisada-pedra-pequena, pisada-pedra-media, pisada-eucalipto, pisada-dormente
   - Jardim Seco: fossil-coelphisys, fossil-seymouria, pisada-eucalipto, pisada-dormente, pisada-pedra-pequena, painel-bruto-amalfi
   - Os dados (nome, preço, foto, peso, dim, descrição) vêm de `fetchProductsByHandles()` do Shopify em runtime — fim do "produto inventado"

b) **`pecasPlaceholder.ts`** — vira `pecasBase.ts`. Cada `Conjunto` do `guideMap.ts` tem um handle de Shopify. Em runtime, uso `fetchProduct(conjuntoHandle)` para puxar a descrição (que já lista a composição base no `body_html`) e construo a lista de peças com handles reais (Pedra Grande 5, Pedra Média 2, Pedra Pequena 1 etc.). 
   - Passo 1 (essa entrega): faço o mapeamento `nivel → [handles reais]` à mão a partir dos POOLs da loja, usando produtos verdadeiros (Pedra Grande 5, Pedra Média 2 etc.) e busco fotos/preços via Shopify.
   - Passo 2 (futuro): podemos parsear a tabela de composição direto do `body_html` do conjunto.

c) **Imagens de produto:**
   - `AutoralCard.tsx`: trocar `stoneCrops[index]` (foto random) pela `images[0].url` real do produto (com `cdnImg(..., 600)`)
   - `AutoralProductModal.tsx`: idem — mostrar a galeria real
   - `PecaRow.tsx`: adicionar miniatura da pedra real ao lado do nome

d) **Hook novo `useGuideProducts.ts`:** centraliza fetch dos handles necessários, com cache (`react-query`-like via `useEffect` + memo). Retorna `{ pecas, autorais, isLoading }`. `Refinar.tsx` consome.

e) **Estado de loading editorial:** enquanto Shopify carrega, mostrar skeletons das peças/autorais (placeholder shimmer cream) — sem números falsos.

### 5. Limpeza

- Remover `imagery.ts → stoneCrops` (não usar mais fotos genéricas em cards de produto)
- Manter `tipoImage` (essas são para o seletor de ambiente, ok)
- Apagar `pecasPlaceholder.ts` ou renomear

---

## Arquivos afetados

**Editados:**
- `src/components/guide-v2/GuideHeader.tsx` (logo maior)
- `src/pages/guia/Contexto.tsx` (bloco "como funciona", microcopy, seta)
- `src/pages/guia/Refinar.tsx` (CTAs no aviso autoral, sticky fix, integração com Shopify)
- `src/components/guide-v2/AutoralCard.tsx` (foto real + dados Shopify)
- `src/components/guide-v2/AutoralProductModal.tsx` (galeria real)
- `src/components/guide-v2/PecaRow.tsx` (miniatura real)
- `src/components/guide-v2/autoraisCatalog.ts` (handles reais)
- `src/components/guide-v2/ProjetoSidebar.tsx` (verificar overflow)

**Criados:**
- `src/components/guide-v2/useGuideProducts.ts` (hook de fetch Shopify)
- `src/components/guide-v2/pecasBase.ts` (mapeamento nível → handles reais)

**Removido:**
- `src/components/guide-v2/pecasPlaceholder.ts`
- `stoneCrops` de `imagery.ts`

Sem mudanças em DB, autenticação ou rotas.