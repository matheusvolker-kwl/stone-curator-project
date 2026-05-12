# Ajustes de polimento — Logo, espaçamentos e Contato

## 1. Bug do logo da Cristal Pool

**Causa raiz:** o arquivo `src/assets/parceiros/cristal-pool-cream.png` está **vazio (0 bytes)**. Quando a `MarcasInstitucionais` é renderizada em variante `dark`, ela carrega esse PNG quebrado — daí o ícone de "imagem quebrada" ao lado do nome.

**Correção (em `src/components/shared/MarcasInstitucionais.tsx`):**
- Adicionar campo opcional `logoLightFiltro?: string` por marca para casos em que o PNG cream não exista.
- Para a Cristal Pool, remover a referência ao PNG vazio e usar o **SVG** original (`cristal-pool.svg`) aplicando um filtro CSS (`brightness(0) invert(1) opacity(.92)`) que o transforma em creme/branco quando renderizado sobre fundo escuro. Resultado: logo legível e coerente com os outros, sem precisar de novo asset.
- Os outros três (Biopet, Cobasi, Genesis) já têm PNG cream válido — não mexer.

## 2. Home (`src/pages/Index.tsx`) — reduzir margens excessivas

Densidade verticalmente menor, mantendo o mesmo desenho. Trocas:

- **"Mais especificados":** `py-16 md:py-24` → `py-12 md:py-16`; `mb-10 md:mb-12` → `mb-8 md:mb-10`.
- **Faixa institucional (Prova de procedência):** `py-20 md:py-28` → `py-14 md:py-18`; bloco interno `mb-12 md:mb-16` → `mb-8 md:mb-10`; divisor `pt-10 md:pt-12` → `pt-6 md:pt-8`; CTA final `mt-12` → `mt-8`.
- **B2B (Seja parceiro Western):** `py-16 md:py-24` → `py-12 md:py-16`.
- **`ArtistaSection.tsx`:** `pt-20 md:pt-28 pb-20 md:pb-28` → `pt-14 md:pt-18 pb-14 md:pb-18`; `mb-10 md:mb-14` → `mb-7 md:mb-10`; `mt-14 md:mt-20` → `mt-10 md:mt-14`; `mt-8 mb-10` → `mt-6 mb-8`; `mt-10` → `mt-8`.

## 3. Sobre (`src/pages/About.tsx`) — mesma faxina

- **HERO:** `min-h-[78vh]` → `min-h-[62vh]`; `py-24 md:py-32` → `py-16 md:py-20`; `mb-8` do divisor → `mb-6`; `mb-8` do h1 → `mb-6`.
- **Irmãos Botelho:** `py-20 md:py-24` → `py-14 md:py-18`; `mb-10 md:mb-14` → `mb-8 md:mb-10`; `mt-14 md:mt-20` → `mt-10 md:mt-14`; espaçamento `space-y-6` mantém.
- **Citação atmosférica:** `h-[55vh] min-h-[420px]` → `h-[44vh] min-h-[340px]`.
- **4 Pilares:** `py-20 md:py-24` → `py-14 md:py-18`; `mb-14` → `mb-10`; padding interno dos cards `p-8 md:p-12` → `p-7 md:p-10`.
- **Galeria/Repertório:** `py-20 md:py-24` → `py-14 md:py-18`; `mb-12 md:mb-16` → `mb-8 md:mb-12`.
- **Manifesto:** `py-20 md:py-24` → `py-14 md:py-18`; `mb-12` do display → `mb-8`; `mt-12` da legenda → `mt-8`.
- **Arquitetos + Marcas:** `py-20 md:py-24` → `py-14 md:py-18`. Dentro de `MarcasInstitucionais`, o `mt-20 md:mt-24` (não-compacta) reduz para `mt-14 md:mt-16`.
- **CTA final:** `min-h-[58vh]` → `min-h-[46vh]`; `py-20` → `py-16`; `mb-10` do parágrafo → `mb-8`.

## 4. Contato (`src/pages/Contact.tsx`)

Substituir o `<h1>` `Para falar<br />com a fábrica.` por `Fale com a Western.` (linha única, sem `<br />`).

## Detalhes técnicos

- Nenhuma mudança de tokens/CSS global — apenas classes Tailwind ajustadas e um filtro CSS pontual no logo da Cristal Pool.
- Nenhuma alteração em layout responsivo (todas as relações `md:` se mantêm proporcionais).
- O filtro CSS `brightness(0) invert(1)` é safe em todos os browsers modernos.
- Sem alterações em rotas, dados, ou componentes de produto.
