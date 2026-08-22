/**
 * Canal do YouTube de um alvo.
 *
 * Duas fontes, porque nenhuma basta sozinha:
 *
 * - o feed RSS (`/feeds/videos.xml`) é estável e traz data de publicação exata,
 *   mas só devolve os ~15 vídeos mais recentes;
 * - o `ytInitialData` da aba /videos traz o catálogo inteiro via continuation,
 *   mas a data vem como "há 3 meses" — texto relativo, inútil pra ordenar.
 *
 * Então: pagina tudo pelo ytInitialData e usa o RSS pra carimbar data exata nos
 * que aparecem nos dois. Quem só aparece no ytInitialData fica com a data
 * aproximada e `dataExata:false`, pro filtro de 2025 saber no que confiar.
 */
import { buscar } from "./lib/rede.mjs";

const YT = "https://www.youtube.com";

/** Aceita @handle, /channel/UC..., /user/nome ou o ID cru. */
export function urlDoCanal({ canalId, handle, usuario } = {}) {
  if (canalId) return `${YT}/channel/${canalId}`;
  if (handle) return `${YT}/${handle.startsWith("@") ? handle : "@" + handle}`;
  if (usuario) return `${YT}/user/${usuario}`;
  return null;
}

/** O ID canônico (UC...) — é o que o RSS exige; handle não serve. */
export async function resolverCanalId(cfg) {
  if (cfg.canalId) return cfg.canalId;
  const base = urlDoCanal(cfg);
  if (!base) return null;
  const r = await buscar(base);
  if (!r.ok || !r.html) return null;
  return (
    r.html.match(/"(?:externalId|channelId)"\s*:\s*"(UC[\w-]{22})"/)?.[1] ??
    r.html.match(/channel_id=(UC[\w-]{22})/)?.[1] ??
    r.html.match(/\/channel\/(UC[\w-]{22})/)?.[1] ??
    null
  );
}

function entradasDoRss(xml) {
  const out = [];
  for (const m of xml.matchAll(/<entry>([\s\S]*?)<\/entry>/gi)) {
    const e = m[1];
    const campo = (t) => e.match(new RegExp(`<${t}[^>]*>([\\s\\S]*?)</${t}>`, "i"))?.[1]?.trim() ?? null;
    const id = campo("yt:videoId");
    if (!id) continue;
    out.push({
      videoId: id,
      titulo: campo("title"),
      url: `${YT}/watch?v=${id}`,
      publicadoEm: campo("published"),
      atualizadoEm: campo("updated"),
      canal: campo("name"),
      descricao: campo("media:description"),
      views: Number(e.match(/<media:statistics\s+views="(\d+)"/i)?.[1] ?? 0) || null,
      curtidas: Number(e.match(/starRating[^>]*count="(\d+)"/i)?.[1] ?? 0) || null,
      thumb: e.match(/<media:thumbnail\s+url="([^"]+)"/i)?.[1] ?? null,
      fonte: "rss",
      dataExata: true,
    });
  }
  return out;
}

export async function viaRss(canalId) {
  const r = await buscar(`${YT}/feeds/videos.xml?channel_id=${canalId}`);
  return r.ok && r.html ? entradasDoRss(r.html) : [];
}

