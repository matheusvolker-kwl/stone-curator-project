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

describe("preço do parceiro", () => {
  it("sem desconto devolve o preço cheio", () => {
    expect(totalComDesconto(2510, 3, 0)).toBe(7530);
    expect(unitarioComDesconto(65, 0)).toBe(65);
  });

  it("desconta os níveis vitrine (5%) e partner (10%)", () => {
    expect(unitarioComDesconto(2510, 5)).toBe(2384.5);
    expect(unitarioComDesconto(2510, 10)).toBe(2259);
    expect(totalComDesconto(65, 4, 10)).toBe(234);
  });

  it("a Western Box a 5% cai em meio centavo e segue a regra do Woo", () => {
    // R$ 349,90 é o único preço do catálogo que não é múltiplo de R$ 5.
    // 5% dele = R$ 17,495. O desconto arredonda para 17,50 (meio para cima),
    // então o total é 332,40 — e não 332,41, que a conta ingênua daria.
    expect(totalComDesconto(349.9, 1, 5)).toBe(332.4);
    expect(349.9 * 0.95).toBeCloseTo(332.405, 3); // a conta ingênua diverge
  });

  it("bate com o WooCommerce em todo o catálogo, nos dois níveis, de 1 a 7 unidades", () => {
    const precos = [
      35, 65, 85, 120, 175, 225, 285, 340, 349.9, 420, 550, 690, 835,
      1055, 1330, 1370, 1445, 1670, 2255, 2355, 2510,
    ];
    const divergentes: string[] = [];
    for (const p of precos) {
      for (const pct of [5, 10]) {
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
      { precoUnitario: 65, quantidade: 3 },
    ];
    const esperado = comoOWooCobra(349.9, 1, 5) + comoOWooCobra(65, 3, 5);
    expect(somaComDesconto(linhas, 5)).toBeCloseTo(esperado, 2);
  });
});

describe("venda sugerida ao consumidor", () => {
  it("é o preço de tabela × 21/11, ao centavo", () => {
    // valores conferidos contra a tabela comercial de 29/08/2026
    expect(vendaSugerida(1430)).toBe(2730);
    expect(vendaSugerida(990)).toBe(1890);
    expect(vendaSugerida(1166)).toBe(2226);
    expect(vendaSugerida(3943.5)).toBe(7528.5);
  });

  it("funciona em preço quebrado", () => {
    // Pisada Pedra Pequena: tabela R$ 62,70 → público R$ 119,70
    expect(vendaSugerida(62.7)).toBe(119.7);
  });

  it("é sempre maior que o preço de tabela", () => {
    for (const p of [35, 62.7, 195, 1166, 3943.5, 5088]) {
      expect(vendaSugerida(p)).toBeGreaterThan(p);
    }
  });
});
