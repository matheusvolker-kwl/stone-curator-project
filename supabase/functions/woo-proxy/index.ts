// Read-only proxy to WooCommerce via the Lovable connector gateway.
// Keeps consumer key/secret server-side. Allowlists catalog endpoints only.
//
// ─── GATE DE PREÇO (servidor) ────────────────────────────────────────────────
// A tabela de atacado é B2B. O Woo devolve preço para qualquer um que alcance
// esta função, então o gate NÃO pode viver na interface — ele vive aqui.
// Quem não é parceiro aprovado recebe o catálogo inteiro (título, fotos,
// descrição, dimensões, peso, atributos, variações) com os campos de preço
// zerados. A Western Box é a exceção da marca: é a única peça vendida sem
// cadastro, então o preço dela continua visível para todo mundo.
//
// Identidade do chamador: mesmo padrão de `credenciar` e `checkout-ticket-create`
// (auth.getClaims sobre o Bearer + leitura de partner_profiles com service role).
// Em QUALQUER dúvida — sem token, token inválido, banco fora — falhamos para o
// lado seguro: esconder preço.
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/woocommerce";
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
const WOOCOMMERCE_API_KEY = Deno.env.get("WOOCOMMERCE_API_KEY");

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

// Chave de emergência. Se os parceiros perderem preço em produção, o dono põe
// WOO_PRICE_GATE=off nos secrets do Supabase e o preço volta na hora, sem deploy.
// Default = ligado (seguro).
const PRICE_GATE_ON = (Deno.env.get("WOO_PRICE_GATE") ?? "on").toLowerCase() !== "off";

// Catalog-only allowlist. No orders, no customers, no mutations.
const ALLOWED_PATHS: RegExp[] = [
  /^products$/,
  /^products\/categories$/,
  /^products\/\d+$/,
  /^products\/\d+\/variations$/,
];

/* ─── Western Box: a exceção ────────────────────────────────────────────────
 * Vendida SEM cadastro. O preço dela nunca é escondido. Reconhecida por sku,
 * slug ou id — os três, porque cada endpoint do Woo devolve um recorte
 * diferente (a lista traz sku+slug; /variations só traz o id do pai na rota).
 * O id casa com WESTERN_BOX_WOO_PRODUCT_ID em src/pages/WesternBox.tsx.
 */
const WESTERN_BOX_SKU_PREFIX = "western-box";
const WESTERN_BOX_SLUGS = new Set(["western-box"]);
const WESTERN_BOX_IDS = new Set<number>(
  (Deno.env.get("WESTERN_BOX_PRODUCT_ID") ?? "1559")
    .split(",")
    .map((n) => Number.parseInt(n.trim(), 10))
    .filter((n) => Number.isFinite(n)),
);

function isWesternBox(node: Record<string, unknown>): boolean {
  const sku = typeof node.sku === "string" ? node.sku.trim().toLowerCase() : "";
  if (sku.startsWith(WESTERN_BOX_SKU_PREFIX)) return true;
  const slug = typeof node.slug === "string" ? node.slug.trim().toLowerCase() : "";
  if (slug && WESTERN_BOX_SLUGS.has(slug)) return true;
  const id = node.id;
  if (typeof id === "number" && WESTERN_BOX_IDS.has(id)) return true;
  return false;
}

/* ─── Campos de preço ───────────────────────────────────────────────────────
 * Além dos óbvios, `bundle_price` entra na lista: o adapter do app
 * (src/lib/woocommerce/adapter.ts:resolveWooPrice) cai justamente nele e em
 * `price_html` quando `price` é "0" — deixar qualquer um dos três de fora
 * mantém o vazamento de pé.
 */
const PRICE_KEYS = new Set([
  "price",
  "regular_price",
  "sale_price",
  "price_html",
  "display_price",
  "display_regular_price",
  "prices",
  "price_range",
  "bundle_price",
]);

