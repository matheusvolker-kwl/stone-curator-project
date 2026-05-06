## Seção "Projetos" na home

Nova seção verde-escura na home, entre **Sobre** e **Destaques**, com 4 cards (grid 2×2 desktop, stack mobile) que abrem modal lightbox com vídeo + texto completo.

### 1. Assets — copiar uploads para o projeto

Copiar para `src/assets/projetos/`:

| Arquivo origem | Destino |
|---|---|
| `Evandro-Mesquita.webp` | `src/assets/projetos/cover-cascata.webp` |
| `pgm-tato-e-lucy-alves-...webp` | `src/assets/projetos/cover-casa-praia.webp` |
| `maira-cardi-e-thiago-nigro.avif` | `src/assets/projetos/cover-piscina.avif` |
| `neymar-jr-GettyImages-...jpg` | `src/assets/projetos/cover-lago.jpg` |
| `evandro_mesquita.mp4` | `public/videos/projetos/cascata.mp4` |
| `tato_falamansa.mp4` | `public/videos/projetos/casa-praia.mp4` |
| `thiago_nigro.mp4` | `public/videos/projetos/piscina.mp4` |
| `neymar.mp4` | `public/videos/projetos/lago.mp4` |

Vídeos em `public/` (servidos diretos, não passam pelo bundler — melhor para mp4 grandes). Imagens de capa em `src/assets/` para hash + lazy.

> Obs.: as fotos enviadas são **retratos das pessoas**, não das obras. Vou usá-las como capa por enquanto (humaniza, ancora o nome). Quando você tiver foto da obra real (cascata, piscina, lago), basta substituir o arquivo no mesmo path.

### 2. Dados — `src/data/projetos.ts`

Array tipado com os 4 cases (eyebrow, título, snippet, texto completo do modal, ficha técnica em array, cover importada, vídeo path). Tudo o que está no briefing entra textual aqui — exatamente como você redigiu.

### 3. Componente — `src/components/home/ProjetosSection.tsx`

Renderiza:
- **Eyebrow** `ARQUIVO · PROJETOS` + filete dourado
- **Título** serifado: "Onde a pedra encontra o projeto." (mesma escala do "A pedra contempla")
- **Intro** curta off-white
- **Grid** `grid-cols-1 md:grid-cols-2 gap-6 md:gap-8` com 4 `<ProjetoCard>`

**ProjetoCard** (mesmo arquivo):
- `<button>` (acessível) que abre o modal
- Frame 4/5 com `<img>` cover
- Overlay gradiente sutil bottom-up para legibilidade
- Ícone `Play` em círculo bege no canto inferior direito (sempre — todos têm vídeo)
- Eyebrow bege caixa-alta + título serifado + snippet + microlink "Ver projeto →"
- Hover: leve zoom da imagem + `border-western-gold/40`

### 4. Modal lightbox — `src/components/home/ProjetoModal.tsx`

Usa o `Dialog` do shadcn já presente. Conteúdo:
- `<video controls preload="metadata" poster={cover}>` no topo (sem autoplay)
- Eyebrow + título serifado grande
- Texto completo (parágrafos)
- Ficha técnica: lista horizontal com `·` separador, mono caixa-alta letterspacing
- `DialogContent` em `bg-western-green-deep`, max-w-3xl, scroll interno

Estado controlado via `useState<Projeto | null>` no `ProjetosSection`.

### 5. Integração na home — `src/pages/Index.tsx`

Importar e inserir `<ProjetosSection />` logo após a seção SOBRE e antes de DESTAQUES. Mantém o ritmo verde→creme→verde→creme.

### 6. Detalhes técnicos resumidos

```text
src/data/projetos.ts        : 4 entries (slug, eyebrow, titulo, snippet, texto, ficha[], cover, video)
src/components/home/
  ProjetosSection.tsx       : eyebrow + título + grid + estado do modal
  ProjetoModal.tsx          : Dialog com <video controls>, sem autoplay
src/assets/projetos/*       : capas (webp/avif/jpg)
public/videos/projetos/*    : mp4s
src/pages/Index.tsx         : insere <ProjetosSection /> entre SOBRE e DESTAQUES
```

Sem novas libs. Sem alteração no Shopify. Sem rota nova (a página dedicada `/projetos/[slug]` fica para a Onda 4 conforme você indicou).
