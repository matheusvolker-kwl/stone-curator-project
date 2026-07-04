import quartzo from "@/assets/western-box/tex-quartzo.webp";
import arenito from "@/assets/western-box/tex-arenito.webp";
import moledo from "@/assets/western-box/tex-moledo.webp";
import granito from "@/assets/western-box/tex-granito.webp";

export const acabamentoTexturas: Record<string, string> = {
  quartzo: quartzo,
  arenito: arenito,
  moledo: moledo,
  granito: granito,
};

export function texturaPara(value: string): string | undefined {
  const key = value.toLowerCase().trim().split(/\s+/)[0];
  return acabamentoTexturas[key];
}
