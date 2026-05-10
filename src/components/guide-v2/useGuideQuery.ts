import { useSearchParams } from "react-router-dom";
import type { TipoVisual, Acabamento } from "./types";

export interface GuideContext {
  tipoVisual?: TipoVisual;
  area?: number;
  acabamento?: Acabamento;
}

export function useGuideContext(): GuideContext {
  const [params] = useSearchParams();
  const tipo = params.get("tipo") as TipoVisual | null;
  const areaStr = params.get("area");
  const acabamento = params.get("acabamento") as Acabamento | null;
  return {
    tipoVisual: tipo ?? undefined,
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
