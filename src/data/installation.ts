// Configuração DATA-DRIVEN do módulo de Instalação (PDP).
//
// FONTE ÚNICA: o Manual de Instalação Western (PDF, 28 páginas), em
// `public/manuais/manual-instalacao-western.pdf`.
// Os 6 tipos abaixo espelham os 6 capítulos do manual, 1:1:
//
//   pedra        → Cap. 1 · Pedras avulsas e decorativas   (PDF p. 8)
//   pisada       → Cap. 2 · Pisadas                         (PDF p. 12)
//   especial     → Cap. 3 · Produtos especiais              (PDF p. 14)
//   revestimento → Cap. 4 · Revestimentos                   (PDF p. 17)
//   fonte        → Cap. 5 · Fontes                          (PDF p. 19)
//   cascata      → Cap. 6 · Cascatas                        (PDF p. 21)
//
// Nada aqui é inventado: cada passo, aviso e número sai do capítulo
// correspondente ou da Parte I ("Antes de começar", PDF p. 5–7), que é o
// bloco de referência de fixação e cura para todas as linhas.
//
// NÃO existem vídeos de instalação. Não prometa vídeo em lugar nenhum.

/** Manual completo, servido estaticamente. */
export const MANUAL_PDF_URL = "/manuais/manual-instalacao-western.pdf";

/** Parte I — "Antes de começar" (recebimento, base, segurança, fixação e cura). */
export const MANUAL_PARTE_I_PAGE = 5;

/** Deep link para uma página do PDF (`#page=` é respeitado pela maioria dos leitores). */
export function manualPageUrl(page: number): string {
  return `${MANUAL_PDF_URL}#page=${page}`;
}

export type InstallationLevel = 1 | 2 | 3 | 4;

export interface InstallationFact {
  label: string;
  value: string;
}

export interface InstallationStep {
  title: string;
  text: string;
}

/** Avisos que o manual destaca em caixa — os que evitam prejuízo. */
export interface InstallationWarning {
  title: string;
  text: string;
}

export interface InstallationConfig {
  /** Nível 1–4 (barrinhas). Escala própria da loja, não do manual. */
  level: InstallationLevel;
  /** Rótulo curto do nível (ex.: "Encaixe ou AC3"). */
  levelLabel: string;
  /** Subtítulo curto exibido abaixo do H2 "Instalação". */
  subtitle: string;
  /** 3 fatos rápidos. */
  facts: [InstallationFact, InstallationFact, InstallationFact];
  /** Frase de reassurance com borda destacada à esquerda. */
  reassure: string;
  /** Rótulo da lista de passos (alguns capítulos são por modelo, não por passo). */
  stepsLabel: string;
  /** Passos resumidos do capítulo. Primeiro fica aberto por padrão. */
  steps: InstallationStep[];
  /** Avisos críticos do capítulo/Parte I. */
  warnings: InstallationWarning[];
  /** Número do capítulo no manual (1–6). */
  chapter: 1 | 2 | 3 | 4 | 5 | 6;
  /** Título do capítulo, como está no manual. */
  chapterTitle: string;
  /** Página do PDF onde o capítulo começa. */
  manualPage: number;
  /** URL do manual já ancorada no capítulo. */
  manualUrl: string;
  /** URL do guia completo (rota interna). */
  guideUrl?: string;
}

export type InstallationType =
  | "pisada"
  | "pedra"
  | "especial"
  | "revestimento"
  | "fonte"
  | "cascata"
  | "default";

// Avisos da Parte I (p. 7, "Fixação e cura — padrão da marca"), reaproveitados
// pelos capítulos que dependem deles.
const AVISO_IMPERMEABILIZACAO: InstallationWarning = {
  title: "Contato com água? Impermeabilize antes",
  text:
    "Em qualquer contato com água (piscina, espelho d'água, fonte, cascata, lago), impermeabilize a base em demãos cruzadas, reforce cantos e passagens com tela ou bandagem e faça o teste de estanqueidade: encher e observar por 24–48 h, marcando o nível.",
};

const AVISO_CURA: InstallationWarning = {
  title: "Cura de 7 dias antes de expor à água",
  text:
    "Depois de assentar com AC3, aguarde 7 dias antes de expor a peça à água, à chuva ou à carga. Proteja de sol forte e chuva durante a cura.",
};

