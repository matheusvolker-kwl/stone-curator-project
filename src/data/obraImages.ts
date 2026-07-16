/**
 * Camada de imagem das obras (mantém obras.ts puro/sem imports de asset).
 * Só entram obras que têm foto real no repo; as demais (Jader, Módulo 15) ficam
 * fora da grade até a foto chegar do Drive.
 */
import showroom from "@/assets/obras/showroom.webp";
import showroom2 from "@/assets/obras/showroom-2.webp";
import tato from "@/assets/obras/tato.webp";
import tatoAntes from "@/assets/obras/tato-antes.webp";
import neymar from "@/assets/obras/neymar.webp";
import neymar2 from "@/assets/obras/neymar-2.webp";
import tapirai from "@/assets/obras/tapirai.webp";
import tapiraiReal from "@/assets/obras/tapirai-real.webp";
import tapiraiRender from "@/assets/obras/tapirai-render.webp";
import evandro from "@/assets/obras/evandro.webp";
import evandroLeveza from "@/assets/obras/evandro-leveza.webp";
import unique from "@/assets/obras/unique.webp";
import rosewood from "@/assets/obras/rosewood.webp";
import modulo15 from "@/assets/obras/modulo-15.webp";
import modulo15Cascata from "@/assets/obras/modulo-15-2.webp";
import modulo15Aerea from "@/assets/obras/modulo-15-3.webp";
import modulo15Deck from "@/assets/obras/modulo-15-4.webp";
import caito from "@/assets/casos-western/caito-maia.webp";

export const OBRA_COVER: Record<string, string> = {
  "showroom-riviera": showroom,
  "casa-de-praia-tato": tato,
  "lago-neymar": neymar,
  tapirai,
  "evandro-mesquita": evandro,
  "unique-garden": unique,
  rosewood,
  "modulo-15": modulo15,
  "caito-maia": caito,
};

export const OBRA_GALERIA: Record<string, string[]> = {
  "showroom-riviera": [showroom, showroom2],
  "casa-de-praia-tato": [tato, tatoAntes],
  "lago-neymar": [neymar, neymar2],
  tapirai: [tapirai, tapiraiReal, tapiraiRender],
  "evandro-mesquita": [evandro, evandroLeveza],
  "unique-garden": [unique],
  rosewood: [rosewood],
  "modulo-15": [modulo15, modulo15Cascata, modulo15Aerea, modulo15Deck],
  "caito-maia": [caito],
};
