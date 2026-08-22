/**
 * Extração de conteúdo de HTML, sem dependência externa.
 *
 * Sem parser DOM de propósito: o script precisa rodar em clone limpo, sem
 * `npm install`, e as páginas de portfólio de arquitetura chegam a alguns MB de
 * markup — montar um DOM inteiro pra ler `<meta>` e `<img>` sai caro à toa.
 * O que existe aqui é um tokenizador de tags que respeita aspas nos atributos,
 * que é onde o regex ingênuo erra.
 */

const ENTIDADES = {
  amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", ndash: "–",
  mdash: "—", hellip: "…", lsquo: "'", rsquo: "'", ldquo: '"', rdquo: '"',
  eacute: "é", egrave: "è", ecirc: "ê", aacute: "á", agrave: "à", acirc: "â",
  atilde: "ã", oacute: "ó", ocirc: "ô", otilde: "õ", uacute: "ú", ccedil: "ç",
  iacute: "í", ordf: "ª", ordm: "º", deg: "°", euro: "€", pound: "£", copy: "©",
  reg: "®", trade: "™", laquo: "«", raquo: "»", middot: "·", bull: "•",
};

export function decodificar(s) {
  if (!s) return "";
  return s.replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z][a-zA-Z0-9]*);/g, (todo, ref) => {
    if (ref[0] === "#") {
      const cod = ref[1] === "x" || ref[1] === "X"
        ? parseInt(ref.slice(2), 16)
        : parseInt(ref.slice(1), 10);
      return Number.isFinite(cod) && cod > 0 ? String.fromCodePoint(cod) : todo;
    }
    const chave = ref.toLowerCase();
    return Object.prototype.hasOwnProperty.call(ENTIDADES, chave) ? ENTIDADES[chave] : todo;
  });
}

/**
 * Percorre as tags do documento. O `[^>"']|"[^"]*"|'[^']*'` é o detalhe que
 * importa: sem ele, um atributo tipo alt="Sala 3 > 4" fecharia a tag no lugar
 * errado e todo o resto sairia deslocado.
 */