const AVISO_ELETRICA: InstallationWarning = {
  title: "Elétrica é sempre por profissional",
  text:
    "Toda ligação elétrica é feita por eletricista habilitado, em circuito com DR (≤ 30 mA) e aterramento. Nunca improvise em área molhada.",
};

// ─────────────────────────────────────────────────────────────────────────────
// CAP. 1 — Pedras avulsas e decorativas (PDF p. 8–11)
// Pedras Grandes · Médias · Pequenas · Pedras de Borda · Fósseis Decorativos
// ─────────────────────────────────────────────────────────────────────────────
const PEDRA: InstallationConfig = {
  level: 2,
  levelLabel: "Apoiar ou fixar",
  subtitle:
    "Pedras avulsas são o vocabulário da composição. A maioria pode apenas ser apoiada — fixe quando houver água, vento ou circulação.",
  facts: [
    { label: "Fixação", value: "Apoiada ou AC3" },
    { label: "Peça", value: "Oca — esconde fiação" },
    { label: "Acompanha", value: "Manual + kit de retoque" },
  ],
  reassure:
    "As peças são ocas: pesam cerca de 10% de uma pedra real e permitem passar e esconder fiação, caixas e conexões. Fixação com argamassa AC3, encontrada em qualquer loja de material de construção — sem sistema proprietário.",
  stepsLabel: "Passo a passo resumido",
  steps: [
    {
      title: "Confira e embaralhe os tons",
      text:
        "Confira as peças no recebimento e faça o dry-lay (montagem a seco) misturando peças de várias caixas — variação leve de cor e veio entre peças é natural, e embaralhar é o que deixa o resultado natural.",
    },
    {
      title: "Prepare a base",
      text:
        "Firme, nivelada, limpa e resistente ao peso da composição (confira o peso por peça na ficha técnica do capítulo). Sem partes soltas, poeira, óleo ou reboco desplacando.",
    },
    {
      title: "Componha a paginação",
      text:
        "Ainda a seco, ajuste encaixes e a direção das ranhuras: alterne peças maiores e menores, evite alinhamentos retos e repetição, sobreponha levemente para criar sombra e profundidade, e reserve nichos para vegetação.",
    },
    {
      title: "Apoie ou fixe",
      text:
        "Peça decorativa que só descansa no jardim pode ficar apoiada de forma estável. Fixe com AC3 em beira de água, local com vento ou circulação — ou, se preferir, lastre a peça pelos ocos.",
    },
    {
      title: "Corte e furação",
      text:
        "Corte a úmido com disco diamantado e fure com broca para porcelanato, em baixa rotação e sem impacto, apoiando a casca — assim ela não estala.",
    },
    {
      title: "Aproveite os ocos",
      text:
        "Por serem ocas, as peças permitem esconder fios, caixas de iluminação e conexões. Planeje isso na hora de posicionar.",
    },
    {
      title: "Retoque",
      text:
        "O kit de retoque de tinta acompanha todos os pedidos (uma garrafa clara, uma escura e a buxinha aplicadora). Dê leves batidinhas até integrar ao veio da peça — nunca esfregue.",
    },
  ],
  warnings: [AVISO_IMPERMEABILIZACAO, AVISO_CURA],
  chapter: 1,
  chapterTitle: "Pedras avulsas e decorativas",
  manualPage: 8,
  manualUrl: manualPageUrl(8),
  guideUrl: `${MANUAL_PDF_URL}#page=8`,
};

