import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { ArrowRight } from "lucide-react";

const SUGESTOES = [
  { to: "/linhas", label: "Catálogo de linhas" },
  { to: "/conjuntos", label: "Conjuntos prontos" },
  { to: "/guia-de-composicao", label: "Guia de composição" },
  { to: "/contato", label: "Falar com a Western" },
];

export default function NotFound() {
  const location = useLocation();
  useEffect(() => {
    console.error("404:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="surface-ivory">
      <div className="container-western py-24 md:py-32 max-w-2xl">
        <p className="text-eyebrow mb-5 text-western-gold">404</p>
        <div className="w-12 h-px bg-western-gold mb-8" />
        <h1 className="font-display text-4xl md:text-5xl text-western-green-deep leading-[1.05] mb-6">
          Esta página não existe — ou foi movida.
        </h1>
        <p className="text-western-stone-warm text-lg leading-relaxed mb-10">
          O caminho{" "}
          <code className="font-mono text-sm bg-western-stone-warm/10 px-1.5 py-0.5">
            {location.pathname}
          </code>{" "}
          não foi encontrado. Talvez você esteja procurando por:
        </p>

        <ul className="border-y border-western-stone-warm/15 mb-10">
          {SUGESTOES.map((s) => (
            <li key={s.to} className="border-b border-western-stone-warm/10 last:border-b-0">
              <Link
                to={s.to}
                className="flex items-center justify-between py-4 text-western-green-deep hover:text-western-gold transition-colors group"
              >
                <span className="font-display text-xl">{s.label}</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </li>
          ))}
        </ul>

        <Link
          to="/"
          className="inline-flex items-center px-8 py-4 bg-western-green-deep text-western-cream hover:bg-western-green-deep/90 transition-colors font-mono text-xs uppercase tracking-[0.25em]"
        >
          Voltar ao início
        </Link>
      </div>
    </div>
  );
}
