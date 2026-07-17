/**
 * Camada de imagem das obras (mantém obras.ts puro/sem imports de asset).
 *
 * ⚠ OBRA_COVER NÃO É COSMÉTICO: ObraPage.tsx:31 redireciona a obra que não tem
 * cover aqui, e /obras cai em /inspiracoes. Sem entrada aqui, a obra existe no
 * dado, aparece como card em /inspiracoes (que filtra só por OBRAS_BY_SLUG) e
 * o clique devolve o usuário para a lista — link morto em produção. Foi o caso
 * do jader-porto-belo até 2026-07.
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
// ── Acervo 2026-07 ──────────────────────────────────────────────────
import jader from "@/assets/obras/jader-porto-belo.webp";
import jader2 from "@/assets/obras/jader-porto-belo-2.webp";
import hanazaki from "@/assets/obras/hanazaki-expo.webp";
import hanazakiDesenho from "@/assets/obras/hanazaki-expo-2.webp";
import hanazakiMontagem from "@/assets/obras/hanazaki-expo-3.webp";
import faisal from "@/assets/obras/faisal-grega.webp";
import faisal2 from "@/assets/obras/faisal-grega-2.webp";
import enora from "@/assets/obras/enora.webp";
import enora2 from "@/assets/obras/enora-2.webp";
import quadriplex from "@/assets/obras/quadriplex.webp";
import quadriplex2 from "@/assets/obras/quadriplex-2.webp";
import quadriplexRender from "@/assets/obras/quadriplex-3.webp";
import nigro from "@/assets/obras/nigro.webp";
import nigro2 from "@/assets/obras/nigro-2.webp";
import nigro3 from "@/assets/obras/nigro-3.webp";

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
  "jader-porto-belo": jader,
  "hanazaki-expo-revestir": hanazaki,
  "faisal-piscina-grega": faisal,
  "enora-jader-almeida": enora,
  "quadriplex-caverna": quadriplex,
  "nigro-praia-suspensa": nigro,
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
  "jader-porto-belo": [jader, jader2],
  // 2ª = o desenho à mão do estande; 3ª = a montagem (Hanazaki com as pedras).
  "hanazaki-expo-revestir": [hanazaki, hanazakiDesenho, hanazakiMontagem],
  "faisal-piscina-grega": [faisal, faisal2],
  "enora-jader-almeida": [enora, enora2],
  // ⚠ A 3ª do quadriplex é RENDER de projeto, não fotografia — está creditado
  // como tal em obras.ts. Render nunca é apresentado como foto.
  "quadriplex-caverna": [quadriplex, quadriplex2, quadriplexRender],
  "nigro-praia-suspensa": [nigro, nigro2, nigro3],
};