/** O blob JSON que o YouTube injeta na página; é onde está o catálogo. */
function ytInitialData(html) {
  const m =
    html.match(/ytInitialData"?\]?\s*=\s*(\{[\s\S]*?\});\s*<\/script>/) ||
    html.match(/ytInitialData\s*=\s*(\{[\s\S]*?\});/);
  if (!m) return null;
  try {
    return JSON.parse(m[1]);
  } catch {
    return null;
  }
}

/** Anda o JSON inteiro e junta todo objeto que tenha a chave pedida. */
function colher(no, chave, saida = []) {
  if (!no || typeof no !== "object") return saida;
  if (Array.isArray(no)) {
    for (const i of no) colher(i, chave, saida);
    return saida;
  }
  if (Object.prototype.hasOwnProperty.call(no, chave)) saida.push(no[chave]);
  for (const v of Object.values(no)) colher(v, chave, saida);
  return saida;
}

const textoDe = (n) =>
  n?.simpleText ?? (Array.isArray(n?.runs) ? n.runs.map((r) => r.text).join("") : null);

/**
 * "há 3 meses" / "3 months ago" → data aproximada. Serve só pra decidir se o
 * vídeo pode ser de 2025+; a data exata, quando importa, vem do RSS.
 */
export function dataAproximada(rotulo, agora = new Date()) {
  if (!rotulo) return null;
  const m = rotulo.match(/(\d+)\s*(segundo|minuto|hora|dia|semana|m[eê]s|ano|second|minute|hour|day|week|month|year)/i);
  if (!m) return null;
  const n = Number(m[1]);
  const u = m[2].toLowerCase();
  const d = new Date(agora);
  if (/seg|sec/.test(u)) d.setSeconds(d.getSeconds() - n);
  else if (/min/.test(u)) d.setMinutes(d.getMinutes() - n);
  else if (/hora|hour/.test(u)) d.setHours(d.getHours() - n);
  else if (/dia|day/.test(u)) d.setDate(d.getDate() - n);
  else if (/semana|week/.test(u)) d.setDate(d.getDate() - n * 7);
  else if (/m[eê]s|month/.test(u)) d.setMonth(d.getMonth() - n);
  else if (/ano|year/.test(u)) d.setFullYear(d.getFullYear() - n);
  return d.toISOString();
}

function videosDoBlob(blob) {
  const out = [];
  // richItemRenderer é o grid novo; gridVideoRenderer o antigo. Os dois ainda
  // aparecem dependendo do A/B que o YouTube estiver servindo.
  for (const v of [...colher(blob, "videoRenderer"), ...colher(blob, "gridVideoRenderer"), ...colher(blob, "reelItemRenderer")]) {
    if (!v?.videoId) continue;
    const publicadoTexto = textoDe(v.publishedTimeText);
    out.push({
      videoId: v.videoId,
      titulo: textoDe(v.title),
      url: `${YT}/watch?v=${v.videoId}`,
      publicadoTexto,
      publicadoEm: dataAproximada(publicadoTexto),
      dataExata: false,
      duracao: textoDe(v.lengthText),
      viewsTexto: textoDe(v.viewCountText) ?? textoDe(v.shortViewCountText),
      descricao: textoDe(v.descriptionSnippet) ?? null,
      thumb: v.thumbnail?.thumbnails?.at(-1)?.url ?? null,
      fonte: "ytInitialData",
    });
  }
  return out;
}

/**
 * Catálogo completo da aba /videos, seguindo os tokens de continuation.
 * O `maxPaginas` existe porque canal grande pagina indefinidamente e a coleta
 * de 2025+ não precisa descer até 2014.
 */
export async function viaCatalogo(canalId, { maxPaginas = 12 } = {}) {
  const r = await buscar(`${YT}/channel/${canalId}/videos`);
  if (!r.ok || !r.html) return [];

  const blob = ytInitialData(r.html);
  if (!blob) return [];

  const videos = new Map();
  for (const v of videosDoBlob(blob)) videos.set(v.videoId, v);

  const apiKey = r.html.match(/"INNERTUBE_API_KEY"\s*:\s*"([^"]+)"/)?.[1];
  const versao = r.html.match(/"clientVersion"\s*:\s*"([\d.]+)"/)?.[1] ?? "2.20240101.00.00";
  let token = colher(blob, "continuationItemRenderer")
    .map((c) => c?.continuationEndpoint?.continuationCommand?.token)
    .find(Boolean);

  for (let p = 0; token && apiKey && p < maxPaginas; p++) {
    let proximo = null;
    try {
      const resp = await fetch(`${YT}/youtubei/v1/browse?key=${apiKey}`, {
        method: "POST",
        headers: { "content-type": "application/json", "accept-language": "pt-BR,pt;q=0.9" },
        body: JSON.stringify({
          context: { client: { clientName: "WEB", clientVersion: versao, hl: "pt", gl: "BR" } },
          continuation: token,
        }),
        signal: AbortSignal.timeout(30_000),
      });
      if (!resp.ok) break;
      const dados = await resp.json();
      const novos = videosDoBlob(dados);
      if (!novos.length) break;
      for (const v of novos) if (!videos.has(v.videoId)) videos.set(v.videoId, v);
      proximo = colher(dados, "continuationItemRenderer")
        .map((c) => c?.continuationEndpoint?.continuationCommand?.token)
        .find(Boolean);
    } catch {
      break;
    }
    if (proximo === token) break;
    token = proximo;
  }

  return [...videos.values()];
}

/** Canal inteiro: catálogo paginado + datas exatas do RSS onde houver. */
export async function varrerYoutube(cfg) {
  const canalId = await resolverCanalId(cfg);
  if (!canalId) return { canalId: null, videos: [], erro: "não consegui resolver o channelId" };

  const [rss, catalogo] = await Promise.all([viaRss(canalId), viaCatalogo(canalId)]);

  const porId = new Map(catalogo.map((v) => [v.videoId, v]));
  for (const v of rss) {
    porId.set(v.videoId, { ...(porId.get(v.videoId) ?? {}), ...v });
  }

  const videos = [...porId.values()].sort((a, b) =>
    String(b.publicadoEm ?? "").localeCompare(String(a.publicadoEm ?? "")),
  );

  return { canalId, url: `${YT}/channel/${canalId}`, videos, viaRss: rss.length, viaCatalogo: catalogo.length };
}
