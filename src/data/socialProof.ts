/**
 * Fonte única de verdade da prova social Western.
 * Consumido pelo componente único `src/components/shared/SocialProof.tsx`.
 */
export interface PessoaComFoto {
  nome: string;
  /** slug kebab-case; foto em src/assets/famosos/{slug}.(webp|jpg|png) */
  slug: string;
}
export interface MarcaComLogo {
  nome: string;
  /** slug kebab-case; logo em src/assets/marcas/{slug}.(svg|png|webp) — senão wordmark */
  slug: string;
}

export const SOCIAL_PROOF = {
  celebridades: [
    { nome: "Neymar Jr.", slug: "neymar-jr" },
    { nome: "Caito Maia", slug: "caito-maia" },
    { nome: "Tato (Falamansa)", slug: "tato-falamansa" },
  ] as PessoaComFoto[],
  profissionais: [
    { nome: "Alex Hanazaki", slug: "alex-hanazaki" },
    { nome: "Jader Almeida", slug: "jader-almeida" },
    { nome: "Marcelo Faisal", slug: "marcelo-faisal" },
  ] as PessoaComFoto[],
  marcas: [
    { nome: "Cobasi", slug: "cobasi" },
    { nome: "Unique Garden", slug: "unique-garden" },
    { nome: "Hotel Rosewood", slug: "hotel-rosewood" },
    { nome: "All Resort Porto Belo", slug: "all-resort-porto-belo" },
    { nome: "Cristal Pool", slug: "cristal-pool" },
    { nome: "Genesis Ecossistemas", slug: "genesis-ecossistemas" },
    { nome: "Biopet Lagos", slug: "biopet-lagos" },
    { nome: "Mandaia Arquitetura", slug: "mandaia-arquitetura" },
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
