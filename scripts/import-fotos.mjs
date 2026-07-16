/**
 * Importa e otimiza fotos reais das obras (fonte: pasta CONTEUDOS do Drive) para
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
const OUT_ROOT = join(__dirname, "..", "src", "assets");

// [destino relativo a src/assets, origem relativa a CONTEUDOS, largura px]
const JOBS = [
  // ── Capas de obra ────────────────────────────────────────────────
  ["obras/showroom.webp",       "PROJETOS INSPIRAÇÃO/showroom/IMG_8781.JPEG", 1400],
  ["obras/showroom-2.webp",     "PROJETOS INSPIRAÇÃO/showroom/IMG_8775.JPEG", 1200],
  ["obras/tato.webp",           "PROJETOS INSPIRAÇÃO/tato/PISCINA DEPOIS.jpg", 1400],
  ["obras/tato-antes.webp",     "PROJETOS INSPIRAÇÃO/tato/ANTES TATO.jpg", 1200],
  ["obras/neymar.webp",         "PROJETOS INSPIRAÇÃO/Neymar/IMG_3607.JPEG", 1400],
  ["obras/neymar-2.webp",       "PROJETOS INSPIRAÇÃO/Neymar/IMG_3385.JPEG", 1200],
  ["obras/tapirai.webp",        "PROJETOS INSPIRAÇÃO/tapirai/Cópia de Tapirai-23.jpg", 1600],
  ["obras/tapirai-render.webp", "PROJETOS INSPIRAÇÃO/tapirai/Cópia de AILLEN_RENDER_R01_06.png", 1200],
  ["obras/tapirai-real.webp",   "PROJETOS INSPIRAÇÃO/tapirai/Cópia de Tapirai-3.jpg", 1200],
  ["obras/evandro.webp",        "PROJETOS INSPIRAÇÃO/Evandro Mesquita/WhatsApp Image 2023-12-24 at 09.07.30.jpeg", 1200],
  ["obras/evandro-leveza.webp", "PROJETOS INSPIRAÇÃO/Evandro Mesquita/WhatsApp Image 2023-12-24 at 09.07.31.jpeg", 1000],
  ["obras/unique.webp",         "ESPECIAIS/unique garden/04. FOTOS/Cópia de WhatsApp Image 2026-03-25 at 13.50.15 (3).jpeg", 1400],
  ["obras/rosewood.webp",       "ESPECIAIS/hotel rosewood/Fotos-11.jpg", 1400],
  // ── Linguagens (galerias / heróis) ───────────────────────────────
  ["linguagens/piscina.webp",       "Piscinas/Western Pools - Embu das Artes-28.JPG", 1600],
  ["linguagens/piscina-praia.webp", "Piscinas/Cópia de DSC08268-HDR.jpg", 1100],
  ["linguagens/lago.webp",          "Lagos/DSC08706-HDR.jpg", 1200],
  ["linguagens/jardim.webp",        "Jardins/DSC07163-HDR.jpg", 1200],
  ["linguagens/revestimento.webp",  "revestimentos/balcão pedra japones 3.jpg", 1600],
  ["linguagens/viveiro.webp",       "Viveiros/Projeto-HG-Avare-3.jpg", 1200],
];

let ok = 0, fail = 0;
for (const [dest, src, width] of JOBS) {
  const srcPath = join(SRC_ROOT, src);
  const outPath = join(OUT_ROOT, dest);
  try {
    await mkdir(dirname(outPath), { recursive: true });
    const info = await sharp(srcPath)
      .rotate() // respeita EXIF orientation
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
