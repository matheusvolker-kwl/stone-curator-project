import type { TipoVisual, ProjetoExtra } from "./types";

export interface AutoralItem {
  id: string;
  nome: string;
  codigo: string;
  pesoKg: number;
  preco: number;
}

const CATALOG: AutoralItem[] = [
  { id: "pl", nome: "Pedra LED", codigo: "PL", pesoKg: 12, preco: 890 },
  { id: "pch", nome: "Pedra Champanheira", codigo: "PCH", pesoKg: 22, preco: 1180 },
  { id: "pt", nome: "Pedra Torneira", codigo: "PT", pesoKg: 14, preco: 980 },
  { id: "ps", nome: "Pedra Sonora", codigo: "PS", pesoKg: 18, preco: 1240 },
  { id: "ppp", nome: "Pisada Pequena", codigo: "PPP", pesoKg: 8, preco: 240 },
  { id: "ppm", nome: "Pisada Média", codigo: "PPM", pesoKg: 14, preco: 320 },
  { id: "ppg", nome: "Pisada Grande", codigo: "PPG", pesoKg: 22, preco: 480 },
  { id: "pd", nome: "Pisada Diamante", codigo: "PD", pesoKg: 18, preco: 420 },
  { id: "pe", nome: "Pisada Estrela", codigo: "PE", pesoKg: 16, preco: 380 },
  { id: "fc", nome: "Fóssil Crustáceo", codigo: "FC", pesoKg: 10, preco: 720 },
  { id: "fs", nome: "Fóssil Sambaqui", codigo: "FS", pesoKg: 12, preco: 840 },
  { id: "prr", nome: "Painel Bruto Rocha Rústica", codigo: "PRR", pesoKg: 45, preco: 1980 },
];

const FILTERS: Record<TipoVisual, string[]> = {
  lago: ["pl", "ps", "pch"],
  "lago-reduzido": ["pl", "ps", "pch"],
  piscina: ["pl", "ps", "pch", "pt"],
  "jardim-fonte": ["pl", "pch", "pt", "ppm", "ppg"],
  "jardim-seco": ["ppp", "ppm", "ppg", "pd", "pe", "fc", "fs", "prr", "pl"],
};

export function getAutoraisFor(tipoVisual: TipoVisual): AutoralItem[] {
  const ids = FILTERS[tipoVisual] ?? [];
  return ids.map((id) => CATALOG.find((c) => c.id === id)).filter((x): x is AutoralItem => !!x);
}

export function autoralToExtra(item: AutoralItem): ProjetoExtra {
  return { id: item.id, nome: item.nome, codigo: item.codigo, preco: item.preco, qty: 1 };
}
