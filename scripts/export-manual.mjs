/**
 * Re-exporta o Manual de Instalação Western como PDF VETORIAL e leve.
 *
 * O problema original: os dois PDFs existentes foram gerados com "Microsoft:
 * Print To PDF", que rasteriza a página inteira — /Type /Font = 0 nos dois, cada
 * página virou uma foto (2479×3508 = A4@300dpi), e depois alguém comprimiu essa
 * foto pra 893×1263 (~108 DPI) pra caber no site. Daí o texto borrado: comprimir
 * foi o segundo erro, rasterizar foi o primeiro.
 *
 * O motor do Chrome embute fontes e mantém o texto vetorial — mas embute as
 * imagens sem perda, e o PDF saiu com 35 MB. Por isso o passo do meio: reencodar
 * as FOTOS pra JPEG dentro do DOM antes de imprimir. Texto não é imagem, então
 * ele não é tocado por isso — continua vetorial, nítido em qualquer zoom.
 *
 * Logos e diagramas (áreas pequenas / PNG de cor chapada) ficam como estão:
 * JPEG em cor chapada cria halo, e eles pesam pouco de qualquer jeito.
 */
import { chromium } from "playwright";
import { pathToFileURL } from "node:url";
import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const SRC_DIR = "K:\\";
const OUT = process.argv[2];
const QUALIDADE = Number(process.argv[3] ?? 0.82);
const MAX_LADO = Number(process.argv[4] ?? 1600);
if (!OUT) throw new Error("uso: node export-manual.mjs <saida.pdf> [qualidade] [maxLado]");

const src = readdirSync(SRC_DIR).find((f) => /offline.*\.html$/i.test(f));
if (!src) throw new Error("HTML de origem não encontrado em " + SRC_DIR);
const srcPath = join(SRC_DIR, src);
console.log("origem :", src, `(${(statSync(srcPath).size / 1e6).toFixed(2)} MB)`);
console.log("params : jpeg q=" + QUALIDADE + " | lado máx=" + MAX_LADO + "px");

const browser = await chromium.launch({ channel: "chrome" });
const page = await browser.newPage();

await page.goto(pathToFileURL(srcPath).href, { waitUntil: "load", timeout: 120_000 });

// O bundle mostra "Unpacking…" e só então monta o React (é um export
// auto-extraível). Espera o texto real aparecer.
await page.waitForFunction(
  () => {
    const t = document.body?.innerText || "";
    return t.length > 3000 && !/Unpacking|requires JavaScript/i.test(t);
  },
  { timeout: 120_000 },
);
await page.evaluate(() =>
  Promise.all(Array.from(document.images).map((i) => (i.complete ? 0 : i.decode().catch(() => 0)))),
);
await page.waitForTimeout(2000);

const stats = await page.evaluate(
  async ({ q, maxLado }) => {
    const out = { total: 0, reencodadas: 0, puladas: 0 };
    for (const img of Array.from(document.images)) {
      out.total++;
      const w = img.naturalWidth, h = img.naturalHeight;
      // Área pequena = logo/ícone/diagrama: JPEG faria halo em cor chapada e o
      // ganho de bytes seria irrelevante.
      if (!w || !h || w * h < 200_000) { out.puladas++; continue; }
      const escala = Math.min(1, maxLado / Math.max(w, h));
      const c = document.createElement("canvas");
      c.width = Math.round(w * escala);
      c.height = Math.round(h * escala);
      const ctx = c.getContext("2d");
      ctx.imageSmoothingQuality = "high";
      // fundo branco: JPEG não tem alfa, e sem isso transparência vira preto
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, c.width, c.height);
      ctx.drawImage(img, 0, 0, c.width, c.height);
      try {
        img.src = c.toDataURL("image/jpeg", q);
        img.srcset = "";
        out.reencodadas++;
      } catch { out.puladas++; }
    }
    await Promise.all(Array.from(document.images).map((i) => (i.complete ? 0 : i.decode().catch(() => 0))));
    return out;
  },
  { q: QUALIDADE, maxLado: MAX_LADO },
);
console.log("imagens:", stats.total, "| reencodadas:", stats.reencodadas, "| mantidas:", stats.puladas);
await page.waitForTimeout(1500);

const info = await page.evaluate(() => ({
  chars: document.body.innerText.length,
  naoCarregadas: Array.from(document.images).filter((i) => !i.naturalWidth).length,
  temPageCSS: Array.from(document.styleSheets).some((s) => {
    try { return Array.from(s.cssRules).some((r) => r.constructor.name === "CSSPageRule"); }
    catch { return false; }
  }),
}));
console.log("render :", info.chars, "chars | não carregadas:", info.naoCarregadas, "| @page:", info.temPageCSS);
if (info.naoCarregadas > 0) throw new Error("imagem não carregada — sairia em branco no PDF");

await page.emulateMedia({ media: "print" });
await page.pdf({
  path: OUT,
  format: info.temPageCSS ? undefined : "A4",
  preferCSSPageSize: info.temPageCSS,
  printBackground: true,
  displayHeaderFooter: false,
});
await browser.close();
console.log("gravado:", OUT, `(${(statSync(OUT).size / 1e6).toFixed(2)} MB)`);
