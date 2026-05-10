## Varredura de performance — 4 ondas

Vou rodar uma auditoria completa de velocidade e otimização. Achados iniciais:
- **21MB** de imagens locais; 12 arquivos acima de 500KB (vários PNG/JPG entre 1MB e 2.7MB)
- **Zero code-splitting**: todas as páginas no bundle inicial → JS pesado mesmo na home
- Sem `manualChunks` no Vite → vendor único e gigante
- Falta de `width/height`, `loading`, `fetchpriority` em várias imagens (causa CLS e atrasa LCP)

---

### 🌊 Onda 1 — Code-splitting de rotas + chunks de vendor
- `React.lazy` para todas as rotas em `App.tsx` (admin, conta, guia, páginas institucionais)
- `<Suspense>` com fallback elegante (não branco)
- `manualChunks` em `vite.config.ts`: separa react, supabase, radix, framer, react-query
- Resultado esperado: 1ª paint cai 40-60% no JS inicial

### 🌊 Onda 2 — Compressão de imagens (sem perder qualidade)
Converter os pesos altos para **WebP q=88** (visualmente lossless) mantendo resolução original. Substituir os imports por `.webp` e remover originais grandes só depois de validar.
Alvos prioritários:
- `cover-jardim-seco.png` 2.7MB
- `irmaos-botelho-gruta.webp` 2.6MB (já é webp, recomprimir)
- `ricardo-desenhando.png` 1.9MB
- `hero/ricardo-atelie.png` 1.8MB
- `pedra-grande-2-cascata.png` 1.4MB
- 4 jpgs em `about-projetos/` (0.8–1.2MB)
- `projetos/cover-piscina.jpg`, `cover-jardim-fonte.jpg`, `cover-lago.jpg`
Meta: redução de **70-85%** sem mudança perceptível.

### 🌊 Onda 3 — Hints de carregamento & LCP
- Adicionar `width`/`height` em imagens críticas (evita CLS)
- `loading="eager"` + `fetchpriority="high"` na hero da home
- `loading="lazy"` + `decoding="async"` em todo o resto (já existe em alguns lugares; padronizar)
- Preconnect/preload do CDN Shopify para a primeira imagem da home
- Verificar fontes: usar `font-display: swap`

### 🌊 Onda 4 — Higiene de bundle & cache
- React Query: já tem `staleTime` 5min, manter; adicionar `gcTime` razoável
- Remover imports pesados desnecessários (revisar barrels, lucide tree-shaking)
- Prefetch em hover dos cards de produto (`queryClient.prefetchQuery`)
- Confirmar que `index.html` não puxa scripts bloqueantes

---

Inicio pela Onda 1 (maior ganho com menor risco), depois Onda 2 (trabalho braçal de imagens), depois 3 e 4.
