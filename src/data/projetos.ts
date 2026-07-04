import coverCasaPraia from "@/assets/projetos/cover-casa-praia.webp";
import coverLago from "@/assets/projetos/cover-lago.webp";

export interface Projeto {
  slug: string;
  eyebrow: string;
  titulo: string;
  snippet: string;
  texto: string[];
  ficha: string[];
  cover: string;
  /** Imagem alternativa usada apenas no card da seção "Obras assinadas". Se ausente, usa `cover`. */
  cardCover?: string;
  /** Vídeo opcional — se ausente, o modal exibe apenas a imagem cover. */
  video?: string;
  /** Quando true, sinaliza projeto sob acordo de confidencialidade. */
  confidencial?: boolean;
}

export const PROJETOS: Projeto[] = [
  {
    slug: "casa-de-praia",
    eyebrow: "Tato (Falamansa) · JJ Arquitetura",
    titulo: "Casa de Praia",
    snippet:
      "Dois mil metros quadrados desenhados como um oásis. Piscina natural, lago ornamental com carpas e pedras sonoras integradas ao jardim.",
    texto: [
      "Uma reforma com o desafio de integrar a arquitetura moderna preexistente à proposta Western de trazer o natural para dentro do projeto. Junto à equipe de arquitetura e ao próprio Tato, foram definidos cada acesso, forma e detalhe — do posicionamento das pedras na prainha ao desenho do lago, passando pelo acabamento do fogo de chão e pela escolha das carpas.",
      "O conjunto foi completado pelas pedras sonoras integradas ao jardim. Piscina natural praia, lago ornamental com carpas e sonorização ambiente compõem um oásis privado, pensado para receber família e amigos.",
    ],
    ficha: [
      "JJ Arquitetura",
      "2.000 m² de área total",
      "Piscina 60 m²",
      "Lago 20 m²",
    ],
    cover: coverCasaPraia,
    video: "/videos/projetos/casa-praia.mp4",
  },
  {
    slug: "lago-ornamental",
    eyebrow: "Neymar Jr · Genesis Ecosistemas",
    titulo: "Lago Ornamental",
    snippet:
      "Um dos maiores lagos artificiais do Brasil. Mais de mil metros quadrados com solução de engenharia para zonas de carga crítica.",
    texto: [
      "Em um dos maiores lagos artificiais já executados no Brasil, o desafio estava nas zonas críticas de casa de máquinas e de manutenção: o peso de pedras naturais sobre essas áreas comprometeria a engenharia do conjunto. A solução foi distribuir pedras artificiais Western nessas regiões, preservando a unidade visual do lago sem sobrecarga estrutural.",
      "A parceria com a Genesis Ecosistemas permitiu uma resposta técnica à altura de uma escala incomum — mais de mil metros quadrados de lago atendidos por uma solução que une desempenho de engenharia e fidelidade estética.",
    ],
    ficha: [
      "Em parceria com Genesis Ecosistemas",
      "1.000+ m² de lago artificial",
    ],
    cover: coverLago,
    video: "/videos/projetos/lago.mp4",
  },
];
