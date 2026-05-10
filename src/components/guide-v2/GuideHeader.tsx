import { Link } from "react-router-dom";
import { ArrowLeft, X } from "lucide-react";
import logoWestern from "@/assets/logos/western-verde.png";

interface Props {
  breadcrumb?: { label: string; to: string };
  step?: 1 | 2 | 3;
}

const STEPS = [
  { n: 1, label: "Contexto" },
  { n: 2, label: "Composição" },
  { n: 3, label: "Refinar" },
];

export default function GuideHeader({ breadcrumb, step }: Props) {
  return (
    <header className="border-b border-western-gold/30 bg-western-ivory/95 backdrop-blur-sm sticky top-0 z-30 relative">
      <div className="container-western h-20 flex items-center justify-between gap-4 relative">
        <div className="flex items-center gap-6 min-w-0">
          <Link to="/" className="flex-shrink-0" aria-label="Western Pools">
            <img
              src={logoWestern}
              alt="Western Pools"
              className="h-10 md:h-12 w-auto object-contain"
            />
          </Link>
          <span aria-hidden className="hidden md:block w-px h-9 bg-western-gold/40" />
          <span className="hidden md:inline-block font-display italic text-[20px] text-western-green-deep leading-none truncate">
            Guia de Composição
          </span>
        </div>

        {/* Stepper desktop */}
        {step && (
          <ol className="hidden lg:flex items-center gap-3" aria-label="Etapas do guia">
            {STEPS.map((s, i) => {
              const active = s.n === step;
              const done = s.n < step;
              return (
                <li key={s.n} className="flex items-center gap-3">
                  <span
                    aria-current={active ? "step" : undefined}
                    className={`inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] ${
                      active
                        ? "text-western-green-deep"
                        : done
                        ? "text-western-gold"
                        : "text-western-stone-warm/60"
                    }`}
                  >
                    <span
                      className={`inline-flex items-center justify-center w-5 h-5 border text-[10px] ${
                        active
                          ? "border-western-green-deep bg-western-green-deep text-western-cream"
                          : done
                          ? "border-western-gold bg-western-gold/10 text-western-gold"
                          : "border-western-stone-warm/30 text-western-stone-warm/60"
                      }`}
                    >
                      {s.n}
                    </span>
                    {s.label}
                  </span>
                  {i < STEPS.length - 1 && (
                    <span aria-hidden className="w-6 h-px bg-western-stone-warm/25" />
                  )}
                </li>
              );
            })}
          </ol>
        )}

        <div className="flex items-center gap-6 ml-auto">
          {breadcrumb && (
            <Link
              to={breadcrumb.to}
              className="hidden md:inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] text-western-stone-warm hover:text-western-green-deep transition-colors"
            >
              <ArrowLeft className="h-3 w-3" /> {breadcrumb.label}
            </Link>
          )}
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-western-stone-warm hover:text-western-green-deep transition-colors"
          >
            Sair do guia <X className="h-3 w-3" />
          </Link>
        </div>
      </div>

      {/* Stepper mobile + breadcrumb */}
      {(step || breadcrumb) && (
        <div className="lg:hidden container-western pb-3 flex items-center justify-between gap-3 relative">
          {breadcrumb ? (
            <Link
              to={breadcrumb.to}
              className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] text-western-stone-warm"
            >
              <ArrowLeft className="h-3 w-3" /> {breadcrumb.label}
            </Link>
          ) : <span />}
          {step && (
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-western-stone-warm">
              Etapa {step}/3 · {STEPS[step - 1].label}
            </span>
          )}
        </div>
      )}
    </header>
  );
}