// ─────────────────────────────────────────────────────────────────────────────
// CAP. 2 — Pisadas (PDF p. 12–13)
// Dormente · Eucalipto · Pedra Grande · Pedra Média · Pedra Pequena
// ─────────────────────────────────────────────────────────────────────────────
const PISADA: InstallationConfig = {
  level: 1,
  levelLabel: "Encaixe ou AC3",
  subtitle:
    "Caminhos pisáveis. Todas têm cerca de 3 cm de espessura — o parâmetro do rebaixo no terreno.",
  facts: [
    { label: "Espessura", value: "~3 cm" },
    { label: "Espaçamento", value: "60–65 cm entre centros" },
    { label: "Acompanha", value: "Manual + kit de retoque" },
  ],
  reassure:
    "Pisadas suportam o trânsito de pessoas — e o peso de veículo quando bem assentadas sobre base firme. Onde passa veículo, assente sempre com AC3 sobre base firme ou contrapiso; o modo encaixado é indicado para jardim e grama.",
  stepsLabel: "Passo a passo resumido",
  steps: [
    {
      title: "Defina o traçado",
      text:
        "Faça o dry-lay do caminho com o espaçamento de grama desejado. Para uma passada confortável, mantenha cerca de 60–65 cm de centro a centro entre pisadas.",
    },
    {
      title: "Prepare o berço",
      text:
        "Regularize o terreno onde cada pisada vai apoiar. A peça tem ~3 cm de espessura — esse é o parâmetro do rebaixo. Compacte o fundo; para o modo encaixado, use leito de areia ou pó de pedra.",
    },
    {
      title: "Assente de um dos dois modos",
      text:
        "Com argamassa AC3, sobre base firme ou contrapiso, para máxima estabilidade (recomendado onde passa veículo). Ou encaixada: abra o rebaixo seguindo a espessura da peça (~3 cm) e encaixe, deixando a face rente ao piso ou à grama.",
    },
    {
      title: "Nivele a face",
      text:
        "Deixe cada pisada rente ao piso ao redor, sem degrau ou tropeço, com leve caimento para não empoçar água.",
    },
    {
      title: "Retoque",
      text:
        "Retoque eventuais marcas com o kit de retoque de tinta, que acompanha o pedido: leves batidinhas, nunca esfregue.",
    },
  ],
  warnings: [AVISO_CURA],
  chapter: 2,
  chapterTitle: "Pisadas",
  manualPage: 12,
  manualUrl: manualPageUrl(12),
  guideUrl: `${MANUAL_PDF_URL}#page=12`,
};

// ─────────────────────────────────────────────────────────────────────────────
// CAP. 3 — Produtos especiais (PDF p. 14–16)
// Pedra LED · Pedra Sonora · Pedra Champanheira · Pedra Torneira
// ─────────────────────────────────────────────────────────────────────────────
const ESPECIAL: InstallationConfig = {
  level: 2,
  levelLabel: "Apoiada, com instalação",
  subtitle:
    "Peças com componente elétrico ou hidráulico embutido. Como regra, não são assentadas com massa — ficam apoiadas ou encaixadas, para permitir manutenção.",
  facts: [
    { label: "Fixação", value: "Sem massa — apoiada" },
    { label: "Elétrica", value: "Eletricista + DR (≤ 30 mA)" },
    { label: "Acompanha", value: "Manual + kit de retoque" },
  ],
  reassure:
    "Regra geral dos itens elétricos: ligação por eletricista habilitado; tomada abrigada, aterrada e protegida por DR (≤ 30 mA); laço de gotejamento (drip loop) no cabo. Não assente com massa peças que precisam de manutenção.",
  stepsLabel: "Instalação por modelo",
  steps: [
    {
      title: "Pedra LED — 2 kg",
      text:
        "Acompanha o spot de LED embutido, com fiação pronta para plug e o furo para passagem. O LED é próprio para imersão (pode ficar submerso); o driver/fonte fica fora d'água, com alimentação em baixa tensão (12/24 V). Ligação por eletricista, com DR e aterramento: passe a fiação pelo furo e faça o laço de gotejamento. Posicione o facho e deixe a peça apoiada.",
    },
    {
      title: "Pedra Sonora — 30 kg",
      text:
        "Acompanha a caixa de som marítima (resistente ao tempo), com Bluetooth e fiação pronta para plug, e o furo para passagem. Alimentação na tomada, bivolt — pode ligar em 127 V ou 220 V. Pareie por Bluetooth com o dispositivo de áudio. Tomada abrigada e aterrada; deixe a peça apoiada, sem assentar com massa.",
    },
    {
      title: "Pedra Champanheira — 110 kg",
      text:
        "Pedra em formato de pia, com um furo e um cano de PVC interno para a vazão da água. Defina a vazão: conecte o cano a um ponto de vazão/esgoto, ou deixe a água escorrer na grama, terra ou areia pelo próprio furo. Apoie nivelada e estável — não precisa de assentamento. Limpe apenas com água.",
    },
    {
      title: "Pedra Torneira — 10 kg",
      text:
        "Peça que recebe o ponto de água / registro, com a furação necessária para a passagem do encanamento. Posicione junto ao ponto hidráulico, passe o encanamento pela furação, instale o registro ou a torneira e teste vazamentos. Fixe com AC3 quando quiser travar a peça no lugar.",
    },
  ],
  warnings: [
    AVISO_ELETRICA,
    {
      title: "Não assente peças elétricas com massa",
      text:
        "Qualquer item elétrico (LED, Sonora) exige eletricista habilitado, tomada aterrada e DR. Deixe as peças apoiadas ou encaixadas para facilitar a manutenção.",
    },
  ],
  chapter: 3,
  chapterTitle: "Produtos especiais",
  manualPage: 14,
  manualUrl: manualPageUrl(14),
  guideUrl: `${MANUAL_PDF_URL}#page=14`,
};

