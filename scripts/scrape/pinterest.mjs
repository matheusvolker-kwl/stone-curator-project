/**
 * Perfil do Pinterest de um alvo (Waldir Junior, Tidelli e Jader Almeida).
 *
 * O Pinterest expõe os mesmos endpoints `/resource/<Nome>Resource/get/` que o
 * próprio site usa, e pra perfil público eles costumam responder sem sessão —
 * o que torna esta a mais tranquila das três redes. O caminho é em dois passos:
 * `UserResource` dá o perfil, `BoardsResource` lista as pastas e `BoardFeedResource`
 * pagina os pins de cada uma (com bookmark de continuação).
 *
 * Se algum passo fechar, `viaNavegador` abre o perfil no Chromium e colhe os
 * pins pelo tráfego, igual ao módulo do Instagram.
 */
import { buscar, carregarChromium } from "./lib/rede.mjs";

const BASE = "https://br.pinterest.com";
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";

async function recurso(nome, opcoes, sourceUrl) {
  const url =
    `${BASE}/resource/${nome}Resource/get/` +
    `?source_url=${encodeURIComponent(sourceUrl)}` +
    `&data=${encodeURIComponent(JSON.stringify({ options: opcoes, context: {} }))}`;

  const r = await fetch(url, {
    headers: {
      "user-agent": UA,
      accept: "application/json",
      "accept-language": "pt-BR,pt;q=0.9",
      "x-requested-with": "XMLHttpRequest",
      "x-pinterest-appstate": "active",
      referer: BASE + sourceUrl,
      ...(process.env.PINTEREST_COOKIE ? { cookie: process.env.PINTEREST_COOKIE } : {}),
    },
    signal: AbortSignal.timeout(30_000),
  }).catch(() => null);

  if (!r?.ok) return null;
  const j = await r.json().catch(() => null);
  return j?.resource_response ?? null;
}

const normalizarPin = (p) => ({
  id: p.id ?? null,
  url: p.id ? `https://www.pinterest.com/pin/${p.id}/` : null,
  titulo: p.title || p.grid_title || null,
  descricao: p.description ?? p.closeup_description ?? null,
  imagem: p.images?.["orig"]?.url ?? p.images?.["736x"]?.url ?? null,
  link: p.link ?? null,
  dominio: p.domain ?? null,
  salvos: p.aggregated_pin_data?.aggregated_stats?.saves ?? p.repin_count ?? null,
  criadoEm: p.created_at ? new Date(p.created_at).toISOString() : null,
  pasta: p.board?.name ?? null,
  ehVideo: Boolean(p.videos),
});

/** Pins de uma pasta, seguindo o bookmark até acabar ou bater o teto. */
async function pinsDaPasta(boardId, caminho, { maxPaginas = 20 } = {}) {
  const pins = [];
  let bookmark = null;
  for (let i = 0; i < maxPaginas; i++) {
    const r = await recurso(
      "BoardFeed",
      { board_id: boardId, page_size: 25, ...(bookmark ? { bookmarks: [bookmark] } : {}) },
      caminho,
    );
    const lote = r?.data;
    if (!Array.isArray(lote) || !lote.length) break;
    pins.push(...lote.map(normalizarPin));
    bookmark = r?.bookmark ?? r?.bookmarks?.[0] ?? null;
    if (!bookmark || bookmark === "-end-") break;
  }
  return pins;
}

async function viaNavegador(usuario) {
  const chromium = await carregarChromium();
  if (!chromium) {
    return { usuario, pins: [], via: "playwright", erro: "playwright não instalado (npm i playwright)" };
  }

  const navegador = await chromium.launch();
  try {
    const ctx = await navegador.newContext({ userAgent: UA, locale: "pt-BR" });
    const pagina = await ctx.newPage();
    const pins = new Map();

    pagina.on("response", async (resp) => {
      if (!/\/resource\//.test(resp.url()) || !resp.ok()) return;
      const j = await resp.json().catch(() => null);
      const pilha = [j];
      while (pilha.length) {
        const n = pilha.pop();
        if (!n || typeof n !== "object") continue;
        if (Array.isArray(n)) { pilha.push(...n); continue; }
        if (n.id && (n.images || n.grid_title)) {
          const p = normalizarPin(n);
          if (!pins.has(p.id)) pins.set(p.id, p);
        }
        pilha.push(...Object.values(n));
      }
    });

    await pagina.goto(`${BASE}/${usuario}/`, { waitUntil: "domcontentloaded", timeout: 60_000 });
    await pagina.waitForTimeout(4000);
    for (let i = 0; i < 15; i++) {
      await pagina.mouse.wheel(0, 4000);
      await pagina.waitForTimeout(1500);
    }
    return { usuario, pins: [...pins.values()], via: "playwright" };
  } catch (e) {
    return { usuario, pins: [], via: "playwright", erro: String(e?.message ?? e) };
  } finally {
    await navegador.close();
  }
}

export async function varrerPinterest(usuario, { navegador = true, maxPastas = 40 } = {}) {
  const caminho = `/${usuario}/`;

  const perfilBruto = (await recurso("User", { username: usuario }, caminho))?.data;
  const pastasBrutas = (await recurso("Boards", { username: usuario, page_size: 50 }, caminho))?.data;

  if (Array.isArray(pastasBrutas) && pastasBrutas.length) {
    const pastas = [];
    for (const b of pastasBrutas.slice(0, maxPastas)) {
      pastas.push({
        id: b.id,
        nome: b.name,
        url: b.url ? `https://www.pinterest.com${b.url}` : null,
        descricao: b.description || null,
        pins: b.pin_count ?? null,
        seguidores: b.follower_count ?? null,
        criadaEm: b.created_at ? new Date(b.created_at).toISOString() : null,
        conteudo: await pinsDaPasta(b.id, b.url ?? caminho),
      });
    }
    return {
      usuario,
      perfil: perfilBruto
        ? {
            nome: perfilBruto.full_name ?? null,
            sobre: perfilBruto.about ?? null,
            site: perfilBruto.website_url ?? null,
            seguidores: perfilBruto.follower_count ?? null,
            pins: perfilBruto.pin_count ?? null,
          }
        : null,
      pastas,
      totalPins: pastas.reduce((n, p) => n + p.conteudo.length, 0),
      via: "resource",
    };
  }

  if (navegador) return { ...(await viaNavegador(usuario)), pastas: [] };

  return { usuario, perfil: null, pastas: [], pins: [], erro: "Pinterest não devolveu conteúdo" };
}
