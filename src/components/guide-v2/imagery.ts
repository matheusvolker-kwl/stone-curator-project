import piscinaMaresias from "@/assets/conjuntos-render/conjunto-piscina-maresias-equilibrado.webp.asset.json";
import lagoAraruama from "@/assets/conjuntos-render/conjunto-lago-araruama-equilibrado.webp.asset.json";
import lagoHibridoMarajo from "@/assets/conjuntos-render/conjunto-lago-hibrido-marajo-equilibrado.webp.asset.json";
import jardimFonteIguacu from "@/assets/conjuntos-render/conjunto-jardim-fonte-iguacu-equilibrado.webp.asset.json";
import jardimSecoDiamantina from "@/assets/conjuntos-render/conjunto-jardim-seco-diamantina-completo.webp.asset.json";

import cascataEscalonada from "@/assets/about-projetos/cascata-escalonada.jpg";
import cascataMirante from "@/assets/about-projetos/cascata-mirante.webp";
import cascataTropical from "@/assets/about-projetos/cascata-tropical.webp";
import detalheMatriz from "@/assets/about-projetos/detalhe-matriz.jpg";
import bordaPedra from "@/assets/about-projetos/borda-pedra.webp";
import respiroPedra from "@/assets/respiro-pedra.webp";

import type { TipoVisual } from "./types";
import type { Nivel } from "@/data/guideMap";

// Renders representativos (nível equilibrado, com exceção do jardim seco que usa completo)
// por tipo — consistência fotográfica no quiz de contexto.
export const tipoImage: Record<TipoVisual, string> = {
  piscina: piscinaMaresias.url,
  lago: lagoAraruama.url,
  "lago-hibrido": lagoHibridoMarajo.url,
  "jardim-fonte": jardimFonteIguacu.url,
  "jardim-seco": jardimSecoDiamantina.url,
};

export const tipoMicrocopy: Record<TipoVisual, string> = {
  piscina: "Cascata e pedras compondo a borda da piscina.",
  lago: "Espelho d'água com pedras e cascata, criado do zero.",
  "lago-hibrido":
    "Já tem pedra natural? Complemente com peças Western que conversam com o que já existe.",
  "jardim-fonte":
    "Fonte central e pedras — o jardim com o som da água, sem piscina.",
  "jardim-seco":
    "Composição de pedras sem água: jardim mineral, contemplativo.",
};

export const nivelImage: Record<Nivel, string> = {
  essencial: cascataEscalonada,
  equilibrada: cascataMirante,
  completa: cascataTropical,
};

export const stoneCrops = [detalheMatriz, bordaPedra];
export const guideHeroStrip = respiroPedra;