/** Mantém o formato do campo (o app faz parseFloat/optional-chaining em cima). */
function emptyLike(v: unknown): unknown {
  if (typeof v === "string") return "";
  if (typeof v === "number") return 0;
  if (Array.isArray(v)) return [];
  if (v && typeof v === "object") return null;
  return null;
}

/** meta_data pode carregar _price/_regular_price em instalações antigas. */
function isPriceMeta(m: unknown): boolean {
  if (!m || typeof m !== "object") return false;
  const key = (m as { key?: unknown }).key;
  return typeof key === "string" && /pre[cç]o|price/i.test(key);
}

/** Remove recursivamente todo campo de preço, preservando o resto do payload. */
function scrubPrices(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(scrubPrices);
  if (!value || typeof value !== "object") return value;

  const src = value as Record<string, unknown>;
  if (isWesternBox(src)) return value; // exceção: sai intacta

  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(src)) {
    const key = k.toLowerCase();
    if (PRICE_KEYS.has(key)) {
      out[k] = emptyLike(v);
      continue;
    }
    if (key === "meta_data" && Array.isArray(v)) {
      out[k] = v.filter((m) => !isPriceMeta(m)).map(scrubPrices);
      continue;
    }
    out[k] = scrubPrices(v);
  }
  return out;
}

/* ─── Identidade do chamador ────────────────────────────────────────────────*/

type Caller = { approved: boolean; userId: string | null };
const ANON: Caller = { approved: false, userId: null };

// Aprovação muda raramente; 60s corta a ida ao banco em toda request de catálogo.
const APPROVAL_TTL_MS = 60_000;
const APPROVAL_CACHE_MAX = 5_000;
const approvalCache = new Map<string, { approved: boolean; expires: number }>();

async function resolveCaller(req: Request): Promise<Caller> {
  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader.toLowerCase().startsWith("bearer ")) return ANON;

    const token = authHeader.slice(7).trim();
    if (!token) return ANON;

    // Visitante: o app manda a anon/publishable key aqui. Não é um usuário.
    if (SUPABASE_ANON_KEY && token === SUPABASE_ANON_KEY) return ANON;

    // Sem como verificar → esconde preço (lado seguro).
    if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
      console.error("[woo-proxy] gate ativo sem SUPABASE_URL/SERVICE_ROLE — escondendo preço");
      return ANON;
    }

    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: claimsData, error: claimsErr } = await userClient.auth.getClaims(token);
    const claims = claimsData?.claims;
    const userId = typeof claims?.sub === "string" ? claims.sub : null;
    // A própria anon key é um JWT válido, mas sem `sub` e com role "anon".
    if (claimsErr || !userId || claims?.role !== "authenticated") return ANON;

    const now = Date.now();
    const hit = approvalCache.get(userId);
    if (hit && hit.expires > now) return { approved: hit.approved, userId };

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: profile, error: pErr } = await admin
      .from("partner_profiles")
      .select("status")
      .eq("user_id", userId)
      .maybeSingle();

    // Banco fora: não cacheia e não revela preço nesta request.
    if (pErr) {
      console.error("[woo-proxy] leitura de partner_profiles falhou", pErr);
      return { approved: false, userId };
    }

    const approved = profile?.status === "approved";
    if (approvalCache.size >= APPROVAL_CACHE_MAX) approvalCache.clear();
    approvalCache.set(userId, { approved, expires: now + APPROVAL_TTL_MS });
    return { approved, userId };
  } catch (e) {
    console.error("[woo-proxy] resolveCaller falhou", e);
    return ANON;
  }
}

/* ─── Cache (por instância da edge function) ────────────────────────────────
 * Guarda SEMPRE o corpo cru do Woo (com preço). O gate é aplicado na saída,
 * por request — senão o corpo sem preço de um visitante seria servido a um
 * parceiro (e vice-versa). `gated` memoiza a versão sem preço do MESMO corpo.
 */
