import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { DataTable, type Coluna } from "./DataTable";

/**
 * Estes testes travam a INVARIANTE do backoffice: um erro NUNCA pode se
 * disfarçar de lista vazia. Foi esse bug ("0 silencioso") que escondeu um
 * parceiro pendente e deixou o dono cego no painel antigo.
 */

interface Linha {
  id: string;
  empresa: string;
  valor: number;
}

const colunas: Coluna<Linha>[] = [
  { key: "empresa", header: "Empresa", render: (r) => r.empresa, sortable: true },
  { key: "valor", header: "Valor", render: (r) => r.valor, align: "right", sortable: true },
];

const linhas: Linha[] = [
  { id: "a", empresa: "Crystal Pool", valor: 300 },
  { id: "b", empresa: "Acqualeste", valor: 100 },
  { id: "c", empresa: "Genesis", valor: 200 },
];

const base = { colunas, getId: (r: Linha) => r.id };

describe("DataTable — os 4 estados", () => {
  it("ERRO ganha de tudo e mostra a mensagem real, nunca 'vazio'", () => {
    render(
      <DataTable
        {...base}
        linhas={[]}
        isLoading
        error={{ message: "permission denied for table partner_profiles" }}
        vazio={{ titulo: "Nenhum parceiro pendente" }}
      />,
    );

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText(/permission denied/i)).toBeInTheDocument();
    // O texto de vazio NÃO pode aparecer — este é o coração do bug.
    expect(screen.queryByText("Nenhum parceiro pendente")).not.toBeInTheDocument();
  });

  it("erro oferece 'Tentar de novo'", async () => {
    const onRetry = vi.fn();
    render(<DataTable {...base} linhas={[]} error={new Error("falhou")} onRetry={onRetry} />);

    fireEvent.click(screen.getByRole("button", { name: /tentar de novo/i }));
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it("vazio (sem erro) mostra a mensagem de vazio, sem alerta", () => {
    render(
      <DataTable
        {...base}
        linhas={[]}
        vazio={{ titulo: "Nenhum parceiro pendente", mensagem: "Aparece aqui quando alguém se credenciar." }}
      />,
    );

    expect(screen.getByText("Nenhum parceiro pendente")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("carregando não mostra vazio nem erro", () => {
    render(<DataTable {...base} linhas={[]} isLoading vazio={{ titulo: "Nenhum parceiro" }} />);

    expect(screen.queryByText("Nenhum parceiro")).not.toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("sucesso renderiza as linhas", () => {
    render(<DataTable {...base} linhas={linhas} />);
    expect(screen.getAllByText("Crystal Pool").length).toBeGreaterThan(0);
  });
});

describe("DataTable — ordenação e seleção", () => {
  it("ordena por coluna sem sortValue (cai no campo homônimo)", async () => {
    render(<DataTable {...base} linhas={linhas} />);

    fireEvent.click(screen.getByRole("button", { name: /empresa/i }));

    const celulas = screen.getAllByRole("cell").map((c) => c.textContent);
    // asc: Acqualeste < Crystal Pool < Genesis
    expect(celulas[0]).toBe("Acqualeste");
  });

  it("seleção: 'selecionar todos' marca todas as linhas", async () => {
    const onChange = vi.fn();
    render(
      <DataTable
        {...base}
        linhas={linhas}
        selecao={{ selecionados: new Set(), onChange }}
      />,
    );

    fireEvent.click(screen.getAllByLabelText(/selecionar todas as linhas/i)[0]);
    expect(onChange).toHaveBeenCalledWith(new Set(["a", "b", "c"]));
  });

  it("clicar no checkbox NÃO dispara o onRowClick da linha", async () => {
    const onRowClick = vi.fn();
    const onChange = vi.fn();
    render(
      <DataTable
        {...base}
        linhas={linhas}
        onRowClick={onRowClick}
        selecao={{ selecionados: new Set(), onChange }}
      />,
    );

    fireEvent.click(screen.getAllByLabelText("Selecionar linha")[0]);
    expect(onChange).toHaveBeenCalled();
    expect(onRowClick).not.toHaveBeenCalled();
  });
});
