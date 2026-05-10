import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatBRL } from "@/lib/shopify/client";
import type { CartItem } from "@/stores/cartStore";
import { BUSINESS } from "@/config/business";
import logoHorizontalBranco from "@/assets/brand/logo-horizontal-branco.png";
import iconePedraBege from "@/assets/brand/icone-pedra-bege-hd.png";

export interface PdfCliente {
  nome?: string;
  email?: string;
  telefone?: string;
  empresa?: string;
  cidade?: string;
  mensagem?: string;
}

export interface PdfProjetoContext {
  conjuntoNome?: string;
  acabamento?: string;
  tipoVisual?: string;
  areaM2?: number;
  modo?: "curado" | "consulta";
}

export interface PdfOptions {
  items: CartItem[];
  subtotal: number;
  currency?: string;
  cliente?: PdfCliente;
  showPrices: boolean;
  numero?: string;
  projeto?: PdfProjetoContext;
}

const GREEN: [number, number, number] = [27, 50, 41];
const GOLD: [number, number, number] = [184, 146, 79];
const GOLD_SOFT: [number, number, number] = [232, 218, 178];
const CREAM: [number, number, number] = [248, 243, 230];
const STONE: [number, number, number] = [110, 102, 90];
const STONE_LINE: [number, number, number] = [220, 214, 200];
const INK: [number, number, number] = [27, 50, 41];

function shortId(): string {
  return Math.random().toString(36).slice(2, 7).toUpperCase();
}

/** Carrega uma URL (Vite asset) como dataURL para embutir no PDF. */
async function loadDataUrl(url: string): Promise<string | null> {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

interface BrandAssets {
  logoHorizontal: string | null;
  cristalBege: string | null;
  /** Proporção (largura / altura) do cristal — usada para preservar dimensões. */
  cristalRatio: number;
  /** Proporção do logo horizontal. */
  logoRatio: number;
}

async function loadBrandAssets(): Promise<BrandAssets> {
  const [logo, cristal] = await Promise.all([
    loadDataUrl(logoHorizontalBranco),
    loadDataUrl(iconePedraBege),
  ]);

  // Mede proporções reais para evitar distorção
  const measure = (src: string | null): Promise<number> =>
    new Promise((resolve) => {
      if (!src) return resolve(1);
      const img = new Image();
      img.onload = () => resolve(img.naturalWidth / Math.max(1, img.naturalHeight));
      img.onerror = () => resolve(1);
      img.src = src;
    });

  const [logoRatio, cristalRatio] = await Promise.all([measure(logo), measure(cristal)]);
  return { logoHorizontal: logo, cristalBege: cristal, logoRatio, cristalRatio };
}

function drawHeader(
  doc: jsPDF,
  pageWidth: number,
  numero: string,
  brand: BrandAssets,
) {
  // Faixa verde
  doc.setFillColor(...GREEN);
  doc.rect(0, 0, pageWidth, 130, "F");

  // Logo horizontal branco — altura fixa, largura proporcional
  const logoH = 32;
  const logoW = logoH * brand.logoRatio;
  if (brand.logoHorizontal) {
    doc.addImage(brand.logoHorizontal, "PNG", 48, 38, logoW, logoH);
  } else {
    // Fallback tipográfico
    doc.setTextColor(...CREAM);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("WESTERN", 48, 60, { charSpace: 4 });
  }

  // Tagline (sob o logo)
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(...GOLD_SOFT);
  doc.text(
    "PEDRAS DECORATIVAS AUTORAIS  ·  ATELIÊ DESDE 1993",
    48,
    38 + logoH + 14,
    { charSpace: 1.5 },
  );

  // Filete dourado
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.4);
  doc.line(48, 100, pageWidth - 48, 100);

  // Eyebrow + data
  doc.setFontSize(8);
  doc.setTextColor(...GOLD);
  doc.text(`COMPOSIÇÃO DE ORÇAMENTO  ·  Nº ${numero}`, 48, 118, { charSpace: 1.2 });

  const dataStr = new Date().toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  doc.setTextColor(...CREAM);
  doc.setFontSize(8);
  doc.text(`EMITIDO EM ${dataStr}`, pageWidth - 48, 118, {
    align: "right",
    charSpace: 1,
  });
}

function drawWatermark(
  doc: jsPDF,
  pageWidth: number,
  pageHeight: number,
  brand: BrandAssets,
) {
  if (!brand.cristalBege) return;
  const w = 320;
  const h = w / brand.cristalRatio;
  const x = (pageWidth - w) / 2;
  const y = (pageHeight - h) / 2 + 20;

  // Opacidade reduzida via GState
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const anyDoc = doc as any;
  try {
    anyDoc.saveGraphicsState();
    anyDoc.setGState(new anyDoc.GState({ opacity: 0.05 }));
    doc.addImage(brand.cristalBege, "PNG", x, y, w, h);
    anyDoc.restoreGraphicsState();
  } catch {
    /* sem watermark se GState não suportado */
  }
}

