/**
 * Importa e otimiza fotos reais das obras (fonte: pastas de acervo no Drive) para
 * src/assets, gerando webp enxuto (largura por uso, EXIF strip). Os originais de
 * 10–28 MB ficam FORA do repo; só os webp derivados entram no bundle.
 *
 * Rodar: node scripts/import-fotos.mjs
 * Idempotente — sobrescreve os destinos.
 */
import sharp from "sharp";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { mkdir } from "node:fs/promises";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SRC_ROOT = "K:/CONTEUDOS-20260716T042137Z-1-001/CONTEUDOS";
/**
 * 2º acervo (2026-07). É raiz IRMÃ de SRC_ROOT, não aninhada — por isso a tupla
 * ganhou campos opcionais em vez de virar um 2º script: o valor destes arquivos é
 * ter UM lugar só com a lista de fotos do site.
 */
const EXTRA = "K:/Conteudos extra";
const OUT_ROOT = join(__dirname, "..", "src", "assets");

// Pasta de nome longo do acervo novo, usada muitas vezes.
const REAL = `${EXTRA}/fotos que provam realismo da pedra. ambientadas, submersas, etc`;

/**
 * Job = { dest, src, width, root?, crop? }
 *   root  — raiz da origem (default SRC_ROOT).
 *   crop  — { left, top, width, height } em px do ORIGINAL, aplicado ANTES do resize.
 *
 * ⚠ Todo crop aqui foi decidido OLHANDO a foto, nunca por régua. O motivo de cada
 * um está no comentário: é sujeira de fundo REAL (caixilho de janela, cesta de
 * basquete, poste) que resize cego não remove.
 *
 * ⚠ withoutEnlargement:true em todos — vários originais deste acervo são pequenos
 * (800px, 520px) e upscale mata justamente a credibilidade que a foto carrega.
 */
