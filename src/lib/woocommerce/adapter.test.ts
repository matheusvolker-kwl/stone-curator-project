import { describe, it, expect } from "vitest";
import { resolveWooPrice } from "./adapter";
import type { WooProduct } from "./types";

/**
 * Os conjuntos (bundles) voltam da Store API com prices.price = 0 — o valor
 * real só existe no price_html, já renderizado pelo WordPress. Ler HTML é
 * frágil, e em 31/08/2026 SETE kits estavam no ar a 100x o preço por causa
 * disso. Estes testes usam o HTML literal que a loja servia naquele dia.
 */

const produto = (price_html: string): WooProduct =>
  ({ id: 1, price: "0", price_html } as unknown as WooProduct);

/* Kit Placa Rústica Riviera (id 2354), em promoção. */
const HTML_EM_PROMOCAO =
  '<del aria-hidden="true"><span class="woocommerce-Price-amount amount">' +
  '<span class="woocommerce-Price-currencySymbol">&#082;&#036;</span>&nbsp;594,00</span></del> ' +
  '<span class="screen-reader-text">O preço original era: &#082;&#036;&nbsp;594,00.</span>' +
  '<ins aria-hidden="true"><span class="woocommerce-Price-amount amount">' +
  '<span class="woocommerce-Price-currencySymbol">&#082;&#036;</span>&nbsp;534,60</span></ins>' +
  '<span class="screen-reader-text">O preço atual é: &#082;&#036;&nbsp;534,60.</span>';

/* Cascata Santa Bárbara – Moledo (id 1539), sem promoção. */
const HTML_SIMPLES =
  '<span class="woocommerce-Price-amount amount">' +
  '<span class="woocommerce-Price-currencySymbol">&#082;&#036;</span>&nbsp;3.943,50</span>';

describe("preço do conjunto a partir do price_html", () => {
  it("em promoção, devolve o preço que o cliente paga — não o riscado", () => {
    expect(resolveWooPrice(produto(HTML_EM_PROMOCAO))).toBe("534.6");
  });

  it("sem promoção, devolve o preço único", () => {
    expect(resolveWooPrice(produto(HTML_SIMPLES))).toBe("3943.5");
  });

  it("o ponto final da frase não vira separador decimal", () => {
    // Era este o bug dos 100x: "594,00." lido como 59400.
    const so_leitor_de_tela =
      '<span class="screen-reader-text">O preço atual é: &#082;&#036;&nbsp;594,00.</span>' +
      '<span class="woocommerce-Price-amount amount">&#082;&#036;&nbsp;594,00.</span>';
    expect(resolveWooPrice(produto(so_leitor_de_tela))).toBe("594");
  });

  it("o símbolo R$ codificado não vira número", () => {
    // &#082; = "R" e &#036; = "$". Sem decodificar, 82 e 36 disputavam com o
    // preço — e ganhariam em qualquer conjunto abaixo de R$ 82,00.
    const barato =
      '<span class="woocommerce-Price-amount amount">' +
      '<span class="woocommerce-Price-currencySymbol">&#082;&#036;</span>&nbsp;35,00</span>';
    expect(resolveWooPrice(produto(barato))).toBe("35");
  });

  it("numa faixa de preço, devolve o menor (o 'a partir de')", () => {
    const faixa =
      '<span class="amount">&#082;&#036;&nbsp;1.200,00</span> &#8211; ' +
      '<span class="amount">&#082;&#036;&nbsp;2.400,00</span>';
    expect(resolveWooPrice(produto(faixa))).toBe("1200");
  });

  it("preço direto tem prioridade sobre o html", () => {
    const p = { id: 1, price: "1272", price_html: HTML_SIMPLES } as unknown as WooProduct;
    expect(resolveWooPrice(p)).toBe("1272");
  });

  it("sem html e sem preço, devolve 0 em vez de inventar", () => {
    expect(resolveWooPrice({ id: 1, price: "0" } as unknown as WooProduct)).toBe("0");
  });

  it("os sete kits que estavam a 100x voltam ao valor certo", () => {
    const casos: Array<[string, string]> = [
      ["594,00", "534.6"], ["396,00", "356.4"], ["313,50", "282.15"],
      ["280,50", "252.45"], ["264,00", "237.6"], ["188,10", "169.29"],
    ];
    for (const [cheio, pago] of casos) {
      const html =
        '<del aria-hidden="true"><span class="amount">&#082;&#036;&nbsp;' + cheio + "</span></del> " +
        '<span class="screen-reader-text">O preço original era: &#082;&#036;&nbsp;' + cheio + ".</span>" +
        '<ins aria-hidden="true"><span class="amount">&#082;&#036;&nbsp;' +
        Number(pago).toLocaleString("pt-BR", { minimumFractionDigits: 2 }) + "</span></ins>";
      expect(resolveWooPrice(produto(html)), cheio).toBe(pago);
    }
  });
});
