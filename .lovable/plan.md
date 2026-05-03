
# Western Pools — B2B Headless Storefront

Frontend editorial em React + Tailwind, totalmente conectado à loja Shopify existente da Western Pools via Storefront API e Customer Account API. Sem banco de dados próprio, sem produtos hardcoded, sem checkout reconstruído.

---

## 1. Identidade visual e fundação

- Tokens de design no `index.css` e `tailwind.config.ts` com a paleta exata do briefing (verde-profundo `#0F2818`, verde-mid `#1B3A28`, dourado `#A78862`, dourado-soft `#C7A883`, cream `#E8DFD0`, cream-muted `#B8AE9D`, stone-dark `#2A2520`).
- Tipografia: serifa display (Cormorant Garamond), corpo sans (Inter), numerais técnicos mono (JetBrains Mono). Carregadas via Google Fonts com `display=swap`. Berlin fica como nota para upload futuro de fonte proprietária.
- Logos e ícones-pedra copiados para `src/assets/` (brasão, horizontal verde/bege, vertical verde/bege, ícones-pedra verde/bege/branco). Favicon = ícone-pedra.
- Texturas: noise SVG sutil (~3% opacidade) sobre superfícies escuras; linhas geométricas finas douradas como ornamento opcional ecoando o brasão.
- Componente `Section` com respiro generoso (container 1280–1360px, padding lateral grande no desktop, 24–32px no mobile).

### Resolvendo verde × branco das fotos de produto
Estratégia de "moldura de galeria":
- Fundo global do site = verde profundo.
- Cards e páginas de produto: imagem com fundo branco original fica dentro de uma "placa" cream `#E8DFD0` com cantos retos e borda dourada de 1px (parece um quadro montado em parede de galeria).
- Em PDP, hero da imagem ocupa metade esquerda em superfície cream/branco, ficha técnica e ações ficam na metade direita em verde — contraste editorial, sem quebra abrupta.
- Em listagens, grid de cards com superfície cream interna; o verde domina o entorno (header, padding, espaçamento).

---

## 2. Conexão Shopify (existente)

- Habilitar a integração Shopify no modo "conectar loja existente" — o usuário fornece o link admin da Shopify. Após isso, ganhamos acesso aos tokens da Storefront API e Customer Account API.
- Camada `src/lib/shopify/` com:
  - `client.ts` — cliente GraphQL Storefront API (fetch + headers).
  - `queries/` — queries tipadas para `collections`, `productByHandle`, `productsByCollection`, `cart` (cartCreate, cartLinesAdd/Update/Remove), `customer*`.
  - `types.ts` — tipos espelhando o schema da Storefront API.
- Antes da integração estar pronta, mocks claramente marcados `// MOCK — substituir por Storefront API` com o mesmo schema das 11 coleções e amostras de produtos do briefing, para o frontend rodar imediatamente.
- Hook `useCart()` persiste `cartId` em `localStorage` e sincroniza com Shopify Cart API. Checkout = `window.location = cart.checkoutUrl` (Shopify hospedado).
- Auth B2B = Shopify Customer Account API. Sem auth própria.

---

## 3. Arquitetura de páginas e rotas

```
/                              Home editorial
/colecoes                      Índice das 11 coleções
/colecoes/:handle              Coleção (grid de produtos, filtros por acabamento)
/produtos/:handle              PDP — ficha técnica, 3D, swatches
/guia-de-compra                Wizard: local + tamanho + estilo → kit sugerido
/sobre                         Manifesto, processo, material, fábrica
/parceiro/cadastro             Form de cadastro B2B (mediante aprovação)
/parceiro/login                Login Customer Account
/conta                         Painel: pedidos, status produção, dados
/conta/pedidos/:id             Detalhe de pedido + acompanhamento
/carrinho                      Resumo antes do checkout Shopify
/contato                       WhatsApp, Instagram, fábrica SP
```

NotFound já existente é estilizado para o tom da marca.

---

## 4. Home

Sequência de blocos contemplativos (cada um respira como página de catálogo):

1. **Hero** — vídeo loop opcional (água em cascata, mudo) ou imagem macro de pedra. Headline serifa: "A pedra que se especifica." Subcopy curta. CTA "Ver coleções" em botão dourado.
2. **Manifesto curto** — 2–3 linhas sobre composto mineral autoral.
3. **As 11 coleções** — grid editorial com nome em serifa, código discreto em mono, miniatura. Hover: linha dourada desce do topo.
4. **Peça em destaque** — uma cascata ou pedra grande em hero macro com ficha lateral.
5. **Para quem projeta** — bloco para arquitetos/paisagistas/garden centers com CTA cadastro B2B.
6. **Processo** — 4 passos (Cadastro → Especificação → Pedido → Produção 15 dias).
7. **Footer** — logo horizontal bege, contatos, selos (garantia, fabricação nacional), links institucionais.

---

## 5. Coleção e PDP

**Coleção:**
- Cabeçalho com nome serifa grande, código (ex.: "CS"), descrição editorial curta, contagem de peças.
- Filtros minimalistas: acabamento (Quartzo / Arenito / Moledo / Granito) como swatches circulares.
- Grid 2/3/4 colunas. Card: imagem em placa cream, nome serifa, código mono, preço B2B (visível só se logado/aprovado; senão "Acesse condição de parceiro").

**PDP:**
- Layout duas metades:
  - Esquerda (cream): galeria com imagem principal + thumbs + macro/zoom.
  - Direita (verde): nome serifa, código SKU mono, descrição curta, ficha técnica em lista (dimensões mm, peso kg, material, aplicações), seletor de acabamento (4 swatches com animação SVG ao selecionar), quantidade, preço, botão "Adicionar ao pedido" (dourado).
