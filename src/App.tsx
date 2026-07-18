import { lazy, Suspense, useEffect, useState } from "react";
import RouteTransition from "@/components/RouteTransition";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes, useLocation, useParams } from "react-router-dom";

function LabProductRedirect() {
  const { handle = "" } = useParams();
  return <Navigate to={`/produtos/${handle}`} replace />;
}

// /inspiracoes(?tipo=lagos) → /obras(?tipo=lagos). Carrega a query string: um
// <Navigate to="/obras"> com string a descartaria, e o `?tipo=` de UsageScenes
// é o que seleciona o segmento na lista.
function RedirectObras() {
  const { search } = useLocation();
  return <Navigate to={{ pathname: "/obras", search }} replace />;
}
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
const HOLDING_PAGE = false;

// === Páginas pesadas: lazy ===
const AdminLayout = lazy(() => import("@/components/admin/AdminLayout"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminPartners = lazy(() => import("./pages/admin/AdminPartners"));
const AdminLeads = lazy(() => import("./pages/admin/AdminLeads"));
const AdminQuotes = lazy(() => import("./pages/admin/AdminQuotes"));
const AdminQuoteDetail = lazy(() => import("./pages/admin/AdminQuoteDetail"));
const AdminPedidos = lazy(() => import("./pages/admin/AdminPedidos"));
const AdminSettings = lazy(() => import("./pages/admin/AdminSettings"));

const AccountLayout = lazy(() => import("@/components/account/AccountLayout"));
const AccountIndex = lazy(() => import("./pages/account/AccountIndex"));
const AccountProfile = lazy(() => import("./pages/account/AccountProfile"));

const AccountOrders = lazy(() => import("./pages/account/AccountOrders"));
const AccountSketches = lazy(() => import("./pages/account/AccountSketches"));
const AccountFavorites = lazy(() => import("./pages/account/AccountFavorites"));
const AccountSamples = lazy(() => import("./pages/account/AccountSamples"));
const AccountPreferences = lazy(() => import("./pages/account/AccountPreferences"));
const AccountTracking = lazy(() => import("./pages/account/AccountTracking"));
const AccountOrcamentos = lazy(() => import("./pages/account/AccountOrcamentos"));

const Inspiracoes = lazy(() => import("./pages/Inspiracoes.tsx"));
const ObraPage = lazy(() => import("./pages/ObraPage.tsx"));
const ComoComprar = lazy(() => import("./pages/ComoComprar.tsx"));
const ParaSuaCasa = lazy(() => import("./pages/ParaSuaCasa.tsx"));
const Carrinho = lazy(() => import("./pages/Carrinho.tsx"));
const Linhas = lazy(() => import("./pages/Linhas.tsx"));
const LinhaPage = lazy(() => import("./pages/LinhaPage.tsx"));
const Produtos = lazy(() => import("./pages/Produtos.tsx"));
const Conjuntos = lazy(() => import("./pages/Conjuntos.tsx"));
const ConjuntoPage = lazy(() => import("./pages/ConjuntoPage.tsx"));
const ProductPage = lazy(() => import("./pages/ProductPage.tsx"));

const About = lazy(() => import("./pages/About.tsx"));
const APedra = lazy(() => import("./pages/APedra.tsx"));
const Contact = lazy(() => import("./pages/Contact.tsx"));
const WesternBoxPage = lazy(() => import("./pages/WesternBox.tsx"));

const GuiaContexto = lazy(() => import("./pages/guia/Contexto.tsx"));
const GuiaComposicoes = lazy(() => import("./pages/guia/Composicoes.tsx"));
const GuiaRefinar = lazy(() => import("./pages/guia/Refinar.tsx"));

const PartnerSignup = lazy(() => import("./pages/PartnerSignup.tsx"));
const PartnerLogin = lazy(() => import("./pages/PartnerLogin.tsx"));
const ResetPassword = lazy(() => import("./pages/ResetPassword.tsx"));

const AgendarVisita = lazy(() => import("./pages/AgendarVisita.tsx"));
const ContrateAWestern = lazy(() => import("./pages/ContrateAWestern.tsx"));
const FAQ = lazy(() => import("./pages/FAQ.tsx"));
const PoliticaComercial = lazy(() => import("./pages/legal/PoliticaComercial.tsx"));
const TrocasAvarias = lazy(() => import("./pages/legal/TrocasAvarias.tsx"));
const PoliticaPrivacidade = lazy(() => import("./pages/legal/PoliticaPrivacidade.tsx"));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));
/* Entrada/Parceria/ParceriaDireto aposentadas em 2026-07-17 — viraram
   redirects (ver as rotas). A home já segmenta B2B×B2C e /contrate-a-western
   é a página de serviços que a /parceria prometia. */
