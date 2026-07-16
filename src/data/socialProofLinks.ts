/**
 * Resolve um tile da prova social (slug de socialProof.ts) para a OBRA que o
 * lastreia. Mantém socialProof.ts puro (só nomes/fotos); a interatividade lê
 * daqui. Só entram os tiles COM lastro real (obra + mídia). Tiles ausentes
 * deste mapa permanecem NÃO-clicáveis — sem afordância falsa.
 */
import { OBRAS_BY_SLUG, type Obra } from "./obras";

export interface SocialProofLink {
  /** slug da obra em obras.ts */
  obraSlug: string;
  /** enquadramento opcional exibido no modal (ex.: parceiro que ensina a mesclar) */
  enquadramento?: string;
}

export const SOCIAL_PROOF_LINKS: Record<string, SocialProofLink> = {
  "neymar-jr": { obraSlug: "lago-neymar" },
  "caito-maia": { obraSlug: "caito-maia" },
  "tato-falamansa": { obraSlug: "casa-de-praia-tato" },
  "unique-garden": { obraSlug: "unique-garden" },
  "hotel-rosewood": { obraSlug: "rosewood" },
  "genesis-ecossistemas": {
    obraSlug: "lago-neymar",
    enquadramento: "Como mesclar pedra natural + Western no mesmo lago",
  },
  // Jader/All Resort entram quando chegar a foto do pilar-árvore:
  // "jader-almeida": { obraSlug: "jader-porto-belo" },
  // "all-resort-porto-belo": { obraSlug: "jader-porto-belo" },
};

/** true se o tile tem lastro e deve ser clicável. */
export function temLastro(slug: string): boolean {
  const link = SOCIAL_PROOF_LINKS[slug];
  return Boolean(link && OBRAS_BY_SLUG[link.obraSlug]);
}

/** Retorna {link, obra} de um tile, ou null se não tiver lastro. */
export function resolverProva(slug: string): { link: SocialProofLink; obra: Obra } | null {
  const link = SOCIAL_PROOF_LINKS[slug];
  if (!link) return null;
  const obra = OBRAS_BY_SLUG[link.obraSlug];
  return obra ? { link, obra } : null;
}
