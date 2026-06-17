import pedrasMediasAsset from "@/assets/linhas/pedras-medias.png.asset.json";
import pedrasPequenasAsset from "@/assets/linhas/pedras-pequenas.png.asset.json";
import revestimentosAsset from "@/assets/linhas/revestimentos.png.asset.json";
import pedrasDeBordaAsset from "@/assets/linhas/pedras-de-borda.png.asset.json";
import pisadasAsset from "@/assets/linhas/pisadas.png.asset.json";

export const LINHA_COVER_OVERRIDES: Record<string, { url: string; alt: string }> = {
  "pedras-medias": {
    url: pedrasMediasAsset.url,
    alt: "Pedras médias Western aplicadas junto à borda da piscina em paisagismo tropical.",
  },
  "pedras-pequenas": {
    url: pedrasPequenasAsset.url,
    alt: "Pedras pequenas Western aplicadas ao redor da piscina com vegetação tropical.",
  },
  revestimentos: {
    url: revestimentosAsset.url,
    alt: "Revestimento Western aplicado em parede externa com paisagismo tropical.",
  },
  "pedras-de-borda": {
    url: pedrasDeBordaAsset.url,
    alt: "Pedra de borda Western aplicada na curva da piscina em área externa.",
  },
  pisadas: {
    url: pisadasAsset.url,
    alt: "Pisada Western formando travessia sobre lago ornamental com pedras naturais.",
  },
};
