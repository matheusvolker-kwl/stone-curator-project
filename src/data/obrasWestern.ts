// Placeholder data for the "Obras Western" gallery.
// TODO: Cliente vai preencher com dados reais (obra, local, produto, quantidade).
// No futuro, isto pode vir de um CMS ou de metafields do Shopify.
import img01 from "@/assets/projetos-western/01_hero-tapirai.webp";
import img02 from "@/assets/projetos-western/02_pedra-detalhe.webp";
import img03 from "@/assets/projetos-western/03_piscina-cascata.webp";
import img04 from "@/assets/projetos-western/04_piscina-mirante.webp";
import img05 from "@/assets/projetos-western/05_cascata-escalonada.webp";
import img06 from "@/assets/projetos-western/06_piscina-cascata-serra.webp";
import img07 from "@/assets/projetos-western/07_cascata-piscina.webp";
import img08 from "@/assets/projetos-western/08_piscina-paisagismo.webp";
import img09 from "@/assets/projetos-western/09_piscina-cascata-2.webp";
import img10 from "@/assets/projetos-western/10_piscina-vista.webp";
import img11 from "@/assets/projetos-western/11_cascata-ferns.webp";
import img12 from "@/assets/projetos-western/12_borda-pedra.webp";

export type ObraCategoria = "piscinas" | "cascatas" | "jardins";

export interface ObraWestern {
  id: string;
  src: string;
  categoria: ObraCategoria;
  obra: string; // nome da residência/obra (placeholder)
  local: string; // cidade/UF (placeholder)
  produto: string; // produto/quantidade Western usada (placeholder)
  destaque?: boolean;
}

export const OBRAS_WESTERN: ObraWestern[] = [
  {
    id: "tapirai",
    src: img01,
    categoria: "cascatas",
    obra: "Residência Serra da Cantareira",
    local: "Tapiraí · SP",
    produto: "Cascata Grande · 42 peças",
    destaque: true,
  },
  {
    id: "piscina-cascata",
    src: img03,
    categoria: "piscinas",
    obra: "Casa de Campo",
    local: "Atibaia · SP",
    produto: "Cascata Média + Borda 30cm",
  },
  {
    id: "pedra-detalhe",
    src: img02,
    categoria: "jardins",
    obra: "Jardim Contemporâneo",
    local: "São Paulo · SP",
    produto: "Pedras Grandes · 18 peças",
  },
  {
    id: "cascata-ferns",
    src: img11,
    categoria: "cascatas",
    obra: "Residência Tropical",
    local: "Ubatuba · SP",
    produto: "Cascata Escalonada · 26 peças",
  },
  {
    id: "cascata-serra",
    src: img06,
    categoria: "cascatas",
    obra: "Sítio Vista da Serra",
    local: "Campos do Jordão · SP",
    produto: "Cascata Grande + Pedras Médias",
  },
  {
    id: "piscina-mirante",
    src: img04,
    categoria: "piscinas",
    obra: "Casa Mirante",
    local: "Itu · SP",
    produto: "Borda 40cm · 34m lineares",
  },
  {
    id: "borda-pedra",
    src: img12,
    categoria: "jardins",
    obra: "Residência Alto de Pinheiros",
    local: "São Paulo · SP",
    produto: "Pedras de Borda · 22 peças",
  },
  {
    id: "cascata-escalonada",
    src: img05,
    categoria: "cascatas",
    obra: "Condomínio Fazenda Boa Vista",
    local: "Porto Feliz · SP",
    produto: "Cascata Escalonada Premium",
  },
  {
    id: "piscina-natural",
    src: img09,
    categoria: "piscinas",
    obra: "Retiro na Mata",
    local: "Nazaré Paulista · SP",
    produto: "Cascata + Borda Natural",
  },
  {
    id: "cascata-piscina",
    src: img07,
    categoria: "cascatas",
    obra: "Residência à Beira-Rio",
    local: "Petrópolis · RJ",
    produto: "Cascata Média · 18 peças",
  },
  {
    id: "piscina-paisagismo",
    src: img08,
    categoria: "piscinas",
    obra: "Casa de Praia",
    local: "Ilhabela · SP",
    produto: "Borda + Pedras Decorativas",
  },
  {
    id: "piscina-vista",
    src: img10,
    categoria: "jardins",
    obra: "Cobertura com Deck",
    local: "Rio de Janeiro · RJ",
    produto: "Pedras Pequenas · 40 peças",
  },
];
