import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import { WishlistProvider } from "@/hooks/useWishlist";
import RequireAuth from "@/components/auth/RequireAuth";
import SiteLayout from "@/components/layout/SiteLayout";
import ScrollToTop from "@/components/ScrollToTop";
import Index from "./pages/Index.tsx"; // home eager: maior chance de ser primeira rota
import ComingSoon from "./pages/ComingSoon.tsx";

// =====================================================================
// PRÉ-LANÇAMENTO
// HOLDING_PAGE = true  -> "/" mostra a página "LANÇAMENTO EM BREVE" em tela
//                         cheia (fora do SiteLayout). A loja real continua
//                         acessível em "/inicio" e todas as demais rotas
//                         seguem funcionando normalmente.
// HOLDING_PAGE = false -> "/" volta a ser a home da loja (<Index/>) e a
//                         ComingSoon some completamente. Para reverter no
//                         lançamento basta trocar a flag abaixo para false.
// =====================================================================
const HOLDING_PAGE = true;

// === Páginas pesadas: lazy ===
const AdminLayout = lazy(() => import("@/components/admin/AdminLayout"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminPartners = lazy(() => import("./pages/admin/AdminPartners"));
const AdminLeads = lazy(() => import("./pages/admin/AdminLeads"));
const AdminQuotes = lazy(() => import("./pages/admin/AdminQuotes"));
const AdminQuoteDetail = lazy(() => import("./pages/admin/AdminQuoteDetail"));
const AdminSamples = lazy(() => import("./pages/admin/AdminSamples"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const AdminPedidos = lazy(() => import("./pages/admin/AdminPedidos"));
const AdminSettings = lazy(() => import("./pages/admin/AdminSettings"));
const AdminCredenciamentos = lazy(() => import("./pages/admin/AdminCredenciamentos"));
const AdminCnaeWhitelist = lazy(() => import("./pages/admin/AdminCnaeWhitelist"));

const AccountLayout = lazy(() => import("@/components/account/AccountLayout"));
const AccountIndex = lazy(() => import("./pages/account/AccountIndex"));
const AccountProfile = lazy(() => import("./pages/account/AccountProfile"));
const AccountQuotes = lazy(() => import("./pages/account/AccountQuotes"));
const AccountOrders = lazy(() => import("./pages/account/AccountOrders"));
const AccountSketches = lazy(() => import("./pages/account/AccountSketches"));
const AccountFavorites = lazy(() => import("./pages/account/AccountFavorites"));
const AccountSamples = lazy(() => import("./pages/account/AccountSamples"));
const AccountPreferences = lazy(() => import("./pages/account/AccountPreferences"));

const Linhas = lazy(() => import("./pages/Linhas.tsx"));
const LinhaPage = lazy(() => import("./pages/LinhaPage.tsx"));
const Produtos = lazy(() => import("./pages/Produtos.tsx"));
const Conjuntos = lazy(() => import("./pages/Conjuntos.tsx"));
const ProductPage = lazy(() => import("./pages/ProductPage.tsx"));
const About = lazy(() => import("./pages/About.tsx"));
const Contact = lazy(() => import("./pages/Contact.tsx"));

const GuiaContexto = lazy(() => import("./pages/guia/Contexto.tsx"));
const GuiaComposicoes = lazy(() => import("./pages/guia/Composicoes.tsx"));
const GuiaRefinar = lazy(() => import("./pages/guia/Refinar.tsx"));

const PartnerSignup = lazy(() => import("./pages/PartnerSignup.tsx"));
const ParceirosArquitetos = lazy(() => import("./pages/ParceirosArquitetos.tsx"));
const PartnerLogin = lazy(() => import("./pages/PartnerLogin.tsx"));
const ResetPassword = lazy(() => import("./pages/ResetPassword.tsx"));
const PedirAmostras = lazy(() => import("./pages/PedirAmostras.tsx"));
const AgendarVisita = lazy(() => import("./pages/AgendarVisita.tsx"));
const PorQueWestern = lazy(() => import("./pages/PorQueWestern.tsx"));
const AplicacoesComerciais = lazy(() => import("./pages/AplicacoesComerciais.tsx"));
const FAQ = lazy(() => import("./pages/FAQ.tsx"));
const PoliticaComercial = lazy(() => import("./pages/legal/PoliticaComercial.tsx"));
const PoliticaEntrega = lazy(() => import("./pages/legal/PoliticaEntrega.tsx"));
const TrocasAvarias = lazy(() => import("./pages/legal/TrocasAvarias.tsx"));
const PoliticaPrivacidade = lazy(() => import("./pages/legal/PoliticaPrivacidade.tsx"));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 30,
      refetchOnWindowFocus: false,
    },
  },
});

// Fallback discreto — mantém o ivory para não "piscar branco"
function RouteFallback() {
  return (
    <div className="min-h-[40vh] flex items-center justify-center bg-western-ivory">
      <div className="h-5 w-5 border-2 border-western-gold/30 border-t-western-gold rounded-full animate-spin" />
    </div>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner position="top-right" />
      <BrowserRouter>
        <ScrollToTop />
        <AuthProvider>
          <WishlistProvider>
            <Suspense fallback={<RouteFallback />}>
              <Routes>
                <Route path="/guia-de-composicao" element={<GuiaContexto />} />
                <Route path="/guia-de-composicao/composicoes" element={<GuiaComposicoes />} />
                <Route path="/guia-de-composicao/refinar/:handle" element={<GuiaRefinar />} />
                <Route path="/guia-de-composicao/finalizar" element={<Navigate to="/guia-de-composicao" replace />} />
                <Route element={<SiteLayout />}>
                  <Route path="/" element={<Index />} />
                  <Route path="/linhas" element={<Linhas />} />
                  <Route path="/linhas/:handle" element={<LinhaPage />} />
                  <Route path="/conjuntos" element={<Conjuntos />} />
                  <Route path="/produtos" element={<Produtos />} />
                  <Route path="/produtos/:handle" element={<ProductPage />} />
                  <Route path="/guia-de-compra" element={<Navigate to="/guia-de-composicao" replace />} />
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
                    <Route path="orcamentos" element={<AdminQuotes />} />
                    <Route path="orcamentos/:leadId" element={<AdminQuoteDetail />} />
                    <Route path="amostras" element={<AdminSamples />} />
                    <Route path="usuarios" element={<AdminUsers />} />
                    <Route path="pedidos" element={<AdminPedidos />} />
                    <Route path="credenciamentos" element={<AdminCredenciamentos />} />
                    <Route path="cnae-whitelist" element={<AdminCnaeWhitelist />} />
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
            </Suspense>
          </WishlistProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