// ─────────────────────────────────────────────────────────────────────────────
// CAP. 4 — Revestimentos (PDF p. 17–18)
// Painel Bruto Amalfi · Mykonos · Santorini · Placa Rústica Riviera
// ─────────────────────────────────────────────────────────────────────────────
const REVESTIMENTO: InstallationConfig = {
  level: 3,
  levelLabel: "Colagem dupla na parede",
  subtitle:
    "Painéis e placas 3D encorpados para parede. O passo crítico vem antes do assentamento: confirmar que a parede e a estrutura suportam a carga.",
  facts: [
    { label: "Fixação", value: "AC3, colagem dupla" },
    { label: "Antes", value: "Confirmar carga da parede" },
    { label: "Cura", value: "7 dias antes da água" },
  ],
  reassure:
    "Apesar de cerca de 10× mais leves que a rocha natural, os painéis têm peso real na parede. Confirme que a parede suporta a carga (peso por peça na ficha técnica). Nos mais pesados (Amalfi, Santorini), garanta base robusta e, se necessário, ancoragem — não aplique sobre estrutura frágil ou drywall sem reforço.",
  stepsLabel: "Passo a passo resumido",
  steps: [
    {
      title: "Planeje a paginação",
      text:
        "Dry-lay embaralhando os tons. Defina as linhas de referência (nível e prumo) e comece de baixo para cima. Reserve as peças inteiras para os pontos mais visíveis.",
    },
    {
      title: "Prepare a parede",
      text:
        "Firme, curada, limpa e seca; sem tinta solta, gordura ou umidade ascendente. Em parede muito lisa, aplique chapisco ou primer de aderência. Em área úmida, impermeabilize antes e faça o teste de estanqueidade.",
    },
    {
      title: "Assente por colagem dupla",
      text:
        "AC3 na parede E no verso da peça, cruzando o sentido dos cordões. Pressione, bata com o martelo de borracha e assente de baixo para cima, escorando até a pega. Confira prumo e nível a cada fiada. Respeite o tempo em aberto da argamassa (~15–20 min); se formar película, reamasse — não molhe.",
    },
    {
      title: "Corte e furação",
      text:
        "Serra com disco diamantado (corte a úmido) e broca para porcelanato, em baixa rotação e sem impacto.",
    },
    {
      title: "Cura e retoque",
      text:
        "Aguarde 7 dias antes de expor à água, chuva ou carga. Depois, retoque cortes e emendas com o kit de retoque de tinta que acompanha o pedido.",
    },
  ],
  warnings: [
    {
      title: "Verifique o suporte estrutural ANTES",
      text:
        "Confirme que a parede e a estrutura suportam a carga da peça antes de assentar. Não aplique sobre estrutura frágil ou drywall sem reforço.",
    },
    AVISO_CURA,
  ],
  chapter: 4,
  chapterTitle: "Revestimentos",
  manualPage: 17,
  manualUrl: manualPageUrl(17),
  guideUrl: `${MANUAL_PDF_URL}#page=17`,
};

