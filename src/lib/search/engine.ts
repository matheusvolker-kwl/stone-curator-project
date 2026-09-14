// Motor de busca do catálogo — acha a peça por qualquer caminho que o
// cliente (ou o vendedor) usar:
//   · código em qualquer forma: PG3, pg 3, PG-3, WEST-PG3, WEST-PG3-GRANITO, CSC-Q
//   · nome inteiro ou pedaço: "pedra grande 3", "casc", "sant"
//   · plural/singular e gênero: "pedras grandes", "pedra médio"
//   · acento e maiúscula: "FÓSSEIS", "fossil"
//   · erro de digitação: "cascta", "seymoria", "champanhera"
//   · categoria, acabamento e tensão: "revestimento", "cascata granito", "fonte 220"
//   · sinônimo (vocab.ts): "cachoeira", "parede", "piso"
// Número é palavra inteira: "pedra grande 3" não traz a Pedra Grande 10.
// Todas as palavras precisam casar (E). Se nenhuma peça casa com todas, cai
// pro OU com nota proporcional — uma palavra a mais não zera a busca.

import { PEDRAS_HANDLES } from "@/lib/catalogScenes";
import { matchAtalhos, variantesDaBusca, type Atalho } from "./vocab";
import { STOPWORDS, stem, temNumero, typoBudget, typoDistance, words } from "./texto";

export interface ProdutoBuscavel {
  node: {
    title: string;
    handle: string;
    description?: string;
    tags?: string[];
    collections?: { edges: Array<{ node: { handle: string; title: string } }> };
    variants?: {
      edges: Array<{
        node: {
          sku?: string | null;
          selectedOptions?: Array<{ name: string; value: string }>;
        };
      }>;
    };
  };
}

export interface LinhaBuscavel {
  title: string;
  handle: string;
  description?: string;
}

export interface Achado<T> {
  item: T;
  nota: number;
}

// ─── Consulta ────────────────────────────────────────────────────────────────

interface Palavra {
  texto: string;
  radical: string;
  numerica: boolean;
  limite: number;
}

interface Consulta {
  palavras: Palavra[];
  /** radicais juntos — comparados com o título e a categoria (bônus de frase) */
  frase: string;
  /** 1 = o que foi digitado; 0.9 = variação por sinônimo */
  peso: number;
}

/** Saem da busca quando há outras palavras ("peça western pg3" → pg3). */
const GENERICAS = new Set([
  "west", "western", "peca", "pecas", "produto", "produtos", "modelo", "artesanal",
]);

function palavra(texto: string): Palavra {
  const numerica = temNumero(texto);
  return { texto, radical: stem(texto), numerica, limite: numerica ? 0 : typoBudget(texto.length) };
}

function limpar(ws: string[]): string[] {
  const uteis = ws.filter((w) => !STOPWORDS.has(w) && (w.length > 1 || temNumero(w)));
  const semGenericas = uteis.filter((w) => !GENERICAS.has(w));
  return semGenericas.length ? semGenericas : uteis;
}

/** "pg 3" → "pg3": sigla curta seguida de número é código digitado com espaço. */
function juntarCodigos(ws: string[]): string[] {
  const out: string[] = [];
  for (let i = 0; i < ws.length; i++) {
    const b = ws[i + 1];
    if (b && /^[a-z]{1,4}$/.test(ws[i]) && /^\d{1,3}$/.test(b)) {
      out.push(ws[i] + b);
      i++;
    } else out.push(ws[i]);
  }
  return out;
}

function montarConsultas(query: string): Consulta[] {
  const todas = words(query);
  if (todas.join("").length < 2) return [];
  const vistas = new Set<string>();
  const out: Consulta[] = [];
  const add = (ws: string[], peso: number) => {
    const chave = ws.join(" ");
    if (!ws.length || vistas.has(chave)) return;
    vistas.add(chave);
    out.push({ palavras: ws.map(palavra), frase: ws.map(stem).join(" "), peso });
  };
  variantesDaBusca(query).forEach((v, i) => {
    const peso = i === 0 ? 1 : 0.9;
    const ws = limpar(v);
    add(ws, peso);
    add(juntarCodigos(ws), peso);
  });
  // O código inteiro colado: "WEST-PG3-GRANITO", "csc q", "p g 3" → pg3granito, cscq, pg3.
  if (todas.length > 1) {
    const colado = todas.join("").replace(/^west(ern)?/, "");
    if (colado.length >= 2 && colado.length <= 20) add([colado], 1);
  }
  return out;
}

