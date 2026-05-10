import { test, expect } from "@playwright/test";
import { mockBackend, seedCart } from "./fixtures/backend";

test.describe("Carrinho · cliente não logado · baixar PDF", () => {
  test.beforeEach(async ({ page }) => {
    await mockBackend(page, { role: "guest" });
    await seedCart(page);
  });

  test("preenche lead e gera PDF disponível para download", async ({ page }) => {
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
    await page.getByPlaceholder(/email|@/i).first().fill("teste@e2e.com");
    await page.getByPlaceholder(/\(\)/).first().fill("11912345678");

    await page.getByRole("button", { name: /Liberar PDF/i }).click();

    // Sucesso
    await expect(page.getByText(/Composição salva/i)).toBeVisible({ timeout: 10_000 });
    await expect(page.getByRole("button", { name: /Baixar PDF da composição/i })).toBeEnabled();

    // Disparar download
    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page.getByRole("button", { name: /Baixar PDF da composição/i }).click(),
    ]);
    expect(download.suggestedFilename()).toMatch(/\.pdf$/);
  });
});
