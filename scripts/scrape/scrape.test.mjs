/**
 * Autotestes do scrap. Rodam sem `npm install`:
 *
 *   node --test scripts/scrape/
 *
 * O foco é o que costuma quebrar calado numa coleta: atributo com `>` dentro,
 * lazy-load, srcset, telefone que na verdade é CEP, e a escolha da data — que é
 * o que decide se um item entra ou não no recorte de 2025.
 */
import { test } from "node:test";
import assert from "node:assert/strict";

import {
  anosCitados, atributos, contatos, datas, decodificar, extrairPagina,
  imagens, jsonLd, links, precos, texto, titulos, videos,
} from "./lib/extrair.mjs";
import { bloqueadoPorRobots, parseRobots } from "./lib/rede.mjs";
import { achatar, criarFiltroPeriodo, melhorData, paraCsv } from "./lib/consolidar.mjs";
import { dataAproximada, urlDoCanal } from "./youtube.mjs";
import { ALVOS } from "./alvos.mjs";

const BASE = "https://exemplo.com.br/projetos/casa";

test("decodifica entidades nomeadas, numéricas e hexadecimais", () => {
  assert.equal(decodificar("Cole&ccedil;&atilde;o"), "Coleção");
  assert.equal(decodificar("&#233;poca"), "época");
  assert.equal(decodificar("&#x2014;"), "—");
  assert.equal(decodificar("a &amp; b"), "a & b");
  // Entidade desconhecida fica como está, em vez de virar string vazia.
  assert.equal(decodificar("&naoexiste;"), "&naoexiste;");
});

test("atributo com > dentro das aspas não corta a tag", () => {
  const html = '<img src="/a.jpg" alt="Sala 3 > 4" width="800">';
  const [img] = imagens(html, BASE);
  assert.equal(img.alt, "Sala 3 > 4");
  assert.equal(img.largura, 800);
});

test("atributos aceita aspas simples, duplas e valor solto", () => {
  const a = atributos(` src='/x.jpg' alt="oi" data-n=5 hidden`);
  assert.equal(a.src, "/x.jpg");
  assert.equal(a.alt, "oi");
  assert.equal(a["data-n"], "5");
  assert.equal(a.hidden, "");
});

test("imagens: resolve relativo, prefere o maior do srcset e lê lazy-load", () => {
  const html = `
    <img src="/a.jpg">
    <img data-src="/lazy.jpg" alt="lazy">
    <img srcset="/p.jpg 400w, /g.jpg 1600w, /m.jpg 800w" alt="responsiva">
    <img src="data:image/gif;base64,R0lGOD">`;
  const urls = imagens(html, BASE).map((i) => i.url);
  assert.deepEqual(urls, [
    "https://exemplo.com.br/a.jpg",
    "https://exemplo.com.br/lazy.jpg",
    "https://exemplo.com.br/g.jpg",
  ]);
});

test("texto não vaza script nem style", () => {
  const html = `<style>.a{color:red}</style><script>var x="<b>oi</b>"</script><p>Conteúdo real</p>`;
  const t = texto(html);
  assert.equal(t, "Conteúdo real");
});

test("jsonLd achata @graph e ignora bloco malformado", () => {
  const html = `
    <script type="application/ld+json">{"@graph":[{"@type":"Product","name":"Clad"},{"@type":"Organization"}]}</script>
    <script type="application/ld+json">{isto nao e json}</script>
    <script type="application/ld+json">[{"@type":"Article","headline":"X"}]</script>`;
  const ld = jsonLd(html);
  assert.deepEqual(ld.map((i) => i["@type"]), ["Product", "Organization", "Article"]);
});

test("links: só http(s), sem duplicata, texto limpo", () => {
  const html = `
    <a href="/a">Um</a><a href="/a">Um</a>
    <a href="mailto:x@y.com">Email</a>
    <a href="https://outro.com/b"> <span>Dois</span> </a>`;
  const l = links(html, BASE);
  assert.equal(l.length, 2);
  assert.equal(l[0].url, "https://exemplo.com.br/a");
  assert.equal(l[1].texto, "Dois");
});

test("títulos saem com nível e texto decodificado", () => {
  const t = titulos("<h1>Casa &amp; Jardim</h1><h3>Ficha</h3>");
  assert.deepEqual(t, [
    { nivel: 1, texto: "Casa & Jardim" },
    { nivel: 3, texto: "Ficha" },
  ]);
});

