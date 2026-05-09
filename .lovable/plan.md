## Contexto

A página `/sobre` hoje tem na seção "Família Botelho" um retrato vertical (4:5) dos irmãos Ricardo e Luiz Carlos em layout de duas colunas (foto à esquerda, texto à direita). A nova foto que você subiu é horizontal (~16:9), com os dois entre formações de pedra Western e uma cascata ao fundo — ou seja, ela une **retrato + produto + atmosfera de marca** numa imagem só. É uma imagem forte demais pra ficar espremida na coluna atual.

## Proposta

Reorganizar a seção dos irmãos em **dois momentos visuais complementares**, aproveitando as duas fotos com papéis diferentes:

```text
┌─────────────────────────────────────────────────────┐
│  NOVA SEÇÃO ABERTURA — full-bleed widescreen        │
│  [foto nova dos irmãos na gruta de pedra, 21:9]     │
│   ▸ caption flutuante: "Ricardo e Luiz Carlos       │
│     Botelho · 2ª geração · ateliê Cajamar/SP"       │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  SEÇÃO FAMÍLIA BOTELHO (existente, redesenhada)     │
│                                                     │
│  [retrato 4:5 atual]   |  Eyebrow + H2              │
│   menor, ~col-span-4   |  3 parágrafos da história  │
│                        |  (Ricardo / Luiz Carlos)   │
└─────────────────────────────────────────────────────┘
```

### O que muda

1. **Nova seção "Os irmãos Botelho"** logo após a faixa de números, antes da seção família atual:
   - Imagem widescreen full-bleed (ou `max-w-[1600px]` centralizada), aspect `21/9`
   - Overlay sutil em verde-deep só no canto inferior pra legibilidade
   - `figcaption` discreto: nome dos dois + "2ª geração · ateliê Cajamar/SP"
   - Uma linha de texto editorial curta acima ou abaixo, tipo: *"Ricardo no desenho, Luiz Carlos na engenharia. Trinta anos do mesmo ateliê, da mesma família."*

2. **Seção família Botelho atual** continua, mas o retrato vertical fica **menor e mais documental** (col-span-4 em vez de col-span-5), com o selo "Desde 1996" mantido — vira uma foto-documento de apoio, não mais o herói visual da seção. O texto ganha mais respiro.

3. **Citação do Ricardo** logo na sequência (já existe) — fluxo: rosto dos dois → história da família → voz do Ricardo. Funciona melhor narrativamente do que hoje.

### Por que melhora o UX

- A foto nova **vende a marca em um único frame**: pessoas + pedra + água. É a imagem mais "campanha" do site inteiro e merece destaque.
- Hoje a seção família abre com texto pesado de história; abrir com o widescreen dá um respiro emocional antes do bloco denso de leitura.
- Evita competição entre as duas fotos: cada uma ganha um papel claro (herói atmosférico vs. retrato documental).
- Reforça a tese da página ("33 anos, mesma família, mesmo ateliê") logo no topo, em imagem.

### Detalhes técnicos

- Copiar `user-uploads://image-56.png` para `src/assets/irmaos-botelho-gruta.webp` (manter .webp pra consistência com os outros assets; conversão na cópia).
- Importar como ES6 module em `src/pages/About.tsx`.
- Nova `<section>` com `surface-paper` ou `surface-ivory` (a definir conforme ritmo de cores), `py-20 md:py-24`.
- Wrapper `<figure>` com `max-w-[1600px] mx-auto`, `aspect-[21/9]`, sombra `shadow-western-green-deep/25`.
- `<figcaption>` posicionada `absolute bottom-6 left-6 md:bottom-10 md:left-10`, fundo `bg-western-green-deep/85 backdrop-blur-sm`, padding interno, tipografia `text-eyebrow` + nome em `font-display`.
- Ajustar grid da seção família existente: `md:col-span-4` para a foto, `md:col-span-8` para o texto.
- Sem mudança em business logic; somente apresentação.

### Fora do escopo

- Não mexer na home (`ArtistaSection`, `ProjetosSection`).
- Não trocar o retrato atual `ricardo-luiz-carlos.webp` — ele continua útil como foto-documento.
- Sem mudanças de copy além do `figcaption` e da legenda curta da nova seção.