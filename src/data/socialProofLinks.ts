/**
 * Resolve um tile da prova social (slug de socialProof.ts) para a OBRA que o
 * lastreia. Mantém socialProof.ts puro (só nomes/fotos); a interatividade lê
 * daqui. Só entram os tiles COM lastro real (obra + mídia). Tiles ausentes
 * deste mapa permanecem NÃO-clicáveis — sem afordância falsa.
 */
import { OBRAS_BY_SLUG, type Obra } from "./obras";
import { OBRA_COVER } from "./obraImages";

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
  // A foto do pilar-árvore chegou (acervo 2026-07): tronco de pedra Western +
  // copa de laje viva sobre o lago. Confere com o conceito escrito em obras.ts.
  "jader-almeida": { obraSlug: "jader-porto-belo" },
  "all-resort-porto-belo": { obraSlug: "jader-porto-belo" },
  "alex-hanazaki": { obraSlug: "hanazaki-expo-revestir" },
  "marcelo-faisal": { obraSlug: "faisal-piscina-grega" },
  // Continuam SEM lastro e corretamente não-clicáveis — não há obra nem foto no
  // acervo: cobasi, cristal-pool, biopet-lagos, mandaia-arquitetura.
  // ⚠ Quadriplex Caverna é da DAMA Arquitetura, não da Mandaia — não serve de
  // lastro para ela. É pedido de foto ao dono, não trabalho de código.
};

/**
 * Lastro = a obra existe E tem cover. As DUAS condições, porque ObraPage.tsx:31
 * redireciona a obra sem cover: validar só a existência deixa passar um link que
 * morre no destino e devolve o usuário para a lista. Era o caso do
 * jader-porto-belo, e é a guarda que impede o próximo.
 */
function lastroDe(slug: string): { link: SocialProofLink; obra: Obra } | null {
  const link = SOCIAL_PROOF_LINKS[slug];
  if (!link) return null;
  const obra = OBRAS_BY_SLUG[link.obraSlug];
  if (!obra || !OBRA_COVER[link.obraSlug]) return null;
  return { link, obra };
}

/** true se o tile tem lastro e deve ser clicável. */
export function temLastro(slug: string): boolean {
  return lastroDe(slug) !== null;
}

/** Retorna {link, obra} de um tile, ou null se não tiver lastro. */
export function resolverProva(slug: string): { link: SocialProofLink; obra: Obra } | null {
  return lastroDe(slug);
}
