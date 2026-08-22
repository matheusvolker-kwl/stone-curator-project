/**
 * Consolidação: escolher a data de cada item, decidir se ele entra no recorte,
 * achatar os quatro canais numa tabela só e exportar.
 *
 * Vive separado do run.mjs porque o run.mjs é entrypoint — executa ao ser
 * importado. Aqui é tudo função pura, que é o que dá pra testar.
 */

/**
 * A melhor data de uma página, em ordem de confiança.
 *
 * `lastmod` do sitemap vem primeiro porque é o próprio CMS declarando quando
 * mexeu na página. Data solta no texto vem por último: num portfólio, "2019"
 * no corpo quase sempre é o ano da OBRA, não o da publicação — usar isso pra
 * cortar jogaria fora página atual sobre projeto antigo.
 */
export function melhorData(pagina) {
  const porOrigem = (p) => pagina.datas?.find((d) => d.origem.startsWith(p))?.iso ?? null;
  const iso = (v) => {
    if (!v) return null;
    const d = new Date(v);
    return Number.isNaN(d.getTime()) ? null : d.toISOString();
  };

  const candidatos = [
    [iso(pagina.lastmodSitemap), "sitemap:lastmod"],
    [porOrigem("jsonld:datePublished"), "jsonld:datePublished"],
    [porOrigem("meta:published"), "meta:published"],
    [porOrigem("jsonld:dateModified"), "jsonld:dateModified"],
    [porOrigem("meta:modified"), "meta:modified"],
    [porOrigem("tag:time"), "tag:time"],
    [iso(pagina.httpLastModified), "http:last-modified"],
    [porOrigem("url"), "url"],
    [porOrigem("texto"), "texto"],
  ];
  for (const [valor, origem] of candidatos) if (valor) return { iso: valor, origem };
  return { iso: null, origem: null };
}

/**
 * Devolve o teste de recorte pra uma data de corte.
 *
 * Três estados, não dois: `true` tem data e está no período, `false` tem data e
 * ficou fora, `null` não tem data nenhuma. O `null` é guardado do mesmo jeito —
 * uma página de projeto sem data pode ser a mais relevante do alvo, e descartar
 * por ausência de metadado seria perder conteúdo por defeito do CMS do outro.
 * Quem consome decide o que fazer com o `null`; o relatório conta separado.
 */
export function criarFiltroPeriodo(desde) {
  const corte = new Date(desde).toISOString();
  const anoCorte = new Date(corte).getFullYear();
  return (iso, anos) => {
    if (iso) return iso >= corte;
    if (anos?.length) return anos.some((a) => a >= anoCorte);
    return null;
  };
}

export const COLUNAS = [
  "alvo", "marca", "categoria", "canal", "tipo", "url", "titulo", "data",
  "dataOrigem", "noPeriodo", "resumo", "imagens", "videos", "precos",
  "palavras", "anos",
];

const contarPalavras = (t) => (t ? t.trim().split(/\s+/).filter(Boolean).length : 0);

