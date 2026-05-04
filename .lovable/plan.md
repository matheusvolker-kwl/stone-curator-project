## Substituir Inter por Berlin como fonte sans do sistema

A Berlin (Light/Regular/Bold/ExtraBold) assume o papel da Inter em todo o site — corpo de texto, navegação, botões, formulários, UI. Cormorant Garamond permanece como `font-display` (títulos editoriais) e JetBrains Mono permanece como `font-mono` (eyebrows, specs, números técnicos).

### Antes de avançar — uma observação

Berlin é uma **sans display** com personalidade forte (geométrica, com peso visual nas bolds). Funciona muito bem em:
- Navegação, botões, labels, headings curtos
- Blocos de texto **médios** (descrições de produto, leads, cards)

Em **textos longos e densos** (parágrafos institucionais corridos, termos, guias longos como `BuyingGuide`), uma sans display tende a cansar mais que a Inter, que é otimizada para leitura em tela. Recomendo:
- Usar Berlin como `font-sans` global (substitui Inter integralmente, como você pediu)
- Manter Light (300) como peso default de corpo, Regular (400) para ênfase, Bold (700) para destaques, ExtraBold (800) reservada para wordmark/momentos institucionais
- Se em algum momento sentir cansaço de leitura em um bloco específico, aplicamos um override pontual

### Implementação

**1. Mover arquivos de fonte**
Copiar os 4 `.ttf` de `user-uploads://` para `src/assets/fonts/`:
- `Berlin-Light.ttf` → 300
- `Berlin-Regular.ttf` → 400
- `Berlin-Bold.ttf` → 700
- `Berlin-ExtraBold.ttf` → 800

**2. Declarar `@font-face` em `src/index.css`**
Quatro blocos `@font-face` no topo do arquivo (antes dos `@tailwind`), com `font-display: swap` e `url(...) format("truetype")` apontando para os assets importados.

**3. Atualizar `tailwind.config.ts`**
Trocar a família `sans`:
```
sans: ['Berlin', 'Inter', 'system-ui', 'sans-serif'],
```
(Inter como fallback caso a Berlin demore a carregar — depois podemos remover se preferir.)

**4. Limpar `index.html`**
Remover `Inter:wght@300;400;500;600` da URL do Google Fonts (mantendo Cormorant + JetBrains Mono). Isso elimina uma requisição externa e evita FOUT misturando Inter+Berlin.

**5. Ajustes finos de tipografia**
A Berlin tem métricas diferentes da Inter (geralmente mais alta e com tracking maior). Vou:
- Revisar `body` em `index.css` para ajustar `letter-spacing` se necessário (-0.005em costuma assentar bem em sans display para corpo)
- Verificar botões (`.btn-gold`, `.btn-outline-*`) — eles usam `font-mono`, não mudam
- Verificar `.text-eyebrow` e `.text-spec` — usam `font-mono`, não mudam
- Confirmar que headings (`.font-display`) continuam em Cormorant

**6. QA visual**
Abrir Home, ProductPage, BuyingGuide, Contact e CartDrawer no preview (390px e 1320px) para confirmar:
- Sem FOUT visível
- Pesos hierarquizados corretamente (Light em corpo, Regular em ênfase)
- Sem quebras de layout por mudança de altura de linha

### Arquivos que serão alterados

- `src/assets/fonts/Berlin-*.ttf` (novos, 4 arquivos)
- `src/index.css` (4 `@font-face` + ajuste fino de tracking no `body`)
- `tailwind.config.ts` (família `sans`)
- `index.html` (remover Inter do Google Fonts)

### Fora do escopo
- Não vou alterar `font-display` (Cormorant) nem `font-mono` (JetBrains)
- Não vou redesenhar componentes — apenas troca tipográfica
- Reservar Berlin ExtraBold para wordmark/usos institucionais futuros (não vou aplicar agora porque você pediu substituição da Inter, não rebranding)