- Bloco "Modelo 3D" — card destacado com link dedicado por produto (campo metafield Shopify `modelo_3d_url`) abrindo em nova aba para o SketchUp 3D Warehouse. Se ausente, link genérico para a galeria oficial.
- Bloco "Composições sugeridas" — relacionados da mesma coleção.
- Bloco "Especificação para o projeto" — copy curta + WhatsApp.

---

## 6. Guia de compra (kit wizard)

Fluxo de 3–4 perguntas (local de instalação → tamanho do projeto → estética/acabamento) → sugere kit pré-montado de produtos da Shopify (mapeado por handles/tags). Resultado: tela com peças do kit, total, "Adicionar kit ao pedido" (chama cartLinesAdd múltiplo).

---

## 7. Cadastro B2B e conta

- `/parceiro/cadastro`: form (razão social, CNPJ, segmento, site/Instagram, responsável, contato). Cria customer no Shopify com tag `pending-approval`. Mensagem: "Recebemos seu cadastro. Retornamos em até 2 dias úteis."
- `/parceiro/login`: Customer Account API.
- `/conta`: dados do parceiro, lista de pedidos com status (Pagamento → Produção 15d → Pronto → Logística), botão repetir pedido.
- Preços ocultos para visitantes não aprovados (gating client-side baseado em customer tag/state).

---

## 8. Carrinho e checkout

- `/carrinho`: lista de itens com thumb cream, acabamento, quantidade, subtotal, pedido mínimo R$ 1.000 (validação visual com barra de progresso dourada). Aviso editorial sobre prazo 15 dias úteis e pagamento antecipado.
- Botão "Finalizar pedido" → `checkoutUrl` do Shopify. Logística e métodos de pagamento ficam por conta da configuração Shopify (frete e gateways serão definidos pelo usuário com parceiros Shopify).

---

## 9. Microinterações (delicadas, lentas, controladas)

- Transição de página: fade + slide-up 8px, 400ms ease-out.
- Scroll reveal via IntersectionObserver, stagger 80ms.
- Hover card produto: `scale(1.04)` em 600ms + sombra profunda + linha dourada superior.
- Hover link texto: underline dourado se desenha esquerda→direita.
- Botão primário: bege/verde-escuro ↔ verde-claro/bege, 250ms.
- Swatch acabamento: stroke SVG circular ao selecionar.
- Loading: skeleton verde-mid com shimmer dourado sutil.
- Toast: serifa, fundo verde-mid, borda dourada 1px, slide do topo, 4s.
- Modal 3D: fade + scale 0.96→1, blur 8px no fundo, overlay verde 80%.
- Cursor custom em hero/galeria (32px, borda bege, label "VER PEÇA" / "ABRIR 3D").
- Tudo respeita `prefers-reduced-motion` e `prefers-reduced-data` (cursor custom e vídeo desligam).

---

## 10. Acessibilidade, SEO, performance

- Contraste AA garantido pela paleta. Focus ring dourado 2px offset em todos os interativos.
- `alt` gerado a partir de nome + acabamento.
- Vídeos: muted, loop, playsinline, botão pause acessível.
- Imagens com aspect-ratio reservado (CLS zero), `loading="lazy"` abaixo da dobra, formatos WebP/AVIF servidos pelo CDN da Shopify (parâmetros de URL).
- `<title>`: `{Produto} — {Coleção} | Western Pools`. Meta description editorial.
- Open Graph com hero do produto. Schema.org Product/Offer/Organization/Breadcrumb.
- Sitemap dinâmico via Storefront API (rota `/sitemap.xml` servida por função). `robots.txt` bloqueando `/conta`, `/carrinho`, `/checkout`.
- URLs limpas (`/colecoes/cascatas`, `/produtos/cascata-cs`).

---

## 11. Vocabulário e tom

Aplicado em toda copy: "composto mineral de alta resistência", "acabamento", "parceiro", "PISADA", "cotação", "condição comercial diferenciada". Sem emojis, sem urgência fabricada, sem "compre já".

---

## Detalhes técnicos (referência)

- Stack atual mantida: React 18 + Vite + Tailwind + TS + shadcn.
- React Router já configurado — adicionar todas as rotas acima antes do catch-all.
- Estado servidor: TanStack Query (já instalado) para queries Shopify.
- Cliente Storefront GraphQL próprio (sem SDK pesado), tipos manuais minimalistas no início.
- Mocks isolados em `src/lib/shopify/mocks.ts` com flag `USE_MOCKS` baseada em ausência da credencial Shopify, marcados com comentários `// MOCK — substituir por Storefront API`.
- Customer Account API via redirect OAuth (Shopify gerencia sessão); token em cookie httpOnly se necessário, ou fluxo public client conforme habilitado pela conexão.
- Carrinho: `cartId` em localStorage; todas as mutations re-fetcham o cart.
- Metafield esperado em cada produto: `custom.modelo_3d_url` (link SketchUp). Fallback: link da galeria pública.
- Após aprovação do plano: rodar `shopify--enable` com `store_type: existing` e seguir o knowledge específico que vem em seguida para finalizar a integração e substituir os mocks.

---

## Fora do escopo desta primeira entrega

- Configuração de gateways de pagamento e transportadoras na Shopify (será definido com parceiros Shopify pelo usuário).
- Importação dos 50 produtos / 200 SKUs / 11 coleções (já existem na loja Shopify do usuário — apenas consumimos).
- Fonte proprietária Berlin (entra quando arquivos forem fornecidos).
