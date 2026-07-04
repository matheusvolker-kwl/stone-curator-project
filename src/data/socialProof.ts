/**
 * Fonte única de verdade da prova social Western.
 * Todo bloco de "quem especifica / usa / confia" no site consome deste arquivo.
 * Consumido pelo componente único `src/components/shared/SocialProof.tsx`.
 */

export interface Celebridade {
  nome: string;
  /** slug em kebab-case; foto opcional em src/assets/famosos/{slug}.(webp|jpg|png|jpeg) */
  slug: string;
}

export const SOCIAL_PROOF = {
  celebridades: [
    { nome: "Neymar Jr.", slug: "neymar-jr" },
    { nome: "Caito Maia", slug: "caito-maia" },
    { nome: "Tato (Falamansa)", slug: "tato-falamansa" },
  ] as Celebridade[],
  profissionais: [
    "Alex Hanazaki",
    "Jader Almeida",
    "Cristina Volker",
    "Mandaia Arquitetura",
  ],
  parceiros: [
    "Cristal Pool",
    "Genesis Ecossistemas",
    "Biopet Lagos",
  ],
  empresas: [
    "Cobasi",
    "Unique Garden",
    "Hotel Rosewood",
    "All Resort Club Residence Porto Belo",
  ],
} as const;

export const SOCIAL_PROOF_LABELS = {
  celebridades: "Nas casas de celebridades",
  profissionais: "Especificada por profissionais renomados",
  parceiros: "Parceiros comerciais",
  empresas: "Escolhida por empresas de renome",
} as const;

export type SocialProofGroup = keyof typeof SOCIAL_PROOF;
