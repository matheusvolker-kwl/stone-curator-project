/**
 * Kits "Leve 3, −10%" — Product Bundles no Woo (publicados, catalog hidden).
 * Cada kit embrulha o produto-base ×3 com 10% de desconto por item
 * (priced_individually — o preço herda do base, inclusive o gate B2B).
 *
 * O kit NÃO aparece em grids: ele existe só como upsell pós-quantidade na PDP
 * do produto-base (decisão C-refinado: upsell, não toggle concorrente).
 *
 * IMPORTANTE (checkout): os bases são produtos VARIÁVEIS (acabamento). O
 * add-to-cart do bundle no Woo exige a configuração da variação do item
 * embrulhado — o app envia `bundle_config` na linha do handoff (ver
 * docs/woo-checkout-handoff.md §6). Enquanto o mu-plugin do Woo não for
 * atualizado para consumir esse campo, manter KIT_UPSELL_ENABLED = false.
 */

export interface KitInfo {
  /** id do produto bundle no Woo */
  kitProductId: number;
  /** id do bundled_item dentro do bundle (necessário no bundle_config) */
  bundledItemId: number;
  /** Título exato do produto no Woo */
  kitTitle: string;
  /** Unidades do base dentro do kit */
  units: number;
  /** Desconto % por item */
  discountPct: number;
}

/**
 * Liga/desliga o upsell de kit na PDP.
 * Flag OFF até o mu-plugin western-checkout-handoff aceitar `bundle_config`
 * (sem isso, a linha de kit chega ao checkout do Woo sem variação e falha).
 */
export const KIT_UPSELL_ENABLED = false;

/** Mapa: id Woo do produto-base → kit correspondente. */
export const KIT_BY_BASE_PRODUCT: Record<number, KitInfo> = {
  927: { kitProductId: 2347, bundledItemId: 36, kitTitle: "Kit Pedra LED (3 uni)", units: 3, discountPct: 10 },
  873: { kitProductId: 2348, bundledItemId: 37, kitTitle: "Kit Pedra Sonora (3 uni)", units: 3, discountPct: 10 },
  901: { kitProductId: 2349, bundledItemId: 38, kitTitle: "Kit Pisada Dormente (3 uni)", units: 3, discountPct: 10 },
  902: { kitProductId: 2350, bundledItemId: 39, kitTitle: "Kit Pisada Eucalipto (3 uni)", units: 3, discountPct: 10 },
  900: { kitProductId: 2351, bundledItemId: 40, kitTitle: "Kit Pisada Pedra Grande (3 uni)", units: 3, discountPct: 10 },
  899: { kitProductId: 2352, bundledItemId: 41, kitTitle: "Kit Pisada Pedra Média (3 uni)", units: 3, discountPct: 10 },
  898: { kitProductId: 2353, bundledItemId: 42, kitTitle: "Kit Pisada Pedra Pequena (3 uni)", units: 3, discountPct: 10 },
  842: { kitProductId: 2354, bundledItemId: 43, kitTitle: "Kit Placa Rústica Riviera (3 uni)", units: 3, discountPct: 10 },
  841: { kitProductId: 2355, bundledItemId: 44, kitTitle: "Kit Painel Bruto Amalfi (3 uni)", units: 3, discountPct: 10 },
  840: { kitProductId: 2356, bundledItemId: 45, kitTitle: "Kit Painel Bruto Mykonos (3 uni)", units: 3, discountPct: 10 },
  839: { kitProductId: 2357, bundledItemId: 46, kitTitle: "Kit Painel Bruto Santorini (3 uni)", units: 3, discountPct: 10 },
};
