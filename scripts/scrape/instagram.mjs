/**
 * Perfil do Instagram de um alvo.
 *
 * Aviso que vale ler antes de rodar: desde 2024 o Instagram não serve mais
 * perfil público a visitante anônimo de forma confiável — sem sessão, o normal
 * é voltar muro de login ou 401, e insistir só rende bloqueio temporário de IP.
 * Por isso este módulo tem três caminhos, do mais barato ao mais caro, e o
 * primeiro que responder ganha:
 *
 *   1. `web_profile_info` — endpoint JSON interno. Rápido e completo (bio,
 *      seguidores, últimos ~12 posts). Precisa do header x-ig-app-id.
 *   2. `?__a=1&__d=dis` — endpoint legado. Às vezes ainda passa onde o 1 falha.
 *   3. Playwright — abre o perfil no Chromium e rola a página. É o único que
 *      passa dos 12 primeiros posts, e o único que funciona logado.
 *
 * A sessão, quando você quiser usar, vem de variável de ambiente — o script
 * nunca pede nem guarda senha:
 *
 *   IG_SESSIONID=...    cookie `sessionid` da sua própria conta logada
 *   IG_STATE=caminho    storageState.json salvo por um login manual do Playwright
 *
 * Use uma conta descartável e um intervalo folgado (SCRAPE_DELAY_MS). Coletar
 * perfil comercial público pra pesquisa de mercado é uso corriqueiro, mas
 * continua sendo contra os Termos da Meta, e a conta é sua.
 */
import { buscar, carregarChromium } from "./lib/rede.mjs";

const APP_ID = "936619743392459"; // id público do cliente web, fixo há anos

const cookieDeSessao = () =>
  process.env.IG_SESSIONID ? { cookie: `sessionid=${process.env.IG_SESSIONID}` } : {};

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";

