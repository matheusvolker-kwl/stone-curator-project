import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
// BUSINESS é importado apenas se necessário; manter o footer simples evita acoplamento
import logoHorizontalBranco from "@/assets/brand/logo-horizontal-branco.png";

// ─────────────────────────────────────────────────────────────
// Tipos públicos
// ─────────────────────────────────────────────────────────────
export type PedidoStatus =
  | "aguardando"
  | "em_producao"
  | "controle_qualidade"
  | "pronto"
  | "em_transporte"
  | "entregue"
  | "retirado"
  | "cancelado";

export type PedidoModo = "retirada" | "frete";

export type PedidoScenario = "admin" | "cliente";

export interface PedidoPdfOrder {
  id: string;
  numero: string;
  titulo: string;
  status: PedidoStatus;
  modo_entrega: PedidoModo;
  prazo_dias_uteis: number;
  produzir_ate: string | null;
  previsao_entrega: string | null;
  tracking_code: string | null;
  transportadora: string | null;
  endereco_entrega: string | null;
  valor_total: number | null;
  observacoes_cliente: string | null;
  /** Apenas exibido em PDFs do cenário "admin". */
  observacoes_admin?: string | null;
  created_at: string;
  updated_at: string;
}

export interface PedidoPdfEvent {
  status: PedidoStatus | null;
  note: string | null;
  created_at: string;
}

export interface PedidoPdfPartner {
  nome?: string | null;
  empresa?: string | null;
  cidade?: string | null;
  estado?: string | null;
  telefone?: string | null;
}

export interface PedidoPdfOptions {
  order: PedidoPdfOrder;
  events: PedidoPdfEvent[];
  partner?: PedidoPdfPartner;
  scenario: PedidoScenario;
}

// ─────────────────────────────────────────────────────────────
// Constantes visuais (mesma paleta dos outros PDFs)
// ─────────────────────────────────────────────────────────────
const GREEN: [number, number, number] = [27, 50, 41];
const GOLD: [number, number, number] = [184, 146, 79];
const CREAM: [number, number, number] = [248, 243, 230];
const STONE: [number, number, number] = [110, 102, 90];
const STONE_LINE: [number, number, number] = [220, 214, 200];

const STATUS_LABEL: Record<PedidoStatus, string> = {
  aguardando: "Aguardando início",
  em_producao: "Em produção",
  controle_qualidade: "Controle de qualidade",
  pronto: "Pronto para envio/retirada",
  em_transporte: "Em transporte",
  entregue: "Entregue",
  retirado: "Retirado na fábrica",
  cancelado: "Cancelado",
};

