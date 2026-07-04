// Renders reais das composições Western.
// Handle do conjunto → URL do render. Fallback para o placeholder de densidade
// (nivelImage) fica na página quando o handle não estiver mapeado aqui.
import buzios from "@/assets/conjuntos-render/conjunto-piscina-buzios-essencial.webp";
import maresias from "@/assets/conjuntos-render/conjunto-piscina-maresias-equilibrado.webp";
import pipa from "@/assets/conjuntos-render/conjunto-piscina-pipa-completo.webp";
import caio from "@/assets/conjuntos-render/conjunto-piscina-caio-essencial.webp";
import itacare from "@/assets/conjuntos-render/conjunto-piscina-itacare-equilibrado.webp";
import trancoso from "@/assets/conjuntos-render/conjunto-piscina-trancoso-completo.webp";
import maragogi from "@/assets/conjuntos-render/conjunto-piscina-maragogi-essencial.webp";
import jericoacoara from "@/assets/conjuntos-render/conjunto-piscina-jericoacoara-equilibrado.webp";
import noronha from "@/assets/conjuntos-render/conjunto-piscina-noronha-completo.webp";
import abaete from "@/assets/conjuntos-render/conjunto-lago-abaete-essencial.webp";
import juparana from "@/assets/conjuntos-render/conjunto-lago-juparana-equilibrado.webp";
import cabiunas from "@/assets/conjuntos-render/conjunto-lago-cabiunas-completo.webp";
import saquarema from "@/assets/conjuntos-render/conjunto-lago-saquarema-essencial.webp";
import araruama from "@/assets/conjuntos-render/conjunto-lago-araruama-equilibrado.webp";
import mundau from "@/assets/conjuntos-render/conjunto-lago-mundau-completo.webp";
import manguaba from "@/assets/conjuntos-render/conjunto-lago-manguaba-essencial.webp";
import marau from "@/assets/conjuntos-render/conjunto-lago-marau-equilibrado.webp";
import amazonas from "@/assets/conjuntos-render/conjunto-lago-amazonas-completo.webp";
import vereda from "@/assets/conjuntos-render/conjunto-lago-hibrido-vereda-essencial.webp";
import igarape from "@/assets/conjuntos-render/conjunto-lago-hibrido-igarape-equilibrado.webp";
import pororoca from "@/assets/conjuntos-render/conjunto-lago-hibrido-pororoca-completo.webp";
import apicum from "@/assets/conjuntos-render/conjunto-lago-hibrido-apicum-equilibrado.webp";
import sambaqui from "@/assets/conjuntos-render/conjunto-lago-hibrido-sambaqui-completo.webp";
import ipueira from "@/assets/conjuntos-render/conjunto-lago-hibrido-ipueira-essencial.webp";
import marajo from "@/assets/conjuntos-render/conjunto-lago-hibrido-marajo-equilibrado.webp";
import pantanal from "@/assets/conjuntos-render/conjunto-lago-hibrido-pantanal-completo.webp";
import carcara from "@/assets/conjuntos-render/conjunto-jardim-seco-carcara-essencial.webp";
import ibitipoca from "@/assets/conjuntos-render/conjunto-jardim-seco-ibitipoca-equilibrado.webp";
import itacolomi from "@/assets/conjuntos-render/conjunto-jardim-seco-itacolomi-completo.webp";
import cipo from "@/assets/conjuntos-render/conjunto-jardim-seco-cipo-essencial.webp";
import canastra from "@/assets/conjuntos-render/conjunto-jardim-seco-canastra-equilibrado.webp";
import itatiaia from "@/assets/conjuntos-render/conjunto-jardim-seco-itatiaia-completo.webp";
import araripe from "@/assets/conjuntos-render/conjunto-jardim-seco-araripe-essencial.webp";
import guimaraes from "@/assets/conjuntos-render/conjunto-jardim-seco-guimaraes-equilibrado.webp";
import diamantina from "@/assets/conjuntos-render/conjunto-jardim-seco-diamantina-completo.webp";
import esmeralda from "@/assets/conjuntos-render/conjunto-jardim-fonte-esmeralda-essencial.webp";
import pratinha from "@/assets/conjuntos-render/conjunto-jardim-fonte-pratinha-equilibrado.webp";
import bonito from "@/assets/conjuntos-render/conjunto-jardim-fonte-bonito-completo.webp";
import aurora from "@/assets/conjuntos-render/conjunto-jardim-fonte-aurora-essencial.webp";
import andorinhas from "@/assets/conjuntos-render/conjunto-jardim-fonte-andorinhas-equilibrado.webp";
import veu from "@/assets/conjuntos-render/conjunto-jardim-fonte-veu-completo.webp";
import tabocas from "@/assets/conjuntos-render/conjunto-jardim-fonte-tabocas-essencial.webp";
import iguacu from "@/assets/conjuntos-render/conjunto-jardim-fonte-iguacu-equilibrado.webp";
import itambe from "@/assets/conjuntos-render/conjunto-jardim-fonte-itambe-completo.webp";


