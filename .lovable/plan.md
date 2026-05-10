## Visão geral

Cinco frentes de trabalho, todas no `/guia-de-composicao`. Sem alterações de banco — só frontend, presets de dados e um novo componente de modal.

---

## 1 · Hero com Ricardo + header da marca

**Hero (Etapa 01):**
- Substituir o `guideHeroStrip` atual por uma capa cinematográfica usando `user-uploads://7dfdc5f6...png` (Ricardo desenhando no ateliê).
- Altura: 380px desktop / 280px mobile (era 220px).
- Tratamento da imagem: foto à direita ocupando ~60% da largura; à esquerda, bloco editorial sobre `surface-ivory` sólida (sem gradiente sobre a foto). Divisão por linha vertical hairline gold em vez de degradê.
- Eyebrow "GUIA DE COMPOSIÇÃO · ETAPA 01" + H1 "Conte sobre o projeto que você está atendendo." + caption pequeno "Ricardo Western, fundador, no ateliê de Cajamar."
- **Remover o degradê ivory que cobre a foto** (o usuário não gosta de degradê). Usar ou foto limpa, ou máscara com edge sólida.

**Header (`GuideHeader.tsx`):**
- Trocar o texto "Western Pools" pelo logo SVG/PNG verde (`user-uploads://WESTERN_VERDE_HORIZONTAL-3.png`) — copiar para `src/assets/logos/western-verde.png`.
- À direita do logo, separador hairline gold vertical + título "Guia de Composição" em `font-display` italic, tamanho médio, verde profundo. Visual: `[LOGO] | Guia de Composição`.
- Manter "Sair do guia" e breadcrumbs no canto direito.
- Remover o degradê inferior do header — substituir por linha sólida hairline `western-gold/30`.

---

## 2 · Reduzir para 4 tipos de ambiente

**Novos tipos:** `piscina`, `lago`, `jardim-fonte`, `jardim-seco`. Eliminar `lago-reduzido` como card separado.

**Mudanças em `types.ts`:**
- Remover `lago-reduzido` do `TipoVisual`.
- "Lago" passa a englobar tanto somenteWestern quanto comNaturais — a escolha entre versão completa e econômica vira uma decisão posterior (na Etapa 02 "Composições", já temos os 3 níveis: Essencial / Equilibrado / Completo, que cobrem essa gradação naturalmente).

**Mudanças em `Contexto.tsx`:**
- Grid passa de 5 cards (com 1 wide) para 4 cards iguais em md:grid-cols-4.
- Remover prop `variant="wide"` e o microcopy "Versão econômica".

**Mudanças em `autoraisCatalog.ts`:**
- Mesclar filtros `lago` + `lago-reduzido` em `lago` único.

**Em `Refinar.tsx` e `useGuideQuery.ts`:**
- Tipo recebido na URL agora só aceita 4 valores; `lago-reduzido` redireciona para `lago` se vier no querystring (compatibilidade).

---

## 3 · Refinos de acabamento

**Cor do Granito:** mudar `acabamentoMeta.granito.chip` de `#2D332E` (preto-esverdeado) para `#5A5D5C` (cinza pedra).

**Tag "+ VENDIDO" do Moledo (`AcabamentoCard.tsx`):**
- Hoje é uma tag escura quadrada cortando o card. Substituir por:
  - Pequena fita gold (`western-gold`) escapando do canto superior direito do card, com texto "+ VENDIDO" em `font-mono text-[9px]` cream, padding apertado, sombra sutil.
  - Ou alternativa: badge circular gold com `◆` no canto, e o texto "+ vendido" em italic abaixo do label "Moledo" dentro do card.
- Vou seguir com a fita gold escapando — mais editorial e menos comercial.

---

## 4 · Sidebar de projeto sticky à direita

A sidebar já está à direita no grid (`lg:grid-cols-[1fr_400px]`) e já é sticky (`sticky top-32`). O que falta:
- Garantir que o `top-32` compense o header (64px) + ContextoChips (44px) + folga.
- Aumentar a largura para 420px e dar respiro: `lg:grid-cols-[1fr_420px] gap-16`.
- Confirmar que ela acompanha o scroll até o final do conteúdo principal sem ficar "presa" antes.
- O usuário confirmou estar satisfeito com o visual da sidebar (verde escuro com gold) — manter o tratamento atual, só ajustar comportamento sticky.

---

## 5 · Catálogo de acessórios + modal de produto

**Catálogo expandido (`autoraisCatalog.ts`):**
Para todos os 4 tipos, oferecer SEMPRE: Pedra LED, Pedra Sonora, todas as Pisadas (Pequena, Média, Grande, Diamante, Estrela), Pedra Torneira, e os Fósseis (Crustáceo, Sambaqui).

```
piscina:      [pl, ps, pt, ppp, ppm, ppg, pd, pe, fc, fs]
lago:         [pl, ps, pt, ppp, ppm, ppg, pd, pe, fc, fs]
jardim-fonte: [pl, ps, pt, ppp, ppm, ppg, pd, pe, fc, fs]
jardim-seco:  [pl, ps, pt, ppp, ppm, ppg, pd, pe, fc, fs]
```

