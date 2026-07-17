// Motor de busca inteligente — traduz a linguagem do cliente pro catálogo.
//
// Três camadas em cima do "includes" simples que existia:
//  1. NORMALIZAÇÃO: sem acento, minúsculo, sem apóstrofo → "fóssil" = "fossil".
//  2. SINÔNIMOS: expande o termo do cliente pros termos do catálogo →
//     "queda d'água" acha cascatas, "parede de pedra" acha revestimentos.
//  3. ATALHOS (intenção): quem busca SERVIÇO ou CENA ("projeto 3d",
//     "instalação", "piscina", "amostra") não cai em "0 resultados" — é
//     levado pra página certa (Guia, Contrate, Western Box…).

/** Minúsculo, sem acento e sem pontuação de apóstrofo — base de todo match. */
export function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/['´`’]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Sinônimos: frase/termo do cliente (será normalizado) → termos canônicos. */
const SYNONYMS: Record<string, string[]> = {
  "queda d agua": ["cascata"],
  "queda de agua": ["cascata"],
  "quedas d agua": ["cascata"],
  "bica": ["cascata", "fonte"],
  "parede de pedra": ["revestimento"],
  parede: ["revestimento"],
  muro: ["revestimento"],
  revestir: ["revestimento"],
  piso: ["pisada"],
  pisante: ["pisada"],
  pisantes: ["pisada"],
  caminho: ["pisada"],
  travessia: ["pisada"],
  fossil: ["fossil", "fosseis"],
  fosseis: ["fossil", "fosseis"],
  rocha: ["pedra"],
  rochas: ["pedra"],
  "pedra de jardim": ["pedra"],
  "pedra para jardim": ["pedra"],
  "pedra pra jardim": ["pedra"],
  matacao: ["pedra grande", "pedra"],
  borda: ["pedra de borda"],
  "borda de piscina": ["pedra de borda"],
  led: ["pedra led", "acessorio"],
  luz: ["pedra led"],
  iluminacao: ["pedra led"],
  "espelho d agua": ["lago", "fonte"],
  "espelho de agua": ["lago", "fonte"],
  fontinha: ["fonte"],
  chafariz: ["fonte"],
};

export interface Atalho {
  id: string;
  label: string;
  desc: string;
  to: string;
  /** termos normalizados que disparam este atalho */
  termos: string[];
}

/** Atalhos por INTENÇÃO — serviço ou cena. Ordem = prioridade de exibição. */
export const ATALHOS: Atalho[] = [
  {
    id: "guia",
    label: "Montar no guia de composição",
    desc: "3 perguntas e o ateliê monta seu projeto",
    to: "/guia-de-composicao",
    termos: [
      "guia", "montar", "composicao", "como montar", "nao sei", "por onde comecar",
      "piscina", "lago", "jardim", "cena", "projeto de piscina", "area de lazer", "paisagismo",
    ],
  },
  {
    id: "contrate",
    label: "Contrate a Western",
    desc: "Consultoria, projeto 3D e instalação",
    to: "/contrate-a-western",
    termos: [
      "projeto", "projeto 3d", "3d", "render", "sketchup", "instalacao", "instalar",
      "execucao", "obra", "orcamento", "contratar", "consultoria", "turnkey", "mao de obra",
    ],
  },
  {
    id: "casa",
    label: "Para sua casa",
    desc: "Sem CNPJ? A Western executa pra você",
    to: "/para-sua-casa",
    termos: [
      "minha casa", "para casa", "pra casa", "sem cnpj", "cliente final",
      "pessoa fisica", "residencial", "particular", "consumidor",
    ],
  },
  {
    id: "box",
    label: "Western Box — amostras",
    desc: "Os 4 acabamentos na sua mão, sem cadastro",
    to: "/western-box",
    termos: [
      "amostra", "amostras", "box", "kit de amostra", "acabamento", "acabamentos",
      "cor", "cores", "textura", "quartzo", "arenito", "moledo", "granito",
    ],
  },
  {
    id: "conjuntos",
    label: "Conjuntos prontos",
    desc: "Kits por tipo de projeto",
    to: "/conjuntos",
    termos: ["conjunto", "conjuntos", "kit", "kits", "combo", "composicao pronta"],
  },
  {
    id: "cadastro",
    label: "Criar cadastro · ver preços",
    desc: "Preço de parceiro (atacado) com CNPJ",
    to: "/parceiro/cadastro",
    termos: [
      "preco", "precos", "cadastro", "cadastrar", "atacado", "parceiro",
      "tabela", "desconto", "valor", "quanto custa", "revenda",
    ],
  },
  {
    id: "comocomprar",
    label: "Como comprar",
    desc: "Preço de parceiro em 4 passos",
    to: "/como-comprar",
    termos: [
      "como comprar", "como funciona", "pedido minimo", "minimo", "frete",
      "entrega", "prazo", "pagamento", "parcelamento", "boleto", "pix",
    ],
  },
  {
    id: "inspire",
    label: "Obras",
    desc: "Obras e projetos reais com Western",
    to: "/obras",
    // "inspiracao"/"inspire" seguem aqui de propósito: a página mudou de nome,
    // quem procurava pelo nome antigo continua achando.
    termos: ["inspiracao", "inspire", "exemplo", "exemplos", "obras", "galeria", "fotos", "cases"],
  },
];

/** Expande a query em termos de match (query + tokens + sinônimos), normalizados. */
export function expandTerms(query: string): string[] {
  const n = normalize(query);
  if (n.length < 2) return [];
  const terms = new Set<string>([n]);
  for (const tok of n.split(" ")) if (tok.length >= 2) terms.add(tok);
  for (const [k, vals] of Object.entries(SYNONYMS)) {
    if (n.includes(normalize(k))) for (const v of vals) terms.add(normalize(v));
  }
  return [...terms];
}

/** Atalhos de intenção que casam com a query. */
export function matchAtalhos(query: string, limit = 3): Atalho[] {
  const n = normalize(query);
  if (n.length < 2) return [];
  return ATALHOS.filter((a) => a.termos.some((t) => n.includes(t) || t.includes(n))).slice(0, limit);
}

interface CollLike {
  title: string;
  handle: string;
  description?: string;
}
interface ProdLike {
  node: { title: string; handle: string; tags?: string[] };
}

export interface SmartSearch<C, P> {
  linhas: C[];
  produtos: P[];
  atalhos: Atalho[];
  flatCount: number;
}

/** Resolve a busca: linhas + produtos (com sinônimo/acento) + atalhos de intenção. */
export function resolveSearch<C extends CollLike, P extends ProdLike>(
  query: string,
  collections: C[],
  products: P[],
  isSeasonal?: (c: { handle: string; description?: string }) => boolean,
  limits?: { linhas?: number; produtos?: number; atalhos?: number },
): SmartSearch<C, P> {
  const terms = expandTerms(query);
  if (terms.length === 0) return { linhas: [], produtos: [], atalhos: [], flatCount: 0 };
  const hit = (hay: string | undefined) => {
    if (!hay) return false;
    const h = normalize(hay);
    return terms.some((t) => h.includes(t));
  };
  const linhas = collections
    .filter((c) => (isSeasonal ? !isSeasonal({ handle: c.handle, description: c.description }) : true))
    .filter((c) => hit(c.title) || hit(c.handle))
    .slice(0, limits?.linhas ?? 3);
  const produtos = products
    .filter((p) => hit(p.node.title) || (p.node.tags ?? []).some((t) => hit(t)))
    .slice(0, limits?.produtos ?? 6);
  const atalhos = matchAtalhos(query, limits?.atalhos ?? 3);
  return { linhas, produtos, atalhos, flatCount: linhas.length + produtos.length + atalhos.length };
}