export function* tags(html) {
  const re = /<\/?([a-zA-Z][a-zA-Z0-9:-]*)((?:[^>"']|"[^"]*"|'[^']*')*)>/g;
  let m;
  while ((m = re.exec(html)) !== null) {
    yield {
      nome: m[1].toLowerCase(),
      fechamento: m[0][1] === "/",
      attrsBrutos: m[2] ?? "",
      indice: m.index,
      fim: re.lastIndex,
    };
  }
}

export function atributos(brutos) {
  const out = {};
  const re = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*(?:=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
  let m;
  while ((m = re.exec(brutos)) !== null) {
    out[m[1].toLowerCase()] = decodificar(m[2] ?? m[3] ?? m[4] ?? "");
  }
  return out;
}

/** Conteúdo interno de cada ocorrência de uma tag que não aninha (script, style, title). */
export function conteudoDe(html, nome) {
  const re = new RegExp(`<${nome}\\b((?:[^>"']|"[^"]*"|'[^']*')*)>([\\s\\S]*?)</${nome}\\s*>`, "gi");
  const out = [];
  let m;
  while ((m = re.exec(html)) !== null) out.push({ attrs: atributos(m[1]), corpo: m[2] });
  return out;
}

const SEM_TEXTO = /<(script|style|noscript|svg|template)\b[^>]*>[\s\S]*?<\/\1\s*>/gi;
const QUEBRA = /<\/?(p|div|br|li|tr|h[1-6]|section|article|header|footer|nav|blockquote)\b[^>]*>/gi;

/** Texto legível da página: sem script/style, com quebra onde o bloco quebrava. */
export function texto(html) {
  return decodificar(
    html.replace(SEM_TEXTO, " ").replace(QUEBRA, "\n").replace(/<[^>]+>/g, " "),
  )
    .replace(/[ \t ]+/g, " ")
    .replace(/\n\s*\n\s*\n+/g, "\n\n")
    .split("\n").map((l) => l.trim()).join("\n")
    .trim();
}

/** Texto de um trecho já delimitado, achatado numa linha só. */
const linha = (frag) => texto(frag).replace(/\s*\n\s*/g, " ").trim();

/** JSON-LD é a fonte mais confiável de data, preço e tipo — quando existe. */
export function jsonLd(html) {
  const achados = [];
  for (const { attrs, corpo } of conteudoDe(html, "script")) {
    if (!/ld\+json/i.test(attrs.type ?? "")) continue;
    try {
      // Alguns CMS emitem vários objetos no mesmo bloco, ou @graph aninhado.
      const dado = JSON.parse(corpo.trim().replace(/^﻿/, ""));
      for (const item of Array.isArray(dado) ? dado : [dado]) {
        if (item && Array.isArray(item["@graph"])) achados.push(...item["@graph"]);
        else if (item) achados.push(item);
      }
    } catch {
      // Bloco malformado é comum e não vale derrubar a extração da página.
    }
  }
  return achados;
}

const abs = (href, base) => {
  try {
    return new URL(href, base).href;
  } catch {
    return null;
  }
};

/** srcset traz as variações de resolução; a maior costuma ser a que presta. */
function maiorDoSrcset(srcset, base) {
  if (!srcset) return null;
  let melhor = null;
  let melhorLargura = -1;
  for (const parte of srcset.split(",")) {
    const [u, desc] = parte.trim().split(/\s+/);
    if (!u) continue;
    const largura = desc?.endsWith("w")
      ? parseInt(desc, 10)
      : desc?.endsWith("x") ? parseFloat(desc) * 1000 : 0;
    if (largura > melhorLargura) {
      melhorLargura = largura;
      melhor = abs(u, base);
    }
  }
  return melhor;
}

export function imagens(html, base) {
  const out = [];
  const vistas = new Set();
  for (const t of tags(html)) {
    if (t.fechamento || (t.nome !== "img" && t.nome !== "source")) continue;
    const a = atributos(t.attrsBrutos);
    // Lazy-load: o src real fica em data-src/data-lazy até o JS trocar.
    const cru = a.src || a["data-src"] || a["data-lazy-src"] || a["data-original"] || "";
    const url = maiorDoSrcset(a.srcset || a["data-srcset"], base) || abs(cru, base);
    if (!url || url.startsWith("data:") || vistas.has(url)) continue;
    vistas.add(url);
    out.push({
      url,
      alt: a.alt || null,
      titulo: a.title || null,
      largura: a.width ? Number(a.width) || null : null,
      altura: a.height ? Number(a.height) || null : null,
    });
  }
  return out;
}

export function links(html, base) {
  const out = [];
  const vistos = new Set();
  const re = /<a\b((?:[^>"']|"[^"]*"|'[^']*')*)>([\s\S]*?)<\/a\s*>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    const a = atributos(m[1]);
    const url = abs(a.href ?? "", base);
    if (!url || !/^https?:/.test(url)) continue;
    const chave = url + " " + linha(m[2]);
    if (vistos.has(chave)) continue;
    vistos.add(chave);
    out.push({ url, texto: linha(m[2]) || null, titulo: a.title || null, rel: a.rel || null });
  }
  return out;
}

export function titulos(html) {
  const out = [];
  for (let n = 1; n <= 6; n++) {
    const re = new RegExp(`<h${n}\\b((?:[^>"']|"[^"]*"|'[^']*')*)>([\\s\\S]*?)</h${n}\\s*>`, "gi");
    let m;
    while ((m = re.exec(html)) !== null) {
      const t = linha(m[2]);
      if (t) out.push({ nivel: n, texto: t });
    }
  }
  return out;
}

export function metas(html) {
  const out = { og: {}, twitter: {}, outras: {} };
  for (const t of tags(html)) {
    if (t.fechamento || t.nome !== "meta") continue;
    const a = atributos(t.attrsBrutos);
    const chave = (a.property || a.name || a.itemprop || "").toLowerCase();
    if (!chave || a.content === undefined) continue;
    if (chave.startsWith("og:")) out.og[chave.slice(3)] = a.content;
    else if (chave.startsWith("twitter:")) out.twitter[chave.slice(8)] = a.content;
    else out.outras[chave] = a.content;
  }
  return out;
}

/** Embeds de vídeo — no portfólio deles é onde moram os tours e making-of. */
export function videos(html, base) {
  const out = [];
  for (const t of tags(html)) {
    if (t.fechamento || (t.nome !== "iframe" && t.nome !== "video")) continue;
    const a = atributos(t.attrsBrutos);
    const url = abs(a.src || a["data-src"] || "", base);
    if (!url) continue;
    const plataforma = /youtube|youtu\.be/i.test(url) ? "youtube"
      : /vimeo/i.test(url) ? "vimeo"
      : /instagram/i.test(url) ? "instagram" : "outro";
    out.push({ url, plataforma, titulo: a.title || null });
  }
  return out;
}

const RE_EMAIL = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
// Telefone BR: DDD obrigatório, celular com 9 dígitos ou fixo com 8.
const RE_TEL = /(?:\+?55\s*)?\(?\d{2}\)?[\s.-]?\d{4,5}[\s.-]?\d{4}/g;
const RE_PRECO = /R\$\s?\d{1,3}(?:\.\d{3})*(?:,\d{2})?/g;

export function contatos(txt) {
  const emails = [...new Set(txt.match(RE_EMAIL) ?? [])];
  const telefones = [...new Set((txt.match(RE_TEL) ?? []).map((t) => t.trim()))]
    // Corta o que casou por acaso: CEP, ano+número, medida. Um telefone BR
    // válido tem 10 ou 11 dígitos depois de tirar o +55.
    .filter((t) => {
      const d = t.replace(/\D/g, "").replace(/^55/, "");
      return d.length === 10 || d.length === 11;
    });
  return { emails, telefones };
}

export const precos = (txt) => [...new Set(txt.match(RE_PRECO) ?? [])];

const MESES = {
  janeiro: 1, fevereiro: 2, "março": 3, marco: 3, abril: 4, maio: 5, junho: 6,
  julho: 7, agosto: 8, setembro: 9, outubro: 10, novembro: 11, dezembro: 12,
  jan: 1, fev: 2, mar: 3, abr: 4, mai: 5, jun: 6, jul: 7, ago: 8, set: 9,
  out: 10, nov: 11, dez: 12,
};

/**
 * Todas as datas que a página deixa ver, cada uma com a origem. A origem
 * importa na hora de filtrar 2025+: `jsonld` e `meta` são declaração do CMS e
 * merecem confiança; `texto` pode ser a data de um projeto citado no corpo,
 * não a da publicação.
 */
export function datas(html, url) {
  const achadas = [];
  const push = (valor, origem) => {
    if (!valor) return;
    const d = new Date(valor);
    if (!Number.isNaN(d.getTime()) && d.getFullYear() >= 1990 && d.getFullYear() <= 2100) {
      achadas.push({ iso: d.toISOString(), origem });
    }
  };

  for (const item of jsonLd(html)) {
    push(item.datePublished, "jsonld:datePublished");
    push(item.dateModified, "jsonld:dateModified");
    push(item.uploadDate, "jsonld:uploadDate");
    push(item.startDate, "jsonld:startDate");
  }

  const m = metas(html);
  push(m.outras["article:published_time"], "meta:published");
  push(m.outras["article:modified_time"], "meta:modified");
  push(m.og["updated_time"], "og:updated_time");
  push(m.outras["date"], "meta:date");

  for (const t of tags(html)) {
    if (t.fechamento || t.nome !== "time") continue;
    push(atributos(t.attrsBrutos).datetime, "tag:time");
  }

  // /2025/03/titulo-do-post — convenção de permalink de blog.
  const naUrl = url?.match(/\/(20\d{2})\/(\d{1,2})(?:\/(\d{1,2}))?(?:\/|$)/);
  if (naUrl) {
    push(
      `${naUrl[1]}-${String(naUrl[2]).padStart(2, "0")}-${String(naUrl[3] ?? 1).padStart(2, "0")}`,
      "url",
    );
  }

  const corpo = texto(html);
  for (const d of corpo.matchAll(/\b(\d{1,2})\s+de\s+([a-zç]+)\s+de\s+(20\d{2})/gi)) {
    const mes = MESES[d[2].toLowerCase()];
    if (mes) push(`${d[3]}-${String(mes).padStart(2, "0")}-${String(d[1]).padStart(2, "0")}`, "texto:pt");
  }
  for (const d of corpo.matchAll(/\b(\d{2})\/(\d{2})\/(20\d{2})\b/g)) {
    push(`${d[3]}-${d[2]}-${d[1]}`, "texto:dmy");
  }

  const unicas = new Map();
  for (const a of achadas) if (!unicas.has(a.iso)) unicas.set(a.iso, a);
  return [...unicas.values()].sort((a, b) => b.iso.localeCompare(a.iso));
}

/** Anos citados no corpo — pega "Projeto 2025" onde não há data estruturada. */
export const anosCitados = (txt) =>
  [...new Set((txt.match(/\b20[12]\d\b/g) ?? []).map(Number))].sort((a, b) => b - a);

/** Tudo que a página entrega, num registro só. */
export function extrairPagina(html, url) {
  const m = metas(html);
  const corpo = texto(html);
  const ld = jsonLd(html);
  const tituloTag = conteudoDe(html, "title")[0];
  const langTag = html.match(/<html\b[^>]*\blang\s*=\s*["']([^"']+)["']/i);
  const canon = html.match(/<link\b[^>]*rel\s*=\s*["']canonical["']((?:[^>"']|"[^"]*"|'[^']*')*)>/i);

  return {
    url,
    titulo: tituloTag ? linha(tituloTag.corpo) : null,
    descricao: m.outras.description ?? m.og.description ?? null,
    idioma: langTag?.[1] ?? null,
    canonical: canon ? abs(atributos(canon[1]).href ?? "", url) : null,
    og: m.og,
    twitter: m.twitter,
    metas: m.outras,
    jsonLd: ld,
    tiposJsonLd: [...new Set(ld.map((i) => i["@type"]).filter(Boolean).flat())],
    titulos: titulos(html),
    imagens: imagens(html, url),
    videos: videos(html, url),
    links: links(html, url),
    datas: datas(html, url),
    anosCitados: anosCitados(corpo),
    precos: precos(corpo),
    ...contatos(corpo),
    palavras: corpo ? corpo.split(/\s+/).length : 0,
    texto: corpo,
  };
}
