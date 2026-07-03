import quartzo from "@/assets/western-box/tex-quartzo.webp.asset.json";
import arenito from "@/assets/western-box/tex-arenito.webp.asset.json";
import moledo from "@/assets/western-box/tex-moledo.webp.asset.json";
import granito from "@/assets/western-box/tex-granito.webp.asset.json";

export const acabamentoTexturas: Record<string, string> = {
  quartzo: quartzo.url,
  arenito: arenito.url,
  moledo: moledo.url,
  granito: granito.url,
};

export function texturaPara(value: string): string | undefined {
  const key = value.toLowerCase().trim().split(/\s+/)[0];
  return acabamentoTexturas[key];
}