// ─── Índice ──────────────────────────────────────────────────────────────────

interface Campo {
  palavras: string[];
  radicais: string[];
}

interface Indice {
  titulo: Campo;
  tituloFrase: string;
  /** código-base de cada SKU: pg3, csc, kitpbs */
  codigos: string[];
  /** a peça por trás do kit: WEST-KIT-PBS → pbs */
  codigosKit: string[];
  /** SKU inteiro colado, sem a marca: pg3granito, cscq, fmsquartzo220 */
  skus: string[];
  opcoes: Campo;
  categorias: Campo;
  categoriasFrases: string[];
  tags: Campo;
  descricao: Set<string>;
  /** kit de 3 unidades — sem pedir "kit", a peça avulsa vem antes */
  ehKit: boolean;
}

const VAZIO: Campo = { palavras: [], radicais: [] };

function campo(ws: string[]): Campo {
  const unicas = [...new Set(ws)];
  return { palavras: unicas, radicais: unicas.map(stem) };
}

/** Partes do SKU sem a marca: WEST-KIT-PBS → [kit, pbs]. */
function partesDoSku(sku: string): string[] {
  const p = words(sku);
  if (p[0] === "west" || p[0] === "western") p.shift();
  return p;
}

/** Código curto para exibir: WEST-PG3-GRANITO → PG3; WEST-KIT-PBS → KIT-PBS. */
export function codigoDoProduto(node: ProdutoBuscavel["node"]): string | null {
  for (const e of node.variants?.edges ?? []) {
    const p = e.node.sku ? partesDoSku(e.node.sku) : [];
    if (p.length) return (p[0] === "kit" && p[1] ? `kit-${p[1]}` : p[0]).toUpperCase();
  }
  return null;
}

/** "(3 uni)" é a quantidade do kit, não o modelo — fica fora do título na busca. */
const QTD_DO_KIT = /\(\s*\d+\s*uni[a-z.]*\s*\)/gi;

const cacheProdutos = new WeakMap<object, Indice>();

function indexarProduto(node: ProdutoBuscavel["node"]): Indice {
  const pronto = cacheProdutos.get(node);
  if (pronto) return pronto;

  const tituloWs = words(node.title.replace(QTD_DO_KIT, " "));
  const codigos = new Set<string>();
  const kit = new Set<string>();
  const skus = new Set<string>();
  const opcoes: string[] = [];
  for (const e of node.variants?.edges ?? []) {
    const p = e.node.sku ? partesDoSku(e.node.sku) : [];
    if (p.length) {
      if (p[0] === "kit" && p[1]) {
        codigos.add("kit" + p[1]);
        kit.add(p[1]);
      } else codigos.add(p[0]);
      skus.add(p.join(""));
    }
    for (const o of e.node.selectedOptions ?? []) {
      const ws = words(o.value);
      opcoes.push(...ws);
      if (ws.length > 1) opcoes.push(ws.join("")); // "220 V" → 220v
    }
  }

  const cats: string[] = [];
  const catsFrases: string[] = [];
  for (const e of node.collections?.edges ?? []) {
    const t = words(e.node.title).filter((w) => !STOPWORDS.has(w));
    cats.push(...t, ...words(e.node.handle));
    catsFrases.push(t.map(stem).join(" "));
    // As 3 categorias de pedra são "Pedras decorativas" na navegação.
    if (PEDRAS_HANDLES.includes(e.node.handle)) {
      cats.push("pedras", "decorativas");
      catsFrases.push(["pedras", "decorativas"].map(stem).join(" "));
    }
  }

  const ix: Indice = {
    titulo: campo(tituloWs),
    tituloFrase: tituloWs.filter((w) => !STOPWORDS.has(w)).map(stem).join(" "),
    codigos: [...codigos],
    codigosKit: [...kit],
    skus: [...skus],
    opcoes: campo(opcoes),
    categorias: campo(cats),
    categoriasFrases: catsFrases,
    tags: campo((node.tags ?? []).flatMap(words)),
    descricao: new Set(
      words(node.description ?? "")
        .filter((w) => !temNumero(w) && !STOPWORDS.has(w))
        .map(stem),
    ),
    ehKit: kit.size > 0 || tituloWs[0] === "kit",
  };
  cacheProdutos.set(node, ix);
  return ix;
}

