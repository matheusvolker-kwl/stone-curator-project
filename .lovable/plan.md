## Dois ajustes pontuais

### 1. Card "Tabela de preços" — eyebrows invisíveis

**Problema:** Os rótulos "Pedido mínimo", "Prazo", "Garantia" e "Frete" não aparecem na imagem porque a classe `.text-eyebrow` (definida em `src/index.css:178`) está hardcoded com `color: hsl(var(--western-green-deep) / 0.85)` — verde escuro sobre fundo verde escuro = invisível.

**Correção em `src/pages/Index.tsx` (linhas 286–298):**
- Trocar a classe `text-eyebrow` dos 4 cards por classes inline com cor adequada para fundo escuro: `font-mono text-[11px] uppercase tracking-[0.22em] text-western-gold/80 mb-3 font-medium`.
- Também corrigir o eyebrow do bloco esquerdo (linha 270 — "Seja parceiro Western") pelo mesmo motivo: trocar para versão dourada/cream.

Não alterar a classe global `.text-eyebrow` para não impactar uso em fundos claros.

### 2. Bloco de texto do Ricardo — aliviar peso visual

**Problema:** Sob a foto temos: citação grande em 2 linhas + nome + cargo + parágrafo descritivo de 4 linhas + CTA. Cinco blocos de texto empilhados, sensação de "muralha".

**Correção em `src/components/home/ArtistaSection.tsx` (linhas 36–68):**
- **Manter** a citação (é o herói da seção) — sem mudanças.
- **Manter** assinatura (Ricardo Botelho · Diretor criativo · 2ª geração).
- **Remover** o parágrafo descritivo (linhas 55–60) — informação repetitiva da legenda da foto e da própria página Sobre. O CTA "Conhecer o ateliê" já leva quem quiser saber mais.
- Reduzir espaçamentos: `mt-10 md:mt-14` da citação → `mt-8 md:mt-10`; `mt-6 mb-8` da assinatura → `mt-5 mb-6`; CTA `mt-8` → `mt-2` (já há margem da assinatura).
- Resultado: citação → assinatura → CTA. Três blocos respirando, mantém impacto editorial e tira a sensação de bloco carregado.

### Validação

Screenshot da home no viewport atual confirmando:
- Eyebrows do bloco B2B agora visíveis (dourados sobre verde).
- Seção do Ricardo mais leve, sem a parede de texto.

### Arquivos afetados

- `src/pages/Index.tsx` (eyebrows do bloco B2B)
- `src/components/home/ArtistaSection.tsx` (remoção do parágrafo + ajuste de espaçamentos)