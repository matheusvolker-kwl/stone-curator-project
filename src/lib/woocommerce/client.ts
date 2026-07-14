// Browser-side client that talks to our edge-function proxy (woo-proxy).
// Consumer key/secret never reach the browser.

import { supabase } from "@/integrations/supabase/client";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

const PROXY_URL = `${SUPABASE_URL}/functions/v1/woo-proxy`;

/**
 * O TOKEN DO USUÁRIO PRECISA CHEGAR NA woo-proxy.
 *
 * Este cliente mandava a anon key no `Authorization` SEMPRE — inclusive para o
 * parceiro logado. Enquanto o proxy era um repasse cego isso não fazia
 * diferença; agora que ele decide QUEM VÊ PREÇO pelo token, mandar a anon key
 * significa "sou visitante" — e o parceiro aprovado ficaria sem preço.
 *
 * Então: se houver sessão, manda o JWT dela; senão, a anon key (visitante).
 * O `apikey` continua sendo sempre a anon key — é o que identifica o projeto.
 */
async function authHeader(): Promise<string> {
  try {
    const { data } = await supabase.auth.getSession();
    return `Bearer ${data.session?.access_token ?? SUPABASE_ANON_KEY}`;
  } catch {
    return `Bearer ${SUPABASE_ANON_KEY}`;
  }
}

export interface WooFetchOptions {
  /** WooCommerce REST path, e.g. "products" or "products/123/variations" */
  path: string;
  /** Query string params (numbers/strings/booleans are stringified) */
  params?: Record<string, string | number | boolean | undefined | null>;
  /** Caller-controlled AbortSignal */
  signal?: AbortSignal;
}

export async function wooFetch<T = unknown>({ path, params, signal }: WooFetchOptions): Promise<T> {
  const qs = new URLSearchParams();
  qs.set("path", path);
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v === undefined || v === null) continue;
      qs.set(k, String(v));
    }
  }
  const res = await fetch(`${PROXY_URL}?${qs.toString()}`, {
    method: "GET",
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: await authHeader(),
    },
    signal,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`woo-proxy ${res.status}: ${text.slice(0, 200)}`);
  }
  return (await res.json()) as T;
}

/**
 * Format a number/string as BRL. Mirrors shopify/client.ts:formatBRL.
 */
export function formatBRL(amount: string | number, currency = "BRL") {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (Number.isNaN(num)) return "—";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(num);
}
