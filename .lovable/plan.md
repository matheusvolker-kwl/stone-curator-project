# Redesign — Faixa "Prova de procedência" (Home)

## Por que quebra o design hoje

Na home (`src/pages/Index.tsx` linhas 167–193) a seção tem três problemas combinados:

1. **Bloco "ilha" creme** (`surface-paper`) entre `ProjetosSection` e `ArtistaSection` (que também é ivory) — não cria respiro, cria platô sem hierarquia.
2. **Frase com nomes sublinhados** parece link de blog, não citação editorial premium. O `underline decoration-western-gold/40` no meio de uma sentença display fica "wikipedia-like".
3. **Strip de logos em 4 quadros com bordas** (`MarcasInstitucionais compacta`) vira "logo wall" institucional — Cobasi gigante, Biopet minúsculo, divisores verticais marcando cada caixa. Destoa da elegância editorial do resto da PDP/Home.

## Direção proposta

Transformar em **interlúdio dark editorial** entre ProjetosSection e ArtistaSection — mesma família visual da nova `SocialProofBand` da PDP e da seção B2B logo abaixo, criando ritmo: dark (projetos) → **dark editorial (prova)** → ivory (artista).

```
═══════════════════════════════════════════════════════════════
                    PROVA DE PROCEDÊNCIA
                          ───────
                                                       
        Especificada pelos arquitetos que assinam
         os jardins mais publicados do país.
                                                       
   Marcelo Faisal   ·   Fabiano Hayasaki   ·   Ronaldo Luidi
                                                       
   ─────────────────────────────────────────────────────────
                                                       
   [biopet]      [cristal pool]      [genesis]      [cobasi]
                                                       
                  CONHECER A WESTERN →
═══════════════════════════════════════════════════════════════
```

### Especificações

**Container** (substitui `surface-paper border-t ... py-16 md:py-20`):
- `surface-forest py-20 md:py-28 border-y border-western-gold/15`
- Remove dependência de `MarcasInstitucionais` em variante light com bordas-caixa.

**Bloco editorial (topo, centralizado, max-w-3xl):**
- Eyebrow: `font-mono text-[10px] uppercase tracking-[0.28em] text-western-gold-soft/85` — "Prova de procedência"
- Mini divisor: `w-10 h-px bg-western-gold/50 mx-auto`
- Headline display em cream: `font-display text-2xl md:text-[2rem] text-western-cream leading-[1.2]` — frase reescrita sem o sublinhado embaraçoso:
  > "Especificada pelos arquitetos que assinam os jardins mais publicados do país."
- Linha de nomes (substitui o link sublinhado): `font-mono text-[11px] uppercase tracking-[0.28em] text-western-gold-soft/90` separados por `·` (clicável discretamente para `/parceiros-arquitetos`).

**Strip de logos (sem caixas):**
- Usar `MarcasInstitucionais compacta variante="dark"` (já existe), MAS:
  - Acrescentar prop `semBordas?: boolean` (ou variante `bare`) que omite os `border-y` / `border-l` da `<ul>` e `<li>`
  - Logos ficam livres num row com `gap-12 md:gap-16`, `h-20 md:h-24`, todos em creme, opacidade 70 → 100 no hover
- Calibração `larguraMax` mantida (já resolve Cobasi vs Biopet)

**CTA final:**
- "Conhecer a Western →" em `font-mono text-xs uppercase tracking-[0.22em] text-western-gold-soft hover:text-western-gold` com sublinhado animado — substitui o link verde-sobre-creme atual

### Transição visual (bônus, baixo custo)

Como `ArtistaSection` começa em `surface-ivory` com `border-t border-western-stone-warm/10`, ela já oferece o contraste perfeito após o dark editorial — não precisa mudar nada lá.

## Arquivos afetados

- `src/pages/Index.tsx` — reescrever JSX da seção (linhas 167–193). Sem mudanças de lógica/imports além de remover `Reveal` interno se redundante.
- `src/components/shared/MarcasInstitucionais.tsx` — adicionar prop `semBordas?: boolean` (default `false`, retrocompatível). Quando `true`: trocar `<ul className="grid grid-cols-2 md:grid-cols-4 border-y...">` por um `<ul className="flex flex-wrap items-center justify-center gap-12 md:gap-16">` e remover bordas dos `<li>`. Páginas existentes (`About`, `ParceirosArquitetos`) continuam idênticas.

Sem mudança de dados, rotas, lógica, ou outros componentes.
