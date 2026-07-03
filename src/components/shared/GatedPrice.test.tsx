import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import GatedPrice from "./GatedPrice";

vi.mock("@/hooks/useAuth", () => ({
  useAuth: vi.fn(),
}));
import { useAuth } from "@/hooks/useAuth";

function setAuth(over: Partial<ReturnType<typeof useAuth>>) {
  (useAuth as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
    session: null,
    user: null,
    loading: false,
    isPartner: false,
    isApproved: false,
    isAdmin: false,
    partnerStatus: null,
    empresa: null,
    refresh: vi.fn(),
    signOut: vi.fn(),
    ...over,
  } as any);
}

const renderGated = (props: any = {}) =>
  render(
    <MemoryRouter>
      <GatedPrice amount={1234.5} {...props} />
    </MemoryRouter>
  );

describe("GatedPrice", () => {
  it("mostra o valor formatado para parceiro aprovado", () => {
    setAuth({ isApproved: true });
    renderGated();
    expect(screen.getByText(/R\$\s*1\.234,50/)).toBeInTheDocument();
  });

  it("mostra fallback de login para visitante", () => {
    setAuth({ isApproved: false, session: null });
    renderGated();
    expect(screen.getByText(/Ver preço de parceiro/i)).toBeInTheDocument();
    expect(screen.queryByText(/1\.234,50/)).not.toBeInTheDocument();
  });

  it("mostra 'Aguardando aprovação' para usuário logado pendente", () => {
    setAuth({ isApproved: false, session: { user: {} } as any });
    renderGated();
    expect(screen.getByText(/Aguardando aprovação/i)).toBeInTheDocument();
  });

  it("variant=hidden não renderiza nada para visitante", () => {
    setAuth({ isApproved: false });
    const { container } = renderGated({ variant: "hidden" });
    expect(container).toBeEmptyDOMElement();
  });
});