const cacheLinhas = new WeakMap<object, Indice>();

function indexarLinha(l: LinhaBuscavel): Indice {
  const pronto = cacheLinhas.get(l);
  if (pronto) return pronto;
  const t = words(l.title);
  const ix: Indice = {
    titulo: campo([...t, ...words(l.handle)]),
    tituloFrase: t.filter((w) => !STOPWORDS.has(w)).map(stem).join(" "),
    codigos: [],
    codigosKit: [],
    skus: [],
    opcoes: VAZIO,
    categorias: VAZIO,
    categoriasFrases: [],
    tags: VAZIO,
    descricao: new Set(),
    ehKit: false,
  };
  cacheLinhas.set(l, ix);
  return ix;
}

// ─── Nota ────────────────────────────────────────────────────────────────────

type Pesos = readonly [exato: number, radical: number, prefixo: number, digitacao: number];
const P_TITULO: Pesos = [30, 28, 20, 14];
const P_CATEGORIA: Pesos = [18, 17, 12, 8];
const P_OPCAO: Pesos = [12, 12, 8, 6];
const P_TAG: Pesos = [10, 9, 6, 4];
const P_DESCRICAO = 3;

/** A partir desta nota a busca "achou a peça" (código ou palavra do título). */
const NOTA_FORTE = 28;
/** Menos de 25% da nota do primeiro é ruído (só a descrição citou a palavra). */
const CORTE_RELATIVO = 0.25;
/** No OU (nem toda palavra casou) só entra quem casou em campo forte, não só na descrição. */
const NOTA_MINIMA_OU = 10;

function notaNoCampo(p: Palavra, c: Campo, [exato, radical, prefixo, digitacao]: Pesos): number {
  let melhor = 0;
  for (let i = 0; i < c.palavras.length; i++) {
    const w = c.palavras[i];
    if (w === p.texto) return exato;
    if (p.numerica) continue;
    const r = c.radicais[i];
    if (r === p.radical) melhor = Math.max(melhor, radical);
    else if (p.texto.length >= 2 && w.startsWith(p.texto)) melhor = Math.max(melhor, prefixo);
    else if (
      melhor < digitacao &&
      p.limite > 0 &&
      r[0] === p.radical[0] &&
      typoDistance(p.radical, r, p.limite) <= p.limite
    ) {
      melhor = digitacao;
    }
  }
  return melhor;
}

function notaCodigo(p: Palavra, ix: Indice): number {
  const w = p.texto;
  if (w.length < 2) return 0;
  if (ix.skus.includes(w)) return 110;
  // Sigla de 2 letras (PE, PL, CS…) também é começo de palavra — vale menos.
  if (ix.codigos.includes(w)) return /^[a-z]{2}$/.test(w) ? 65 : 100;
  if (ix.codigosKit.includes(w)) return 70;
  if (w.length >= 4 && ix.skus.some((s) => s.startsWith(w))) return 70;
  if (ix.codigos.some((c) => c.startsWith(w))) return 60;
  return 0;
}

