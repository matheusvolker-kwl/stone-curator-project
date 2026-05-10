import { MessageCircle } from "lucide-react";
import { useLocation } from "react-router-dom";

export default function WhatsAppFAB() {
  const { pathname } = useLocation();
  // Esconde o FAB em PDPs — a página tem CTA "Falar com consultor" próprio.
  if (pathname.startsWith("/produtos/") || pathname.startsWith("/produto/")) return null;

  return (
    <a
      href="https://wa.me/5511993403485?text=Ol%C3%A1%2C%20vim%20pelo%20site%20da%20Western%20e%20gostaria%20de%20falar%20com%20um%20consultor."
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar com consultor no WhatsApp"
      className="fixed bottom-5 right-5 md:bottom-7 md:right-7 z-50 group inline-flex items-center gap-3 pl-4 pr-5 py-3 bg-[#25D366] text-white rounded-full shadow-[0_8px_24px_rgba(37,211,102,0.35)] hover:shadow-[0_10px_30px_rgba(37,211,102,0.5)] transition-all hover:-translate-y-0.5"
    >
      <MessageCircle className="h-5 w-5" strokeWidth={2} />
      <span className="hidden sm:inline font-mono text-xs uppercase tracking-[0.18em]">
        Falar com consultor
      </span>
    </a>
  );
}
