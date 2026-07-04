// Casos reais / prova social — Western
// TODO: Cliente vai substituir mediaUrl (vídeos) e posterUrl (imagens/thumbs) pelas URLs reais.
// Para os itens do tipo "video", preencher mediaUrl com um link direto para o arquivo (mp4)
// ou um embed URL (YouTube/Vimeo). Enquanto isso, usamos posters/imagens já existentes
// no projeto como placeholders visuais.
import img01 from "@/assets/projetos-western/01_hero-tapirai.webp.asset.json";
import img02 from "@/assets/projetos-western/02_pedra-detalhe.webp.asset.json";
import img03 from "@/assets/projetos-western/03_piscina-cascata.webp.asset.json";
import img05 from "@/assets/projetos-western/05_cascata-escalonada.webp.asset.json";
import img06 from "@/assets/projetos-western/06_piscina-cascata-serra.webp.asset.json";
import img08 from "@/assets/projetos-western/08_piscina-paisagismo.webp.asset.json";

export type CasoTipo = "video" | "image";

export interface CasoWestern {
  id: string;
  tipo: CasoTipo;
  /** URL do vídeo (mp4/embed) OU URL da imagem em alta. */
  mediaUrl: string;
  /** Poster / thumb (usado sempre no card e para itens de vídeo no lightbox antes do play). */
  posterUrl: string;
  credito: string; // Nome + papel
  titulo: string;
  story: string;
  destaque?: boolean;
}

export const CASOS_WESTERN: CasoWestern[] = [
  {
    id: "nicole-sigaud",
    tipo: "video",
    // TODO: substituir por URL real do vídeo (mp4 ou embed)
    mediaUrl: "",
    posterUrl: img01.url,
    credito: "Nicole Sigaud · Arquiteta",
    titulo: "Piscina e cascata em terreno íngreme",
    story:
      "Um projeto complexo numa casa em declive acentuado que só se tornou viável com a leveza, o baixo impacto ambiental e a facilidade de instalação da Western — respeitando a natureza do morro.",
    destaque: true,
  },
  {
    id: "cliente-western",
    tipo: "video",
    // TODO: URL real do vídeo
    mediaUrl: "",
    posterUrl: img03.url,
    credito: "Cliente Western",
    titulo: "Como a Western transformou o ambiente",
    story: "Depoimento de cliente sobre o resultado no seu espaço.",
  },
  {
    id: "unique-garden",
    tipo: "image",
    // TODO: URL real da imagem em alta
    mediaUrl: img02.url,
    posterUrl: img02.url,
    credito: "Unique Garden",
    titulo: "Chalé simbionte com o morro",
    story:
      "As pedras copiaram a textura e o relevo já existentes e se integraram à natureza, com pintura personalizada.",
  },
  {
    id: "caito-maia",
    tipo: "image",
    // TODO: URL real da imagem
    mediaUrl: img08.url,
    posterUrl: img08.url,
    credito: "Caito Maia · Empresário",
    titulo: "Base de mesa em pedra Western",
    story: "Peça sob medida para o escritório, feita com pedra Western.",
  },
  {
    id: "rosewood",
    tipo: "video",
    // TODO: URL real do vídeo
    mediaUrl: "",
    posterUrl: img06.url,
    credito: "Rosewood · Ed. Matarazzo",
    titulo: "Revestimentos e pedras Western",
    story: "Aplicação em um dos endereços mais icônicos de São Paulo.",
  },
  {
    id: "fazzenda-park",
    tipo: "image",
    // TODO: URL real da imagem
    mediaUrl: img05.url,
    posterUrl: img05.url,
    credito: "Fazzenda Park Resort · Gaspar/SC",
    titulo: "Cascata em pedras Western",
    story: "Cascata de grande porte executada com peças Western.",
  },
];
