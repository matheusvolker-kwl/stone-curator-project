import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import SiteLayout from "@/components/layout/SiteLayout";
import Index from "./pages/Index.tsx";
import Linhas from "./pages/Linhas.tsx";
import LinhaPage from "./pages/LinhaPage.tsx";
import Conjuntos from "./pages/Conjuntos.tsx";
import ProductPage from "./pages/ProductPage.tsx";
import About from "./pages/About.tsx";
import Contact from "./pages/Contact.tsx";
import BuyingGuide from "./pages/BuyingGuide.tsx";
import PartnerSignup from "./pages/PartnerSignup.tsx";
import ParceirosArquitetos from "./pages/ParceirosArquitetos.tsx";
import PartnerLogin from "./pages/PartnerLogin.tsx";
import PedirAmostras from "./pages/PedirAmostras.tsx";
import AgendarVisita from "./pages/AgendarVisita.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 1000 * 60 * 5, refetchOnWindowFocus: false } },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner position="top-right" />
      <BrowserRouter>
        <Routes>
          <Route element={<SiteLayout />}>
            <Route path="/" element={<Index />} />
            <Route path="/linhas" element={<Linhas />} />
            <Route path="/linhas/:handle" element={<LinhaPage />} />
            <Route path="/conjuntos" element={<Conjuntos />} />
            <Route path="/produtos/:handle" element={<ProductPage />} />
            <Route path="/guia-de-compra" element={<BuyingGuide />} />
            <Route path="/sobre" element={<About />} />
            <Route path="/contato" element={<Contact />} />
            <Route path="/parceiros-arquitetos" element={<ParceirosArquitetos />} />
            <Route path="/parceiro/cadastro" element={<PartnerSignup />} />
            <Route path="/parceiro/login" element={<PartnerLogin />} />
            <Route path="/pedir-amostras" element={<PedirAmostras />} />
            <Route path="/visitar" element={<AgendarVisita />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
