import { describe, expect, it } from "vitest";
import { agruparItens, grupoDoItem } from "./grupos";
import type { CartItem } from "@/stores/cartStore";

function linha(
  productTitle: string,
  quantity: number,
  collectionHandle?: string,
  variantTitle = "Granito",
): CartItem {
  return {
    productHandle: productTitle.toLowerCase().replace(/\s+/g, "-"),
    productTitle,
    productImage: null,
    variantId: productTitle + "|" + variantTitle,
    variantTitle,
    price: { amount: "100", currencyCode: "BRL" } as CartItem["price"],
    quantity,
    selectedOptions: [{ name: "Acabamento", value: variantTitle }],
    collectionHandle,
  };
}

describe("agruparItens", () => {
  it("põe os blocos na ordem do dono e o resto em ordem alfabética", () => {
    const g = agruparItens([
      linha("Pisada Dormente", 1, "pisadas"),
      linha("Pedra Grande 3", 1, "pedras-grandes"),
      linha("Pedra LED", 1, "acessorios"),
      linha("Pedra Pequena 1", 1, "pedras-pequenas"),
      linha("Cascata Sabino", 1, "cascatas"),
    ]);
    expect(g.map((x) => x.handle)).toEqual([
      "pedras-pequenas",
      "pedras-grandes",
      "acessorios",
      "cascatas",
      "pisadas",
    ]);
  });

  it("usa ordem alfabética NATURAL dentro do bloco (10 depois do 9)", () => {
    const g = agruparItens([
      linha("Pedra Grande 10", 1, "pedras-grandes"),
      linha("Pedra Grande 9", 1, "pedras-grandes"),
      linha("Pedra Grande 1", 1, "pedras-grandes"),
    ]);
    expect(g[0].itens.map((i) => i.productTitle)).toEqual([
      "Pedra Grande 1",
      "Pedra Grande 9",
      "Pedra Grande 10",
    ]);
  });

  it("desempata pelo acabamento quando a peça é a mesma", () => {
    const g = agruparItens([
      linha("Pedra Média 2", 1, "pedras-medias", "Quartzo"),
      linha("Pedra Média 2", 1, "pedras-medias", "Arenito"),
    ]);
    expect(g[0].itens.map((i) => i.variantTitle)).toEqual(["Arenito", "Quartzo"]);
  });

  it("soma as peças de cada bloco", () => {
    const g = agruparItens([
      linha("Pedra Grande 3", 3, "pedras-grandes"),
      linha("Pedra Grande 7", 2, "pedras-grandes"),
    ]);
    expect(g[0].pecas).toBe(5);
  });

  it("reproduz o pedido real CZCE1-P01 (18 linhas, 46 peças) embaralhado", () => {
    const pedido = [
      ["Pedra Grande 1", 1], ["Pedra Grande 3", 3], ["Pedra Grande 4", 3], ["Pedra Grande 6", 1],
      ["Pedra Grande 7", 3], ["Pedra Grande 8", 2], ["Pedra Grande 9", 2], ["Pedra Grande 10", 1],
      ["Pedra Média 2", 2], ["Pedra Média 3", 1], ["Pedra Média 4", 2], ["Pedra Média 6", 1],
      ["Pedra Média 7", 4], ["Pedra Média 8", 3],
      ["Pedra Pequena 1", 2], ["Pedra Pequena 3", 3], ["Pedra Pequena 4", 6], ["Pedra Pequena 5", 6],
    ] as const;
    const handle = (n: string) =>
      n.includes("Grande") ? "pedras-grandes" : n.includes("Média") ? "pedras-medias" : "pedras-pequenas";
    const embaralhado = [...pedido].reverse().concat([]).sort((a, b) => (a[0].length % 3) - (b[0].length % 3));
    const g = agruparItens(embaralhado.map(([n, q]) => linha(n, q, handle(n))));

    expect(g.map((x) => [x.handle, x.pecas])).toEqual([
      ["pedras-pequenas", 17],
      ["pedras-medias", 13],
      ["pedras-grandes", 16],
    ]);
    expect(g[2].itens.map((i) => i.productTitle)).toEqual([
      "Pedra Grande 1", "Pedra Grande 3", "Pedra Grande 4", "Pedra Grande 6",
      "Pedra Grande 7", "Pedra Grande 8", "Pedra Grande 9", "Pedra Grande 10",
    ]);
  });
});

describe("grupoDoItem — linhas sem categoria (gravadas antes do collectionHandle)", () => {
  it.each([
    ["Kit Pisada Pedra Grande (3 uni)", "pisadas"],
    ["Pisada Pedra Pequena", "pisadas"],
    ["Pedra de Borda 2", "pedras-de-borda"],
    ["Pedra Média 7", "pedras-medias"],
    ["Pedra Media 7", "pedras-medias"],
    ["Painel Bruto Amalfi", "revestimentos"],
    ["Placa Rústica Riviera", "revestimentos"],
    ["Pedra LED", "acessorios"],
    ["Pedra Champanheira", "acessorios"],
    ["Fóssil Coelphisys", "fosseis-decorativos"],
    ["Western Box — Samples + Catálogo", "amostras"],
    ["Fonte Mini Lago", "fontes-para-jardim"],
    ["Cascata Santa Clara – Granito", "cascatas"],
  ])("%s -> %s", (titulo, esperado) => {
    expect(grupoDoItem(linha(titulo, 1))).toBe(esperado);
  });

  it("ignora um collectionHandle desconhecido e cai no nome", () => {
    expect(grupoDoItem(linha("Pedra Grande 3", 1, "conjuntos"))).toBe("pedras-grandes");
  });

  it("o que não reconhece vai para Outras peças, no fim", () => {
    const g = agruparItens([linha("Peça Misteriosa", 1), linha("Pedra Grande 1", 1, "pedras-grandes")]);
    expect(g.map((x) => x.handle)).toEqual(["pedras-grandes", "outros"]);
  });
});
