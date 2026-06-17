import coverPiscina from "@/assets/projetos/cover-piscina.webp";
import coverLago from "@/assets/projetos/cover-lago.webp";
import coverCaitoMaia from "@/assets/projetos/cover-jardim-fonte.webp";
import coverCasaPraia from "@/assets/projetos/cover-jardim-seco.webp";

import cascataEscalonada from "@/assets/about-projetos/cascata-escalonada.jpg";
import cascataMirante from "@/assets/about-projetos/cascata-mirante.webp";
import cascataTropical from "@/assets/about-projetos/cascata-tropical.webp";
import detalheMatriz from "@/assets/about-projetos/detalhe-matriz.jpg";
import bordaPedra from "@/assets/about-projetos/borda-pedra.webp";
import respiroPedra from "@/assets/respiro-pedra.webp";

import type { TipoVisual } from "./types";
import type { Nivel } from "@/data/guideMap";

export const tipoImage: Record<TipoVisual, string> = {
  piscina: coverPiscina,
  lago: coverLago,
  // Lago Híbrido reusa a imagem de Lago temporariamente (futuro: imagem própria
  // mostrando integração entre pedra Western e pedra natural).
  "lago-hibrido": coverLago,
  "jardim-fonte": coverCaitoMaia,
  "jardim-seco": coverCasaPraia,
};

export const nivelImage: Record<Nivel, string> = {
  essencial: cascataEscalonada,
  equilibrada: cascataMirante,
  completa: cascataTropical,
};

export const stoneCrops = [detalheMatriz, bordaPedra];
export const guideHeroStrip = respiroPedra;
