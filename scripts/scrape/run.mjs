/**
 * Orquestrador do scrap.
 *
 *   node scripts/scrape/run.mjs                       # todos os alvos, 2025+
 *   node scripts/scrape/run.mjs --alvo=jader-almeida  # um só
 *   node scripts/scrape/run.mjs --desde=2024-01-01    # outro corte
 *   node scripts/scrape/run.mjs --render              # Chromium nos sites JS
 *   node scripts/scrape/run.mjs --max=800             # teto de páginas por site
 *   node scripts/scrape/run.mjs --sem=instagram,pinterest
 *
 * Saída em data/scrape/: um JSON completo por alvo, um NDJSON e um CSV com
 * tudo junto, e um relatório em Markdown. O CSV é o que abre no Sheets; o
 * NDJSON é o que presta pra carregar em banco sem estourar memória.
 *
 * Como o cache do lib/rede.mjs guarda o HTML cru, rodar de novo depois de
 * mexer no extrator não repete as requisições — relê do disco.
 */
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { ALVOS, POSTS_AVULSOS } from "./alvos.mjs";
import { varrerSite } from "./site.mjs";
import { varrerYoutube } from "./youtube.mjs";
import { varrerInstagram, varrerPost } from "./instagram.mjs";
import { varrerPinterest } from "./pinterest.mjs";
import {
  achatar, criarFiltroPeriodo, melhorData, paraCsv, relatorio,
} from "./lib/consolidar.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const RAIZ = join(__dirname, "..", "..");

const arg = (nome, padrao) => {
  const achado = process.argv.find((a) => a.startsWith(`--${nome}=`));
  return achado ? achado.slice(nome.length + 3) : padrao;
};
const flag = (nome) => process.argv.includes(`--${nome}`);

const DESDE = arg("desde", "2025-01-01");
const MAX = Number(arg("max", 400));
// resolve e não join: `--saida=/tmp/x` é caminho absoluto e não pode virar
// `<raiz>/tmp/x` — o join concatenaria em silêncio e a saída sumiria.
const SAIDA = resolve(RAIZ, arg("saida", "data/scrape"));
const RENDER = flag("render");
const PULAR = new Set((arg("sem", "") || "").split(",").filter(Boolean));
const SO_ESTE = arg("alvo", null);

const noPeriodo = criarFiltroPeriodo(DESDE);
const registrar = (...m) => console.log(...m);

async function coletarAlvo(alvo) {
  registrar(`\n▸ ${alvo.nome} (${alvo.slug})`);
  const inicio = Date.now();
  const out = {
    slug: alvo.slug,
    nome: alvo.nome,
    categoria: alvo.categoria,
    coletadoEm: new Date().toISOString(),
    recorteDesde: DESDE,
    canais: {},
  };

  if (alvo.site?.raiz && !PULAR.has("site")) {
    process.stdout.write("  site      … ");
    const r = await varrerSite(alvo, { max: MAX, render: RENDER });
    for (const p of r.paginas) {
      const { iso, origem } = melhorData(p);
      p.data = iso;
      p.dataOrigem = origem;
      p.noPeriodo = noPeriodo(iso, p.anosCitados);
    }
    out.canais.site = {
      raiz: alvo.site.raiz,
      paginas: r.paginas,
      urlsNoSitemap: r.sitemap.length,
      erros: r.erros,
      truncado: r.truncado,
      restantes: r.restantes,
    };
    const dentro = r.paginas.filter((p) => p.noPeriodo === true).length;
    const semData = r.paginas.filter((p) => p.noPeriodo === null).length;
    registrar(`${r.paginas.length} páginas (${dentro} no período, ${semData} sem data), ${r.erros.length} erros`);
  }

  if (alvo.youtube && !PULAR.has("youtube")) {
    process.stdout.write("  youtube   … ");
    const r = await varrerYoutube(alvo.youtube);
    for (const v of r.videos) v.noPeriodo = noPeriodo(v.publicadoEm, null);
    out.canais.youtube = r;
    registrar(r.erro ?? `${r.videos.length} vídeos (${r.videos.filter((v) => v.noPeriodo === true).length} no período)`);
  }

  if (alvo.instagram && !PULAR.has("instagram")) {
    process.stdout.write("  instagram … ");
    const r = await varrerInstagram(alvo.instagram);
    for (const p of r.posts) p.noPeriodo = noPeriodo(p.publicadoEm, null);
    out.canais.instagram = r;
    registrar(r.erro ?? `${r.posts.length} posts (${r.posts.filter((p) => p.noPeriodo === true).length} no período) via ${r.via}`);
  }

  if (alvo.pinterest && !PULAR.has("pinterest")) {
    process.stdout.write("  pinterest … ");
    const r = await varrerPinterest(alvo.pinterest);
    out.canais.pinterest = r;
    registrar(r.erro ?? `${r.pastas?.length ?? 0} pastas, ${r.totalPins ?? r.pins?.length ?? 0} pins`);
  }

  out.duracaoSegundos = Math.round((Date.now() - inicio) / 1000);
  return out;
}

const alvos = SO_ESTE ? ALVOS.filter((a) => a.slug === SO_ESTE) : ALVOS;
if (!alvos.length) throw new Error(`alvo desconhecido: ${SO_ESTE}`);

registrar(
  `Scrap de ${alvos.length} alvo(s) · recorte ${DESDE} · max ${MAX} páginas/site${RENDER ? " · render on" : ""}`,
);
await mkdir(SAIDA, { recursive: true });

const coletas = [];
for (const alvo of alvos) {
  try {
    const c = await coletarAlvo(alvo);
    coletas.push(c);
    await writeFile(join(SAIDA, `${alvo.slug}.json`), JSON.stringify(c, null, 2), "utf8");
  } catch (e) {
    // Um alvo que explode não pode levar os outros 18 junto — e o JSON dele
    // ainda é escrito, com o erro dentro: um arquivo faltando na pasta seria
    // lido como "esse alvo não foi pedido" na hora de conferir a coleta.
    registrar(`  ✗ ${alvo.slug}: ${e?.message ?? e}`);
    const stub = { slug: alvo.slug, nome: alvo.nome, erro: String(e?.message ?? e), canais: {} };
    coletas.push(stub);
    await writeFile(join(SAIDA, `${alvo.slug}.json`), JSON.stringify(stub, null, 2), "utf8");
  }
}

if (POSTS_AVULSOS.length && !PULAR.has("instagram")) {
  registrar("\n▸ posts avulsos");
  const resolvidos = [];
  for (const u of POSTS_AVULSOS) {
    const r = await varrerPost(u);
    registrar(`  ${u} → ${r.erro ?? `@${r.autor ?? "?"}`}`);
    resolvidos.push(r);
  }
  await writeFile(join(SAIDA, "posts-avulsos.json"), JSON.stringify(resolvidos, null, 2), "utf8");
}

const linhas = achatar(coletas, noPeriodo);
await writeFile(join(SAIDA, "consolidado.csv"), paraCsv(linhas), "utf8");
await writeFile(
  join(SAIDA, "consolidado.ndjson"),
  linhas.map((l) => JSON.stringify(l)).join("\n"),
  "utf8",
);
await writeFile(join(SAIDA, "RELATORIO.md"), relatorio(coletas, linhas, DESDE), "utf8");

registrar(
  `\n${linhas.length} itens · ${linhas.filter((l) => l.noPeriodo === true).length} no período · saída em ${SAIDA}`,
);
