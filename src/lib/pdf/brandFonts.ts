import type { jsPDF } from "jspdf";
import archivo600Url from "@/assets/fonts/pdf/archivo-600.ttf?url";
import archivo700Url from "@/assets/fonts/pdf/archivo-700.ttf?url";
import ss400Url from "@/assets/fonts/pdf/sourcesans3-400.ttf?url";
import ss600Url from "@/assets/fonts/pdf/sourcesans3-600.ttf?url";

/**
 * Fontes da marca embutidas nos PDFs (DS V3): Archivo (display, ~650 → 600/700
 * estáticos) e Source Sans 3 (corpo/labels, 400/600). TTFs estáticos do Google
 * Fonts (licença SIL OFL), carregados sob demanda só quando um PDF é gerado e
 * cacheados em memória. Se a rede falhar, o PDF sai em helvetica — nunca
 * bloqueia o download do orçamento.
 */

export const PDF_FONTS = {
  /** Corpo, labels, números: Source Sans 3 (normal=400, bold=600). */
  sans: "SourceSans3",
  /** Display (títulos grandes): Archivo (normal=600, bold=700). */
  display: "Archivo",
} as const;

type FontSpec = { url: string; vfsName: string; family: string; style: "normal" | "bold" };

const SPECS: FontSpec[] = [
  { url: ss400Url, vfsName: "SourceSans3-Regular.ttf", family: PDF_FONTS.sans, style: "normal" },
  { url: ss600Url, vfsName: "SourceSans3-SemiBold.ttf", family: PDF_FONTS.sans, style: "bold" },
  { url: archivo600Url, vfsName: "Archivo-SemiBold.ttf", family: PDF_FONTS.display, style: "normal" },
  { url: archivo700Url, vfsName: "Archivo-Bold.ttf", family: PDF_FONTS.display, style: "bold" },
];

let cache: Promise<{ vfsName: string; family: string; style: string; b64: string }[] | null> | null =
  null;

async function fetchAsBase64(url: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`font fetch ${res.status}`);
  const buf = await res.arrayBuffer();
  let bin = "";
  const bytes = new Uint8Array(buf);
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    bin += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(bin);
}

function loadAll() {
  cache ??= Promise.all(
    SPECS.map(async (s) => ({ ...s, b64: await fetchAsBase64(s.url) })),
  ).catch(() => null);
  return cache;
}

/**
 * Registra as fontes da marca no documento. Retorna true se registrou; false =
 * seguir com helvetica (fallback silencioso).
 */
export async function ensureBrandFonts(doc: jsPDF): Promise<boolean> {
  const fonts = await loadAll();
  if (!fonts) return false;
  try {
    for (const f of fonts) {
      doc.addFileToVFS(f.vfsName, f.b64);
      doc.addFont(f.vfsName, f.family, f.style);
    }
    return true;
  } catch {
    return false;
  }
}
