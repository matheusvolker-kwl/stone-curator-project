/**
 * Camada de rede do scrap: cache em disco, retry com backoff, rate-limit por
 * host e leitura de robots.txt.
 *
 * O cache é o que torna o scrap "completo" viável: extrair bem um site é
 * tentativa e erro, e sem cache cada ajuste no seletor custaria uma nova
 * varredura inteira no servidor do outro. Com ele, a rede roda uma vez e as
 * releituras saem do disco — o `--reextrair` do run.mjs depende disso.
 */
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
export const CACHE_DIR = join(__dirname, "..", "..", "..", ".cache", "scrape");

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";

/** Intervalo mínimo entre dois hits no mesmo host (ms). */
const INTERVALO_HOST = Number(process.env.SCRAPE_DELAY_MS ?? 1200);

const ultimoHit = new Map();
const robotsPorHost = new Map();

const dormir = (ms) => new Promise((r) => setTimeout(r, ms));

/** Espera o suficiente pra não passar de 1 request por INTERVALO_HOST no host. */
async function aguardarVez(host) {
  const anterior = ultimoHit.get(host) ?? 0;
  const espera = anterior + INTERVALO_HOST - Date.now();
  if (espera > 0) await dormir(espera);
  ultimoHit.set(host, Date.now());
}

const chaveCache = (url) => createHash("sha1").update(url).digest("hex");

async function lerCache(url) {
  try {
    const bruto = await readFile(join(CACHE_DIR, chaveCache(url) + ".json"), "utf8");
    return JSON.parse(bruto);
  } catch {
    return null;
  }
}

async function gravarCache(url, registro) {
  await mkdir(CACHE_DIR, { recursive: true });
  await writeFile(
    join(CACHE_DIR, chaveCache(url) + ".json"),
    JSON.stringify(registro),
    "utf8",
  );
}

/**
 * robots.txt do host, já quebrado em regras do nosso User-agent (com fallback
 * pro `*`). Guarda em memória porque um crawl toca o mesmo host centenas de vezes.
 */
async function robots(host) {
  if (robotsPorHost.has(host)) return robotsPorHost.get(host);
  const promessa = (async () => {
    try {
      const r = await fetch(`https://${host}/robots.txt`, {
        headers: { "user-agent": UA },
        signal: AbortSignal.timeout(15_000),
      });
      if (!r.ok) return { proibidos: [], sitemaps: [] };
      return parseRobots(await r.text());
    } catch {
      return { proibidos: [], sitemaps: [] };
    }
  })();
  robotsPorHost.set(host, promessa);
  return promessa;
}