function drawFooter(
  doc: jsPDF,
  pageWidth: number,
  pageHeight: number,
  brand: BrandAssets,
) {
  const margin = 48;
  const footerY = pageHeight - 60;
  doc.setFillColor(...GREEN);
  doc.rect(0, footerY, pageWidth, 60, "F");
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.4);
  doc.line(margin, footerY + 14, pageWidth - margin, footerY + 14);

  // Cristal pequeno antes da inscrição
  let textX = margin;
  if (brand.cristalBege) {
    const iconH = 16;
    const iconW = iconH * brand.cristalRatio;
    doc.addImage(brand.cristalBege, "PNG", margin, footerY + 22, iconW, iconH);
    textX = margin + iconW + 8;
  }

  doc.setTextColor(...CREAM);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.text("WESTERN  ·  ATELIÊ", textX, footerY + 30, { charSpace: 1.4 });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...GOLD_SOFT);
  doc.text(BUSINESS.enderecoAtelieCompleto, textX, footerY + 44);

  doc.setTextColor(...CREAM);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.text("CONTATO", pageWidth - margin, footerY + 30, {
    align: "right",
    charSpace: 1.4,
  });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...GOLD_SOFT);
  doc.text(
    `WhatsApp ${BUSINESS.whatsappLabel}  ·  ${BUSINESS.emailComercial}`,
    pageWidth - margin,
    footerY + 44,
    { align: "right" },
  );
}

function drawClientCard(
  doc: jsPDF,
  pageWidth: number,
  y: number,
  cliente: PdfCliente,
): number {
  const margin = 48;
  const cardH = 92;
  doc.setFillColor(...CREAM);
  doc.rect(margin, y, pageWidth - margin * 2, cardH, "F");
  doc.setFillColor(...GOLD);
  doc.rect(margin, y, 3, cardH, "F");

  doc.setTextColor(...GOLD);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.text("CLIENTE", margin + 18, y + 20, { charSpace: 1.5 });

  doc.setTextColor(...INK);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text(cliente.nome || "—", margin + 18, y + 38);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(...STONE);
  if (cliente.empresa) doc.text(cliente.empresa, margin + 18, y + 54);
  if (cliente.cidade) doc.text(cliente.cidade, margin + 18, y + 70);

  const colX = pageWidth / 2 + 10;
  doc.setTextColor(...GOLD);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.text("CONTATO", colX, y + 20, { charSpace: 1.5 });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(...INK);
  let cy = y + 38;
  if (cliente.email) { doc.text(cliente.email, colX, cy); cy += 14; }
  if (cliente.telefone) { doc.text(cliente.telefone, colX, cy); cy += 14; }

  return y + cardH;
}

