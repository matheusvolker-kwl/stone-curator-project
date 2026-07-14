import amostrasAsset from "@/assets/linhas/amostras.webp";
import cascatasAsset from "@/assets/linhas/cascatas.webp";
import fontesAsset from "@/assets/linhas/fontes-para-jardim.webp";
import fosseisAsset from "@/assets/linhas/fosseis-decorativos.webp";
import pedrasGrandesAsset from "@/assets/linhas/pedras-grandes.webp";
import acessoriosAsset from "@/assets/linhas/acessorios.webp";
import pedrasMediasAsset from "@/assets/linhas/pedras-medias.webp";
import pedrasPequenasAsset from "@/assets/linhas/pedras-pequenas.webp";
import pedrasDeBordaAsset from "@/assets/linhas/pedras-de-borda.webp";
import pisadasAsset from "@/assets/linhas/pisadas.webp";
import revestimentosAsset from "@/assets/linhas/revestimentos.webp";

// Capas das linhas (categorias), por handle/slug do WooCommerce.
// HÃ¡ aliases (ex.: "fontes" e "fontes-para-jardim") para cobrir variaÃ§Ãµes de slug.
export const LINHA_COVER_OVERRIDES: Record<string, { url: string; alt: string }> = {
  amostras: { url: amostrasAsset, alt: "Western Box â€” kit de amostras em caixa verde com logo Western dourado." },
  cascatas: { url: cascatasAsset, alt: "Cascata Western em pedra com lÃ¢mina de Ã¡gua caindo na piscina, paisagismo tropical." },
  "fontes-para-jardim": { url: fontesAsset, alt: "Fonte Western de pedra com Ã¡gua em jardim tropical." },
  fontes: { url: fontesAsset, alt: "Fonte Western de pedra com Ã¡gua em jardim tropical." },
  "fosseis-decorativos": { url: fosseisAsset, alt: "FÃ³ssil decorativo Western em placa de pedra, Ã¡rea externa." },
  fosseis: { url: fosseisAsset, alt: "FÃ³ssil decorativo Western em placa de pedra, Ã¡rea externa." },
  "fosseis-decorativos-2": { url: fosseisAsset, alt: "FÃ³ssil decorativo Western em placa de pedra, Ã¡rea externa." },
  "pedras-grandes": { url: pedrasGrandesAsset, alt: "Pedra grande Western como elemento escultural em jardim de suculentas." },
  acessorios: { url: acessoriosAsset, alt: "Pedra LED Western iluminada Ã  noite na borda da piscina, ambiente tropical." },
  "pedras-medias": { url: pedrasMediasAsset, alt: "Pedras mÃ©dias Western aplicadas junto Ã  borda da piscina em paisagismo tropical." },
  "pedras-pequenas": { url: pedrasPequenasAsset, alt: "Pedras pequenas Western aplicadas ao redor da piscina com vegetaÃ§Ã£o tropical." },
  "pedras-de-borda": { url: pedrasDeBordaAsset, alt: "Pedra de borda Western aplicada na curva da piscina em Ã¡rea externa." },
  pisadas: { url: pisadasAsset, alt: "Pisada Western formando travessia sobre lago ornamental com pedras naturais." },
  revestimentos: { url: revestimentosAsset, alt: "Revestimento Western aplicado em parede externa com paisagismo tropical." },
};
