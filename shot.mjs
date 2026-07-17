/**
 * Screenshot da /a-pedra em 1280 e 390.
 *
 * ⚠ RODAR DE DENTRO DO PROJETO (node shot.mjs), nunca do scratchpad: a
 * resolução de ESM parte do diretório do script, e de fora
 * `import { chromium } from "@playwright/test"` dá ERR_MODULE_NOT_FOUND. Foi
 * isso que cegou uma rodada inteira — e não o MCP de screenshot (que trava a
 * 30s porque o Turnstile entra em loop de erro 110200 no localhost).
 */
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";

const URL = process.env.URL ?? "http://localhost:8080/a-pedra";
const OUT = "shots";
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();

for (const [name, width, height] of [
  ["desk", 1280, 800],
  ["mob", 390, 844],
]) {
  const page = await browser.newPage({ viewport: { width, height } });
  // ⚠ NÃO usar waitUntil:"networkidle": o Turnstile fica em loop de erro 110200
  // no localhost, a rede NUNCA fica ociosa e o goto estoura o timeout. Foi o que
  // travou o MCP de screenshot a 30s. domcontentloaded + espera das <img>.
  await page.goto(URL, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForLoadState("load", { timeout: 30000 }).catch(() => {});

  // Reveal usa IntersectionObserver: sem rolar a página inteira, tudo abaixo da
  // dobra fica opacity-0 e o screenshot sai em branco.
  await page.evaluate(async () => {
    await new Promise((res) => {
      let y = 0;
      const t = setInterval(() => {
        window.scrollTo(0, y);
        y += 400;
        if (y > document.body.scrollHeight) {
          clearInterval(t);
          window.scrollTo(0, 0);
          setTimeout(res, 700);
        }
      }, 60);
    });
  });
  await page.waitForTimeout(900);

  const pageH = await page.evaluate(() => document.body.scrollHeight);

  // Métricas: densidade de imagem e maior trecho sem foto — os números que
  // reprovaram a v1 (9,2% de foto; 5 telas sem imagem no mobile).
  const data = await page.evaluate(() => {
    const imgs = [...document.querySelectorAll("img")]
      .map((i) => {
        const r = i.getBoundingClientRect();
        return {
          src: i.currentSrc.split("/").pop(),
          top: Math.round(r.top + window.scrollY),
          h: Math.round(r.height),
          w: Math.round(r.width),
          area: Math.round(r.width * r.height),
        };
      })
      .filter((i) => i.area > 5000)
      .sort((a, b) => a.top - b.top);
    const secs = [...document.querySelectorAll("section")].map((s) => {
      const r = s.getBoundingClientRect();
      return {
        h: Math.round(r.height),
        top: Math.round(r.top + window.scrollY),
        imgs: s.querySelectorAll("img").length,
      };
    });
    const words = (document.body.innerText.match(/\S+/g) || []).length;
    const sizes = [...document.querySelectorAll("h1,h2,h3")].map((h) => ({
      t: h.tagName,
      px: getComputedStyle(h).fontSize,
      txt: h.innerText.slice(0, 42),
    }));
    return { imgs, secs, words, sizes, pageH: document.body.scrollHeight };
  });

  // maior vão contínuo sem foto
  let gap = 0, cursor = 0;
  for (const i of data.imgs) {
    gap = Math.max(gap, i.top - cursor);
    cursor = Math.max(cursor, i.top + i.h);
  }
  gap = Math.max(gap, data.pageH - cursor);
  const area = data.imgs.reduce((s, i) => s + i.area, 0);

  console.log(`\n──── ${name} ${width}×${height}`);
  console.log(`altura ${pageH}px = ${(pageH / height).toFixed(1)} telas · ${data.words} palavras`);
  console.log(`fotos ${data.imgs.length} · área ${area}px² = ${((area / (width * pageH)) * 100).toFixed(1)}% da página`);
  console.log(`maior trecho SEM foto: ${gap}px = ${(gap / height).toFixed(1)} telas`);
  console.log("seções:", data.secs.map((s) => `${s.h}px/${s.imgs}img`).join(" · "));
  console.log("headings:", [...new Set(data.sizes.map((s) => `${s.t}=${s.px}`))].join(" "));

  await page.screenshot({ path: `${OUT}/${name}-full.png`, fullPage: true });
  // fatias de 1 viewport para conseguir OLHAR seção por seção
  for (let i = 0, y = 0; y < pageH && i < 16; i++, y += height) {
    // clip só vale fora do viewport com fullPage:true
    await page.screenshot({
      path: `${OUT}/${name}-${String(i).padStart(2, "0")}.png`,
      fullPage: true,
      clip: { x: 0, y, width, height: Math.min(height, pageH - y) },
    });
  }
  await page.close();
}

await browser.close();
console.log("\nOK →", OUT);