A Champanheira e o Painel Bruto saem do filtro padrão (continuam no catálogo, mas fora do guia). O usuário não os mencionou.

**Modal de produto (novo `AutoralProductModal.tsx`):**
- Acionado ao clicar em qualquer `AutoralCard`. Ainda há um botão menor "Adicionar" inline que pula o modal.
- Conteúdo: foto grande (crop de pedra real do catálogo `stoneCrops`), nome em font-display, código mono, peso, dimensão estimada, descrição editorial curta (2-3 linhas), preço B2B (gateado por `useAuth.isApproved`).
- CTA primário "Adicionar ao projeto" (gold) + secundário "Fechar".
- Usa `<Dialog>` do shadcn com overlay escuro `western-stone-dark/60` e card centralizado, max-width 560px, fundo `western-cream`, borda hairline gold no topo.
- Mesmo modal pode servir para PecaRow no futuro; por ora só autorais.

**Comportamento dos cards:**
- Clique no corpo do card → abre modal.
- Clique no botão "Adicionar/Remover" inline → toggle direto sem modal (atalho experiente).

---

## 6 · Personalização vs SketchUp — modo "Sob Consulta"

**Decisão:** o cliente pode personalizar tudo, mas se mexer na composição base, o entregável muda.

**Detecção de personalização:**
- Em `Refinar.tsx`, comparar `pecas` atual com `getPecasPlaceholder(nivel)` (snapshot inicial).
- Estado `isCustomizado = pecasAlteradas || extrasAdicionadosOuRemovidosAlemDoOferecido`. Apenas alterações na BASE (não em extras autorais) ativam o modo. Adicionar extras é sempre permitido sem virar "sob consulta".
- Critério final: `isCustomizado = baseAlterada` (qty diferente do placeholder ou peça removida da base).

**UI no estado "Curado" (padrão):**
- Sidebar: botão primário "Revisar e finalizar" + secundário "Baixar prévia em SketchUp".
- Badge gold pequeno no topo da sidebar: "◆ Conjunto curado · SketchUp incluso".

**UI no estado "Sob consulta" (personalizado):**
- Quando o cliente edita a primeira peça da base, aparece um aviso editorial discreto acima da lista de peças:
  > *"Você está ajustando a composição original. O SketchUp é entregue apenas para os conjuntos curados — projetos personalizados seguem para nossa equipe e voltam com prévia em 48h."*
- Botão "Baixar prévia em SketchUp" desaparece.
- Botão primário muda de "Revisar e finalizar" para "Solicitar orçamento sob consulta" (mesmo CTA, redireciona para `/guia-de-composicao/finalizar?modo=consulta`).
- Mini-link "Voltar à composição original" que reseta para o placeholder.
- Badge no topo da sidebar troca para: `◆ Projeto autoral · sob consulta`.

**Em `Finalizar.tsx`:**
- Ler `?modo=consulta` e ajustar o copy: "Pronto para enviar para nossa equipe" vs "Pronto para enviar a proposta".

---

## 7 · Polimento extra de identidade visual

- Adicionar `icone-pedra-bege.png` e `icone-pedra-verde.png` (uploads `ICONE-Pedra_Western_*`) como assets oficiais em `src/assets/icons/`.
- Substituir o `iconePedra` atualmente importado no `GuideHeader` pelo arquivo definitivo verde.
- Usar o ícone bege como bullet decorativo nos eyebrows numerados (substituindo o atual `|` no `.eyebrow-bar` por um SVG mini do ícone, ou mantendo o filete + ícone após o número).
- Watermark do brasão: já está OK, manter opacity 0.04.

---

## Arquivos afetados

**Editados:**
- `src/components/guide-v2/types.ts` — remover `lago-reduzido`, ajustar cor granito.
- `src/components/guide-v2/autoraisCatalog.ts` — novo filtro unificado.
- `src/components/guide-v2/imagery.ts` — atualizar mapa após remoção do lago-reduzido.
- `src/components/guide-v2/GuideHeader.tsx` — logo Western + título "Guia de Composição".
- `src/components/guide-v2/AcabamentoCard.tsx` — fita gold "+ VENDIDO".
- `src/components/guide-v2/AutoralCard.tsx` — clique abre modal.
- `src/components/guide-v2/ProjetoSidebar.tsx` — badge curado/consulta + botões dinâmicos + sticky offset.
- `src/components/guide-v2/ContextoChips.tsx` — ajustar para 4 tipos.
- `src/components/guide-v2/useGuideQuery.ts` — fallback `lago-reduzido` → `lago`.
- `src/pages/guia/Contexto.tsx` — novo hero com Ricardo, grid 4 cards.
- `src/pages/guia/Refinar.tsx` — detecção de personalização, modo sob consulta.
- `src/pages/guia/Finalizar.tsx` — variantes de copy.

**Criados:**
- `src/components/guide-v2/AutoralProductModal.tsx`
- `src/assets/logos/western-verde.png` (cópia do upload)
- `src/assets/hero/ricardo-ateliê.png` (cópia do upload)
- `src/assets/icons/icone-pedra-verde.png` e `icone-pedra-bege.png`

**Sem mudanças de banco, sem mudanças em rotas.**