function notaDaConsulta(ix: Indice, c: Consulta): { nota: number; casadas: number } {
  let nota = 0;
  let casadas = 0;
  let noTitulo = 0;
  for (const p of c.palavras) {
    const t = notaNoCampo(p, ix.titulo, P_TITULO);
    const melhor = Math.max(
      t,
      notaCodigo(p, ix),
      notaNoCampo(p, ix.opcoes, P_OPCAO),
      notaNoCampo(p, ix.categorias, P_CATEGORIA),
      notaNoCampo(p, ix.tags, P_TAG),
      !p.numerica && ix.descricao.has(p.radical) ? P_DESCRICAO : 0,
    );
    if (melhor > 0) casadas++;
    if (t > 0) noTitulo++;
    nota += melhor;
  }
  if (casadas === 0) return { nota: 0, casadas };
  if (noTitulo === c.palavras.length) nota += 15;
  const t = ix.tituloFrase;
  if (t === c.frase) nota += 40;
  else if (t.startsWith(c.frase + " ")) nota += 25;
  else if (` ${t} `.includes(` ${c.frase} `)) nota += 15;
  if (ix.categoriasFrases.includes(c.frase)) nota += 20;
  // Kit = a mesma peça em 3 unidades: sem pedir "kit", a avulsa vem antes.
  if (ix.ehKit && !c.palavras.some((p) => p.texto === "kit")) nota -= 1;
  return { nota: nota * c.peso, casadas };
}

function ranquear<T>(itens: T[], consultas: Consulta[], indexar: (t: T) => Indice): Achado<T>[] {
  if (!consultas.length) return [];
  const todas: Array<Achado<T> & { ordem: number }> = [];
  const parciais: Array<Achado<T> & { ordem: number }> = [];
  itens.forEach((item, ordem) => {
    const ix = indexar(item);
    let e = 0;
    let ou = 0;
    for (const c of consultas) {
      const r = notaDaConsulta(ix, c);
      if (r.casadas === c.palavras.length) e = Math.max(e, r.nota);
      else if (r.casadas > 0) ou = Math.max(ou, (r.nota * r.casadas) / c.palavras.length);
    }
    if (e > 0) todas.push({ item, nota: e, ordem });
    else if (ou >= NOTA_MINIMA_OU) parciais.push({ item, nota: ou, ordem });
  });
  const lista = todas.length ? todas : parciais;
  lista.sort((a, b) => b.nota - a.nota || a.ordem - b.ordem);
  const corte = (lista[0]?.nota ?? 0) * CORTE_RELATIVO;
  return lista.filter((a) => a.nota >= corte).map(({ item, nota }) => ({ item, nota }));
}

/** Peças por relevância. Empate mantém a ordem recebida — passe a lista já na ordem curada. */
export function buscarProdutos<P extends ProdutoBuscavel>(query: string, produtos: P[]): Achado<P>[] {
  return ranquear(produtos, montarConsultas(query), (p) => indexarProduto(p.node));
}

/** Categorias (linhas) por relevância. */
export function buscarLinhas<C extends LinhaBuscavel>(query: string, linhas: C[]): Achado<C>[] {
  return ranquear<C>(linhas, montarConsultas(query), indexarLinha);
}

// ─── Busca completa (header e página de resultados) ──────────────────────────

export interface SmartSearch<C, P> {
  linhas: C[];
  produtos: P[];
  atalhos: Atalho[];
  flatCount: number;
  /** achou peça pelo código ou pelo nome → peças vêm antes dos atalhos */
  pecasPrimeiro: boolean;
}

export function resolveSearch<C extends LinhaBuscavel, P extends ProdutoBuscavel>(
  query: string,
  collections: C[],
  products: P[],
  isSeasonal?: (c: { handle: string; description?: string }) => boolean,
  limits?: { linhas?: number; produtos?: number; atalhos?: number },
): SmartSearch<C, P> {
  const achados = buscarProdutos(query, products);
  const pecasPrimeiro = (achados[0]?.nota ?? 0) >= NOTA_FORTE;
  const produtos = achados.slice(0, limits?.produtos ?? 6).map((a) => a.item);
  const visiveis = isSeasonal
    ? collections.filter((c) => !isSeasonal({ handle: c.handle, description: c.description }))
    : collections;
  const linhas = buscarLinhas(query, visiveis)
    .slice(0, limits?.linhas ?? 3)
    .map((a) => a.item);
  // Com peça achada, atalho só se a busca inteira for termo dele ("kit" → Conjuntos).
  const atalhos = pecasPrimeiro
    ? matchAtalhos(query, 1, true)
    : matchAtalhos(query, limits?.atalhos ?? 3);
  return {
    linhas,
    produtos,
    atalhos,
    flatCount: linhas.length + produtos.length + atalhos.length,
    pecasPrimeiro,
  };
}