/** Normaliza um post, venha ele do endpoint JSON ou do blob da página. */
function normalizarPost(n) {
  const legenda = n.edge_media_to_caption?.edges?.[0]?.node?.text ?? n.caption?.text ?? null;
  const code = n.shortcode ?? n.code ?? null;
  return {
    id: n.id ?? null,
    shortcode: code,
    url: code ? `https://www.instagram.com/p/${code}/` : null,
    tipo: n.__typename ?? n.media_type ?? null,
    legenda,
    hashtags: [...new Set((legenda?.match(/#[\wÀ-ÿ]+/g) ?? []))],
    mencoes: [...new Set((legenda?.match(/@[\w.]+/g) ?? []))],
    publicadoEm: n.taken_at_timestamp
      ? new Date(n.taken_at_timestamp * 1000).toISOString()
      : n.taken_at ? new Date(n.taken_at * 1000).toISOString() : null,
    curtidas: n.edge_liked_by?.count ?? n.edge_media_preview_like?.count ?? n.like_count ?? null,
    comentarios: n.edge_media_to_comment?.count ?? n.comment_count ?? null,
    visualizacoes: n.video_view_count ?? n.play_count ?? null,
    imagem: n.display_url ?? n.thumbnail_url ?? n.image_versions2?.candidates?.[0]?.url ?? null,
    video: n.video_url ?? null,
    ehVideo: Boolean(n.is_video ?? n.video_url),
    local: n.location?.name ?? null,
    alt: n.accessibility_caption ?? null,
  };
}

function normalizarPerfil(u) {
  return {
    usuario: u.username,
    nome: u.full_name ?? null,
    bio: u.biography ?? null,
    site: u.external_url ?? null,
    seguidores: u.edge_followed_by?.count ?? u.follower_count ?? null,
    seguindo: u.edge_follow?.count ?? u.following_count ?? null,
    publicacoes: u.edge_owner_to_timeline_media?.count ?? u.media_count ?? null,
    verificado: Boolean(u.is_verified),
    ehComercial: Boolean(u.is_business_account),
    categoria: u.category_name ?? u.business_category_name ?? null,
    foto: u.profile_pic_url_hd ?? u.profile_pic_url ?? null,
  };
}

async function viaApiInterna(usuario) {
  const r = await fetch(
    `https://www.instagram.com/api/v1/users/web_profile_info/?username=${encodeURIComponent(usuario)}`,
    {
      headers: {
        "user-agent": UA,
        "x-ig-app-id": APP_ID,
        accept: "*/*",
        "accept-language": "pt-BR,pt;q=0.9",
        ...cookieDeSessao(),
      },
      signal: AbortSignal.timeout(30_000),
    },
  ).catch(() => null);

  if (!r?.ok) return null;
  const u = (await r.json().catch(() => null))?.data?.user;
  if (!u) return null;

  return {
    perfil: normalizarPerfil(u),
    posts: (u.edge_owner_to_timeline_media?.edges ?? []).map((e) => normalizarPost(e.node)),
    via: "web_profile_info",
  };
}

async function viaEndpointLegado(usuario) {
  const r = await buscar(`https://www.instagram.com/${usuario}/?__a=1&__d=dis`);
  if (!r.ok || !r.html) return null;
  try {
    const u = JSON.parse(r.html)?.graphql?.user ?? JSON.parse(r.html)?.user;
    if (!u) return null;
    return {
      perfil: normalizarPerfil(u),
      posts: (u.edge_owner_to_timeline_media?.edges ?? []).map((e) => normalizarPost(e.node)),
      via: "__a=1",
    };
  } catch {
    return null;
  }
}

/**
 * Chromium com scroll. É o caminho que passa dos 12 primeiros posts: a cada
 * rolagem o app pede a próxima página e a resposta passa pelo interceptador
 * abaixo, então a coleta sai do tráfego real em vez de tentar remontar o DOM.
 */
async function viaNavegador(usuario, { rolagens = 12 } = {}) {
  const chromium = await carregarChromium();
  if (!chromium) {
    return {
      perfil: { usuario }, posts: [], via: "playwright",
      erro: "playwright não instalado (npm i playwright)",
    };
  }

  const navegador = await chromium.launch();
  try {
    const ctx = await navegador.newContext({
      userAgent: UA,
      locale: "pt-BR",
      ...(process.env.IG_STATE ? { storageState: process.env.IG_STATE } : {}),
    });
    if (process.env.IG_SESSIONID && !process.env.IG_STATE) {
      await ctx.addCookies([{
        name: "sessionid",
        value: process.env.IG_SESSIONID,
        domain: ".instagram.com",
        path: "/",
      }]);
    }

    const pagina = await ctx.newPage();
    const colhidos = new Map();

    pagina.on("response", async (resp) => {
      const u = resp.url();
      if (!/\/api\/v1\/|graphql/.test(u) || !resp.ok()) return;
      const corpo = await resp.json().catch(() => null);
      if (!corpo) return;
      // O shape muda conforme a rota; varrer atrás de shortcode/code é o que
      // sobrevive a essas trocas.
      const pilha = [corpo];
      while (pilha.length) {
        const n = pilha.pop();
        if (!n || typeof n !== "object") continue;
        if (Array.isArray(n)) { pilha.push(...n); continue; }
        if (n.shortcode || n.code) {
          const p = normalizarPost(n);
          if (p.shortcode && !colhidos.has(p.shortcode)) colhidos.set(p.shortcode, p);
        }
        pilha.push(...Object.values(n));
      }
    });

    await pagina.goto(`https://www.instagram.com/${usuario}/`, {
      waitUntil: "domcontentloaded",
      timeout: 60_000,
    });
    await pagina.waitForTimeout(4000);

    const html = await pagina.content();
    const muroDeLogin = /Entre no Instagram|Log in to Instagram|loginForm/i.test(html);

    for (let i = 0; i < rolagens; i++) {
      await pagina.mouse.wheel(0, 4000);
      await pagina.waitForTimeout(1800);
    }

    // Sem sessão, o pouco que dá pra ver está nos links do DOM.
    if (!colhidos.size) {
      for (const code of new Set([...html.matchAll(/"shortcode":"([\w-]{5,})"/g)].map((m) => m[1]))) {
        colhidos.set(code, { shortcode: code, url: `https://www.instagram.com/p/${code}/` });
      }
    }

    const bio = html.match(/"biography":"((?:[^"\\]|\\.)*)"/)?.[1];
    return {
      perfil: {
        usuario,
        bio: bio ? JSON.parse(`"${bio}"`) : null,
        seguidores: Number(html.match(/"edge_followed_by":\{"count":(\d+)/)?.[1] ?? 0) || null,
        publicacoes: Number(html.match(/"edge_owner_to_timeline_media":\{"count":(\d+)/)?.[1] ?? 0) || null,
      },
      posts: [...colhidos.values()],
      via: "playwright",
      muroDeLogin,
    };
  } catch (e) {
    return { perfil: { usuario }, posts: [], via: "playwright", erro: String(e?.message ?? e) };
  } finally {
    await navegador.close();
  }
}

/** Tenta os três caminhos em ordem de custo e devolve o primeiro que trouxe posts. */
export async function varrerInstagram(usuario, { navegador = true } = {}) {
  const tentativas = [];

  for (const passo of [viaApiInterna, viaEndpointLegado]) {
    const r = await passo(usuario).catch(() => null);
    tentativas.push({ via: passo.name, ok: Boolean(r?.posts?.length) });
    if (r?.posts?.length) return { ...r, usuario, tentativas };
  }

  if (navegador) {
    const r = await viaNavegador(usuario).catch(() => null);
    tentativas.push({ via: "viaNavegador", ok: Boolean(r?.posts?.length) });
    if (r) return { ...r, usuario, tentativas };
  }

  return {
    usuario,
    perfil: null,
    posts: [],
    tentativas,
    erro: "Instagram não devolveu conteúdo — normal sem sessão. Defina IG_SESSIONID ou IG_STATE.",
  };
}

/** Um post isolado, pela URL — resolve o /p/<code>/ que veio solto na lista. */
export async function varrerPost(url) {
  const code = url.match(/\/(?:p|reel|tv)\/([\w-]+)/)?.[1];
  if (!code) return { url, erro: "URL de post não reconhecida" };

  const r = await fetch(`https://www.instagram.com/api/v1/media/shortcode/${code}/info/`, {
    headers: { "user-agent": UA, "x-ig-app-id": APP_ID, ...cookieDeSessao() },
    signal: AbortSignal.timeout(30_000),
  }).catch(() => null);

  if (r?.ok) {
    const item = (await r.json().catch(() => null))?.items?.[0];
    if (item) {
      return {
        ...normalizarPost(item),
        // Depois do spread de propósito: normalizarPost reconstrói a URL como
        // /p/<code>/, e um /reel/ que veio na entrada viraria outra coisa. A
        // URL pedida é a que o chamador precisa reconhecer de volta.
        url,
        shortcode: code,
        autor: item.user?.username ?? null,
        via: "media/shortcode",
      };
    }
  }

  // O oEmbed público devolve autor e legenda mesmo quando o resto fecha.
  const oe = await buscar(`https://www.instagram.com/p/${code}/embed/captioned/`);
  if (oe.ok && oe.html) {
    const autor = oe.html.match(/instagram\.com\/([\w.]+)\/"\s*[^>]*>\s*<[^>]*>\s*([\w.]+)/)?.[1];
    const legenda = oe.html.match(/class="Caption"[\s\S]*?<\/div>/)?.[0];
    return {
      url,
      shortcode: code,
      autor: autor ?? null,
      legenda: legenda ? legenda.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() : null,
      via: "embed",
    };
  }

  return { url, shortcode: code, erro: "post não acessível sem sessão" };
}
