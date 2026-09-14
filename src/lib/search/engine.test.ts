import { describe, expect, it } from "vitest";
import {
  buscarProdutos,
  codigoDoProduto,
  resolveSearch,
  type ProdutoBuscavel,
} from "./engine";

// Catálogo real da loja (títulos, SKUs e categorias do Woo em 2026-09).
const CATS: Record<string, string> = {
  cascatas: "Cascatas",
  "fontes-para-jardim": "Fontes para Jardim",
  "pedras-grandes": "Pedras Grandes",
  "pedras-medias": "Pedras Médias",
  "pedras-pequenas": "Pedras Pequenas",
  "pedras-de-borda": "Pedras de Borda",
  revestimentos: "Revestimentos",
  pisadas: "Pisadas",
  acessorios: "Acessórios",
  "fosseis-decorativos": "Fósseis Decorativos",
};
const ACABAMENTOS = ["Quartzo", "Arenito", "Moledo", "Granito"];

type Tipo = "variavel" | "bundle" | "kit" | "madeira" | "tensao";

function peca(sku: string, title: string, cat: string, tipo: Tipo = "variavel", description = ""): ProdutoBuscavel {
  const acab = (a: string) => ({ name: "Acabamento", value: a });
  let variants: Array<{ node: { sku: string; selectedOptions: Array<{ name: string; value: string }> } }>;
  if (tipo === "kit") variants = [{ node: { sku, selectedOptions: [] } }];
  else if (tipo === "madeira") variants = [{ node: { sku: `${sku}-MADEIRA`, selectedOptions: [acab("Madeira")] } }];
  else if (tipo === "bundle")
    variants = ACABAMENTOS.map((a) => ({ node: { sku: `${sku}-${a[0]}`, selectedOptions: [acab(a)] } }));
  else if (tipo === "tensao")
    variants = ACABAMENTOS.flatMap((a) =>
      ["127 V", "220 V"].map((t) => ({
        node: {
          sku: `${sku}-${a.toUpperCase()}-${t.slice(0, 3)}`,
          selectedOptions: [acab(a), { name: "Tensão", value: t }],
        },
      })),
    );
  else variants = ACABAMENTOS.map((a) => ({ node: { sku: `${sku}-${a.toUpperCase()}`, selectedOptions: [acab(a)] } }));
  return {
    node: {
      title,
      handle: sku.toLowerCase(),
      description,
      tags: [],
      collections: { edges: [{ node: { handle: cat, title: CATS[cat] } }] },
      variants: { edges: variants },
    },
  };
}

const serie = (n: number, f: (i: number) => ProdutoBuscavel) =>
  Array.from({ length: n }, (_, i) => f(i + 1));

const CATALOGO: ProdutoBuscavel[] = [
  peca("WEST-CSB", "Cascata Santa Bárbara", "cascatas", "bundle"),
  peca("WEST-CSC", "Cascata Santa Clara", "cascatas", "bundle"),
  peca("WEST-CLY", "Cascata Lajedo Yporanga", "cascatas"),
  peca("WEST-CLB", "Cascata Lajedo Boreal", "cascatas"),
  peca("WEST-CS", "Cascata Sabino", "cascatas", "variavel", "Cascata com bica para piscina, lago ou fonte de parede. Ideal para projeto de paisagismo."),
  peca("WEST-FSL", "Fonte Sabino com Lago", "fontes-para-jardim", "bundle"),
  peca("WEST-FMS", "Fonte Mini Sabino", "fontes-para-jardim", "tensao"),
  peca("WEST-FML", "Fonte Mini Lago", "fontes-para-jardim", "tensao"),
  peca("WEST-FSR", "Fonte Santa Rita", "fontes-para-jardim", "tensao"),
  ...serie(10, (i) => peca(`WEST-PG${i}`, `Pedra Grande ${i}`, "pedras-grandes")),
  ...serie(8, (i) => peca(`WEST-PM${i}`, `Pedra Média ${i}`, "pedras-medias")),
  ...serie(5, (i) => peca(`WEST-PP${i}`, `Pedra Pequena ${i}`, "pedras-pequenas")),
  ...serie(3, (i) => peca(`WEST-PB${i}`, `Pedra de Borda ${i}`, "pedras-de-borda")),
  peca("WEST-PRR", "Placa Rústica Riviera", "revestimentos"),
  peca("WEST-PBA", "Painel Bruto Amalfi", "revestimentos"),
  peca("WEST-PBM", "Painel Bruto Mykonos", "revestimentos"),
  peca("WEST-PBS", "Painel Bruto Santorini", "revestimentos"),
  peca("WEST-KIT-PBS", "Kit Painel Bruto Santorini (3 uni)", "revestimentos", "kit"),
  peca("WEST-KIT-PRR", "Kit Placa Rústica Riviera (3 uni)", "revestimentos", "kit"),
  peca("WEST-PPG", "Pisada Pedra Grande", "pisadas"),
  peca("WEST-PPM", "Pisada Pedra Média", "pisadas"),
  peca("WEST-PPP", "Pisada Pedra Pequena", "pisadas"),
  peca("WEST-PE", "Pisada Eucalipto", "pisadas", "madeira"),
  peca("WEST-PD", "Pisada Dormente", "pisadas", "madeira"),
  peca("WEST-KIT-PPG", "Kit Pisada Pedra Grande (3 uni)", "pisadas", "kit"),
  // O kit vem ANTES aqui de propósito: a busca é que precisa pôr a peça avulsa na frente.
  peca("WEST-KIT-PL", "Kit Pedra LED (3 uni)", "acessorios", "kit"),
  peca("WEST-PL", "Pedra LED", "acessorios"),
  peca("WEST-PS", "Pedra Sonora", "acessorios"),
  peca("WEST-PT", "Pedra Torneira", "acessorios"),
  peca("WEST-PC", "Pedra Champanheira", "acessorios"),
  peca("WEST-FS", "Fóssil Seymouria", "fosseis-decorativos"),
  peca("WEST-FC", "Fóssil Coelphisys", "fosseis-decorativos"),
];