export const conjuntoRenders: Record<string, string> = {
  "conjunto-piscina-buzios-essencial": buzios,
  "conjunto-piscina-maresias-equilibrado": maresias,
  "conjunto-piscina-pipa-completo": pipa,
  "conjunto-piscina-caio-essencial": caio,
  "conjunto-piscina-itacare-equilibrado": itacare,
  "conjunto-piscina-trancoso-completo": trancoso,
  "conjunto-piscina-maragogi-essencial": maragogi,
  "conjunto-piscina-jericoacoara-equilibrado": jericoacoara,
  "conjunto-piscina-noronha-completo": noronha,
  "conjunto-lago-abaete-essencial": abaete,
  "conjunto-lago-juparana-equilibrado": juparana,
  "conjunto-lago-cabiunas-completo": cabiunas,
  "conjunto-lago-saquarema-essencial": saquarema,
  "conjunto-lago-araruama-equilibrado": araruama,
  "conjunto-lago-mundau-completo": mundau,
  "conjunto-lago-manguaba-essencial": manguaba,
  "conjunto-lago-marau-equilibrado": marau,
  "conjunto-lago-amazonas-completo": amazonas,
  "conjunto-lago-hibrido-vereda-essencial": vereda,
  "conjunto-lago-hibrido-igarape-equilibrado": igarape,
  "conjunto-lago-hibrido-pororoca-completo": pororoca,
  "conjunto-lago-hibrido-apicum-equilibrado": apicum,
  "conjunto-lago-hibrido-sambaqui-completo": sambaqui,
  "conjunto-lago-hibrido-ipueira-essencial": ipueira,
  "conjunto-lago-hibrido-marajo-equilibrado": marajo,
  "conjunto-lago-hibrido-pantanal-completo": pantanal,
  "conjunto-jardim-seco-carcara-essencial": carcara,
  "conjunto-jardim-seco-ibitipoca-equilibrado": ibitipoca,
  "conjunto-jardim-seco-itacolomi-completo": itacolomi,
  "conjunto-jardim-seco-cipo-essencial": cipo,
  "conjunto-jardim-seco-canastra-equilibrado": canastra,
  "conjunto-jardim-seco-itatiaia-completo": itatiaia,
  "conjunto-jardim-seco-araripe-essencial": araripe,
  "conjunto-jardim-seco-guimaraes-equilibrado": guimaraes,
  "conjunto-jardim-seco-diamantina-completo": diamantina,
  "conjunto-jardim-fonte-esmeralda-essencial": esmeralda,
  "conjunto-jardim-fonte-pratinha-equilibrado": pratinha,
  "conjunto-jardim-fonte-bonito-completo": bonito,
  "conjunto-jardim-fonte-aurora-essencial": aurora,
  "conjunto-jardim-fonte-andorinhas-equilibrado": andorinhas,
  "conjunto-jardim-fonte-veu-completo": veu,
  "conjunto-jardim-fonte-tabocas-essencial": tabocas,
  "conjunto-jardim-fonte-iguacu-equilibrado": iguacu,
  "conjunto-jardim-fonte-itambe-completo": itambe,
};
