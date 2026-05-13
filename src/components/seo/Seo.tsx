import { Helmet } from "react-helmet-async";

const SITE_URL = "https://westernstore.lovable.app";

type SeoProps = {
  title: string;
  description: string;
  path: string;
  ogType?: "website" | "article" | "product";
  image?: string;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
};

/**
 * Per-route SEO. Sets title, description, canonical, og:* and optional JSON-LD.
 * Inherits sitewide og:image from index.html when `image` is omitted.
 */
export default function Seo({ title, description, path, ogType = "website", image, jsonLd }: SeoProps) {
  const url = `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
  const desc = description.length > 160 ? description.slice(0, 157).trimEnd() + "…" : description;
  const blocks = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : [];

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={desc} />
      <link rel="canonical" href={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={desc} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={ogType} />
      {image ? <meta property="og:image" content={image} /> : null}
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={desc} />
      {image ? <meta name="twitter:image" content={image} /> : null}
      {blocks.map((b, i) => (
        <script key={i} type="application/ld+json">{JSON.stringify(b)}</script>
      ))}
    </Helmet>
  );
}

export { SITE_URL };
