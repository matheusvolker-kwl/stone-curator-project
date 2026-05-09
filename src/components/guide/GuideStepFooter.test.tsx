import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import GuideStepFooter from "./GuideStepFooter";
import { useCartStore } from "@/stores/cartStore";

vi.mock("@/hooks/useAuth", () => ({ useAuth: vi.fn() }));
import { useAuth } from "@/hooks/useAuth";

class IO {
  observe() {}
  disconnect() {}
  unobserve() {}
}
(globalThis as any).IntersectionObserver = IO;

beforeEach(() => {
  useCartStore.setState({ items: [] } as any);
  (useAuth as any).mockReturnValue({ isApproved: false, session: null } as any);
});

function withItem() {
  useCartStore.setState({
    items: [
      {
        variantId: "v1",
        productId: "p1",
        productTitle: "Cascata",
        productImage: null,
        variantTitle: "Default Title",
        price: { amount: "1000.00", currencyCode: "BRL" },
        quantity: 2,
      },
    ],
  } as any);
}

describe("GuideStepFooter", () => {
  it("dispara onNext ao clicar em Próximo", () => {
    const onNext = vi.fn();
    render(
      <MemoryRouter>
        <GuideStepFooter onNext={onNext} nextLabel="Avançar" />
      </MemoryRouter>
    );
    fireEvent.click(screen.getByRole("button", { name: /Avançar/ }));
    expect(onNext).toHaveBeenCalled();
  });

  it("dispara onBack quando fornecido", () => {
    const onBack = vi.fn();
    render(
      <MemoryRouter>
        <GuideStepFooter onBack={onBack} onNext={() => {}} nextLabel="Avançar" />
      </MemoryRouter>
    );
    fireEvent.click(screen.getByRole("button", { name: /Voltar/ }));
    expect(onBack).toHaveBeenCalled();
  });

  it("oculta o valor para visitantes mesmo com itens no carrinho", () => {
    withItem();
    render(
      <MemoryRouter>
        <GuideStepFooter onNext={() => {}} nextLabel="Avançar" />
      </MemoryRouter>
    );
    expect(screen.queryByText(/2\.000,00/)).not.toBeInTheDocument();
    expect(screen.getAllByText(/Login para preço/i).length).toBeGreaterThan(0);
  });

  it("mostra o valor para parceiro aprovado", () => {
    withItem();
    (useAuth as any).mockReturnValue({ isApproved: true, session: { user: {} } } as any);
    render(
      <MemoryRouter>
        <GuideStepFooter onNext={() => {}} nextLabel="Avançar" />
      </MemoryRouter>
    );
    expect(screen.getByText(/R\$\s*2\.000,00/)).toBeInTheDocument();
  });
});
