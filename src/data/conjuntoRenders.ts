// Renders reais das composições Western. Piloto: só o set piscina/médio.
// Handle do conjunto → URL do render. Fallback para o placeholder de densidade
// (nivelImage) fica na página quando o handle não estiver mapeado aqui.
import buzios from "@/assets/conjuntos-render/conjunto-piscina-buzios-essencial.webp.asset.json";
import maresias from "@/assets/conjuntos-render/conjunto-piscina-maresias-equilibrado.webp.asset.json";
import pipa from "@/assets/conjuntos-render/conjunto-piscina-pipa-completo.webp.asset.json";

export const conjuntoRenders: Record<string, string> = {
  "conjunto-piscina-buzios-essencial": buzios.url,
  "conjunto-piscina-maresias-equilibrado": maresias.url,
  "conjunto-piscina-pipa-completo": pipa.url,
};
