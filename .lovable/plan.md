# Auditoria de UX do Guia — onde está bom, onde dá pra subir o nível

O esqueleto está sólido (wizard claro, cart parcial visível, etapas com skip inteligente). Mas faltam camadas de **desejo, ritmo e prova** que separam um formulário guiado de uma experiência que dá vontade de comprar. Abaixo o que eu mudaria, em ordem de impacto.

---

## 1. O resumo do orçamento precisa ser um "carrinho lateral vivo", não um rodapé

**Hoje:** o total parcial aparece pequeno no `GuideStepFooter`. O cliente adiciona peças e não vê o "projeto se formando".

**Proposta:** painel lateral fixo (desktop ≥1280px) à direita de cada step de montagem (5–9), mostrando:
- Miniaturas reais das peças adicionadas, empilhando com animação `slide-in-from-right` quando entram
- Linha de total que sobe com micro-animação de contagem (ex: `react-countup`)
- Indicador "frete otimizado · pedido único" quando há ≥2 itens
- Botão "Ver orçamento completo" sempre visível

No mobile, vira uma **barra inferior sticky** (~64px) com avatar empilhado dos últimos 3 itens + total + chevron que abre um sheet com o resumo.

Efeito: cada clique tem **feedback visual imediato fora do card** — a pessoa *vê o projeto crescer*.

## 2. Feedback de adição precisa ser muito mais satisfatório

**Hoje:** `toast.success` discreto no canto.

**Proposta:**
- Animação "fly to cart": miniatura da peça faz um arco curto até o painel lateral (200ms, easing suave). Biblioteca: `framer-motion` com `layoutId`.
- Pulso dourado no contador do painel quando o total muda
- No botão do card: micro-transição "Adicionar" → checkmark verde → "Adicionado" (sem trocar layout)
- Haptic `navigator.vibrate(10)` no mobile

## 3. Etapa 05 (StepBase) está pesada — falta storytelling visual

**Hoje:** galeria 1 foto grande + 3 miniaturas frias + lista "Indicado para".

**Proposta:**
- Hero único, full-width dentro do card, com **overlay editorial**: nome do conjunto em display grande sobre a imagem, eyebrow "Curadoria Western · Composição NN"
- Trocar grade de miniaturas por **carrossel horizontal** com snap (mais cinematográfico, mostra ambientação)
- "Indicado para" vira **chip-strip** colorida (`Lago 8m² · Marcante · Western+naturais`) em vez de bullets — confirma as escolhas com orgulho
- "Peças incluídas" como **lista numerada com ícone de pedra** + tooltip de dimensão ao passar o mouse

## 4. Acabamento merece prévia visual real

**Hoje:** `FinishSelector` troca um label de texto.

**Proposta:** ao trocar Quartzo→Arenito, a imagem hero faz **crossfade** para a foto correspondente do acabamento (mapping no metafield do produto, ou fallback para swatch sobreposto). Mesmo sem fotos por acabamento, mostre uma **swatch grande (96×96px)** com nome, descrição curta ("textura suave, tom areia"), e indicação de prazo se diferente.

## 5. Etapa 07 (Upgrade) não está convencendo

**Hoje:** card escuro bonito, mas o cliente não *vê* a diferença concreta.

**Proposta:** **comparativo lado a lado**:

```
┌─────────────────┬─────────────────┐
│   BASE          │   UPGRADE       │
│  [foto]         │  [foto +glow]   │
│  6 peças        │  10 peças  +4   │
│  R$ 8.400       │  R$ 13.200      │
│                 │  +R$ 4.800      │
│                 │  ✓ + cascata    │
│                 │  ✓ + pedras     │
│                 │  ✓ + iluminação │
└─────────────────┴─────────────────┘
```

Frase de prova social fixa abaixo: *"73% dos arquitetos que pediram lago marcante escolheram esta composição"* (mesmo que mockup inicial).

## 6. Microcopy precisa de **calor + autoridade**

Trocar:
- "Avançar sem complementos" → "Seguir só com o conjunto base"
- "Pular esta etapa" → "Não preciso disso agora"
- "Adicionar conjunto ao orçamento" → "Reservar este conjunto" (linguagem de exclusividade B2B)
- "Concluir sem itens autorais" → "Finalizar meu projeto"

E adicionar **assinatura humana** em cada etapa: pequena linha em itálico tipo *"Faisal recomenda combinar com 2–3 esferas para fechar a leitura."* Cria voz de curador.

