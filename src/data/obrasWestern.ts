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
  obra: string; // nome da residÃªncia/obra (placeholder)
  local: string; // cidade/UF (placeholder)
  produto: string; // produto/quantidade Western usada (placeholder)
  destaque?: boolean;
}

export const OBRAS_WESTERN: ObraWestern[] = [
  {
    id: "tapirai",
    src: img01,
    categoria: "cascatas",
    obra: "ResidÃªncia Serra da Cantareira",
    local: "TapiraÃ­ Â· SP",
    produto: "Cascata Grande Â· 42 peÃ§as",
    destaque: true,
  },
  {
    id: "piscina-cascata",
    src: img03,
    categoria: "piscinas",
    obra: "Casa de Campo",
    local: "Atibaia Â· SP",
    produto: "Cascata MÃ©dia + Borda 30cm",
  },
  {
    id: "pedra-detalhe",
    src: img02,
    categoria: "jardins",
    obra: "Jardim ContemporÃ¢neo",
    local: "SÃ£o Paulo Â· SP",
    produto: "Pedras Grandes Â· 18 peÃ§as",
  },
  {
    id: "cascata-ferns",
    src: img11,
    categoria: "cascatas",
    obra: "ResidÃªncia Tropical",
    local: "Ubatuba Â· SP",
    produto: "Cascata Escalonada Â· 26 peÃ§as",
  },
  {
    id: "cascata-serra",
    src: img06,
    categoria: "cascatas",
    obra: "SÃ­tio Vista da Serra",
    local: "Campos do JordÃ£o Â· SP",
    produto: "Cascata Grande + Pedras MÃ©dias",
  },
  {
    id: "piscina-mirante",
    src: img04,
    categoria: "piscinas",
    obra: "Casa Mirante",
    local: "Itu Â· SP",
    produto: "Borda 40cm Â· 34m lineares",
  },
  {
    id: "borda-pedra",
    src: img12,
    categoria: "jardins",
    obra: "ResidÃªncia Alto de Pinheiros",
    local: "SÃ£o Paulo Â· SP",
    produto: "Pedras de Borda Â· 22 peÃ§as",
  },
  {
    id: "cascata-escalonada",
    src: img05,
    categoria: "cascatas",
    obra: "CondomÃ­nio Fazenda Boa Vista",
    local: "Porto Feliz Â· SP",
    produto: "Cascata Escalonada Premium",
  },
  {
    id: "piscina-natural",
    src: img09,
    categoria: "piscinas",
    obra: "Retiro na Mata",
    local: "NazarÃ© Paulista Â· SP",
    produto: "Cascata + Borda Natural",
  },
  {
    id: "cascata-piscina",
    src: img07,
    categoria: "cascatas",
    obra: "ResidÃªncia Ã  Beira-Rio",
    local: "PetrÃ³polis Â· RJ",
    produto: "Cascata MÃ©dia Â· 18 peÃ§as",
  },
  {
    id: "piscina-paisagismo",
    src: img08,
    categoria: "piscinas",
    obra: "Casa de Praia",
    local: "Ilhabela Â· SP",
    produto: "Borda + Pedras Decorativas",
  },
  {
    id: "piscina-vista",
    src: img10,
    categoria: "jardins",
    obra: "Cobertura com Deck",
    local: "Rio de Janeiro Â· RJ",
    produto: "Pedras Pequenas Â· 40 peÃ§as",
  },
];
