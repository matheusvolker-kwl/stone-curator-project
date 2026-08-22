/**
 * Teste de integração do crawler, sem rede.
 *
 * Semeia o cache de disco do lib/rede.mjs com um site inteiro de mentira —
 * sitemap, home, páginas de projeto, uma página fora do escopo e uma que
 * responde 404 — e roda a varredura de verdade por cima. É o que prova que
 * sitemap + BFS + escopo + escolha de data funcionam juntos, e não só cada um
 * no seu teste de unidade.
 *
 *   node --test scripts/scrape/integracao.test.mjs
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";

import { CACHE_DIR } from "./lib/rede.mjs";
import { SITEMAPS_COMUNS, varrerSite } from "./site.mjs";
import { criarFiltroPeriodo, melhorData } from "./lib/consolidar.mjs";

const HOST = "https://fixture-scrape.test";

async function semear(url, corpo, { status = 200, tipo = "text/html", lastModified = null } = {}) {
  await mkdir(CACHE_DIR, { recursive: true });
  const chave = createHash("sha1").update(url).digest("hex");
  await writeFile(
    join(CACHE_DIR, chave + ".json"),
    JSON.stringify({
      url, urlFinal: url, ok: status < 400, status, tipo,
      lastModified, html: corpo, buscadoEm: new Date().toISOString(),
    }),
    "utf8",
  );
  return chave;
}

const pagina = ({ titulo, corpo = "", extra = "" }) => `<!doctype html>
<html lang="pt-BR"><head><title>${titulo}</title>${extra}</head>
<body><h1>${titulo}</h1>${corpo}</body></html>`;

test("varredura completa de um site semeado no cache", async (t) => {
  const chaves = [];
  const seed = async (...a) => chaves.push(await semear(...a));

  // Os outros candidatos a sitemap ficam semeados como 404: sem isso o teste
  // sairia pra rede sondar cada um, e passaria a depender de quanto tempo a
  // rede leva pra falhar.
  for (const c of SITEMAPS_COMUNS.filter((c) => c !== "/sitemap.xml")) {
    await seed(HOST + c, "", { status: 404 });
  }

  await seed(`${HOST}/sitemap.xml`, `<?xml version="1.0"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      <url><loc>${HOST}/</loc><lastmod>2025-08-01</lastmod></url>
      <url><loc>${HOST}/projetos/casa-a</loc><lastmod>2025-06-15</lastmod></url>
      <url><loc>${HOST}/projetos/casa-antiga</loc><lastmod>2019-02-01</lastmod></url>
    </urlset>`, { tipo: "application/xml" });

  await seed(`${HOST}/`, pagina({
    titulo: "Home",
    // Link pra página que NÃO está no sitemap: só o BFS acha.
    corpo: `<a href="/projetos/casa-b">Casa B</a>
            <a href="https://outrodominio.com/x">Externo</a>
            <a href="/quebrada">Quebrada</a>
            <img src="/img/home.jpg" alt="fachada">`,
  }));

  await seed(`${HOST}/projetos/casa-a`, pagina({
    titulo: "Casa A",
    corpo: `<p>Concluída em 2025. Contato: obra@fixture.test</p>`,
    extra: `<script type="application/ld+json">
      {"@type":"Article","datePublished":"2025-06-10"}</script>`,
  }));

  // Projeto de 2019 no corpo, mas página sem data estruturada: o corte não
  // pode usar "2019" do texto como se fosse data de publicação.
  await seed(`${HOST}/projetos/casa-antiga`, pagina({
    titulo: "Casa Antiga",
    corpo: `<p>Projeto de 2019.</p>`,
  }));

  await seed(`${HOST}/projetos/casa-b`, pagina({
    titulo: "Casa B",
    corpo: `<p>R$ 1.250.000,00</p>`,
  }), { lastModified: "Mon, 03 Mar 2025 10:00:00 GMT" });

  await seed(`${HOST}/quebrada`, "", { status: 404 });

  t.after(async () => {
    for (const c of chaves) await rm(join(CACHE_DIR, c + ".json"), { force: true });
  });

  const r = await varrerSite(
    { slug: "fixture", site: { raiz: `${HOST}/` } },
    { max: 50 },
  );

  const porUrl = new Map(r.paginas.map((p) => [p.url, p]));

  // O sitemap entrou inteiro e o BFS achou a que faltava.
  assert.equal(r.paginas.length, 4, `esperava 4 páginas, veio ${[...porUrl.keys()].join(", ")}`);
  assert.ok(porUrl.has(`${HOST}/projetos/casa-b`), "BFS não achou a página fora do sitemap");

  // Domínio de fora não entra na varredura.
  assert.ok(![...porUrl.keys()].some((u) => u.includes("outrodominio")), "vazou link externo");

  // O 404 vira erro registrado, não página.
  assert.equal(r.erros.length, 1);
  assert.equal(r.erros[0].status, 404);

  // Origem da descoberta é rastreada.
  assert.equal(porUrl.get(`${HOST}/projetos/casa-a`).origemDescoberta, "sitemap");
  assert.equal(porUrl.get(`${HOST}/projetos/casa-b`).origemDescoberta, `${HOST}/`);

  // Extração real chegou junto.
  const casaA = porUrl.get(`${HOST}/projetos/casa-a`);
  assert.equal(casaA.titulo, "Casa A");
  assert.deepEqual(casaA.emails, ["obra@fixture.test"]);
  assert.deepEqual(porUrl.get(`${HOST}/projetos/casa-b`).precos, ["R$ 1.250.000,00"]);
  assert.equal(porUrl.get(`${HOST}/`).imagens[0].alt, "fachada");

  // Escolha de data e recorte, sobre o resultado real da varredura.
  const dentro = criarFiltroPeriodo("2025-01-01");
  const carimbar = (p) => {
    const { iso, origem } = melhorData(p);
    return { iso, origem, dentro: dentro(iso, p.anosCitados) };
  };

  const a = carimbar(casaA);
  assert.equal(a.origem, "sitemap:lastmod");
  assert.equal(a.iso.slice(0, 10), "2025-06-15");
  assert.equal(a.dentro, true);

  const antiga = carimbar(porUrl.get(`${HOST}/projetos/casa-antiga`));
  assert.equal(antiga.origem, "sitemap:lastmod");
  assert.equal(antiga.dentro, false, "página de 2019 não pode entrar no recorte de 2025");

  // Sem lastmod no sitemap, o Last-Modified do HTTP salva a data.
  const b = carimbar(porUrl.get(`${HOST}/projetos/casa-b`));
  assert.equal(b.origem, "http:last-modified");
  assert.equal(b.dentro, true);
});
