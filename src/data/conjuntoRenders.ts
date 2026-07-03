// Renders reais das composições Western.
// Handle do conjunto → URL do render. Fallback para o placeholder de densidade
// (nivelImage) fica na página quando o handle não estiver mapeado aqui.
import buzios from "@/assets/conjuntos-render/conjunto-piscina-buzios-essencial.webp.asset.json";
import maresias from "@/assets/conjuntos-render/conjunto-piscina-maresias-equilibrado.webp.asset.json";
import pipa from "@/assets/conjuntos-render/conjunto-piscina-pipa-completo.webp.asset.json";
import caio from "@/assets/conjuntos-render/conjunto-piscina-caio-essencial.webp.asset.json";
import itacare from "@/assets/conjuntos-render/conjunto-piscina-itacare-equilibrado.webp.asset.json";
import trancoso from "@/assets/conjuntos-render/conjunto-piscina-trancoso-completo.webp.asset.json";
import maragogi from "@/assets/conjuntos-render/conjunto-piscina-maragogi-essencial.webp.asset.json";
import jericoacoara from "@/assets/conjuntos-render/conjunto-piscina-jericoacoara-equilibrado.webp.asset.json";
import noronha from "@/assets/conjuntos-render/conjunto-piscina-noronha-completo.webp.asset.json";
import abaete from "@/assets/conjuntos-render/conjunto-lago-abaete-essencial.webp.asset.json";
import juparana from "@/assets/conjuntos-render/conjunto-lago-juparana-equilibrado.webp.asset.json";
import cabiunas from "@/assets/conjuntos-render/conjunto-lago-cabiunas-completo.webp.asset.json";
import saquarema from "@/assets/conjuntos-render/conjunto-lago-saquarema-essencial.webp.asset.json";

export const conjuntoRenders: Record<string, string> = {
  "conjunto-piscina-buzios-essencial": buzios.url,
  "conjunto-piscina-maresias-equilibrado": maresias.url,
  "conjunto-piscina-pipa-completo": pipa.url,
  "conjunto-piscina-caio-essencial": caio.url,
  "conjunto-piscina-itacare-equilibrado": itacare.url,
  "conjunto-piscina-trancoso-completo": trancoso.url,
  "conjunto-piscina-maragogi-essencial": maragogi.url,
  "conjunto-piscina-jericoacoara-equilibrado": jericoacoara.url,
  "conjunto-piscina-noronha-completo": noronha.url,
  "conjunto-lago-abaete-essencial": abaete.url,
  "conjunto-lago-juparana-equilibrado": juparana.url,
  "conjunto-lago-cabiunas-completo": cabiunas.url,
  "conjunto-lago-saquarema-essencial": saquarema.url,
};
