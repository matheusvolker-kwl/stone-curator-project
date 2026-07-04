// Generates public/sitemap.xml. Runs via predev/prebuild npm hooks.
import { writeFileSync } from "fs";
import { resolve } from "path";

const BASE_URL = "https://westernstore.lovable.app";

interface Entry {
  path: string;
  changefreq?: "daily" | "weekly" | "monthly" | "yearly";
  priority?: string;
}

const entries: Entry[] = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/linhas", changefreq: "weekly", priority: "0.9" },
  { path: "/produtos", changefreq: "weekly", priority: "0.9" },
  { path: "/conjuntos", changefreq: "monthly", priority: "0.8" },
  { path: "/guia-de-composicao", changefreq: "monthly", priority: "0.8" },
  { path: "/sobre", changefreq: "yearly", priority: "0.6" },
  { path: "/por-que-western", changefreq: "yearly", priority: "0.6" },
  { path: "/contrate-a-western", changefreq: "monthly", priority: "0.8" },
  { path: "/contato", changefreq: "yearly", priority: "0.5" },
  { path: "/visitar", changefreq: "yearly", priority: "0.5" },
  { path: "/faq", changefreq: "monthly", priority: "0.7" },
  { path: "/parceiro/cadastro", changefreq: "yearly", priority: "0.6" },
  { path: "/parceiro/login", changefreq: "yearly", priority: "0.4" },
  { path: "/politica-comercial", changefreq: "yearly", priority: "0.3" },
  { path: "/politica-de-entrega", changefreq: "yearly", priority: "0.3" },
  { path: "/trocas-e-avarias", changefreq: "yearly", priority: "0.3" },
  { path: "/privacidade", changefreq: "yearly", priority: "0.3" },
];

function build(items: Entry[]) {
  const urls = items.map((e) =>
    [
      "  <url>",
      `    <loc>${BASE_URL}${e.path}</loc>`,
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

writeFileSync(resolve("public/sitemap.xml"), build(entries));
console.log(`sitemap.xml written (${entries.length} entries)`);
