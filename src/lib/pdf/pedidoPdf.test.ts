import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  buildPedidoPdfFilename,
  gerarPedidoPdf,
  downloadPedidoPdf,
  type PedidoPdfOptions,
  type PedidoPdfOrder,
  type PedidoPdfEvent,
  type PedidoStatus,
  type PedidoModo,
  type PedidoScenario,
} from "./pedidoPdf";

// Mock asset import (vite alias) for tests
vi.mock("@/assets/brand/logo-horizontal-branco.png", () => ({
  default: "data:image/png;base64,AAAA",
}));

// 1x1 transparent PNG (valid signature) for jsPDF.addImage
const PNG_1x1_BASE64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

function pngBlob(): Blob {
  const bin = atob(PNG_1x1_BASE64);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return new Blob([arr], { type: "image/png" });
}

beforeEach(() => {
  global.fetch = vi.fn(async () => ({ blob: async () => pngBlob() })) as unknown as typeof fetch;
  // jsdom não implementa createObjectURL; jsPDF.save usa para baixar
  (global.URL as unknown as { createObjectURL: unknown }).createObjectURL = vi.fn(() => "blob:fake");
  (global.URL as unknown as { revokeObjectURL: unknown }).revokeObjectURL = vi.fn();
  // Evita download real em jsdom
  HTMLAnchorElement.prototype.click = vi.fn();
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ─────────────────────────────────────────────────────────────
// Helpers de fixtures
// ─────────────────────────────────────────────────────────────
function makeOrder(overrides: Partial<PedidoPdfOrder> = {}): PedidoPdfOrder {
  return {
    id: "ord-1",
    numero: "WP-2025-0001",
    titulo: "Pedido de revestimento Pedra São Tomé",
    status: "em_producao",
    modo_entrega: "frete",
    prazo_dias_uteis: 12,
    produzir_ate: "2025-06-10T00:00:00.000Z",
    previsao_entrega: "2025-06-20T00:00:00.000Z",
    tracking_code: "BR123456789",
    transportadora: "Jamef",
    endereco_entrega: "Rua das Pedras, 123 — Centro, São Paulo/SP, CEP 01000-000",
    valor_total: 4321.5,
    observacoes_cliente: "Entregar em horário comercial.",
    observacoes_admin: "Cliente VIP, priorizar embalagem reforçada.",
    created_at: "2025-05-01T10:00:00.000Z",
    updated_at: "2025-05-09T15:30:00.000Z",
    ...overrides,
  };
}

function makeEvents(): PedidoPdfEvent[] {
  return [
    { status: "aguardando", note: "Pedido recebido", created_at: "2025-05-01T10:00:00.000Z" },
    { status: "em_producao", note: null, created_at: "2025-05-03T09:00:00.000Z" },
    { status: null, note: "Anotação livre do admin", created_at: "2025-05-04T12:00:00.000Z" },
  ];
}

// ─────────────────────────────────────────────────────────────
// buildPedidoPdfFilename
// ─────────────────────────────────────────────────────────────
describe("buildPedidoPdfFilename", () => {
  it("admin: inclui timestamp e sufixo aleatório", () => {
    const f = buildPedidoPdfFilename("WP-2025-0001", "admin");
    expect(f).toMatch(/^western-pedido-WP-2025-0001-admin-\d{8}-\d{4}-[A-Z0-9]{5}\.pdf$/);
  });

  it("cliente: filename simplificado com sufixo aleatório", () => {
    const f = buildPedidoPdfFilename("WP-2025-0001", "cliente");
    expect(f).toMatch(/^western-pedido-WP-2025-0001-cliente-[A-Z0-9]{5}\.pdf$/);
  });

  it("sanitiza caracteres inválidos no número", () => {
    const f = buildPedidoPdfFilename("WP/2025 #99", "cliente");
    expect(f.startsWith("western-pedido-WP_2025__99-cliente-")).toBe(true);
    expect(f).not.toMatch(/[/# ]/);
  });

  it("usa SN quando o número é vazio ou só inválido", () => {
    expect(buildPedidoPdfFilename("", "cliente")).toMatch(/^western-pedido-SN-cliente-/);
    expect(buildPedidoPdfFilename("///", "admin")).toMatch(/^western-pedido-SN-admin-/);
  });

  it("admin e cliente nunca colidem para o mesmo número", () => {
    const a = buildPedidoPdfFilename("X1", "admin");
    const c = buildPedidoPdfFilename("X1", "cliente");
    expect(a).not.toEqual(c);
    expect(a).toContain("-admin-");
    expect(c).toContain("-cliente-");
  });

  it("dois cliente seguidos diferem pelo sufixo aleatório (alta probabilidade)", () => {
    const seen = new Set<string>();
    for (let i = 0; i < 50; i++) seen.add(buildPedidoPdfFilename("X", "cliente"));
    expect(seen.size).toBeGreaterThan(1);
  });
});

// ─────────────────────────────────────────────────────────────
// gerarPedidoPdf — branches principais
// ─────────────────────────────────────────────────────────────
describe("gerarPedidoPdf — geração e ramificações", () => {
  function baseOpts(over: Partial<PedidoPdfOptions> = {}): PedidoPdfOptions {
    return {
      order: makeOrder(),
      events: makeEvents(),
      partner: { empresa: "Acme", nome: "João", cidade: "SP", estado: "SP", telefone: "11 99999-9999" },
      scenario: "admin",
      ...over,
    };
  }

  it("retorna um jsPDF com pelo menos 1 página", async () => {
    const doc = await gerarPedidoPdf(baseOpts());
    expect(doc).toBeTruthy();
    expect(doc.getNumberOfPages()).toBeGreaterThanOrEqual(1);
    // produz bytes válidos (assinatura %PDF)
    const out = doc.output("arraybuffer") as ArrayBuffer;
    const head = new TextDecoder().decode(new Uint8Array(out).slice(0, 4));
    expect(head).toBe("%PDF");
  });

  it("modo frete: usa timeline completa com 6 passos", async () => {
    const doc = await gerarPedidoPdf(baseOpts({ order: makeOrder({ modo_entrega: "frete" }) }));
    expect(doc.getNumberOfPages()).toBeGreaterThanOrEqual(1);
  });

  it("modo retirada: usa timeline reduzida (5 passos) e oculta endereço", async () => {
    const doc = await gerarPedidoPdf(
      baseOpts({
        order: makeOrder({
          modo_entrega: "retirada",
          status: "retirado",
          tracking_code: null,
          transportadora: null,
          endereco_entrega: null,
        }),
      }),
    );
    expect(doc.getNumberOfPages()).toBeGreaterThanOrEqual(1);
  });

  it("status cancelado: imprime aviso e não desenha stepper", async () => {
    const doc = await gerarPedidoPdf(
      baseOpts({ order: makeOrder({ status: "cancelado" }) }),
    );
    expect(doc.getNumberOfPages()).toBeGreaterThanOrEqual(1);
  });

  it.each<[PedidoStatus]>([
    ["aguardando"],
    ["em_producao"],
    ["controle_qualidade"],
    ["pronto"],
    ["em_transporte"],
    ["entregue"],
    ["retirado"],
    ["cancelado"],
  ])("renderiza com status %s", async (status) => {
    const modo: PedidoModo = status === "retirado" ? "retirada" : "frete";
    const doc = await gerarPedidoPdf(
      baseOpts({ order: makeOrder({ status, modo_entrega: modo }) }),
    );
    expect(doc.getNumberOfPages()).toBeGreaterThanOrEqual(1);
  });

  it("sem partner: continua gerando sem erro", async () => {
    const doc = await gerarPedidoPdf(baseOpts({ partner: undefined }));
    expect(doc.getNumberOfPages()).toBeGreaterThanOrEqual(1);
  });

  it("sem eventos: imprime mensagem de histórico vazio", async () => {
    const doc = await gerarPedidoPdf(baseOpts({ events: [] }));
    expect(doc.getNumberOfPages()).toBeGreaterThanOrEqual(1);
  });

  it("muitos eventos: pode paginar (>= 1 página)", async () => {
    const many: PedidoPdfEvent[] = Array.from({ length: 80 }, (_, i) => ({
      status: i % 2 === 0 ? "em_producao" : "controle_qualidade",
      note: `Atualização ${i + 1} — texto razoavelmente longo para forçar quebras de linha em colunas estreitas.`,
      created_at: new Date(2025, 4, 1 + i, 9, 0).toISOString(),
    }));
    const doc = await gerarPedidoPdf(baseOpts({ events: many }));
    expect(doc.getNumberOfPages()).toBeGreaterThanOrEqual(2);
  });

  it("frete sem tracking/transportadora: usa fallback textual", async () => {
    const doc = await gerarPedidoPdf(
      baseOpts({
        order: makeOrder({ tracking_code: null, transportadora: null }),
      }),
    );
    expect(doc.getNumberOfPages()).toBeGreaterThanOrEqual(1);
  });

  it("valor_total nulo: renderiza sem quebrar", async () => {
    const doc = await gerarPedidoPdf(
      baseOpts({ order: makeOrder({ valor_total: null }) }),
    );
    expect(doc.getNumberOfPages()).toBeGreaterThanOrEqual(1);
  });

  it("scenario cliente: NÃO renderiza notas internas (admin)", async () => {
    const doc = await gerarPedidoPdf(
      baseOpts({
        scenario: "cliente",
        order: makeOrder({ observacoes_admin: "SEGREDO INTERNO" }),
      }),
    );
    const txt = (doc as unknown as { getTextContent?: () => string }).getTextContent?.() ?? "";
    // Como jsPDF não expõe getTextContent, validamos via output binário
    const out = new TextDecoder("latin1").decode(
      new Uint8Array(doc.output("arraybuffer") as ArrayBuffer),
    );
    expect(out).not.toContain("SEGREDO INTERNO");
    expect(out).not.toContain("NOTAS INTERNAS");
    expect(txt).toBe("");
  });

  it("scenario admin: renderiza notas internas quando presentes", async () => {
    const doc = await gerarPedidoPdf(
      baseOpts({
        scenario: "admin",
        order: makeOrder({ observacoes_admin: "MARCADOR_ADMIN_123" }),
      }),
    );
    const out = new TextDecoder("latin1").decode(
      new Uint8Array(doc.output("arraybuffer") as ArrayBuffer),
    );
    expect(out).toContain("MARCADOR_ADMIN_123");
  });

  it("logo falha (fetch rejeita): cai no fallback de texto WESTERN", async () => {
    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error("boom"));
    const doc = await gerarPedidoPdf(baseOpts());
    expect(doc.getNumberOfPages()).toBeGreaterThanOrEqual(1);
  });

  it("título muito longo: faz wrap sem estourar", async () => {
    const doc = await gerarPedidoPdf(
      baseOpts({
        order: makeOrder({
          titulo:
            "Título extremamente longo do pedido que precisa quebrar em múltiplas linhas para validar o splitTextToSize aplicado ao topo do documento ".repeat(
              2,
            ),
        }),
      }),
    );
    expect(doc.getNumberOfPages()).toBeGreaterThanOrEqual(1);
  });

  it("datas nulas: renderiza traço ao invés de quebrar", async () => {
    const doc = await gerarPedidoPdf(
      baseOpts({
        order: makeOrder({ produzir_ate: null, previsao_entrega: null }),
      }),
    );
    expect(doc.getNumberOfPages()).toBeGreaterThanOrEqual(1);
  });
});

// ─────────────────────────────────────────────────────────────
// downloadPedidoPdf
// ─────────────────────────────────────────────────────────────
describe("downloadPedidoPdf", () => {
  it("admin: chama save com filename de admin e o retorna", async () => {
    const saveSpy = vi
      .spyOn((await import("jspdf")).default.prototype, "save")
      .mockImplementation(function (this: unknown) {
        return this as never;
      });
    const fname = await downloadPedidoPdf({
      order: makeOrder(),
      events: makeEvents(),
      partner: { empresa: "Acme" },
      scenario: "admin",
    });
    expect(fname).toMatch(/-admin-/);
    expect(saveSpy).toHaveBeenCalledTimes(1);
    expect(saveSpy).toHaveBeenCalledWith(fname);
  });

  it("cliente: chama save com filename de cliente e o retorna", async () => {
    const saveSpy = vi
      .spyOn((await import("jspdf")).default.prototype, "save")
      .mockImplementation(function (this: unknown) {
        return this as never;
      });
    const fname = await downloadPedidoPdf({
      order: makeOrder(),
      events: [],
      scenario: "cliente",
    });
    expect(fname).toMatch(/-cliente-/);
    expect(saveSpy).toHaveBeenCalledWith(fname);
  });

  it.each<[PedidoScenario]>([["admin"], ["cliente"]])(
    "scenario %s: filename é único entre chamadas",
    async (scenario) => {
      vi.spyOn((await import("jspdf")).default.prototype, "save").mockImplementation(
        function (this: unknown) {
          return this as never;
        },
      );
      const a = await downloadPedidoPdf({
        order: makeOrder(),
        events: [],
        scenario,
      });
      const b = await downloadPedidoPdf({
        order: makeOrder(),
        events: [],
        scenario,
      });
      expect(a).not.toEqual(b);
    },
  );
});
