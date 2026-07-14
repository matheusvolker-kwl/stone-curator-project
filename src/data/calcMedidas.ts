/**
 * Medidas REAIS (Woo) usadas pela calculadora de quantidade da PDP.
 *
 * Só existe entrada onde há uma REGRA FÍSICA de quantidade:
 *  - revestimento ("rev"): o cliente mede o muro em m² e a peça cobre X m².
 *  - pisada ("pis"): o cliente mede o caminho em metros e a peça avança X cm por passo.
 *
 * Nas demais peças (cascatas, fontes, fósseis, pedras autorais) a quantidade é
 * uma escolha de composição, não uma conta — por isso elas NÃO entram aqui e a
 * calculadora simplesmente não renderiza.
 *
 * Fonte: catálogo Woo (ficha real de cada SKU). Não estimar, não arredondar:
 * qualquer número novo aqui tem que vir da ficha do produto.
 *
 * A chave é o `handle` do produto (mesmo identificador usado em guideMap.ts e
 * no catálogo autoral).
 */

/** Revestimento — a conta é por área (m²). */
export interface CalcRevestimento {
  tipo: "rev";
  /** Cobertura real de UMA peça, em m². */
  cob: number;
  /** Peso líquido de UMA peça, em kg. */
  peso: number;
  /** Medida da face aparente, como sai na ficha. */
  face: string;
}

/** Pisada — a conta é por comprimento do caminho (m). */
export interface CalcPisada {
  tipo: "pis";
  /** Peso líquido de UMA peça, em kg. */
  peso: number;
  /** Comprimento da peça no sentido do caminho, em cm. */
  comp: number;
  /** Medida da face aparente, como sai na ficha. */
  face: string;
}

export type CalcMedida = CalcRevestimento | CalcPisada;

/**
 * Vão padrão entre as bordas de duas pisadas (paisagismo: 7–10 cm).
 * Fixo de propósito: a calculadora faz UMA pergunta por vez, e a folga já
 * absorve curvas e ajustes finos do caminho.
 */
export const VAO_PISADA_CM = 8;

/** Folga sugerida (recorte, encaixe, curvas). Padrão do sistema: 15%. */
export const SOBRAS_PCT = [10, 15, 20] as const;
export const SOBRA_PADRAO_PCT = 15;

export const CALC_MEDIDAS: Record<string, CalcMedida> = {
  "painel-bruto-amalfi": { tipo: "rev", cob: 1.81, peso: 105, face: "145 × 125 cm" },
  "painel-bruto-santorini": { tipo: "rev", cob: 1.62, peso: 95, face: "165 × 98 cm" },
  "painel-bruto-mykonos": { tipo: "rev", cob: 1.13, peso: 50, face: "120 × 94 cm" },
  "placa-rustica-riviera": { tipo: "rev", cob: 0.56, peso: 18, face: "75 × 75 cm" },
  "pisada-pedra-grande": { tipo: "pis", peso: 13, comp: 60, face: "60 × 49 cm" },
  "pisada-dormente": { tipo: "pis", peso: 8, comp: 58, face: "58 × 23,5 cm" },
  "pisada-pedra-media": { tipo: "pis", peso: 8, comp: 52, face: "52 × 39 cm" },
  "pisada-pedra-pequena": { tipo: "pis", peso: 5, comp: 43, face: "43 × 32 cm" },
  "pisada-eucalipto": { tipo: "pis", peso: 6, comp: 35, face: "Ø 35 cm" },
};

/** Retorna a medida da peça, ou `null` quando ela não tem regra de quantidade. */
export function getCalcMedida(handle?: string | null): CalcMedida | null {
  if (!handle) return null;
  return CALC_MEDIDAS[handle.trim().toLowerCase()] ?? null;
}
