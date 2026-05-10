import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatBRL } from "@/lib/shopify/client";
import type { CartItem } from "@/stores/cartStore";
import { BUSINESS } from "@/config/business";

export interface PdfCliente {
  nome?: string;
  email?: string;
  telefone?: string;
  empresa?: string;
  cidade?: string;
  mensagem?: string;
}

export interface PdfOptions {
  items: CartItem[];
  subtotal: number;
  currency?: string;
  cliente?: PdfCliente;
  showPrices: boolean;
}

const GREEN: [number, number, number] = [27, 50, 41];
const GOLD: [number, number, number] = [184, 146, 79];
const STONE: [number, number, number] = [110, 102, 90];

export function gerarOrcamentoPdf({
  items,
  subtotal,
  currency = "BRL",
  cliente,
  showPrices,
}: PdfOptions): jsPDF {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 48;

  // Header band
  doc.setFillColor(...GREEN);
  doc.rect(0, 0, pageWidth, 110, "F");

  doc.setTextColor(232, 224, 207);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("WESTERN", margin, 50);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(184, 146, 79);
  doc.text("COMPOSIÇÃO DE ORÇAMENTO", margin, 68);

  doc.setTextColor(232, 224, 207);
  doc.setFontSize(9);
  const dataStr = new Date().toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  doc.text(`Emitido em ${dataStr}`, pageWidth - margin, 50, { align: "right" });

  let y = 140;

  // Cliente
  if (cliente && (cliente.nome || cliente.email || cliente.telefone)) {
    doc.setTextColor(...GOLD);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text("CLIENTE", margin, y);
    y += 14;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...GREEN);
    const linhas: string[] = [];
    if (cliente.nome) linhas.push(cliente.nome + (cliente.empresa ? ` — ${cliente.empresa}` : ""));
    if (cliente.email) linhas.push(cliente.email);
    if (cliente.telefone) linhas.push(cliente.telefone);
    if (cliente.cidade) linhas.push(cliente.cidade);
    linhas.forEach((l) => {
      doc.text(l, margin, y);
      y += 14;
    });
    y += 8;
  }

  // Tabela
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
    margin: { left: margin, right: margin },
    theme: "grid",
    styles: {
      font: "helvetica",
      fontSize: 9,
      cellPadding: 8,
      textColor: GREEN as unknown as number[],
      lineColor: [220, 214, 200],
      lineWidth: 0.5,
    },
    headStyles: {
      fillColor: GREEN as unknown as number[],
      textColor: [232, 224, 207] as number[],
      fontStyle: "bold",
      fontSize: 8,
    },
    columnStyles: showPrices
      ? {
          2: { halign: "center", cellWidth: 40 },
          3: { halign: "right", cellWidth: 80 },
          4: { halign: "right", cellWidth: 90 },
        }
      : { 2: { halign: "center", cellWidth: 60 } },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let cursorY = (doc as any).lastAutoTable.finalY + 24;

  // Totais
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.5);
  doc.line(margin, cursorY, pageWidth - margin, cursorY);
  cursorY += 18;

  if (showPrices) {
    doc.setFontSize(9);
    doc.setTextColor(...STONE);
    doc.setFont("helvetica", "normal");
    doc.text(`Pedido mínimo ${formatBRL(BUSINESS.pedidoMinimoBRL, currency)}`, margin, cursorY);

    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...GREEN);
    doc.text("SUBTOTAL", pageWidth - margin - 110, cursorY);
    doc.setFontSize(14);
    doc.text(formatBRL(subtotal, currency), pageWidth - margin, cursorY, { align: "right" });
    cursorY += 24;
  } else {
    doc.setFontSize(9);
    doc.setTextColor(...STONE);
    doc.text(
      "Preços apresentados após confirmação do cadastro B2B.",
      margin,
      cursorY,
    );
    cursorY += 18;
  }

  doc.setFontSize(9);
  doc.setTextColor(...STONE);
  doc.setFont("helvetica", "normal");
  doc.text("Produção em 15 dias úteis após confirmação do pedido.", margin, cursorY);
  cursorY += 14;
  doc.text("Orçamento válido por 7 dias. Sujeito a confirmação de estoque.", margin, cursorY);

  // Mensagem
  if (cliente?.mensagem) {
    cursorY += 28;
    doc.setTextColor(...GOLD);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text("OBSERVAÇÕES DO CLIENTE", margin, cursorY);
    cursorY += 14;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...GREEN);
    const split = doc.splitTextToSize(cliente.mensagem, pageWidth - margin * 2);
    doc.text(split, margin, cursorY);
  }

  // Footer
  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setFillColor(...GREEN);
  doc.rect(0, pageHeight - 50, pageWidth, 50, "F");
  doc.setTextColor(232, 224, 207);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("Western · Pedras decorativas autorais", margin, pageHeight - 28);
  doc.text("WhatsApp +55 11 99340-3485", pageWidth - margin, pageHeight - 28, { align: "right" });

  return doc;
}

export function downloadOrcamentoPdf(opts: PdfOptions) {
  const doc = gerarOrcamentoPdf(opts);
  const stamp = new Date()
    .toISOString()
    .replace(/[-:]/g, "")
    .replace("T", "-")
    .slice(0, 13);
  doc.save(`western-orcamento-${stamp}.pdf`);
}
