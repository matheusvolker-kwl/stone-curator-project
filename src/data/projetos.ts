import coverCascata from "@/assets/projetos/cover-cascata.webp";
import coverCasaPraia from "@/assets/projetos/cover-casa-praia.webp";
import coverPiscina from "@/assets/projetos/cover-piscina.avif";
import coverLago from "@/assets/projetos/cover-lago.jpg";

export interface Projeto {
  slug: string;
  eyebrow: string;
  titulo: string;
  snippet: string;
  texto: string[];
  ficha: string[];
  cover: string;
  video: string;
}

export const PROJETOS: Projeto[] = [
  {
    slug: "cascata-integrada",
    eyebrow: "Evandro Mesquita · Rio de Janeiro",
    titulo: "Cascata Integrada",
    snippet:
      "A cascata que parece sempre ter estado ali. Uma queda d'água articulada ao riacho natural existente, em meio a paisagismo tropical.",
    texto: [
      "O desafio era integrar uma nova cascata e todo o paisagismo ao cenário natural existente. A piscina — antes um lago com pedra natural incrustada no fundo — inspirou a criação de um conjunto em que a intervenção parece ter sempre feito parte do lugar.",
      "A cascata foi articulada a um riacho natural já existente, compondo uma queda d'água que convive com o paisagismo tropical e com as folhagens que margeiam a piscina. Arquitetura e natureza deixam de ter fronteira visível.",
    ],
    ficha: ["Cascata artificial", "Paisagismo tropical", "Rio de Janeiro"],
    cover: coverCascata,
    video: "/videos/projetos/cascata.mp4",
  },
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
    slug: "piscina-suspensa",
    eyebrow: "Thiago Nigro & Maíra Cardi",
    titulo: "Piscina Suspensa",
    snippet:
      "Mais de cinquenta peças em uma piscina suspensa. A leveza do composto mineral viabilizou uma obra estruturalmente impossível com pedra natural.",
    texto: [
      "A complexidade de uma piscina suspensa exigia uma resposta técnica precisa: reduzir drasticamente a carga sem abrir mão da estética de pedra natural. As peças Western, em composto mineral de alta resistência, viabilizaram a execução sem guindaste e sem comprometer a integridade do conjunto.",
      "Mais de cinquenta peças foram aplicadas na piscina praia, reproduzindo o aspecto e a textura das pedras naturais com a leveza que o projeto demandava — uma solução que só uma pedra artificial de alta fidelidade poderia entregar.",
    ],
    ficha: [
      "Piscina suspensa",
      "50+ peças aplicadas",
      "Composto mineral de alta resistência",
    ],
    cover: coverPiscina,
    video: "/videos/projetos/piscina.mp4",
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
