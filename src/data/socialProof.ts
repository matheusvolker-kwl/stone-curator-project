/**
 * Fonte única de verdade da prova social Western.
 * Consumido pelo componente único `src/components/shared/SocialProof.tsx`.
 */
export interface PessoaComFoto {
  nome: string;
  /** slug kebab-case; foto em src/assets/famosos/{slug}.(webp|jpg|png) */
  slug: string;
  /**
   * O que a pessoa é — vale mais que o rótulo do tier ("celebridades"/
   * "profissionais"), que é taxonomia nossa e não diz nada a quem visita.
   */
  papel?: string;
}
export interface MarcaComLogo {
  nome: string;
  /** slug kebab-case; logo em src/assets/marcas/{slug}.(svg|png|webp) — senão wordmark */
  slug: string;
  /** Multiplicador óptico para normalizar tamanho aparente do logo (default 1). */
  logoScale?: number;
}

export const SOCIAL_PROOF = {
  celebridades: [
    { nome: "Neymar Jr.", slug: "neymar-jr", papel: "Atleta" },
    { nome: "Caito Maia", slug: "caito-maia", papel: "Chilli Beans" },
    { nome: "Tato (Falamansa)", slug: "tato-falamansa", papel: "Músico" },
  ] as PessoaComFoto[],
  profissionais: [
    { nome: "Alex Hanazaki", slug: "alex-hanazaki", papel: "Paisagista" },
    { nome: "Jader Almeida", slug: "jader-almeida", papel: "Arquiteto e designer" },
    { nome: "Marcelo Faisal", slug: "marcelo-faisal", papel: "Paisagista" },
  ] as PessoaComFoto[],
  marcas: [
    { nome: "Cobasi", slug: "cobasi", logoScale: 0.6 },
    { nome: "Unique Garden", slug: "unique-garden", logoScale: 1.0 },
    { nome: "Hotel Rosewood", slug: "hotel-rosewood", logoScale: 1.0 },
    { nome: "All Resort Porto Belo", slug: "all-resort-porto-belo", logoScale: 1.0 },
    { nome: "Cristal Pool", slug: "cristal-pool", logoScale: 1.2 },
    { nome: "Genesis Ecossistemas", slug: "genesis-ecossistemas", logoScale: 1.05 },
    { nome: "Biopet Lagos", slug: "biopet-lagos", logoScale: 1.1 },
    { nome: "Mandaia Arquitetura", slug: "mandaia-arquitetura", logoScale: 1.0 },
  ] as MarcaComLogo[],
} as const;

export const SOCIAL_PROOF_LABELS = {
  celebridades: "Nas casas de celebridades",
  profissionais: "Especificada por profissionais renomados",
  marcas: "Escolhida por marcas de referência",
} as const;

export type SocialProofGroup = keyof typeof SOCIAL_PROOF;
/** @deprecated use PessoaComFoto */
export type Celebridade = PessoaComFoto;
