# Fotos de famosos — prova social

Convenção EXATA usada por `src/components/shared/SocialProof.tsx`:

- Nome do arquivo: `{slug}.webp` (preferido) — também aceita `.jpg`, `.jpeg`, `.png`.
- `{slug}` deve bater com o campo `slug` de `src/data/socialProof.ts`
  (ex.: `neymar-jr.webp`, `caito-maia.webp`, `tato-falamansa.webp`).
- Enquadramento: retrato quadrado (1:1), rosto centralizado.
- Resolução: ~400×400 px.
- Peso: < 80 KB (webp recomendado).
- Sem foto disponível? Não precisa fazer nada — o componente renderiza um
  monograma circular com as iniciais como fallback automático.

Como o componente encontra as fotos:
`import.meta.glob("../../assets/famosos/*.{webp,jpg,jpeg,png}", { eager: true, query: "?url", import: "default" })`

Formato alternativo (asset externalizado no CDN): também aceita
`{slug}.webp.asset.json` (pointer gerado por `lovable-assets create`).