const FavoritosCompartilhados = lazy(() => import("./pages/FavoritosCompartilhados.tsx"));

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
  const [show, setShow] = useState(false);
  useEffect(() => { const t = window.setTimeout(() => setShow(true), 180); return () => window.clearTimeout(t); }, []);
  if (!show) return <div className="min-h-[40vh] bg-western-ivory" />;
  return (
    <div className="min-h-[40vh] bg-western-ivory motion-safe:animate-fade-in">
      <div className="container-western py-16 space-y-6" aria-hidden="true">
        <div className="h-8 w-1/3 bg-western-stone-warm/10 animate-pulse" />
        <div className="h-4 w-1/2 bg-western-stone-warm/10 animate-pulse" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="aspect-square bg-western-stone-warm/10 animate-pulse" />
          <div className="aspect-square bg-western-stone-warm/10 animate-pulse" />
          <div className="aspect-square bg-western-stone-warm/10 animate-pulse" />
        </div>
      </div>
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
              <RouteTransition>
                <Routes>
                  {HOLDING_PAGE && <Route path="/" element={<ComingSoon />} />}
                  <Route path="/guia-de-composicao" element={<GuiaContexto />} />
                  <Route path="/guia-de-composicao/composicoes" element={<GuiaComposicoes />} />
                  <Route path="/guia-de-composicao/refinar/:handle" element={<GuiaRefinar />} />
                  <Route path="/guia-de-composicao/finalizar" element={<Navigate to="/guia-de-composicao" replace />} />
                  {/* Admin fora do SiteLayout — sem header/footer/FAB/carrinho da loja */}
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
                    <Route path="pedidos" element={<AdminPedidos />} />
                    <Route path="configuracoes" element={<AdminSettings />} />
                    <Route path="amostras" element={<Navigate to="/admin/leads" replace />} />
                    <Route path="usuarios" element={<Navigate to="/admin/parceiros?tab=ativos" replace />} />
                    <Route path="credenciamentos" element={<Navigate to="/admin/parceiros?tab=credenciamento" replace />} />
                    <Route path="cnae-whitelist" element={<Navigate to="/admin/configuracoes?tab=cnae" replace />} />
                  </Route>
                  <Route element={<SiteLayout />}>
                    {HOLDING_PAGE
                      ? <Route path="/inicio" element={<Index />} />
                      : <Route path="/" element={<Index />} />}
                    <Route path="/linhas" element={<Linhas />} />
                    {/* Aposentadas (2026-07-17, decisão do dono): 873 linhas
                        órfãs de nav vendendo a versão velha do site. Redirect
                        preserva qualquer link antigo. */}
                    <Route path="/entrada" element={<Navigate to="/" replace />} />
                    <Route path="/parceria" element={<Navigate to="/contrate-a-western" replace />} />
                    <Route path="/parceria-direto" element={<Navigate to="/contrate-a-western" replace />} />
                    {/* Orçamento (página pública) removido por decisão do dono — B2C vai pro atendimento */}
                    <Route path="/orcamento" element={<Navigate to="/contato" replace />} />
                    {/* v1 usava /linhas/pisantes — preservar SEO/links externos no cutover */}
                    <Route path="/linhas/pisantes" element={<Navigate to="/linhas/pisadas" replace />} />
                    <Route path="/linhas/:handle" element={<LinhaPage />} />
                    {/* A lista é /obras (é o que ela é: obra entregue). Os nomes
                        antigos seguem vivos como redirect — nenhum link morre. */}
                    <Route path="/obras" element={<Inspiracoes />} />
                    <Route path="/obras/:slug" element={<ObraPage />} />
                    <Route path="/inspiracoes" element={<RedirectObras />} />
                    <Route path="/inspiracao" element={<RedirectObras />} />
                    {/* Telas do V3 que faltavam no app */}
                    <Route path="/como-comprar" element={<ComoComprar />} />
                    <Route path="/para-sua-casa" element={<ParaSuaCasa />} />
                    <Route path="/carrinho" element={<Carrinho />} />
                    <Route path="/conjuntos" element={<Conjuntos />} />
                    <Route path="/conjuntos/:handle" element={<ConjuntoPage />} />
                    <Route path="/produtos" element={<Produtos />} />
                    <Route path="/produtos/:handle" element={<ProductPage />} />
                    <Route path="/lab/produtos/:handle" element={<LabProductRedirect />} />
                    <Route path="/guia-de-compra" element={<Navigate to="/guia-de-composicao" replace />} />
                    <Route path="/sobre" element={<About />} />
                    <Route path="/a-pedra" element={<APedra />} />
                    <Route path="/contato" element={<Contact />} />
                    <Route path="/western-box" element={<WesternBoxPage />} />
                    <Route path="/contrate-a-western" element={<ContrateAWestern />} />
                    <Route path="/favoritos-compartilhados" element={<FavoritosCompartilhados />} />
                    {/* Rotas antigas removidas — redirecionamentos */}
                    <Route path="/parceiros-arquitetos" element={<Navigate to="/sobre" replace />} />
                    <Route path="/aplicacoes-comerciais" element={<Navigate to="/sobre" replace />} />
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
                      <Route path="orcamentos" element={<AccountOrcamentos />} />
                      <Route path="pedidos" element={<AccountOrders />} />
                      <Route path="rastreio" element={<AccountTracking />} />
                      {/* Fundida em /minha-conta/orcamentos (2026-07-18): eram duas telas para o mesmo evento */}
                      <Route path="composicoes" element={<Navigate to="/minha-conta/orcamentos" replace />} />
                      <Route path="sketches" element={<AccountSketches />} />
                      <Route path="favoritos" element={<AccountFavorites />} />
                      <Route path="amostras" element={<AccountSamples />} />
                      <Route path="preferencias" element={<AccountPreferences />} />
                    </Route>
                    <Route
                      path="/admin-legacy-inside-store-do-not-use"
                      element={<Navigate to="/admin" replace />}
                    />
                    {/* Rota antiga de amostras: substituída pela Western Box (página paga). */}
                    <Route path="/pedir-amostras" element={<Navigate to="/western-box" replace />} />
                    <Route path="/visitar" element={<AgendarVisita />} />
                    {/* "Por que Western" foi para /a-pedra (2026-07): é lá que o
                        argumento mora agora — o FAQ ficou com a logística.
                        O redirect traz o histórico de SEO junto. */}
                    <Route path="/por-que-western" element={<Navigate to="/a-pedra" replace />} />
                    <Route path="/faq" element={<FAQ />} />
                    <Route path="/politica-comercial" element={<PoliticaComercial />} />
                    {/* Política de entrega foi fundida na comercial (2026-07). */}
                    <Route path="/politica-de-entrega" element={<Navigate to="/politica-comercial" replace />} />
                    <Route path="/trocas-e-avarias" element={<TrocasAvarias />} />
                    <Route path="/privacidade" element={<PoliticaPrivacidade />} />
                    <Route path="/parceiro/favoritos" element={<Navigate to="/minha-conta/favoritos" replace />} />
                    <Route path="*" element={<NotFound />} />
                  </Route>
                </Routes>
              </RouteTransition>
            </Suspense>
          </WishlistProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
