## Redesign editorial da seção "Família Botelho"

A diagramação atual é funcional, mas plana — 1 título + 3 parágrafos corridos ao lado de uma foto. Vou transformar em um **layout editorial com âncoras temporais**, hierarquia clara entre Ricardo e Luiz Carlos, e ritmo visual que respira a marca.

### Mudanças no `src/pages/About.tsx` (seção "Família Botelho", ~linhas 121-190)

#### 1. Cabeçalho deslocado para o topo, full-width
Em vez do título competir com a foto, ele vira **abertura editorial centralizada** acima do grid foto+texto:
- Eyebrow "A família Botelho" + filete dourado
- Headline grande ocupando ~80% da largura
- Respiro generoso antes do bloco foto+narrativa

#### 2. Grid foto + narrativa cronológica
Mantém 5/7, mas a coluna direita ganha **estrutura de timeline vertical** com 3 marcos:

```
1993 ──┐
       │  Origem — Luiz Duarte Botelho
       │  (parágrafo)
       │
1996 ──┤  
       │  Segunda geração — duas frentes
       │  (parágrafo + mini-cards Ricardo / Luiz Carlos)
       │
2026 ──┘  
          33 anos (parágrafo de fechamento, destacado)
```

- Cada ano vira **marcador visual**: número grande em `font-display` na cor `western-gold/70`, alinhado à esquerda do parágrafo, com filete vertical conectando os três anos.
- Espaçamento generoso entre marcos.

#### 3. Mini-cards lado a lado para Ricardo e Luiz Carlos
Dentro do parágrafo de 1996, em vez de descrever as duas frentes em texto corrido (que está longo e pesado), extrair para **dois cards minimalistas lado a lado** abaixo do parágrafo introdutório:

```
┌─────────────────────┐  ┌─────────────────────┐
│ RICARDO BOTELHO     │  │ LUIZ CARLOS BOTELHO │
│ Direção criativa    │  │ Engenharia          │
│                     │  │                     │
│ Desenho, escultura  │  │ Composto cimento +  │
│ e leitura estética  │  │ PET reciclado.      │
│ de cada peça.       │  │ Matriz: 40d → 1d.   │
└─────────────────────┘  └─────────────────────┘
```

Cada card: borda fina, eyebrow com nome em mono uppercase, papel/função em destaque, descrição curta. Hover sutil (borda dourada).

#### 4. Drop cap no primeiro parágrafo
O parágrafo de 1993 ganha **capitular** ("Em 1993...") em `font-display` grande, dourado-claro, com ~3 linhas de altura — sinaliza início de narrativa editorial.

#### 5. Parágrafo final destacado
O fechamento de 2026 ("33 anos de ateliê ininterrupto...") sai do fluxo de texto comum e vira **bloco com fundo `surface-cream` + filete dourado lateral**, tipografia ligeiramente maior, peso editorial — funciona como conclusão da história.

#### 6. Foto: refinos
- Manter o selo "Desde 1996" mas reposicionar como marcador editorial inferior (canto direito), em vez de sobreposto ao topo.
- Adicionar **sombra mais difusa** (não dramática) e remover o hover-scale, que agita demais num retrato familiar.
- Caption embaixo continua, mas com tipografia mais leve e maior largura.

#### 7. Ornamentação sutil
- Filete dourado decorativo vertical no lado esquerdo da seção (já existe — manter).
- Adicionar **número decorativo "1993—2026"** em `font-display` muito grande (text-9xl), opacidade 0.04, posicionado absoluto ao fundo da seção, sangrado parcialmente. Funciona como marca-d'água editorial.

### Resultado
- Mesma narrativa, mas com **hierarquia visual** que conta a história em camadas (escaneável + leitura profunda).
- As duas frentes Ricardo/Luiz Carlos ficam **claras visualmente**, não diluídas em texto corrido.
- Tom editorial alto-padrão, coerente com o resto do redesign do /sobre.
- Só CSS/markup — nenhum asset novo.
