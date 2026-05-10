import { test, expect } from "@playwright/test";
import { mockBackend, seedAuthSession, seedCart } from "./fixtures/backend";

test.describe("Carrinho · parceiro aprovado · PDF salvo na conta", () => {
  test.beforeEach(async ({ page }) => {
    await mockBackend(page, { role: "approved" });
    await seedAuthSession(page, "approved");
    await seedCart(page);
  });

  test("aprovado consegue gerar e armazenar o PDF na conta", async ({ page }) => {
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

    await expect(page.getByText(/Composição salva/i)).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(/Minha conta · Orçamentos/i)).toBeVisible();
    expect(savePdfCalled).toBe(true);
  });

  test("se save-quote-pdf falhar, ainda mostra fallback de download", async ({ page, context }) => {
    await context.unroute(`**/zibtysewpbeycngtbjjk.supabase.co/**`).catch(() => {});
    await mockBackend(page, { role: "approved", failSavePdf: true });

    await page.goto("/");
    await page.evaluate(() => window.dispatchEvent(new Event("western:open-cart")));

    const ctas = page.getByRole("button", { name: /Baixar composição/i });
    await ctas.last().click();
    await page.getByRole("button", { name: /Liberar PDF/i }).click();

    await expect(page.getByText(/Composição salva/i)).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(/Baixe o PDF abaixo/i)).toBeVisible();
  });
});
