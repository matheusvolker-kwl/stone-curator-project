import pedraGrande2Cascata from "@/assets/produtos-aplicados/pedra-grande-2-cascata.webp";

export interface ProductInUseImage {
  src: string;
  caption?: string;
  credit?: string;
  /** Para layouts onde uma imagem ocupa o lado "hero". */
  featured?: boolean;
}

/**
 * Mapa curado de fotos do produto APLICADO em obra.
 * Só preencher quando há foto real do produto em projeto executado.
 * Sem entrada → seção não aparece (sem fallback genérico).
 */
export const PRODUCT_IN_USE: Record<string, ProductInUseImage[]> = {
  "pedra-grande-2": [
    {
      src: pedraGrande2Cascata,
      caption: "Cascata integrada ao paisagismo tropical",
      credit: "Rio de Janeiro",
      featured: true,
    },
  ],
};
