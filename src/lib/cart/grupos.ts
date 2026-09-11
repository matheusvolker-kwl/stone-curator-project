// Agrupamento e ordem de EXIBIÇÃO do carrinho.
//
// Pedido do dono (11/09/2026): o carrinho mostrava as peças na ordem em que
// entraram, e num pedido de 18 linhas ficava impossível conferir contra a
// proposta do cliente. Agora: blocos por categoria — pequenas, médias, grandes,
// acessórios, revestimentos, depois o resto em ordem alfabética — e, dentro de
// cada bloco, ordem alfabética NATURAL ("Pedra Grande 10" depois da 9, não da 1).
//
// Só muda a exibição. O array do store continua na ordem de inserção: o
// checkout, o cross-sell e a atribuição de conjunto não dependem desta ordem.

import type { CartItem } from "@/stores/cartStore";

export interface GrupoCarrinho {
  handle: string;
  label: string;
  itens: CartItem[];
  pecas: number;
}

/** A ordem dos blocos. Os 5 primeiros são os que o dono nomeou; o resto segue em
 *  ordem alfabética. Para mudar a ordem do carrinho, mude esta lista — só ela. */
export const ORDEM_DOS_GRUPOS: ReadonlyArray<{ handle: string; label: string }> = [
  { handle: "pedras-pequenas", label: "Pedras pequenas" },
  { handle: "pedras-medias", label: "Pedras médias" },
  { handle: "pedras-grandes", label: "Pedras grandes" },
  { handle: "acessorios", label: "Acessórios" },
  { handle: "revestimentos", label: "Revestimentos" },
  { handle: "amostras", label: "Amostras" },
  { handle: "cascatas", label: "Cascatas" },
  { handle: "fontes-para-jardim", label: "Fontes para jardim" },
  { handle: "fosseis-decorativos", label: "Fósseis decorativos" },
  { handle: "pedras-de-borda", label: "Pedras de borda" },
  { handle: "pisadas", label: "Pisadas" },
];

const OUTROS = { handle: "outros", label: "Outras peças" };

/* Linhas gravadas antes de o collectionHandle existir — e algumas linhas de
 * conjunto — não trazem a categoria. Para elas, deduzimos pelo nome.
 * A ORDEM importa: "Kit Pisada Pedra Grande" é pisada, não pedra grande, então
 * pisada é testada primeiro; "Pedra de Borda" idem. */
const PELO_NOME: ReadonlyArray<readonly [RegExp, string]> = [
  [/pisada/i, "pisadas"],
  [/painel|placa/i, "revestimentos"],
  [/borda/i, "pedras-de-borda"],
  [/pedra\s+grande/i, "pedras-grandes"],
  [/pedra\s+m[eé]dia/i, "pedras-medias"],
  [/pedra\s+pequena/i, "pedras-pequenas"],
  [/cascata/i, "cascatas"],
  [/fonte/i, "fontes-para-jardim"],
  [/f[oó]ssil/i, "fosseis-decorativos"],
  [/western\s*box|amostra/i, "amostras"],
  [/\bled\b|sonora|torneira|champanheira/i, "acessorios"],
];

const HANDLES_CONHECIDOS = new Set(ORDEM_DOS_GRUPOS.map((g) => g.handle));

export function grupoDoItem(item: CartItem): string {
  const h = item.collectionHandle?.toLowerCase();
  if (h && HANDLES_CONHECIDOS.has(h)) return h;
  for (const [re, handle] of PELO_NOME) {
    if (re.test(item.productTitle)) return handle;
  }
  return OUTROS.handle;
}

const comparaNatural = new Intl.Collator("pt-BR", { numeric: true, sensitivity: "base" }).compare;

export function agruparItens(items: CartItem[]): GrupoCarrinho[] {
  const porGrupo = new Map<string, CartItem[]>();
  for (const item of items) {
    const g = grupoDoItem(item);
    const lista = porGrupo.get(g);
    if (lista) lista.push(item);
    else porGrupo.set(g, [item]);
  }
  return [...ORDEM_DOS_GRUPOS, OUTROS]
    .filter((g) => porGrupo.has(g.handle))
    .map((g) => {
      const itens = [...(porGrupo.get(g.handle) ?? [])].sort(
        (a, b) =>
          comparaNatural(a.productTitle, b.productTitle) ||
          comparaNatural(a.variantTitle, b.variantTitle),
      );
      return {
        handle: g.handle,
        label: g.label,
        itens,
        pecas: itens.reduce((s, i) => s + i.quantity, 0),
      };
    });
}
