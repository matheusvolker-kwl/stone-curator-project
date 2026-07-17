/**
 * Camada de imagem das obras (mantém obras.ts puro/sem imports de asset).
 *
 * ⚠ OBRA_COVER NÃO É COSMÉTICO: ObraPage redireciona pra /obras (a lista) a
 * obra que não tem cover aqui. Sem entrada aqui, a obra existe no dado,
 * aparece como card na lista (que filtra só por OBRAS_BY_SLUG) e o clique
 * devolve o usuário para a lista de onde ele saiu — link morto em produção.
 * Foi o caso do jader-porto-belo até 2026-07.
 */
import showroom from "@/assets/obras/showroom.webp";
import showroom2 from "@/assets/obras/showroom-2.webp";
import tato from "@/assets/obras/tato.webp";
import tato2 from "@/assets/obras/tato-2.webp";
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
// ── Lote 2026-07-17 ─────────────────────────────────────────────────
import sachelli from "@/assets/obras/sachelli.webp";
import tato3 from "@/assets/obras/tato-3.webp";
import modulo15Lago from "@/assets/obras/modulo-15-lago.webp";
import modulo15Lago2 from "@/assets/obras/modulo-15-lago-2.webp";
import modulo15Lago3 from "@/assets/obras/modulo-15-lago-3.webp";

export const OBRA_COVER: Record<string, string> = {
  "showroom-riviera": showroom,
  "casa-de-praia-tato": tato,
  "lago-neymar": neymar,
  tapirai,
  "evandro-mesquita": evandro,
  "unique-garden": unique,
  rosewood,
  "modulo-15": modulo15,
  "modulo-15-lago": modulo15Lago,
  "caito-maia": caito,
  "jader-porto-belo": jader,
  "hanazaki-expo-revestir": hanazaki,
  "faisal-piscina-grega": faisal,
  "enora-jader-almeida": enora,
  "quadriplex-caverna": quadriplex,
  "nigro-praia-suspensa": nigro,
  sachelli,
};

export const OBRA_GALERIA: Record<string, string[]> = {
  "showroom-riviera": [showroom, showroom2],
  // 1ª = a melhor de água/praia (sol estourando, pedra submersa); 2ª = a vista
  // ampla, a que explica o espaço inteiro; 3ª = a casa em uso numa tarde de sol
  // (cascata caindo na piscina ao fundo, entrada de areia, mesa posta na borda);
  // 4ª = o "antes" (a piscina de pastilha). O "antes" fica por último de
  // propósito: é a referência que fecha a sequência, não a que a abre.
  // Mesma obra conferida na imagem: ofurô redondo, entrada de areia, cascata e a
  // estrutura branca envidraçada aparecem nas duas primeiras; na 3ª reaparecem a
  // cascata sobre pedra, o Buda na vegetação, as cadeiras de corda terracota e a
  // almofada bege grande — os mesmos objetos da 2ª, nos mesmos lugares.
  // ⚠ A 3ª tem pessoas identificáveis na casa de um cliente. Entra por
  // autorização explícita do dono em 2026-07-17 ("pode usar a foto do tato").
  // Não é decisão de agente: não republicar nem repropor sem ele.
  "casa-de-praia-tato": [tato, tato2, tato3, tatoAntes],
  "lago-neymar": [neymar, neymar2],
  tapirai: [tapirai, tapiraiReal, tapiraiRender],
  "evandro-mesquita": [evandro, evandroLeveza],
  "unique-garden": [unique],
  rosewood: [rosewood],
  "modulo-15": [modulo15, modulo15Cascata, modulo15Aerea, modulo15Deck],
  // Outra parte do terreno da `modulo-15` (mesma casa, confirmado pelo dono) —
  // por isso galeria própria e não fotos anexadas lá: o quadro não bate.
  // 1ª (capa) = o conjunto: a pedra fazendo a margem, o estar rebaixado dentro
  // d'água, a casa atrás. 2ª = a pedra de perto, serpenteando ao longo da água
  // com a faixa de seixo. 3ª = o estar no nível da água, com a pedra grande na
  // quina. 3 de 11 do lote: as outras 8 têm lona bege de móvel coberto, palmeira
  // desfocada no quadro ou repetem estas. O motivo de cada corte e de cada
  // recusa está em scripts/import-fotos.mjs.
  "modulo-15-lago": [modulo15Lago, modulo15Lago2, modulo15Lago3],
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
  // ⚠ UMA foto de propósito, não por descuido: é a única do material que mostra
  // este jardim. As outras da pasta não puderam ser confirmadas como o mesmo
  // lugar e foram para a galeria do segmento "lagos", sem nome de cliente.
  sachelli: [sachelli],
};