test("vídeos classificam a plataforma do embed", () => {
  const v = videos(
    `<iframe src="https://www.youtube.com/embed/a"></iframe><iframe src="https://player.vimeo.com/video/1"></iframe>`,
    BASE,
  );
  assert.deepEqual(v.map((x) => x.plataforma), ["youtube", "vimeo"]);
});

test("contatos separam telefone de CEP e de número solto", () => {
  const { emails, telefones } = contatos(
    "fale@marca.com.br — (11) 99340-3487 e (48) 3222-1010. CEP 88000-000. Ref 2025 1234.",
  );
  assert.deepEqual(emails, ["fale@marca.com.br"]);
  assert.deepEqual(telefones, ["(11) 99340-3487", "(48) 3222-1010"]);
});

test("preços em real, com e sem centavos", () => {
  assert.deepEqual(
    precos("De R$ 12.900,00 por R$9.800 à vista"),
    ["R$ 12.900,00", "R$9.800"],
  );
});

test("datas: colhe de json-ld, meta, time, url e texto em pt", () => {
  const html = `
    <script type="application/ld+json">{"@type":"Article","datePublished":"2025-03-11"}</script>
    <meta property="article:modified_time" content="2025-06-02T12:00:00Z">
    <time datetime="2025-04-03"></time>
    <p>Publicado em 15 de agosto de 2025.</p>`;
  const origens = datas(html, "https://x.com/2025/03/post").map((d) => d.origem);
  for (const esperada of ["jsonld:datePublished", "meta:modified", "tag:time", "url", "texto:pt"]) {
    assert.ok(origens.includes(esperada), `faltou ${esperada} em ${origens.join(", ")}`);
  }
});

test("anosCitados devolve anos únicos, do mais novo pro mais velho", () => {
  assert.deepEqual(anosCitados("Obra de 2019, reformada em 2025 e publicada em 2025"), [2025, 2019]);
});

test("extrairPagina junta tudo numa página realista", () => {
  const html = `<!doctype html><html lang="pt-BR"><head>
    <title>Poltrona Clad</title><meta name="description" content="Lançamento">
    <meta property="og:image" content="/og.jpg">
    <link rel="canonical" href="https://exemplo.com.br/clad">
    </head><body><h1>Clad</h1><p>R$ 12.900,00</p><img src="/a.jpg" alt="a"></body></html>`;
  const p = extrairPagina(html, BASE);
  assert.equal(p.titulo, "Poltrona Clad");
  assert.equal(p.idioma, "pt-BR");
  assert.equal(p.canonical, "https://exemplo.com.br/clad");
  assert.equal(p.og.image, "/og.jpg");
  assert.deepEqual(p.precos, ["R$ 12.900,00"]);
  assert.equal(p.imagens.length, 1);
  assert.ok(p.palavras > 0);
});

test("robots: lê Disallow do agente * e os sitemaps", () => {
  const { proibidos, sitemaps } = parseRobots(`
    User-agent: Googlebot
    Disallow: /so-google/
    User-agent: *
    Disallow: /admin/
    Disallow: /carrinho
    Sitemap: https://x.com/sitemap.xml`);
  assert.deepEqual(proibidos, ["/admin/", "/carrinho"]);
  assert.deepEqual(sitemaps, ["https://x.com/sitemap.xml"]);
  assert.equal(bloqueadoPorRobots("/admin/pedidos", proibidos), true);
  assert.equal(bloqueadoPorRobots("/projetos", proibidos), false);
  // Regra de outro user-agent não pode valer pra nós.
  assert.equal(bloqueadoPorRobots("/so-google/x", proibidos), false);
});

test("melhorData respeita a ordem de confiança", () => {
  const pagina = {
    lastmodSitemap: "2025-07-01",
    httpLastModified: "Tue, 01 Jan 2019 00:00:00 GMT",
    datas: [
      { iso: "2019-01-01T00:00:00.000Z", origem: "texto:pt" },
      { iso: "2025-03-11T00:00:00.000Z", origem: "jsonld:datePublished" },
    ],
  };
  assert.equal(melhorData(pagina).origem, "sitemap:lastmod");

  // Sem sitemap, o json-ld ganha do texto solto.
  assert.equal(melhorData({ ...pagina, lastmodSitemap: null }).origem, "jsonld:datePublished");

  // Só texto: usa, mas marcando a origem fraca.
  const soTexto = { datas: [{ iso: "2019-01-01T00:00:00.000Z", origem: "texto:pt" }] };
  assert.equal(melhorData(soTexto).origem, "texto");

  assert.deepEqual(melhorData({ datas: [] }), { iso: null, origem: null });
});

