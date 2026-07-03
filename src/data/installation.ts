// Configuração DATA-DRIVEN do módulo de Instalação (PDP).
// Mapa por TIPO de produto. A PDP resolve o tipo via handle da coleção
// (ver `resolveInstallationType`) e cai em `default` quando não encontra.
//
// TODO(shopify-metafields): no futuro, estes campos podem ser alimentados
// diretamente por metafields do produto (ex.: instalacao.nivel,
// instalacao.tempo, instalacao.passos[]) — mantendo este arquivo apenas
// como fallback/defaults.

export type InstallationLevel = 1 | 2 | 3 | 4;

export interface InstallationFact {
  label: string;
  value: string;
}

export interface InstallationStep {
  title: string;
  text: string;
}

export interface InstallationConfig {
  /** Nível 1–4 (barrinhas). */
  level: InstallationLevel;
  /** Rótulo curto do nível (ex.: "Encaixe direto"). */
  levelLabel: string;
  /** Subtítulo curto exibido abaixo do H2 "Instalação". */
  subtitle: string;
  /** 3 fatos rápidos (tempo, peso/água, o que acompanha). */
  facts: [InstallationFact, InstallationFact, InstallationFact];
  /** Frase de reassurance com borda destacada à esquerda. */
  reassure: string;
  /** 3 a 6 passos resumidos. Primeiro fica aberto por padrão. */
  steps: InstallationStep[];
  /** URL do guia completo (rota interna). */
  guideUrl?: string;
  /** URL do manual em PDF. Vazio = CTA desabilitado. */
  manualUrl?: string;
  /** URL do vídeo de instalação. Vazio = CTA desabilitado. */
  videoUrl?: string;
}

export type InstallationType =
  | "pisada"
  | "pedra"
  | "fonte"
  | "cascata"
  | "default";

const PISADA: InstallationConfig = {
  level: 1,
  levelLabel: "Encaixe direto",
  subtitle:
    "Sem obra pesada, sem fixação. Uma pessoa instala em poucos minutos por peça.",
  facts: [
    { label: "Tempo", value: "~30 min por peça" },
    { label: "Peso", value: "Leve, uma pessoa" },
    { label: "Acompanha", value: "Manual + vídeo" },
  ],
  reassure:
    "Sem fixação e sem obra pesada. Acompanha manual e vídeo, com suporte técnico Western.",
  steps: [
    {
      title: "Marque o local",
      text: "Defina o caminho e a distância confortável entre passos.",
    },
    {
      title: "Prepare a base",
      text: "Uma cama de areia ou pó de pedra firme e nivelada.",
    },
    {
      title: "Assente e nivele",
      text: "Pouse a peça, confira o nível e ajuste a cama por baixo.",
    },
    {
      title: "Compacte o entorno",
      text: "Preencha as bordas e firme o terreno ao redor.",
    },
  ],
  guideUrl: "/como-instalar",
  manualUrl: "",
  videoUrl: "",
};

const PEDRA: InstallationConfig = {
  level: 2,
  levelLabel: "Fixação simples",
  subtitle:
    "Peça leve, fixada com buchas e pitões — sem sistema proprietário, sem obra pesada.",
  facts: [
    { label: "Tempo", value: "Meio período" },
    { label: "Peso", value: "Leve p/ o tamanho" },
    { label: "Acompanha", value: "Manual + vídeo" },
  ],
  reassure:
    "Peça leve, fixação com buchas e pitões — sem sistema proprietário. Manual, vídeo e suporte inclusos.",
  steps: [
    {
      title: "Confira e prepare a base",
      text: "Cheque as peças; base firme, limpa e nivelada (impermeabilize se houver água).",
    },
    {
      title: "Pagine a seco",
      text: "Monte no chão alternando volumes, sem alinhamentos retos.",
    },
    {
      title: "Fixe as peças",
      text: "Buchas, pitões e arame galvanizado — maiores primeiro, menores preenchendo.",
    },
    {
      title: "Trate as juntas",
      text: "Modele os encontros até virar uma rocha só.",
    },
    {
      title: "Pinte e revise",
      text: "Variações de tom e sombra; esconda a fixação.",
    },
  ],
  guideUrl: "/como-instalar",
  manualUrl: "",
  videoUrl: "",
};

const FONTE: InstallationConfig = {
  level: 2,
  levelLabel: "Hidráulica simples",
  subtitle:
    "Circuito de água fechado, quase plug and play. Elétrica por profissional.",
  facts: [
    { label: "Tempo", value: "Meio período" },
    { label: "Água", value: "Recirculação fechada" },
    { label: "Acompanha", value: "Bomba + manual + vídeo" },
  ],
  reassure:
    "Circuito de água fechado, quase plug and play. Elétrica por profissional. Manual, vídeo e suporte inclusos.",
  steps: [
    {
      title: "Posicione a fonte",
      text: "Escolha o ponto, com energia protegida por perto.",
    },
    {
      title: "Instale a bomba",
      text: "Encaixe a bomba no reservatório e conecte a mangueira.",
    },
    {
      title: "Ligue a recirculação",
      text: "Encha, ligue e veja a água subir e retornar.",
    },
    {
      title: "Ajuste a vazão",
      text: "Use o registro até o fluxo e o som ficarem agradáveis.",
    },
  ],
  guideUrl: "/como-instalar",
  manualUrl: "",
  videoUrl: "",
};

const CASCATA: InstallationConfig = {
  level: 3,
  levelLabel: "Com hidráulica",
  subtitle:
    "Recirculação em circuito fechado e registro para a queda. Elétrica por profissional.",
  facts: [
    { label: "Tempo", value: "1 a 2 dias" },
    { label: "Água", value: "Kit de recirculação" },
    { label: "Acompanha", value: "Bomba + manual + vídeo" },
  ],
  reassure:
    "Recirculação em circuito fechado e registro para a queda. Elétrica por profissional. Manual, vídeo e suporte inclusos.",
  steps: [
    {
      title: "Confira o local",
      text: "Água, energia, retorno e acesso para manutenção.",
    },
    {
      title: "Defina a hidráulica",
      text: "Trace captação, bomba, tubulação e saída.",
    },
    {
      title: "Instale bomba e tubulação",
      text: "Com registro para a queda e acesso fácil. Elétrica por profissional.",
    },
    {
      title: "Monte a estrutura",
      text: "Posicione as pedras e esconda a saída da água.",
    },
    {
      title: "Teste e ajuste a queda",
      text: "Rode a água, cheque o retorno e regule a vazão.",
    },
    {
      title: "Vede e finalize",
      text: "Direcione a lâmina, trate juntas e integre ao paisagismo.",
    },
  ],
  guideUrl: "/como-instalar",
  manualUrl: "",
  videoUrl: "",
};

export const INSTALLATION_BY_TYPE: Record<InstallationType, InstallationConfig> = {
  pisada: PISADA,
  pedra: PEDRA,
  fonte: FONTE,
  cascata: CASCATA,
  default: PEDRA,
};

/**
 * Resolve o tipo de instalação a partir do handle da coleção do produto.
 * Fallback: `default` (usa PEDRA como base segura).
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
  if (h.includes("pedra") || h.includes("fossil") || h.includes("revestiment"))
    return "pedra";
  return "default";
}

export function getInstallationConfig(type: InstallationType): InstallationConfig {
  return INSTALLATION_BY_TYPE[type] ?? INSTALLATION_BY_TYPE.default;
}
