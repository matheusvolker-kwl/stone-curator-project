// PDF de PROPOSTA COMERCIAL (admin → cliente).
// Reutiliza a identidade visual do orçamento, mas adiciona desconto, parcelamento,
// total final, validade e selo "Proposta oficial Western".
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatBRL } from "@/lib/catalog/client";
import { BUSINESS } from "@/config/business";
import logoHorizontalBranco from "@/assets/brand/logo-horizontal-branco.png";
import iconePedraBege from "@/assets/brand/icone-pedra-bege-hd.png";

export interface PropostaItem {
  productTitle: string;
  acabamento?: string;
  quantity: number;
  unitPrice: number;
  productImage?: string | null;
}

export interface PropostaCliente {
  nome?: string;
  email?: string;
  telefone?: string;
  empresa?: string;
  cidade?: string;
}

export interface PropostaOptions {
  numero: string;
  cliente: PropostaCliente;
  items: PropostaItem[];
  subtotal: number;
  discountPct: number;
  discountValue: number;
  total: number;
  formaPagamento?: string;
  parcelas?: number;
  validadeDias?: number;
  observacoes?: string;
  currency?: string;
}

const GREEN: [number, number, number] = [27, 50, 41];
const GOLD: [number, number, number] = [184, 146, 79];
const GOLD_SOFT: [number, number, number] = [232, 218, 178];
const CREAM: [number, number, number] = [248, 243, 230];
const STONE: [number, number, number] = [110, 102, 90];
const STONE_LINE: [number, number, number] = [220, 214, 200];
const INK: [number, number, number] = [27, 50, 41];

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
  cristalRatio: number;
  logoRatio: number;
}

async function loadBrandAssets(): Promise<BrandAssets> {
  const [logo, cristal] = await Promise.all([
    loadDataUrl(logoHorizontalBranco),
    loadDataUrl(iconePedraBege),
  ]);
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

function drawHeader(doc: jsPDF, pageWidth: number, numero: string, brand: BrandAssets) {
  doc.setFillColor(...GREEN);
  doc.rect(0, 0, pageWidth, 130, "F");

  const logoH = 32;
  const logoW = logoH * brand.logoRatio;
  if (brand.logoHorizontal) {
    doc.addImage(brand.logoHorizontal, "PNG", 48, 38, logoW, logoH);
  }

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(...GOLD_SOFT);
  doc.text(
    "PEDRAS DECORATIVAS AUTORAIS  ·  ATELIÊ DESDE 1993",
    48,
    38 + logoH + 14,
    { charSpace: 1.5 },
  );

  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.4);
  doc.line(48, 100, pageWidth - 48, 100);

  doc.setFontSize(8);
  doc.setTextColor(...GOLD);
  doc.text(`PROPOSTA COMERCIAL  ·  Nº ${numero}`, 48, 118, { charSpace: 1.2 });

  const dataStr = new Date().toLocaleString("pt-BR", {
    day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
  doc.setTextColor(...CREAM);
  doc.text(`EMITIDA EM ${dataStr}`, pageWidth - 48, 118, { align: "right", charSpace: 1 });
}

function drawWatermark(doc: jsPDF, pageWidth: number, pageHeight: number, brand: BrandAssets) {
  if (!brand.cristalBege) return;
  const w = 320;
  const h = w / brand.cristalRatio;
  const x = (pageWidth - w) / 2;
  const y = (pageHeight - h) / 2 + 20;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const anyDoc = doc as any;
  try {
    anyDoc.saveGraphicsState();
    anyDoc.setGState(new anyDoc.GState({ opacity: 0.05 }));
    doc.addImage(brand.cristalBege, "PNG", x, y, w, h);
    anyDoc.restoreGraphicsState();
  } catch { /* ignore */ }
}

function drawFooter(doc: jsPDF, pageWidth: number, pageHeight: number, brand: BrandAssets) {
  const margin = 48;
  const footerY = pageHeight - 60;
  doc.setFillColor(...GREEN);
  doc.rect(0, footerY, pageWidth, 60, "F");
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.4);
  doc.line(margin, footerY + 14, pageWidth - margin, footerY + 14);

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
  doc.text("CONTATO", pageWidth - margin, footerY + 30, { align: "right", charSpace: 1.4 });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...GOLD_SOFT);
  doc.text(
    `WhatsApp ${BUSINESS.whatsappLabel}  ·  ${BUSINESS.emailComercial}`,
    pageWidth - margin, footerY + 44, { align: "right" },
  );
}

