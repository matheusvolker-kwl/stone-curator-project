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

/**
 * Cabeçalho do wizard.
 *
 * ALTURA FIXA de 80px (h-20) em TODOS os breakpoints — não-negociável:
 * `ContextoChips` gruda em `top-20` (80px). Enquanto o mobile tinha uma
 * segunda linha (stepper + breadcrumb), o header media ~110px, cobria a barra
 * de contexto (z-30 sobre z-20) e engolia o input de metragem / a 1ª peça.
 * Tudo cabe numa linha só; a seta de "voltar" vira botão-ícone no mobile
 * (setas e X são os únicos ícones que o DS permite sem rótulo).
 */
export default function GuideHeader({ breadcrumb, step }: Props) {
  const pct = step ? (step / STEPS.length) * 100 : 0;

  return (
    <header className="sticky top-0 z-30 h-20 bg-western-ivory/95 backdrop-blur-sm border-b border-western-border-soft">
      <div className="container-western h-20 flex items-center gap-3 md:gap-6">
        {/* Voltar — ícone puro no mobile, rótulo a partir de md */}
        {breadcrumb && (
          <Link
            to={breadcrumb.to}
            aria-label={breadcrumb.label}
            className="md:hidden tap-target -ml-3 inline-flex items-center justify-center rounded-[10px] text-western-green-deep hover:bg-western-paper transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
        )}

        <Link to="/" className="flex-shrink-0" aria-label="Western">
          <img src={logoWestern} alt="Western" className="h-8 md:h-9 w-auto object-contain" />
        </Link>

        <span aria-hidden className="hidden md:block w-px h-8 bg-western-border-strong" />
        <span className="hidden md:inline lg:hidden font-sans text-[17px] font-semibold text-western-green-deep truncate">
          Monte seu projeto
        </span>

        {/* Stepper completo — desktop */}
        {step && (
          <ol className="hidden lg:flex items-center gap-3 mx-auto" aria-label="Etapas do guia">
            {STEPS.map((s, i) => {
              const active = s.n === step;
              const done = s.n < step;
              return (
                <li key={s.n} className="flex items-center gap-3">
                  <span
                    aria-current={active ? "step" : undefined}
                    className={`inline-flex items-center gap-2 font-sans text-[14px] font-semibold tracking-[0.06em] ${
                      active
                        ? "text-western-green-deep"
                        : done
                          ? "text-western-bronze"
                          : "text-western-stone-warm"
                    }`}
                  >
                    <span
                      className={`inline-flex items-center justify-center w-7 h-7 rounded-full border text-[14px] tabular-nums ${
                        active
                          ? "border-western-cta bg-western-cta text-western-cream"
                          : done
                            ? "border-western-bronze bg-western-gold/15 text-western-bronze"
                            : "border-western-border-strong text-western-stone-warm"
                      }`}
                    >
                      {s.n}
                    </span>
                    {s.label}
                  </span>
                  {i < STEPS.length - 1 && (
                    <span aria-hidden className="w-6 h-px bg-western-border-strong" />
                  )}
                </li>
              );
            })}
          </ol>
        )}

        <div className="flex items-center gap-2 md:gap-5 ml-auto">
          {breadcrumb && (
            <Link
              to={breadcrumb.to}
              className="hidden md:inline-flex tap-target items-center gap-2 px-2 font-sans text-[14px] font-semibold tracking-[0.06em] text-western-stone-warm hover:text-western-green-deep transition-colors"
            >
              <ArrowLeft className="h-4 w-4" /> {breadcrumb.label}
            </Link>
          )}

          {/* Passo compacto — mobile/tablet, substitui a 2ª linha que quebrava o sticky */}
          {step && (
            <span className="lg:hidden font-sans text-[14px] font-semibold tracking-[0.06em] text-western-bronze whitespace-nowrap">
              Etapa {step} de {STEPS.length}
            </span>
          )}

          <Link
            to="/"
            aria-label="Sair do guia"
            className="tap-target -mr-3 md:mr-0 inline-flex items-center justify-center gap-2 rounded-[10px] px-2 font-sans text-[14px] font-semibold tracking-[0.06em] text-western-stone-warm hover:text-western-green-deep hover:bg-western-paper transition-colors"
          >
            <span className="hidden md:inline">Sair do guia</span>
            <X className="h-5 w-5 md:h-4 md:w-4" />
          </Link>
        </div>
      </div>

      {/* Progresso do wizard — filete no rodapé do header */}
      {step && (
        <div aria-hidden className="absolute bottom-0 left-0 right-0 h-[3px] bg-western-border-soft">
          <div
            className="h-full bg-western-gold transition-[width] duration-500 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
    </header>
  );
}
