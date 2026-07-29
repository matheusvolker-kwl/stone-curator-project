import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { ArrowRight } from "lucide-react";
import Seo from "@/components/seo/Seo";

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
      <Seo
        title="Página não encontrada · Western"
        description="Este endereço não existe ou foi movido. Veja o catálogo, os conjuntos prontos, o guia de composição ou fale com a Western."
        path={location.pathname}
        noindex
      />
      <div className="container-western max-w-2xl py-16 md:py-24">
        {/* Hierarquia V3: eyebrow bronze → display → apoio → saídas → CTA verde.
            Sem filete dourado decorativo e sem caixa-alta mono. */}
        <p className="text-eyebrow mb-4">404</p>
        <h1 className="display-lg text-western-green-deep">
          Esta página não existe — ou foi movida.
        </h1>
        <p className="text-body mt-5">
          O caminho{" "}
          <code className="break-all rounded-sm border border-western-border-soft bg-western-paper px-1.5 py-0.5 font-sans text-[15px] text-western-green-deep">
            {location.pathname}
          </code>{" "}
          não foi encontrado. Talvez você esteja procurando por:
        </p>

        {/* Saídas úteis — linhas de 48px+, texto 20px sans (nunca beco sem saída) */}
        <ul className="mt-8 overflow-hidden rounded-lg border border-western-border-soft bg-white">
          {SUGESTOES.map((s) => (
            <li key={s.to} className="border-b border-western-border-soft last:border-b-0">
              <Link
                to={s.to}
                className="tap-target group flex items-center justify-between gap-4 px-5 py-4 font-sans text-[18px] font-semibold text-western-green-deep transition-colors hover:bg-western-paper hover:text-western-bronze"
              >
                <span>{s.label}</span>
                <ArrowRight
                  className="h-5 w-5 shrink-0 transition-transform group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </Link>
            </li>
          ))}
        </ul>

        {/* CTA primário verde, full-width no mobile */}
        <Link to="/" className="btn-primary mt-8 w-full sm:w-auto">
          Voltar ao início
        </Link>
      </div>
    </div>
  );
}
