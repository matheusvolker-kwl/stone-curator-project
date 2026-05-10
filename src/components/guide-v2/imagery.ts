import coverPiscina from "@/assets/projetos/cover-piscina.avif";
import coverLago from "@/assets/projetos/cover-lago.webp";
import coverCascata from "@/assets/projetos/cover-cascata.webp";
import coverCaitoMaia from "@/assets/projetos/cover-caito-maia.webp";
import coverCasaPraia from "@/assets/projetos/cover-casa-praia.webp";

import cascataEscalonada from "@/assets/about-projetos/cascata-escalonada.jpg";
import cascataMirante from "@/assets/about-projetos/cascata-mirante.jpg";
import cascataTropical from "@/assets/about-projetos/cascata-tropical.jpg";
import detalheMatriz from "@/assets/about-projetos/detalhe-matriz.jpg";
import bordaPedra from "@/assets/about-projetos/borda-pedra.jpg";
import respiroPedra from "@/assets/respiro-pedra.webp";

import type { TipoVisual } from "./types";
import type { Nivel } from "@/data/guideMap";

export const tipoImage: Record<TipoVisual, string> = {
  piscina: coverPiscina,
  lago: coverLago,
  "lago-reduzido": coverCascata,
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
