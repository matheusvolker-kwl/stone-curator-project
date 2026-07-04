// Descrições curtas das linhas (categorias), por handle/slug do WooCommerce.
// Override local porque o campo `description` das categorias no Woo está vazio
// (exceto "amostras"). Estas têm prioridade sobre a descrição vinda do Woo.
export const LINHA_DESCRIPTIONS: Record<string, string> = {
  acessorios: "Pedras LED e complementos que acabam o projeto — iluminação e detalhe.",
  amostras: "Kit físico de samples dos quatro acabamentos para especificar com segurança.",
  cascatas: "Quedas d'água esculpidas peça a peça para piscinas, lagos e muros.",
  "fosseis-decorativos": "Placas com relevo fóssil para paredes e composições de destaque.",
  fosseis: "Placas com relevo fóssil para paredes e composições de destaque.",
  "pedras-de-borda": "Acabamento de borda para piscinas e canteiros, encaixe limpo e contínuo.",
  "pedras-grandes": "Blocos escultóricos para pontos focais e paisagismo de grande porte.",
  "pedras-medias": "Volume intermediário para compor maciços e transições no jardim.",
  "pedras-pequenas": "Peças menores para preenchimento, forração e arremate fino.",
  "fontes-para-jardim": "Fontes artesanais em pedra com água corrente para áreas externas.",
  fontes: "Fontes artesanais em pedra com água corrente para áreas externas.",
  pisadas: "Passo a passo em pedra para travessias sobre gramados, lagos e decks.",
  revestimentos: "Placas para revestir paredes externas com textura natural de pedra.",
};
