// Generates public/sitemap.xml. Runs via predev/prebuild npm hooks.
import { writeFileSync } from "fs";
import { resolve } from "path";

const BASE_URL = "https://westernstore.com.br";

interface Entry {
  path: string;
  changefreq?: "daily" | "weekly" | "monthly" | "yearly";
  priority?: string;
  lastmod?: string;
}

const staticEntries: Entry[] = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/linhas", changefreq: "weekly", priority: "0.9" },
  { path: "/linhas/cascatas", changefreq: "weekly", priority: "0.85" },
  { path: "/linhas/fontes-para-jardim", changefreq: "weekly", priority: "0.85" },
  { path: "/linhas/pedras-grandes", changefreq: "weekly", priority: "0.85" },
  { path: "/linhas/pedras-medias", changefreq: "weekly", priority: "0.85" },
  { path: "/linhas/pedras-pequenas", changefreq: "weekly", priority: "0.85" },
  { path: "/linhas/pedras-de-borda", changefreq: "weekly", priority: "0.85" },
  { path: "/linhas/revestimentos", changefreq: "weekly", priority: "0.85" },
  { path: "/linhas/pisadas", changefreq: "weekly", priority: "0.85" },
  { path: "/linhas/acessorios", changefreq: "weekly", priority: "0.85" },
  { path: "/linhas/fosseis-decorativos", changefreq: "weekly", priority: "0.85" },
  { path: "/produtos", changefreq: "weekly", priority: "0.9" },
  { path: "/conjuntos", changefreq: "monthly", priority: "0.8" },
  { path: "/guia-de-composicao", changefreq: "monthly", priority: "0.8" },
  // Páginas do V3 que não existiam quando este gerador foi escrito
  { path: "/inspiracoes", changefreq: "monthly", priority: "0.8" },
  { path: "/como-comprar", changefreq: "monthly", priority: "0.8" },
  { path: "/para-sua-casa", changefreq: "monthly", priority: "0.8" },
  { path: "/western-box", changefreq: "monthly", priority: "0.8" },
  { path: "/parceria", changefreq: "monthly", priority: "0.7" },
  { path: "/sobre", changefreq: "yearly", priority: "0.6" },
  { path: "/por-que-western", changefreq: "yearly", priority: "0.6" },
  { path: "/contrate-a-western", changefreq: "monthly", priority: "0.8" },
  { path: "/contato", changefreq: "yearly", priority: "0.5" },
  { path: "/visitar", changefreq: "yearly", priority: "0.5" },
  { path: "/faq", changefreq: "monthly", priority: "0.7" },
  { path: "/parceiro/cadastro", changefreq: "yearly", priority: "0.6" },
  { path: "/politica-comercial", changefreq: "yearly", priority: "0.3" },
  { path: "/politica-de-entrega", changefreq: "yearly", priority: "0.3" },
  { path: "/trocas-e-avarias", changefreq: "yearly", priority: "0.3" },
  { path: "/privacidade", changefreq: "yearly", priority: "0.3" },
];

// Supabase URL + anon key are public (embedded in the app bundle). Hardcoded
// fallbacks keep the sitemap generator working in prod builds that lack `.env`.
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://zibtysewpbeycngtbjjk.supabase.co";
const SUPABASE_ANON = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InppYnR5c2V3cGJleWNuZ3RiamprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgzNDE3NjMsImV4cCI6MjA5MzkxNzc2M30.NGI4k2HuA2DlNlIXS5twA5ZxB3mEn4vbHgyHH1e6ytA";

interface WooProduct {
  slug?: string;
  status?: string;
  catalog_visibility?: string;
  date_modified?: string;
  date_modified_gmt?: string;
}

async function fetchProductEntries(): Promise<Entry[]> {
  const endpoint = `${SUPABASE_URL}/functions/v1/woo-proxy?path=products&per_page=100&status=publish`;
  try {
    const res = await fetch(endpoint, {
      headers: { apikey: SUPABASE_ANON, Authorization: `Bearer ${SUPABASE_ANON}` },
    });
    if (!res.ok) {
      console.warn(`sitemap: woo-proxy returned ${res.status}, using static entries only`);
      return [];
    }
    const data = (await res.json()) as WooProduct[] | { error?: string };
    if (!Array.isArray(data)) {
      console.warn("sitemap: woo-proxy returned non-array, using static entries only");
      return [];
    }
    const seen = new Set<string>();
    const out: Entry[] = [];
    for (const p of data) {
      if (!p?.slug) continue;
      if (p.catalog_visibility === "hidden") continue;
      let slug = p.slug;
      // Collapse acabamento-bundle suffixes to a single canonical page.
      slug = slug.replace(/-(quartzo|arenito|moledo|granito)$/i, "");
      if (seen.has(slug)) continue;
      seen.add(slug);
      const lastmod = (p.date_modified_gmt || p.date_modified || "").slice(0, 10) || undefined;
      out.push({
        path: `/produtos/${slug}`,
        changefreq: "weekly",
        priority: "0.8",
        lastmod,
      });
    }
    return out;
  } catch (err) {
    console.warn(`sitemap: fetch failed (${String(err)}), using static entries only`);
    return [];
  }
}

function build(items: Entry[]) {
  const urls = items.map((e) =>
    [
      "  <url>",
      `    <loc>${BASE_URL}${e.path}</loc>`,
      e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
      e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
      e.priority ? `    <priority>${e.priority}</priority>` : null,
      "  </url>",
    ]
      .filter(Boolean)
      .join("\n")
  );
  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    ...urls,
    `</urlset>`,
  ].join("\n");
}

async function main() {
  const products = await fetchProductEntries();
  const all = [...staticEntries, ...products];
  writeFileSync(resolve("public/sitemap.xml"), build(all));
  console.log(`sitemap.xml written (${all.length} entries: ${staticEntries.length} static + ${products.length} products)`);
}

main();
