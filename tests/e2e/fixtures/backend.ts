/**
 * Helpers para mockar Supabase, Shopify Storefront e a sessão de auth nos testes E2E.
 * Nada toca a rede real — todo o backend é simulado por route handlers do Playwright.
 */
import type { Page, Route } from "@playwright/test";

const SUPABASE_HOST = "zibtysewpbeycngtbjjk.supabase.co";
const SUPABASE_PROJECT_REF = "zibtysewpbeycngtbjjk";
const SHOPIFY_GRAPHQL_GLOB = "**/api/2025-07/graphql.json";

export type MockUserRole = "guest" | "approved" | "pending" | "admin";

export interface MockBackendOptions {
  role?: MockUserRole;
  /** Falha o save-quote-pdf para testar fallback. */
  failSavePdf?: boolean;
  /** Falha o insert do lead. */
  failLeadInsert?: boolean;
}

const APPROVED_USER = {
  id: "11111111-1111-1111-1111-111111111111",
  email: "parceiro@teste.com",
  empresa: "Estúdio Teste",
  telefone: "(11) 91234-5678",
  cidade: "São Paulo",
  nome: "Parceiro Teste",
};

/**
 * Injeta token Supabase no localStorage ANTES da página carregar.
 * Evita lidar com fluxo real de login. O token nunca é validado porque
 * todas as chamadas REST/edge são interceptadas.
 */
export async function seedAuthSession(page: Page, role: MockUserRole) {
  if (role === "guest") return;
  const session = {
    access_token: "fake-access-token",
    refresh_token: "fake-refresh-token",
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    token_type: "bearer",
    user: {
      id: APPROVED_USER.id,
      aud: "authenticated",
      role: "authenticated",
      email: APPROVED_USER.email,
      email_confirmed_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      app_metadata: { provider: "email", providers: ["email"] },
      user_metadata: {},
    },
  };
  await page.addInitScript(
    ({ key, value }) => {
      window.localStorage.setItem(key, JSON.stringify(value));
    },
    { key: `sb-${SUPABASE_PROJECT_REF}-auth-token`, value: session },
  );
}

/**
 * Seeda o cart Zustand persistido no localStorage com 1 item válido.
 * Evita depender de produtos reais do Shopify durante os testes.
 */
export async function seedCart(
  page: Page,
  opts: { quantity?: number; price?: number } = {},
) {
  const quantity = opts.quantity ?? 2;
  const amount = (opts.price ?? 8500).toFixed(2);
  await page.addInitScript(
    ({ qty, amt }) => {
      const state = {
        state: {
          items: [
            {
              lineId: "gid://shopify/CartLine/test-1",
              productHandle: "banco-respiro",
              productTitle: "Banco Respiro",
              productImage: null,
              variantId: "gid://shopify/ProductVariant/123",
              variantTitle: "Padrão",
              price: { amount: amt, currencyCode: "BRL" },
              quantity: qty,
              selectedOptions: [{ name: "Acabamento", value: "Moledo" }],
            },
          ],
          cartId: "gid://shopify/Cart/test-cart",
          checkoutUrl:
            "https://example.myshopify.com/cart/c/test?channel=online_store",
        },
        version: 0,
      };
      window.localStorage.setItem("shopify-cart", JSON.stringify(state));
    },
    { qty: quantity, amt: amount },
  );
}

function jsonResponse(route: Route, body: unknown, status = 200) {
  return route.fulfill({
    status,
    contentType: "application/json",
    body: JSON.stringify(body),
  });
}

/**
 * Intercepta chamadas Supabase (auth, REST, edge) e Shopify Storefront.
 * Deve ser chamado ANTES do page.goto.
 */
export async function mockBackend(page: Page, opts: MockBackendOptions = {}) {
  const role = opts.role ?? "guest";

  // ---------- Supabase ----------
  await page.route(`**/${SUPABASE_HOST}/**`, async (route) => {
    const url = new URL(route.request().url());
    const path = url.pathname;
    const method = route.request().method();

    // Auth user endpoint
    if (path.endsWith("/auth/v1/user")) {
      if (role === "guest") return jsonResponse(route, { msg: "not logged in" }, 401);
      return jsonResponse(route, {
        id: APPROVED_USER.id,
        aud: "authenticated",
        email: APPROVED_USER.email,
        user_metadata: {},
      });
    }

    // Auth token refresh
    if (path.includes("/auth/v1/token")) {
      return jsonResponse(route, { access_token: "fake", refresh_token: "fake", user: { id: APPROVED_USER.id } });
    }

    // Edge function: save-quote-pdf
    if (path.includes("/functions/v1/save-quote-pdf")) {
      if (opts.failSavePdf) return jsonResponse(route, { error: "boom" }, 500);
      return jsonResponse(route, { ok: true, path: `${APPROVED_USER.id}/lead.pdf` });
    }

    // REST: leads insert
    if (path.endsWith("/rest/v1/leads") && method === "POST") {
      if (opts.failLeadInsert) return jsonResponse(route, { message: "rls" }, 403);
      return jsonResponse(route, [{ id: "lead-id" }], 201);
    }

    // REST: partner_profiles select (prefill)
    if (path.includes("/rest/v1/partner_profiles")) {
      if (role === "guest") return jsonResponse(route, []);
      return jsonResponse(route, [
        {
          nome: APPROVED_USER.nome,
          telefone: APPROVED_USER.telefone,
          cidade: APPROVED_USER.cidade,
          empresa: APPROVED_USER.empresa,
          status: role === "approved" || role === "admin" ? "approved" : "pending",
        },
      ]);
    }

    // REST: user_roles
    if (path.includes("/rest/v1/user_roles")) {
      if (role === "admin") return jsonResponse(route, [{ role: "admin" }]);
      return jsonResponse(route, []);
    }

    // Default OK
    return jsonResponse(route, []);
  });

  // ---------- Shopify Storefront ----------
  await page.route(SHOPIFY_GRAPHQL_GLOB, async (route) => {
    return jsonResponse(route, { data: { cart: { id: "gid://shopify/Cart/test-cart", totalQuantity: 2 } } });
  });
}

export const mockUser = APPROVED_USER;
