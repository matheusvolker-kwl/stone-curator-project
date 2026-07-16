/**
 * O PAPEL de cada peça na composição — a "gramática de projeto" do acervo (Parte 1.3).
 * Deriva do handle Woo (cascata-*, pedra-grande-*…) OU do código do acervo (CSB, PG9…),
 * sem depender de nenhum dado novo cadastrado. É a pedagogia que transforma uma
 * lista de peças "cruas" numa explicação de projetista, no ponto exato da decisão.
 */
export type Papel =
  | "Âncora"
  | "Volume"
  | "Transição"
  | "Preenchimento"
  | "Borda"
  | "Funcional"
  | "Destaque";

export interface PapelInfo {
  papel: Papel;
  /** 1 frase — vai no tooltip/aria, nunca como bloco de texto na linha */
  frase: string;
}

const FRASE: Record<Papel, string> = {
  "Âncora": "O ponto alto que organiza a cena e dá o som da água.",
  "Volume": "Dá corpo à base e sustenta a âncora, escalonada em alturas diferentes.",
  "Transição": "Costura a pedra grande até o gramado ou a água, sem alinhamento duro.",
  "Preenchimento": "Fecha os vãos — o olho nunca pula do grande direto pro vazio.",
  "Borda": "Arremata com segurança o encontro da água com o deck.",
  "Funcional": "A camada que entrega experiência — som, luz ou água — sem virar equipamento à vista.",
  "Destaque": "Peça de conversa: a que faz o visitante parar e perguntar.",
};

/**
 * Resolve o papel a partir do handle OU do código. Retorna null quando a peça
 * não se encaixa na gramática (ex.: pisada, painel) — nesse caso nada é exibido.
 */
export function papelDaPeca(ref: string | undefined | null): PapelInfo | null {
  if (!ref) return null;
  const s = ref.toLowerCase().trim();

  // Cascatas e fontes = âncora (handles cascata-/fonte- ; códigos CS, CSB, CSC, CLY, CLB)
  if (s.startsWith("cascata-") || s.startsWith("fonte-") || /^c[sl]/.test(s)) {
    return { papel: "Âncora", frase: FRASE["Âncora"] };
  }
  // Funcionais (exatos, para não colidir com pedras de composição)
  if (
    s.startsWith("pedra-sonora") ||
    s.startsWith("pedra-champanheira") ||
    s.startsWith("pedra-led") ||
    s.startsWith("pedra-torneira") ||
    /^(ps|pc|pl|pt)$/.test(s)
  ) {
    return { papel: "Funcional", frase: FRASE["Funcional"] };
  }
  if (s.startsWith("pedra-grande-") || /^pg\d/.test(s)) {
    return { papel: "Volume", frase: FRASE["Volume"] };
  }
  if (s.startsWith("pedra-media-") || /^pm\d/.test(s)) {
    return { papel: "Transição", frase: FRASE["Transição"] };
  }
  if (s.startsWith("pedra-pequena-") || /^pp\d/.test(s)) {
    return { papel: "Preenchimento", frase: FRASE["Preenchimento"] };
  }
  if (s.startsWith("pedra-de-borda-") || /^pb\d/.test(s)) {
    return { papel: "Borda", frase: FRASE["Borda"] };
  }
  if (s.startsWith("fossil-") || /^f[sc]/.test(s)) {
    return { papel: "Destaque", frase: FRASE["Destaque"] };
  }
  return null;
}
