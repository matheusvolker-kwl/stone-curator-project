// Vocabulário da busca — traduz a linguagem do cliente pro catálogo.
//
// Duas camadas em cima do motor (engine.ts):
//  1. SINÔNIMOS: "queda d'água" / "cachoeira" acham cascatas, "parede de
//     pedra" acha revestimentos. Viram variações da busca, nunca filtros.
//  2. ATALHOS (intenção): quem busca SERVIÇO ou CENA ("projeto 3d",
//     "instalação", "amostra") não cai em "0 resultados" — é levado pra
//     página certa (Guia, Contrate, Western Box…).
//
// Todo match aqui é por PALAVRA INTEIRA (com radical: "amostras" = "amostra").
// Antes era por pedaço de texto, e "pedras deCORativas" abria a Western Box
// porque "cor" é termo dela.

import { indexOfPhrase, normalize, stem, words } from "./texto";

export { normalize };

/** Sinônimos: expressão do cliente → termos do catálogo. */
const SYNONYMS: Record<string, string[]> = {
  "queda d agua": ["cascata"],
  "queda de agua": ["cascata"],
  cachoeira: ["cascata"],
  bica: ["cascata", "fonte"],
  "parede de pedra": ["revestimento"],
  parede: ["revestimento"],
  muro: ["revestimento"],
  fachada: ["revestimento"],
  revestir: ["revestimento"],
  piso: ["pisada"],
  pisante: ["pisada"],
  caminho: ["pisada"],
  travessia: ["pisada"],
  degrau: ["pisada"],
  rocha: ["pedra"],
  pedrinha: ["pedra pequena"],
  pedregulho: ["pedra pequena"],
  matacao: ["pedra grande"],
  "borda de piscina": ["pedra de borda"],
  luz: ["pedra led"],
  iluminacao: ["pedra led"],
  luminaria: ["pedra led"],
  som: ["pedra sonora"],
  "caixa de som": ["pedra sonora"],
  champanhe: ["pedra champanheira"],
  champagne: ["pedra champanheira"],
  "balde de gelo": ["pedra champanheira"],
  chafariz: ["fonte"],
  fontinha: ["fonte"],
  "espelho d agua": ["fonte", "lago"],
  "espelho de agua": ["fonte", "lago"],
  dinossauro: ["fossil"],
};

const SYNONYM_WORDS = Object.entries(SYNONYMS).map(
  ([k, v]) => [words(k), v] as const,
);

/**
 * Variações da busca: a própria (sempre a primeira) + uma por sinônimo
 * encontrado, com a expressão trocada pelo termo do catálogo.
 * "cachoeira granito" → [cachoeira granito], [cascata granito].
 */
export function variantesDaBusca(query: string): string[][] {
  const base = words(query);
  const out: string[][] = [base];
  for (const [chave, termos] of SYNONYM_WORDS) {
    const at = indexOfPhrase(base, chave);
    if (at < 0) continue;
    for (const termo of termos) {
      out.push([...base.slice(0, at), ...words(termo), ...base.slice(at + chave.length)]);
    }
  }
  return out.slice(0, 8);
}

export interface Atalho {
  id: string;
  label: string;
  desc: string;
  to: string;
  /** termos (palavra ou expressão) que disparam este atalho */
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
      "amostra", "box", "kit de amostra", "acabamento", "cor", "textura",
      "quartzo", "arenito", "moledo", "granito",
    ],
  },
  {
    id: "conjuntos",
    label: "Conjuntos prontos",
    desc: "Kits por tipo de projeto",
    to: "/conjuntos",
    termos: ["conjunto", "kit", "combo", "composicao pronta"],
  },
  {
    id: "cadastro",
    label: "Criar cadastro · ver preços",
    desc: "Preço de parceiro (atacado) com CNPJ",
    to: "/parceiro/cadastro",
    termos: [
      "preco", "cadastro", "cadastrar", "atacado", "parceiro",
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
    termos: ["inspiracao", "inspire", "exemplo", "obras", "galeria", "fotos", "cases"],
  },
];

/**
 * Atalhos que casam com a busca, por palavra inteira. Com `soExato`, só o
 * termo que É a busca inteira — usado quando a busca já achou peças e o
 * atalho vira sugestão secundária ("kit" → peças kit + Conjuntos prontos).
 */
export function matchAtalhos(query: string, limit = 3, soExato = false): Atalho[] {
  const q = words(query);
  if (q.join("").length < 2) return [];
  const radicais = q.map(stem).join(" ");
  const casa = (termo: string) => {
    const t = words(termo);
    if (soExato) return t.map(stem).join(" ") === radicais;
    if (indexOfPhrase(q, t) >= 0) return true;
    // Digitando uma palavra só: "instal" já mostra "instalação".
    return q.length === 1 && q[0].length >= 3 && t.length === 1 && t[0].startsWith(q[0]);
  };
  return ATALHOS.filter((a) => a.termos.some(casa)).slice(0, limit);
}