export function parseRobots(txt) {
  const proibidos = [];
  const sitemaps = [];
  let valeParaNos = false;
  for (const linha of txt.split(/\r?\n/)) {
    const limpa = linha.replace(/#.*$/, "").trim();
    if (!limpa) continue;
    const [chaveBruta, ...resto] = limpa.split(":");
    const chave = chaveBruta.trim().toLowerCase();
    const valor = resto.join(":").trim();
    if (chave === "sitemap") sitemaps.push(valor);
    else if (chave === "user-agent") valeParaNos = valor === "*";
    else if (chave === "disallow" && valeParaNos && valor) proibidos.push(valor);
  }
  return { proibidos, sitemaps };
}

/** Um Disallow casa por prefixo de path — é o suficiente pro que enfrentamos aqui. */
export const bloqueadoPorRobots = (caminho, proibidos) =>
  proibidos.some((p) => caminho.startsWith(p));

export async function sitemapsDoRobots(host) {
  return (await robots(host)).sitemaps;
}

/**
 * Busca uma URL com cache, retry e rate-limit.
 *
 * Retorna sempre um registro — `{ ok:false, erro }` no lugar de exceção, porque
 * um alvo fora do ar não pode derrubar a varredura dos outros 18. O relatório
 * final lê esse campo pra distinguir "não existe" de "não consegui ler".
 */
export async function buscar(url, { tentativas = 3, semCache = false, timeout = 30_000 } = {}) {
  if (!semCache) {
    const guardado = await lerCache(url);
    if (guardado) return { ...guardado, doCache: true };
  }

  const { host, pathname } = new URL(url);

  if (process.env.SCRAPE_IGNORAR_ROBOTS !== "1") {
    const { proibidos } = await robots(host);
    if (bloqueadoPorRobots(pathname, proibidos)) {
      const registro = { url, ok: false, erro: "bloqueado por robots.txt", status: 0 };
      await gravarCache(url, registro);
      return registro;
    }
  }

  let ultimoErro = "";
  for (let i = 0; i < tentativas; i++) {
    await aguardarVez(host);
    try {
      const r = await fetch(url, {
        headers: {
          "user-agent": UA,
          accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "accept-language": "pt-BR,pt;q=0.9,en;q=0.8",
        },
        redirect: "follow",
        signal: AbortSignal.timeout(timeout),
      });

      // 429/5xx são temporários: vale esperar e insistir. 4xx restante é
      // definitivo — insistir só queima tempo e simpatia do servidor.
      if (r.status === 429 || r.status >= 500) {
        ultimoErro = `HTTP ${r.status}`;
        await dormir(2000 * 2 ** i);
        continue;
      }

      const corpo = await r.text();
      const registro = {
        url,
        urlFinal: r.url,
        ok: r.ok,
        status: r.status,
        tipo: r.headers.get("content-type") ?? "",
        lastModified: r.headers.get("last-modified") ?? null,
        html: corpo,
        buscadoEm: new Date().toISOString(),
      };
      await gravarCache(url, registro);
      return registro;
    } catch (e) {
      ultimoErro = String(e?.message ?? e);
      await dormir(2000 * 2 ** i);
    }
  }

  const registro = { url, ok: false, status: 0, erro: ultimoErro };
  await gravarCache(url, registro);
  return registro;
}

/**
 * Carrega o Playwright sob demanda, devolvendo `null` se ele não estiver
 * instalado.
 *
 * Ele é opcional: site, YouTube e Pinterest coletam só com Node. Sem este
 * embrulho, o `Cannot find package 'playwright'` sobe como exceção e leva junto
 * o alvo inteiro — inclusive as páginas de site que já tinham sido coletadas
 * com sucesso antes de chegar no canal que pede navegador.
 */
export async function carregarChromium() {
  try {
    return (await import("playwright")).chromium;
  } catch {
    return null;
  }
}

/**
 * Mesma ideia da `buscar`, mas com Chromium: para os alvos que montam o
 * conteúdo no cliente (Wix, Squarespace, Webflow, Next hidratado), o HTML cru
 * volta como casca vazia e só o DOM renderizado tem os produtos e as datas.
 */
export async function buscarRenderizado(url, { timeout = 45_000, esperaExtra = 2500 } = {}) {
  const guardado = await lerCache("render::" + url);
  if (guardado) return { ...guardado, doCache: true };

  const chromium = await carregarChromium();
  if (!chromium) {
    return { url, ok: false, status: 0, erro: "playwright não instalado (npm i playwright)" };
  }

  const navegador = await chromium.launch({
    executablePath: process.env.PLAYWRIGHT_CHROMIUM ?? undefined,
  });
  try {
    const ctx = await navegador.newContext({ userAgent: UA, locale: "pt-BR" });
    const pagina = await ctx.newPage();
    const resposta = await pagina.goto(url, { waitUntil: "domcontentloaded", timeout });
    // networkidle estoura em site com poll/analytics eterno; o catch deixa
    // seguir com o que já pintou em vez de perder a página inteira.
    await pagina.waitForLoadState("networkidle", { timeout: 12_000 }).catch(() => {});
    await pagina.waitForTimeout(esperaExtra);
    const registro = {
      url,
      urlFinal: pagina.url(),
      ok: (resposta?.status() ?? 0) < 400,
      status: resposta?.status() ?? 0,
      tipo: "text/html",
      html: await pagina.content(),
      renderizado: true,
      buscadoEm: new Date().toISOString(),
    };
    await gravarCache("render::" + url, registro);
    return registro;
  } catch (e) {
    return { url, ok: false, status: 0, erro: String(e?.message ?? e), renderizado: true };
  } finally {
    await navegador.close();
  }
}