const JOBS = [
  // ── Capas de obra (acervo 1) ─────────────────────────────────────
  { dest: "obras/showroom.webp",       src: "PROJETOS INSPIRAÇÃO/showroom/IMG_8781.JPEG", width: 1400 },
  { dest: "obras/showroom-2.webp",     src: "PROJETOS INSPIRAÇÃO/showroom/IMG_8775.JPEG", width: 1200 },
  { dest: "obras/tato.webp",           src: "PROJETOS INSPIRAÇÃO/tato/PISCINA DEPOIS.jpg", width: 1400 },
  { dest: "obras/tato-antes.webp",     src: "PROJETOS INSPIRAÇÃO/tato/ANTES TATO.jpg", width: 1200 },
  { dest: "obras/neymar.webp",         src: "PROJETOS INSPIRAÇÃO/Neymar/IMG_3607.JPEG", width: 1400 },
  { dest: "obras/neymar-2.webp",       src: "PROJETOS INSPIRAÇÃO/Neymar/IMG_3385.JPEG", width: 1200 },
  { dest: "obras/tapirai.webp",        src: "PROJETOS INSPIRAÇÃO/tapirai/Cópia de Tapirai-23.jpg", width: 1600 },
  { dest: "obras/tapirai-render.webp", src: "PROJETOS INSPIRAÇÃO/tapirai/Cópia de AILLEN_RENDER_R01_06.png", width: 1200 },
  { dest: "obras/tapirai-real.webp",   src: "PROJETOS INSPIRAÇÃO/tapirai/Cópia de Tapirai-3.jpg", width: 1200 },
  { dest: "obras/evandro.webp",        src: "PROJETOS INSPIRAÇÃO/Evandro Mesquita/WhatsApp Image 2023-12-24 at 09.07.30.jpeg", width: 1200 },
  { dest: "obras/evandro-leveza.webp", src: "PROJETOS INSPIRAÇÃO/Evandro Mesquita/WhatsApp Image 2023-12-24 at 09.07.31.jpeg", width: 1000 },
  { dest: "obras/unique.webp",         src: "ESPECIAIS/unique garden/04. FOTOS/Cópia de WhatsApp Image 2026-03-25 at 13.50.15 (3).jpeg", width: 1400 },
  { dest: "obras/rosewood.webp",       src: "ESPECIAIS/hotel rosewood/Fotos-11.jpg", width: 1400 },
  { dest: "obras/modulo-15.webp",   src: "PROJETOS INSPIRAÇÃO/Modulo 15/Fotos/DSC08466-HDR.jpg", width: 1500 },
  { dest: "obras/modulo-15-2.webp", src: "PROJETOS INSPIRAÇÃO/Modulo 15/Fotos/DSC08288-HDR.jpg", width: 1200 },
  { dest: "obras/modulo-15-3.webp", src: "PROJETOS INSPIRAÇÃO/Modulo 15/Fotos/dji_fly_20250820_104108_0007_1755696916937_aeb-HDR.jpg", width: 1200 },
  { dest: "obras/modulo-15-4.webp", src: "PROJETOS INSPIRAÇÃO/Modulo 15/Fotos/DSC08273-HDR.jpg", width: 1200 },
  // ── Linguagens (galerias / heróis) ───────────────────────────────
  { dest: "linguagens/piscina.webp",       src: "Piscinas/Western Pools - Embu das Artes-28.JPG", width: 1600 },
  { dest: "linguagens/piscina-praia.webp", src: "Piscinas/Cópia de DSC08268-HDR.jpg", width: 1100 },
  { dest: "linguagens/lago.webp",          src: "Lagos/DSC08706-HDR.jpg", width: 1200 },
  { dest: "linguagens/jardim.webp",        src: "Jardins/DSC07163-HDR.jpg", width: 1200 },
  { dest: "linguagens/revestimento.webp",  src: "revestimentos/balcão pedra japones 3.jpg", width: 1600 },
  { dest: "linguagens/viveiro.webp",       src: "Viveiros/Projeto-HG-Avare-3.jpg", width: 1200 },
  // ── Herói próprio da página B2C (evita repetir home/sobre) ───────
  { dest: "para-sua-casa/hero.webp",       src: "Piscinas/Western Pools - Embu das Artes-18.JPG", width: 1800 },

  // ═══════════════════════════════════════════════════════════════════════
  // /a-pedra — acervo 2026-07. 13 fotografias reais.
  // ═══════════════════════════════════════════════════════════════════════

  // S0 HERO — a melhor foto do acervo (4000×6000). A composição é uma FAIXA
  // horizontal (a linha d'água), então o corte 16:9 do desktop melhora o quadro;
  // o mobile usa 9:16 quase nativo (3375/6000 já é 9:16 exato).
  {
    dest: "a-pedra/hero-linha-dagua.webp", src: `${REAL}/Cópia de Fotos-8 (3).jpg`,
    root: "", width: 2400,
    crop: { left: 0, top: 2400, width: 4000, height: 2250 }, // banda com o matacão de proa + seixos sob a água
  },
  {
    dest: "a-pedra/hero-linha-dagua-mob.webp", src: `${REAL}/Cópia de Fotos-8 (3).jpg`,
    root: "", width: 1200,
    crop: { left: 350, top: 0, width: 3375, height: 6000 }, // 9:16 exato
  },

  // S1 ORIGEM — macro estratificada. 2:3 nativo, sem corte: é a foto que se
  // oferece ao escrutínio, cortar seria tirar o que ela veio provar.
  { dest: "a-pedra/molde-macro.webp", src: `${REAL}/Cópia de Fotos-36.jpg`, root: "", width: 1100 },

  // S2 O NÚMERO — dois homens tirando um matacão de uma van, sem guindaste. 3:4 nativo.
  { dest: "a-pedra/descarga-van.webp", src: `${EXTRA}/Peso/7-2 Instalação facilitada.JPEG`, root: "", width: 1100 },

  // S3 CLÍMAX — o snapshot das duas mulheres. 960×1280 é o TETO honesto do arquivo.
  // Não retocar, não recortar o pé descalço: o valor dela é NÃO ser publicidade.
  { dest: "a-pedra/leveza-duas-pessoas.webp", src: `${EXTRA}/Peso/7.1 Leveza estrutural.jpg`, root: "", width: 960 },
  // A casca inclinada em obra (cavidade inteira à mostra). 3:4 nativo.
  { dest: "a-pedra/casca-inclinada.webp", src: `${EXTRA}/Pedra Oca/9-24 Piscina suspensa - Nigro - Projeto Genesis.jpg`, root: "", width: 1100 },
  // A forense de 2009: registro de gás + mangueiras + caixa elétrica DENTRO da casca.
  // 800×600 nativo, exibida ≤420px. Documento grande vira publicidade.
  { dest: "a-pedra/oco-gas-2009.webp", src: `${EXTRA}/Funcional/WhatsApp Image 2026-07-16 at 23.26.30.jpeg`, root: "", width: 800 },

  // S4 ENDEREÇOS — todos 4:5.
  {
    dest: "a-pedra/end-quadriplex.webp", src: `${EXTRA}/Quadriplex Caverna/9-18 Quadriplex - Projeto Dama Arquitetura.JPEG`,
    root: "", width: 1200,
    crop: { left: 0, top: 0, width: 1536, height: 1920 }, // corta o carpete morto do rodapé
  },
  {
    dest: "a-pedra/end-laje.webp", src: `${EXTRA}/Thiago Nigro/WhatsApp Image 2026-07-16 at 23.01.56 (4).jpeg`,
    root: "", width: 840,
    // Foi tirada ATRAVÉS de uma janela: caixilho preto à esquerda e no rodapé,
    // reflexos à direita. Este corte tira os três e mantém a praia sobre a laje
    // em balanço com o vale atrás — que é o argumento inteiro da foto.
    crop: { left: 435, top: 30, width: 816, height: 1020 },
  },
  {
    dest: "a-pedra/end-submersa.webp", src: `${EXTRA}/Pedra pode ser submersa/WhatsApp Image 2026-07-16 at 23.26.31 (2).jpeg`,
    root: "", width: 960,
    crop: { left: 320, top: 0, width: 960, height: 1200 },
  },
  {
    dest: "a-pedra/end-enora.webp", src: `${EXTRA}/Jader Almeida - Enora SP Base Maquete/9-5 Enora - São Paulo-SP - Jader Almeida.jpg`,
    root: "", width: 900,
    crop: { left: 0, top: 40, width: 960, height: 1200 },
  },

  // S5 O PAR — render ↔ obra construída, MESMO enquadramento.
  // ⚠ Troquei o par do plano (9-17/9-18) por 9-19/9-20 depois de OLHAR os quatro:
  // 9-19 e 9-20 compartilham câmera e mobiliário (espelho arqueado dourado +
  // biombo de vareta dourada + paredão à direita + painel ripado). 9-17 é plano
  // aberto e 9-18 é close — lado a lado, aquele par lê MISMATCH, que é exatamente
  // o defeito que APedra documentou no par tapirai e recusou por escrito.
  {
    dest: "a-pedra/quadriplex-3d.webp", src: `${EXTRA}/Quadriplex Caverna/9-19 Quadriplex - Projeto Dama Arquitetura.jpg`,
    root: "", width: 1100,
    crop: { left: 330, top: 0, width: 960, height: 1280 }, // 3:4 fechando no espelho + biombo + paredão
  },
  { dest: "a-pedra/quadriplex-obra.webp", src: `${EXTRA}/Quadriplex Caverna/9-20 Quadriplex - Projeto Dama Arquitetura.jpg`, root: "", width: 1100 },

  // S6 RESISTÊNCIA — Ricardo em pé no lábio da cascata (3375×6000).
  // A mensagem É a relação vertical (homem em cima / queda embaixo): 16:9 mata a foto.
  {
    dest: "a-pedra/pisavel.webp", src: `${EXTRA}/Suporta peso/Fotos-24.jpg`,
    root: "", width: 1200,
    // Corte 3:4 que EXCLUI a cesta de basquete (x≈810) e fecha na figura + queda.
    crop: { left: 950, top: 1980, width: 2400, height: 3200 },
  },
  {
    dest: "a-pedra/pisavel-mob.webp", src: `${EXTRA}/Suporta peso/Fotos-24.jpg`,
    root: "", width: 1000,
    crop: { left: 900, top: 1600, width: 2475, height: 4400 }, // 9:16 exato, sem a cesta
  },
  { dest: "a-pedra/perfuravel.webp", src: `${EXTRA}/Furando pedra/WhatsApp Image 2026-07-16 at 23.01.56 (3).jpeg`, root: "", width: 900 },

  // S7 QUEM FAZ — Ricardo apresentando com os desenhos à mão na tela atrás.
  // Crop 3:4 ancorado no TOPO (não centrado): centrar cortava a tela com os
  // desenhos à mão, que é justamente o que esta foto veio provar (autor + desenho
  // + plateia num quadro só). O que sai embaixo é tapete.
  { dest: "a-pedra/ricardo-desenhos.webp", src: `${EXTRA}/Ricardo dando curso sobre as técnicas Western/Prontas-11.jpg`, root: "", width: 1400,
    crop: { left: 0, top: 0, width: 4000, height: 5333 } },
  // Desenho assinado. 1117×630 é 16:9 nativo e é o TETO — exibir ≤560px.
  // Escolhido em vez do 23.31.19 (maior e mais bonito) por causa da marca d'água
  // "westernpools" daquele: /a-pedra é nó compartilhado entre as duas frentes.
  { dest: "a-pedra/desenho-botelho.webp", src: `${EXTRA}/Desenhos a mão ricardo/WhatsApp Image 2026-07-16 at 23.31.18 (2).jpeg`, root: "", width: 1100 },

  // ═══════════════════════════════════════════════════════════════════════
  // OBRAS NOVAS — acendem os rostos da prova social que hoje não têm lastro.
  // ═══════════════════════════════════════════════════════════════════════

  // jader-porto-belo: a obra JÁ EXISTE em obras.ts e hoje é LINK MORTO (sem cover).
  // A foto confere com a descrição: tronco de pedra + copa de laje viva sobre o lago.
  { dest: "obras/jader-porto-belo.webp",   src: `${EXTRA}/Jader Almeida All Resort/WhatsApp Image 2026-07-16 at 22.30.23.jpeg`, root: "", width: 1400 },
  { dest: "obras/jader-porto-belo-2.webp", src: `${EXTRA}/Jader Almeida All Resort/WhatsApp Image 2026-07-16 at 22.29.44.jpeg`, root: "", width: 1200 },

  // hanazaki-expo-revestir. ⚠ A 9-11 do acervo NÃO entra: praça corporativa com
  // árvores caducifólias de clima temperado — não é Brasil e não é feira indoor.
  { dest: "obras/hanazaki-expo.webp",   src: `${EXTRA}/Hanazaki/9-12 Expo Revestir 2017 - Projeto Alex Hanazaki.jpg`, root: "", width: 1400 },
  { dest: "obras/hanazaki-expo-2.webp", src: `${EXTRA}/Hanazaki/9-9 Expo Revestir 2017 - Projeto Alex Hanazaki.jpg`, root: "", width: 1200 },
  { dest: "obras/hanazaki-expo-3.webp", src: `${EXTRA}/Hanazaki/9-10 Expo Revestir 2017 - Projeto Alex Hanazaki.jpg`, root: "", width: 1200 },

  // faisal-piscina-grega. Os upscaled 4K que o dono aprovou NÃO existem no disco.
  // Larguras = as nativas: 749 e 520. withoutEnlargement protege de upscale acidental.
  { dest: "obras/faisal-grega.webp",   src: `${EXTRA}/Faisal/WhatsApp Image 2026-07-16 at 22.37.20 (4).jpeg`, root: "", width: 749 },
  { dest: "obras/faisal-grega-2.webp", src: `${EXTRA}/Faisal/WhatsApp Image 2026-07-16 at 22.37.20 (3).jpeg`, root: "", width: 520 },

  // enora-jader — a maquete da torre apoiada num matacão Western.
  { dest: "obras/enora.webp",   src: `${EXTRA}/Jader Almeida - Enora SP Base Maquete/9-5 Enora - São Paulo-SP - Jader Almeida.jpg`, root: "", width: 960 },
  { dest: "obras/enora-2.webp", src: `${EXTRA}/Jader Almeida - Enora SP Base Maquete/9-8 Enora - São Paulo-SP - Jader Almeida.jpg`, root: "", width: 960 },

  // quadriplex-caverna (Dama Arquitetura). ⚠ NUNCA na PDP: é tom desenvolvido
  // sob pedido (regra do dono, argumento 6).
  { dest: "obras/quadriplex.webp",   src: `${EXTRA}/Quadriplex Caverna/9-20 Quadriplex - Projeto Dama Arquitetura.jpg`, root: "", width: 1400 },
  { dest: "obras/quadriplex-2.webp", src: `${EXTRA}/Quadriplex Caverna/9-18 Quadriplex - Projeto Dama Arquitetura.JPEG`, root: "", width: 1200 },
  { dest: "obras/quadriplex-3.webp", src: `${EXTRA}/Quadriplex Caverna/9-19 Quadriplex - Projeto Dama Arquitetura.jpg`, root: "", width: 1200 }, // RENDER — creditado como tal

  // nigro-praia-suspensa (Genesis/Nigro) — 2º lastro do Genesis, com o argumento
  // "entra onde pedra não entra".
  { dest: "obras/nigro.webp",   src: `${EXTRA}/Thiago Nigro/WhatsApp Image 2026-07-16 at 23.01.56 (4).jpeg`, root: "", width: 1400,
    crop: { left: 430, top: 30, width: 1140, height: 1050 } }, // tira o caixilho da janela
  { dest: "obras/nigro-2.webp", src: `${EXTRA}/Thiago Nigro/WhatsApp Image 2026-07-16 at 23.01.56 (2).jpeg`, root: "", width: 1200 },
  { dest: "obras/nigro-3.webp", src: `${EXTRA}/Pedra Oca/9-24 Piscina suspensa - Nigro - Projeto Genesis.jpg`, root: "", width: 1200 },
];

let ok = 0, fail = 0;
for (const { dest, src, width, root, crop } of JOBS) {
  // root: "" => src já é caminho absoluto (acervo novo). undefined => SRC_ROOT.
  const srcPath = root === "" ? src : join(root ?? SRC_ROOT, src);
  const outPath = join(OUT_ROOT, dest);
  try {
    await mkdir(dirname(outPath), { recursive: true });
    let pipe = sharp(srcPath).rotate(); // .rotate() ANTES do crop: extract opera no frame já orientado
    if (crop) pipe = pipe.extract(crop);
    const info = await pipe
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 78 })
      .toFile(outPath);
    console.log(`OK  ${dest}  ${info.width}x${info.height}  ${(info.size / 1024).toFixed(0)}KB`);
    ok++;
  } catch (e) {
    console.error(`ERR ${dest}  <- ${src}\n    ${e.message}`);
    fail++;
  }
}
console.log(`\n${ok} ok, ${fail} fail`);