test("filtro de período tem três estados", () => {
  const dentro = criarFiltroPeriodo("2025-01-01");
  assert.equal(dentro("2025-06-01T00:00:00.000Z", null), true);
  assert.equal(dentro("2024-12-31T00:00:00.000Z", null), false);
  // Sem data nenhuma → indeterminado, não descartado.
  assert.equal(dentro(null, null), null);
  // Sem data, mas o corpo cita 2025 → entra.
  assert.equal(dentro(null, [2025, 2019]), true);
  assert.equal(dentro(null, [2019]), false);
});

test("achatar cobre os quatro canais", () => {
  const noPeriodo = criarFiltroPeriodo("2025-01-01");
  const linhas = achatar(
    [{
      slug: "x", nome: "X", categoria: "design",
      canais: {
        site: { paginas: [{ url: "u", titulo: "T", imagens: [1], videos: [], precos: [], anosCitados: [2025], palavras: 10, noPeriodo: true }] },
        youtube: { videos: [{ url: "v", titulo: "V", publicadoEm: "2025-05-01T00:00:00Z", dataExata: true, noPeriodo: true }] },
        instagram: { posts: [{ url: "i", legenda: "L", publicadoEm: "2025-05-01T00:00:00Z", ehVideo: true, hashtags: ["#a"], noPeriodo: true }] },
        pinterest: { pastas: [{ nome: "P", conteudo: [{ url: "p", titulo: "Pin", criadoEm: "2025-05-01T00:00:00Z" }] }] },
      },
    }],
    noPeriodo,
  );
  assert.deepEqual(linhas.map((l) => l.canal), ["site", "youtube", "instagram", "pinterest"]);
  assert.equal(linhas[1].dataOrigem, "rss");
  assert.equal(linhas[2].tipo, "reel");
  assert.equal(linhas[3].noPeriodo, true);
});

test("CSV escapa vírgula, aspas e quebra de linha", () => {
  const csv = paraCsv(
    [{ alvo: "a", titulo: 'Diz "oi", e sai', resumo: "linha1\nlinha2" }],
    ["alvo", "titulo", "resumo"],
  );
  const [cabecalho, linha] = csv.split("\n");
  assert.equal(cabecalho, "alvo,titulo,resumo");
  assert.equal(linha, 'a,"Diz ""oi"", e sai",linha1 linha2');
  assert.equal(csv.split("\n").length, 2, "quebra interna não pode virar linha nova");
});

test("datas relativas do YouTube viram ISO", () => {
  const agora = new Date("2026-08-22T00:00:00.000Z");
  assert.equal(dataAproximada("há 3 meses", agora).slice(0, 7), "2026-05");
  assert.equal(dataAproximada("2 years ago", agora).slice(0, 4), "2024");
  assert.equal(dataAproximada("há 1 semana", agora).slice(0, 10), "2026-08-15");
  assert.equal(dataAproximada("estreou", agora), null);
});

test("urlDoCanal aceita id, handle com e sem @", () => {
  assert.equal(urlDoCanal({ canalId: "UC123" }), "https://www.youtube.com/channel/UC123");
  assert.equal(urlDoCanal({ handle: "@Waldir" }), "https://www.youtube.com/@Waldir");
  assert.equal(urlDoCanal({ handle: "Waldir" }), "https://www.youtube.com/@Waldir");
  assert.equal(urlDoCanal({}), null);
});

test("os 19 alvos estão íntegros e sem slug repetido", () => {
  assert.equal(ALVOS.length, 19);
  assert.equal(new Set(ALVOS.map((a) => a.slug)).size, 19);
  for (const a of ALVOS) {
    assert.ok(a.nome && a.categoria, `${a.slug} sem nome/categoria`);
    assert.doesNotThrow(() => new URL(a.site.raiz), `${a.slug} com raiz inválida`);
    for (const e of a.site.extras ?? []) assert.doesNotThrow(() => new URL(e));
  }
});
