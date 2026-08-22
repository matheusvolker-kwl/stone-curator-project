# Scrap de arquitetos, designers e marcas BR

Coleta o que 19 marcas brasileiras de arquitetura, design, mobiliário e
paisagismo publicaram de 2025 em diante — site próprio, Instagram, Pinterest e
YouTube — e consolida tudo numa planilha só.

```bash
node scripts/scrape/run.mjs
```

Sem `npm install`. Node 22+ e nada mais, exceto os dois casos marcados adiante.

## Comandos

```bash
node scripts/scrape/run.mjs                       # todos os alvos, 2025+
node scripts/scrape/run.mjs --alvo=jader-almeida  # um alvo só
node scripts/scrape/run.mjs --desde=2024-01-01    # outro corte de data
node scripts/scrape/run.mjs --max=800             # teto de páginas por site
node scripts/scrape/run.mjs --render              # Chromium nos sites que montam no cliente
node scripts/scrape/run.mjs --sem=instagram,pinterest
node scripts/scrape/run.mjs --saida=/tmp/coleta   # outro destino

node --test scripts/scrape/*.test.mjs             # 23 testes, ~0,3s
```

Variáveis de ambiente:

| variável | efeito |
|---|---|
| `SCRAPE_DELAY_MS` | intervalo entre hits no mesmo host (padrão `1200`) |
| `SCRAPE_IGNORAR_ROBOTS=1` | ignora `robots.txt` (padrão é respeitar) |
| `IG_SESSIONID` | cookie `sessionid` da sua conta do Instagram |
| `IG_STATE` | caminho de um `storageState.json` do Playwright |
| `PINTEREST_COOKIE` | cookie de sessão do Pinterest |

## O que sai

Em `data/scrape/`:

| arquivo | o que é |
|---|---|
| `consolidado.csv` | tudo numa planilha — abre no Sheets/Excel |
| `consolidado.ndjson` | uma linha JSON por item, pra carregar em banco |
| `<slug>.json` | coleta completa do alvo: texto integral, imagens, JSON-LD, links |
| `RELATORIO.md` | quanto entrou, por canal e por alvo, e o que falhou |
| `posts-avulsos.json` | posts soltos resolvidos fora dos perfis |

De cada página o extrator tira título, meta, OpenGraph, Twitter Card, JSON-LD,
canonical, idioma, todos os títulos h1–h6, imagens (com `alt`, `srcset` e
lazy-load resolvidos), embeds de vídeo, links, datas, preços em real, e-mails,
telefones, anos citados e o texto limpo inteiro.

## Como o recorte de 2025 funciona

Cada item ganha uma data e um veredito. A data vem da fonte mais confiável
disponível, nesta ordem:

```
sitemap lastmod → JSON-LD datePublished → meta published → JSON-LD dateModified
→ meta modified → <time> → HTTP Last-Modified → data na URL → data no texto
```

Data solta no texto fica por último de propósito: num portfólio de arquitetura,
"2019" no corpo quase sempre é o ano da **obra**, não o da publicação — cortar
por isso jogaria fora página atual sobre projeto antigo.

O campo `noPeriodo` tem **três** estados, não dois:

- `true` — tem data e está no recorte
- `false` — tem data e ficou de fora
- `null` — **não tem data nenhuma**, e foi guardado assim mesmo

O `null` é deliberado. Página de projeto sem data pode ser a mais relevante do
alvo, e descartar por ausência de metadado seria perder conteúdo por defeito do
CMS do outro. O `RELATORIO.md` conta os três separados; quem consome decide.

## Os canais, um a um

### Site próprio — funciona sozinho

Soma duas fontes de URL: o sitemap (a lista que o próprio dono publica, e que
traz `lastmod`) e um BFS a partir da home, que pega o que ficou fora dele.
Portfólio de arquitetura costuma ter as duas lacunas.

Respeita `robots.txt`, espaça os hits por host e **guarda o HTML cru em disco**
(`.cache/scrape/`). O cache é o que torna a coleta viável de refinar: mexer no
extrator e rodar de novo relê do disco, sem repetir uma request sequer.

Alvos com loja ou blog em host separado (Jader Almeida) têm esses domínios como
`extras` no `alvos.mjs` — o crawler do domínio principal não chegaria neles.

### YouTube — funciona sozinho

Duas fontes, porque nenhuma basta: o RSS dá data exata mas só os ~15 últimos
vídeos; o `ytInitialData` da aba `/videos` pagina o catálogo inteiro, mas com
data relativa ("há 3 meses"). O módulo pagina pelo segundo e carimba data exata
com o primeiro. Quem só aparece no catálogo fica com `dataExata: false`.

### Instagram — **precisa da sua sessão**

Desde 2024 o Instagram não serve perfil público a visitante anônimo de forma
confiável: sem sessão, o normal é muro de login ou 401, e insistir rende bloqueio
temporário de IP. O módulo tenta três caminhos em ordem de custo
(`web_profile_info` → `?__a=1` → Playwright com scroll), mas o realista é:

```bash
IG_SESSIONID=<seu cookie sessionid> node scripts/scrape/run.mjs --alvo=tidelli
```

Só o Playwright passa dos 12 primeiros posts. Use conta descartável e
`SCRAPE_DELAY_MS` folgado. Coletar perfil comercial público para pesquisa de
mercado é uso corriqueiro, mas continua sendo contra os Termos da Meta — a conta
é sua, e a decisão também. Sem sessão o run **não quebra**: registra o erro no
JSON do alvo e segue para o próximo.

### Pinterest — costuma funcionar sozinho

Usa os mesmos endpoints `/resource/` que o site do Pinterest usa, que para perfil
público em geral respondem sem sessão. `UserResource` dá o perfil, `BoardsResource`
lista as pastas, `BoardFeedResource` pagina os pins. Se fechar, cai no Playwright.

## Requisitos por modo

| modo | precisa de |
|---|---|
| sites, YouTube, Pinterest | só Node 22+ |
| `--render` | `npm install && npx playwright install chromium` |
| Instagram além do muro | Playwright + `IG_SESSIONID` ou `IG_STATE` |

## Arquivos

```
alvos.mjs            os 19 alvos e seus canais
run.mjs              orquestrador e CLI
site.mjs             sitemap + BFS do site próprio
youtube.mjs          RSS + ytInitialData paginado
instagram.mjs        três caminhos, do mais barato ao mais caro
pinterest.mjs        endpoints /resource/ + fallback de navegador
lib/rede.mjs         cache, retry, rate-limit, robots
lib/extrair.mjs      extração de HTML, sem dependência
lib/consolidar.mjs   escolha de data, recorte, CSV e relatório
scrape.test.mjs      22 testes de unidade
integracao.test.mjs  1 teste de ponta a ponta, semeando o cache
```

## Ajustar os alvos

Tudo em `alvos.mjs`. Para adicionar um canal que faltava:

```js
{
  slug: "hio-decor",
  nome: "HIO Decor",
  categoria: "decoração",
  site: { raiz: "https://hiodecor.com.br/" },
  instagram: "hio_decor",        // ← perfil existe, ainda não estava na lista
  pinterest: "hiodecoroficial",
}
```

O `youtube` aceita `{ canalId: "UC..." }` ou `{ handle: "@nome" }` — o handle é
resolvido para o ID canônico antes do RSS.

## Se a coleta voltar vazia

Verifique a rede antes do código: se `curl -I https://mk27.com/` responder
`CONNECT tunnel failed, response 403`, o problema é política de egresso do
ambiente, não o scraper. Ver [`BLOQUEIO-DE-REDE.md`](../../data/scrape/BLOQUEIO-DE-REDE.md).
