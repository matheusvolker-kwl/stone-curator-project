/**
 * Preço do parceiro com o desconto do nível dele.
 *
 * Por que não basta `preco * (1 - pct/100)`:
 * a vitrine mostra o preço já descontado, mas quem cobra é o WooCommerce, com
 * um cupom percentual. E o Woo faz a conta de outro jeito — trabalha em
 * centavos inteiros e arredonda o DESCONTO, não o total. Nos preços que caem
 * em meio centavo os dois resultados divergem em R$ 0,01, e o cliente vê um
 * número na loja e outro no checkout. Um centavo de diferença é suficiente
 * para ele desconfiar do site inteiro.
 *
 * Medido no catálogo de 28/08/2026: das 602 combinações (43 faixas de preço ×
 * 2 níveis × 1 a 7 unidades), divergiam 2 — ambas na Western Box (R$ 349,90 a
 * 5%), único preço que não é múltiplo de R$ 5. Esta função reproduz a
 * aritmética do Woo, então passam a bater por construção, inclusive em preços
 * futuros que não sejam redondos.
 */

/** Reproduz wc_round_discount: centavos inteiros, meio para cima. */
function descontoEmCentavos(brutoCentavos: number, pct: number): number {
  return Math.round((brutoCentavos * pct) / 100);
}

/**
 * Total da linha já com desconto, em reais.
 * @param precoUnitario preço cheio da unidade, em reais
 * @param quantidade    unidades
 * @param pct           desconto do nível (0, 5 ou 10)
 */
export function totalComDesconto(precoUnitario: number, quantidade: number, pct: number): number {
  const bruto = Math.round(precoUnitario * 100) * quantidade;
  if (!pct || pct <= 0) return bruto / 100;
  return (bruto - descontoEmCentavos(bruto, pct)) / 100;
}

/** Preço unitário já com desconto, em reais. */
export function unitarioComDesconto(precoUnitario: number, pct: number): number {
  return totalComDesconto(precoUnitario, 1, pct);
}

/**
 * Soma de várias linhas com desconto.
 * Soma linha a linha, como o Woo — somar tudo e descontar no fim daria outro
 * centavo de diferença.
 */
export function somaComDesconto(
  linhas: Array<{ precoUnitario: number; quantidade: number }>,
  pct: number,
): number {
  return linhas.reduce((s, l) => s + totalComDesconto(l.precoUnitario, l.quantidade, pct), 0);
}

/**
 * Venda sugerida ao consumidor final, a partir do preço de tabela.
 *
 * A régua comercial de 31/08/2026 é margem sobre o preço sugerido:
 *   atacado (entrada) = sugerido × 0,60   → 40% de margem
 *   vitrine           = sugerido × 0,55   → 45%
 *   partner           = sugerido × 0,50   → 50%
 * O preço de tabela do site é o do atacado, o degrau de entrada. Invertendo,
 * a venda sugerida é ele × 5/3 — função pura do preço de tabela, sem precisar
 * de campo novo em lugar nenhum.
 *
 * Conferido nos 50 produtos da tabela R02FEV2025 em 31/08/2026: bate ao
 * centavo em todos. O partner volta a pagar exatamente o atacado daquela
 * tabela, que é de onde a régua inteira sai.
 *
 * IMPORTANTE: recebe o preço de TABELA (o cheio), nunca o preço já com o
 * desconto do nível — a sugestão ao consumidor é a mesma para todo parceiro.
 */
export function vendaSugerida(precoTabela: number): number {
  const c = Math.round(precoTabela * 100) * 5;
  return Math.round(c / 3) / 100;
}