/** Achata os quatro canais num formato tabular só — vira CSV e NDJSON. */
export function achatar(coletas, noPeriodo) {
  const linhas = [];

  for (const c of coletas) {
    const base = { alvo: c.slug, marca: c.nome, categoria: c.categoria ?? null };

    for (const p of c.canais?.site?.paginas ?? []) {
      linhas.push({
        ...base, canal: "site", tipo: p.tiposJsonLd?.[0] ?? "pagina",
        url: p.url, titulo: p.titulo, data: p.data, dataOrigem: p.dataOrigem,
        noPeriodo: p.noPeriodo, resumo: p.descricao,
        imagens: p.imagens?.length ?? 0, videos: p.videos?.length ?? 0,
        precos: (p.precos ?? []).join(" | "), palavras: p.palavras ?? 0,
        anos: (p.anosCitados ?? []).join(" "),
      });
    }

    for (const v of c.canais?.youtube?.videos ?? []) {
      linhas.push({
        ...base, canal: "youtube", tipo: "video", url: v.url, titulo: v.titulo,
        data: v.publicadoEm, dataOrigem: v.dataExata ? "rss" : "aproximada",
        noPeriodo: v.noPeriodo, resumo: v.descricao,
        imagens: v.thumb ? 1 : 0, videos: 1, precos: "",
        palavras: contarPalavras(v.descricao), anos: "",
      });
    }

    for (const p of c.canais?.instagram?.posts ?? []) {
      linhas.push({
        ...base, canal: "instagram", tipo: p.ehVideo ? "reel" : "post",
        url: p.url, titulo: p.legenda?.slice(0, 120) ?? null,
        data: p.publicadoEm, dataOrigem: "api", noPeriodo: p.noPeriodo,
        resumo: p.legenda, imagens: p.imagem ? 1 : 0, videos: p.ehVideo ? 1 : 0,
        precos: "", palavras: contarPalavras(p.legenda),
        anos: (p.hashtags ?? []).join(" "),
      });
    }

    for (const pasta of c.canais?.pinterest?.pastas ?? []) {
      for (const pin of pasta.conteudo ?? []) {
        linhas.push({
          ...base, canal: "pinterest", tipo: "pin", url: pin.url,
          titulo: pin.titulo, data: pin.criadoEm, dataOrigem: "api",
          noPeriodo: noPeriodo(pin.criadoEm, null), resumo: pin.descricao,
          imagens: pin.imagem ? 1 : 0, videos: pin.ehVideo ? 1 : 0, precos: "",
          palavras: contarPalavras(pin.descricao), anos: pasta.nome ?? "",
        });
      }
    }
  }
  return linhas;
}

/** CSV com aspas duplicadas e quebra achatada — abre no Sheets e no Excel. */
export function paraCsv(linhas, colunas = COLUNAS) {
  const escapar = (v) => {
    if (v === null || v === undefined) return "";
    const s = String(v).replace(/\r?\n/g, " ").replace(/"/g, '""');
    return /[",;\n]/.test(s) ? `"${s}"` : s;
  };
  return [
    colunas.join(","),
    ...linhas.map((l) => colunas.map((c) => escapar(l[c])).join(",")),
  ].join("\n");
}

export function relatorio(coletas, linhas, desde) {
  const noPer = linhas.filter((l) => l.noPeriodo === true);
  const semData = linhas.filter((l) => l.noPeriodo === null);

  const porCanal = {};
  for (const l of linhas) {
    porCanal[l.canal] ??= { total: 0, periodo: 0 };
    porCanal[l.canal].total++;
    if (l.noPeriodo === true) porCanal[l.canal].periodo++;
  }

  const porAlvo = coletas.map((c) => {
    const meus = linhas.filter((l) => l.alvo === c.slug);
    const dentro = meus.filter((l) => l.noPeriodo === true).length;
    const erros = (c.canais?.site?.erros ?? []).length;
    const falhas = ["instagram", "pinterest", "youtube"]
      .filter((k) => c.canais?.[k]?.erro)
      .join(", ");
    return `| ${c.nome} | ${meus.length} | ${dentro} | ${erros} | ${falhas || "—"} |`;
  });

  return `# Scrap — arquitetos, designers e marcas BR

Coletado em ${new Date().toISOString().slice(0, 16).replace("T", " ")} · recorte a partir de **${desde}**

## Resumo

- **${linhas.length}** itens coletados no total
- **${noPer.length}** dentro do recorte (${desde} em diante)
- **${semData.length}** sem data detectável (mantidos — ver \`noPeriodo: null\`)
- **${coletas.length}** alvos varridos

### Por canal

| canal | itens | no período |
|---|---:|---:|
${Object.entries(porCanal).map(([k, v]) => `| ${k} | ${v.total} | ${v.periodo} |`).join("\n")}

### Por alvo

| marca | itens | no período | erros HTTP | canais que falharam |
|---|---:|---:|---:|---|
${porAlvo.join("\n")}

## Arquivos

- \`consolidado.csv\` — tudo numa planilha
- \`consolidado.ndjson\` — uma linha JSON por item
- \`<slug>.json\` — coleta completa do alvo, com texto integral, imagens e JSON-LD
`;
}
