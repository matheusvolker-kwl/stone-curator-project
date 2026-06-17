import { useSearchParams } from "react-router-dom";
import type { TipoVisual, Acabamento } from "./types";

const VALID_TIPOS: TipoVisual[] = [
  "piscina",
  "lago",
  "lago-hibrido",
  "jardim-seco",
  "jardim-fonte",
];

function normalizeTipo(raw: string | null): TipoVisual | undefined {
  if (!raw) return undefined;
  // legados
  if (raw === "lago-reduzido") return "lago";
  if (raw === "lago_hibrido") return "lago-hibrido";
  return (VALID_TIPOS as string[]).includes(raw) ? (raw as TipoVisual) : undefined;
}

export interface GuideContext {
  tipoVisual?: TipoVisual;
  area?: number;
  acabamento?: Acabamento;
}

export function useGuideContext(): GuideContext {
  const [params] = useSearchParams();
  const areaStr = params.get("area");
  const acabamento = params.get("acabamento") as Acabamento | null;
  return {
    tipoVisual: normalizeTipo(params.get("tipo")),
    area: areaStr ? Number(areaStr) : undefined,
    acabamento: acabamento ?? undefined,
  };
}

export function buildContextQuery(ctx: GuideContext): string {
  const sp = new URLSearchParams();
  if (ctx.tipoVisual) sp.set("tipo", ctx.tipoVisual);
  if (ctx.area) sp.set("area", String(ctx.area));
  if (ctx.acabamento) sp.set("acabamento", ctx.acabamento);
  return sp.toString();
}
