import piscinaMaresias from "@/assets/conjuntos-render/conjunto-piscina-maresias-equilibrado.webp";
import lagoAraruama from "@/assets/conjuntos-render/conjunto-lago-araruama-equilibrado.webp";
import lagoHibridoMarajo from "@/assets/conjuntos-render/conjunto-lago-hibrido-marajo-equilibrado.webp";
import jardimFonteIguacu from "@/assets/conjuntos-render/conjunto-jardim-fonte-iguacu-equilibrado.webp";
import jardimSecoDiamantina from "@/assets/conjuntos-render/conjunto-jardim-seco-diamantina-completo.webp";

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
  piscina: piscinaMaresias,
  lago: lagoAraruama,
  "lago-hibrido": lagoHibridoMarajo,
  "jardim-fonte": jardimFonteIguacu,
  "jardim-seco": jardimSecoDiamantina,
};

// Teasers curtos (2 linhas limpas nos cards de cena; sem truncar palavra).
export const tipoMicrocopy: Record<TipoVisual, string> = {
  piscina: "Cascata e pedras na borda da piscina.",
  lago: "Espelho d'água com pedras, criado do zero.",
  "lago-hibrido": "Complementa a pedra natural que você já tem.",
  "jardim-fonte": "Fonte central e pedras, com o som da água.",
  "jardim-seco": "Jardim mineral e contemplativo, sem água.",
};

export const nivelImage: Record<Nivel, string> = {
  essencial: cascataEscalonada,
  equilibrada: cascataMirante,
  completa: cascataTropical,
};

export const stoneCrops = [detalheMatriz, bordaPedra];
export const guideHeroStrip = respiroPedra;
