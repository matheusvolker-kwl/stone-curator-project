import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";

export default function NotFound() {
  const location = useLocation();
  useEffect(() => {
    console.error("404:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="container-western py-32 text-center">
      <p className="text-eyebrow mb-6">404</p>
      <h1 className="font-display text-5xl md:text-6xl text-western-cream leading-tight mb-6">
        Página não encontrada.
      </h1>
      <p className="text-western-cream-muted mb-10">
        O caminho que você procura não existe — ou foi movido.
      </p>
      <Link
        to="/"
        className="inline-flex items-center px-8 py-4 bg-western-gold text-western-green-deep hover:bg-western-gold-soft transition-colors font-mono text-xs uppercase tracking-[0.25em]"
      >
        Voltar ao início
      </Link>
    </div>
  );
}
