## PDF do orçamento com identidade visual Western

Atualmente o PDF usa apenas tipografia "WESTERN" digitada — sem nenhum elemento visual da marca. Vou incorporar o sistema de logos enviado para criar unidade com o site.

### Curadoria dos arquivos enviados

Dos 9 arquivos, vou usar 3 — escolhidos para máximo impacto, sem poluição:

1. **`LOGO_WESTERN-VBranco_horizontal-2.png`** → cabeçalho do PDF (faixa verde)  
   Logo horizontal em branco/creme: ocupa o lado esquerdo com altura confortável, conversa com a faixa verde escura.

2. **`ICONE-Pedra_Western_bege-3.png`** → marca d'água + rodapé  
   Apenas o cristal em bege/dourado: aparece como watermark sutil (opacidade ~6%) atrás da tabela e como ícone pequeno ao lado do endereço no rodapé.

3. **`WESTERN_VERDE-2.png`** → fallback (não usado no PDF, mas copiado para `src/assets/brand/` para futuras peças impressas claras como propostas comerciais).

Os outros (vertical branco vazio, verde horizontal, bege quadrado, etc.) ou são duplicatas dos já existentes em `src/assets/`, ou pretos sobre branco que não combinam com a faixa verde do PDF. Mantidos disponíveis para outros usos.

### Design do PDF redesenhado

```text
┌──────────────────────────────────────────────────────────┐
│  [LOGO HORIZONTAL BRANCO]              COMPOSIÇÃO Nº A4F2 │  ← faixa verde (130pt)
│                                        EMITIDO 10/05/2026 │
│  ─────────────── filete dourado ────────────────────────  │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ┃ CLIENTE                CONTATO                        │  ← card creme
│  ┃ Maria Andrade          maria@studio.com               │
│  ┃ Studio MA · SP         (11) 9 8765-4321               │
│                                                          │
│  COMPOSIÇÃO ─────────────────────────────────────────    │
│  ╔══════════════════════════════════════════════════╗    │
│  ║ Item            Acabamento     Qtd   Unit  Subt  ║    │
│  ║ ───────────────────────────────────────────────  ║    │
│  ║ Pedra Cascata   Verde Musgo     2    R$120  R$240║    │
│  ║         (cristal bege em watermark 6% atrás)    ║    │
│  ║ ...                                              ║    │
│  ╚══════════════════════════════════════════════════╝    │
│                                                          │
│                                  SUBTOTAL                │
│                                  R$ 1.480,00             │
│                                                          │
│  ─────────────────────────────────────────────────────   │
│  CONDIÇÕES                                               │
│  ·  Produção em 15 dias úteis...                         │
│                                                          │
├──────────────────────────────────────────────────────────┤
│ ◆ WESTERN · ATELIÊ        CONTATO                        │  ← faixa verde (60pt)
│   Rua... São Paulo        WhatsApp · email               │
└──────────────────────────────────────────────────────────┘
```

**Mudanças no `drawHeader`:**
- Remover o texto "WESTERN" digitado (charSpace 4) — substituído pela imagem `logo-horizontal-bege.png` carregada via `addImage` (~140×34pt à esquerda).
- Manter eyebrow "COMPOSIÇÃO DE ORÇAMENTO · Nº" e data, agora alinhados embaixo do logo.
- Tagline "PEDRAS DECORATIVAS AUTORAIS · DESDE 1993" mantida em dourado, fina.

**Watermark central (novo):**
- Cristal `icone-pedra-bege.png` em ~280×280pt, centralizado verticalmente atrás da tabela.
- Renderizado **antes** da tabela com opacidade reduzida via `GState({ opacity: 0.06 })`.
- Não interfere na leitura, dá personalidade editorial.

**Footer enriquecido:**
- Pequeno cristal `icone-pedra-bege.png` (~14×14pt) antes do "WESTERN · ATELIÊ".
- Tipografia mantida.

**Capa multi-página:**
- Função `drawHeader` e `drawFooter` extraídas e chamadas em cada nova página (já há `addPage` implícito do autoTable em listas longas — vou registrar o hook `didDrawPage` para repetir cabeçalho/rodapé/watermark).

### Detalhes técnicos

**Arquivos copiados** (de `user-uploads://` para `src/assets/brand/`):
- `logo-horizontal-bege.png` (do `LOGO_WESTERN-VBranco_horizontal-2.png`)
- `icone-pedra-bege.png` (do `ICONE-Pedra_Western_bege-3.png`)
- `logo-vertical-verde.png` (do `WESTERN_VERDE-2.png`) — guardado para uso futuro

**Carregamento das imagens:**
- Importar via `import logoBege from "@/assets/brand/logo-horizontal-bege.png"` (Vite serve como URL).
- Função utilitária `loadImageAsDataUrl(url): Promise<string>` que faz fetch + FileReader → data URL.
- `gerarOrcamentoPdf` torna-se `async` e aguarda 2 imagens (logo + ícone) antes de desenhar.
- `downloadOrcamentoPdf` e `orcamentoPdfBlob` viram `async` também.

**Ajustes nos consumidores:**
- `CartDrawer.tsx`: `onClick={async () => await downloadOrcamentoPdf(...)}` (já trata como Promise discardada — `void`).
- `src/lib/leads.ts`: já é async, troca `gerarOrcamentoPdf` por `await gerarOrcamentoPdf(...)` antes do upload.
- `AccountProjects.tsx` (botão de re-download local, se houver) — segue mesmo padrão.

**Opacidade no jsPDF:**
```ts
doc.saveGraphicsState();
doc.setGState(new doc.GState({ opacity: 0.06 }));
doc.addImage(crystalDataUrl, "PNG", x, y, w, h);
doc.restoreGraphicsState();
```

**Fallback de robustez:**
- Se `loadImageAsDataUrl` falhar (rede), volta ao texto "WESTERN" digitado — PDF nunca quebra.

**Sem alterações:**
- Estrutura de dados, cores, layout de tabela, totais, condições, geração do nº de orçamento.
- Backend, leads, storage bucket — apenas o conteúdo binário do PDF muda.

### Arquivos a editar
- `src/lib/pdf/orcamentoPdf.ts` — refatoração para incorporar logo + watermark + ícone do rodapé, função async.
- `src/components/layout/CartDrawer.tsx` — wrap do `onClick` com Promise.
- `src/lib/leads.ts` — `await` antes do upload do PDF.
- **Novos** em `src/assets/brand/`: 3 arquivos copiados dos uploads.

### Princípios
- Logo nunca distorce — proporção respeitada com altura fixa.
- Watermark nunca rouba a cena — abaixo de 8% de opacidade.
- Sem emojis, sem floreios — apenas o sistema visual existente da marca.
- PDF continua imprimível em P&B sem perder legibilidade (logos têm contraste suficiente sobre verde).