## 7. Transições entre etapas — celebrar o progresso

**Hoje:** `animate-in fade-in duration-300` genérico.

**Proposta:**
- Ao avançar, o número da etapa atual no `GuideProgress` faz uma animação de "stamp" (escala 1 → 1.3 → 1) com flash dourado
- Trilha de ouro que se preenche entre os pontos com `transition: width 600ms ease-out`
- A cada 3 etapas concluídas, micro-momento: **"Composição 60% pronta · faltam 4 etapas"** com barra fina de progresso adicional

## 8. Step de protagonismo precisa de "consequência visual"

A crítica original sobre Discreto/Marcante/Cenográfico continua válida. Reforço:
- Ao **passar o mouse** sobre cada cartão, o exemplo visual do *próprio mood* (renderização ou foto) aparece como background do step inteiro com 15% de opacidade — a pessoa "experimenta" antes de clicar
- Adicionar bullet "Ideal para clientes que..." abaixo de cada opção (perfil de cliente final, não auto-rótulo)

## 9. Fechamento (Etapa 09) precisa ser um momento

**Hoje:** resumo + 3 botões empilhados.

**Proposta:**
- Headline maior: *"Pronto, [Nome]. Seu projeto está montado."* (capturar nome no SketchLeadModal e reusar)
- Animação de entrada: cada item do resumo aparece em sequência (stagger 80ms)
- Card de **economia consolidada**: "vs. equivalente em pedra natural: economia de R$ X.XXX e 40 dias"
- CTA primário **destacado em hero** (full-width, 60px de altura, texto grande): "Solicitar proposta com este orçamento"
- CTA secundário menor abaixo: download da prancha
- "Falar com consultor" como link discreto (não compete)
- Confete sutil de partículas douradas no momento de chegada (uma vez)

## 10. Pequenas fricções a remover

- **Persistência:** salvar `cartItems + answers + step` em `localStorage` com TTL 7 dias. Se o cliente sair e voltar, retomar exatamente onde estava com banner *"Continue seu projeto de Lago Marcante de 8m² · iniciado há 2 dias"*.
- **Loading dos produtos:** trocar `Loader2` spinner por **skeleton cards** com mesma forma dos cards reais (já temos shadcn skeleton).
- **GuideProgress no mobile:** hoje só mostra "Etapa X de Y". Adicionar **trilha horizontal scrollável** com snap nos pontos, igual ao desktop mas compacta.
- **Sticky CTA mobile:** botão "Avançar" do footer fica fixo no rodapé do viewport quando o usuário rola dentro do step (≥600px de conteúdo).
- **Atalhos de teclado:** ← → para voltar/avançar entre etapas, Enter para confirmar opção destacada.
- **Acessibilidade:** `aria-current="step"` no item ativo do progress, `aria-live="polite"` no painel de orçamento parcial.

---

## Detalhes técnicos

- **framer-motion** para fly-to-cart, stagger e stamp
- **react-countup** ou hook custom para animação de total (~1KB)
- **localStorage**: `useGuideStore` com `persist` middleware do Zustand (já temos zustand)
- Painel lateral: novo componente `GuideAssemblySummary.tsx` consumindo `useCartStore`
- Skeletons: `<Skeleton className="aspect-square" />` no lugar dos spinners
- Comparativo upgrade: refatorar `StepUpgrade.tsx` para grid 2 colunas com fetch do produto base + upgrade

---

## Sugestão de execução

Em vez de fazer tudo de uma vez, dividir em **3 ondas**:

**Onda A — Sensação de progresso (impacto alto, esforço médio):**
- Painel lateral de orçamento vivo (1)
- Fly-to-cart + feedback satisfatório (2)
- Persistência localStorage (10)
- Microcopy revisado (6)

**Onda B — Desejo visual (impacto alto, esforço alto):**
- Hero editorial em StepBase (3)
- Comparativo lado a lado no Upgrade (5)
- Prévia de acabamento (4)
- Fechamento como momento (9)

**Onda C — Polimento (impacto médio, esforço baixo):**
- Transições/stamp no progress (7)
- Hover-preview no protagonismo (8)
- Skeletons, atalhos, sticky CTA mobile (10)

Posso começar pela Onda A — é onde o cliente *sente* a diferença mais rápido. Quer que eu rode?