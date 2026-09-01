import { describe, it, expect } from "vitest";
import { totalComDesconto, unitarioComDesconto, somaComDesconto, vendaSugerida } from "./precoParceiro";

/**
 * O que estes testes protegem: a vitrine mostra o preço já com desconto, mas
 * quem cobra é o WooCommerce, com cupom percentual. Se as duas contas não forem
 * idênticas, o cliente vê um valor na loja e paga outro no checkout.
 *
 * A regra do Woo é: centavos inteiros, arredonda o DESCONTO (meio para cima),
 * subtrai. Não é `total * (1 - pct/100)` — foi assim que o centavo apareceu.
 */

/** Espelho da conta do WooCommerce, para comparar de forma independente. */
function comoOWooCobra(precoUnitario: number, quantidade: number, pct: number): number {
  const bruto = Math.round(precoUnitario * 100) * quantidade;
  const desconto = Math.round((bruto * pct) / 100);
  return (bruto - desconto) / 100;
}

/** Os percentuais em vigor desde 31/08/2026. */
const VITRINE = 8.3333;
const PARTNER = 16.6667;

describe("preço do parceiro", () => {
  it("sem desconto devolve o preço cheio", () => {
    expect(totalComDesconto(2510, 3, 0)).toBe(7530);
    expect(unitarioComDesconto(65, 0)).toBe(65);
  });

  it("desconta os níveis vitrine e partner", () => {
    expect(unitarioComDesconto(1272, VITRINE)).toBe(1166);
    expect(unitarioComDesconto(1272, PARTNER)).toBe(1060);
    expect(totalComDesconto(68.4, 4, PARTNER)).toBe(228);
  });

  /**
   * A regra comercial inteira depende disto: o preço de lista é a tabela
   * R02FEV2025 × 1,20 (40% de margem sobre o sugerido), e o desconto do nível
   * tem de pousar exatamente em 45% e 50% de margem. Um centavo de erro aqui
   * significa cobrar do parceiro um valor diferente do que a tabela promete.
   *
   * Valores conferidos contra a R02FEV2025 nos 50 produtos.
   */
  it("o desconto do nível pousa exatamente na tabela oficial", () => {
    const casos: Array<[string, number, number, number]> = [
      // produto,                 lista,  vitrine 45%,  partner 50%
      ["Pisada Pedra Pequena",     68.4,        62.7,          57],
      ["Pedra Grande 1",           1272,        1166,        1060],
      ["Cascata Sabino",           1560,        1430,        1300],
      ["Cascata Santa Clara (cx)",  900,         825,         750],
    ];
    for (const [nome, lista, vit, par] of casos) {
      expect(unitarioComDesconto(lista, VITRINE), nome + " vitrine").toBe(vit);
      expect(unitarioComDesconto(lista, PARTNER), nome + " partner").toBe(par);
    }
  });

  it("preço com meio centavo segue a regra do Woo, não a conta ingênua", () => {
    // A Western Box está fora do desconto por decisão comercial, mas a regra de
    // arredondamento continua valendo para qualquer preço futuro que não seja
    // redondo — é o caso que revelou a divergência de R$ 0,01.
    expect(totalComDesconto(349.9, 1, 5)).toBe(332.4);
    expect(349.9 * 0.95).toBeCloseTo(332.405, 3); // a conta ingênua diverge
  });

  it("bate com o WooCommerce em todo o catálogo, nos dois níveis, de 1 a 7 unidades", () => {
    const precos = [
      42, 68.4, 102, 144, 210, 270, 342, 408, 349.9, 504, 660, 828, 1002,
      1266, 1272, 1560, 1596, 1734, 2004, 2706, 2826, 3012, 5082,
    ];
    const divergentes: string[] = [];
    for (const p of precos) {
      for (const pct of [VITRINE, PARTNER]) {
        for (let q = 1; q <= 7; q++) {
          const nosso = totalComDesconto(p, q, pct);
          const woo = comoOWooCobra(p, q, pct);
          if (nosso !== woo) divergentes.push(`R$${p} ${pct}% x${q}: ${nosso} != ${woo}`);
        }
      }
    }
    expect(divergentes).toEqual([]);
  });

  it("soma linha a linha, como o Woo — não soma tudo para descontar no fim", () => {
    const linhas = [
      { precoUnitario: 349.9, quantidade: 1 },
      { precoUnitario: 68.4, quantidade: 3 },
    ];
    const esperado = comoOWooCobra(349.9, 1, VITRINE) + comoOWooCobra(68.4, 3, VITRINE);
    expect(somaComDesconto(linhas, VITRINE)).toBeCloseTo(esperado, 2);
  });
});

describe("venda sugerida ao consumidor", () => {
  it("é o preço de tabela × 5/3, ao centavo", () => {
    // O preço de lista é 40% de margem sobre o sugerido, então o sugerido é
    // lista ÷ 0,60. Valores conferidos contra a R02FEV2025.
    expect(vendaSugerida(1272)).toBe(2120);
    expect(vendaSugerida(1560)).toBe(2600);
    expect(vendaSugerida(2700)).toBe(4500);
    expect(vendaSugerida(5082)).toBe(8470);
  });

  it("funciona em preço quebrado", () => {
    // Pisada Pedra Pequena: lista R$ 68,40 → público R$ 114,00
    expect(vendaSugerida(68.4)).toBe(114);
  });

  it("o partner paga exatamente metade do que o consumidor paga", () => {
    // É a definição dos 50% de margem, e o argumento comercial inteiro.
    for (const lista of [68.4, 1272, 1560, 2700, 5082]) {
      expect(unitarioComDesconto(lista, PARTNER) * 2).toBeCloseTo(vendaSugerida(lista), 2);
    }
  });

  it("é sempre maior que o preço de tabela", () => {
    for (const p of [42, 68.4, 234, 1272, 4302, 5082]) {
      expect(vendaSugerida(p)).toBeGreaterThan(p);
    }
  });
});