const LINHAS = Object.entries(CATS).map(([handle, title]) => ({ handle, title, description: "" }));

const titulos = (q: string) => buscarProdutos(q, CATALOGO).map((a) => a.item.node.title);
const primeiro = (q: string) => titulos(q)[0];
const CASCATAS = [
  "Cascata Santa Bárbara",
  "Cascata Santa Clara",
  "Cascata Lajedo Yporanga",
  "Cascata Lajedo Boreal",
  "Cascata Sabino",
];

describe("código (SKU) em qualquer forma", () => {
  it.each(["pg3", "PG3", "pg 3", "PG-3", "west-pg3", "WEST-PG3-GRANITO", "pg3 granito", "Pedra Grande 3"])(
    "%s → Pedra Grande 3",
    (q) => expect(primeiro(q)).toBe("Pedra Grande 3"),
  );

  it("pg1 traz a PG1 e depois a PG10 (começo do código)", () => {
    expect(titulos("pg1")).toEqual(["Pedra Grande 1", "Pedra Grande 10"]);
  });

  it("pg sozinho → as 10 pedras grandes", () => {
    const r = titulos("pg");
    expect(r).toHaveLength(10);
    expect(r.every((t) => t.startsWith("Pedra Grande"))).toBe(true);
  });

  it("código de bundle com e sem acabamento", () => {
    expect(primeiro("csc")).toBe("Cascata Santa Clara");
    expect(primeiro("CSC-Q")).toBe("Cascata Santa Clara");
    expect(primeiro("fsl")).toBe("Fonte Sabino com Lago");
  });

  it("pbs: o painel antes do kit; kit pbs: o kit", () => {
    expect(titulos("pbs")).toEqual(["Painel Bruto Santorini", "Kit Painel Bruto Santorini (3 uni)"]);
    expect(primeiro("kit pbs")).toBe("Kit Painel Bruto Santorini (3 uni)");
  });
});

describe("nome", () => {
  it("número é palavra inteira: pedra grande 3 não traz a 10 nem o kit (3 uni)", () => {
    expect(titulos("pedra grande 3")).toEqual(["Pedra Grande 3"]);
  });

  it("stopword não atrapalha", () => {
    expect(primeiro("pedra de borda 2")).toBe("Pedra de Borda 2");
    expect(primeiro("borda 2")).toBe("Pedra de Borda 2");
  });

  it("plural e gênero", () => {
    expect(titulos("pedras grandes").slice(0, 10).every((t) => t.startsWith("Pedra Grande"))).toBe(true);
    expect(primeiro("pedra medio 5")).toBe("Pedra Média 5");
  });

  it("acento e maiúscula", () => {
    expect(primeiro("PEDRA MEDIA 5")).toBe("Pedra Média 5");
    expect(titulos("fosseis")).toEqual(["Fóssil Seymouria", "Fóssil Coelphisys"]);
    expect(titulos("fóssil")).toEqual(["Fóssil Seymouria", "Fóssil Coelphisys"]);
  });

  it("pedaço de palavra", () => {
    expect(titulos("casc")).toEqual(CASCATAS);
    expect(titulos("sant")).toEqual(
      expect.arrayContaining([
        "Cascata Santa Bárbara",
        "Cascata Santa Clara",
        "Fonte Santa Rita",
        "Painel Bruto Santorini",
      ]),
    );
  });

  it("erro de digitação", () => {
    expect(titulos("cascta santa barbra")).toEqual(["Cascata Santa Bárbara"]);
    expect(primeiro("seymoria")).toBe("Fóssil Seymouria");
    expect(primeiro("champanhera")).toBe("Pedra Champanheira");
    expect(primeiro("coelphysis")).toBe("Fóssil Coelphisys");
  });

  it("uma palavra sem par não zera a busca (cai pro OU)", () => {
    expect(primeiro("pedra grande xyzzz")).toMatch(/^Pedra Grande/);
  });

  it("sem pedir kit, a peça avulsa vem antes do kit", () => {
    expect(titulos("led")).toEqual(["Pedra LED", "Kit Pedra LED (3 uni)"]);
    expect(primeiro("kit led")).toBe("Kit Pedra LED (3 uni)");
  });

  it("o OU não traz ruído: palavra só na descrição não vira resultado", () => {
    expect(titulos("projeto 3d")).toEqual([]);
  });

  it("nada a buscar", () => {
    expect(titulos("")).toEqual([]);
    expect(titulos("a")).toEqual([]);
    expect(titulos("de")).toEqual([]);
  });
});

