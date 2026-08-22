/**
 * Varredura do site próprio de um alvo.
 *
 * Duas fontes de URL, somadas: o sitemap (quando existe, é a lista que o
 * próprio dono publica — e traz `lastmod`, a melhor data que vamos conseguir)
 * e um BFS a partir da home, que pega o que ficou de fora do sitemap. Um
 * portfólio de arquitetura costuma ter as duas lacunas: sitemap velho e páginas
 * de projeto só linkadas do menu.
 */
import { buscar, buscarRenderizado, sitemapsDoRobots } from "./lib/rede.mjs";
import { extrairPagina } from "./lib/extrair.mjs";

/** Extensões que não são página: baixar não acrescenta texto e custa banda. */
const BINARIO = /\.(jpe?g|png|gif|webp|avif|svg|ico|mp4|webm|mov|mp3|wav|zip|rar|dwg|woff2?|ttf|eot|css|js|json|xml)(\?|$)/i;
export const SITEMAPS_COMUNS = [
  "/sitemap.xml", "/sitemap_index.xml", "/sitemap-index.xml",
  "/wp-sitemap.xml", "/page-sitemap.xml", "/post-sitemap.xml",
  "/product-sitemap.xml", "/sitemap/sitemap-index.xml",
];

const semFragmento = (u) => {
  try {
    const url = new URL(u);
    url.hash = "";
    // Rastro de campanha muda a URL sem mudar a página; sem limpar, a mesma
    // página entra na fila várias vezes e o limite estoura em duplicata.
    for (const p of [...url.searchParams.keys()]) {
      if (/^(utm_|fbclid|gclid|mc_|_ga)/i.test(p)) url.searchParams.delete(p);
    }
    return url.href;
  } catch {
    return null;
  }
};

/** Lê um sitemap; se for índice, desce nos filhos. Devolve {loc, lastmod}. */
async function lerSitemap(url, vistos = new Set(), profundidade = 0) {
  if (profundidade > 3 || vistos.has(url)) return [];
  vistos.add(url);

  const r = await buscar(url);
  if (!r.ok || !r.html) return [];
  const xml = r.html;

  const filhos = [...xml.matchAll(/<sitemap>[\s\S]*?<loc>\s*([^<\s]+)\s*<\/loc>[\s\S]*?<\/sitemap>/gi)];
  if (filhos.length) {
    const out = [];
    for (const f of filhos) out.push(...(await lerSitemap(f[1].trim(), vistos, profundidade + 1)));
    return out;
  }

  const out = [];
  for (const m of xml.matchAll(/<url>([\s\S]*?)<\/url>/gi)) {
    const loc = m[1].match(/<loc>\s*([^<\s]+)\s*<\/loc>/i)?.[1];
    if (!loc) continue;
    out.push({
      loc: loc.trim(),
      lastmod: m[1].match(/<lastmod>\s*([^<\s]+)\s*<\/lastmod>/i)?.[1] ?? null,
    });
  }
  return out;
}

async function descobrirSitemaps(raiz) {
  const { origin, host } = new URL(raiz);
  const candidatos = new Set(await sitemapsDoRobots(host));
  for (const c of SITEMAPS_COMUNS) candidatos.add(origin + c);

  const entradas = new Map();
  const vistos = new Set();
  for (const s of candidatos) {
    for (const e of await lerSitemap(s, vistos)) {
      // Mesma URL pode vir de dois sitemaps; fica o lastmod mais recente.
      const anterior = entradas.get(e.loc);
      if (!anterior || (e.lastmod ?? "") > (anterior.lastmod ?? "")) entradas.set(e.loc, e);
    }
  }
  return entradas;
}

/**
 * O escopo do crawl. Comparo pelo host sem `www.` porque metade destes sites
 * linka a própria home nas duas formas, e tratá-las como domínios diferentes
 * faria o BFS parar na primeira página.
 */
const mesmoEscopo = (u, raiz) => {
  try {
    const a = new URL(u);
    const b = new URL(raiz);
    return a.host.replace(/^www\./, "") === b.host.replace(/^www\./, "");
  } catch {
    return false;
  }
};

/**
 * Varre um alvo inteiro e devolve as páginas extraídas.
 *
 * @param {object} alvo item de ALVOS
 * @param {{max?:number, render?:boolean, aoAndar?:Function}} opcoes
 */
export async function varrerSite(alvo, { max = 400, render = false, aoAndar } = {}) {
  const raiz = alvo.site?.raiz;
  if (!raiz) return { paginas: [], sitemap: [], erros: [] };

  const sitemap = await descobrirSitemaps(raiz);

  const fila = [];
  const enfileirados = new Set();
  const enfileirar = (u, origem) => {
    const limpa = semFragmento(u);
    if (!limpa || enfileirados.has(limpa) || BINARIO.test(limpa)) return;
    if (!mesmoEscopo(limpa, raiz) && !(alvo.site.extras ?? []).some((e) => mesmoEscopo(limpa, e))) return;
    enfileirados.add(limpa);
    fila.push({ url: limpa, origem });
  };

  enfileirar(raiz, "raiz");
  for (const e of alvo.site.extras ?? []) enfileirar(e, "extra");
  // Sitemap primeiro: é a lista curada pelo dono, e se o limite cortar, corta
  // no BFS (que descobre repetido) e não no que o site declara importar.
  for (const loc of sitemap.keys()) enfileirar(loc, "sitemap");

  const paginas = [];
  const erros = [];

  while (fila.length && paginas.length < max) {
    const { url, origem } = fila.shift();
    const r = render ? await buscarRenderizado(url) : await buscar(url);

    if (!r.ok || !r.html) {
      erros.push({ url, status: r.status ?? 0, erro: r.erro ?? `HTTP ${r.status}` });
      aoAndar?.({ url, ok: false, feitas: paginas.length, fila: fila.length });
      continue;
    }
    if (r.tipo && !/html|xml/i.test(r.tipo)) continue;

    const pagina = extrairPagina(r.html, r.urlFinal ?? url);
    pagina.origemDescoberta = origem;
    pagina.lastmodSitemap = sitemap.get(url)?.lastmod ?? null;
    pagina.httpLastModified = r.lastModified ?? null;
    pagina.renderizado = Boolean(r.renderizado);
    paginas.push(pagina);

    for (const l of pagina.links) enfileirar(l.url, url);
    aoAndar?.({ url, ok: true, feitas: paginas.length, fila: fila.length });
  }

  return {
    paginas,
    sitemap: [...sitemap.values()],
    erros,
    truncado: fila.length > 0,
    restantes: fila.length,
  };
}
