/**
 * Segmentos da página /inspiracoes fundida (Inspire-se + Obras num só lugar).
 * Cada segmento = introdução (texto) + galeria de fotos gerais + exemplos de obra.
 * As galerias vêm de src/assets/segmentos/<id>/*.webp (import.meta.glob).
 */
const galeriaModules = import.meta.glob("../assets/segmentos/*/*.webp", {
  eager: true,
  import: "default",
}) as Record<string, string>;

function galeriaDe(id: string): string[] {
  return Object.entries(galeriaModules)
    .filter(([p]) => p.includes(`/segmentos/${id}/`))
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, url]) => url);
}

export interface Segmento {
  id: string;
  label: string;
  eyebrow: string;
  intro: string;
  galeria: string[];
  /** slugs de obras.ts usados como exemplos (podem não ter foto → card sem imagem) */
  obraSlugs: string[];
}

export const SEGMENTOS: Segmento[] = [
  {
    id: "piscinas",
    label: "Piscinas",
    eyebrow: "Piscinas naturais",
    intro:
      "A piscina que apaga a fronteira entre água e paisagem: lâmina orgânica, entrada de praia com profundidade zero, cascata como âncora e blowers que imitam a arrebentação. Água tratada por sal — sem cloro, sem olho ardendo.",
    galeria: galeriaDe("piscinas"),
    obraSlugs: ["showroom-riviera", "casa-de-praia-tato", "tapirai"],
  },
  {
    id: "lagos",
    label: "Lagos",
    eyebrow: "Lagos ornamentais",
    intro:
      "Espelhos d'água vivos, com carpas e plantas aquáticas, onde a pedra faz a margem naturalística. A água por salinização deixa peixe e planta conviverem na mesma lâmina — inclusive no lago híbrido, misturando pedra natural e Western.",
    galeria: galeriaDe("lagos"),
    obraSlugs: ["lago-neymar", "evandro-mesquita"],
  },
  {
    id: "cascatas",
    label: "Cascatas",
    eyebrow: "Cascatas",
    intro:
      "A âncora hídrica de quase todo projeto — o som, o movimento e o ponto alto. Nunca flutua: nasce de dentro do verde ou sobre uma base que a ergue para dar queda. Cerca de 10× mais leve, sobe até a cobertura sem guindaste.",
    galeria: galeriaDe("cascatas"),
    obraSlugs: ["modulo-15", "showroom-riviera"],
  },
  {
    id: "jardins",
    label: "Jardins",
    eyebrow: "Jardins & paisagismo",
    intro:
      "A pedra como escultura e ponto focal, com ou sem água. Matacões plantados entre a vegetação, pisadas que conduzem o caminhar — afloramento que parece ter sempre estado ali. É o uso mais versátil, do quintal ao rooftop.",
    galeria: galeriaDe("jardins"),
    obraSlugs: [],
  },
  {
    id: "revestimentos",
    label: "Revestimentos",
    eyebrow: "Revestimentos",
    intro:
      "A pedra que veste ambientes: paredes, balcões, bares, lavabos e lobbies. A leveza viabiliza uma face de rocha bruta sem estrutura pesada — do balcão de sushi ao spa de alto padrão.",
    galeria: galeriaDe("revestimentos"),
    obraSlugs: ["unique-garden", "rosewood"],
  },
  {
    id: "viveiros",
    label: "Viveiros",
    eyebrow: "Viveiros & aviários",
    intro:
      "A pedra que constrói o hábitat. Aviários de imersão com parede rochosa e tocas, poleiros de galho e bebedouros de pedra — a ave vive dentro de uma paisagem, não numa gaiola. A linha carrega a história do Projeto Ararinha-Azul.",
    galeria: galeriaDe("viveiros"),
    obraSlugs: [],
  },
  {
    id: "especiais",
    label: "Especiais",
    eyebrow: "Casos especiais",
    intro:
      "Quando a pedra sai do paisagismo: mobiliário autoral e estrutura de arquitetura. Da base de mesa do escritório do Caíto Maia às árvores-pilar de sombra do Jader Almeida, num campo de golfe.",
    galeria: [],
    obraSlugs: ["caito-maia", "jader-porto-belo"],
  },
];