describe("categoria, acabamento e tensão", () => {
  it("categoria", () => {
    expect(titulos("revestimento")).toEqual([
      "Placa Rústica Riviera",
      "Painel Bruto Amalfi",
      "Painel Bruto Mykonos",
      "Painel Bruto Santorini",
      "Kit Painel Bruto Santorini (3 uni)",
      "Kit Placa Rústica Riviera (3 uni)",
    ]);
    expect(titulos("pedras decorativas")).toHaveLength(23);
  });

  it("acabamento qualifica", () => {
    expect(titulos("cascata granito")).toEqual(CASCATAS);
    expect(titulos("madeira")).toEqual(["Pisada Eucalipto", "Pisada Dormente"]);
  });

  it("tensão: fonte 220 só traz fonte com versão 220 V", () => {
    expect(titulos("fonte 220")).toEqual(["Fonte Mini Sabino", "Fonte Mini Lago", "Fonte Santa Rita"]);
  });
});

describe("sinônimos", () => {
  it("cachoeira e queda d'água → cascatas", () => {
    expect(titulos("cachoeira")).toEqual(CASCATAS);
    expect(CASCATAS).toContain(primeiro("queda d'água"));
  });

  it("parede → revestimentos; piso → pisadas; luz → Pedra LED", () => {
    expect(primeiro("parede")).toBe("Placa Rústica Riviera");
    expect(primeiro("piso")).toMatch(/^Pisada/);
    expect(primeiro("luz")).toBe("Pedra LED");
  });
});

describe("resolveSearch — atalhos não sequestram a busca", () => {
  const busca = (q: string) => resolveSearch(q, LINHAS, CATALOGO);

  it("'pedras decorativas' não abre a Western Box (o 'cor' de deCORativas)", () => {
    expect(busca("pedras decorativas").atalhos.map((a) => a.id)).not.toContain("box");
  });

  it("serviço → atalho primeiro", () => {
    const r = busca("projeto 3d");
    expect(r.pecasPrimeiro).toBe(false);
    expect(r.atalhos.map((a) => a.id)).toContain("contrate");
  });

  it("acabamento sozinho → Western Box primeiro, peças depois", () => {
    const r = busca("quartzo");
    expect(r.pecasPrimeiro).toBe(false);
    expect(r.atalhos[0]?.id).toBe("box");
    expect(r.produtos.length).toBeGreaterThan(0);
  });

  it("código → peça primeiro e sem atalho", () => {
    const r = busca("pg3");
    expect(r.pecasPrimeiro).toBe(true);
    expect(r.atalhos).toEqual([]);
    expect(r.produtos[0].node.title).toBe("Pedra Grande 3");
  });

  it("kit → peças primeiro + Conjuntos prontos", () => {
    const r = busca("kit");
    expect(r.pecasPrimeiro).toBe(true);
    expect(r.atalhos.map((a) => a.id)).toEqual(["conjuntos"]);
  });

  it("linhas por relevância", () => {
    expect(busca("pedras médias").linhas[0]?.title).toBe("Pedras Médias");
    expect(busca("cachoeira").linhas[0]?.title).toBe("Cascatas");
  });
});

describe("codigoDoProduto", () => {
  it("código curto para mostrar", () => {
    const por = (t: string) => CATALOGO.find((p) => p.node.title === t)!.node;
    expect(codigoDoProduto(por("Pedra Grande 3"))).toBe("PG3");
    expect(codigoDoProduto(por("Kit Painel Bruto Santorini (3 uni)"))).toBe("KIT-PBS");
    expect(codigoDoProduto(por("Cascata Santa Clara"))).toBe("CSC");
    expect(codigoDoProduto(por("Fonte Mini Sabino"))).toBe("FMS");
  });
});