// ─────────────────────────────────────────────────────────────────────────────
// CAP. 5 — Fontes (PDF p. 19–20) — bomba inclusa
// Mini Lago · Mini Sabino · Santa Rita · Sabino com Lago
// ─────────────────────────────────────────────────────────────────────────────
const FONTE: InstallationConfig = {
  level: 2,
  levelLabel: "Encaixe, com hidráulica",
  subtitle:
    "As fontes chegam com a bomba já embutida e peças de fácil encaixe. O essencial é base firme, elétrica segura e uma regra inegociável: nunca ligar a bomba a seco.",
  facts: [
    { label: "Bomba", value: "Inclusa, já embutida" },
    { label: "Fixação", value: "Encaixe, sem assentamento" },
    { label: "Regra", value: "Nunca ligar a seco" },
  ],
  reassure:
    "Recirculação em circuito fechado, com a bomba já encaixada. A elétrica é por profissional. Antes de energizar, consulte a Western para os dados elétricos da bomba do seu modelo (tensão, vazão, potência).",
  stepsLabel: "Passo a passo resumido",
  steps: [
    {
      title: "Monte e posicione",
      text:
        "A fonte pode vir em peças de fácil encaixe, sem necessidade de assentamento. Posicione sobre base nivelada e firme, que suporte o peso.",
    },
    {
      title: "Confira o encaixe hidráulico",
      text:
        "A bomba já vem encaixada. Confira o circuito de recirculação e as conexões internas.",
    },
    {
      title: "Prepare a tomada",
      text:
        "O fio tem cerca de 90 cm. Tomada abrigada, aterrada, com DR e acima do nível da água. Faça o laço de gotejamento no cabo.",
    },
    {
      title: "Encha com água ANTES de ligar",
      text:
        "Sequência obrigatória: encher → conferir o nível → ligar. Nunca ligue a bomba a seco, nem por segundos.",
    },
    {
      title: "Regule e verifique",
      text:
        "Ajuste o fluxo e a lâmina d'água e confirme que a água retorna ao reservatório, sem transbordar nem baixar o nível.",
    },
  ],
  warnings: [
    {
      title: "Nunca ligue a bomba a seco",
      text:
        "Mesmo por segundos, queima o motor — e isso não é coberto pela garantia. Mantenha sempre o nível de água: sem água, a bomba trabalha a seco.",
    },
    AVISO_ELETRICA,
  ],
  chapter: 5,
  chapterTitle: "Fontes",
  manualPage: 19,
  manualUrl: manualPageUrl(19),
  guideUrl: `${MANUAL_PDF_URL}#page=19`,
};

// ─────────────────────────────────────────────────────────────────────────────
// CAP. 6 — Cascatas (PDF p. 21–23) — bomba à parte
// Lajedo Boreal · Lajedo Yporanga · Sabino · Santa Clara · Santa Bárbara
// ─────────────────────────────────────────────────────────────────────────────
const CASCATA: InstallationConfig = {
  level: 4,
  levelLabel: "Sistema de recirculação",
  subtitle:
    "A cascata é um sistema de recirculação: pedra, hidráulica, elétrica e impermeabilização trabalhando juntas. Planeje a parte de trás tanto quanto a frente.",
  facts: [
    { label: "Bomba", value: "À parte — dimensionar" },
    { label: "Base", value: "Impermeabilizar e testar" },
    { label: "Cura", value: "7 dias antes de operar" },
  ],
  reassure:
    "A bomba NÃO acompanha o kit. Consulte a Western para dimensionar a bomba correta (vazão e altura) do seu modelo — bomba subdimensionada não enche a lâmina d'água.",
  stepsLabel: "Passo a passo resumido",
  steps: [
    {
      title: "Planeje e confira o local",
      text:
        "Verifique medidas, ponto de água, ponto de energia, local da bomba, altura da queda, retorno da água, base estrutural, acesso para manutenção e segurança de circulação. A cascata não pode ser pensada só pela frente bonita — tem que funcionar por trás também.",
    },
    {
      title: "Prepare a base e o ponto de água",
      text:
        "Base rígida e nivelada. Posicione o tubo de 50 mm (PVC marrom) a 0,60 m da borda da piscina — dentro da cascata há um tubo de 50 mm para a passagem da água. Impermeabilize e teste a estanqueidade antes de montar as pedras.",
    },
    {
      title: "Defina a hidráulica",
      text:
        "Determine onde a água é captada, onde fica a bomba, o caminho da tubulação, a saída, o volume da queda e se haverá registro. A tubulação deve ficar escondida, mas acessível; proteja a entrada da bomba contra folhas.",
    },
    {
      title: "Instale bomba e tubulação",
      text:
        "Deixe acesso para manutenção; instale o registro para regular a queda; evite curvas excessivas; não deixe a tubulação aparente. Elétrica por profissional qualificado, com DR e aterramento próprios para área molhada. Nunca ligue a seco.",
    },
    {
      title: "Monte a estrutura de pedras",
      text:
        "Nesta sequência: base → volume → peça da queda. Esconda a saída da tubulação e trave as peças; feche laterais e vazios; crie sombra e profundidade; reserve espaços para plantas e confira o caminho da água.",
    },
    {
      title: "Ajuste a queda (1º teste)",
      text:
        "Verifique ponto de queda, respingos, retorno ao reservatório, vazamento lateral, vazão, som e naturalidade. Use o registro para chegar ao efeito ideal.",
    },
    {
      title: "Vede e direcione",
      text:
        "Faça a vedação atrás da saída, direcione a lâmina, corrija fugas, feche as laterais e teste a recirculação.",
    },
    {
      title: "Acabamento",
      text:
        "Trate juntas, disfarce emendas, corrija volumes, pinte os encontros com o kit de retoque, ajuste tons, integre ao paisagismo e limpe excessos.",
    },
    {
      title: "Teste final",
      text:
        "A bomba liga corretamente? A água circula sem interrupção? Queda no ponto desejado, sem vazamentos e sem respingos fora da área? A água retorna ao reservatório? Tubulação escondida, registro e bomba acessíveis, elétrica protegida (DR)? Som agradável e visual natural?",
    },
  ],
  warnings: [
    {
      title: "A bomba não acompanha o kit",
      text:
        "Consulte a Western para dimensionar a bomba correta (vazão e altura) do seu modelo antes de comprar — bomba subdimensionada não enche a lâmina d'água.",
    },
    AVISO_IMPERMEABILIZACAO,
    {
      title: "Respeite 7 dias de cura",
      text:
        "Aguarde 7 dias de cura do que foi assentado com AC3 antes de operar a cascata em regime.",
    },
  ],
  chapter: 6,
  chapterTitle: "Cascatas",
  manualPage: 21,
  manualUrl: manualPageUrl(21),
  guideUrl: `${MANUAL_PDF_URL}#page=21`,
};

