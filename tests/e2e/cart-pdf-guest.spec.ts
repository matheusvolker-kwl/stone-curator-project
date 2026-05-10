import { test, expect } from "@playwright/test";
import { readFile, stat } from "node:fs/promises";
import { mockBackend, seedCart } from "./fixtures/backend";

const PDF_FILENAME_RE = /^western-orcamento-[A-Z0-9]+\.pdf$/i;

test.describe("Carrinho · cliente não logado · baixar PDF", () => {
  test.beforeEach(async ({ page }) => {
    await mockBackend(page, { role: "guest" });
    await seedCart(page);
  });

  test("preenche lead, gera e efetivamente baixa o PDF (filename + conteúdo)", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => window.dispatchEvent(new Event("western:open-cart")));

    // CTA do guest é "Baixar composição (PDF)"
    const cta = page.getByRole("button", { name: /Baixar composição/i }).first();
    await expect(cta).toBeVisible();
    await cta.click();

    // Modal aberto
    await expect(page.getByRole("heading", { name: /Baixar/i })).toBeVisible();

    // Preencher form
    await page.getByPlaceholder("Seu nome completo").fill("Teste E2E");
    await page.getByPlaceholder(/empresa\.com/i).fill("teste@e2e.com");
    await page.getByPlaceholder(/^\(11\)/).fill("11912345678");

    await page.getByRole("button", { name: /Liberar PDF/i }).click();

    // Sucesso
    await expect(page.getByText(/Composição salva|Pronto! Seu PDF/i).first()).toBeVisible({ timeout: 10_000 });
    const downloadBtn = page.getByRole("button", { name: /Baixar PDF da composição/i });
    await expect(downloadBtn).toBeEnabled();

    // Disparar download e capturar arquivo
    const [download] = await Promise.all([
      page.waitForEvent("download"),
      downloadBtn.click(),
    ]);

    // 1. Nome do arquivo segue o padrão western-orcamento-{numero|stamp}.pdf
    const filename = download.suggestedFilename();
    expect(filename).toMatch(PDF_FILENAME_RE);

    // 2. Arquivo realmente foi escrito em disco e tem conteúdo plausível de PDF
    const path = await download.path();
    expect(path).toBeTruthy();
    const stats = await stat(path!);
    expect(stats.size).toBeGreaterThan(1024); // PDF mínimo viável
    const head = await readFile(path!);
    expect(head.subarray(0, 5).toString("utf8")).toBe("%PDF-");
  });
});
