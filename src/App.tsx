import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import { WishlistProvider } from "@/hooks/useWishlist";
import RequireAuth from "@/components/auth/RequireAuth";
import SiteLayout from "@/components/layout/SiteLayout";
import ScrollToTop from "@/components/ScrollToTop";
import Index from "./pages/Index.tsx";
import AdminLayout from "@/components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminPartners from "./pages/admin/AdminPartners";
import AdminLeads from "./pages/admin/AdminLeads";
import AdminSamples from "./pages/admin/AdminSamples";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminSettings from "./pages/admin/AdminSettings";
import AccountLayout from "@/components/account/AccountLayout";
import AccountIndex from "./pages/account/AccountIndex";
import AccountProfile from "./pages/account/AccountProfile";
import AccountQuotes from "./pages/account/AccountQuotes";
import AccountOrders from "./pages/account/AccountOrders";
import AccountSketches from "./pages/account/AccountSketches";
import AccountFavorites from "./pages/account/AccountFavorites";
import AccountSamples from "./pages/account/AccountSamples";
import AccountPreferences from "./pages/account/AccountPreferences";

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

import ResetPassword from "./pages/ResetPassword.tsx";
import PedirAmostras from "./pages/PedirAmostras.tsx";
import AgendarVisita from "./pages/AgendarVisita.tsx";
import PorQueWestern from "./pages/PorQueWestern.tsx";
import AplicacoesComerciais from "./pages/AplicacoesComerciais.tsx";
import FAQ from "./pages/FAQ.tsx";
import PoliticaComercial from "./pages/legal/PoliticaComercial.tsx";
import PoliticaEntrega from "./pages/legal/PoliticaEntrega.tsx";
import TrocasAvarias from "./pages/legal/TrocasAvarias.tsx";
import PoliticaPrivacidade from "./pages/legal/PoliticaPrivacidade.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 1000 * 60 * 5, refetchOnWindowFocus: false } },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner position="top-right" />
      <BrowserRouter>
        <ScrollToTop />
        <AuthProvider>
          <WishlistProvider>
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
              <Route path="/parceiro/redefinir-senha" element={<ResetPassword />} />
              <Route path="/parceiro/conta" element={<Navigate to="/minha-conta" replace />} />
              <Route
                path="/minha-conta"
                element={
                  <RequireAuth>
                    <AccountLayout />
                  </RequireAuth>
                }
              >
                <Route index element={<AccountIndex />} />
                <Route path="perfil" element={<AccountProfile />} />
                <Route path="orcamentos" element={<AccountQuotes />} />
                <Route path="pedidos" element={<AccountOrders />} />
                <Route path="sketches" element={<AccountSketches />} />
                <Route path="favoritos" element={<AccountFavorites />} />
                <Route path="amostras" element={<AccountSamples />} />
                <Route path="preferencias" element={<AccountPreferences />} />
              </Route>
              <Route
                path="/admin"
                element={
                  <RequireAuth adminOnly>
                    <AdminLayout />
                  </RequireAuth>
                }
              >
                <Route index element={<AdminDashboard />} />
                <Route path="parceiros" element={<AdminPartners />} />
                <Route path="leads" element={<AdminLeads />} />
                <Route path="amostras" element={<AdminSamples />} />
                <Route path="usuarios" element={<AdminUsers />} />
                <Route path="configuracoes" element={<AdminSettings />} />
              </Route>
              <Route
                path="/pedir-amostras"
                element={
                  <RequireAuth approvedOnly>
                    <PedirAmostras />
                  </RequireAuth>
                }
              />
              <Route path="/visitar" element={<AgendarVisita />} />
              <Route path="/por-que-western" element={<PorQueWestern />} />
              <Route path="/aplicacoes-comerciais" element={<AplicacoesComerciais />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/politica-comercial" element={<PoliticaComercial />} />
              <Route path="/politica-de-entrega" element={<PoliticaEntrega />} />
              <Route path="/trocas-e-avarias" element={<TrocasAvarias />} />
              <Route path="/privacidade" element={<PoliticaPrivacidade />} />
              <Route path="/parceiro/favoritos" element={<Navigate to="/minha-conta/favoritos" replace />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
          </WishlistProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
