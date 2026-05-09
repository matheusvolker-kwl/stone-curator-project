## Contexto

Na página **/sobre**, a seção "Repertório — Obras que assinamos nas últimas décadas" hoje usa as mesmas 4 capas dos projetos da home (que são, na prática, retratos de Neymar, Evandro, Tato, Thiago/Maíra). O efeito é estranho: parece um mural de celebridades, não uma vitrine de obras. Você enviou 6 fotos reais de projetos (cascatas, prainha, borda de pedra, lago detalhe) — vamos usá-las.

## O que vai mudar

**Apenas a seção "Repertório"** em `src/pages/About.tsx` (linhas ~306-365). Nada mais é tocado: hero, manifesto, citação, CTA final, parallax já corrigido — tudo fica como está.

## Nova proposta — "Mural Editorial de Obras"

Conceito: galeria editorial alta, em ritmo de revista de arquitetura. Mistura de aspectos verticais e horizontais, com **um hero-shot grande à esquerda** e **mosaico assimétrico à direita**. Caption discreta em font-mono dourada por foto (tipologia + local), aparecendo no hover em desktop e sempre visível no mobile.

### Layout (desktop ≥ md)

```text
┌─────────────────────────┬───────────────┐
│                         │   img 2 (4:5) │
│                         │   vertical    │
│   img 1 (4:5)           ├───────────────┤
│   HERO vertical grande  │   img 3 (1:1) │
│                         │   quadrada    │
│                         │               │
└─────────────────────────┴───────────────┘
┌──────────┬──────────────────────────────┐
│ img 4    │   img 5 (16:9)               │
│ (3:4)    │   panorâmica                 │
│          ├──────────────────────────────┤
│          │   img 6 (16:9) panorâmica    │
└──────────┴──────────────────────────────┘
```

Grid 12-col, gaps de 4–6px (quase tocando, ritmo editorial denso). No mobile vira coluna única respeitando a ordem.

### Tratamento visual

- Cada foto em `<figure>` com `overflow-hidden`, `transition-transform 1200ms` no hover (`scale-[1.04]`).
- **Caption inferior** com gradiente verde-deep → transparente, font-mono uppercase tracking-[0.22em] em `western-gold-soft` para a tipologia + linha em `western-cream` discreta para o local. Caption oculta em desktop, revelada no hover; sempre visível no mobile (legibilidade).
- **Eyebrow da seção**: mantém "Repertório" + título "Obras que assinamos nas últimas décadas." Acrescentamos um sub-parágrafo curto à direita do título (grid 2-col no header) explicando: residências, hospitalidade e paisagismo de alto padrão — equilibra o peso e dá densidade editorial.
- Reveal stagger por imagem (60–180ms), `fade-up` curto.
- Sem moldura, sem borda dourada — o ritmo do mosaico já dá a estrutura.

### Mapeamento das 6 imagens (rótulos)

1. `Cópia_de_DSC08268-HDR.jpg` → HERO vertical · "Cascata em Pedra Western · Residencial tropical"
2. `Cópia_de_externo-vertical07173_1.jpg` → vertical superior · "Cascata Mirante · Vista de serra"
3. `Cópia_de_DSC08258-HDR.jpg` → quadrada · "Piscina-Praia · Pedra sonora aplicada"
4. `Cópia_de_Fotos-3.jpg` → vertical · "Detalhe de matriz · Acabamento natural"
5. `Cópia_de_Fotos-23.jpg` → panorâmica · "Borda de pedra · Pool integrada"
6. `Cópia_de_Fotos-20.jpg` → panorâmica · "Cascata escalonada · Composição autoral"

(Rótulos são chumbados em array no componente; fácil de ajustar depois.)

## Implementação técnica

1. Copiar as 6 imagens para `src/assets/about-projetos/` mantendo extensão original (`.jpg`).
2. No `About.tsx`:
   - Adicionar 6 imports no topo.
   - Remover os 4 imports `projetoLago/Cascata/CasaPraia/Piscina` apenas se não forem usados em outra seção. **Atenção:** `projetoCascata` ainda é usado no CTA final (linha 448); ele permanece. Os outros 3 podem sair.
   - Substituir o `<div className="grid grid-cols-12 ...">` (linhas 318-363) pelo novo mural com 6 figures.
   - Ajustar o header da seção para grid 2-col com sub-parágrafo institucional curto à direita.
3. Sem mudanças em CSS global, tokens ou outros componentes.

## Fora de escopo

- Não mexer em hero, citação, manifesto, CTA, ou qualquer outra seção.
- Não alterar `ProjetosSection` da home (continua com retratos — é proposital lá, é prova social pessoal).
- Não tocar em design tokens, fontes ou cores.