const CACHE_TTL_MS = 15 * 60_000; // 15 min fresh
const STALE_TTL_MS = 24 * 60 * 60_000; // 24 hr stale fallback
type Entry = {
  expires: number;
  staleUntil: number;
  status: number;
  body: string;
  contentType: string;
  /** undefined = ainda não calculado; null = corpo não é JSON. */
  gated?: string | null;
};
const cache = new Map<string, Entry>();
const revalidating = new Set<string>();

// Dedupe de requests idênticas concorrentes. Resolve para o payload CRU —
// o gate é aplicado depois, por chamador.
type Payload = { status: number; body: string; contentType: string; cacheState: string };
const inflight = new Map<string, Promise<Payload>>();

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function revalidate(cacheKey: string, target: string): Promise<void> {
  try {
    const upstream = await fetch(target, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "X-Connection-Api-Key": WOOCOMMERCE_API_KEY,
      },
    });
    if (!upstream.ok) return;
    const body = await upstream.text();
    cache.set(cacheKey, {
      expires: Date.now() + CACHE_TTL_MS,
      staleUntil: Date.now() + STALE_TTL_MS,
      status: upstream.status,
      body,
      contentType: upstream.headers.get("Content-Type") ?? "application/json",
    });
  } catch {
    // keep existing stale entry; next request will SWR again.
  }
}

/** Versão sem preço do corpo, memoizada na entrada de cache quando houver. */
function gatedBody(cacheKey: string, raw: string): string | null {
  const entry = cache.get(cacheKey);
  if (entry && entry.body === raw && entry.gated !== undefined) return entry.gated;

  let out: string | null;
  try {
    out = JSON.stringify(scrubPrices(JSON.parse(raw)));
  } catch {
    out = null; // não é JSON — quem chama decide (falha fechada)
  }
  if (entry && entry.body === raw) entry.gated = out;
  return out;
}

