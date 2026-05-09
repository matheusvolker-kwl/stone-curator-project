
# Redesenho do Guia de Compra Western Pools

Mantém a árvore de decisão atual (45 nós + caminho consultivo) intacta como lógica. Reescreve interface, captura e upsell. Migra os dados de `guideMap.ts` (hardcoded) para metafields no Shopify, para que a Western edite no admin sem deploy.

## Nova arquitetura — 5 etapas, ordem revisada

```text
1. Onde            (foto-mood, 4 cards: Lago • Piscina • Jardim • Outro)
2. Quanto espaço   (slider 1–60 m² com vista isométrica em tempo real)
3. Protagonismo    (comparativo visual de 3 fotos — substitui "estilo")
4. Composição      (só lago/jardim — comparativo lado-a-lado)
5. Recomendação    (conjunto + sketch download como lead-magnet + upsell em 3 camadas)
```

Mudança de ordem: hoje é Tipo → Tamanho → Composição/Jardim → Estilo. Passa a Tipo → Tamanho → **Protagonismo → Composição** → Resultado. Decisão estética antes da decisão técnica de mistura.

## Etapa 1 — "Onde" como mood

- Cards verticais com foto Western real cobrindo 80% da altura. Eyebrow + título embaixo.
- Indicador silencioso de magnitude por card: "Geralmente 4–12 peças · R$ 5–15 mil".
- **Quarto card "Outro / Projeto especial"** → formulário consultivo (fachada, balcão, hall, parede LED).

## Etapa 2 — Slider de área com renderização viva

- Slider horizontal 1–60 m² (range varia por tipo).
- Acima: SVG isométrico de retângulo proporcional + silhueta humana 1,75 m fixa para escala. Textura sutil (água/vegetação) por tipo.
- Em destaque: número exato em m² (display grande) + faixa de preço atualizada ao vivo (R$ 4.500–9.800).
- Snap magnético leve em 1 / 4 / 10 / 20 / 40 m². Input numérico paralelo (sincronizado).
- Se valor cair fora do range coberto pelos conjuntos → cai automaticamente no caminho consultivo (regra emergente, não hardcode).

## Etapa 3 — Protagonismo (sem rótulos abstratos)

- 3 imagens do **mesmo ambiente** com 3 níveis de presença Western, lado a lado. Cliente clica na imagem.
- Coluna do meio com borda dourada + badge "Mais escolhido".
- Linha de prova social nominal por tipo: "Eduardo Faisal especifica em 4 de 5 projetos" (lago), nomes equivalentes para piscina/jardim.
- Para piscina: cascata visível ou não na própria imagem (alinha expectativa).
- Fallback enquanto não há renders 3D: fotos de obras executadas; meta de produção 9 imagens (3×3) em SketchUp + V-Ray.

## Etapa 4 — Composição com comparativo

- Só aparece para Lago e Jardim (piscina pula).
- Lago: card "Só Western" vs "Western + naturais", cada um com foto + ficha (peças · preço · descrição honesta de complemento).
- Jardim: "Seco" vs "Com fonte", cada card mostrando o acréscimo de preço pela água.

## Etapa 5 — Resultado + lead-magnet + multi-CTA

Banner de download em destaque: **"Baixe o sketch deste conjunto em alta resolução (.skp + .pdf)"** com thumb da prancha isométrica.

Overlay de captura ao clicar:
- Nome
- E-mail (obrigatório)
- WhatsApp (obrigatório)
- Sou: arquiteto · paisagista · construtora · cliente final · outro (radio — segmenta lead)
- Empresa / CNPJ (opcional)
- Botão: **"Receber sketch + condição comercial"**

Backend: link assinado válido 7 dias. Enquanto não houver os 45 .skp, entrega só PNG/PDF do render isométrico no momento e promete .skp por e-mail em 48h (gancho para o consultor ligar).

CTAs no resultado, em hierarquia:
1. Adicionar conjunto ao orçamento
2. Baixar sketch (lead-magnet)
3. Falar com consultor (WhatsApp pré-preenchido com contexto)
4. Agendar visita ao ateliê
5. Refazer guia

## Upsell em 3 camadas (substitui UpsellGrid atual por tag)

- **Camada A — "Falta para terminar"**: complementos contextuais (Pedra LED, sonora, pisada). Cada item com 1 frase de justificativa.
- **Camada B — "Vale subir um nível?"**: aparece só para Essencial/Equilibrado. Mostra o conjunto imediatamente acima com diferença de preço explícita ("Por R$ 5.300 a mais…").
- **Camada C — "Itens da casa que combinam"**: acessórios autorais (Champanheira, Torneira, Sonora) em scroller editorial sem CTA agressivo.

Curadoria via metafields, não tag genérica.

## Migração de dados — Shopify metafields

`guideMap.ts` (45 nós hardcoded) é substituído por query GraphQL na coleção `conjuntos` lendo metafields no namespace `guide`:

```text
guide.tipo                  "lago" | "piscina" | "jardim"
guide.tamanho_min           number (m²)
guide.tamanho_max           number (m²)
guide.composicao            "somente_western" | "com_naturais" | "n_a"
guide.jardim_tipo           "seco" | "com_fonte" | "n_a"
guide.protagonismo          "pontual" | "composta" | "imersiva"
guide.pecas_count           number
guide.cascata_inclusa       boolean
guide.render_iso_url        file
guide.sketch_skp_url        file
guide.sketch_pdf_url        file
guide.upgrade_to            reference (handle)
guide.upsell_complementares list.references
guide.descricao_curta       text
```

