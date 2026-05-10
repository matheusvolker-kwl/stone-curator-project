import type { TipoVisual, ProjetoExtra } from "./types";

export interface AutoralItem {
  id: string;
  nome: string;
  codigo: string;
  pesoKg: number;
  preco: number;
  descricao: string;
  dim: string;
}

const CATALOG: AutoralItem[] = [
  { id: "pl", nome: "Pedra LED", codigo: "PL", pesoKg: 12, preco: 890, dim: "32 × 24 × 18 cm", descricao: "Iluminação interna sutil que acende a textura da pedra ao anoitecer. Resistente, IP67, controle remoto." },
  { id: "ps", nome: "Pedra Sonora", codigo: "PS", pesoKg: 18, preco: 1240, dim: "38 × 28 × 22 cm", descricao: "Cavidade interna afinada que acolhe sons do espelho d'água. Projeto acústico autoral Western." },
  { id: "pt", nome: "Pedra Torneira", codigo: "PT", pesoKg: 14, preco: 980, dim: "30 × 22 × 20 cm", descricao: "Pedra usinada para receber torneira oculta. Ideal para chafarizes e jardins com fonte." },
  { id: "ppp", nome: "Pisada Pequena", codigo: "PPP", pesoKg: 8, preco: 240, dim: "28 × 20 × 5 cm", descricao: "Pisada de circulação informal, perfeita para caminhos de jardim e bordas de lago." },
  { id: "ppm", nome: "Pisada Média", codigo: "PPM", pesoKg: 14, preco: 320, dim: "38 × 28 × 5 cm", descricao: "Pisada equilibrada, vence vão maior sem perder o ar artesanal." },
  { id: "ppg", nome: "Pisada Grande", codigo: "PPG", pesoKg: 22, preco: 480, dim: "48 × 36 × 6 cm", descricao: "Pisada generosa, ancora o caminho com presença escultural." },
  { id: "pd", nome: "Pisada Diamante", codigo: "PD", pesoKg: 18, preco: 420, dim: "40 × 40 × 5 cm", descricao: "Geometria autoral em forma de losango. Pisada-assinatura para projetos especiais." },
  { id: "pe", nome: "Pisada Estrela", codigo: "PE", pesoKg: 16, preco: 380, dim: "38 × 38 × 5 cm", descricao: "Recorte estelar artesanal. Marca o ritmo do caminho com pontos de pausa visual." },
  { id: "fc", nome: "Fóssil Crustáceo", codigo: "FC", pesoKg: 10, preco: 720, dim: "26 × 22 × 14 cm", descricao: "Reprodução autoral em composto mineral. Peça de colecionador para jardins secos." },
  { id: "fs", nome: "Fóssil Sambaqui", codigo: "FS", pesoKg: 12, preco: 840, dim: "30 × 24 × 16 cm", descricao: "Inspirado em achados arqueológicos do litoral. Peça narrativa e profundamente brasileira." },
  { id: "pch", nome: "Pedra Champanheira", codigo: "PCH", pesoKg: 22, preco: 1180, dim: "42 × 32 × 28 cm", descricao: "Cavidade térmica que conserva temperatura de garrafas. Para áreas de convívio." },
  { id: "prr", nome: "Painel Bruto Rocha Rústica", codigo: "PRR", pesoKg: 45, preco: 1980, dim: "120 × 80 × 6 cm", descricao: "Painel parietal com textura intensa. Funciona como obra ou revestimento de destaque." },
];

// Catálogo unificado: oferecer SEMPRE LED, Sonora, Torneira, todas as Pisadas e os Fósseis.
const SHARED = ["pl", "ps", "pt", "ppp", "ppm", "ppg", "pd", "pe", "fc", "fs"];

const FILTERS: Record<TipoVisual, string[]> = {
  piscina: SHARED,
  lago: SHARED,
  "jardim-fonte": SHARED,
  "jardim-seco": SHARED,
};

export function getAutoraisFor(tipoVisual: TipoVisual): AutoralItem[] {
  const ids = FILTERS[tipoVisual] ?? [];
  return ids.map((id) => CATALOG.find((c) => c.id === id)).filter((x): x is AutoralItem => !!x);
}

export function autoralToExtra(item: AutoralItem): ProjetoExtra {
  return { id: item.id, nome: item.nome, codigo: item.codigo, preco: item.preco, qty: 1 };
}