function jsonResponse(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "GET") {
    return jsonResponse(405, { error: "Method not allowed" });
  }

  if (!LOVABLE_API_KEY || !WOOCOMMERCE_API_KEY) {
    return jsonResponse(500, {
      error: "Server not configured: missing LOVABLE_API_KEY or WOOCOMMERCE_API_KEY",
    });
  }

  const url = new URL(req.url);
  const rawPath = url.searchParams.get("path");
  if (!rawPath) {
    return jsonResponse(400, { error: "Missing 'path' query parameter" });
  }

  const path = rawPath.replace(/^\/+/, "");
  if (path.includes("..") || path.includes("?") || path.includes("#")) {
    return jsonResponse(400, { error: "Invalid path" });
  }

  if (!ALLOWED_PATHS.some((re) => re.test(path))) {
    return jsonResponse(403, { error: `Path not allowed: ${path}` });
  }

  // Quem está chamando? (roda em paralelo com o fetch do catálogo lá embaixo)
  const callerPromise = PRICE_GATE_ON ? resolveCaller(req) : Promise.resolve({ approved: true, userId: null });

  // A rota /products/<id> e /products/<id>/variations da Western Box saem
  // inteiras: a lista é reconhecida item a item, mas aqui só existe o id do pai.
  const idInPath = path.match(/^products\/(\d+)(?:\/variations)?$/)?.[1];
  const pathIsWesternBox = idInPath !== undefined && WESTERN_BOX_IDS.has(Number(idInPath));

  // Forward all query params except 'path'.
  const forwarded = new URLSearchParams();
  for (const [k, v] of url.searchParams.entries()) {
    if (k === "path") continue;
    forwarded.append(k, v);
  }

  const caller = await callerPromise;
  const mustGate = PRICE_GATE_ON && !caller.approved && !pathIsWesternBox;

  // Ordenar por preço deixaria o visitante inferir o ranking da tabela. O app
  // nunca manda `orderby=price` (src/lib/woocommerce/queries.ts), então tirar
  // isso do visitante não quebra nada.
  if (mustGate && /^price/i.test(forwarded.get("orderby") ?? "")) {
    forwarded.delete("orderby");
  }

  const qs = forwarded.toString();
  const target = `${GATEWAY_URL}/${path}${qs ? `?${qs}` : ""}`;
  const cacheKey = target;

  /** Aplica o gate na saída. Corpo não-JSON com gate ativo → falha fechada. */
  const respond = (p: Payload): Response => {
    let body = p.body;
    if (mustGate) {
      const stripped = gatedBody(cacheKey, p.body);
      if (stripped === null) {
        console.error("[woo-proxy] corpo não-JSON com gate ativo — bloqueando", { path });
        return jsonResponse(502, { error: "upstream_error", fallback: true });
      }
      body = stripped;
    }
    return new Response(body, {
      status: p.status,
      headers: {
        ...corsHeaders,
        "Content-Type": p.contentType,
        "X-Cache": p.cacheState,
        // A MESMA url devolve corpos diferentes por identidade: nada de cache
        // compartilhado guardando a resposta de um parceiro para um visitante.
        "X-Price-Gate": mustGate ? "stripped" : "open",
        "Cache-Control": "private, no-store",
        Vary: "Authorization",
      },
    });
  };

  const now = Date.now();
  const cached = cache.get(cacheKey);
  if (cached && cached.expires > now) {
    return respond({
      status: cached.status,
      body: cached.body,
      contentType: cached.contentType,
      cacheState: "HIT",
    });
  }

  // Stale-while-revalidate: serve stale immediately, kick off background refresh once.
  if (cached && cached.staleUntil > now) {
    if (!revalidating.has(cacheKey) && !inflight.has(cacheKey)) {
      revalidating.add(cacheKey);
      queueMicrotask(() => {
        void revalidate(cacheKey, target).finally(() => revalidating.delete(cacheKey));
      });
    }
    return respond({
      status: cached.status,
      body: cached.body,
      contentType: cached.contentType,
      cacheState: "SWR",
    });
  }

  // Dedupe concurrent identical fetches
  const existing = inflight.get(cacheKey);
  if (existing) return respond(await existing);

  const work = (async (): Promise<Payload> => {
    let lastStatus = 0;
    let lastBody = "";
    let lastContentType = "application/json";
    // Retry once on 429/403 (rate limit / bot challenge) with small backoff
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const upstream = await fetch(target, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "X-Connection-Api-Key": WOOCOMMERCE_API_KEY,
          },
        });
        lastContentType = upstream.headers.get("Content-Type") ?? "application/json";
        lastBody = await upstream.text();
        lastStatus = upstream.status;

        if (upstream.ok) {
          cache.set(cacheKey, {
            expires: Date.now() + CACHE_TTL_MS,
            staleUntil: Date.now() + STALE_TTL_MS,
            status: upstream.status,
            body: lastBody,
            contentType: lastContentType,
          });
          return {
            status: upstream.status,
            body: lastBody,
            contentType: lastContentType,
            cacheState: "MISS",
          };
        }

        if (upstream.status === 429 || upstream.status === 403) {
          if (attempt === 0) {
            await sleep(400 + Math.random() * 400);
            continue;
          }
        } else {
          break;
        }
      } catch (err) {
        lastStatus = 502;
        lastBody = JSON.stringify({ error: "Upstream fetch failed", detail: String(err) });
        lastContentType = "application/json";
        if (attempt === 0) {
          await sleep(300);
          continue;
        }
      }
    }

    // Serve stale cache on upstream failure to keep the UI working.
    if (cached && cached.staleUntil > Date.now()) {
      return {
        status: cached.status,
        body: cached.body,
        contentType: cached.contentType,
        cacheState: "STALE",
      };
    }

    // Return 200 with a structured fallback signal so the client doesn't blank-screen.
    return {
      status: 200,
      body: JSON.stringify({
        error: lastStatus === 429 ? "rate_limited" : lastStatus === 403 ? "blocked" : "upstream_error",
        fallback: true,
        upstream_status: lastStatus,
      }),
      contentType: "application/json",
      cacheState: "MISS",
    };
  })();

  inflight.set(cacheKey, work);
  try {
    return respond(await work);
  } finally {
    inflight.delete(cacheKey);
  }
});