Match por filtro dinâmico:
```ts
conjuntos.find(c =>
  c.tipo === answers.tipo &&
  answers.tamanhoEmM2 >= c.tamanho_min &&
  answers.tamanhoEmM2 <= c.tamanho_max &&
  (c.composicao === answers.composicao || c.composicao === "n_a") &&
  (c.jardim_tipo === answers.jardim || c.jardim_tipo === "n_a") &&
  c.protagonismo === answers.protagonismo
)
```

## Princípios de UX aplicados (resumo operacional)

- Mostre, não rotule (etapas 3 e 4 viram fotos comparativas).
- Esforço crescente: foto → slider → comparativo → comparativo → formulário (só ao final).
- Reciprocidade antes de pedir contato (sketch em troca de e-mail).
- Persistência em localStorage com TTL 72h + microcopy "Continuamos de onde você parou".
- Específico > genérico: "faltam R$ 380 — uma Pedra LED resolve" em vez de "faltam alguns reais".
- Âncora de preço comparativa: "Economia estimada de R$ 6.500 vs. pedra natural equivalente" abaixo do preço.
- Multi-CTA hierárquico no resultado (5 caminhos, não 3).
- Micro-loader 400ms entre etapas: "Calculando composição ideal…".
- Barra de progresso nomeada e clicável (já existe parcial — refinar).
- Mobile-first: slider tocável, comparativo empilha em coluna, fotos WebP com srcset 3 resoluções, <2s em 4G.
- Tempo-alvo total: 90s para usuário decidido.

## Roadmap por sprint

**Sprint 1 — Fundação Shopify (3–4 dias).** Refactor invisível: cria metafields, migra os 45 conjuntos do `guideMap.ts` para o admin do Shopify, troca a fonte de dados por GraphQL. Sem mudança de UI. Reduz bug surface antes de qualquer mudança visual.

**Sprint 2 — UI das etapas 1–3 (4–5 dias).** Cards "Onde" com foto-mood + 4ª opção. Slider de área com SVG isométrico ao vivo. Comparativo de composição (lago/jardim). Mantém etapa de "estilo" antiga para A/B test contra versão atual.

**Sprint 3 — Protagonismo + lead-magnet (3–4 dias).** Comparativo de 3 fotos substituindo "estilo". Banner de sketch + overlay de captura + envio de link assinado por e-mail. Sprint que mais mexe em conversão.

**Sprint 4 — Upsell + microcopy + persistência (3 dias).** UpsellGrid em 3 camadas. Frases de prova social nominal. Âncora de economia vs. pedra natural. Persistência localStorage. Micro-loader de pensamento.

## Detalhes técnicos

- Nova store `guideStore.ts` (Zustand) com persistência localStorage TTL 72h.
- `BuyingGuide.tsx` vira shell que orquestra steps; cada step em arquivo próprio (`StepOnde`, `StepArea`, `StepProtagonismo`, `StepComposicao`, `StepResultado`).
- `StepArea`: SVG inline com `viewBox` proporcional, animação via `transform: scale()`. Sem dependência 3D.
- `StepProtagonismo`: usa `render_iso_url` do conjunto candidato de cada nível (3 queries paralelas filtrando só por tipo+tamanho).
- Lead-magnet: edge function `request-sketch` (Lovable Cloud) — recebe formulário, persiste em `leads`, gera link assinado da URL do sketch (válido 7d via JWT-like token), dispara e-mail transacional pela infra Lovable Emails. Tabela `leads` com RLS (insert público, select restrito).
- Caminho consultivo emerge quando `find()` não retorna conjunto → componente `GuideConsultor` já existente, só passa contexto (tipo + m² digitado + protagonismo + segmento do lead).
- Fonte de "produtos complementares" e "upgrade_to": já vem por metafield, sem heurística por tag.
- `UpsellGrid` reescrito em 3 seções (`UpsellComplementos`, `UpsellUpgrade`, `UpsellMarca`).

## Não muda

- Decision tree conceitual (45 conjuntos + caminho consultivo).
- Carrinho local (`cartStore` + `addItem`).
- WhatsApp como canal consultivo.
- Páginas de produto e coleções.

## Riscos & validações antes de codar

- Confirmar que a coleção `conjuntos` no Shopify tem os 45 produtos certos (rodar `shopify--list_products` na fase Sprint 1).
- Validar com a Western quem assina cada frase de prova social (Faisal/Hayasaki/Luidi) por tipo de ambiente.
- Definir com a Western se o sketch entrega `.skp` real ou só `.pdf` na fase 1 (afeta o microcopy do banner).
- Lovable Emails precisa estar habilitado para o lead-magnet — habilitar no Sprint 3.

## Decisões abertas para você

1. **Sprint 1 (migração para metafields) vai junto agora ou prefere começar pela UI mantendo `guideMap.ts` por enquanto?** A migração é o investimento certo a longo prazo, mas atrasa o ganho visível em ~4 dias.
2. **Os renders 3D (3 níveis × 3 ambientes = 9 imagens)** ficam como dependência da Western ou começo com fotos de obras executadas e a gente troca depois?
3. **Lead-magnet no Sprint 3 entrega `.skp` real ou só `.pdf`/PNG do render** na primeira versão? Define o microcopy do banner.
