import { test, expect } from "@playwright/test";
import { readFile, stat } from "node:fs/promises";
import { mockBackend, seedAuthSession, seedCart } from "./fixtures/backend";

const PDF_FILENAME_RE = /^western-orcamento-[A-Z0-9]+\.pdf$/i;

test.describe("Carrinho · parceiro aprovado · PDF salvo na conta", () => {
  test.beforeEach(async ({ page }) => {
    await mockBackend(page, { role: "approved" });
    await seedAuthSession(page, "approved");
    await seedCart(page);
  });

  test("aprovado gera, armazena na conta e baixa o PDF (filename + conteúdo)", async ({ page }) => {
    let savePdfCalled = false;
    page.on("request", (req) => {
      if (req.url().includes("/functions/v1/save-quote-pdf")) savePdfCalled = true;
    });

    await page.goto("/");
    await page.evaluate(() => window.dispatchEvent(new Event("western:open-cart")));

    // Aprovado tem 2 CTAs "Baixar composição (PDF)" — secundário abre o modal
    const ctas = page.getByRole("button", { name: /Baixar composição/i });
    await expect(ctas.first()).toBeVisible();
    await ctas.last().click();

    // Form é prefilled — basta enviar
    await page.getByRole("button", { name: /Liberar PDF/i }).click();

    await expect(page.getByText(/Composição salva|Pronto! Seu PDF/i).first()).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(/Minha conta · Orçamentos/i)).toBeVisible();
    expect(savePdfCalled).toBe(true);

    // Confirma download real do PDF para o parceiro logado
    const downloadBtn = page.getByRole("button", { name: /Baixar PDF da composição/i });
    await expect(downloadBtn).toBeEnabled();

    const [download] = await Promise.all([
      page.waitForEvent("download"),
      downloadBtn.click(),
    ]);

    const filename = download.suggestedFilename();
    expect(filename).toMatch(PDF_FILENAME_RE);

    const path = await download.path();
    expect(path).toBeTruthy();
    const stats = await stat(path!);
    expect(stats.size).toBeGreaterThan(1024);
    const head = await readFile(path!);
    expect(head.subarray(0, 5).toString("utf8")).toBe("%PDF-");
  });

  test("se save-quote-pdf falhar, ainda mostra fallback de download e baixa PDF válido", async ({ page, context }) => {
    await context.unroute(`**/zibtysewpbeycngtbjjk.supabase.co/**`).catch(() => {});
    await mockBackend(page, { role: "approved", failSavePdf: true });

    await page.goto("/");
    await page.evaluate(() => window.dispatchEvent(new Event("western:open-cart")));

    const ctas = page.getByRole("button", { name: /Baixar composição/i });
    await ctas.last().click();
    await page.getByRole("button", { name: /Liberar PDF/i }).click();

    await expect(page.getByText(/Composição salva|Pronto! Seu PDF/i).first()).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(/Baixe o PDF abaixo/i)).toBeVisible();

    // Fallback: o botão de download ainda funciona com blob local
    const downloadBtn = page.getByRole("button", { name: /Baixar PDF da composição/i });
    const [download] = await Promise.all([
      page.waitForEvent("download"),
      downloadBtn.click(),
    ]);
    expect(download.suggestedFilename()).toMatch(PDF_FILENAME_RE);
    const path = await download.path();
    const head = await readFile(path!);
    expect(head.subarray(0, 5).toString("utf8")).toBe("%PDF-");
  });
});
