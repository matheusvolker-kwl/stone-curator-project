## Hero full-bleed — refatorar a seção superior da home

Substituir o hero atual de duas colunas (texto + brasão) por uma única fotografia full-bleed (borda a borda) com texto contemplativo ancorado no canto inferior esquerdo. Tratamento alinhado a Hermès, Aesop, Marcio Kogan: a imagem fala, a tipografia respira.

### Asset

- Copiar `user-uploads://Fotos-72.JPG` → `src/assets/hero-cascata.jpg` e importar como módulo ES6.
- `loading="eager"` + `fetchPriority="high"` (é LCP da home).
- `object-cover object-center` para garantir foco na cascata em qualquer viewport.

### Anatomia da nova seção (em `src/pages/Index.tsx`)

```
┌────────────────────────────────────────────────┐
│                                                │
│        [ FOTO FULL-BLEED — cascata ]          │
│                                                │
│   ░░░░ gradiente verde da base p/ topo ░░░░   │
│                                                │
│  PEDRAS · CASCATAS · PAISAGISMO   (eyebrow)   │
│  ─                                             │
│  A pedra contempla                             │
│  antes de ser colocada.                        │
│                                                │
│  [ EXPLORAR LINHAS → ]   · Sobre a curadoria  │
└────────────────────────────────────────────────┘
```

- `<section>` com `relative min-h-[88vh] md:min-h-[92vh] w-full overflow-hidden` — mesma altura do hero atual, sem mexer no Header.
- Foto absoluta `inset-0`, classe `object-cover`. Mantém o `animate-hero-drift` muito sutil (scale 1.03 → 1.06 em ~16s) para um respiro cinematográfico — coerente com o `RespiroSection` que já existe.
- Sobre a foto, três camadas (de baixo pra cima):
  1. Gradiente vertical: `linear-gradient(to top, hsl(var(--western-green-deep) / 0.85) 0%, hsl(var(--western-green-deep) / 0.45) 35%, transparent 65%)` — só na metade inferior, para garantir leitura sem escurecer a cascata.
  2. Vinheta lateral esquerda muito leve: `linear-gradient(to right, hsl(var(--western-stone-dark) / 0.35), transparent 40%)` — assenta o bloco de texto.
  3. Grão SVG (mesmo do hero atual) com `opacity-[0.06] mix-blend-overlay` — costura visual com o resto da home.
- Shimmer dourado no topo (linha de 1px) preservado — é assinatura.

### Bloco de texto (canto inferior esquerdo)

- Wrapper: `container-western` em `absolute inset-0 flex items-end pb-16 md:pb-24`.
- `max-w-2xl animate-fade-in-up`:
  - Eyebrow: `PEDRAS · CASCATAS · PAISAGISMO` (mesma classe `text-eyebrow`, cor `text-western-gold-soft` para contrastar com a foto clara).
  - Régua dourada `w-12 h-px bg-western-gold mb-8`.
  - Título: `font-display text-5xl md:text-7xl lg:text-[5.5rem] leading-[1.05] text-western-cream` com sombra discreta (`drop-shadow-[0_2px_24px_rgba(0,0,0,0.45)]`) para legibilidade sobre céu claro/água.
    - "A pedra **contempla** antes de ser colocada." — "contempla" em itálico dourado-suave (já é o padrão).
  - Subtítulo curto removido do hero (vai sobrecarregar visualmente sobre a foto). O parágrafo de curadoria já é repetido na seção SOBRE logo abaixo — não perdemos nada.
  - CTA: `btn-gold` "Explorar linhas →" + link secundário `· Sobre a curadoria` em mono cream.
- Specs do canto inferior direito (`Quartzo · Arenito · Moledo · Granito`) preservados, mas em `text-western-cream/80` com leve `drop-shadow` — mantém a marca dos quatro acabamentos sem competir com a foto.

### Acessibilidade e performance

- `alt` descritivo da cascata: "Cascata escultural Western em borda de piscina natural com paisagismo tropical."
- `prefers-reduced-motion`: desativa o `animate-hero-drift` (já é o comportamento padrão dos utilitários `animate-*` quando o usuário pede reduzido — confirmar no `tailwind.config.ts`; se necessário, envolver com classe condicional, mesmo padrão de `RespiroSection`).
- Imagem como LCP: `eager` + `fetchPriority="high"` + dimensões intrínsecas via `width/height` no `<img>` para evitar CLS.
- Sem novas dependências, sem mudanças no Tailwind config.

### Arquivos afetados

- **Editar** `src/pages/Index.tsx`: substituir todo o bloco `<section>` do HERO (atualmente do comentário `{/* HERO — verde */}` até o fechamento dessa seção) pelo novo hero full-bleed. Remover o import `brasao` se não usado em outro lugar do arquivo (é exclusivo do hero).
- **Criar** `src/assets/hero-cascata.jpg` (cópia do upload).

### Fora do escopo

- Não mexer em `RespiroSection`, `ArtistaSection`, `ProjetosSection`, Header, Footer ou qualquer outra seção.
- Não trocar fontes, paleta ou tokens.
