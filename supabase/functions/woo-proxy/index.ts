// Read-only proxy to WooCommerce via the Lovable connector gateway.
// Keeps consumer key/secret server-side. Allowlists catalog endpoints only.
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/woocommerce";
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
const WOOCOMMERCE_API_KEY = Deno.env.get("WOOCOMMERCE_API_KEY");

// Catalog-only allowlist. No orders, no customers, no mutations.
const ALLOWED_PATHS: RegExp[] = [
  /^products$/,
  /^products\/categories$/,
  /^products\/\d+$/,
  /^products\/\d+\/variations$/,
];

// In-memory cache (per edge-function instance). Stale-while-revalidate.
// Catalog rarely changes — long TTL with background refresh keeps the home snappy
// without holding hot data forever in memory.
const CACHE_TTL_MS = 15 * 60_000; // 15 min fresh
const STALE_TTL_MS = 24 * 60 * 60_000; // 24 hr stale fallback (served while revalidating, or on upstream error)
const cache = new Map<string, { expires: number; staleUntil: number; status: number; body: string; contentType: string }>();
const revalidating = new Set<string>();

// Simple in-flight dedupe so concurrent identical requests don't multiply upstream load.
const inflight = new Map<string, Promise<Response>>();

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

  // Forward all query params except 'path'.
  const forwarded = new URLSearchParams();
  for (const [k, v] of url.searchParams.entries()) {
    if (k === "path") continue;
    forwarded.append(k, v);
  }
  const qs = forwarded.toString();
  const target = `${GATEWAY_URL}/${path}${qs ? `?${qs}` : ""}`;
  const cacheKey = target;

  const now = Date.now();
  const cached = cache.get(cacheKey);
  if (cached && cached.expires > now) {
    return new Response(cached.body, {
      status: cached.status,
      headers: { ...corsHeaders, "Content-Type": cached.contentType, "X-Cache": "HIT" },
    });
  }

  // Stale-while-revalidate: serve stale immediately, kick off background refresh once.
  if (cached && cached.staleUntil > now) {
    if (!revalidating.has(cacheKey) && !inflight.has(cacheKey)) {
      revalidating.add(cacheKey);
      // fire-and-forget; result lands in cache for the next request.
      queueMicrotask(() => {
        void revalidate(cacheKey, target).finally(() => revalidating.delete(cacheKey));
      });
    }
    return new Response(cached.body, {
      status: cached.status,
      headers: { ...corsHeaders, "Content-Type": cached.contentType, "X-Cache": "SWR" },
    });
  }

  // Dedupe concurrent identical fetches
  const existing = inflight.get(cacheKey);
  if (existing) return existing.then((r) => r.clone());

  const work = (async (): Promise<Response> => {
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
          return new Response(lastBody, {
            status: upstream.status,
            headers: { ...corsHeaders, "Content-Type": lastContentType, "X-Cache": "MISS" },
          });
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
      return new Response(cached.body, {
        status: cached.status,
        headers: { ...corsHeaders, "Content-Type": cached.contentType, "X-Cache": "STALE" },
      });
    }

    // Return 200 with a structured fallback signal so the client doesn't blank-screen.
    return jsonResponse(200, {
      error: lastStatus === 429 ? "rate_limited" : lastStatus === 403 ? "blocked" : "upstream_error",
      fallback: true,
      upstream_status: lastStatus,
    });
  })();

  inflight.set(cacheKey, work);
  try {
    const res = await work;
    return res.clone();
  } finally {
    inflight.delete(cacheKey);
  }
});

