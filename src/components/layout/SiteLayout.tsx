import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import CartDrawer from "./CartDrawer";
import TopBar from "./TopBar";
import WhatsAppFAB from "./WhatsAppFAB";
import { useCartSync } from "@/hooks/useCartSync";

export default function SiteLayout() {
  const [cartOpen, setCartOpen] = useState(false);
  useCartSync();

  useEffect(() => {
    const handler = () => setCartOpen(true);
    window.addEventListener("western:open-cart", handler);
    return () => window.removeEventListener("western:open-cart", handler);
  }, []);

  return (
    <div className="relative min-h-screen flex flex-col bg-western-ivory">
      {/* Skip-to-content para usuários de teclado/leitor de tela */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:bg-western-green-deep focus:text-western-cream focus:px-4 focus:py-2 focus:font-mono focus:text-xs focus:uppercase focus:tracking-[0.2em] focus:outline focus:outline-2 focus:outline-western-gold"
      >
        Pular para o conteúdo
      </a>
      <TopBar />
      <Header onCartOpen={() => setCartOpen(true)} />
      <main id="main-content" className="flex-1 relative z-10" tabIndex={-1}>
        <Outlet context={{ openCart: () => setCartOpen(true) }} />
      </main>
      <Footer />
      <CartDrawer open={cartOpen} onOpenChange={setCartOpen} />
      <WhatsAppFAB />
    </div>
  );
}
