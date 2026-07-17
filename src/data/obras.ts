/**
 * Fonte canônica de OBRAS Western — funde o que estava fatiado em projetos.ts,
 * casosWestern.ts e a galeria placeholder (deletada). Alimentado pelo acervo
 * (Western-Acervo-Conteudo.md, Parte 3) + correções do dono.
 *
 * A presença de `skus[]` (com handle Woo) é o discriminador de "comprável":
 * uma obra com skus vira card shop-the-look (adicionar ao orçamento); sem skus,
 * é inspiração/prova que roteia para consultoria — nunca com quantidade inventada.
 *
 * Imagens NÃO são importadas aqui (mantém o dado desacoplado e o build seguro).
 *
 * ⚠ DECLARAR UMA OBRA SÃO 3 ARQUIVOS, NÃO 1 — nesta ordem:
 *   1. obras.ts        — o dado (este arquivo).
 *   2. obraImages.ts   — OBRA_COVER[slug]. **OBRIGATÓRIO, não cosmético**:
 *      ObraPage.tsx:31 faz `if (!OBRA_COVER[slug]) return <Navigate to="/obras">`
 *      e /obras redireciona para /inspiracoes. Obra sem cover = LINK MORTO que
 *      devolve o usuário para a lista de onde ele saiu. Foi exatamente o que
 *      aconteceu com jader-porto-belo até 2026-07.
 *   3. segmentos.ts    — o slug em SEGMENTOS[n].obraSlugs, senão a obra não tem
 *      entrada nenhuma.
 * E, se a obra lastreia um rosto da prova social, socialProofLinks.ts.
 */
import { skuToHandle } from "./skuHandleMap";

export type ObraLinguagem =
  | "piscina"
  | "lago"
  | "jardim"
  | "cascata"
  | "revestimento"
  | "viveiro"
  | "mobiliario";

/** comprable = tem SKU e vai ao carrinho · sob-medida = inspiração/consultoria · depoimento = vídeo de cliente */
export type ObraTipo = "comprable" | "sob-medida" | "depoimento";

export interface ObraSku {
  /** código do acervo (ex.: "CSC") */
  codigo: string;
  /** handle Woo resolvido (undefined => peça sai do "adicionar todos") */
  handle?: string;
  qty: number;
  /** papel no projeto: âncora, volume, transição, preenchimento, borda, funcional, base */
  papel: string;
  /** rótulo curto legível (ex.: "Cascata Santa Clara") */
  nome: string;
}

export interface Obra {
  slug: string;
  titulo: string;
  cliente?: string;
  estudio?: string;
  local?: string;
  ano?: string;
  linguagens: ObraLinguagem[];
  tipo: ObraTipo;
  /** 1 linha — usada no card */
  snippet: string;
  /** 2–3 frases sempre visíveis no detalhe */
  conceito: string;
  /** texto longo "mente do criador" — só no acordeão do detalhe (opt-in) */
  menteDoCriador?: string;
  ficha?: string[];
  skus?: ObraSku[];
  creditos?: string[];
  /**
   * ⚠ CAMPO MORTO — ninguém lê. O docblock antigo prometia que "coverKey é
   * resolvido pela camada de imagem (imageIndex)": não é, e `imageIndex` não
   * existe no repo. A resolução é por SLUG em OBRA_COVER (obraImages.ts). Quem
   * preencheu isto achando que bastava criou link morto. Mantido só para não
   * quebrar dados antigos; não use.
   * @deprecated use OBRA_COVER[slug] em obraImages.ts
   */
  coverKey?: string;
  video?: string;
  /** @deprecated não consumido por ObraPage/Inspiracoes — não destaca nada hoje */
  destaque?: boolean;
  /** obra sob NDA — a guarda de UI esconde nome/detalhe */
  confidencial?: boolean;
  /** sinaliza que o material atual é só still de depoimento (sem foto da obra executada) */
  soDepoimento?: boolean;
}