export async function gerarOrcamentoPdf({
  items,
  subtotal,
  currency = "BRL",
  cliente,
  showPrices,
  numero,
  projeto,
}: PdfOptions): Promise<jsPDF> {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 48;
  const numeroFinal = numero ?? shortId();
  const brand = await loadBrandAssets();

  // Página inicial: header + watermark
  drawHeader(doc, pageWidth, numeroFinal, brand);
  drawWatermark(doc, pageWidth, pageHeight, brand);

  let y = 158;

  if (cliente && (cliente.nome || cliente.email || cliente.telefone)) {
    y = drawClientCard(doc, pageWidth, y, cliente) + 24;
  }

  // Eyebrow seção
  doc.setTextColor(...GOLD);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.text("COMPOSIÇÃO", margin, y, { charSpace: 1.5 });
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.4);
  doc.line(margin + 80, y - 3, pageWidth - margin, y - 3);
  y += 12;

  const head = showPrices
    ? [["Item", "Acabamento", "Qtd", "Preço unit.", "Subtotal"]]
    : [["Item", "Acabamento", "Qtd"]];

  const body = items.map((i) => {
    const acabamento = i.selectedOptions.map((o) => o.value).join(" · ") || "—";
    const unit = parseFloat(i.price.amount);
    const sub = unit * i.quantity;
    if (showPrices) {
      return [
        i.productTitle,
        acabamento,
        String(i.quantity),
        formatBRL(unit, currency),
        formatBRL(sub, currency),
      ];
    }
    return [i.productTitle, acabamento, String(i.quantity)];
  });

  autoTable(doc, {
    startY: y,
    head,
    body,
    margin: { left: margin, right: margin, top: 150, bottom: 80 },
    theme: "plain",
    styles: {
      font: "helvetica",
      fontSize: 9.5,
      cellPadding: { top: 10, bottom: 10, left: 12, right: 12 },
      textColor: INK,
      lineColor: STONE_LINE,
      lineWidth: 0,
    },
    headStyles: {
      fillColor: GREEN,
      textColor: CREAM,
      fontStyle: "bold",
      fontSize: 7.5,
      cellPadding: { top: 9, bottom: 9, left: 12, right: 12 },
    },
    alternateRowStyles: { fillColor: [250, 247, 239] as [number, number, number] },
    columnStyles: showPrices
      ? {
          0: { fontStyle: "bold" },
          2: { halign: "center", cellWidth: 44, textColor: GREEN },
          3: { halign: "right", cellWidth: 88 },
          4: { halign: "right", cellWidth: 92, fontStyle: "bold", textColor: GREEN },
        }
      : { 0: { fontStyle: "bold" }, 2: { halign: "center", cellWidth: 64, textColor: GREEN } },
    didDrawCell: (data) => {
      if (data.section === "body") {
        const { x, y: cy, width, height } = data.cell;
        doc.setDrawColor(...STONE_LINE);
        doc.setLineWidth(0.3);
        doc.line(x, cy + height, x + width, cy + height);
      }
    },
    didDrawPage: (data) => {
      // Repete header/watermark/footer em cada nova página
      if (data.pageNumber > 1) {
        drawHeader(doc, pageWidth, numeroFinal, brand);
        drawWatermark(doc, pageWidth, pageHeight, brand);
      }
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let cursorY = (doc as any).lastAutoTable.finalY + 28;

  if (showPrices) {
    doc.setDrawColor(...GOLD);
    doc.setLineWidth(0.6);
    doc.line(pageWidth - margin - 240, cursorY, pageWidth - margin, cursorY);
    cursorY += 18;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(...GOLD);
    doc.text("SUBTOTAL", pageWidth - margin - 240, cursorY, { charSpace: 1.5 });

    doc.setFontSize(20);
    doc.setTextColor(...GREEN);
    doc.text(formatBRL(subtotal, currency), pageWidth - margin, cursorY + 4, {
      align: "right",
    });
    cursorY += 26;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...STONE);
    doc.text(
      `Pedido mínimo ${formatBRL(BUSINESS.pedidoMinimoBRL, currency)} · valores sujeitos a confirmação`,
      pageWidth - margin,
      cursorY,
      { align: "right" },
    );
    cursorY += 24;
  } else {
    doc.setFillColor(...CREAM);
    doc.rect(margin, cursorY - 14, pageWidth - margin * 2, 38, "F");
    doc.setFillColor(...GOLD);
    doc.rect(margin, cursorY - 14, 3, 38, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...GOLD);
    doc.text("VALORES", margin + 18, cursorY, { charSpace: 1.5 });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(...INK);
    doc.text(
      "Preços apresentados após confirmação do cadastro B2B com nosso time comercial.",
      margin + 18,
      cursorY + 14,
    );
    cursorY += 40;
  }

  if (cliente?.mensagem) {
    cursorY += 8;
    doc.setFillColor(...CREAM);
    const msgLines = doc.splitTextToSize(cliente.mensagem, pageWidth - margin * 2 - 28);
    const boxH = 30 + msgLines.length * 13;
    doc.rect(margin, cursorY, pageWidth - margin * 2, boxH, "F");
    doc.setFillColor(...GOLD);
    doc.rect(margin, cursorY, 3, boxH, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(...GOLD);
    doc.text("OBSERVAÇÕES DO CLIENTE", margin + 18, cursorY + 18, { charSpace: 1.5 });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(...INK);
    doc.text(msgLines, margin + 18, cursorY + 34);
    cursorY += boxH + 10;
  }

  if (cursorY < pageHeight - 140) {
    cursorY += 12;
    doc.setDrawColor(...STONE_LINE);
    doc.setLineWidth(0.3);
    doc.line(margin, cursorY, pageWidth - margin, cursorY);
    cursorY += 16;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(...GOLD);
    doc.text("CONDIÇÕES", margin, cursorY, { charSpace: 1.5 });
    cursorY += 14;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...STONE);
    const cond = [
      `Produção em ${BUSINESS.prazoProducaoLabel}.`,
      "Orçamento válido por 7 dias. Sujeito a confirmação de estoque e logística.",
      `Garantia de ${BUSINESS.garantiaAnos} anos contra defeitos de fabricação.`,
    ];
    cond.forEach((c) => { doc.text("·  " + c, margin, cursorY); cursorY += 13; });
  }

  // Rodapé em todas as páginas
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    drawFooter(doc, pageWidth, pageHeight, brand);
  }

  return doc;
}

export async function downloadOrcamentoPdf(opts: PdfOptions): Promise<void> {
  const doc = await gerarOrcamentoPdf(opts);
  const stamp = new Date()
    .toISOString()
    .replace(/[-:]/g, "")
    .replace("T", "-")
    .slice(0, 13);
  doc.save(`western-orcamento-${stamp}.pdf`);
}

export async function orcamentoPdfBlob(opts: PdfOptions): Promise<Blob> {
  const doc = await gerarOrcamentoPdf(opts);
  return doc.output("blob");
}