const TIMELINE_FRETE: PedidoStatus[] = [
  "aguardando",
  "em_producao",
  "controle_qualidade",
  "pronto",
  "em_transporte",
  "entregue",
];
const TIMELINE_RETIRADA: PedidoStatus[] = [
  "aguardando",
  "em_producao",
  "controle_qualidade",
  "pronto",
  "retirado",
];

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────
function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function fmtDateTime(iso: string): string {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function fmtBRL(n: number | null): string {
  if (n == null) return "—";
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function shortId(): string {
  return Math.random().toString(36).slice(2, 7).toUpperCase();
}

async function loadDataUrl(url: string): Promise<string | null> {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    return await new Promise<string>((resolve, reject) => {
      const r = new FileReader();
      r.onloadend = () => resolve(r.result as string);
      r.onerror = reject;
      r.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

/**
 * Nome único e identificador do arquivo por cenário, garantindo que admin e
 * cliente nunca colidam ao baixar o mesmo pedido.
 *   admin   → western-pedido-{numero}-admin-{YYYYMMDD-HHMM}-{rand}.pdf
 *   cliente → western-pedido-{numero}-cliente-{rand}.pdf
 */
export function buildPedidoPdfFilename(
  numero: string,
  scenario: PedidoScenario,
): string {
  const safeNumero = numero.replace(/[^A-Za-z0-9._-]/g, "_") || "SN";
  if (scenario === "admin") {
    const stamp = new Date()
      .toISOString()
      .replace(/[-:]/g, "")
      .replace("T", "-")
      .slice(0, 13);
    return `western-pedido-${safeNumero}-admin-${stamp}-${shortId()}.pdf`;
  }
  return `western-pedido-${safeNumero}-cliente-${shortId()}.pdf`;
}

// ─────────────────────────────────────────────────────────────
// Geração do PDF
// ─────────────────────────────────────────────────────────────
export async function gerarPedidoPdf(opts: PedidoPdfOptions): Promise<jsPDF> {
  const { order, events, partner, scenario } = opts;
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const M = 18;
  let y = 0;

  // ── Header ───────────────────────────────────────────────
  doc.setFillColor(...GREEN);
  doc.rect(0, 0, pageW, 38, "F");

  const logoData = await loadDataUrl(logoHorizontalBranco);
  if (logoData) {
    doc.addImage(logoData, "PNG", M, 10, 42, 18);
  } else {
    doc.setTextColor(...CREAM);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("WESTERN", M, 22);
  }

  doc.setTextColor(...CREAM);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text(
    scenario === "admin"
      ? "Cópia administrativa · uso interno"
      : "Cópia do parceiro · acompanhamento de pedido",
    pageW - M,
    16,
    { align: "right" },
  );
  doc.setFontSize(7);
  doc.text(
    `Pedido Nº ${order.numero}  ·  Emitido em ${fmtDateTime(new Date().toISOString())}`,
    pageW - M,
    22,
    { align: "right" },
  );

  y = 48;

  // ── Título ───────────────────────────────────────────────
  doc.setTextColor(...GREEN);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  const titleLines = doc.splitTextToSize(order.titulo, pageW - 2 * M);
  doc.text(titleLines, M, y);
  y += titleLines.length * 7 + 2;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...STONE);
  doc.text(
    `Status atual: ${STATUS_LABEL[order.status]}  ·  Última atualização ${fmtDateTime(order.updated_at)}`,
    M,
    y,
  );
  y += 8;

  // ── Bloco parceiro (sempre visível) ──────────────────────
  if (partner) {
    doc.setDrawColor(...STONE_LINE);
    doc.setFillColor(...CREAM);
    doc.rect(M, y, pageW - 2 * M, 18, "FD");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...GOLD);
    doc.text("PARCEIRO", M + 4, y + 5);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...GREEN);
    const linhaParceiro = [
      partner.empresa,
      partner.nome,
      [partner.cidade, partner.estado].filter(Boolean).join("/"),
      partner.telefone,
    ]
      .filter(Boolean)
      .join("  ·  ");
    doc.text(linhaParceiro || "—", M + 4, y + 12);
    y += 22;
  }

  // ── Quadro de status: prazos / modo / rastreio ───────────
  doc.setDrawColor(...STONE_LINE);
  doc.setLineWidth(0.3);
  doc.rect(M, y, pageW - 2 * M, 36);

  const colW = (pageW - 2 * M) / 3;

  // Coluna 1 — Modo
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...GOLD);
  doc.text("MODO DE ENTREGA", M + 4, y + 6);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(...GREEN);
  doc.text(
    order.modo_entrega === "retirada" ? "Retirada na fábrica" : "Frete",
    M + 4,
    y + 13,
  );
  if (order.modo_entrega === "frete" && order.endereco_entrega) {
    doc.setFontSize(8);
    doc.setTextColor(...STONE);
    const enderecoLines = doc.splitTextToSize(order.endereco_entrega, colW - 8);
    doc.text(enderecoLines.slice(0, 3), M + 4, y + 19);
  }

  // Coluna 2 — Prazos
  const x2 = M + colW;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...GOLD);
  doc.text("PRAZOS", x2 + 4, y + 6);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...GREEN);
  doc.text(`Produção: ${order.prazo_dias_uteis} dias úteis`, x2 + 4, y + 13);
  doc.text(`Pronto até: ${fmtDate(order.produzir_ate)}`, x2 + 4, y + 19);
  doc.text(
    `${order.modo_entrega === "retirada" ? "Disponível em" : "Previsão entrega"}: ${fmtDate(order.previsao_entrega)}`,
    x2 + 4,
    y + 25,
  );

  // Coluna 3 — Rastreio / valor
  const x3 = M + colW * 2;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...GOLD);
  doc.text(
    order.modo_entrega === "frete" ? "RASTREIO" : "VALOR",
    x3 + 4,
    y + 6,
  );
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...GREEN);
  if (order.modo_entrega === "frete") {
    doc.text(order.transportadora || "Transportadora —", x3 + 4, y + 13);
    doc.setFont("courier", "normal");
    doc.text(order.tracking_code || "Sem código ainda", x3 + 4, y + 19);
    doc.setFont("helvetica", "normal");
    if (order.valor_total != null) {
      doc.setTextColor(...STONE);
      doc.setFontSize(8);
      doc.text(`Valor: ${fmtBRL(order.valor_total)}`, x3 + 4, y + 27);
    }
  } else {
    doc.setFontSize(11);
    doc.text(fmtBRL(order.valor_total), x3 + 4, y + 13);
  }

  y += 42;

  // ── Linha de produção (timeline visual) ──────────────────
  const steps = order.modo_entrega === "retirada" ? TIMELINE_RETIRADA : TIMELINE_FRETE;
  const currentIdx = steps.indexOf(order.status);
  const isCancelled = order.status === "cancelado";

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...GREEN);
  doc.text("LINHA DE PRODUÇÃO", M, y);
  y += 4;

  if (isCancelled) {
    doc.setFont("helvetica", "italic");
    doc.setTextColor(220, 50, 50);
    doc.text("Pedido cancelado.", M, y + 5);
    y += 10;
  } else {
    const stepW = (pageW - 2 * M) / steps.length;
    const lineY = y + 6;
    // base line
    doc.setDrawColor(...STONE_LINE);
    doc.setLineWidth(0.6);
    doc.line(M + 4, lineY, pageW - M - 4, lineY);
    // progress line
    if (currentIdx >= 0) {
      doc.setDrawColor(...GOLD);
      doc.setLineWidth(0.8);
      doc.line(M + 4, lineY, M + 4 + stepW * currentIdx, lineY);
    }
    steps.forEach((s, i) => {
      const cx = M + 4 + stepW * i;
      const reached = i <= currentIdx;
      doc.setFillColor(...(reached ? GOLD : STONE_LINE));
      doc.circle(cx, lineY, 1.6, "F");
      doc.setFont("helvetica", reached ? "bold" : "normal");
      doc.setFontSize(7);
      doc.setTextColor(...(reached ? GREEN : STONE));
      const lbl = doc.splitTextToSize(STATUS_LABEL[s], stepW - 2);
      doc.text(lbl, cx, lineY + 5, { align: "left", maxWidth: stepW - 2 });
    });
    y = lineY + 14;
  }

  // ── Observações ──────────────────────────────────────────
  if (order.observacoes_cliente) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...GREEN);
    doc.text("OBSERVAÇÕES", M, y);
    y += 4;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...STONE);
    const lines = doc.splitTextToSize(order.observacoes_cliente, pageW - 2 * M);
    doc.text(lines, M, y + 4);
    y += lines.length * 4 + 6;
  }

  if (scenario === "admin" && order.observacoes_admin) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...GOLD);
    doc.text("NOTAS INTERNAS (ADMIN)", M, y);
    y += 4;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...STONE);
    const lines = doc.splitTextToSize(order.observacoes_admin, pageW - 2 * M);
    doc.text(lines, M, y + 4);
    y += lines.length * 4 + 6;
  }

  // ── Histórico ────────────────────────────────────────────
  if (y > pageH - 60) {
    doc.addPage();
    y = M;
  }
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...GREEN);
  doc.text("HISTÓRICO DE ATUALIZAÇÕES", M, y);
  y += 3;

  if (events.length === 0) {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    doc.setTextColor(...STONE);
    doc.text("Nenhuma atualização registrada ainda.", M, y + 5);
    y += 10;
  } else {
    autoTable(doc, {
      startY: y + 2,
      head: [["Data/Hora", "Status", "Anotação"]],
      body: events.map((ev) => [
        fmtDateTime(ev.created_at),
        ev.status ? STATUS_LABEL[ev.status] : "—",
        ev.note ?? "—",
      ]),
      theme: "grid",
      headStyles: {
        fillColor: GREEN,
        textColor: CREAM,
        fontStyle: "bold",
        fontSize: 8,
      },
      bodyStyles: { fontSize: 8, textColor: GREEN },
      alternateRowStyles: { fillColor: [250, 247, 238] },
      styles: { cellPadding: 2.2, lineColor: STONE_LINE, lineWidth: 0.1 },
      columnStyles: {
        0: { cellWidth: 36 },
        1: { cellWidth: 42 },
        2: { cellWidth: "auto" },
      },
      margin: { left: M, right: M },
    });
  }

  // ── Footer em todas as páginas ───────────────────────────
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setDrawColor(...STONE_LINE);
    doc.setLineWidth(0.2);
    doc.line(M, pageH - 14, pageW - M, pageH - 14);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...STONE);
    doc.text(
      `Western Pedras Naturais  ·  Pedido Nº ${order.numero}  ·  ${scenario === "admin" ? "Cópia admin" : "Cópia parceiro"}`,
      M,
      pageH - 9,
    );
    doc.text(`${i} / ${pageCount}`, pageW - M, pageH - 9, { align: "right" });
  }

  return doc;
}

/** Gera e dispara o download do PDF do pedido. Retorna o filename usado. */
export async function downloadPedidoPdf(opts: PedidoPdfOptions): Promise<string> {
  const doc = await gerarPedidoPdf(opts);
  const filename = buildPedidoPdfFilename(opts.order.numero, opts.scenario);
  doc.save(filename);
  return filename;
}
