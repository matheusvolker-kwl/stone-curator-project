import cascatasAsset from "@/assets/linhas/cascatas.webp.asset.json";
import fontesAsset from "@/assets/linhas/fontes-para-jardim.webp.asset.json";
import fosseisAsset from "@/assets/linhas/fosseis-decorativos.webp.asset.json";
import pedrasGrandesAsset from "@/assets/linhas/pedras-grandes.webp.asset.json";
import acessoriosAsset from "@/assets/linhas/acessorios.webp.asset.json";
import pedrasMediasAsset from "@/assets/linhas/pedras-medias.webp.asset.json";
import pedrasPequenasAsset from "@/assets/linhas/pedras-pequenas.webp.asset.json";
import pedrasDeBordaAsset from "@/assets/linhas/pedras-de-borda.webp.asset.json";
import pisadasAsset from "@/assets/linhas/pisadas.webp.asset.json";
import revestimentosAsset from "@/assets/linhas/revestimentos.webp.asset.json";

// Capas das linhas (categorias), por handle/slug do WooCommerce.
// Há aliases (ex.: "fontes" e "fontes-para-jardim") para cobrir variações de slug.
export const LINHA_COVER_OVERRIDES: Record<string, { url: string; alt: string }> = {
  // amostras: aguardando foto real da Western Box (fornecida pelo dono) — importar amostras.webp.asset.json e adicionar aqui.
  cascatas: { url: cascatasAsset.url, alt: "Cascata Western em pedra com lâmina de água caindo na piscina, paisagismo tropical." },
  "fontes-para-jardim": { url: fontesAsset.url, alt: "Fonte Western de pedra com água em jardim tropical." },
  fontes: { url: fontesAsset.url, alt: "Fonte Western de pedra com água em jardim tropical." },
  "fosseis-decorativos": { url: fosseisAsset.url, alt: "Fóssil decorativo Western em placa de pedra, área externa." },
  fosseis: { url: fosseisAsset.url, alt: "Fóssil decorativo Western em placa de pedra, área externa." },
  "fosseis-decorativos-2": { url: fosseisAsset.url, alt: "Fóssil decorativo Western em placa de pedra, área externa." },
  "pedras-grandes": { url: pedrasGrandesAsset.url, alt: "Pedra grande Western como elemento escultural em jardim de suculentas." },
  acessorios: { url: acessoriosAsset.url, alt: "Pedra LED Western iluminada à noite na borda da piscina, ambiente tropical." },
  "pedras-medias": { url: pedrasMediasAsset.url, alt: "Pedras médias Western aplicadas junto à borda da piscina em paisagismo tropical." },
  "pedras-pequenas": { url: pedrasPequenasAsset.url, alt: "Pedras pequenas Western aplicadas ao redor da piscina com vegetação tropical." },
  "pedras-de-borda": { url: pedrasDeBordaAsset.url, alt: "Pedra de borda Western aplicada na curva da piscina em área externa." },
  pisadas: { url: pisadasAsset.url, alt: "Pisada Western formando travessia sobre lago ornamental com pedras naturais." },
  revestimentos: { url: revestimentosAsset.url, alt: "Revestimento Western aplicado em parede externa com paisagismo tropical." },
};
