// Casos reais / prova social â€” Western
// MÃ­dia real conectada. Imagens e vÃ­deos hospedados como assets do projeto.
import caitoMaia from "@/assets/casos-western/caito-maia.webp";
import uniqueGarden from "@/assets/casos-western/unique-garden.webp";
import fazzendaPark from "@/assets/casos-western/fazzenda-park.webp";
import nicolePoster from "@/assets/casos-western/nicole-sigaud-poster.webp";
import clientePoster from "@/assets/casos-western/cliente-western-poster.webp";
import rosewoodPoster from "@/assets/casos-western/rosewood-poster.webp";
import nicoleVideo from "@/assets/casos-western/nicole-sigaud.mp4";
import clienteVideo from "@/assets/casos-western/cliente-western.mp4";
import rosewoodVideo from "@/assets/casos-western/rosewood.mp4";
import projetoResidencial from "@/assets/casos-western/projeto-residencial.webp";

export type CasoTipo = "video" | "image";

export interface CasoWestern {
  id: string;
  tipo: CasoTipo;
  /** URL do vÃ­deo (mp4/embed) OU URL da imagem em alta. */
  mediaUrl: string;
  /** Poster / thumb (usado sempre no card e para itens de vÃ­deo no lightbox antes do play). */
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
    mediaUrl: nicoleVideo,
    posterUrl: nicolePoster,
    credito: "Nicole Sigaud Â· Arquiteta",
    titulo: "Piscina e cascata em terreno Ã­ngreme",
    story:
      "Um projeto complexo numa casa em declive acentuado que sÃ³ se tornou viÃ¡vel com a leveza, o baixo impacto ambiental e a facilidade de instalaÃ§Ã£o das peÃ§as â€” respeitando a natureza do morro.",
    destaque: true,
  },
  {
    id: "cliente-western",
    tipo: "video",
    mediaUrl: clienteVideo,
    posterUrl: clientePoster,
    credito: "Conrado Â· Cliente",
    titulo: "Como a Western transformou o ambiente",
    story: "Depoimento de cliente sobre o resultado no seu espaÃ§o.",
  },
  {
    id: "unique-garden",
    tipo: "image",
    mediaUrl: uniqueGarden,
    posterUrl: uniqueGarden,
    credito: "Unique Garden",
    titulo: "ChalÃ© simbionte com o morro",
    story:
      "As pedras copiaram a textura e o relevo jÃ¡ existentes e se integraram Ã  natureza, com pintura personalizada.",
  },
  {
    id: "caito-maia",
    tipo: "image",
    mediaUrl: caitoMaia,
    posterUrl: caitoMaia,
    credito: "Caito Maia Â· EmpresÃ¡rio",
    titulo: "Base de mesa em pedra Western",
    story: "PeÃ§a sob medida para o escritÃ³rio, feita com pedra Western.",
  },
  {
    id: "rosewood",
    tipo: "video",
    mediaUrl: rosewoodVideo,
    posterUrl: rosewoodPoster,
    credito: "Rosewood Â· Ed. Matarazzo",
    titulo: "Revestimentos e pedras Western",
    story: "AplicaÃ§Ã£o em um dos endereÃ§os mais icÃ´nicos de SÃ£o Paulo.",
  },
  {
    id: "fazzenda-park",
    tipo: "image",
    mediaUrl: fazzendaPark,
    posterUrl: fazzendaPark,
    credito: "Fazzenda Park Resort Â· Gaspar/SC",
    titulo: "Cascata em pedras Western",
    story: "Cascata de grande porte executada com peÃ§as Western.",
  },
  {
    id: "projeto-residencial",
    tipo: "image",
    mediaUrl: projetoResidencial,
    posterUrl: projetoResidencial,
    credito: "Cascata Santa BÃ¡rbara",
    titulo: "Projeto residencial",
    story:
      "Cascata Santa BÃ¡rbara e outras peÃ§as Western distribuÃ­das pelo espaÃ§o da residÃªncia, compondo um ambiente orgÃ¢nico e integrado Ã  natureza.",
  },
];
