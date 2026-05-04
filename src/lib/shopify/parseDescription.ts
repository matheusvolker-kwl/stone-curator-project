// Parser para descrições estruturadas do Shopify (Western Pools).
// Padrão esperado:
//   <p>lead</p>
//   <p>intro</p>
//   <h3>Aplicações recomendadas</h3><ul><li>...</li></ul>
//   <h3>Ficha técnica</h3><table><tr><td><strong>label</strong></td><td>valor</td></tr></table>
//   <h3>Observações</h3><ul><li><strong>label:</strong> texto</li></ul>
//   <h3>Modelo 3D para especificação</h3><p>...link...</p>

export interface ParsedObservation {
  label?: string;
  text: string;
}

export interface ParsedDescription {
  lead?: string;
  intro?: string;
  aplicacoes: string[];
  ficha: Array<{ label: string; value: string }>;
  observacoes: ParsedObservation[];
  modelo3dHtml?: string;
  rawHtml?: string;
}

const innerText = (html: string) =>
  html
    .replace(/<\/?(strong|em|b|i|span)[^>]*>/gi, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();

function matchAll(regex: RegExp, source: string): RegExpExecArray[] {
  const out: RegExpExecArray[] = [];
  const r = new RegExp(regex.source, regex.flags.includes("g") ? regex.flags : regex.flags + "g");
  let m: RegExpExecArray | null;
  while ((m = r.exec(source)) !== null) out.push(m);
  return out;
}

export function parseProductDescription(html?: string | null): ParsedDescription {
  const empty: ParsedDescription = { aplicacoes: [], ficha: [], observacoes: [] };
  if (!html) return empty;

  const result: ParsedDescription = { ...empty };
  const sections = html.split(/<h3[^>]*>/i);
  const head = sections[0] ?? "";

  const paragraphs = matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi, head);
  if (paragraphs[0]) result.lead = innerText(paragraphs[0][1]);
  if (paragraphs[1]) result.intro = innerText(paragraphs[1][1]);

  for (let i = 1; i < sections.length; i++) {
    const sec = sections[i];
    const titleEnd = sec.indexOf("</h3>");
    if (titleEnd === -1) continue;
    const title = innerText(sec.slice(0, titleEnd)).toLowerCase();
    const body = sec.slice(titleEnd + "</h3>".length);

    if (title.startsWith("aplica")) {
      result.aplicacoes = matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi, body)
        .map((m) => innerText(m[1]))
        .filter(Boolean);
    } else if (title.startsWith("ficha")) {
      for (const row of matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi, body)) {
        const cells = matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi, row[1]);
        if (cells.length >= 2) {
          const label = innerText(cells[0][1]);
          const value = innerText(cells[1][1]);
          if (label && value) result.ficha.push({ label, value });
        }
      }
    } else if (title.startsWith("observ")) {
      result.observacoes = matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi, body)
        .map((m) => {
          const raw = m[1];
          const labelMatch = raw.match(/<strong[^>]*>([\s\S]*?)<\/strong>/i);
          if (labelMatch) {
            const label = innerText(labelMatch[1]).replace(/:$/, "").trim();
            const text = innerText(raw.replace(labelMatch[0], "")).replace(/^:\s*/, "").trim();
            return { label, text };
          }
          return { text: innerText(raw) };
        })
        .filter((o) => o.text);
    } else if (title.includes("3d") || title.startsWith("modelo")) {
      result.modelo3dHtml = body.trim();
    }
  }

  const hasContent =
    result.lead ||
    result.intro ||
    result.aplicacoes.length ||
    result.ficha.length ||
    result.observacoes.length;
  if (!hasContent) result.rawHtml = html;

  return result;
}

// Agrupa dimensões da ficha em "C × L × A" se existirem todas as três.
export function groupDimensions(ficha: Array<{ label: string; value: string }>) {
  const find = (re: RegExp) => ficha.find((f) => re.test(f.label.toLowerCase()))?.value;
  const c = find(/comprim/);
  const l = find(/largura/);
  const a = find(/altura/);
  if (c && l && a) {
    const stripUnit = (v: string) => v.replace(/cm/i, "").trim();
    return `${stripUnit(c)} × ${stripUnit(l)} × ${stripUnit(a)} cm`;
  }
  return null;
}
