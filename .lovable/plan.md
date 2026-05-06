## Guia de Composição Western — Wizard B2B

Vamos reconstruir a página `/guia-de-compra` (rota mantida) substituindo a lógica de "Conjuntos curados" atual por um wizard linear baseado em decision tree única, conforme spec. O atual `BuyingGuide.tsx` e `data/conjuntos.ts` serão aposentados/substituídos.

### Arquitetura

```text
/guia-de-compra
├── GuideIntro          (tela inicial)
├── GuideWizard         (controlador de etapas)
│   ├── StepProjeto     (Etapa 1 — comum)
│   ├── StepTamanho     (Etapa 2 — depende do tipo)
│   ├── StepComposicao  (Lago: Western vs +naturais)
│   ├── StepJardim      (Jardim: seco vs com fonte)
│   └── StepNivel       (Etapa final — essencial/equilibrada/completa)
├── GuideResultado      (card do conjunto + indicado para + upsell)
└── GuideConsultor      (tela consultiva acima do limite)
```

### Estrutura de dados

Novo arquivo `src/data/guideMap.ts` contendo:
- `guideMap` (decision tree de 45 folhas + 3 caminhos `"consultor"`) exatamente como na spec.
- `PRODUCT_BASE_URL` derivado de `SHOPIFY_DOMAIN` (vem do shopify client já existente — vou reusar o domínio em vez de hardcode).
- `formatPreco(valor)` helper BRL.
- `WHATSAPP_NUMBER = "5511993403485"` + helpers `whatsappConsultor(tipo, faixa)` e `whatsappConjunto(nome)`.
- `upsellMap` (links de coleções/produtos por tipo de projeto).
- `tamanhoLabels` (ex.: `"4-a-10" → "De 4 m² a 10 m²"`) para reuso na UI e na mensagem do WhatsApp.

### Estado e fluxo

`useReducer` local dentro de `GuideWizard`:
```ts
type State = {
  step: number;
  tipo?: "lago" | "piscina" | "jardim";
  tamanho?: string;
  composicao?: "somenteWestern" | "comNaturais"; // só lago
  jardim?: "seco" | "comFonte";                  // só jardim
  nivel?: "essencial" | "equilibrada" | "completa";
};
```
- `BACK` decrementa step preservando respostas.
- `RESET` zera tudo e volta para `GuideIntro`.
- Total de etapas calculado por tipo (Lago: 4, Piscina: 3, Jardim: 4) → `Etapa X de Y`.
- Resolução final navega via `useMemo` em `guideMap[tipo][tamanho]?...?[nivel]`. Se for `"consultor"`, renderiza `GuideConsultor`.

### Telas

**GuideIntro**: título "Guia de Composição Western", subtítulo, texto de apoio, CTA `Iniciar guia →` (variante gold sobre fundo ivory). Logo Western (reusa `logo-vertical-verde`).

**Etapas (StepX)**: layout único reaproveitável `<StepShell number title onBack onReset>{children}</StepShell>` exibindo:
- Indicador `Etapa N de Total` (text-eyebrow gold).
- Pergunta em `font-display`.
- Grid de cards clicáveis grandes (sm:grid-cols-2/3/4 conforme nº de opções; mobile = 1 coluna).
- Card opcionalmente exibe descrição (níveis de composição).
- Botão "Voltar" discreto (a partir da Etapa 2) e "Reiniciar guia" no rodapé.
- Animação fade entre etapas (~250ms via `transition-opacity` + key no shell).

**GuideResultado**: 2 colunas desktop, 1 mobile.
- Coluna esquerda: imagem buscada via Storefront API (`fetchProductByHandle`) com fallback SVG (silhueta de pedra sobre verde profundo). Reuso/extensão de `src/lib/shopify/queries.ts`.
- Coluna direita:
  - Eyebrow bege "Seu conjunto recomendado".
  - Nome + subtítulo + preço "A partir de R$ X.XXX" (placeholder do guideMap; se a API trouxer preço real, sobrescreve).
  - Legenda "Disponível nos acabamentos Quartzo, Arenito, Moledo e Granito".
  - Bloco "Indicado para": bullets gerados dinamicamente a partir das respostas + tipo (regras simples por tipo).
  - CTAs: primário "Ver conjunto completo" (link `target="_blank"` para PDP no domínio Shopify), secundário "Falar com consultor" (WhatsApp pré-preenchido com nome do conjunto), terciário texto "Refazer guia".
  - Política B2B em texto pequeno no rodapé do card.

**GuideConsultor**: título, texto consultivo, CTA WhatsApp com `{TIPO}` e `{TAMANHO}` substituídos pelo label legível, botão secundário "Refazer guia".

**Upsell "Complete sua composição"**: abaixo do resultado, separado por divisória fina. Grid 3 colunas desktop / 1 mobile, cards com nome da categoria + miniatura placeholder + "Ver categoria" → abre coleção Shopify em nova aba. Lista de links varia por `tipo` conforme spec.

### Integração Shopify (fase 1 mínima)

- Buscar imagem do conjunto pelo handle via Storefront API existente (já temos `fetchProductsByHandles` em `queries.ts`). Loading state com skeleton; fallback SVG se 404 ou produto draft. Não bloqueia exibição do card (preço/nome vêm do `guideMap`).
- Link PDP usa `PRODUCT_BASE_URL` resolvido a partir do `SHOPIFY_DOMAIN` já configurado no projeto (sem hardcode).

### Limpeza / impactos colaterais

- `src/pages/BuyingGuide.tsx`: reescrito como entrypoint do wizard.
- `src/data/conjuntos.ts`: removido (deixa de ser referenciado).
- `src/pages/Conjuntos.tsx` e rota `/conjuntos`: hoje listam os "conjuntos curados" antigos. Vou (a) checar se são alcançáveis pela navegação atual; se sim, simplifico a página para um redirect/CTA "Use o Guia de Composição" mantendo a rota, ou removo a rota se não houver links no Header/Footer. Decisão final ao implementar, sem quebrar links existentes.
- Nenhuma mudança em Header/Footer/cart é necessária (o guia abre PDP no Shopify externamente; carrinho interno permanece como está).

### Estilo

- Reusa tokens existentes: `surface-ivory`, `text-eyebrow`, `font-display`, `btn-gold`, `btn-outline-forest`, `link-underline`, `text-western-green-deep`, `text-western-stone-warm`, `border-western-stone-warm/20`.
- Fundo da página: `surface-ivory` (alinhado à Onda 1).
- Cards de opção: borda `western-stone-warm/25`, hover `western-gold`, selecionado com fundo `western-gold/5`.
- Tom B2B/consultivo, sem termos lúdicos.
- Acessibilidade: `aria-label` nos cards, foco visível padrão, navegação por teclado nativa em `<button>`.

### Entregáveis

Arquivos novos:
- `src/data/guideMap.ts`
- `src/pages/BuyingGuide.tsx` (reescrito)
- `src/components/guide/StepShell.tsx`
- `src/components/guide/OptionCard.tsx`
- `src/components/guide/GuideResultado.tsx`
- `src/components/guide/GuideConsultor.tsx`
- `src/components/guide/UpsellGrid.tsx`

Arquivos removidos:
- `src/data/conjuntos.ts`

Arquivos possivelmente ajustados:
- `src/pages/Conjuntos.tsx` / rota em `App.tsx` (decisão no momento da implementação; sem quebrar nav).

Pronto para implementar assim que aprovar.
