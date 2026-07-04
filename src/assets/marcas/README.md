# Logos de marcas — prova social

Resolvidos automaticamente por slug pelo componente `SocialProof`
(`src/components/shared/SocialProof.tsx`) via `import.meta.glob`.

## Convenção
`src/assets/marcas/{slug}.(svg|png|webp)` — **SVG preferido**; PNG/WebP com
**fundo transparente**. Altura visual normalizada para ~40px; um tratamento
monocromático uniforme é aplicado via CSS (tint claro no fundo escuro, ink no
claro), então logos de origens diferentes ficam coesos.

## Fallback
Se não houver arquivo para um slug, o componente renderiza um **WORDMARK**
(o nome da marca tipografado no padrão do site, mesmo tamanho/tint) — o mural
permanece coeso misturando logos reais e wordmarks. **Nunca invente um logo:**
sem arquivo → wordmark.

## Slugs atuais
- cobasi — logo ✓
- cristal-pool — logo ✓
- genesis-ecossistemas — logo ✓
- biopet-lagos — logo ✓
- unique-garden — (wordmark; falta arquivo)
- hotel-rosewood — (wordmark; falta arquivo)
- all-resort-porto-belo — (wordmark; falta arquivo)
- mandaia-arquitetura — (wordmark; falta arquivo)
