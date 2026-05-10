import { test, expect } from "@playwright/test";
import { mockBackend, seedAuthSession, seedCart } from "./fixtures/backend";

test.describe("Carrinho · Finalizar compra (parceiro aprovado)", () => {
  test.beforeEach(async ({ page }) => {
    await mockBackend(page, { role: "approved" });
    await seedAuthSession(page, "approved");
    // Pedido acima do mínimo
    await seedCart(page, { quantity: 5, price: 8500 });
  });

  test("clique em Finalizar compra abre checkout em nova aba", async ({ page, context }) => {
    await page.goto("/");
    await page.evaluate(() => window.dispatchEvent(new Event("western:open-cart")));

    const finalize = page.getByRole("button", { name: /Finalizar compra/i });
    await expect(finalize).toBeVisible();
    await expect(finalize).toBeEnabled();

    const [popup] = await Promise.all([
      context.waitForEvent("page"),
      finalize.click(),
    ]);
    await popup.waitForLoadState("domcontentloaded").catch(() => {});
    expect(popup.url()).toContain("channel=online_store");
  });

  test("se subtotal abaixo do mínimo, botão fica desabilitado", async ({ page }) => {
    // Reseed com valor baixo
    await page.addInitScript(() => {
      const cart = JSON.parse(localStorage.getItem("shopify-cart") || "{}");
      if (cart?.state?.items?.[0]) {
        cart.state.items[0].quantity = 1;
        cart.state.items[0].price.amount = "10.00";
        localStorage.setItem("shopify-cart", JSON.stringify(cart));
      }
    });
    await page.goto("/");
    await page.evaluate(() => window.dispatchEvent(new Event("western:open-cart")));
    await expect(page.getByRole("button", { name: /Finalizar compra/i })).toBeDisabled();
  });
});
