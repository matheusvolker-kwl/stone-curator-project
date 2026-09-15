import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
// Na carga, antes do 1º render: o link de redefinição de senha chega à página
// certa mesmo quando o Supabase devolve para a home (ver o módulo).
import "./lib/auth/recuperacao";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <App />
  </HelmetProvider>
);