export const INSTALLATION_BY_TYPE: Record<InstallationType, InstallationConfig> = {
  pisada: PISADA,
  pedra: PEDRA,
  especial: ESPECIAL,
  revestimento: REVESTIMENTO,
  fonte: FONTE,
  cascata: CASCATA,
  default: PEDRA,
};

/**
 * Resolve o tipo de instalação (= capítulo do manual) pelo handle da coleção
 * e, como reforço, pelo título da peça.
 *
 * Linhas reais da loja → capítulo:
 *   pisadas                                                → cap. 2
 *   cascatas                                               → cap. 6
 *   fontes-para-jardim                                     → cap. 5
 *   acessorios (LED, Sonora, Champanheira, Torneira)       → cap. 3
 *   revestimentos                                          → cap. 4
 *   pedras-grandes/medias/pequenas, pedras-de-borda,
 *   fosseis-decorativos                                    → cap. 1
 *
 * A ordem dos testes importa: "Pisada Pedra Grande" e "Pedra LED" contêm
 * "pedra" no título, então os casos mais específicos vêm primeiro.
 */
export function resolveInstallationType(
  collectionHandle?: string | null,
  productTitle?: string | null,
): InstallationType {
  const h = (collectionHandle ?? "").toLowerCase();
  const t = (productTitle ?? "").toLowerCase();

  if (h.includes("pisada") || t.includes("pisada")) return "pisada";
  if (h.includes("cascata") || t.includes("cascata")) return "cascata";
  if (h.includes("fonte") || t.includes("fonte")) return "fonte";

  // Cap. 3 — produtos especiais (linha "acessorios" na loja).
  if (
    h.includes("acessorio") ||
    t.includes("led") ||
    t.includes("sonora") ||
    t.includes("champanheira") ||
    t.includes("torneira")
  ) {
    return "especial";
  }

  // Cap. 4 — revestimentos (painéis brutos e placa rústica).
  if (h.includes("revestiment") || t.includes("painel") || t.includes("placa rústica")) {
    return "revestimento";
  }

  // Cap. 1 — pedras avulsas, bordas e fósseis.
  if (h.includes("pedra") || h.includes("fossil") || h.includes("fóssil") || t.includes("fóssil")) {
    return "pedra";
  }

  return "default";
}

export function getInstallationConfig(type: InstallationType): InstallationConfig {
  return INSTALLATION_BY_TYPE[type] ?? INSTALLATION_BY_TYPE.default;
}
