/**
 * Galerias GERAIS por segmento (fotos "aleatórias" do Drive) → src/assets/segmentos/<seg>/NN.webp.
 * Alimenta a página /inspiracoes fundida (segmento = intro + galeria + exemplos de obra).
 * Rodar: node scripts/import-galerias.mjs
 */
import sharp from "sharp";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { mkdir } from "node:fs/promises";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SRC_ROOT = "K:/CONTEUDOS-20260716T042137Z-1-001/CONTEUDOS";
const OUT_ROOT = join(__dirname, "..", "src", "assets", "segmentos");

// segmento -> lista de arquivos (ordem = ordem na galeria)
const GALERIAS = {
  piscinas: [
    "Piscinas/Western Pools - Embu das Artes-28.JPG",
    "Piscinas/Western Pools - Embu das Artes-18.JPG",
    "Piscinas/Western Pools - Embu das Artes-3.JPG",
    "Piscinas/Cópia de DSC08268-HDR.jpg",
    "Piscinas/Cópia de DSC08258-HDR.jpg",
    "Piscinas/DSC07097-HDR.jpg",
  ],
  lagos: [
    "Lagos/DSC08706-HDR.jpg",
    "Lagos/DSC08701-HDR.jpg",
    "Lagos/DSC08721-HDR.jpg",
    "Lagos/dji_fly_20250820_155730_0014_1755716483100_aeb-HDR.jpg",
    "Lagos/DSC08731-HDR.jpg",
  ],
  cascatas: [
    "Piscinas/Cópia de DSC07152-HDR.jpg",
    "Piscinas/Cópia de DSC08268-HDR.jpg",
    "Piscinas/Western Pools - Embu das Artes-5.JPG",
  ],
  jardins: [
    "Jardins/Cópia de IMG_3844.JPEG",
    "Jardins/DSC07163-HDR.jpg",
    "Jardins/Fotos-18.JPG",
    "Jardins/Fotos-14.JPG",
    "Jardins/Cópia de DSC08339-HDR.jpg",
  ],
  revestimentos: [
    "revestimentos/balcão pedra japones 3.jpg",
    "revestimentos/balcão pedra japones 5.jpg",
    "revestimentos/revestimento lavabo 1.jpg",
    "revestimentos/PLACA RÚSTICA RIVIERA - AMBIENTADA.jpg",
    "revestimentos/DSC06897.jpg",
  ],
  viveiros: [
    "Viveiros/Projeto-HG-Avare-3.jpg",
    "Viveiros/Projeto-HG-Avare-2.jpg",
  ],
};

const WIDTH = 1100;
let ok = 0, fail = 0;
for (const [seg, files] of Object.entries(GALERIAS)) {
  for (let i = 0; i < files.length; i++) {
    const src = join(SRC_ROOT, files[i]);
    const out = join(OUT_ROOT, seg, `${String(i + 1).padStart(2, "0")}.webp`);
    try {
      await mkdir(dirname(out), { recursive: true });
      const info = await sharp(src).rotate().resize({ width: WIDTH, withoutEnlargement: true }).webp({ quality: 78 }).toFile(out);
      console.log(`OK  ${seg}/${String(i + 1).padStart(2, "0")}.webp  ${info.width}x${info.height}  ${(info.size / 1024).toFixed(0)}KB`);
      ok++;
    } catch (e) {
      console.error(`ERR ${seg} <- ${files[i]}: ${e.message}`);
      fail++;
    }
  }
}
console.log(`\n${ok} ok, ${fail} fail`);
