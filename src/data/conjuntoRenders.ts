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
import araruama from "@/assets/conjuntos-render/conjunto-lago-araruama-equilibrado.webp.asset.json";
import mundau from "@/assets/conjuntos-render/conjunto-lago-mundau-completo.webp.asset.json";
import manguaba from "@/assets/conjuntos-render/conjunto-lago-manguaba-essencial.webp.asset.json";
import marau from "@/assets/conjuntos-render/conjunto-lago-marau-equilibrado.webp.asset.json";
import amazonas from "@/assets/conjuntos-render/conjunto-lago-amazonas-completo.webp.asset.json";
import vereda from "@/assets/conjuntos-render/conjunto-lago-hibrido-vereda-essencial.webp.asset.json";
import igarape from "@/assets/conjuntos-render/conjunto-lago-hibrido-igarape-equilibrado.webp.asset.json";
import pororoca from "@/assets/conjuntos-render/conjunto-lago-hibrido-pororoca-completo.webp.asset.json";
import apicum from "@/assets/conjuntos-render/conjunto-lago-hibrido-apicum-equilibrado.webp.asset.json";
import sambaqui from "@/assets/conjuntos-render/conjunto-lago-hibrido-sambaqui-completo.webp.asset.json";
import ipueira from "@/assets/conjuntos-render/conjunto-lago-hibrido-ipueira-essencial.webp.asset.json";
import marajo from "@/assets/conjuntos-render/conjunto-lago-hibrido-marajo-equilibrado.webp.asset.json";
import pantanal from "@/assets/conjuntos-render/conjunto-lago-hibrido-pantanal-completo.webp.asset.json";
import carcara from "@/assets/conjuntos-render/conjunto-jardim-seco-carcara-essencial.webp.asset.json";
import ibitipoca from "@/assets/conjuntos-render/conjunto-jardim-seco-ibitipoca-equilibrado.webp.asset.json";
import itacolomi from "@/assets/conjuntos-render/conjunto-jardim-seco-itacolomi-completo.webp.asset.json";
import cipo from "@/assets/conjuntos-render/conjunto-jardim-seco-cipo-essencial.webp.asset.json";
import canastra from "@/assets/conjuntos-render/conjunto-jardim-seco-canastra-equilibrado.webp.asset.json";
import itatiaia from "@/assets/conjuntos-render/conjunto-jardim-seco-itatiaia-completo.webp.asset.json";
import araripe from "@/assets/conjuntos-render/conjunto-jardim-seco-araripe-essencial.webp.asset.json";
import guimaraes from "@/assets/conjuntos-render/conjunto-jardim-seco-guimaraes-equilibrado.webp.asset.json";
import diamantina from "@/assets/conjuntos-render/conjunto-jardim-seco-diamantina-completo.webp.asset.json";
import esmeralda from "@/assets/conjuntos-render/conjunto-jardim-fonte-esmeralda-essencial.webp.asset.json";
import pratinha from "@/assets/conjuntos-render/conjunto-jardim-fonte-pratinha-equilibrado.webp.asset.json";
import bonito from "@/assets/conjuntos-render/conjunto-jardim-fonte-bonito-completo.webp.asset.json";
import aurora from "@/assets/conjuntos-render/conjunto-jardim-fonte-aurora-essencial.webp.asset.json";
import andorinhas from "@/assets/conjuntos-render/conjunto-jardim-fonte-andorinhas-equilibrado.webp.asset.json";
import veu from "@/assets/conjuntos-render/conjunto-jardim-fonte-veu-completo.webp.asset.json";
import tabocas from "@/assets/conjuntos-render/conjunto-jardim-fonte-tabocas-essencial.webp.asset.json";
import iguacu from "@/assets/conjuntos-render/conjunto-jardim-fonte-iguacu-equilibrado.webp.asset.json";


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
  "conjunto-lago-araruama-equilibrado": araruama.url,
  "conjunto-lago-mundau-completo": mundau.url,
  "conjunto-lago-manguaba-essencial": manguaba.url,
  "conjunto-lago-marau-equilibrado": marau.url,
  "conjunto-lago-amazonas-completo": amazonas.url,
  "conjunto-lago-hibrido-vereda-essencial": vereda.url,
  "conjunto-lago-hibrido-igarape-equilibrado": igarape.url,
  "conjunto-lago-hibrido-pororoca-completo": pororoca.url,
  "conjunto-lago-hibrido-apicum-equilibrado": apicum.url,
  "conjunto-lago-hibrido-sambaqui-completo": sambaqui.url,
  "conjunto-lago-hibrido-ipueira-essencial": ipueira.url,
  "conjunto-lago-hibrido-marajo-equilibrado": marajo.url,
  "conjunto-lago-hibrido-pantanal-completo": pantanal.url,
  "conjunto-jardim-seco-carcara-essencial": carcara.url,
  "conjunto-jardim-seco-ibitipoca-equilibrado": ibitipoca.url,
  "conjunto-jardim-seco-itacolomi-completo": itacolomi.url,
  "conjunto-jardim-seco-cipo-essencial": cipo.url,
  "conjunto-jardim-seco-canastra-equilibrado": canastra.url,
  "conjunto-jardim-seco-itatiaia-completo": itatiaia.url,
  "conjunto-jardim-seco-araripe-essencial": araripe.url,
  "conjunto-jardim-seco-guimaraes-equilibrado": guimaraes.url,
  "conjunto-jardim-seco-diamantina-completo": diamantina.url,
  "conjunto-jardim-fonte-esmeralda-essencial": esmeralda.url,
  "conjunto-jardim-fonte-pratinha-equilibrado": pratinha.url,
  "conjunto-jardim-fonte-bonito-completo": bonito.url,
  "conjunto-jardim-fonte-aurora-essencial": aurora.url,
  "conjunto-jardim-fonte-andorinhas-equilibrado": andorinhas.url,
  "conjunto-jardim-fonte-veu-completo": veu.url,
  "conjunto-jardim-fonte-tabocas-essencial": tabocas.url,
  "conjunto-jardim-fonte-iguacu-equilibrado": iguacu.url,
};
