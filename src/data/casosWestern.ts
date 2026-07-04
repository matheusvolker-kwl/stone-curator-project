// Casos reais / prova social — Western
// Mídia real conectada. Imagens e vídeos hospedados como assets do projeto.
import caitoMaia from "@/assets/casos-western/caito-maia.webp.asset.json";
import uniqueGarden from "@/assets/casos-western/unique-garden.webp.asset.json";
import fazzendaPark from "@/assets/casos-western/fazzenda-park.webp.asset.json";
import nicolePoster from "@/assets/casos-western/nicole-sigaud-poster.webp.asset.json";
import clientePoster from "@/assets/casos-western/cliente-western-poster.webp.asset.json";
import rosewoodPoster from "@/assets/casos-western/rosewood-poster.webp.asset.json";
import nicoleVideo from "@/assets/casos-western/nicole-sigaud.mp4.asset.json";
import clienteVideo from "@/assets/casos-western/cliente-western.mp4.asset.json";
import rosewoodVideo from "@/assets/casos-western/rosewood.mp4.asset.json";

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
    mediaUrl: nicoleVideo.url,
    posterUrl: nicolePoster.url,
    credito: "Nicole Sigaud · Arquiteta",
    titulo: "Piscina e cascata em terreno íngreme",
    story:
      "Um projeto complexo numa casa em declive acentuado que só se tornou viável com a leveza, o baixo impacto ambiental e a facilidade de instalação da Western — respeitando a natureza do morro.",
    destaque: true,
  },
  {
    id: "cliente-western",
    tipo: "video",
    mediaUrl: clienteVideo.url,
    posterUrl: clientePoster.url,
    credito: "Conrado · Cliente",
    titulo: "Como a Western transformou o ambiente",
    story: "Depoimento de cliente sobre o resultado no seu espaço.",
  },
  {
    id: "unique-garden",
    tipo: "image",
    mediaUrl: uniqueGarden.url,
    posterUrl: uniqueGarden.url,
    credito: "Unique Garden",
    titulo: "Chalé simbionte com o morro",
    story:
      "As pedras copiaram a textura e o relevo já existentes e se integraram à natureza, com pintura personalizada.",
  },
  {
    id: "caito-maia",
    tipo: "image",
    mediaUrl: caitoMaia.url,
    posterUrl: caitoMaia.url,
    credito: "Caito Maia · Empresário",
    titulo: "Base de mesa em pedra Western",
    story: "Peça sob medida para o escritório, feita com pedra Western.",
  },
  {
    id: "rosewood",
    tipo: "video",
    mediaUrl: rosewoodVideo.url,
    posterUrl: rosewoodPoster.url,
    credito: "Rosewood · Ed. Matarazzo",
    titulo: "Revestimentos e pedras Western",
    story: "Aplicação em um dos endereços mais icônicos de São Paulo.",
  },
  {
    id: "fazzenda-park",
    tipo: "image",
    mediaUrl: fazzendaPark.url,
    posterUrl: fazzendaPark.url,
    credito: "Fazzenda Park Resort · Gaspar/SC",
    titulo: "Cascata em pedras Western",
    story: "Cascata de grande porte executada com peças Western.",
  },
];