/** helper local: monta um ObraSku a partir do código do acervo */
const sku = (codigo: string, qty: number, nome: string, papel: string): ObraSku => ({
  codigo,
  handle: skuToHandle(codigo),
  qty,
  nome,
  papel,
});

export const OBRAS: Obra[] = [
  // ── Piscinas / lagos compráveis ────────────────────────────────────────
  {
    slug: "casa-de-praia-tato",
    titulo: "Casa de Praia",
    cliente: "Tato (Falamansa)",
    estudio: "JJ Arquitetura",
    linguagens: ["piscina", "lago"],
    tipo: "comprable",
    destaque: true,
    soDepoimento: true,
    snippet:
      "Uma piscina de pastilha azul virou um oásis de 2.000 m²: praia, pedras, lago com carpas e fogo de chão.",
    conceito:
      "Arquitetura moderna e reta de um lado; natureza rochosa e água viva do outro. O gesto central é a prainha — entrada de areia em curva que convida a entrar caminhando. Toda a pedra foi jogada ao fundo para a cascata trabalhar como âncora sonora.",
    menteDoCriador:
      "Não assente a cascata (CLY) no chão: ela pede as 2× PM6 embaixo — as peças mais cúbicas e altas do jogo — para erguer e inclinar a queda. Ao redor, o maciço em escada de alturas: a PG10 (pedra larga de 2 m) deita como afloramento, a PG9 sobe atrás, a PG3 costura para as médias. As médias preenchem vãos e naturalizam o encontro pedra-vegetação-água. A PM7, comprida e chata, deita meio submersa como leito. A PB3 resolve a borda. E a PS vai escondida no jardim: o som existe, o equipamento não aparece.",
    ficha: ["JJ Arquitetura", "2.000 m² de área total", "Piscina 60 m² + lago 20 m²"],
    skus: [
      sku("CLY", 1, "Cascata Lajedo Yporanga", "âncora"),
      sku("PM6", 2, "Pedra Média 6", "base da cascata"),
      sku("PG10", 1, "Pedra Grande 10", "volume mestre"),
      sku("PG9", 1, "Pedra Grande 9", "volume"),
      sku("PG3", 1, "Pedra Grande 3", "transição"),
      sku("PM7", 1, "Pedra Média 7", "leito submerso"),
      sku("PM1", 1, "Pedra Média 1", "preenchimento"),
      sku("PM5", 1, "Pedra Média 5", "preenchimento"),
      sku("PB3", 1, "Pedra de Borda 3", "borda"),
      sku("PS", 1, "Pedra Sonora", "funcional"),
    ],
    creditos: ["Arquitetura: JJ Arquitetura"],
  },
  {
    slug: "lago-neymar",
    titulo: "Lago Híbrido",
    cliente: "Neymar Jr.",
    estudio: "Genesis Ecossistemas",
    local: "Mangaratiba · RJ",
    linguagens: ["lago"],
    tipo: "comprable",
    destaque: true,
    snippet:
      "Um dos maiores lagos artificiais do Brasil (1.000+ m²): pedra natural da Genesis + pedra Western nas zonas de carga crítica.",
    conceito:
      "O caso de ouro da mesclagem. Nas zonas críticas de casa de máquinas e manutenção, o peso da pedra natural comprometeria a engenharia — a solução foi distribuir pedras Western nessas regiões, preservando a unidade visual sem sobrecarga. Prova viva de que os dois universos convivem.",
    menteDoCriador:
      "A parceria com a Genesis Ecossistemas — que trabalha pedra natural — permitiu uma resposta técnica à altura de uma escala incomum. A pedra Western entra como âncora de borda (PG9, a pedra de proa) e degrau de espraiado (PG3), com a Champanheira (PC) como bar de gelo no convívio. O resto da margem é pedra natural da Genesis. Para o parceiro B2B, é o mapa de como mesclar sem perder venda de pedra natural.",
    ficha: ["Em parceria com Genesis Ecossistemas", "1.000+ m² de lago", "3 peças Western em zonas de carga crítica"],
    skus: [
      sku("PC", 1, "Pedra Champanheira", "funcional"),
      sku("PG9", 1, "Pedra Grande 9", "âncora de borda"),
      sku("PG3", 1, "Pedra Grande 3", "volume/degrau"),
    ],
    creditos: ["Pedra natural e execução do lago: Genesis Ecossistemas"],
  },
  {
    slug: "showroom-riviera",
    titulo: "ShowRoom Riviera de São Lourenço",
    cliente: "Western",
    local: "Riviera de São Lourenço · SP",
    linguagens: ["piscina", "cascata"],
    tipo: "comprable",
    snippet:
      "Uma piscina-praia completa do zero: cascata, blowers, ofurô e som — tudo num raio de poucos metros.",
    conceito:
      "Condensa tudo que uma piscina-praia Western sabe fazer. A lâmina é orgânica; a prainha branca antiderrapante entra na água com inclinação de praia real. A Cascata Santa Clara é a âncora, encostada no tropical. Os blowers são a arrebentação. A Pedra Sonora fica no deck, afastada da cascata para os sons não brigarem.",
    menteDoCriador:
      "Para replicar em escala maior, paisagista: mantenha a lógica de camadas. Cascata como âncora encostada no verde, prainha inclinada como corpo, blowers como movimento, pedras grandes costurando a margem (2× PM4 emoldurando + PM5 variando massa; PM2 chata como assento rente à água) e a pedra sonora como a camada sensorial que se descobre sentado.",
    ficha: ["Piscina-praia de demonstração", "Cascata + blowers + ofurô + som"],
    skus: [
      sku("CSC", 1, "Cascata Santa Clara", "âncora"),
      sku("PS", 1, "Pedra Sonora", "funcional"),
      sku("PM2", 1, "Pedra Média 2", "assento rente à água"),
      sku("PM4", 2, "Pedra Média 4", "moldura lateral"),
      sku("PM5", 1, "Pedra Média 5", "volume"),
    ],
  },
  {
    slug: "tapirai",
    titulo: "Piscina natural na serra",
    local: "Tapiraí · SP",
    linguagens: ["piscina", "cascata"],
    tipo: "comprable",
    snippet:
      "Borda infinita voltada para a serra, com cascata na cabeceira e desenho de afloramento — pedra que parece ter sempre estado ali.",
    conceito:
      "Tapiraí é serra, mata fechada e umidade — o desenho é de afloramento. Composição enxuta de propósito: uma cascata só (Lajedo Yporanga) na cabeceira, jogando a lâmina contra o espelho da piscina natural, com três grandes escalonando alturas e uma média costurando até o gramado.",
    menteDoCriador:
      "Na base da queda vem a PG6, a peça de maior massa, segurando o pé da cascata. Ao lado, a PG4, mais larga e baixa, faz o degrau. Afastada do eixo da água, planto a PG1 — a vertical do trio — para abrir o terceiro ponto e evitar alinhamento. A PM8, pequena e quase cúbica, é a costura. Regra de mata: agrupar ímpar, enterrar um terço, virar a face texturizada para quem chega.",
    ficha: ["Piscina natural de borda infinita", "Vista da serra"],
    skus: [
      sku("CLY", 1, "Cascata Lajedo Yporanga", "âncora"),
      sku("PG6", 1, "Pedra Grande 6", "volume principal"),
      sku("PG4", 1, "Pedra Grande 4", "degrau de transição"),
      sku("PG1", 1, "Pedra Grande 1", "vertical/contraponto"),
      sku("PM8", 1, "Pedra Média 8", "costura"),
    ],
  },
  {
    slug: "modulo-15",
    titulo: "Módulo 15",
    linguagens: ["piscina", "cascata"],
    tipo: "comprable",
    snippet:
      "Uma cascata de grande porte (Santa Bárbara, 280 kg) como eixo, com o maciço construído para parecer afloramento natural.",
    conceito:
      "Nasce em torno de uma âncora forte: a Cascata Santa Bárbara, a maior peça da linha. Ela dita o desenho, com a face principal virada para quem chega, e o resto é uma moldura de massa que a sustenta.",
    menteDoCriador:
      "A PG1 e o par de PG5 fecham o volume, escalonadas em alturas diferentes para fugir da simetria — a rocha 'cresce' do chão em degraus irregulares. A PM5 costura o degrau até o piso; a PM4, mais alongada, deita no primeiro plano e conduz o olho (e a lâmina) para fora do conjunto. A PP4 arremata as frestas.",
    ficha: ["Residência moderna", "Âncora: Cascata Santa Bárbara (280 kg)"],
    skus: [
      sku("CSB", 1, "Cascata Santa Bárbara", "âncora"),
      sku("PG1", 1, "Pedra Grande 1", "volume"),
      sku("PG5", 2, "Pedra Grande 5", "volume"),
      sku("PM5", 1, "Pedra Média 5", "transição"),
      sku("PM4", 1, "Pedra Média 4", "transição"),
      sku("PP4", 1, "Pedra Pequena 4", "preenchimento"),
    ],
  },
  {
    slug: "evandro-mesquita",
    titulo: "Cascata costurada ao riacho",
    cliente: "Evandro Mesquita",
    local: "Rio de Janeiro · RJ",
    linguagens: ["lago", "cascata"],
    tipo: "comprable",
    snippet:
      "A cascata nova parece que sempre esteve ali — costurada a um riacho natural que já existia na casa.",
    conceito:
      "A Western não fez uma cascata: fez uma mentira convincente. A piscina já existia e havia um riacho natural na propriedade — o trabalho foi fazer o novo parecer original. A CLY (Yporanga, estratificação horizontal) conversa com o leito do riacho, calibrada em base personalizada para a lâmina cair dentro do desenho existente.",
    menteDoCriador:
      "De um flanco entra o PG9 (largo e baixo), rocha-mãe assentada. No oposto, o PG5, mais alto e cúbico — a assimetria é o que a natureza faz e o projeto ruim esquece. Dos grandes desço a escala com 2× PM1 e PM4, apagando a fronteira entre nossa pedra e a nativa. E a PS, escondida na folhagem: o visitante ouve música saindo da pedra e nunca acha a caixa.",
    ficha: ["Integração a riacho natural existente", "Base personalizada da cascata"],
    skus: [
      sku("CLY", 1, "Cascata Lajedo Yporanga", "âncora"),
      sku("PG9", 1, "Pedra Grande 9", "volume estrutural"),
      sku("PG5", 1, "Pedra Grande 5", "contraponto"),
      sku("PM1", 2, "Pedra Média 1", "transição"),
      sku("PM4", 1, "Pedra Média 4", "transição"),
      sku("PS", 1, "Pedra Sonora", "funcional"),
    ],
    creditos: ["Reforma da piscina: @imperiarevestimentos"],
  },
  // ── Sob-medida / institucional (inspiração, sem carrinho) ───────────────
  {
    slug: "caito-maia",
    titulo: "Base de mesa em pedra Western",
    cliente: "Caito Maia",
    estudio: "Arbo Real",
    linguagens: ["mobiliario"],
    tipo: "sob-medida",
    snippet:
      "A pedra sai do paisagismo e vira mobiliário: uma base de mesa sob medida para o escritório do fundador da Chilli Beans.",
    conceito:
      "A forma nasce da própria pedra — face bruta, garimpada, com peso visual de rocha e leveza real de manuseio. Por ser réplica leve, a base é viável como pé de mesa num andar alto, sem guindaste, sem sobrecarregar a laje. A pedra deixa de emoldurar a água e passa a estruturar o objeto.",
    ficha: ["Peça única sob medida", "Escritório · São Paulo"],
    creditos: ["Design em parceria: Arbo Real"],
  },
  {
    slug: "jader-porto-belo",
    titulo: "Árvores de sombra no campo de golfe",
    cliente: "Jader Almeida",
    estudio: "All Resort Porto Belo",
    local: "Porto Belo · SC",
    linguagens: ["jardim", "revestimento"],
    tipo: "sob-medida",
    snippet:
      "Pontos de hidratação, sombra e descanso num campo de golfe (incl. o único iluminado para golfe noturno da América Latina): árvores-escultura de tronco em pedra Western e copa de laje viva.",
    conceito:
      "A pedra vira estrutura de paisagem. Cada 'árvore' é um pilar revestido de pedra Western (o tronco) que recebe uma laje viva com paisagismo em cima (a copa). A leveza é o que viabiliza a presença de rocha maciça sem impor fundação e guindaste num campo aberto.",
    ficha: ["Campo de golfe · pontos de sombra", "Tronco: pilar revestido de pedra Western"],
    creditos: ["Arquitetura: Jader Almeida"],
  },
  // ── Obras novas (acervo 2026-07) — acendem rostos da prova social que
  //    estavam sem lastro clicável. ⚠ snippet/conceito escritos a partir do que
  //    a FOTO e o registro provam; o dono ainda não revisou o texto.
  {
    slug: "hanazaki-expo-revestir",
    titulo: "Cascata assinada por Alex Hanazaki",
    cliente: "Alex Hanazaki",
    local: "Expo Revestir · 2017",
    linguagens: ["cascata", "jardim"],
    tipo: "sob-medida",
    snippet:
      "Espelho d'água, corten e blocos de pedra Western num estande de feira — montado e desmontado num pavilhão, onde pedra de tonelada não entra.",
    conceito:
      "Um dos paisagistas mais conhecidos do país assinou o estande, e a pedra Western fez o que a natural não faria num pavilhão: entrou, subiu e saiu. Blocos escalonados formam a borda do espelho d'água, em contraste com a massa retangular do corten.",
    ficha: ["Expo Revestir · 2017", "Blocos de pedra Western + espelho d'água + corten"],
    creditos: ["Paisagismo: Alex Hanazaki"],
  },
  {
    slug: "faisal-piscina-grega",
    titulo: "Piscina Grega",
    cliente: "Marcelo Faisal",
    local: "CasaCor · 2014",
    linguagens: ["piscina", "revestimento"],
    tipo: "sob-medida",
    snippet:
      "A piscina inteira revestida em pedra Western na CasaCor — parede elevada com luz rasante revelando a textura ao entardecer.",
    conceito:
      "Não é pedra de borda: é a piscina inteira revestida. A parede elevada em pedra Western recebe fita de LED rasante, e é a luz de raspão que faz a textura aparecer — a mesma textura que veio do molde de uma rocha real.",
    ficha: ["CasaCor · 2014", "Piscina revestida em pedra Western"],
    creditos: ["Paisagismo: Marcelo Faisal"],
  },
  {
    slug: "enora-jader-almeida",
    titulo: "A torre apoiada numa pedra",
    cliente: "Enora",
    estudio: "Jader Almeida",
    local: "São Paulo · SP",
    linguagens: ["mobiliario"],
    tipo: "sob-medida",
    snippet:
      "A maquete do empreendimento, num showroom envidraçado em São Paulo, apoiada sobre uma pedra Western como pedestal.",
    conceito:
      "O uso que ninguém adivinharia — e talvez a prova mais silenciosa de leveza do acervo: uma maquete grande de torre residencial repousa sobre uma única pedra Western, num piso de porcelanato polido, num andar de showroom. Pedra maciça equivalente não sobe até ali.",
    ficha: ["Showroom · São Paulo", "Pedra Western como base de maquete"],
    creditos: ["Arquitetura: Jader Almeida"],
  },
  {
    slug: "quadriplex-caverna",
    titulo: "Uma caverna no 20º andar",
    estudio: "Dama Arquitetura",
    local: "São Paulo · SP",
    linguagens: ["revestimento"],
    tipo: "sob-medida",
    snippet:
      "Paredão de rocha do chão ao teto dentro de um apartamento em torre — com tom desenvolvido sob medida para o projeto.",
    conceito:
      "A pedra sai do jardim e vira arquitetura de interior: um paredão de rocha do chão ao teto na cabeceira, com fenda vertical abrindo para o closet. O tom foi desenvolvido para este projeto. Um revestimento de rocha natural com esta área não sobe num elevador nem seria aceito pela laje.",
    ficha: ["Apartamento em torre · São Paulo", "Tom desenvolvido para o projeto"],
    creditos: ["Arquitetura: Dama Arquitetura", "3ª imagem: render de projeto (não é fotografia)"],
  },
  {
    slug: "nigro-praia-suspensa",
    titulo: "Uma praia sobre a laje",
    cliente: "Thiago Nigro",
    estudio: "Genesis Ecossistemas",
    linguagens: ["piscina"],
    tipo: "sob-medida",
    snippet:
      "Uma praia inteira de pedras montada sobre laje, numa encosta com vista de serra — onde não existe chão para receber tonelada.",
    conceito:
      "O argumento 'entra onde pedra não entra' no seu caso mais literal: areia, seixo e pedras grandes formando uma praia sobre uma laje de concreto, encosta acima. É a leveza que torna a estrutura viável — e é na mesma obra que aparece a peça inclinada com a cavidade à mostra, mostrando de onde vem essa leveza.",
    ficha: ["Praia de pedras sobre laje", "Execução: Genesis Ecossistemas"],
    creditos: ["Execução: Genesis Ecossistemas"],
  },
  {
    slug: "unique-garden",
    titulo: "Chalé simbionte com o morro",
    cliente: "Unique Garden",
    linguagens: ["revestimento", "jardim"],
    tipo: "sob-medida",
    snippet:
      "Revestimento de pedra Western em villa de hotelaria de alto padrão — a rocha copiou a textura e o relevo do morro e sumiu na natureza.",
    conceito:
      "As pedras reproduziram a textura e o relevo já existentes e se integraram à natureza, com pintura personalizada. A linguagem não é água: é parede — o contraste entre o rústico garimpado e o acabamento fino do interior.",
    ficha: ["Hotelaria de alto padrão", "Revestimento com pintura personalizada"],
  },
  {
    slug: "rosewood",
    titulo: "Revestimentos e pedras Western",
    cliente: "Rosewood",
    local: "Cidade Matarazzo · São Paulo",
    linguagens: ["revestimento"],
    tipo: "sob-medida",
    snippet:
      "Aplicação num dos endereços mais icônicos de São Paulo: interiores orgânicos e forno rústico de pedra na Cidade Matarazzo.",
    conceito:
      "Interiores tipo 'caverna' com nichos de bar e adega e um forno rústico de pedra, levando a textura garimpada para dentro do ambiente de hospitalidade premium — junto à icônica torre-jardim de Jean Nouvel.",
    ficha: ["Rosewood · Cidade Matarazzo", "Interiores + forno rústico"],
  },
];

export const OBRAS_BY_SLUG: Record<string, Obra> = Object.fromEntries(
  OBRAS.map((o) => [o.slug, o]),
);

/** Peças compráveis de uma obra no shape {handle, qty} (só as que resolveram handle). */
export function obraComposicao(obra: Obra): { handle: string; qty: number }[] {
  return (obra.skus ?? [])
    .filter((s): s is ObraSku & { handle: string } => Boolean(s.handle))
    .map((s) => ({ handle: s.handle, qty: s.qty }));
}

/** Obras compráveis (têm ao menos uma peça com handle resolvido). */
export const OBRAS_COMPRAVEIS = OBRAS.filter(
  (o) => o.tipo === "comprable" && obraComposicao(o).length > 0,
);