function drawClientCard(doc: jsPDF, pageWidth: number, y: number, cliente: PropostaCliente): number {
  const margin = 48;
  const cardH = 92;
  doc.setFillColor(...CREAM);
  doc.rect(margin, y, pageWidth - margin * 2, cardH, "F");
  doc.setFillColor(...GOLD);
  doc.rect(margin, y, 3, cardH, "F");

  doc.setTextColor(...GOLD);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.text("PROPOSTA PARA", margin + 18, y + 20, { charSpace: 1.5 });

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

export async function gerarPropostaPdf(opts: PropostaOptions): Promise<jsPDF> {
  const {
    numero, cliente, items, subtotal, discountPct, discountValue, total,
    formaPagamento, parcelas, validadeDias = 7, observacoes, currency = "BRL",
  } = opts;

  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 48;
  const brand = await loadBrandAssets();

  drawHeader(doc, pageWidth, numero, brand);
  drawWatermark(doc, pageWidth, pageHeight, brand);

  let y = 158;
  y = drawClientCard(doc, pageWidth, y, cliente) + 24;

  // Eyebrow seção
  doc.setTextColor(...GOLD);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.text("ITENS DA PROPOSTA", margin, y, { charSpace: 1.5 });
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.4);
  doc.line(margin + 110, y - 3, pageWidth - margin, y - 3);
  y += 12;

  const head = [["Item", "Acabamento", "Qtd", "Preço unit.", "Subtotal"]];
  const body = items.map((i) => [
    i.productTitle,
    i.acabamento || "—",
    String(i.quantity),
    formatBRL(i.unitPrice, currency),
    formatBRL(i.unitPrice * i.quantity, currency),
  ]);

  autoTable(doc, {
    startY: y,
    head, body,
    margin: { left: margin, right: margin, top: 150, bottom: 80 },
    theme: "plain",
    styles: {
      font: "helvetica", fontSize: 9.5,
      cellPadding: { top: 10, bottom: 10, left: 12, right: 12 },
      textColor: INK, lineColor: STONE_LINE, lineWidth: 0,
    },
    headStyles: {
      fillColor: GREEN, textColor: CREAM, fontStyle: "bold", fontSize: 7.5,
      cellPadding: { top: 9, bottom: 9, left: 12, right: 12 },
    },
    alternateRowStyles: { fillColor: [250, 247, 239] as [number, number, number] },
    columnStyles: {
      0: { fontStyle: "bold" },
      2: { halign: "center", cellWidth: 44, textColor: GREEN },
      3: { halign: "right", cellWidth: 88 },
      4: { halign: "right", cellWidth: 92, fontStyle: "bold", textColor: GREEN },
    },
    didDrawCell: (data) => {
      if (data.section === "body") {
        const { x, y: cy, width, height } = data.cell;
        doc.setDrawColor(...STONE_LINE);
        doc.setLineWidth(0.3);
        doc.line(x, cy + height, x + width, cy + height);
      }
    },
    didDrawPage: (data) => {
      if (data.pageNumber > 1) {
        drawHeader(doc, pageWidth, numero, brand);
        drawWatermark(doc, pageWidth, pageHeight, brand);
      }
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let cursorY = (doc as any).lastAutoTable.finalY + 20;

  // Bloco de totais (direita)
  const totalsX = pageWidth - margin - 240;
  const labelOpts = { charSpace: 1.5 } as const;

  doc.setDrawColor(...STONE_LINE);
  doc.setLineWidth(0.3);
  doc.line(totalsX, cursorY, pageWidth - margin, cursorY);
  cursorY += 16;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...STONE);
  doc.text("Subtotal", totalsX, cursorY);
  doc.setTextColor(...INK);
  doc.text(formatBRL(subtotal, currency), pageWidth - margin, cursorY, { align: "right" });
  cursorY += 16;

  if (discountValue > 0) {
    doc.setTextColor(...STONE);
    doc.text(`Desconto (${discountPct}%)`, totalsX, cursorY);
    doc.setTextColor(...GOLD);
    doc.text(`− ${formatBRL(discountValue, currency)}`, pageWidth - margin, cursorY, { align: "right" });
    cursorY += 16;
  }

  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.6);
  doc.line(totalsX, cursorY, pageWidth - margin, cursorY);
  cursorY += 18;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(...GOLD);
  doc.text("TOTAL DA PROPOSTA", totalsX, cursorY, labelOpts);
  doc.setFontSize(20);
  doc.setTextColor(...GREEN);
  doc.text(formatBRL(total, currency), pageWidth - margin, cursorY + 4, { align: "right" });
  cursorY += 28;

  if (parcelas && parcelas > 1) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...STONE);
    const valorParcela = total / parcelas;
    doc.text(
      `ou ${parcelas}× de ${formatBRL(valorParcela, currency)}`,
      pageWidth - margin, cursorY, { align: "right" },
    );
    cursorY += 18;
  }

  // Condições comerciais
  cursorY += 14;
  doc.setFillColor(...CREAM);
  const condBoxStart = cursorY;
  const condLines: string[] = [];
  if (formaPagamento) condLines.push(`Forma de pagamento: ${formaPagamento}`);
  if (parcelas && parcelas > 1) condLines.push(`Parcelado em até ${parcelas}× sem juros`);
  condLines.push(`Produção em ${BUSINESS.prazoProducaoLabel}.`);
  condLines.push(`Proposta válida por ${validadeDias} dias a partir da emissão.`);
  condLines.push(`Garantia de ${BUSINESS.garantiaLabel} contra defeitos de fabricação.`);

  const boxH = 26 + condLines.length * 14;
  doc.rect(margin, condBoxStart, pageWidth - margin * 2, boxH, "F");
  doc.setFillColor(...GOLD);
  doc.rect(margin, condBoxStart, 3, boxH, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(...GOLD);
  doc.text("CONDIÇÕES COMERCIAIS", margin + 18, condBoxStart + 18, labelOpts);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...INK);
  condLines.forEach((line, idx) => {
    doc.text("·  " + line, margin + 18, condBoxStart + 36 + idx * 14);
  });
  cursorY = condBoxStart + boxH + 16;

  if (observacoes) {
    const obsLines = doc.splitTextToSize(observacoes, pageWidth - margin * 2 - 28);
    const obsBoxH = 30 + obsLines.length * 13;
    doc.setFillColor(...CREAM);
    doc.rect(margin, cursorY, pageWidth - margin * 2, obsBoxH, "F");
    doc.setFillColor(...GOLD);
    doc.rect(margin, cursorY, 3, obsBoxH, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(...GOLD);
    doc.text("OBSERVAÇÕES", margin + 18, cursorY + 18, labelOpts);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(...INK);
    doc.text(obsLines, margin + 18, cursorY + 34);
  }

  // Footer em todas as páginas
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    drawFooter(doc, pageWidth, pageHeight, brand);
  }
  return doc;
}

export async function propostaPdfBlob(opts: PropostaOptions): Promise<Blob> {
  const doc = await gerarPropostaPdf(opts);
  return doc.output("blob");
}

export async function downloadPropostaPdf(opts: PropostaOptions): Promise<void> {
  const doc = await gerarPropostaPdf(opts);
  doc.save(`western-proposta-${opts.numero}.pdf`);
}
